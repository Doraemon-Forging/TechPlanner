/**
- EGG.JS
- Egg Planner Queue, War Points, Speed Calculations, and Reordering
 */

let eggPlanQueue = []; let eggInsertIdx = -1; let expandedEggIdx = -1;
let eggHistoryStack = []; let eggRedoStack = [];
let eggDeleteModeActive = false;
let eggMovingIdx = -1;
let eggJustMovedIdx = -1;

const EGG_WAR_KEYS = [
    'common', 'rare', 'epic', 'legendary',
    'ultimate', 'mythic', 'heroic', 'infinite', 'eternal'
];

window.getClanEggLvl = function(id) {
    const memMap = { 
        'egg1': 'eggTimerCommon', 
        'egg2': 'eggTimerRare', 
        'egg3': 'eggTimerEpic', 
        'egg4': 'eggTimerLegendary', 
        'egg5': 'eggTimerUltimate', 
        'egg6': 'eggTimerMythic',
        'egg7': 'eggTimerHeroic',
        'egg8': 'eggTimerInfinite',
        'egg9': 'eggTimerEternal'
    };
    const domMap = { 
        'egg1': 'ct-egg-timer-common', 
        'egg2': 'ct-egg-timer-rare', 
        'egg3': 'ct-egg-timer-epic', 
        'egg4': 'ct-egg-timer-legendary', 
        'egg5': 'ct-egg-timer-ultimate', 
        'egg6': 'ct-egg-timer-mythic',
        'egg7': 'ct-egg-timer-heroic',
        'egg8': 'ct-egg-timer-infinite',
        'egg9': 'ct-egg-timer-eternal'
    };
    
    let val = 0;
    const el = document.getElementById(domMap[id]);
    if (el) {
        val = parseInt(el.value) || 0;
    } else if (window.clanTechMemory && window.clanTechMemory[memMap[id]] !== undefined) {
        val = parseInt(window.clanTechMemory[memMap[id]]) || 0;
    }
    return val;
};

function getEggWarDay(date) {
    try {
        if (!date || isNaN(date.getTime()) || typeof warConfig === 'undefined') return 0;

        const d = date.getDay();
        const h = date.getHours();
        const m = date.getMinutes();

        let startH = Number(warConfig.hour);
        if (startH === 12) startH = (warConfig.ampm === 'PM') ? 12 : 0;
        else if (warConfig.ampm === 'PM') startH += 12;

        const startM = Number(warConfig.min) || 0;
        const curH = (d * 24) + h + (m / 60);
        const warH = Number((Number(warConfig.day) * 24) + startH + (startM / 60));

        const check = (off) => {
            let s = Number(off) % 168;
            if (s < 0) s += 168;
            const e = (s + 24) % 168;
            return (e > s) ? (curH >= s && curH < e) : (curH >= s || curH < e);
        };

        if (check(warH + 48)) return 3;
        if (check(warH + 96)) return 5;
        return 0;
    } catch (err) {
        console.error("Error calculating egg war day:", err);
        return 0;
    }
}

function getEggWarWeekClass(finishDate) {
    const d = new Date(finishDate);
    const dayOfWeek = d.getDay() || 7;
    d.setDate(d.getDate() - dayOfWeek + 1);
    const daysSinceEpoch = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    const absoluteWeeks = Math.floor((daysSinceEpoch - 3) / 7);
    return (absoluteWeeks % 2 === 0) ? 'war-active-w2' : 'war-active-w1';
}

function getEggWarPoints(eggKey, warDay) {
    if (warDay !== 3 && warDay !== 5) return 0;

    const idx = EGG_WAR_KEYS.indexOf(eggKey);
    const basePts = (idx > -1 && typeof WAR_POINTS_BASE !== 'undefined' && Array.isArray(WAR_POINTS_BASE.eggHatch))
        ? (WAR_POINTS_BASE.eggHatch[idx] || 0)
        : 0;

    if (basePts <= 0) return 0;

    const mult = typeof getClanTechMult === 'function'
        ? getClanTechMult('cwHatch', warDay)
        : (() => {
            const getTechBonus = (lv) => (lv <= 10) ? (lv * 0.04) : ((10 * 0.04) + ((lv - 10) * 0.01));
            const actionLv = parseInt(window.clanTechMemory?.cwHatch || 0);
            const dayLv = parseInt(window.clanTechMemory?.[`cwDay${warDay}`] || 0);
            return 1 + getTechBonus(actionLv) + getTechBonus(dayLv);
        })();

    return Math.round(basePts * mult);
}

