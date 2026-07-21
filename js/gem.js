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
    <div style="display: flex; justify-content: center; margin-bottom: 15px; gap: 12px;">
        <button id="btn-gem-standard" class="gem-toggle-btn active" onclick="toggleGemFrugalMode(false)">Standard</button>
        <button id="btn-gem-frugal" class="gem-toggle-btn" onclick="toggleGemFrugalMode(true)">Frugal</button>
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
    <div style="display: flex; justify-content: center; margin-bottom: 15px; gap: 12px;">
        <button id="btn-gem-standard" class="gem-toggle-btn active" onclick="toggleGemFrugalMode(false)">Standard</button>
        <button id="btn-gem-frugal" class="gem-toggle-btn" onclick="toggleGemFrugalMode(true)">Frugal</button>
    </div>`;

    let html = `
        ${subHtml}
        ${tabsHtml}
        ${contentHtml}
    `;
    
    if (typeof MODAL_SETTINGS !== 'undefined') MODAL_SETTINGS['techGemCost'] = { title: "TECH GEM COST", headerColor: "#ebf8fa", titleColor: "#000000", disclaimer: "" };
    renderMasterModal('techGemCost', html);
}

function showGemInfoModal() {
    let html = `
        <div style="font-family: 'Fredoka', sans-serif; font-size: 0.95rem; color: #3f3f3f; -webkit-text-stroke: 0px; font-weight: 600; line-height: 1.5; text-align: left; padding: 10px 15px;">
            <p style="margin-bottom: 15px;">
                This gem calculator is only for Forge Upgrade and Tech Research Time. I don't have the data for the egg hatching.
            </p>
            <p style="margin-bottom: 15px;">
                In this game, 1 gem skips roughly 7 minutes and 15 seconds of wait time. However, the game actually rounds the gem costs, so if you need 1.49 gems to skip it, the game immediately rounds it to 1 gem. As a result, when there are 10 minutes and 52 seconds left on the timer, the cost drops to just 1 gem. This means by spending your gems one at a time right at the end, you get 50% more value from every single gem. This trick works for both tech and forge upgrades.
            </p>
            <p style="margin-bottom: 15px;">
                In the Forge and Tech Gem Cost table, the <strong>standard mode</strong> means what is the cost to immediately skip the whole level. The <strong>frugal mode</strong> is trying to maximize your gem value by waiting for some time and use the gem right after the value is reduced by 1.
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