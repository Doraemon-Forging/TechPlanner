/**
 * SUMMON.JS
 * Core Logic for the Summon Calc Tab (Skills, Pets, Mounts)
 */

// ==========================================
// 0. UNIVERSAL CONFIGURATION
// ==========================================

const SUMMON_CONFIG = {
    skill: {
        db: typeof SKILL_LEVEL_DATA !== 'undefined' ? SKILL_LEVEL_DATA : null,
        baseCost: 200,
        costRoundMode: 'round',
        yieldPerPull: 5,
        techPrefix: 'spt',
        techCostKey: 'ticket',
        techChanceKey: null,    
        chanceMult: 0,
        icon: 'green_ticket.png',
        itemName: 'Skills',
        resName: 'Green Tickets',
        globalMilestoneKey: 'DYNAMIC_SKILL_MILESTONES'
    },
    pet: {
        db: typeof PET_LEVEL_DATA !== 'undefined' ? PET_LEVEL_DATA : null,
        baseCost: 100,
        costRoundMode: 'round',
        yieldPerPull: 1,
        techPrefix: 'spt',
        techCostKey: null,
        techChanceKey: 'lucky',
        chanceMult: 2,
        icon: 'eggshell.png',
        itemName: 'Eggs',
        resName: 'Eggshells',
        globalMilestoneKey: 'DYNAMIC_PET_MILESTONES'
    },
    mount: {
        db: typeof MOUNT_LEVEL_DATA !== 'undefined' ? MOUNT_LEVEL_DATA : null,
        baseCost: 50,
        costRoundMode: 'ceil',
        yieldPerPull: 1,
        techPrefix: 'power',
        techCostKey: 'mount_cost',
        techChanceKey: 'mount_chance',
        chanceMult: 2,
        icon: 'mount_key.png',
        itemName: 'Mounts',
        resName: 'Mount Keys',
        globalMilestoneKey: 'DYNAMIC_MOUNT_MILESTONES'
    }
};

// ==========================================
// 1. NAVIGATION & UI
// ==========================================
function toggleSummonTab(tabId) {
    ['skill', 'pet', 'mount'].forEach(t => {
        const btn = document.getElementById(`btn-toggle-sum-${t}`);
        if(btn) btn.classList.remove('active');
        const view = document.getElementById(`view-summon-${t}`);
        if(view) view.style.display = 'none';
    });
    
    document.getElementById(`btn-toggle-sum-${tabId}`).classList.add('active');
    document.getElementById(`view-summon-${tabId}`).style.display = 'block';
    
    updateSummonCap(tabId);
    updateSummonCalc(tabId);
}

function updateSummonCap(type) {
    const lvEl = document.getElementById(`sum-${type}-lvl`);
    const expEl = document.getElementById(`sum-${type}-exp`);
    const maxEl = document.getElementById(`sum-${type}-max`);
    
    if (!lvEl || !maxEl || !expEl) return;
    
    let lv = parseInt(lvEl.value) || 1;
    if (lv < 1) lv = 1;
    if (lv > 100) lv = 100; 
    
    let maxExp = 0;
    const database = SUMMON_CONFIG[type].db;
    
    if (database && database[lv]) maxExp = database[lv][0];
    
    if (maxExp === "MAX" || maxExp === 0) {
        maxEl.innerText = "MAX";
        expEl.value = 0;
        expEl.disabled = true;
    } else {
        maxEl.innerText = maxExp.toLocaleString();
        expEl.disabled = false;
        let currentExp = parseFloat(expEl.value) || 0;
        if (currentExp >= maxExp) expEl.value = maxExp - 1; 
    }
}

// ==========================================
// 2. CORE MATH ENGINE
// ==========================================
function validateProbability(el) {
    let val = parseFloat(el.value);
    if (val > 99) el.value = 99;
    if (val < 1) el.value = 1;
}

function getCumulativePulls(level, exp, dataTable) {
    if (!dataTable) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
        if (dataTable[i] && dataTable[i][0] !== "MAX") total += dataTable[i][0];
    }
    return total + exp;
}

function getLevelFromCumulative(totalPulls, dataTable) {
    if (!dataTable) return { level: 1, exp: 0, maxExp: 0 };
    let lvl = 1;
    let exp = totalPulls;
    
    while (dataTable[lvl] && dataTable[lvl][0] !== "MAX") {
        let maxExp = dataTable[lvl][0];
        if (exp >= maxExp) {
            exp -= maxExp;
            lvl++;
        } else {
            return { level: lvl, exp: exp, maxExp: maxExp };
        }
    }
    return { level: lvl, exp: exp, maxExp: "MAX" };
}

