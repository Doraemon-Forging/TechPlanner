/**
 * MODAL.JS
 * Master Engine for all custom popup modals & shared cross-tab modals.
 */

// =========================================
// 1. MODAL SETTINGS (Shared & Generic Table Configs)
// =========================================
const MODAL_SETTINGS = {
    dailyGold: {
        title: "TOTAL DAILY GOLD VALUE",
        headerColor: "#ebf8fa",
        titleColor: "#ffffff",
        disclaimer: ""
    },
    warYield: {
        title: "EXPECTED YIELD",
        headerColor: "#ebf8fa",
        titleColor: "#ffffff",
        disclaimer: ""
    },
    skillLevels: {
        title: "ESTIMATED SKILL LEVELS",
        headerColor: "#ebf8fa",
        titleColor: "#ffffff",
        disclaimer: "Calculations assume an equal drop rate among the 3 skills within each tier"
    },
    mountMilestones: {
        title: "TIER UNLOCK REQUIREMENTS",
        headerColor: "#ebf8fa",
        titleColor: "#ffffff",
        disclaimer: "Total <b><i>mount pulls</b></i> and mount keys needed to have a chance of summoning higher tier mounts for the first time."
    },
    combinedClanTech: {
        title: "CLAN TECH SETTINGS",
        headerColor: "#ebf8fa",
        titleColor: "#000000",
        disclaimer: ""
    }
};

