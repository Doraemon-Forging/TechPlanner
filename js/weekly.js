/**
 * WEEKLY.JS 
 * Logic for Weekly Overview, Individual Rewards, and Ascension ETA.
 */

// ==========================================
// 1. ASCENSION DYNAMIC UI
// ==========================================
function updateAscensionCaps(type) {
    const lvEl = document.getElementById(`asc-${type}-lv`);
    const expEl = document.getElementById(`asc-${type}-exp`);
    const maxEl = document.getElementById(`asc-${type}-max`);
    
    if (!lvEl || !maxEl || !expEl) return;

    let rawLv = parseInt(lvEl.value);
    let lv = isNaN(rawLv) ? 1 : rawLv;
    if (lv < 1) lv = 1;
    
    if (rawLv > 100) {
        lv = 100;
        lvEl.value = 100; 
    }
    
    let db = null;
    if (type === 'skill' && typeof SKILL_LEVEL_DATA !== 'undefined') db = SKILL_LEVEL_DATA;
    if (type === 'pet' && typeof PET_LEVEL_DATA !== 'undefined') db = PET_LEVEL_DATA;
    if (type === 'mount' && typeof MOUNT_LEVEL_DATA !== 'undefined') db = MOUNT_LEVEL_DATA;
    
    if (db && db[lv]) {
        let maxExp = db[lv][0];
        if (maxExp === "MAX" || lv === 100) {
            maxEl.innerText = "MAX";
            expEl.value = "";
            expEl.disabled = true;
        } else {
            maxEl.innerText = maxExp.toLocaleString();
            expEl.disabled = false;
            let currentExp = parseFloat(expEl.value);
            
            if (!isNaN(currentExp) && currentExp >= maxExp) {
                expEl.value = maxExp - 1; 
            }
        }
    }
}

