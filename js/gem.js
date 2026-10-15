// Gem Calc
function updateGemToTime() {
    let g = parseInt(document.getElementById('calc-gem-input').value);
    let res = document.getElementById('calc-gem-time-res');
    
    if (isNaN(g) || g <= 0) { 
        res.innerText = '0s'; 
        return; 
    }

    let ts = Math.floor((g + 0.5) * 7.24643 * 60);
    
    let d = Math.floor(ts / 86400);
    let h = Math.floor((ts % 86400) / 3600);
    let m = Math.floor((ts % 3600) / 60);
    let s = ts % 60;
    
    let arr = [];
    if(d > 0) arr.push(d + 'd');
    if(h > 0) arr.push(h + 'h');
    if(m > 0) arr.push(m + 'm');
    if(s > 0 || arr.length === 0) arr.push(s + 's');
    
    res.innerText = arr.join(' ');
}

function updateTimeToGem() {
    let d = parseInt(document.getElementById('calc-time-d').value) || 0;
    let h = parseInt(document.getElementById('calc-time-h').value) || 0;
    let m = parseInt(document.getElementById('calc-time-m').value) || 0;
    let s = parseInt(document.getElementById('calc-time-s').value) || 0;
    
    let totalSeconds = (d * 86400) + (h * 3600) + (m * 60) + s;
    let res = document.getElementById('calc-time-gem-res');
    
    if (totalSeconds <= 0) {
        res.innerText = '0';
        return;
    }

    let gems = Math.max(1, Math.ceil((totalSeconds / 434.7858) - 0.5));
    
    res.innerText = gems.toLocaleString();
}

// --- TAB SWITCHER ---
window.switchGemTab = function(tab) {
    document.getElementById('btn-gemtab-forge').classList.remove('active');
    document.getElementById('btn-gemtab-egg').classList.remove('active');
    document.getElementById('gem-content-forge').style.display = 'none';
    document.getElementById('gem-content-egg').style.display = 'none';

    document.getElementById(`btn-gemtab-${tab}`).classList.add('active');
    document.getElementById(`gem-content-${tab}`).style.display = 'block';
};

// --- EGG GEM CALC ---
window.updateGemsToEggs = function() {
    let g = parseInt(document.getElementById('calc-egg-gem-input').value);
    let tableBody = document.getElementById('calc-egg-gem-table-body');
    
    if (isNaN(g) || g <= 0) { 
        if (tableBody) tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 10px; font-family: \'Fredoka\', sans-serif; font-weight: 500; color: #777;">Enter gems to calculate</td></tr>';
        return; 
    }

    const keys = ['common', 'rare', 'epic', 'legendary', 'ultimate', 'mythic'];
    let html = '';

    keys.forEach(k => {
        if (typeof EGG_DATA === 'undefined' || !EGG_DATA[k]) return;
        const data = EGG_DATA[k];
        const baseMins = data.t;
        
        let curLvl = 0;
        if (typeof setupLevels !== 'undefined') {
            for (let t = 1; t <= 5; t++) {
                curLvl += (setupLevels[`spt_T${t}_${data.id}`] || 0);
            }
        }
        let clanLvl = typeof window.getClanEggLvl === 'function' ? window.getClanEggLvl(data.id) : 0;
        
        let curSpeed = (curLvl * 10) + (clanLvl * 5);
        let curMins = baseMins / (1 + curSpeed / 100);
        
        let stdCost = window.getEggGemData(curMins).std;
        
        let amount = 0;
        let leftover = g;
        if (stdCost > 0) {
            amount = Math.floor(g / stdCost);
            leftover = g % stdCost;
        }
        
        html += `<tr>
            <td style="text-align: center; padding: 6px 0;">
                <img src="${data.img}" style="width: 24px; height: 24px; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
            </td>
            <td style="text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000;">${amount.toLocaleString()}</td>
            <td style="text-align: center; font-family: 'Fredoka', sans-serif; font-weight: 600; color: #555;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
                    <img src="icons/Gem.png" style="width: 14px; height: 14px; object-fit: contain;">${leftover.toLocaleString()}
                </div>
            </td>
        </tr>`;
    });

    if (tableBody) tableBody.innerHTML = html;
};

