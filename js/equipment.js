/**
 * EQUIPMENT.JS
 * Logic for calculating Health, Damage, Range, and Sell Price based on Tech Tiers, levels, and Tech Tree mastery.
 */

const TIER_MULTIPLIERS = {
    "Primitive": 1, "Medieval": Math.pow(4, 1), "Early-Modern": Math.pow(4, 2), "Modern": Math.pow(4, 3),
    "Space": Math.pow(4, 4), "Interstellar": Math.pow(4, 5), "Multiverse": Math.pow(4, 6),
    "Quantum": Math.pow(4, 7), "Underworld": Math.pow(4, 8), "Divine": Math.pow(4, 9)
};

function formatEqValue(val) {
    if (val === 0) return "0";
    if (val < 1000) return val.toLocaleString('en-US', {maximumFractionDigits: 1});
    if (val < 1000000) return (val / 1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'k';
    if (val < 1000000000) return (val / 1000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'm';
    if (val < 1000000000000) return (val / 1000000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'b';
    return (val / 1000000000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 't';
}

function formatCombatStat(val) {
    if (val === 0) return "0";
    if (val < 10000) return Math.round(val).toLocaleString('en-US'); 
    if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';        
    if (val < 1000000000) return parseFloat((val / 1000000).toFixed(2)) + 'm';   
    if (val < 1000000000000) return parseFloat((val / 1000000000).toFixed(2)) + 'b'; 
    return parseFloat((val / 1000000000000).toFixed(2)) + 't';                  
}

function getTechLevels(tree, nodeId) {
    let beforeLvl = 0, afterLvl = 0;
    if (typeof setupLevels !== 'undefined') {
        for (let t = 1; t <= 5; t++) beforeLvl += (setupLevels[`${tree}_T${t}_${nodeId}`] || 0);
    }
    let planState = typeof calcState === 'function' ? calcState().levels : setupLevels;
    if (planState) {
        for (let t = 1; t <= 5; t++) afterLvl += (planState[`${tree}_T${t}_${nodeId}`] || 0);
    }
    return { before: beforeLvl, after: afterLvl };
}

function calcEqStat(baseValue, tierName, itemLvl, masteryPct) {
    const tierMult = TIER_MULTIPLIERS[tierName] || 1;
    const lvlMult = Math.pow(1.01, itemLvl - 1);
    const masteryMult = 1 + (masteryPct / 100);
    return baseValue * tierMult * lvlMult * masteryMult;
}

function calcAvgSellPrice(minLv, maxLv, sellBonusPct) {
    let total = 0;
    let count = 0;
    for (let i = minLv; i <= maxLv; i++) {
        total += Math.round(20 * Math.pow(1.01, i - 1) * ((100 + sellBonusPct) / 100));
        count++;
    }
    return count > 0 ? total / count : 0;
}

function getEqMinLevel(maxLv) {
    if (maxLv === 99) return 96;
    let floor = 1;
    const bracketFloors = [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56, 61, 66, 71, 76, 81, 86, 91, 96, 101, 106, 111, 116, 121, 126, 131, 136, 141, 146];
    for (let f of bracketFloors) {
        if (f <= maxLv - 5) floor = f;
        else break;
    }
    return floor;
}

function renderEqLine(id, valBefore, valAfter, iconType, isHero = false) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const fmtBefore = formatCombatStat(valBefore);
    const fmtAfter = formatCombatStat(valAfter);
    
    const textStyle = isHero ? 'font-weight: 800;' : 'font-weight: 700;';
    const iconSize = isHero ? '20px' : '16px';
    
    // Added physical space (&nbsp;) between the image and the span
    const valBlockB = `<div style="display:flex; align-items:center; justify-content:center;"><img src="icons/icon_${iconType}.png" style="width:${iconSize}; height:${iconSize}; object-fit:contain;">&nbsp;<span class="text-clean-black" style="${textStyle}">${fmtBefore}</span></div>`;
    const valBlockA = `<div style="display:flex; align-items:center; justify-content:center;"><img src="icons/icon_${iconType}.png" style="width:${iconSize}; height:${iconSize}; object-fit:contain;">&nbsp;<span class="text-clean-green" style="${textStyle}">${fmtAfter}</span></div>`;
    
    if (Math.abs(valBefore - valAfter) < 0.1 || fmtBefore === fmtAfter) {
        el.innerHTML = `<span class="calc-val-before" style="width:100%; display:flex; justify-content:${isHero ? 'center' : 'flex-end'}; align-items:center;">${valBlockB}</span>`;
        el.classList.add('single-val'); 
    } else {
        const isMobile = window.innerWidth <= 768;

        if (isMobile && !isHero) {
             el.innerHTML = `
                <div style="display:flex; flex-direction:column; align-items:flex-end; width:100%;">
                    <span class="calc-val-before" style="display:flex; justify-content:flex-end; margin-bottom:2px; align-items:center;">${valBlockB}</span>
                    <span class="calc-val-after" style="display:flex; align-items:center; justify-content:flex-end;">
                         <span class="calc-arrow" style="-webkit-text-stroke: 1.5px #000; color: #fff; margin-right: 6px;">➜</span>
                         ${valBlockA}
                    </span>
                </div>
            `;
        } else {
            el.innerHTML = `
                <span class="calc-val-before" style="display:flex; justify-content:flex-end; align-items:center;">${valBlockB}</span>
                <span class="calc-arrow" style="-webkit-text-stroke: 1.5px #000; color: #fff; margin: 0 6px;">➜</span>
                <span class="calc-val-after" style="display:flex; justify-content:flex-start; align-items:center;">${valBlockA}</span>
            `;
        }
        el.classList.remove('single-val');
    }
}

function buildEqRowHTML(iconName, labelText, valBefore, valAfter, innerIconHtml, isMobile, isHighlightRow = false) {
    const isSingle = (valBefore === valAfter);
    let rowVals = '';

    // 1. Build the values section (Before -> After)
    // Added physical space (&nbsp;) after innerIconHtml
    if (isSingle) {
        rowVals = `<span class="calc-val-before" style="width:100%; display:flex; justify-content:flex-end; align-items:center;">${innerIconHtml}&nbsp;<span class="text-clean-black">${valBefore}</span></span>`;
    } else if (isMobile) {
        rowVals = `
        <div style="display:flex; flex-direction:column; align-items:flex-end; width:100%;">
            <span class="calc-val-before" style="display:flex; justify-content:flex-end; align-items:center; margin-bottom:2px;">
                ${innerIconHtml}&nbsp;<span class="text-clean-black">${valBefore}</span>
            </span>
            <span class="calc-val-after" style="display:flex; align-items:center; justify-content:flex-end;">
                <span class="calc-arrow" style="-webkit-text-stroke: 1.5px #000; color: #fff; margin-right: 4px;">➜</span>
                <div style="display:flex; align-items:center;">
                    ${innerIconHtml}&nbsp;<span class="text-clean-green">${valAfter}</span>
                </div>
            </span>
        </div>`;
    } else {
        rowVals = `
            <span class="calc-val-before" style="display:flex; justify-content:flex-end; align-items:center;">
                ${innerIconHtml}&nbsp;<span class="text-clean-black">${valBefore}</span>
            </span>
            <span class="calc-arrow" style="-webkit-text-stroke: 1.5px #000; color: #fff; margin: 0 8px;">➜</span>
            <span class="calc-val-after" style="display:flex; justify-content:flex-start; align-items:center;">
                ${innerIconHtml}&nbsp;<span class="text-clean-green">${valAfter}</span>
            </span>
        `;
    }

    // 2. Build the label section (Icon + Name)
    let labelSection = '';
    if (isHighlightRow) {
        labelSection = `<span class="eq-label" style="font-weight: 800 !important; color: #000 !important;">${labelText}</span>`;
    } else {
        labelSection = `
            <div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <img src="icons/${iconName}.png" style="width: 22px; height: 22px; object-fit: contain;">
            </div>
            <span class="eq-label">${labelText}</span>
        `;
    }

    // 3. Assemble and return the final row HTML
    const borderStyle = isHighlightRow ? 'border: 2px solid #000; margin-bottom: 10px;' : '';
    return `<div class="calc-line" style="background-color: #ecf0f1; ${borderStyle} padding-left: 10px; display: flex; align-items: center; justify-content: space-between;">
                <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;">
                    ${labelSection}
                </div>
                <div class="calc-val-group ${isSingle ? 'single-val' : ''}">
                    ${rowVals}
                </div>
             </div>`;
}

function updateEquipment() {
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

    const weaponTypeEl = document.getElementById('eq-weapon-type');
    const weaponType = weaponTypeEl ? weaponTypeEl.value : 'Ranged';
    
    const avgTierEl = document.getElementById('eq-avg-tier');
    const avgWeaponEl = document.getElementById('eq-avg-weapon-type');
    const avgTier = avgTierEl ? avgTierEl.value : 'Quantum';
    const avgWeapon = avgWeaponEl ? avgWeaponEl.value : 'Ranged';

    // --- UNIVERSAL ASCENSION MULTIPLIER ---
    const ascEl = document.getElementById('eq-ascension');
    const ascVal = ascEl ? parseInt(ascEl.value) : 0;
    const ASC_MULTS = [1, 50, 2500, 125000];
    const ascMult = ASC_MULTS[ascVal] || 1;

    const items = [
        { id: 'helmet', icon: 'eqhelmet', type: 'hp',  base: 40, masteryNode: 'helmet_1', maxNode: 'helmet_2' },
        { id: 'armor',  icon: 'eqarmor',  type: 'hp',  base: 40, masteryNode: 'armor_1',  maxNode: 'armor_2' },
        { id: 'boots',  icon: 'eqboots',  type: 'hp',  base: 40, masteryNode: 'boots_1',  maxNode: 'boots_2' }, 
        { id: 'belt',   icon: 'eqbelt',   type: 'hp',  base: 40, masteryNode: 'belt_1',   maxNode: 'belt_2' },  
        { id: 'weapon', icon: 'eqweapon', type: 'dmg', base: 5,  masteryNode: 'weapon_1', maxNode: 'weapon_2' },
        { id: 'gloves', icon: 'eqgloves', type: 'dmg', base: 5,  masteryNode: 'gloves_1', maxNode: 'gloves_2' },
        { id: 'neck',   icon: 'eqneck',   type: 'dmg', base: 5,  masteryNode: 'necklace_1', maxNode: 'necklace_2' },
        { id: 'ring',   icon: 'eqring',   type: 'dmg', base: 5,  masteryNode: 'ring_1',   maxNode: 'ring_2' }
    ];

    let totals = { hpB: 0, hpA: 0, dmgB: 0, dmgA: 0 };
    let sellTableData = [];
    let rangeTableData = [];
    
    let avgTableData = [];
    let avgTotals = { hpB: 0, hpM: 0, hpA: 0, dmgB: 0, dmgM: 0, dmgA: 0 };
    let shieldData = null; 

    // Helper to safely pull multipliers from DATA.JS
    const getVal = (tree, id, fallback) => {
        if (typeof TREES !== 'undefined' && TREES[tree] && TREES[tree].meta && TREES[tree].meta[id] && TREES[tree].meta[id].val !== undefined) {
            return TREES[tree].meta[id].val;
        }
        return fallback;
    };

    const sellTech = getTechLevels('forge', 'sell');
    const sellMult = getVal('forge', 'sell', 1);
    const sellPctBefore = sellTech.before * sellMult;
    const sellPctAfter = sellTech.after * sellMult;

    let sumCurrent = 0; let sumWithNewLevel = 0; let sumFinal = 0;

    items.forEach(item => {
        const tierEl = document.getElementById(`eq-${item.id}-tier`);
        const lvlEl = document.getElementById(`eq-${item.id}-lvl`);
        
        const tier = tierEl ? tierEl.value : 'Primitive';
        const lvlRaw = lvlEl ? lvlEl.value.replace(/\D/g, '') : '1';
        const lvl = parseInt(lvlRaw) || 1;

        const masteryTech = getTechLevels('power', item.masteryNode);
        const masteryB = masteryTech.before * 2;
        const masteryA = masteryTech.after * 2;
        
        // --- APPLY UNIVERSAL ASCENSION MULTIPLIER ---
        let valBefore = calcEqStat(item.base, tier, lvl, masteryB) * ascMult;
        let valAfter = calcEqStat(item.base, tier, lvl, masteryA) * ascMult;

        if (item.id === 'weapon') {
            if (weaponType === 'Melee') {
                valBefore *= 1.6; valAfter *= 1.6;
            } else if (weaponType === 'Melee+Shield') {
                valBefore *= 0.8; valAfter *= 0.8;
                const shieldHpBefore = calcEqStat(40, tier, lvl, masteryB) * 0.5 * ascMult;
                const shieldHpAfter = calcEqStat(40, tier, lvl, masteryA) * 0.5 * ascMult;
                totals.hpB += shieldHpBefore; totals.hpA += shieldHpAfter;
                renderEqLine('eq-res-shield', shieldHpBefore, shieldHpAfter, 'hp');
            }
        }

        if (item.type === 'hp') { totals.hpB += valBefore; totals.hpA += valAfter; } 
        else { totals.dmgB += valBefore; totals.dmgA += valAfter; }
        renderEqLine(`eq-res-${item.id}`, valBefore, valAfter, item.type);

        const maxLvTech = getTechLevels('power', item.maxNode);
        const maxLvBefore = 99 + (maxLvTech.before * 2);
        const maxLvAfter = 99 + (maxLvTech.after * 2);

        const minLvBefore = getEqMinLevel(maxLvBefore);
        const minLvAfter = getEqMinLevel(maxLvAfter);
        rangeTableData.push({ icon: item.icon, minB: minLvBefore, maxB: maxLvBefore, minA: minLvAfter, maxA: maxLvAfter });

        const sellPriceBefore = calcAvgSellPrice(minLvBefore, maxLvBefore, sellPctBefore);
        const sellPriceMiddle = calcAvgSellPrice(minLvAfter, maxLvAfter, sellPctBefore); 
        const sellPriceAfter = calcAvgSellPrice(minLvAfter, maxLvAfter, sellPctAfter);   

        sumCurrent += sellPriceBefore;
        sumWithNewLevel += sellPriceMiddle;
        sumFinal += sellPriceAfter;

        sellTableData.push({ icon: item.icon, before: sellPriceBefore, after: sellPriceAfter });

        const getTrueAverage = (base, tierName, min, max, pct) => {
            let sum = 0;
            for(let i=min; i<=max; i++) sum += calcEqStat(base, tierName, i, pct);
            return sum / (max - min + 1);
        };

        // --- APPLY UNIVERSAL ASCENSION MULTIPLIER TO AVERAGES ---
        let avgB = getTrueAverage(item.base, avgTier, minLvBefore, maxLvBefore, masteryB) * ascMult;
        let avgM = getTrueAverage(item.base, avgTier, minLvAfter, maxLvAfter, masteryB) * ascMult; 
        let avgA = getTrueAverage(item.base, avgTier, minLvAfter, maxLvAfter, masteryA) * ascMult;

        let shieldAvgB = 0, shieldAvgM = 0, shieldAvgA = 0;

        if (item.id === 'weapon') {
            if (avgWeapon === 'Melee') {
                avgB *= 1.6; avgM *= 1.6; avgA *= 1.6;
            } else if (avgWeapon === 'Melee+Shield') {
                avgB *= 0.8; avgM *= 0.8; avgA *= 0.8;
                shieldAvgB = getTrueAverage(40, avgTier, minLvBefore, maxLvBefore, masteryB) * 0.5 * ascMult;
                shieldAvgM = getTrueAverage(40, avgTier, minLvAfter, maxLvAfter, masteryB) * 0.5 * ascMult;
                shieldAvgA = getTrueAverage(40, avgTier, minLvAfter, maxLvAfter, masteryA) * 0.5 * ascMult;
                avgTotals.hpB += shieldAvgB; avgTotals.hpM += shieldAvgM; avgTotals.hpA += shieldAvgA;
                
                shieldData = { id: 'shield', icon: 'eqshield', before: shieldAvgB, after: shieldAvgA, type: 'hp' };
            }
        }

        if (item.type === 'hp') {
            avgTotals.hpB += avgB; avgTotals.hpM += avgM; avgTotals.hpA += avgA;
        } else {
            avgTotals.dmgB += avgB; avgTotals.dmgM += avgM; avgTotals.dmgA += avgA;
        }

        avgTableData.push({ id: item.id, icon: item.icon, before: avgB, after: avgA, type: item.type });
    });

    if (shieldData) {
        const beltIndex = avgTableData.findIndex(d => d.id === 'belt');
        if (beltIndex !== -1) {
            avgTableData.splice(beltIndex + 1, 0, shieldData);
        }
    }

    const shieldLine = document.getElementById('eq-line-shield');
    if (shieldLine) shieldLine.style.display = (weaponType === 'Melee+Shield') ? 'flex' : 'none';

    renderEqLine('eq-res-total-hp', totals.hpB, totals.hpA, 'hp', true);
    renderEqLine('eq-res-total-dmg', totals.dmgB, totals.dmgA, 'dmg', true);

    const headerRangeBtn = document.getElementById('btn-eq-range-info');
    if (headerRangeBtn) {
        headerRangeBtn.style.display = 'inline-flex';
        headerRangeBtn.onclick = function() {
            openEqRangeModal();
        };
    }
    const headerAvgBtn = document.getElementById('btn-eq-avg-info');
    if (headerAvgBtn) {
        headerAvgBtn.style.display = 'inline-flex';
        headerAvgBtn.onclick = function() {
            openEqAvgBreakdownModal(avgTotals.hpB, avgTotals.hpM, avgTotals.hpA, avgTotals.dmgB, avgTotals.dmgM, avgTotals.dmgA);
        };
    }

    const headerSellBtn = document.getElementById('btn-eq-sell-info');
    if (headerSellBtn) {
        headerSellBtn.style.display = 'inline-flex';
        headerSellBtn.onclick = function() {
            const trueAvgCurrent = sumCurrent / 8;
            const trueAvgMiddle = sumWithNewLevel / 8;
            const trueAvgFinal = sumFinal / 8;
            
            openEqSellBreakdownModal(
                trueAvgCurrent, 
                (trueAvgMiddle - trueAvgCurrent), 
                (trueAvgFinal - trueAvgMiddle), 
                trueAvgFinal
            );
        };
    }

   // --- RENDER DYNAMIC TABLES (CARDS 3, 4, 5) ---
    const isMobile = window.innerWidth <= 768; 

    // CARD 3: Range Table
    const rangeContainer = document.getElementById('eq-range-container');
    if (rangeContainer) {
        let html = '';
        rangeTableData.forEach(data => {
            const strB = `Lv ${data.minB}-${data.maxB}`;
            const strA = `Lv ${data.minA}-${data.maxA}`;
            const labelName = data.icon === 'eqneck' ? 'Necklace' : data.icon.replace('eq', '').charAt(0).toUpperCase() + data.icon.replace('eq', '').slice(1);
            
            html += buildEqRowHTML(data.icon, labelName, strB, strA, '', isMobile, false);
        });
        rangeContainer.innerHTML = html;
    }

    // CARD 4: Average Stats Table
    const avgStatsContainer = document.getElementById('eq-avg-stats-container');
    if (avgStatsContainer) {
        let html = '';
        let currentGroup = 'hp';
        avgTableData.forEach(data => {
            if (data.type === 'dmg' && currentGroup === 'hp') {
                html += `<hr class="pet-hr">`;
                currentGroup = 'dmg';
            }
            const fmtB = formatCombatStat(data.before);
            const fmtA = formatCombatStat(data.after);
            const labelName = data.icon === 'eqneck' ? 'Necklace' : data.icon.replace('eq', '').charAt(0).toUpperCase() + data.icon.replace('eq', '').slice(1);
            const innerIcon = `<img src="icons/icon_${data.type}.png" style="width:16px; height:16px; object-fit:contain;">`;
            
            html += buildEqRowHTML(data.icon, labelName, fmtB, fmtA, innerIcon, isMobile, false);
        });
        avgStatsContainer.innerHTML = html;
    }

    // CARD 5: Sell Price Table
    const sellContainer = document.getElementById('eq-sell-container');
    if (sellContainer) {
        let html = '';
        const innerIcon = `<img src="icons/fm_gold.png" style="width:16px; height:16px; object-fit:contain;">`;
        
        // Overall Average Row
        const fmtAvgB = formatEqValue(parseFloat((sumCurrent / 8).toFixed(1)));
        const fmtAvgA = formatEqValue(parseFloat((sumFinal / 8).toFixed(1)));
        html += buildEqRowHTML('', 'Overall Avg', fmtAvgB, fmtAvgA, innerIcon, isMobile, true);

        // Individual Sell Rows
        sellTableData.forEach(data => {
            const fmtB = formatEqValue(parseFloat(data.before.toFixed(1)));
            const fmtA = formatEqValue(parseFloat(data.after.toFixed(1)));
            const labelName = data.icon === 'eqneck' ? 'Necklace' : data.icon.replace('eq', '').charAt(0).toUpperCase() + data.icon.replace('eq', '').slice(1);
            
            html += buildEqRowHTML(data.icon, labelName, fmtB, fmtA, innerIcon, isMobile, false);
        });
        sellContainer.innerHTML = html;
    }
}

document.addEventListener('DOMContentLoaded', () => { 
    updateEquipment(); 
    window.addEventListener('resize', updateEquipment); 
});