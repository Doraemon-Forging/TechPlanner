/**
 * SUMMON.JS
 * Core Logic for the Summon Calc Tab (Skills, Pets, Mounts)
 */

// ==========================================
// 1. NAVIGATION & UI
// ==========================================
function toggleSummonTab(tabId) {
    ['skill', 'pet', 'mount'].forEach(t => {
        const btn = document.getElementById(`btn-toggle-sum-${t}`);
        if(btn) btn.classList.remove('active');
    });
    document.getElementById(`btn-toggle-sum-${tabId}`).classList.add('active');

    document.getElementById('view-summon-skill').style.display = 'none';
    document.getElementById('view-summon-pet').style.display = 'none';
    document.getElementById('view-summon-mount').style.display = 'none';

    document.getElementById(`view-summon-${tabId}`).style.display = 'block';
    
    updateSummonCap(tabId);
    updateSummonCalc(tabId);
}

function updateSummonCap(type) {
    const lvEl = document.getElementById(`sum-${type}-lvl`);
    const expEl = document.getElementById(`sum-${type}-exp`);
    const maxEl = document.getElementById(`sum-${type}-max`);
    
    if (!lvEl || !maxEl || !expEl) return;
    
    let lv = parseInt(lvEl.value) || 1;
    if (lv < 1) lv = 1;
    if (lv > 100) lv = 100; 
    
    let maxExp = 0;
    let database = null;

    if (type === 'mount' && typeof MOUNT_LEVEL_DATA !== 'undefined') database = MOUNT_LEVEL_DATA;
    if (type === 'skill' && typeof SKILL_LEVEL_DATA !== 'undefined') database = SKILL_LEVEL_DATA;
    if (type === 'pet' && typeof PET_LEVEL_DATA !== 'undefined') database = PET_LEVEL_DATA;
    
    if (database && database[lv]) {
        maxExp = database[lv][0];
    }
    
    if (maxExp === "MAX" || maxExp === 0) {
        maxEl.innerText = "MAX";
        expEl.value = 0;
        expEl.disabled = true;
    } else {
        maxEl.innerText = maxExp.toLocaleString();
        expEl.disabled = false;
        let currentExp = parseFloat(expEl.value) || 0;
        if (currentExp >= maxExp) expEl.value = maxExp - 1; 
    }
}

// ==========================================
// 2. CORE MATH ENGINE
// ==========================================

function validateProbability(el) {
    let val = parseFloat(el.value);
    if (val > 99) el.value = 99;
    if (val < 1) el.value = 1;
}

function getCumulativePulls(level, exp, dataTable) {
    if (!dataTable) return 0;
    let total = 0;
    for (let i = 1; i < level; i++) {
        if (dataTable[i] && dataTable[i][0] !== "MAX") {
            total += dataTable[i][0];
        }
    }
    return total + exp;
}

function getLevelFromCumulative(totalPulls, dataTable) {
    if (!dataTable) return { level: 1, exp: 0, maxExp: 0 };
    let lvl = 1;
    let exp = totalPulls;
    
    while (dataTable[lvl] && dataTable[lvl][0] !== "MAX") {
        let maxExp = dataTable[lvl][0];
        if (exp >= maxExp) {
            exp -= maxExp;
            lvl++;
        } else {
            return { level: lvl, exp: exp, maxExp: maxExp };
        }
    }
    return { level: lvl, exp: exp, maxExp: "MAX" };
}

// ==========================================
// 3. TAB-SPECIFIC CALCULATORS
// ==========================================

function updateSummonCalc(type) {
    if (type === 'mount') {
        calculateMountSummon();
    } else if (type === 'skill') {
        calculateSkillSummon(); 
    } else if (type === 'pet') {
        calculatePetSummon();
    }
}

