/**
 * FORGECALC.JS
 * Forge Hammer/Gold Yield & Forge Upgrade/Ascension Schedule Calculator
 */

// ============================================================================
// 1. CONSTANTS & HELPERS
// ============================================================================

const FORGE_TIER_NAMES = [
    "Primitive", "Medieval", "Early-Modern", "Modern", "Space",
    "Interstellar", "Multiverse", "Quantum", "Underworld", "Divine",
    "Heroic", "Infinite", "Eternal"
];

const FORGE_TIER_COLORS = [
    '#f1f2f6', '#5cd8fe', '#5dfe8a', '#fcfe5d', '#ff5c5d',
    '#d55cff', '#74feee', '#7d5eff', '#b07879', '#fe9e0c',
    '#e64330', '#218cfe', '#a4d700'
];

const getMaxForgeLevel = (asc) => (parseInt(asc) === 3 ? 50 : 35);

const getForgeGemCost = (mins) => {
    if (mins <= 0) return 0;
    return Math.max(1, Math.round(mins / 7.24643));
};

const formatCalcYield = (val) => {
    if (val === 0) return "0";
    if (val < 1000) {
        return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
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

// ============================================================================
// 2. DROPDOWN & DATE CONTROLS
// ============================================================================

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
    const maxCurLv = getMaxForgeLevel(curAsc);

    if (curLv > maxCurLv) curLv = maxCurLv;
    curLvEl.innerHTML = "";
    for (let i = 1; i <= maxCurLv; i++) {
        curLvEl.add(new Option(i, i));
    }
    curLvEl.value = curLv;

    let oldTargetAsc = targetAscEl.value;
    let oldTargetLv = targetLvEl.value;

    targetAscEl.innerHTML = "";
    targetAscEl.disabled = false;
    targetAscEl.style.opacity = "1";

    if (curAsc === 3 && curLv === 50) {
        targetAscEl.add(new Option("Asc 3", 3));
        targetAscEl.value = 3;
        targetLvEl.innerHTML = "";
        targetLvEl.add(new Option("MAX", 50));
        targetLvEl.value = 50;
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
    const maxTargetLv = getMaxForgeLevel(selTargetAsc);

    targetLvEl.innerHTML = "";
    targetLvEl.disabled = false;
    targetLvEl.style.opacity = "1";

    let startLv = (selTargetAsc === curAsc) ? curLv + 1 : 1;

    for (let i = startLv; i <= maxTargetLv; i++) {
        targetLvEl.add(new Option(i, i));
    }

    if (selTargetAsc < 3) {
        targetLvEl.add(new Option("Ascend", "Ascend"));
    }

    if (oldTargetLv === "Ascend") {
        targetLvEl.value = (selTargetAsc < 3) ? "Ascend" : maxTargetLv;
    } else {
        let pLv = parseInt(oldTargetLv);
        if (!isNaN(pLv) && pLv >= startLv && pLv <= maxTargetLv) {
            targetLvEl.value = pLv;
        } else {
            targetLvEl.value = (startLv <= maxTargetLv) ? startLv : "Ascend";
        }
    }
}

function initCalcDateSelectors() {
}

function updateCalcFromDropdowns() {
    updateFromDropdowns('calc');
}

function syncCalcMobileDate(isoStr) {
    if (!isoStr) return;
    const d = new Date(isoStr);
    const mSel = document.getElementById('cm-month');
    if (mSel) {
        mSel.value = d.getMonth() + 1;
        document.getElementById('cm-day').value = d.getDate();
        document.getElementById('cm-hour').value = d.getHours();
        document.getElementById('cm-min').value = d.getMinutes();
    }
}

// ============================================================================
// 3. TECH BONUSES & CORE CALCULATOR
// ============================================================================

function getTechBonuses(lvls) {
    let speed = 0, sell = 0, hBonus = 0, cBonus = 0, free = 0, offH = 0, offC = 0, forgeDisc = 0;
    const sumLvl = (id) => {
        let s = 0;
        for (let t = 1; t <= 6; t++) s += (lvls[`forge_T${t}_${id}`] || 0);
        return s;
    };

    const getVal = (id, fallback) => {
        if (TREES && TREES.forge && TREES.forge.meta && TREES.forge.meta[id] && TREES.forge.meta[id].val !== undefined) {
            return TREES.forge.meta[id].val;
        }
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
                let l = 0;
                for (let t = 1; t <= 6; t++) l += (lvls[`power_T${t}_${s.id}`] || 0);
                const slotMult = TREES.power.meta[s.id].val !== undefined ? TREES.power.meta[s.id].val : 2;
                totalAvg += getSlotStats(99 + l * slotMult, sell).avg;
                count++;
            }
        });
    }

    return {
        speed,
        sell,
        hBonus,
        cBonus,
        free,
        offH,
        offC,
        avgGold: count > 0 ? totalAvg / count : 0,
        forgeDisc
    };
}