// --- GEM COST HELPERS ---
window.formatFrugalWait = function(s) {
    if (s <= 0) return '0s';
    let h = Math.floor(s / 3600);
    let m = Math.floor((s % 3600) / 60);
    let sec = s % 60;
    let arr = [];
    if (h > 0) arr.push(h + 'h');
    if (m > 0) arr.push(m + 'm');
    if (sec > 0 || arr.length === 0) arr.push(sec + 's');
    return arr.join(' ');
};

window.getGemData = function(mins) {
    if (mins <= 0) return { std: 0, frg: 0, rawWait: 0, wait: '0s' };
    let totalSeconds = mins * 60;
    let stdGems = Math.max(1, Math.ceil((totalSeconds / 434.7858) - 0.5));
    let frgGems = stdGems - 1;
    let targetSeconds = frgGems > 0 ? (frgGems + 0.5) * 434.7858 : 0;
    let waitSeconds = Math.max(0, Math.ceil(totalSeconds - targetSeconds));
    return { std: stdGems, frg: frgGems, rawWait: waitSeconds, wait: window.formatFrugalWait(waitSeconds) };
};

window.renderGemCell = function(data, customColor) {
    const color = customColor || '#000';
    const iconHtml = `<img src="icons/Gem.png" style="width: 14px; height: 14px; object-fit: contain; vertical-align: -2px; margin-right: 4px;">`;
    const stdHtml = `<span class="gem-val-standard" style="display: inline-flex; align-items: center; color: ${color} !important;">${iconHtml}${data.std.toLocaleString()}</span>`;
    const frgHtml = `<span class="gem-val-frugal" style="display: none; align-items: center; color: ${color} !important;">${iconHtml}${data.frg.toLocaleString()} + ${data.wait}</span>`;
    
    return `${stdHtml}${frgHtml}`;
};

window.toggleGemFrugalMode = function(isFrugal) {
    const stdElems = document.querySelectorAll('.gem-val-standard');
    const frgElems = document.querySelectorAll('.gem-val-frugal');
    const btnStd = document.getElementById('btn-gem-standard');
    const btnFrg = document.getElementById('btn-gem-frugal');

    if (isFrugal) {
        stdElems.forEach(el => el.style.setProperty('display', 'none', 'important'));
        frgElems.forEach(el => el.style.setProperty('display', 'inline-flex', 'important'));
        if (btnStd) btnStd.classList.remove('active');
        if (btnFrg) btnFrg.classList.add('active');
    } else {
        stdElems.forEach(el => el.style.setProperty('display', 'inline-flex', 'important'));
        frgElems.forEach(el => el.style.setProperty('display', 'none', 'important'));
        if (btnStd) btnStd.classList.add('active');
        if (btnFrg) btnFrg.classList.remove('active');
    }
};

window.getEggGemData = function(mins) {
    if (mins <= 0) return { std: 0, frg: 0, rawWait: 0, wait: '0s' };

    let totalSeconds = mins * 60;
    
    let stdGems = Math.max(1, Math.ceil((totalSeconds / 1000) - 0.5));
    let frgGems = stdGems - 1;

    let targetSeconds = frgGems > 0 ? (frgGems + 0.5) * 1000 : 0;
    let waitSeconds = Math.max(0, Math.ceil(totalSeconds - targetSeconds));
    
    return { 
        std: stdGems, 
        frg: frgGems, 
        rawWait: waitSeconds, 
        wait: window.formatFrugalWait(waitSeconds) 
    };
};

