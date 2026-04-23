/**
 * WARCALC.JS
 * Logic for War Point Calculator.
 */

function initWarCalc() {
    const container = document.getElementById('war-calc-inputs');
    if (!container) return;

    const cardHeader = container.closest('.daily-card')?.querySelector('.daily-card-header');
    if (cardHeader) cardHeader.style.display = 'none';

    const forgeSelect = document.getElementById('wc-forge-lv');
    if (forgeSelect && forgeSelect.options.length === 0) {
        for (let i = 1; i <= 35; i++) { 
            const opt = document.createElement('option');
            opt.value = i;
            opt.text = i;
            if (i === 20) opt.selected = true; 
            forgeSelect.appendChild(opt);
        }
    }

    updateWarForgeNodesCap();
    updateWarMountExpCap();
    updateWarSkillExpCap();
}

function updateWarForgeNodesCap() {
    const lvEl = document.getElementById('wc-forge-lv');
    const nodesEl = document.getElementById('wc-forge-nodes');
    const maxEl = document.getElementById('wc-forge-nodes-max');

    if (lvEl && nodesEl && maxEl) {
        let lv = parseInt(lvEl.value) || 1;

        if (lv === 35) {
            maxEl.innerText = "MAX";
            nodesEl.value = "";
            nodesEl.disabled = true;
        } else {
            let maxNodes = 10;
            if (typeof forgeLevelData !== 'undefined' && forgeLevelData[lv]) {
                maxNodes = forgeLevelData[lv][2] || 1;
            }

            maxEl.innerText = maxNodes;
            nodesEl.disabled = false;

            if (parseInt(nodesEl.value) > maxNodes) {
                nodesEl.value = maxNodes;
            }
        }
    }
}

function updateWarMountExpCap() {
    const lvEl = document.getElementById('wc-mount-lv');
    const expEl = document.getElementById('wc-mount-exp');
    const maxEl = document.getElementById('wc-mount-max');
    
    if (lvEl && maxEl && expEl) {

        if (parseInt(lvEl.value) > 100) lvEl.value = 100;
        
        let lv = parseInt(lvEl.value) || 1;
        if (lv < 1) lv = 1;
        
        let maxExp = 2;
        if (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[lv]) {
            maxExp = MOUNT_LEVEL_DATA[lv][0];
        }
        
        if (maxExp === "MAX" || maxExp === 0) {
            maxEl.innerText = "MAX";
            expEl.value = ""; 
            expEl.disabled = true;
        } else {
            maxEl.innerText = maxExp;
            expEl.disabled = false;
            
            if (parseInt(expEl.value) >= maxExp) {
                expEl.value = maxExp - 1;
            }
        }
    }
}

function calcWarMountPulls(startLv, startExp, totalPulls) {
    let results = [0, 0, 0, 0, 0, 0];
    let currentLv = startLv;
    let currentExp = startExp;
    let remainingPulls = totalPulls;

    while (remainingPulls > 0) {
        let levelData = (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[currentLv]) ? MOUNT_LEVEL_DATA[currentLv] : [0, 100, 0, 0, 0, 0, 0];
        let maxExpForLevel = levelData[0];

        if (maxExpForLevel === "MAX" || maxExpForLevel === 0) {
            for (let i = 0; i < 6; i++) results[i] += remainingPulls * (levelData[i + 1] / 100);
            remainingPulls = 0; 
        } else {
            let expNeededToLevelUp = maxExpForLevel - currentExp;
            if (remainingPulls >= expNeededToLevelUp) {
                for (let i = 0; i < 6; i++) results[i] += expNeededToLevelUp * (levelData[i + 1] / 100);
                remainingPulls -= expNeededToLevelUp;
                currentLv++;
                currentExp = 0;
            } else {
                for (let i = 0; i < 6; i++) results[i] += remainingPulls * (levelData[i + 1] / 100);
                currentExp += remainingPulls; 
                remainingPulls = 0;
            }
        }
    }
    return results;
}

