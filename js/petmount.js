/**
 * PETMOUNT.JS
 * Pet and Mount Calculator Logic
 */

// ==========================================
// 1. INITIALIZATION & DROPDOWNS
// ==========================================

function initPetMount() {
    const rarities = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];

    for (let i = 1; i <= 3; i++) {
        const raritySel = document.getElementById(`pet-${i}-rarity`);
        if (raritySel) {
            raritySel.innerHTML = "";
            rarities.forEach(r => raritySel.add(new Option(r, r)));
            raritySel.value = "Common";
        }
        const lvlInput = document.getElementById(`pet-${i}-lvl`);
        const expInput = document.getElementById(`pet-${i}-exp`);
        if (lvlInput) lvlInput.value = 1;
        if (expInput) expInput.value = 0;
        updatePetNameOptions(i);
    }

    const mergeTypes = ['target', 'fodder'];
    mergeTypes.forEach(type => {
        const raritySel = document.getElementById(`merge-${type}-rarity`);
        if (raritySel) {
            raritySel.innerHTML = "";
            if (type === 'fodder') raritySel.add(new Option("None", "None"));
            rarities.forEach(r => raritySel.add(new Option(r, r)));
            raritySel.value = "Common";
        }
        const lvlInput = document.getElementById(`merge-${type}-lvl`);
        const expInput = document.getElementById(`merge-${type}-exp`);
        if (lvlInput) lvlInput.value = 1;
        if (expInput) expInput.value = 0;

        updateMergeNameOptions(type);
    });
}

function updatePetNameOptions(index) {
    const raritySel = document.getElementById(`pet-${index}-rarity`);
    const nameSel = document.getElementById(`pet-${index}-id`);
    if (!raritySel || !nameSel) return;

    const selectedRarity = raritySel.value;
    const data = PET_DATA[selectedRarity];
    const currentName = nameSel.value;
    nameSel.innerHTML = ""; 

    if (data) {
        Object.keys(data).forEach(type => {
            if (data[type].length > 0) {
                const group = document.createElement('optgroup');
                group.label = type;
                data[type].forEach(petName => {
                    group.appendChild(new Option(petName, petName));
                });
                nameSel.add(group);
            }
        });
    }

    let options = Array.from(nameSel.options);
    if (options.some(o => o.value === currentName)) {
        nameSel.value = currentName;
    } else if (options.length > 0) {
        nameSel.selectedIndex = 0; 
    }
    updatePetMount();
}

function updateMergeNameOptions(type) {
    const raritySel = document.getElementById(`merge-${type}-rarity`);
    const nameSel = document.getElementById(`merge-${type}-id`);
    if (!raritySel || !nameSel) return;

    const selectedRarity = raritySel.value;
    const currentName = nameSel.value;
    nameSel.innerHTML = ""; 

    if (selectedRarity === "None") {
        nameSel.disabled = true;
        updateMergeResult();
        return;
    } else {
        nameSel.disabled = false;
    }

    const data = PET_DATA[selectedRarity];

    if (data) {
        Object.keys(data).forEach(cat => {
            if (data[cat].length > 0) {
                const group = document.createElement('optgroup');
                group.label = cat;
                data[cat].forEach(petName => {
                    group.appendChild(new Option(petName, petName));
                });
                nameSel.add(group);
            }
        });
    }

    let options = Array.from(nameSel.options);
    if (options.some(o => o.value === currentName)) {
        nameSel.value = currentName;
    } else if (options.length > 0) {
        nameSel.selectedIndex = 0; 
    }
    updateMergeResult();
}

// ==========================================
// 2. HELPERS: MATH & FORMATTING
// ==========================================

