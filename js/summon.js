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
function toggleSummonTab(tabId) {['skill', 'pet', 'mount'].forEach(t => {
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
    const config = SUMMON_CONFIG[type];
    if (!config || !config.db) return;

    const lv = parseInt(document.getElementById(`sum-${type}-lvl`).value) || 1;
    const maxSpan = document.getElementById(`sum-${type}-max`);
    const expInput = document.getElementById(`sum-${type}-exp`); 
    
    if (maxSpan) {
        let maxVal = config.db[lv] ? config.db[lv][0] : "MAX";
        maxSpan.innerText = maxVal === "MAX" ? "MAX" : maxVal.toLocaleString();
        
        if (expInput) {
            if (maxVal === "MAX") {
                expInput.value = 0; 
            } else {
                let currentExp = parseInt(expInput.value) || 0;
                if (currentExp >= maxVal) {
                    expInput.value = maxVal - 1; 
                }
            }
        }
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

function getExpPerAscension(dataTable) {
    if (!dataTable) return 0;
    let total = 0;
    for (let i = 1; i <= 100; i++) {
        if (dataTable[i] && dataTable[i][0] !== "MAX") {
            total += dataTable[i][0];
        }
    }
    return total;
}

function getCumulativePulls(level, exp, dataTable, ascension = 0) {
    if (!dataTable) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
        if (dataTable[i] && dataTable[i][0] !== "MAX") total += dataTable[i][0];
    }
    let expPerAsc = getExpPerAscension(dataTable);
    return (ascension * expPerAsc) + total + exp;
}

function getLevelFromCumulative(totalPulls, dataTable) {
    if (!dataTable) return { level: 1, exp: 0, maxExp: 0, ascension: 0 };
    
    let expPerAsc = getExpPerAscension(dataTable);
    if (expPerAsc === 0) return { level: 1, exp: 0, maxExp: "MAX", ascension: 0 };

    let ascension = Math.floor(totalPulls / expPerAsc);
    let exp = totalPulls % expPerAsc;

    if (exp === 0 && ascension > 0) {
        ascension -= 1;
        exp = expPerAsc;
    }

    if (ascension >= 3) {
        if (totalPulls >= expPerAsc * 4) {
            return { level: 100, exp: 0, maxExp: "MAX", ascension: 3 };
        }
    }

    let lvl = 1;
    while (lvl < 100 && dataTable[lvl] && dataTable[lvl][0] !== "MAX") {
        let maxExp = dataTable[lvl][0];
        if (exp >= maxExp) {
            exp -= maxExp;
            lvl++;
        } else {
            return { level: lvl, exp: exp, maxExp: maxExp, ascension: ascension };
        }
    }
    return { level: 100, exp: exp, maxExp: "MAX", ascension: ascension };
}

function getGlobalPity(type, config, cLv, cExp, cAsc, remaining, targetProb, targetFail, cost, extra) {
    let results =[];
    for (let rarityIndex = 1; rarityIndex <= 6; rarityIndex++) {
        if (targetProb <= 0) { results.push({ items: 0, res: 0 }); continue; }
        let currentFail = 1.0;
        let tempLv = cLv, tempExp = cExp, tempAsc = cAsc, tempRem = remaining;

        while (tempRem > 0 && currentFail > targetFail) {
            let levelData = config.db[tempLv] || config.db[100];
            if ((levelData[0] === "MAX" || tempLv === 100) && tempAsc < 3) {
                tempLv = 1; tempExp = 0; tempAsc++; continue;
            }
            let dropRate = levelData[rarityIndex] / 100;
            if ((levelData[0] === "MAX" || tempLv === 100) && tempAsc >= 3) {
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
        while (currentFail > targetFail) {
            let levelData = config.db[tempLv] || config.db[100];
            if ((levelData[0] === "MAX" || tempLv === 100) && tempAsc < 3) {
                tempLv = 1; tempExp = 0; tempAsc++; continue;
            }
            let dropRate = levelData[rarityIndex] / 100;
            
            if (dropRate === 1) { addYields += 1; break; }
            if ((levelData[0] === "MAX" || tempLv === 100) && tempAsc >= 3) {
                if (dropRate > 0) addYields += Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                break;
            }
            let yToNext = levelData[0] - tempExp;
            if (dropRate === 0) {
                addYields += yToNext; tempLv++; tempExp = 0;
            } else {
                let yForTarget = Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                if (yForTarget <= yToNext) { addYields += yForTarget; break; }
                else { addYields += yToNext; currentFail *= Math.pow(1 - dropRate, yToNext); tempLv++; tempExp = 0; }
            }
        }
        let finalItems = Math.ceil(addYields);
        let pullsNeeded = Math.ceil((type === 'skill' ? finalItems / 5 : finalItems) / (1 + extra));
        let actualItemsYielded = Math.round(pullsNeeded * (type === 'skill' ? 5 : 1) * (1 + extra));
        results.push({ items: actualItemsYielded, res: pullsNeeded * cost });
    }
    return results;
}

function simulatePhaseFlow(type, config, startLv, startExp, startAsc, pulls, cost, extra, targetProb, targetFail) {
    let phases = [];
    let currLv = parseInt(startLv, 10) || 1;
    let currExp = parseFloat(startExp) || 0;
    let currAsc = parseInt(startAsc, 10) || 0;
    let remPulls = parseFloat(pulls) || 0;
    if (remPulls <= 0) {
        let pities = getGlobalPity(type, config, currLv, currExp, currAsc, 0, targetProb, targetFail, cost, extra);
        phases.push({
            asc: currAsc, 
            startLv: currLv, 
            startExp: currExp,
            yields: [0, 0, 0, 0, 0, 0], 
            pullsUsed: 0, 
            cost: cost, 
            extra: extra,
            pityItems: pities.map(p => p.items),
            pityCost: pities.map(p => p.res)
        });
        return phases;
    }

    while (currAsc <= 3 && remPulls > 0) {
        let phase = {
            asc: currAsc, 
            startLv: currLv, 
            startExp: currExp,
            yields: [0, 0, 0, 0, 0, 0], 
            pullsUsed: 0, 
            cost: cost, 
            extra: extra
        };

        let pities = getGlobalPity(type, config, currLv, currExp, currAsc, remPulls, targetProb, targetFail, cost, extra);
        phase.pityItems = [...pities.map(p => p.items)];
        phase.pityCost = [...pities.map(p => p.res)];

        let phasePulls = 0; 

        while (remPulls > 0) {
            let levelData = config.db[currLv] || config.db[100];
            let maxExp = levelData[0];

            if (maxExp === "MAX" || maxExp === undefined) {
                if (currAsc < 3) {
                    currAsc++; 
                    currLv = 1; 
                    currExp = 0; 
                    break; 
                } else {

                    for(let i = 0; i < 6; i++) {
                        phase.yields[i] += remPulls * ((levelData[i+1] || 0) / 100);
                    }
                    phasePulls += remPulls;
                    remPulls = 0; 
                    break;
                }
            }

            let expNeeded = Math.max(0, maxExp - currExp);
            let applied = Math.min(remPulls, expNeeded);
            
            if (applied > 0) {
                for(let i = 0; i < 6; i++) {
                    phase.yields[i] += applied * ((levelData[i+1] || 0) / 100);
                }
                phasePulls += applied;
                remPulls -= applied;
                currExp += applied;
            }
            
            if (currExp >= maxExp) {
                if (currLv < 100) {
                    currLv++; 
                    currExp = 0;
                } else {
                    currExp = 0; 
                }
            }
        }
        
        phase.pullsUsed = phasePulls;

        if (phase.pullsUsed > 0) {
            phases.push(phase);
        }
    }
    
    return phases;
}

// ==========================================
// 3. THE UNIVERSAL CALCULATOR
// ==========================================
function updateSummonCalc(type) {
    const config = SUMMON_CONFIG[type];
    if (!config || !config.db) return;

    const sAsc = parseInt(document.getElementById(`sum-${type}-asc`)?.value) || 0;
    const lvInput = parseInt(document.getElementById(`sum-${type}-lvl`).value) || 1;
    const expInput = parseFloat(document.getElementById(`sum-${type}-exp`).value.replace(/,/g, '')) || 0;
    const resInput = parseFloat(document.getElementById(`sum-${type}-res`).value.replace(/,/g, '')) || 0;
    
    const targetAscInput = parseInt(document.getElementById(`sum-${type}-target-asc`)?.value) || 0;
    const targetLvInput = parseInt(document.getElementById(`sum-${type}-target-lv`)?.value) || 0;

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

    const baseCumulative = getCumulativePulls(lvInput, expInput, config.db, sAsc);
    const totalCumB = baseCumulative + yieldB;
    const totalCumA = baseCumulative + yieldA;

    const projB = getLevelFromCumulative(totalCumB, config.db);
    const projA = getLevelFromCumulative(totalCumA, config.db);

    const isMobile = window.innerWidth <= 768;
    renderHeader(type, projB, projA, isMobile);
    renderMilestones(type, config, totalCumB, totalCumA, costB, costA, extraChanceB, extraChanceA, isMobile, targetLvInput, targetAscInput);
    
    if(document.getElementById(`sum-${type}-yield-container`)) {
        calculateUniversalYieldTable(type, config, lvInput, expInput, sAsc, pullsB, pullsA, yieldB, yieldA, costB, costA, extraChanceB, extraChanceA, isMobile, projB.ascension, projA.ascension);
    }
}

// ==========================================
// 4. RENDERING HELPERS
// ==========================================
function getDynamicMilestones(type, config) {
    if (window[config.globalMilestoneKey]) return window[config.globalMilestoneKey];
    if (!config.db) return[];

    const dynamicMilestones =[
        { name: "Rare", index: 2, color: "#5cd8fe", targetLv: 0, ascension: 0 },
        { name: "Epic", index: 3, color: "#5dfe8a", targetLv: 0, ascension: 0 },
        { name: "Legendary", index: 4, color: "#fcfe5d", targetLv: 0, ascension: 0 },
        { name: "Ultimate", index: 5, color: "#ff5c5d", targetLv: 0, ascension: 0 },
        { name: "Mythic", index: 6, color: "#d55cff", targetLv: 0, ascension: 0 },
        { name: "Max", index: null, color: "#fe9e0c", targetLv: 100, ascension: 0 } 
    ];

    for (let level = 1; level <= 100; level++) {
        let levelData = config.db[level];
        if (!levelData) continue;
        dynamicMilestones.forEach(m => {
            if (m.index !== null && m.targetLv === 0 && levelData[m.index] > 0) {
                m.targetLv = level; 
                m.ascension = 0;
            }
        });
    }
    window[config.globalMilestoneKey] = dynamicMilestones;
    return dynamicMilestones;
}

const getAscensionStars = (asc) => {
    if (asc === 1) return `<img src="icons/asc1.png" style="height: 1.1em; vertical-align: -3px; margin-right: 2px;">`;
    if (asc === 2) return `<img src="icons/asc2.png" style="height: 1.1em; vertical-align: -3px; margin-right: 2px;">`;
    if (asc === 3) return `<img src="icons/asc3.png" style="height: 1.1em; vertical-align: -3px; margin-right: 2px;">`;
    return ``;
};

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
        let stars = getAscensionStars(proj.ascension);
        let displayLv = proj.ascension > 0 ? `${stars}Lv ${proj.level}` : `Lv ${proj.level}`;
        if (proj.maxExp === "MAX") return `${displayLv} <span style="${lvExpStyle}">(MAX)</span>`;
        return `${displayLv} <span style="${lvExpStyle}">(${formatExp(proj.exp)} / ${proj.maxExp.toLocaleString()})</span>`;
    };

    let levelHtml = "";
    const valB = `<span style="${lvFontStyle}">${getLevelText(projB)}</span>`;
    const valA = `<span style="${lvFontStyle}">${getLevelText(projA)}</span>`;
    const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 0.95rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

    if (projB.maxExp === "MAX" || (projB.level === projA.level && projB.ascension === projA.ascension && formatExp(projB.exp) === formatExp(projA.exp))) {
        levelHtml = valB;
    } else {
        levelHtml = isMobile 
            ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display:flex; align-items:center; white-space: nowrap;">${arrow}${valA}</div></div>`
            : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${valA}</div></div>`;
    }
    resLvContainer.innerHTML = levelHtml;
}

function renderMilestones(type, config, totalCumB, totalCumA, costB, costA, extraB, extraA, isMobile, targetLvInput, targetAscInput) {
    let baseDynamic =[];
    if (typeof getDynamicMilestones === 'function') {
        baseDynamic = getDynamicMilestones(type, config) ||[];
    }

    let allMilestones =[];
    for (let a = 0; a <= 3; a++) {
        baseDynamic.forEach(bm => {
            allMilestones.push({ ...bm, ascension: a });
        });
    }

    if (targetLvInput > 0) {
        allMilestones.push({
            name: "Target",
            index: 'custom', 
            color: "#e4e4e4", 
            targetLv: targetLvInput,
            ascension: targetAscInput,
            isTarget: true 
        });
    }

    const expPerAsc = getExpPerAscension(config.db);
    allMilestones.forEach(m => {
        m.targetCum = m.ascension * expPerAsc + getCumulativePulls(m.targetLv, 0, config.db);
    });

    allMilestones.sort((a, b) => {
        if (a.targetCum !== b.targetCum) return a.targetCum - b.targetCum;
        if (a.ascension !== b.ascension) return a.ascension - b.ascension;
        if (a.isTarget) return -1;
        if (b.isTarget) return 1;
        return 0;
    });

    const startAsc = parseInt(document.getElementById(`sum-${type}-asc`)?.value) || 0;
    allMilestones = allMilestones.filter(m => m.isTarget || m.ascension >= startAsc);

    const projB = getLevelFromCumulative(totalCumB, config.db);
    const projA = getLevelFromCumulative(totalCumA, config.db);

    const checkUnlocked = (total, proj, m) => {
        if (total > m.targetCum) return true;
        if (total === m.targetCum) {
            if (proj.ascension > m.ascension) return true;
            if (proj.ascension === m.ascension && proj.level >= m.targetLv) return true;
            return false;
        }
        return false;
    };

    let lastUnlockedIdx = -1;
    let firstLockedIdx = -1;

    for (let i = 0; i < allMilestones.length; i++) {
        if (!allMilestones[i].isTarget && checkUnlocked(totalCumB, projB, allMilestones[i])) {
            lastUnlockedIdx = i;
        }
    }

    for (let i = 0; i < allMilestones.length; i++) {
        if (!allMilestones[i].isTarget && !checkUnlocked(totalCumA, projA, allMilestones[i])) {
            firstLockedIdx = i;
            break;
        }
    }

    let targetAscToShow = firstLockedIdx !== -1 ? allMilestones[firstLockedIdx].ascension : startAsc;

    let filteredMilestones = allMilestones.filter((m, i) => {
        if (m.isTarget) return true; 
        if (lastUnlockedIdx !== -1 && i === lastUnlockedIdx) return true; 
        if (i > lastUnlockedIdx && m.ascension <= targetAscToShow) return true;         
        return false;
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

    filteredMilestones.forEach((m, index) => {
        const unlockedB = checkUnlocked(totalCumB, projB, m);
        const unlockedA = checkUnlocked(totalCumA, projA, m);

        const needsB = calcNeeds(unlockedB, m.targetCum, totalCumB, costB, extraB);
        const needsA = calcNeeds(unlockedA, m.targetCum, totalCumA, costA, extraA);

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
        
        let stars = getAscensionStars(m.ascension);
        let displayLv = m.ascension > 0 ? `${stars}Lv ${m.targetLv}` : `Lv ${m.targetLv}`;

        html += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; ${borderStyle}">
            <div style="flex: 0 0 35%; max-width: 45%; text-align: left; line-height: 1.2;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${m.name}</span>
                <span style="${fontStyle} font-size:0.8rem; font-weight:500; color: #000; display: inline-block; white-space: nowrap;">(${displayLv})</span>
            </div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${statusHtml}</div>
        </div>`;
    });

    let absoluteMaxExp = expPerAsc;
    if(absoluteMaxExp === 0) absoluteMaxExp = 1; 

    let loopExpB = totalCumB - (projB.ascension * expPerAsc);
    let loopExpA = totalCumA - (projA.ascension * expPerAsc);

    let pctB = (loopExpB / absoluteMaxExp) * 100;
    let pctA = (loopExpA / absoluteMaxExp) * 100;

    const formatExp = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    let nextAsc = projB.ascension + 1;
    let progressTitle = projB.ascension >= 3 
        ? "Progress to Max" 
        : `Progress to Ascension <img src="icons/asc${nextAsc}.png" style="height: 1.3em; vertical-align: -3px; object-fit: contain; margin-left: 2px;">`;

    html += `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px;">${progressTitle}</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${Math.min(pctB, 100)}%;"></div>
                <div class="pet-progress-text">${formatExp(loopExpB)} / ${absoluteMaxExp.toLocaleString()} (${pctB.toFixed(1)}%)</div>
            </div>`;

    if (formatExp(loopExpB) !== formatExp(loopExpA) || projB.ascension !== projA.ascension) {
        
        let transitionHtml = `<div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1; margin: 2px 0;">⬇</div>`;
        
        if (projB.ascension !== projA.ascension) {
            transitionHtml = `
            <div style="background-color: #f8f9fa; border: 2px dashed #d1d5db; border-radius: 8px; padding: 6px 15px; margin: 4px auto; width: fit-content; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.8rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; -webkit-text-stroke: 0px;">
                    Ascended to 
                </span>
                <img src="icons/asc${projA.ascension}.png" style="height: 1.2em; object-fit: contain;">
            </div>`;
        }

        html += `
            ${transitionHtml}
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${Math.min(pctA, 100)}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${formatExp(loopExpA)} / ${absoluteMaxExp.toLocaleString()} (${pctA.toFixed(1)}%)</div>
            </div>`;
    }
    html += `</div>`;
    
    let cont = document.getElementById(`sum-${type}-milestones-container`);
    if (cont) cont.innerHTML = html;
}

// ==========================================
// 5. YIELD & PITY CALCULATOR
// ==========================================
function calculateUniversalYieldTable(type, config, sLv, sExp, sAsc, pullsB, pullsA, yieldB, yieldA, costB, costA, extraB, extraA, isMobile, projB_Asc, projA_Asc) {
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";

    let targetProb = parseFloat(document.getElementById(`sum-${type}-prob`).value) || 90;
    let targetFail = 1 - (targetProb / 100);

    let phasesB = simulatePhaseFlow(type, config, sLv, sExp, sAsc, yieldB, costB, extraB, targetProb, targetFail);
    let phasesA = simulatePhaseFlow(type, config, sLv, sExp, sAsc, yieldA, costA, extraA, targetProb, targetFail);

    if (!window.currentSummonYields) window.currentSummonYields = {};
    window.currentSummonYields[type] = { phasesB, phasesA, targetProb, config };

    const infoBtn = document.getElementById(`btn-sum-${type}-yield-info`);
    if (infoBtn) {  
        const activePhasesB = phasesB.filter(p => p.pullsUsed > 0.1);
        const activePhasesA = phasesA.filter(p => p.pullsUsed > 0.1);
        
        let minAsc = 3, maxAsc = 0;
        [...activePhasesB, ...activePhasesA].forEach(p => {
            if (p.asc > maxAsc) maxAsc = p.asc;
            if (p.asc < minAsc) minAsc = p.asc;
        });

        if (minAsc < maxAsc) {
            infoBtn.style.setProperty('display', 'inline-block', 'important');
        } else {
            infoBtn.style.setProperty('display', 'none', 'important');
        }
    }

    let expBefore =[0,0,0,0,0,0]; let expAfter =[0,0,0,0,0,0];
    phasesB.forEach(p => { for(let i=0; i<6; i++) expBefore[i] += p.yields[i]; });
    phasesA.forEach(p => { for(let i=0; i<6; i++) expAfter[i] += p.yields[i]; });

    let pityBefore = phasesB.length > 0 ? phasesB[0] : { pityItems: [0,0,0,0,0,0], pityCost:[0,0,0,0,0,0] };
    let pityAfter = phasesA.length > 0 ? phasesA[0] : { pityItems:[0,0,0,0,0,0], pityCost: [0,0,0,0,0,0] };

    const formatTotal = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    
    const formatYieldRow = (val) => {
        if (!val || val < 0.01) return "0";
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
    
    let totalCont = document.getElementById(`sum-${type}-total-yield`);
    if(totalCont) totalCont.innerHTML = totalYieldHtml;

    const colors =[{ bg: '#ecf0f1' }, { bg: '#5cd8fe' }, { bg: '#5dfe8a' }, { bg: '#fcfe5d' }, { bg: '#ff5c5d' }, { bg: '#d55cff' }];
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

        const renderPity = (items, res) => {
            if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
            let fmtRes = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(res) : res.toLocaleString();
            return `<div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;"><span style="${fontStyle} color: #000;">${items.toLocaleString()}</span><span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${fmtRes})</span></div>`;
        };

        let pityB_HTML = renderPity(pityBefore.pityItems[i], pityBefore.pityCost[i]); 
        let pityA_HTML = renderPity(pityAfter.pityItems[i], pityAfter.pityCost[i]);
        let pityCell = pityB_HTML;
        
        if (pityBefore.pityCost[i] !== pityAfter.pityCost[i] || pityBefore.pityItems[i] !== pityAfter.pityItems[i]) {
            pityCell = isMobile 
                ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${pityA_HTML}</div></div>`
                : `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${pityA_HTML}</div></div>`;
        }

        html += `
        <div style="background-color: ${colors[i].bg}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
            <div style="flex: 0 0 45%; max-width: 50%; text-align: left; display: flex; justify-content: flex-start;">${expCell}</div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pityCell}</div>
        </div>`;
    }
    
    let yieldCont = document.getElementById(`sum-${type}-yield-container`);
    if(yieldCont) yieldCont.innerHTML = html;
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