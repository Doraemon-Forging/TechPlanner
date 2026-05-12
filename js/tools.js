/**
 * TOOLS.JS
 * Forge Calculator, Stats Rendering, and Egg Planner
 */

const CALC_FORGE_RATES = {
    1:  [100, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    2:  [99, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    3:  [98, 2, 0, 0, 0, 0, 0, 0, 0, 0],
    4:  [96, 4, 0, 0, 0, 0, 0, 0, 0, 0],
    5:  [91.5, 8, 0.5, 0, 0, 0, 0, 0, 0, 0],
    6:  [82, 16, 2, 0, 0, 0, 0, 0, 0, 0],
    7:  [64, 32, 4, 0, 0, 0, 0, 0, 0, 0],
    8:  [27.8, 64, 8, 0.2, 0, 0, 0, 0, 0, 0],
    9:  [13, 70, 16, 1, 0, 0, 0, 0, 0, 0],
    10: [6, 60, 32, 2, 0, 0, 0, 0, 0, 0],
    11: [0, 31.9, 64, 4, 0.1, 0, 0, 0, 0, 0],
    12: [0, 27.5, 64, 8, 0.5, 0, 0, 0, 0, 0],
    13: [0, 8, 75, 16, 1, 0, 0, 0, 0, 0],
    14: [0, 0, 66, 32, 2, 0.05, 0, 0, 0, 0],
    15: [0, 0, 31.7, 64, 4, 0.25, 0, 0, 0, 0],
    16: [0, 0, 21.5, 70, 8, 0.5, 0, 0, 0, 0],
    17: [0, 0, 0, 82.9, 16, 1, 0.05, 0, 0, 0],
    18: [0, 0, 0, 65.7, 32, 2, 0.25, 0, 0, 0],
    19: [0, 0, 0, 31.5, 64, 4, 0.5, 0, 0, 0],
    20: [0, 0, 0, 0, 91, 8, 1, 0.05, 0, 0],
    21: [0, 0, 0, 0, 81.7, 16, 2, 0.25, 0, 0],
    22: [0, 0, 0, 0, 63.5, 32, 4, 0.5, 0, 0],
    23: [0, 0, 0, 0, 27, 64, 8, 1, 0, 0],
    24: [0, 0, 0, 0, 0, 82, 16, 2, 0.02, 0],
    25: [0, 0, 0, 0, 0, 64, 32, 4, 0.05, 0],
    26: [0, 0, 0, 0, 0, 43.8, 50, 6, 0.25, 0],
    27: [0, 0, 0, 0, 0, 31.5, 60, 8, 0.5, 0],
    28: [0, 0, 0, 0, 0, 21, 65, 13, 1, 0],
    29: [0, 0, 0, 0, 0, 6.99, 68, 23, 2, 0.02],
    30: [0, 0, 0, 0, 0, 0, 60, 36, 4, 0.05],
    31: [0, 0, 0, 0, 0, 0, 50.8, 43, 6, 0.25],
    32: [0, 0, 0, 0, 0, 0, 41.5, 50, 8, 0.5],
    33: [0, 0, 0, 0, 0, 0, 28, 58, 13, 1],
    34: [0, 0, 0, 0, 0, 0, 11, 64, 23, 2],
    35: [0, 0, 0, 0, 0, 0, 0, 60, 36, 4]
};

// ==========================================
// 1. STATS RENDERING
// ==========================================

function getMinLevel(maxLv) {
    if (maxLv === 99) return 96;
    let floor = 1; const bracketFloors = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146];
    for (let f of bracketFloors) if (f <= maxLv - 5) floor = f; else break;
    return floor;
}
function getSlotStats(maxLv, bonus) {
    let total = 0, count = 0, minLv = getMinLevel(maxLv);
    for (let i = minLv; i <= maxLv; i++) { total += Math.round(20 * Math.pow(1.01, i - 1) * (100 + bonus) / 100); count++; }
    return { range: `${minLv}-${maxLv}`, avg: (count > 0 ? total / count : 0) };
}

function renderStats() {
    const container = document.getElementById('stats-content');
    if(!container) return;
    container.innerHTML = '';
    const state = calcState();
    let totalAvgCur = 0, totalAvgSellIso = 0;
    const slots = [];
    if (TREES.power && TREES.power.structure) { TREES.power.structure.forEach(s => { if (TREES.power.meta[s.id].isSlot) slots.push(s.id); }); }
    
    let totalAvgSellCombined = 0; 
    slots.forEach(sid => {
        let l = 0; for (let t = 1; t <= 5; t++) l += (setupLevels[`power_T${t}_${sid}`] || 0);
        let lProj = 0; for (let t = 1; t <= 5; t++) lProj += (state.levels[`power_T${t}_${sid}`] || 0);
        
        totalAvgCur += getSlotStats(99 + l * 2, state.totalSellBonusCur).avg;
        totalAvgSellIso += getSlotStats(99 + l * 2, state.totalSellBonusProj).avg;
        totalAvgSellCombined += getSlotStats(99 + lProj * 2, state.totalSellBonusProj).avg; 
    });
    const globCur = slots.length > 0 ? totalAvgCur / slots.length : 0;
    const globProj_SellIso = slots.length > 0 ? totalAvgSellIso / slots.length : 0;
    const globProj_SellCombined = slots.length > 0 ? totalAvgSellCombined / slots.length : 0;
    
    ['forge', 'spt', 'power'].forEach(key => {
        const treeData = TREES[key];
        let currentCount = 0;
        Object.keys(setupLevels).forEach(id => { if (id.startsWith(key + '_')) currentCount += setupLevels[id]; });
        const max = treeData.maxLevels;
        const pct = ((currentCount / max) * 100).toFixed(1);
        const group = document.createElement('div'); group.className = 'stats-group';
        const header = document.createElement('div'); header.className = `stats-header ${key}`;
        header.innerHTML = `<div class="header-left"><div class="header-icon-circle"><img src="icons/tree_${key === 'spt' ? 'SPT' : key}.png" class="nav-icon"></div><span class="header-title-text">${treeData.name.toUpperCase()}</span></div><div class="header-right"><span class="stat-count-text">${currentCount}/${max}</span><span class="stat-pct-text">${pct}%</span></div>`;
        group.appendChild(header);

        let hasStats = false;
        treeData.structure.forEach(ns => {
            const meta = treeData.meta[ns.id];
            if (!meta || !meta.stat) return;
            let curT = 0, projT = 0, curW = 0, projW = 0;
            for (let t = 1; t <= 5; t++) { 
                const id = `${key}_T${t}_${ns.id}`; 
                const cLvl = (setupLevels[id] || 0);
                const pLvl = (state.levels[id] || 0);
                curT += cLvl; 
                projT += pLvl; 
                curW += cLvl * t;
                projW += pLvl * t;
            }
            hasStats = true;
            let txtCur = meta.stat(curT, curW); let txtProj = meta.stat(projT, projW);
            if (txtProj.includes('%') && txtCur.includes('%')) { const match = txtProj.match(/([+\-]?\d+%?)$/); if (match) txtProj = match[0]; }
            const iconRegex = /([\d\.\,kmb]+)\s*(<img[^>]+>)/g;
            if (txtCur && typeof txtCur === 'string') txtCur = txtCur.replace(iconRegex, '$2 $1');
            if (txtProj && typeof txtProj === 'string') txtProj = txtProj.replace(iconRegex, '$2 $1');
            
            let infoBtnHTML = '';
            let disclaimerHTML = ''; 
            
           if (key === 'forge' && ns.id === 'sell') { 
                txtCur += ` <span style="color:#000000;">(Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(globCur, 'gold')})</span>`; 
                
                if (globProj_SellCombined > globProj_SellIso) {
                    txtProj += ` <span>(Isolated avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(globProj_SellIso, 'gold')} <span style="margin: 0 4px;">|</span> Overall avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(globProj_SellCombined, 'gold')})</span>`; 
                    disclaimerHTML = `<div style="width: 100%; font-size: 0.75rem; color: #95a5a6; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #c8d6e5; line-height: 1.3; font-family: 'Fredoka', sans-serif; letter-spacing: 0.2px; text-shadow: none; -webkit-text-stroke: 0; font-weight: 500;">*Isolated avg assumes item levels are constant. Overall avg includes item level changes.</div>`;
                } else {
                    txtProj += ` <span>(Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(globProj_SellIso, 'gold')})</span>`; 
                }
                
                infoBtnHTML = `<button class="btn-info" onclick="showEqSellTable(${curT * 1},${projT * 1})">i</button>`; 
            }
            else if (meta.isSlot) { const sCur = getSlotStats(99 + curT * 2, state.totalSellBonusCur); const sProj = getSlotStats(99 + projT * 2, state.totalSellBonusCur); txtCur = `Max ${99 + curT * 2} (Range: ${sCur.range} | Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(sCur.avg, 'gold')})</span>`; txtProj = `Max ${99 + projT * 2} (Range: ${sProj.range} | Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(sProj.avg, 'gold')})</span>`; }
            else if (meta.isDiscount) { infoBtnHTML = `<button class="btn-info" onclick="showPotionTable(${curT * 2}, ${projT * 2})">i</button>`; }
            else if (key === 'spt' && ns.id === 'timer') { infoBtnHTML = `<button class="btn-info" onclick="showTechTimerTable(${curT * 4}, ${projT * 4})">i</button>`; }
            
            else if (key === 'forge' && ns.id === 'disc') { 
                const discVal = meta.val !== undefined ? meta.val : 1;
                infoBtnHTML = `<button class="btn-info" onclick="showForgeTable('cost',${curT * discVal},${projT * discVal})">i</button>`; 
            } 
            else if (key === 'forge' && ns.id === 'timer') { 
                const timerVal = meta.val !== undefined ? meta.val : 2; 
                infoBtnHTML = `<button class="btn-info" onclick="showForgeTable('timer',${curT * timerVal},${projT * timerVal})">i</button>`; 
            }
            
            let finalHTML = txtCur; 
                if (projT > curT || (key === 'forge' && ns.id === 'sell' && globProj_SellCombined > globCur)) {
                    finalHTML += `<span class="stat-arrow">➜</span> <span class="stat-new">${txtProj}</span>`;
                }
            const row = document.createElement('div'); row.className = 'stats-row ' + key; 
            
            if (disclaimerHTML !== '') {
                row.style.flexDirection = 'column';
                row.style.alignItems = 'flex-start';
                row.innerHTML = `
                    <div style="display: flex; align-items: center; width: 100%;">
                        <div class="stat-icon-box"><img src="icons/${key}_${ns.id}.png" class="stat-icon-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="stat-icon-fallback" style="display:none">?</div></div>
                        <div class="stat-info" style="flex: 1;"><div class="stat-name">${meta.n} ${infoBtnHTML}</div><div class="stat-value">${finalHTML}</div></div>
                    </div>
                    ${disclaimerHTML}
                `;
            } else {
                row.innerHTML = `<div class="stat-icon-box"><img src="icons/${key}_${ns.id}.png" class="stat-icon-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><div class="stat-icon-fallback" style="display:none">?</div></div><div class="stat-info"><div class="stat-name">${meta.n} ${infoBtnHTML}</div><div class="stat-value">${finalHTML}</div></div>`;
            }
            
            group.appendChild(row);
        });
        if (hasStats) container.appendChild(group);
    });
}

// ==========================================
// 2. FORGE CALCULATOR
// ==========================================

function populateForgeDropdown() {
    const ascEl = document.getElementById('calc-forge-asc');
    const lvEl = document.getElementById('calc-forge-lv'); 
    
    if (!ascEl || !lvEl) return;
    
    ascEl.innerHTML = "";
    for (let i = 0; i <= 3; i++) ascEl.add(new Option(`Asc ${i}`, i));
    ascEl.value = 0;

    lvEl.innerHTML = ""; 
    for (let i = 1; i <= 35; i++) lvEl.add(new Option(i, i)); 
    lvEl.value = 20;

    syncTargetForgeDropdown();
}

function syncTargetForgeDropdown() {
    const curAscEl = document.getElementById('calc-forge-asc');
    const curLvEl = document.getElementById('calc-forge-lv');
    const targetAscEl = document.getElementById('calc-target-forge-asc');
    const targetLvEl = document.getElementById('calc-target-forge-lv');
    
    if (!curAscEl || !curLvEl || !targetAscEl || !targetLvEl) return;
    
    let curAsc = parseInt(curAscEl.value) || 0;
    let curLv = parseInt(curLvEl.value) || 1;
    
    let oldTargetAsc = targetAscEl.value;
    let oldTargetLv = targetLvEl.value;

    targetAscEl.innerHTML = "";
    targetAscEl.disabled = false;
    targetAscEl.style.opacity = "1";
    
    if (curAsc === 3 && curLv === 35) {
        targetAscEl.add(new Option("Asc 3", 3));
        targetAscEl.value = 3;
        targetLvEl.innerHTML = "";
        targetLvEl.add(new Option("MAX", 35));
        targetLvEl.value = 35;
        targetLvEl.disabled = true;
        targetLvEl.style.opacity = "0.5";
        return;
    }

    for (let i = curAsc; i <= 3; i++) {
        targetAscEl.add(new Option(`Asc ${i}`, i));
    }

    if (oldTargetAsc !== "" && parseInt(oldTargetAsc) >= curAsc && parseInt(oldTargetAsc) <= 3) {
        targetAscEl.value = oldTargetAsc;
    } else {
        targetAscEl.value = curAsc;
    }
    
    let selTargetAsc = parseInt(targetAscEl.value);

    targetLvEl.innerHTML = "";
    targetLvEl.disabled = false;
    targetLvEl.style.opacity = "1";

    let startLv = (selTargetAsc === curAsc) ? curLv + 1 : 1;
    
    for (let i = startLv; i <= 35; i++) {
        targetLvEl.add(new Option(i, i));
    }

    if (selTargetAsc < 3) {
        targetLvEl.add(new Option("Ascend", "Ascend"));
    }

    if (oldTargetLv === "Ascend") {
        targetLvEl.value = (selTargetAsc < 3) ? "Ascend" : 35;
    } else {
        let pLv = parseInt(oldTargetLv);
        if (!isNaN(pLv) && pLv >= startLv && pLv <= 35) {
            targetLvEl.value = pLv;
        } else {
            targetLvEl.value = (startLv <= 35) ? startLv : "Ascend";
        }
    }
}

function getTechBonuses(lvls) {
    let speed = 0, sell = 0, hBonus = 0, cBonus = 0, free = 0, offH = 0, offC = 0, forgeDisc = 0;
    const sumLvl = (id) => { let s = 0; for (let t = 1; t <= 5; t++) s += (lvls[`forge_T${t}_${id}`] || 0); return s; };
    
    const getVal = (id, fallback) => {
        if (TREES && TREES.forge && TREES.forge.meta && TREES.forge.meta[id] && TREES.forge.meta[id].val !== undefined) return TREES.forge.meta[id].val;
        return fallback;
    };

    speed = sumLvl('timer') * getVal('timer', 2); 
    sell = sumLvl('sell') * getVal('sell', 1); 
    hBonus = sumLvl('h_bonus') * getVal('h_bonus', 1); 
    cBonus = sumLvl('c_bonus') * getVal('c_bonus', 1); 
    free = sumLvl('free') * getVal('free', 1); 
    forgeDisc = sumLvl('disc') * getVal('disc', 1); 
    offH = sumLvl('off_h') * getVal('off_h', 1); 
    offC = sumLvl('off_c') * getVal('off_c', 1);
    
    let totalAvg = 0, count = 0; 
    if (TREES.power && TREES.power.structure) { 
        TREES.power.structure.forEach(s => { 
            if (TREES.power.meta[s.id].isSlot) { 
                let l = 0; for (let t = 1; t <= 5; t++) l += (lvls[`power_T${t}_${s.id}`] || 0); 
                const slotMult = TREES.power.meta[s.id].val !== undefined ? TREES.power.meta[s.id].val : 2;
                totalAvg += getSlotStats(99 + l * slotMult, sell).avg; count++; 
            } 
        }); 
    }
    return { speed, sell, hBonus, cBonus, free, offH, offC, avgGold: count > 0 ? totalAvg / count : 0, forgeDisc };
}

const formatCalcYield = (val) => {
    if (val === 0) return "0";
    if (val < 1000) {
        return val.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
    }
    return val.toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 0});
};

