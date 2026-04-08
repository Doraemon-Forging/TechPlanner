/**
 * TECH-PLANNER.JS
 * Core Logic: State Management, Calculations, Tree Rendering, and Log Operations.
 */

// --- GLOBAL STATE ---
let activeTreeKey = 'forge';
let currentMode = 'setup'; 
let setupLevels = {};
let planQueue = [];
let expandedLogIndex = -1;
let insertModeIndex = -1;
let historyStack = [];
let redoStack = [];
let lineUpdateRequested = false;
let scrollPositions = { forge: 0, spt: 0, power: 0, stats: 0 };
let warConfig = { day: 2, hour: 12, min: 0, ampm: 'AM' }; // Default: Tuesday 12:00 AM
let movingStepIndex = -1;
let validDropTargets = [];
let justMovedIndex = -1;

// --- HELPERS (Logic) ---
function getMeta(id) { const p = id.split('_'); return TREES[p[0]].meta[p.slice(2).join('_')]; }
function getTier(id) { return parseInt(id.split('_T')[1]); }
function getParents(id) {
    const p = id.split('_'), tree = p[0], tier = parseInt(p[1].substring(1)), local = p.slice(2).join('_'), meta = TREES[tree].meta[local], res = [];
    meta.p.forEach(par => res.push(`${tree}_T${tier}_${par}`));
    if (tier > 1) {
        if (tree === 'forge' && local === 'timer') res.push(`forge_T${tier - 1}_off_c`);
        if (tree === 'forge' && local === 'disc') res.push(`forge_T${tier - 1}_off_h`);
        if (tree === 'spt' && local === 'timer') res.push(`spt_T${tier - 1}_key_g`, `spt_T${tier - 1}_key_r`);
        if (tree === 'power' && (local === 'weapon_1' || local === 'helmet_1')) res.push(`power_T${tier - 1}_mount_chance`);
    }
    return res;
}
function isUnlocked(id, lvls) { const p = getParents(id); return p.length === 0 || p.every(pr => (lvls[pr] || 0) > 0); }

// --- TREE NAVIGATION & RENDERING ---
function switchTree(key) {
    if (key === 'stats') return; 
    activeTreeKey = key;
    
    // Update Tabs
    const update = (id, check) => { const b = document.getElementById(id); if(b) check ? b.classList.add('active') : b.classList.remove('active'); };
    update('tab-forge', key === 'forge'); update('tab-spt', key === 'spt'); update('tab-power', key === 'power');
    update('mtab-forge', key === 'forge'); update('mtab-spt', key === 'spt'); update('mtab-power', key === 'power');

    // Dynamic Theme
    const leftPane = document.querySelector('.pane.left-pane');
    if (leftPane) {
        leftPane.classList.remove('theme-forge', 'theme-spt', 'theme-power');
        leftPane.classList.add(`theme-${key}`);
    }

    // Display
    const treeCont = document.getElementById('tree-container');
    if (treeCont) scrollPositions[key] = treeCont.scrollTop;
    treeCont.style.display = 'flex';
    
    treeCont.scrollTop = scrollPositions[key] || 0;
    document.getElementById('canvas').className = `tree-canvas tree-${key}`;
    
    renderTree(key);
    setTimeout(drawLines, 0);
}

function renderTree(key) {
    const canvas = document.getElementById('canvas');
    Array.from(canvas.children).forEach(c => { if (!c.classList.contains('connections-layer') && !c.classList.contains('tree-reset-btn')) c.remove(); });
    const data = TREES[key];
    for (let t = 1; t <= 5; t++) {
        const block = document.createElement('div'); block.className = 'tier-block';
        
        // Tier Header
        const header = document.createElement('div'); header.className = 'tier-header';
        header.innerHTML = `<div class="tier-title">TIER ${toRoman(t)}</div><button class="tier-max-btn" onclick="event.stopPropagation(); maxTier('${key}', ${t})">MAX</button>`;
        block.appendChild(header);

        const rows = {};
        data.structure.forEach(nDef => {
            const fullId = `${key}_T${t}_${nDef.id}`;
            const meta = data.meta[nDef.id];
            if (!meta) return;
            if (!rows[nDef.r]) {
                const rDiv = document.createElement('div'); rDiv.style = "display:flex;justify-content:center;margin-bottom:60px;width:100%";
                block.appendChild(rDiv); rows[nDef.r] = rDiv;
            }
const node = document.createElement('div'); node.className = 'node'; node.id = fullId; node.setAttribute('data-name', meta.n);
            if (nDef.c === 1) node.style.marginLeft = "120px"; 
            node.innerHTML = `<div class="node-tier-badge">${toRoman(t)}</div><img src="icons/${key}_${nDef.id}.png" class="node-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="node-fallback" style="display:none">${key==='forge'?'🔨':(key==='spt'?'🐾':'⚔️')}</div><div class="node-level">0/${meta.m}</div>`;
            node.onclick = (e) => (e.shiftKey && currentMode === 'setup') ? handleShiftClick(fullId) : handleClick(fullId, false);
            node.oncontextmenu = (e) => { e.preventDefault(); handleClick(fullId, true); };
            rows[nDef.r].appendChild(node);
        });
        canvas.appendChild(block);
    }
    updateCalculations();
}