// ==========================================
// SKILL CALCULATOR & MILESTONES
// ==========================================
function calculateSkillSummon() {
    const lvInput = parseInt(document.getElementById('sum-skill-lvl').value) || 1;
    const expInput = parseFloat(document.getElementById('sum-skill-exp').value.replace(/,/g, '')) || 0;
    const ticketsInput = parseFloat(document.getElementById('sum-skill-res').value.replace(/,/g, '')) || 0;

    if (typeof SKILL_LEVEL_DATA === 'undefined') return;

    // --- 1. Tech Modifiers (Cost) ---
    let currentCostLv = 0, plannedCostLv = 0;

    if (typeof setupLevels !== 'undefined') {
        for(let t=1; t<=5; t++) {
            currentCostLv += (setupLevels[`spt_T${t}_ticket`] || 0);
        }
    }
    plannedCostLv = currentCostLv;

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            plannedCostLv = 0;
            for(let t=1; t<=5; t++) {
                plannedCostLv += (state.levels[`spt_T${t}_ticket`] || 0);
            }
        }
    }

    // --- 2. Cost and Yield Math ---
    const costBefore = Math.max(1, Math.round(200 * (1 - (currentCostLv * 1) / 100)));
    const costAfter = Math.max(1, Math.round(200 * (1 - (plannedCostLv * 1) / 100)));

    const pullsBefore = Math.floor(ticketsInput / costBefore);
    const pullsAfter = Math.floor(ticketsInput / costAfter);

    const yieldBefore = pullsBefore * 5;
    const yieldAfter = pullsAfter * 5;

    // --- 3. Cumulative Exp Engine ---
    const baseCumulative = getCumulativePulls(lvInput, expInput, SKILL_LEVEL_DATA);
    
    const totalCumulativeBefore = baseCumulative + yieldBefore;
    const totalCumulativeAfter = baseCumulative + yieldAfter;

    const projBefore = getLevelFromCumulative(totalCumulativeBefore, SKILL_LEVEL_DATA);
    const projAfter = getLevelFromCumulative(totalCumulativeAfter, SKILL_LEVEL_DATA);

    // --- 4. Update Header (Before -> After) ---
    const isMobile = window.innerWidth <= 768;
    const lvParent = document.getElementById('sum-skill-res-lv')?.parentElement;
    
    if(lvParent) {
        lvParent.style.backgroundColor = '#e4e4e4';
        lvParent.style.padding = '12px 15px';
        lvParent.style.borderRadius = '8px';
        lvParent.style.border = '1px solid rgba(0,0,0,0.05)';
        lvParent.style.display = 'flex';
        lvParent.style.justifyContent = 'space-between';
        lvParent.style.alignItems = 'center';
        lvParent.style.gap = '10px';
        if (lvParent.children.length > 0) {
            lvParent.children[0].style.whiteSpace = 'nowrap';
            lvParent.children[0].style.flex = '0 0 auto';
        }
    }

    const resLvContainer = document.getElementById('sum-skill-res-lv');
    resLvContainer.style.flex = '1 1 auto';
    resLvContainer.style.display = 'flex';
    resLvContainer.style.justifyContent = 'flex-end';

    const lvFontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000; font-size: 0.95rem;";
    const lvExpStyle = "font-size: 0.85em; font-weight: 500; color: #000;";
    const formatInt = (val) => Math.round(val).toLocaleString('en-US');

    // NEW: Helper to format the string cleanly based on whether it is MAX or not
    const getLevelText = (proj) => {
        if (proj.maxExp === "MAX") {
            return `Lv ${proj.level} <span style="${lvExpStyle}">(MAX)</span>`;
        }
        return `Lv ${proj.level} <span style="${lvExpStyle}">(${formatInt(proj.exp)} / ${proj.maxExp.toLocaleString()})</span>`;
    };

    let levelHtml = "";

    if (projBefore.maxExp === "MAX") {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } 
    
    else if (projBefore.level === projAfter.level && Math.round(projBefore.exp) === Math.round(projAfter.exp)) {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } 
    
    else {
        const valB = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
        const valA = `<span style="${lvFontStyle}">${getLevelText(projAfter)}</span>`;
        const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 0.95rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

        if (isMobile) {
            levelHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display:flex; align-items:center; white-space: nowrap;">${arrow}${valA}</div>
            </div>`;
        } else {
            levelHtml = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${valA}</div>
            </div>`;
        }
    }
    resLvContainer.innerHTML = levelHtml;

    // --- 5. Build Milestones HTML ---
    const milestones = getDynamicSkillMilestones();
    
    let html = `
    <div style="text-align: center; margin: 5px 0 15px 0; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; -webkit-text-stroke: 0px; line-height: 1.3;">
        Skills and Green Tickets needed to have a chance of summoning higher tier skills for the first time
    </div>`;
    
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const keyIcon = `<img src="icons/green_ticket.png" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    milestones.forEach(m => {
        const targetCumulative = getCumulativePulls(m.targetLv, 0, SKILL_LEVEL_DATA);
        
        const isUnlockedBefore = totalCumulativeBefore >= targetCumulative;
        const isUnlockedAfter = totalCumulativeAfter >= targetCumulative;

        const expNeededB = targetCumulative - totalCumulativeBefore;
        const skillsNeededB = Math.max(0, Math.ceil(expNeededB)); 
        const pullsNeededB = Math.ceil(skillsNeededB / 5);
        const ticketsNeededB = pullsNeededB * costBefore;

        const expNeededA = targetCumulative - totalCumulativeAfter;
        const skillsNeededA = Math.max(0, Math.ceil(expNeededA)); 
        const pullsNeededA = Math.ceil(skillsNeededA / 5);
        const ticketsNeededA = pullsNeededA * costAfter;

        const buildStatus = (unlocked, skills, tickets) => {
            if (unlocked) return `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
            let formattedKeys = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(tickets) : tickets.toLocaleString();
            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${skills.toLocaleString()}</span>
                <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${formattedKeys})</span>
            </div>`;
        };

        let statusHtml = '';

        if (isUnlockedBefore && isUnlockedAfter) {
            statusHtml = `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
        } else if (skillsNeededB === skillsNeededA && ticketsNeededB === ticketsNeededA) {
            statusHtml = buildStatus(isUnlockedBefore, skillsNeededB, ticketsNeededB);
        } else {
            
            const statB = buildStatus(isUnlockedBefore, skillsNeededB, ticketsNeededB);
            const statA = buildStatus(isUnlockedAfter, skillsNeededA, ticketsNeededA);
            const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

            if (isMobile) {
                statusHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow}${statA}</div>
                </div>`;
            } else {
                statusHtml = `
                <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${statA}</div>
                </div>`;
            }
        }

        html += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <div style="flex: 0 0 25%; max-width: 30%; text-align: left; line-height: 1.2;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${m.name}</span>
                <span style="${fontStyle} font-size:0.8rem; font-weight:500; color: #000; display: inline-block;">(Lv ${m.targetLv})</span>
            </div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">
                ${statusHtml}
            </div>
        </div>`;
    });

    // --- 6. Build Progress Bar ---
    let absoluteMaxExp = 0;
    for (let i = 1; i < 100; i++) {
        if (SKILL_LEVEL_DATA[i] && SKILL_LEVEL_DATA[i][0] !== "MAX") {
            absoluteMaxExp += SKILL_LEVEL_DATA[i][0];
        } else break; 
    }
    if(absoluteMaxExp === 0) absoluteMaxExp = 1; 

    let textPctBefore = (totalCumulativeBefore / absoluteMaxExp) * 100;
    let textPctAfter = (totalCumulativeAfter / absoluteMaxExp) * 100;

    let fillPctBefore = textPctBefore > 100 ? 100 : textPctBefore;
    let fillPctAfter = textPctAfter > 100 ? 100 : textPctAfter;

    html += `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px;">Progress to Max Level</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctBefore}%;"></div>
                <div class="pet-progress-text">${formatInt(totalCumulativeBefore)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctBefore.toFixed(1)}%)</div>
            </div>`;
    
    if (ticketsInput > 0 && Math.round(totalCumulativeBefore) !== Math.round(totalCumulativeAfter)) {
        html += `
            <div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctAfter}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${formatInt(totalCumulativeAfter)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctAfter.toFixed(1)}%)</div>
            </div>`;
    }
    html += `</div>`;
    document.getElementById('sum-skill-milestones-container').innerHTML = html;

    // --- 7. Build Yield & Probability Card ---
    if(document.getElementById('sum-skill-yield-container')) {
        calculateSkillYieldTable(lvInput, expInput, yieldBefore, yieldAfter, costBefore, costAfter, projBefore.level, projBefore.exp, projAfter.level, projAfter.exp);
    }
}