function updateWarSkillExpCap() {
    const lvEl = document.getElementById('wc-skill-lv');
    const expEl = document.getElementById('wc-skill-exp');
    const maxEl = document.getElementById('wc-skill-max');
    
    if (lvEl && maxEl && expEl) {

        if (parseInt(lvEl.value) > 100) lvEl.value = 100;
        
        let lv = parseInt(lvEl.value) || 1;
        if (lv < 1) lv = 1;
        
        let maxExp = 10;
        if (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[lv]) {
            maxExp = SKILL_LEVEL_DATA[lv][0];
        }
        
        if (maxExp === "MAX" || maxExp === 0) {
            maxEl.innerText = "MAX";
            expEl.value = ""; 
            expEl.disabled = true;
        } else {
            maxEl.innerText = maxExp;
            expEl.disabled = false;
            
            if (parseInt(expEl.value) >= maxExp) {
                expEl.value = maxExp - 1;
            }
        }
    }
}

function calcWarSkillPulls(startLv, startExp, totalPulls) {
    let results = [0, 0, 0, 0, 0, 0];
    let currentLv = startLv;
    let currentExp = startExp;
    let remainingPulls = totalPulls;

    while (remainingPulls > 0) {
        let levelData = (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[currentLv]) ? SKILL_LEVEL_DATA[currentLv] : [0, 100, 0, 0, 0, 0, 0];
        let maxExpForLevel = levelData[0];

        if (maxExpForLevel === "MAX" || maxExpForLevel === 0) {
            for (let i = 0; i < 6; i++) results[i] += remainingPulls * (levelData[i + 1] / 100);
            remainingPulls = 0; 
        } else {
            let expNeededToLevelUp = maxExpForLevel - currentExp;
            if (remainingPulls >= expNeededToLevelUp) {
                for (let i = 0; i < 6; i++) results[i] += expNeededToLevelUp * (levelData[i + 1] / 100);
                remainingPulls -= expNeededToLevelUp;
                currentLv++;
                currentExp = 0;
            } else {
                for (let i = 0; i < 6; i++) results[i] += remainingPulls * (levelData[i + 1] / 100);
                currentExp += remainingPulls; 
                remainingPulls = 0;
            }
        }
    }
    return results;
}

function calcWarSummonYields(startLv, startExp, startAsc, totalPulls, dataTable) {
    let results = [0, 0, 0, 0, 0, 0];
    let cLv = parseInt(startLv) || 1;
    let cExp = parseFloat(startExp) || 0;
    let cAsc = parseInt(startAsc) || 0;
    let rem = parseFloat(totalPulls) || 0;

    while (rem > 0) {
        let levelData = dataTable[cLv] || dataTable[100];
        let maxExp = levelData[0];

        if (maxExp === "MAX" || maxExp === 0 || maxExp === undefined) {
            if (cAsc < 3) {
                cAsc++;
                cLv = 1;
                cExp = 0;
                continue; 
            } else {
                for (let i = 0; i < 6; i++) {
                    results[i] += rem * ((levelData[i + 1] || 0) / 100);
                }
                break;
            }
        }

        let expNeeded = Math.max(0, maxExp - cExp);
        let applied = Math.min(rem, expNeeded);

        if (applied > 0) {
            for (let i = 0; i < 6; i++) {
                results[i] += applied * ((levelData[i + 1] || 0) / 100);
            }
            rem -= applied;
            cExp += applied;
        }

        if (cExp >= maxExp) {
            if (cLv < 100) {
                cLv++;
                cExp = 0;
            } else if (cAsc < 3) {
                cAsc++;
                cLv = 1;
                cExp = 0;
            } else {
                cExp = 0; 
            }
        }
    }
    return results;
}