// ==========================================
// 3. THE UNIVERSAL CALCULATOR
// ==========================================
function updateSummonCalc(type) {
    const config = SUMMON_CONFIG[type];
    if (!config || !config.db) return;

    const lvInput = parseInt(document.getElementById(`sum-${type}-lvl`).value) || 1;
    const expInput = parseFloat(document.getElementById(`sum-${type}-exp`).value.replace(/,/g, '')) || 0;
    const resInput = parseFloat(document.getElementById(`sum-${type}-res`).value.replace(/,/g, '')) || 0;
    const targetLvInput = parseInt(document.getElementById(`sum-${type}-target-lv`)?.value) || 0;

    // --- 1. Tech Modifiers ---
    let curCostLv = 0, planCostLv = 0, curChanceLv = 0, planChanceLv = 0;

    if (typeof setupLevels !== 'undefined') {
        for(let t=1; t<=5; t++) {
            if (config.techCostKey) curCostLv += (setupLevels[`${config.techPrefix}_T${t}_${config.techCostKey}`] || 0);
            if (config.techChanceKey) curChanceLv += (setupLevels[`${config.techPrefix}_T${t}_${config.techChanceKey}`] || 0);
        }
    }
    planCostLv = curCostLv;
    planChanceLv = curChanceLv;

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            planCostLv = 0; planChanceLv = 0;
            for(let t=1; t<=5; t++) {
                if (config.techCostKey) planCostLv += (state.levels[`${config.techPrefix}_T${t}_${config.techCostKey}`] || 0);
                if (config.techChanceKey) planChanceLv += (state.levels[`${config.techPrefix}_T${t}_${config.techChanceKey}`] || 0);
            }
        }
    }

    // --- 2. Cost and Yield Math ---
    const calcCost = (lv) => {
        if (!config.techCostKey) return config.baseCost;
        let mult = config.baseCost * (1 - (lv * 1) / 100);
        return config.costRoundMode === 'ceil' ? Math.max(1, Math.ceil(mult)) : Math.max(1, Math.round(mult));
    };

    const costB = calcCost(curCostLv);
    const costA = calcCost(planCostLv);

    const extraChanceB = config.techChanceKey ? (curChanceLv * config.chanceMult) / 100 : 0;
    const extraChanceA = config.techChanceKey ? (planChanceLv * config.chanceMult) / 100 : 0;

    const pullsB = Math.floor(resInput / costB);
    const pullsA = Math.floor(resInput / costA);

    const yieldB = pullsB * config.yieldPerPull * (1 + extraChanceB);
    const yieldA = pullsA * config.yieldPerPull * (1 + extraChanceA);

    // --- 3. Cumulative Exp Engine ---
    const baseCumulative = getCumulativePulls(lvInput, expInput, config.db);
    const totalCumB = baseCumulative + yieldB;
    const totalCumA = baseCumulative + yieldA;

    const projB = getLevelFromCumulative(totalCumB, config.db);
    const projA = getLevelFromCumulative(totalCumA, config.db);

    // --- 4. Render Updates ---
    const isMobile = window.innerWidth <= 768;
    renderHeader(type, projB, projA, isMobile);
    renderMilestones(type, config, totalCumB, totalCumA, costB, costA, extraChanceB, extraChanceA, isMobile, targetLvInput);
    
    if(document.getElementById(`sum-${type}-yield-container`)) {
        calculateUniversalYieldTable(type, config, lvInput, expInput, yieldB, yieldA, costB, costA, extraChanceB, extraChanceA, projB, projA, isMobile);
    }
}