function updateCalculator() {
    const hammerEl = document.getElementById('calc-hammers');
    const targetEl = document.getElementById('calc-target');
    if (!hammerEl || !targetEl) return;

    const hIn = parseFloat(hammerEl.value.replace(/,/g, '')) || 0;
    const gTarget = parseFloat(targetEl.value.replace(/,/g, '')) || 0;

    const fAsc = parseInt(document.getElementById('calc-forge-asc').value) || 0;
    const fLv = Math.min(parseInt(document.getElementById('calc-forge-lv').value) || 1, getMaxForgeLevel(fAsc));

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
            strB = fmt(v1);
            strA = fmt(v2);
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
        if (typeof TREES !== 'undefined' && TREES.forge && TREES.forge.meta && TREES.forge.meta[id] && TREES.forge.meta[id].val !== undefined) {
            return TREES.forge.meta[id].val;
        }
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

    // --- Section 1: Hammer & Expected Item Yield ---
    let effH1 = hIn / (1 - curStats.free / 100);
    let effH2 = hIn / (1 - projStats.free / 100);

    let h1 = genLine('Effective Hammer', effH1, effH2, 'fm_hammer', 'hammer');
    h1 += genLine('Gold', effH1 * curStats.avgGold, effH2 * projStats.avgGold, 'fm_gold', 'gold');

    let yieldHtml = `<div style="margin-top: 15px; padding-top: 5px;">
                        <div style="font-family: 'Fredoka', sans-serif; font-weight: 600 !important; letter-spacing: 0.5px; font-size: 1rem; text-align: center; margin-bottom: 10px; color: #000000; -webkit-text-stroke: 0px #7f8c8d; paint-order: stroke fill;">Expected Item Yield</div>`;

    const rates = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES[fLv] || CALC_FORGE_RATES[1] : [];

    for (let i = 0; i < FORGE_TIER_NAMES.length; i++) {
        if (rates[i] > 0) {
            const amountB = effH1 * (rates[i] / 100);
            const amountA = effH2 * (rates[i] / 100);

            yieldHtml += `<div class="calc-line" style="background-color: ${FORGE_TIER_COLORS[i]}; border-bottom: none; color: #000;">
                <div class="calc-label" style="color: #000;">${FORGE_TIER_NAMES[i]}</div>
                ${renderForgeGroup(amountB, amountA, null, 'yield')}
            </div>`;
        }
    }
    yieldHtml += `</div>`;

    const res1 = document.getElementById('calc-res-1');
    if (res1) res1.innerHTML = h1 + yieldHtml;

    // --- Section 2: Hammer Needed for Target Gold ---
    const res2 = document.getElementById('calc-res-2');
    if (res2) {
        res2.innerHTML = genLine(
            'Hammer Needed',
            gTarget / curStats.avgGold * (1 - curStats.free / 100),
            gTarget / projStats.avgGold * (1 - projStats.free / 100),
            'fm_hammer',
            'hammer'
        );
    }

    // --- Section 3: Next Single Level Upgrade ---
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

    if (fAsc === 3 && fLv === 50) {
        let h5 = genLine('Cost', '-', '-', 'fm_gold', 'standard');
        h5 += genLine('Finish', '-', '-', null, 'standard');
        h5 += genLine('Duration', '-', '-', null, 'standard');
        if (res5) res5.innerHTML = h5;
    } else if (fAsc < 3 && fLv === 35) {
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

    // --- Section 4: Multi-Level Target Schedule ---
    if (fAsc === 3 && fLv === 50) {
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

        let previousSchedule = [];
        if (window.forgeScheduleSnapshot &&
            window.forgeScheduleSnapshot.startDate === sDateVal &&
            window.forgeScheduleSnapshot.startAsc === fAsc &&
            window.forgeScheduleSnapshot.startLv === fLv) {
            previousSchedule = window.forgeScheduleSnapshot.schedule || [];
        } else {
            window.forgeScheduleSnapshot = {
                startDate: sDateVal,
                startAsc: fAsc,
                startLv: fLv,
                schedule: []
            };
        }

        window.currentForgeSchedule = [];

        while (cAsc < tAsc || (cAsc === tAsc && cLv < endLv)) {
            if (cAsc < 3 && cLv === 35) {
                totalCostCur += 3000000;
                totalCostProj += 3000000;

                let ascLabel = `Ascension (Asc ${cAsc} ➜ ${cAsc + 1})`;
                let ascStep = {
                    label: ascLabel,
                    finish: currentTimeProj,
                    durationMs: 0,
                    isAscension: true,
                    costCur: 3000000,
                    costProj: 3000000
                };
                window.currentForgeSchedule.push(ascStep);

                if (!previousSchedule.find(s => s.label === ascLabel)) {
                    window.forgeScheduleSnapshot.schedule.push(ascStep);
                }

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

                    let stepLabel = `Asc ${cAsc} | Lv ${cLv} ➜ ${cLv + 1}`;

                    if (cAsc === fAsc && cLv === fLv && useSnapshot) {
                        currentTimeProj = window.ongoingForgeSnapshot.finishTimeProj;
                        currentTimeCur = window.ongoingForgeSnapshot.finishTimeCur;

                        totalCostCur += window.ongoingForgeSnapshot.costCur;
                        totalCostProj += window.ongoingForgeSnapshot.costProj;

                        totalMinsCur += window.ongoingForgeSnapshot.minsCur;
                        totalMinsProj += window.ongoingForgeSnapshot.minsProj;

                        totalGemsCur += getForgeGemCost(window.ongoingForgeSnapshot.minsCur);
                        totalGemsProj += getForgeGemCost(window.ongoingForgeSnapshot.minsProj);

                        let snapStep = {
                            label: stepLabel,
                            finish: currentTimeProj,
                            durationMs: window.ongoingForgeSnapshot.minsProj * 60000,
                            durationMsCur: window.ongoingForgeSnapshot.minsCur * 60000,
                            isAscension: false,
                            costCur: window.ongoingForgeSnapshot.costCur,
                            costProj: window.ongoingForgeSnapshot.costProj
                        };
                        window.currentForgeSchedule.push(snapStep);

                        if (!previousSchedule.find(s => s.label === stepLabel)) {
                            window.forgeScheduleSnapshot.schedule.push(snapStep);
                        }

                        cLv++;
                        continue;
                    }

                    let stepCostCur = Math.round(baseCost * (1 - curStats.forgeDisc / 100));
                    let stepCostProj = Math.round(baseCost * (1 - activeProjDisc / 100));

                    let curLvlMins = baseMins / (1 + curStats.speed / 100);
                    let projLvlMins = baseMins / (1 + activeProjSpeed / 100);

                    let existingStep = previousSchedule.find(s => s.label === stepLabel);

                    if (existingStep && currentTimeProj < Math.max(Date.now(), planStartMs)) {
                        projLvlMins = existingStep.durationMs / 60000;
                        stepCostProj = existingStep.costProj;

                        curLvlMins = (existingStep.durationMsCur || existingStep.durationMs) / 60000;
                        stepCostCur = existingStep.costCur;
                    }

                    totalCostCur += stepCostCur;
                    totalCostProj += stepCostProj;

                    currentTimeCur += curLvlMins * 60000;
                    totalMinsCur += curLvlMins;

                    currentTimeProj += projLvlMins * 60000;
                    totalMinsProj += projLvlMins;

                    totalGemsCur += getForgeGemCost(curLvlMins);
                    totalGemsProj += getForgeGemCost(projLvlMins);

                    let newStep = {
                        label: stepLabel,
                        finish: currentTimeProj,
                        durationMs: projLvlMins * 60000,
                        durationMsCur: curLvlMins * 60000,
                        isAscension: false,
                        costCur: stepCostCur,
                        costProj: stepCostProj
                    };

                    window.currentForgeSchedule.push(newStep);

                    if (!existingStep) {
                        window.forgeScheduleSnapshot.schedule.push(newStep);
                    }

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

        if (isAscendTarget && cAsc < 3 && cAsc === tAsc && cLv === 35) {
            totalCostCur += 3000000;
            totalCostProj += 3000000;

            let ascLabel = `Ascension (Asc ${cAsc} ➜ ${cAsc + 1})`;
            let ascStep = {
                label: ascLabel,
                finish: currentTimeProj,
                durationMs: 0,
                isAscension: true,
                costCur: 3000000,
                costProj: 3000000
            };
            window.currentForgeSchedule.push(ascStep);

            if (!previousSchedule.find(s => s.label === ascLabel)) {
                window.forgeScheduleSnapshot.schedule.push(ascStep);
            }
        }

        let finishLabel = 'Finish';
        let costLabel = 'Total Cost';
        if (window.currentForgeSchedule && window.currentForgeSchedule.length > 1) {
            finishLabel += ' <button class="btn-info" onclick="openForgeScheduleModal()" style="vertical-align: middle; margin-left: 6px;">i</button>';
            costLabel += ' <button class="btn-info" onclick="openForgeCostBreakdownModal()" style="vertical-align: middle; margin-left: 6px;">i</button>';
        }

        let hTarget = genLine(costLabel, totalCostCur, totalCostProj, 'fm_gold', 'gold');
        hTarget += genLine(finishLabel, formatDT(new Date(currentTimeCur)), formatDT(new Date(currentTimeProj)), null, 'date');
        hTarget += genLine('Total Duration', totalMinsCur, totalMinsProj, null, 'time');
        hTarget += genLine('Total Gem', totalGemsCur, totalGemsProj, null, 'number');

        if (resTarget) resTarget.innerHTML = hTarget;
    }

    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

// ============================================================================
// 4. MODALS (SCHEDULE, COST BREAKDOWN & PROBABILITIES)
// ============================================================================

function openForgeScheduleModal() {
    if (!window.currentForgeSchedule || window.currentForgeSchedule.length === 0) return;

    window.forgeGemsMemory = window.forgeGemsMemory || {};

    if (!MODAL_SETTINGS.forgeSchedule) {
        MODAL_SETTINGS.forgeSchedule = {
            title: "FORGE UPGRADE SCHEDULE",
            headerColor: "#ebf8fa",
            titleColor: "#000000",
            disclaimer: "Assumes back-to-back upgrading with no delays. Takes into account your planned Forge Timer tech upgrades."
        };
    }

    const formatScheduleDT = (ms) => {
        const d = new Date(ms);
        const dateStr = d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return `${dateStr}, ${timeStr}`;
    };

    let globalIndex = 0;
    window.currentForgeSchedule.forEach(step => {
        step.globalIndex = globalIndex++;

        let memoryKey = step.label;
        if (typeof step.gems === 'undefined') {
            step.gems = window.forgeGemsMemory[memoryKey] || 0;
        }
        if (typeof step.originalFinish === 'undefined') step.originalFinish = step.finish;

        if (!step.isAscension && step.durationMs !== undefined) {
            const maxAllowed = getForgeGemCost(step.durationMs / 60000);
            if (step.gems > maxAllowed) {
                step.gems = maxAllowed;
            }
        }
    });

    window.promptGlobalForgeGems = function() {
        let val = prompt("Enter Gem amount to use for ALL levels (0 to clear):");
        if (val === null) return;
        let gems = parseInt(val);
        if (isNaN(gems) || gems < 0) gems = 0;

        window.currentForgeSchedule.forEach(step => {
            if (!step.isAscension) {
                const maxAllowed = getForgeGemCost(step.durationMs / 60000);
                let cappedGems = Math.min(gems, maxAllowed);

                step.gems = cappedGems;
                window.forgeGemsMemory[step.label] = cappedGems;
            }
        });

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        window.recalcAndRenderForgeScheduleGems();
    };

    window.promptRowForgeGems = function(idx) {
        let step = window.currentForgeSchedule[idx];
        let currentGems = step.gems || 0;
        let val = prompt(`Enter Gem amount for this level:`, currentGems);
        if (val === null) return;
        let gems = parseInt(val);
        if (isNaN(gems) || gems < 0) gems = 0;

        const maxAllowed = getForgeGemCost(step.durationMs / 60000);
        let cappedGems = Math.min(gems, maxAllowed);

        step.gems = cappedGems;
        window.forgeGemsMemory[step.label] = cappedGems;

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
        window.recalcAndRenderForgeScheduleGems();
    };

    window.recalcAndRenderForgeScheduleGems = function() {
        let cumulativeSavedMs = 0;

        window.currentForgeSchedule.forEach(step => {
            if (!step.isAscension) {
                let savedMs = 0;
                if (step.gems && step.gems > 0) {
                    const maxAllowed = getForgeGemCost(step.durationMs / 60000);
                    step.gems = Math.min(step.gems, maxAllowed);

                    if (step.gems >= maxAllowed) {
                        savedMs = step.durationMs;
                    } else {
                        let maxTimeSavedMins = (step.gems + 0.5) * 7.24643;
                        savedMs = maxTimeSavedMins * 60000;
                        savedMs = Math.min(savedMs, step.durationMs);
                    }
                }
                cumulativeSavedMs += savedMs;
            }

            let newFinishMs = step.originalFinish - cumulativeSavedMs;

            let dateEl = document.getElementById(`fs-date-${step.globalIndex}`);
            let gemEl = document.getElementById(`fs-gem-${step.globalIndex}`);

            if (dateEl) {
                dateEl.innerHTML = formatScheduleDT(newFinishMs);
            }
            if (gemEl && !step.isAscension) {
                gemEl.innerHTML = step.gems > 0 ? step.gems : '-';
                gemEl.style.color = step.gems > 0 ? '#2980b9' : '#95a5a6';
                gemEl.style.fontWeight = step.gems > 0 ? 'bold' : 'normal';
            }
        });
    };

    const groupedSchedule = {};
    window.currentForgeSchedule.forEach(step => {
        let ascMatch = step.label.match(/Asc (\d+)/);
        let asc = 0;
        if (ascMatch) asc = parseInt(ascMatch[1]);

        if (!groupedSchedule[asc]) groupedSchedule[asc] = [];
        groupedSchedule[asc].push(step);
    });

    const ascKeys = Object.keys(groupedSchedule).map(Number).sort((a, b) => a - b);
    const showTabs = ascKeys.length > 1;

    let tabsHtml = '';
    if (showTabs) {
        tabsHtml = `<div style="display: flex; justify-content: center; width: 100%;">
                        <div id="modal-tabs-container" style="display: flex; flex-wrap: nowrap; margin: 12px 0 15px 0 !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box;">`;
    }

    let contentHtml = ``;
    const btnClass = `seg-btn-forge-sched`;
    const contentClass = `tab-content-forge-sched`;

    ascKeys.forEach((asc, index) => {
        const isActive = (index === 0) ? 'active' : '';
        const tabId = `forge-sched-tab-${asc}`;

        if (showTabs) {
            const tabLabel = asc === 0
                ? 'No Asc'
                : `<img src="icons/asc${asc}.png" style="height: 1.1em; vertical-align: -2px;" onerror="this.style.display='none'; this.nextSibling.style.display='inline'; this.nextSibling.textContent='Asc ${asc}';"><span style="display:none;"></span>`;
            const switchJs = `document.querySelectorAll('.${contentClass}').forEach(el => el.style.display='none'); document.getElementById('${tabId}').style.display='block'; document.querySelectorAll('.${btnClass}').forEach(el => el.classList.remove('active')); this.classList.add('active');`;

            tabsHtml += `<button class="${btnClass} seg-btn ${isActive}" onclick="${switchJs}" style="flex: 1 1 0 !important; min-width: 0 !important; padding: 0 2px !important; display: flex !important; justify-content: center !important; align-items: center !important;">${tabLabel}</button>`;
        }

        let rowsHtml = '';
        groupedSchedule[asc].forEach(step => {
            if (step.isAscension) return;

            let lvMatch = step.label.match(/Lv (\d+ ➜ \d+)/);
            let displayLabel = lvMatch ? lvMatch[1] : step.label;

            let textStyle = `color: #000 !important; font-family: 'Fredoka', sans-serif; font-weight: 600;`;
            let gemStyle = step.gems > 0 ? 'color: #2980b9; font-weight: bold;' : 'color: #95a5a6;';
            let gemDisplay = step.gems > 0 ? step.gems : '-';

            let leftCol = `<div style="${textStyle} display: block; width: 100%; box-sizing: border-box; text-align: center; white-space: nowrap;">${displayLabel}</div>`;
            let midCol = `<div id="fs-gem-${step.globalIndex}" style="cursor: pointer; ${textStyle} ${gemStyle} display: block; width: 100%; text-align: center;" onclick="promptRowForgeGems(${step.globalIndex})" title="Click to edit gems">${gemDisplay}</div>`;
            let rightCol = `<div id="fs-date-${step.globalIndex}" style="${textStyle} display: block; width: 100%; box-sizing: border-box; text-align: center; font-size: 0.9em;">${formatScheduleDT(step.originalFinish)}</div>`;

            rowsHtml += `<tr>
                <td style="width: 35%; padding: 8px 2px;">${leftCol}</td>
                <td style="width: 12%; padding: 8px 2px;">${midCol}</td>
                <td style="width: 53%; padding: 8px 2px;">${rightCol}</td>
            </tr>`;
        });

        let tableHtml = `
        <table class="clean-table" style="${showTabs ? 'margin-top: 10px;' : 'margin-top: 5px;'} width: 100%; table-layout: fixed;">
            <thead>
                <tr>
                    <th style="text-align: center; width: 35%; padding: 8px 2px;">Level</th>
                    <th style="text-align: center; width: 12%; padding: 8px 2px; cursor: pointer;" onclick="promptGlobalForgeGems()" title="Click to set gems for ALL levels">
                        <img src="icons/Gem.png" style="height: 1.2em; vertical-align: middle; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.3));">
                    </th>
                    <th style="text-align: center; width: 53%; padding: 8px 2px;">Finish Date</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>`;

        contentHtml += `<div id="${tabId}" class="tab-content-area ${contentClass}" style="display: ${index === 0 ? 'block' : 'none'};">${tableHtml}</div>`;
    });

    if (showTabs) {
        tabsHtml += `</div></div>`;
    }

    renderMasterModal('forgeSchedule', tabsHtml + contentHtml);

    window.recalcAndRenderForgeScheduleGems();
}

function openForgeCostBreakdownModal() {
    if (!window.currentForgeSchedule || window.currentForgeSchedule.length === 0) return;

    if (!MODAL_SETTINGS.forgeCostBreakdown) {
        MODAL_SETTINGS.forgeCostBreakdown = {
            title: "TARGET COST BREAKDOWN",
            headerColor: "#ebf8fa",
            titleColor: "#000000",
            disclaimer: "Takes into account the timing of the finished Forge Discount tech."
        };
    }

    const groupedSchedule = {};
    window.currentForgeSchedule.forEach(step => {
        let ascMatch = step.label.match(/Asc (\d+)/);
        let asc = 0;
        if (ascMatch) asc = parseInt(ascMatch[1]);

        if (!groupedSchedule[asc]) groupedSchedule[asc] = [];
        groupedSchedule[asc].push(step);
    });

    const ascKeys = Object.keys(groupedSchedule).map(Number).sort((a, b) => a - b);
    const showTabs = ascKeys.length > 1;

    let tabsHtml = '';
    if (showTabs) {
        tabsHtml = `<div style="display: flex; justify-content: center; width: 100%;">
                        <div id="modal-tabs-container" style="display: flex; flex-wrap: nowrap; margin: 12px 0 15px 0 !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box;">`;
    }

    let contentHtml = ``;
    const btnClass = `seg-btn-forge-cost`;
    const contentClass = `tab-content-forge-cost`;

    const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; -webkit-text-stroke: 0px;";
    const arrowStyle = "font-family: 'Fredoka', sans-serif; font-weight: 800; font-size: 1.1rem; color: #198754; margin: 0 4px;";
    const afterColor = "color: #198754;";

    ascKeys.forEach((asc, index) => {
        const isActive = (index === 0) ? 'active' : '';
        const tabId = `forge-cost-tab-${asc}`;

        if (showTabs) {
            const tabLabel = asc === 0
                ? 'No Asc'
                : `<img src="icons/asc${asc}.png" style="height: 1.1em; vertical-align: -2px;" onerror="this.style.display='none'; this.nextSibling.style.display='inline'; this.nextSibling.textContent='Asc ${asc}';"><span style="display:none;"></span>`;
            const switchJs = `document.querySelectorAll('.${contentClass}').forEach(el => el.style.display='none'); document.getElementById('${tabId}').style.display='block'; document.querySelectorAll('.${btnClass}').forEach(el => el.classList.remove('active')); this.classList.add('active');`;

            tabsHtml += `<button class="${btnClass} seg-btn ${isActive}" onclick="${switchJs}" style="flex: 1 1 0 !important; min-width: 0 !important; padding: 0 2px !important; display: flex !important; justify-content: center !important; align-items: center !important;">${tabLabel}</button>`;
        }

        let rowsHtml = '';
        let ascTotalCur = 0;
        let ascTotalProj = 0;

        groupedSchedule[asc].forEach(step => {
            let displayLabel = "";
            if (step.isAscension) {
                displayLabel = `Ascension`;
            } else {
                let lvMatch = step.label.match(/Lv (\d+ ➜ \d+)/);
                displayLabel = lvMatch ? lvMatch[1] : step.label;
            }

            ascTotalCur += step.costCur || 0;
            ascTotalProj += step.costProj || 0;

            const costCurStr = formatCompactGold(step.costCur || 0);
            const costProjStr = formatCompactGold(step.costProj || 0);

            let costDisplay = '';
            if (costCurStr === costProjStr) {
                costDisplay = `<div style="display: flex; align-items: center; justify-content: center; color: #000;"><img src="icons/fm_gold.png" style="height: 1.1em; margin-right: 4px;"> ${costCurStr}</div>`;
            } else {
                costDisplay = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                        <span style="color: #000;">${costCurStr}</span>
                        <span style="${arrowStyle}">➜</span>
                        <span style="${afterColor}"><img src="icons/fm_gold.png" style="height: 1.1em; margin-right: 4px; vertical-align: -2px;">${costProjStr}</span>
                    </div>`;
            }

            rowsHtml += `<tr style="border-bottom: 1px solid #f0f0f0;">
                <td style="width: 40%; padding: 8px 10px; text-align: center; ${fontStyle} color: #000;">${displayLabel}</td>
                <td style="width: 60%; padding: 8px 10px; text-align: center; ${fontStyle}">${costDisplay}</td>
            </tr>`;
        });

        const totalCurStr = formatCompactGold(ascTotalCur);
        const totalProjStr = formatCompactGold(ascTotalProj);
        let totalDisplay = '';

        if (totalCurStr === totalProjStr) {
            totalDisplay = `<div style="display: flex; align-items: center; justify-content: center; color: #000;"><img src="icons/fm_gold.png" style="height: 1.1em; margin-right: 4px;"> ${totalCurStr}</div>`;
        } else {
            totalDisplay = `
                <div style="display: flex; align-items: center; justify-content: center; gap: 2px;">
                    <span style="color: #000;">${totalCurStr}</span>
                    <span style="${arrowStyle}">➜</span>
                    <span style="${afterColor}"><img src="icons/fm_gold.png" style="height: 1.1em; margin-right: 4px; vertical-align: -2px;">${totalProjStr}</span>
                </div>`;
        }

        let summaryHtml = `
        <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px 0; margin-bottom: 10px; display: flex; align-items: center;">
            <div style="width: 40%; text-align: center;">
                <span style="${fontStyle} color: #000; font-size: 0.95rem;">Total (Asc ${asc})</span>
            </div>
            <div style="width: 60%; text-align: center;">
                <span style="${fontStyle} color: #000; font-size: 0.95rem;">${totalDisplay}</span>
            </div>
        </div>`;

        let tableHtml = `
        ${summaryHtml}
        <table class="clean-table" style="width: 100%; table-layout: fixed; margin-top: 5px;">
            <thead>
                <tr>
                    <th style="text-align: center; width: 40%; padding: 8px 10px;">Level</th>
                    <th style="text-align: center; width: 60%; padding: 8px 10px;">Cost</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>`;

        contentHtml += `<div id="${tabId}" class="tab-content-area ${contentClass}" style="display: ${index === 0 ? 'block' : 'none'};">${tableHtml}</div>`;
    });

    if (showTabs) {
        tabsHtml += `</div></div>`;
    }

    renderMasterModal('forgeCostBreakdown', tabsHtml + contentHtml);
}

let currentForgeProbModalLevel = 1;

function openForgeProbModal(levelOverride = null) {
    if (levelOverride !== null) {
        currentForgeProbModalLevel = parseInt(levelOverride);
    } else {
        const targetInput = document.getElementById('calc-target-forge-lv')?.value;
        let parsedTarget = parseInt(targetInput);

        if (isNaN(parsedTarget)) {
            parsedTarget = parseInt(document.getElementById('calc-forge-lv')?.value) || 1;
        }
        currentForgeProbModalLevel = parsedTarget;
    }

    if (currentForgeProbModalLevel < 1) currentForgeProbModalLevel = 1;
    if (currentForgeProbModalLevel > 50) currentForgeProbModalLevel = 50;

    const isMin = currentForgeProbModalLevel <= 1;
    const isMax = currentForgeProbModalLevel >= 50;

    let listHtml = '';
    const rates = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES[currentForgeProbModalLevel] : null;

    if (!rates) {
        listHtml = `<div style="text-align:center; padding: 20px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000;">Data not available for Level ${currentForgeProbModalLevel}</div>`;
    } else {
        const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000; -webkit-text-stroke: 0px;";

        for (let i = 0; i < FORGE_TIER_NAMES.length; i++) {
            if (rates[i] > 0) {
                const formattedRate = rates[i] < 1 ? rates[i].toFixed(2) : rates[i].toFixed(1);

                listHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; margin-bottom: 6px; background-color: ${FORGE_TIER_COLORS[i]}; border-radius: 8px;">
                    <span style="${fontStyle}">${FORGE_TIER_NAMES[i]}</span>
                    <span style="${fontStyle}">${formattedRate}%</span>
                </div>`;
            }
        }
    }

    const leftArrowSvg = `
    <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 0px #000);">
        <polygon points="18,4 4.14,12 18,20" fill="#00a3ff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"></polygon>
    </svg>`;

    const rightArrowSvg = `
    <svg width="32" height="32" viewBox="0 0 24 24" style="filter: drop-shadow(0px 2px 0px #000);">
        <polygon points="6,4 19.86,12 6,20" fill="#00a3ff" stroke="#000000" stroke-width="2.5" stroke-linejoin="round"></polygon>
    </svg>`;

    const levelTextStyle = `
        font-family: 'Fredoka', sans-serif;
        font-size: 1.2rem;
        font-weight: 700;
        color: #ffffff;
        -webkit-text-stroke: 3px #000000;
        paint-order: stroke fill;
        line-height: 1;
        letter-spacing: 1px;
    `;

    const subTextStyle = `
        font-family: 'Fredoka', sans-serif;
        font-size: 0.95rem;
        font-weight: 600;
        color: #000;
        margin-top: 4px;
        -webkit-text-stroke: 0px;
    `;

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
        <button onclick="openForgeProbModal(${currentForgeProbModalLevel - 1})" ${isMin ? 'disabled' : ''} style="background: transparent; border: none; padding: 0; cursor: ${isMin ? 'default' : 'pointer'}; opacity: ${isMin ? '0.35' : '1'}; outline: none; display: flex; align-items: center;">
            ${leftArrowSvg}
        </button>

        <div style="text-align: center;">
            <div style="${levelTextStyle}">Level ${currentForgeProbModalLevel}</div>
            <div style="${subTextStyle}">Forge probabilities</div>
        </div>

        <button onclick="openForgeProbModal(${currentForgeProbModalLevel + 1})" ${isMax ? 'disabled' : ''} style="background: transparent; border: none; padding: 0; cursor: ${isMax ? 'default' : 'pointer'}; opacity: ${isMax ? '0.35' : '1'}; outline: none; display: flex; align-items: center;">
            ${rightArrowSvg}
        </button>
    </div>
    `;

    renderMasterModal('summonProb', navHtml + listHtml);
}