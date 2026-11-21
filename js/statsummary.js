/**
 * STATSUMMARY.JS
 * Stats Tab Summary & Reference/Breakdown Modals
 */

// ============================================================================
// 1. SLOT & LEVEL HELPERS
// ============================================================================

function getMinLevel(maxLv) {
    if (maxLv === 99) return 96;
    let floor = 1;
    const bracketFloors = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146];
    for (let f of bracketFloors) {
        if (f <= maxLv - 5) floor = f;
        else break;
    }
    return floor;
}

function getSlotStats(maxLv, bonus) {
    let total = 0, count = 0, minLv = getMinLevel(maxLv);
    for (let i = minLv; i <= maxLv; i++) {
        total += Math.round(20 * Math.pow(1.01, i - 1) * (100 + bonus) / 100);
        count++;
    }
    return { range: `${minLv}-${maxLv}`, avg: (count > 0 ? total / count : 0) };
}

// ============================================================================
// 2. MAIN STATS TAB RENDERER
// ============================================================================

function renderStats() {
    const container = document.getElementById('stats-content');
    if (!container) return;
    container.innerHTML = '';

    const state = calcState();
    let totalAvgCur = 0, totalAvgSellIso = 0, totalAvgSellCombined = 0;

    const slots = [];
    if (TREES.power && TREES.power.structure) {
        TREES.power.structure.forEach(s => {
            if (TREES.power.meta[s.id].isSlot) slots.push(s.id);
        });
    }

    slots.forEach(sid => {
        let l = 0;
        for (let t = 1; t <= 6; t++) l += (setupLevels[`power_T${t}_${sid}`] || 0);
        let lProj = 0;
        for (let t = 1; t <= 6; t++) lProj += (state.levels[`power_T${t}_${sid}`] || 0);

        totalAvgCur += getSlotStats(99 + l * 2, state.totalSellBonusCur).avg;
        totalAvgSellIso += getSlotStats(99 + l * 2, state.totalSellBonusProj).avg;
        totalAvgSellCombined += getSlotStats(99 + lProj * 2, state.totalSellBonusProj).avg;
    });

    const globCur = slots.length > 0 ? totalAvgCur / slots.length : 0;
    const globProj_SellIso = slots.length > 0 ? totalAvgSellIso / slots.length : 0;
    const globProj_SellCombined = slots.length > 0 ? totalAvgSellCombined / slots.length : 0;

    let techTimerLevels = 0;
    for (let t = 1; t <= 6; t++) {
        techTimerLevels += (setupLevels[`spt_T${t}_timer`] || 0);
    }
    const speedDivisor = 1 + (techTimerLevels * 4) / 100;

    ['forge', 'spt', 'power'].forEach(key => {
        const treeData = TREES[key];
        if (!treeData) return;

        let currentCount = 0;
        Object.keys(setupLevels).forEach(id => {
            if (id.startsWith(key + '_')) currentCount += setupLevels[id];
        });

        let totalTreeTime = 0;
        let spentTreeTime = 0;

        for (let t = 1; t <= 6; t++) {
            getStructure(key, t).forEach(ns => {
                const id = `${key}_T${t}_${ns.id}`;
                const meta = getMeta(id);
                if (!meta) return;
                const maxLevel = meta.m || 5;
                const cLvl = (setupLevels[id] || 0);

                for (let l = 0; l < maxLevel; l++) {
                    const timeCost = tierTimes[t][l] || 0;
                    totalTreeTime += timeCost;
                    if (l < cLvl) spentTreeTime += timeCost;
                }
            });
        }

        totalTreeTime = totalTreeTime / speedDivisor;
        spentTreeTime = spentTreeTime / speedDivisor;

        const remainingTime = totalTreeTime - spentTreeTime;
        const timePct = totalTreeTime > 0 ? ((spentTreeTime / totalTreeTime) * 100).toFixed(1) : 0;

        let timeLeftStr = '0m';
        if (remainingTime > 0) {
            const d = Math.floor(remainingTime / 1440);
            const h = Math.floor((remainingTime % 1440) / 60);
            const m = Math.floor(remainingTime % 60);
            if (d > 0) timeLeftStr = `${d}d ${h}h`;
            else if (h > 0) timeLeftStr = `${h}h ${m}m`;
            else timeLeftStr = `${m}m`;
        }

        const max = treeData.maxLevels;
        const pct = ((currentCount / max) * 100).toFixed(1);

        const group = document.createElement('div');
        group.className = 'stats-group';

        const header = document.createElement('div');
        header.className = `stats-header ${key}`;
        header.innerHTML = `
            <div class="header-left" style="display: flex; align-items: center; width: 100%;">
                <div class="header-icon-circle">
                    <img src="icons/tree_${key === 'spt' ? 'SPT' : key}.png" class="nav-icon">
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center; margin-left: 12px; gap: 6px;">
                    <div style="line-height: 1;">
                        <span class="stat-count-text">${currentCount}/${max}</span>
                        <span class="stat-pct-text" style="margin-left: 4px;">(${pct}%)</span>
                    </div>
                    <div style="line-height: 1; font-size: 0.9em; opacity: 0.95;">
                        <span class="stat-count-text">${timeLeftStr} left</span>
                        <span class="stat-pct-text" style="margin-left: 4px;">(${timePct}%)</span>
                    </div>
                </div>
            </div>`;

        group.appendChild(header);

        let hasStats = false;
        const allNodes = [];
        const seenIds = new Set();

        for (let t = 1; t <= 6; t++) {
            getStructure(key, t).forEach(ns => {
                if (!seenIds.has(ns.id)) {
                    seenIds.add(ns.id);
                    const egg6Idx = allNodes.findIndex(n => n.id === 'egg6');
                    if (ns.id.startsWith('egg') && egg6Idx !== -1) {
                        let insertPos = egg6Idx + 1;
                        while (insertPos < allNodes.length && allNodes[insertPos].id.startsWith('egg')) insertPos++;
                        allNodes.splice(insertPos, 0, ns);
                    } else {
                        allNodes.push(ns);
                    }
                }
            });
        }

        allNodes.forEach(ns => {
            const meta = treeData.meta[ns.id];
            if (!meta || !meta.stat) return;

            let curT = 0, projT = 0, curW = 0, projW = 0;
            for (let t = 1; t <= 6; t++) {
                const id = `${key}_T${t}_${ns.id}`;
                const cLvl = (setupLevels[id] || 0);
                const pLvl = (state.levels[id] || 0);
                curT += cLvl;
                projT += pLvl;
                curW += cLvl * t;
                projW += pLvl * t;
            }

            hasStats = true;
            let txtCur = meta.stat(curT, curW);
            let txtProj = meta.stat(projT, projW);

            if (txtProj.includes('%') && txtCur.includes('%')) {
                const match = txtProj.match(/([+\-]?\d+%?)$/);
                if (match) txtProj = match[0];
            }

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
            } else if (meta.isSlot) {
                const sCur = getSlotStats(99 + curT * 2, state.totalSellBonusCur);
                const sProj = getSlotStats(99 + projT * 2, state.totalSellBonusCur);
                txtCur = `Max ${99 + curT * 2} (Range: ${sCur.range} | Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(sCur.avg, 'gold')})`;
                txtProj = `Max ${99 + projT * 2} (Range: ${sProj.range} | Avg: <img src="icons/fm_gold.png" class="stat-key-icon"> ${formatResourceValue(sProj.avg, 'gold')})`;
            } else if (meta.isDiscount) {
                infoBtnHTML = `<button class="btn-info" onclick="showPotionTable(${curT * 2}, ${projT * 2})">i</button>`;
            } else if (key === 'spt' && ns.id === 'timer') {
                infoBtnHTML = `<button class="btn-info" onclick="showTechTimerTable(${curT * 4}, ${projT * 4})">i</button>`;
            } else if (key === 'forge' && ns.id === 'disc') {
                const discVal = meta.val !== undefined ? meta.val : 1;
                infoBtnHTML = `<button class="btn-info" onclick="showForgeTable('cost',${curT * discVal},${projT * discVal})">i</button>`;
            } else if (key === 'forge' && ns.id === 'timer') {
                const timerVal = meta.val !== undefined ? meta.val : 2;
                infoBtnHTML = `<button class="btn-info" onclick="showForgeTable('timer',${curT * timerVal},${projT * timerVal})">i</button>`;
            }

            let finalHTML = txtCur;
            if (projT > curT || (key === 'forge' && ns.id === 'sell' && globProj_SellCombined > globCur)) {
                finalHTML += ` <span class="stat-arrow">➜</span> <span class="stat-new">${txtProj}</span>`;
            }

            if (meta.isEgg) {
                let clanLvl = typeof window.getClanEggLvl === 'function' ? window.getClanEggLvl(ns.id) : 0;
                if (clanLvl > 0) {
                    const eggRate = meta.rate || 10;
                    let totalCur = (curT * eggRate) + (clanLvl * 5);
                    let totalProj = (projT * eggRate) + (clanLvl * 5);
                    let txtC = meta.base ? `Speed +${totalCur}% (${formatEggTime(meta.base / (1 + totalCur / 100))})` : `Speed +${totalCur}%`;
                    let txtP = meta.base ? `Speed +${totalProj}% (${formatEggTime(meta.base / (1 + totalProj / 100))})` : `Speed +${totalProj}%`;

                    let clanLine = txtC;
                    if (projT > curT) {
                        clanLine += ` <span class="stat-arrow">➜</span> <span class="stat-new">${txtP}</span>`;
                    }

                    finalHTML += `<div style="margin-top: 4px; font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 300; color: #ffffff; -webkit-text-stroke: 3px #000;">With Clan Tech:</div><div>${clanLine}</div>`;
                }
            }

            const row = document.createElement('div');
            row.className = 'stats-row ' + key;

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

// ============================================================================
// 3. STATS & REFERENCE MODALS
// ============================================================================

function updateSellRefTable() {
    const input = document.getElementById('ref-sell-bonus');
    const tbody = document.getElementById('sell-ref-body');
    if (!input || !tbody) return;

    let bonus = parseFloat(input.value) || 0;

    if (!window.refTablePrefs) window.refTablePrefs = {};
    window.refTablePrefs.sellBonus = bonus;

    let html = '';
    let floors = [];
    for (let i = 1; i <= 141; i += 5) floors.push(i);

    floors.forEach(min => {
        let max = min + 9;
        if (max > 149) max = 149;

        let total = 0;
        let count = 0;
        for (let i = min; i <= max; i++) {
            total += Math.round(20 * Math.pow(1.01, i - 1) * ((100 + bonus) / 100));
            count++;
        }
        const avg = count > 0 ? total / count : 0;
        const fmtAvg = typeof formatEqValue === 'function' ? formatEqValue(avg) : avg.toLocaleString();

        html += `
        <tr>
            <td style="text-align: center; width: 50%; color: #000; font-family: 'Fredoka', sans-serif;">${min}-${max}</td>
            <td style="text-align: center; width: 50%; color: #000; font-family: 'Fredoka', sans-serif;"><img src="icons/fm_gold.png" style="width:14px; height:14px; object-fit:contain; vertical-align:-2px;"> ${fmtAvg}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function updateStatsRefTable() {
    const tierSel = document.getElementById('ref-stats-tier');
    const masteryInput = document.getElementById('ref-stats-mastery');
    const ascSel = document.getElementById('ref-stats-ascension');
    const tbody = document.getElementById('stats-ref-body');
    if (!tierSel || !masteryInput || !tbody) return;

    const tier = tierSel.value;
    const mastery = parseFloat(masteryInput.value) || 0;
    const ascVal = ascSel ? parseInt(ascSel.value) : 0;

    if (!window.refTablePrefs) window.refTablePrefs = {};
    window.refTablePrefs.statsTier = tier;
    window.refTablePrefs.statsMastery = mastery;
    window.refTablePrefs.statsAscension = ascVal;

    const TIER_MULTS = {
        "Primitive": 1, "Medieval": Math.pow(4, 1), "Early-Modern": Math.pow(4, 2), "Modern": Math.pow(4, 3),
        "Space": Math.pow(4, 4), "Interstellar": Math.pow(4, 5), "Multiverse": Math.pow(4, 6),
        "Quantum": Math.pow(4, 7), "Underworld": Math.pow(4, 8), "Divine": Math.pow(4, 9),
        "Heroic": Math.pow(4, 10), "Infinite": Math.pow(4, 11), "Eternal": Math.pow(4, 12)
    };

    const ASC_MULTS = [1, 50, 2500, 125000];
    const ascMult = ASC_MULTS[ascVal] || 1;
    const tierMult = TIER_MULTS[tier] || 1;
    const hpBase = 40;
    const dmgBase = 5;

    let floors = [];
    for (let i = 1; i <= 141; i += 5) floors.push(i);

    let html = '';
    const calcStat = (base, lvl) => {
        const lvlMult = Math.pow(1.01, lvl - 1);
        return base * tierMult * lvlMult * (1 + mastery / 100) * ascMult;
    };

    const fmt = (val) => typeof formatCombatStat === 'function' ? formatCombatStat(val) : val.toLocaleString();

    floors.forEach(min => {
        let max = min + 9;
        if (max > 149) max = 149;

        let hpSum = 0, dmgSum = 0, count = 0;
        for (let i = min; i <= max; i++) {
            hpSum += calcStat(hpBase, i);
            dmgSum += calcStat(dmgBase, i);
            count++;
        }

        const avgHp = hpSum / count;
        const avgDmg = dmgSum / count;

        html += `
        <tr>
            <td style="text-align: left; padding-left: 10px; color: #000; font-family: 'Fredoka', sans-serif;">${min}-${max}</td>
            <td style="text-align: right; color: #000; font-family: 'Fredoka', sans-serif;">${fmt(avgHp)}</td>
            <td style="text-align: right; padding-right: 10px; color: #000; font-family: 'Fredoka', sans-serif;">${fmt(avgDmg)}</td>
        </tr>`;
    });

    tbody.innerHTML = html;
}

function showPotionTable(cur, proj) {
    const isUpgrade = proj > cur;
    const headers = ['Level', 'Upgrade Cost'];
    const allRows = [];

    for (let t = 1; t <= 6; t++) {
        let tierSumBefore = 0;
        let tierSumAfter = 0;
        let hasUnknown = false;

        for (let i = 0; i < 5; i++) {
            const base = (typeof potionCosts !== 'undefined' && potionCosts[t]) ? potionCosts[t][i] : '?';

            if (typeof base !== 'number' || isNaN(base)) {
                hasUnknown = true;
                allRows.push([`${i + 1}`, '?']);
                continue;
            }

            const v1 = Math.round(base * (1 - cur / 100));
            const v2 = Math.round(base * (1 - proj / 100));
            tierSumBefore += v1;
            tierSumAfter += v2;

            let valStr = v1.toLocaleString();
            if (isUpgrade) valStr += ` ➜ ${v2.toLocaleString()}`;
            allRows.push([`${i + 1}`, valStr]);
        }

        const suffix = hasUnknown ? '+' : '';
        let sumStr = tierSumBefore > 0 ? `${tierSumBefore.toLocaleString()}${suffix}` : '?';
        if (isUpgrade && tierSumBefore > 0) {
            sumStr += ` ➜ ${tierSumAfter.toLocaleString()}${suffix}`;
        }
        allRows.push([`Total`, sumStr]);
    }

    showTable(
        "TECH UPGRADE COST",
        "icons/spt_disc.png",
        { label: "Discount", before: `-${cur}%`, after: `-${proj}%` },
        headers,
        allRows,
        6,
        ['I', 'II', 'III', 'IV', 'V', 'VI']
    );
}

function showTechTimerTable(cur, proj) {
    const isUpgrade = proj > cur;
    const headers = ['Level', 'Duration'];
    const allRows = [];

    for (let t = 1; t <= 6; t++) {
        let tierSumBefore = 0;
        let tierSumAfter = 0;

        for (let i = 0; i < 5; i++) {
            const base = (typeof tierTimes !== 'undefined' && tierTimes[t]) ? (tierTimes[t][i] || 0) : 0;
            const v1 = base / (1 + cur / 100);
            const v2 = base / (1 + proj / 100);
            tierSumBefore += v1;
            tierSumAfter += v2;

            let valStr = formatSmartTime(v1);
            if (isUpgrade) valStr += ` ➜ ${formatSmartTime(v2)}`;
            allRows.push([`${i + 1}`, valStr]);
        }

        let sumStr = `${formatSmartTime(tierSumBefore)}`;
        if (isUpgrade) sumStr += ` ➜ ${formatSmartTime(tierSumAfter)}`;
        allRows.push([`Total`, sumStr]);
    }

    showTable(
        "TECH RESEARCH TIMER",
        "icons/spt_timer.png",
        { label: "Speed Bonus", before: `+${cur}%`, after: `+${proj}%` },
        headers,
        allRows,
        6,
        ['I', 'II', 'III', 'IV', 'V', 'VI']
    );
}

function showEqSellTable(cur, proj) {
    const isUpgrade = proj > cur;
    const headers = ["Level", "Sell Price"];
    const allRows = [];

    for (let i = 1; i <= 149; i++) {
        const base = 20 * Math.pow(1.01, i - 1);
        const v1 = Math.round(base * (100 + cur) / 100);
        const v2 = Math.round(base * (100 + proj) / 100);
        let valStr = formatResourceValue(v1, 'gold');
        if (isUpgrade) valStr += ` ➜ ${formatResourceValue(v2, 'gold')}`;
        allRows.push([`${i}`, valStr]);
    }

    showTable(
        "EQUIPMENT SELL PRICE",
        "icons/forge_sell.png",
        { label: "Bonus", before: `+${cur}%`, after: `+${proj}%` },
        headers,
        allRows
    );
}

function showForgeTable(type, cur, proj) {
    const isUpgrade = proj > cur;
    const isT = type === 'timer';
    const title = isT ? "FORGE UPGRADE TIME" : "FORGE UPGRADE COST";
    const iconSrc = isT ? "icons/forge_timer.png" : "icons/forge_disc.png";
    const headers = ["Level", isT ? "Upgrade Duration" : "Upgrade Cost"];
    const rows = [];

    let totalValBefore = 0;
    let totalValAfter = 0;

    for (let i = 1; i <= 49; i++) {
        if (typeof forgeLevelData === 'undefined' || !forgeLevelData[i]) continue;
        const [cost, hours] = forgeLevelData[i];
        let v1, v2;

        if (isT) {
            const mins = hours * 60;
            const rawV1 = mins / (1 + cur / 100);
            const rawV2 = mins / (1 + proj / 100);

            totalValBefore += rawV1;
            totalValAfter += rawV2;

            v1 = formatSmartTime(rawV1);
            v2 = formatSmartTime(rawV2);
        } else {
            const rawV1 = Math.round(cost * (1 - cur / 100));
            const rawV2 = Math.round(cost * (1 - proj / 100));

            totalValBefore += rawV1;
            totalValAfter += rawV2;

            v1 = formatForgeCost(rawV1);
            v2 = formatForgeCost(rawV2);
        }

        let cellContent = v1;
        if (isUpgrade) cellContent += ` ➜ ${v2}`;
        rows.push([`${i} ➜ ${i + 1}`, cellContent]);
    }

    let totalStrBefore, totalStrAfter;
    if (isT) {
        totalStrBefore = formatSmartTime(totalValBefore);
        totalStrAfter = formatSmartTime(totalValAfter);
    } else {
        totalStrBefore = formatForgeCost(Math.round(totalValBefore));
        totalStrAfter = formatForgeCost(Math.round(totalValAfter));
    }

    let totalCellContent = totalStrBefore;
    if (isUpgrade) totalCellContent += ` ➜ ${totalStrAfter}`;

    rows.push(["Total", totalCellContent]);

    showTable(
        title,
        iconSrc,
        isT
            ? { label: "Speed", before: `+${cur}%`, after: `+${proj}%` }
            : { label: "Discount", before: `-${cur}%`, after: `-${proj}%` },
        headers,
        rows,
        50
    );
}