function maxTier(tree, tier) {
    openConfirmModal(`Max all nodes in ${tree.toUpperCase()} tier ${toRoman(tier)} ?`, () => {
        pushHistory();
        TREES[tree].structure.forEach(nDef => {
            const fullId = `${tree}_T${tier}_${nDef.id}`;
            const meta = getMeta(fullId);
            if (meta) {
                setupLevels[fullId] = meta.m;
                const ensure = (cid) => getParents(cid).forEach(pid => { if ((setupLevels[pid] || 0) === 0) { setupLevels[pid] = 1; ensure(pid); } });
                ensure(fullId);
            }
        });
        updateCalculations();
    });
}

// --- CALCULATION ENGINE ---
function calcState(customQueue) {
    const levels = { ...setupLevels };
    let totalMin = 0, history = [], speed = 0, totalPotions = 0, totalSellBonusCur = 0, currentDiscount = 0;
    
    // Dynamic Multipliers: Now reads from DATA.JS!
    Object.keys(setupLevels).forEach(id => { const m = getMeta(id); if (m && m.n === "Eq. Sell Price") totalSellBonusCur += (setupLevels[id] * (m.val !== undefined ? m.val : 1)); });
    Object.keys(levels).forEach(id => { const m = getMeta(id); if (m && m.speed) speed += m.speed * levels[id]; if (m && m.isDiscount) currentDiscount += levels[id] * (m.val !== undefined ? m.val : 2); });
    if (speed > 1) speed = 1; 

    const q = customQueue || planQueue;
    const brokenSteps = [];
    q.forEach((item, i) => {
        if (item.type === 'delay') {
            totalMin += item.mins; history.push({ type: 'delay', mins: item.mins, idx: i });
        } else {
            if (!isUnlocked(item.id, levels)) { brokenSteps.push(i); return; }
            const cur = levels[item.id] || 0; const m = getMeta(item.id);
            if (cur >= m.m) return;
            const tier = getTier(item.id);
            const timeBase = tierTimes[tier][cur]; const finalTime = timeBase / (1 + speed);
            const potionBase = potionCosts[tier][cur]; const finalPotion = Math.round(potionBase * (1 - (currentDiscount / 100)));
            totalMin += finalTime; totalPotions += finalPotion; levels[item.id] = cur + 1;
            const spStr = Math.round(speed * 100);
            if (m.speed) { speed += m.speed; if (speed > 1) speed = 1; }
            if (m.isDiscount) currentDiscount += (m.val !== undefined ? m.val : 2);
            history.push({ type: 'node', id: item.id, name: m.n, lvl: levels[item.id], added: finalTime, cost: finalPotion, speedStr: `+${spStr}% Speed`, idx: i, tree: item.id.split('_')[0] });
        }
    });
    
    let totalSellBonusProj = 0;
    Object.keys(levels).forEach(id => { const m = getMeta(id); if (m && m.n === "Eq. Sell Price") totalSellBonusProj += (levels[id] * (m.val !== undefined ? m.val : 1)); });
    
    return { levels, totalMin, history, finalSpeed: speed, brokenSteps, totalPotions, totalSellBonusCur, totalSellBonusProj };
}

