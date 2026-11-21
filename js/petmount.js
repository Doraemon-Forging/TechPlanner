/**
 * PETMOUNT.JS
 * Pet and Mount Calculator Logic
 */

// ==========================================
// 1. EXP TABLES & TIER DEFINITIONS
// ==========================================
const PET_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic", "Heroic"];
const MOUNT_BASE_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic"];
const MOUNT_SUMMON_RARITIES = ["Common", "Rare", "Epic", "Legendary", "Ultimate", "Mythic", "Heroic", "Infinite", "Eternal"];

const RARITY_COLORS = {
    "Common": "#f1f1f1",
    "Rare": "#5dd9ff",
    "Epic": "#5dfe8a",
    "Legendary": "#fdff5e",
    "Ultimate": "#ff5c5d",
    "Mythic": "#d55cff",
    "Heroic": "#fe0000",
    "Infinite": "#228bff",
    "Eternal": "#a5d801"
};

const PET_EXP_TABLE = (function() {
    const table = {};
    if (typeof FODDER_XP === 'undefined') return table;

    PET_RARITIES.forEach(rarity => {
        const expArray = [0];
        const baseExp = FODDER_XP[rarity] || 0;
        for (let lvl = 1; lvl < 100; lvl++) {
            expArray.push(Math.round(baseExp * Math.pow(1.01, lvl)));
        }
        expArray.push("MAX");
        table[rarity] = expArray;
    });
    return table;
})();

const MOUNT_EXP_TABLE = (function() {
    const table = {};
    if (typeof MOUNT_FODDER_XP === 'undefined') return table;

    MOUNT_BASE_RARITIES.forEach(rarity => {
        const expArray = [0];
        const baseExp = MOUNT_FODDER_XP[rarity] || 0;
        for (let lvl = 1; lvl < 100; lvl++) {
            expArray.push(Math.round(baseExp * Math.pow(1.033, lvl)));
        }
        table[rarity] = expArray;
    });
    return table;
})();

// ==========================================
// 2. INITIALIZATION & DROPDOWNS
// ==========================================
function getAvailablePetRarities(ascLvl) {
    return ascLvl === 3
        ? PET_RARITIES
        : PET_RARITIES.filter(r => r !== "Heroic");
}

function syncPetRarityDropdowns() {
    const ascLvl = getIntValSafe('pet-ascension', 0);
    const allowedRarities = getAvailablePetRarities(ascLvl);
    const shouldHaveHeroic = ascLvl === 3;

    // 1. Pet 1, Pet 2, Pet 3
    for (let i = 1; i <= 3; i++) {
        const raritySel = document.getElementById(`pet-${i}-rarity`);
        if (!raritySel) continue;

        const prevVal = raritySel.value || "Common";
        const hasHeroicOption = Array.from(raritySel.options).some(o => o.value === "Heroic");

        if (raritySel.options.length === 0 || hasHeroicOption !== shouldHaveHeroic) {
            raritySel.innerHTML = "";
            allowedRarities.forEach(r => raritySel.add(new Option(r, r)));

            if (allowedRarities.includes(prevVal)) {
                raritySel.value = prevVal;
            } else {
                raritySel.value = "Mythic";
                populatePetSelect(`pet-${i}-rarity`, `pet-${i}-id`, () => {});
            }
        }
    }

    // 2. Main Pet ('target') & Fodder Pet ('fodder')
    ['target', 'fodder'].forEach(type => {
        const raritySel = document.getElementById(`merge-${type}-rarity`);
        if (!raritySel) return;

        const prevVal = raritySel.value || (type === 'fodder' ? "None" : "Common");
        const hasHeroicOption = Array.from(raritySel.options).some(o => o.value === "Heroic");

        if (raritySel.options.length === 0 || hasHeroicOption !== shouldHaveHeroic) {
            raritySel.innerHTML = "";
            if (type === 'fodder') raritySel.add(new Option("None", "None"));
            allowedRarities.forEach(r => raritySel.add(new Option(r, r)));

            if (prevVal === "None" && type === 'fodder') {
                raritySel.value = "None";
            } else if (allowedRarities.includes(prevVal)) {
                raritySel.value = prevVal;
            } else {
                raritySel.value = "Mythic";
                if (type === 'target') {
                    populatePetSelect(`merge-target-rarity`, `merge-target-id`, () => {});
                }
            }
        }
    });
}

function initPetMount() {
    syncPetRarityDropdowns();

    for (let i = 1; i <= 3; i++) {
        const raritySel = document.getElementById(`pet-${i}-rarity`);
        if (raritySel && !raritySel.value) raritySel.value = "Common";

        const lvlInput = document.getElementById(`pet-${i}-lvl`);
        const expInput = document.getElementById(`pet-${i}-exp`);
        if (lvlInput) lvlInput.value = 1;
        if (expInput) expInput.value = 0;
        updatePetNameOptions(i);
    }

    ['target', 'fodder'].forEach(type => {
        const raritySel = document.getElementById(`merge-${type}-rarity`);
        if (raritySel) raritySel.value = type === 'fodder' ? "None" : "Common";

        const lvlInput = document.getElementById(`merge-${type}-lvl`);
        const expInput = document.getElementById(`merge-${type}-exp`);
        if (lvlInput) lvlInput.value = 1;
        if (expInput) expInput.value = 0;

        updateMergeNameOptions(type);
    });

    toggleHeroicEggVisibility();
    validateMergeInputs();
    updateMountMergeResult();
}

