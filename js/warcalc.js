/**
 * WARCALC.JS
 * Logic for War Point Calculator.
 */

function initWarCalc() {
    const container = document.getElementById('war-calc-inputs');
    if (!container) return;

    const forgeSelects = [
        'wc-d1-forge-lv', 
        'wc-d2-forge-lv', 
        'wc-d3-forge-lv', 
        'wc-d4-forge-lv', 
        'wc-d5-forge-lv'
    ];

    forgeSelects.forEach(id => {
        const forgeSelect = document.getElementById(id);
        if (forgeSelect && forgeSelect.options.length === 0) {
            for (let i = 1; i <= 35; i++) { 
                const opt = document.createElement('option');
                opt.value = i;
                opt.text = i;
                if (i === 20) opt.selected = true; 
                forgeSelect.appendChild(opt);
            }
        }
    });

    updateWarForgeNodesCap();
    updateWarMountExpCap();
    updateWarSkillExpCap();
}

function updateWarForgeNodesCap() {

    ['wc-d2-forge-lv', 'wc-d4-forge-lv'].forEach((lvId, idx) => {
        const prefix = idx === 0 ? 'wc' : 'wc-d4'; 
        const nodesEl = document.getElementById(idx === 0 ? 'wc-forge-nodes' : 'wc-d4-forge-nodes');
        const maxEl = document.getElementById(idx === 0 ? 'wc-forge-nodes-max' : 'wc-d4-forge-nodes-max');
        const lvEl = document.getElementById(lvId);
        
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
    });
}

window.currentWarDay = 1;

window.switchWarDayTab = function(day) {
    window.currentWarDay = day;
    for (let i = 1; i <= 5; i++) {
        const btn = document.getElementById(`btn-warday-${i}`);
        const content = document.getElementById(`warday-tab-${i}`);
        
        if (btn) btn.classList.remove('active');
        if (content) content.style.display = 'none';
    }

    const activeBtn = document.getElementById(`btn-warday-${day}`);
    const activeContent = document.getElementById(`warday-tab-${day}`);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.style.display = 'block';

    const breakdownTitle = document.getElementById('war-breakdown-title');
    if (breakdownTitle) breakdownTitle.innerText = `DAY ${day} BREAKDOWN`;

    if (typeof updateWarCalc === 'function') updateWarCalc();
};

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

function updateWarSkillExpCap() {
    ['', 'd3-'].forEach(prefix => {
        const lvEl = document.getElementById(`wc-${prefix}skill-lv`);
        const expEl = document.getElementById(`wc-${prefix}skill-exp`);
        const maxEl = document.getElementById(`wc-${prefix}skill-max`);
        
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
    });
}