// --- CLAN WAR & RENDER LOOP ---
function updateWarConfig() {
    const d = document.getElementById('war-day'); 
    const h = document.getElementById('war-hour'); 
    const m = document.getElementById('war-min'); 
    const ap = document.getElementById('war-ampm');
    
    if(d && h && m && ap) { 
        warConfig.day = parseInt(d.value); 
        warConfig.hour = parseInt(h.value); 
        warConfig.min = parseInt(m.value);
        warConfig.ampm = ap.value; 
        
        if(typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
        updateCalculations(); 
    }
}

function isWarTime(date) {
    const d = date.getDay(); const h = date.getHours(); const m = date.getMinutes();
    
    let startH = warConfig.hour; 
    if (startH === 12) startH = (warConfig.ampm === 'PM') ? 12 : 0; 
    else if (warConfig.ampm === 'PM') startH += 12;
    
    const startM = warConfig.min || 0;
    const curH = (d * 24) + h + (m / 60); 
    const warH = (warConfig.day * 24) + startH + (startM / 60); 
    
    const check = (off) => { 
        const s = off % 168; 
        const e = (off + 24) % 168; 
        return (e > s) ? (curH >= s && curH < e) : (curH >= s || curH < e); 
    };
    return check(warH) || check(warH + 72);
}

function updateCalculations() {
    const state = calcState();
    const sVal = document.getElementById('start-date').value;
    const start = sVal ? new Date(sVal) : new Date();
    const startTime = start.getTime();

    const potStr = state.totalPotions.toLocaleString('en-US');
    const timeStr = formatSmartTime(state.totalMin);
    const updateVal = (id, txt) => { const el = document.getElementById(id); if(el) el.innerText = txt; };
    updateVal('res-val', potStr); updateVal('time-val', timeStr); updateVal('res-val-desktop', potStr); updateVal('time-val-desktop', timeStr);

    let vLvls;
    if (currentMode === 'setup') {
        vLvls = setupLevels;
    } else if (insertModeIndex > -1) {
        vLvls = calcState(planQueue.slice(0, insertModeIndex)).levels;
    } else {
        vLvls = state.levels;
    }
    document.querySelectorAll('.node').forEach(el => {
        const lvl = vLvls[el.id] || 0; const m = getMeta(el.id); if (!m) return;
        const lvlLabel = el.querySelector('.node-level'); if (lvlLabel) lvlLabel.innerText = `${lvl}/${m.m}`;
        el.className = 'node';
        if (isUnlocked(el.id, vLvls)) el.classList.add('unlocked');
        if (setupLevels[el.id]) el.classList.add('active-setup');
        if (lvl > (setupLevels[el.id] || 0)) el.classList.add('active-plan');
        if (lvl >= m.m) el.classList.add('maxed');
    });

    const list = document.getElementById('log-list');
    if (list) {
        list.innerHTML = '';
        let curTime = startTime;
        state.history.forEach(h => {
            const row = document.createElement('div');
            let durMs = (h.type === 'delay' ? h.mins : h.added) * 60000;
            curTime += durMs;
            const finishDate = new Date(curTime); const finishTs = finishDate.getTime();
            const durStr = formatSmartTime(h.type === 'delay' ? h.mins : h.added);
            
            const dayStr = finishDate.toLocaleDateString([], { weekday: 'short' });
            const dateStr = finishDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
            const timeOnlyStr = finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
            const finishDateStr = finishDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

            let isMovingThis = (movingStepIndex === h.idx);
            let isValidDrop = (movingStepIndex > -1 && !isMovingThis && validDropTargets[h.idx]);
            
            let classNames = ['log-row'];
            if (expandedLogIndex === h.idx) classNames.push('expanded'); 
            if (isWarTime(finishDate)) classNames.push('war-active');
            
            if (isMovingThis) {
                classNames.push('moving-active');
            } else if (isValidDrop) {
                classNames.push('drop-valid');
            } else if (movingStepIndex > -1) {
                classNames.push('drop-invalid');
            }

            if (justMovedIndex === h.idx) classNames.push('flash-success');
            if (h.idx === 0 && validDropTargets['top']) classNames.push('has-top-btn');

            row.className = classNames.join(' ');

            if (!isMovingThis && movingStepIndex === -1) {
                row.onclick = () => toggleExp(h.idx);
            }

            let iconHtml, nameHtml, rightGroupHtml;
            let compactTimeHtml;
            
            if (movingStepIndex === h.idx) {
                compactTimeHtml = `
                    <div class="move-time-group" style="flex-direction: row; gap: 5px;">
                        <img src="icons/icon_time.png" style="width: 20px; height: 20px;">
                        <div class="duration-style">${durStr}</div>
                    </div>
                `;
            } else {
                compactTimeHtml = `
                    <div class="move-time-group">
                        <div class="mt-row log-time-style">${dayStr}</div>
                        <div class="mt-row log-time-style">${dateStr}</div>
                        <div class="mt-row log-time-style">${timeOnlyStr}</div>
                    </div>
                `;
            }

            if (h.type === 'delay') {
                iconHtml = `<div class="log-node-preview" style="background-color: #bdc3c7;"><span style="font-size:1.4em; line-height:1; margin-top:2px;">💤</span></div>`;
                nameHtml = `<div class="log-name">Delay (+${h.mins}m)</div>`;
                rightGroupHtml = `<div class="log-right-group"><div class="log-time">${finishDateStr}</div></div>`;
            } else {
                const tierNum = getTier(h.id);
                const parts = h.id.split('_');
                const iconPath = `icons/${parts[0]}_${parts.slice(2).join('_')}.png`;
                iconHtml = `<div class="log-node-preview"><img src="${iconPath}" class="lnp-img" onerror="this.style.display='none'"></div><div class="log-tier-text">${toRoman(tierNum)}-${h.lvl}</div>`;
                nameHtml = `<div class="log-name">${h.name} ${toRoman(tierNum)}-${h.lvl}</div>`;
                
                rightGroupHtml = `
                    <div class="log-right-group">
                        <div class="log-time">${finishDateStr}</div>
                        <div class="log-details">
                            <div class="ld-part pot"><img src="icons/red_potion.png" class="ld-icon"><span>${h.cost.toLocaleString('en-US')}</span></div>
                            <div class="ld-part time"><img src="icons/icon_time.png" class="ld-icon"><span>${durStr}</span></div>
                        </div>
                    </div>
                `;
            }

            let actionButtons = '';
            if (isMovingThis) {
                actionButtons = `
                    <button class="btn-move-action btn-move-cancel" onclick="event.stopPropagation(); cancelMove()">
                        <img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL
                    </button>
                `;
            } else if (isValidDrop) {
                if (h.idx === 0 && validDropTargets['top']) {
                    actionButtons += `
                        <button class="btn-move-action btn-move-top" onclick="event.stopPropagation(); executeMove('top')">
                            <img src="icons/icon_above.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> ABOVE
                        </button>
                    `;
                }
                actionButtons += `
                    <button class="btn-move-action btn-move-below" onclick="event.stopPropagation(); executeMove(${h.idx})">
                        <img src="icons/icon_below.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> BELOW
                    </button>
                `;
            }

            row.innerHTML = `
                <div class="log-entry ${h.tree || ''}">
                    <div class="log-left-group">
                        <div class="log-icon-wrapper">${iconHtml}</div>
                        ${nameHtml}
                    </div>
                    ${rightGroupHtml} 
                    ${compactTimeHtml}
                    <div class="move-actions-container">
                        ${actionButtons}
                    </div>
                </div>
            `;

           if (movingStepIndex === -1) {
                const controlsHTML = `
                    <button class="btn-game-ctrl btn-move" onclick="event.stopPropagation(); startMove(${h.idx})">MOVE</button>
                    <button class="btn-game-ctrl btn-insert" onclick="event.stopPropagation(); activateInsert(${h.idx})">INSERT</button>                     
                    <button class="btn-game-ctrl btn-done" onclick="event.stopPropagation(); markDone(${h.idx}, ${finishTs})">DONE</button>
                    <button class="btn-game-ctrl btn-delay" onclick="event.stopPropagation(); addDelay(${h.idx})">DELAY</button>
                    <button class="btn-game-ctrl btn-del" onclick="event.stopPropagation(); delStep(${h.idx})">DELETE</button>
                `;
                row.innerHTML += `<div class="log-controls">${controlsHTML}</div>`;
            }
            list.appendChild(row);
        });
    }
    drawLines();
    if (typeof renderStats === 'function') renderStats();
    if (typeof updateCalculator === 'function') updateCalculator(); 
    if (typeof updateWarCalc === 'function') updateWarCalc(); 
    if (typeof renderEggLog === 'function') renderEggLog(); 
    if (typeof updateDaily === 'function') updateDaily();  
    if (typeof updateWeekly === 'function') updateWeekly(); 
    if (typeof updatePetMount === 'function') updatePetMount(); 
    if (typeof updateMergeResult === 'function') updateMergeResult(); 
    if (typeof updateMountMergeResult === 'function') updateMountMergeResult(); 
    if (typeof updateEquipment === 'function') updateEquipment(); 

    const pBtn = document.getElementById('btn-plan');
    if (pBtn) {
        if (insertModeIndex > -1) { pBtn.innerHTML = "INSERTING..."; pBtn.classList.add('insert'); } 
        else { pBtn.innerHTML = "PLAN"; pBtn.classList.remove('insert'); }
    }
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function drawLines() {
    if (lineUpdateRequested) return;
    lineUpdateRequested = true;
    requestAnimationFrame(() => {
        const svg = document.getElementById('svg-layer'); const canvas = document.getElementById('canvas');
        if (!canvas || !svg) { lineUpdateRequested = false; return; }
        svg.innerHTML = ''; 
        const lastBlock = canvas.lastElementChild;
        svg.style.height = (lastBlock ? (lastBlock.offsetTop + lastBlock.offsetHeight + 20) : 0) + "px";
        const c = canvas.getBoundingClientRect();
        document.querySelectorAll('.node').forEach(child => {
            if (child.closest('.tree-container').style.display === 'none') return;
            const isLocked = !child.classList.contains('unlocked');
            getParents(child.id).forEach(pId => {
                const parent = document.getElementById(pId);
                if (!parent) return;
                const r1 = parent.getBoundingClientRect(); const r2 = child.getBoundingClientRect();
                const x1 = r1.left + (r1.width / 2) - c.left; const y1 = r1.top + (r1.height / 2) - c.top;
                const x2 = r2.left + (r2.width / 2) - c.left; const y2 = r2.top + (r2.height / 2) - c.top;
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
                path.setAttribute('class', isLocked ? 'connector locked' : 'connector');
                svg.appendChild(path);
            });
        });
        lineUpdateRequested = false;
    });
}

function handleClick(id, isRight) {
    showFloatingLabel(id); 
    const meta = getMeta(id);
    
    if (currentMode === 'setup') {
        const currentLvl = setupLevels[id] || 0;
        
        if (isRight) {
            if (currentLvl > 0) {
                pushHistory(); 
                if (currentLvl > 1) setupLevels[id]--; 
                else delete setupLevels[id];
                
                if (!setupLevels[id]) {
                    let changed = true;
                    while (changed) { 
                        changed = false; 
                        Object.keys(setupLevels).forEach(k => { 
                            if (setupLevels[k] > 0 && !isUnlocked(k, setupLevels)) { 
                                delete setupLevels[k]; changed = true; 
                            } 
                        }); 
                    }
                    const sim = calcState(); 
                    if (sim.brokenSteps.length > 0) {
                        for (let i = sim.brokenSteps.length - 1; i >= 0; i--) {
                            planQueue.splice(sim.brokenSteps[i], 1);
                        }
                    }
                }
            }
        } else { 
            if (currentLvl < meta.m) { 
                pushHistory(); 
                setupLevels[id] = currentLvl + 1; 
                if ((setupLevels[id] || 0) === 1) autoUnlock(id); 
            } 
        }
    } else {
        if (isRight) {
            let idx = -1; 
            for (let i = planQueue.length - 1; i >= 0; i--) {
                if (planQueue[i].id === id) { idx = i; break; }
            }
            if (idx > -1) {
                pushHistory(); 
                planQueue.splice(idx, 1);
                let clean = false; 
                while (!clean) { 
                    const sim = calcState(planQueue); 
                    if (sim.brokenSteps.length > 0) {
                        for (let j = sim.brokenSteps.length - 1; j >= 0; j--) {
                            planQueue.splice(sim.brokenSteps[j], 1);
                        }
                    } else {
                        clean = true;
                    }
                }
            }
        } else {
            let checkState = insertModeIndex > -1 ? calcState(planQueue.slice(0, insertModeIndex)) : calcState();
            
            if ((checkState.levels[id] || 0) < meta.m && isUnlocked(id, checkState.levels)) {
                pushHistory();
                
                if (insertModeIndex > -1) { 
                    let insertedIndex = insertModeIndex; 
                    
                    planQueue.splice(insertedIndex, 0, { type: 'node', id }); 
                    insertModeIndex = -1; 
                    
                    ['capsule-logs', 'float-logs', 'float-tree'].forEach(elId => {
                        const el = document.getElementById(elId);
                        if (el) el.classList.remove('is-inserting');
                    });
                    
                    setMode('plan'); 
                    
                    if (window.innerWidth <= 768 && typeof switchMobileView === 'function') {
                        switchMobileView('logs');
                    }
                    
                    justMovedIndex = insertedIndex;
                    
                    setTimeout(() => {
                        const rows = document.querySelectorAll('#log-list .log-row');
                        if (rows[insertedIndex]) {
                            if (window.innerWidth <= 768) {
                                rows[insertedIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
                            } else {
                                const scrollWrapper = document.querySelector('.sidebar-scroll-wrapper');
                                if (scrollWrapper) {
                                    const targetY = rows[insertedIndex].offsetTop - (scrollWrapper.clientHeight / 2) + (rows[insertedIndex].clientHeight / 2);
                                    scrollWrapper.scrollTo({ top: targetY, behavior: 'smooth' });
                                }
                            }
                        }
                        
                        const nodeEl = document.getElementById(id);
                        if (nodeEl) {
                            nodeEl.classList.remove('flash-success');
                            void nodeEl.offsetWidth; 
                            nodeEl.classList.add('flash-success');
                            setTimeout(() => nodeEl.classList.remove('flash-success'), 2600);
                        }
                        
                    }, 50);
                    
                } else {
                    planQueue.push({ type: 'node', id });
                }
            }
        }
    }
    
    updateCalculations();
    justMovedIndex = -1; 
}

function handleShiftClick(id) {
    pushHistory(); setupLevels[id] = getMeta(id).m;
    const ensure = (cid) => getParents(cid).forEach(pid => { if ((setupLevels[pid] || 0) === 0) { setupLevels[pid] = 1; ensure(pid); } });
    ensure(id); updateCalculations();
}

function autoUnlock(id) { getParents(id).forEach(p => { if ((setupLevels[p] || 0) === 0) { setupLevels[p] = 1; autoUnlock(p); } }); }

function showFloatingLabel(nodeId) {
    if (window.innerWidth > 768) return;
    const node = document.getElementById(nodeId), meta = getMeta(nodeId), tier = getTier(nodeId);
    document.querySelectorAll('.floating-label').forEach(e => e.remove());
    const lbl = document.createElement('div'); lbl.className = 'floating-label';
    const tree = nodeId.split('_')[0]; const color = tree === 'forge' ? '#2980b9' : (tree === 'spt' ? '#8e44ad' : '#c0392b');
    lbl.innerHTML = `<span style="color:${color}">${meta.n} ${toRoman(tier)}</span>`;
    document.body.appendChild(lbl);
    const rect = node.getBoundingClientRect();
    lbl.style.left = (rect.left + rect.width / 2) + 'px'; lbl.style.top = (rect.top - 15) + 'px';
    setTimeout(() => { lbl.style.opacity = '0'; setTimeout(() => lbl.remove(), 500); }, 2000);
}

function setMode(m) {
    currentMode = m; document.body.dataset.mode = m;
    if (m !== 'plan') {
        insertModeIndex = -1;
        ['capsule-logs', 'float-logs', 'float-tree'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('is-inserting');
        });
    }
    const updateBtn = (id, isActive) => {
        const el = document.getElementById(id);
        if (el) { el.className = `seg-btn ${isActive ? 'active' : ''}`; if (id.includes('plan')) { if (insertModeIndex > -1) { el.innerText = "Insert"; el.classList.add('insert'); } else { el.innerText = "PLAN"; el.classList.remove('insert'); } } }
    };
    updateBtn('btn-setup', m === 'setup'); updateBtn('btn-plan', m === 'plan');
    updateBtn('btn-setup-mobile-new', m === 'setup'); updateBtn('btn-plan-mobile-new', m === 'plan');
    if (m === 'log') { if (typeof setSidebarPanel === 'function') setSidebarPanel('logs'); } 
    else if (window.innerWidth <= 768) { document.body.classList.remove('view-log', 'view-calc', 'view-egg'); document.body.classList.add('view-planner'); }
    updateCalculations();
}

function toggleExp(i) { expandedLogIndex = expandedLogIndex === i ? -1 : i; updateCalculations(); }
function delStep(i) {
    const q = [...planQueue]; q.splice(i, 1);
    let clean = false; 
    while (!clean) { 
        const sim = calcState(q); 
        if (sim.brokenSteps.length > 0) 
            for (let j = sim.brokenSteps.length - 1; j >= 0; j--) q.splice(sim.brokenSteps[j], 1); 
        else clean = true; 
    }
    pushHistory(); planQueue = q; expandedLogIndex = -1; updateCalculations();
}

// --- SMART DROP LOGIC ---
function startMove(idx) {
    movingStepIndex = idx;
    expandedLogIndex = -1; 
    validDropTargets = [];

    for (let targetIdx = 0; targetIdx < planQueue.length; targetIdx++) {
        if (targetIdx === idx) {
            validDropTargets[targetIdx] = true; 
            continue;
        }
        const testQueue = [...planQueue];
        const item = testQueue.splice(idx, 1)[0];
        
        let insertPos = targetIdx > idx ? targetIdx : targetIdx + 1;
        testQueue.splice(insertPos, 0, item);
        
        const sim = calcState(testQueue);
        validDropTargets[targetIdx] = (sim.brokenSteps.length === 0);
    }
    
    const testTopQueue = [...planQueue];
    const itemTop = testTopQueue.splice(idx, 1)[0];
    testTopQueue.splice(0, 0, itemTop);
    validDropTargets['top'] = (calcState(testTopQueue).brokenSteps.length === 0);
    
    const capDesk = document.getElementById('capsule-logs');
    const capMob = document.getElementById('float-logs');
    if (capDesk) capDesk.classList.add('is-moving');
    if (capMob) capMob.classList.add('is-moving');

    updateCalculations();
}

function cancelMove() {
    if (insertModeIndex > -1) {
        insertModeIndex = -1;
        ['capsule-logs', 'float-logs', 'float-tree'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.remove('is-inserting');
        });
        
        setMode('plan'); 

        if (window.innerWidth <= 768 && typeof switchMobileView === 'function') {
            switchMobileView('logs');
        }

        updateCalculations();
        return; 
    }

    movingStepIndex = -1;
    validDropTargets = [];
    
    ['capsule-logs', 'float-logs', 'float-tree'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-moving');
    });

    updateCalculations();
}

