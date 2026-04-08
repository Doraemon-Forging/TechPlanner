/**
 * MODAL.JS
 * Master Engine for all custom popup modals.
 */

// =========================================
// 1. THE CONTROL PANEL (Change Colors & Text Here)
// =========================================
const MODAL_SETTINGS = {
    dailyGold: {
        title: "TOTAL DAILY GOLD VALUE",
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: ""
    },
    warYield: {
        title: "EXPECTED YIELD", 
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: ""
    },
    skillLevels: {
        title: "ESTIMATED SKILL LEVELS",
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: "Calculations assume an equal drop rate among the 3 skills within each tier"
    },
    eqAvgBreakdown: {
        title: "OVERALL AVERAGE HEALTH/DAMAGE BREAKDOWN",
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: "The table shows the average for the full range. If your current max level hasn't reached the top of the bracket yet, your average will be slightly lower." 
    },
    mountMilestones: {
        title: "TIER UNLOCK REQUIREMENTS",
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: "Total <b><i>mount pulls</b></i> and mount keys needed to have a chance of summoning higher tier mounts for the first time."
    },
    mountExpBreakdown: {
        title: "EXPECTED MOUNT YIELD",
        headerColor: "#ebf8fa", titleColor: "#ffffff",
        disclaimer: ""
    },
    eqSellBreakdown: { 
        title: "SELL PRICE BREAKDOWN", 
        headerColor: "#ebf8fa", titleColor: "#ffffff", 
         disclaimer: "Item sell price depends on item level regardless of its tier. The table shows the average for the full range. If your current max level hasn't reached the top of the bracket yet, your average will be slightly lower."
        },
    eqRange: { 
        title: "LEVEL RANGE PROGRESSION", 
        headerColor: "#ebf8fa", titleColor: "#ffffff", 
        disclaimer: "Repeatedly forging an item slot increases your level bracket for that specific tier." 
    }
};

// =========================================
// 2. THE MASTER ENGINE (Builds the Modal Shell)
// =========================================
function renderMasterModal(configKey, bodyContentHTML) {
    const modal = document.getElementById('tableModal');
    const content = modal.querySelector('.modal-content');
    
    if (typeof window.ORIGINAL_MODAL_CSS === 'undefined') {
        window.ORIGINAL_MODAL_CSS = content.style.cssText;
    }

    if (!MODAL_SETTINGS[configKey]) {
        MODAL_SETTINGS[configKey] = { title: "DETAILS", headerColor: "#ccced8", titleColor: "#ffffff", disclaimer: "" };
    }
    const settings = MODAL_SETTINGS[configKey];

    content.className = 'modal-content'; 
    content.style.cssText = window.ORIGINAL_MODAL_CSS || ''; 
    content.style.padding = "0";
    content.style.backgroundColor = "#FFFFFF";

    if (!content.style.width) content.style.width = "90%";
    if (!content.style.maxWidth) content.style.maxWidth = "500px";

    let footerHtml = '';
    let scrollStyle = 'padding: 10px 15px; background: #ffffff;';

    if (settings.disclaimer && settings.disclaimer.trim() !== '') {
        footerHtml = `
        <div class="modal-footer" style="background-color: ${settings.headerColor}; border-top: 2px solid #000; border-radius: 0 0 16px 16px; padding: 10px 15px 25px 15px;">
            <div class="modal-disclaimer">
                ${settings.disclaimer}
            </div>
        </div>`;
    } else {
        scrollStyle = 'padding: 10px 15px 25px 15px; background: #ffffff; border-radius: 0 0 16px 16px;';
    }

    content.innerHTML = `
        <button class="btn-close-floating" onclick="document.getElementById('tableModal').style.display='none'"><span>×</span></button>

        <div class="modal-header-fixed" style="background-color: ${settings.headerColor}; border-bottom: 2px solid #000; border-radius: 16px 16px 0 0; padding: 15px 10px 10px 10px;">
            <h2 class="modal-title-text" style="color: ${settings.titleColor};">
                ${settings.title}
            </h2>
        </div>
        
        <div id="modal-scroll-area" class="modal-body-scroll" style="${scrollStyle}">
            ${bodyContentHTML}
        </div>
        
        ${footerHtml}
    `;

    modal.style.display = 'block';
}

// =========================================
// 3. TABLE GENERATOR (For STATS Tab)
// =========================================
let currentModalTableData = { headers: [], rows:[], itemsPerTab: 0 };

function renderModalTable(configKey, subData, headers, allRows, itemsPerTab = 0, tabNames =[]) {
    currentModalTableData = { headers, rows: allRows, itemsPerTab };
    
    let subRowHtml = '';
    if (subData) {
        const dataArray = Array.isArray(subData) ? subData : [subData];
        dataArray.forEach(sd => {
            let valHtml = `<span style="color: #000; -webkit-text-stroke: 0px #000000; font-family: 'Fredoka', sans-serif; font-weight: 600;">${sd.before}</span>`; 
            
            if (sd.before !== sd.after) {
                valHtml += `<span style="margin: 0 8px; color: #000; font-family: 'Fredoka', sans-serif; font-weight: 600; -webkit-text-stroke: 0px;">➜</span>`;
                valHtml += `<span style="color: #198754; font-family: 'Fredoka', sans-serif; font-weight: 600; -webkit-text-stroke: 0px;">${sd.after}</span>`;
            }

            subRowHtml += `
                <div style="background-color: #f2f2f2; border-radius: 8px; padding: 8px 20px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center; border: none;">
                    <span style="color: #000000; font-family: 'Fredoka', sans-serif; font-weight: 600; -webkit-text-stroke: 0px;">${sd.label}</span>
                    <div style="font-family: 'Fredoka', sans-serif; font-size: 0.95rem;">${valHtml}</div>
                </div>`;
        });
    }

    let tabsHtml = '';
    if (itemsPerTab > 0 && tabNames.length > 0) {
        tabsHtml = `<div id="modal-tabs-container">`;
        tabNames.forEach((name, idx) => {
            const activeCls = idx === 0 ? 'active' : '';
            tabsHtml += `<button class="seg-btn ${activeCls}" onclick="switchModalTab(${idx}, this)">${name}</button>`;
        });
        tabsHtml += `</div>`;
    }

    let isLeftAligned = (headers[0] === "Item Tier" || headers[0] === "Category" || headers[0] === "Rarity");
    let leftHeaderStyle = isLeftAligned ? 'text-align: left; padding-left: 20px; width: 45%;' : '';
    let rightHeaderStyle = 'text-align: right; padding-right: 20px; box-sizing: border-box;';

    let tableHtml = `
        ${subRowHtml}
        ${tabsHtml}
        <table class="clean-table" style="margin-top: 10px; width: 100%;">
            <thead><tr>
                <th style="${leftHeaderStyle}">${headers[0]}</th>
                <th style="${rightHeaderStyle}">${headers[1]}</th>
            </tr></thead>
            <tbody id="modal-table-body"></tbody>
        </table>
    `;

    renderMasterModal(configKey, tableHtml);
    switchModalTab(0); 
}