const renderCalcGroup = (valBefore, valAfter, iconName, type = 'standard') => {
    const iconHtml = iconName ? `<img src="icons/${iconName}.png" class="calc-icon-left" style="margin-right: 4px;">` : '';
    
    let strB, strA;
    if (type === 'date') {
        strB = valBefore; 
        strA = valAfter;
    } else {
        const fmt = (v) => {
             if (type === 'gold') return formatResourceValue(v, 'gold');
             if (type === 'hammer') return formatResourceValue(v, 'hammer');
             if (type === 'yield') return formatCalcYield(v);
             if (type === 'time') return formatSmartTime(v);
             return Math.round(v).toLocaleString('en-US');
        };
        strB = fmt(valBefore);
        strA = fmt(valAfter);
    }

    if (strB === strA) {
        return `<span>${iconHtml}${strB}</span>`;
    } else {
        return `
            <span class="calc-val-before" style="display:block; text-align:right; width:100%;">${iconHtml}${strB}</span>
            <span class="calc-val-after" style="display:flex; justify-content:flex-end; align-items:center; width:100%;">
                <span class="calc-arrow" style="margin-right:4px; font-size:0.9em;">➜</span>
                ${iconHtml}${strA}
            </span>`;
    }
};

function updateCalculator() {
    const hammerEl = document.getElementById('calc-hammers'); 
    const targetEl = document.getElementById('calc-target');
    if (!hammerEl || !targetEl) return;

    const hIn = parseFloat(hammerEl.value.replace(/,/g, '')) || 0;
    const gTarget = parseFloat(targetEl.value.replace(/,/g, '')) || 0;
    
    const fAsc = parseInt(document.getElementById('calc-forge-asc').value) || 0;
    const fLv = parseInt(document.getElementById('calc-forge-lv').value) || 1; 

    if (document.activeElement !== hammerEl) hammerEl.value = hIn > 0 ? hIn.toLocaleString('en-US') : (hammerEl.value ? '0' : '');
    if (document.activeElement !== targetEl) targetEl.value = gTarget > 0 ? gTarget.toLocaleString('en-US') : (targetEl.value ? '0' : '');

    const curStats = getTechBonuses(setupLevels); 
    const projStats = getTechBonuses(calcState().levels);
    
    const renderForgeGroup = (v1, v2, iconKey, type) => {
        const iconHtml = iconKey ? `<img src="icons/${iconKey}.png" class="calc-icon-left" style="margin-right: 4px;">` : '';
        
        let strB, strA;
        if (type === 'date' || type === 'standard') { 
            strB = v1; 
            strA = v2; 
        } else {
            const fmt = (v) => {
                 if (type === 'gold') return formatResourceValue(v, 'gold');
                 if (type === 'hammer') return formatResourceValue(v, 'hammer');
                 if (type === 'yield') return formatCalcYield(v);
                 if (type === 'time') return formatSmartTime(v);
                 return Math.round(v).toLocaleString('en-US');
            };
            strB = fmt(v1); strA = fmt(v2);
        }

        if (strB === strA) {
            return `<div class="calc-val-group forge-align-fix"><span>${iconHtml}${strB}</span></div>`;
        } else {
            return `
                <div class="calc-val-group forge-align-fix">
                    <span class="calc-val-before">${iconHtml}${strB}</span>
                    <span class="calc-val-after">
                        <span class="calc-arrow">➜</span>
                        ${iconHtml}${strA}
                    </span>
                </div>`;
        }
    };

    const genLine = (label, v1, v2, iconKey, type = 'standard', tooltip = "") => {
        const tt = tooltip ? `<span class="info-tooltip" title="${tooltip}" onclick="alert('${tooltip}')">(?)</span>` : '';
        return `<div class="calc-line"><div class="calc-label">${label} ${tt}</div>${renderForgeGroup(v1, v2, iconKey, type)}</div>`;
    };

    const formatDT = (d) => {
        const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
        return `<span class="forge-date-text">${dateStr}, ${timeStr}</span>`; 
    };

    const sDateVal = document.getElementById('calc-start-date').value;
    const mainStartTime = sDateVal ? new Date(sDateVal).getTime() : Date.now();

    const planStartEl = document.getElementById('start-date');
    const planStartMs = planStartEl && planStartEl.value ? new Date(planStartEl.value).getTime() : Date.now();
    const state = calcState();
    
    let techSchedule = [];
    let runningTimeOffset = 0;

    const getVal = (id, fallback) => {
        if (typeof TREES !== 'undefined' && TREES.forge && TREES.forge.meta && TREES.forge.meta[id] && TREES.forge.meta[id].val !== undefined) return TREES.forge.meta[id].val;
        return fallback;
    };

    state.history.forEach(h => { 
        const stepDuration = (h.type === 'delay' ? h.mins : h.added); 
        runningTimeOffset += stepDuration; 
        if (h.tree === 'forge' && h.id) { 
            if (h.id.includes('timer')) {
                techSchedule.push({ type: 'speed', time: planStartMs + (runningTimeOffset * 60000), val: getVal('timer', 2) }); 
            } else if (h.id.includes('disc')) {
                techSchedule.push({ type: 'disc', time: planStartMs + (runningTimeOffset * 60000), val: getVal('disc', 1) }); 
            }
        } 
    });

    // ==========================================
    // 3rd CARD: HAMMER YIELD & GOLD CALC
    // ==========================================
    let effH1 = hIn / (1 - curStats.free / 100); 
    let effH2 = hIn / (1 - projStats.free / 100);
    
    let h1 = genLine('Effective Hammer', effH1, effH2, 'fm_hammer', 'hammer');
    h1 += genLine('Gold', effH1 * curStats.avgGold, effH2 * projStats.avgGold, 'fm_gold', 'gold');
    
    let yieldHtml = `<div style="margin-top: 15px; padding-top: 5px;">
                        <div style="font-family: 'Fredoka', sans-serif; font-weight: 600 !important; letter-spacing: 0.5px; font-size: 1rem; text-align: center; margin-bottom: 10px; color: #000000; -webkit-text-stroke: 0px #7f8c8d; paint-order: stroke fill;">Expected Item Yield</div>`;    
    
    const rates = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES[fLv] || CALC_FORGE_RATES[1] : [];
    const TIER_NAMES = ["Primitive", "Medieval", "Early-Modern", "Modern", "Space", "Interstellar", "Multiverse", "Quantum", "Underworld", "Divine"];
    const TIER_COLORS = ['#f1f2f6', '#5cd8fe', '#5dfe8a', '#fcfe5d', '#ff5c5d', '#d55cff', '#74feee', '#7d5eff', '#b07879', '#fe9e0c'];
    
    for (let i = 0; i < 10; i++) {
        if (rates[i] > 0) {
            const amountB = effH1 * (rates[i] / 100);
            const amountA = effH2 * (rates[i] / 100);
            
            yieldHtml += `<div class="calc-line" style="background-color: ${TIER_COLORS[i]}; border-radius: 6px; padding: 4px 8px; margin-bottom: 4px; border-bottom: none; color: #000;">
                <div class="calc-label" style="color: #000;">${TIER_NAMES[i]}</div>
                ${renderForgeGroup(amountB, amountA, null, 'yield')}
            </div>`;
        }
    }
    yieldHtml += `</div>`;
    const res1 = document.getElementById('calc-res-1'); 
    if (res1) res1.innerHTML = h1 + yieldHtml;
    
    // ==========================================
    // 4th CARD: TARGET GOLD CALC
    // ==========================================
    const res2 = document.getElementById('calc-res-2');
    if (res2) res2.innerHTML = genLine('Hammer Needed', gTarget / curStats.avgGold * (1 - curStats.free / 100), gTarget / projStats.avgGold * (1 - projStats.free / 100), 'fm_hammer', 'hammer');
    
    // ==========================================
    // 1st & 2nd CARDS: FORGE UPGRADES
    // ==========================================
    const res5 = document.getElementById('calc-res-5');
    const resTarget = document.getElementById('calc-res-target-forge');

    let useSnapshot = false;
    if (window.ongoingForgeSnapshot && 
        window.ongoingForgeSnapshot.startDate === sDateVal && 
        window.ongoingForgeSnapshot.startAsc === fAsc && 
        window.ongoingForgeSnapshot.startLv === fLv) {
        useSnapshot = true;
    } else {
        window.ongoingForgeSnapshot = null;
    }

    if (fAsc === 3 && fLv === 35) {
        let h5 = genLine('Cost', '-', '-', 'fm_gold', 'standard');
        h5 += genLine('Finish', '-', '-', null, 'standard');
        h5 += genLine('Duration', '-', '-', null, 'standard');
        if (res5) res5.innerHTML = h5;
    } else if (fLv === 35) {
        let h5 = genLine('Cost', 3000000, 3000000, 'fm_gold', 'gold');
        h5 += genLine('Finish', '-', '-', null, 'standard');
        h5 += genLine('Duration', 0, 0, null, 'time'); 
        if (res5) res5.innerHTML = h5;
    } else {
        const cRaw = forgeLevelData[fLv][0];
        const baseMins = forgeLevelData[fLv][1] * 60;
        
        let costB, costA, f1, f2, dFinish, dFinishProj;

        if (useSnapshot) {
            costB = window.ongoingForgeSnapshot.costCur;
            costA = window.ongoingForgeSnapshot.costProj;
            f1 = window.ongoingForgeSnapshot.minsCur;
            f2 = window.ongoingForgeSnapshot.minsProj;
            dFinish = new Date(window.ongoingForgeSnapshot.finishTimeCur);
            dFinishProj = new Date(window.ongoingForgeSnapshot.finishTimeProj);
        } else {
            let speedBonusAtStart = curStats.speed; 
            let discBonusAtStart = curStats.forgeDisc;
            techSchedule.forEach(t => { 
                if (t.time <= mainStartTime) {
                    if (t.type === 'speed') speedBonusAtStart += t.val; 
                    if (t.type === 'disc') discBonusAtStart += t.val;
                }
            });

            costB = Math.round(cRaw * (1 - curStats.forgeDisc / 100));
            costA = Math.round(cRaw * (1 - discBonusAtStart / 100));
            f1 = baseMins / (1 + curStats.speed / 100); 
            f2 = baseMins / (1 + speedBonusAtStart / 100);
            dFinish = new Date(mainStartTime + f1 * 60000); 
            dFinishProj = new Date(mainStartTime + f2 * 60000);
        }

        let h5 = genLine('Cost', costB, costA, 'fm_gold', 'gold');
        h5 += `<div class="calc-line"><div class="calc-label">Finish</div>${renderForgeGroup(formatDT(dFinish), formatDT(dFinishProj), null, 'date')}</div>`;
        h5 += genLine('Duration', f1, f2, null, 'time');
        if (res5) res5.innerHTML = h5;
    }

    if (fAsc === 3 && fLv === 35) {
        let hTarget = genLine('Total Cost', '-', '-', 'fm_gold', 'standard');
        hTarget += genLine('Finish', '-', '-', null, 'standard');
        hTarget += genLine('Total Duration', '-', '-', null, 'standard');
        hTarget += genLine('Total Gem', '-', '-', null, 'standard');
        if (resTarget) resTarget.innerHTML = hTarget;
    } else {
        const tAscEl = document.getElementById('calc-target-forge-asc');
        const tLvEl = document.getElementById('calc-target-forge-lv');
        
        const tAscRaw = tAscEl ? parseInt(tAscEl.value) : fAsc;
        const tLvRaw = tLvEl ? tLvEl.value : (fLv + 1);
        const isAscendTarget = tLvRaw === "Ascend";
        
        const tAsc = isNaN(tAscRaw) ? fAsc : tAscRaw;
        const endLv = isAscendTarget ? 35 : (parseInt(tLvRaw) || (fLv + 1));

        let totalCostCur = 0, totalCostProj = 0;
        let totalMinsCur = 0, totalMinsProj = 0;
        let totalGemsCur = 0, totalGemsProj = 0;

        let cAsc = fAsc, cLv = fLv;
        let currentTimeCur = mainStartTime;
        let currentTimeProj = mainStartTime;

        window.currentForgeSchedule = [];

        while (cAsc < tAsc || (cAsc === tAsc && cLv < endLv)) {
            if (cLv === 35) {
                totalCostCur += 3000000;
                totalCostProj += 3000000;
                
                window.currentForgeSchedule.push({
                    label: `Ascension (Asc ${cAsc} ➜ ${cAsc + 1})`,
                    finish: currentTimeProj,
                    isAscension: true
                });
                
                cAsc++;
                cLv = 1;
            } else {
                if (forgeLevelData[cLv]) {
                    const baseCost = forgeLevelData[cLv][0];
                    const baseMins = forgeLevelData[cLv][1] * 60;
                    
                    let activeProjSpeed = curStats.speed;
                    let activeProjDisc = curStats.forgeDisc;
                    techSchedule.forEach(t => { 
                        if (t.time <= currentTimeProj) {
                            if (t.type === 'speed') activeProjSpeed += t.val;
                            if (t.type === 'disc') activeProjDisc += t.val;
                        }
                    });

                    if (cAsc === fAsc && cLv === fLv && useSnapshot) {
                        currentTimeProj = window.ongoingForgeSnapshot.finishTimeProj;
                        currentTimeCur = window.ongoingForgeSnapshot.finishTimeCur;
                        
                        totalCostCur += window.ongoingForgeSnapshot.costCur;
                        totalCostProj += window.ongoingForgeSnapshot.costProj;
                        
                        totalMinsCur += window.ongoingForgeSnapshot.minsCur;
                        totalMinsProj += window.ongoingForgeSnapshot.minsProj;
                        
                        totalGemsCur += Math.round(window.ongoingForgeSnapshot.minsCur / 7.24643);
                        totalGemsProj += Math.round(window.ongoingForgeSnapshot.minsProj / 7.24643);

                        window.currentForgeSchedule.push({
                            label: `Asc ${cAsc} | Lv ${cLv} ➜ ${cLv + 1}`,
                            finish: currentTimeProj,
                            isAscension: false
                        });
                        cLv++;
                        continue; 
                    }

                    let stepCostCur = Math.round(baseCost * (1 - curStats.forgeDisc / 100));
                    let stepCostProj = Math.round(baseCost * (1 - activeProjDisc / 100));
                    
                    totalCostCur += stepCostCur;
                    totalCostProj += stepCostProj;

                    const curLvlMins = baseMins / (1 + curStats.speed / 100);
                    currentTimeCur += curLvlMins * 60000;
                    totalMinsCur += curLvlMins;
                    
                    const projLvlMins = baseMins / (1 + activeProjSpeed / 100);
                    currentTimeProj += projLvlMins * 60000;
                    totalMinsProj += projLvlMins;
                    
                    totalGemsCur += Math.round(curLvlMins / 7.24643);
                    totalGemsProj += Math.round(projLvlMins / 7.24643);

                    window.currentForgeSchedule.push({
                        label: `Asc ${cAsc} | Lv ${cLv} ➜ ${cLv + 1}`,
                        finish: currentTimeProj,
                        isAscension: false
                    });
                    
                    if (cAsc === fAsc && cLv === fLv && !useSnapshot) {
                        window.ongoingForgeSnapshot = {
                            startDate: sDateVal,
                            startAsc: fAsc,
                            startLv: fLv,
                            finishTimeProj: currentTimeProj,
                            finishTimeCur: currentTimeCur,
                            costProj: stepCostProj,
                            costCur: stepCostCur,
                            minsProj: projLvlMins,
                            minsCur: curLvlMins
                        };
                    }
                }
                cLv++;
            }
        }

        if (isAscendTarget && cAsc === tAsc && cLv === 35) {
            totalCostCur += 3000000;
            totalCostProj += 3000000;
            window.currentForgeSchedule.push({
                label: `Ascension (Asc ${cAsc} ➜ ${cAsc + 1})`,
                finish: currentTimeProj,
                isAscension: true
            });
        }

        let finishLabel = 'Finish';
        if (window.currentForgeSchedule && window.currentForgeSchedule.length > 1) {
            finishLabel += ' <button class="btn-info" onclick="openForgeScheduleModal()" style="vertical-align: middle; margin-left: 6px;">i</button>';
        }
        
        let hTarget = genLine('Total Cost', totalCostCur, totalCostProj, 'fm_gold', 'gold');
        hTarget += genLine(finishLabel, formatDT(new Date(currentTimeCur)), formatDT(new Date(currentTimeProj)), null, 'date');
        hTarget += genLine('Total Duration', totalMinsCur, totalMinsProj, null, 'time');
        hTarget += genLine('Total Gem', totalGemsCur, totalGemsProj, null, 'number');
        
        if (resTarget) resTarget.innerHTML = hTarget;
    }

    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function initCalcDateSelectors() {
}

function updateCalcFromDropdowns() { updateFromDropdowns('calc'); }
function syncCalcMobileDate(isoStr) { if(!isoStr) return; const d = new Date(isoStr); const mSel = document.getElementById('cm-month'); if(mSel) { mSel.value = d.getMonth() + 1; document.getElementById('cm-day').value = d.getDate(); document.getElementById('cm-hour').value = d.getHours(); document.getElementById('cm-min').value = d.getMinutes(); } }

// ==========================================
// 3. EGG PLANNER
// ==========================================

let eggPlanQueue = []; let eggInsertIdx = -1; let expandedEggIdx = -1;
let eggHistoryStack = []; let eggRedoStack = [];

function captureEggState() { return { queue: JSON.parse(JSON.stringify(eggPlanQueue)), start: document.getElementById('egg-date-desktop').value }; }
function pushEggHistory() { if (eggHistoryStack.length > 50) eggHistoryStack.shift(); eggHistoryStack.push(captureEggState()); eggRedoStack = []; updateEggUndoButtons(); }
function undoEgg() { if (eggHistoryStack.length === 0) return; eggRedoStack.push(captureEggState()); const state = eggHistoryStack.pop(); eggPlanQueue = state.queue; if (state.start) syncEggDate(state.start, false); renderEggLog(); updateEggUndoButtons(); if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); }
function redoEgg() { if (eggRedoStack.length === 0) return; eggHistoryStack.push(captureEggState()); const state = eggRedoStack.pop(); eggPlanQueue = state.queue; if (state.start) syncEggDate(state.start, false); renderEggLog(); updateEggUndoButtons(); if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); }
function updateEggUndoButtons() {
    const hasH = eggHistoryStack.length > 0; const hasR = eggRedoStack.length > 0;
    const upd = (id, on) => { const el = document.getElementById(id); if (el) { el.disabled = !on; el.style.opacity = !on ? "0.3" : "1"; el.style.pointerEvents = !on ? "none" : "auto"; } };
    ['btn-undo-egg', 'btn-undo-mobile-egg'].forEach(id => upd(id, hasH));
    ['btn-redo-egg', 'btn-redo-mobile-egg'].forEach(id => upd(id, hasR));
}