function executeMove(targetIdx) {
    if (targetIdx === movingStepIndex) { cancelMove(); return; }

    pushHistory(); 

    const testQueue = [...planQueue];
    const item = testQueue.splice(movingStepIndex, 1)[0];
    
    let insertPos;
    if (targetIdx === 'top') {
        insertPos = 0;
    } else {
        insertPos = targetIdx > movingStepIndex ? targetIdx : targetIdx + 1;
    }

    planQueue = testQueue;
    planQueue.splice(insertPos, 0, item);
    
    movingStepIndex = -1;
    validDropTargets = [];
    expandedLogIndex = -1; 
    
    justMovedIndex = insertPos; 
    
    const capDesk = document.getElementById('capsule-logs');
    const capMob = document.getElementById('float-logs');
    if (capDesk) capDesk.classList.remove('is-moving');
    if (capMob) capMob.classList.remove('is-moving');

    updateCalculations();
    
    setTimeout(() => {
        const rows = document.querySelectorAll('.log-row');
        if (rows[insertPos]) {
            if (window.innerWidth <= 768) {
                rows[insertPos].scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const scrollWrapper = document.querySelector('.sidebar-scroll-wrapper');
                if (scrollWrapper) {
                    const targetY = rows[insertPos].offsetTop - (scrollWrapper.clientHeight / 2) + (rows[insertPos].clientHeight / 2);
                    scrollWrapper.scrollTo({ top: targetY, behavior: 'smooth' });
                }
            }
        }
    }, 50);

    justMovedIndex = -1; 
}