function switchModalTab(tabIndex, btnElement = null) {
    if (btnElement) {
        const container = document.getElementById('modal-tabs-container');
        if(container) {
            Array.from(container.children).forEach(btn => btn.classList.remove('active'));
            btnElement.classList.add('active');
        }
    }

    const tbody = document.getElementById('modal-table-body');
    if (!tbody) return;

    const data = currentModalTableData;
    let startIdx = 0;
    let endIdx = data.rows.length;

    if (data.itemsPerTab > 0) {
        startIdx = tabIndex * data.itemsPerTab;
        endIdx = startIdx + data.itemsPerTab;
    }

    let isLeftAligned = (data.headers[0] === "Item Tier" || data.headers[0] === "Category" || data.headers[0] === "Rarity");
    let leftColStyle = isLeftAligned ? 'text-align: left; padding-left: 20px; display: block; width: 100%; box-sizing: border-box;' : '';

    let rowsHtml = '';
    for (let i = startIdx; i < endIdx && i < data.rows.length; i++) {
        const row = data.rows[i];
        
        let leftCol = row[0];
        let rightCol = row[1];
        
        let bgColorStyle = row[2] ? `background-color: ${row[2]} !important; border-top-color: transparent !important; border-bottom-color: transparent !important;` : '';
        let textStyle = row[2] ? `color: #000 !important; font-family: 'Fredoka', sans-serif; font-weight: 700;` : ''; 

        if (rightCol.includes('➜')) {
            let parts = rightCol.split('➜');
            rightCol = `
                <div style="display: flex; justify-content: flex-end; align-items: center; gap: 6px; width: 100%; padding-right: 20px; box-sizing: border-box;"> 
                    <div style="${textStyle}">${parts[0].trim()}</div>
                    <div style="color: #000 !important; font-weight: 900; -webkit-text-stroke: 0px !important; margin: 0 2px;">➜</div>
                    <div style="color: #198754 !important; font-weight: 800; -webkit-text-stroke: 0px !important;">${parts[1].trim()}</div>
                </div>`;
        } else {
            rightCol = `<div style="${textStyle} text-align: right; width: 100%; display: block; padding-right: 20px; box-sizing: border-box;">${rightCol}</div>`;
        }
        
        rowsHtml += `<tr><td style="${bgColorStyle}"><div style="${leftColStyle} ${textStyle}">${leftCol}</div></td><td style="${bgColorStyle}">${rightCol}</td></tr>`;
    }
    tbody.innerHTML = rowsHtml;
}

// =========================================
// 4. FORMATTERS & HELPER FUNCTIONS
// =========================================
const formatCompactGold = (val) => {
    if (val < 10000) return Math.round(val).toLocaleString('en-US');
    if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';
    return parseFloat((val / 1000000).toFixed(2)) + 'm';
};

const formatYield = (val) => {
    if (val === 0) return "0";
    if (val > 0 && val < 10) return val.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    return val.toLocaleString('en-US', {minimumFractionDigits: 1, maximumFractionDigits: 1});
};

function switchContentTab(tabId, btn) {
    // 1. Reset buttons
    const container = btn.parentNode;
    Array.from(container.children).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // 2. Hide all tab content
    const parent = container.parentNode;
    parent.querySelectorAll('.tab-content-area').forEach(div => div.style.display = 'none');

    // 3. Show selected tab
    const target = parent.querySelector(`#${tabId}`);
    if (target) target.style.display = 'block';
}