function populateEggDropdowns() { populateDateDropdowns(); }
function getEggSpeedAtTime(techIdSuffix, targetTimeMs) {
    let totalLvl = 0; for (let t = 1; t <= 5; t++) { totalLvl += (setupLevels[`spt_T${t}_${techIdSuffix}`] || 0); }
    let mainStartTime = new Date(document.getElementById('start-date').value).getTime();
    let techState = calcState(); let runningTimeOffset = 0;
    techState.history.forEach(h => { let stepDuration = (h.type === 'delay' ? h.mins : h.added); runningTimeOffset += stepDuration; if (h.id && h.id.endsWith(techIdSuffix)) { let techFinishTime = mainStartTime + (runningTimeOffset * 60000); if (techFinishTime <= targetTimeMs) totalLvl++; } });
    return totalLvl;
}

function activateEggInsert(idx) { 
    eggInsertIdx = idx + 1; 
    expandedEggIdx = -1; 
    
    const eggBox = document.getElementById('egg-selector-box');
    if (eggBox) eggBox.classList.add('egg-insert-active'); 
    
    const capEgg = document.getElementById('capsule-egg');
    if (capEgg) {
        capEgg.classList.add('is-inserting');
        if (!capEgg.querySelector('.floating-cancel-btn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn-move-action floating-cancel-btn';
            cancelBtn.onclick = (e) => { e.stopPropagation(); cancelEggInsert(); };
            cancelBtn.innerHTML = '<img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL';
            capEgg.appendChild(cancelBtn);
        }
    }

    const floatEgg = document.getElementById('float-egg');
    if (floatEgg) {
        floatEgg.classList.add('is-inserting');
        const floatCap = floatEgg.querySelector('.control-capsule');
        if (floatCap && !floatCap.querySelector('.floating-cancel-btn')) {
            const cancelBtnMobile = document.createElement('button');
            cancelBtnMobile.className = 'btn-move-action floating-cancel-btn';
            cancelBtnMobile.onclick = (e) => { e.stopPropagation(); cancelEggInsert(); };
            cancelBtnMobile.innerHTML = '<img src="icons/icon_cancel.png" class="btn-icon" style="width:16px; height:16px; margin-right:6px; display:block; filter:none;"> CANCEL';
            floatCap.appendChild(cancelBtnMobile);
        }
    }

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
    
    renderEggLog();
}

function toggleEggExp(i) { expandedEggIdx = expandedEggIdx === i ? -1 : i; renderEggLog(); }

function renderEggLog() {
    try {
        const list = document.getElementById('egg-log-list'); 
        if (!list) return;
        
        const dateInput = document.getElementById('egg-date-desktop'); 
        if (!dateInput || !dateInput.value) return;

        const fragment = document.createDocumentFragment();
        let curTime = new Date(dateInput.value).getTime(); 
        let totalQueueMins = 0; let totalPoints = 0;
        
        eggPlanQueue.forEach((item, idx) => {
            const div = document.createElement('div');
            if (item.type === 'delay') {
                totalQueueMins += item.mins; curTime += item.mins * 60000;
                const finishDate = new Date(curTime); const timeStr = finishDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                div.className = `log-row ${expandedEggIdx === idx ? 'expanded' : ''}`;
                div.innerHTML = `<div class="log-entry delay" onclick="toggleEggExp(${idx})"><div class="log-left-group"><div class="log-icon-wrapper desktop-only" style="align-items: center; justify-content: center; height: 44px;"><span style="font-size:1.8em; line-height:1;">💤</span></div><div class="log-name">Delay (+${item.mins}m)</div></div><div class="log-right-group"><div class="log-time" style="color:#ccc">${timeStr}</div></div></div><div class="log-controls"><button class="btn-game-ctrl btn-del" onclick="event.stopPropagation(); deleteEggStep(${idx})">DEL</button></div>`;
            } else {
                const data = EGG_DATA[item.key]; 
                
                if (!data) {
                    console.warn(`Egg Data missing for key: ${item.key}. Skipping row.`);
                    return; 
                }

                const pts = EGG_POINTS[item.key] || 0; 
                totalPoints += pts;
                
                const techLvl = getEggSpeedAtTime(data.id, curTime); 
                const speedMult = 1 + (techLvl * 0.1); 
                const finalMins = data.t / speedMult;
                
                totalQueueMins += finalMins; curTime += finalMins * 60000;
                const finishDate = new Date(curTime); const finishTs = finishDate.getTime(); 
                const timeStr = finishDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) + ', ' + finishDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
                
                div.className = `log-row ${expandedEggIdx === idx ? 'expanded' : ''}`;
                const detailsHtml = `<div class="log-details"><div class="ld-part pot"><img src="icons/warpoint.png" class="ld-icon"><span>${pts.toLocaleString('en-US')}</span></div><div class="ld-part time" style="width: auto;"><img src="icons/icon_time.png" class="ld-icon"><span>${formatEggTime(finalMins)}</span></div></div>`;

                div.innerHTML = `<div class="log-entry ${data.c}" onclick="toggleEggExp(${idx})"><div class="log-left-group"><div class="log-icon-wrapper"><img src="${data.img}" style="width: 44px; height: 44px; object-fit: contain; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.3));" onerror="this.style.display='none'"></div><div class="log-name">${data.n}</div> </div><div class="log-right-group"><div class="log-time">${timeStr}</div>${detailsHtml}</div></div><div class="log-controls"><button class="btn-game-ctrl btn-done" onclick="event.stopPropagation(); markEggDone(${idx}, ${finishTs})">DONE</button><button class="btn-game-ctrl btn-delay" onclick="event.stopPropagation(); addEggDelay(${idx})">DELAY</button><button class="btn-game-ctrl btn-insert" onclick="event.stopPropagation(); activateEggInsert(${idx})">INSERT</button><button class="btn-game-ctrl btn-del" onclick="event.stopPropagation(); deleteEggStep(${idx})">DELETE</button></div>`;
            }
            fragment.appendChild(div);
        });

        list.innerHTML = '';
        list.appendChild(fragment);

        const summaryBox = document.getElementById('egg-total-summary');
        if (summaryBox) {
            summaryBox.className = 'egg-stats-row'; 
            summaryBox.innerHTML = `<div class="es-item type-points"><span class="es-value points">${totalPoints.toLocaleString('en-US')}</span></div><div class="es-item type-time"><span class="es-value time">${formatEggTime(totalQueueMins)}</span></div>`;
        }
    } catch (err) {
        console.error("CRITICAL: Egg Planner crashed during rendering. The UI was protected.", err);
    }
}