function formatPetStats(val) {
    if (val < 10000) return val.toLocaleString('en-US'); 
    if (val >= 1000000000000) return (val / 1000000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 't';
    if (val >= 1000000000) return (val / 1000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'b';
    if (val >= 1000000) return (val / 1000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'm'; 
    return (val / 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'k'; 
}

function formatMountStats(val) {
    if (val < 10000) return val.toLocaleString('en-US'); 
    if (val >= 1000000000000) return (val / 1000000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 't';
    if (val >= 1000000000) return (val / 1000000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'b';
    if (val >= 1000000) return (val / 1000000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'm'; 
    return (val / 1000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'k'; 
}

function formatPetExp(val) {
    if (val < 1000) return Math.round(val).toString();
    if (val < 1000000) return (val / 1000).toFixed(1) + 'k';
    return (val / 1000000).toFixed(1) + 'm';
}

function generateStatString(v1, v2) {
    const s1 = formatPetStats(v1);
    const s2 = formatPetStats(v2);
    if (s1 === s2) return `<span>${s1}</span>`;
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        return `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="margin-bottom: 2px;">${s1}</span>
                <div style="display:flex; align-items:center;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.9em;">➜</span>
                    <span style="color: #198754; font-weight: 600;">${s2}</span>
                </div>
            </div>`;
    }
    
    return `<span>${s1}</span> <span class="calc-arrow">➜</span> <span style="color: #198754; font-weight: 600;">${s2}</span>`;
}

function generateStatStringWithIcons(v1, v2, iconPath, forceSingleRow = false) {
    const s1 = formatPetStats(v1);
    const s2 = formatPetStats(v2);
    const iconHtml = `<img src="${iconPath}" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;">`;
    
    if (s1 === s2) return `<div style="display:flex; align-items:center; gap:4px; justify-content: flex-end;">${iconHtml}<span>${s1}</span></div>`;
    
    const isMobile = window.innerWidth <= 768 && !forceSingleRow;
    if (isMobile) {
        return `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <div style="display:flex; align-items:center; gap:4px; margin-bottom: 2px;">${iconHtml}<span>${s1}</span></div>
                <div style="display:flex; align-items:center; gap:4px; color: #198754;">
                    <span class="calc-arrow">➜</span>${iconHtml}<span style="font-weight: 600;">${s2}</span>
                </div>
            </div>`;
    }
    
    return `<div style="display:flex; align-items:center; gap:4px; justify-content: flex-end;">
                ${iconHtml}<span>${s1}</span> 
                <span class="calc-arrow" style="margin: 0 4px;">➜</span> 
                <div style="display:flex; align-items:center; gap:4px; color: #198754;">${iconHtml}<span style="font-weight: 600;">${s2}</span></div>
            </div>`;
}

function generateMountStatStringWithIcons(v1, v2, iconPath, forceSingleRow = false) {
    const s1 = formatMountStats(v1);
    const s2 = formatMountStats(v2);
    const iconHtml = `<img src="${iconPath}" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;">`;
    
    if (s1 === s2) return `<div style="display:flex; align-items:center; gap:4px; justify-content: flex-end;">${iconHtml}<span>${s1}</span></div>`;
    
    const isMobile = window.innerWidth <= 768 && !forceSingleRow;
    if (isMobile) {
        return `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <div style="display:flex; align-items:center; gap:4px; margin-bottom: 2px;">${iconHtml}<span>${s1}</span></div>
                <div style="display:flex; align-items:center; gap:4px; color: #198754;">
                    <span class="calc-arrow">➜</span>${iconHtml}<span style="font-weight: 600;">${s2}</span>
                </div>
            </div>`;
    }
    
    return `<div style="display:flex; align-items:center; gap:4px; justify-content: flex-end;">
                ${iconHtml}<span>${s1}</span> 
                <span class="calc-arrow" style="margin: 0 4px;">➜</span> 
                <div style="display:flex; align-items:center; gap:4px; color: #198754;">${iconHtml}<span style="font-weight: 600;">${s2}</span></div>
            </div>`;
}

function generateBeforeAfterStrInline(val1, val2) {
    if (val1 === val2) return `<div style="display:flex; justify-content: flex-end;"><span>${val1}</span></div>`;
    
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        return `
            <div style="display: flex; flex-direction: column; align-items: flex-end;">
                <span style="margin-bottom: 2px;">${val1}</span>
                <div style="display:flex; align-items:center;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.9em;">➜</span>
                    <span style="color: #198754; font-weight: 600;">${val2}</span>
                </div>
            </div>`;
    }

    return `<div style="display:flex; align-items:center; justify-content: flex-end;"><span>${val1}</span> <span class="calc-arrow" style="margin: 0 4px; font-size: 0.9em;">➜</span> <span style="color: #198754; font-weight: 600;">${val2}</span></div>`;
}

function getPetMasteryMult(levels, type) {
    let total = 0;
    for(let t = 1; t <= 5; t++) {
        total += (levels[`spt_T${t}_pet_${type}`] || 0);
    }
    return 1 + (total * 0.02); 
}

function getMountMasteryMult(levels, type) {
    let total = 0;
    for(let t = 1; t <= 5; t++) {
        total += (levels[`power_T${t}_mount_${type}`] || 0);
    }
    return 1 + (total * 0.02); 
}

function getRecursiveExp(rarity, level) {
    if (!PET_EXP_TABLE[rarity]) return 0;
    let total = 0;
    for (let l = 1; l < level; l++) {
        total += PET_EXP_TABLE[rarity][l];
    }
    return total;
}

function getMaxPossibleExp(rarity) {
    if (!PET_EXP_TABLE[rarity]) return 0;
    return PET_EXP_TABLE[rarity].reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
}

function getRecursiveMountExp(rarity, level) {
    if (!MOUNT_EXP_TABLE[rarity]) return 0;
    let total = 0;
    for (let l = 1; l < level; l++) {
        total += MOUNT_EXP_TABLE[rarity][l];
    }
    return total;
}

function getMaxPossibleMountExp(rarity) {
    if (!MOUNT_EXP_TABLE[rarity]) return 0;
    return MOUNT_EXP_TABLE[rarity].reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
}

const getIntValSafe = (id, defaultVal = 0) => {
    const el = document.getElementById(id);
    if (!el || !el.value) return defaultVal;
    const parsed = parseInt(el.value);
    return isNaN(parsed) ? defaultVal : parsed;
};

const getStrValSafe = (id, defaultVal = "Common") => {
    const el = document.getElementById(id);
    return el && el.value ? el.value : defaultVal;
};

// ==========================================
// 3. VALIDATION
// ==========================================

function clampLevelExp(rarity, lvlInput, expInput, expTable) {
    if (!lvlInput || !expInput) return;

    if (rarity === "None") {
        lvlInput.disabled = true;
        expInput.disabled = true;
        lvlInput.value = "";
        expInput.value = "";
        return;
    } else {
        lvlInput.disabled = false;
        expInput.disabled = false;
    }

    let lvl = parseInt(lvlInput.value);
    if (isNaN(lvl) || lvl < 1) lvl = 1;
    if (lvl > 100) lvl = 100;
    lvlInput.value = lvl;

    let maxExp = 0;
    if (expTable[rarity]) {
        if (lvl >= 1 && lvl <= 99) maxExp = expTable[rarity][lvl];
        else if (lvl >= 100) maxExp = "Max";
    }

    let exp = parseInt(expInput.value);
    if (isNaN(exp) || exp < 0) exp = 0;
    
    if (maxExp === "Max") {
        exp = 0; 
    } else {
        const limit = maxExp - 1;
        if (exp > limit) exp = limit;
    }
    expInput.value = exp; 
}

function validatePetInputs() {
    for (let i = 1; i <= 3; i++) {
        const raritySel = document.getElementById(`pet-${i}-rarity`);
        if (!raritySel) continue;
        clampLevelExp(
            raritySel.value, 
            document.getElementById(`pet-${i}-lvl`), 
            document.getElementById(`pet-${i}-exp`), 
            PET_EXP_TABLE
        );
    }
    updatePetMount();
}

function validateMergeInputs() {
    ['target', 'fodder'].forEach(type => {
        const raritySel = document.getElementById(`merge-${type}-rarity`);
        if (!raritySel) return;
        clampLevelExp(
            raritySel.value, 
            document.getElementById(`merge-${type}-lvl`), 
            document.getElementById(`merge-${type}-exp`), 
            PET_EXP_TABLE
        );
    });
    updateMergeResult();
}

function validateMountInputs() {
    ['target', 'fodder'].forEach(type => {
        const raritySel = document.getElementById(`mount-${type}-rarity`);
        if (!raritySel) return;
        clampLevelExp(
            raritySel.value, 
            document.getElementById(`mount-${type}-lvl`), 
            document.getElementById(`mount-${type}-exp`), 
            MOUNT_EXP_TABLE
        );
    });
    updateMountMergeResult();
}

function updatePetMountExpCap() {
    const lvEl = document.getElementById('pet-mount-summon-lvl');
    const expEl = document.getElementById('pet-mount-summon-exp');
    const maxEl = document.getElementById('pet-mount-summon-max');
    
    if (lvEl && maxEl && expEl) {
        let lv = parseInt(lvEl.value) || 1;
        if (lv < 1) lv = 1;
        if (lv > 100) lv = 50;
        
        let maxExp = 2;
        if (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[lv]) {
            maxExp = MOUNT_LEVEL_DATA[lv][0];
        }
        
        if (maxExp === "MAX" || maxExp === 0) {
            maxEl.innerText = "MAX";
            expEl.value = 0;
            expEl.disabled = true;
        } else {
            maxEl.innerText = maxExp;
            expEl.disabled = false;
            let currentExp = parseInt(expEl.value) || 0;
            if (currentExp >= maxExp) expEl.value = maxExp - 1;
        }
    }
}

// ==========================================
// 4. CORE CALCULATORS
// ==========================================

function updatePetMount() {
    let curMultHP = 1, projMultHP = 1;
    let curMultDmg = 1, projMultDmg = 1;

    if (typeof setupLevels !== 'undefined') {
        curMultHP = getPetMasteryMult(setupLevels, 'hp');
        curMultDmg = getPetMasteryMult(setupLevels, 'dmg');
    }
    
    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            projMultHP = getPetMasteryMult(state.levels, 'hp');
            projMultDmg = getPetMasteryMult(state.levels, 'dmg');
        } else { 
            projMultHP = curMultHP; projMultDmg = curMultDmg; 
        }
    } else { 
        projMultHP = curMultHP; projMultDmg = curMultDmg; 
    }

    // --- NEW ASCENSION MULTIPLIER ---
    const ascInput = document.getElementById('pet-ascension');
    const ascLvl = ascInput ? parseInt(ascInput.value) || 0 : 0;
    const ascMult = Math.pow(50, ascLvl);

    let totalHpCur = 0, totalHpProj = 0;
    let totalDmgCur = 0, totalDmgProj = 0;

    for (let i = 1; i <= 3; i++) {
        const raritySel = document.getElementById(`pet-${i}-rarity`);
        const nameSel = document.getElementById(`pet-${i}-id`);
        const lvlInput = document.getElementById(`pet-${i}-lvl`);
        const expInput = document.getElementById(`pet-${i}-exp`);
        const maxSpan = document.getElementById(`pet-${i}-max`);
        
        const hpRes = document.getElementById(`pet-${i}-stat-hp`);
        const dmgRes = document.getElementById(`pet-${i}-stat-dmg`);
        
        const barFill = document.getElementById(`pet-${i}-bar-fill`);
        const barText = document.getElementById(`pet-${i}-bar-text`);

        if (!raritySel || !lvlInput || !maxSpan || !expInput) continue;

        const rarity = raritySel.value;
        const name = nameSel.value;

        let lvl = parseInt(lvlInput.value);
        if (isNaN(lvl) || lvl < 1) lvl = 1; 
        if (lvl > 100) lvl = 100;

        let exp = parseInt(expInput.value);
        if (isNaN(exp) || exp < 0) exp = 0;

        let maxExpForLvl = 0;
        if (PET_EXP_TABLE[rarity]) {
            if (lvl >= 1 && lvl <= 99) maxExpForLvl = PET_EXP_TABLE[rarity][lvl];
            else if (lvl >= 100) maxExpForLvl = "Max";
        }
        maxSpan.innerText = maxExpForLvl === "Max" ? "Max" : maxExpForLvl.toLocaleString();

        if (barFill && barText) {
            const maxPossible = getMaxPossibleExp(rarity);
            
            if (maxExpForLvl === "Max" || maxPossible === 0) {
                barFill.style.width = "100%";
                barText.innerText = `${formatPetExp(maxPossible)} / ${formatPetExp(maxPossible)} xp (100%)`;
            } else {
                const baseTotal = getRecursiveExp(rarity, lvl);
                const absoluteTotal = baseTotal + exp;
                
                let pct = 0;
                if (maxPossible > 0) pct = (absoluteTotal / maxPossible) * 100;
                if (pct > 100) pct = 100;
                
                barFill.style.width = `${pct}%`;
                barText.innerText = `${formatPetExp(absoluteTotal)} / ${formatPetExp(maxPossible)} xp (${pct.toFixed(1)}%)`;
            }
        }

        if (hpRes && dmgRes) {
            const typeStr = PET_TYPE_MAP[name] || "Hybrid";
            const base = typeof PET_BASE_STATS !== 'undefined' ? PET_BASE_STATS[rarity] : { hp: 10, dmg: 10 };
            const typeMult = typeof PET_TYPE_MULT !== 'undefined' ? (PET_TYPE_MULT[typeStr] || { dmg: 1, hp: 1 }) : { dmg: 1, hp: 1 };
            
            if (base && lvl > 0) {
                const levelMult = Math.pow(1.01, lvl - 1); 
                
                const baseRawHp = (base.hp * typeMult.hp) * levelMult;
                const baseRawDmg = (base.dmg * typeMult.dmg) * levelMult;

                const finalHpCur = Math.round(baseRawHp * ascMult * curMultHP);
                const finalHpProj = Math.round(baseRawHp * ascMult * projMultHP);
                const finalDmgCur = Math.round(baseRawDmg * ascMult * curMultDmg);
                const finalDmgProj = Math.round(baseRawDmg * ascMult * projMultDmg);

                totalHpCur += finalHpCur;
                totalHpProj += finalHpProj;
                totalDmgCur += finalDmgCur;
                totalDmgProj += finalDmgProj;

                hpRes.innerHTML = generateStatString(finalHpCur, finalHpProj);
                dmgRes.innerHTML = generateStatString(finalDmgCur, finalDmgProj);
            } else {
                hpRes.innerText = "-";
                dmgRes.innerText = "-";
            }
        }
    }

    const totalHpEl = document.getElementById('pet-total-hp');
    const totalDmgEl = document.getElementById('pet-total-dmg');
    if (totalHpEl && totalDmgEl) {
        if (totalHpCur > 0 || totalDmgCur > 0) {
            totalHpEl.innerHTML = generateStatString(totalHpCur, totalHpProj);
            totalDmgEl.innerHTML = generateStatString(totalDmgCur, totalDmgProj);
        } else {
            totalHpEl.innerText = "-";
            totalDmgEl.innerText = "-";
        }
    }
}

function updateMergeResult() {
    const types = ['target', 'fodder'];
    types.forEach(type => {
        const raritySel = document.getElementById(`merge-${type}-rarity`);
        const lvlInput = document.getElementById(`merge-${type}-lvl`);
        const maxSpan = document.getElementById(`merge-${type}-max`);

        if (!raritySel || !lvlInput || !maxSpan) return;

        const rarity = raritySel.value;
        if (rarity === "None") {
            maxSpan.innerText = "0";
            return;
        }

        let lvl = parseInt(lvlInput.value);
        if (isNaN(lvl) || lvl < 1) lvl = 1;
        if (lvl > 100) lvl = 100;

        let maxExp = 0;
        if (PET_EXP_TABLE[rarity]) {
            if (lvl >= 1 && lvl <= 99) maxExp = PET_EXP_TABLE[rarity][lvl];
            else if (lvl >= 100) maxExp = "Max";
        }
        maxSpan.innerText = maxExp === "Max" ? "Max" : maxExp.toLocaleString();
    });

    const tRarity = getStrValSafe('merge-target-rarity', "Common");
    const tName = getStrValSafe('merge-target-id', "");
    const tLvl = getIntValSafe('merge-target-lvl', 1);
    const tExp = getIntValSafe('merge-target-exp', 0);

    const fRarity = getStrValSafe('merge-fodder-rarity', "None");
    const fLvl = getIntValSafe('merge-fodder-lvl', 1);
    const fExp = getIntValSafe('merge-fodder-exp', 0);

    const bulk = {
        "Common": getIntValSafe('bulk-common', 0),
        "Rare": getIntValSafe('bulk-rare', 0),
        "Epic": getIntValSafe('bulk-epic', 0),
        "Legendary": getIntValSafe('bulk-legendary', 0),
        "Ultimate": getIntValSafe('bulk-ultimate', 0),
        "Mythic": getIntValSafe('bulk-mythic', 0)
    };

    const tRecursive = getRecursiveExp(tRarity, tLvl);
    const tTotal = tRecursive + tExp;

    let fTotal = 0;
    let fBaseBonus = 0;
    if (fRarity !== "None") {
        fTotal = getRecursiveExp(fRarity, fLvl) + fExp;
        fBaseBonus = FODDER_XP[fRarity] || 0;
    }

    let bulkBonus = 0;
    Object.keys(bulk).forEach(r => {
        bulkBonus += bulk[r] * (FODDER_XP[r] || 0);
    });

    const grandTotal = tTotal + fTotal + fBaseBonus + bulkBonus;

    const expTable = PET_EXP_TABLE[tRarity];
    const maxPossible = getMaxPossibleExp(tRarity);

    let newLvl = 1;
    let newExp = 0;

    if (grandTotal >= maxPossible) {
        newLvl = 100;
        newExp = 0;
    } else if (expTable) {
        let cum = 0;
        for (let l = 1; l < 100; l++) {
            let needed = typeof expTable[l] === 'number' ? expTable[l] : 0;
            if (grandTotal < (cum + needed)) {
                newLvl = l;
                newExp = grandTotal - cum;
                break;
            }
            cum += needed;
            if (l === 99) {
                newLvl = 100;
                newExp = 0;
            }
        }
    }

    const typeStr = PET_TYPE_MAP[tName] || "Hybrid";
    const base = typeof PET_BASE_STATS !== 'undefined' ? PET_BASE_STATS[tRarity] : { hp: 10, dmg: 10 };
    const typeMult = typeof PET_TYPE_MULT !== 'undefined' ? (PET_TYPE_MULT[typeStr] || { dmg: 1, hp: 1 }) : { dmg: 1, hp: 1 };

    const ascInput = document.getElementById('pet-ascension');
    const ascLvl = ascInput ? parseInt(ascInput.value) || 0 : 0;
    const ascMult = Math.pow(50, ascLvl);

    let curMultHP = 1, projMultHP = 1;
    let curMultDmg = 1, projMultDmg = 1;

    if (typeof setupLevels !== 'undefined') {
        curMultHP = getPetMasteryMult(setupLevels, 'hp');
        curMultDmg = getPetMasteryMult(setupLevels, 'dmg');
    }

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            projMultHP = getPetMasteryMult(state.levels, 'hp');
            projMultDmg = getPetMasteryMult(state.levels, 'dmg');
        } else {
            projMultHP = curMultHP; projMultDmg = curMultDmg;
        }
    } else {
        projMultHP = curMultHP; projMultDmg = curMultDmg;
    }

    let finalHp = 0, finalDmg = 0;
    let finalHpProj = 0, finalDmgProj = 0;

    if (base && newLvl > 0) {
        const levelMult = Math.pow(1.01, newLvl - 1); 
        
        const baseRawHp = (base.hp * typeMult.hp) * levelMult;
        const baseRawDmg = (base.dmg * typeMult.dmg) * levelMult;

        finalHp = Math.round(baseRawHp * ascMult * curMultHP);
        finalDmg = Math.round(baseRawDmg * ascMult * curMultDmg);

        finalHpProj = Math.round(baseRawHp * ascMult * projMultHP);
        finalDmgProj = Math.round(baseRawDmg * ascMult * projMultDmg);
    }

    const resName = document.getElementById('merge-res-name');
    const resHp = document.getElementById('merge-res-hp');
    const resDmg = document.getElementById('merge-res-dmg');
    const barFill = document.getElementById('merge-res-bar-fill');
    const barText = document.getElementById('merge-res-bar-text');
    
    const curBarFill = document.getElementById('merge-res-current-bar-fill');
    const curBarText = document.getElementById('merge-res-current-bar-text');

    if(resName && tName !== "") {
        const RARITY_COLORS = {"Common": "#f1f1f1", "Rare": "#5dd9ff", "Epic": "#5dfe8a", "Legendary": "#fdff5e", "Ultimate": "#ff5c5d", "Mythic": "#d55cff"};
        const petBgNode = resName.closest('div[style*="border-radius"]') || resName.parentElement.parentElement;
        if (petBgNode) {
            petBgNode.style.backgroundColor = RARITY_COLORS[tRarity] || "#f1f1f1";
            petBgNode.style.border = "none";
        }
        resName.innerText = `${tName} Lv ${newLvl}`;
        resHp.innerHTML = generateStatStringWithIcons(finalHp, finalHpProj, 'icons/icon_hp.png', true);
        resDmg.innerHTML = generateStatStringWithIcons(finalDmg, finalDmgProj, 'icons/icon_dmg.png', true);
       
        // MAX EXP BAR
        if (barFill && barText) {
            if (newLvl >= 100 || maxPossible === 0) {
                barFill.style.width = "100%";
                barText.innerText = `${formatPetExp(maxPossible)} / ${formatPetExp(maxPossible)} xp (100%)`;
            } else {
                let pct = 0;
                if (maxPossible > 0) pct = (grandTotal / maxPossible) * 100;
                if (pct > 100) pct = 100;
               
                barFill.style.width = `${pct}%`;
                barText.innerText = `${formatPetExp(Math.round(grandTotal))} / ${formatPetExp(maxPossible)} xp (${pct.toFixed(1)}%)`;
            }
        }
        
        // CURRENT EXP BAR
        if (curBarFill && curBarText) {
            if (newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number') {
                curBarFill.style.width = "100%";
                curBarText.innerText = "MAX (100%)";
            } else {
                let maxForLevel = expTable[newLvl];
                let pct = (newExp / maxForLevel) * 100;
                if (pct > 100) pct = 100;
                
                curBarFill.style.width = `${pct}%`;
                curBarText.innerText = `${formatPetExp(Math.round(newExp))} / ${formatPetExp(maxForLevel)} xp (${pct.toFixed(1)}%)`;
            }
        }
    }
}

function updateMountMergeResult() {
    updatePetMountExpCap();

    const types = ['target', 'fodder'];
    types.forEach(type => {
        const raritySel = document.getElementById(`mount-${type}-rarity`);
        const lvlInput = document.getElementById(`mount-${type}-lvl`);
        const maxSpan = document.getElementById(`mount-${type}-max`);
       
        if (!raritySel || !lvlInput || !maxSpan) return;

        const rarity = raritySel.value;
        if (rarity === "None") {
            maxSpan.innerText = "0";
            return;
        }

        let lvl = parseInt(lvlInput.value);
        if (isNaN(lvl) || lvl < 1) lvl = 1;
        if (lvl > 100) lvl = 100;

        let maxExp = 0;
        if (MOUNT_EXP_TABLE[rarity]) {
            if (lvl >= 1 && lvl <= 99) maxExp = MOUNT_EXP_TABLE[rarity][lvl];
            else if (lvl >= 100) maxExp = "Max";
        }
        maxSpan.innerText = maxExp === "Max" ? "Max" : maxExp.toLocaleString();
    });

    const tRarity = getStrValSafe('mount-target-rarity', "Common");
    const tLvl = getIntValSafe('mount-target-lvl', 1);
    const tExp = getIntValSafe('mount-target-exp', 0);
   
    const fRarity = getStrValSafe('mount-fodder-rarity', "None");
    const fLvl = getIntValSafe('mount-fodder-lvl', 1);
    const fExp = getIntValSafe('mount-fodder-exp', 0);

    const bulk = {
        "Common": getIntValSafe('bulk-mount-common', 0),
        "Rare": getIntValSafe('bulk-mount-rare', 0),
        "Epic": getIntValSafe('bulk-mount-epic', 0),
        "Legendary": getIntValSafe('bulk-mount-legendary', 0),
        "Ultimate": getIntValSafe('bulk-mount-ultimate', 0),
        "Mythic": getIntValSafe('bulk-mount-mythic', 0)
    };

    const summonKeyEl = document.getElementById('pet-mount-key');
    const summonKey = summonKeyEl && summonKeyEl.value ? parseFloat(summonKeyEl.value.replace(/,/g, '')) || 0 : 0;
    const summonLv = getIntValSafe('pet-mount-summon-lvl', 1);
    const summonExp = getIntValSafe('pet-mount-summon-exp', 0);

    const tRecursive = getRecursiveMountExp(tRarity, tLvl);
    const tTotal = tRecursive + tExp;

    let fTotal = 0;
    let fBaseBonus = 0;
    if (fRarity !== "None") {
        fTotal = getRecursiveMountExp(fRarity, fLvl) + fExp;
        fBaseBonus = MOUNT_FODDER_XP[fRarity] || 0;
    }

    let bulkBonus = 0;
    Object.keys(bulk).forEach(r => {
        bulkBonus += bulk[r] * (MOUNT_FODDER_XP[r] || 0);
    });

    let mountsPulled = [0, 0, 0, 0, 0, 0];
    let mountsPulledBefore = [0, 0, 0, 0, 0, 0];
    let totalMountsYielded = 0;
    let summonBonus = 0;

    let totalMountsYieldedBefore = 0;
    let summonBonusBefore = 0;
   
    let costBefore = 0, chanceBefore = 0;
    let costAfter = 0, chanceAfter = 0;

    if (typeof setupLevels !== 'undefined') {
        for(let t=1; t<=5; t++) {
            costBefore += (setupLevels[`power_T${t}_mount_cost`] || 0);
            chanceBefore += (setupLevels[`power_T${t}_mount_chance`] || 0);
        }
    }

    costAfter = costBefore;
    chanceAfter = chanceBefore;

    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            costAfter = 0;
            chanceAfter = 0;
            for(let t=1; t<=5; t++) {
                costAfter += (state.levels[`power_T${t}_mount_cost`] || 0);
                chanceAfter += (state.levels[`power_T${t}_mount_chance`] || 0);
            }
        }
    }

    const mCostBefore = Math.max(1, Math.ceil(50 * (1 - (costBefore / 100))));
    const mCostAfter = Math.max(1, Math.ceil(50 * (1 - (costAfter / 100))));
    const extraChanceB = (chanceBefore * 2) / 100;
    const extraChanceA = (chanceAfter * 2) / 100;

    if (summonKey > 0 && typeof calcWarMountPulls === 'function') {
        const rarities = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];

        const mPullsBefore = Math.floor(summonKey / mCostBefore);
        totalMountsYieldedBefore = mPullsBefore * (1 + extraChanceB);
        mountsPulledBefore = calcWarMountPulls(summonLv, summonExp, totalMountsYieldedBefore);
        for(let i=0; i<6; i++) {
            summonBonusBefore += mountsPulledBefore[i] * (MOUNT_FODDER_XP[rarities[i]] || 0);
        }

        const mPullsAfter = Math.floor(summonKey / mCostAfter);
        totalMountsYielded = mPullsAfter * (1 + extraChanceA);
        mountsPulled = calcWarMountPulls(summonLv, summonExp, totalMountsYielded);
        for(let i=0; i<6; i++) {
            summonBonus += mountsPulled[i] * (MOUNT_FODDER_XP[rarities[i]] || 0);
        }
    }

    const grandTotal = tTotal + fTotal + fBaseBonus + bulkBonus + summonBonus;
    const grandTotalBefore = tTotal + fTotal + fBaseBonus + bulkBonus + summonBonusBefore;

    const expTable = MOUNT_EXP_TABLE[tRarity];
    const maxPossible = getMaxPossibleMountExp(tRarity);
   
    let newLvl = 1; let newExp = 0;
    if (grandTotal >= maxPossible) {
        newLvl = 100; newExp = 0;
    } else if (expTable) {
        let cum = 0;
        for (let l = 1; l < 100; l++) {
            let needed = typeof expTable[l] === 'number' ? expTable[l] : 0;
            if (grandTotal < (cum + needed)) {
                newLvl = l; newExp = grandTotal - cum; break;
            }
            cum += needed;
            if (l === 99) { newLvl = 100; newExp = 0; }
        }
    }

    let newLvlBefore = 1; let newExpBefore = 0;
    if (grandTotalBefore >= maxPossible) {
        newLvlBefore = 100; newExpBefore = 0;
    } else if (expTable) {
        let cum = 0;
        for (let l = 1; l < 100; l++) {
            let needed = typeof expTable[l] === 'number' ? expTable[l] : 0;
            if (grandTotalBefore < (cum + needed)) {
                newLvlBefore = l; newExpBefore = grandTotalBefore - cum; break;
            }
            cum += needed;
            if (l === 99) { newLvlBefore = 100; newExpBefore = 0; }
        }
    }

    const ascInput = document.getElementById('mount-ascension');
    const ascLvl = ascInput ? parseInt(ascInput.value) || 0 : 0;
    const ascMult = Math.pow(50, ascLvl);

    let curMultHP = 1, projMultHP = 1;
    let curMultDmg = 1, projMultDmg = 1;

    if (typeof setupLevels !== 'undefined') {
        curMultHP = getMountMasteryMult(setupLevels, 'hp');
        curMultDmg = getMountMasteryMult(setupLevels, 'dmg');
    }
   
    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) {
            projMultHP = getMountMasteryMult(state.levels, 'hp');
            projMultDmg = getMountMasteryMult(state.levels, 'dmg');
        } else {
            projMultHP = curMultHP; projMultDmg = curMultDmg;
        }
    } else {
        projMultHP = curMultHP; projMultDmg = curMultDmg;
    }

    let finalHp = 0, finalDmg = 0;
    let finalHpProj = 0, finalDmgProj = 0;

    const baseMount = typeof MOUNT_BASE_STATS !== 'undefined' ? MOUNT_BASE_STATS[tRarity] : null;

    if (baseMount && newLvlBefore > 0) {
        const levelMultB = Math.pow(1.006, newLvlBefore - 1);
        const baseRawHpB = baseMount.hp * levelMultB;
        const baseRawDmgB = baseMount.dmg * levelMultB;

        finalHp = Math.round(baseRawHpB * ascMult * curMultHP);
        finalDmg = Math.round(baseRawDmgB * ascMult * curMultDmg);
    }

    if (baseMount && newLvl > 0) {
        const levelMultA = Math.pow(1.006, newLvl - 1);
        const baseRawHpA = baseMount.hp * levelMultA;
        const baseRawDmgA = baseMount.dmg * levelMultA;

        finalHpProj = Math.round(baseRawHpA * ascMult * projMultHP);
        finalDmgProj = Math.round(baseRawDmgA * ascMult * projMultDmg);
    }

    const resName = document.getElementById('mount-merge-res-name');
    const resHp = document.getElementById('mount-merge-res-hp');
    const resDmg = document.getElementById('mount-merge-res-dmg');
    const resNext = document.getElementById('mount-merge-res-next');
    const resTotal = document.getElementById('mount-merge-res-total');
    const resMax = document.getElementById('mount-merge-res-max');

    if(resName && tRarity !== "None") {
        const RARITY_COLORS = {"Common": "#f1f1f1", "Rare": "#5dd9ff", "Epic": "#5dfe8a", "Legendary": "#fdff5e", "Ultimate": "#ff5c5d", "Mythic": "#d55cff"};
        const mountBgNode = resName.closest('div[style*="border-radius"]') || resName.parentElement.parentElement;
        if (mountBgNode) {
            mountBgNode.style.backgroundColor = RARITY_COLORS[tRarity] || "#f1f1f1";
            mountBgNode.style.border = "none";
        }

        if (newLvlBefore === newLvl) {
            resName.innerText = `${tRarity} Lv ${newLvl}`;
        } else {
            resName.innerHTML = `${tRarity} Lv ${newLvlBefore} <span class="calc-arrow" style="margin: 0 4px; font-size: 0.9em;">➜</span> <span style="color: #198754; font-weight: 800;">${newLvl}</span>`;
        }
       
        resHp.innerHTML = generateMountStatStringWithIcons(finalHp, finalHpProj, 'icons/icon_hp.png', true);
        resDmg.innerHTML = generateMountStatStringWithIcons(finalDmg, finalDmgProj, 'icons/icon_dmg.png', true);
       
        // MAX LEVEL BARS
        const barFillBefore = document.getElementById('mount-bar-fill-before');
        const barTextBefore = document.getElementById('mount-bar-text-before');
        const progressArrow = document.getElementById('mount-progress-arrow');
        const wrapperAfter = document.getElementById('mount-progress-wrapper-after');
        const barFillAfter = document.getElementById('mount-bar-fill-after');
        const barTextAfter = document.getElementById('mount-bar-text-after');

        if (barFillBefore && barTextBefore) {
            if (newLvlBefore >= 100 || maxPossible === 0) {
                barFillBefore.style.width = "100%";
                barTextBefore.innerText = `${maxPossible.toLocaleString()} / ${maxPossible.toLocaleString()} xp (100%)`;
                if(progressArrow) progressArrow.style.display = "none";
                if(wrapperAfter) wrapperAfter.style.display = "none";
            } else {
                let pctBefore = (grandTotalBefore / maxPossible) * 100;
                if (pctBefore > 100) pctBefore = 100;
               
                barFillBefore.style.width = `${pctBefore}%`;
                barTextBefore.innerText = `${Math.round(grandTotalBefore).toLocaleString()} / ${maxPossible.toLocaleString()} xp (${pctBefore.toFixed(1)}%)`;

                if (grandTotalBefore !== grandTotal && progressArrow && wrapperAfter && barFillAfter && barTextAfter) {
                    progressArrow.style.display = "block";
                    wrapperAfter.style.display = "block";
                   
                    let pctAfter = (grandTotal / maxPossible) * 100;
                    if (pctAfter > 100) pctAfter = 100;
                   
                    barFillAfter.style.width = `${pctAfter}%`;
                    barTextAfter.innerText = `${Math.round(grandTotal).toLocaleString()} / ${maxPossible.toLocaleString()} xp (${pctAfter.toFixed(1)}%)`;
                } else {
                    if(progressArrow) progressArrow.style.display = "none";
                    if(wrapperAfter) wrapperAfter.style.display = "none";
                }
            }
        }
        
        // CURRENT LEVEL BARS
        const curBarFillBefore = document.getElementById('mount-current-bar-fill-before');
        const curBarTextBefore = document.getElementById('mount-current-bar-text-before');
        const curProgressArrow = document.getElementById('mount-current-progress-arrow');
        const curWrapperAfter = document.getElementById('mount-current-progress-wrapper-after');
        const curBarFillAfter = document.getElementById('mount-current-bar-fill-after');
        const curBarTextAfter = document.getElementById('mount-current-bar-text-after');
        
        if (curBarFillBefore && curBarTextBefore) {
            if (newLvlBefore >= 100 || !expTable || typeof expTable[newLvlBefore] !== 'number') {
                curBarFillBefore.style.width = "100%";
                curBarTextBefore.innerText = "MAX (100%)";
                if(curProgressArrow) curProgressArrow.style.display = "none";
                if(curWrapperAfter) curWrapperAfter.style.display = "none";
            } else {
                let maxForLevelB = expTable[newLvlBefore];
                let pctB = (newExpBefore / maxForLevelB) * 100;
                if (pctB > 100) pctB = 100;
                
                curBarFillBefore.style.width = `${pctB}%`;
                curBarTextBefore.innerText = `${Math.round(newExpBefore).toLocaleString()} / ${maxForLevelB.toLocaleString()} xp (${pctB.toFixed(1)}%)`;
                
                if (grandTotalBefore !== grandTotal && curProgressArrow && curWrapperAfter && curBarFillAfter && curBarTextAfter) {
                    curProgressArrow.style.display = "block";
                    curWrapperAfter.style.display = "block";
                    
                    if (newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number') {
                        curBarFillAfter.style.width = "100%";
                        curBarTextAfter.innerText = "MAX (100%)";
                    } else {
                        let maxForLevelA = expTable[newLvl];
                        let pctA = (newExp / maxForLevelA) * 100;
                        if (pctA > 100) pctA = 100;
                        
                        curBarFillAfter.style.width = `${pctA}%`;
                        curBarTextAfter.innerText = `${Math.round(newExp).toLocaleString()} / ${maxForLevelA.toLocaleString()} xp (${pctA.toFixed(1)}%)`;
                    }
                } else {
                    if(curProgressArrow) curProgressArrow.style.display = "none";
                    if(curWrapperAfter) curWrapperAfter.style.display = "none";
                }
            }
        }
       
        let nextBeforeStr = newLvlBefore >= 100 || !expTable || typeof expTable[newLvlBefore] !== 'number' ? "-" : Math.round(expTable[newLvlBefore] - newExpBefore).toLocaleString();
        let nextAfterStr = newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number' ? "-" : Math.round(expTable[newLvl] - newExp).toLocaleString();
        if (resNext) resNext.innerHTML = generateBeforeAfterStrInline(nextBeforeStr, nextAfterStr);
       
        let totBeforeStr = formatPetStats(Math.round(grandTotalBefore));
        let totAfterStr = formatPetStats(Math.round(grandTotal));
        if (resTotal) resTotal.innerHTML = generateBeforeAfterStrInline(totBeforeStr, totAfterStr);
       
        let maxBeforePct = maxPossible > 0 ? ((grandTotalBefore / maxPossible) * 100).toFixed(1) : 0;
        let maxAfterPct = maxPossible > 0 ? ((grandTotal / maxPossible) * 100).toFixed(1) : 0;
       
        let maxBeforeStr = newLvlBefore >= 100 ? "MAX <span style='font-size: 0.9rem; color: #7f8c8d;'>(100%)</span>" : `${formatPetStats(Math.round(maxPossible - grandTotalBefore))} <span style="font-size: 0.9rem; color: #7f8c8d;">(${maxBeforePct}%)</span>`;
        let maxAfterStr = newLvl >= 100 ? "MAX <span style='font-size: 0.9rem; color: #7f8c8d;'>(100%)</span>" : `${formatPetStats(Math.round(maxPossible - grandTotal))} <span style="font-size: 0.9rem; color: #7f8c8d;">(${maxAfterPct}%)</span>`;
       
        if (resMax) resMax.innerHTML = generateBeforeAfterStrInline(maxBeforeStr, maxAfterStr);

        const resKeys = document.getElementById('mount-merge-res-keys');
        if (resKeys) {
            const calcKeysToMax = (expNeeded, currentSummonLv, currentSummonExp, keyCost, extraChanceMultiplier) => {
                if (expNeeded <= 0) return 0;
               
                let remainingFodderExp = expNeeded;
                let totalYieldsRequired = 0;
                let currentLv = currentSummonLv;
                let currentExp = currentSummonExp;
                const rarities = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];
               
                let loopCount = 0;
               
                while (remainingFodderExp > 0 && loopCount < 1000) {
                    loopCount++;
                    let levelData = (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[currentLv]) ? MOUNT_LEVEL_DATA[currentLv] : [0, 100, 0, 0, 0, 0, 0];
                    let maxExpForLevel = levelData[0];
                   
                    let avgFodderPerYield = 0;
                    for (let i = 0; i < 6; i++) {
                        avgFodderPerYield += (levelData[i + 1] / 100) * (MOUNT_FODDER_XP[rarities[i]] || 0);
                    }
                   
                    if (avgFodderPerYield <= 0) break;
                   
                    if (maxExpForLevel === "MAX" || maxExpForLevel === 0) {
                        totalYieldsRequired += remainingFodderExp / avgFodderPerYield;
                        remainingFodderExp = 0;
                    } else {
                        let yieldsToLevelUp = maxExpForLevel - currentExp;
                        let fodderFromLevelUp = yieldsToLevelUp * avgFodderPerYield;
                       
                        if (remainingFodderExp <= fodderFromLevelUp) {
                            totalYieldsRequired += remainingFodderExp / avgFodderPerYield;
                            remainingFodderExp = 0;
                        } else {
                            totalYieldsRequired += yieldsToLevelUp;
                            remainingFodderExp -= fodderFromLevelUp;
                            currentLv++;
                            currentExp = 0;
                        }
                    }
                }
               
                let basePulls = totalYieldsRequired / (1 + extraChanceMultiplier);
                let actualPullsNeeded = Math.ceil(basePulls);
               
                return actualPullsNeeded * keyCost;
            };

            let keysBefore = newLvlBefore >= 100 ? 0 : calcKeysToMax(maxPossible - grandTotalBefore, summonLv, summonExp, mCostBefore, extraChanceB);
            let keysAfter = newLvl >= 100 ? 0 : calcKeysToMax(maxPossible - grandTotal, summonLv, summonExp, mCostAfter, extraChanceA);
           
            const formatKey = (k) => k === 0 ? "MAX" : k.toLocaleString();
            const iconHtml = `<img src="icons/mount_key.png" style="width: 15px; height: 15px; object-fit: contain; vertical-align: -2px; margin-right: 4px;">`;
           
            let keysBeforeStr = keysBefore === 0 ? "MAX" : `${iconHtml}${formatKey(keysBefore)}`;
            let keysAfterStr = keysAfter === 0 ? "MAX" : `${iconHtml}${formatKey(keysAfter)}`;
           
            resKeys.innerHTML = generateBeforeAfterStrInline(keysBeforeStr, keysAfterStr);
        }
    }

    if (summonKey >=0) {
        const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];
        const ROW_COLORS = ['#f1f1f1', '#5dd9ff', '#5dfe8a', '#fcfe5d', '#ff5c5d', '#d55cff'];
        const fontStyle = "font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; color: #000; -webkit-text-stroke: 0px;";

        const formatSummonVal = (val) => {
            if (val === 0) return "0";
            if (val >= 1000000) return (val / 1000000).toFixed(1) + 'm';
            if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
            if (val >= 10) return val.toFixed(1);
            return val.toFixed(2);
        };

        const formatExpVal = (val) => {
            if (val === 0) return "0";
            if (val >= 1000000) return (val / 1000000).toFixed(2) + 'm';
            if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
            return Math.round(val).toLocaleString();
        };

        const generateBeforeAfterStr = (before, after, isExp = false) => {
            const s1 = isExp ? formatExpVal(before) : formatSummonVal(before);
            const s2 = isExp ? formatExpVal(after) : formatSummonVal(after);
            if (s1 === s2) return `<span style="${fontStyle} font-weight: 600;">${s1}</span>`;
           
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                return `
                    <div style="display: flex; flex-direction: column; align-items: flex-end;">
                        <span style="${fontStyle}">${s1}</span>
                        <div style="display:flex; align-items:center;">
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; margin-right: 4px; font-size: 0.9em; -webkit-text-stroke: 0px !important;">➜</span>
                            <span style="${fontStyle} font-weight: 600;">${s2}</span>
                        </div>
                    </div>`;
            }

            return `<div style="display:flex; align-items:center;"><span style="${fontStyle}">${s1}</span> <span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; margin: 0 6px; font-size: 0.9em; -webkit-text-stroke: 0px !important;">➜</span> <span style="${fontStyle} font-weight: 600;">${s2}</span></div>`;
        };

        let tableHtml = `
            <div style="padding-top: 5px;">
                <div style="display: flex; justify-content: space-between; padding: 0 15px; margin-bottom: 5px;">
                    <span style="${fontStyle}">Amount</span>
                    <span style="${fontStyle}">Exp</span>
                </div>
        `;

        for (let i = 0; i < 6; i++) {
            let amountBefore = mountsPulledBefore[i];
            let rarityExpBefore = amountBefore * (MOUNT_FODDER_XP[RARITIES[i]] || 0);
           
            let amountAfter = mountsPulled[i];
            let rarityExpAfter = amountAfter * (MOUNT_FODDER_XP[RARITIES[i]] || 0);

            tableHtml += `
                <div style="background-color: ${ROW_COLORS[i]}; border-radius: 8px; padding: 8px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                    ${generateBeforeAfterStr(amountBefore, amountAfter, false)}
                    ${generateBeforeAfterStr(rarityExpBefore, rarityExpAfter, true)}
                </div>
            `;
        }
       
        tableHtml += `</div>`;
        window.mountYieldTableHtml = tableHtml;
    } else {
        window.mountYieldTableHtml = "";
    }
   
    if (typeof calculateMountSummoning === 'function') {
        calculateMountSummoning();
    }
}