function updateSellRefTable() {
    const input = document.getElementById('ref-sell-bonus');
    const tbody = document.getElementById('sell-ref-body');
    if (!input || !tbody) return;

    let bonus = parseFloat(input.value) || 0;
    
    // SAVE TO GLOBAL STATE
    if (!window.refTablePrefs) window.refTablePrefs = {};
    window.refTablePrefs.sellBonus = bonus;
    
    let html = '';
    let floors = [];
    for(let i=1; i<=141; i+=5) floors.push(i);

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

    // SAVE TO GLOBAL STATE
    if (!window.refTablePrefs) window.refTablePrefs = {};
    window.refTablePrefs.statsTier = tier;
    window.refTablePrefs.statsMastery = mastery;
    window.refTablePrefs.statsAscension = ascVal;

    const TIER_MULTS = {
        "Primitive": 1, "Medieval": Math.pow(4, 1), "Early-Modern": Math.pow(4, 2), "Modern": Math.pow(4, 3),
        "Space": Math.pow(4, 4), "Interstellar": Math.pow(4, 5), "Multiverse": Math.pow(4, 6),
        "Quantum": Math.pow(4, 7), "Underworld": Math.pow(4, 8), "Divine": Math.pow(4, 9)
    };

    const ASC_MULTS = [1, 50, 2500, 125000];
    const ascMult = ASC_MULTS[ascVal] || 1;

    const tierMult = TIER_MULTS[tier] || 1;
    const hpBase = 40;
    const dmgBase = 5;

    let floors = [];
    for(let i=1; i<=141; i+=5) floors.push(i);

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

// =========================================
// 5. SPECIFIC MODALS
// =========================================

// --- WAR CALC MODALS ---
function openWarYieldModal(type) {
    if (!window.currentWarYields) return;
    
    const dataB = type === 'skill' ? window.currentWarYields.skillB : window.currentWarYields.mountB;
    const dataA = type === 'skill' ? window.currentWarYields.skillA : window.currentWarYields.mountA;
    const POINTS_MAP = type === 'skill' ? [125, 150, 175, 200, 225, 250] : [50, 100, 250, 500, 1500, 2500];
    const ROW_COLORS = ['#f1f1f1', '#5dd9ff', '#5dfe8a', '#fdff5e', '#ff5d5e', '#d55cff'];
    
    let totalB = 0; let totalA = 0; let rowsHtml = '';
    const fontStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 600; -webkit-text-stroke: 0px #000000 !important; font-size: 0.9rem;";
    const arrowStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 650; font-size: 1rem; color: #198754; -webkit-text-stroke: 0px #000000 !important;margin: 0 4px;";
    const afterStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000 !important; color: #000000;";

    for (let i = 0; i < 6; i++) {
        const vB = dataB[i] || 0; const vA = dataA[i] || 0;
        totalB += vB; totalA += vA;
        const fmtB = formatYield(vB); const fmtA = formatYield(vA);
        const isSingleVal = (fmtB === fmtA);
        
        let amountHtml = isSingleVal ? `<span style="${fontStyle} color: #000;">${fmtB}</span>` : `
            <div class="war-val-group-left" style="display: flex; justify-content: flex-start; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span style="${fontStyle} color: #000;">${fmtB}</span>
                <div style="display: flex; align-items: center;"><span style="${arrowStyle}">➜</span><span style="${afterStyle}">${fmtA}</span></div>
            </div>`;

        const ptsB = vB * POINTS_MAP[i]; const ptsA = vA * POINTS_MAP[i];
        const fmtPtsB = Math.round(ptsB).toLocaleString('en-US'); const fmtPtsA = Math.round(ptsA).toLocaleString('en-US');
        const isSinglePts = (fmtPtsB === fmtPtsA);

        let ptsHtml = isSinglePts ? `<span style="${fontStyle} color: #000;">${fmtPtsB}</span>` : `
            <div class="war-val-group" style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span style="${fontStyle} color: #000;">${fmtPtsB}</span>
                <div style="display: flex; align-items: center;"><span style="${arrowStyle}">➜</span><span style="${afterStyle}">${fmtPtsA}</span></div>
            </div>`;

        rowsHtml += `
            <div style="background-color: ${ROW_COLORS[i]}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div style="text-align: left;">${amountHtml}</div><div style="text-align: right;">${ptsHtml}</div>
            </div>`;
    }

    let summaryHtml = '';
    const renderSummaryRow = (label, b, a) => {
        const isSingle = (b === a);
        let valHtml = isSingle ? `<span style="${fontStyle} color: #000;">${b}</span>` : `
            <div class="war-val-group" style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span style="${fontStyle} color: #000;">${b}</span>
                <div style="display: flex; align-items: center;"><span style="${arrowStyle}">➜</span><span style="${afterStyle}">${a}</span></div>
            </div>`;
        return `
            <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <span style="${fontStyle} color: #000;">${label}</span><div style="text-align: right;">${valHtml}</div>
            </div>`;
    };

    if (type === 'skill') {
        // Grab base info to calculate projected levels
        const baseLv = parseInt(document.getElementById('wc-skill-lv')?.value || 1);
        const baseExp = parseFloat(document.getElementById('wc-skill-exp')?.value.replace(/,/g, '') || 0);
        const historicalSkills = typeof getHistoricalSkillCount === 'function' ? getHistoricalSkillCount(baseLv, baseExp) : 0;

        const finalSkillsB = historicalSkills + Math.round(totalB);
        const finalSkillsA = historicalSkills + Math.round(totalA);

        const levelDataB = typeof getLevelFromTotalPulls === 'function' ? getLevelFromTotalPulls(finalSkillsB) : {level: 1, exp: 0, maxExp: 10};
        const levelDataA = typeof getLevelFromTotalPulls === 'function' ? getLevelFromTotalPulls(finalSkillsA) : {level: 1, exp: 0, maxExp: 10};

        const formatLv = (ld) => ld.maxExp === "MAX" ? "Lv 100 (MAX)" : `Lv ${ld.level} (${Math.round(ld.exp)}/${ld.maxExp})`;

        summaryHtml += renderSummaryRow("Skill Summoned", Math.round(totalB).toLocaleString('en-US'), Math.round(totalA).toLocaleString('en-US'));
        summaryHtml += renderSummaryRow("Summon Lv", formatLv(levelDataB), formatLv(levelDataA));

    } else if (type === 'mount') {
        const pullsB = window.currentWarYields.mountPullsB || 0; const pullsA = window.currentWarYields.mountPullsA || 0;
        summaryHtml += renderSummaryRow("Mount Pull", Math.round(pullsB).toLocaleString('en-US'), Math.round(pullsA).toLocaleString('en-US'));
        summaryHtml += renderSummaryRow("Mount Summoned", formatYield(totalB), formatYield(totalA));
    }

    const mobileStyle = `
        <style>
            @media (max-width: 768px) {
                .war-val-group { flex-direction: column; align-items: flex-end !important; gap: 0 !important; }
                .war-val-group-left { flex-direction: column; align-items: flex-start !important; gap: 0 !important; }
            }
        </style>`;

    const finalHtml = `
        ${mobileStyle}
        <div style="display: flex; flex-direction: column; gap: 4px;">
            ${summaryHtml}
            <div style="height: 10px;"></div> <div style="display: flex; justify-content: space-between; padding: 0 15px; margin-bottom: 5px;">
                <span style="${fontStyle} color: #000;">Amount</span><span style="${fontStyle} color: #000;">War Points</span>
            </div>
            ${rowsHtml}
        </div>`;

    const backupTitle = MODAL_SETTINGS.warYield.title;
    MODAL_SETTINGS.warYield.title = type === 'skill' ? "EXPECTED SKILL YIELD" : "EXPECTED MOUNT YIELD";
    renderMasterModal('warYield', finalHtml);
    MODAL_SETTINGS.warYield.title = backupTitle;
}

// --- CALCULATOR & DAILY MODALS ---
function openDailyGoldModal(md) {
    const getHammerData = (valB, valA) => {
        const fmtB = Math.round(valB).toLocaleString('en-US'); const fmtA = Math.round(valA).toLocaleString('en-US');
        const icon = `<img src="icons/fm_hammer.png" style="height: 1.2em; vertical-align: -3px; margin-right: 2px;">`;
        return { b: `${icon}${fmtB}`, a: `${icon}${fmtA}`, isUpgrade: fmtB !== fmtA };
    };

    const getGoldData = (valB, valA) => {
        const fmtB = formatCompactGold(valB); const fmtA = formatCompactGold(valA);
        const icon = `<img src="icons/fm_gold.png" style="height: 1.2em; vertical-align: -3px; margin-right: 2px;">`;
        return { b: `${icon}${fmtB}`, a: `${icon}${fmtA}`, isUpgrade: fmtB !== fmtA };
    };

    const hammerRows = [
        ["Offline Hammer", getHammerData(md.offHB, md.offHA)],["Thief Hammer (x2)", getHammerData(md.thiefHB, md.thiefHA)],
        ["Effective Hammer", getHammerData(md.effHB, md.effHA)]
    ];

    const goldRows = [["Offline Coin", getGoldData(md.offGB, md.offGA)],["Thief Coin (x2)", getGoldData(md.thiefGB, md.thiefGA)],["Gold from Hammering", getGoldData(md.forgeGB, md.forgeGA)]
    ];

    const customStyles = `
        <style>
            .dg-box { border: 3px solid #000; border-radius: 14px; padding: 8px; margin-bottom: 15px; background: #fff; }
            .dg-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
            .dg-table td { background: #EBEBEB; padding: 10px 15px; font-family: 'Fredoka', sans-serif !important; -webkit-text-stroke: 0px !important; }
            .dg-table td:first-child { border-radius: 10px 0 0 10px; width: 45%; font-weight: 600; font-size: 0.9rem; color: #000; }
            .dg-table td:last-child { border-radius: 0 10px 10px 0; width: 55%; text-align: right; }
            .dg-val-wrapper { display: flex; align-items: center; justify-content: flex-end; }
            .dg-val-before { font-weight: 600; color: #000; display: flex; align-items: center; font-size: 0.9rem; }
            .dg-val-after-group { display: flex; align-items: center; font-size: 0.9rem; font-weight: 600; }
            .dg-val-arrow { margin: 0 8px; font-size: 1.1rem; color: #198754; -webkit-text-stroke: 0px transparent !important; font-family: 'Fredoka', sans-serif !important; font-weight: 800; }
            .dg-val-after { color: #198754; font-weight: 600; display: flex; align-items: center; }

            @media (max-width: 768px) {
                .dg-box { padding: 4px; border-width: 2px; }
                .dg-table td { padding: 8px 10px; }
                .dg-val-wrapper { flex-direction: column; align-items: flex-end; justify-content: center; }
                .dg-val-after-group { margin-top: 4px; }
            }
        </style>`;

    function buildBox(rows) {
        let trs = '';
        for (let row of rows) {
            let leftLabel = row[0]; let data = row[1];
            let rightHtml = `<div class="dg-val-wrapper"><div class="dg-val-before">${data.b}</div>`;
            if (data.isUpgrade) {
                rightHtml += `<div class="dg-val-after-group"><div class="dg-val-arrow">➜</div><div class="dg-val-after">${data.a}</div></div>`;
            }
            rightHtml += `</div>`;
            trs += `<tr><td>${leftLabel}</td><td>${rightHtml}</td></tr>`;
        }
        return `<div class="dg-box"><table class="dg-table"><tbody>${trs}</tbody></table></div>`;
    }

    renderMasterModal('dailyGold', customStyles + buildBox(hammerRows) + buildBox(goldRows));
}

function openForgeModal(md, forgeLvl) {
    const rates = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES[forgeLvl] || CALC_FORGE_RATES[1] : [];
    const TIER_NAMES =["Primitive", "Medieval", "Early-Modern", "Modern", "Space", "Interstellar", "Multiverse", "Quantum", "Underworld", "Divine"];
    const allRows =[];
    
    for (let i = 0; i < 10; i++) {
        if (rates[i] > 0) {
            const amtB = md.effHB * (rates[i] / 100); const amtA = md.effHA * (rates[i] / 100);
            const fmtB = formatYield(amtB); const fmtA = formatYield(amtA);
            
            let valStr = fmtB;
            if (fmtB !== fmtA) valStr += ` ➜ ${fmtA}`;
            allRows.push([TIER_NAMES[i], valStr]);
        }
    }
    renderModalTable('dailyForge', null, ["Item Tier", "Amount"], allRows, 0,[]);
}

// --- STATS TAB MODALS ---
function showPotionTable(cur, proj) {
    const isUpgrade = proj > cur; const headers = ['Level', 'Upgrade Cost']; const allRows = [];
    for (let t = 1; t <= 5; t++) {
        let tierSumBefore = 0; let tierSumAfter = 0;
        for (let i = 0; i < 5; i++) { const base = potionCosts[t][i]; const v1 = Math.round(base * (1 - cur / 100)); const v2 = Math.round(base * (1 - proj / 100)); tierSumBefore += v1; tierSumAfter += v2; let valStr = v1.toLocaleString(); if (isUpgrade) valStr += ` ➜ ${v2.toLocaleString()}`; allRows.push([`${i + 1}`, valStr]); }
        let sumStr = `${tierSumBefore.toLocaleString()}`; if (isUpgrade) sumStr += ` ➜ ${tierSumAfter.toLocaleString()}`; allRows.push([`Total`, sumStr]);
    }
    showTable("TECH UPGRADE COST", "icons/spt_disc.png", { label: "Discount", before: `-${cur}%`, after: `-${proj}%` }, headers, allRows, 6, ['I', 'II', 'III', 'IV', 'V']);
}
function showTechTimerTable(cur, proj) {
    const isUpgrade = proj > cur; const headers = ['Level', 'Duration']; const allRows = [];
    for (let t = 1; t <= 5; t++) {
        let tierSumBefore = 0; let tierSumAfter = 0;
        for (let i = 0; i < 5; i++) { const base = tierTimes[t][i]; const v1 = base / (1 + cur / 100); const v2 = base / (1 + proj / 100); tierSumBefore += v1; tierSumAfter += v2; let valStr = formatSmartTime(v1); if (isUpgrade) valStr += ` ➜ ${formatSmartTime(v2)}`; allRows.push([`${i + 1}`, valStr]); }
        let sumStr = `${formatSmartTime(tierSumBefore)}`; if (isUpgrade) sumStr += ` ➜ ${formatSmartTime(tierSumAfter)}`; allRows.push([`Total`, sumStr]);
    }
    showTable("TECH RESEARCH TIMER", "icons/spt_timer.png", { label: "Speed Bonus", before: `+${cur}%`, after: `+${proj}%` }, headers, allRows, 6, ['I', 'II', 'III', 'IV', 'V']);
}
function showEqSellTable(cur, proj) {
    const isUpgrade = proj > cur; const headers = ["Level", "Sell Price"]; const allRows = [];
    for (let i = 1; i <= 149; i++) { const base = 20 * Math.pow(1.01, i - 1); const v1 = Math.round(base * (100 + cur) / 100); const v2 = Math.round(base * (100 + proj) / 100); let valStr = formatResourceValue(v1, 'gold'); if (isUpgrade) valStr += ` ➜ ${formatResourceValue(v2, 'gold')}`; allRows.push([`${i}`, valStr]); }
    showTable("EQUIPMENT SELL PRICE", "icons/forge_sell.png", { label: "Bonus", before: `+${cur}%`, after: `+${proj}%` }, headers, allRows);
}
function showForgeTable(type, cur, proj) {
    const isUpgrade = proj > cur; const isT = type === 'timer'; const title = isT ? "FORGE UPGRADE TIME" : "FORGE UPGRADE COST"; const iconSrc = isT ? "icons/forge_timer.png" : "icons/forge_disc.png"; const headers = ["Level", isT ? "Upgrade Duration" : "Upgrade Cost"]; const rows = [];
    for (let i = 1; i <= 34; i++) {
        if (!forgeLevelData[i]) continue;
        const [cost, hours] = forgeLevelData[i];
        let v1, v2; if (isT) { const mins = hours * 60; v1 = formatSmartTime(mins / (1 + cur / 100)); v2 = formatSmartTime(mins / (1 + proj / 100)); } else { v1 = formatForgeCost(Math.round(cost * (1 - cur / 100))); v2 = formatForgeCost(Math.round(cost * (1 - proj / 100))); }
        let cellContent = v1; if (isUpgrade) cellContent += ` ➜ ${v2}`; rows.push([`${i} ➜ ${i + 1}`, cellContent]);
    }
    showTable(title, iconSrc, isT ? { label: "Speed", before: `+${cur}%`, after: `+${proj}%` } : { label: "Discount", before: `-${cur}%`, after: `-${proj}%` }, headers, rows, 50);
}

// --- EQUIPMENT MODALS ---
function openEqSellBreakdownModal(currentAvg, fromLevel, fromBonus, finalAvg) {
    const fontStr = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const safeFormat = (val) => typeof formatEqValue === 'function' ? formatEqValue(val) : val.toLocaleString();
    
    // READ FROM GLOBAL STATE (OR DEFAULT TO 0)
    const savedBonus = (window.refTablePrefs && window.refTablePrefs.sellBonus) ? window.refTablePrefs.sellBonus : 0;

    // TAB 1: BREAKDOWN HTML
    let breakdownHtml = `
    <div style="display: flex; flex-direction: column; gap: 6px; padding-top: 5px;">
        <div style="background-color: #f2f2f2; border-radius: 8px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStr} font-weight: 600; color: #000; font-size: 0.9rem;">Current Overall Average</span>
            <span style="${fontStr} font-weight: 600; color: #000; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;"><img src="icons/fm_gold.png" style="width:16px; height:16px; object-fit:contain;"> ${safeFormat(currentAvg)}</span>
        </div>
        <div style="background-color: #ecf0f1; border-radius: 8px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStr} font-weight: 600; color: #000; font-size: 0.9rem;">From New Level Brackets</span>
            <span style="${fontStr} font-weight: 600; color: #198754; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;"><img src="icons/fm_gold.png" style="width:16px; height:16px; object-fit:contain;"> ${safeFormat(fromLevel)}</span>
        </div>
        <div style="background-color: #ecf0f1; border-radius: 8px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStr} font-weight: 600; color: #000; font-size: 0.9rem;">From Eq. Sell Price Tech</span>
            <span style="${fontStr} font-weight: 600; color: #198754; font-size: 0.9rem; display: flex; align-items: center; gap: 5px;"><img src="icons/fm_gold.png" style="width:16px; height:16px; object-fit:contain;"> ${safeFormat(fromBonus)}</span>
        </div>
        <div style="background-color: #d1f2eb; border: 2px solid #198754; border-radius: 8px; padding: 12px 15px; margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStr} font-weight: 700; color: #000; font-size: 0.95rem;">Planned Overall Average</span>
            <span style="${fontStr} font-weight: 700; color: #198754; font-size: 0.95rem; display: flex; align-items: center; gap: 5px;"><img src="icons/fm_gold.png" style="width:18px; height:18px; object-fit:contain;"> ${safeFormat(finalAvg)}</span>
        </div>
    </div>`;

    // TAB 2: REF TABLE HTML
    let refTableHtml = `
    <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 5px;">
        <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStr} font-weight: 600; color: #000; font-size: 0.95rem;">Sell Price Bonus %:</span>
            <input type="number" id="ref-sell-bonus" value="${savedBonus}" oninput="updateSellRefTable()" style="width: 80px; height: 32px; border: 2px solid #000000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important; background-color: #ffffff;">
        </div>
        <table class="clean-table" style="width: 100%;">
            <thead><tr><th style="text-align: center; width: 50%;">Level Bracket</th><th style="text-align: center; width: 50%;">Avg Sell Price</th></tr></thead>
            <tbody id="sell-ref-body"></tbody>
        </table>
    </div>`;

    const fullHtml = `
        <div id="modal-tabs-container" style="margin-bottom: 12px;">
            <button class="seg-btn active" onclick="switchContentTab('tab-breakdown', this)">Breakdown</button>
            <button class="seg-btn" onclick="switchContentTab('tab-ref', this)">Ref. Table</button>
        </div>
        <div id="tab-breakdown" class="tab-content-area">${breakdownHtml}</div>
        <div id="tab-ref" class="tab-content-area" style="display: none;">${refTableHtml}</div>
    `;

    renderMasterModal('eqSellBreakdown', fullHtml);
    setTimeout(updateSellRefTable, 50);
}

function openEqAvgBreakdownModal(hpB, hpM, hpA, dmgB, dmgM, dmgA) {
    const hpFromLevel = hpM - hpB; const hpFromBonus = hpA - hpM;
    const dmgFromLevel = dmgM - dmgB; const dmgFromBonus = dmgA - dmgM;
    const fmt = (val) => typeof formatCombatStat === 'function' ? formatCombatStat(val) : val.toLocaleString();
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";

    // READ FROM GLOBAL STATE
    const savedTier = (window.refTablePrefs && window.refTablePrefs.statsTier) ? window.refTablePrefs.statsTier : 'Quantum';
    const savedMastery = (window.refTablePrefs && window.refTablePrefs.statsMastery) ? window.refTablePrefs.statsMastery : 0;
    const savedAscension = (window.refTablePrefs && window.refTablePrefs.statsAscension) !== undefined ? window.refTablePrefs.statsAscension : 0;
    
    // Helper to select the correct option
    const isSel = (val) => val === savedTier ? 'selected' : '';
    const isAscSel = (val) => val == savedAscension ? 'selected' : '';

    // TAB 1: BREAKDOWN
    const createRow = (label, val, icon, isGain, isTotal) => {
        const colorClass = (isGain && val > 0) || isTotal ? 'color: #198754;' : 'color: #000;';
        const bgClass = isTotal ? 'background-color: #d1f2eb; border: 2px solid #198754; margin-top: 6px;' : 'background-color: #ecf0f1; margin-bottom: 6px;';
        return `
        <div style="${bgClass} border-radius: 8px; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStyle} font-weight: 600; color: #000; font-size: 0.9rem;">${label}</span>
            <span style="${fontStyle} font-weight: 600; ${colorClass} font-size: 0.9rem; display: flex; align-items: center; gap: 5px;"><img src="icons/${icon}" style="width:16px; height:16px; object-fit:contain;"> ${fmt(val)}</span>
        </div>`;
    };

    let breakdownHtml = `<div style="padding-top: 5px; display: flex; flex-direction: column;">`;
    breakdownHtml += createRow("Current Average", hpB, "icon_hp.png", false, false);
    breakdownHtml += createRow("From Item Lv", hpFromLevel, "icon_hp.png", true, false);
    breakdownHtml += createRow("From Mastery", hpFromBonus, "icon_hp.png", true, false);
    breakdownHtml += createRow("New Average", hpA, "icon_hp.png", false, true);
    breakdownHtml += `<hr style="border: 0; height: 1px; background: #bdc3c7; margin: 20px 0;">`;
    breakdownHtml += createRow("Current Average", dmgB, "icon_dmg.png", false, false);
    breakdownHtml += createRow("From Item Lv", dmgFromLevel, "icon_dmg.png", true, false);
    breakdownHtml += createRow("From Mastery", dmgFromBonus, "icon_dmg.png", true, false);
    breakdownHtml += createRow("New Average", dmgA, "icon_dmg.png", false, true);
    breakdownHtml += `</div>`;

    // TAB 2: REF TABLE
    let refTableHtml = `
    <div style="display: flex; flex-direction: column; gap: 10px; padding-top: 5px;">
        <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="${fontStyle} font-weight: 600; color: #000; font-size: 0.95rem;">Ascension:</span>
                <select id="ref-stats-ascension" onchange="updateStatsRefTable()" style="width: 70px; height: 32px; border: 2px solid #000000; border-radius: 6px; font-family: 'Fredoka', sans-serif; font-weight: 600; outline: none; text-align: center; text-align-last: center; -webkit-text-stroke: 0px transparent !important; background-color: #ffffff;">
                    <option value="0" ${isAscSel(0)}>0</option>
                    <option value="1" ${isAscSel(1)}>1</option>
                    <option value="2" ${isAscSel(2)}>2</option>
                    <option value="3" ${isAscSel(3)}>3</option>
                </select>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="${fontStyle} font-weight: 600; color: #000; font-size: 0.95rem;">Item Tier:</span>
                <select id="ref-stats-tier" onchange="updateStatsRefTable()" style="width: 130px; height: 32px; border: 2px solid #000000; border-radius: 6px; font-family: 'Fredoka', sans-serif; font-weight: 600; outline: none; text-align: center; text-align-last: center; -webkit-text-stroke: 0px transparent !important; background-color: #ffffff;">
                    <option value="Primitive" ${isSel('Primitive')}>Primitive</option>
                    <option value="Medieval" ${isSel('Medieval')}>Medieval</option>
                    <option value="Early-Modern" ${isSel('Early-Modern')}>Early-Modern</option>
                    <option value="Modern" ${isSel('Modern')}>Modern</option>
                    <option value="Space" ${isSel('Space')}>Space</option>
                    <option value="Interstellar" ${isSel('Interstellar')}>Interstellar</option>
                    <option value="Multiverse" ${isSel('Multiverse')}>Multiverse</option>
                    <option value="Quantum" ${isSel('Quantum')}>Quantum</option>
                    <option value="Underworld" ${isSel('Underworld')}>Underworld</option>
                    <option value="Divine" ${isSel('Divine')}>Divine</option>
                </select>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="${fontStyle} font-weight: 600; color: #000; font-size: 0.95rem;">Mastery %:</span>
                <input type="number" id="ref-stats-mastery" value="${savedMastery}" oninput="updateStatsRefTable()" style="width: 70px; height: 32px; border: 2px solid #000000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important; background-color: #ffffff;">
            </div>
        </div>
        <table class="clean-table" style="width: 100%;">
            <thead><tr>
                <th style="text-align: left; padding-left: 10px;">Lv. Bracket</th>
                <th style="text-align: right; width: 35%;">Avg <img src="icons/icon_hp.png" style="width: 14px; height: 14px; object-fit: contain; vertical-align: -2px;"></th>
                <th style="text-align: right; padding-right: 10px; width: 35%;">Avg <img src="icons/icon_dmg.png" style="width: 14px; height: 14px; object-fit: contain; vertical-align: -2px;"></th>
            </tr></thead>
            <tbody id="stats-ref-body"></tbody>
        </table>
    </div>`;

    const fullHtml = `
        <div id="modal-tabs-container" style="margin-bottom: 12px;">
            <button class="seg-btn active" onclick="switchContentTab('tab-breakdown', this)">Breakdown</button>
            <button class="seg-btn" onclick="switchContentTab('tab-ref', this)">Ref. Table</button>
        </div>
        <div id="tab-breakdown" class="tab-content-area">${breakdownHtml}</div>
        <div id="tab-ref" class="tab-content-area" style="display: none;">${refTableHtml}</div>
    `;

    renderMasterModal('eqAvgBreakdown', fullHtml);
    setTimeout(updateStatsRefTable, 50);
}

function openEqRangeModal() {
    if (typeof MODAL_SETTINGS !== 'undefined' && !MODAL_SETTINGS.eqRange) {
        MODAL_SETTINGS.eqRange = { title: "LEVEL RANGE PROGRESSION", headerColor: "#ebf8fa", titleColor: "#ffffff", disclaimer: "Repeatedly forging an item slot increases your level bracket for that specific tier." };
    }

    const bracketFloors =[1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141];
    let rowsHtml = '';
    bracketFloors.forEach((floor, index) => {
        let max = floor + 9; if (max > 149) max = 149; 
        rowsHtml += `<tr>
            <td><div style="display: flex; justify-content: center; align-items: center; width: 100%; color: #000000; font-family: 'Fredoka', sans-serif;">${index + 1}</div></td>
            <td><div style="display: flex; justify-content: center; align-items: center; width: 100%; color: #000000; font-family: 'Fredoka', sans-serif;">Lv ${floor} - ${max}</div></td>
        </tr>`;
    });

    const html = `
        <table class="clean-table" style="margin-top: 0px; width: 100%;">
            <thead><tr><th style="text-align: center; width: 40%;">Item #</th><th style="text-align: center; width: 60%;">Level Range</th></tr></thead>
            <tbody>${rowsHtml}</tbody>
        </table>`;

    if (typeof renderMasterModal === 'function') renderMasterModal('eqRange', html);
}

// --- MOUNT MODALS ---
function openMountMilestoneModal() {
    if (!window.currentMountData || !window.currentMountData.milestones) return;
    
    let rowsHtml = '';
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    
    window.currentMountData.milestones.forEach(m => {
        const buildStatusBefore = (isUnlocked, mounts, keys) => {
            if (isUnlocked) return `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
            return `<span style="${fontStyle} font-weight: 600; color: #000;">${mounts.toLocaleString()} <span style="font-weight:500; font-size:0.9rem; color:#000;">(<img src="icons/mount_key.png" style="width: 14px; height: 14px; object-fit: contain; vertical-align: -2px;"> ${keys})</span></span>`;
        };

        const buildStatusAfter = (isUnlocked, mounts, keys) => {
            if (isUnlocked) return `<span style="${fontStyle} font-weight: 700; color: #000;">✔ Unlocked</span>`;
            return `<span style="${fontStyle} font-weight: 600; color: #000;">${mounts.toLocaleString()} <span style="font-weight:500; font-size:0.9rem; color:#000;">(<img src="icons/mount_key.png" style="width: 14px; height: 14px; object-fit: contain; vertical-align: -2px;"> ${keys})</span></span>`;
        };

        let statusHtml = '';
        if (m.mountsBefore === m.mountsAfter && m.unlockedBefore === m.unlockedAfter) {
            statusHtml = buildStatusBefore(m.unlockedBefore, m.mountsBefore, m.keysBefore);
        } else {
            let statusBefore = buildStatusBefore(m.unlockedBefore, m.mountsBefore, m.keysBefore);
            let statusAfter = buildStatusAfter(m.unlockedAfter, m.mountsAfter, m.keysAfter);
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                statusHtml = `<div style="display: flex; flex-direction: column; align-items: flex-end;">${statusBefore}<div style="display:flex; align-items:center;"><span style="margin-right: 4px; font-size: 0.9em; color: #198754; font-weight: 800; -webkit-text-stroke: 0px !important;">➜</span>${statusAfter}</div></div>`;
            } else {
                statusHtml = `<div style="display:flex; align-items:center;">${statusBefore} <span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; margin: 0 6px; -webkit-text-stroke: 0px !important;">➜</span> ${statusAfter}</div>`;
            }
        }

        rowsHtml += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStyle} font-weight: 600; color: #000;">${m.name} <span style="font-size:0.8rem; font-weight:500;">(Lv ${m.targetLv})</span></span>
            <div style="text-align: right;">${statusHtml}</div>
        </div>`;
    });

    const expBefore = window.currentMountData.expBefore || 0;
    const expAfter = window.currentMountData.expAfter || 0;
    const maxExp = window.currentMountData.maxExp || 7842;
    
    let pctBefore = (expBefore / maxExp) * 100; if (pctBefore > 100) pctBefore = 100;
    let pctAfter = (expAfter / maxExp) * 100; if (pctAfter > 100) pctAfter = 100;
    
    let progressHtml = `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.8rem; color: #000; -webkit-text-stroke: 0px;">Summon Exp to Max Level</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${pctBefore}%;"></div>
                <div class="pet-progress-text">${Math.round(expBefore).toLocaleString()} / ${maxExp.toLocaleString()} xp (${pctBefore.toFixed(1)}%)</div>
            </div>`;
    
    if (expBefore !== expAfter) {
        progressHtml += `
            <div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${pctAfter}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${Math.round(expAfter).toLocaleString()} / ${maxExp.toLocaleString()} xp (${pctAfter.toFixed(1)}%)</div>
            </div>`;
    }
    progressHtml += `</div>`;

    renderMasterModal('mountMilestones', `<div style="padding-top: 5px; display: flex; flex-direction: column;">${rowsHtml}${progressHtml}</div>`);
}

function openMountExpModal() {
    renderMasterModal('mountExpBreakdown', window.mountYieldTableHtml);
}

// --- SYSTEM MODALS (CONFIRM/PROMPT) ---
function openConfirmModal(message, onConfirmCallback) {
    window.currentConfirmCallback = onConfirmCallback;
    const modal = document.getElementById('tableModal');
    const content = modal.querySelector('.modal-content');
    
    content.className = 'modal-content confirm-mode'; 
    content.style.cssText = ''; 
    
    content.innerHTML = `
        <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; text-align: center; color: #ffffff; margin-bottom: 20px; line-height: 1.3;">
            ${message}
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
            <button class="btn-confirm-cancel" onclick="document.getElementById('tableModal').style.display='none'" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #ff4757; box-shadow: inset 0 -4px 0 0 #c0392b; transition: transform 0.1s;">
            <img src="icons/icon_cancel.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
        </button>
        <button class="btn-confirm-ok" onclick="document.getElementById('tableModal').style.display='none'; if(window.currentConfirmCallback) window.currentConfirmCallback();" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #00b0ff; box-shadow: inset 0 -4px 0 0 #005680; transition: transform 0.1s;">
            <img src="icons/button_ok.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
        </button>
    </div>
    <style>
        .btn-confirm-ok:active { transform: translateY(3px); box-shadow: inset 0 -1px 0 0 #005680 !important; }
        .btn-confirm-cancel:active { transform: translateY(3px); box-shadow: inset 0 -1px 0 0 #c0392b !important; }
    </style>`;
    modal.style.display = 'block';
}

function openPromptModal(message, onConfirmCallback) {
    window.currentPromptCallback = onConfirmCallback;
    const modal = document.getElementById('tableModal');
    const content = modal.querySelector('.modal-content');
    
    content.className = 'modal-content confirm-mode'; 
    content.style.cssText = ''; 
    
    content.innerHTML = `
        <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; text-align: center; color: #ffffff; margin-bottom: 15px; line-height: 1.3;">
            ${message}
        </div>
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <input type="number" id="custom-prompt-input" style="width: 100px; height: 40px; background: #ffffff; border: 2px solid #000000; border-radius: 8px; font-family: 'Fredoka', sans-serif; font-size: 1rem; -webkit-text-stroke: 0px transparent !important;font-weight: 600; text-align: center; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);" placeholder="0" min="1">
        </div>
        <div style="display: flex; justify-content: center; gap: 12px;">
            <button class="btn-confirm-cancel" onclick="document.getElementById('tableModal').style.display='none'" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #ff4757; box-shadow: inset 0 -4px 0 0 #c0392b; transition: transform 0.1s;">
                <img src="icons/icon_cancel.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>
            <button class="btn-confirm-ok" onclick="document.getElementById('tableModal').style.display='none'; if(window.currentPromptCallback) window.currentPromptCallback(document.getElementById('custom-prompt-input').value);" style="flex: 1; max-width: 100px; height: 42px; border: 2px solid #000000; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; background-color: #00b0ff; box-shadow: inset 0 -4px 0 0 #005680; transition: transform 0.1s;">
                <img src="icons/button_ok.png" style="width: 22px; height: 22px; filter: drop-shadow(0 2px 0 rgba(0,0,0,0.2)); transform: translateY(-2px);">
            </button>
        </div>`;
    modal.style.display = 'block';

    setTimeout(() => { const input = document.getElementById('custom-prompt-input'); if (input) input.focus(); }, 50);
}

// --- SKILL LEVEL ESTIMATOR MODAL ---

function getHistoricalSkillCount(level, exp) {
    let total = 0;
    for (let i = 1; i < level; i++) {
        if (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[i] && SKILL_LEVEL_DATA[i][0] !== "MAX") {
            total += SKILL_LEVEL_DATA[i][0];
        }
    }
    return total + exp;
}

function formatSkillAmount(amt) {
    if (amt === 0) return "0";
    if (amt > 0 && amt < 0.01) return "< 0.01";
    if (amt >= 0.01 && amt < 10) return amt.toFixed(2);
    return amt.toFixed(1);
}

function formatSkillLevel(eachAmt) {
    if (eachAmt === 0) return "0";
    
    let currentLevel = 1;
    let remainingPulls = eachAmt;
    
    // Cap at level 100
    while (currentLevel < 100) {
        // Fetch cost safely with fallbacks
        let cost = 8;
        if (typeof getSkillUpgradeCost === 'function') {
            cost = getSkillUpgradeCost(currentLevel);
        } else if (typeof SKILL_UPGRADE_COSTS !== 'undefined' && SKILL_UPGRADE_COSTS[currentLevel]) {
            cost = SKILL_UPGRADE_COSTS[currentLevel];
        } else {
            if (currentLevel >= 1 && currentLevel <= 5) cost = 2;
            else if (currentLevel >= 6 && currentLevel <= 10) cost = 3;
            else if (currentLevel >= 11 && currentLevel <= 14) cost = 4;
            else if (currentLevel >= 15 && currentLevel <= 21) cost = 5;
            else if (currentLevel >= 22 && currentLevel <= 25) cost = 6;
            else if (currentLevel >= 26 && currentLevel <= 29) cost = 7;
        }

        if (remainingPulls >= cost) {
            remainingPulls -= cost;
            currentLevel++;
        } else {
            if (currentLevel === 1) {
                return `Lv 1 (${remainingPulls.toFixed(2)}/${cost})`;
            } else {
                return `Lv ${currentLevel} (${remainingPulls.toFixed(1)}/${cost})`;
            }
        }
    }
    
    // If it breaks out of the loop, it hit the max level
    return "Lv 100 (MAX)";
}

function getFractionalSkillLevel(eachAmt) {
    let currentLevel = 1;
    let remaining = eachAmt;
    
    // Cap at level 100
    while (currentLevel < 100) {
        // Fetch cost safely with fallbacks
        let cost = 8;
        if (typeof getSkillUpgradeCost === 'function') {
            cost = getSkillUpgradeCost(currentLevel);
        } else if (typeof SKILL_UPGRADE_COSTS !== 'undefined' && SKILL_UPGRADE_COSTS[currentLevel]) {
            cost = SKILL_UPGRADE_COSTS[currentLevel];
        } else {
            if (currentLevel >= 1 && currentLevel <= 5) cost = 2;
            else if (currentLevel >= 6 && currentLevel <= 10) cost = 3;
            else if (currentLevel >= 11 && currentLevel <= 14) cost = 4;
            else if (currentLevel >= 15 && currentLevel <= 21) cost = 5;
            else if (currentLevel >= 22 && currentLevel <= 25) cost = 6;
            else if (currentLevel >= 26 && currentLevel <= 29) cost = 7;
        }

        if (remaining >= cost) {
            remaining -= cost;
            currentLevel++;
        } else {
            return currentLevel + (remaining / cost);
        }
    }
    
    // Max level reached, no more fractional points given
    return 100;
}

function getLevelFromTotalPulls(totalSkills) {
    let lvl = 1;
    let exp = totalSkills;
    
    while (typeof SKILL_LEVEL_DATA !== 'undefined' && SKILL_LEVEL_DATA[lvl] && SKILL_LEVEL_DATA[lvl][0] !== "MAX") {
        let maxExp = SKILL_LEVEL_DATA[lvl][0];
        if (exp >= maxExp) {
            exp -= maxExp;
            lvl++;
        } else {
            return { level: lvl, exp: exp, maxExp: maxExp };
        }
    }
    return { level: lvl, exp: exp, maxExp: "MAX" };
}

function openSkillLevelsModal() {
    // 1. Grab current base values
    const lvEl = document.getElementById('wc-skill-lv');
    const expEl = document.getElementById('wc-skill-exp');
    
    const currentLv = parseInt(lvEl ? lvEl.value : 1) || 1;
    const currentExp = parseFloat(expEl ? expEl.value.replace(/,/g, '') : 0) || 0;

    // 2. Calculate BASE Historical Skills
    const historicalSkills = getHistoricalSkillCount(currentLv, currentExp);
    const yields = typeof calcWarSkillPulls === 'function' ? calcWarSkillPulls(1, 0, historicalSkills) : [0,0,0,0,0,0];
    
    const ROW_COLORS = ['#f1f1f1', '#5dd9ff', '#5dfe8a', '#fdff5e', '#ff5d5e', '#d55cff'];
    const fontStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 600; -webkit-text-stroke: 0px #000000 !important; font-size: 0.9rem;";
    
    let rowsHtml = '';

    for (let i = 0; i < 6; i++) {
        const totalAmt = yields[i];
        const eachAmt = totalAmt / 3; 
        
        const amtStr = formatSkillAmount(totalAmt);
        const lvlStr = formatSkillLevel(eachAmt);

        rowsHtml += `
            <div style="background-color: ${ROW_COLORS[i]}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div style="text-align: left;"><span style="${fontStyle} color: #000;">${amtStr}</span></div><div style="text-align: right;"><span style="${fontStyle} color: #000;">${lvlStr}</span></div>
            </div>`;
    }

    let summaryHtml = `
        <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
            <span style="${fontStyle} color: #000;">Total Skill Summoned</span>
            <div style="text-align: right;"><span style="${fontStyle} color: #000;">${Math.round(historicalSkills).toLocaleString('en-US')}</span></div>
        </div>`;

    const finalHtml = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
            ${summaryHtml}
            <div style="height: 10px;"></div> <div style="display: flex; justify-content: space-between; padding: 0 15px; margin-bottom: 5px;">
                <span style="${fontStyle} color: #000;">Amount</span><span style="${fontStyle} color: #000;">Skill Lv</span>
            </div>
            ${rowsHtml}
        </div>`;

    renderMasterModal('skillLevels', finalHtml);
}

function openSkillUpgradeModal() {
    if (!window.currentWarYields) return;

    // 1. Grab base info
    const baseLv = parseInt(document.getElementById('wc-skill-lv')?.value || 1);
    const baseExp = parseFloat(document.getElementById('wc-skill-exp')?.value.replace(/,/g, '') || 0);

    // 2. Base yields
    const historicalSkills = typeof getHistoricalSkillCount === 'function' ? getHistoricalSkillCount(baseLv, baseExp) : 0;
    const baseYields = typeof calcWarSkillPulls === 'function' ? calcWarSkillPulls(1, 0, historicalSkills) : [0,0,0,0,0,0];

    // 3. Ticket yields
    const ticketB = window.currentWarYields.skillB || [0,0,0,0,0,0];
    const ticketA = window.currentWarYields.skillA || [0,0,0,0,0,0];

    const UPGRADE_POINTS = [125, 150, 175, 200, 225, 250];
    const ROW_COLORS = ['#f1f1f1', '#5dd9ff', '#5dfe8a', '#fdff5e', '#ff5d5e', '#d55cff'];
    
    let rowsHtml = '';
    const fontStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 600; -webkit-text-stroke: 0px #000000 !important; font-size: 0.9rem;";
    const arrowStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 650; font-size: 1rem; color: #198754; -webkit-text-stroke: 0px #000000 !important; margin: 0 4px;";
    const afterStyle = "font-family: 'Fredoka' !important, sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000 !important; color: #000000;";

    for (let i = 0; i < 6; i++) {
        const totalTierBase = baseYields[i];
        const totalTierB = totalTierBase + ticketB[i];
        const totalTierA = totalTierBase + ticketA[i];

        const baseFraction = getFractionalSkillLevel(totalTierBase / 3);
        const fracB = getFractionalSkillLevel(totalTierB / 3);
        const fracA = getFractionalSkillLevel(totalTierA / 3);

        const ptsB = (fracB - baseFraction) * UPGRADE_POINTS[i] * 3;
        const ptsA = (fracA - baseFraction) * UPGRADE_POINTS[i] * 3;

        const lvlStrB = formatSkillLevel(totalTierB / 3);
        const lvlStrA = formatSkillLevel(totalTierA / 3);
        const fmtPtsB = Math.round(ptsB).toLocaleString('en-US');
        const fmtPtsA = Math.round(ptsA).toLocaleString('en-US');

        const isSingleLvl = (lvlStrB === lvlStrA);
        const isSinglePts = (fmtPtsB === fmtPtsA);

        let leftHtml = isSingleLvl ? `<span style="${fontStyle} color: #000;">${lvlStrB}</span>` : `
            <div class="war-val-group-left" style="display: flex; justify-content: flex-start; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span style="${fontStyle} color: #000;">${lvlStrB}</span>
                <div style="display: flex; align-items: center;"><span style="${arrowStyle}">➜</span><span style="${afterStyle}">${lvlStrA}</span></div>
            </div>`;

        let rightHtml = isSinglePts ? `<span style="${fontStyle} color: #000;">${fmtPtsB}</span>` : `
            <div class="war-val-group" style="display: flex; justify-content: flex-end; align-items: center; gap: 4px; flex-wrap: wrap;">
                <span style="${fontStyle} color: #000;">${fmtPtsB}</span>
                <div style="display: flex; align-items: center;"><span style="${arrowStyle}">➜</span><span style="${afterStyle}">${fmtPtsA}</span></div>
            </div>`;

        rowsHtml += `
            <div style="background-color: ${ROW_COLORS[i]}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                <div style="text-align: left; width: 65%;">${leftHtml}</div><div style="text-align: right; width: 35%;">${rightHtml}</div>
            </div>`;
    }

    const mobileStyle = `
    <style>
        @media (max-width: 768px) {
            .war-val-group { flex-direction: column; align-items: flex-end !important; gap: 0 !important; }
            .war-val-group-left { flex-direction: column; align-items: flex-start !important; gap: 0 !important; }
        }
    </style>`;

    const finalHtml = `
        ${mobileStyle}
        <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; padding: 0 15px; margin-bottom: 5px;">
                <span style="${fontStyle} color: #000;">Projected Skill Levels</span><span style="${fontStyle} color: #000;">War Points</span>
            </div>
            ${rowsHtml}
        </div>`;
    
    renderMasterModal('skillLevels', finalHtml);
}

// =========================================
// 6. HELP MODAL
// =========================================
function toggleHelp() { 
    const el = document.getElementById('helpModal'); 
    if(el) el.style.display = el.style.display === 'block' ? 'none' : 'block'; 
}

function switchHelpTab(tab) {
    // Reset all buttons and hide all content
    ['how', 'what', 'who'].forEach(t => {
        const btn = document.getElementById(`btn-help-${t}`);
        const content = document.getElementById(`help-content-${t}`);
        if(btn) btn.classList.remove('active');
        if(content) content.style.display = 'none';
    });
    
    // Activate the clicked one
    const targetBtn = document.getElementById(`btn-help-${tab}`);
    const targetContent = document.getElementById(`help-content-${tab}`);
    if(targetBtn) targetBtn.classList.add('active');
    if(targetContent) targetContent.style.display = 'block';
}

// =========================================
// 7. EVENT LISTENERS (Background Clicks)
// =========================================
window.addEventListener('click', function(event) {
    const helpModal = document.getElementById('helpModal');
    const tableModal = document.getElementById('tableModal');
    
    if (event.target === helpModal) {
        toggleHelp();
    }
    if (event.target === tableModal) {
        tableModal.style.display = 'none';
    }
});