// ==========================================
// 4. RENDERING HELPERS
// ==========================================
function renderHeader(type, projB, projA, isMobile) {
    const lvParent = document.getElementById(`sum-${type}-res-lv`)?.parentElement;
    if(lvParent) {
        lvParent.style.backgroundColor = '#e4e4e4';
        lvParent.style.padding = '12px 15px';
        lvParent.style.borderRadius = '8px';
        lvParent.style.border = '1px solid rgba(0,0,0,0.05)';
        lvParent.style.display = 'flex';
        lvParent.style.justifyContent = 'space-between';
        lvParent.style.alignItems = 'center';
        lvParent.style.gap = '10px';
        if (lvParent.children.length > 0) {
            lvParent.children[0].style.whiteSpace = 'nowrap';
            lvParent.children[0].style.flex = '0 0 auto';
        }
    }

    const resLvContainer = document.getElementById(`sum-${type}-res-lv`);
    resLvContainer.style.flex = '1 1 auto';
    resLvContainer.style.display = 'flex';
    resLvContainer.style.justifyContent = 'flex-end';

    const lvFontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000; font-size: 0.95rem;";
    const lvExpStyle = "font-size: 0.85em; font-weight: 500; color: #000;";

    const formatExp = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const getLevelText = (proj) => {
        if (proj.maxExp === "MAX") return `Lv ${proj.level} <span style="${lvExpStyle}">(MAX)</span>`;
        return `Lv ${proj.level} <span style="${lvExpStyle}">(${formatExp(proj.exp)} / ${proj.maxExp.toLocaleString()})</span>`;
    };

    let levelHtml = "";
    const valB = `<span style="${lvFontStyle}">${getLevelText(projB)}</span>`;
    const valA = `<span style="${lvFontStyle}">${getLevelText(projA)}</span>`;
    const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 0.95rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

    if (projB.maxExp === "MAX" || (projB.level === projA.level && formatExp(projB.exp) === formatExp(projA.exp))) {
        levelHtml = valB;
    } else {
        levelHtml = isMobile 
            ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display:flex; align-items:center; white-space: nowrap;">${arrow}${valA}</div></div>`
            : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${valA}</div></div>`;
    }
    resLvContainer.innerHTML = levelHtml;
}

function getDynamicMilestones(type, config) {
    if (window[config.globalMilestoneKey]) return window[config.globalMilestoneKey];
    if (!config.db) return [];

    const dynamicMilestones = [
        { name: "Rare", index: 2, color: "#5cd8fe", targetLv: 0 },
        { name: "Epic", index: 3, color: "#5dfe8a", targetLv: 0 },
        { name: "Legendary", index: 4, color: "#fcfe5d", targetLv: 0 },
        { name: "Ultimate", index: 5, color: "#ff5c5d", targetLv: 0 },
        { name: "Mythic", index: 6, color: "#d55cff", targetLv: 0 },
        { name: "Max", index: null, color: "#fe9e0c", targetLv: 100 } 
    ];

    for (let level = 1; level <= 100; level++) {
        let levelData = config.db[level];
        if (!levelData) continue;
        dynamicMilestones.forEach(m => {
            if (m.index !== null && m.targetLv === 0 && levelData[m.index] > 0) m.targetLv = level; 
        });
    }
    window[config.globalMilestoneKey] = dynamicMilestones;
    return dynamicMilestones;
}

function renderMilestones(type, config, totalCumB, totalCumA, costB, costA, extraB, extraA, isMobile, targetLvInput) {
    const baseMilestones = getDynamicMilestones(type, config);
    let milestones = [...baseMilestones];

    if (targetLvInput > 0) {
        milestones.push({
            name: "Target",
            index: 'custom', 
            color: "#e4e4e4", 
            targetLv: targetLvInput,
            isTarget: true 
        });
    }

    milestones.sort((a, b) => {
        if (a.targetLv !== b.targetLv) {
            return a.targetLv - b.targetLv;
        }
        if (a.isTarget) return -1;
        if (b.isTarget) return 1;
        return 0;
    });

    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const keyIcon = `<img src="icons/${config.icon}" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    let html = `
    <div style="text-align: center; margin: 5px 0 15px 0; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; -webkit-text-stroke: 0px; line-height: 1.3;">
        ${config.itemName} and ${config.resName} needed to have a chance of summoning higher tier ${type}s for the first time
    </div>`;

    const calcNeeds = (unlocked, targetCum, curCum, cost, extra) => {
        if (unlocked) return { items: 0, res: 0 };
        let expNeeded = targetCum - curCum;
        let itemsNeeded = type === 'skill' ? Math.max(0, Math.ceil(expNeeded)) : Math.ceil(expNeeded);
        let pullsNeeded = Math.ceil((type === 'skill' ? itemsNeeded / 5 : expNeeded) / (1 + extra));
        return { items: itemsNeeded, res: pullsNeeded * cost };
    };

    const buildStatus = (unlocked, items, res) => {
        if (unlocked) return `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
        let fmtRes = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(res) : res.toLocaleString();
        return `
        <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
            <span style="${fontStyle} font-weight: 600; color: #000;">${items.toLocaleString()}</span>
            <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${fmtRes})</span>
        </div>`;
    };

    const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

    milestones.forEach(m => {
        const targetCum = getCumulativePulls(m.targetLv, 0, config.db);
        const unlockedB = totalCumB >= targetCum;
        const unlockedA = totalCumA >= targetCum;

        const needsB = calcNeeds(unlockedB, targetCum, totalCumB, costB, extraB);
        const needsA = calcNeeds(unlockedA, targetCum, totalCumA, costA, extraA);

        let statusHtml = '';
        if (unlockedB && unlockedA) {
            statusHtml = `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
        } else if (needsB.items === needsA.items && needsB.res === needsA.res) {
            statusHtml = buildStatus(unlockedB, needsB.items, needsB.res);
        } else {
            const statB = buildStatus(unlockedB, needsB.items, needsB.res);
            const statA = buildStatus(unlockedA, needsA.items, needsA.res);
            statusHtml = isMobile 
                ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;"><div style="white-space: nowrap;">${statB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrow}${statA}</div></div>`
                : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${statB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${statA}</div></div>`;
        }

        const borderStyle = m.isTarget ? 'border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 2px 4px rgba(0,0,0,0.05);' : 'border: 1px solid transparent;';

        html += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; ${borderStyle}">
            <div style="flex: 0 0 25%; max-width: 30%; text-align: left; line-height: 1.2;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${m.name}</span>
                <span style="${fontStyle} font-size:0.8rem; font-weight:500; color: #000; display: inline-block;">(Lv ${m.targetLv})</span>
            </div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${statusHtml}</div>
        </div>`;
    });

    let absoluteMaxExp = 0;
    for (let i = 1; i < 100; i++) {
        if (config.db[i] && config.db[i][0] !== "MAX") absoluteMaxExp += config.db[i][0]; else break; 
    }
    if(absoluteMaxExp === 0) absoluteMaxExp = 1; 

    let pctB = (totalCumB / absoluteMaxExp) * 100;
    let pctA = (totalCumA / absoluteMaxExp) * 100;

    const formatExp = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    html += `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px;">Progress to Max Level</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${Math.min(pctB, 100)}%;"></div>
                <div class="pet-progress-text">${formatExp(totalCumB)} / ${absoluteMaxExp.toLocaleString()} xp (${pctB.toFixed(1)}%)</div>
            </div>`;

    if (formatExp(totalCumB) !== formatExp(totalCumA)) {
        html += `
            <div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${Math.min(pctA, 100)}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${formatExp(totalCumA)} / ${absoluteMaxExp.toLocaleString()} xp (${pctA.toFixed(1)}%)</div>
            </div>`;
    }
    html += `</div>`;
    document.getElementById(`sum-${type}-milestones-container`).innerHTML = html;
}