function calculateMountSummoning() {
    if (typeof MOUNT_LEVEL_DATA === 'undefined') return;

    let keysEl = document.getElementById('pet-mount-key');
    let lvlEl = document.getElementById('pet-mount-summon-lvl');
    let expEl = document.getElementById('pet-mount-summon-exp');

    if (!keysEl || !lvlEl || !expEl) return;

    let keysOwned = parseInt(keysEl.value.replace(/,/g, '')) || 0;
    let startLv = parseInt(lvlEl.value) || 1;
    let startExp = parseFloat(expEl.value) || 0;

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

    let currentKeyCost = Math.ceil(50 * (1 - (currentCostLv * 1) / 100));
    let plannedKeyCost = Math.ceil(50 * (1 - (plannedCostLv * 1) / 100));
    let currentExtraChance = (currentChanceLv * 2) / 100;
    let plannedExtraChance = (plannedChanceLv * 2) / 100;

    let beforeState = simulateSummons(startLv, startExp, keysOwned, currentKeyCost, currentExtraChance);
    let afterState = simulateSummons(startLv, startExp, keysOwned, plannedKeyCost, plannedExtraChance);

    const formatExp = (val) => Number.isInteger(val) ? val.toString() : val.toFixed(1);

    const formatSummonVal = (val) => {
        if (val === 0) return "0";
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'm';
        if (val >= 10000) return (val / 1000).toFixed(1) + 'k';
        if (val >= 10) return val.toFixed(1);
        return val.toFixed(2);
    };

    const formatExpVal = (val) => {
        if (val === 0) return "0";
        if (val >= 1000000) return (val / 1000000).toFixed(2) + 'm';
        if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
        return Math.round(val).toLocaleString(); 
    };

    document.getElementById('mount-res-lv').innerHTML = generateBeforeAfterStrInline(beforeState.level, afterState.level);

    let maxBefore = MOUNT_LEVEL_DATA[beforeState.level][0];
    let maxAfter = MOUNT_LEVEL_DATA[afterState.level][0];
    let expBeforeStr = `${formatExp(beforeState.exp)}/${maxBefore}`;
    let expAfterStr = `${formatExp(afterState.exp)}/${maxAfter}`;
    document.getElementById('mount-res-exp').innerHTML = generateBeforeAfterStrInline(expBeforeStr, expAfterStr);

    let mountsYieldedB = beforeState.pulls * (1 + currentExtraChance);
    let mountsYieldedA = afterState.pulls * (1 + plannedExtraChance);
    document.getElementById('mount-res-pulls').innerHTML = generateBeforeAfterStrInline(formatSummonVal(mountsYieldedB), formatSummonVal(mountsYieldedA));

    let mexpB = 0, mexpA = 0;
    if (typeof calcWarMountPulls === 'function') {
        const rarities = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];
        let mountsArrB = calcWarMountPulls(startLv, startExp, mountsYieldedB);
        let mountsArrA = calcWarMountPulls(startLv, startExp, mountsYieldedA);
        
        for(let i = 0; i < 6; i++) {
            mexpB += mountsArrB[i] * (MOUNT_FODDER_XP[rarities[i]] || 0);
            mexpA += mountsArrA[i] * (MOUNT_FODDER_XP[rarities[i]] || 0);
        }
    }
    document.getElementById('mount-res-mexp').innerHTML = generateBeforeAfterStrInline(formatExpVal(mexpB), formatExpVal(mexpA));
}