function toggleHeroicEggVisibility() {
    const ascLvl = getIntValSafe('pet-ascension', 0);
    syncPetRarityDropdowns();

    const heroicWrapper = document.getElementById('bulk-heroic-wrapper');
    if (heroicWrapper) {
        heroicWrapper.style.display = ascLvl === 3 ? 'flex' : 'none';
    }
}

function populatePetSelect(raritySelId, nameSelId, onChangeCallback) {
    const raritySel = document.getElementById(raritySelId);
    const nameSel = document.getElementById(nameSelId);
    if (!raritySel || !nameSel) return;

    const selectedRarity = raritySel.value;
    const currentName = nameSel.value;
    nameSel.innerHTML = "";

    if (selectedRarity === "None") {
        nameSel.disabled = true;
        onChangeCallback();
        return;
    }
    nameSel.disabled = false;

    const data = typeof PET_DATA !== 'undefined' ? PET_DATA[selectedRarity] : null;
    if (data) {
        Object.keys(data).forEach(cat => {
            if (data[cat].length > 0) {
                const group = document.createElement('optgroup');
                group.label = cat;
                data[cat].forEach(petName => group.appendChild(new Option(petName, petName)));
                nameSel.add(group);
            }
        });
    }

    const options = Array.from(nameSel.options);
    if (options.some(o => o.value === currentName)) {
        nameSel.value = currentName;
    } else if (options.length > 0) {
        nameSel.selectedIndex = 0;
    }
    onChangeCallback();
}

function updatePetNameOptions(index) {
    populatePetSelect(`pet-${index}-rarity`, `pet-${index}-id`, updatePetMount);
}

function updateMergeNameOptions(type) {
    populatePetSelect(`merge-${type}-rarity`, `merge-${type}-id`, updateMergeResult);
}

