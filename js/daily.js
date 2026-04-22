/**
 * DAILY.JS
 * Logic for Daily Totals
 */

// ==========================================
// 1. SHARED MASTER CALCULATOR
// ==========================================
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
            for (let t = 1; t <= 5; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
        }
        let planState = typeof calcState === 'function' ? calcState().levels : setupLevels;
        if (planState) {
            for (let t = 1; t <= 5; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
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

// ==========================================
// 2. INITIALIZATION & STORAGE
// ==========================================
function initDailyDropdowns() {
    const dungeons = ['thief', 'ghost', 'inv', 'zombie'];
    dungeons.forEach(d => {
        const lvlSelect = document.getElementById(`${d}-lvl`);
        const subSelect = document.getElementById(`${d}-sub`);
        if (!lvlSelect || !subSelect) return;
        
        lvlSelect.innerHTML = ''; 
        subSelect.innerHTML = '';
        for (let i = 1; i <= 40; i++) lvlSelect.add(new Option(i, i));
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


// ==========================================
// 3. UI RENDERER
// ==========================================
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
        if (val < 10) return val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        return val.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
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

document.addEventListener('DOMContentLoaded', () => {
    initDailyDropdowns();
    loadDailyLocal();
    updateDaily();
});