// ==========================================
// 5. YIELD & PITY CALCULATOR
// ==========================================
function calculateUniversalYieldTable(type, config, sLv, sExp, yieldB, yieldA, costB, costA, extraB, extraA, projB, projA, isMobile) {
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";

    const formatTotal = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const formatYieldRow = (val) => {
        if (!val || val === 0) return "0";
        if (val < 10) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const totalYieldParent = document.getElementById(`sum-${type}-total-yield`)?.parentElement;
    if(totalYieldParent) totalYieldParent.style.backgroundColor = '#e4e4e4';

    let totalYieldHtml = `<span style="${fontStyle}">${formatTotal(yieldB)}</span>`;
    if (formatTotal(yieldB) !== formatTotal(yieldA)) {
        const vB = `<span style="${fontStyle}">${formatTotal(yieldB)}</span>`;
        const vA = `<span style="${fontStyle} color: #000;">${formatTotal(yieldA)}</span>`;
        totalYieldHtml = isMobile 
            ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${vB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${vA}</div></div>`
            : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${vB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${vA}</div></div>`;
    }
    document.getElementById(`sum-${type}-total-yield`).innerHTML = totalYieldHtml;

    const getExpected = (simLv, simExp, remaining) => {
        let expected = [0, 0, 0, 0, 0, 0];
        while (remaining > 0) {
            let levelData = config.db[simLv] || config.db[100];
            let maxExp = levelData[0];
            if (maxExp === "MAX") {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
            let expNeeded = maxExp - simExp;
            let applied = remaining >= expNeeded ? expNeeded : remaining;
            for (let i = 0; i < 6; i++) expected[i] += applied * (levelData[i + 1] / 100);
            remaining -= applied;
            if(remaining > 0) { simLv++; simExp = 0; }
        }
        return expected;
    };

    let expBefore = getExpected(sLv, sExp, yieldB);
    let expAfter = getExpected(sLv, sExp, yieldA);

    let targetProb = parseFloat(document.getElementById(`sum-${type}-prob`).value) || 90;
    let targetFail = 1 - (targetProb / 100);

    const getPity = (cLv, cExp, cRemaining, baseProjLv, baseProjExp, cost, extra) => {
        let results = [];
        for (let rarityIndex = 1; rarityIndex <= 6; rarityIndex++) {
            if (targetProb <= 0) { results.push({ items: 0, res: 0 }); continue; }
            let currentFail = 1.0;
            
            let tempLv = cLv, tempExp = cExp, tempRem = cRemaining;

            while (tempRem > 0 && currentFail > 0) {
                let levelData = config.db[tempLv] || config.db[100];
                let dropRate = levelData[rarityIndex] / 100;
                if (levelData[0] === "MAX") {
                    currentFail *= Math.pow(1 - dropRate, tempRem); break;
                }
                let expNeeded = levelData[0] - tempExp;
                let applied = tempRem >= expNeeded ? expNeeded : tempRem;
                currentFail *= Math.pow(1 - dropRate, applied);
                tempRem -= applied;
                if(tempRem > 0) { tempLv++; tempExp = 0; }
            }

            if (currentFail <= targetFail) { results.push({ items: 0, res: 0 }); continue; }

            let addYields = 0;
            let pLv = baseProjLv; 
            let pExp = baseProjExp;

            while (currentFail > targetFail) {
                let levelData = config.db[pLv] || config.db[100];
                let dropRate = levelData[rarityIndex] / 100;
                if (dropRate === 1) { addYields += 1; break; }
                if (levelData[0] === "MAX") {
                    if (dropRate > 0) addYields += Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    break;
                }
                let yToNext = levelData[0] - pExp;
                if (dropRate === 0) {
                    addYields += yToNext; pLv++; pExp = 0;
                } else {
                    let yForTarget = Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    if (yForTarget <= yToNext) { addYields += yForTarget; break; }
                    else { addYields += yToNext; currentFail *= Math.pow(1 - dropRate, yToNext); pLv++; pExp = 0; }
                }
            }
            
            let pullsNeeded = Math.ceil((type === 'skill' ? addYields / 5 : addYields) / (1 + extra));
            results.push({ items: Math.ceil(addYields), res: pullsNeeded * cost });
        }
        return results;
    };

    let pityBefore = getPity(sLv, sExp, yieldB, projB.level, projB.exp, costB, extraB);
    let pityAfter = getPity(sLv, sExp, yieldA, projA.level, projA.exp, costA, extraA);

    const colors = [{ bg: '#ecf0f1' }, { bg: '#5cd8fe' }, { bg: '#5dfe8a' }, { bg: '#fcfe5d' }, { bg: '#ff5c5d' }, { bg: '#d55cff' }];
    let html = '';
    const keyIcon = `<img src="icons/${config.icon}" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    for (let i = 0; i < 6; i++) {
        let fmtB = formatYieldRow(expBefore[i]); let fmtA = formatYieldRow(expAfter[i]);
        let expCell = `<div style="${fontStyle}">${fmtB}</div>`;
        
        if (fmtB !== fmtA) {
            expCell = isMobile 
                ? `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;"><div style="white-space: nowrap;"><span style="${fontStyle}">${fmtB}</span></div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}<span style="${fontStyle} color:#000;">${fmtA}</span></div></div>`
                : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 4px;"><div style="white-space: nowrap;"><span style="${fontStyle}">${fmtB}</span></div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} <span style="${fontStyle} color:#000;">${fmtA}</span></div></div>`;
        }

        const renderPity = (pityObj) => {
            if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
            let fmtRes = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(pityObj.res) : pityObj.res.toLocaleString();
            return `<div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;"><span style="${fontStyle} color: #000;">${pityObj.items.toLocaleString()}</span><span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${fmtRes})</span></div>`;
        };

        let pityB_HTML = renderPity(pityBefore[i]); let pityA_HTML = renderPity(pityAfter[i]);
        let pityCell = pityB_HTML;
        if (pityBefore[i].res !== pityAfter[i].res || pityBefore[i].items !== pityAfter[i].items) {
            pityCell = isMobile 
                ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${pityA_HTML}</div></div>`
                : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${pityA_HTML}</div></div>`;
        }

        html += `
        <div style="background-color: ${colors[i].bg}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
            <div style="flex: 0 0 30%; max-width: 35%; text-align: left; display: flex; justify-content: flex-start;">${expCell}</div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pityCell}</div>
        </div>`;
    }
    document.getElementById(`sum-${type}-yield-container`).innerHTML = html;
}

// ==========================================
// 6. INITIALIZATION & EVENT LISTENERS
// ==========================================
function initSummonCalc() {
    toggleSummonTab('skill');
}

document.addEventListener('input', (e) => {
    if (e.target.id && e.target.id.includes('power_T')) {
        updateSummonCalc('mount');
    }
    if (e.target.id && e.target.id.includes('spt_T')) {
        updateSummonCalc('skill');
        updateSummonCalc('pet');
    }
});