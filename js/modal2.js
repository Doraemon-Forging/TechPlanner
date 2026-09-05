/**
 * MODAL2.JS
 */

// --- CLAN TECH MODALS ---
window.validateClanTechInput = function(el, maxVal) {
    let clean = el.value.replace(/[^0-9]/g, '');
    clean = clean.replace(/^0+(?=\d)/, ''); 
    
    if (clean !== '') {
        let val = parseInt(clean);
        if (val > maxVal) {
            clean = maxVal.toString();
        }
    }

    el.value = clean;

    const memKeyMap = {
        'ct-war-personal': 'warPersonal', 'ct-war-win': 'warWin',
        'ct-war-lose': 'warLose', 'ct-mission': 'mission',
        'ct-pot-mission': 'potMission', 'ct-pot-personal': 'potPersonal',
        'ct-pot-win': 'potWin', 'ct-pot-lose': 'potLose',

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
    
    if (memKeyMap[el.id]) {
        if (!window.clanTechMemory) window.clanTechMemory = {};
        window.clanTechMemory[memKeyMap[el.id]] = clean;
    }
};

window.switchClanTechTab = function(tabName) {
    const tabs = ['rewards', 'war', 'egg'];
    tabs.forEach(t => {
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
    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS.combinedClanTech = { 
            title: "CLAN TECH SETTINGS", 
            headerColor: "#ebf8fa", 
            titleColor: "#000000",  
        };
    }

    const getSavedVal = (id) => {
        const memKeyMap = {
            
            'ct-war-personal': 'warPersonal', 'ct-war-win': 'warWin',
            'ct-war-lose': 'warLose', 'ct-mission': 'mission',
            'ct-pot-mission': 'potMission', 'ct-pot-personal': 'potPersonal',
            'ct-pot-win': 'potWin', 'ct-pot-lose': 'potLose',
            'ct-pot-race': 'potRace',
            
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
        
        const existingEl = document.getElementById(id);
        const val = existingEl ? existingEl.value : (window.clanTechMemory?.[memKeyMap[id]] || '');
        
        return (val === '0' || val === 0) ? '' : val;
    };

    const createRow = (node) => {
        let currentVal = getSavedVal(node.id);
        
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 15px; margin-bottom: 8px; background-color: #f2f2f2; border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="icons/${node.icon}" style="width: 40px; height: 40px; object-fit: contain; filter: drop-shadow(0px 1px 0px rgba(0,0,0,0.5));" onerror="this.style.display='none'">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; color: #000; -webkit-text-stroke: 0px;">${node.label}:</div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0; white-space: nowrap;">
                <input type="number" id="${node.id}" value="${currentVal}" placeholder="0" min="0" max="${node.max}" onfocus="this.select()" oninput="window.validateClanTechInput(this, ${node.max}); if(typeof updateWeekly === 'function') updateWeekly(); if(typeof updateWarCalc === 'function') updateWarCalc();" style="width: 55px; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; background-color: #fff; -webkit-text-stroke: 0px transparent !important;">
                <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; white-space: nowrap; color: #000; -webkit-text-stroke: 0px;">/ <span>${node.max}</span></span>
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
        { id: 'cw-forge-eq',     label: 'Forging Equipment', max: 10, icon: 'cw_forge.png' },
        { id: 'cw-summon-skill', label: 'Summoning Skills',  max: 10, icon: 'cw_skill.png' },
        { id: 'cw-upgrade-skill',label: 'Upgrading Skills',  max: 10, icon: 'cw_skillup.png' },
        { id: 'cw-tech-tree',    label: 'Tech Tree',         max: 10, icon: 'cw_tech.png' },
        { id: 'cw-forge-up',     label: 'Forge Upgrades',    max: 10, icon: 'cw_forgeup.png' },
        { id: 'cw-dungeon',      label: 'Dungeon Keys',      max: 10, icon: 'cw_key.png' },
        { id: 'cw-hatch',        label: 'Hatching Eggs',     max: 10, icon: 'cw_hatch.png' },
        { id: 'cw-merge-pet',    label: 'Merging Pets',      max: 10, icon: 'cw_eggmerge.png' },
        { id: 'cw-summon-mount', label: 'Summoning Mounts',  max: 10, icon: 'cw_mount.png' },
        { id: 'cw-merge-mount',  label: 'Merging Mounts',    max: 10, icon: 'cw_mountmerge.png' },
        { id: 'cw-day1',         label: 'War Day 1',         max: 10, icon: 'cw_day1.png' },
        { id: 'cw-day2',         label: 'War Day 2',         max: 10, icon: 'cw_day2.png' },
        { id: 'cw-day3',         label: 'War Day 3',         max: 10, icon: 'cw_day3.png' },
        { id: 'cw-day4',         label: 'War Day 4',         max: 10, icon: 'cw_day4.png' },
        { id: 'cw-day5',         label: 'War Day 5',         max: 10, icon: 'cw_day5.png' }
    ];

    const eggNodes = [
        { id: 'ct-egg-timer-common',    label: 'Common Egg Timer',    max: 60, icon: 'cegg1.png' },
        { id: 'ct-egg-timer-rare',      label: 'Rare Egg Timer',      max: 60, icon: 'cegg2.png' },
        { id: 'ct-egg-timer-epic',      label: 'Epic Egg Timer',      max: 60, icon: 'cegg3.png' },
        { id: 'ct-egg-timer-legendary', label: 'Legendary Egg Timer', max: 60, icon: 'cegg4.png' },
        { id: 'ct-egg-timer-ultimate',  label: 'Ultimate Egg Timer',  max: 60, icon: 'cegg5.png' },
        { id: 'ct-egg-timer-mythic',    label: 'Mythic Egg Timer',    max: 60, icon: 'cegg6.png' }
    ];

    const contentHtml = `
        <style>
            #ct-tabs-container .seg-btn {
                transition: font-size 0.1s ease, transform 0.1s ease;
            }
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

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('combinedClanTech', contentHtml);
    }
};

window.openClanTechModal = function() {
    window.openCombinedClanTechModal('rewards');
};

window.openClanWarTechModal = function() {
    window.openCombinedClanTechModal('war');
};

// --- WEEKLY GAIN MODALS ---
window.updateMissionCalc = function() {
    let lvl = parseInt(document.getElementById('thief-lvl')?.value) || 1;
    let sub = parseInt(document.getElementById('thief-sub')?.value) || 1;

    const slots = typeof getMissionSlots === 'function' ? getMissionSlots() : {};
    
    if (typeof calculateMissionYields !== 'function') return;
    const calc = calculateMissionYields(lvl, sub, slots);

    const slotInfo = document.getElementById('ms-total-slots');
    if(slotInfo) {
        slotInfo.innerText = calc.totalSlots.toFixed(1).replace('.0', '') + ' / 12';
        slotInfo.style.color = calc.totalSlots > 12 ? '#e74c3c' : '#000';
    }

    const lvlInfo = document.getElementById('ms-level-info');
    if(lvlInfo) lvlInfo.innerText = `Mission Lv ${calc.minLv}-${calc.maxLv}`;

    const setVals = (id, baseVal, dailyVal, format) => {
        let elBase = document.getElementById(`ms-base-${id}`);
        let elDaily = document.getElementById(`ms-daily-${id}`);
        
        const fmt = (num, isGold) => {
            if (isGold) {
                if (num < 10000) return Math.round(num).toLocaleString('en-US');
                else if (num < 1000000) return parseFloat((num/1000).toFixed(1)) + 'k';
                else return parseFloat((num/1000000).toFixed(2)) + 'm';
            }
            return Math.round(num).toLocaleString('en-US');
        };

        if(elBase) elBase.innerText = fmt(baseVal, format === 'gold');
        if(elDaily) elDaily.innerText = fmt(dailyVal, format === 'gold');
    };

    setVals('gold', calc.dailyBase.gold, calc.dailyTotal.gold, 'gold');
    setVals('ticket', calc.dailyBase.ticket, calc.dailyTotal.ticket, 'standard');
    setVals('egg', calc.dailyBase.egg, calc.dailyTotal.egg, 'standard');
    setVals('pot', calc.dailyBase.pot, calc.dailyTotal.pot, 'standard');
    setVals('key', calc.dailyBase.key, calc.dailyTotal.key, 'standard');
    setVals('gp', calc.dailyBase.gp, calc.dailyTotal.gp, 'standard');
};

window.switchWeeklyTab = function(tabName) {
    const tabs = ['source', 'resource', 'mission'];
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        const btn = document.getElementById(`btn-tab-${t}`);
        
        if (el && btn) {
            if (t === tabName) {
                el.style.display = 'block';
                btn.classList.add('active');
            } else {
                el.style.display = 'none';
                btn.classList.remove('active');
            }
        }
    });

    if (tabName === 'mission' && typeof window.updateMissionCalc === 'function') {
        window.updateMissionCalc();
    }
};

window.runMissionSimulation = function() {
    const btn = document.getElementById('runSimBtn');
    const textSpan = document.getElementById('runSimText');
    const originalText = textSpan.innerText;
    
    btn.disabled = true;

    setTimeout(() => {
        const resourceIds = ['fm_gold', 'green_ticket', 'eggshell', 'red_potion', 'mount_key', 'green_potion'];
        const weights = resourceIds.map(id => parseFloat(document.getElementById('weight_' + id).value) || 0);
        
        const numDays = 100000;
        let totalYield = [0, 0, 0, 0, 0, 0];

        for (let day = 0; day < numDays; day++) {
            let dailyMissions = [];

            for (let m = 0; m < 6; m++) {
                let counts = [0, 0, 0, 0, 0, 0];
                for (let r = 0; r < 4; r++) {
                    counts[Math.floor(Math.random() * 6)]++;
                }
                let score = 0;
                for (let i = 0; i < 6; i++) {
                    score += counts[i] * weights[i];
                }
                dailyMissions.push({ counts: counts, score: score });
            }

            dailyMissions.sort((a, b) => b.score - a.score);

            for (let m = 0; m < 3; m++) {
                for (let i = 0; i < 6; i++) {
                    totalYield[i] += dailyMissions[m].counts[i];
                }
            }
        }

        resourceIds.forEach((id, i) => {
            const avg = (totalYield[i] / numDays).toFixed(2);
            const resultEl = document.getElementById('result_' + id);
            resultEl.innerText = avg;
        });
        
        textSpan.innerText = originalText;
        btn.disabled = false;
    }, 50);
};

window.copySimulationToSlots = function() {
    const mapping = {
        'fm_gold': 'gold',
        'green_ticket': 'ticket',
        'eggshell': 'egg',
        'red_potion': 'pot',
        'mount_key': 'key',
        'green_potion': 'gp'
    };

    if (!window.missionSlotsMemory) window.missionSlotsMemory = {};

    let updated = false;
    for (const [resId, slotId] of Object.entries(mapping)) {
        const resultEl = document.getElementById('result_' + resId);
        if (resultEl && resultEl.innerText !== '-' && resultEl.innerText !== '') {
            let numVal = parseFloat(resultEl.innerText);
            if (!isNaN(numVal)) {
                let formatted = numVal.toFixed(2);
                window.missionSlotsMemory[slotId] = formatted;
        
                const inputEl = document.getElementById('ms-slot-' + slotId);
                if (inputEl) inputEl.value = formatted;
                
                updated = true;
            }
        }
    }

    if (updated) {
        if (typeof window.updateMissionCalc === 'function') window.updateMissionCalc();
        if (typeof window.updateWeekly === 'function') window.updateWeekly();

        if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
       
        const textSpan = document.getElementById('copySlotsText');
        if (textSpan) {
            const originalText = textSpan.innerText;
            textSpan.innerText = "COPIED!";
            
            setTimeout(() => { 
                textSpan.innerText = originalText; 
            }, 1000);
        }
    }
};

window.openMissionInfoModal = function() {
    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS.missionInfo = { 
            title: "MISSION SLOTS INFO", 
            headerColor: "#ebf8fa", 
            titleColor: "#000000", 
            disclaimer: "Expected average slots per day." 
        };
    }

    const resources = [
        { id: 'fm_gold', file: 'icons/fm_gold.png', defaultScore: 0, name: 'Gold' },
        { id: 'green_ticket', file: 'icons/green_ticket.png', defaultScore: 1, name: 'Green Ticket' },
        { id: 'eggshell', file: 'icons/eggshell.png', defaultScore: 2, name: 'Eggshell' },
        { id: 'red_potion', file: 'icons/red_potion.png', defaultScore: 0, name: 'Red Potion' },
        { id: 'mount_key', file: 'icons/mount_key.png', defaultScore: 2, name: 'Mount Key' },
        { id: 'green_potion', file: 'icons/green_potion.png', defaultScore: 10, name: 'Green Potion' }
    ];

    let tableHtml = `
        <div style="display: flex; padding: 4px 12px 6px 12px; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; color: #000; text-transform: uppercase;">
            <div style="flex: 0 0 20%; text-align: center;"></div>
            <div style="flex: 0 0 40%; text-align: center;">Value</div>
            <div style="flex: 0 0 40%; text-align: center;">Expected Slots</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px;">
    `;
    
    resources.forEach(r => {
        let savedWeight = window.missionSlotsMemory?.['w_' + r.id] !== undefined 
            ? window.missionSlotsMemory['w_' + r.id] 
            : r.defaultScore;

        tableHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px; box-sizing: border-box;">
                <div style="flex: 0 0 20%; display: flex; justify-content: center; align-items: center;">
                    <img src="${r.file}" title="${r.name}" style="width: 24px; height: 24px; object-fit: contain;">
                </div>
                <div style="flex: 0 0 40%; display: flex; justify-content: center; align-items: center;">
                    <input type="number" id="weight_${r.id}" value="${savedWeight}" step="1" onfocus="this.select()" oninput="document.getElementById('result_${r.id}').innerText='-';" style="width: 55px; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; background-color: #fff; -webkit-text-stroke: 0px transparent !important;">
                </div>
                <div style="flex: 0 0 40%; display: flex; justify-content: center; align-items: center;">
                    <span id="result_${r.id}" style="font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</span>
                </div>
            </div>
        `;
    });
    tableHtml += `</div>`;

    const contentHtml = `
        <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; line-height: 1.4; padding: 5px;">
            
            <div style="margin-bottom: 12px;">
                A slot is a single reward drop. Each mission gives 4 reward drops and those drops can be duplicates. Because you can complete 3 missions a day, you get exactly 12 reward slots per day.
            </div>

            <div style="margin-top: 15px; border-top: 2px solid #ccc; padding-top: 15px; margin-bottom: 12px;">
                <span style="font-size: 1rem; text-transform: uppercase;">Targeting Strategy</span><br>
                Your expected daily slots depend on how many different types of resources you choose to focus on. For example, most players target 4 types (Green Ticket, Eggshell, Mount Key, and Green Potion) while actively avoiding Gold and Red Potion.
            </div>
            
            <p style="margin-bottom: 8px;">If you do not refresh, your daily slots average out to:</p>
            
            <div style="background-color: #f2f2f2; border-radius: 8px; padding: 10px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px;">
                    <span>Target <strong>4 types</strong>:</span> 
                    <span><strong>2.5</strong> <span style="font-size: 0.8rem; color: #666;">(1.0 for others)</span></span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px;">
                    <span>Target <strong>3 types</strong>:</span> 
                    <span><strong>2.7</strong> <span style="font-size: 0.8rem; color: #666;">(1.3 for others)</span></span>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #ccc; padding-bottom: 6px; margin-bottom: 6px;">
                    <span>Target <strong>2 types</strong>:</span> 
                    <span><strong>3.0</strong> <span style="font-size: 0.8rem; color: #666;">(1.5 for others)</span></span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Target <strong>1 type</strong>:</span> 
                    <span><strong>3.5</strong> <span style="font-size: 0.8rem; color: #666;">(1.7 for others)</span></span>
                </div>
            </div>

            <p style="margin-bottom: 8px;"> The averages above assume no rerolls. If you spend gems to refresh the missions, your slot distributions may be different. If you have different resource target distribution, you can manually type your actual numbers into the inputs and make sure the total adds up to 12. </p>

            <div style="margin-top: 15px; border-top: 2px solid #ccc; padding-top: 15px;">
                <span style="font-size: 1rem; text-transform: uppercase;">Expected Slots Calculator</span><br>
                Assign a value to each resource below (higher number = higher priority, 0 = avoid). The tool will simulate 100,000 times to show your expected daily slots. <p>Note: These results are only accurate if your actual in-game choices match the priorities you set here.</p></span>
                
                ${tableHtml}
                
                <style>
                    .btn-calc-slots:hover:not(:disabled) { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
                    .btn-calc-slots:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
                    .btn-calc-slots:disabled { opacity: 0.7; cursor: not-allowed; }
                    
                    .btn-copy-slots:hover:not(:disabled) { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
                    .btn-copy-slots:active:not(:disabled) { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
                    .btn-copy-slots:disabled { opacity: 0.7; cursor: not-allowed; }
                </style>

                <div style="padding: 10px 0 5px 0; display: flex; justify-content: space-between; gap: 8px;">
                    <button id="runSimBtn" class="btn-calc-slots" onclick="window.runMissionSimulation()" style="flex: 1; padding: 0 8px 5px 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                        <span id="runSimText" style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; text-align: center; line-height: 1.1;">
                            Calculate Slots
                        </span>
                    </button>
                    
                    <button id="copySlotsBtn" class="btn-copy-slots" onclick="window.copySimulationToSlots()" style="flex: 1; padding: 0 8px 5px 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                        <span id="copySlotsText" style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 0.85rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; text-align: center; line-height: 1.1;">
                            Apply Slots
                        </span>
                    </button>
                </div>

            </div>
        </div>

        <img src="x" style="display:none;" onerror="
            setTimeout(() => {
                const closeBtns = document.querySelectorAll('.btn-close-floating');
                const activeCloseBtn = closeBtns[closeBtns.length - 1];
                if (activeCloseBtn) {
                    activeCloseBtn.onclick = function(e) {
                        e.preventDefault();
                        if (typeof window.openWeeklyBreakdownModal === 'function') {
                            window.openWeeklyBreakdownModal();
                            setTimeout(() => {
                                if (typeof window.switchWeeklyTab === 'function') {
                                    window.switchWeeklyTab('mission');
                                }
                            }, 50);
                        }
                    };
                }
            }, 50);
        ">
    `;

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('missionInfo', contentHtml);
    }
};