// --- MODAL FUNCTIONS ---
function showForgeGemTable() {
    let cur = 0, proj = 0;
    if (typeof getTechBonuses === 'function' && typeof setupLevels !== 'undefined' && typeof calcState === 'function') {
        cur = getTechBonuses(setupLevels).speed;
        proj = getTechBonuses(calcState().levels).speed;
    }
    const isUpgrade = proj > cur;
    let totalStdBefore = 0, totalFrgBefore = 0, totalWaitBefore = 0;
    let totalStdAfter = 0, totalFrgAfter = 0, totalWaitAfter = 0;

    let rowsHtml = '';
    for (let i = 1; i <= 34; i++) {
        if (!forgeLevelData[i]) continue;
        const mins = forgeLevelData[i][1] * 60;
        
        const curData = window.getGemData(mins / (1 + cur / 100));
        const projData = window.getGemData(mins / (1 + proj / 100));

        totalStdBefore += curData.std; totalFrgBefore += curData.frg; totalWaitBefore += curData.rawWait;
        totalStdAfter += projData.std; totalFrgAfter += projData.frg; totalWaitAfter += projData.rawWait;
        
        let rightCol = `
        <div class="gem-comp-container">
            <div class="gem-stack-inner">
                <div class="gem-before-wrapper">${window.renderGemCell(curData)}</div>
            </div>
        </div>`;
        if (isUpgrade) {
            rightCol = `
            <div class="gem-comp-container"> 
                <div class="gem-stack-inner">
                    <div class="gem-before-wrapper">${window.renderGemCell(curData)}</div>
                    <div class="gem-after-wrapper">
                        <span class="gem-comp-arrow">➜</span>
                        <div class="gem-after-val">${window.renderGemCell(projData, '#198754')}</div>
                    </div>
                </div>
            </div>`;
        }

        rowsHtml += `<tr>
            <td><div style="text-align: left; padding-left: 20px; display: block; width: 100%; box-sizing: border-box; color: #000; font-family: 'Fredoka', sans-serif; font-weight: 700;">${i} ➜ ${i + 1}</div></td>
            <td>${rightCol}</td>
        </tr>`;
    }
    
    const totalCurData = { std: totalStdBefore, frg: totalFrgBefore, wait: window.formatFrugalWait(totalWaitBefore) };
    const totalProjData = { std: totalStdAfter, frg: totalFrgAfter, wait: window.formatFrugalWait(totalWaitAfter) };

    let totalRightCol = `
    <div class="gem-comp-container">
        <div class="gem-stack-inner">
            <div class="gem-before-wrapper">${window.renderGemCell(totalCurData)}</div>
        </div>
    </div>`;
    if (isUpgrade) {
        totalRightCol = `
        <div class="gem-comp-container"> 
            <div class="gem-stack-inner">
                <div class="gem-before-wrapper">${window.renderGemCell(totalCurData)}</div>
                <div class="gem-after-wrapper">
                    <span class="gem-comp-arrow">➜</span>
                    <div class="gem-after-val">${window.renderGemCell(totalProjData, '#198754')}</div>
                </div>
            </div>
        </div>`;
    }

    rowsHtml += `<tr>
        <td><div style="text-align: left; padding-left: 20px; display: block; width: 100%; box-sizing: border-box; color: #000; font-family: 'Fredoka', sans-serif; font-weight: 700;">Total</div></td>
        <td>${totalRightCol}</td>
    </tr>`;

    const dynamicStyles = `
    <style>
        .gem-comp-container {
            display: flex;
            justify-content: center;
            width: 100%;
            box-sizing: border-box;
            font-family: 'Fredoka', sans-serif;
            font-weight: 700;
        }
        .gem-stack-inner {
            display: flex;
            align-items: center;
        }
        .gem-before-wrapper, .gem-after-val {
            display: flex;
            align-items: center;
        }
        .gem-after-wrapper {
            display: flex;
            align-items: center;
        }
        .gem-comp-arrow {
            color: #198754 !important;
            font-weight: 900;
            margin: 0 6px;
            -webkit-text-stroke: 0px !important;
        }
        @media (max-width: 768px) {
            .gem-stack-inner {
                flex-direction: column;
                align-items: flex-start; /* Aligns the left edges of Before/After perfectly */
                gap: 4px;
                padding: 4px 0;
            }
            .gem-after-wrapper {
                position: relative; /* Anchor for the absolute arrow */
            }
            .gem-comp-arrow {
                position: absolute;
                right: 100%; /* Pushes the arrow outside to the left */
                margin: 0 4px 0 0;
            }
        }
    </style>
    `;

    const subHtml = `
    ${dynamicStyles}
    <div style="text-align: center; margin-bottom: 12px; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">
        Speed +${cur}% ${isUpgrade ? `<span style="color: #198754; margin: 0 4px; font-weight: 800;">➜</span> <span style="color: #198754;">+${proj}%</span>` : ''}
    </div>
    <div style="display: flex; justify-content: center; width: 100%; margin: 0 0 15px 0;">
        <div class="segmented-control" style="display: inline-flex; width: 240px; height: 35px; margin: 0 auto; z-index: 10;">
            <button id="btn-gem-standard" class="seg-btn active" onclick="toggleGemFrugalMode(false)" style="width: 50%;">Standard</button>
            <button id="btn-gem-frugal" class="seg-btn" onclick="toggleGemFrugalMode(true)" style="width: 50%;">Frugal</button>
        </div>
    </div>`;

    let html = `
        ${subHtml}
        <table class="clean-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="text-align: left; padding-left: 20px; width: 15%;">Level</th>
                    <th style="text-align: center; width: 85%; box-sizing: border-box;">Gem Cost</th>
                </tr>
            </thead>
            <tbody id="modal-table-body">${rowsHtml}</tbody>
        </table>
    `;

    if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['forgeGemCost'] = { title: "FORGE GEM COST", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
    renderMasterModal('forgeGemCost', html);
}

function showTechGemTable() {
    let cur = 0, proj = 0;
    if (typeof setupLevels !== 'undefined' && typeof calcState === 'function') {
        const state = calcState();
        for (let t = 1; t <= 5; t++) {
            cur += (setupLevels[`spt_T${t}_timer`] || 0) * 4;
            proj += (state.levels[`spt_T${t}_timer`] || 0) * 4;
        }
    }
    const isUpgrade = proj > cur;

    let tabsHtml = `<div id="modal-tabs-container" style="display: flex; justify-content: center; margin-bottom: 15px;">`;
    ['I', 'II', 'III', 'IV', 'V'].forEach((name, idx) => {
        const activeCls = idx === 0 ? 'active' : '';
        tabsHtml += `<button class="seg-btn ${activeCls}" onclick="document.querySelectorAll('.tech-gem-tab').forEach(el=>el.style.display='none'); document.getElementById('tech-gem-tab-${idx}').style.display='block'; this.parentNode.querySelectorAll('.seg-btn').forEach(btn=>btn.classList.remove('active')); this.classList.add('active');">${name}</button>`;
    });
    tabsHtml += `</div>`;

    let contentHtml = '';

    for (let t = 1; t <= 5; t++) {
        let totalStdBefore = 0, totalFrgBefore = 0, totalWaitBefore = 0;
        let totalStdAfter = 0, totalFrgAfter = 0, totalWaitAfter = 0;
        let rowsHtml = '';
        
        for (let i = 0; i < 5; i++) {
            const baseMins = tierTimes[t][i]; 
            const curData = window.getGemData(baseMins / (1 + cur / 100));
            const projData = window.getGemData(baseMins / (1 + proj / 100));

            totalStdBefore += curData.std; totalFrgBefore += curData.frg; totalWaitBefore += curData.rawWait;
            totalStdAfter += projData.std; totalFrgAfter += projData.frg; totalWaitAfter += projData.rawWait;

            let rightCol = `
            <div class="gem-comp-container">
                <div class="gem-stack-inner">
                    <div class="gem-before-wrapper">${window.renderGemCell(curData)}</div>
                </div>
            </div>`;
            if (isUpgrade) {
                rightCol = `
                <div class="gem-comp-container"> 
                    <div class="gem-stack-inner">
                        <div class="gem-before-wrapper">${window.renderGemCell(curData)}</div>
                        <div class="gem-after-wrapper">
                            <span class="gem-comp-arrow">➜</span>
                            <div class="gem-after-val">${window.renderGemCell(projData, '#198754')}</div>
                        </div>
                    </div>
                </div>`;
            }

            rowsHtml += `<tr>
                <td><div style="text-align: left; padding-left: 20px; display: block; width: 100%; box-sizing: border-box; color: #000; font-family: 'Fredoka', sans-serif; font-weight: 700;">${i + 1}</div></td>
                <td>${rightCol}</td>
            </tr>`;
        }

        const totalCurData = { std: totalStdBefore, frg: totalFrgBefore, wait: window.formatFrugalWait(totalWaitBefore) };
        const totalProjData = { std: totalStdAfter, frg: totalFrgAfter, wait: window.formatFrugalWait(totalWaitAfter) };

        let totalRightCol = `
        <div class="gem-comp-container">
            <div class="gem-stack-inner">
                <div class="gem-before-wrapper">${window.renderGemCell(totalCurData)}</div>
            </div>
        </div>`;
        if (isUpgrade) {
            totalRightCol = `
            <div class="gem-comp-container"> 
                <div class="gem-stack-inner">
                    <div class="gem-before-wrapper">${window.renderGemCell(totalCurData)}</div>
                    <div class="gem-after-wrapper">
                        <span class="gem-comp-arrow">➜</span>
                        <div class="gem-after-val">${window.renderGemCell(totalProjData, '#198754')}</div>
                    </div>
                </div>
            </div>`;
        }

        rowsHtml += `<tr>
            <td><div style="text-align: left; padding-left: 20px; display: block; width: 100%; box-sizing: border-box; color: #000; font-family: 'Fredoka', sans-serif; font-weight: 700;">Total</div></td>
            <td>${totalRightCol}</td>
        </tr>`;

        contentHtml += `
        <div id="tech-gem-tab-${t-1}" class="tech-gem-tab" style="display: ${t === 1 ? 'block' : 'none'};">
            <table class="clean-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th style="text-align: left; padding-left: 20px; width: 25%;">Level</th>
                        <th style="text-align: center; width: 75%; box-sizing: border-box;">Gem Cost</th>
                    </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
            </table>
        </div>`;
    }
    
    const dynamicStyles = `
    <style>
        .gem-comp-container {
            display: flex;
            justify-content: center;
            width: 100%;
            box-sizing: border-box;
            font-family: 'Fredoka', sans-serif;
            font-weight: 700;
        }
        .gem-stack-inner {
            display: flex;
            align-items: center;
        }
        .gem-before-wrapper, .gem-after-val {
            display: flex;
            align-items: center;
        }
        .gem-after-wrapper {
            display: flex;
            align-items: center;
        }
        .gem-comp-arrow {
            color: #198754 !important;
            font-weight: 900;
            margin: 0 6px;
            -webkit-text-stroke: 0px !important;
        }
        @media (max-width: 768px) {
            .gem-stack-inner {
                flex-direction: column;
                align-items: flex-start; /* Aligns the left edges of Before/After perfectly */
                gap: 4px;
                padding: 4px 0;
            }
            .gem-after-wrapper {
                position: relative; /* Anchor for the absolute arrow */
            }
            .gem-comp-arrow {
                position: absolute;
                right: 100%; /* Pushes the arrow outside to the left */
                margin: 0 4px 0 0;
            }
        }
    </style>
    `;

    const subHtml = `
    ${dynamicStyles}
    <div style="text-align: center; margin-bottom: 12px; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">
        Speed Bonus +${cur}% ${isUpgrade ? `<span style="color: #198754; margin: 0 4px; font-weight: 800;">➜</span> <span style="color: #198754;">+${proj}%</span>` : ''}
    </div>
    <div style="display: flex; justify-content: center; width: 100%; margin: 0 0 25px 0;">
        <div class="segmented-control" style="display: inline-flex; width: 240px; height: 35px; margin: 0 auto; z-index: 10;">
            <button id="btn-gem-standard" class="seg-btn active" onclick="toggleGemFrugalMode(false)" style="width: 50%;">Standard</button>
            <button id="btn-gem-frugal" class="seg-btn" onclick="toggleGemFrugalMode(true)" style="width: 50%;">Frugal</button>
        </div>
    </div>`;

    let html = `
        ${subHtml}
        ${tabsHtml}
        ${contentHtml}
    `;
    
    if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['techGemCost'] = { title: "TECH GEM COST", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
    renderMasterModal('techGemCost', html);
}

function showEggGemTable() {
    const keys = ['common', 'rare', 'epic', 'legendary', 'ultimate', 'mythic'];
    
    let rowsHtml = '';
    
    keys.forEach(k => {
        const data = EGG_DATA[k];
        const baseMins = data.t;
        
        let curLvl = 0, projLvl = 0;
        if (typeof setupLevels !== 'undefined' && typeof calcState === 'function') {
            const state = calcState();
            for (let t = 1; t <= 5; t++) {
                curLvl += (setupLevels[`spt_T${t}_${data.id}`] || 0);
                projLvl += (state.levels[`spt_T${t}_${data.id}`] || 0);
            }
        }
        let clanLvl = typeof window.getClanEggLvl === 'function' ? window.getClanEggLvl(data.id) : 0;
        
        let curSpeed = (curLvl * 10) + (clanLvl * 5);
        let projSpeed = (projLvl * 10) + (clanLvl * 5);
        let isUpgrade = projSpeed > curSpeed;

        let curMins = baseMins / (1 + curSpeed / 100);
        let projMins = baseMins / (1 + projSpeed / 100);
        
        const curGem = window.getEggGemData(curMins);
        const projGem = window.getEggGemData(projMins);
        
        let speedCol = `<div style="text-align: center; color: #000; font-weight: 600;">+${curSpeed}%</div>`;
        if (isUpgrade) {
            speedCol = `
            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.2;">
                <div style="color: #000; font-weight: 600; margin-bottom: 2px;">+${curSpeed}%</div>
                <div style="color: #198754 !important; font-weight: 600; display: flex; align-items: center;">
                    <span style="font-weight: 900; margin-right: 4px; font-size: 0.85em; color: #198754 !important;">➜</span><span style="color: #198754 !important;">+${projSpeed}%</span>
                </div>
            </div>`;
        }
        
        let rightCol = `
        <div style="display: flex; justify-content: center; width: 100%;">
            <div>${window.renderGemCell(curGem)}</div>
        </div>`;
        
        if (isUpgrade && (curGem.std !== projGem.std || curGem.rawWait !== projGem.rawWait)) {
            rightCol = `
            <div style="display: flex; flex-direction: column; align-items: center; width: 100%; line-height: 1.2;"> 
                <div style="margin-bottom: 4px;">${window.renderGemCell(curGem)}</div>
                <div style="display: flex; align-items: center;">
                    <span style="color: #198754; font-weight: 900; font-size: 0.85em; margin-right: 4px; -webkit-text-stroke: 0px;">➜</span>
                    <div>${window.renderGemCell(projGem, '#198754')}</div>
                </div>
            </div>`;
        }

        rowsHtml += `<tr>
            <td>
                <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
                    <img src="${data.img}" style="width: 28px; height: 28px; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
                </div>
            </td>
            <td>${speedCol}</td>
            <td>${rightCol}</td>
        </tr>`;
    });

    const dynamicStyles = `
    <style>
        /* Matches the gem text formatting perfectly to the speed column */
        #modal-egg-gem-table .gem-val-standard, 
        #modal-egg-gem-table .gem-val-frugal {
            font-family: 'Fredoka', sans-serif;
            font-weight: 600; /* Dropped from 700 to 600 */
        }
    </style>
    `;

    const subHtml = `
    ${dynamicStyles}
    <div style="display: flex; justify-content: center; width: 100%; margin: 5px 0 15px 0;">
        <div class="segmented-control" style="display: inline-flex; width: 240px; height: 35px; margin: 0 auto; z-index: 10;">
            <button id="btn-gem-standard" class="seg-btn active" onclick="toggleGemFrugalMode(false)" style="width: 50%;">Standard</button>
            <button id="btn-gem-frugal" class="seg-btn" onclick="toggleGemFrugalMode(true)" style="width: 50%;">Frugal</button>
        </div>
    </div>`;

    let html = `
        ${subHtml}
        <table id="modal-egg-gem-table" class="clean-table" style="width: 100%;">
            <thead>
                <tr>
                    <th style="text-align: center; width: 20%;">Egg</th>
                    <th style="text-align: center; width: 30%;">Speed</th>
                    <th style="text-align: center; width: 50%; box-sizing: border-box;">Gem Cost</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
    `;

    if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['eggGemCost'] = { title: "EGG GEM COST", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
    renderMasterModal('eggGemCost', html);
}

window.showGemsToEggsModal = function() {
    let g = parseInt(document.getElementById('calc-egg-gem-input').value);
    
    if (isNaN(g) || g <= 0) {
        let emptyHtml = `
            <table class="clean-table" style="width: 100%; border-collapse: separate; border-spacing: 0 6px;">
                <thead>
                    <tr>
                        <th style="text-align: center; width: 12%; font-size: 0.75rem; padding: 8px 2px;">Egg</th>
                        <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Amount</th>
                        <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Leftover</th>
                        <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Day 3</th>
                        <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Day 5</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 12px; font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000; -webkit-text-stroke: 0px transparent !important;">Enter gems to calculate</td>
                    </tr>
                </tbody>
            </table>
        `;
        if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['gemsToEggs'] = { title: "GEMS TO EGGS", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
        renderMasterModal('gemsToEggs', emptyHtml);
        return;
    }

    const keys = ['common', 'rare', 'epic', 'legendary', 'ultimate', 'mythic'];
    
    const getCwMult = (actionKey, dayNum) => {
        if (typeof getClanTechMult === 'function') return getClanTechMult(actionKey, dayNum);
        const getTechBonus = (lv) => {
            if (lv <= 10) return lv * 0.04;
            return (10 * 0.04) + ((lv - 10) * 0.01);
        };
        const actionLv = parseInt(window.clanTechMemory?.[actionKey] || 0);
        const dayLv = parseInt(window.clanTechMemory?.[`cwDay${dayNum}`] || 0);
        return 1 + getTechBonus(actionLv) + getTechBonus(dayLv);
    };

    const m3Hatch = getCwMult('cwHatch', 3);
    const m5Hatch = getCwMult('cwHatch', 5);

    const formatNumberShort = (v) => {
        if (!v || v === 0) return "0";
        if (v < 10000) return Math.round(v).toLocaleString('en-US');
        if (v < 1000000) return parseFloat((v / 1000).toFixed(1)) + 'k';
        return parseFloat((v / 1000000).toFixed(2)) + 'm';
    };

    const formatCell = (valB, valA, showProj, baseColor = '#000', projColor = '#198754') => {
        const vBStr = formatNumberShort(valB);
        const vAStr = formatNumberShort(valA);
        
        if (showProj && valB !== valA) {
            return `
            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.2; width: 100%;">
                <div style="color: ${baseColor}; font-weight: 600; margin-bottom: 2px;">${vBStr}</div>
                <div style="display: flex; align-items: center;">
                    <span style="color: ${projColor} !important; font-weight: 900; margin-right: 4px; font-size: 0.85em; -webkit-text-stroke: 0px !important;">➜</span>
                    <span style="color: ${projColor} !important; font-weight: 600;">${vAStr}</span>
                </div>
            </div>`;
        }
        return `<div style="text-align: center; color: ${baseColor}; font-weight: 600; width: 100%;">${vBStr}</div>`;
    };

    const formatLeftover = (valB, valA, showProj) => {
        const vBStr = formatNumberShort(valB);
        const vAStr = formatNumberShort(valA);
        const gemIcon = `<img src="icons/Gem.png" style="width: 12px; height: 12px; object-fit: contain; margin-right: 3px; vertical-align: -1px;">`;
        
        if (showProj && valB !== valA) {
            return `
            <div style="display: flex; flex-direction: column; align-items: center; line-height: 1.2; width: 100%;">
                <div style="color: #555; font-weight: 600; margin-bottom: 2px; display: flex; align-items: center;">${gemIcon}${vBStr}</div>
                <div style="display: flex; align-items: center;">
                    <span style="color: #198754 !important; font-weight: 900; margin-right: 4px; font-size: 0.85em; -webkit-text-stroke: 0px !important;">➜</span>
                    <span style="color: #198754 !important; font-weight: 600; display: flex; align-items: center;">${gemIcon}${vAStr}</span>
                </div>
            </div>`;
        }
        return `<div style="display: flex; align-items: center; justify-content: center; color: #555; font-weight: 600; width: 100%;">${gemIcon}${vBStr}</div>`;
    };

    let rowsHtml = '';

    keys.forEach((k, idx) => {
        if (typeof EGG_DATA === 'undefined' || !EGG_DATA[k]) return;
        const data = EGG_DATA[k];
        const baseMins = data.t;
        
        let curLvl = 0, projLvl = 0;
        if (typeof setupLevels !== 'undefined' && typeof calcState === 'function') {
            const state = calcState();
            for (let t = 1; t <= 5; t++) {
                curLvl += (setupLevels[`spt_T${t}_${data.id}`] || 0);
                projLvl += (state.levels[`spt_T${t}_${data.id}`] || 0);
            }
        }
        let clanLvl = typeof window.getClanEggLvl === 'function' ? window.getClanEggLvl(data.id) : 0;
        
        let curSpeed = (curLvl * 10) + (clanLvl * 5);
        let projSpeed = (projLvl * 10) + (clanLvl * 5);
        let isUpgrade = projSpeed > curSpeed;

        let curMins = baseMins / (1 + curSpeed / 100);
        let projMins = baseMins / (1 + projSpeed / 100);
        
        let curStdCost = window.getEggGemData(curMins).std;
        let projStdCost = window.getEggGemData(projMins).std;

        let curAmount = 0, curLeftover = g;
        if (curStdCost > 0) {
            curAmount = Math.floor(g / curStdCost);
            curLeftover = g % curStdCost;
        }

        let projAmount = 0, projLeftover = g;
        if (projStdCost > 0) {
            projAmount = Math.floor(g / projStdCost);
            projLeftover = g % projStdCost;
        }

        let basePts = 0;
        if (typeof WAR_POINTS_BASE !== 'undefined' && WAR_POINTS_BASE.eggHatch && WAR_POINTS_BASE.eggHatch[idx]) {
            basePts = WAR_POINTS_BASE.eggHatch[idx];
        }

        const curDay3Pts = Math.round(basePts * m3Hatch) * curAmount;
        const projDay3Pts = Math.round(basePts * m3Hatch) * projAmount;

        const curDay5Pts = Math.round(basePts * m5Hatch) * curAmount;
        const projDay5Pts = Math.round(basePts * m5Hatch) * projAmount;

        rowsHtml += `
        <tr>
            <td style="text-align: center; padding: 8px 0;">
                <img src="${data.img}" style="width: 24px; height: 24px; object-fit: contain; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));">
            </td>
            <td style="padding: 8px 0; font-size: 0.9rem;">${formatCell(curAmount, projAmount, isUpgrade)}</td>
            <td style="padding: 8px 0; font-size: 0.9rem;">${formatLeftover(curLeftover, projLeftover, isUpgrade)}</td>
            <td style="padding: 8px 0; font-size: 0.9rem;">${formatCell(curDay3Pts, projDay3Pts, isUpgrade)}</td>
            <td style="padding: 8px 0; font-size: 0.9rem;">${formatCell(curDay5Pts, projDay5Pts, isUpgrade)}</td>
        </tr>`;
    });

    let contentHtml = `
        <table class="clean-table" style="width: 100%; border-collapse: separate; border-spacing: 0 6px;">
            <thead>
                <tr>
                    <th style="text-align: center; width: 12%; font-size: 0.75rem; padding: 8px 2px;">Egg</th>
                    <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Amount</th>
                    <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Leftover</th>
                    <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Day 3</th>
                    <th style="text-align: center; width: 22%; font-size: 0.75rem; padding: 8px 2px;">Day 5</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;

    if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['gemsToEggs'] = { title: "GEMS TO EGGS", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
    renderMasterModal('gemsToEggs', contentHtml);
};

function showGemInfoModal() {
    let html = `
        <div style="font-family: 'Fredoka', sans-serif; font-size: 0.95rem; color: #3f3f3f; -webkit-text-stroke: 0px; font-weight: 600; line-height: 1.5; text-align: left; padding: 10px 15px;">
            <p style="margin-bottom: 15px;">
                In this game, 1 gem skips roughly 7 minutes and 15 seconds of wait time for Forge and Tech upgrades. However, the game actually rounds the gem costs, so if you need 1.49 gems to skip it, the game immediately rounds it to 1 gem. As a result, when there are 10 minutes and 52 seconds left on the timer, the cost drops to just 1 gem. This means by spending your gems one at a time right at the end, you get 50% more value from every single gem. This trick works for both tech and forge upgrades.
            </p>
            <p style="margin-bottom: 15px;">
                In the Forge and Tech Gem Cost table, the <strong>standard mode</strong> means what is the cost to immediately skip the whole level. The <strong>frugal mode</strong> is trying to maximize your gem value by waiting for some time and use the gem right after the value is reduced by 1.
            </p>
            <p style="margin-bottom: 15px;">
                The eggs' gem calculation works similarly, except 1 gem is equal to 16 minutes and 40 seconds which means when the timer drops to 25 minutes left, you can spend 1 gem to get 50% extra value from that gem.
            </p>
            <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #ecf0f1;">
                <span style="font-style: italic; font-weight: 500; color: #555;">Credit to LexAeterna for providing me the data.</span>
            </div>
        </div>
    `;

    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS['gemInfo'] = { 
            title: "GEM MECHANICS", 
            headerColor: "#ebf8fa", 
            titleColor: "#000000", 
            disclaimer: "" 
        };
    }
    renderMasterModal('gemInfo', html);
}