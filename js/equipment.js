/**
 * EQUIPMENT.JS
 * Logic for calculating Health, Damage, Range, and Sell Price based on Tech Tiers, levels, and Tech Tree mastery.
 */

const TIER_MULTIPLIERS = {
    "Primitive": 1, "Medieval": Math.pow(4, 1), "Early-Modern": Math.pow(4, 2), "Modern": Math.pow(4, 3),
    "Space": Math.pow(4, 4), "Interstellar": Math.pow(4, 5), "Multiverse": Math.pow(4, 6),
    "Quantum": Math.pow(4, 7), "Underworld": Math.pow(4, 8), "Divine": Math.pow(4, 9),
    "Heroic": Math.pow(4, 10), "Infinite": Math.pow(4, 11), "Eternal": Math.pow(4, 12)
};

const ASC3_EXCLUSIVE_TIERS = ["Heroic", "Infinite", "Eternal"];
const EQ_TIER_SELECT_IDS = [
    "eq-helmet-tier", "eq-armor-tier", "eq-boots-tier", "eq-belt-tier",
    "eq-weapon-tier", "eq-gloves-tier", "eq-neck-tier", "eq-ring-tier",
    "eq-avg-tier"
];

function syncEqAscensionTiers(ascVal) {
    const isAsc3 = ascVal === 3;
    EQ_TIER_SELECT_IDS.forEach(selectId => {
        const sel = document.getElementById(selectId);
        if (!sel) return;

        if (isAsc3) {
            ASC3_EXCLUSIVE_TIERS.forEach(tierName => {
                if (!Array.from(sel.options).some(opt => opt.value === tierName)) {
                    const opt = document.createElement('option');
                    opt.value = tierName;
                    opt.textContent = tierName;
                    sel.appendChild(opt);
                }
            });
        } else {
            if (ASC3_EXCLUSIVE_TIERS.includes(sel.value)) {
                sel.value = "Divine";
            }
            Array.from(sel.options).forEach(opt => {
                if (ASC3_EXCLUSIVE_TIERS.includes(opt.value)) {
                    opt.remove();
                }
            });
        }
    });
}

function formatEqValue(val) {
    if (val === 0) return "0";
    if (val < 1000) return val.toLocaleString('en-US', {maximumFractionDigits: 1});
    if (val < 1000000) return (val / 1000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'k';
    if (val < 1000000000) return (val / 1000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'm';
    if (val < 1000000000000) return (val / 1000000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'b';
    if (val < 1000000000000000) return (val / 1000000000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 't';
    return (val / 1000000000000000).toLocaleString('en-US', {maximumFractionDigits: 1}) + 'q';
}

function formatCombatStat(val) {
    if (val === 0) return "0";
    if (val < 10000) return Math.round(val).toLocaleString('en-US'); 
    if (val < 1000000) return parseFloat((val / 1000).toFixed(1)) + 'k';        
    if (val < 1000000000) return parseFloat((val / 1000000).toFixed(2)) + 'm';   
    if (val < 1000000000000) return parseFloat((val / 1000000000).toFixed(2)) + 'b'; 
    if (val < 1000000000000000) return parseFloat((val / 1000000000000).toFixed(2)) + 't';
    return parseFloat((val / 1000000000000000).toFixed(2)) + 'q';                  
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
    // --- UNIVERSAL ASCENSION MULTIPLIER ---
    const ascEl = document.getElementById('eq-ascension');
    const ascVal = ascEl ? parseInt(ascEl.value) : 0;
    const ASC_MULTS = [1, 50, 2500, 125000];
    const ascMult = ASC_MULTS[ascVal] || 1;

    syncEqAscensionTiers(ascVal);

    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

    const weaponTypeEl = document.getElementById('eq-weapon-type');
    const weaponType = weaponTypeEl ? weaponTypeEl.value : 'Ranged';
    
    const avgTierEl = document.getElementById('eq-avg-tier');
    const avgWeaponEl = document.getElementById('eq-avg-weapon-type');
    const avgTier = avgTierEl ? avgTierEl.value : 'Quantum';
    const avgWeapon = avgWeaponEl ? avgWeaponEl.value : 'Ranged';

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

function syncRefStatsAscensionTiers() {
    const ascEl = document.getElementById('ref-stats-ascension');
    const tierEl = document.getElementById('ref-stats-tier');
    if (!ascEl || !tierEl) return;

    const isAsc3 = parseInt(ascEl.value) === 3;
    const asc3Tiers = ['Heroic', 'Infinite', 'Eternal'];

    if (isAsc3) {
        asc3Tiers.forEach(tierName => {
            if (!Array.from(tierEl.options).some(opt => opt.value === tierName)) {
                const opt = document.createElement('option');
                opt.value = tierName;
                opt.textContent = tierName;
                tierEl.appendChild(opt);
            }
        });
    } else {
        if (asc3Tiers.includes(tierEl.value)) {
            tierEl.value = 'Divine';
        }
        Array.from(tierEl.options).forEach(opt => {
            if (asc3Tiers.includes(opt.value)) {
                opt.remove();
            }
        });
    }
}

function openEqAvgBreakdownModal(hpB, hpM, hpA, dmgB, dmgM, dmgA) {
    const hpFromLevel = hpM - hpB; const hpFromBonus = hpA - hpM;
    const dmgFromLevel = dmgM - dmgB; const dmgFromBonus = dmgA - dmgM;
    const fmt = (val) => typeof formatCombatStat === 'function' ? formatCombatStat(val) : val.toLocaleString();
    const fontStyle = "font-family: 'Fredoka', sans-serif; -webkit-text-stroke: 0px;";

    const savedAscension = (window.refTablePrefs && window.refTablePrefs.statsAscension) !== undefined ? window.refTablePrefs.statsAscension : 0;
    let savedTier = (window.refTablePrefs && window.refTablePrefs.statsTier) ? window.refTablePrefs.statsTier : 'Quantum';
    if (parseInt(savedAscension) !== 3 && ['Heroic', 'Infinite', 'Eternal'].includes(savedTier)) {
        savedTier = 'Divine';
    }
    const savedMastery = (window.refTablePrefs && window.refTablePrefs.statsMastery) ? window.refTablePrefs.statsMastery : 0;
    
    const isSel = (val) => val === savedTier ? 'selected' : '';
    const isAscSel = (val) => val == savedAscension ? 'selected' : '';

    const asc3OptionsHtml = parseInt(savedAscension) === 3 ? `
        <option value="Heroic" ${isSel('Heroic')}>Heroic</option>
        <option value="Infinite" ${isSel('Infinite')}>Infinite</option>
        <option value="Eternal" ${isSel('Eternal')}>Eternal</option>
    ` : '';

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
                <select id="ref-stats-ascension" onchange="syncRefStatsAscensionTiers(); updateStatsRefTable()" style="width: 70px; height: 32px; border: 2px solid #000000; border-radius: 6px; font-family: 'Fredoka', sans-serif; font-weight: 600; outline: none; text-align: center; text-align-last: center; -webkit-text-stroke: 0px transparent !important; background-color: #ffffff;">
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
                    ${asc3OptionsHtml}
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
    setTimeout(() => {
        syncRefStatsAscensionTiers();
        updateStatsRefTable();
    }, 50);
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