window.openWeeklyBreakdownModal = function() {
    if (typeof MODAL_SETTINGS !== 'undefined' && !MODAL_SETTINGS.weeklyBreakdown) {
        MODAL_SETTINGS.weeklyBreakdown = { 
            title: "WEEKLY REWARDS OVERVIEW", 
            headerColor: "#ebf8fa", 
            titleColor: "#000000", 
            disclaimer: "Detailed breakdown of weekly income sources." 
        };
    }
    
    const bd = window.latestWeeklyBreakdown || {};
    
    const resources = [
        { key: 'hammer', name: 'Hammer', icon: 'fm_hammer.png' },
        { key: 'gold', name: 'Gold', icon: 'fm_gold.png' },
        { key: 'ticket', name: 'Green Ticket', icon: 'green_ticket.png' },
        { key: 'eggshell', name: 'Eggshell', icon: 'eggshell.png' },
        { key: 'potion', name: 'Red Potion', icon: 'red_potion.png' },
        { key: 'mountKey', name: 'Mount Key', icon: 'mount_key.png' },
        { key: 'greenPotion', name: 'Green Potion', icon: 'green_potion.png' }
    ];

    // --- REUSABLE RENDER FUNCTION ---
    const renderBA = (vB, vA, isPct, key, isTitle = false) => {
        const fmt = (v) => {
            if (isPct) return v.toFixed(1) + '%';
            if (!v || v === 0) return isPct ? "0.0%" : "-";
            if (key === 'gold') {
                if (v < 10000) return Math.round(v).toLocaleString('en-US');
                if (v < 1000000) return parseFloat((v/1000).toFixed(1)) + 'k';
                return parseFloat((v/1000000).toFixed(2)) + 'm';
            }
            return Math.round(v).toLocaleString('en-US');
        };

        const strB = fmt(vB);
        const strA = fmt(vA);
        const fontSize = isTitle ? '1rem' : '0.9rem';

        if (Math.abs(vB - vA) < (isPct ? 0.1 : 0.001) || strB === strA) {
            return `
            <div style="width: 100%; display: flex; justify-content: flex-end;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #000; white-space: nowrap;">${strB}</div>
            </div>`;
        } else {
            return `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #000; white-space: nowrap; margin-bottom: 2px;">${strB}</div>
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #27ae60; white-space: nowrap; display: flex; align-items: center;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.85em;">➜</span>${strA}
                </div>
            </div>`;
        }
    };

        // ==========================================
    // TAB 1: BY SOURCE
    // ==========================================
    let sourceHtml = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    const sourceGroups = [
        { id: 'Dungeon', name: 'Dungeon', divider: 14, suffix: ' / Key' },
        { id: 'Idle', name: 'Idle', divider: 7, suffix: ' / Day' },
        { id: 'League', name: 'League', divider: 1, suffix: '' },
        { id: 'War', name: 'Clan War', divider: 1, suffix: '' },
        { id: 'Indiv Rewards', name: 'Indiv. Rewards', divider: 1, suffix: '' },
        { id: 'Mission', name: 'Mission', divider: 1, suffix: '' },
        { id: 'Rally Bonus', name: 'Rally Bonus', divider: 7, suffix: ' / Day' },
        { id: 'Clan Race', name: 'Clan Tech Race', divider: 1, suffix: '' } 
    ];

    sourceGroups.forEach(src => {
        let rowsHtml = '';
        
        resources.forEach(res => {
            const data = bd[res.key]?.[src.id];
            if (data) {
                let vB = data.b / src.divider;
                let vA = data.a / src.divider;

                if (vB > 0 || vA > 0) {
                    rowsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                        <div style="flex: 0 0 50%; display: flex; align-items: center; gap: 8px; box-sizing: border-box;">
                            <img src="icons/${res.icon}" style="width: 20px; height: 20px; object-fit: contain;">
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000;">${res.name}</span>
                        </div>
                        <div style="flex: 0 0 50%; padding-right: 8px; box-sizing: border-box;">
                            ${renderBA(vB, vA, false, res.key, false)}
                        </div>
                    </div>`;
                }
            }
        });

        if (rowsHtml !== '') {
            sourceHtml += `
            <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
                <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: center;">
                    <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; text-transform: uppercase; color: #000;">
                        ${src.name}
                    </span>
                </div>
                <div style="padding: 10px;">
                    <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px;">
                        <div style="flex: 0 0 50%; box-sizing: border-box;">Resource</div>
                        <div style="flex: 0 0 50%; text-align: right; padding-right: 8px; box-sizing: border-box;">Amount${src.suffix}</div>
                    </div>
                    ${rowsHtml}
                </div>
            </div>`;
        }
    });

    sourceHtml += '</div>';


    // ==========================================
    // TAB 2: BY RESOURCE
    // ==========================================
    let resourceHtml = '<div style="display: flex; flex-direction: column; gap: 12px;">';
    
    resources.forEach(res => {
        const data = bd[res.key] || {};
        let totalB = 0, totalA = 0;
        
        const sources = ['Dungeon', 'Idle', 'League', 'War', 'Indiv Rewards', 'Mission', 'Rally Bonus', 'Hammer', 'Clan Race'];
        sources.forEach(src => {
            if (data[src]) {
                totalB += (data[src].b || 0);
                totalA += (data[src].a || 0);
            }
        });
        
        if (totalA === 0 && totalB === 0) return; 
        
        const getPctB = (val) => totalB > 0 ? (val / totalB) * 100 : 0;
        const getPctA = (val) => totalA > 0 ? (val / totalA) * 100 : 0;

        const generateRow = (label, srcData) => {
            if (!srcData) return '';
            const vB = srcData.b || 0;
            const vA = srcData.a || 0;

            if (vB === 0 && vA === 0 && (label === 'Idle' || label === 'Dungeon' || label === 'Clan Tech Race')) return ''; 
            
            return `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                <div style="flex: 0 0 28%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; box-sizing: border-box;">${label}</div>
                <div style="flex: 0 0 42%; padding-right: 8px; box-sizing: border-box;">
                    ${renderBA(vB, vA, false, res.key, false)}
                </div>
                <div style="flex: 0 0 30%; box-sizing: border-box;">
                    ${renderBA(getPctB(vB), getPctA(vA), true, res.key, false)}
                </div>
            </div>`;
        };

        let displayName = res.key === 'gold' ? 'Gold After Hammering' : res.name;

        resourceHtml += `
        <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="icons/${res.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                    <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; text-transform: uppercase; color: #000;">
                        ${displayName}
                    </span>
                </div>
                <div style="flex: 1; display: flex; justify-content: flex-end;">
                    ${renderBA(totalB, totalA, false, res.key, true)}
                </div>
            </div>
            <div style="padding: 10px;">
                <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px;">
                    <div style="flex: 0 0 28%; box-sizing: border-box;">Source</div>
                    <div style="flex: 0 0 42%; text-align: right; padding-right: 8px; box-sizing: border-box;">Amount</div>
                    <div style="flex: 0 0 30%; text-align: right; box-sizing: border-box;">%</div>
                </div>
                ${generateRow('Dungeon', data.Dungeon)}
                ${generateRow('Idle', data.Idle)}
                ${generateRow('League', data.League)}
                ${res.key === 'gold' ? '' : generateRow('War', data.War)}
                ${generateRow('Indiv Rewards', data['Indiv Rewards'])}
                ${res.key === 'hammer' ? generateRow('Rally Bonus', data['Rally Bonus']) : generateRow('Mission', data.Mission)}
                ${res.key === 'greenPotion' ? generateRow('Clan Tech Race', data['Clan Race']) : ''}
                ${res.key === 'gold' ? generateRow('Hammer', data.Hammer) : ''}
            </div>
        </div>`;
    });
    
    resourceHtml += '</div>';

    // ==========================================
    // TAB 3: MISSION CALC HTML
    // ==========================================
    const missionHtml = `
        <div class="daily-card config-card" style="margin-bottom: 15px; border-radius: 10px; border: 2px solid #000; overflow: hidden; background-color: #ffffff !important; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 8px;">
                
                <div style="display: flex; justify-content: center; align-items: center; padding-bottom: 4px;">
                    <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000;">Input the amount of slots for each resources</span>
                    <button class="btn-info" onclick="window.openMissionInfoModal()">i</button>
                </div>

                ${[
                    {id: 'gold', icon: 'fm_gold.png'},
                    {id: 'ticket', icon: 'green_ticket.png'},
                    {id: 'egg', icon: 'eggshell.png'},
                    {id: 'pot', icon: 'red_potion.png'},
                    {id: 'key', icon: 'mount_key.png'},
                    {id: 'gp', icon: 'green_potion.png'}
                ].map(item => {
                    let val = window.missionSlotsMemory?.[item.id] !== undefined ? window.missionSlotsMemory[item.id] : '0';
                    return `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                        <img src="icons/${item.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                        <input type="number" id="ms-slot-${item.id}" value="${val}" min="0" max="12" step="0.01" oninput="if(this.value > 12) this.value = 12; window.updateMissionCalc(); window.updateWeekly();" style="width: 60px; flex-shrink: 0; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important;">
                    </div>
                    `;
                }).join('')}

                <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="icons/fm_hammer.png" style="width: 24px; height: 24px; flex-shrink: 0; object-fit: contain;">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; line-height: 1.1;">Rally Bonus (max 300)</span>
                    </div>
                    <input type="number" id="ms-slot-rally" value="${window.missionSlotsMemory?.rally !== undefined ? window.missionSlotsMemory.rally : '300'}" min="0" max="300" step="1" oninput="if(this.value > 300) this.value = 300; window.updateMissionCalc(); window.updateWeekly();" style="width: 60px; flex-shrink: 0; height: 32px; border: 2px solid #000; border-radius: 6px; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; outline: none; -webkit-text-stroke: 0px transparent !important;">
                </div>

            </div>
        </div>

        <div class="daily-card card-compact" style="border-radius: 10px; border: 2px solid #000; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
            <div class="daily-card-header strip-blue" style="background-color: #ebf8fa; padding: 10px; border-bottom: 2px solid #000; display: flex; justify-content: center; align-items: center;">
                <span style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px; color: #000; text-transform: uppercase;">EXPECTED DAILY MISSION REWARDS</span>
            </div>
            <div style="padding: 12px; display: flex; flex-direction: column; gap: 6px;">
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 12px 2px 12px;">
                    <div id="ms-level-info" style="flex: 0 0 25%; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Mission Lv ?-?</div>
                    <div style="flex: 0 0 35%; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Avg / Slot</div>
                    <div style="flex: 0 0 40%; text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">Daily Avg</div>
                </div>

                ${[
                    {id: 'gold', icon: 'fm_gold.png'},
                    {id: 'ticket', icon: 'green_ticket.png'},
                    {id: 'egg', icon: 'eggshell.png'},
                    {id: 'pot', icon: 'red_potion.png'},
                    {id: 'key', icon: 'mount_key.png'},
                    {id: 'gp', icon: 'green_potion.png'}
                ].map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; padding: 6px 12px; border-radius: 8px;">
                        <div style="flex: 0 0 25%; display: flex; align-items: center;">
                            <img src="icons/${item.icon}" style="width: 24px; height: 24px; object-fit: contain;">
                        </div>
                        <div id="ms-base-${item.id}" style="flex: 0 0 35%; text-align: center; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px #000000;">0</div>
                        <div id="ms-daily-${item.id}" style="flex: 0 0 40%; text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.9rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px #000000;">0</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    // ==========================================
    // FINAL MODAL HTML ASSEMBLY
    // ==========================================
    const contentHtml = `
        <style>
            #modal-tabs-container .seg-btn {
                transition: font-size 0.1s ease, transform 0.1s ease;
            }
        </style>
        <div style="display: flex; justify-content: center; margin-bottom: 15px;">
            <div id="modal-tabs-container" class="segmented-control" style="width: 100%; max-width: 320px; height: 38px; display: flex;">
                <button id="btn-tab-source" class="seg-btn active" onclick="window.switchWeeklyTab('source')" style="flex: 1;">Source</button>
                <button id="btn-tab-resource" class="seg-btn" onclick="window.switchWeeklyTab('resource')" style="flex: 1;">Resource</button>
                <button id="btn-tab-mission" class="seg-btn" onclick="window.switchWeeklyTab('mission')" style="flex: 1;">Mission</button>
            </div>
        </div>
        
        <div id="tab-source">
            ${sourceHtml}
        </div>
        
        <div id="tab-resource" style="display: none;">
            ${resourceHtml}
        </div>

        <div id="tab-mission" style="display: none;">
            ${missionHtml}
        </div>
    `;

    if (typeof renderMasterModal === 'function') {
        renderMasterModal('weeklyBreakdown', contentHtml);
        setTimeout(() => {
            if (typeof window.updateMissionCalc === 'function') window.updateMissionCalc();
        }, 50);
    }
};

// --- WAR CALC MODAL ---
window.openWarOverviewModal = function() {
    if (typeof MODAL_SETTINGS !== 'undefined') {
        MODAL_SETTINGS.warOverview = { 
            title: "WAR OVERVIEW", 
            headerColor: "#ebf8fa", 
            titleColor: "#000000", 
        };
    }

    if (!window.warCalcGlobalData) return;

    const data = window.warCalcGlobalData;
    const days = [data.day1, data.day2, data.day3, data.day4, data.day5];
    const totalPtsB = data.totB || 0;
    const totalPtsA = data.totA || 0;

    const renderBA = (vB, vA, isPct, isSub = false, isTitle = false) => {
        const fmt = (v) => {
            if (isPct) return v.toFixed(1) + '%';
            if (!v || v === 0) return isPct ? "0.0%" : "0";
            if (v < 10000) return Math.round(v).toLocaleString('en-US');
            if (v < 1000000) return parseFloat((v/1000).toFixed(1)) + 'k';
            return parseFloat((v/1000000).toFixed(2)) + 'm';
        };

        const strB = fmt(vB); 
        const strA = fmt(vA);
        const fontSize = isTitle ? '1rem' : (isSub ? '0.8rem' : '0.9rem');
        
        if (Math.abs(vB - vA) < (isPct ? 0.1 : 1) || strB === strA) {
            return `
            <div style="width: 100%; display: flex; justify-content: flex-end;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: ${isSub ? '#555' : '#000'}; white-space: nowrap;">${strB}</div>
            </div>`;
        } else {
            return `
            <div style="width: 100%; display: flex; flex-direction: column; align-items: flex-end; line-height: 1.2;">
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: ${isSub ? '#555' : '#000'}; white-space: nowrap; margin-bottom: 2px;">${strB}</div>
                <div style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: ${fontSize}; -webkit-text-stroke: 0px #000000; color: #27ae60; white-space: nowrap; display: flex; align-items: center;">
                    <span class="calc-arrow" style="margin-right: 4px; font-size: 0.85em;">➜</span>${strA}
                </div>
            </div>`;
        }
    };

    // --- CARD 1: OVERVIEW HTML ---
    let overviewHtml = `
    <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1); margin-bottom: 15px;">
        <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000;">
                TOTAL POINTS
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
                <img src="icons/warpoint.png" style="width: 18px; height: 18px; object-fit: contain;">
                ${renderBA(totalPtsB, totalPtsA, false, false, true)}
            </div>
        </div>
        <div style="padding: 10px;">
            <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px; text-transform: uppercase;">
                <div style="flex: 0 0 25%; box-sizing: border-box;">Day</div>
                <div style="flex: 0 0 45%; text-align: right; padding-right: 8px; box-sizing: border-box; display: flex; justify-content: flex-end; align-items: center;">
                    <img src="icons/warpoint.png" style="width: 15px; height: 15px; object-fit: contain;">
                </div>
                <div style="flex: 0 0 30%; text-align: right; box-sizing: border-box;">%</div>
            </div>`;

    days.forEach((dayData, index) => {
        let vB = dayData.totalB || 0;
        let vA = dayData.totalA || 0;
        let pctB = totalPtsB > 0 ? (vB / totalPtsB) * 100 : 0;
        let pctA = totalPtsA > 0 ? (vA / totalPtsA) * 100 : 0;

        overviewHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                <div style="flex: 0 0 25%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; -webkit-text-stroke: 0px #000000; color: #000; box-sizing: border-box;">Day ${index + 1}</div>
                <div style="flex: 0 0 45%; padding-right: 8px; box-sizing: border-box;">
                    ${renderBA(vB, vA, false)}
                </div>
                <div style="flex: 0 0 30%; box-sizing: border-box;">
                    ${renderBA(pctB, pctA, true)}
                </div>
            </div>`;
    });
    overviewHtml += `</div></div>`;

    // --- CARD 2: BREAKDOWN HTML ---
    const categories = [
        "Forge Equipment", "Forge Upgrade", "Forge Gems", "Dungeon Keys", 
        "Skill Summon", "Skill Upgrade", "Tech Upgrades", "Mount Summon", 
        "Mount Merge", "Egg Hatched", "Egg/Pet Merge"
    ];

    let breakdownHtml = `
    <div style="background-color: #ffffff; border-radius: 10px; overflow: hidden; border: 2px solid #000; box-shadow: 0 4px 0 rgba(0,0,0,0.1);">
        <div style="background-color: #ebf8fa; padding: 10px 12px; border-bottom: 2px solid #000; display: flex; align-items: center; justify-content: center;">
            <div style="font-family: 'Fredoka', sans-serif; font-size: 1rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; text-transform: uppercase;">
                ACTION BREAKDOWN
            </div>
        </div>
        <div style="padding: 10px;">
            <div style="display: flex; font-family: 'Fredoka', sans-serif; font-size: 0.7rem; font-weight: 600; -webkit-text-stroke: 0px #000000; color: #000; padding: 0 12px 6px 12px; text-transform: uppercase;">
                <div style="flex: 0 0 38%; box-sizing: border-box;">Action</div>
                <div style="flex: 0 0 36%; text-align: right; padding-right: 8px; box-sizing: border-box; display: flex; justify-content: flex-end; align-items: center;">
                    <img src="icons/warpoint.png" style="width: 15px; height: 15px; object-fit: contain;">
                </div>
                <div style="flex: 0 0 26%; text-align: right; box-sizing: border-box;">%</div>
            </div>`;

    categories.forEach(categoryName => {
        let catB = 0, catA = 0;
        let dayRows = [];

        days.forEach((dayData, index) => {
            let foundItem = dayData.items.find(i => i.label === categoryName);
            if (foundItem && (foundItem.b > 0 || foundItem.a > 0)) {
                catB += foundItem.b;
                catA += foundItem.a;
                dayRows.push({
                    dayNum: index + 1,
                    b: foundItem.b,
                    a: foundItem.a
                });
            }
        });

        if (catB > 0 || catA > 0) {
            let catPctB = totalPtsB > 0 ? (catB / totalPtsB) * 100 : 0;
            let catPctA = totalPtsA > 0 ? (catA / totalPtsA) * 100 : 0;

            breakdownHtml += `
            <div style="background-color: #f2f2f2; border-radius: 8px; padding: 8px 12px; margin-bottom: 6px;">
                <!-- Category Header -->
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 0 0 38%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.85rem; -webkit-text-stroke: 0px #000000; color: #000; box-sizing: border-box; line-height: 1.1;">
                        ${categoryName}
                    </div>
                    <div style="flex: 0 0 36%; padding-right: 8px; box-sizing: border-box;">
                        ${renderBA(catB, catA, false)}
                    </div>
                    <div style="flex: 0 0 26%; box-sizing: border-box;">
                        ${renderBA(catPctB, catPctA, true)}
                    </div>
                </div>`;

            dayRows.forEach(row => {
                
                let rowPctB = totalPtsB > 0 ? (row.b / totalPtsB) * 100 : 0;
                let rowPctA = totalPtsA > 0 ? (row.a / totalPtsA) * 100 : 0;

                breakdownHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0 0 10px; margin-top: 4px; border-top: 1px dashed #ccc;">
                    <div style="flex: 0 0 38%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.8rem; -webkit-text-stroke: 0px; color: #666; display: flex; align-items: center; gap: 4px;">
                        <span style="color: #999; font-size: 0.9em;">></span> Day ${row.dayNum}
                    </div>
                    <div style="flex: 0 0 36%; padding-right: 8px; box-sizing: border-box;">
                        ${renderBA(row.b, row.a, false, true)}
                    </div>
                    <div style="flex: 0 0 26%; box-sizing: border-box;">
                        ${renderBA(rowPctB, rowPctA, true, true)}
                    </div>
                </div>`;
            });

            breakdownHtml += `</div>`;
        }
    });

    breakdownHtml += `</div></div>`;

    const finalHtml = `<div style="display: flex; flex-direction: column; gap: 5px;">${overviewHtml}${breakdownHtml}</div>`;
    
    if (typeof renderMasterModal === 'function') {
        renderMasterModal('warOverview', finalHtml);
    }
};