function updateWarCalc() {
    updateWarMountExpCap();
    updateWarSkillExpCap();

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? parseFloat(el.value.replace(/,/g, '')) || 0 : 0;
    };

    const forgeLv = parseInt(document.getElementById('wc-forge-lv')?.value || 20);
    const forgeNodes = parseInt(document.getElementById('wc-forge-nodes')?.value || 0);

    const hammer = getVal('wc-hammer');
    const forgeGems = getVal('wc-forge-gem'); // NEW: Get Gem Input
    const dungeonKeys = getVal('wc-dungeon-key');
    
    const skillLv = parseInt(document.getElementById('wc-skill-lv')?.value || 1);
    const skillExp = getVal('wc-skill-exp');
    const tickets = getVal('wc-ticket');
    
    const techI = getVal('wc-tech-I');
    const techII = getVal('wc-tech-II');
    const techIII = getVal('wc-tech-III');
    const techIV = getVal('wc-tech-IV');
    const techV = getVal('wc-tech-V');
    
    const mountKey = getVal('wc-mount-key');
    const mntLv = parseInt(document.getElementById('wc-mount-lv')?.value || 1);
    const mntExp = getVal('wc-mount-exp');

    const getTechVal = (tree, nodeId) => {
        let beforeLvl = 0, afterLvl = 0;
        if (typeof setupLevels !== 'undefined') {
            for (let t = 1; t <= 5; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
        }
        let planState = typeof calcState === 'function' ? calcState().levels : (typeof setupLevels !== 'undefined' ? setupLevels : {});
        if (planState) {
            for (let t = 1; t <= 5; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
        }
        return { before: beforeLvl, after: afterLvl };
    };

    const skillPointsMap = [125, 125, 125, 125, 125, 125];
    const eggHatchPointsMap = [400, 1600, 3200, 6400, 12800, 25600]; 
    const eggMergePointsMap = [1250, 1250, 1250, 1250, 1250, 1250];
    const mountPointsMap = [600, 600, 600, 600, 600, 600]; 
    const colors = ['common', 'rare', 'epic', 'legendary', 'ultimate', 'mythic'];

    // 1. FORGE CALCULATION
    const techFreeForge = getTechVal('forge', 'free');
    const effHammerB = hammer / (1 - (techFreeForge.before / 100));
    const effHammerA = hammer / (1 - (techFreeForge.after / 100));

    const ratesSource = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES : {};
    const fRates = ratesSource[forgeLv] || ratesSource[1] || [100,0,0,0,0,0,0,0,0,0];
    
    let warForgeB = 0;
    let warForgeA = 0;
    for (let i = 0; i < 10; i++) {
        if (fRates[i] > 0) {
            const pointMultiplier = (i < 3) ? 1 : ((i < 6) ? 2 : 3);
            warForgeB += (effHammerB * (fRates[i] / 100)) * pointMultiplier;
            warForgeA += (effHammerA * (fRates[i] / 100)) * pointMultiplier;
        }
    }

    // 1.5 FORGE UPGRADE GOLD SPENT & GEMS
    const techForgeDisc = getTechVal('forge', 'disc');
    const fData = (typeof forgeLevelData !== 'undefined' && forgeLevelData[forgeLv]) ? forgeLevelData[forgeLv] : [0,0,1];
    
    const baseCost = fData[0];
    const maxNodes = fData[2] || 1;
    const discPercentB = techForgeDisc.before * 1; 
    const discPercentA = techForgeDisc.after * 1;  

    const fUpgradeCostB = baseCost * (1 - discPercentB / 100);
    const costPerNodeB = fUpgradeCostB / maxNodes;
    const ptsPerNodeB = Math.floor(costPerNodeB / 1000) * 27; 
    const warForgeUpgradeB = (ptsPerNodeB * forgeNodes);

    const fUpgradeCostA = baseCost * (1 - discPercentA / 100);
    const costPerNodeA = fUpgradeCostA / maxNodes;
    const ptsPerNodeA = Math.floor(costPerNodeA / 1000) * 27; 
    const warForgeUpgradeA = (ptsPerNodeA * forgeNodes);

    const warForgeGems = forgeGems * 50; 
    const warDungeon = dungeonKeys * 3000; 

    // --- 2. SKILL SUMMON CALCULATION ---
    const skillAsc = parseInt(document.getElementById('wc-skill-asc')?.value || 0); // NEW
    const techTicket = getTechVal('spt', 'ticket');
    
    const costB = 200 * (1 - (techTicket.before * 1) / 100);
    const costA = 200 * (1 - (techTicket.after * 1) / 100);

    const totalSkillsB = Math.floor(tickets / (costB || 200)) * 5;
    const totalSkillsA = Math.floor(tickets / (costA || 200)) * 5;

    const warSkillYieldB = calcWarSummonYields(skillLv, skillExp, skillAsc, totalSkillsB, SKILL_LEVEL_DATA);
    const warSkillYieldA = calcWarSummonYields(skillLv, skillExp, skillAsc, totalSkillsA, SKILL_LEVEL_DATA);

    let warSkillB = 0, warSkillA = 0;
    for (let i = 0; i < 6; i++) {
        warSkillB += warSkillYieldB[i] * skillPointsMap[i];
        warSkillA += warSkillYieldA[i] * skillPointsMap[i];
    }

    window.currentWarYields = {
        skillB: warSkillYieldB, skillA: warSkillYieldA,
    };

    // --- 2.5 SKILL UPGRADE CALCULATION ---
    let skillUpgradePtsB = 0; let skillUpgradePtsA = 0;

    let expPerAsc = 0;
    for (let i = 1; i <= 100; i++) {
        if (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[i] && SKILL_LEVEL_DATA[i][0] !== "MAX") {
            expPerAsc += SKILL_LEVEL_DATA[i][0];
        }
    }

    let historicalPulls = (skillAsc * expPerAsc);
    for (let i = 1; i < skillLv; i++) {
        if (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[i] && SKILL_LEVEL_DATA[i][0] !== "MAX") {
            historicalPulls += SKILL_LEVEL_DATA[i][0];
        }
    }
    historicalPulls += skillExp;

    const baseYields = calcWarSummonYields(1, 0, 0, historicalPulls, SKILL_LEVEL_DATA);

    const config = { db: typeof SKILL_LEVEL_DATA !== 'undefined' ? SKILL_LEVEL_DATA : null };
    let phasesB = typeof simulatePhaseFlow === 'function' ? simulatePhaseFlow('skill', config, skillLv, skillExp, skillAsc, totalSkillsB, costB, 0, 0, 1) : [];
    let phasesA = typeof simulatePhaseFlow === 'function' ? simulatePhaseFlow('skill', config, skillLv, skillExp, skillAsc, totalSkillsA, costA, 0, 0, 1) : [];

    if (!phasesB.length) phasesB = [{ asc: skillAsc, yields: window.currentWarYields.skillB || [0,0,0,0,0,0] }];
    if (!phasesA.length) phasesA = [{ asc: skillAsc, yields: window.currentWarYields.skillA || [0,0,0,0,0,0] }];

    const UPGRADE_POINTS = [125, 125, 125, 125, 125, 125];

    const getFracLvl = (amt) => {
        let cur = 1; 
        let rem = amt;
        
        while (cur < 100) { 
            let cost = 8;
            if (typeof SKILL_UPGRADE_COSTS !== 'undefined' && SKILL_UPGRADE_COSTS[cur]) {
                cost = SKILL_UPGRADE_COSTS[cur];
            } else {
                if (cur >= 1 && cur <= 5) cost = 2;
                else if (cur >= 6 && cur <= 10) cost = 3;
                else if (cur >= 11 && cur <= 14) cost = 4;
                else if (cur >= 15 && cur <= 21) cost = 5;
                else if (cur >= 22 && cur <= 25) cost = 6;
                else if (cur >= 26 && cur <= 29) cost = 7;
                else cost = 8; 
            }

            if (rem >= cost) { 
                rem -= cost; 
                cur++; 
            } else { 
                return cur + (rem / cost); 
            }
        }
        return 100.0; 
    };

    const ascMap = new Set();
    phasesB.forEach(p => ascMap.add(p.asc));
    phasesA.forEach(p => ascMap.add(p.asc));
    const ascKeys = Array.from(ascMap).sort((a,b)=>a-b);

    ascKeys.forEach(asc => {
        let pB = phasesB.find(p => p.asc === asc) || { yields: [0,0,0,0,0,0] };
        let pA = phasesA.find(p => p.asc === asc) || { yields: [0,0,0,0,0,0] };
        
        const isBasePhase = (asc === skillAsc);

        for (let i = 0; i < 6; i++) {
            let copiesBase = isBasePhase ? (baseYields[i] / 3) : 0;
            let copiesB = copiesBase + (pB.yields[i] / 3);
            let copiesA = copiesBase + (pA.yields[i] / 3);

            let fracBase = getFracLvl(copiesBase);
            let fracB = getFracLvl(copiesB);
            let fracA = getFracLvl(copiesA);

            let gainedB = Math.max(0, fracB - fracBase);
            let gainedA = Math.max(0, fracA - fracBase);

            skillUpgradePtsB += gainedB * UPGRADE_POINTS[i] * 3;
            skillUpgradePtsA += gainedA * UPGRADE_POINTS[i] * 3;
        }
    });

    const rndUpgradePtsB = Math.round(skillUpgradePtsB);
    const rndUpgradePtsA = Math.round(skillUpgradePtsA);

    // --- 3. TECH & HATCHING ---
    const warTech = (techI*920) + (techII*9000) + (techIII*26000) + (techIV*47800) + (techV*90700);

    let warEggHatch = 0, warEggMergeInput = 0, warMountMergeInput = 0;
    for (let i=0; i<6; i++) {
        let c = colors[i];
        warEggHatch += getVal(`wc-hatch-${c}`) * eggHatchPointsMap[i];
        warEggMergeInput += getVal(`wc-merge-pet-${c}`) * eggMergePointsMap[i];
        warMountMergeInput += getVal(`wc-merge-mount-${c}`) * mountPointsMap[i];
    }

    // --- 4. MOUNT SUMMON CALCULATION ---
    const mountAsc = parseInt(document.getElementById('wc-mount-asc')?.value || 0); // NEW
    const techMountCost = getTechVal('power', 'mount_cost');
    const techMountChance = getTechVal('power', 'mount_chance');
    
    const mCostB = Math.max(1, Math.ceil(50 * (1 - (techMountCost.before * 1) / 100)));
    const mCostA = Math.max(1, Math.ceil(50 * (1 - (techMountCost.after * 1) / 100)));

    const mPullsB = Math.floor(mountKey / mCostB);
    const mPullsA = Math.floor(mountKey / mCostA);

    const mYieldB = mPullsB * (1 + (techMountChance.before * 2) / 100);
    const mYieldA = mPullsA * (1 + (techMountChance.after * 2) / 100);

    const mountsB = calcWarSummonYields(mntLv, mntExp, mountAsc, mYieldB, MOUNT_LEVEL_DATA);
    const mountsA = calcWarSummonYields(mntLv, mntExp, mountAsc, mYieldA, MOUNT_LEVEL_DATA);

    window.currentWarYields.mountB = mountsB;
    window.currentWarYields.mountA = mountsA;
    window.currentWarYields.mountPullsB = mPullsB;
    window.currentWarYields.mountPullsA = mPullsA;

    let warMountB = 0, warMountA = 0;
    for (let i = 0; i < 6; i++) {
        warMountB += mountsB[i] * mountPointsMap[i];
        warMountA += mountsA[i] * mountPointsMap[i];
    }
    const warMountMergeSummonB = warMountB;
    const warMountMergeSummonA = warMountA;

    const d1B = warForgeB + warSkillB + rndUpgradePtsB + warTech;
    const d1A = warForgeA + warSkillA + rndUpgradePtsA + warTech;

    const d2B = warForgeUpgradeB + warDungeon + warEggHatch + warEggMergeInput + warForgeGems;
    const d2A = warForgeUpgradeA + warDungeon + warEggHatch + warEggMergeInput + warForgeGems;

    const d3B = warForgeB + warSkillB + rndUpgradePtsB + warMountB + warMountMergeSummonB + warMountMergeInput;
    const d3A = warForgeA + warSkillA + rndUpgradePtsA + warMountA + warMountMergeSummonA + warMountMergeInput;

    const d4B = warForgeUpgradeB + warEggHatch + warEggMergeInput + warTech + warForgeGems;
    const d4A = warForgeUpgradeA + warEggHatch + warEggMergeInput + warTech + warForgeGems;

    const d5B = warForgeB + warMountB + warMountMergeSummonB + warMountMergeInput + warDungeon;
    const d5A = warForgeA + warMountA + warMountMergeSummonA + warMountMergeInput + warDungeon;

    const totB = warForgeB + warForgeUpgradeB + warDungeon + warSkillB + rndUpgradePtsB + warTech + warEggHatch + warEggMergeInput + warMountB + warMountMergeSummonB + warMountMergeInput + warForgeGems;
    const totA = warForgeA + warForgeUpgradeA + warDungeon + warSkillA + rndUpgradePtsA + warTech + warEggHatch + warEggMergeInput + warMountA + warMountMergeSummonA + warMountMergeInput + warForgeGems;

    const isMobile = window.innerWidth <= 768; 

    const formatCompactGold = (val) => {
        if (val === 0) return "0";
        if (val < 10000) return Math.round(val).toLocaleString('en-US');
        if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';
        return parseFloat((val / 1000000).toFixed(2)) + 'm';
    };
    
    const iconHtml = `<img src="icons/warpoint.png" style="width: 18px; height: 18px; object-fit: contain; margin-right: 6px;" onerror="this.style.display='none'">`;

    const commonFont = `font-family: 'Fredoka', sans-serif !important; -webkit-text-stroke: 0px !important; text-shadow: none !important; letter-spacing: 0 !important;`;
    const valStyle = `${commonFont} color: #000 !important; font-weight: 600 !important; font-size: 1rem !important; display: flex; align-items: center; white-space: nowrap;`;
    const valAfterStyle = `${commonFont} color: #198754 !important; font-weight: 600 !important; font-size: 1rem !important; display: flex; align-items: center; white-space: nowrap;`;
    const arrowStyle = `${commonFont} color: #198754 !important; font-size: 1.1rem !important; padding: 0 6px; font-weight: 900 !important;`;

    const renderWarRow = (label, valB, valA, infoType = null) => {
        const strB = formatCompactGold(valB);
        const strA = formatCompactGold(valA);
        const isSingleVal = (Math.abs(valB - valA) < 0.1 || strB === strA);

        let valGroupHtml = '';
        
        if (isMobile && !isSingleVal) {
             valGroupHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; width: auto;">
                    <span style="${valStyle} margin-bottom: 2px;">${iconHtml}${strB}</span>
                    <div style="display: flex; align-items: center;">
                        <span style="${arrowStyle}">➔</span>
                        <span style="${valAfterStyle}">${iconHtml}${strA}</span>
                    </div>
                </div>
            `;
        } else {
            if (isSingleVal) {
                valGroupHtml = `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${strB}</span></div>`;
            } else {
                valGroupHtml = `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${strB}</span><span style="${arrowStyle}">➔</span><span style="${valAfterStyle}">${iconHtml}${strA}</span></div>`;
            }
        }

        let labelHtml = label;
        if (infoType) {
            const onClickFunc = infoType === 'skillUpgrade' ? `openSkillUpgradeModal()` : `openWarYieldModal('${infoType}')`;
            labelHtml = `${label}&nbsp;<button class="btn-info" onclick="${onClickFunc}" style="vertical-align: middle; margin-bottom: 2px;">i</button>`;
        }

        const baseStyle = `width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-radius: 12px; box-sizing: border-box; margin-bottom: 8px;`;

        return `
            <div style="${baseStyle} background-color: #e6e9ed; border: 2px solid transparent;">
                <div style="${commonFont} font-weight: 600 !important; font-size: 1rem !important; color: #000 !important; text-align: left;">
                    ${labelHtml}
                </div>
                ${valGroupHtml}
            </div>
        `;
    };

    let summaryHtml = `
    <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 0;">
        ${renderWarRow("Day 1", d1B, d1A)}
        ${renderWarRow("Day 2", d2B, d2A)}
        ${renderWarRow("Day 3", d3B, d3A)}
        ${renderWarRow("Day 4", d4B, d4A)}
        ${renderWarRow("Day 5", d5B, d5A)}
    </div>`;

    const summaryContainer = document.getElementById('war-calc-summary');
    if (summaryContainer) {
        summaryContainer.style.cssText = 'display: block !important; width: 100% !important; margin-top: 15px;';
        summaryContainer.innerHTML = summaryHtml;
    }

    const totStrB = formatCompactGold(totB);
    const totStrA = formatCompactGold(totA);
    const isSingleValTot = (Math.abs(totB - totA) < 0.1 || totStrB === totStrA);
    
    let totInnerHtml = '';
    if (isMobile && !isSingleValTot) {
        totInnerHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; width: auto;">
                <span style="${valStyle} margin-bottom: 2px;">${iconHtml}${totStrB}</span>
                <div style="display: flex; align-items: center;">
                    <span style="${arrowStyle}">➔</span>
                    <span style="${valAfterStyle}">${iconHtml}${totStrA}</span>
                </div>
            </div>
        `;
    } else {
        if (isSingleValTot) {
            totInnerHtml = `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${totStrB}</span></div>`;
        } else {
            totInnerHtml = `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${totStrB}</span><span style="${arrowStyle}">➔</span><span style="${valAfterStyle}">${iconHtml}${totStrA}</span></div>`;
        }
    }

    const customTotalRowHtml = `
    <div class="calc-line calc-line-purple" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%; border-radius: 8px; padding: 10px 15px; box-sizing: border-box;">
        <span class="calc-label calc-label-purple" style="margin: 0;">Total</span>
        <div class="calc-val-group" id="res-weekly-war-tot" style="margin: 0; background: transparent; padding: 0;">
            ${totInnerHtml}
        </div>
    </div>`;

    let resHtml = `
    <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 0;">
        ${customTotalRowHtml}
        ${renderWarRow("Forge", warForgeB, warForgeA)}
        ${renderWarRow("Forge Upgrade Gold Spent", warForgeUpgradeB, warForgeUpgradeA)}
        ${renderWarRow("Gems Spent on Forge", warForgeGems, warForgeGems)} ${renderWarRow("Dungeon Keys", warDungeon, warDungeon)}
        ${renderWarRow("Tech Upgrade", warTech, warTech)}
        ${renderWarRow("Skill Summon", warSkillB, warSkillA, 'skill')}
        ${renderWarRow("Skill Upgrade", rndUpgradePtsB, rndUpgradePtsA, 'skillUpgrade')}
        ${renderWarRow("Egg Hatched", warEggHatch, warEggHatch)}
        ${renderWarRow("Egg Merge", warEggMergeInput, warEggMergeInput)}
        ${renderWarRow("Mount Summon", warMountB, warMountA, 'mount')}
        ${renderWarRow("Mount Merge (Summon)", warMountMergeSummonB, warMountMergeSummonA)}
        ${renderWarRow("Mount Merge (Input)", warMountMergeInput, warMountMergeInput)}
    </div>`;

    const resContainer = document.getElementById('war-calc-results');
    if (resContainer) {
        resContainer.style.cssText = 'display: block !important; width: 100% !important; margin-top: 15px;';
        resContainer.innerHTML = resHtml;
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('techPlannerUpdated', updateWarCalc); 
}

document.addEventListener('DOMContentLoaded', () => {
    initWarCalc();
});