if (typeof window !== 'undefined') {
    window.addEventListener('techPlannerUpdated', () => {
        if (typeof renderEggLog === 'function') renderEggLog();
    });
}

function formatEggTotalTime(mins) {
    const totalSec = Math.max(0, Math.round(mins * 60));
    if (totalSec >= 86400) {
        const d = Math.floor(totalSec / 86400);
        const h = Math.floor((totalSec % 86400) / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        return `${d}d ${h}h ${m}m`;
    }
    return typeof formatEggTime === 'function'
        ? formatEggTime(mins)
        : `${Math.floor(totalSec / 3600)}h ${Math.floor((totalSec % 3600) / 60)}m ${totalSec % 60}s`;
}

function captureEggState() {
    const dateEl = document.getElementById('egg-date-desktop');
    return { queue: JSON.parse(JSON.stringify(eggPlanQueue)), start: dateEl ? dateEl.value : '' };
}

function pushEggHistory() {
    if (eggHistoryStack.length > 50) eggHistoryStack.shift();
    eggHistoryStack.push(captureEggState());
    eggRedoStack = [];
    updateEggUndoButtons();
}

function undoEgg() {
    if (eggHistoryStack.length === 0) return;
    if (eggInsertIdx > -1) cancelEggInsert();
    if (eggDeleteModeActive) cancelEggDeleteMode();
    if (eggMovingIdx > -1) cancelEggMove();
    expandedEggIdx = -1;
    eggRedoStack.push(captureEggState());
    const state = eggHistoryStack.pop();
    eggPlanQueue = state.queue;
    if (state.start) syncEggDate(state.start, false);
    renderEggLog();
    updateEggUndoButtons();
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function redoEgg() {
    if (eggRedoStack.length === 0) return;
    if (eggInsertIdx > -1) cancelEggInsert();
    if (eggDeleteModeActive) cancelEggDeleteMode();
    if (eggMovingIdx > -1) cancelEggMove();
    expandedEggIdx = -1;
    eggHistoryStack.push(captureEggState());
    const state = eggRedoStack.pop();
    eggPlanQueue = state.queue;
    if (state.start) syncEggDate(state.start, false);
    renderEggLog();
    updateEggUndoButtons();
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function updateEggUndoButtons() {
    const hasH = eggHistoryStack.length > 0; const hasR = eggRedoStack.length > 0;
    const upd = (id, on) => { const el = document.getElementById(id); if (el) { el.disabled = !on; el.style.opacity = !on ? "0.3" : "1"; el.style.pointerEvents = !on ? "none" : "auto"; } };
    ['btn-undo-egg', 'btn-undo-mobile-egg'].forEach(id => upd(id, hasH));
    ['btn-redo-egg', 'btn-redo-mobile-egg'].forEach(id => upd(id, hasR));
}

function startEggMove(idx) {
    if (eggInsertIdx > -1) cancelEggInsert();
    if (eggDeleteModeActive) cancelEggDeleteMode();

    eggMovingIdx = idx;
    expandedEggIdx = -1;

    ['capsule-egg', 'float-egg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('is-moving');
    });

    attachEggCapsuleCancelBtn(cancelEggMove);
    renderEggLog();
}

function cancelEggMove() {
    eggMovingIdx = -1;
    eggJustMovedIdx = -1;

    ['capsule-egg', 'float-egg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-moving');
    });

    document.querySelectorAll('#capsule-egg .floating-cancel-btn, #float-egg .floating-cancel-btn').forEach(btn => btn.remove());

    renderEggLog();
}