function calcWarSummonYields(startLv, startExp, startAsc, totalPulls, dataTable) {
    let results = [0, 0, 0, 0, 0, 0];
    let cLv = parseInt(startLv) || 1;
    let cExp = parseFloat(startExp) || 0;
    let cAsc = parseInt(startAsc) || 0;
    let rem = parseFloat(totalPulls) || 0;

    while (rem > 0) {
        let levelData = dataTable[cLv] || dataTable[100] || [0, 100, 0, 0, 0, 0, 0];
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

// --- CALCULATION HELPERS ---

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

const getClanTechMult = (actionKey, dayNum) => {
    const actionLv = parseInt(window.clanTechMemory?.[actionKey] || 0);
    const dayLv = parseInt(window.clanTechMemory?.[`cwDay${dayNum}`] || 0);
    return 1 + (actionLv * 0.04) + (dayLv * 0.04);
};

function calcForgeDay(forgeLv, hammerAmt, pointsMult) {
    if (!hammerAmt) return { b: 0, a: 0 };
    const techFreeForge = getTechVal('forge', 'free');
    const effHammerB = hammerAmt / (1 - (techFreeForge.before / 100));
    const effHammerA = hammerAmt / (1 - (techFreeForge.after / 100));

    const ratesSource = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES : {};
    const fRates = ratesSource[forgeLv] || ratesSource[1] || [100,0,0,0,0,0,0,0,0,0];

    let wB = 0, wA = 0;
    for (let i = 0; i < 10; i++) {
        if (fRates[i] > 0) {
            const basePts = WAR_POINTS_BASE.forgeEquip[i];
            const finalPts = Math.round(basePts * pointsMult);
            wB += (effHammerB * (fRates[i] / 100)) * finalPts;
            wA += (effHammerA * (fRates[i] / 100)) * finalPts;
        }
    }
    return { b: wB, a: wA };
}

function calcForgeUpgradeDay(forgeLv, nodesAmt, gemAmt, pointsMultNodes, pointsMultGems) {
    let nodesB = 0, nodesA = 0;
    let gemsB = 0, gemsA = 0;
    
    let gemPts = Math.round(WAR_POINTS_BASE.forgeGem * pointsMultGems);
    gemsB = gemAmt * gemPts;
    gemsA = gemAmt * gemPts;

    if (nodesAmt > 0) {
        const techForgeDisc = getTechVal('forge', 'disc');
        const fData = (typeof forgeLevelData !== 'undefined' && forgeLevelData[forgeLv]) ? forgeLevelData[forgeLv] : [0,0,1];
        const baseCost = fData[0];
        const maxNodes = fData[2] || 1;

        const fUpgradeCostB = baseCost * (1 - (techForgeDisc.before * 1) / 100);
        const ptsPerNodeB = Math.floor((fUpgradeCostB / maxNodes) / 1000) * Math.round(WAR_POINTS_BASE.forgeNode * pointsMultNodes);
        nodesB = ptsPerNodeB * nodesAmt;

        const fUpgradeCostA = baseCost * (1 - (techForgeDisc.after * 1) / 100);
        const ptsPerNodeA = Math.floor((fUpgradeCostA / maxNodes) / 1000) * Math.round(WAR_POINTS_BASE.forgeNode * pointsMultNodes);
        nodesA = ptsPerNodeA * nodesAmt;
    }
    return { nodesB, nodesA, gemsB, gemsA };
}

function calcSkillDay(skillLv, skillExp, skillAsc, tickets, multSummon, multUpgrade) {
    if (!tickets && skillLv === 1 && skillExp === 0) return { sumB: 0, sumA: 0, upB: 0, upA: 0, yieldsB: [0,0,0,0,0,0], yieldsA: [0,0,0,0,0,0] };
    
    const techTicket = getTechVal('spt', 'ticket');
    const costB = 200 * (1 - (techTicket.before * 1) / 100);
    const costA = 200 * (1 - (techTicket.after * 1) / 100);

    const totalSkillsB = tickets > 0 ? Math.floor(tickets / (costB || 200)) * 5 : 0;
    const totalSkillsA = tickets > 0 ? Math.floor(tickets / (costA || 200)) * 5 : 0;

    const db = typeof SKILL_LEVEL_DATA !== 'undefined' ? SKILL_LEVEL_DATA : {};
    const yieldsB = calcWarSummonYields(skillLv, skillExp, skillAsc, totalSkillsB, db);
    const yieldsA = calcWarSummonYields(skillLv, skillExp, skillAsc, totalSkillsA, db);

    const ptsPerSummon = Math.round(WAR_POINTS_BASE.skillSummon[0] * multSummon); 
    let sumB = 0, sumA = 0;
    for (let i = 0; i < 6; i++) {
        sumB += yieldsB[i] * ptsPerSummon;
        sumA += yieldsA[i] * ptsPerSummon;
    }

    let upB = 0, upA = 0;
    let historicalPulls = skillExp;
    for (let i = 1; i < skillLv; i++) {
        if (db[i] && db[i][0] !== "MAX") {
            historicalPulls += db[i][0];
        }
    }
    const baseYields = calcWarSummonYields(1, 0, 0, historicalPulls, db);

    const config = { db: db };
    let phasesB = typeof simulatePhaseFlow === 'function' ? simulatePhaseFlow('skill', config, skillLv, skillExp, skillAsc, totalSkillsB, costB, 0, 0, 1) : [{ asc: skillAsc, yields: yieldsB }];
    let phasesA = typeof simulatePhaseFlow === 'function' ? simulatePhaseFlow('skill', config, skillLv, skillExp, skillAsc, totalSkillsA, costA, 0, 0, 1) : [{ asc: skillAsc, yields: yieldsA }];
    
    if(!phasesB.length) phasesB = [{ asc: skillAsc, yields: yieldsB }];
    if(!phasesA.length) phasesA = [{ asc: skillAsc, yields: yieldsA }];

    const ptsPerUp = Math.round(WAR_POINTS_BASE.skillUpgrade[0] * multUpgrade);
    const getFracLvl = (amt) => {
        let cur = 1, rem = amt;
        while (cur < 1000) { 
            let cost = 8;
            if (typeof SKILL_UPGRADE_COSTS !== 'undefined' && SKILL_UPGRADE_COSTS[cur]) cost = SKILL_UPGRADE_COSTS[cur];
            else {
                if (cur >= 1 && cur <= 5) cost = 2; else if (cur >= 6 && cur <= 10) cost = 3; else if (cur >= 11 && cur <= 14) cost = 4; else if (cur >= 15 && cur <= 21) cost = 5; else if (cur >= 22 && cur <= 25) cost = 6; else if (cur >= 26 && cur <= 29) cost = 7;
            }
            if (rem >= cost) { rem -= cost; cur++; } else return cur + (rem / cost);
        }
        return 1000.0; 
    };

    const ascMap = new Set();
    phasesB.forEach(p => ascMap.add(p.asc)); phasesA.forEach(p => ascMap.add(p.asc));
    Array.from(ascMap).forEach(asc => {
        let pB = phasesB.find(p => p.asc === asc) || { yields: [0,0,0,0,0,0] };
        let pA = phasesA.find(p => p.asc === asc) || { yields: [0,0,0,0,0,0] };
        const isBasePhase = (asc === skillAsc);

        for (let i = 0; i < 6; i++) {
            let cBase = isBasePhase ? (baseYields[i] / 3) : 0;
            let cB = cBase + (pB.yields[i] / 3);
            let cA = cBase + (pA.yields[i] / 3);
            let gainedB = Math.max(0, getFracLvl(cB) - getFracLvl(cBase));
            let gainedA = Math.max(0, getFracLvl(cA) - getFracLvl(cBase));
            
            upB += gainedB * ptsPerUp * 3;
            upA += gainedA * ptsPerUp * 3;
        }
    });

    return { sumB, sumA, upB: Math.round(upB), upA: Math.round(upA), yieldsB, yieldsA };
}

function calcMountDay(mountKey, mergeAmt, multSummon, multMerge) {
    if (!mountKey && !mergeAmt) return { sumB: 0, sumA: 0, mergeInpB: 0, mergeInpA: 0, pullsB: 0, pullsA: 0, yieldsB: [0,0,0,0,0,0], yieldsA: [0,0,0,0,0,0] };
    
    const techMountCost = getTechVal('power', 'mount_cost');
    const techMountChance = getTechVal('power', 'mount_chance');
    const mCostB = Math.max(1, 50 * (1 - (techMountCost.before * 1) / 100));
    const mCostA = Math.max(1, 50 * (1 - (techMountCost.after * 1) / 100));
    
    const pullsB = Math.floor(mountKey / mCostB);
    const pullsA = Math.floor(mountKey / mCostA);

    const mYieldB = pullsB * (1 + (techMountChance.before * 2) / 100);
    const mYieldA = pullsA * (1 + (techMountChance.after * 2) / 100);
    
    const ptsPerSummon = Math.round(WAR_POINTS_BASE.mountSummonBase * multSummon); 
    const sumB = mYieldB * ptsPerSummon;
    const sumA = mYieldA * ptsPerSummon;

    const ptsPerMerge = Math.round(WAR_POINTS_BASE.mountMerge * multMerge);
    const mergeInpB = mergeAmt * ptsPerMerge;
    const mergeInpA = mergeAmt * ptsPerMerge;

    return { 
        sumB, sumA, 
        mergeInpB, mergeInpA, 
        pullsB, pullsA, 
        yieldsB: [mYieldB, 0, 0, 0, 0, 0], 
        yieldsA: [mYieldA, 0, 0, 0, 0, 0] 
    };
}

function calcEggDay(hatchAmts, mergeAmt, multHatch, multMerge) {
    let wHatchB = 0, wHatchA = 0;
    for (let i = 0; i < 6; i++) {
        const pts = Math.round(WAR_POINTS_BASE.eggHatch[i] * multHatch);
        wHatchB += hatchAmts[i] * pts;
        wHatchA += hatchAmts[i] * pts;
    }

    const ptsMerge = Math.round(WAR_POINTS_BASE.eggMerge * multMerge);
    const wMergeB = mergeAmt * ptsMerge;
    const wMergeA = mergeAmt * ptsMerge;

    return { hatchB: wHatchB, hatchA: wHatchA, mergeB: wMergeB, mergeA: wMergeA };
}

function calcTechDay(techAmts, multTech) {
    let wTechB = 0, wTechA = 0;
    const tiers = ['tier1', 'tier2', 'tier3', 'tier4', 'tier5'];
    for (let i = 0; i < 5; i++) {
        const pts = Math.round(WAR_POINTS_BASE.techUpgrade[tiers[i]] * multTech);
        wTechB += techAmts[i] * pts;
        wTechA += techAmts[i] * pts;
    }
    return { b: wTechB, a: wTechA };
}

function updateWarCalc() {
    updateWarForgeNodesCap();
    updateWarMountExpCap();
    updateWarSkillExpCap();

    const getV = (id) => { const el = document.getElementById(id); return el && el.value ? parseFloat(el.value.replace(/,/g, '')) || 0 : 0; };
    const getVInt = (id, def = 0) => { const el = document.getElementById(id); return el && el.value ? parseInt(el.value.replace(/,/g, '')) || def : def; };
    
    const fmtMountYield = (v) => Number.isInteger(v) ? v.toString() : v.toFixed(1).replace('.0', '');

    // ==========================================
    // DAY 1
    // ==========================================
    const d1ForgeLv = getVInt('wc-d1-forge-lv', 20);
    const d1Hammer = getV('wc-hammer');
    const d1Dungeon = getV('wc-dungeon-key');
    const d1SkillLv = getVInt('wc-skill-lv', 1);
    const d1SkillExp = getV('wc-skill-exp');
    const d1SkillAsc = getVInt('wc-skill-asc', 0);
    const d1Ticket = getV('wc-ticket');

    const m1ForgeEq = getClanTechMult('cwForgeEq', 1);
    const m1Dungeon = getClanTechMult('cwDungeon', 1);
    const m1SkillSum = getClanTechMult('cwSummonSkill', 1);
    const m1SkillUp = getClanTechMult('cwUpgradeSkill', 1);

    const c1Forge = calcForgeDay(d1ForgeLv, d1Hammer, m1ForgeEq);
    const c1DungeonPts = Math.round(WAR_POINTS_BASE.dungeonKey * m1Dungeon);
    const c1Skill = calcSkillDay(d1SkillLv, d1SkillExp, d1SkillAsc, d1Ticket, m1SkillSum, m1SkillUp);

    let day1 = {
        items: [
            { label: 'Forge Equipment', b: c1Forge.b, a: c1Forge.a },
            { label: 'Dungeon Keys', b: d1Dungeon * c1DungeonPts, a: d1Dungeon * c1DungeonPts },
            { label: 'Skill Summon', b: c1Skill.sumB, a: c1Skill.sumA },
            { label: 'Skill Upgrade', b: c1Skill.upB, a: c1Skill.upA }
        ]
    };

    // ==========================================
    // DAY 2
    // ==========================================
    const d2ForgeLv = getVInt('wc-d2-forge-lv', 20);
    const d2ForgeNodes = getV('wc-forge-nodes');
    const d2ForgeGem = getV('wc-forge-gem');
    const d2TechAmts = [getV('wc-tech-I'), getV('wc-tech-II'), getV('wc-tech-III'), getV('wc-tech-IV'), getV('wc-tech-V')];
    const d2MountKey = getV('wc-mount-key');
    const d2MountMerge = getV('wc-merge-mount-total');

    const m2ForgeUp = getClanTechMult('cwForgeUp', 2);
    const m2Tech = getClanTechMult('cwTechTree', 2);
    const m2MountSum = getClanTechMult('cwSummonMount', 2);
    const m2MountMerge = getClanTechMult('cwMergeMount', 2);

    const c2ForgeUp = calcForgeUpgradeDay(d2ForgeLv, d2ForgeNodes, d2ForgeGem, m2ForgeUp, m2ForgeUp);
    const c2Tech = calcTechDay(d2TechAmts, m2Tech);
    const c2Mount = calcMountDay(d2MountKey, d2MountMerge, m2MountSum, m2MountMerge);

    let day2 = {
        items: [
            { label: 'Forge Upgrade', b: c2ForgeUp.nodesB, a: c2ForgeUp.nodesA },
            { label: 'Forge Gems', b: c2ForgeUp.gemsB, a: c2ForgeUp.gemsA },
            { label: 'Tech Upgrades', b: c2Tech.b, a: c2Tech.a },
            { label: 'Mount Summon', b: c2Mount.sumB, a: c2Mount.sumA },
            { label: 'Mount Merge', b: c2Mount.mergeInpB, a: c2Mount.mergeInpA }
        ]
    };
    
    const d2MountYieldEl = document.getElementById('wc-d2-mount-yield-text');
    if (d2MountYieldEl) {
        if (Math.abs(c2Mount.yieldsB[0] - c2Mount.yieldsA[0]) < 0.01) {
            d2MountYieldEl.innerHTML = `<span style="color: #000 !important; -webkit-text-stroke: 0px !important;">${fmtMountYield(c2Mount.yieldsB[0])}</span>`;
        } else {
            d2MountYieldEl.innerHTML = `<span style="color: #000 !important; -webkit-text-stroke: 0px !important;">${fmtMountYield(c2Mount.yieldsB[0])}</span> <span style="color: #198754 !important; font-weight: 600 !important; -webkit-text-stroke: 0px !important; margin-left: 2px;">➜ ${fmtMountYield(c2Mount.yieldsA[0])}</span>`;
        }
    }

    // ==========================================
    // DAY 3
    // ==========================================
    const d3ForgeLv = getVInt('wc-d3-forge-lv', 20);
    const d3Hammer = getV('wc-d3-hammer');
    const d3SkillLv = getVInt('wc-d3-skill-lv', 1);
    const d3SkillExp = getV('wc-d3-skill-exp');
    const d3SkillAsc = getVInt('wc-d3-skill-asc', 0);
    const d3Ticket = getV('wc-d3-ticket');
    const d3Hatch = [getV('wc-hatch-common'), getV('wc-hatch-rare'), getV('wc-hatch-epic'), getV('wc-hatch-legendary'), getV('wc-hatch-ultimate'), getV('wc-hatch-mythic')];
    const d3PetMerge = getV('wc-merge-pet-total');

    const m3ForgeEq = getClanTechMult('cwForgeEq', 3);
    const m3SkillSum = getClanTechMult('cwSummonSkill', 3);
    const m3SkillUp = getClanTechMult('cwUpgradeSkill', 3);
    const m3Hatch = getClanTechMult('cwHatch', 3);
    const m3PetMerge = getClanTechMult('cwMergePet', 3);

    const c3Forge = calcForgeDay(d3ForgeLv, d3Hammer, m3ForgeEq);
    const c3Skill = calcSkillDay(d3SkillLv, d3SkillExp, d3SkillAsc, d3Ticket, m3SkillSum, m3SkillUp);
    const c3Egg = calcEggDay(d3Hatch, d3PetMerge, m3Hatch, m3PetMerge);

    let day3 = {
        items: [
            { label: 'Forge Equipment', b: c3Forge.b, a: c3Forge.a },
            { label: 'Skill Summon', b: c3Skill.sumB, a: c3Skill.sumA },
            { label: 'Skill Upgrade', b: c3Skill.upB, a: c3Skill.upA },
            { label: 'Egg Hatched', b: c3Egg.hatchB, a: c3Egg.hatchA },
            { label: 'Egg/Pet Merge', b: c3Egg.mergeB, a: c3Egg.mergeA }
        ]
    };

    // ==========================================
    // DAY 4
    // ==========================================
    const d4ForgeLv = getVInt('wc-d4-forge-lv', 20);
    const d4ForgeNodes = getV('wc-d4-forge-nodes');
    const d4ForgeGem = getV('wc-d4-forge-gem');
    const d4Dungeon = getV('wc-d4-dungeon-key');
    const d4MountKey = getV('wc-d4-mount-key');
    const d4MountMerge = getV('wc-d4-merge-mount-total');

    const m4ForgeUp = getClanTechMult('cwForgeUp', 4);
    const m4Dungeon = getClanTechMult('cwDungeon', 4);
    const m4MountSum = getClanTechMult('cwSummonMount', 4);
    const m4MountMerge = getClanTechMult('cwMergeMount', 4);

    const c4ForgeUp = calcForgeUpgradeDay(d4ForgeLv, d4ForgeNodes, d4ForgeGem, m4ForgeUp, m4ForgeUp);
    const c4DungeonPts = Math.round(WAR_POINTS_BASE.dungeonKey * m4Dungeon);
    const c4Mount = calcMountDay(d4MountKey, d4MountMerge, m4MountSum, m4MountMerge);

    let day4 = {
        items: [
            { label: 'Forge Upgrade', b: c4ForgeUp.nodesB, a: c4ForgeUp.nodesA },
            { label: 'Forge Gems', b: c4ForgeUp.gemsB, a: c4ForgeUp.gemsA },
            { label: 'Dungeon Keys', b: d4Dungeon * c4DungeonPts, a: d4Dungeon * c4DungeonPts },
            { label: 'Mount Summon', b: c4Mount.sumB, a: c4Mount.sumA },
            { label: 'Mount Merge', b: c4Mount.mergeInpB, a: c4Mount.mergeInpA }
        ]
    };

    const d4MountYieldEl = document.getElementById('wc-d4-mount-yield-text');
    if (d4MountYieldEl) {
        if (Math.abs(c4Mount.yieldsB[0] - c4Mount.yieldsA[0]) < 0.01) {
            d4MountYieldEl.innerHTML = `<span style="color: #000 !important; -webkit-text-stroke: 0px !important;">${fmtMountYield(c4Mount.yieldsB[0])}</span>`;
        } else {
            d4MountYieldEl.innerHTML = `<span style="color: #000 !important; -webkit-text-stroke: 0px !important;">${fmtMountYield(c4Mount.yieldsB[0])}</span> <span style="color: #198754 !important; font-weight: 600 !important; -webkit-text-stroke: 0px !important; margin-left: 2px;">➜ ${fmtMountYield(c4Mount.yieldsA[0])}</span>`;
        }
    }

    // ==========================================
    // DAY 5
    // ==========================================
    const d5ForgeLv = getVInt('wc-d5-forge-lv', 20);
    const d5Hammer = getV('wc-d5-hammer');
    const d5TechAmts = [getV('wc-d5-tech-I'), getV('wc-d5-tech-II'), getV('wc-d5-tech-III'), getV('wc-d5-tech-IV'), getV('wc-d5-tech-V')];
    const d5Hatch = [getV('wc-d5-hatch-common'), getV('wc-d5-hatch-rare'), getV('wc-d5-hatch-epic'), getV('wc-d5-hatch-legendary'), getV('wc-d5-hatch-ultimate'), getV('wc-d5-hatch-mythic')];
    const d5PetMerge = getV('wc-d5-merge-pet-total');

    const m5ForgeEq = getClanTechMult('cwForgeEq', 5);
    const m5Tech = getClanTechMult('cwTechTree', 5);
    const m5Hatch = getClanTechMult('cwHatch', 5);
    const m5PetMerge = getClanTechMult('cwMergePet', 5);

    const c5Forge = calcForgeDay(d5ForgeLv, d5Hammer, m5ForgeEq);
    const c5Tech = calcTechDay(d5TechAmts, m5Tech);
    const c5Egg = calcEggDay(d5Hatch, d5PetMerge, m5Hatch, m5PetMerge);

    let day5 = {
        items: [
            { label: 'Forge Equipment', b: c5Forge.b, a: c5Forge.a },
            { label: 'Tech Upgrades', b: c5Tech.b, a: c5Tech.a },
            { label: 'Egg Hatched', b: c5Egg.hatchB, a: c5Egg.hatchA },
            { label: 'Egg/Pet Merge', b: c5Egg.mergeB, a: c5Egg.mergeA }
        ]
    };

    // ==========================================
    // RENDER PROCESSING
    // ==========================================
    const allDays = [day1, day2, day3, day4, day5];
    allDays.forEach(d => {
        d.totalB = d.items.reduce((s, i) => s + i.b, 0);
        d.totalA = d.items.reduce((s, i) => s + i.a, 0);
    });

    const totB = allDays.reduce((s, d) => s + d.totalB, 0);
    const totA = allDays.reduce((s, d) => s + d.totalA, 0);

    window.currentWarYields = window.currentWarYields || {};
    if (window.currentWarDay === 1 || window.currentWarDay === 3) {
        let activeSkill = window.currentWarDay === 1 ? c1Skill : c3Skill;
        window.currentWarYields.skillB = activeSkill.yieldsB;
        window.currentWarYields.skillA = activeSkill.yieldsA;
    }
    if (window.currentWarDay === 2 || window.currentWarDay === 4) {
        let activeMount = window.currentWarDay === 2 ? c2Mount : c4Mount;
        window.currentWarYields.mountB = activeMount.yieldsB;
        window.currentWarYields.mountA = activeMount.yieldsA;
        window.currentWarYields.mountPullsB = activeMount.pullsB;
        window.currentWarYields.mountPullsA = activeMount.pullsA;
    }

    window.warCalcGlobalData = { day1, day2, day3, day4, day5, totB, totA };

    // --- RENDER CARD 2 (SUMMARY) ---
    const formatCompactGold = (val) => {
        if (val === 0) return "0";
        if (val < 10000) return Math.round(val).toLocaleString('en-US');
        if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';
        return parseFloat((val / 1000000).toFixed(2)) + 'm';
    };
    
    const iconHtml = `<img src="icons/warpoint.png" style="width: 18px; height: 18px; object-fit: contain; margin-right: 6px;" onerror="this.style.display='none'">`;
    const valStyle = `font-family: 'Fredoka', sans-serif !important; color: #000 !important; font-weight: 600 !important; font-size: 1rem !important; display: flex; align-items: center; white-space: nowrap; -webkit-text-stroke: 0px !important;`;
    const valAfterStyle = `font-family: 'Fredoka', sans-serif !important; color: #198754 !important; font-weight: 600 !important; font-size: 1rem !important; display: flex; align-items: center; white-space: nowrap; -webkit-text-stroke: 0px !important;`;

    const renderSummaryRow = (label, valB, valA, isTotal = false) => {
        const strB = formatCompactGold(valB); const strA = formatCompactGold(valA);
        const isSingleVal = (Math.abs(valB - valA) < 0.1 || strB === strA);
        
        let valGroupHtml = '';
        if (window.innerWidth <= 768 && !isSingleVal) {
            valGroupHtml = `<div style="display: flex; flex-direction: column; align-items: flex-end; width: auto;">
                <span style="${valStyle} margin-bottom: 2px;">${iconHtml}${strB}</span>
                <div style="display: flex; align-items: center;"><span class="calc-arrow" style="margin: 0 4px;">➜</span><span style="${valAfterStyle}">${iconHtml}${strA}</span></div>
            </div>`;
        } else {
            valGroupHtml = isSingleVal ? `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${strB}</span></div>` 
            : `<div style="display: flex; align-items: center; justify-content: flex-end; flex-shrink: 0;"><span style="${valStyle}">${iconHtml}${strB}</span><span class="calc-arrow" style="margin: 0 4px;">➜</span><span style="${valAfterStyle}">${iconHtml}${strA}</span></div>`;
        }

        if (isTotal) {
            return `
            <div class="calc-line calc-line-purple" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; width: 100%; border-radius: 8px; padding: 10px 15px; box-sizing: border-box;">
                <span class="calc-label calc-label-purple" style="margin: 0;">${label}</span>
                <div class="calc-val-group" id="res-weekly-war-tot" style="margin: 0; background: transparent; padding: 0;">
                    ${valGroupHtml}
                </div>
            </div>`;
        }

        return `<div style="width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; border-radius: 12px; box-sizing: border-box; margin-bottom: 8px; background-color: #e6e9ed; border: 2px solid transparent;">
            <div style="font-family: 'Fredoka', sans-serif !important; font-weight: 600 !important; font-size: 1rem !important; color: #000 !important; text-align: left; -webkit-text-stroke: 0px !important;">
                ${label}
            </div>
            ${valGroupHtml}
        </div>`;
    };

    let summaryHtml = `
    <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 0;">
        ${renderSummaryRow("Day 1", day1.totalB, day1.totalA)}
        ${renderSummaryRow("Day 2", day2.totalB, day2.totalA)}
        ${renderSummaryRow("Day 3", day3.totalB, day3.totalA)}
        ${renderSummaryRow("Day 4", day4.totalB, day4.totalA)}
        ${renderSummaryRow("Day 5", day5.totalB, day5.totalA)}
        <div style="height: 6px;"></div>
        ${renderSummaryRow("Total", totB, totA, true)}
    </div>`;

    const summaryContainer = document.getElementById('war-calc-summary');
    if (summaryContainer) {
        summaryContainer.style.cssText = 'display: block !important; width: 100% !important; margin-top: 15px;';
        summaryContainer.innerHTML = summaryHtml;
    }

    // --- RENDER CARD 3 (DAY BREAKDOWN) ---
    const renderColBA = (vB, vA, isPct) => {
        const fmt = (v) => {
            if (isPct) return v.toFixed(1) + '%';
            if (!v || v === 0) return isPct ? "0.0%" : "0";
            if (v < 10000) return Math.round(v).toLocaleString('en-US');
            if (v < 1000000) return parseFloat((v/1000).toFixed(1)) + 'k';
            return parseFloat((v/1000000).toFixed(2)) + 'm';
        };
        const strB = fmt(vB); const strA = fmt(vA);
        const threshold = isPct ? 0.1 : 1;

        if (Math.abs(vB - vA) < threshold || strB === strA) {
            return `<div style="width: 100%; text-align: right;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000; -webkit-text-stroke: 0px;">${strB}</div>
            </div>`;
        } else {
            return `<div style="width: 100%; text-align: right; line-height: 1.2;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000; -webkit-text-stroke: 0px; margin-bottom: 2px;">${strB}</div>
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #198754; -webkit-text-stroke: 0px;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.85em;">➜</span>${strA}
                </div>
            </div>`;
        }
    };

    let breakdownHtml = `
    <div style="padding: 5px 0;">
        <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.75rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px; text-transform: uppercase;">
            <div style="flex: 0 0 32%; box-sizing: border-box;"></div>
            <div style="flex: 0 0 38%; box-sizing: border-box; display: flex; justify-content: flex-end; align-items: center; padding-right: 8px;">
                <img src="icons/warpoint.png" style="width: 15px; height: 15px; object-fit: contain;">
            </div>
            <div style="flex: 0 0 30%; text-align: right; box-sizing: border-box;">%</div>
        </div>
    `;

    const activeDayData = allDays[window.currentWarDay - 1];
    
    activeDayData.items.forEach(item => {
        let pctB = activeDayData.totalB > 0 ? (item.b / activeDayData.totalB) * 100 : 0;
        let pctA = activeDayData.totalA > 0 ? (item.a / activeDayData.totalA) * 100 : 0;

        breakdownHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
            <div style="flex: 0 0 32%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px; box-sizing: border-box; line-height: 1.1;">
                ${item.label}
            </div>
            <div style="flex: 0 0 38%; padding-right: 8px; box-sizing: border-box; text-align: right;">
                ${renderColBA(item.b, item.a, false)}
            </div>
            <div style="flex: 0 0 30%; box-sizing: border-box; text-align: right;">
                ${renderColBA(pctB, pctA, true)}
            </div>
        </div>`;
    });
    
    breakdownHtml += `</div>`;

    const resContainer = document.getElementById('war-calc-results');
    if (resContainer) {
        resContainer.innerHTML = breakdownHtml;
    }

    // --- RENDER CARD 4 (ACTION POINTS BREAKDOWN) ---
    const actionPointsContainer = document.getElementById('war-action-points-container');
    const actionPointsTitle = document.getElementById('war-action-points-title');

    if (actionPointsContainer && actionPointsTitle) {
        const d = window.currentWarDay;
        actionPointsTitle.innerText = `DAY ${d} ACTION POINTS`;

        let apHtml = `
        <div style="display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 0;">
            <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.75rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 15px 6px 15px; text-transform: uppercase;">
                <div style="flex: 0 0 70%; box-sizing: border-box;"></div>
                <div style="flex: 0 0 30%; text-align: right; box-sizing: border-box; display: flex; justify-content: flex-end; align-items: center; padding-right: 2px;">
                    <img src="icons/warpoint.png" style="width: 15px; height: 15px; object-fit: contain;" onerror="this.style.display='none'">
                </div>
            </div>
        `;

        const renderApRow = (label, points) => {
            return `
            <div style="width: 100%; display: flex; align-items: center; padding: 10px 15px; border-radius: 12px; box-sizing: border-box; margin-bottom: 8px; background-color: #e6e9ed; border: 2px solid transparent;">
                <div style="flex: 0 0 70%; font-family: 'Fredoka', sans-serif !important; font-weight: 600 !important; font-size: 1rem !important; color: #000 !important; text-align: left; -webkit-text-stroke: 0px !important; padding-right: 15px; box-sizing: border-box; line-height: 1.2;">
                    ${label}
                </div>
                <div style="flex: 0 0 30%; font-family: 'Fredoka', sans-serif !important; font-weight: 600 !important; font-size: 1rem !important; color: #000 !important; text-align: right; -webkit-text-stroke: 0px !important; box-sizing: border-box;">
                    ${Math.round(points).toLocaleString('en-US')}
                </div>
            </div>`;
        };

        const pts = typeof WAR_POINTS_BASE !== 'undefined' ? WAR_POINTS_BASE : {};

        const getM = (key) => getClanTechMult(key, d);

        if (d === 1 || d === 3 || d === 5) {
            let mForge = getM('cwForgeEq');
            if (pts.forgeEquip) {
                const fNames = [
                    "Primitive", "Medieval", "Early Modern",
                    "Modern", "Space", "Interstellar", 
                    "Multiverse", "Quantum", "Underworld", "Divine"
                ];

                let forgeGroups = [];
                pts.forgeEquip.forEach((base, idx) => {
                    if (base > 0) {
                        let existing = forgeGroups.find(g => g.base === base);
                        if (existing) {
                            existing.names.push(fNames[idx]);
                        } else {
                            forgeGroups.push({ base: base, names: [fNames[idx]] });
                        }
                    }
                });
                
                forgeGroups.forEach(g => {
                    apHtml += renderApRow("Forge " + g.names.join(", "), g.base * mForge);
                });
            }
        }

        if (d === 2 || d === 4) {
            let mForgeUp = getM('cwForgeUp');
            if (pts.forgeNode) apHtml += renderApRow('1k Gold on Forge', pts.forgeNode * mForgeUp);
            if (pts.forgeGem) apHtml += renderApRow('1 Gem on Forge', pts.forgeGem * mForgeUp);
        }

        if (d === 1 || d === 4) {
            let mDungeon = getM('cwDungeon');
            if (pts.dungeonKey) apHtml += renderApRow('Dungeon Key', pts.dungeonKey * mDungeon);
        }

        if (d === 1 || d === 3) {
            let mSkillSum = getM('cwSummonSkill');
            let mSkillUp = getM('cwUpgradeSkill');
            if (pts.skillSummon && pts.skillSummon[0]) apHtml += renderApRow('Skill Summon', pts.skillSummon[0] * mSkillSum);
            if (pts.skillUpgrade && pts.skillUpgrade[0]) apHtml += renderApRow('Skill Upgrade', pts.skillUpgrade[0] * mSkillUp);
        }

        if (d === 2 || d === 5) {
            let mTech = getM('cwTechTree');
            if (pts.techUpgrade) {
                if (pts.techUpgrade.tier1) apHtml += renderApRow('Tech Tier I', pts.techUpgrade.tier1 * mTech);
                if (pts.techUpgrade.tier2) apHtml += renderApRow('Tech Tier II', pts.techUpgrade.tier2 * mTech);
                if (pts.techUpgrade.tier3) apHtml += renderApRow('Tech Tier III', pts.techUpgrade.tier3 * mTech);
                if (pts.techUpgrade.tier4) apHtml += renderApRow('Tech Tier IV', pts.techUpgrade.tier4 * mTech);
                if (pts.techUpgrade.tier5) apHtml += renderApRow('Tech Tier V', pts.techUpgrade.tier5 * mTech);
            }
        }

        if (d === 2 || d === 4) {
            let mMountSum = getM('cwSummonMount');
            let mMountMerge = getM('cwMergeMount');
            if (pts.mountSummonBase) apHtml += renderApRow('Mount Summon', pts.mountSummonBase * mMountSum);
            if (pts.mountMerge) apHtml += renderApRow('Mount Merge', pts.mountMerge * mMountMerge);
        }

        if (d === 3 || d === 5) {
            let mHatch = getM('cwHatch');
            let mPetMerge = getM('cwMergePet');
            if (pts.eggHatch) {
                const eggRarities = ['Common', 'Rare', 'Epic', 'Legendary', 'Ultimate', 'Mythic'];
                pts.eggHatch.forEach((base, idx) => {
                    if (base > 0) {
                        apHtml += renderApRow(`Hatch ${eggRarities[idx] || ''} Egg`, base * mHatch);
                    }
                });
            }
            if (pts.eggMerge) apHtml += renderApRow('Egg/Pet Merge', pts.eggMerge * mPetMerge);
        }

        apHtml += `</div>`;
        actionPointsContainer.innerHTML = apHtml;
    }
}

if (typeof window !== 'undefined') {
    window.addEventListener('techPlannerUpdated', updateWarCalc); 
}

document.addEventListener('DOMContentLoaded', () => {
    initWarCalc();
});