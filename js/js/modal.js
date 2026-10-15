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
    summonProb: {
        title: "", 
        headerColor: "#ffffff", 
        titleColor: "#000000",
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
    },
    summonYield: { title: "ASCENSION YIELD BREAKDOWN", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "Yields and costs are split based on the different drop rates active during each specific ascension phase."     
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
    const container = btn.parentNode;
    Array.from(container.children).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const parent = container.parentNode;
    parent.querySelectorAll('.tab-content-area').forEach(div => div.style.display = 'none');

    const target = parent.querySelector(`#${tabId}`);
    if (target) target.style.display = 'block';
}

function updateSellRefTable() {
    const input = document.getElementById('ref-sell-bonus');
    const tbody = document.getElementById('sell-ref-body');
    if (!input || !tbody) return;

    let bonus = parseFloat(input.value) || 0;

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
    const isUpgrade = proj > cur; 
    const isT = type === 'timer'; 
    const title = isT ? "FORGE UPGRADE TIME" : "FORGE UPGRADE COST"; 
    const iconSrc = isT ? "icons/forge_timer.png" : "icons/forge_disc.png"; 
    const headers = ["Level", isT ? "Upgrade Duration" : "Upgrade Cost"]; 
    const rows = [];

    let totalValBefore = 0;
    let totalValAfter = 0;

    for (let i = 1; i <= 34; i++) {
        if (!forgeLevelData[i]) continue;
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

    showTable(title, iconSrc, isT ? { label: "Speed", before: `+${cur}%`, after: `+${proj}%` } : { label: "Discount", before: `-${cur}%`, after: `-${proj}%` }, headers, rows, 50);
}

// --- EQUIPMENT MODALS ---
function openEqSellBreakdownModal(currentAvg, fromLevel, fromBonus, finalAvg) {
    const fontStr = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const safeFormat = (val) => typeof formatEqValue === 'function' ? formatEqValue(val) : val.toLocaleString();

    const savedBonus = (window.refTablePrefs && window.refTablePrefs.sellBonus) ? window.refTablePrefs.sellBonus : 0;

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

    const savedTier = (window.refTablePrefs && window.refTablePrefs.statsTier) ? window.refTablePrefs.statsTier : 'Quantum';
    const savedMastery = (window.refTablePrefs && window.refTablePrefs.statsMastery) ? window.refTablePrefs.statsMastery : 0;
    const savedAscension = (window.refTablePrefs && window.refTablePrefs.statsAscension) !== undefined ? window.refTablePrefs.statsAscension : 0;
    
    const isSel = (val) => val === savedTier ? 'selected' : '';
    const isAscSel = (val) => val == savedAscension ? 'selected' : '';

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
function openMountExpModal() {
    renderMasterModal('mountExpBreakdown', window.mountYieldTableHtml);
}

// --- FORGE SCHEDULE MODAL (FORGE CALC)---
function openForgeScheduleModal() {
    if (!window.currentForgeSchedule || window.currentForgeSchedule.length === 0) return;

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

    const getGemCost = (mins) => {
        if (mins <= 0) return 0;
        return Math.max(1, Math.round(mins / 7.24643));
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
            const maxAllowed = getGemCost(step.durationMs / 60000);
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
                const maxAllowed = getGemCost(step.durationMs / 60000);
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
        
        const maxAllowed = getGemCost(step.durationMs / 60000);
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
                    const maxAllowed = getGemCost(step.durationMs / 60000);
                    step.gems = Math.min(step.gems, maxAllowed); // Fallback safeguard
                    
                    if (step.gems >= maxAllowed) {

                        savedMs = step.durationMs; 
                    } else {

                        let maxTimeSavedMins = (step.gems + 0.5) * 7.24643;
                        savedMs = maxTimeSavedMins * 60000;
                        savedMs = Math.min(savedMs, step.durationMs); // Hard cap just in case
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
            const tabLabel = asc === 0 ? 'No Asc' : `<img src="icons/asc${asc}.png" style="height: 1.1em; vertical-align: -2px;" onerror="this.style.display='none'; this.nextSibling.textContent='Asc ${asc}';"><span style="display:none;"></span>`;
            const switchJs = `document.querySelectorAll('.${contentClass}').forEach(el => el.style.display='none'); document.getElementById('${tabId}').style.display='block'; document.querySelectorAll('.${btnClass}').forEach(el => el.classList.remove('active')); this.classList.add('active');`;

            tabsHtml += `<button class="${btnClass} seg-btn ${isActive}" onclick="${switchJs}" style="flex: 1 1 0 !important; min-width: 0 !important; padding: 0 2px !important; display: flex !important; justify-content: center !important; align-items: center !important;">${tabLabel}</button>`;
        }

        let rowsHtml = '';
        groupedSchedule[asc].forEach(step => {
            if (step.isAscension) return; 

            let displayLabel = "";
            let lvMatch = step.label.match(/Lv (\d+ ➜ \d+)/);
            if (lvMatch) {
                displayLabel = lvMatch[1];
            } else {
                displayLabel = step.label; 
            }

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

// --- FORGE COST BREAKDOWN MODAL (FORGE CALC)---
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

    // Common styles
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; -webkit-text-stroke: 0px;";
    const arrowStyle = "font-family: 'Fredoka', sans-serif; font-weight: 800; font-size: 1.1rem; color: #198754; margin: 0 4px;";
    const afterColor = "color: #198754;";

    ascKeys.forEach((asc, index) => {
        const isActive = (index === 0) ? 'active' : '';
        const tabId = `forge-cost-tab-${asc}`;
        
        if (showTabs) {
            const tabLabel = asc === 0 ? 'No Asc' : `<img src="icons/asc${asc}.png" style="height: 1.1em; vertical-align: -2px;" onerror="this.style.display='none'; this.nextSibling.textContent='Asc ${asc}';"><span style="display:none;"></span>`;
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

        // Summary Total Box (Now centered and split 40/60 to perfectly match the rows below)
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

// --- FORGE PROBABILITY MODAL (FORGE CALC)---
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
    if (currentForgeProbModalLevel > 35) currentForgeProbModalLevel = 35;

    let listHtml = '';
    const rates = typeof CALC_FORGE_RATES !== 'undefined' ? CALC_FORGE_RATES[currentForgeProbModalLevel] : null;

    if (!rates) {
        listHtml = `<div style="text-align:center; padding: 20px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000;">Data not available for Level ${currentForgeProbModalLevel}</div>`;
    } else {
        const TIER_NAMES = ["Primitive", "Medieval", "Early-Modern", "Modern", "Space", "Interstellar", "Multiverse", "Quantum", "Underworld", "Divine"];
        const TIER_COLORS = ['#f1f2f6', '#5cd8fe', '#5dfe8a', '#fcfe5d', '#ff5c5d', '#d55cff', '#74feee', '#7d5eff', '#b07879', '#fe9e0c'];
        
        const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000; -webkit-text-stroke: 0px;";

        for (let i = 0; i < 10; i++) {
            if (rates[i] > 0) { 
                const formattedRate = rates[i] < 1 ? rates[i].toFixed(2) : rates[i].toFixed(1);

                listHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; margin-bottom: 6px; background-color: ${TIER_COLORS[i]}; border-radius: 8px;">
                    <span style="${fontStyle}">${TIER_NAMES[i]}</span>
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
        
        <button onclick="openForgeProbModal(${currentForgeProbModalLevel - 1})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center;">
            ${leftArrowSvg}
        </button>
        
        <div style="text-align: center;">
            <div style="${levelTextStyle}">Level ${currentForgeProbModalLevel}</div>
            <div style="${subTextStyle}">Forge probabilities</div>
        </div>
        
        <button onclick="openForgeProbModal(${currentForgeProbModalLevel + 1})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center;">
            ${rightArrowSvg}
        </button>
        
    </div>
    `;

    renderMasterModal('summonProb', navHtml + listHtml); 
}

// --- SUMMON PROBABILITY MODAL ---
let currentProbModalType = 'skill';
let currentProbModalLevel = 1;

function openSummonProbModal(type, levelOverride = null) {
    currentProbModalType = type;
    
    if (levelOverride !== null) {
        currentProbModalLevel = parseInt(levelOverride);
    } else {
        const targetInput = document.getElementById(`sum-${type}-target-lv`)?.value;
        const currentInput = document.getElementById(`sum-${type}-lvl`)?.value;
        currentProbModalLevel = parseInt(targetInput) || parseInt(currentInput) || 1;
    }

    if (currentProbModalLevel < 1) currentProbModalLevel = 1;
    if (currentProbModalLevel > 100) currentProbModalLevel = 100;

    const config = typeof SUMMON_CONFIG !== 'undefined' ? SUMMON_CONFIG[type] : null;
    let listHtml = '';

    if (!config || !config.db || !config.db[currentProbModalLevel]) {
        listHtml = `<div style="text-align:center; padding: 20px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000;">Data not available for Level ${currentProbModalLevel}</div>`;
    } else {
        const rates = config.db[currentProbModalLevel];
        const tiers = [
            { name: 'Common', rate: rates[1] || 0, color: '#f1f2f6' },
            { name: 'Rare', rate: rates[2] || 0, color: '#5cd8fe' },
            { name: 'Epic', rate: rates[3] || 0, color: '#5dfe8a' },
            { name: 'Legendary', rate: rates[4] || 0, color: '#fcfe5d' },
            { name: 'Ultimate', rate: rates[5] || 0, color: '#ff5c5d' },
            { name: 'Mythic', rate: rates[6] || 0, color: '#d55cff' }
        ];

        const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000; -webkit-text-stroke: 0px;";

        tiers.forEach(t => {
            if (t.rate > 0 || t.name === 'Common') { 
                listHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; margin-bottom: 6px; background-color: ${t.color}; border-radius: 8px;">
                    <span style="${fontStyle}">${t.name}</span>
                    <span style="${fontStyle}">${(t.rate).toFixed(2)}%</span>
                </div>`;
            }
        });
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

    const displayType = type.charAt(0).toUpperCase() + type.slice(1);

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
        
        <button onclick="openSummonProbModal('${type}', ${currentProbModalLevel - 1})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center;">
            ${leftArrowSvg}
        </button>
        
        <div style="text-align: center;">
            <div style="${levelTextStyle}">Level ${currentProbModalLevel}</div>
            <div style="${subTextStyle}">${displayType} probabilities</div>
        </div>
        
        <button onclick="openSummonProbModal('${type}', ${currentProbModalLevel + 1})" style="background: transparent; border: none; padding: 0; cursor: pointer; outline: none; display: flex; align-items: center;">
            ${rightArrowSvg}
        </button>
        
    </div>
    `;

    renderMasterModal('summonProb', navHtml + listHtml);
}

function openSummonYieldModal(type) {
    if (!window.currentSummonYields || !window.currentSummonYields[type]) return;
    
    const data = window.currentSummonYields[type];
    
    const phasesB = (data.phasesB || []).filter(p => p.pullsUsed > 0.1);
    const phasesA = (data.phasesA || []).filter(p => p.pullsUsed > 0.1);
    
    const targetProb = data.targetProb || 90;
    const config = data.config;
    const keyIcon = `<img src="icons/${config.icon}" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    let maxAsc = 0, minAsc = 3;
    phasesB.forEach(p => { if (p.asc > maxAsc) maxAsc = p.asc; if (p.asc < minAsc) minAsc = p.asc; });
    phasesA.forEach(p => { if (p.asc > maxAsc) maxAsc = p.asc; if (p.asc < minAsc) minAsc = p.asc; });

    if (phasesB.length === 0 && phasesA.length === 0) return;

    if (minAsc > maxAsc) { minAsc = 0; maxAsc = 0; }
    
    let tabsHtml = `<div style="display: flex; justify-content: center; width: 100%;">
    <div id="modal-tabs-container" style="display: flex; flex-wrap: nowrap; margin: 12px 0 15px 0 !important; width: 100% !important; max-width: 100% !important; box-sizing: border-box;">`;
    let contentHtml = ``;

    const colors = ['#f1f2f6', '#5cd8fe', '#5dfe8a', '#fcfe5d', '#ff5c5d', '#d55cff'];
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

    const formatYieldRow = (val) => {
        if (!val || val < 0.01) return "0";
        if (val < 10) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    };

    const isMobile = window.innerWidth <= 768;
    const itemNamePlural = config.itemName;

    const btnClass = `seg-btn-yield-${type}`;
    const contentClass = `tab-content-yield-${type}`;

    for (let asc = minAsc; asc <= maxAsc; asc++) {
        const fallbackB = { yields:[0,0,0,0,0,0], pityCost:[0,0,0,0,0,0], pityItems:[0,0,0,0,0,0], pullsUsed: 0, cost: phasesB[0]?.cost || 0, extra: phasesB[0]?.extra || 0 };
        const fallbackA = { yields:[0,0,0,0,0,0], pityCost:[0,0,0,0,0,0], pityItems:[0,0,0,0,0,0], pullsUsed: 0, cost: phasesA[0]?.cost || 0, extra: phasesA[0]?.extra || 0 };

        const phaseB = phasesB.find(p => p.asc === asc) || fallbackB;
        const phaseA = phasesA.find(p => p.asc === asc) || fallbackA;

        const tabId = `sum-yield-tab-${type}-${asc}`;
        const isActive = (asc === minAsc) ? 'active' : '';
        const tabLabel = asc === 0 ? 'No Asc' : `<img src="icons/asc${asc}.png" style="height: 1.1em; vertical-align: -2px;">`;

        const switchJs = `document.querySelectorAll('.${contentClass}').forEach(el => el.style.display='none'); document.getElementById('${tabId}').style.display='block'; document.querySelectorAll('.${btnClass}').forEach(el => el.classList.remove('active')); this.classList.add('active');`;

        tabsHtml += `<button class="${btnClass} seg-btn ${isActive}" onclick="${switchJs}" style="flex: 1 1 0 !important; min-width: 0 !important; padding: 0 2px !important; display: flex !important; justify-content: center !important; align-items: center !important;">${tabLabel}</button>`;

        let totalYieldB = phaseB.yields.reduce((sum, val) => sum + val, 0);
        let totalYieldA = phaseA.yields.reduce((sum, val) => sum + val, 0);
        
        let resB = Math.ceil((type === 'skill' ? phaseB.pullsUsed / 5 : phaseB.pullsUsed) / (1 + phaseB.extra)) * phaseB.cost;
        let resA = Math.ceil((type === 'skill' ? phaseA.pullsUsed / 5 : phaseA.pullsUsed) / (1 + phaseA.extra)) * phaseA.cost;

        const formatTotal = (val) => type === 'skill' ? Math.round(val).toLocaleString('en-US') : val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
        const formatRes = (val) => typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(val) : val.toLocaleString('en-US');
        
        let summaryB = `<div style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;"><span style="${fontStyle}">${formatTotal(totalYieldB)}</span> <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${formatRes(resB)})</span></div>`;
        let summaryA = `<div style="display: inline-flex; align-items: center; gap: 4px; white-space: nowrap;"><span style="${fontStyle} color:#000;">${formatTotal(totalYieldA)}</span> <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${formatRes(resA)})</span></div>`;
        
        let summaryHtml = `<div style="text-align: right;">${summaryB}</div>`;
        if (formatTotal(totalYieldB) !== formatTotal(totalYieldA) || resB !== resA) {
            summaryHtml = isMobile 
                ? `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div>${summaryB}</div><div style="display: flex; align-items: center;">${arrowHtml}${summaryA}</div></div>`
                : `<div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; white-space: nowrap;">${summaryB} ${arrowHtml} ${summaryA}</div>`;
        }

        let rowsHtml = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px 15px; background: #e6e9ed; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
                <div style="flex: 0 0 45%; max-width: 45%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px; text-align: left; line-height: 1.2;">${itemNamePlural} Summoned</div>
                <div style="flex: 1 1 auto; max-width: 55%; display: flex; justify-content: flex-end;">${summaryHtml}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 4px; align-items: center;">
                <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: left; -webkit-text-stroke: 0px; line-height: 1.3;">Yield</div>
                <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: right; -webkit-text-stroke: 0px; line-height: 1.3;">How Many More ${itemNamePlural} to Reach Target %</div>
            </div>
        `;

        for (let i = 0; i < 6; i++) {
            let yB = formatYieldRow(phaseB.yields[i]);
            let yA = formatYieldRow(phaseA.yields[i]);
            
            let yHtml = yB === yA 
                ? `<span style="${fontStyle}">${yB}</span>` 
                : (isMobile 
                    ? `<div style="display:flex; flex-direction:column; align-items:flex-start; gap:2px;"><span style="${fontStyle}">${yB}</span><div style="display:flex; align-items:center; white-space:nowrap;">${arrowHtml} <span style="${fontStyle} color:#000;">${yA}</span></div></div>`
                    : `<div style="display:flex; align-items:center; white-space:nowrap;"><span style="${fontStyle}">${yB}</span>${arrowHtml}<span style="${fontStyle} color:#000;">${yA}</span></div>`);

            const renderPity = (items, res) => {
                if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
                return `<div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                            <span style="${fontStyle} color: #000;">${items.toLocaleString()}</span>
                            <span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${formatRes(res)})</span>
                        </div>`;
            }

            let pB = renderPity(phaseB.pityItems[i], phaseB.pityCost[i]);
            let pA = renderPity(phaseA.pityItems[i], phaseA.pityCost[i]);
            
            let pHtml = (phaseB.pityCost[i] === phaseA.pityCost[i] && phaseB.pityItems[i] === phaseA.pityItems[i]) 
                ? pB 
                : (isMobile 
                    ? `<div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;"><span>${pB}</span><div style="display:flex; align-items:center; white-space:nowrap;">${arrowHtml} ${pA}</div></div>`
                    : `<div style="display:flex; align-items:center; justify-content:flex-end; white-space:nowrap;">${pB}${arrowHtml}${pA}</div>`);

            rowsHtml += `
            <div style="background-color: ${colors[i]}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
                <div style="flex: 0 0 30%; max-width: 35%; text-align: left; display: flex; justify-content: flex-start;">${yHtml}</div>
                <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pHtml}</div>
            </div>`;
        }
        
        contentHtml += `<div id="${tabId}" class="tab-content-area ${contentClass}" style="display: ${asc === minAsc ? 'block' : 'none'};">${rowsHtml}</div>`;
    }
    
    tabsHtml += `</div></div>`; 
    
    renderMasterModal('summonYield', tabsHtml + contentHtml);
}

// =========================================
// 6. HELP MODAL
// =========================================
function toggleHelp() { 
    const el = document.getElementById('helpModal'); 
    if(el) el.style.display = el.style.display === 'block' ? 'none' : 'block'; 
}

function switchHelpTab(tab) {
    ['how', 'what', 'who'].forEach(t => {
        const btn = document.getElementById(`btn-help-${t}`);
        const content = document.getElementById(`help-content-${t}`);
        if(btn) btn.classList.remove('active');
        if(content) content.style.display = 'none';
    });
    
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