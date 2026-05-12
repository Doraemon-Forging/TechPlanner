/**
 * WEEKLY.JS 
 * Logic for Weekly League, Clan War, Individual Rewards, and Ascension ETA.
 */

// ==========================================
// 1. UI CONTROLS & TOGGLES 
// ==========================================
function toggleWeeklyTab(tab) {
    const btnDaily = document.getElementById('btn-weekly-daily');
    const btnTotal = document.getElementById('btn-weekly-total');
    const btnLeague = document.getElementById('btn-weekly-league');

    const viewDaily = document.getElementById('weekly-tab-daily');
    const viewTotal = document.getElementById('weekly-tab-total');
    const viewLeague = document.getElementById('weekly-tab-league');

    if (btnDaily) btnDaily.classList.remove('active');
    if (btnTotal) btnTotal.classList.remove('active');
    if (btnLeague) btnLeague.classList.remove('active');

    if (viewDaily) viewDaily.style.display = 'none';
    if (viewTotal) viewTotal.style.display = 'none';
    if (viewLeague) viewLeague.style.display = 'none';

    if (tab === 'daily') {
        if (btnDaily) btnDaily.classList.add('active');
        if (viewDaily) viewDaily.style.display = 'block';
    } else if (tab === 'total') {
        if (btnTotal) btnTotal.classList.add('active');
        if (viewTotal) viewTotal.style.display = 'block';
    } else if (tab === 'league') {
        if (btnLeague) btnLeague.classList.add('active');
        if (viewLeague) viewLeague.style.display = 'block';
    }
}