function simulateSummons(startLv, startExp, keysOwned, keyCost, extraChance) {
    let pulls = Math.floor(keysOwned / keyCost);
    let expGained = pulls * (1 + extraChance);
    
    let currLv = startLv;
    let currExp = startExp + expGained;

    while (currLv < 100 && currExp >= MOUNT_LEVEL_DATA[currLv][0]) {
        currExp -= MOUNT_LEVEL_DATA[currLv][0];
        currLv++;
    }

    if (currLv >= 100) {
        currLv = 100;
        currExp = 0; 
    }

    return { level: currLv, exp: currExp, pulls: pulls };
}

function getRequirementsToLevel(startLv, startExp, targetLv, keyCost, extraChance) {
    if (startLv >= targetLv) return { pulls: 0, keys: 0 };

    let totalExpNeeded = (MOUNT_LEVEL_DATA[startLv][0] - startExp);
    
    for (let i = startLv + 1; i < targetLv; i++) {
        totalExpNeeded += MOUNT_LEVEL_DATA[i][0];
    }

    let pullsNeeded = Math.ceil(totalExpNeeded / (1 + extraChance));
    let keysNeeded = pullsNeeded * keyCost;

    return { pulls: pullsNeeded, keys: keysNeeded };
}

/**
 * GLOBAL MOUNT SUMMON SYNC
 */
