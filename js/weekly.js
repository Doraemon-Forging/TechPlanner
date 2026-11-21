/**
 * WEEKLY.JS
 * Logic for Daily Totals, Weekly Overview, Individual Rewards,
 * Ascension ETA, and Weekly/Mission Modals
 */

// ============================================================================
// 1. CONSTANTS & ASCENSION DYNAMIC UI
// ============================================================================

const LEAGUES_ORDER = ['Diamond III', 'Diamond II', 'Diamond I', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];
const LEAGUES_LABELS = ['Dmd III', 'Dmd II', 'Dmd I', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Unranked'];

function updateAscensionCaps(type) {
    const lvEl = document.getElementById(`asc-${type}-lv`);
    const expEl = document.getElementById(`asc-${type}-exp`);
    const maxEl = document.getElementById(`asc-${type}-max`);
    const ascEl = document.getElementById(`asc-${type}-asc`);
    const targetLvEl = document.getElementById(`asc-${type}-target-lv`);
    const targetAscEl = document.getElementById(`asc-${type}-target-asc`);

    if (!lvEl || !maxEl || !expEl) return;

    let db = null;
    if (type === 'skill' && typeof SKILL_LEVEL_DATA !== 'undefined') db = SKILL_LEVEL_DATA;
    if (type === 'pet' && typeof PET_LEVEL_DATA !== 'undefined') db = PET_LEVEL_DATA;
    if (type === 'mount' && typeof MOUNT_LEVEL_DATA !== 'undefined') db = MOUNT_LEVEL_DATA;

    const asc = parseInt(ascEl?.value) || 0;
    const maxAscLv = (asc >= 3 && db && db[150]) ? 150 : 100;

    let rawLv = parseInt(lvEl.value);
    let lv = isNaN(rawLv) ? 1 : rawLv;
    if (lv < 1) lv = 1;

    if (rawLv > maxAscLv) {
        lv = maxAscLv;
        lvEl.value = maxAscLv;
    }

    if (targetLvEl && targetLvEl.value !== '') {
        const targetAsc = parseInt(targetAscEl?.value) || 0;
        const maxTargetLv = (targetAsc >= 3 && db && db[150]) ? 150 : 100;
        let rawTargetLv = parseInt(targetLvEl.value);
        if (!isNaN(rawTargetLv) && rawTargetLv > maxTargetLv) {
            targetLvEl.value = maxTargetLv;
        }
    }

    if (db && db[lv]) {
        let maxExp = db[lv][0];
        if (maxExp === "MAX" || lv >= maxAscLv) {
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

// ============================================================================
// 2. LEAGUE ALTERNATING LOGIC
// ============================================================================

function toggleLeagueMode() {
    const mode = document.getElementById('weekly-league-mode')?.value;
    const rowAlt = document.getElementById('row-league-alt');
    if (rowAlt) {
        rowAlt.style.display = (mode === 'Alternating') ? 'flex' : 'none';
    }
}

function updateSecondaryLeagueOptions() {
    const league1 = document.getElementById('weekly-league')?.value;
    const league2Select = document.getElementById('weekly-league-2');
    if (!league1 || !league2Select) return;

    const currentVal2 = league2Select.value;
    league2Select.innerHTML = '';

    const idx = LEAGUES_ORDER.indexOf(league1);
    if (idx === -1) return;

    const addOption = (i) => {
        if (i >= 0 && i < LEAGUES_ORDER.length) {
            const opt = document.createElement('option');
            opt.value = LEAGUES_ORDER[i];
            opt.text = LEAGUES_LABELS[i];
            league2Select.appendChild(opt);
        }
    };

    addOption(idx - 1);
    addOption(idx);
    addOption(idx + 1);

    if (Array.from(league2Select.options).some(o => o.value === currentVal2)) {
        league2Select.value = currentVal2;
    } else {
        league2Select.value = LEAGUES_ORDER[idx];
    }
}

// ============================================================================
// 3. DAILY & MISSION YIELD CALCULATORS
// ============================================================================

function getDungeonLevels() {
    const getVal = (id) => parseInt(document.getElementById(id)?.value) || 1;
    return {
        thief:  { lvl: getVal('thief-lvl'),  sub: getVal('thief-sub') },
        ghost:  { lvl: getVal('ghost-lvl'),  sub: getVal('ghost-sub') },
        inv:    { lvl: getVal('inv-lvl'),    sub: getVal('inv-sub') },
        zombie: { lvl: getVal('zombie-lvl'), sub: getVal('zombie-sub') }
    };
}

function calculateDailyMath() {
    const dLvl = getDungeonLevels();
    const steps = {
        thief:  (dLvl.thief.lvl - 1) * 10 + (dLvl.thief.sub - 1),
        ghost:  (dLvl.ghost.lvl - 1) * 10 + (dLvl.ghost.sub - 1),
        inv:    (dLvl.inv.lvl - 1) * 10 + (dLvl.inv.sub - 1),
        zombie: (dLvl.zombie.lvl - 1) * 10 + (dLvl.zombie.sub - 1)
    };

    const base = {
        hammer:   60 + (steps.thief * 1),
        gold:     4000 + (steps.thief * 100),
        ticket:   200 + (steps.ghost * 2),
        eggshell: 200 + Math.floor((13 * steps.inv + 9) / 20),
        potion:   100 + (steps.zombie * 1)
    };

    const getTechBonus = (tree, nodeId, percentPerLevel) => {
        let beforeLvl = 0, afterLvl = 0;
        if (typeof setupLevels !== 'undefined' && setupLevels) {
            for (let t = 1; t <= 6; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
        }
        let planState = typeof calcState === 'function' ? calcState().levels : setupLevels;
        if (planState) {
            for (let t = 1; t <= 6; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
        }
        return { before: beforeLvl * percentPerLevel, after: afterLvl * percentPerLevel };
    };

    const hBonus     = getTechBonus('forge', 'h_bonus', typeof TREES !== 'undefined' && TREES.forge.meta.h_bonus.val ? TREES.forge.meta.h_bonus.val : 1);
    const cBonus     = getTechBonus('forge', 'c_bonus', typeof TREES !== 'undefined' && TREES.forge.meta.c_bonus.val ? TREES.forge.meta.c_bonus.val : 2);
    const keyG       = getTechBonus('spt', 'key_g', typeof TREES !== 'undefined' && TREES.spt.meta.key_g.val ? TREES.spt.meta.key_g.val : 1);
    const keyR       = getTechBonus('spt', 'key_r', typeof TREES !== 'undefined' && TREES.spt.meta.key_r.val ? TREES.spt.meta.key_r.val : 2);
    const summonCost = getTechBonus('spt', 'ticket', typeof TREES !== 'undefined' && TREES.spt.meta.ticket.val ? TREES.spt.meta.ticket.val : 1);
    const lucky      = getTechBonus('spt', 'lucky', typeof TREES !== 'undefined' && TREES.spt.meta.lucky.val ? TREES.spt.meta.lucky.val : 2);

    const rewards = {
        hammer:   { before: Math.round(base.hammer * (1 + (hBonus.before / 100))), after: Math.round(base.hammer * (1 + (hBonus.after / 100))) },
        gold:     { before: Math.round(base.gold * (1 + (cBonus.before / 100))),   after: Math.round(base.gold * (1 + (cBonus.after / 100))) },
        ticket:   { before: Math.round(base.ticket * (1 + (keyG.before / 100))),   after: Math.round(base.ticket * (1 + (keyG.after / 100))) },
        eggshell: { before: base.eggshell,                                         after: base.eggshell },
        potion:   { before: Math.round(base.potion * (1 + (keyR.before / 100))),   after: Math.round(base.potion * (1 + (keyR.after / 100))) }
    };

    let curStats = { offH: 0, offC: 0, free: 0, avgGold: 0 };
    if (typeof getTechBonuses === 'function' && typeof setupLevels !== 'undefined') curStats = getTechBonuses(setupLevels) || curStats;

    let projStats = curStats;
    if (typeof getTechBonuses === 'function' && typeof calcState === 'function') {
        const stateObj = calcState();
        if (stateObj && stateObj.levels) projStats = getTechBonuses(stateObj.levels) || curStats;
    }

    const freeB = 1 - (curStats.free || 0) / 100;
    const freeA = 1 - (projStats.free || 0) / 100;

    const effHB = ((1440 * (1 + (curStats.offH || 0) / 100)) + (rewards.hammer.before * 2)) / (freeB <= 0 ? 1 : freeB);
    const effHA = ((1440 * (1 + (projStats.offH || 0) / 100)) + (rewards.hammer.after * 2)) / (freeA <= 0 ? 1 : freeA);

    const totGoldB = (86400 * (1 + (curStats.offC || 0) / 100)) + (rewards.gold.before * 2);
    const totGoldA = (86400 * (1 + (projStats.offC || 0) / 100)) + (rewards.gold.after * 2);

    const modalData = {
        offHB: 1440 * (1 + (curStats.offH || 0) / 100),
        offHA: 1440 * (1 + (projStats.offH || 0) / 100),
        thiefHB: rewards.hammer.before * 2,
        thiefHA: rewards.hammer.after * 2,
        effHB: effHB,
        effHA: effHA,
        offGB: 86400 * (1 + (curStats.offC || 0) / 100),
        offGA: 86400 * (1 + (projStats.offC || 0) / 100),
        thiefGB: rewards.gold.before * 2,
        thiefGA: rewards.gold.after * 2,
        avgGB: curStats.avgGold || 0,
        avgGA: projStats.avgGold || 0,
        forgeGB: effHB * (curStats.avgGold || 0),
        forgeGA: effHA * (projStats.avgGold || 0)
    };

    return {
        modalData: modalData,
        rewards: rewards,
        curStats: curStats,
        projStats: projStats,
        totHammerB: (1440 * (1 + (curStats.offH || 0) / 100)) + (rewards.hammer.before * 2),
        totHammerA: (1440 * (1 + (projStats.offH || 0) / 100)) + (rewards.hammer.after * 2),
        totGoldB: totGoldB,
        totGoldA: totGoldA,
        effHB: effHB,
        effHA: effHA,
        grandTotalB: totGoldB + (effHB * (curStats.avgGold || 0)),
        grandTotalA: totGoldA + (effHA * (projStats.avgGold || 0)),
        totPotionB: rewards.potion.before * 2,
        totPotionA: rewards.potion.after * 2,
        totEggshellB: rewards.eggshell.before * 2,
        totEggshellA: rewards.eggshell.after * 2,
        totEggB: ((rewards.eggshell.before * 2) / 100) * (1 + (lucky.before / 100)),
        totEggA: ((rewards.eggshell.after * 2) / 100) * (1 + (lucky.after / 100)),
        totCardsB: ((rewards.ticket.before * 2) / (200 * (1 - summonCost.before / 100))) * 5,
        totCardsA: ((rewards.ticket.after * 2) / (200 * (1 - summonCost.after / 100))) * 5
    };
}

function getMissionSlots() {
    const getVal = (id) => {
        const el = document.getElementById(`ms-slot-${id}`);
        if (el) return parseFloat(el.value) || 0;
        return parseFloat(window.missionSlotsMemory?.[id]) || 0;
    };

    return {
        gold: getVal('gold'),
        ticket: getVal('ticket'),
        egg: getVal('egg'),
        pot: getVal('pot'),
        key: getVal('key'),
        gp: getVal('gp'),
        rally: getVal('rally')
    };
}

function calculateMissionYields(lvl, sub, slots) {
    let th = ((lvl - 1) * 10) + sub;

    let minLv = 1, maxLv = 4;
    if (typeof MISSION_CHECKPOINTS !== 'undefined') {
        for (let i = 0; i < MISSION_CHECKPOINTS.length; i++) {
            if (th >= MISSION_CHECKPOINTS[i].th) {
                minLv = MISSION_CHECKPOINTS[i].min;
                maxLv = MISSION_CHECKPOINTS[i].max;
            } else break;
        }
    }

    const missionLvl = parseInt(window.clanTechMemory?.mission) || 0;
    const potMissionLvl = parseInt(window.clanTechMemory?.potMission) || 0;
    const potAsc = parseInt(document.getElementById('weekly-potion-asc')?.value) || 0;

    const generalTechMult = 1 + (missionLvl / 100);
    const gpCombinedMult = (1 + (potAsc / 100)) * (1 + (missionLvl / 100) + (potMissionLvl * 5 / 100));

    const getYield = (base, techMult) => {
        let sum = 0;
        for (let L = minLv; L <= maxLv; L++) {
            let levelBase = Math.round(base * Math.pow(1.01, L - 1));
            sum += Math.round(levelBase * techMult);
        }
        return sum / (maxLv - minLv + 1);
    };

    const getGPYield = () => {
        let sum = 0;
        for (let L = minLv; L <= maxLv; L++) {
            let base = 0;
            if (L <= 2) base = 3;
            else if (L <= 4) base = 4;
            else if (L <= 6) base = 5;
            else if (L <= 16) base = 6;
            else if (L <= 19) base = 7;
            else if (L <= 41) base = 8;
            else if (L <= 43) base = 9;
            else base = 10;

            sum += Math.round(base * gpCombinedMult);
        }
        return sum / (maxLv - minLv + 1);
    };

    const yields = {
        gold: getYield(MISSION_BASE_YIELDS.gold, generalTechMult),
        ticket: getYield(MISSION_BASE_YIELDS.ticket, generalTechMult),
        egg: getYield(MISSION_BASE_YIELDS.egg, generalTechMult),
        pot: getYield(MISSION_BASE_YIELDS.pot, generalTechMult),
        key: getYield(MISSION_BASE_YIELDS.key, generalTechMult),
        gp: getGPYield()
    };

    const totalSlots = Object.values(slots).reduce((a, b) => a + (parseFloat(b) || 0), 0);

    return {
        minLv,
        maxLv,
        dailyBase: yields,
        dailyTotal: {
            gold: yields.gold * (slots.gold || 0),
            ticket: yields.ticket * (slots.ticket || 0),
            egg: yields.egg * (slots.egg || 0),
            pot: yields.pot * (slots.pot || 0),
            key: yields.key * (slots.key || 0),
            gp: yields.gp * (slots.gp || 0)
        },
        totalSlots
    };
}

// ============================================================================
// 4. DAILY STORAGE & UI RENDERER
// ============================================================================

function initDailyDropdowns() {
    const dungeons = ['thief', 'ghost', 'inv', 'zombie'];
    dungeons.forEach(d => {
        const lvlSelect = document.getElementById(`${d}-lvl`);
        const subSelect = document.getElementById(`${d}-sub`);
        if (!lvlSelect || !subSelect) return;

        lvlSelect.innerHTML = '';
        subSelect.innerHTML = '';
        for (let i = 1; i <= 50; i++) lvlSelect.add(new Option(i, i));
        for (let i = 1; i <= 10; i++) subSelect.add(new Option(i, i));
    });
}

function saveDailyLocal() {
    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "1";
    const dailyData = {
        thiefLvl: getVal('thief-lvl'), thiefSub: getVal('thief-sub'),
        ghostLvl: getVal('ghost-lvl'), ghostSub: getVal('ghost-sub'),
        invLvl: getVal('inv-lvl'), invSub: getVal('inv-sub'),
        zombieLvl: getVal('zombie-lvl'), zombieSub: getVal('zombie-sub')
    };
    localStorage.setItem('dailySaveData', JSON.stringify(dailyData));
}

function loadDailyLocal() {
    try {
        const saved = localStorage.getItem('dailySaveData');
        if (saved) {
            const data = JSON.parse(saved);
            const setVal = (id, val) => { if (document.getElementById(id) && val) document.getElementById(id).value = val; };
            setVal('thief-lvl', data.thiefLvl); setVal('thief-sub', data.thiefSub);
            setVal('ghost-lvl', data.ghostLvl); setVal('ghost-sub', data.ghostSub);
            setVal('inv-lvl', data.invLvl); setVal('inv-sub', data.invSub);
            setVal('zombie-lvl', data.zombieLvl); setVal('zombie-sub', data.zombieSub);
        }
    } catch (e) {
        console.warn("Could not load Daily local save:", e);
    }
}

function updateDaily() {
    saveDailyLocal();
    const data = calculateDailyMath();

    const formatCompactGold = (val) => {
        if (val < 10000) return Math.floor(val).toLocaleString('en-US');
        if (val < 1000000) return parseFloat((Math.floor(val / 100) / 10).toFixed(1)) + 'k';
        return parseFloat((Math.floor(val / 10000) / 100).toFixed(2)) + 'm';
    };

    const formatSmartDecimal = (val) => {
        if (val === 0) return "0";
        if (val < 10) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const renderCalcGroup = (valBefore, valAfter, iconName, formatType = 'standard') => {
        const iconHtml = iconName ? `<img src="icons/${iconName}" class="calc-icon-left" style="margin-right: 1px;" onerror="this.style.display='none'">` : '';
        let fmtBefore, fmtAfter;

        if (formatType === 'smart') {
            fmtBefore = formatSmartDecimal(valBefore); fmtAfter = formatSmartDecimal(valAfter);
        } else if (formatType === 'gold') {
            fmtBefore = formatCompactGold(valBefore); fmtAfter = formatCompactGold(valAfter);
        } else {
            fmtBefore = Math.round(valBefore).toLocaleString('en-US'); fmtAfter = Math.round(valAfter).toLocaleString('en-US');
        }

        if (Math.abs(valBefore - valAfter) < 0.001 || fmtBefore === fmtAfter) {
            return `<span class="calc-val-before single-val">${iconHtml}${fmtBefore}</span>`;
        } else {
            return `<span class="calc-val-before">${iconHtml}${fmtBefore}</span>
                    <span class="calc-val-after"><span class="calc-arrow" style="margin-right: 4px;">➜</span>${iconHtml}${fmtAfter}</span>`;
        }
    };

    const safeRender = (id, vals, icon, formatType = 'standard') => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = renderCalcGroup(vals.before, vals.after, icon, formatType);
    };

    safeRender('res-hammer-group',   data.rewards.hammer,   'fm_hammer.png');
    safeRender('res-gold-group',     data.rewards.gold,     'fm_gold.png', 'gold');
    safeRender('res-ticket-group',   data.rewards.ticket,   'green_ticket.png');
    safeRender('res-eggshell-group', data.rewards.eggshell, 'eggshell.png');
    safeRender('res-potion-group',   data.rewards.potion,   'red_potion.png');

    safeRender('res-tot-hammer',  { before: data.totHammerB,  after: data.totHammerA },  'fm_hammer.png');
    safeRender('res-tot-gold',    { before: data.totGoldB,    after: data.totGoldA },    'fm_gold.png', 'gold');
    safeRender('res-tot-grand',   { before: data.grandTotalB, after: data.grandTotalA }, 'fm_gold.png', 'gold');
    safeRender('res-tot-potion',  { before: data.totPotionB,  after: data.totPotionA },  'red_potion.png');
    safeRender('res-tot-egg',     { before: data.totEggB,     after: data.totEggA },     'EggCommon.png', 'smart');
    safeRender('res-skill-cards', { before: data.totCardsB,   after: data.totCardsA },   null, 'smart');

    const infoGoldBtn = document.getElementById('btn-daily-info');
    if (infoGoldBtn) {
        infoGoldBtn.onclick = () => {
            if (typeof openDailyGoldModal === 'function') {
                openDailyGoldModal(data.modalData);
            }
        };
    }

    if (typeof updateWeekly === 'function') updateWeekly();
}

// ============================================================================
// 5. MAIN WEEKLY & ASCENSION ETA CALCULATOR
// ============================================================================

function updateWeekly() {
    const getStrVal = (id, defaultVal = "") => document.getElementById(id)?.value || defaultVal;

    const leagueMode = getStrVal('weekly-league-mode', 'Constant');
    const league1 = getStrVal('weekly-league', 'Unranked');
    const rank1 = getStrVal('weekly-rank', '1st');
    const league2 = getStrVal('weekly-league-2', 'Unranked');
    const rank2 = getStrVal('weekly-rank-2', '1st');

    const clanTier = getStrVal('weekly-war-tier', 'None');
    const indivTier = getStrVal('weekly-indiv', 'None');
    const raceRank = getStrVal('weekly-race', 'None');

    const winRateRaw = parseFloat(document.getElementById('weekly-war-win-rate')?.value);
    const winRate = isNaN(winRateRaw) ? 0 : Math.max(0, Math.min(100, winRateRaw));
    const winPct = winRate / 100;
    const losePct = 1 - winPct;

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
    const ctPotRace     = getCtVal('ct-pot-race', 'potRace');
    const potAsc = parseInt(document.getElementById('weekly-potion-asc')?.value) || 0;

    const ascPct = potAsc / 100;
    const gpAscMult = 1 + ascPct;
    const indivMult = 1 + (ctWarPersonal / 100);

    const warMultWin = 1 + (ctWarWin / 100);
    const warMultLose = 1 + (ctWarLose / 100);

    const getGpWarWinMult = () => (1 + ascPct + (ctWarWin / 100)) * (1 + (ctPotWin * 5 / 100));
    const getGpWarLoseMult = () => (1 + ascPct + (ctWarLose / 100)) * (1 + (ctPotLose * 5 / 100));
    const getGpIndivMult = () => (1 + ascPct + (ctWarPersonal / 100)) * (1 + (ctPotPersonal * 5 / 100));
    const getGpRaceMult = () => (1 + ascPct) * (1 + (ctPotRace * 5 / 100));

    const baseL1 = (typeof LEAGUE_REWARDS !== 'undefined' && LEAGUE_REWARDS[league1] && LEAGUE_REWARDS[league1][rank1])
        ? LEAGUE_REWARDS[league1][rank1]
        : [0, 0, 0, 0, 0, 0, 0];

    let baseL2 = baseL1;
    if (leagueMode === 'Alternating') {
        baseL2 = (typeof LEAGUE_REWARDS !== 'undefined' && LEAGUE_REWARDS[league2] && LEAGUE_REWARDS[league2][rank2])
            ? LEAGUE_REWARDS[league2][rank2]
            : [0, 0, 0, 0, 0, 0, 0];
    }

    const baseWinRewards = (typeof CLAN_WAR_REWARDS !== 'undefined' && CLAN_WAR_REWARDS[clanTier] && CLAN_WAR_REWARDS[clanTier]['Win'])
        ? CLAN_WAR_REWARDS[clanTier]['Win']
        : [0, 0, 0, 0, 0, 0, 0];

    const baseLoseRewards = (typeof CLAN_WAR_REWARDS !== 'undefined' && CLAN_WAR_REWARDS[clanTier] && CLAN_WAR_REWARDS[clanTier]['Lose'])
        ? CLAN_WAR_REWARDS[clanTier]['Lose']
        : [0, 0, 0, 0, 0, 0, 0];

    const lRewards = [0, 0, 0, 0, 0, 0, 0];
    const cRewards = [0, 0, 0, 0, 0, 0, 0];
    const iRewards = [0, 0, 0, 0, 0, 0, 0];

    for (let i = 0; i < 7; i++) {

        let avgBaseL = (baseL1[i] + baseL2[i]) / 2;

        let wReward = 0;
        let lReward = 0;

        if (i === 6) {
            lRewards[i] = Math.round(avgBaseL * gpAscMult);
            wReward = baseWinRewards[i] * getGpWarWinMult();
            lReward = baseLoseRewards[i] * getGpWarLoseMult();
        } else {
            lRewards[i] = Math.round(avgBaseL);
            wReward = baseWinRewards[i] * warMultWin;
            lReward = baseLoseRewards[i] * warMultLose;
        }

        cRewards[i] = Math.round((wReward * winPct) + (lReward * losePct));
    }

    if (typeof INDIV_REWARDS !== 'undefined') {
        const targetVal = INDIV_REWARDS[indivTier] ? INDIV_REWARDS[indivTier].val : 0;
        for (const key in INDIV_REWARDS) {
            if (INDIV_REWARDS[key].val <= targetVal) {
                const tierRew = INDIV_REWARDS[key].rewards || [0, 0, 0, 0, 0, 0, 0];
                for (let i = 0; i < 7; i++) {
                    if (i === 6) {
                        iRewards[i] += Math.round(tierRew[i] * getGpIndivMult());
                    } else {
                        iRewards[i] += Math.round(tierRew[i] * indivMult);
                    }
                }
            }
        }
    }

    let baseRaceGp = 0;
    if (raceRank === '1st') baseRaceGp = 800;
    else if (raceRank === '2nd') baseRaceGp = 300;
    else if (raceRank === '3rd') baseRaceGp = 150;
    else if (raceRank === '4th') baseRaceGp = 80;
    else if (raceRank === '5th') baseRaceGp = 40;
    else if (raceRank === '6th') baseRaceGp = 20;
    else if (raceRank === '7th') baseRaceGp = 10;

    const raceGpReward = Math.round(baseRaceGp * getGpRaceMult());

    const finalRewards = {
        hammer:      lRewards[0] + cRewards[0] + iRewards[0],
        gold:        lRewards[1] + cRewards[1] + iRewards[1],
        ticket:      lRewards[2] + cRewards[2] + iRewards[2],
        eggshell:    lRewards[3] + cRewards[3] + iRewards[3],
        potion:      lRewards[4] + cRewards[4] + iRewards[4],
        mountKey:    lRewards[5] + cRewards[5] + iRewards[5],
        greenPotion: lRewards[6] + cRewards[6] + iRewards[6] + raceGpReward
    };

    const getWeeklyTechVal = (tree, nodeId) => {
        let beforeLvl = 0, afterLvl = 0;
        if (typeof setupLevels !== 'undefined' && setupLevels) {
            for (let t = 1; t <= 6; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
        }
        let planState = typeof calcState === 'function' ? calcState().levels : setupLevels || {};
        for (let t = 1; t <= 6; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
        return { before: beforeLvl, after: afterLvl };
    };

    const techTicket = getWeeklyTechVal('spt', 'ticket');
    const costB = 200 * (1 - (techTicket.before * 1) / 100);
    const costA = 200 * (1 - (techTicket.after * 1) / 100);

    const techLucky = getWeeklyTechVal('spt', 'lucky');
    const luckyVal = (typeof TREES !== 'undefined' && TREES?.spt?.meta?.lucky?.val !== undefined)
        ? TREES.spt.meta.lucky.val
        : 2;
    const luckyMultB = 1 + ((techLucky.before * luckyVal) / 100);
    const luckyMultA = 1 + ((techLucky.after * luckyVal) / 100);

    const techMountCost = getWeeklyTechVal('power', 'mount_cost');
    const techMountChance = getWeeklyTechVal('power', 'mount_chance');
    const safeCostB = Math.max(1, 50 * (1 - (techMountCost.before * 1) / 100));
    const safeCostA = Math.max(1, 50 * (1 - (techMountCost.after * 1) / 100));

    const dailyData = typeof calculateDailyMath === 'function' ? calculateDailyMath() : null;
    if (!dailyData) return;

    const dLvl = typeof getDungeonLevels === 'function' ? getDungeonLevels() : { thief: { lvl: 1, sub: 1 } };
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
            Mission: { b: mWeekly.gp, a: mWeekly.gp },
            'Clan Race': { b: raceGpReward, a: raceGpReward }
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

        const strB = fmt(valBefore || 0);
        const strA = fmt(valAfter || 0);
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

    // ------------------------------------------------------------------------
    // Ascension Progress (ETA) Math
    // ------------------------------------------------------------------------
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
            const maxTargetLv = (tAsc >= 3 && db && db[150]) ? 150 : 100;
            if (tLv > maxTargetLv) tLv = maxTargetLv;
        } else {
            tLv = (cAsc >= 3 && db && db[150]) ? 150 : 100;
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
            if (v < 10) return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return v.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        };

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

// ============================================================================
// 6. INITIALIZATION & SYNC LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initDailyDropdowns();
    loadDailyLocal();
    updateSecondaryLeagueOptions();
    toggleLeagueMode();

    ['skill', 'pet', 'mount'].forEach(type => {
        updateAscensionCaps(type);
        const ascEl = document.getElementById(`asc-${type}-asc`);
        if (ascEl) {
            ascEl.addEventListener('change', () => {
                updateAscensionCaps(type);
                updateWeekly();
            });
        }
    });

    updateDaily();
});

// ============================================================================
// 7. WEEKLY GAIN & MISSION MODALS
// ============================================================================

window.updateMissionCalc = function() {
    let lvl = parseInt(document.getElementById('thief-lvl')?.value) || 1;
    let sub = parseInt(document.getElementById('thief-sub')?.value) || 1;

    const slots = typeof getMissionSlots === 'function' ? getMissionSlots() : {};

    if (typeof calculateMissionYields !== 'function') return;
    const calc = calculateMissionYields(lvl, sub, slots);

    const slotInfo = document.getElementById('ms-total-slots');
    if (slotInfo) {
        slotInfo.innerText = calc.totalSlots.toFixed(1).replace('.0', '') + ' / 12';
        slotInfo.style.color = calc.totalSlots > 12 ? '#e74c3c' : '#000';
    }

    const lvlInfo = document.getElementById('ms-level-info');
    if (lvlInfo) lvlInfo.innerText = `Mission Lv ${calc.minLv}-${calc.maxLv}`;

    const setVals = (id, baseVal, dailyVal, format) => {
        let elBase = document.getElementById(`ms-base-${id}`);
        let elDaily = document.getElementById(`ms-daily-${id}`);

        const fmt = (num, isGold) => {
            if (isGold) {
                if (num < 10000) return Math.round(num).toLocaleString('en-US');
                else if (num < 1000000) return parseFloat((num / 1000).toFixed(1)) + 'k';
                else return parseFloat((num / 1000000).toFixed(2)) + 'm';
            }
            return Math.round(num).toLocaleString('en-US');
        };

        if (elBase) elBase.innerText = fmt(baseVal, format === 'gold');
        if (elDaily) elDaily.innerText = fmt(dailyVal, format === 'gold');
    };

    setVals('gold', calc.dailyBase.gold, calc.dailyTotal.gold, 'gold');
    setVals('ticket', calc.dailyBase.ticket, calc.dailyTotal.ticket, 'standard');
    setVals('egg', calc.dailyBase.egg, calc.dailyTotal.egg, 'standard');
    setVals('pot', calc.dailyBase.pot, calc.dailyTotal.pot, 'standard');
    setVals('key', calc.dailyBase.key, calc.dailyTotal.key, 'standard');
    setVals('gp', calc.dailyBase.gp, calc.dailyTotal.gp, 'standard');
};

window.switchWeeklyTab = function(tabName) {
    const tabs = ['source', 'resource', 'mission'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`btn-tab-${t}`);

        if (el && btn) {
            if (t === tabName) {
                el.style.display = 'block';
                btn.classList.add('active');
            } else {
                el.style.display = 'none';
                btn.classList.remove('active');
            }
        }
    });

    if (tabName === 'mission' && typeof window.updateMissionCalc === 'function') {
        window.updateMissionCalc();
    }
};

window.getMissionScoreDistribution = function(weights) {
    const w = (weights || [0, 0, 0, 0, 0, 0]).map(v => parseFloat(v) || 0);
    const freqMap = new Map();
    for (let a = 0; a < 6; a++) {
        for (let b = 0; b < 6; b++) {
            for (let c = 0; c < 6; c++) {
                for (let d = 0; d < 6; d++) {
                    const s = +(w[a] + w[b] + w[c] + w[d]).toFixed(6);
                    freqMap.set(s, (freqMap.get(s) || 0) + 1);
                }
            }
        }
    }
    const scores = Array.from(freqMap.keys()).sort((x, y) => x - y);
    return { freqMap, scores };
};

window.getMissionRerollThresholds = function(weights) {
    const { freqMap, scores } = window.getMissionScoreDistribution(weights);
    const total = 1296;
    let cum = 0;
    const cdf = scores.map(s => {
        cum += freqMap.get(s);
        return cum / total;
    });

    const binom6 = [1, 6, 15, 20, 15, 6, 1];
    const expectedOrderStat = (m) => {
        let exp = scores[0];
        for (let i = 0; i < scores.length - 1; i++) {
            const q = cdf[i];
            const p = 1 - q;
            let probFewer = 0;
            for (let j = 0; j < m; j++) {
                probFewer += binom6[j] * Math.pow(p, j) * Math.pow(q, 6 - j);
            }
            const probAtLeast = Math.max(0, 1 - probFewer);
            exp += (scores[i + 1] - scores[i]) * probAtLeast;
        }
        return exp;
    };

    return [
        expectedOrderStat(3),
        expectedOrderStat(2),
        expectedOrderStat(1)
    ];
};

window.formatMissionCutoff = function(threshold, weights) {
    const { scores } = window.getMissionScoreDistribution(weights);
    const nextScore = scores.find(s => s > threshold + 1e-9);
    if (nextScore === undefined) return '—';
    const cleanNum = parseFloat(nextScore.toFixed(4));
    return `≥ ${cleanNum}`;
};

window.updateMissionThresholdPreview = function() {
    const resourceIds = ['fm_gold', 'green_ticket', 'eggshell', 'red_potion', 'mount_key', 'green_potion'];
    const weights = resourceIds.map(id => parseFloat(document.getElementById('weight_' + id)?.value) || 0);
    const [t1, t2, t3] = window.getMissionRerollThresholds(weights);

    const c1 = window.formatMissionCutoff(t1, weights);
    const c2 = window.formatMissionCutoff(t2, weights);
    const c3 = window.formatMissionCutoff(t3, weights);

    ['thresh_t1', 'guide_t1'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = c1;
    });
    ['thresh_t2', 'guide_t2'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = c2;
    });
    ['thresh_t3', 'guide_t3'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = c3;
    });
};

window.runMissionSimulation = function() {
    const btn = document.getElementById('runSimBtn');
    const textSpan = document.getElementById('runSimText');
    const originalText = textSpan.innerText;

    btn.disabled = true;

    setTimeout(() => {
        const resourceIds = ['fm_gold', 'green_ticket', 'eggshell', 'red_potion', 'mount_key', 'green_potion'];
        window.missionSlotsMemory = window.missionSlotsMemory || {};

        const weights = resourceIds.map(id => {
            const val = parseFloat(document.getElementById('weight_' + id)?.value) || 0;
            window.missionSlotsMemory['w_' + id] = val;
            return val;
        });

        const [T1, T2, T3] = window.getMissionRerollThresholds(weights);
        window.updateMissionThresholdPreview();

        const EPS = 1e-9;
        const rollBoard = () => {
            const board = [];
            for (let m = 0; m < 6; m++) {
                const counts = [0, 0, 0, 0, 0, 0];
                let score = 0;
                for (let r = 0; r < 4; r++) {
                    const pick = Math.floor(Math.random() * 6);
                    counts[pick]++;
                    score += weights[pick];
                }
                board.push({ counts, score });
            }
            board.sort((a, b) => b.score - a.score);
            return board;
        };

        const numDays = 100000;
        const totalYield = [0, 0, 0, 0, 0, 0];

        for (let day = 0; day < numDays; day++) {
            const initialMissions = rollBoard();

            let k = 0;
            if (initialMissions[0].score > T1 + EPS) {
                k = 1;
                if (initialMissions[1].score > T2 + EPS) {
                    k = 2;
                    if (initialMissions[2].score > T3 + EPS) {
                        k = 3;
                    }
                }
            }

            for (let m = 0; m < k; m++) {
                for (let i = 0; i < 6; i++) {
                    totalYield[i] += initialMissions[m].counts[i];
                }
            }

            if (k < 3) {
                const rerolledMissions = rollBoard();
                const needed = 3 - k;
                for (let m = 0; m < needed; m++) {
                    for (let i = 0; i < 6; i++) {
                        totalYield[i] += rerolledMissions[m].counts[i];
                    }
                }
            }
        }

        resourceIds.forEach((id, i) => {
            const avg = (totalYield[i] / numDays).toFixed(2);
            const resultEl = document.getElementById('result_' + id);
            if (resultEl) resultEl.innerText = avg;
        });

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

        textSpan.innerText = originalText;
        btn.disabled = false;
    }, 50);
};

window.copySimulationToSlots = function() {
    const mapping = {
        'fm_gold': 'gold',
        'green_ticket': 'ticket',
        'eggshell': 'egg',
        'red_potion': 'pot',
        'mount_key': 'key',
        'green_potion': 'gp'
    };

    if (!window.missionSlotsMemory) window.missionSlotsMemory = {};

    let updated = false;
    for (const [resId, slotId] of Object.entries(mapping)) {
        const resultEl = document.getElementById('result_' + resId);
        if (resultEl && resultEl.innerText !== '-' && resultEl.innerText !== '') {
            let numVal = parseFloat(resultEl.innerText);
            if (!isNaN(numVal)) {
                let formatted = numVal.toFixed(2);
                window.missionSlotsMemory[slotId] = formatted;

                const inputEl = document.getElementById('ms-slot-' + slotId);
                if (inputEl) inputEl.value = formatted;

                updated = true;
            }
        }
    }

    if (updated) {
        if (typeof window.updateMissionCalc === 'function') window.updateMissionCalc();
        if (typeof window.updateWeekly === 'function') window.updateWeekly();
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

        const textSpan = document.getElementById('copySlotsText');
        if (textSpan) {
            const originalText = textSpan.innerText;
            textSpan.innerText = "COPIED!";

            setTimeout(() => {
                textSpan.innerText = originalText;
            }, 1000);
        }
    }
};

window.openMissionInfoModal = function() {
    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS.missionInfo = {
            title: "MISSION SLOTS INFO",
            headerColor: "#ebf8fa",
            titleColor: "#000000",
            disclaimer: "Expected average slots per day (with 1 free refresh)."
        };
    }

    const resources = [
        { id: 'fm_gold', file: 'icons/fm_gold.png', defaultScore: 0, name: 'Gold' },
        { id: 'green_ticket', file: 'icons/green_ticket.png', defaultScore: 1, name: 'Green Ticket' },
        { id: 'eggshell', file: 'icons/eggshell.png', defaultScore: 2, name: 'Eggshell' },
        { id: 'red_potion', file: 'icons/red_potion.png', defaultScore: 0, name: 'Red Potion' },
        { id: 'mount_key', file: 'icons/mount_key.png', defaultScore: 3, name: 'Mount Key' },
        { id: 'green_potion', file: 'icons/green_potion.png', defaultScore: 8, name: 'Green Potion' }
    ];

    const initialWeights = resources.map(r => {
        const saved = parseFloat(window.missionSlotsMemory?.['w_' + r.id]);
        return !isNaN(saved) ? saved : r.defaultScore;
    });
    const [initT1, initT2, initT3] = window.getMissionRerollThresholds(initialWeights);
    const c1 = window.formatMissionCutoff(initT1, initialWeights);
    const c2 = window.formatMissionCutoff(initT2, initialWeights);
    const c3 = window.formatMissionCutoff(initT3, initialWeights);

    let tableHtml = `
        <div style="display: flex; padding: 4px 12px 6px 12px; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; color: #000; text-transform: uppercase;">
            <div style="flex: 0 0 20%; text-align: center;"></div>
            <div style="flex: 0 0 40%; text-align: center;">Value</div>
            <div style="flex: 0 0 40%; text-align: center;">Expected Slots</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
    `;

    resources.forEach((r, idx) => {
        const savedWeight = initialWeights[idx];

        tableHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px; box-sizing: border-box;">
                <div style="flex: 0 0 20%; display: flex; justify-content: center; align-items: center;">
                    <img src="${r.file}" title="${r.name}" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                <div style="flex: 0 0 40%; display: flex; justify-content: center; align-items: center;">
                    <input type="number" id="weight_${r.id}" value="${savedWeight}" step="1" onfocus="this.select()" oninput="window.missionSlotsMemory = window.missionSlotsMemory || {}; window.missionSlotsMemory['w_${r.id}'] = parseFloat(this.value) || 0; document.getElementById('result_${r.id}').innerText='-'; window.updateMissionThresholdPreview();" style="width: 55px; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; background-color: #fff; -webkit-text-stroke: 0px transparent !important;">
                </div>
                <div style="flex: 0 0 40%; display: flex; justify-content: center; align-items: center;">
                    <span id="result_${r.id}" style="font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</span>
                </div>
            </div>
        `;
    });
    tableHtml += `</div>`;

    const contentHtml = `
        <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; line-height: 1.4; padding: 5px;">
            <div style="margin-bottom: 12px;">
                A slot is a single reward drop. Each mission gives 4 drops (duplicates allowed), so 3 missions give <strong>12 reward slots per day</strong>. You also get <strong>1 free refresh</strong> each day, which replaces all uncompleted missions with 6 brand-new ones.
            </div>

            <div style="margin-top: 15px; border-top: 2px solid #ccc; padding-top: 15px;">
                <span style="font-size: 1rem; text-transform: uppercase;">Expected Slots Calculator</span><br>
                Assign a value to each resource below (higher number = higher priority, 0 = avoid). The tool updates the minimum keep scores below and simulates 100,000 days using the 1-refresh strategy.
                <p>Note: If you spend gems for extra refreshes or have custom slot averages, you can manually enter your numbers on the previous screen (total = 12).</p>

                ${tableHtml}

                <style>
                    .btn-calc-slots:hover:not(:disabled) { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
                    .btn-calc-slots:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
                    .btn-calc-slots:disabled { opacity: 0.7; cursor: not-allowed; }

                    .btn-copy-slots:hover:not(:disabled) { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
                    .btn-copy-slots:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
                    .btn-copy-slots:disabled { opacity: 0.7; cursor: not-allowed; }
                </style>

                <div style="padding: 10px 0 5px 0; display: flex; justify-content: space-between; gap: 8px;">
                    <button id="runSimBtn" class="btn-calc-slots" onclick="window.runMissionSimulation()" style="flex: 1; padding: 0 8px 5px 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                        <span id="runSimText" style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; text-align: center; line-height: 1.1;">
                            Calculate Slots
                        </span>
                    </button>

                    <button id="copySlotsBtn" class="btn-copy-slots" onclick="window.copySimulationToSlots()" style="flex: 1; padding: 0 8px 5px 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                        <span id="copySlotsText" style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; text-align: center; line-height: 1.1;">
                            Apply Slots
                        </span>
                    </button>
                </div>
            </div>

            <div style="margin-top: 15px; border-top: 2px solid #ccc; padding-top: 15px; margin-bottom: 10px;">
                <span style="font-size: 1rem; text-transform: uppercase;">How to Use Your Free Refresh</span><br>
                Add up the points for each of your 6 initial missions before refreshing using your values above and look at your <strong>top 3 from highest to lowest</strong>:
            </div>

            <div style="background-color: #ebf8fa; border: 2px solid #000; border-radius: 8px; padding: 10px; margin-bottom: 10px;">
                <div style="font-size: 0.78rem; text-transform: uppercase; margin-bottom: 6px; text-align: center;">Minimum Score to Keep Before Refresh</div>
                <div style="display: flex; justify-content: space-between; text-align: center; gap: 6px;">
                    <div style="flex: 1; background: #fff; border-radius: 6px; padding: 6px 4px; border: 1px solid #ccc;">
                        <div style="font-size: 0.72rem; color: #555;">1st Mission</div>
                        <div id="thresh_t1" style="font-size: 1rem; color: #0284c7;">${c1}</div>
                    </div>
                    <div style="flex: 1; background: #fff; border-radius: 6px; padding: 6px 4px; border: 1px solid #ccc;">
                        <div style="font-size: 0.72rem; color: #555;">2nd Mission</div>
                        <div id="thresh_t2" style="font-size: 1rem; color: #0284c7;">${c2}</div>
                    </div>
                    <div style="flex: 1; background: #fff; border-radius: 6px; padding: 6px 4px; border: 1px solid #ccc;">
                        <div style="font-size: 0.72rem; color: #555;">3rd Mission</div>
                        <div id="thresh_t3" style="font-size: 1rem; color: #0284c7;">${c3}</div>
                    </div>
                </div>
            </div>

            <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                <div style="border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px;">
                    <strong>Check your #1 mission:</strong> Does it score <strong id="guide_t1">${c1}</strong>? If yes, <strong>complete it</strong> and check #2. If not, <strong>refresh now</strong> and pick your top 3 from the new board.
                </div>
                <div style="border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px;">
                    <strong>Check your #2 mission:</strong> Does it score <strong id="guide_t2">${c2}</strong>? If yes, <strong>complete it</strong> and check #3. If not, <strong>refresh now</strong> and pick your top 2 from the new board.
                </div>
                <div>
                    <strong>Check your #3 mission:</strong> Does it score <strong id="guide_t3">${c3}</strong>? If yes, <strong>complete it</strong> (done for the day—skip the refresh). If not, <strong>refresh now</strong> and pick the best 1 from the new board.
                </div>
            </div>

            <p style="font-size: 0.82rem; color: #444; margin-bottom: 4px;">
                Why the required score goes up: a refresh gives you 6 new chances at a great roll, so your 3rd mission has to be a huge hit to be worth skipping the refresh.
            </p>
        </div>

        <img src="x" style="display:none;" onerror="
            setTimeout(() => {
                const closeBtns = document.querySelectorAll('.btn-close-floating');
                const activeCloseBtn = closeBtns[closeBtns.length - 1];
                if (activeCloseBtn) {
                    activeCloseBtn.onclick = function(e) {
                        e.preventDefault();
                        if (typeof window.openWeeklyBreakdownModal === 'function') {
                            window.openWeeklyBreakdownModal();
                            setTimeout(() => {
                                if (typeof window.switchWeeklyTab === 'function') {
                                    window.switchWeeklyTab('mission');
                                }
                            }, 50);
                        }
                    };
                }
            }, 50);
        ">
    `;

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('missionInfo', contentHtml);
    }
};

window.openMissionLevelInfoModal = function(levelOverride = null, slotsOverride = null) {
    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS.missionLevelInfo = {
            title: "MISSION REWARDS",
            headerColor: "#ebf8fa",
            titleColor: "#000000",
            disclaimer: "Per X slot rewards at the specified mission level."
        };
    }

    let currentLv = levelOverride;
    if (currentLv === null || currentLv === undefined) {
        let lvl = parseInt(document.getElementById('thief-lvl')?.value) || 1;
        let sub = parseInt(document.getElementById('thief-sub')?.value) || 1;
        const slots = typeof getMissionSlots === 'function' ? getMissionSlots() : {};
        if (typeof calculateMissionYields === 'function') {
            let calc = calculateMissionYields(lvl, sub, slots);
            currentLv = calc.minLv;
        } else {
            currentLv = 1;
        }
    }

    if (currentLv < 1) currentLv = 1;
    if (currentLv > 90) currentLv = 90;

    let currentSlots = slotsOverride || 1;
    if (currentSlots < 1) currentSlots = 1;
    if (currentSlots > 4) currentSlots = 4;

    const getCtVal = (id, memKey) => {
        const el = document.getElementById(id);
        if (el) return parseInt(el.value) || 0;
        return parseInt(window.clanTechMemory?.[memKey]) || 0;
    };

    const missionLvl = getCtVal('ct-mission', 'mission');
    const potMissionLvl = getCtVal('ct-pot-mission', 'potMission');
    const potAsc = parseInt(document.getElementById('weekly-potion-asc')?.value) || 0;

    const generalTechMult = 1 + (missionLvl / 100);
    const gpCombinedMult = (1 + (potAsc / 100)) * (1 + (missionLvl / 100) + (potMissionLvl * 5 / 100));

    let gpBase = 0;
    if (currentLv <= 2) gpBase = 3;
    else if (currentLv <= 4) gpBase = 4;
    else if (currentLv <= 6) gpBase = 5;
    else if (currentLv <= 16) gpBase = 6;
    else if (currentLv <= 19) gpBase = 7;
    else if (currentLv <= 41) gpBase = 8;
    else if (currentLv <= 43) gpBase = 9;
    else gpBase = 10;

    const gpVal = Math.round(gpBase * currentSlots * gpCombinedMult);

    const fmt = (num, isGold) => {
        if (isGold) {
            if (num < 10000) return Math.round(num).toLocaleString('en-US');
            else if (num < 1000000) return parseFloat((num / 1000).toFixed(1)) + 'k';
            else return parseFloat((num / 1000000).toFixed(2)) + 'm';
        }
        return Math.round(num).toLocaleString('en-US');
    };

    const getLvlBase = (baseVal, lv) => {
        let rawLvBase = Math.round(baseVal * Math.pow(1.01, lv - 1));
        return Math.round(rawLvBase * currentSlots * generalTechMult);
    };

    const resData = [
        { id: 'gold', icon: 'fm_gold.png', name: 'Gold', val: getLvlBase(typeof MISSION_BASE_YIELDS !== 'undefined' ? MISSION_BASE_YIELDS.gold : 1500, currentLv), isGold: true },
        { id: 'ticket', icon: 'green_ticket.png', name: 'Green Ticket', val: getLvlBase(typeof MISSION_BASE_YIELDS !== 'undefined' ? MISSION_BASE_YIELDS.ticket : 15, currentLv), isGold: false },
        { id: 'egg', icon: 'eggshell.png', name: 'Eggshell', val: getLvlBase(typeof MISSION_BASE_YIELDS !== 'undefined' ? MISSION_BASE_YIELDS.egg : 250, currentLv), isGold: false },
        { id: 'pot', icon: 'red_potion.png', name: 'Red Potion', val: getLvlBase(typeof MISSION_BASE_YIELDS !== 'undefined' ? MISSION_BASE_YIELDS.pot : 40, currentLv), isGold: false },
        { id: 'key', icon: 'mount_key.png', name: 'Mount Key', val: getLvlBase(typeof MISSION_BASE_YIELDS !== 'undefined' ? MISSION_BASE_YIELDS.key : 1, currentLv), isGold: false },
        { id: 'gp', icon: 'green_potion.png', name: 'Green Potion', val: gpVal, isGold: false }
    ];

    let tabsHtml = `
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            <div class="segmented-control" style="width: 100%; height: 32px; display: flex;">
                <button class="seg-btn ${currentSlots === 1 ? 'active' : ''}" onclick="window.openMissionLevelInfoModal(${currentLv}, 1)" style="flex: 1; padding: 0; font-size: 0.85rem;">1 Slot</button>
                <button class="seg-btn ${currentSlots === 2 ? 'active' : ''}" onclick="window.openMissionLevelInfoModal(${currentLv}, 2)" style="flex: 1; padding: 0; font-size: 0.85rem;">2 Slots</button>
                <button class="seg-btn ${currentSlots === 3 ? 'active' : ''}" onclick="window.openMissionLevelInfoModal(${currentLv}, 3)" style="flex: 1; padding: 0; font-size: 0.85rem;">3 Slots</button>
                <button class="seg-btn ${currentSlots === 4 ? 'active' : ''}" onclick="window.openMissionLevelInfoModal(${currentLv}, 4)" style="flex: 1; padding: 0; font-size: 0.85rem;">4 Slots</button>
            </div>
        </div>
    `;

    let listHtml = `<div style="display: flex; flex-direction: column; gap: 6px;">`;
    resData.forEach(r => {
        listHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 10px 15px; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <img src="icons/${r.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px;">${r.name}</span>
            </div>
            <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; color: #000; -webkit-text-stroke: 0px;">${fmt(r.val, r.isGold)}</span>
        </div>`;
    });
    listHtml += `</div>`;

    const leftArrowSvg = `
    <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 0px #000);">
        <polygon points="18,4 4.14,12 18,20" fill="#00a3ff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"></polygon>
    </svg>`;

    const rightArrowSvg = `
    <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 0px #000);">
        <polygon points="6,4 19.86,12 6,20" fill="#00a3ff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"></polygon>
    </svg>`;

    const navHtml = `
    <style>
        .modal-header-fixed { display: none !important; }
        .modal-body-scroll { padding-top: 25px !important; padding-bottom: 25px !important; border-radius: 16px !important; }
        #tableModal .modal-content { overflow: visible !important; margin-bottom: 30px !important; }
        .btn-close-floating {
            position: absolute !important;
            top: auto !important;
            bottom: -24px !important;
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
        }
    </style>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 5px;">
        <button onclick="window.openMissionLevelInfoModal(${currentLv - 1}, ${currentSlots})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center; visibility: ${currentLv > 1 ? 'visible' : 'hidden'};">
            ${leftArrowSvg}
        </button>

        <div style="text-align: center;">
            <div style="font-family: 'Fredoka', sans-serif; font-size: 1.2rem; font-weight: 700; color: #ffffff; -webkit-text-stroke: 3px #000000; paint-order: stroke fill; line-height: 1; letter-spacing: 1px;">Level ${currentLv}</div>
        </div>

        <button onclick="window.openMissionLevelInfoModal(${currentLv + 1}, ${currentSlots})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center; visibility: ${currentLv < 90 ? 'visible' : 'hidden'};">
            ${rightArrowSvg}
        </button>
    </div>
    `;

    const closeBehaviorHtml = `
        <img src="x" style="display:none;" onerror="
            setTimeout(() => {
                const closeBtns = document.querySelectorAll('.btn-close-floating');
                const activeCloseBtn = closeBtns[closeBtns.length - 1];
                if (activeCloseBtn) {
                    activeCloseBtn.onclick = function(e) {
                        e.preventDefault();
                        if (typeof window.openWeeklyBreakdownModal === 'function') {
                            window.openWeeklyBreakdownModal();
                            setTimeout(() => {
                                if (typeof window.switchWeeklyTab === 'function') {
                                    window.switchWeeklyTab('mission');
                                }
                            }, 50);
                        }
                    };
                }
            }, 50);
        ">
    `;

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('missionLevelInfo', navHtml + tabsHtml + listHtml + closeBehaviorHtml);
    }
};

window.openWeeklyBreakdownModal = function() {
    if (typeof MODAL_SETTINGS !== 'undefined' && !MODAL_SETTINGS.weeklyBreakdown) {
        MODAL_SETTINGS.weeklyBreakdown = {
            title: "WEEKLY REWARDS OVERVIEW",
            headerColor: "#ebf8fa",
            titleColor: "#000000",
            disclaimer: "Detailed breakdown of weekly income sources."
        };
    }

    const bd = window.latestWeeklyBreakdown || {};

    const resources = [
        { key: 'hammer', name: 'Hammer', icon: 'fm_hammer.png' },
        { key: 'gold', name: 'Gold', icon: 'fm_gold.png' },
        { key: 'ticket', name: 'Green Ticket', icon: 'green_ticket.png' },
        { key: 'eggshell', name: 'Eggshell', icon: 'eggshell.png' },
        { key: 'potion', name: 'Red Potion', icon: 'red_potion.png' },
        { key: 'mountKey', name: 'Mount Key', icon: 'mount_key.png' },
        { key: 'greenPotion', name: 'Green Potion', icon: 'green_potion.png' }
    ];

    const renderBA = (vB, vA, isPct, key, isTitle = false) => {
        const fmt = (v) => {
            if (isPct) return v.toFixed(1) + '%';
            if (!v || v === 0) return isPct ? "0.0%" : "-";
            if (key === 'gold') {
                if (v < 10000) return Math.round(v).toLocaleString('en-US');
                if (v < 1000000) return parseFloat((v / 1000).toFixed(1)) + 'k';
                return parseFloat((v / 1000000).toFixed(2)) + 'm';
            }
            return Math.round(v).toLocaleString('en-US');
        };

        const strB = fmt(vB);
        const strA = fmt(vA);
        const fontSize = isTitle ? '1rem' : '0.9rem';

        if (Math.abs(vB - vA) < (isPct ? 0.1 : 0.001) || strB === strA) {
            return `
            <div style="width: 100%; display: flex; justify-content: flex-end;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #000; white-space: nowrap;">${strB}</div>
            </div>`;
        } else {
            return `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #000; white-space: nowrap; margin-bottom: 2px;">${strB}</div>
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #27ae60; white-space: nowrap; display: flex; align-items: center;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.85em;">➜</span>${strA}
                </div>
            </div>`;
        }
    };

    // ========================================================================
    // TAB 1: BY SOURCE
    // ========================================================================
    let sourceHtml = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    const sourceGroups = [
        { id: 'Dungeon', name: 'Dungeon', divider: 14, suffix: ' / Key' },
        { id: 'Idle', name: 'Idle', divider: 7, suffix: ' / Day' },
        { id: 'League', name: 'League', divider: 1, suffix: '' },
        { id: 'War', name: 'Clan War', divider: 1, suffix: '' },
        { id: 'Indiv Rewards', name: 'Indiv. Rewards', divider: 1, suffix: '' },
        { id: 'Mission', name: 'Mission', divider: 1, suffix: '' },
        { id: 'Rally Bonus', name: 'Rally Bonus', divider: 7, suffix: ' / Day' },
        { id: 'Clan Race', name: 'Clan Tech Race', divider: 1, suffix: '' }
    ];

    sourceGroups.forEach(src => {
        let rowsHtml = '';

        resources.forEach(res => {
            const data = bd[res.key]?.[src.id];
            if (data) {
                let vB = data.b / src.divider;
                let vA = data.a / src.divider;

                if (vB > 0 || vA > 0) {
                    rowsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                        <div style="flex: 0 0 50%; display: flex; align-items: center; gap: 8px; box-sizing: border-box;">
                            <img src="icons/${res.icon}" style="width: 20px; height: 20px; object-fit: contain;">
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000;">${res.name}</span>
                        </div>
                        <div style="flex: 0 0 50%; padding-right: 8px; box-sizing: border-box;">
                            ${renderBA(vB, vA, false, res.key, false)}
                        </div>
                    </div>`;
                }
            }
        });

        if (rowsHtml !== '') {
            sourceHtml += `
            <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
                <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: center;">
                    <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; text-transform: uppercase; color: #000;">
                        ${src.name}
                    </span>
                </div>
                <div style="padding: 10px;">
                    <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px;">
                        <div style="flex: 0 0 50%; box-sizing: border-box;">Resource</div>
                        <div style="flex: 0 0 50%; text-align: right; padding-right: 8px; box-sizing: border-box;">Amount${src.suffix}</div>
                    </div>
                    ${rowsHtml}
                </div>
            </div>`;
        }
    });

    sourceHtml += '</div>';

    // ========================================================================
    // TAB 2: BY RESOURCE
    // ========================================================================
    let resourceHtml = '<div style="display: flex; flex-direction: column; gap: 12px;">';

    resources.forEach(res => {
        const data = bd[res.key] || {};
        let totalB = 0, totalA = 0;

        const sources = ['Dungeon', 'Idle', 'League', 'War', 'Indiv Rewards', 'Mission', 'Rally Bonus', 'Hammer', 'Clan Race'];
        sources.forEach(src => {
            if (data[src]) {
                totalB += (data[src].b || 0);
                totalA += (data[src].a || 0);
            }
        });

        if (totalA === 0 && totalB === 0) return;

        const getPctB = (val) => totalB > 0 ? (val / totalB) * 100 : 0;
        const getPctA = (val) => totalA > 0 ? (val / totalA) * 100 : 0;

        const generateRow = (label, srcData) => {
            if (!srcData) return '';
            const vB = srcData.b || 0;
            const vA = srcData.a || 0;

            if (vB === 0 && vA === 0 && (label === 'Idle' || label === 'Dungeon' || label === 'Clan Tech Race')) return '';

            return `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                <div style="flex: 0 0 28%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; box-sizing: border-box;">${label}</div>
                <div style="flex: 0 0 42%; padding-right: 8px; box-sizing: border-box;">
                    ${renderBA(vB, vA, false, res.key, false)}
                </div>
                <div style="flex: 0 0 30%; box-sizing: border-box;">
                    ${renderBA(getPctB(vB), getPctA(vA), true, res.key, false)}
                </div>
            </div>`;
        };

        let displayName = res.key === 'gold' ? 'Gold After Hammering' : res.name;

        resourceHtml += `
        <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="icons/${res.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                    <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; text-transform: uppercase; color: #000;">
                        ${displayName}
                    </span>
                </div>
                <div style="flex: 1; display: flex; justify-content: flex-end;">
                    ${renderBA(totalB, totalA, false, res.key, true)}
                </div>
            </div>
            <div style="padding: 10px;">
                <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px;">
                    <div style="flex: 0 0 28%; box-sizing: border-box;">Source</div>
                    <div style="flex: 0 0 42%; text-align: right; padding-right: 8px; box-sizing: border-box;">Amount</div>
                    <div style="flex: 0 0 30%; text-align: right; box-sizing: border-box;">%</div>
                </div>
                ${generateRow('Dungeon', data.Dungeon)}
                ${generateRow('Idle', data.Idle)}
                ${generateRow('League', data.League)}
                ${res.key === 'gold' ? '' : generateRow('War', data.War)}
                ${generateRow('Indiv Rewards', data['Indiv Rewards'])}
                ${res.key === 'hammer' ? generateRow('Rally Bonus', data['Rally Bonus']) : generateRow('Mission', data.Mission)}
                ${res.key === 'greenPotion' ? generateRow('Clan Tech Race', data['Clan Race']) : ''}
                ${res.key === 'gold' ? generateRow('Hammer', data.Hammer) : ''}
            </div>
        </div>`;
    });

    resourceHtml += '</div>';

    // ========================================================================
    // TAB 3: MISSION CALC HTML
    // ========================================================================
    const missionHtml = `
        <div class="daily-card config-card" style="margin-bottom: 15px; border-radius: 10px; border: 2px solid #000; overflow: hidden; background-color: #ffffff !important; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: center; align-items: center; padding-bottom: 4px;">
                    <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000;">Input the amount of slots for each resources</span>
                    <button class="btn-info" onclick="window.openMissionInfoModal()">i</button>
                </div>

                ${[
                    { id: 'gold', icon: 'fm_gold.png' },
                    { id: 'ticket', icon: 'green_ticket.png' },
                    { id: 'egg', icon: 'eggshell.png' },
                    { id: 'pot', icon: 'red_potion.png' },
                    { id: 'key', icon: 'mount_key.png' },
                    { id: 'gp', icon: 'green_potion.png' }
                ].map(item => {
                    let val = window.missionSlotsMemory?.[item.id] !== undefined ? window.missionSlotsMemory[item.id] : '0';
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                        <img src="icons/${item.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                        <input type="number" id="ms-slot-${item.id}" value="${val}" min="0" max="12" step="0.01" oninput="if(this.value > 12) this.value = 12; window.updateMissionCalc(); window.updateWeekly();" style="width: 60px; flex-shrink: 0; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important;">
                    </div>
                    `;
                }).join('')}

                <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/fm_hammer.png" style="width: 24px; height: 24px; flex-shrink: 0; object-fit: contain;">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; line-height: 1.1;">Rally Bonus (max 300)</span>
                    </div>
                    <input type="number" id="ms-slot-rally" value="${window.missionSlotsMemory?.rally !== undefined ? window.missionSlotsMemory.rally : '300'}" min="0" max="300" step="1" oninput="if(this.value > 300) this.value = 300; window.updateMissionCalc(); window.updateWeekly();" style="width: 60px; flex-shrink: 0; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important;">
                </div>
            </div>
        </div>

        <div class="daily-card card-compact" style="border-radius: 10px; border: 2px solid #000; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div class="daily-card-header strip-blue" style="background-color: #ebf8fa; padding: 10px; border-bottom: 2px solid #000; display: flex; justify-content: center; align-items: center; gap: 6px;">
                <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px; color: #000; text-transform: uppercase;">EXPECTED DAILY MISSION REWARDS</span>
                <button class="btn-info" onclick="window.openMissionLevelInfoModal()" style="margin: 0;">i</button>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 12px 2px 12px;">
                    <div id="ms-level-info" style="flex: 0 0 25%; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Mission Lv ?-?</div>
                    <div style="flex: 0 0 35%; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Avg / Slot</div>
                    <div style="flex: 0 0 40%; text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Daily Avg</div>
                </div>

                ${[
                    { id: 'gold', icon: 'fm_gold.png' },
                    { id: 'ticket', icon: 'green_ticket.png' },
                    { id: 'egg', icon: 'eggshell.png' },
                    { id: 'pot', icon: 'red_potion.png' },
                    { id: 'key', icon: 'mount_key.png' },
                    { id: 'gp', icon: 'green_potion.png' }
                ].map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                        <div style="flex: 0 0 25%; display: flex; align-items: center;">
                            <img src="icons/${item.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                        </div>
                        <div id="ms-base-${item.id}" style="flex: 0 0 35%; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px #000000;">0</div>
                        <div id="ms-daily-${item.id}" style="flex: 0 0 40%; text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px #000000;">0</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // ========================================================================
    // FINAL MODAL HTML ASSEMBLY
    // ========================================================================
    const contentHtml = `
        <style>
            #modal-tabs-container .seg-btn {
                transition: font-size 0.1s ease, transform 0.1s ease;
            }
        </style>
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            <div id="modal-tabs-container" class="segmented-control" style="width: 100%; max-width: 320px; height: 38px; display: flex;">
                <button id="btn-tab-source" class="seg-btn active" onclick="window.switchWeeklyTab('source')" style="flex: 1;">Source</button>
                <button id="btn-tab-resource" class="seg-btn" onclick="window.switchWeeklyTab('resource')" style="flex: 1;">Resource</button>
                <button id="btn-tab-mission" class="seg-btn" onclick="window.switchWeeklyTab('mission')" style="flex: 1;">Mission</button>
            </div>
        </div>

        <div id="tab-source">
            ${sourceHtml}
        </div>

        <div id="tab-resource" style="display: none;">
            ${resourceHtml}
        </div>

        <div id="tab-mission" style="display: none;">
            ${missionHtml}
        </div>
    `;

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('weeklyBreakdown', contentHtml);
        setTimeout(() => {
            if (typeof window.updateMissionCalc === 'function') window.updateMissionCalc();
        }, 50);
    }
};