function addEggToQueue(type) { 
    pushEggHistory(); 
    const item = { type: 'egg', key: type }; 
    
    if (eggInsertIdx > -1) { 
        eggPlanQueue.splice(eggInsertIdx, 0, item); 
        eggInsertIdx = -1; 
        
        const eggBox = document.getElementById('egg-selector-box');
        if (eggBox) eggBox.classList.remove('egg-insert-active'); 
        
        const capEgg = document.getElementById('capsule-egg');
        if (capEgg) capEgg.classList.remove('is-inserting');
        
        const floatEgg = document.getElementById('float-egg');
        if (floatEgg) floatEgg.classList.remove('is-inserting');
        
    } else { 
        eggPlanQueue.push(item); 
    } 
    
    renderEggLog(); 
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
}

function markEggDone(idx, timestamp) { 
    try { 
        pushEggHistory(); 
        eggPlanQueue.splice(0, idx + 1); 
        
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
    openPromptModal("Enter delay in MINUTES:", (m) => {
        if (m && !isNaN(parseFloat(m))) { 
            pushEggHistory(); 
            eggPlanQueue.splice(idx + 1, 0, { type: 'delay', mins: parseFloat(m) }); 
            expandedEggIdx = -1; 
            renderEggLog(); 
            if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
        } 
    });
}
function deleteEggStep(idx) { 
    pushEggHistory(); 
    eggPlanQueue.splice(idx, 1); 
    renderEggLog(); 
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
}

function clearEggPlan() { 
    openConfirmModal("Clear Egg list?", () => {
        pushEggHistory(); 
        eggPlanQueue = []; 
        renderEggLog(); 
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 
    });
}