// =========================================
// 2. MASTER MODAL ENGINE (Builds the Modal Shell)
// =========================================
function renderMasterModal(configKey, bodyContentHTML) {
    const modal = document.getElementById('tableModal');
    const content = modal.querySelector('.modal-content');

    if (typeof window.ORIGINAL_MODAL_CSS === 'undefined') {
        window.ORIGINAL_MODAL_CSS = content.style.cssText;
    }

    if (!MODAL_SETTINGS[configKey]) {
        MODAL_SETTINGS[configKey] = {
            title: "DETAILS",
            headerColor: "#ccced8",
            titleColor: "#ffffff",
            disclaimer: ""
        };
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
// 3. GENERIC TABLE GENERATOR & TAB HELPERS
// =========================================
let currentModalTableData = { headers: [], rows: [], itemsPerTab: 0 };

function renderModalTable(configKey, subData, headers, allRows, itemsPerTab = 0, tabNames = []) {
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
        if (container) {
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

function switchContentTab(tabId, btn) {
    const container = btn.parentNode;
    Array.from(container.children).forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const parent = container.parentNode;
    parent.querySelectorAll('.tab-content-area').forEach(div => div.style.display = 'none');

    const target = parent.querySelector(`#${tabId}`);
    if (target) target.style.display = 'block';
}

// =========================================
// 4. SHARED FORMATTERS
// =========================================
const formatCompactGold = (val) => {
    if (val < 10000) return Math.round(val).toLocaleString('en-US');
    if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';
    return parseFloat((val / 1000000).toFixed(2)) + 'm';
};

const formatYield = (val) => {
    if (val === 0) return "0";
    if (val > 0 && val < 10) return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};

// =========================================
// 5. SYSTEM MODALS (Confirm & Prompt)
// =========================================
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
            <input type="number" id="custom-prompt-input" style="width: 100px; height: 40px; background: #ffffff; border: 2px solid #000000; border-radius: 8px; font-family: 'Fredoka', sans-serif; font-size: 1rem; -webkit-text-stroke: 0px transparent !important; font-weight: 600; text-align: center; outline: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);" placeholder="0" min="1">
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

    setTimeout(() => {
        const input = document.getElementById('custom-prompt-input');
        if (input) input.focus();
    }, 50);
}

// =========================================
// 6. HELP MODAL
// =========================================
function toggleHelp() {
    const el = document.getElementById('helpModal');
    if (el) el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

function switchHelpTab(tab) {
    ['how', 'what', 'who'].forEach(t => {
        const btn = document.getElementById(`btn-help-${t}`);
        const content = document.getElementById(`help-content-${t}`);
        if (btn) btn.classList.remove('active');
        if (content) content.style.display = 'none';
    });

    const targetBtn = document.getElementById(`btn-help-${tab}`);
    const targetContent = document.getElementById(`help-content-${tab}`);
    if (targetBtn) targetBtn.classList.add('active');
    if (targetContent) targetContent.style.display = 'block';
}

// =========================================
// 7. CLAN TECH MODAL (Shared Across Tabs)
// =========================================
const CLAN_TECH_MEM_MAP = {
    'ct-war-personal': 'warPersonal', 'ct-war-win': 'warWin',
    'ct-war-lose': 'warLose', 'ct-mission': 'mission',
    'ct-pot-mission': 'potMission', 'ct-pot-personal': 'potPersonal',
    'ct-pot-win': 'potWin', 'ct-pot-lose': 'potLose', 'ct-pot-race': 'potRace',

    'cw-forge-eq': 'cwForgeEq', 'cw-summon-skill': 'cwSummonSkill',
    'cw-upgrade-skill': 'cwUpgradeSkill', 'cw-tech-tree': 'cwTechTree',
    'cw-forge-up': 'cwForgeUp', 'cw-dungeon': 'cwDungeon',
    'cw-hatch': 'cwHatch', 'cw-merge-pet': 'cwMergePet',
    'cw-summon-mount': 'cwSummonMount', 'cw-merge-mount': 'cwMergeMount',
    'cw-day1': 'cwDay1', 'cw-day2': 'cwDay2', 'cw-day3': 'cwDay3',
    'cw-day4': 'cwDay4', 'cw-day5': 'cwDay5',

    'ct-egg-timer-common': 'eggTimerCommon',
    'ct-egg-timer-rare': 'eggTimerRare',
    'ct-egg-timer-epic': 'eggTimerEpic',
    'ct-egg-timer-legendary': 'eggTimerLegendary',
    'ct-egg-timer-ultimate': 'eggTimerUltimate',
    'ct-egg-timer-mythic': 'eggTimerMythic'
};

window.validateClanTechInput = function(el, maxVal) {
    let actualMax = maxVal;

    // Uncap limit if it's a War Tech and the toggle is enabled
    if (el.id.startsWith('cw-') && window.clanTechMemory?.cwMaxUnlocked === 'true') {
        actualMax = 9999;
    }

    let clean = el.value.replace(/[^0-9]/g, '');
    clean = clean.replace(/^0+(?=\d)/, '');

    if (clean !== '') {
        let val = parseInt(clean);
        if (val > actualMax) {
            clean = actualMax.toString();
        }
    }

    el.value = clean;

    if (CLAN_TECH_MEM_MAP[el.id]) {
        if (!window.clanTechMemory) window.clanTechMemory = {};
        window.clanTechMemory[CLAN_TECH_MEM_MAP[el.id]] = clean;
    }
};

window.toggleCwMaxUnlocked = function(cb) {
    if (!window.clanTechMemory) window.clanTechMemory = {};
    window.clanTechMemory.cwMaxUnlocked = cb.checked ? 'true' : 'false';

    // Find all War inputs. If toggled off, clamp any high values back down to 10
    const warInputs = document.querySelectorAll('#ct-tab-war input[type="number"]');
    warInputs.forEach(input => {
        if (!cb.checked && parseInt(input.value) > 10) {
            input.value = '10';
            window.validateClanTechInput(input, 10);
        }

        // Dynamically update the "/ 10" text to "/ ∞"
        const maxSpan = document.getElementById('max-label-' + input.id);
        if (maxSpan) {
            maxSpan.innerText = cb.checked ? '∞' : '10';
        }
    });

    if (typeof updateWeekly === 'function') updateWeekly();
    if (typeof updateWarCalc === 'function') updateWarCalc();
};

window.switchClanTechTab = function(tabName) {
    ['rewards', 'war', 'egg'].forEach(t => {
        const elContent = document.getElementById(`ct-tab-${t}`);
        const elBtn = document.getElementById(`btn-ct-tab-${t}`);

        if (elContent && elBtn) {
            if (t === tabName) {
                elContent.style.display = 'block';
                elBtn.classList.add('active');
            } else {
                elContent.style.display = 'none';
                elBtn.classList.remove('active');
            }
        }
    });
};

window.openCombinedClanTechModal = function(initialTab = 'rewards') {
    const getSavedVal = (id) => {
        const existingEl = document.getElementById(id);
        const val = existingEl ? existingEl.value : (window.clanTechMemory?.[CLAN_TECH_MEM_MAP[id]] || '');
        return (val === '0' || val === 0) ? '' : val;
    };

    const createRow = (node) => {
        let currentVal = getSavedVal(node.id);
        const isWarTech = node.id.startsWith('cw-');
        const isUnlocked = isWarTech && window.clanTechMemory?.cwMaxUnlocked === 'true';
        const displayMax = isUnlocked ? '∞' : node.max;

        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; margin-bottom: 8px; background-color: #f2f2f2; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="icons/${node.icon}" style="width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0px 1px 0px rgba(0,0,0,0.5));" onerror="this.style.display='none'">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; color: #000; -webkit-text-stroke: 0px;">${node.label}:</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; white-space: nowrap;">
                <input type="number" id="${node.id}" value="${currentVal}" placeholder="0" min="0" onfocus="this.select()" oninput="window.validateClanTechInput(this, ${node.max}); if(typeof updateWeekly === 'function') updateWeekly(); if(typeof updateWarCalc === 'function') updateWarCalc();" style="width: 55px; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; background-color: #fff; -webkit-text-stroke: 0px transparent !important;">
                <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; white-space: nowrap; color: #000; -webkit-text-stroke: 0px;">/ <span id="max-label-${node.id}">${displayMax}</span></span>
            </div>
        </div>`;
    };

    const rewardsNodes = [
        { id: 'ct-war-personal', label: 'War Personal Rewards', max: 10, icon: 'cr_personal.png' },
        { id: 'ct-war-win',      label: 'War Win Rewards',      max: 10, icon: 'cr_warwin.png' },
        { id: 'ct-war-lose',     label: 'War Lose Rewards',     max: 10, icon: 'cr_warlose.png' },
        { id: 'ct-mission',      label: 'Mission Rewards',      max: 10, icon: 'cr_mission.png' },
        { id: 'ct-pot-mission',  label: 'Potion from Mission',  max: 20, icon: 'cr_missionpot.png' },
        { id: 'ct-pot-personal', label: 'Potion from Personal', max: 20, icon: 'cr_personalpot.png' },
        { id: 'ct-pot-win',      label: 'Potion from War Win',  max: 20, icon: 'cr_warwinpot.png' },
        { id: 'ct-pot-lose',     label: 'Potion from War Lose', max: 20, icon: 'cr_warlosepot.png' },
        { id: 'ct-pot-race',     label: 'Potion from Race',     max: 20, icon: 'cr_racepot.png' }
    ];

    const warNodes = [
        { id: 'cw-forge-eq',      label: 'Forging Equipment', max: 10, icon: 'cw_forge.png' },
        { id: 'cw-summon-skill',  label: 'Summoning Skills',  max: 10, icon: 'cw_skill.png' },
        { id: 'cw-upgrade-skill', label: 'Upgrading Skills',  max: 10, icon: 'cw_skillup.png' },
        { id: 'cw-tech-tree',     label: 'Tech Tree',         max: 10, icon: 'cw_tech.png' },
        { id: 'cw-forge-up',      label: 'Forge Upgrades',    max: 10, icon: 'cw_forgeup.png' },
        { id: 'cw-dungeon',       label: 'Dungeon Keys',      max: 10, icon: 'cw_key.png' },
        { id: 'cw-hatch',         label: 'Hatching Eggs',     max: 10, icon: 'cw_hatch.png' },
        { id: 'cw-merge-pet',     label: 'Merging Pets',      max: 10, icon: 'cw_eggmerge.png' },
        { id: 'cw-summon-mount',  label: 'Summoning Mounts',  max: 10, icon: 'cw_mount.png' },
        { id: 'cw-merge-mount',   label: 'Merging Mounts',    max: 10, icon: 'cw_mountmerge.png' },
        { id: 'cw-day1',          label: 'War Day 1',         max: 10, icon: 'cw_day1.png' },
        { id: 'cw-day2',          label: 'War Day 2',         max: 10, icon: 'cw_day2.png' },
        { id: 'cw-day3',          label: 'War Day 3',         max: 10, icon: 'cw_day3.png' },
        { id: 'cw-day4',          label: 'War Day 4',         max: 10, icon: 'cw_day4.png' },
        { id: 'cw-day5',          label: 'War Day 5',         max: 10, icon: 'cw_day5.png' }
    ];

    const eggNodes = [
        { id: 'ct-egg-timer-common',    label: 'Common Egg Timer',    max: 60, icon: 'cegg1.png' },
        { id: 'ct-egg-timer-rare',      label: 'Rare Egg Timer',      max: 60, icon: 'cegg2.png' },
        { id: 'ct-egg-timer-epic',      label: 'Epic Egg Timer',      max: 60, icon: 'cegg3.png' },
        { id: 'ct-egg-timer-legendary', label: 'Legendary Egg Timer', max: 60, icon: 'cegg4.png' },
        { id: 'ct-egg-timer-ultimate',  label: 'Ultimate Egg Timer',  max: 60, icon: 'cegg5.png' },
        { id: 'ct-egg-timer-mythic',    label: 'Mythic Egg Timer',    max: 60, icon: 'cegg6.png' }
    ];

    const isWarUnlocked = window.clanTechMemory?.cwMaxUnlocked === 'true';

    const contentHtml = `
        <style>
            #ct-tabs-container .seg-btn { transition: font-size 0.1s ease, transform 0.1s ease; }
            .ct-switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
            .ct-switch input { opacity: 0; width: 0; height: 0; }
            .ct-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .3s; border-radius: 24px; border: 2px solid #000; }
            .ct-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 2px; bottom: 2px; background-color: white; transition: .3s; border-radius: 50%; border: 2px solid #000; box-sizing: border-box; }
            .ct-switch input:checked + .ct-slider { background-color: #27ae60; }
            .ct-switch input:checked + .ct-slider:before { transform: translateX(20px); }
        </style>
        
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            <div id="ct-tabs-container" class="segmented-control" style="width: 100%; max-width: 320px; height: 38px; display: flex;">
                <button id="btn-ct-tab-rewards" class="seg-btn ${initialTab === 'rewards' ? 'active' : ''}" onclick="window.switchClanTechTab('rewards')" style="flex: 1;">Rewards</button>
                <button id="btn-ct-tab-war" class="seg-btn ${initialTab === 'war' ? 'active' : ''}" onclick="window.switchClanTechTab('war')" style="flex: 1;">War</button>
                <button id="btn-ct-tab-egg" class="seg-btn ${initialTab === 'egg' ? 'active' : ''}" onclick="window.switchClanTechTab('egg')" style="flex: 1;">Egg</button>
            </div>
        </div>
        
        <div id="ct-tab-rewards" style="display: ${initialTab === 'rewards' ? 'block' : 'none'};">
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${rewardsNodes.map(createRow).join('')}
            </div>
        </div>
        
        <div id="ct-tab-war" style="display: ${initialTab === 'war' ? 'block' : 'none'};">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 15px; margin-bottom: 12px; background-color: #ebf8fa; border: 2px solid #000; border-radius: 8px; box-shadow: 0 3px 0 rgba(0,0,0,0.1);">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px; line-height: 1.2;">
                    All Clan Tech Maxed<br>
                    <span style="font-size: 0.75rem; color: #555; font-weight: 500;">(Unlocks Lv 11+ for Clan War Tech)</span>
                </div>
                <label class="ct-switch">
                    <input type="checkbox" id="cw-max-unlock-toggle" ${isWarUnlocked ? 'checked' : ''} onchange="window.toggleCwMaxUnlocked(this)">
                    <span class="ct-slider"></span>
                </label>
            </div>

            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${warNodes.map(createRow).join('')}
            </div>
        </div>

        <div id="ct-tab-egg" style="display: ${initialTab === 'egg' ? 'block' : 'none'};">
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${eggNodes.map(createRow).join('')}
            </div>
        </div>
    `;

    renderMasterModal('combinedClanTech', contentHtml);
};

window.openClanTechModal = function() {
    window.openCombinedClanTechModal('rewards');
};

window.openClanWarTechModal = function() {
    window.openCombinedClanTechModal('war');
};

// =========================================
// 8. GLOBAL EVENT LISTENERS (Background Clicks)
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