function calculateSkillYieldTable(startLv, startExp, yieldBefore, yieldAfter, costBefore, costAfter, beforeLv, beforeExp, afterLv, afterExp) {
    const isMobile = window.innerWidth <= 768;
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";
    
    const formatInt = (val) => Math.round(val).toLocaleString('en-US');
    const formatExp = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const totalYieldParent = document.getElementById('sum-skill-total-yield')?.parentElement;
    if(totalYieldParent) totalYieldParent.style.backgroundColor = '#e4e4e4';

    let totalYieldHtml = `<span style="${fontStyle}">${formatInt(yieldBefore)}</span>`;
    if (Math.round(yieldBefore) !== Math.round(yieldAfter)) {
        let valB = `<span style="${fontStyle}">${formatInt(yieldBefore)}</span>`;
        let valA = `<span style="${fontStyle} color: #000;">${formatInt(yieldAfter)}</span>`;
        
        if (isMobile) {
            totalYieldHtml = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div></div>`;
        } else {
            totalYieldHtml = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div></div>`;
        }
    }
    document.getElementById('sum-skill-total-yield').innerHTML = totalYieldHtml;

    const getExpected = (sLv, sExp, totalYields) => {
        let expected = [0, 0, 0, 0, 0, 0];
        let simLv = sLv;
        let simExp = sExp;
        let remaining = totalYields;

        while (remaining > 0) {
            let levelData = SKILL_LEVEL_DATA[simLv] || SKILL_LEVEL_DATA[100];
            let maxExp = levelData[0];

            if (maxExp === "MAX") {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
            let expNeeded = maxExp - simExp;
            if (remaining >= expNeeded) {
                for (let i = 0; i < 6; i++) expected[i] += expNeeded * (levelData[i + 1] / 100);
                remaining -= expNeeded;
                simLv++;
                simExp = 0;
            } else {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
        }
        return expected;
    };

    let expBefore = getExpected(startLv, startExp, yieldBefore);
    let expAfter = getExpected(startLv, startExp, yieldAfter);

    let targetProb = parseFloat(document.getElementById('sum-skill-prob').value) || 90;
    let targetFail = 1 - (targetProb / 100);

    const getPity = (sLv, sExp, plannedYields, projLv, projExp, cost) => {
        let results = [];
        for (let rarityIndex = 1; rarityIndex <= 6; rarityIndex++) {
            if (targetProb <= 0) {
                results.push({ skills: 0, tickets: 0 });
                continue;
            }
            let currentFail = 1.0;
            let cLv = sLv;
            let cExp = sExp;
            let cRemaining = plannedYields;

            while (cRemaining > 0 && currentFail > 0) {
                let levelData = SKILL_LEVEL_DATA[cLv] || SKILL_LEVEL_DATA[100];
                let maxExp = levelData[0];
                let dropRate = levelData[rarityIndex] / 100;
                if (maxExp === "MAX") {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
                let expNeeded = maxExp - cExp;
                if (cRemaining >= expNeeded) {
                    currentFail *= Math.pow(1 - dropRate, expNeeded);
                    cRemaining -= expNeeded;
                    cLv++;
                    cExp = 0;
                } else {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
            }

            if (currentFail <= targetFail) {
                results.push({ skills: 0, tickets: 0 });
                continue;
            }

            let additionalYieldsNeeded = 0;
            let pLv = projLv;
            let pExp = projExp;

            while (currentFail > targetFail) {
                let levelData = SKILL_LEVEL_DATA[pLv] || SKILL_LEVEL_DATA[100];
                let dropRate = levelData[rarityIndex] / 100;
                let maxExp = levelData[0];

                if (dropRate === 1) {
                    additionalYieldsNeeded += 1;
                    break;
                }
                if (maxExp === "MAX") {
                    if (dropRate > 0) additionalYieldsNeeded += Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    break;
                }
                let yieldsToNextLevel = maxExp - pExp;
                if (dropRate === 0) {
                    additionalYieldsNeeded += yieldsToNextLevel;
                    pLv++;
                    pExp = 0;
                } else {
                    let yieldsForTarget = Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    if (yieldsForTarget <= yieldsToNextLevel) {
                        additionalYieldsNeeded += yieldsForTarget;
                        break;
                    } else {
                        additionalYieldsNeeded += yieldsToNextLevel;
                        currentFail *= Math.pow(1 - dropRate, yieldsToNextLevel);
                        pLv++;
                        pExp = 0;
                    }
                }
            }
            let pullsNeeded = Math.ceil(additionalYieldsNeeded / 5);
            let ticketsNeeded = pullsNeeded * cost;
            results.push({ skills: Math.ceil(additionalYieldsNeeded), tickets: ticketsNeeded });
        }
        return results;
    };

    let pityBefore = getPity(startLv, startExp, yieldBefore, beforeLv, beforeExp, costBefore);
    let pityAfter = getPity(startLv, startExp, yieldAfter, afterLv, afterExp, costAfter);

    const colors = [
        { bg: '#ecf0f1' }, { bg: '#5cd8fe' }, { bg: '#5dfe8a' },      
        { bg: '#fcfe5d' }, { bg: '#ff5c5d' }, { bg: '#d55cff' }    
    ];

    let html = '';
    const keyIcon = `<img src="icons/green_ticket.png" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    for (let i = 0; i < 6; i++) {
        let fmtBefore = formatExp(expBefore[i]);
        let fmtAfter = formatExp(expAfter[i]);
        
        let expCell = `<div style="${fontStyle}">${fmtBefore}</div>`;
        if (fmtBefore !== fmtAfter) {
            let valB = `<span style="${fontStyle}">${fmtBefore}</span>`;
            let valA = `<span style="${fontStyle} color:#000;">${fmtAfter}</span>`;
            if (isMobile) {
                expCell = `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div></div>`;
            } else {
                expCell = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div></div>`;
            }
        }

        const renderPity = (pityObj) => {
            if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
            let formattedTickets = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(pityObj.tickets) : pityObj.tickets.toLocaleString();
            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} color: #000;">${pityObj.skills.toLocaleString()}</span>
                <span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${formattedTickets})</span>
            </div>`;
        };

        let pityB_HTML = renderPity(pityBefore[i]);
        let pityA_HTML = renderPity(pityAfter[i]);
        let pityCell = pityB_HTML;
        
        if (pityBefore[i].tickets !== pityAfter[i].tickets || pityBefore[i].skills !== pityAfter[i].skills) {
            if (isMobile) {
                pityCell = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${pityA_HTML}</div></div>`;
            } else {
                pityCell = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${pityA_HTML}</div></div>`;
            }
        }

        html += `
        <div style="background-color: ${colors[i].bg}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
            <div style="flex: 0 0 30%; max-width: 35%; text-align: left; display: flex; justify-content: flex-start;">${expCell}</div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pityCell}</div>
        </div>`;
    }
    document.getElementById('sum-skill-yield-container').innerHTML = html;
}
function getDynamicSkillMilestones() {
    if (window.DYNAMIC_SKILL_MILESTONES) return window.DYNAMIC_SKILL_MILESTONES;
    if (typeof SKILL_LEVEL_DATA === 'undefined') return [];

    const dynamicMilestones = [
        { name: "Rare", index: 2, color: "#5cd8fe", targetLv: 0 },
        { name: "Epic", index: 3, color: "#5dfe8a", targetLv: 0 },
        { name: "Legendary", index: 4, color: "#fcfe5d", targetLv: 0 },
        { name: "Ultimate", index: 5, color: "#ff5c5d", targetLv: 0 },
        { name: "Mythic", index: 6, color: "#d55cff", targetLv: 0 },
        { name: "Max", index: null, color: "#fe9e0c", targetLv: 100 } 
    ];

    for (let level = 1; level <= 100; level++) {
        let levelData = SKILL_LEVEL_DATA[level];
        if (!levelData) continue;
        dynamicMilestones.forEach(milestone => {
            if (milestone.index !== null && milestone.targetLv === 0 && levelData[milestone.index] > 0) {
                milestone.targetLv = level; 
            }
        });
    }
    window.DYNAMIC_SKILL_MILESTONES = dynamicMilestones;
    return dynamicMilestones;
}

// ==========================================
// PET CALCULATOR & MILESTONES
// ==========================================
function calculatePetSummon() {
    const lvInput = parseInt(document.getElementById('sum-pet-lvl').value) || 1;
    const expInput = parseFloat(document.getElementById('sum-pet-exp').value.replace(/,/g, '')) || 0;
    const shellsInput = parseFloat(document.getElementById('sum-pet-res').value.replace(/,/g, '')) || 0;

    if (typeof PET_LEVEL_DATA === 'undefined') return;

    // --- 1. Tech Modifiers (Extra Egg Chance only) ---
    let currentChanceLv = 0, plannedChanceLv = 0;

    if (typeof setupLevels !== 'undefined') {
        for(let t=1; t<=5; t++) {
            currentChanceLv += (setupLevels[`spt_T${t}_lucky`] || 0);
        }
    }
    plannedChanceLv = currentChanceLv;

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            plannedChanceLv = 0;
            for(let t=1; t<=5; t++) {
                plannedChanceLv += (state.levels[`spt_T${t}_lucky`] || 0);
            }
        }
    }

    // --- 2. Cost and Yield Math ---
    const costBefore = 100;
    const costAfter = 100;

    const extraChanceBefore = (currentChanceLv * 2) / 100;
    const extraChanceAfter = (plannedChanceLv * 2) / 100;

    const pullsBefore = Math.floor(shellsInput / costBefore);
    const pullsAfter = Math.floor(shellsInput / costAfter);

    const yieldBefore = pullsBefore * (1 + extraChanceBefore);
    const yieldAfter = pullsAfter * (1 + extraChanceAfter);

    // --- 3. Cumulative Exp Engine ---
    const baseCumulative = getCumulativePulls(lvInput, expInput, PET_LEVEL_DATA);
    
    const totalCumulativeBefore = baseCumulative + yieldBefore;
    const totalCumulativeAfter = baseCumulative + yieldAfter;

    const projBefore = getLevelFromCumulative(totalCumulativeBefore, PET_LEVEL_DATA);
    const projAfter = getLevelFromCumulative(totalCumulativeAfter, PET_LEVEL_DATA);

    // --- 4. Update Header (Before -> After) ---
    const isMobile = window.innerWidth <= 768;
    const lvParent = document.getElementById('sum-pet-res-lv')?.parentElement;
    
    if(lvParent) {
        lvParent.style.backgroundColor = '#e4e4e4';
        lvParent.style.padding = '12px 15px';
        lvParent.style.borderRadius = '8px';
        lvParent.style.border = '1px solid rgba(0,0,0,0.05)';
        lvParent.style.display = 'flex';
        lvParent.style.justifyContent = 'space-between';
        lvParent.style.alignItems = 'center';
        lvParent.style.gap = '10px';
        if (lvParent.children.length > 0) {
            lvParent.children[0].style.whiteSpace = 'nowrap';
            lvParent.children[0].style.flex = '0 0 auto';
        }
    }

    const resLvContainer = document.getElementById('sum-pet-res-lv');
    resLvContainer.style.flex = '1 1 auto';
    resLvContainer.style.display = 'flex';
    resLvContainer.style.justifyContent = 'flex-end';

    const lvFontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000; font-size: 0.95rem;";
    const lvExpStyle = "font-size: 0.85em; font-weight: 500; color: #000;";
    const formatExp = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const getLevelText = (proj) => {
        if (proj.maxExp === "MAX") {
            return `Lv ${proj.level} <span style="${lvExpStyle}">(MAX)</span>`;
        }
        return `Lv ${proj.level} <span style="${lvExpStyle}">(${formatExp(proj.exp)} / ${proj.maxExp.toLocaleString()})</span>`;
    };

    let levelHtml = "";

    if (projBefore.maxExp === "MAX") {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } else if (projBefore.level === projAfter.level && projBefore.exp.toFixed(1) === projAfter.exp.toFixed(1)) {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } else {
        const valB = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
        const valA = `<span style="${lvFontStyle}">${getLevelText(projAfter)}</span>`;
        const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 0.95rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

        if (isMobile) {
            levelHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display:flex; align-items:center; white-space: nowrap;">${arrow}${valA}</div>
            </div>`;
        } else {
            levelHtml = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${valA}</div>
            </div>`;
        }
    }
    resLvContainer.innerHTML = levelHtml;

    // --- 5. Build Milestones HTML ---
    const milestones = getDynamicPetMilestones();
    
    let html = `
    <div style="text-align: center; margin: 5px 0 15px 0; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; -webkit-text-stroke: 0px; line-height: 1.3;">
        Eggs and Eggshells needed to have a chance of summoning higher tier pets for the first time
    </div>`;
    
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const keyIcon = `<img src="icons/eggshell.png" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    milestones.forEach(m => {
        const targetCumulative = getCumulativePulls(m.targetLv, 0, PET_LEVEL_DATA);
        
        const isUnlockedBefore = totalCumulativeBefore >= targetCumulative;
        const isUnlockedAfter = totalCumulativeAfter >= targetCumulative;

        const expNeededB = targetCumulative - totalCumulativeBefore;
        const petsNeededB = Math.ceil(expNeededB); 
        const pullsNeededB = Math.ceil(expNeededB / (1 + extraChanceBefore));
        const shellsNeededB = pullsNeededB * costBefore;

        const expNeededA = targetCumulative - totalCumulativeAfter;
        const petsNeededA = Math.ceil(expNeededA); 
        const pullsNeededA = Math.ceil(expNeededA / (1 + extraChanceAfter));
        const shellsNeededA = pullsNeededA * costAfter;

        const buildStatus = (unlocked, pets, shells) => {
            if (unlocked) return `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
            let formattedKeys = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(shells) : shells.toLocaleString();
            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${pets.toLocaleString()}</span>
                <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${formattedKeys})</span>
            </div>`;
        };

        let statusHtml = '';

        if (isUnlockedBefore && isUnlockedAfter) {
            statusHtml = `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
        } else if (petsNeededB === petsNeededA && shellsNeededB === shellsNeededA) {
            statusHtml = buildStatus(isUnlockedBefore, petsNeededB, shellsNeededB);
        } else {
            const statB = buildStatus(isUnlockedBefore, petsNeededB, shellsNeededB);
            const statA = buildStatus(isUnlockedAfter, petsNeededA, shellsNeededA);
            const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

            if (isMobile) {
                statusHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow}${statA}</div>
                </div>`;
            } else {
                statusHtml = `
                <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${statA}</div>
                </div>`;
            }
        }

        html += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <div style="flex: 0 0 25%; max-width: 30%; text-align: left; line-height: 1.2;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${m.name}</span>
                <span style="${fontStyle} font-size:0.8rem; font-weight:500; color: #000; display: inline-block;">(Lv ${m.targetLv})</span>
            </div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">
                ${statusHtml}
            </div>
        </div>`;
    });

    // --- 6. Build Progress Bar ---
    let absoluteMaxExp = 0;
    for (let i = 1; i < 100; i++) {
        if (PET_LEVEL_DATA[i] && PET_LEVEL_DATA[i][0] !== "MAX") {
            absoluteMaxExp += PET_LEVEL_DATA[i][0];
        } else break; 
    }
    if(absoluteMaxExp === 0) absoluteMaxExp = 1; 

    let textPctBefore = (totalCumulativeBefore / absoluteMaxExp) * 100;
    let textPctAfter = (totalCumulativeAfter / absoluteMaxExp) * 100;

    let fillPctBefore = textPctBefore > 100 ? 100 : textPctBefore;
    let fillPctAfter = textPctAfter > 100 ? 100 : textPctAfter;

    html += `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px;">Progress to Max Level</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctBefore}%;"></div>
                <div class="pet-progress-text">${formatExp(totalCumulativeBefore)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctBefore.toFixed(1)}%)</div>
            </div>`;
    
    if (shellsInput > 0 && totalCumulativeBefore.toFixed(1) !== totalCumulativeAfter.toFixed(1)) {
        html += `
            <div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctAfter}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${formatExp(totalCumulativeAfter)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctAfter.toFixed(1)}%)</div>
            </div>`;
    }
    html += `</div>`;
    document.getElementById('sum-pet-milestones-container').innerHTML = html;

    // --- 7. Build Yield & Probability Card ---
    if(document.getElementById('sum-pet-yield-container')) {
        calculatePetYieldTable(lvInput, expInput, yieldBefore, yieldAfter, costBefore, costAfter, extraChanceBefore, extraChanceAfter, projBefore.level, projBefore.exp, projAfter.level, projAfter.exp);
    }
}

function calculatePetYieldTable(startLv, startExp, yieldBefore, yieldAfter, costBefore, costAfter, extraChanceBefore, extraChanceAfter, beforeLv, beforeExp, afterLv, afterExp) {
    const isMobile = window.innerWidth <= 768;
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";
    
    const formatExp = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const totalYieldParent = document.getElementById('sum-pet-total-yield')?.parentElement;
    if(totalYieldParent) totalYieldParent.style.backgroundColor = '#e4e4e4';

    let totalYieldHtml = `<span style="${fontStyle}">${formatExp(yieldBefore)}</span>`;
    if (yieldBefore.toFixed(1) !== yieldAfter.toFixed(1)) {
        let valB = `<span style="${fontStyle}">${formatExp(yieldBefore)}</span>`;
        let valA = `<span style="${fontStyle} color: #000;">${formatExp(yieldAfter)}</span>`;
        
        if (isMobile) {
            totalYieldHtml = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div></div>`;
        } else {
            totalYieldHtml = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div></div>`;
        }
    }
    document.getElementById('sum-pet-total-yield').innerHTML = totalYieldHtml;

    const getExpected = (sLv, sExp, totalYields) => {
        let expected = [0, 0, 0, 0, 0, 0];
        let simLv = sLv;
        let simExp = sExp;
        let remaining = totalYields;

        while (remaining > 0) {
            let levelData = PET_LEVEL_DATA[simLv] || PET_LEVEL_DATA[100];
            let maxExp = levelData[0];

            if (maxExp === "MAX") {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
            let expNeeded = maxExp - simExp;
            if (remaining >= expNeeded) {
                for (let i = 0; i < 6; i++) expected[i] += expNeeded * (levelData[i + 1] / 100);
                remaining -= expNeeded;
                simLv++;
                simExp = 0;
            } else {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
        }
        return expected;
    };

    let expBefore = getExpected(startLv, startExp, yieldBefore);
    let expAfter = getExpected(startLv, startExp, yieldAfter);

    let targetProb = parseFloat(document.getElementById('sum-pet-prob').value) || 90;
    let targetFail = 1 - (targetProb / 100);

    const getPity = (sLv, sExp, plannedYields, projLv, projExp, cost, extraChance) => {
        let results = [];
        for (let rarityIndex = 1; rarityIndex <= 6; rarityIndex++) {
            if (targetProb <= 0) {
                results.push({ pets: 0, shells: 0 });
                continue;
            }
            let currentFail = 1.0;
            let cLv = sLv;
            let cExp = sExp;
            let cRemaining = plannedYields;

            while (cRemaining > 0 && currentFail > 0) {
                let levelData = PET_LEVEL_DATA[cLv] || PET_LEVEL_DATA[100];
                let maxExp = levelData[0];
                let dropRate = levelData[rarityIndex] / 100;
                if (maxExp === "MAX") {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
                let expNeeded = maxExp - cExp;
                if (cRemaining >= expNeeded) {
                    currentFail *= Math.pow(1 - dropRate, expNeeded);
                    cRemaining -= expNeeded;
                    cLv++;
                    cExp = 0;
                } else {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
            }

            if (currentFail <= targetFail) {
                results.push({ pets: 0, shells: 0 });
                continue;
            }

            let additionalYieldsNeeded = 0;
            let pLv = projLv;
            let pExp = projExp;

            while (currentFail > targetFail) {
                let levelData = PET_LEVEL_DATA[pLv] || PET_LEVEL_DATA[100];
                let dropRate = levelData[rarityIndex] / 100;
                let maxExp = levelData[0];

                if (dropRate === 1) {
                    additionalYieldsNeeded += 1;
                    break;
                }
                if (maxExp === "MAX") {
                    if (dropRate > 0) additionalYieldsNeeded += Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    break;
                }
                let yieldsToNextLevel = maxExp - pExp;
                if (dropRate === 0) {
                    additionalYieldsNeeded += yieldsToNextLevel;
                    pLv++;
                    pExp = 0;
                } else {
                    let yieldsForTarget = Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    if (yieldsForTarget <= yieldsToNextLevel) {
                        additionalYieldsNeeded += yieldsForTarget;
                        break;
                    } else {
                        additionalYieldsNeeded += yieldsToNextLevel;
                        currentFail *= Math.pow(1 - dropRate, yieldsToNextLevel);
                        pLv++;
                        pExp = 0;
                    }
                }
            }
            let pullsNeeded = Math.ceil(additionalYieldsNeeded / (1 + extraChance));
            let shellsNeeded = pullsNeeded * cost;
            results.push({ pets: Math.ceil(additionalYieldsNeeded), shells: shellsNeeded });
        }
        return results;
    };

    let pityBefore = getPity(startLv, startExp, yieldBefore, beforeLv, beforeExp, costBefore, extraChanceBefore);
    let pityAfter = getPity(startLv, startExp, yieldAfter, afterLv, afterExp, costAfter, extraChanceAfter);

    const colors = [
        { bg: '#ecf0f1' }, { bg: '#5cd8fe' }, { bg: '#5dfe8a' },      
        { bg: '#fcfe5d' }, { bg: '#ff5c5d' }, { bg: '#d55cff' }    
    ];

    let html = '';
    const keyIcon = `<img src="icons/eggshell.png" style="width: 1rem; height: 1rem; object-fit: contain; vertical-align: -2px;">`;

    for (let i = 0; i < 6; i++) {
        let fmtBefore = formatExp(expBefore[i]);
        let fmtAfter = formatExp(expAfter[i]);
        
        let expCell = `<div style="${fontStyle}">${fmtBefore}</div>`;
        if (fmtBefore !== fmtAfter) {
            let valB = `<span style="${fontStyle}">${fmtBefore}</span>`;
            let valA = `<span style="${fontStyle} color:#000;">${fmtAfter}</span>`;
            if (isMobile) {
                expCell = `<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div></div>`;
            } else {
                expCell = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${valB}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div></div>`;
            }
        }

        const renderPity = (pityObj) => {
            if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
            let formattedKeys = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(pityObj.shells) : pityObj.shells.toLocaleString();
            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} color: #000;">${pityObj.pets.toLocaleString()}</span>
                <span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${formattedKeys})</span>
            </div>`;
        };

        let pityB_HTML = renderPity(pityBefore[i]);
        let pityA_HTML = renderPity(pityAfter[i]);
        let pityCell = pityB_HTML;
        
        if (pityBefore[i].shells !== pityAfter[i].shells || pityBefore[i].pets !== pityAfter[i].pets) {
            if (isMobile) {
                pityCell = `<div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${pityA_HTML}</div></div>`;
            } else {
                pityCell = `<div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;"><div style="white-space: nowrap;">${pityB_HTML}</div><div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${pityA_HTML}</div></div>`;
            }
        }

        html += `
        <div style="background-color: ${colors[i].bg}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
            <div style="flex: 0 0 30%; max-width: 35%; text-align: left; display: flex; justify-content: flex-start;">${expCell}</div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pityCell}</div>
        </div>`;
    }
    document.getElementById('sum-pet-yield-container').innerHTML = html;
}