function executeEggMove(targetIdx) {
    if (eggMovingIdx === -1 || targetIdx === eggMovingIdx) {
        cancelEggMove();
        return;
    }

    pushEggHistory();

    const updatedQueue = [...eggPlanQueue];
    const item = updatedQueue.splice(eggMovingIdx, 1)[0];

    let insertPos;
    if (targetIdx === 'top') {
        insertPos = 0;
    } else {
        insertPos = targetIdx > eggMovingIdx ? targetIdx : targetIdx + 1;
    }

    updatedQueue.splice(insertPos, 0, item);
    eggPlanQueue = updatedQueue;

    eggMovingIdx = -1;
    expandedEggIdx = -1;
    eggJustMovedIdx = insertPos;

    ['capsule-egg', 'float-egg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-moving');
    });
    document.querySelectorAll('#capsule-egg .floating-cancel-btn, #float-egg .floating-cancel-btn').forEach(btn => btn.remove());

    renderEggLog();
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

    setTimeout(() => {
        const rows = document.querySelectorAll('#egg-log-list .log-row');
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

    eggJustMovedIdx = -1;
}

function populateEggDropdowns() { populateDateDropdowns(); }

function getEggSpeedAtTime(techIdSuffix, targetTimeMs) {
    let personalLvl = 0; 
    for (let t = 1; t <= 6; t++) { personalLvl += (setupLevels[`spt_T${t}_${techIdSuffix}`] || 0); }

    const startEl = document.getElementById('start-date');
    const mainStartTime = (startEl && startEl.value) ? new Date(startEl.value).getTime() : Date.now();
    
    let techState = calcState(); 
    let runningTimeOffset = 0;
    techState.history.forEach(h => { 
        let stepDuration = (h.type === 'delay' ? h.mins : h.added); 
        runningTimeOffset += stepDuration; 
        if (h.tree === 'spt' && h.id && h.id.split('_')[2] === techIdSuffix) { 
            let techFinishTime = mainStartTime + (runningTimeOffset * 60000); 
            if (techFinishTime <= targetTimeMs) personalLvl++; 
        } 
    });
    
    const highSpeedIds = ['egg7', 'egg8', 'egg9'];
    const fallbackRate = highSpeedIds.includes(techIdSuffix) ? 0.60 : 0.10;
    const ratePerLvl = (typeof TREES !== 'undefined' && TREES.spt?.meta?.[techIdSuffix]?.rate)
        ? TREES.spt.meta[techIdSuffix].rate / 100
        : fallbackRate;
    let clanLvl = window.getClanEggLvl(techIdSuffix);
    return 1 + (personalLvl * ratePerLvl) + (clanLvl * 0.05);
}

function editEggGem(idx) {
    if (eggDeleteModeActive || eggMovingIdx > -1) return;
    const item = eggPlanQueue[idx];
    if (!item || item.type !== 'egg') return;

    const currentGems = item.gems || 0;
    openPromptModal(`Edit Gem amount for this egg (currently ${currentGems}):\nEnter 0 to remove.`, (val) => {
        if (val === null) return;
        const parsed = parseInt(val);
        const newGems = (isNaN(parsed) || parsed < 0) ? 0 : parsed;

        if (newGems !== currentGems) {
            pushEggHistory();
            eggPlanQueue[idx].gems = newGems;
            renderEggLog();
            if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        }
    });
}

function attachEggCapsuleCancelBtn(onCancel) {
    document.querySelectorAll('#capsule-egg .floating-cancel-btn, #float-egg .floating-cancel-btn').forEach(btn => btn.remove());

    const capEgg = document.getElementById('capsule-egg');
    if (capEgg) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn-move-action floating-cancel-btn';
        cancelBtn.onclick = (e) => { e.stopPropagation(); onCancel(); };
        cancelBtn.innerHTML = '<img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL';
        capEgg.appendChild(cancelBtn);
    }

    const floatEgg = document.getElementById('float-egg');
    if (floatEgg) {
        const floatCap = floatEgg.querySelector('.control-capsule');
        if (floatCap) {
            const cancelBtnMobile = document.createElement('button');
            cancelBtnMobile.className = 'btn-move-action floating-cancel-btn';
            cancelBtnMobile.onclick = (e) => { e.stopPropagation(); onCancel(); };
            cancelBtnMobile.innerHTML = '<img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL';
            floatCap.appendChild(cancelBtnMobile);
        }
    }
}