// ==========================================
// 2. MAIN UPDATE LOGIC
// ==========================================
function updateWeekly() {
    const getStrVal = (id, defaultVal = "") => document.getElementById(id)?.value || defaultVal;
    
    const league = getStrVal('weekly-league', 'Unranked');
    const rank = getStrVal('weekly-rank', '1st');
    const clanTier = getStrVal('weekly-war-tier', 'None');
    const clanWin = getStrVal('weekly-war-win', 'Lose');
    const indivTier = getStrVal('weekly-indiv', 'None');

    const baseLRewards = (typeof LEAGUE_REWARDS !== 'undefined' && LEAGUE_REWARDS[league] && LEAGUE_REWARDS[league][rank]) ? LEAGUE_REWARDS[league][rank] : [0,0,0,0,0,0,0];
    const baseCRewards = (typeof CLAN_WAR_REWARDS !== 'undefined' && CLAN_WAR_REWARDS[clanTier] && CLAN_WAR_REWARDS[clanTier][clanWin]) ? CLAN_WAR_REWARDS[clanTier][clanWin] : [0,0,0,0,0,0,0];

    let baseIRewards = [0, 0, 0, 0, 0, 0, 0];
    if (typeof INDIV_REWARDS !== 'undefined') {
        const targetVal = INDIV_REWARDS[indivTier] ? INDIV_REWARDS[indivTier].val : 0;
        for (const key in INDIV_REWARDS) {
            if (INDIV_REWARDS[key].val <= targetVal) {
                const tierRew = INDIV_REWARDS[key].rewards || [0,0,0,0,0,0,0];
                for (let i = 0; i < 7; i++) baseIRewards[i] += tierRew[i];
            }
        }
    }

    // --- CLAN TECH MULTIPLIERS ---
    const getCtVal = (id, memKey) => {
        const el = document.getElementById(id);
        if (el) return parseInt(el.value) || 0;
        return parseInt(window.clanTechMemory?.[memKey]) || 0;
    };
    
    const ctWarPersonal = getCtVal('ct-war-personal', 'warPersonal');
    const ctWarWin      = getCtVal('ct-war-win', 'warWin');
    const ctWarLose     = getCtVal('ct-war-lose', 'warLose');
    const ctPotPersonal = getCtVal('ct-pot-personal', 'potPersonal');
    const ctPotWin      = getCtVal('ct-pot-win', 'potWin');
    const ctPotLose     = getCtVal('ct-pot-lose', 'potLose');
    const potAsc = parseInt(document.getElementById('weekly-potion-asc')?.value) || 0; 
    
    const gpAscMult = 1 + (potAsc / 100);
    const indivMult = 1 + (ctWarPersonal / 100);
    const indivGpTechMult = 1 + (ctWarPersonal / 100) + (ctPotPersonal * 5 / 100);
    
    let warMult = 1;
    let warGpTechMult = 1;
    if (clanWin === 'Win') {
        warMult = 1 + (ctWarWin / 100);
        warGpTechMult = 1 + (ctWarWin / 100) + (ctPotWin * 5 / 100);
    } else {
        warMult = 1 + (ctWarLose / 100);
        warGpTechMult = 1 + (ctWarLose / 100) + (ctPotLose * 5 / 100);
    }

    const lRewards = [0,0,0,0,0,0,0];
    const cRewards = [0,0,0,0,0,0,0];
    const iRewards = [0,0,0,0,0,0,0];

    for (let i = 0; i < 7; i++) {
        if (i === 6) { 
            lRewards[i] = Math.round(baseLRewards[i] * gpAscMult); 
            cRewards[i] = Math.round(baseCRewards[i] * warGpTechMult * gpAscMult);
            iRewards[i] = Math.round(baseIRewards[i] * indivGpTechMult * gpAscMult);
        } else {
            lRewards[i] = baseLRewards[i];
            cRewards[i] = Math.round(baseCRewards[i] * warMult);
            iRewards[i] = Math.round(baseIRewards[i] * indivMult);
        }
    }

    const finalRewards = {
        hammer:   lRewards[0] + cRewards[0] + iRewards[0],
        gold:     lRewards[1] + cRewards[1] + iRewards[1],
        ticket:   lRewards[2] + cRewards[2] + iRewards[2],
        eggshell: lRewards[3] + cRewards[3] + iRewards[3],
        potion:   lRewards[4] + cRewards[4] + iRewards[4],
        mountKey: lRewards[5] + cRewards[5] + iRewards[5],
        greenPotion: lRewards[6] + cRewards[6] + iRewards[6]
    };

    const getWeeklyTechVal = (tree, nodeId) => {
        let beforeLvl = 0, afterLvl = 0;
        if (typeof setupLevels !== 'undefined' && setupLevels) {
            for (let t = 1; t <= 5; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
        }
        let planState = typeof calcState === 'function' ? calcState().levels : setupLevels || {};
        for (let t = 1; t <= 5; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
        return { before: beforeLvl, after: afterLvl };
    };

    const techTicket = getWeeklyTechVal('spt', 'ticket');
    const costB = 200 * (1 - (techTicket.before * 1) / 100);
    const costA = 200 * (1 - (techTicket.after * 1) / 100);

    const techLucky = getWeeklyTechVal('spt', 'lucky');
    const luckyVal = typeof TREES !== 'undefined' && TREES.spt.meta.lucky.val ? TREES.spt.meta.lucky.val : 2;
    const luckyMultB = 1 + ((techLucky.before * luckyVal) / 100);
    const luckyMultA = 1 + ((techLucky.after * luckyVal) / 100);

    const techMountCost = getWeeklyTechVal('power', 'mount_cost');
    const techMountChance = getWeeklyTechVal('power', 'mount_chance');
    const safeCostB = Math.max(1, 50 * (1 - (techMountCost.before * 1) / 100));
    const safeCostA = Math.max(1, 50 * (1 - (techMountCost.after * 1) / 100));

    const dailyData = typeof calculateDailyMath === 'function' ? calculateDailyMath() : null;
    if (!dailyData) return; 

    const dLvl = typeof getDungeonLevels === 'function' ? getDungeonLevels() : { thief: {lvl: 1, sub: 1} };
    const slots = typeof getMissionSlots === 'function' ? getMissionSlots() : {};
    let mWeekly = { gold: 0, ticket: 0, egg: 0, pot: 0, key: 0, gp: 0, hammer: (slots.rally || 0) * 7 };
    if (typeof calculateMissionYields === 'function') {
        const ms = calculateMissionYields(dLvl.thief.lvl, dLvl.thief.sub, slots);
        mWeekly = {
            gold: ms.dailyTotal.gold * 7,
            ticket: ms.dailyTotal.ticket * 7,
            egg: ms.dailyTotal.egg * 7,
            pot: ms.dailyTotal.pot * 7,
            key: ms.dailyTotal.key * 7,
            gp: ms.dailyTotal.gp * 7,
            hammer: (slots.rally || 0) * 7
        };
    }

    const freeB = 1 - (dailyData.curStats.free || 0) / 100;
    const weeklyFixedHammersB = finalRewards.hammer + mWeekly.hammer;
    const extraEffHB = weeklyFixedHammersB / (freeB <= 0 ? 1 : freeB);
    const totalEffHB = extraEffHB + (dailyData.effHB * 7);
    const hammerGoldContributionB = totalEffHB * (dailyData.curStats.avgGold || 0);
    
    const freeA = 1 - (dailyData.projStats.free || 0) / 100;
    const weeklyFixedHammersA = finalRewards.hammer + mWeekly.hammer;
    const extraEffHA = weeklyFixedHammersA / (freeA <= 0 ? 1 : freeA);
    const totalEffHA = extraEffHA + (dailyData.effHA * 7);
    const hammerGoldContributionA = totalEffHA * (dailyData.projStats.avgGold || 0);

    window.latestWeeklyBreakdown = {
        hammer: {
            Dungeon: { b: dailyData.rewards.hammer.before * 14, a: dailyData.rewards.hammer.after * 14 },
            Idle: { b: 1440 * (1 + (dailyData.curStats.offH || 0) / 100) * 7, a: 1440 * (1 + (dailyData.projStats.offH || 0) / 100) * 7 },
            League: { b: lRewards[0], a: lRewards[0] },
            War: { b: cRewards[0], a: cRewards[0] },
            'Indiv Rewards': { b: iRewards[0], a: iRewards[0] },
            'Rally Bonus': { b: mWeekly.hammer, a: mWeekly.hammer } 
        },
        gold: {
            Dungeon: { b: dailyData.rewards.gold.before * 14, a: dailyData.rewards.gold.after * 14 },
            Idle: { b: 86400 * (1 + (dailyData.curStats.offC || 0) / 100) * 7, a: 86400 * (1 + (dailyData.projStats.offC || 0) / 100) * 7 },
            League: { b: lRewards[1], a: lRewards[1] },
            'Indiv Rewards': { b: iRewards[1], a: iRewards[1] },
            Mission: { b: mWeekly.gold, a: mWeekly.gold },
            Hammer: { b: hammerGoldContributionB, a: hammerGoldContributionA }
        },
        ticket: {
            Dungeon: { b: dailyData.rewards.ticket.before * 14, a: dailyData.rewards.ticket.after * 14 },
            Idle: { b: 0, a: 0 },
            League: { b: lRewards[2], a: lRewards[2] },
            War: { b: cRewards[2], a: cRewards[2] },
            'Indiv Rewards': { b: iRewards[2], a: iRewards[2] },
            Mission: { b: mWeekly.ticket, a: mWeekly.ticket }
        },
        eggshell: {
            Dungeon: { b: dailyData.rewards.eggshell.before * 14, a: dailyData.rewards.eggshell.after * 14 },
            Idle: { b: 0, a: 0 },
            League: { b: lRewards[3], a: lRewards[3] },
            War: { b: cRewards[3], a: cRewards[3] },
            'Indiv Rewards': { b: iRewards[3], a: iRewards[3] },
            Mission: { b: mWeekly.egg, a: mWeekly.egg }
        },
        potion: {
            Dungeon: { b: dailyData.rewards.potion.before * 14, a: dailyData.rewards.potion.after * 14 },
            Idle: { b: 0, a: 0 },
            League: { b: lRewards[4], a: lRewards[4] },
            War: { b: cRewards[4], a: cRewards[4] },
            'Indiv Rewards': { b: iRewards[4], a: iRewards[4] },
            Mission: { b: mWeekly.pot, a: mWeekly.pot }
        },
        mountKey: {
            Dungeon: { b: 0, a: 0 },
            Idle: { b: 0, a: 0 },
            League: { b: lRewards[5], a: lRewards[5] },
            War: { b: cRewards[5], a: cRewards[5] },
            'Indiv Rewards': { b: iRewards[5], a: iRewards[5] },
            Mission: { b: mWeekly.key, a: mWeekly.key }
        },
        greenPotion: {
            Dungeon: { b: 0, a: 0 },
            Idle: { b: 0, a: 0 },
            League: { b: lRewards[6], a: lRewards[6] },
            War: { b: cRewards[6], a: cRewards[6] },
            'Indiv Rewards': { b: iRewards[6], a: iRewards[6] },
            Mission: { b: mWeekly.gp, a: mWeekly.gp }
        }
    };

    const totalHammerB = finalRewards.hammer + (dailyData.totHammerB * 7) + mWeekly.hammer;
    const totalHammerA = finalRewards.hammer + (dailyData.totHammerA * 7) + mWeekly.hammer;
    const totalBaseGoldB = finalRewards.gold + (dailyData.totGoldB * 7) + mWeekly.gold;
    const totalBaseGoldA = finalRewards.gold + (dailyData.totGoldA * 7) + mWeekly.gold;
    const totalBaseTicketB = finalRewards.ticket + (dailyData.rewards.ticket.before * 2 * 7) + mWeekly.ticket;
    const totalBaseTicketA = finalRewards.ticket + (dailyData.rewards.ticket.after * 2 * 7) + mWeekly.ticket;
    const totalPotionB = finalRewards.potion + (dailyData.totPotionB * 7) + mWeekly.pot;
    const totalPotionA = finalRewards.potion + (dailyData.totPotionA * 7) + mWeekly.pot;
    const totalBaseEggshellB = finalRewards.eggshell + (dailyData.totEggshellB * 7) + mWeekly.egg;
    const totalBaseEggshellA = finalRewards.eggshell + (dailyData.totEggshellA * 7) + mWeekly.egg;
    const finalMountKeyB = finalRewards.mountKey + mWeekly.key;
    const finalMountKeyA = finalRewards.mountKey + mWeekly.key;
    const finalGreenPotionB = finalRewards.greenPotion + mWeekly.gp;
    const finalGreenPotionA = finalRewards.greenPotion + mWeekly.gp;

    const renderCalcGroup = (valBefore, valAfter, iconName, formatType = 'smart') => {
        const iconHtml = iconName ? `<img src="icons/${iconName}" class="calc-icon-left" style="margin-right: 4px;" onerror="this.style.display='none'">` : '';
        const fmt = (v) => {
            const safeV = isNaN(v) ? 0 : v;
            if (formatType === 'gold') {
                if (safeV < 10000) return Math.round(safeV).toLocaleString('en-US');
                if (safeV < 1000000) return parseFloat((safeV / 1000).toFixed(1)) + 'k';
                return parseFloat((safeV / 1000000).toFixed(2)) + 'm';
            }
            return Math.round(safeV).toLocaleString('en-US');
        };
        
        const strB = fmt(valBefore || 0); const strA = fmt(valAfter || 0);
        if (Math.abs((valBefore || 0) - (valAfter || 0)) < 0.001 || strB === strA) {
            return `<span class="calc-val-before single-val">${iconHtml}${strB}</span>`;
        } else {
            return `<span class="calc-val-before">${iconHtml}${strB}</span>
                    <span class="calc-val-after"><span class="calc-arrow" style="margin-right: 4px;">➜</span>${iconHtml}${strA}</span>`;
        }
    };

    const setBreakdown = (id, b, a, icon, formatType = 'smart') => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = renderCalcGroup(b, a, icon, formatType);
    };

    setBreakdown('weekly-base-hammer', totalHammerB, totalHammerA, 'fm_hammer.png', 'whole');
    setBreakdown('weekly-base-gold', totalBaseGoldB, totalBaseGoldA, 'fm_gold.png', 'gold');
    setBreakdown('weekly-base-ticket', totalBaseTicketB, totalBaseTicketA, 'green_ticket.png', 'whole');
    setBreakdown('weekly-base-eggshell', totalBaseEggshellB, totalBaseEggshellA, 'eggshell.png', 'whole');
    setBreakdown('weekly-base-potion', totalPotionB, totalPotionA, 'red_potion.png', 'whole');
    setBreakdown('weekly-base-mountkey', finalMountKeyB, finalMountKeyA, 'mount_key.png', 'whole');
    setBreakdown('weekly-base-greenpotion', finalGreenPotionB, finalGreenPotionA, 'green_potion.png', 'whole');

    // ------------------------------------------
    // Ascension Progress (ETA) Math
    // ------------------------------------------
    const getExpDiff = (type, db, isTarget = false) => {
        if (!db || typeof getCumulativePulls !== 'function') return isTarget ? null : 0;
        
        let cLv = parseInt(document.getElementById(`asc-${type}-lv`)?.value) || 1;
        let cExp = parseInt(document.getElementById(`asc-${type}-exp`)?.value) || 0;
        let cAsc = parseInt(document.getElementById(`asc-${type}-asc`)?.value) || 0;
        
        let tLv, tAsc;
        
        if (isTarget) {
            tLv = parseInt(document.getElementById(`asc-${type}-target-lv`)?.value);
            tAsc = parseInt(document.getElementById(`asc-${type}-target-asc`)?.value) || 0;
            if (isNaN(tLv) || tLv < 1) return null; 
        } else {
            tLv = 100;
            tAsc = cAsc; 
        }

        let currentCum = getCumulativePulls(cLv, cExp, db, cAsc);
        let targetCum = getCumulativePulls(tLv, 0, db, tAsc);
        
        return Math.max(0, targetCum - currentCum);
    };

    const skillDb = typeof SKILL_LEVEL_DATA !== 'undefined' ? SKILL_LEVEL_DATA : null;
    const petDb = typeof PET_LEVEL_DATA !== 'undefined' ? PET_LEVEL_DATA : null;
    const mountDb = typeof MOUNT_LEVEL_DATA !== 'undefined' ? MOUNT_LEVEL_DATA : null;

    const skillRem = getExpDiff('skill', skillDb, false);
    const petRem = getExpDiff('pet', petDb, false);
    const mountRem = getExpDiff('mount', mountDb, false);

    const skillRemTarget = getExpDiff('skill', skillDb, true);
    const petRemTarget = getExpDiff('pet', petDb, true);
    const mountRemTarget = getExpDiff('mount', mountDb, true);

    const getInvVal = (id) => {
        const el = document.getElementById(id);
        return el && el.value ? parseFloat(el.value.replace(/,/g, '')) || 0 : 0;
    };
    
    const invSkill = getInvVal('asc-skill-inv');
    const invPet = getInvVal('asc-pet-inv');
    const invMount = getInvVal('asc-mount-inv');

    const leagueMYieldB = (finalMountKeyB / safeCostB) * (1 + (techMountChance.before * 2) / 100);
    const leagueMYieldA = (finalMountKeyA / safeCostA) * (1 + (techMountChance.after * 2) / 100);

    const skillInvYieldB = Math.floor(invSkill / (costB <= 0 ? 200 : costB)) * 5;
    const skillInvYieldA = Math.floor(invSkill / (costA <= 0 ? 200 : costA)) * 5;
    
    const petInvYieldB = Math.floor(invPet / 100) * luckyMultB;
    const petInvYieldA = Math.floor(invPet / 100) * luckyMultA;
    
    const mountInvYieldB = Math.floor(invMount / safeCostB) * (1 + (techMountChance.before * 2) / 100);
    const mountInvYieldA = Math.floor(invMount / safeCostA) * (1 + (techMountChance.after * 2) / 100);

    const adjSkillRemB = Math.max(0, skillRem - skillInvYieldB);
    const adjSkillRemA = Math.max(0, skillRem - skillInvYieldA);
    const adjPetRemB = Math.max(0, petRem - petInvYieldB);
    const adjPetRemA = Math.max(0, petRem - petInvYieldA);
    const adjMountRemB = Math.max(0, mountRem - mountInvYieldB);
    const adjMountRemA = Math.max(0, mountRem - mountInvYieldA);

    const adjSkillRemTargetB = skillRemTarget !== null ? Math.max(0, skillRemTarget - skillInvYieldB) : null;
    const adjSkillRemTargetA = skillRemTarget !== null ? Math.max(0, skillRemTarget - skillInvYieldA) : null;
    const adjPetRemTargetB = petRemTarget !== null ? Math.max(0, petRemTarget - petInvYieldB) : null;
    const adjPetRemTargetA = petRemTarget !== null ? Math.max(0, petRemTarget - petInvYieldA) : null;
    const adjMountRemTargetB = mountRemTarget !== null ? Math.max(0, mountRemTarget - mountInvYieldB) : null;
    const adjMountRemTargetA = mountRemTarget !== null ? Math.max(0, mountRemTarget - mountInvYieldA) : null;

    const totalCardsB = (totalBaseTicketB / (costB <= 0 ? 200 : costB)) * 5;
    const totalCardsA = (totalBaseTicketA / (costA <= 0 ? 200 : costA)) * 5;
    const totalEggsB = (totalBaseEggshellB / 100) * luckyMultB;
    const totalEggsA = (totalBaseEggshellA / 100) * luckyMultA;

    const weeksSkillB = totalCardsB > 0 ? (adjSkillRemB / totalCardsB) : Infinity;
    const weeksSkillA = totalCardsA > 0 ? (adjSkillRemA / totalCardsA) : Infinity;
    const weeksPetB = totalEggsB > 0 ? (adjPetRemB / totalEggsB) : Infinity;
    const weeksPetA = totalEggsA > 0 ? (adjPetRemA / totalEggsA) : Infinity;
    const weeksMountB = leagueMYieldB > 0 ? (adjMountRemB / leagueMYieldB) : Infinity;
    const weeksMountA = leagueMYieldA > 0 ? (adjMountRemA / leagueMYieldA) : Infinity;

    const weeksSkillTargetB = skillRemTarget !== null ? (totalCardsB > 0 ? (adjSkillRemTargetB / totalCardsB) : Infinity) : null;
    const weeksSkillTargetA = skillRemTarget !== null ? (totalCardsA > 0 ? (adjSkillRemTargetA / totalCardsA) : Infinity) : null;
    const weeksPetTargetB = petRemTarget !== null ? (totalEggsB > 0 ? (adjPetRemTargetB / totalEggsB) : Infinity) : null;
    const weeksPetTargetA = petRemTarget !== null ? (totalEggsA > 0 ? (adjPetRemTargetA / totalEggsA) : Infinity) : null;
    const weeksMountTargetB = mountRemTarget !== null ? (leagueMYieldB > 0 ? (adjMountRemTargetB / leagueMYieldB) : Infinity) : null;
    const weeksMountTargetA = mountRemTarget !== null ? (leagueMYieldA > 0 ? (adjMountRemTargetA / leagueMYieldA) : Infinity) : null;

    const formatAsc = (wB, wA, remB, remA, isTargetMode = false) => {
        const doneText = isTargetMode ? "Reached" : "MAX";
        
        if (isTargetMode && (remB === null || remA === null)) {
            return `<span class="calc-val-before single-val" style="color: #bbb;">--</span>`;
        }
        if (remB <= 0 && remA <= 0) return `<span class="calc-val-before single-val">${doneText}</span>`;
        
        const fmt = (v, remainingExp) => {
            if (remainingExp <= 0) return doneText;
            if (v === Infinity || isNaN(v)) return "∞";
            if (v < 10) return v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            return v.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
        }
        
        const sB = fmt(wB, remB); 
        const sA = fmt(wA, remA);
        
        if (sB === sA) {
            return `<span class="calc-val-before single-val">${sB}</span>`;
        } else {
            return `<span class="calc-val-before">${sB}</span><span class="calc-val-after"><span class="calc-arrow" style="margin-right: 4px;">➜</span>${sA}</span>`;
        }
    };

    const setText = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    setText('asc-res-skill', formatAsc(weeksSkillB, weeksSkillA, adjSkillRemB, adjSkillRemA));
    setText('asc-res-pet', formatAsc(weeksPetB, weeksPetA, adjPetRemB, adjPetRemA));
    setText('asc-res-mount', formatAsc(weeksMountB, weeksMountA, adjMountRemB, adjMountRemA));

    setText('asc-res-skill-target', formatAsc(weeksSkillTargetB, weeksSkillTargetA, adjSkillRemTargetB, adjSkillRemTargetA, true));
    setText('asc-res-pet-target', formatAsc(weeksPetTargetB, weeksPetTargetA, adjPetRemTargetB, adjPetRemTargetA, true));
    setText('asc-res-mount-target', formatAsc(weeksMountTargetB, weeksMountTargetA, adjMountRemTargetB, adjMountRemTargetA, true));
}

// ------------------------------------------
// Initialize & Sync Listeners
// ------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateAscensionCaps('skill');
    updateAscensionCaps('pet');
    updateAscensionCaps('mount');
    updateWeekly();
});