// ==========================================
// 2. ASCENSION DYNAMIC UI
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
// 3. MAIN UPDATE LOGIC
// ==========================================
function updateWeekly() {
    const getStrVal = (id, defaultVal = "") => document.getElementById(id)?.value || defaultVal;
    
    const league = getStrVal('weekly-league', 'Unranked');
    const rank = getStrVal('weekly-rank', '1st');
    const clanTier = getStrVal('weekly-war-tier', 'None');
    const clanWin = getStrVal('weekly-war-win', 'Lose');
    const indivTier = getStrVal('weekly-indiv', 'None');

    const lRewards = (typeof LEAGUE_REWARDS !== 'undefined' && LEAGUE_REWARDS[league] && LEAGUE_REWARDS[league][rank]) ? LEAGUE_REWARDS[league][rank] : [0,0,0,0,0,0,0];
    const cRewards = (typeof CLAN_WAR_REWARDS !== 'undefined' && CLAN_WAR_REWARDS[clanTier] && CLAN_WAR_REWARDS[clanTier][clanWin]) ? CLAN_WAR_REWARDS[clanTier][clanWin] : [0,0,0,0,0,0,0];

    let iRewards = [0, 0, 0, 0, 0, 0, 0];
    if (typeof INDIV_REWARDS !== 'undefined') {
        const targetVal = INDIV_REWARDS[indivTier] ? INDIV_REWARDS[indivTier].val : 0;
        for (const key in INDIV_REWARDS) {
            if (INDIV_REWARDS[key].val <= targetVal) {
                const tierRew = INDIV_REWARDS[key].rewards || [0,0,0,0,0,0,0];
                for (let i = 0; i < 7; i++) iRewards[i] += tierRew[i];
            }
        }
    }

    const setBd = (id, val, formatType = 'whole') => {
        const el = document.getElementById(id);
        if (!el) return;
        if (!val || val === 0) {
            el.innerText = "-";
            return;
        }
        if (formatType === 'gold') {
            if (val < 10000) el.innerText = Math.round(val).toLocaleString('en-US');
            else if (val < 1000000) el.innerText = parseFloat((val / 1000).toFixed(1)) + 'k';
            else el.innerText = parseFloat((val / 1000000).toFixed(2)) + 'm';
        } else {
            el.innerText = Math.round(val).toLocaleString('en-US');
        }
    };

    setBd('bd-league-hammer', lRewards[0], 'whole');
    setBd('bd-league-gold', lRewards[1], 'gold');
    setBd('bd-league-ticket', lRewards[2], 'whole');
    setBd('bd-league-eggshell', lRewards[3], 'whole');
    setBd('bd-league-potion', lRewards[4], 'gold');
    setBd('bd-league-mountkey', lRewards[5], 'whole');
    setBd('bd-league-greenpotion', lRewards[6], 'whole');

    setBd('bd-war-hammer', cRewards[0], 'whole');
    setBd('bd-war-gold', cRewards[1], 'gold');
    setBd('bd-war-ticket', cRewards[2], 'whole');
    setBd('bd-war-eggshell', cRewards[3], 'whole');
    setBd('bd-war-potion', cRewards[4], 'gold');
    setBd('bd-war-mountkey', cRewards[5], 'whole');
    setBd('bd-war-greenpotion', cRewards[6], 'whole');

    setBd('bd-indiv-hammer', iRewards[0], 'whole');
    setBd('bd-indiv-gold', iRewards[1], 'gold');
    setBd('bd-indiv-ticket', iRewards[2], 'whole');
    setBd('bd-indiv-eggshell', iRewards[3], 'whole');
    setBd('bd-indiv-potion', iRewards[4], 'gold');
    setBd('bd-indiv-mountkey', iRewards[5], 'whole');
    setBd('bd-indiv-greenpotion', iRewards[6], 'whole');

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
    const safeCostB = Math.max(1, Math.ceil(50 * (1 - (techMountCost.before * 1) / 100)));
    const safeCostA = Math.max(1, Math.ceil(50 * (1 - (techMountCost.after * 1) / 100)));

    const dailyData = typeof calculateDailyMath === 'function' ? calculateDailyMath() : null;
    if (!dailyData) return; 

    const freeB = 1 - (dailyData.curStats.free || 0) / 100;
    const freeA = 1 - (dailyData.projStats.free || 0) / 100;

    let leagueEffHB = finalRewards.hammer / (freeB <= 0 ? 1 : freeB);
    let leagueEffHA = finalRewards.hammer / (freeA <= 0 ? 1 : freeA);
    let leagueGrandGoldB = finalRewards.gold + (leagueEffHB * (dailyData.curStats.avgGold || 0));
    let leagueGrandGoldA = finalRewards.gold + (leagueEffHA * (dailyData.projStats.avgGold || 0));
    let leagueCardsB = (finalRewards.ticket / (costB <= 0 ? 200 : costB)) * 5;
    let leagueCardsA = (finalRewards.ticket / (costA <= 0 ? 200 : costA)) * 5;
    
    let leagueEggsB = (finalRewards.eggshell / 100) * luckyMultB;
    let leagueEggsA = (finalRewards.eggshell / 100) * luckyMultA;
    
    let leagueMYieldB = (finalRewards.mountKey / safeCostB) * (1 + (techMountChance.before * 2) / 100);
    let leagueMYieldA = (finalRewards.mountKey / safeCostA) * (1 + (techMountChance.after * 2) / 100);

    const totalHammerB = finalRewards.hammer + (dailyData.totHammerB * 7);
    const totalHammerA = finalRewards.hammer + (dailyData.totHammerA * 7);
    const totalBaseGoldB = finalRewards.gold + (dailyData.totGoldB * 7);
    const totalBaseGoldA = finalRewards.gold + (dailyData.totGoldA * 7);
    const totalBaseTicketB = finalRewards.ticket + (dailyData.rewards.ticket.before * 2 * 7);
    const totalBaseTicketA = finalRewards.ticket + (dailyData.rewards.ticket.after * 2 * 7);
    const totalEffHB = leagueEffHB + (dailyData.effHB * 7);
    const totalEffHA = leagueEffHA + (dailyData.effHA * 7);
    const totalGrandGoldB = leagueGrandGoldB + (dailyData.grandTotalB * 7);
    const totalGrandGoldA = leagueGrandGoldA + (dailyData.grandTotalA * 7);
    const totalCardsB = leagueCardsB + (dailyData.totCardsB * 7);
    const totalCardsA = leagueCardsA + (dailyData.totCardsA * 7);
    const totalEggsB = leagueEggsB + (dailyData.totEggB * 7);
    const totalEggsA = leagueEggsA + (dailyData.totEggA * 7);
    const totalPotionB = finalRewards.potion + (dailyData.totPotionB * 7);
    const totalPotionA = finalRewards.potion + (dailyData.totPotionA * 7);
    const totalBaseEggshellB = finalRewards.eggshell + (dailyData.totEggshellB * 7);
    const totalBaseEggshellA = finalRewards.eggshell + (dailyData.totEggshellA * 7);

    const renderCalcGroup = (valBefore, valAfter, iconName, formatType = 'smart') => {
        const iconHtml = iconName ? `<img src="icons/${iconName}" class="calc-icon-left" style="margin-right: 4px;" onerror="this.style.display='none'">` : '';
        const fmt = (v) => {
            const safeV = isNaN(v) ? 0 : v;
            if (formatType === 'gold') {
                if (safeV < 10000) return Math.round(safeV).toLocaleString('en-US');
                if (safeV < 1000000) return parseFloat((safeV / 1000).toFixed(1)) + 'k';
                return parseFloat((safeV / 1000000).toFixed(2)) + 'm';
            }
            if (formatType === 'whole') return Math.round(safeV).toLocaleString('en-US');
            if (formatType === 'egg') {
                if (safeV === 0) return "0";
                if (safeV <= 10) return safeV.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
                return safeV.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
            }
            if (safeV === 0) return "0";
            if (safeV < 10) return safeV.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
            return safeV.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
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

    const processTab = (prefix, stats) => {
        setBreakdown(`${prefix}-base-hammer`, stats.baseHammerB, stats.baseHammerA, 'fm_hammer.png', 'whole');
        setBreakdown(`${prefix}-base-gold`, stats.baseGoldB, stats.baseGoldA, 'fm_gold.png', 'gold');
        setBreakdown(`${prefix}-base-ticket`, stats.baseTicketB, stats.baseTicketA, 'green_ticket.png', 'whole');
        setBreakdown(`${prefix}-base-eggshell`, stats.baseEggshellB, stats.baseEggshellA, 'eggshell.png', 'whole');
        setBreakdown(`${prefix}-base-potion`, stats.basePotionB, stats.basePotionA, 'red_potion.png', 'gold');
        setBreakdown(`${prefix}-base-mountkey`, stats.baseMountKeyB, stats.baseMountKeyA, 'mount_key.png', 'whole');
        setBreakdown(`${prefix}-base-greenpotion`, stats.baseGreenPotionB, stats.baseGreenPotionA, 'green_potion.png', 'whole');

        setBreakdown(`res-${prefix}-eff-hammer`, stats.effHB, stats.effHA, 'fm_hammer.png', 'whole');
        setBreakdown(`res-${prefix}-grand`, stats.grandB, stats.grandA, 'fm_gold.png', 'gold');
        setBreakdown(`res-${prefix}-cards`, stats.cardsB, stats.cardsA, null, 'smart');
        setBreakdown(`res-${prefix}-eggs`, stats.eggsB, stats.eggsA, 'EggCommon.png', 'egg'); 
        setBreakdown(`res-${prefix}-mounts`, stats.mountsB, stats.mountsA, null, 'smart');
    };

    processTab('weekly', {
        baseHammerB: totalHammerB,         baseHammerA: totalHammerA,
        baseGoldB: totalBaseGoldB,         baseGoldA: totalBaseGoldA,
        baseTicketB: totalBaseTicketB,     baseTicketA: totalBaseTicketA,
        baseEggshellB: totalBaseEggshellB, baseEggshellA: totalBaseEggshellA,
        basePotionB: totalPotionB,         basePotionA: totalPotionA,
        baseMountKeyB: finalRewards.mountKey, baseMountKeyA: finalRewards.mountKey,
        baseGreenPotionB: finalRewards.greenPotion, baseGreenPotionA: finalRewards.greenPotion,
        effHB: totalEffHB,                 effHA: totalEffHA,
        grandB: totalGrandGoldB,           grandA: totalGrandGoldA,
        cardsB: totalCardsB,               cardsA: totalCardsA,
        eggsB: totalEggsB,                 eggsA: totalEggsA,
        mountsB: leagueMYieldB,            mountsA: leagueMYieldA
    });

    processTab('league', {
        baseHammerB: finalRewards.hammer,  baseHammerA: finalRewards.hammer,
        baseGoldB: finalRewards.gold,      baseGoldA: finalRewards.gold,
        baseTicketB: finalRewards.ticket,  baseTicketA: finalRewards.ticket,
        baseEggshellB: finalRewards.eggshell, baseEggshellA: finalRewards.eggshell,
        basePotionB: finalRewards.potion,  basePotionA: finalRewards.potion,
        baseMountKeyB: finalRewards.mountKey, baseMountKeyA: finalRewards.mountKey,
        baseGreenPotionB: finalRewards.greenPotion, baseGreenPotionA: finalRewards.greenPotion,
        effHB: leagueEffHB,                effHA: leagueEffHA,
        grandB: leagueGrandGoldB,          grandA: leagueGrandGoldA,
        cardsB: leagueCardsB,              cardsA: leagueCardsA,
        eggsB: leagueEggsB,                eggsA: leagueEggsA,
        mountsB: leagueMYieldB,            mountsA: leagueMYieldA
    });

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