document.addEventListener('input', function(e) {
    const mountLevelIDs = ['pet-mount-summon-lvl', 'wc-mount-lv', 'asc-mount-lv', 'sum-mount-lvl'];
    const mountExpIDs = ['pet-mount-summon-exp', 'wc-mount-exp', 'asc-mount-exp', 'sum-mount-exp'];

    if (mountLevelIDs.includes(e.target.id) && !e.target.dataset.isSyncing) {
        const newValue = e.target.value;
        
        mountLevelIDs.forEach(id => {
            if (id !== e.target.id) {
                const el = document.getElementById(id);
                if (el && el.value !== newValue) {
                    el.dataset.isSyncing = "true"; // Stops an infinite loop
                    el.value = newValue;           // Copies the number
                    el.dispatchEvent(new Event('input', { bubbles: true })); // Forces the math to update
                    delete el.dataset.isSyncing;
                }
            }
        });
    }

    if (mountExpIDs.includes(e.target.id) && !e.target.dataset.isSyncing) {
        const newValue = e.target.value;
        
        mountExpIDs.forEach(id => {
            if (id !== e.target.id) {
                const el = document.getElementById(id);
                if (el && el.value !== newValue) {
                    el.dataset.isSyncing = "true"; // Stops an infinite loop
                    el.value = newValue;           // Copies the number
                    el.dispatchEvent(new Event('input', { bubbles: true })); // Forces the math to update
                    delete el.dataset.isSyncing;
                }
            }
        });
    }
});