function getDynamicPetMilestones() {
    if (window.DYNAMIC_PET_MILESTONES) return window.DYNAMIC_PET_MILESTONES;
    if (typeof PET_LEVEL_DATA === 'undefined') return [];

    const dynamicMilestones = [
        { name: "Rare", index: 2, color: "#5cd8fe", targetLv: 0 },
        { name: "Epic", index: 3, color: "#5dfe8a", targetLv: 0 },
        { name: "Legendary", index: 4, color: "#fcfe5d", targetLv: 0 },
        { name: "Ultimate", index: 5, color: "#ff5c5d", targetLv: 0 },
        { name: "Mythic", index: 6, color: "#d55cff", targetLv: 0 },
        { name: "Max", index: null, color: "#fe9e0c", targetLv: 100 } 
    ];

    for (let level = 1; level <= 100; level++) {
        let levelData = PET_LEVEL_DATA[level];
        if (!levelData) continue;
        dynamicMilestones.forEach(milestone => {
            if (milestone.index !== null && milestone.targetLv === 0 && levelData[milestone.index] > 0) {
                milestone.targetLv = level; 
            }
        });
    }
    window.DYNAMIC_PET_MILESTONES = dynamicMilestones;
    return dynamicMilestones;
}

// ==========================================
// MOUNT CALCULATOR & MILESTONES
// ==========================================
function calculateMountSummon() {
    const lvInput = parseInt(document.getElementById('sum-mount-lvl').value) || 1;
    const expInput = parseFloat(document.getElementById('sum-mount-exp').value.replace(/,/g, '')) || 0;
    const keysInput = parseFloat(document.getElementById('sum-mount-res').value.replace(/,/g, '')) || 0;

    if (typeof MOUNT_LEVEL_DATA === 'undefined') return;

    // --- 1. Tech Modifiers (Cost & Extra Chance) ---
    let currentCostLv = 0, plannedCostLv = 0;
    let currentChanceLv = 0, plannedChanceLv = 0;

    if (typeof setupLevels !== 'undefined') {
        for(let t=1; t<=5; t++) {
            currentCostLv += (setupLevels[`power_T${t}_mount_cost`] || 0);
            currentChanceLv += (setupLevels[`power_T${t}_mount_chance`] || 0);
        }
    }
    plannedCostLv = currentCostLv;
    plannedChanceLv = currentChanceLv;

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            plannedCostLv = 0;
            plannedChanceLv = 0;
            for(let t=1; t<=5; t++) {
                plannedCostLv += (state.levels[`power_T${t}_mount_cost`] || 0);
                plannedChanceLv += (state.levels[`power_T${t}_mount_chance`] || 0);
            }
        }
    }

    // --- 2. Cost and Yield Math ---
    const costBefore = Math.max(1, Math.ceil(50 * (1 - (currentCostLv * 1) / 100)));
    const costAfter = Math.max(1, Math.ceil(50 * (1 - (plannedCostLv * 1) / 100)));

    const extraChanceBefore = (currentChanceLv * 2) / 100;
    const extraChanceAfter = (plannedChanceLv * 2) / 100;

    const pullsBefore = Math.floor(keysInput / costBefore);
    const pullsAfter = Math.floor(keysInput / costAfter);

    const yieldBefore = pullsBefore * (1 + extraChanceBefore);
    const yieldAfter = pullsAfter * (1 + extraChanceAfter);

    // --- 3. Cumulative Exp Engine ---
    const baseCumulative = getCumulativePulls(lvInput, expInput, MOUNT_LEVEL_DATA);
    
    const totalCumulativeBefore = baseCumulative + yieldBefore;
    const totalCumulativeAfter = baseCumulative + yieldAfter;

    const projBefore = getLevelFromCumulative(totalCumulativeBefore, MOUNT_LEVEL_DATA);
    const projAfter = getLevelFromCumulative(totalCumulativeAfter, MOUNT_LEVEL_DATA);

    // --- 4. Update Header (Before -> After) & Apply #e4e4e4 Background ---
    const isMobile = window.innerWidth <= 768;
    const lvParent = document.getElementById('sum-mount-res-lv')?.parentElement;
    
    if(lvParent) {
        lvParent.style.backgroundColor = '#e4e4e4';
        lvParent.style.padding = '12px 15px';
        lvParent.style.borderRadius = '8px';
        lvParent.style.border = '1px solid rgba(0,0,0,0.05)';
        lvParent.style.display = 'flex';
        lvParent.style.justifyContent = 'space-between';
        lvParent.style.alignItems = 'center';
        lvParent.style.gap = '10px';
        if (lvParent.children.length > 0) {
            lvParent.children[0].style.whiteSpace = 'nowrap';
            lvParent.children[0].style.flex = '0 0 auto';
        }
    }

    const resLvContainer = document.getElementById('sum-mount-res-lv');
    resLvContainer.style.flex = '1 1 auto';
    resLvContainer.style.display = 'flex';
    resLvContainer.style.justifyContent = 'flex-end';

    const lvFontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; color: #000; font-size: 0.95rem;";
    const lvExpStyle = "font-size: 0.85em; font-weight: 500; color: #000;";
    const formatExp = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const getLevelText = (proj) => {
        if (proj.maxExp === "MAX") {
            return `Lv ${proj.level} <span style="${lvExpStyle}">(MAX)</span>`;
        }
        return `Lv ${proj.level} <span style="${lvExpStyle}">(${formatExp(proj.exp)} / ${proj.maxExp.toLocaleString()})</span>`;
    };

    let levelHtml = "";

    if (projBefore.maxExp === "MAX") {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } else if (projBefore.level === projAfter.level && projBefore.exp.toFixed(1) === projAfter.exp.toFixed(1)) {
        levelHtml = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
    } else {
        const valB = `<span style="${lvFontStyle}">${getLevelText(projBefore)}</span>`;
        const valA = `<span style="${lvFontStyle}">${getLevelText(projAfter)}</span>`;
        const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 0.95rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

        if (isMobile) {
            levelHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display:flex; align-items:center; white-space: nowrap;">${arrow}${valA}</div>
            </div>`;
        } else {
            levelHtml = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${valA}</div>
            </div>`;
        }
    }
    resLvContainer.innerHTML = levelHtml;

    // --- 5. Build Milestones HTML ---
    const milestones = getDynamicMountMilestones();
    let html = "";
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";
    const keyIcon = `<img src="icons/mount_key.png" style="width: 12px; height: 12px; object-fit: contain; vertical-align: -1px;">`;

    milestones.forEach(m => {
        const targetCumulative = getCumulativePulls(m.targetLv, 0, MOUNT_LEVEL_DATA);
        
        const isUnlockedBefore = totalCumulativeBefore >= targetCumulative;
        const isUnlockedAfter = totalCumulativeAfter >= targetCumulative;

        const expNeededB = targetCumulative - totalCumulativeBefore;
        const mountsNeededB = Math.ceil(expNeededB); 
        const pullsNeededB = Math.ceil(expNeededB / (1 + extraChanceBefore));
        const keysNeededB = pullsNeededB * costBefore;

        const expNeededA = targetCumulative - totalCumulativeAfter;
        const mountsNeededA = Math.ceil(expNeededA); 
        const pullsNeededA = Math.ceil(expNeededA / (1 + extraChanceAfter));
        const keysNeededA = pullsNeededA * costAfter;

        const buildStatus = (unlocked, mounts, keys) => {
            if (unlocked) return `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
            
            let formattedKeys = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(keys) : keys.toLocaleString();

            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${mounts.toLocaleString()}</span>
                <span style="${fontStyle} font-weight: 500; font-size: 0.8rem; color: #000;">(${keyIcon} ${formattedKeys})</span>
            </div>`;
        };

        let statusHtml = '';

        if (isUnlockedBefore && isUnlockedAfter) {
            statusHtml = `<span style="${fontStyle} font-weight: 600; color: #000;">✔ Unlocked</span>`;
        } else if (mountsNeededB === mountsNeededA && keysNeededB === keysNeededA) {
            statusHtml = buildStatus(isUnlockedBefore, mountsNeededB, keysNeededB);
        } else {
            const statB = buildStatus(isUnlockedBefore, mountsNeededB, keysNeededB);
            const statA = buildStatus(isUnlockedAfter, mountsNeededA, keysNeededA);
            const arrow = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;

            if (isMobile) {
                statusHtml = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow}${statA}</div>
                </div>`;
            } else {
                statusHtml = `
                <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                    <div style="white-space: nowrap;">${statB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrow} ${statA}</div>
                </div>`;
            }
        }

        html += `
        <div style="background-color: ${m.color}; border-radius: 8px; padding: 12px 15px; margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
            <div style="flex: 0 0 25%; max-width: 30%; text-align: left; line-height: 1.2;">
                <span style="${fontStyle} font-weight: 600; color: #000;">${m.name}</span>
                <span style="${fontStyle} font-size:0.8rem; font-weight:500; color: #000; display: inline-block;">(Lv ${m.targetLv})</span>
            </div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">
                ${statusHtml}
            </div>
        </div>`;
    });

    // --- 6. Build Progress Bar (Exp to Max Level) ---
    let absoluteMaxExp = 0;
    for (let i = 1; i < 100; i++) {
        if (MOUNT_LEVEL_DATA[i] && MOUNT_LEVEL_DATA[i][0] !== "MAX") {
            absoluteMaxExp += MOUNT_LEVEL_DATA[i][0];
        } else {
            break; 
        }
    }
    if(absoluteMaxExp === 0) absoluteMaxExp = 1; 

    let textPctBefore = (totalCumulativeBefore / absoluteMaxExp) * 100;
    let textPctAfter = (totalCumulativeAfter / absoluteMaxExp) * 100;

    let fillPctBefore = textPctBefore > 100 ? 100 : textPctBefore;
    let fillPctAfter = textPctAfter > 100 ? 100 : textPctAfter;

    html += `
        <hr class="pet-hr" style="margin: 15px 0;">
        <div style="text-align: center; margin-bottom: 8px; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; color: #000; -webkit-text-stroke: 0px;">Progress to Max Level</div>
        <div style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 4px;">
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctBefore}%;"></div>
                <div class="pet-progress-text">${formatExp(totalCumulativeBefore)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctBefore.toFixed(1)}%)</div>
            </div>`;
    
    if (keysInput > 0 && totalCumulativeBefore.toFixed(1) !== totalCumulativeAfter.toFixed(1)) {
        html += `
            <div style="text-align: center; color: #198754; font-size: 1.3rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
            <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 32px;">
                <div class="pet-progress-fill" style="width: ${fillPctAfter}%; background-color: #00e676;"></div>
                <div class="pet-progress-text">${formatExp(totalCumulativeAfter)} / ${absoluteMaxExp.toLocaleString()} xp (${textPctAfter.toFixed(1)}%)</div>
            </div>`;
    }
    
    html += `</div>`;
    document.getElementById('sum-mount-milestones-container').innerHTML = html;

    // --- 8. Build Yield & Probability Card ---
    if(document.getElementById('sum-mount-yield-container')) {
        calculateMountYieldTable(lvInput, expInput, yieldBefore, yieldAfter, costBefore, costAfter, extraChanceBefore, extraChanceAfter, projBefore.level, projBefore.exp, projAfter.level, projAfter.exp);
    }
}

function calculateMountYieldTable(startLv, startExp, yieldBefore, yieldAfter, costBefore, costAfter, extraChanceBefore, extraChanceAfter, beforeLv, beforeExp, afterLv, afterExp) {
    const isMobile = window.innerWidth <= 768;
    const arrowHtml = `<span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; font-size: 1.05rem; margin: 0 4px; -webkit-text-stroke: 0px !important;">➜</span>`;
    const fontStyle = "font-family: 'Fredoka', sans-serif; font-size: 0.95rem; font-weight: 600; color: #000000; -webkit-text-stroke: 0px;";
    
    const formatExp = (val) => val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

    const totalYieldParent = document.getElementById('sum-mount-total-yield')?.parentElement;
    if(totalYieldParent) {
        totalYieldParent.style.backgroundColor = '#e4e4e4';
    }

    let totalYieldHtml = `<span style="${fontStyle}">${formatExp(yieldBefore)}</span>`;
    if (yieldBefore.toFixed(1) !== yieldAfter.toFixed(1)) {
        let valB = `<span style="${fontStyle}">${formatExp(yieldBefore)}</span>`;
        let valA = `<span style="${fontStyle} color: #000;">${formatExp(yieldAfter)}</span>`;
        
        if (isMobile) {
            totalYieldHtml = `
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div>
            </div>`;
        } else {
            totalYieldHtml = `
            <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                <div style="white-space: nowrap;">${valB}</div>
                <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div>
            </div>`;
        }
    }
    document.getElementById('sum-mount-total-yield').innerHTML = totalYieldHtml;

    const getExpected = (sLv, sExp, totalYields) => {
        let expected = [0, 0, 0, 0, 0, 0];
        let simLv = sLv;
        let simExp = sExp;
        let remaining = totalYields;

        while (remaining > 0) {
            let levelData = MOUNT_LEVEL_DATA[simLv] || MOUNT_LEVEL_DATA[100];
            let maxExp = levelData[0];

            if (maxExp === "MAX") {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
            let expNeeded = maxExp - simExp;
            if (remaining >= expNeeded) {
                for (let i = 0; i < 6; i++) expected[i] += expNeeded * (levelData[i + 1] / 100);
                remaining -= expNeeded;
                simLv++;
                simExp = 0;
            } else {
                for (let i = 0; i < 6; i++) expected[i] += remaining * (levelData[i + 1] / 100);
                break;
            }
        }
        return expected;
    };

    let expBefore = getExpected(startLv, startExp, yieldBefore);
    let expAfter = getExpected(startLv, startExp, yieldAfter);

    let targetProb = parseFloat(document.getElementById('sum-mount-prob').value) || 90;
    let targetFail = 1 - (targetProb / 100);

    const getPity = (sLv, sExp, plannedYields, projLv, projExp, cost, extraChance) => {
        let results = [];
        for (let rarityIndex = 1; rarityIndex <= 6; rarityIndex++) {
            if (targetProb <= 0) {
                results.push({ mounts: 0, keys: 0 });
                continue;
            }
            let currentFail = 1.0;
            let cLv = sLv;
            let cExp = sExp;
            let cRemaining = plannedYields;

            while (cRemaining > 0 && currentFail > 0) {
                let levelData = MOUNT_LEVEL_DATA[cLv] || MOUNT_LEVEL_DATA[100];
                let maxExp = levelData[0];
                let dropRate = levelData[rarityIndex] / 100;
                if (maxExp === "MAX") {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
                let expNeeded = maxExp - cExp;
                if (cRemaining >= expNeeded) {
                    currentFail *= Math.pow(1 - dropRate, expNeeded);
                    cRemaining -= expNeeded;
                    cLv++;
                    cExp = 0;
                } else {
                    currentFail *= Math.pow(1 - dropRate, cRemaining);
                    break;
                }
            }

            if (currentFail <= targetFail) {
                results.push({ mounts: 0, keys: 0 });
                continue;
            }

            let additionalYieldsNeeded = 0;
            let pLv = projLv;
            let pExp = projExp;

            while (currentFail > targetFail) {
                let levelData = MOUNT_LEVEL_DATA[pLv] || MOUNT_LEVEL_DATA[100];
                let dropRate = levelData[rarityIndex] / 100;
                let maxExp = levelData[0];

                if (dropRate === 1) {
                    additionalYieldsNeeded += 1;
                    break;
                }
                if (maxExp === "MAX") {
                    if (dropRate > 0) additionalYieldsNeeded += Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    break;
                }
                let yieldsToNextLevel = maxExp - pExp;
                if (dropRate === 0) {
                    additionalYieldsNeeded += yieldsToNextLevel;
                    pLv++;
                    pExp = 0;
                } else {
                    let yieldsForTarget = Math.log(targetFail / currentFail) / Math.log(1 - dropRate);
                    if (yieldsForTarget <= yieldsToNextLevel) {
                        additionalYieldsNeeded += yieldsForTarget;
                        break;
                    } else {
                        additionalYieldsNeeded += yieldsToNextLevel;
                        currentFail *= Math.pow(1 - dropRate, yieldsToNextLevel);
                        pLv++;
                        pExp = 0;
                    }
                }
            }
            let pullsNeeded = Math.ceil(additionalYieldsNeeded / (1 + extraChance));
            let keysNeeded = pullsNeeded * cost;

            results.push({ mounts: Math.ceil(additionalYieldsNeeded), keys: keysNeeded });
        }
        return results;
    };

    let pityBefore = getPity(startLv, startExp, yieldBefore, beforeLv, beforeExp, costBefore, extraChanceBefore);
    let pityAfter = getPity(startLv, startExp, yieldAfter, afterLv, afterExp, costAfter, extraChanceAfter);

    const colors = [
        { bg: '#ecf0f1' }, { bg: '#5cd8fe' }, { bg: '#5dfe8a' },      
        { bg: '#fcfe5d' }, { bg: '#ff5c5d' }, { bg: '#d55cff' }    
    ];

    let html = '';
    const keyIcon = `<img src="icons/mount_key.png" style="width: 12px; height: 12px; object-fit: contain; vertical-align: -1px;">`;

    for (let i = 0; i < 6; i++) {

        let fmtBefore = formatExp(expBefore[i]);
        let fmtAfter = formatExp(expAfter[i]);
        
        let expCell = `<div style="${fontStyle}">${fmtBefore}</div>`;
        if (fmtBefore !== fmtAfter) {
            let valB = `<span style="${fontStyle}">${fmtBefore}</span>`;
            let valA = `<span style="${fontStyle} color:#000;">${fmtAfter}</span>`;
            
            if (isMobile) {
                expCell = `
                <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="white-space: nowrap;">${valB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${valA}</div>
                </div>`;
            } else {
                expCell = `
                <div style="display: flex; flex-wrap: wrap; justify-content: flex-start; align-items: center; gap: 4px;">
                    <div style="white-space: nowrap;">${valB}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${valA}</div>
                </div>`;
            }
        }

        const renderPity = (pityObj) => {
            if (targetProb <= 0) return `<span style="${fontStyle} color:#000;">0</span>`;
            let formattedKeys = typeof formatSummonKeys !== 'undefined' ? formatSummonKeys(pityObj.keys) : pityObj.keys.toLocaleString();
            
            return `
            <div style="display: inline-flex; align-items: center; gap: 4px; color: #000; white-space: nowrap;">
                <span style="${fontStyle} color: #000;">${pityObj.mounts.toLocaleString()}</span>
                <span style="${fontStyle} font-weight:500; font-size:0.8rem; color: #000;">(${keyIcon} ${formattedKeys})</span>
            </div>`;
        };

        let pityB_HTML = renderPity(pityBefore[i]);
        let pityA_HTML = renderPity(pityAfter[i]);
        
        let pityCell = pityB_HTML;
        
        if (pityBefore[i].keys !== pityAfter[i].keys || pityBefore[i].mounts !== pityAfter[i].mounts) {
            if (isMobile) {
                pityCell = `
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                    <div style="white-space: nowrap;">${pityB_HTML}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml}${pityA_HTML}</div>
                </div>`;
            } else {
                pityCell = `
                <div style="display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 4px;">
                    <div style="white-space: nowrap;">${pityB_HTML}</div>
                    <div style="display: flex; align-items: center; white-space: nowrap;">${arrowHtml} ${pityA_HTML}</div>
                </div>`;
            }
        }

        html += `
        <div style="background-color: ${colors[i].bg}; border-radius: 8px; padding: 10px 15px; margin-bottom: 6px; display: flex; align-items: center; border: 1px solid rgba(0,0,0,0.05); gap: 10px;">
            <div style="flex: 0 0 30%; max-width: 35%; text-align: left; display: flex; justify-content: flex-start;">${expCell}</div>
            <div style="flex: 1 1 auto; text-align: right; display: flex; justify-content: flex-end;">${pityCell}</div>
        </div>`;
    }

    document.getElementById('sum-mount-yield-container').innerHTML = html;
}

function getDynamicMountMilestones() {
    if (window.DYNAMIC_MOUNT_MILESTONES) {
        return window.DYNAMIC_MOUNT_MILESTONES;
    }

    if (typeof MOUNT_LEVEL_DATA === 'undefined') {
        return [];
    }

    const dynamicMilestones = [
        { name: "Rare", index: 2, color: "#5cd8fe", targetLv: 0 },
        { name: "Epic", index: 3, color: "#5dfe8a", targetLv: 0 },
        { name: "Legendary", index: 4, color: "#fcfe5d", targetLv: 0 },
        { name: "Ultimate", index: 5, color: "#ff5c5d", targetLv: 0 },
        { name: "Mythic", index: 6, color: "#d55cff", targetLv: 0 },
        { name: "Max", index: null, color: "#fe9e0c", targetLv: 100 } 
    ];

    for (let level = 1; level <= 100; level++) {
        let levelData = MOUNT_LEVEL_DATA[level];
        if (!levelData) continue;

        dynamicMilestones.forEach(milestone => {
            if (milestone.index !== null && milestone.targetLv === 0 && levelData[milestone.index] > 0) {
                milestone.targetLv = level; 
            }
        });
    }

    window.DYNAMIC_MOUNT_MILESTONES = dynamicMilestones;
    return dynamicMilestones;
}

// ==========================================
// INITIALIZATION & EVENT LISTENERS
// ==========================================
function initSummonCalc() {
    if (typeof getDynamicMountMilestones === 'function') getDynamicMountMilestones();
    if (typeof getDynamicSkillMilestones === 'function') getDynamicSkillMilestones();
    if (typeof getDynamicPetMilestones === 'function') getDynamicPetMilestones();
    
    if (typeof toggleSummonTab === 'function') toggleSummonTab('skill');
}

document.addEventListener('input', (e) => {
    if (e.target.id && e.target.id.includes('power_T')) {
        if (typeof calculateMountSummon === 'function') calculateMountSummon();
    }
    if (e.target.id && e.target.id.includes('spt_T')) {
        if (typeof calculateSkillSummon === 'function') calculateSkillSummon();
        if (typeof calculatePetSummon === 'function') calculatePetSummon();
    }
});