function markDone(targetIdx, timestamp) {
    try {
        pushHistory();

        let lastNodeId = null;
        if (planQueue[targetIdx] && planQueue[targetIdx].type === 'node') {
            lastNodeId = planQueue[targetIdx].id;
        }

        for (let i = 0; i <= targetIdx; i++) {
            const item = planQueue[i];
            if (item.type === 'node') { 
                const cur = setupLevels[item.id] || 0; 
                const meta = getMeta(item.id); 
                if (meta) setupLevels[item.id] = Math.min(meta.m, cur + 1); 
            }
        }
        planQueue.splice(0, targetIdx + 1);
        
        let clean = false; 
        while (!clean) { 
            const sim = calcState(planQueue); 
            if (sim.brokenSteps.length > 0) 
                for (let j = sim.brokenSteps.length - 1; j >= 0; j--) planQueue.splice(sim.brokenSteps[j], 1); 
            else clean = true; 
        }
        
        const d = new Date(timestamp); 
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        const localIso = d.toISOString().slice(0, 16); 
        expandedLogIndex = -1; 
        
        if (typeof syncMainDate === 'function') syncMainDate(localIso);

        // --- SAFE VISUAL FEEDBACK & SCROLLING (HYBRID) ---
        setTimeout(() => {
            // A. Safely scroll Schedule to top (Targets exact mobile & desktop containers)
            const wrappers = [
                document.querySelector('.sidebar-scroll-wrapper'),
                document.querySelector('.pane.right-pane-wrapper')
            ];
            wrappers.forEach(el => {
                if (el && typeof el.scrollTo === 'function') {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
            
            // B. Double-Flash the Date Input Boxes
            const dateBoxes = document.querySelectorAll('#start-date, .cd-select');
            dateBoxes.forEach(box => {
                box.classList.remove('ui-glow-success');
                void box.offsetWidth; 
                box.classList.add('ui-glow-success');
                setTimeout(() => box.classList.remove('ui-glow-success'), 2600); 
            });

            // C. Auto-scroll the Tree and Double-Flash the Node
            if (lastNodeId) {
                const targetTree = lastNodeId.split('_')[0];
                
                if (targetTree !== activeTreeKey && typeof switchTree === 'function') {
                    switchTree(targetTree);
                }
                
                setTimeout(() => {
                    const nodeEl = document.getElementById(lastNodeId);
                    if (nodeEl) {
                        // HYBRID TREE SCROLLING
                        if (window.innerWidth <= 768) {
                            nodeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                        } else {
                            const treeCont = document.getElementById('tree-container');
                            if (treeCont) {
                                const targetY = nodeEl.offsetTop - (treeCont.clientHeight / 2) + (nodeEl.clientHeight / 2);
                                const targetX = nodeEl.offsetLeft - (treeCont.clientWidth / 2) + (nodeEl.clientWidth / 2);
                                treeCont.scrollTo({ top: targetY, left: targetX, behavior: 'smooth' });
                            }
                        }

                        nodeEl.classList.remove('flash-success');
                        void nodeEl.offsetWidth;
                        nodeEl.classList.add('flash-success');
                        setTimeout(() => nodeEl.classList.remove('flash-success'), 2600);
                    }
                }, 100); 
            }
        }, 50);
        
    } catch (e) { console.error(e); }
}

function addDelay(i) { 
    openPromptModal("Enter delay in MINUTES:", (m) => {
        if (m && !isNaN(parseFloat(m))) { 
            pushHistory(); 
            planQueue.splice(i + 1, 0, { type: 'delay', mins: parseFloat(m) }); 
            expandedLogIndex = -1; 
            updateCalculations(); 
        } 
    });
}

function activateInsert(idx) { 
    insertModeIndex = idx + 1; 
    expandedLogIndex = -1; 
    setMode('plan'); 
    
    ['capsule-logs', 'float-logs', 'float-tree'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('is-inserting');
    });

    const ftCapsule = document.querySelector('#float-tree .control-capsule');
    if (ftCapsule && !ftCapsule.querySelector('.floating-cancel-btn')) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-move-action floating-cancel-btn';
        cancelBtn.onclick = (e) => { e.stopPropagation(); cancelMove(); };
        cancelBtn.innerHTML = '<img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL';
        ftCapsule.appendChild(cancelBtn);
    }
    
    updateCalculations(); 
}

function clearPlan() { 
    openConfirmModal("Clear Schedule?", () => {
        pushHistory(); planQueue = []; updateCalculations(); 
    });
}
function resetCurrentTree() {
    openConfirmModal(`Reset ${activeTreeKey.toUpperCase()} tree?`, () => {
        pushHistory();
        Object.keys(setupLevels).forEach(id => { if (id.startsWith(activeTreeKey + "_")) delete setupLevels[id]; });
        planQueue = planQueue.filter(item => (item.type === 'node') ? !item.id.startsWith(activeTreeKey + "_") : true);
        let clean = false; 
        while (!clean) { 
            const sim = calcState(planQueue); 
            if (sim.brokenSteps.length > 0) 
                for (let j = sim.brokenSteps.length - 1; j >= 0; j--) planQueue.splice(sim.brokenSteps[j], 1); 
            else clean = true; 
        }
        updateCalculations();
    });
}

// --- UNDO / REDO ---
function pushHistory() {
    if (historyStack.length > 50) historyStack.shift();
    if (typeof captureFullState === 'function') { historyStack.push(JSON.stringify(captureFullState())); redoStack = []; updateUndoRedoBtns(); if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); }
}
function undo() {
    if (historyStack.length === 0) return;
    redoStack.push(JSON.stringify(captureFullState()));
    const stateToLoad = JSON.parse(historyStack.pop());
    if (typeof eggPlanQueue !== 'undefined') { const currentEggStart = document.getElementById('egg-date-desktop') ? document.getElementById('egg-date-desktop').value : null; stateToLoad.eggData = { queue: eggPlanQueue, start: currentEggStart }; }
    loadState(stateToLoad); updateUndoRedoBtns(); if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}
function redo() {
    if (redoStack.length === 0) return;
    historyStack.push(JSON.stringify(captureFullState()));
    const stateToLoad = JSON.parse(redoStack.pop());
    if (typeof eggPlanQueue !== 'undefined') { const currentEggStart = document.getElementById('egg-date-desktop') ? document.getElementById('egg-date-desktop').value : null; stateToLoad.eggData = { queue: eggPlanQueue, start: currentEggStart }; }
    loadState(stateToLoad); updateUndoRedoBtns(); if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}
function updateUndoRedoBtns() {
    const hasH = historyStack.length > 0; const hasR = redoStack.length > 0;
    const upd = (id, on) => { const el = document.getElementById(id); if (el) { el.disabled = !on; el.style.opacity = !on ? "0.3" : "1"; el.style.pointerEvents = !on ? "none" : "auto"; } };
    ['btn-undo-desktop', 'btn-undo-log', 'btn-undo-mobile-tree', 'btn-undo-mobile-log'].forEach(id => upd(id, hasH));
    ['btn-redo-desktop', 'btn-redo-log', 'btn-redo-mobile-tree', 'btn-redo-mobile-log'].forEach(id => upd(id, hasR));
}