function activateEggInsert(idx) { 
    if (eggDeleteModeActive) cancelEggDeleteMode();
    if (eggMovingIdx > -1) cancelEggMove();
    eggInsertIdx = idx + 1; 
    expandedEggIdx = -1; 
    
    const eggBox = document.getElementById('egg-selector-box');
    if (eggBox) eggBox.classList.add('egg-insert-active'); 
    
    const capEgg = document.getElementById('capsule-egg');
    if (capEgg) capEgg.classList.add('is-inserting');

    const floatEgg = document.getElementById('float-egg');
    if (floatEgg) floatEgg.classList.add('is-inserting');

    attachEggCapsuleCancelBtn(cancelEggInsert);

    const wrappers = [
        document.querySelector('.sidebar-scroll-wrapper'),
        document.querySelector('.pane.right-pane-wrapper')
    ];
    wrappers.forEach(el => {
        if (el && typeof el.scrollTo === 'function') {
            el.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    renderEggLog();
}

function cancelEggInsert() {
    eggInsertIdx = -1;
    const eggBox = document.getElementById('egg-selector-box');
    if (eggBox) eggBox.classList.remove('egg-insert-active');
    
    const capEgg = document.getElementById('capsule-egg');
    if (capEgg) capEgg.classList.remove('is-inserting');

    const floatEgg = document.getElementById('float-egg');
    if (floatEgg) floatEgg.classList.remove('is-inserting');

    document.querySelectorAll('#capsule-egg .floating-cancel-btn, #float-egg .floating-cancel-btn').forEach(btn => btn.remove());
    
    renderEggLog();
}

function toggleEggExp(i) {
    if (eggDeleteModeActive || eggMovingIdx > -1) return;
    expandedEggIdx = expandedEggIdx === i ? -1 : i;
    renderEggLog();
}

function renderEggLog() {
    try {
        const list = document.getElementById('egg-log-list'); 
        if (!list) return;
        
        const dateInput = document.getElementById('egg-date-desktop'); 
        if (!dateInput || !dateInput.value) return;

        const fragment = document.createDocumentFragment();
        let curTime = new Date(dateInput.value).getTime(); 
        let totalQueueMins = 0; 
        let totalPoints = 0;
        const isInteractive = !eggDeleteModeActive && eggMovingIdx === -1;
        
        eggPlanQueue.forEach((item, idx) => {
            const div = document.createElement('div');
            const isMovingThis = (eggMovingIdx === idx);
            const isValidDrop = (eggMovingIdx > -1 && !isMovingThis);

            let classNames = ['log-row'];
            if (isInteractive && expandedEggIdx === idx) classNames.push('expanded');
            if (isMovingThis) classNames.push('moving-active');
            else if (isValidDrop) classNames.push('drop-valid');
            else if (eggDeleteModeActive) classNames.push('drop-valid', 'delete-mode-row');

            if (eggJustMovedIdx === idx) classNames.push('flash-success');
            if (idx === 0 && isValidDrop) classNames.push('has-top-btn');

            let actionButtons = '';
            if (eggDeleteModeActive) {
                actionButtons = `
                    <button class="btn-move-action btn-move-cancel" onclick="event.stopPropagation(); executeEggCut(${idx})" style="background-color: #e74c3c;">
                        <img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CUT HERE
                    </button>
                `;
            } else if (isMovingThis) {
                actionButtons = `
                    <button class="btn-move-action btn-move-cancel" onclick="event.stopPropagation(); cancelEggMove()">
                        <img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL
                    </button>
                `;
            } else if (isValidDrop) {
                if (idx === 0) {
                    actionButtons += `
                        <button class="btn-move-action btn-move-top" onclick="event.stopPropagation(); executeEggMove('top')">
                            <img src="icons/icon_above.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> ABOVE
                        </button>
                    `;
                }
                actionButtons += `
                    <button class="btn-move-action btn-move-below" onclick="event.stopPropagation(); executeEggMove(${idx})">
                        <img src="icons/icon_below.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> BELOW
                    </button>
                `;
            }

            const rowClickAttr = isInteractive ? ` onclick="toggleEggExp(${idx})"` : '';

            if (item.type === 'delay') {
                totalQueueMins += item.mins; curTime += item.mins * 60000;
                const finishDate = new Date(curTime);
                const finishTs = finishDate.getTime();
                const dayStr = finishDate.toLocaleDateString([], { weekday: 'short' });
                const dateStr = finishDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const timeOnlyStr = finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                const timeStr = `${dayStr}, ${dateStr}, ${timeOnlyStr}`;

                const compactTimeHtml = `
                    <div class="move-time-group">
                        <div class="mt-row log-time-style">${dayStr}</div>
                        <div class="mt-row log-time-style">${dateStr}</div>
                        <div class="mt-row log-time-style">${timeOnlyStr}</div>
                    </div>
                `;

                const hours = Math.floor(item.mins / 60);
                const mins = Math.floor(item.mins % 60);
                let formattedDelay = [];
                if (hours > 0) formattedDelay.push(`${hours}h`);
                if (mins > 0 || hours === 0) formattedDelay.push(`${mins}m`);

                const warDay = getEggWarDay(finishDate);
                if (warDay > 0) classNames.push(getEggWarWeekClass(finishDate));

                div.className = classNames.join(' ');
                div.innerHTML = `<div class="log-entry delay"${rowClickAttr}><div class="log-left-group"><div class="log-icon-wrapper desktop-only" style="align-items: center; justify-content: center; height: 44px;"><span style="font-size:1.8em; line-height:1;">💤</span></div><div class="log-name">Delay (${formattedDelay.join(' ')})</div></div><div class="log-right-group"><div class="log-time" style="color:#ccc">${timeStr}</div></div>${compactTimeHtml}<div class="move-actions-container">${actionButtons}</div></div>${isInteractive ? `<div class="log-controls"><button class="btn-game-ctrl btn-move" onclick="event.stopPropagation(); startEggMove(${idx})">MOVE</button><button class="btn-game-ctrl btn-insert" onclick="event.stopPropagation(); activateEggInsert(${idx})">INSERT</button><button class="btn-game-ctrl btn-done" onclick="event.stopPropagation(); markEggDone(${idx}, ${finishTs})">DONE</button><button class="btn-game-ctrl btn-del" onclick="event.stopPropagation(); deleteEggStep(${idx})">DELETE</button></div>` : ''}`;
            } else {
                const data = EGG_DATA[item.key]; 
                
                if (!data) {
                    console.warn(`Egg Data missing for key: ${item.key}. Skipping row.`);
                    return; 
                }
                
                const speedMult = getEggSpeedAtTime(data.id, curTime); 
                let finalMins = data.t / speedMult;

                // Apply Gem Time Skip (1 gem = 1,000s, rounded at .49 -> (gems + 0.5) * 1000s)
                let totalSec = finalMins * 60;
                let effectiveGems = 0;
                if (item.gems && item.gems > 0 && totalSec > 0) {
                    const maxGemsNeeded = Math.max(1, Math.ceil((totalSec / 1000) - 0.5));
                    effectiveGems = Math.min(item.gems, maxGemsNeeded);
                    const gemReductionSec = (effectiveGems + 0.5) * 1000;
                    totalSec = Math.max(0, totalSec - gemReductionSec);
                    finalMins = totalSec / 60;
                }
                
                totalQueueMins += finalMins; curTime += finalMins * 60000;
                const finishDate = new Date(curTime); const finishTs = finishDate.getTime(); 
                const dayStr = finishDate.toLocaleDateString([], { weekday: 'short' });
                const dateStr = finishDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const timeOnlyStr = finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                const timeStr = `${dayStr}, ${dateStr}, ${timeOnlyStr}`;

                const compactTimeHtml = `
                    <div class="move-time-group">
                        <div class="mt-row log-time-style">${dayStr}</div>
                        <div class="mt-row log-time-style">${dateStr}</div>
                        <div class="mt-row log-time-style">${timeOnlyStr}</div>
                    </div>
                `;

                const warDay = getEggWarDay(finishDate);
                if (warDay > 0) classNames.push(getEggWarWeekClass(finishDate));
                const pts = getEggWarPoints(item.key, warDay);
                totalPoints += pts;
                
                div.className = classNames.join(' ');

                const ptsHtml = warDay > 0
                    ? `<div class="ld-part pot"><img src="icons/warpoint.png" class="ld-icon"><span>${pts.toLocaleString('en-US')}</span></div>`
                    : '';

                const gemHtml = `
                    <div class="ld-part gem" onclick="event.stopPropagation(); editEggGem(${idx})" style="cursor: pointer; transition: transform 0.1s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" title="Click to edit Gem amount">
                        <img src="icons/Gem.png" class="ld-icon">
                        <span>${effectiveGems.toLocaleString('en-US')}</span>
                    </div>
                `;

                const timeHtml = `<div class="ld-part time" style="width: auto;"><img src="icons/icon_time.png" class="ld-icon"><span>${formatEggTime(finalMins)}</span></div>`;
                const detailsHtml = `<div class="log-details">${ptsHtml}${gemHtml}${timeHtml}</div>`;

                div.innerHTML = `<div class="log-entry ${data.c}"${rowClickAttr}><div class="log-left-group"><div class="log-icon-wrapper"><img src="${data.img}" style="height: 44px; width: auto; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));" onerror="this.style.display='none'"></div><div class="log-name">${data.n}</div> </div><div class="log-right-group"><div class="log-time">${timeStr}</div>${detailsHtml}</div>${compactTimeHtml}<div class="move-actions-container">${actionButtons}</div></div>${isInteractive ? `<div class="log-controls"><button class="btn-game-ctrl btn-move" onclick="event.stopPropagation(); startEggMove(${idx})">MOVE</button><button class="btn-game-ctrl btn-insert" onclick="event.stopPropagation(); activateEggInsert(${idx})">INSERT</button><button class="btn-game-ctrl btn-done" onclick="event.stopPropagation(); markEggDone(${idx}, ${finishTs})">DONE</button><button class="btn-game-ctrl btn-delay" onclick="event.stopPropagation(); addEggDelay(${idx})">DELAY</button><button class="btn-game-ctrl btn-del" onclick="event.stopPropagation(); deleteEggStep(${idx})">DELETE</button></div>` : ''}`;
            }
            fragment.appendChild(div);
        });

        list.innerHTML = '';
        list.appendChild(fragment);

        const summaryBox = document.getElementById('egg-total-summary');
        if (summaryBox) {
            summaryBox.className = 'egg-stats-row'; 
            summaryBox.innerHTML = `
                <div class="es-item type-points"><span class="es-value points">${totalPoints.toLocaleString('en-US')}</span></div>
                <div class="es-item type-time"><span class="es-value time">${formatEggTotalTime(totalQueueMins)}</span></div>
            `;
        }
    } catch (err) {
        console.error("CRITICAL: Egg Planner crashed during rendering. The UI was protected.", err);
    }
}

function addEggToQueue(type) { 
    if (eggDeleteModeActive) cancelEggDeleteMode();
    if (eggMovingIdx > -1) cancelEggMove();
    pushEggHistory(); 
    const item = { type: 'egg', key: type, gems: 0 }; 
    
    if (eggInsertIdx > -1) { 
        const safeIdx = Math.min(eggInsertIdx, eggPlanQueue.length);
        eggPlanQueue.splice(safeIdx, 0, item); 
        cancelEggInsert();
    } else { 
        eggPlanQueue.push(item); 
        renderEggLog(); 
    } 
    
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
}

function markEggDone(idx, timestamp) { 
    try { 
        pushEggHistory(); 
        eggPlanQueue.splice(0, idx + 1); 
        if (eggInsertIdx > -1) cancelEggInsert();
        if (eggMovingIdx > -1) cancelEggMove();
        
        const d = new Date(timestamp); 
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); 
        const localIso = d.toISOString().slice(0, 16); 
        syncEggDate(localIso); 
        expandedEggIdx = -1; 

        setTimeout(() => {
            const wrappers = [
                document.querySelector('.sidebar-scroll-wrapper'),
                document.querySelector('.pane.right-pane-wrapper')
            ];
            wrappers.forEach(el => {
                if (el && typeof el.scrollTo === 'function') {
                    el.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            const dateBoxes = document.querySelectorAll('#egg-date-desktop, .cd-select');
            dateBoxes.forEach(box => {
                box.classList.remove('ui-glow-success');
                void box.offsetWidth; 
                box.classList.add('ui-glow-success');
                setTimeout(() => box.classList.remove('ui-glow-success'), 2600); 
            });
        }, 50);
        
    } catch (e) { 
        console.error(e); 
    } 
}

function addEggDelay(idx) { 
    if (typeof openDelayModal === 'function') {
        openDelayModal("Enter Delay:", (totalMins) => {
            if (totalMins > 0) { 
                pushEggHistory(); 
                eggPlanQueue.splice(idx + 1, 0, { type: 'delay', mins: parseFloat(totalMins) }); 
                expandedEggIdx = -1; 
                if (eggInsertIdx > -1) cancelEggInsert();
                else renderEggLog(); 
                if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
            } 
        });
    }
}

function deleteEggStep(idx) { 
    pushEggHistory(); 
    eggPlanQueue.splice(idx, 1); 
    expandedEggIdx = -1;
    if (eggInsertIdx > -1) cancelEggInsert();
    else renderEggLog(); 
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
}

function clearEggPlan() { 
    if (document.getElementById('custom-clear-overlay')) return; 

    const overlay = document.createElement('div');
    overlay.id = 'custom-clear-overlay';
    overlay.className = 'modal'; 
    overlay.style.display = 'block';

    overlay.onclick = function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    };

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content confirm-mode';
    modalContent.style.cssText = 'padding-bottom: 20px;'; 

    modalContent.innerHTML = `
        <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; text-align: center; color: #ffffff; margin-bottom: 15px; line-height: 1.3;">
            Clear Entire Schedule?
        </div>
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 20px;">
            <button class="btn-confirm-cancel" onclick="document.body.removeChild(document.getElementById('custom-clear-overlay'))" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #ff4757; box-shadow: inset 0 -4px 0 0 #c0392b; transition: transform 0.1s;">
                <img src="icons/icon_cancel.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>
            
            <button class="btn-confirm-ok" onclick="executeEggFullClear(); document.body.removeChild(document.getElementById('custom-clear-overlay'))" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #00b0ff; box-shadow: inset 0 -4px 0 0 #005680; transition: transform 0.1s;">
                <img src="icons/button_ok.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>
        </div>

        <hr style="border: none; border-bottom: 2px dashed rgba(255,255,255,0.2); margin: 0 15px 20px 15px;">

        <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; text-align: center; color: #ffffff; margin-bottom: 15px; line-height: 1.3;">
            Choose Cut-Off Point?
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
            <button class="btn-confirm-cancel" onclick="document.body.removeChild(document.getElementById('custom-clear-overlay'))" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #ff4757; box-shadow: inset 0 -4px 0 0 #c0392b; transition: transform 0.1s;">
                <img src="icons/icon_cancel.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>

            <button class="btn-confirm-ok" onclick="activateEggDeleteMode(); document.body.removeChild(document.getElementById('custom-clear-overlay'))" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #00b0ff; box-shadow: inset 0 -4px 0 0 #005680; transition: transform 0.1s;">
                <img src="icons/button_ok.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>
        </div>
        
        <style>
            #custom-clear-overlay .btn-confirm-ok:active { transform: translateY(3px); box-shadow: inset 0 -1px 0 0 #005680 !important; }
            #custom-clear-overlay .btn-confirm-cancel:active { transform: translateY(3px); box-shadow: inset 0 -1px 0 0 #c0392b !important; }
        </style>
    `;

    overlay.appendChild(modalContent);
    document.body.appendChild(overlay);
}

function executeEggFullClear() {
    pushEggHistory(); 
    eggPlanQueue = []; 
    expandedEggIdx = -1;
    if (eggInsertIdx > -1) cancelEggInsert();
    if (eggDeleteModeActive) cancelEggDeleteMode();
    if (eggMovingIdx > -1) cancelEggMove();
    renderEggLog(); 
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function activateEggDeleteMode() {
    if (eggInsertIdx > -1) cancelEggInsert();
    if (eggMovingIdx > -1) cancelEggMove();
    eggDeleteModeActive = true;
    expandedEggIdx = -1;

    ['capsule-egg', 'float-egg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('is-moving');
    });

    attachEggCapsuleCancelBtn(cancelEggDeleteMode);

    if (!document.getElementById('delete-mode-styles')) {
        const style = document.createElement('style');
        style.id = 'delete-mode-styles';
        style.innerHTML = `
            .log-row.delete-mode-row { border: 2px dashed #e74c3c !important; background-color: rgba(231, 76, 60, 0.05) !important; }
        `;
        document.head.appendChild(style);
    }

    renderEggLog();
}

function cancelEggDeleteMode() {
    eggDeleteModeActive = false;

    ['capsule-egg', 'float-egg'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('is-moving');
    });

    document.querySelectorAll('#capsule-egg .floating-cancel-btn, #float-egg .floating-cancel-btn').forEach(btn => btn.remove());

    renderEggLog();
}

function executeEggCut(idx) {
    pushEggHistory();
    eggPlanQueue = eggPlanQueue.slice(0, idx);
    cancelEggDeleteMode();
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}