// ==========================================
// 3. HELPERS: MATH & FORMATTING
// ==========================================
function formatCompactStat(val) {
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
    const s1 = formatCompactStat(v1);
    const s2 = formatCompactStat(v2);
    if (s1 === s2) return `<span>${s1}</span>`;

    if (window.innerWidth <= 768) {
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
    const s1 = formatCompactStat(v1);
    const s2 = formatCompactStat(v2);
    const iconHtml = `<img src="${iconPath}" style="width: 20px; height: 20px; object-fit: contain; vertical-align: middle;">`;

    if (s1 === s2) {
        return `<div style="display:flex; align-items:center; gap:4px; justify-content: flex-end;">${iconHtml}<span>${s1}</span></div>`;
    }

    if (window.innerWidth <= 768 && !forceSingleRow) {
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

    if (window.innerWidth <= 768) {
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

function getMasteryMult(levels, prefix, type) {
    let total = 0;
    for (let t = 1; t <= 5; t++) {
        total += (levels[`${prefix}_T${t}_${type}`] || 0);
    }
    return 1 + (total * 0.02);
}

function getProjectedLevels() {
    if (typeof calcState === 'function') {
        const state = calcState();
        if (state && state.levels) return state.levels;
    }
    return typeof setupLevels !== 'undefined' ? setupLevels : {};
}

function getRecursiveTableExp(table, rarity, level) {
    if (!table[rarity]) return 0;
    let total = 0;
    for (let l = 1; l < level; l++) {
        total += table[rarity][l];
    }
    return total;
}

function getMaxPossibleTableExp(table, rarity) {
    if (!table[rarity]) return 0;
    return table[rarity].reduce((a, b) => (typeof b === 'number' ? a + b : a), 0);
}

function resolveLevelFromExp(table, rarity, totalExp, maxPossible) {
    if (totalExp >= maxPossible) return { level: 100, exp: 0 };
    if (!table[rarity]) return { level: 1, exp: 0 };

    let cum = 0;
    for (let l = 1; l < 100; l++) {
        const needed = typeof table[rarity][l] === 'number' ? table[rarity][l] : 0;
        if (totalExp < cum + needed) {
            return { level: l, exp: totalExp - cum };
        }
        cum += needed;
    }
    return { level: 100, exp: 0 };
}

const getIntValSafe = (id, defaultVal = 0) => {
    const el = document.getElementById(id);
    if (!el || !el.value) return defaultVal;
    const parsed = parseInt(String(el.value).replace(/,/g, ''), 10);
    return isNaN(parsed) ? defaultVal : parsed;
};

const getStrValSafe = (id, defaultVal = "Common") => {
    const el = document.getElementById(id);
    return el && el.value ? el.value : defaultVal;
};

// ==========================================
// 4. VALIDATION & MOUNT SUMMON HELPERS
// ==========================================
function clampLevelExp(rarity, lvlInput, expInput, expTable) {
    if (!lvlInput || !expInput) return;

    if (rarity === "None") {
        lvlInput.disabled = true;
        expInput.disabled = true;
        lvlInput.value = "";
        expInput.value = "";
        return;
    }
    lvlInput.disabled = false;
    expInput.disabled = false;

    let lvl = parseInt(lvlInput.value);
    if (isNaN(lvl) || lvl < 1) lvl = 1;
    if (lvl > 100) lvl = 100;
    lvlInput.value = lvl;

    let maxExp = 0;
    if (expTable[rarity]) {
        if (lvl >= 1 && lvl <= 99) maxExp = expTable[rarity][lvl];
        else if (lvl >= 100) maxExp = "Max";
    }

    let exp = parseInt(String(expInput.value).replace(/,/g, ''), 10);
    if (isNaN(exp) || exp < 0) exp = 0;

    if (maxExp === "Max") {
        exp = 0;
    } else if (exp >= maxExp) {
        exp = Math.max(0, maxExp - 1);
    }
    expInput.value = exp.toLocaleString('en-US');
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

function getMountFodderXpSafe(rarity) {
    return (typeof MOUNT_FODDER_XP !== 'undefined' && typeof MOUNT_FODDER_XP[rarity] === 'number')
        ? MOUNT_FODDER_XP[rarity]
        : 0;
}

function updatePetMountExpCap() {
    const lvEl = document.getElementById('pet-mount-summon-lvl');
    const expEl = document.getElementById('pet-mount-summon-exp');
    const maxEl = document.getElementById('pet-mount-summon-max');
    if (!lvEl || !maxEl || !expEl) return;

    const asc = getIntValSafe('mount-ascension', 0);
    const maxAscLv = typeof getMaxLevelForAsc === 'function' && typeof MOUNT_LEVEL_DATA !== 'undefined'
        ? getMaxLevelForAsc(MOUNT_LEVEL_DATA, asc)
        : (asc >= 3 ? 150 : 100);

    let lv = parseInt(lvEl.value) || 1;
    if (lv < 1) lv = 1;
    if (lv > maxAscLv) lv = maxAscLv;
    lvEl.value = lv;

    let maxExp = 20;
    if (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[lv]) {
        maxExp = MOUNT_LEVEL_DATA[lv][0];
    }

    if (lv >= maxAscLv || maxExp === "MAX" || maxExp === 0) {
        maxEl.innerText = "MAX";
        expEl.value = 0;
        expEl.disabled = true;
    } else {
        maxEl.innerText = maxExp;
        expEl.disabled = false;
        const currentExp = parseInt(expEl.value) || 0;
        if (currentExp >= maxExp) expEl.value = maxExp - 1;
    }
}

function getMountSummonYields(startLv, startExp, startAsc, totalYielded, keyCost, extraChance) {
    const totalByRarity = new Array(MOUNT_SUMMON_RARITIES.length).fill(0);
    if (totalYielded <= 0 || typeof MOUNT_LEVEL_DATA === 'undefined') return totalByRarity;

    if (typeof simulatePhaseFlow === 'function' && typeof SUMMON_CONFIG !== 'undefined' && SUMMON_CONFIG.mount) {
        const phases = simulatePhaseFlow(
            'mount',
            SUMMON_CONFIG.mount,
            startLv,
            startExp,
            startAsc,
            totalYielded,
            keyCost,
            extraChance,
            0,
            1
        );
        phases.forEach(phase => {
            for (let i = 0; i < phase.yields.length && i < totalByRarity.length; i++) {
                totalByRarity[i] += phase.yields[i] || 0;
            }
        });
        return totalByRarity;
    }

    let currLv = startLv;
    let currExp = startExp;
    let currAsc = startAsc;
    let rem = totalYielded;

    while (rem > 0) {
        const maxAscLv = currAsc >= 3 ? 150 : 100;
        const levelData = MOUNT_LEVEL_DATA[currLv] || MOUNT_LEVEL_DATA[maxAscLv];
        const maxExp = currLv >= maxAscLv ? "MAX" : levelData[0];

        if (maxExp === "MAX" || typeof maxExp !== 'number') {
            if (currAsc < 3) {
                currAsc++;
                currLv = 1;
                currExp = 0;
                continue;
            }
            for (let i = 0; i < totalByRarity.length; i++) {
                totalByRarity[i] += rem * ((levelData[i + 1] || 0) / 100);
            }
            break;
        }

        const applied = Math.min(rem, Math.max(0, maxExp - currExp));
        for (let i = 0; i < totalByRarity.length; i++) {
            totalByRarity[i] += applied * ((levelData[i + 1] || 0) / 100);
        }
        rem -= applied;
        currExp += applied;
        if (currExp >= maxExp) {
            currLv++;
            currExp = 0;
        }
    }
    return totalByRarity;
}

// ==========================================
// 5. CORE CALCULATORS: PETS
// ==========================================
function updatePetMount() {
    toggleHeroicEggVisibility();

    const curLevels = typeof setupLevels !== 'undefined' ? setupLevels : {};
    const projLevels = getProjectedLevels();

    const curMultHP = getMasteryMult(curLevels, 'spt', 'pet_hp');
    const curMultDmg = getMasteryMult(curLevels, 'spt', 'pet_dmg');
    const projMultHP = getMasteryMult(projLevels, 'spt', 'pet_hp');
    const projMultDmg = getMasteryMult(projLevels, 'spt', 'pet_dmg');

    const ascLvl = getIntValSafe('pet-ascension', 0);
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
            maxExpForLvl = lvl >= 100 ? "Max" : PET_EXP_TABLE[rarity][lvl];
        }
        maxSpan.innerText = maxExpForLvl === "Max" ? "Max" : maxExpForLvl.toLocaleString();

        if (barFill && barText) {
            const maxPossible = getMaxPossibleTableExp(PET_EXP_TABLE, rarity);
            if (maxExpForLvl === "Max" || maxPossible === 0) {
                barFill.style.width = "100%";
                barText.innerText = `${formatPetExp(maxPossible)} / ${formatPetExp(maxPossible)} xp (100%)`;
            } else {
                const absoluteTotal = getRecursiveTableExp(PET_EXP_TABLE, rarity, lvl) + exp;
                const pct = Math.min(100, (absoluteTotal / maxPossible) * 100);
                barFill.style.width = `${pct}%`;
                barText.innerText = `${formatPetExp(absoluteTotal)} / ${formatPetExp(maxPossible)} xp (${pct.toFixed(1)}%)`;
            }
        }

        if (hpRes && dmgRes) {
            const typeStr = (typeof PET_TYPE_MAP !== 'undefined' && PET_TYPE_MAP[name]) || "Hybrid";
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
    toggleHeroicEggVisibility();

    ['target', 'fodder'].forEach(type => {
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

        const maxExp = PET_EXP_TABLE[rarity] ? (lvl >= 100 ? "Max" : PET_EXP_TABLE[rarity][lvl]) : 0;
        maxSpan.innerText = maxExp === "Max" ? "Max" : maxExp.toLocaleString();
    });

    const ascLvl = getIntValSafe('pet-ascension', 0);
    const tRarity = getStrValSafe('merge-target-rarity', "Common");
    const tName = getStrValSafe('merge-target-id', "");
    const tLvl = getIntValSafe('merge-target-lvl', 1);
    const tExp = getIntValSafe('merge-target-exp', 0);

    const fRarity = getStrValSafe('merge-fodder-rarity', "None");
    const fLvl = getIntValSafe('merge-fodder-lvl', 1);
    const fExp = getIntValSafe('merge-fodder-exp', 0);

    const tTotal = getRecursiveTableExp(PET_EXP_TABLE, tRarity, tLvl) + tExp;

    let fTotal = 0;
    let fBaseBonus = 0;
    if (fRarity !== "None") {
        fTotal = getRecursiveTableExp(PET_EXP_TABLE, fRarity, fLvl) + fExp;
        fBaseBonus = (typeof FODDER_XP !== 'undefined' && FODDER_XP[fRarity]) || 0;
    }

    let bulkBonus = 0;
    PET_RARITIES.forEach(r => {
        if (r === "Heroic" && ascLvl !== 3) return;
        const qty = getIntValSafe(`bulk-${r.toLowerCase()}`, 0);
        bulkBonus += qty * ((typeof FODDER_XP !== 'undefined' && FODDER_XP[r]) || 0);
    });

    const grandTotal = tTotal + fTotal + fBaseBonus + bulkBonus;
    const expTable = PET_EXP_TABLE[tRarity];
    const maxPossible = getMaxPossibleTableExp(PET_EXP_TABLE, tRarity);
    const { level: newLvl, exp: newExp } = resolveLevelFromExp(PET_EXP_TABLE, tRarity, grandTotal, maxPossible);

    const typeStr = (typeof PET_TYPE_MAP !== 'undefined' && PET_TYPE_MAP[tName]) || "Hybrid";
    const base = typeof PET_BASE_STATS !== 'undefined' ? PET_BASE_STATS[tRarity] : { hp: 10, dmg: 10 };
    const typeMult = typeof PET_TYPE_MULT !== 'undefined' ? (PET_TYPE_MULT[typeStr] || { dmg: 1, hp: 1 }) : { dmg: 1, hp: 1 };

    const ascMult = Math.pow(50, ascLvl);

    const curLevels = typeof setupLevels !== 'undefined' ? setupLevels : {};
    const projLevels = getProjectedLevels();
    const curMultHP = getMasteryMult(curLevels, 'spt', 'pet_hp');
    const curMultDmg = getMasteryMult(curLevels, 'spt', 'pet_dmg');
    const projMultHP = getMasteryMult(projLevels, 'spt', 'pet_hp');
    const projMultDmg = getMasteryMult(projLevels, 'spt', 'pet_dmg');

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

    if (resName && tName !== "") {
        const petBgNode = resName.closest('div[style*="border-radius"]') || resName.parentElement.parentElement;
        if (petBgNode) {
            petBgNode.style.backgroundColor = RARITY_COLORS[tRarity] || "#f1f1f1";
            petBgNode.style.border = "none";
        }
        resName.innerText = `${tName} Lv ${newLvl}`;
        resHp.innerHTML = generateStatStringWithIcons(finalHp, finalHpProj, 'icons/icon_hp.png', true);
        resDmg.innerHTML = generateStatStringWithIcons(finalDmg, finalDmgProj, 'icons/icon_dmg.png', true);

        if (barFill && barText) {
            if (newLvl >= 100 || maxPossible === 0) {
                barFill.style.width = "100%";
                barText.innerText = `${formatPetExp(maxPossible)} / ${formatPetExp(maxPossible)} xp (100%)`;
            } else {
                const pct = Math.min(100, (grandTotal / maxPossible) * 100);
                barFill.style.width = `${pct}%`;
                barText.innerText = `${formatPetExp(Math.round(grandTotal))} / ${formatPetExp(maxPossible)} xp (${pct.toFixed(1)}%)`;
            }
        }

        if (curBarFill && curBarText) {
            if (newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number') {
                curBarFill.style.width = "100%";
                curBarText.innerText = "MAX (100%)";
            } else {
                const maxForLevel = expTable[newLvl];
                const pct = Math.min(100, (newExp / maxForLevel) * 100);
                curBarFill.style.width = `${pct}%`;
                curBarText.innerText = `${formatPetExp(Math.round(newExp))} / ${formatPetExp(maxForLevel)} xp (${pct.toFixed(1)}%)`;
            }
        }
    }
}

// ==========================================
// 6. CORE CALCULATORS: MOUNTS
// ==========================================
function updateMountMergeResult() {
    updatePetMountExpCap();

    ['target', 'fodder'].forEach(type => {
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

        const maxExp = MOUNT_EXP_TABLE[rarity] ? (lvl >= 100 ? "Max" : MOUNT_EXP_TABLE[rarity][lvl]) : 0;
        maxSpan.innerText = maxExp === "Max" ? "Max" : maxExp.toLocaleString();
    });

    const ascLvl = getIntValSafe('mount-ascension', 0);
    const tRarity = getStrValSafe('mount-target-rarity', "Common");
    const tLvl = getIntValSafe('mount-target-lvl', 1);
    const tExp = getIntValSafe('mount-target-exp', 0);

    const fRarity = getStrValSafe('mount-fodder-rarity', "None");
    const fLvl = getIntValSafe('mount-fodder-lvl', 1);
    const fExp = getIntValSafe('mount-fodder-exp', 0);

    const summonKeyEl = document.getElementById('pet-mount-key');
    const summonKey = summonKeyEl && summonKeyEl.value ? parseFloat(summonKeyEl.value.replace(/,/g, '')) || 0 : 0;
    const summonLv = getIntValSafe('pet-mount-summon-lvl', 1);
    const summonExp = getIntValSafe('pet-mount-summon-exp', 0);

    const tTotal = getRecursiveTableExp(MOUNT_EXP_TABLE, tRarity, tLvl) + tExp;

    let fTotal = 0;
    let fBaseBonus = 0;
    if (fRarity !== "None") {
        fTotal = getRecursiveTableExp(MOUNT_EXP_TABLE, fRarity, fLvl) + fExp;
        fBaseBonus = getMountFodderXpSafe(fRarity);
    }

    let bulkBonus = 0;
    MOUNT_BASE_RARITIES.forEach(r => {
        const qty = getIntValSafe(`bulk-mount-${r.toLowerCase()}`, 0);
        bulkBonus += qty * getMountFodderXpSafe(r);
    });

    const curLevels = typeof setupLevels !== 'undefined' ? setupLevels : {};
    const projLevels = getProjectedLevels();

    let costBefore = 0, chanceBefore = 0;
    let costAfter = 0, chanceAfter = 0;
    for (let t = 1; t <= 5; t++) {
        costBefore += (curLevels[`power_T${t}_mount_cost`] || 0);
        chanceBefore += (curLevels[`power_T${t}_mount_chance`] || 0);
        costAfter += (projLevels[`power_T${t}_mount_cost`] || 0);
        chanceAfter += (projLevels[`power_T${t}_mount_chance`] || 0);
    }

    const mCostBefore = Math.max(1, 50 * (1 - (costBefore / 100)));
    const mCostAfter = Math.max(1, 50 * (1 - (costAfter / 100)));
    const extraChanceB = (chanceBefore * 2) / 100;
    const extraChanceA = (chanceAfter * 2) / 100;

    let mountsPulled = new Array(MOUNT_SUMMON_RARITIES.length).fill(0);
    let mountsPulledBefore = new Array(MOUNT_SUMMON_RARITIES.length).fill(0);
    let summonBonus = 0;
    let summonBonusBefore = 0;

    if (summonKey > 0) {
        const mPullsBefore = Math.floor(summonKey / mCostBefore);
        const totalMountsYieldedBefore = mPullsBefore * (1 + extraChanceB);
        mountsPulledBefore = getMountSummonYields(summonLv, summonExp, ascLvl, totalMountsYieldedBefore, mCostBefore, extraChanceB);

        const mPullsAfter = Math.floor(summonKey / mCostAfter);
        const totalMountsYielded = mPullsAfter * (1 + extraChanceA);
        mountsPulled = getMountSummonYields(summonLv, summonExp, ascLvl, totalMountsYielded, mCostAfter, extraChanceA);

        for (let i = 0; i < MOUNT_SUMMON_RARITIES.length; i++) {
            const fodderXp = getMountFodderXpSafe(MOUNT_SUMMON_RARITIES[i]);
            summonBonusBefore += mountsPulledBefore[i] * fodderXp;
            summonBonus += mountsPulled[i] * fodderXp;
        }
    }

    const grandTotal = tTotal + fTotal + fBaseBonus + bulkBonus + summonBonus;
    const grandTotalBefore = tTotal + fTotal + fBaseBonus + bulkBonus + summonBonusBefore;

    const expTable = MOUNT_EXP_TABLE[tRarity];
    const maxPossible = getMaxPossibleTableExp(MOUNT_EXP_TABLE, tRarity);
    const { level: newLvl, exp: newExp } = resolveLevelFromExp(MOUNT_EXP_TABLE, tRarity, grandTotal, maxPossible);
    const { level: newLvlBefore, exp: newExpBefore } = resolveLevelFromExp(MOUNT_EXP_TABLE, tRarity, grandTotalBefore, maxPossible);

    const ascMult = Math.pow(50, ascLvl);

    const curMultHP = getMasteryMult(curLevels, 'power', 'mount_hp');
    const curMultDmg = getMasteryMult(curLevels, 'power', 'mount_dmg');
    const projMultHP = getMasteryMult(projLevels, 'power', 'mount_hp');
    const projMultDmg = getMasteryMult(projLevels, 'power', 'mount_dmg');

    let finalHp = 0, finalDmg = 0;
    let finalHpProj = 0, finalDmgProj = 0;
    const baseMount = typeof MOUNT_BASE_STATS !== 'undefined' ? MOUNT_BASE_STATS[tRarity] : null;

    if (baseMount && newLvlBefore > 0) {
        const levelMultB = Math.pow(1.006, newLvlBefore - 1);
        finalHp = Math.round((baseMount.hp * levelMultB) * ascMult * curMultHP);
        finalDmg = Math.round((baseMount.dmg * levelMultB) * ascMult * curMultDmg);
    }

    if (baseMount && newLvl > 0) {
        const levelMultA = Math.pow(1.006, newLvl - 1);
        finalHpProj = Math.round((baseMount.hp * levelMultA) * ascMult * projMultHP);
        finalDmgProj = Math.round((baseMount.dmg * levelMultA) * ascMult * projMultDmg);
    }

    const resName = document.getElementById('mount-merge-res-name');
    const resHp = document.getElementById('mount-merge-res-hp');
    const resDmg = document.getElementById('mount-merge-res-dmg');
    const resNext = document.getElementById('mount-merge-res-next');
    const resTotal = document.getElementById('mount-merge-res-total');
    const resMax = document.getElementById('mount-merge-res-max');

    if (resName && tRarity !== "None") {
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

        resHp.innerHTML = generateStatStringWithIcons(finalHp, finalHpProj, 'icons/icon_hp.png', true);
        resDmg.innerHTML = generateStatStringWithIcons(finalDmg, finalDmgProj, 'icons/icon_dmg.png', true);

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
                if (progressArrow) progressArrow.style.display = "none";
                if (wrapperAfter) wrapperAfter.style.display = "none";
            } else {
                const pctBefore = Math.min(100, (grandTotalBefore / maxPossible) * 100);
                barFillBefore.style.width = `${pctBefore}%`;
                barTextBefore.innerText = `${Math.round(grandTotalBefore).toLocaleString()} / ${maxPossible.toLocaleString()} xp (${pctBefore.toFixed(1)}%)`;

                if (grandTotalBefore !== grandTotal && progressArrow && wrapperAfter && barFillAfter && barTextAfter) {
                    progressArrow.style.display = "block";
                    wrapperAfter.style.display = "block";
                    const pctAfter = Math.min(100, (grandTotal / maxPossible) * 100);
                    barFillAfter.style.width = `${pctAfter}%`;
                    barTextAfter.innerText = `${Math.round(grandTotal).toLocaleString()} / ${maxPossible.toLocaleString()} xp (${pctAfter.toFixed(1)}%)`;
                } else {
                    if (progressArrow) progressArrow.style.display = "none";
                    if (wrapperAfter) wrapperAfter.style.display = "none";
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
                if (curProgressArrow) curProgressArrow.style.display = "none";
                if (curWrapperAfter) curWrapperAfter.style.display = "none";
            } else {
                const maxForLevelB = expTable[newLvlBefore];
                const pctB = Math.min(100, (newExpBefore / maxForLevelB) * 100);
                curBarFillBefore.style.width = `${pctB}%`;
                curBarTextBefore.innerText = `${Math.round(newExpBefore).toLocaleString()} / ${maxForLevelB.toLocaleString()} xp (${pctB.toFixed(1)}%)`;

                if (grandTotalBefore !== grandTotal && curProgressArrow && curWrapperAfter && curBarFillAfter && curBarTextAfter) {
                    curProgressArrow.style.display = "block";
                    curWrapperAfter.style.display = "block";

                    if (newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number') {
                        curBarFillAfter.style.width = "100%";
                        curBarTextAfter.innerText = "MAX (100%)";
                    } else {
                        const maxForLevelA = expTable[newLvl];
                        const pctA = Math.min(100, (newExp / maxForLevelA) * 100);
                        curBarFillAfter.style.width = `${pctA}%`;
                        curBarTextAfter.innerText = `${Math.round(newExp).toLocaleString()} / ${maxForLevelA.toLocaleString()} xp (${pctA.toFixed(1)}%)`;
                    }
                } else {
                    if (curProgressArrow) curProgressArrow.style.display = "none";
                    if (curWrapperAfter) curWrapperAfter.style.display = "none";
                }
            }
        }

        const nextBeforeStr = newLvlBefore >= 100 || !expTable || typeof expTable[newLvlBefore] !== 'number' ? "-" : Math.round(expTable[newLvlBefore] - newExpBefore).toLocaleString();
        const nextAfterStr = newLvl >= 100 || !expTable || typeof expTable[newLvl] !== 'number' ? "-" : Math.round(expTable[newLvl] - newExp).toLocaleString();
        if (resNext) resNext.innerHTML = generateBeforeAfterStrInline(nextBeforeStr, nextAfterStr);

        if (resTotal) {
            resTotal.innerHTML = generateBeforeAfterStrInline(
                formatCompactStat(Math.round(grandTotalBefore)),
                formatCompactStat(Math.round(grandTotal))
            );
        }

        const maxBeforePct = maxPossible > 0 ? ((grandTotalBefore / maxPossible) * 100).toFixed(1) : 0;
        const maxAfterPct = maxPossible > 0 ? ((grandTotal / maxPossible) * 100).toFixed(1) : 0;
        const maxBeforeStr = newLvlBefore >= 100 ? "MAX <span style='font-size: 0.9rem; color: #7f8c8d;'>(100%)</span>" : `${formatCompactStat(Math.round(maxPossible - grandTotalBefore))} <span style="font-size: 0.9rem; color: #7f8c8d;">(${maxBeforePct}%)</span>`;
        const maxAfterStr = newLvl >= 100 ? "MAX <span style='font-size: 0.9rem; color: #7f8c8d;'>(100%)</span>" : `${formatCompactStat(Math.round(maxPossible - grandTotal))} <span style="font-size: 0.9rem; color: #7f8c8d;">(${maxAfterPct}%)</span>`;
        if (resMax) resMax.innerHTML = generateBeforeAfterStrInline(maxBeforeStr, maxAfterStr);

        const resKeys = document.getElementById('mount-merge-res-keys');
        if (resKeys) {
            const calcKeysToMax = (expNeeded, startSummonLv, startSummonExp, startSummonAsc, keyCost, extraChanceMultiplier) => {
                if (expNeeded <= 0) return 0;

                let remainingFodderExp = expNeeded;
                let totalYieldsRequired = 0;
                let currentLv = startSummonLv;
                let currentExp = startSummonExp;
                let currentAsc = startSummonAsc;
                let loopCount = 0;

                while (remainingFodderExp > 0 && loopCount < 2000) {
                    loopCount++;
                    const maxAscLv = currentAsc >= 3 ? 150 : 100;
                    const levelData = (typeof MOUNT_LEVEL_DATA !== 'undefined' && MOUNT_LEVEL_DATA[currentLv])
                        ? MOUNT_LEVEL_DATA[currentLv]
                        : [0, 100, 0, 0, 0, 0, 0, 0, 0, 0];
                    const maxExpForLevel = currentLv >= maxAscLv ? "MAX" : levelData[0];

                    let avgFodderPerYield = 0;
                    for (let i = 0; i < MOUNT_SUMMON_RARITIES.length; i++) {
                        avgFodderPerYield += ((levelData[i + 1] || 0) / 100) * getMountFodderXpSafe(MOUNT_SUMMON_RARITIES[i]);
                    }

                    if (avgFodderPerYield <= 0) break;

                    if (maxExpForLevel === "MAX" || typeof maxExpForLevel !== 'number' || maxExpForLevel === 0) {
                        if (currentAsc < 3) {
                            currentAsc++;
                            currentLv = 1;
                            currentExp = 0;
                            continue;
                        }
                        totalYieldsRequired += remainingFodderExp / avgFodderPerYield;
                        remainingFodderExp = 0;
                    } else {
                        const yieldsToLevelUp = maxExpForLevel - currentExp;
                        const fodderFromLevelUp = yieldsToLevelUp * avgFodderPerYield;

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

                const actualPullsNeeded = Math.ceil(totalYieldsRequired / (1 + extraChanceMultiplier));
                return Math.round(actualPullsNeeded * keyCost);
            };

            const keysBefore = newLvlBefore >= 100 ? 0 : calcKeysToMax(maxPossible - grandTotalBefore, summonLv, summonExp, ascLvl, mCostBefore, extraChanceB);
            const keysAfter = newLvl >= 100 ? 0 : calcKeysToMax(maxPossible - grandTotal, summonLv, summonExp, ascLvl, mCostAfter, extraChanceA);

            const iconHtml = `<img src="icons/mount_key.png" style="width: 15px; height: 15px; object-fit: contain; vertical-align: -2px; margin-right: 4px;">`;
            const keysBeforeStr = keysBefore === 0 ? "MAX" : `${iconHtml}${keysBefore.toLocaleString()}`;
            const keysAfterStr = keysAfter === 0 ? "MAX" : `${iconHtml}${keysAfter.toLocaleString()}`;

            resKeys.innerHTML = generateBeforeAfterStrInline(keysBeforeStr, keysAfterStr);
        }
    }

    const reachedAsc3 = ascLvl >= 3 || mountsPulled.slice(6).some(v => v > 0) || mountsPulledBefore.slice(6).some(v => v > 0);
    const visibleTierCount = reachedAsc3 ? MOUNT_SUMMON_RARITIES.length : 6;
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

    const generateYieldRowCell = (before, after, isExp = false) => {
        const s1 = isExp ? formatExpVal(before) : formatSummonVal(before);
        const s2 = isExp ? formatExpVal(after) : formatSummonVal(after);
        if (s1 === s2) return `<span style="${fontStyle}">${s1}</span>`;

        if (window.innerWidth <= 768) {
            return `
                <div style="display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="${fontStyle}">${s1}</span>
                    <div style="display:flex; align-items:center;">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; margin-right: 4px; font-size: 0.9em; -webkit-text-stroke: 0px !important;">➜</span>
                        <span style="${fontStyle}">${s2}</span>
                    </div>
                </div>`;
        }

        return `<div style="display:flex; align-items:center;"><span style="${fontStyle}">${s1}</span> <span style="font-family: 'Fredoka', sans-serif; font-weight: 800; color: #198754; margin: 0 6px; font-size: 0.9em; -webkit-text-stroke: 0px !important;">➜</span> <span style="${fontStyle}">${s2}</span></div>`;
    };

    let tableHtml = `
        <div style="padding-top: 5px;">
            <div style="display: flex; justify-content: space-between; padding: 0 15px; margin-bottom: 5px;">
                <span style="${fontStyle}">Amount</span>
                <span style="${fontStyle}">Exp</span>
            </div>
    `;

    for (let i = 0; i < visibleTierCount; i++) {
        const fodderXp = getMountFodderXpSafe(MOUNT_SUMMON_RARITIES[i]);
        const amountBefore = mountsPulledBefore[i];
        const amountAfter = mountsPulled[i];

        tableHtml += `
            <div style="background-color: ${RARITY_COLORS[MOUNT_SUMMON_RARITIES[i]]}; border-radius: 8px; padding: 8px 15px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                ${generateYieldRowCell(amountBefore, amountAfter, false)}
                ${generateYieldRowCell(amountBefore * fodderXp, amountAfter * fodderXp, true)}
            </div>
        `;
    }

    tableHtml += `</div>`;
    window.mountYieldTableHtml = tableHtml;

    calculateMountSummoning(mCostBefore, mCostAfter, extraChanceB, extraChanceA, mountsPulledBefore, mountsPulled);
}

function calculateMountSummoning(currentKeyCost, plannedKeyCost, currentExtraChance, plannedExtraChance, mountsArrB, mountsArrA) {
    if (typeof MOUNT_LEVEL_DATA === 'undefined') return;

    const keysEl = document.getElementById('pet-mount-key');
    const lvlEl = document.getElementById('pet-mount-summon-lvl');
    const expEl = document.getElementById('pet-mount-summon-exp');
    if (!keysEl || !lvlEl || !expEl) return;

    const keysOwned = parseInt(keysEl.value.replace(/,/g, '')) || 0;
    const startAsc = getIntValSafe('mount-ascension', 0);
    const startLv = parseInt(lvlEl.value) || 1;
    const startExp = parseFloat(expEl.value) || 0;

    const getEndState = (keyCost, extraChance) => {
        const pulls = Math.floor(keysOwned / keyCost);
        const yieldTotal = pulls * (1 + extraChance);

        if (typeof getCumulativePulls === 'function' && typeof getLevelFromCumulative === 'function') {
            const baseCum = getCumulativePulls(startLv, startExp, MOUNT_LEVEL_DATA, startAsc);
            const proj = getLevelFromCumulative(baseCum + yieldTotal, MOUNT_LEVEL_DATA);
            return { level: proj.level, exp: proj.exp, maxExp: proj.maxExp, pulls };
        }

        let currLv = startLv;
        let currExp = startExp + yieldTotal;
        const maxLv = startAsc >= 3 ? 150 : 100;
        while (currLv < maxLv && typeof MOUNT_LEVEL_DATA[currLv][0] === 'number' && currExp >= MOUNT_LEVEL_DATA[currLv][0]) {
            currExp -= MOUNT_LEVEL_DATA[currLv][0];
            currLv++;
        }
        return { level: currLv, exp: currLv >= maxLv ? 0 : currExp, maxExp: currLv >= maxLv ? "MAX" : MOUNT_LEVEL_DATA[currLv][0], pulls };
    };

    const beforeState = getEndState(currentKeyCost, currentExtraChance);
    const afterState = getEndState(plannedKeyCost, plannedExtraChance);

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

    const resLv = document.getElementById('mount-res-lv');
    if (resLv) resLv.innerHTML = generateBeforeAfterStrInline(beforeState.level, afterState.level);

    const resExp = document.getElementById('mount-res-exp');
    if (resExp) {
        resExp.innerHTML = generateBeforeAfterStrInline(
            `${formatExp(beforeState.exp)}/${beforeState.maxExp}`,
            `${formatExp(afterState.exp)}/${afterState.maxExp}`
        );
    }

    const resPulls = document.getElementById('mount-res-pulls');
    if (resPulls) {
        resPulls.innerHTML = generateBeforeAfterStrInline(
            formatSummonVal(beforeState.pulls * (1 + currentExtraChance)),
            formatSummonVal(afterState.pulls * (1 + plannedExtraChance))
        );
    }

    let mexpB = 0, mexpA = 0;
    for (let i = 0; i < MOUNT_SUMMON_RARITIES.length; i++) {
        const fodderXp = getMountFodderXpSafe(MOUNT_SUMMON_RARITIES[i]);
        mexpB += (mountsArrB[i] || 0) * fodderXp;
        mexpA += (mountsArrA[i] || 0) * fodderXp;
    }

    const resMexp = document.getElementById('mount-res-mexp');
    if (resMexp) resMexp.innerHTML = generateBeforeAfterStrInline(formatExpVal(mexpB), formatExpVal(mexpA));
}

// ==========================================
// 7. GLOBAL MOUNT SUMMON SYNC & MODAL
// ==========================================
function syncMountFields(e) {
    // Intentionally excludes #mount-ascension so Pet/Mount ascension stays independent from other tabs
    const syncGroups = [
        ['pet-mount-summon-lvl', 'wc-mount-lv', 'asc-mount-lv', 'sum-mount-lvl'],
        ['pet-mount-summon-exp', 'wc-mount-exp', 'asc-mount-exp', 'sum-mount-exp']
    ];

    syncGroups.forEach(group => {
        if (group.includes(e.target.id) && !e.target.dataset.isSyncing) {
            const newValue = e.target.value;
            group.forEach(id => {
                if (id !== e.target.id) {
                    const el = document.getElementById(id);
                    if (el && el.value !== newValue) {
                        el.dataset.isSyncing = "true";
                        el.value = newValue;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        delete el.dataset.isSyncing;
                    }
                }
            });
        }
    });
}

document.addEventListener('input', syncMountFields);

function openMountExpModal() {
    if (typeof MODAL_SETTINGS !== 'undefined' && !MODAL_SETTINGS.mountExpBreakdown) {
        MODAL_SETTINGS.mountExpBreakdown = {
            title: "EXPECTED MOUNT YIELD",
            headerColor: "#ebf8fa",
            titleColor: "#ffffff",
            disclaimer: ""
        };
    }

    if (!window.mountYieldTableHtml) {
        updateMountMergeResult();
    }

    if (window.mountYieldTableHtml && typeof renderMasterModal === 'function') {
        renderMasterModal('mountExpBreakdown', window.mountYieldTableHtml);
    }
}