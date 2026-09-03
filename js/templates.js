/* js/templates.js */

const HTML_CALC = `
<div id="panel-calc" class="sidebar-panel" style="display: none;">
    <div class="calc-container">
        <div class="calc-tool-card">
            <div class="calc-card-input-area">
                <div class="calc-row-input">
                    <label>Current Forge Lv:</label>
                    <div style="display: flex; gap: 6px;">
                        <select id="calc-forge-asc" class="calc-select-chunky" style="width: 85px;" onchange="syncTargetForgeDropdown(); updateCalculator()"></select>
                        <select id="calc-forge-lv" class="calc-select-chunky" style="width: 85px;" onchange="syncTargetForgeDropdown(); updateCalculator()"></select>
                    </div>
                </div>
                <div class="calc-row-input">
                    <label>Upgrade Start:</label>
                    <input type="datetime-local" id="calc-start-date" class="calc-date-chunky desktop-only" onchange="updateCalculator(); syncCalcMobileDate(this.value)">
                    <div id="calc-mobile-custom-date" class="mobile-only custom-date-group">
                        <select id="cm-month" class="cd-select cd-month" onchange="updateCalcFromDropdowns()"></select>
                        <select id="cm-day" class="cd-select cd-day" onchange="updateCalcFromDropdowns()"></select>
                        <select id="cm-hour" class="cd-select cd-time" onchange="updateCalcFromDropdowns()"></select>
                        <span class="cd-sep">:</span>
                        <select id="cm-min" class="cd-select cd-time" onchange="updateCalcFromDropdowns()"></select>
                    </div>
                </div>
            </div>
            <div id="calc-res-5" class="calc-result-box"></div>
        </div>

        <div class="calc-tool-card">
            <div class="calc-card-input-area">
                <div class="calc-row-input">
                    <label>Target Forge Lv:&nbsp; <button class="btn-info" onclick="openForgeProbModal()" style="vertical-align: middle; margin-bottom: 2px;">i</button></label>
                    <div style="display: flex; gap: 6px;">
                        <select id="calc-target-forge-asc" class="calc-select-chunky" style="width: 85px;" onchange="syncTargetForgeDropdown(); updateCalculator()"></select>
                        <select id="calc-target-forge-lv" class="calc-select-chunky" style="width: 85px;" onchange="updateCalculator()"></select>
                    </div>
                </div>
            </div>
            <div id="calc-res-target-forge" class="calc-result-box"></div>
        </div>

        <div class="calc-tool-card">
            <div class="calc-card-input-area">
                <div class="calc-row-input">
                    <label>Hammer:</label>
                    <input type="text" id="calc-hammers" value="50,000" class="calc-input-chunky" style="width: 140px;"
                        onfocus="unformatInput(this)" 
                        onblur="formatInput(this); updateCalculator()" 
                        oninput="cleanInput(this); updateCalculator()">
                </div>
            </div>
            <div id="calc-res-1" class="calc-result-box"></div>
        </div>

        <div class="calc-tool-card">
            <div class="calc-card-input-area">
                <div class="calc-row-input">
                    <label>Target Gold:</label>
                    <input type="text" id="calc-target" value="10,000,000" class="calc-input-chunky" style="width: 140px;"
                        onfocus="unformatInput(this)" 
                        onblur="formatInput(this); updateCalculator()" 
                        oninput="cleanInput(this); updateCalculator()">
                </div>
            </div>
            <div id="calc-res-2" class="calc-result-box"></div>
        </div>
    </div>
</div>
`;

const HTML_WAR = `
<div id="panel-war" class="sidebar-panel" style="display: none;">
    <div class="log-container">
        <div style="padding: 10px 0 15px 0; display: flex; justify-content: center;">
            <button class="btn-clan-tech" onclick="openClanWarTechModal()" style="padding: 0 24px 5px 24px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                <img src="icons/warcalc.png" style="width: 22px; height: 22px; object-fit: contain; filter: drop-shadow(0px 1.5px 0px rgba(0,0,0,0.8));">
                <span style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 1rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 2px #000;">
                    Clan Tech
                </span>
            </button>
        </div>

        <style>
            .btn-clan-tech:hover { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
            .btn-clan-tech:active { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
            
            #panel-war .segmented-control .seg-btn {
                font-size: 0.85rem;
                transition: font-size 0.15s ease, transform 0.1s ease;
            }
            #panel-war .segmented-control .seg-btn.active {
                font-size: 1rem; 
            }
        </style>

        <div style="display: flex; justify-content: center; width: 100%; margin: 0 0 15px 0;">
            <div class="segmented-control" style="width: calc(100% - 20px); max-width: 360px; height: 46px; margin: 0 auto; z-index: 10; display: flex;">
                <button class="seg-btn active" id="btn-warday-1" onclick="switchWarDayTab(1)" style="flex: 1; line-height: 1.15; padding: 0 2px;">DAY<br>1</button>
                <button class="seg-btn" id="btn-warday-2" onclick="switchWarDayTab(2)" style="flex: 1; line-height: 1.15; padding: 0 2px;">DAY<br>2</button>
                <button class="seg-btn" id="btn-warday-3" onclick="switchWarDayTab(3)" style="flex: 1; line-height: 1.15; padding: 0 2px;">DAY<br>3</button>
                <button class="seg-btn" id="btn-warday-4" onclick="switchWarDayTab(4)" style="flex: 1; line-height: 1.15; padding: 0 2px;">DAY<br>4</button>
                <button class="seg-btn" id="btn-warday-5" onclick="switchWarDayTab(5)" style="flex: 1; line-height: 1.15; padding: 0 2px;">DAY<br>5</button>
            </div>
        </div>

        <div class="daily-card">
            <div class="daily-card-body" id="war-calc-inputs">
                
                <div class="wc-scope">
                    
                    <!-- ================= DAY 1 ================= -->
                    <div id="warday-tab-1" class="warday-content" style="display: block;">
                        
                        <div class="wc-row">
                            <div class="wc-label">Current Forge Lv:</div>
                            <select id="wc-d1-forge-lv" style="width:80px;" onchange="updateWarCalc()"></select>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Hammer:</div>
                            <input type="text" id="wc-hammer" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        
                        <div class="wc-line"></div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Dungeon Key:</div>
                            <input type="text" id="wc-dungeon-key" value="8" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        
                        <div class="wc-line"></div>

                        <div class="wc-row">
                            <div class="wc-label">Skill Summon Lv:</div>
                            <div style="display: flex; gap: 6px; align-items: stretch;">
                                <select id="wc-skill-asc" style="width: 70px; padding: 0 5px; box-sizing: border-box; margin: 0;" onchange="updateWarSkillExpCap(); updateWarCalc()">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="wc-skill-lv" placeholder="1" min="1" max="100" oninput="updateWarSkillExpCap(); updateWarCalc()" onblur="validateLevelOnBlur(this, false); updateWarSkillExpCap(); updateWarCalc()" style="width: 64px; box-sizing: border-box; margin: 0;">
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Skill Summon Exp:</div>
                            <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0; white-space: nowrap;">
                                <input type="number" id="wc-skill-exp" placeholder="0" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, ''); updateWarSkillExpCap(); updateWarCalc()" style="width: 70px;">
                                <span style="font-size:1.1rem; font-weight:700; white-space: nowrap;">/ <span id="wc-skill-max">10</span></span>
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Green Ticket:</div>
                            <input type="text" id="wc-ticket" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                    </div>

                    <!-- ================= DAY 2 ================= -->
                    <div id="warday-tab-2" class="warday-content" style="display: none;">
                        
                        <div class="wc-row">
                            <div class="wc-label">Current Forge Lv:</div>
                            <select id="wc-d2-forge-lv" style="width:80px;" onchange="updateWarForgeNodesCap(); updateWarCalc()"></select>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Forge Upgrade Nodes:</div>
                            <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0; white-space: nowrap;">
                                <input type="number" id="wc-forge-nodes" value="0" placeholder="0" min="0" oninput="updateWarForgeNodesCap(); updateWarCalc()" style="width: 70px;">
                                <span style="font-size:1.1rem; font-weight:700; white-space: nowrap;">/ <span id="wc-forge-nodes-max">10</span></span>
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Gem Spent on Forge:</div>
                            <input type="text" id="wc-forge-gem" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                        <div class="wc-line"></div>

                        <div class="wc-row"><div class="wc-label">Tech Tier I:</div><input type="text" id="wc-tech-I" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier II:</div><input type="text" id="wc-tech-II" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier III:</div><input type="text" id="wc-tech-III" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier IV:</div><input type="text" id="wc-tech-IV" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier V:</div><input type="text" id="wc-tech-V" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        
                        <div class="wc-line"></div>

                        <div class="wc-row" style="margin-bottom: 2px;">
                            <div class="wc-label">Mount Key:</div>
                            <input type="text" id="wc-mount-key" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        <div style="text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.8rem; font-weight: 500; color: #666; margin-bottom: 10px; padding-right: 2px;">
                            Expected Mounts: <span id="wc-d2-mount-yield-text" style="color: #198754; font-weight: 600;">0</span>
                        </div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Mount Merge:</div>
                            <input type="text" id="wc-merge-mount-total" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                    </div>

                    <!-- ================= DAY 3 ================= -->
                    <div id="warday-tab-3" class="warday-content" style="display: none;">
                        
                        <div class="wc-row">
                            <div class="wc-label">Current Forge Lv:</div>
                            <select id="wc-d3-forge-lv" style="width:80px;" onchange="updateWarCalc()"></select>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Hammer:</div>
                            <input type="text" id="wc-d3-hammer" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        
                        <div class="wc-line"></div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Skill Summon Lv:</div>
                            <div style="display: flex; gap: 6px; align-items: stretch;">
                                <select id="wc-d3-skill-asc" style="width: 70px; padding: 0 5px; box-sizing: border-box; margin: 0;" onchange="updateWarSkillExpCap(); updateWarCalc()">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="wc-d3-skill-lv" placeholder="1" min="1" max="100" oninput="updateWarSkillExpCap(); updateWarCalc()" onblur="validateLevelOnBlur(this, false); updateWarSkillExpCap(); updateWarCalc()" style="width: 64px; box-sizing: border-box; margin: 0;">
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Skill Summon Exp:</div>
                            <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0; white-space: nowrap;">
                                <input type="number" id="wc-d3-skill-exp" placeholder="0" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, ''); updateWarSkillExpCap(); updateWarCalc()" style="width: 70px;">
                                <span style="font-size:1.1rem; font-weight:700; white-space: nowrap;">/ <span id="wc-d3-skill-max">10</span></span>
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Green Ticket:</div>
                            <input type="text" id="wc-d3-ticket" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                        <div class="wc-line"></div>

                        <div class="wc-row"><div class="wc-label">Hatch Common Egg:</div><input type="text" id="wc-hatch-common" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Rare Egg:</div><input type="text" id="wc-hatch-rare" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Epic Egg:</div><input type="text" id="wc-hatch-epic" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Legendary Egg:</div><input type="text" id="wc-hatch-legendary" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Ultimate Egg:</div><input type="text" id="wc-hatch-ultimate" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Mythic Egg:</div><input type="text" id="wc-hatch-mythic" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Merge Egg / Pet:</div>
                            <input type="text" id="wc-merge-pet-total" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                    </div>

                    <!-- ================= DAY 4 ================= -->
                    <div id="warday-tab-4" class="warday-content" style="display: none;">
                        
                        <div class="wc-row">
                            <div class="wc-label">Current Forge Lv:</div>
                            <select id="wc-d4-forge-lv" style="width:80px;" onchange="updateWarForgeNodesCap(); updateWarCalc()"></select>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Forge Upgrade Nodes:</div>
                            <div style="display:flex; align-items:center; gap:8px; flex-shrink: 0; white-space: nowrap;">
                                <input type="number" id="wc-d4-forge-nodes" value="0" placeholder="0" min="0" oninput="updateWarForgeNodesCap(); updateWarCalc()" style="width: 70px;">
                                <span style="font-size:1.1rem; font-weight:700; white-space: nowrap;">/ <span id="wc-d4-forge-nodes-max">10</span></span>
                            </div>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Gem Spent on Forge:</div>
                            <input type="text" id="wc-d4-forge-gem" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                        <div class="wc-line"></div>

                        <div class="wc-row">
                            <div class="wc-label">Dungeon Key:</div>
                            <input type="text" id="wc-d4-dungeon-key" value="8" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        
                        <div class="wc-line"></div>

                        <div class="wc-row" style="margin-bottom: 2px;">
                            <div class="wc-label">Mount Key:</div>
                            <input type="text" id="wc-d4-mount-key" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>
                        <div style="text-align: right; font-family: 'Fredoka', sans-serif; font-size: 0.8rem; font-weight: 500; color: #666; margin-bottom: 10px; padding-right: 2px;">
                            Expected Mounts: <span id="wc-d4-mount-yield-text" style="color: #198754; font-weight: 600;">0</span>
                        </div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Mount Merge:</div>
                            <input type="text" id="wc-d4-merge-mount-total" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                    </div>

                    <!-- ================= DAY 5 ================= -->
                    <div id="warday-tab-5" class="warday-content" style="display: none;">
                        
                        <div class="wc-row">
                            <div class="wc-label">Current Forge Lv:</div>
                            <select id="wc-d5-forge-lv" style="width:80px;" onchange="updateWarCalc()"></select>
                        </div>
                        <div class="wc-row">
                            <div class="wc-label">Hammer:</div>
                            <input type="text" id="wc-d5-hammer" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                        <div class="wc-line"></div>

                        <div class="wc-row"><div class="wc-label">Tech Tier I:</div><input type="text" id="wc-d5-tech-I" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier II:</div><input type="text" id="wc-d5-tech-II" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier III:</div><input type="text" id="wc-d5-tech-III" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier IV:</div><input type="text" id="wc-d5-tech-IV" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Tech Tier V:</div><input type="text" id="wc-d5-tech-V" style="width:140px;" oninput="cleanInput(this); updateWarCalc()"></div>
                        
                        <div class="wc-line"></div>

                        <div class="wc-row"><div class="wc-label">Hatch Common Egg:</div><input type="text" id="wc-d5-hatch-common" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Rare Egg:</div><input type="text" id="wc-d5-hatch-rare" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Epic Egg:</div><input type="text" id="wc-d5-hatch-epic" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Legendary Egg:</div><input type="text" id="wc-d5-hatch-legendary" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Ultimate Egg:</div><input type="text" id="wc-d5-hatch-ultimate" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        <div class="wc-row"><div class="wc-label">Hatch Mythic Egg:</div><input type="text" id="wc-d5-hatch-mythic" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()"></div>
                        
                        <div class="wc-row">
                            <div class="wc-label">Merge Egg / Pet:</div>
                            <input type="text" id="wc-d5-merge-pet-total" style="width:140px;" onfocus="unformatInput(this)" onblur="formatInput(this); updateWarCalc()" oninput="cleanInput(this); updateWarCalc()">
                        </div>

                    </div>

                </div>
            </div>
        </div>

        <!-- Card 2: Summary -->
        <div class="daily-card">
            <div class="daily-card-header strip-red">
                <div class="daily-header-title" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    WAR POINTS SUMMARY
                    <button class="btn-info" onclick="openWarOverviewModal()" style="margin-bottom: 2px;">i</button>
                </div>
            </div>
            <div class="daily-card-body">
                <div id="war-calc-summary" style="width: 100%; margin-top: 15px;"></div>
            </div>
        </div>

        <!-- Card 3: Breakdown -->
        <div class="daily-card">
            <div class="daily-card-header strip-red">
                <div class="daily-header-title" id="war-breakdown-title">DAY 1 BREAKDOWN</div>
            </div>
            <div class="daily-card-body">
                <div id="war-calc-results" style="width: 100%;">
                    <div style="text-align: center; color: #666; font-family: 'Fredoka', sans-serif; font-size: 0.9rem;">
                        Loading...
                    </div>
                </div>
            </div>
        </div>

        <!-- Card 4: Action Points Details -->
        <div class="daily-card">
            <div class="daily-card-header strip-red">
                <div class="daily-header-title" id="war-action-points-title">DAY 1 ACTION POINTS</div>
            </div>
            <div class="daily-card-body">
                <div id="war-action-points-container" style="width: 100%;">
                    <div style="text-align: center; color: #666; font-family: 'Fredoka', sans-serif; font-size: 0.9rem;">
                        Loading...
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

const HTML_PET = `
<div id="panel-pet" class="sidebar-panel" style="display: none;">
    <div class="calc-container">
        
        <div style="display: flex; justify-content: center; width: 100%; margin: 5px 0 15px 0;">
            <div class="segmented-control pet-mount-switch" style="width: 220px; height: 36px; margin: 0 auto; z-index: 10;">
                <button class="seg-btn active" id="btn-toggle-pet" onclick="togglePetMountTab('pet')">PET</button>
                <button class="seg-btn" id="btn-toggle-mount" onclick="togglePetMountTab('mount')">MOUNT</button>
            </div>
        </div>

        <div id="view-pet-content">
            <div class="daily-card" style="margin: 0 0 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Pet Stats and Exp</div>
                </div>
                <div class="daily-card-body" style="padding: 15px;">
                <div class="calc-row-input">
                    <label>Ascension:</label>
                    <select id="pet-ascension" class="calc-select-chunky" style="width: 60px; text-align: center; font-size: 0.9rem; padding: 0 4px;" onchange="if(typeof updatePetMount === 'function') updatePetMount(); if(typeof updateMergeResult === 'function') updateMergeResult();">
                        <option value="0" selected>0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                </div>
                    <hr class="pet-hr" style="margin: 15px 0;">        
                    <div class="pet-block" style="border: none; padding: 0;">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label style="margin-top: 6px;">Pet 1:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="pet-1-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetNameOptions(1)"></select>
                                <select id="pet-1-id" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetMount()"></select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="pet-1-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updatePetMount()" onblur="validatePetInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="pet-1-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updatePetMount()" onblur="validatePetInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="pet-1-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="pet-block" style="border: none; padding: 0;">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label style="margin-top: 6px;">Pet 2:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="pet-2-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetNameOptions(2)"></select>
                                <select id="pet-2-id" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetMount()"></select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="pet-2-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updatePetMount()" onblur="validatePetInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="pet-2-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updatePetMount()" onblur="validatePetInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="pet-2-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="pet-block" style="border: none; padding: 0;">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label style="margin-top: 6px;">Pet 3:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="pet-3-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetNameOptions(3)"></select>
                                <select id="pet-3-id" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updatePetMount()"></select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="pet-3-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updatePetMount()" onblur="validatePetInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="pet-3-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updatePetMount()" onblur="validatePetInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="pet-3-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 20px 0; border-top: 2px solid #bdc3c7;">

                    <div class="pet-stat-header">
                    <div class="pet-stat-header-col"><img src="icons/icon_dmg.png" class="pet-stat-icon"></div>
                        <div class="pet-stat-header-col"><img src="icons/icon_hp.png" class="pet-stat-icon"></div>                        
                    </div>
                    <div class="pet-stat-row">
                        <span class="pet-row-label">Pet 1</span>
                        <div class="pet-val-box"><span id="pet-1-stat-dmg">-</span></div>
                        <div class="pet-val-box"><span id="pet-1-stat-hp">-</span></div>
                    </div>
                    <div class="pet-stat-row">
                        <span class="pet-row-label">Pet 2</span>
                        <div class="pet-val-box"><span id="pet-2-stat-dmg">-</span></div>
                        <div class="pet-val-box"><span id="pet-2-stat-hp">-</span></div>                        
                    </div>
                    <div class="pet-stat-row">
                        <span class="pet-row-label">Pet 3</span>
                        <div class="pet-val-box"><span id="pet-3-stat-dmg">-</span></div>
                        <div class="pet-val-box"><span id="pet-3-stat-hp">-</span></div>                        
                    </div>
                    <div class="pet-stat-row">
                        <span class="pet-row-label">Total</span>
                        <div class="pet-val-box"><span id="pet-total-dmg">-</span></div>
                        <div class="pet-val-box"><span id="pet-total-hp">-</span></div>
                    </div>
                    
                    <hr class="pet-hr">
                    
                    <div class="pet-exp-header" style="justify-content: center; padding: 5px 0 10px 0;">
                        <div class="pet-exp-title" style="text-align: center; width: 100%; color: #000;">Max Level Progress</div>
                    </div>
                    <div class="pet-stat-row" style="margin-bottom: 8px;">
                        <span class="pet-row-label" style="width: 55px; flex-shrink: 0;">Pet 1</span>
                        <div class="pet-progress-wrapper">
                            <div class="pet-progress-fill" id="pet-1-bar-fill" style="width: 8.1%;"></div>
                            <div class="pet-progress-text" id="pet-1-bar-text">119,099 / 1,354,184 xp (8.1%)</div>
                        </div>
                    </div>
                    <div class="pet-stat-row" style="margin-bottom: 8px;">
                        <span class="pet-row-label" style="width: 55px; flex-shrink: 0;">Pet 2</span>
                        <div class="pet-progress-wrapper">
                            <div class="pet-progress-fill" id="pet-2-bar-fill" style="width: 0.4%;"></div>
                            <div class="pet-progress-text" id="pet-2-bar-text">1,890 / 489,200 xp (0.4%)</div>
                        </div>
                    </div>
                    <div class="pet-stat-row">
                        <span class="pet-row-label" style="width: 55px; flex-shrink: 0;">Pet 3</span>
                        <div class="pet-progress-wrapper">
                            <div class="pet-progress-fill" id="pet-3-bar-fill" style="width: 0.4%;"></div>
                            <div class="pet-progress-text" id="pet-3-bar-text">1,920 / 489,170 xp (0.4%)</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Pet Merge Calculator</div>
                </div>
                <div class="daily-card-body">
                    <div class="pet-block">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label class="merge-label-long" style="margin-top: 6px;">Main Pet:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="merge-target-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updateMergeNameOptions('target')"></select>
                                <select id="merge-target-id" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updateMergeResult()"></select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="merge-target-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateMergeResult()" onblur="validateMergeInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="merge-target-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updateMergeResult()" onblur="validateMergeInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="merge-target-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr">
                    
                    <div class="pet-block">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label class="merge-label-long" style="margin-top: 6px;">Fodder Pet:</label>
                            <select id="merge-fodder-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updateMergeResult()"></select>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="merge-fodder-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateMergeResult()" onblur="validateMergeInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="merge-fodder-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updateMergeResult()" onblur="validateMergeInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="merge-fodder-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="merge-section-title">Enter quantity to merge for each tier:</div>
                    <div class="bulk-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggCommon.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-common" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggRare.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-rare" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggEpic.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-epic" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggLegendary.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-legendary" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggUltimate.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-ultimate" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <img src="icons/EggMythic.png" style="width: 28px; height: 28px; object-fit: contain;">
                            <input type="number" id="bulk-mythic" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="merge-result-title">New Merged Pet</div>
                    <div style="background-color: #ecf0f1; border-radius: 8px; padding: 8px; margin-bottom: 8px; border: 2px solid #bdc3c7;">
                        <div class="merge-res-row" style="justify-content: center; background: transparent; border: none; padding: 0; margin: 0;">
                            <div id="merge-res-name" class="merge-res-val" style="font-size: 1.1rem; text-align: center;">-</div>
                        </div>
                    </div>

                    <div style="background-color: #ecf0f1; border: 2px solid #000; border-radius: 8px; margin-bottom: 5px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div id="merge-res-dmg" style="width: auto; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</div>    
                        <div id="merge-res-hp" style="width: auto; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</div>
                    </div>
                    
                    <div style="text-align: center; font-size: 0.85rem; color: #ffffff; margin-bottom: 2px; font-family: 'Fredoka', sans-serif;">Current Level Progress</div>
                    <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 8px; height: 24px;">
                        <div class="pet-progress-fill" id="merge-res-current-bar-fill" style="width: 0%;"></div>
                        <div class="pet-progress-text" id="merge-res-current-bar-text">0 / 0 xp (0%)</div>
                    </div>

                    <div style="text-align: center; font-size: 0.85rem; color: #ffffff; margin-bottom: 2px; font-family: 'Fredoka', sans-serif;">Max Level Progress</div>
                    <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 12px; height: 24px;">
                        <div class="pet-progress-fill" id="merge-res-bar-fill" style="width: 0%;"></div>
                        <div class="pet-progress-text" id="merge-res-bar-text">0 / 0 xp (0%)</div>
                    </div>

                </div>
            </div>
        </div>
        
        <div id="view-mount-content" style="display: none;">
            
            <div class="daily-card" style="margin: 0 0 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Mount Merge Calculator</div>
                </div>
                <div class="daily-card-body">
                    <div class="pet-block" style="border: none; padding: 0;">
                    <div class="calc-row-input">
                        <label>Ascension:</label>
                        <select id="mount-ascension" class="calc-select-chunky" style="width: 60px; text-align: center; font-size: 0.9rem; padding: 0 4px;" onchange="if(typeof updateMountMergeResult === 'function') updateMountMergeResult();">
                            <option value="0" selected>0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                        </select>
                    </div>
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label class="merge-label-long" style="margin-top: 6px;">Main Mount:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="mount-target-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updateMountMergeResult()">
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Legendary">Legendary</option>
                                    <option value="Ultimate">Ultimate</option>
                                    <option value="Mythic">Mythic</option>
                                </select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="mount-target-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateMountMergeResult()" onblur="validateMountInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="mount-target-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updateMountMergeResult()" onblur="validateMountInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="mount-target-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr">
                    
                    <div class="pet-block">
                        <div class="calc-row-input" style="align-items: flex-start;">
                            <label class="merge-label-long" style="margin-top: 6px;">Fodder Mount:</label>
                            <div style="display: flex; flex-direction: column; gap: 5px; align-items: flex-end;">
                                <select id="mount-fodder-rarity" class="calc-select-chunky" style="width: 150px; font-size: 0.9rem; padding: 0 4px;" onchange="updateMountMergeResult()">
                                    <option value="None">None</option>
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Legendary">Legendary</option>
                                    <option value="Ultimate">Ultimate</option>
                                    <option value="Mythic">Mythic</option>
                                </select>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Level:</label>
                            <input type="number" id="mount-fodder-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateMountMergeResult()" onblur="validateMountInputs()">
                        </div>
                        <div class="calc-row-input">
                            <label>Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="mount-fodder-exp" class="calc-input-chunky" style="width: 80px;" placeholder="0" min="0" oninput="updateMountMergeResult()" onblur="validateMountInputs()">
                                <span class="calc-label pet-label-sub">/ <span id="mount-fodder-max">0</span></span>
                            </div>
                        </div>
                    </div>
                    
                    <hr class="pet-hr">

                    <div class="pet-block">
                        <div class="calc-row-input">
                            <label>Summon Lv:</label>
                            <input type="number" id="pet-mount-summon-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updatePetMountExpCap(); updateMountMergeResult()">
                        </div>
                        <div class="calc-row-input">
                            <label>Summon Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="pet-mount-summon-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="updatePetMountExpCap(); updateMountMergeResult()">
                                <span class="calc-label pet-label-sub">/ <span id="pet-mount-summon-max">2</span></span>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Mount Key:</label>
                            <input type="text" id="pet-mount-key" class="calc-input-chunky" style="width: 100px;" placeholder="0" onfocus="unformatInput(this)" onblur="formatInput(this); updateMountMergeResult()" oninput="cleanInput(this); updateMountMergeResult()">
                        </div>
                    </div>

                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="merge-section-title">Enter quantity to merge for each tier:</div>
                    <style>
                        /* Change the sizes here to instantly update all 6 circles! */
                        .mount-tier-circle {
                            width: 36px;
                            height: 36px;
                            border-radius: 50%;
                            border: 2px solid #000000;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-shrink: 0;
                        }
                        .mount-tier-img {
                            width: 34px;
                            height: 34px;
                            object-fit: contain;
                        }
                    </style>
                    <div class="bulk-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px;">
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #f1f1f1;">
                                <img src="icons/mount1.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-common" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #5dd9ff;">
                                <img src="icons/mount2.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-rare" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #5dfe8a;">
                                <img src="icons/mount3.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-epic" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #fdff5e;">
                                <img src="icons/mount4.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-legendary" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #ff5d5e;">
                                <img src="icons/mount5.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-ultimate" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                        <div style="display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <div class="mount-tier-circle" style="background-color: #d55cff;">
                                <img src="icons/mount6.png" class="mount-tier-img">
                            </div>
                            <input type="number" id="bulk-mount-mythic" class="calc-input-chunky" placeholder="0" min="0" oninput="updateMountMergeResult()" style="width: 60px !important; max-width: 60px !important; min-width: 0 !important; padding: 4px !important; text-align: center; flex-shrink: 0;">
                        </div>
                    </div>
                    
                    <hr class="pet-hr" style="margin: 15px 0;">
                    
                    <div class="merge-result-title">New Merged Mount</div>
                    <div style="background-color: #ecf0f1; border-radius: 8px; padding: 8px; margin-bottom: 8px; border: 2px solid #bdc3c7;">
                        <div class="merge-res-row" style="justify-content: center; background: transparent; border: none; padding: 0; margin: 0;">
                            <div id="mount-merge-res-name" class="merge-res-val" style="font-size: 1.1rem; text-align: center;">-</div>
                        </div>
                    </div>
                    <div style="background-color: #ecf0f1; border: 2px solid #000; border-radius: 8px; margin-bottom: 8px; padding: 12px 5px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <div id="mount-merge-res-dmg" style="width: auto; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</div>    
                        <div id="mount-merge-res-hp" style="width: auto; font-family: 'Fredoka', sans-serif; font-size: 1.05rem; font-weight: 600; color: #000; -webkit-text-stroke: 0px;">-</div>  
                    </div>

                    <div style="text-align: center; font-size: 0.85rem; color: #ffffff; margin-bottom: 2px; font-family: 'Fredoka', sans-serif;">Current Level Progress</div>
                    <div id="mount-current-progress-container" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px;">
                        <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 24px;">
                            <div class="pet-progress-fill" id="mount-current-bar-fill-before" style="width: 0%; "></div>
                            <div class="pet-progress-text" id="mount-current-bar-text-before">0 / 0 xp (0%)</div>
                        </div>
                        <div id="mount-current-progress-arrow" style="display: none; text-align: center; color: #198754; font-size: 1.1rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
                        <div class="pet-progress-wrapper" id="mount-current-progress-wrapper-after" style="margin-left: 0; margin-bottom: 0; height: 24px; display: none;">
                            <div class="pet-progress-fill" id="mount-current-bar-fill-after" style="width: 0%; background-color: #00e676;"></div>
                            <div class="pet-progress-text" id="mount-current-bar-text-after">0 / 0 xp (0%)</div>
                        </div>
                    </div>

                    <div style="text-align: center; font-size: 0.85rem; color: #ffffff; margin-bottom: 2px; font-family: 'Fredoka', sans-serif;">Max Level Progress</div>
                    <div id="mount-progress-container" style="display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px;">
                        <div class="pet-progress-wrapper" style="margin-left: 0; margin-bottom: 0; height: 24px;">
                            <div class="pet-progress-fill" id="mount-bar-fill-before" style="width: 0%;"></div>
                            <div class="pet-progress-text" id="mount-bar-text-before">0 / 0 xp (0%)</div>
                        </div>
                        <div id="mount-progress-arrow" style="display: none; text-align: center; color: #198754; font-size: 1.1rem; font-weight: 900; -webkit-text-stroke: 0px; line-height: 1;">⬇</div>
                        <div class="pet-progress-wrapper" id="mount-progress-wrapper-after" style="margin-left: 0; margin-bottom: 0; height: 24px; display: none;">
                            <div class="pet-progress-fill" id="mount-bar-fill-after" style="width: 0%; background-color: #00e676;"></div>
                            <div class="pet-progress-text" id="mount-bar-text-after">0 / 0 xp (0%)</div>
                        </div>
                    </div>

                    <div style="display: none;">
                        <div id="mount-res-lv"></div>
                        <div id="mount-res-exp"></div>
                        <div id="mount-res-pulls"></div>

                        <div class="merge-res-row" style="margin-bottom: 8px;">
                            <span class="merge-res-label">Exp to Next Lv</span>
                            <div class="merge-res-val" id="mount-merge-res-next">-</div>
                        </div>
                        <div class="merge-res-row" style="margin-bottom: 8px;">
                            <span class="merge-res-label">Total Exp</span>
                            <div class="merge-res-val" id="mount-merge-res-total">-</div>
                        </div>
                        <div class="merge-res-row" style="margin-bottom: 8px;">
                            <span class="merge-res-label">Exp to Max Lv</span>
                            <div class="merge-res-val" id="mount-merge-res-max">-</div>
                        </div>
                    </div>

                    <div class="merge-res-row" style="margin-bottom: 8px;">
                        <span class="merge-res-label">
                            Exp from Mount Summoned&nbsp;<button class="btn-info" onclick="openMountExpModal()" style="vertical-align: middle; margin-bottom: 2px;">i</button>
                        </span>
                        <div class="merge-res-val" id="mount-res-mexp">-</div>
                    </div>

                    <div class="merge-res-row" style="margin-bottom: 0;">
                        <span class="merge-res-label">Keys to Max Lv</span>
                        <div class="merge-res-val" id="mount-merge-res-keys">-</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;
        
const HTML_EGG = `
<div id="panel-egg" class="sidebar-panel" style="display: none;">
    <div class="log-container">
        <div class="config-card">
            <div class="date-row-styled">
                <label class="drs-label">Start:</label>
                <input type="datetime-local" id="egg-date-desktop" class="drs-input desktop-only" lang="en-GB" onchange="renderEggLog()">
                <div id="egg-mobile-custom-date" class="mobile-only custom-date-group">
                    <select id="em-month" class="cd-select cd-month" onchange="updateFromDropdowns('egg')"></select>
                    <select id="em-day" class="cd-select cd-day" onchange="updateFromDropdowns('egg')"></select>
                    <select id="em-hour" class="cd-select cd-time" onchange="updateFromDropdowns('egg')"></select>
                    <span class="cd-sep">:</span>
                    <select id="em-min" class="cd-select cd-time" onchange="updateFromDropdowns('egg')"></select>
                </div>
            </div>
            <div class="egg-prompt-text">Choose which egg to hatch next:</div>            
            <div class="egg-selector" id="egg-selector-box">
                <button class="egg-btn" onclick="addEggToQueue('common')"><img src="icons/EggCommon.png"></button>
                <button class="egg-btn" onclick="addEggToQueue('rare')"><img src="icons/EggRare.png"></button>
                <button class="egg-btn" onclick="addEggToQueue('epic')"><img src="icons/EggEpic.png"></button>
                <button class="egg-btn" onclick="addEggToQueue('legendary')"><img src="icons/EggLegendary.png"></button>
                <button class="egg-btn" onclick="addEggToQueue('ultimate')"><img src="icons/EggUltimate.png"></button>
                <button class="egg-btn" onclick="addEggToQueue('mythic')"><img src="icons/EggMythic.png"></button>
            </div>
        </div>
        <div id="egg-total-summary"></div>
        <div class="egg-log-container" id="egg-log-list"></div>
        <div class="physical-spacer" style="height: 60px;"></div>
    </div>
</div>
`;

const HTML_WEEKLY = `
<div id="panel-weekly" class="sidebar-panel" style="display: none;">
    <div class="log-container">
        
        <div class="daily-card config-card" style="margin-bottom: 15px;">         
            <div class="daily-card-body" style="padding-bottom: 10px;">
        
                <div class="daily-input-row">
                    <label class="daily-label">Hammer Thief:</label>
                    <div class="war-select-group flex-center">
                        <select id="thief-lvl" class="war-select select-mini" onchange="updateDaily()"></select>
                        <span class="dash-span">-</span>
                        <select id="thief-sub" class="war-select select-mini" onchange="updateDaily()"></select>
                    </div>
                </div>
                
                <div class="daily-input-row">
                    <label class="daily-label">Ghost Town:</label>
                    <div class="war-select-group flex-center">
                        <select id="ghost-lvl" class="war-select select-mini" onchange="updateDaily()"></select>
                        <span class="dash-span">-</span>
                        <select id="ghost-sub" class="war-select select-mini" onchange="updateDaily()"></select>
                    </div>
                </div>
                
                <div class="daily-input-row">
                    <label class="daily-label">Invasion:</label>
                    <div class="war-select-group flex-center">
                        <select id="inv-lvl" class="war-select select-mini" onchange="updateDaily()"></select>
                        <span class="dash-span">-</span>
                        <select id="inv-sub" class="war-select select-mini" onchange="updateDaily()"></select>
                    </div>
                </div>
                
                <div class="daily-input-row" style="padding-bottom: 8px;">
                    <label class="daily-label">Zombie Rush:</label>
                    <div class="war-select-group flex-center">
                        <select id="zombie-lvl" class="war-select select-mini" onchange="updateDaily()"></select>
                        <span class="dash-span">-</span>
                        <select id="zombie-sub" class="war-select select-mini" onchange="updateDaily()"></select>
                    </div>
                </div>

                <div class="daily-input-row">
                    <label class="daily-label">League:</label>
                    <div class="war-select-group flex-center">
                        <select id="weekly-league" class="war-select" style="width: 95px;" onchange="updateWeekly()">
                            <option value="Diamond III" selected>Dmd III</option>
                            <option value="Diamond II">Dmd II</option>
                            <option value="Diamond I">Dmd I</option>
                            <option value="Platinum">Platinum</option>
                            <option value="Gold">Gold</option>
                            <option value="Silver">Silver</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Unranked">Unranked</option>
                        </select>
                        <select id="weekly-rank" class="war-select select-small" style="width: 75px;" onchange="updateWeekly()">
                            <option value="1st" selected>1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="4-5">4-5</option>
                            <option value="6-10">6-10</option>
                            <option value="11-20">11-20</option>
                            <option value="21-50">21-50</option>
                            <option value="51-100">51-100</option>
                        </select>
                    </div>
                </div>
                
                <div class="daily-input-row">
                    <label class="daily-label">Clan War:</label>
                    <div class="war-select-group flex-center">
                        <select id="weekly-war-tier" class="war-select" style="width: 95px;" onchange="updateWeekly()">
                            <option value="SSS-Tier" selected>S++ Tier</option>
                            <option value="SS-Tier">S+ Tier</option>
                            <option value="S-Tier">S Tier</option>
                            <option value="A-Tier">A Tier</option>
                            <option value="B-Tier">B Tier</option>
                            <option value="C-Tier">C Tier</option>
                            <option value="D-Tier">D Tier</option>
                            <option value="E-Tier">E Tier</option>
                            <option value="None">None</option>
                        </select>
                        <select id="weekly-war-win" class="war-select select-small" style="width: 75px;" onchange="updateWeekly()">
                            <option value="Win" selected>Win</option>
                            <option value="Lose">Lose</option>
                        </select>
                    </div>
                </div>
                
                <div class="daily-input-row">
                    <label class="daily-label">Indiv. Rewards:</label>
                    <div class="war-select-group flex-center">
                        <select id="weekly-indiv" class="war-select select-small" style="width: 75px;" onchange="updateWeekly()">
                            <option value="3m">3m</option>
                            <option value="2.5m">2.5m</option>
                            <option value="2m">2m</option>
                            <option value="1.5m">1.5m</option>
                            <option value="1m" selected>1m</option>
                            <option value="900k">900k</option>
                            <option value="800k">800k</option>
                            <option value="700k">700k</option>
                            <option value="600k">600k</option>
                            <option value="500k">500k</option>
                            <option value="450k">450k</option>
                            <option value="400k">400k</option>
                            <option value="350k">350k</option>
                            <option value="300k">300k</option>
                            <option value="250k">250k</option>
                            <option value="200k">200k</option>
                            <option value="150k">150k</option>
                            <option value="100k">100k</option>
                            <option value="75k">75k</option>
                            <option value="50k">50k</option>
                            <option value="20k">20k</option>
                            <option value="10k">10k</option>
                            <option value="None">None</option>
                        </select>
                    </div>
                </div>

                <div class="daily-input-row">
                    <label class="daily-label">Clan Tech Race:</label>
                    <div class="war-select-group flex-center">
                        <select id="weekly-race" class="war-select" style="width: 75px;" onchange="updateWeekly()">
                            <option value="1st" selected>1st</option>
                            <option value="2nd">2nd</option>
                            <option value="3rd">3rd</option>
                            <option value="4th">4th</option>
                            <option value="None">None</option>
                        </select>
                    </div>
                </div>

                <div class="daily-input-row">
                    <label class="daily-label">Potion Asc Bonus:</label>
                    <div class="war-select-group flex-center">
                        <select id="weekly-potion-asc" class="war-select" style="width: 75px;" onchange="updateWeekly()">
                            <option value="0" selected>0%</option>
                            <option value="10">10%</option>
                            <option value="20">20%</option>
                            <option value="30">30%</option>
                            <option value="40">40%</option>
                            <option value="50">50%</option>
                            <option value="60">60%</option>
                            <option value="70">70%</option>
                            <option value="80">80%</option>
                            <option value="90">90%</option>
                            <option value="100">100%</option>
                            <option value="110">110%</option>
                            <option value="120">120%</option>
                        </select>
                    </div>
                </div>

                <!-- CENTERED CLAN TECH BUTTON -->
                <div style="padding: 10px 0 5px 0; display: flex; justify-content: center;">
                    <button class="btn-clan-tech" onclick="openClanTechModal()" style="padding: 0 24px 5px 24px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; height: 45px; background-color: #02a2ff; border: 2px solid #000; border-radius: 12px; cursor: pointer; box-shadow: inset 0 -5px 0 0 #005d96; transition: transform 0.1s ease, box-shadow 0.1s ease, background-color 0.2s ease;">
                        <img src="icons/warcalc.png" style="width: 22px; height: 22px; object-fit: contain; filter: drop-shadow(0px 1.5px 0px rgba(0,0,0,0.8));">
                        <span style="font-family: 'Fredoka One', 'Fredoka', sans-serif; font-size: 1rem; font-weight: 500; color: #fff; text-transform: uppercase; letter-spacing: 0px; -webkit-text-stroke: 2px #000;">
                            Clan Tech
                        </span>
                    </button>
                </div>
                <style>
                    .btn-clan-tech:hover { background-color: #33b5ff !important; transform: translateY(-2px); box-shadow: inset 0 -5px 0 0 #005d96 !important; }
                    .btn-clan-tech:active { transform: translateY(3px) !important; box-shadow: inset 0 -2px 0 0 #005d96 !important; padding-bottom: 2px !important; }
                </style>
            </div>
        </div>

        <div class="daily-card card-compact" style="margin-top: 15px;">
            <div class="daily-card-header strip-blue">
                <span class="daily-header-title">WEEKLY TOTAL REWARDS
                    <button class="btn-info" onclick="if(typeof openWeeklyBreakdownModal==='function') openWeeklyBreakdownModal()" style="vertical-align: middle; margin-left: 6px;">i</button>
                </span>
            </div>
            <div class="daily-card-body">
                <div class="calc-line"><span class="calc-label">Hammer</span><div class="calc-val-group" id="weekly-base-hammer"></div></div>
                <div class="calc-line"><span class="calc-label">Gold</span><div class="calc-val-group" id="weekly-base-gold"></div></div>
                <div class="calc-line"><span class="calc-label">Green Ticket</span><div class="calc-val-group" id="weekly-base-ticket"></div></div>
                <div class="calc-line"><span class="calc-label">Eggshell</span><div class="calc-val-group" id="weekly-base-eggshell"></div></div>
                <div class="calc-line"><span class="calc-label">Red Potion</span><div class="calc-val-group" id="weekly-base-potion"></div></div>
                <div class="calc-line"><span class="calc-label">Mount Key</span><div class="calc-val-group" id="weekly-base-mountkey"></div></div>
                <div class="calc-line"><span class="calc-label">Green Potion</span><div class="calc-val-group" id="weekly-base-greenpotion"></div></div>
            </div>
        </div>

        <div class="daily-card card-compact" style="margin-top: 15px;">
            <div class="daily-card-header strip-blue">
                <span class="daily-header-title">ASCENSION PROGRESSION</span>
            </div>
            <div class="daily-card-body">                    
                <div class="pet-block" style="border: none; padding: 0; margin: 0 0 10px 0;">
                    <div class="calc-row-input">
                        <label>Skill Summon Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-skill-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateAscensionCaps('skill'); updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-skill-lv" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateAscensionCaps('skill'); updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, false); updateAscensionCaps('skill'); updateWeekly()">
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-skill-exp">Skill Summon Exp:</label>
                        <div class="pet-flex-center" style="display: flex; align-items: center;">
                            <input type="number" id="asc-skill-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="updateAscensionCaps('skill'); updateWeekly()">
                            <span class="calc-label pet-label-sub" style="margin-left: 5px;">/ <span id="asc-skill-max">10</span></span>
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-skill-inv">Green Tickets:</label>
                        <input type="text" id="asc-skill-inv" class="calc-input-chunky" style="width: 80px;" placeholder="0" onfocus="unformatInput(this)" onblur="formatInput(this); updateWeekly()" oninput="cleanInput(this); updateWeekly()">
                    </div>
                    <div class="calc-row-input">
                        <label>Target Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-skill-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-skill-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, true); updateWeekly()">
                        </div>
                    </div>
                </div>

                <hr class="pet-hr" style="margin: 10px 0;">

                <div class="pet-block" style="border: none; padding: 0; margin: 0 0 10px 0;">
                    <div class="calc-row-input">
                        <label>Pet Summon Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-pet-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateAscensionCaps('pet'); updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-pet-lv" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateAscensionCaps('pet'); updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, false); updateAscensionCaps('pet'); updateWeekly()">
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-pet-exp">Pet Summon Exp:</label>
                        <div class="pet-flex-center" style="display: flex; align-items: center;">
                            <input type="number" id="asc-pet-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="updateAscensionCaps('pet'); updateWeekly()">
                            <span class="calc-label pet-label-sub" style="margin-left: 5px;">/ <span id="asc-pet-max">3</span></span>
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-pet-inv">Eggshells:</label>
                        <input type="text" id="asc-pet-inv" class="calc-input-chunky" style="width: 80px;" placeholder="0" onfocus="unformatInput(this)" onblur="formatInput(this); updateWeekly()" oninput="cleanInput(this); updateWeekly()">
                    </div>
                    <div class="calc-row-input">
                        <label>Target Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-pet-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-pet-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, true); updateWeekly()">
                        </div>
                    </div>
                </div>

                <hr class="pet-hr" style="margin: 10px 0;">

                <div class="pet-block" style="border: none; padding: 0; margin: 0;">
                    <div class="calc-row-input">
                        <label>Mount Summon Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-mount-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateAscensionCaps('mount'); updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-mount-lv" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateAscensionCaps('mount'); updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, false); updateAscensionCaps('mount'); updateWeekly()">
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-mount-exp">Mount Summon Exp:</label>
                        <div class="pet-flex-center" style="display: flex; align-items: center;">
                            <input type="number" id="asc-mount-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="updateAscensionCaps('mount'); updateWeekly()">
                            <span class="calc-label pet-label-sub" style="margin-left: 5px;">/ <span id="asc-mount-max">16</span></span>
                        </div>
                    </div>
                    <div class="calc-row-input">
                        <label for="asc-mount-inv">Mount Keys:</label>
                        <input type="text" id="asc-mount-inv" class="calc-input-chunky" style="width: 80px;" placeholder="0" onfocus="unformatInput(this)" onblur="formatInput(this); updateWeekly()" oninput="cleanInput(this); updateWeekly()">
                    </div>
                    <div class="calc-row-input">
                        <label>Target Lv:</label>
                        <div style="display: flex; gap: 6px;">
                            <select id="asc-mount-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateWeekly()">
                                <option value="0">Asc 0</option>
                                <option value="1">Asc 1</option>
                                <option value="2">Asc 2</option>
                                <option value="3">Asc 3</option>
                            </select>
                            <input type="number" id="asc-mount-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateWeekly()" onblur="if(typeof validateLevelOnBlur === 'function') validateLevelOnBlur(this, true); updateWeekly()">
                        </div>
                    </div>
                </div>

                <hr class="pet-hr" style="margin: 15px 0;">

                <div style="text-align: center; margin: 5px 0 15px 0; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; -webkit-text-stroke: 0px; line-height: 1.3;">Estimated Weeks to Target Lv</div>
                <div class="calc-line"><span class="calc-label">Skill</span><div class="calc-val-group" id="asc-res-skill-target" style="font-weight: bold; color: #ffeb3b;">--</div></div>
                <div class="calc-line"><span class="calc-label">Pet</span><div class="calc-val-group" id="asc-res-pet-target" style="font-weight: bold; color: #ffeb3b;">--</div></div>
                <div class="calc-line"><span class="calc-label">Mount</span><div class="calc-val-group" id="asc-res-mount-target" style="font-weight: bold; color: #ffeb3b;">--</div></div>

                <hr class="pet-hr" style="margin: 15px 0;">

                <div style="text-align: center; margin: 5px 0 15px 0; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; -webkit-text-stroke: 0px; line-height: 1.3;">Estimated Weeks to Lv 100</div>
                <div class="calc-line"><span class="calc-label">Skill</span><div class="calc-val-group" id="asc-res-skill" style="font-weight: bold; color: #ffeb3b;">--</div></div>
                <div class="calc-line"><span class="calc-label">Pet</span><div class="calc-val-group" id="asc-res-pet" style="font-weight: bold; color: #ffeb3b;">--</div></div>
                <div class="calc-line"><span class="calc-label">Mount</span><div class="calc-val-group" id="asc-res-mount" style="font-weight: bold; color: #ffeb3b;">--</div></div>
            </div>
        </div>

    </div>
</div>
`;

const HTML_EQUIPMENT = `
<style>
    /* EQUIPMENT TYPOGRAPHY RESET */
    #panel-equipment .eq-label {
        font-family: 'Fredoka', sans-serif !important;
        font-weight: 600 !important;
        font-size: 1rem !important;
        color: #000000 !important;
        -webkit-text-stroke: 0px transparent !important;
        text-shadow: none !important;
        letter-spacing: 0.5px;
    }
    #panel-equipment .eq-disclaimer {
        font-family: 'Fredoka', sans-serif !important;
        font-weight: 600 !important;
        letter-spacing: 0.5px;
        font-size: 0.85rem !important;
        color: #333333 !important;
        text-align: center;
        margin-bottom: 12px;
        padding: 0 15px;
        line-height: 1.3;
        -webkit-text-stroke: 0px transparent !important;
        text-shadow: none !important;
    }
    #panel-equipment .text-clean-black {
        font-family: 'Fredoka', sans-serif !important;
        font-weight: 600 !important;
        color: #000000 !important;
        -webkit-text-stroke: 0px transparent !important;
        text-shadow: none !important;
        letter-spacing: 0.5px;
    }
    #panel-equipment .text-clean-green {
        font-family: 'Fredoka', sans-serif !important;
        font-weight: 600 !important;
        color: #198754 !important;
        -webkit-text-stroke: 0px transparent !important;
        text-shadow: none !important;
        letter-spacing: 0.5px;
    }
    #panel-equipment .text-clean-arrow {
        font-family: 'Fredoka', sans-serif !important;
        font-weight: 700 !important;
        color: #198754 !important;
        margin: 0 8px;
        -webkit-text-stroke: 0px transparent !important;
        text-shadow: none !important;
    }
        /* Increase HP/DMG icon size ONLY in the Equipment Panel */
#panel-equipment img[src*="icon_hp.png"], 
#panel-equipment img[src*="icon_dmg.png"] {
    width: 18px !important;  /* Adjust this number to change size */
    height: 18px !important; /* Keep height same as width */
}
    
    /* NEW: Header Button Style */
    .header-info-btn {
        width: 22px; 
        height: 22px; 
        background-color: #000; 
        color: #fff; 
        border-radius: 50%; 
        display: none; /* Hidden by default, shown via JS */
        align-items: center; 
        justify-content: center; 
        font-family: 'Fredoka', sans-serif; 
        font-weight: bold; 
        font-size: 0.9rem; 
        cursor: pointer; 
        user-select: none;
        line-height: 1; 
        padding-top: 1px; 
        padding-left: 1px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        
    }

    #panel-equipment .eq-inline-group {
        display: flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        justify-content: center !important;
        align-items: center !important;
        width: 100% !important;
    }
    #panel-equipment .eq-inline-group > *,
    #panel-equipment .eq-inline-group .calc-val-before,
    #panel-equipment .eq-inline-group .calc-val-after {
        display: inline-flex !important;
        flex-direction: row !important;
        align-items: center !important;
        width: auto !important;
        margin: 0 3px !important;
        white-space: nowrap !important;
    }
    #panel-equipment .eq-inline-group br {
        display: none !important;
    }

    /* MOBILE FIX: Prevent single values from wrapping to the 2nd row */
    @media (max-width: 768px) {
        #panel-equipment .calc-val-group.single-val {
            width: auto !important;
            margin-left: auto !important;
            justify-content: flex-end !important;
        }
        #panel-equipment .calc-val-group.single-val .calc-val-before {
            width: auto !important; 
        }
    }
</style>

<div id="panel-equipment" class="sidebar-panel" style="display:none;">
    <div class="log-container">

        <div class="daily-card config-card">
            <div class="daily-card-body">
                
                <div class="daily-input-row"><label class="daily-label">Ascension:</label>
    <div class="war-select-group flex-center">
        <select id="eq-ascension" class="war-select" style="width: 70px; font-size: 0.9rem; text-align: center;" onchange="if(typeof updateEquipment==='function') updateEquipment()">
            <option value="0" selected>0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
        </select>
    </div>
</div>

                <div class="daily-input-row"><label class="daily-label">Helmet:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-helmet-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-helmet-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Armor:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-armor-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-armor-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Boots:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-boots-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-boots-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Belt:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-belt-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-belt-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row" style="padding-bottom: 2px;"><label class="daily-label" style="font-size: 1rem;">Weapon Type:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-weapon-type" class="war-select" style="width: 120px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()">
                            <option value="Ranged" selected>Ranged</option><option value="Melee">Melee</option><option value="Melee+Shield">Melee+Shield</option>
                        </select>
                    </div>
                </div>
                
                <div class="daily-input-row" style="padding-top: 2px;"><label class="daily-label">Weapon:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-weapon-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-weapon-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Gloves:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-gloves-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-gloves-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Necklace:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-neck-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-neck-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

                <div class="daily-input-row"><label class="daily-label">Ring:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-ring-tier" class="war-select" style="width: 110px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()"><option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option></select>
                        <input type="text" inputmode="numeric" id="eq-ring-lvl" class="daily-input" style="width: 60px;" value="Lv 1" onfocus="this.value = this.value.replace(/[^0-9]/g, '');" onblur="let v = this.value.replace(/[^0-9]/g, ''); if(!v) v = '1'; this.value = 'Lv ' + v; if(typeof updateEquipment==='function') updateEquipment();" oninput="this.value = this.value.replace(/[^0-9]/g, ''); if(parseInt(this.value) > 149) this.value = '149'; if(typeof updateEquipment==='function') updateEquipment();">
                    </div>
                </div>

            </div>
        </div>

        <div class="daily-card">
            <div class="daily-card-header strip-green">
                <span class="daily-header-title">HEALTH AND DAMAGE</span>
            </div>
            <div class="daily-card-body">
                
                <div class="calc-line" style="background-color: #ecf0f1; border: 2px solid #000; margin-bottom: 10px; padding: 10px 5px; display: flex; flex-direction: column; align-items: center; gap: 8px;">
    <div class="eq-inline-group" id="eq-res-total-hp"></div>
    <div class="eq-inline-group" id="eq-res-total-dmg"></div>
</div>

                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqhelmet.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Helmet</span></div>
                    <div class="calc-val-group" id="eq-res-helmet"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqarmor.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Armor</span></div>
                    <div class="calc-val-group" id="eq-res-armor"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqboots.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Boots</span></div>
                    <div class="calc-val-group" id="eq-res-boots"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqbelt.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Belt</span></div>
                    <div class="calc-val-group" id="eq-res-belt"></div>
                </div>
                
                <div class="calc-line" id="eq-line-shield" style="background-color: #ecf0f1; padding-left: 10px; display: none;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqshield.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Shield</span></div>
                    <div class="calc-val-group" id="eq-res-shield"></div>
                </div>

                <hr class="pet-hr">

                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqweapon.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Weapon</span></div>
                    <div class="calc-val-group" id="eq-res-weapon"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqgloves.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Gloves</span></div>
                    <div class="calc-val-group" id="eq-res-gloves"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqneck.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Necklace</span></div>
                    <div class="calc-val-group" id="eq-res-neck"></div>
                </div>
                <div class="calc-line" style="background-color: #ecf0f1; padding-left: 10px;">
                    <div class="calc-label-flex" style="width: 110px; flex-shrink: 0; display: flex; align-items: center; gap: 8px;"><div style="width: 30px; height: 30px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><img src="icons/eqring.png" style="width: 22px; height: 22px; object-fit: contain;"></div><span class="eq-label">Ring</span></div>
                    <div class="calc-val-group" id="eq-res-ring"></div>
                </div>

            </div>
        </div>

        <div class="daily-card">
            <div class="daily-card-header strip-orange" style="text-align: center;">
    <span class="daily-header-title">MAX RANGE LEVEL&nbsp;<button id="btn-eq-range-info" class="header-info-btn" style="vertical-align: middle; margin-bottom: 3px; border: none; padding: 0;">i</button></span>
</div>
            <div class="daily-card-body">
                
                <div id="eq-range-container">
                </div>
            </div>
        </div>

        <div class="daily-card">
            <div class="daily-card-header strip-green" style="text-align: center;">
                <span class="daily-header-title">AVERAGE HEALTH / DAMAGE AT MAX RANGE&nbsp;<button id="btn-eq-avg-info" class="header-info-btn" style="vertical-align: middle; margin-bottom: 3px; border: none; padding: 0;">i</button></span>
            </div>
            <div class="daily-card-body">
                
                <div class="daily-input-row" style="padding-bottom: 2px;"><label class="daily-label">Item Tier:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-avg-tier" class="war-select" style="width: 130px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()">
                            <option value="Primitive">Primitive</option><option value="Medieval">Medieval</option><option value="Early-Modern">Early-Modern</option><option value="Modern">Modern</option><option value="Space">Space</option><option value="Interstellar">Interstellar</option><option value="Multiverse">Multiverse</option><option value="Quantum" selected>Quantum</option><option value="Underworld">Underworld</option><option value="Divine">Divine</option>
                        </select>
                    </div>
                </div>
                <div class="daily-input-row" style="padding-bottom: 10px;"><label class="daily-label">Weapon Type:</label>
                    <div class="war-select-group flex-center">
                        <select id="eq-avg-weapon-type" class="war-select" style="width: 130px; font-size: 0.9rem;" onchange="if(typeof updateEquipment==='function') updateEquipment()">
                            <option value="Ranged" selected>Ranged</option><option value="Melee">Melee</option><option value="Melee+Shield">Melee+Shield</option>
                        </select>
                    </div>
                </div>

                <div id="eq-avg-stats-container"></div>
            </div>
        </div>

        <div class="daily-card">
            <div class="daily-card-header strip-blue" style="text-align: center;">
    <span class="daily-header-title">AVERAGE ITEM SELL PRICE&nbsp;<button id="btn-eq-sell-info" class="header-info-btn" style="vertical-align: middle; margin-bottom: 3px; border: none; padding: 0;">i</button></span>
</div>
            <div class="daily-card-body">
                
                <div id="eq-sell-container">
                </div>
            </div>
        </div>

    </div>
</div>
`;

const HTML_SUMMON = `
<div id="panel-summon" class="sidebar-panel" style="display: none;">
    <div class="calc-container">
        
        <div style="display: flex; justify-content: center; width: 100%; margin: 5px 0 15px 0;">
            <div class="segmented-control" style="width: 300px; height: 36px; margin: 0 auto; z-index: 10;">
                <button class="seg-btn active" id="btn-toggle-sum-skill" onclick="toggleSummonTab('skill')">SKILL</button>
                <button class="seg-btn" id="btn-toggle-sum-pet" onclick="toggleSummonTab('pet')">PET</button>
                <button class="seg-btn" id="btn-toggle-sum-mount" onclick="toggleSummonTab('mount')">MOUNT</button>
            </div>
        </div>

        <div id="view-summon-skill">
            <div class="daily-card" style="margin: 0 0 15px 0;">
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="pet-block" style="border: none; padding: 0; margin: 0;">
                        <div class="calc-row-input">
                            <label>Summon Lv:</label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-skill-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCap('skill'); updateSummonCalc('skill')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-skill-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateSummonCap('skill'); updateSummonCalc('skill')" onblur="validateLevelOnBlur(this, false); updateSummonCap('skill'); updateSummonCalc('skill')">
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Summon Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="sum-skill-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, ''); updateSummonCap('skill'); updateSummonCalc('skill')" onblur="validateExpOnBlur('skill'); updateSummonCalc('skill')">
                                <span class="calc-label pet-label-sub">/ <span id="sum-skill-max">10</span></span>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Green Tickets:</label>
                            <input type="text" id="sum-skill-res" class="calc-input-chunky" style="width: 100px;" placeholder="0" onfocus="unformatInput(this)" onblur="updateSummonCalc('skill'); formatInput(this)" oninput="cleanInput(this); updateSummonCalc('skill')">
                        </div>
                        <div class="calc-row-input">
                            <label>Target Lv:&nbsp; <button class="btn-info" onclick="openSummonProbModal('skill')" style="vertical-align: middle; margin-bottom: 2px;">i</button></label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-skill-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCalc('skill')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-skill-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateSummonCalc('skill')" onblur="validateLevelOnBlur(this, true); updateSummonCalc('skill')">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Summon Milestones</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="merge-res-row" style="margin-bottom: 12px; justify-content: space-between; align-items: center;">
                        <span class="merge-res-label">Summon Lv</span>
                        <div class="merge-res-val" id="sum-skill-res-lv" style="display: flex; flex-direction: column; align-items: flex-end;">-</div>
                    </div>
                    <div id="sum-skill-milestones-container"></div>
                </div>
            </div>

            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Expected Yield & Probability</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="calc-row-input" style="margin-bottom: 15px; align-items: center;">
                        <div style="flex: 1; line-height: 1.2;">
                            <label style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000000; -webkit-text-stroke: 0px; display: block; margin-bottom: 2px;">Target Probability (%)</label>
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 500; font-size: 0.75rem; color: #666666; -webkit-text-stroke: 0px;">Chance to pull at least 1 skill for that tier</span>
                        </div>
                        <div>
                            <input type="number" id="sum-skill-prob" class="calc-input-chunky" style="width: 70px; text-align: center;" value="90" min="0" max="99" oninput="validateProbability(this); updateSummonCalc('skill')">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 10px 15px; background: #e6e9ed; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px;">Skills Summoned</span>
                        <div id="sum-skill-total-yield" style="text-align: right;">-</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 4px; align-items: center;">
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: left; -webkit-text-stroke: 0px; line-height: 1.3;">
                            Yield <button id="btn-sum-skill-yield-info" class="btn-info" onclick="openSummonYieldModal('skill')" style="display:none; vertical-align: middle; margin-bottom: 2px; margin-left: 4px;">i</button>
                        </div>
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: right; -webkit-text-stroke: 0px; line-height: 1.3;">How Many More Skills to Reach Target %</div>
                    </div>
                    <div id="sum-skill-yield-container"></div>
                </div>
            </div>
        </div>

        <div id="view-summon-pet" style="display: none;">
            <div class="daily-card" style="margin: 0 0 15px 0;">
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="pet-block" style="border: none; padding: 0; margin: 0;">
                        <div class="calc-row-input">
                            <label>Summon Lv:</label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-pet-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCap('pet'); updateSummonCalc('pet')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-pet-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateSummonCap('pet'); updateSummonCalc('pet')" onblur="validateLevelOnBlur(this, false); updateSummonCap('pet'); updateSummonCalc('pet')">
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Summon Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="sum-pet-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, ''); updateSummonCap('pet'); updateSummonCalc('pet')" onblur="validateExpOnBlur('pet'); updateSummonCalc('pet')">
                                <span class="calc-label pet-label-sub">/ <span id="sum-pet-max">3</span></span>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Eggshells:</label>
                            <input type="text" id="sum-pet-res" class="calc-input-chunky" style="width: 100px;" placeholder="0" onfocus="unformatInput(this)" onblur="updateSummonCalc('pet'); formatInput(this)" oninput="cleanInput(this); updateSummonCalc('pet')">
                        </div>
                        <div class="calc-row-input">
                            <label>Target Lv:&nbsp; <button class="btn-info" onclick="openSummonProbModal('pet')" style="vertical-align: middle; margin-bottom: 2px;">i</button></label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-pet-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCalc('pet')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-pet-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateSummonCalc('pet')" onblur="validateLevelOnBlur(this, true); updateSummonCalc('pet')">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Summon Milestones</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="merge-res-row" style="margin-bottom: 12px; justify-content: space-between; align-items: center;">
                        <span class="merge-res-label">Summon Lv</span>
                        <div class="merge-res-val" id="sum-pet-res-lv" style="display: flex; flex-direction: column; align-items: flex-end;">-</div>
                    </div>
                    <div id="sum-pet-milestones-container"></div>
                </div>
            </div>

            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Expected Yield & Probability</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="calc-row-input" style="margin-bottom: 15px; align-items: center;">
                        <div style="flex: 1; line-height: 1.2;">
                            <label style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000000; -webkit-text-stroke: 0px; display: block; margin-bottom: 2px;">Target Probability (%)</label>
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 500; font-size: 0.75rem; color: #666666; -webkit-text-stroke: 0px;">Chance to pull at least 1 egg for that tier</span>
                        </div>
                        <div>
                            <input type="number" id="sum-pet-prob" class="calc-input-chunky" style="width: 70px; text-align: center;" value="90" min="0" max="99" oninput="validateProbability(this); updateSummonCalc('pet')">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 10px 15px; background: #e6e9ed; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px;">Eggs Summoned</span>
                        <div id="sum-pet-total-yield" style="text-align: right;">-</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 4px; align-items: center;">
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: left; -webkit-text-stroke: 0px; line-height: 1.3;">
                            Yield <button id="btn-sum-pet-yield-info" class="btn-info" onclick="openSummonYieldModal('pet')" style="display:none; vertical-align: middle; margin-bottom: 2px; margin-left: 4px;">i</button>
                        </div>
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: right; -webkit-text-stroke: 0px; line-height: 1.3;">How Many More Eggs to Reach Target %</div>
                    </div>
                    <div id="sum-pet-yield-container"></div>
                </div>
            </div>
        </div>

        <div id="view-summon-mount" style="display: none;">
            <div class="daily-card" style="margin: 0 0 15px 0;">
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="pet-block" style="border: none; padding: 0; margin: 0;">
                        <div class="calc-row-input">
                            <label>Summon Lv:</label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-mount-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCap('mount'); updateSummonCalc('mount')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-mount-lvl" class="calc-input-chunky" style="width: 60px;" placeholder="1" min="1" max="100" oninput="updateSummonCap('mount'); updateSummonCalc('mount')" onblur="validateLevelOnBlur(this, false); updateSummonCap('mount'); updateSummonCalc('mount')">
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Summon Exp:</label>
                            <div class="pet-flex-center">
                                <input type="number" id="sum-mount-exp" class="calc-input-chunky" style="width: 60px;" placeholder="0" min="0" oninput="this.value = this.value.replace(/[^0-9]/g, ''); updateSummonCap('mount'); updateSummonCalc('mount')">
                                <span class="calc-label pet-label-sub">/ <span id="sum-mount-max">2</span></span>
                            </div>
                        </div>
                        <div class="calc-row-input">
                            <label>Mount Keys:</label>
                            <input type="text" id="sum-mount-res" class="calc-input-chunky" style="width: 100px;" placeholder="0" onfocus="unformatInput(this)" onblur="updateSummonCalc('mount'); formatInput(this)" oninput="cleanInput(this); updateSummonCalc('mount')">
                        </div>
                        <div class="calc-row-input">
                            <label>Target Lv:&nbsp; <button class="btn-info" onclick="openSummonProbModal('mount')" style="vertical-align: middle; margin-bottom: 2px;">i</button></label>
                            <div style="display: flex; gap: 6px;">
                                <select id="sum-mount-target-asc" class="calc-input-chunky" style="width: 75px; padding: 0 5px; text-align: center;" onchange="updateSummonCalc('mount')">
                                    <option value="0">Asc 0</option>
                                    <option value="1">Asc 1</option>
                                    <option value="2">Asc 2</option>
                                    <option value="3">Asc 3</option>
                                </select>
                                <input type="number" id="sum-mount-target-lv" class="calc-input-chunky" style="width: 60px;" placeholder="-" min="1" max="100" oninput="updateSummonCalc('mount')" onblur="validateLevelOnBlur(this, true); updateSummonCalc('mount')">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Summon Milestones</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="merge-res-row" style="margin-bottom: 12px; justify-content: space-between; align-items: center;">
                        <span class="merge-res-label">Summon Lv</span>
                        <div class="merge-res-val" id="sum-mount-res-lv" style="display: flex; flex-direction: column; align-items: flex-end;">-</div>
                    </div>
                    <div id="sum-mount-milestones-container"></div>
                </div>
            </div>
            
            <div class="daily-card" style="margin: 15px 0;">
                <div class="daily-card-header strip-blue">
                    <div class="daily-header-title">Expected Yield & Probability</div>
                </div>
                <div class="daily-card-body" style="padding: 12px 15px;">
                    <div class="calc-row-input" style="margin-bottom: 15px; align-items: center;">
                        <div style="flex: 1; line-height: 1.2;">
                            <label style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000000; -webkit-text-stroke: 0px; display: block; margin-bottom: 2px;">Target Probability (%)</label>
                            <span style="font-family: 'Fredoka', sans-serif; font-weight: 500; font-size: 0.75rem; color: #666666; -webkit-text-stroke: 0px;">Chance to pull at least 1 mount for that tier</span>
                        </div>
                        <div>
                            <input type="number" id="sum-mount-prob" class="calc-input-chunky" style="width: 70px; text-align: center;" value="90" min="0" max="99" oninput="validateProbability(this); updateSummonCalc('mount')">
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 10px 15px; background: #e6e9ed; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);">
                        <span style="font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.95rem; color: #000; -webkit-text-stroke: 0px;">Mounts Summoned</span>
                        <div id="sum-mount-total-yield" style="text-align: right;">-</div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 0 4px; align-items: center;">
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: left; -webkit-text-stroke: 0px; line-height: 1.3;">
                            Yield <button id="btn-sum-mount-yield-info" class="btn-info" onclick="openSummonYieldModal('mount')" style="display:none; vertical-align: middle; margin-bottom: 2px; margin-left: 4px;">i</button>
                        </div>
                        <div style="width: 50%; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 0.9rem; color: #000000; text-align: right; -webkit-text-stroke: 0px; line-height: 1.3;">How Many More Mounts to Reach Target %</div>
                    </div>
                    <div id="sum-mount-yield-container"></div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

const HTML_GEM = `
<div id="panel-gem" class="sidebar-panel" style="display: none;">
    <div class="calc-container">
        
        <div class="daily-card config-card" style="margin-bottom: 15px;">
            <div class="daily-card-body" style="padding: 15px;">
                <div style="font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px; margin-bottom: 12px; text-align: left;">Gems to Time:</div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; border: 2px dashed #bdc3c7; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <img src="icons/Gem.png" style="width:20px; height:20px; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.1));">
                        <input type="number" id="calc-gem-input" placeholder="0" min="0" style="width: 80px; height: 36px; text-align: center; font-size: 1rem; font-weight: 600; border: 2px solid #bdc3c7; border-radius: 6px; outline: none; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;" oninput="updateGemToTime()">
                    </div>

                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border-top: 1px solid #ecf0f1; padding-top: 12px;">
                        <span style="font-weight: 600; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">=</span>
                        <span id="calc-gem-time-res" style="font-size: 1.05rem; font-weight: 600; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; text-align: center;">0s</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="daily-card config-card" style="margin-bottom: 15px;">
            <div class="daily-card-body" style="padding: 15px;">
                <div style="font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px; margin-bottom: 12px; text-align: left;">Time to Gems:</div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 12px; border: 2px dashed #bdc3c7; display: flex; flex-direction: column; gap: 15px; align-items: center;">
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <input type="number" id="calc-time-d" placeholder="0" min="0" style="width: 50px; height: 36px; text-align: center; font-size: 0.95rem; font-weight: 600; border: 2px solid #bdc3c7; border-radius: 6px; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; outline: none;" oninput="updateTimeToGem()">
                            <span style="font-family: 'Fredoka', sans-serif !important; font-size: 0.95rem; font-weight: 600; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">d</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <input type="number" id="calc-time-h" placeholder="0" min="0" style="width: 50px; height: 36px; text-align: center; font-size: 0.95rem; font-weight: 600; border: 2px solid #bdc3c7; border-radius: 6px; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; outline: none;" oninput="updateTimeToGem()">
                            <span style="font-family: 'Fredoka', sans-serif !important; font-size: 0.95rem; font-weight: 600; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">h</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <input type="number" id="calc-time-m" placeholder="0" min="0" style="width: 50px; height: 36px; text-align: center; font-size: 0.95rem; font-weight: 600; border: 2px solid #bdc3c7; border-radius: 6px; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; outline: none;" oninput="updateTimeToGem()">
                            <span style="font-family: 'Fredoka', sans-serif !important; font-size: 0.95rem; font-weight: 600; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">m</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <input type="number" id="calc-time-s" placeholder="0" min="0" style="width: 50px; height: 36px; text-align: center; font-size: 0.95rem; font-weight: 600; border: 2px solid #bdc3c7; border-radius: 6px; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; outline: none;" oninput="updateTimeToGem()">
                            <span style="font-family: 'Fredoka', sans-serif !important; font-size: 0.95rem; font-weight: 600; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">s</span>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; border-top: 1px solid #ecf0f1; padding-top: 12px;">
                        <span style="font-weight: 600; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">=</span>
                        <img src="icons/Gem.png" style="width:20px; height:20px; filter: drop-shadow(0 1px 0 rgba(0,0,0,0.1));">
                        <span id="calc-time-gem-res" style="font-size: 1.05rem; font-weight: 600; font-family: 'Fredoka', sans-serif !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important;">0</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-around; width: 100%; border-top: 1px solid #ecf0f1; padding-top: 12px;">
                        <div style="font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px; margin-bottom: 12px; text-align: left;">
                            Forge <button class="btn-info" onclick="showForgeGemTable()" style="margin: 0; transform: translateY(-1px);">i</button>
                        </div>
                        <div style="font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px; margin-bottom: 12px; text-align: left;">
                            Tech <button class="btn-info" onclick="showTechGemTable()" style="margin: 0; transform: translateY(-1px);">i</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div style="text-align: center; font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px; margin-top: 5px;">
            Note <button class="btn-info" onclick="showGemInfoModal()" style="margin: 0; transform: translateY(-1px);">i</button>
        </div>

    </div>
</div>
`;

const HTML_HELP = `
<style>
    /* Specific styles to fix the Help section typography and contrast */
    .help-header-text {
        font-family: 'Fredoka One', sans-serif !important;
        font-size: 1.15rem !important;
        color: #ffffff !important;
        -webkit-text-stroke: 2.5px #000000 !important;
        paint-order: stroke fill !important;
        margin-bottom: 5px !important;
        display: block;
        letter-spacing: 0.5px;
    }
    .help-body-text {
        font-family: 'Fredoka', sans-serif !important;
        font-size: 0.95rem !important;
        color: #2c3e50 !important; /* Nice solid dark navy/gray */
        -webkit-text-stroke: 0px transparent !important; /* Kills the fuzzy outline */
        text-shadow: none !important;
        font-weight: 500 !important;
        line-height: 1.4 !important;
    }
    .help-card-inner {
        background-color: #ffffff !important;
        border: 2px solid #000000 !important;
        border-radius: 12px !important;
        padding: 15px !important;
        margin-bottom: 15px !important;
        box-shadow: 0 4px 0 rgba(0,0,0,0.1) !important;
    }
    .help-ul {
        margin: 8px 0 0 0 !important;
        padding-left: 20px !important;
    }
    .help-ul li {
        margin-bottom: 6px !important;
    }
    .help-highlight {
        color: #198754 !important; /* Game's green color */
        font-weight: 700 !important;
    }
</style>

<div id="panel-help" class="sidebar-panel" style="display:none;">
    <div class="log-container">
        
        <div style="display: flex; justify-content: center; width: 100%; margin: 5px 0 15px 0;">
            <div class="segmented-control" style="width: 260px; height: 36px; margin: 0 auto; z-index: 10;">
                <button class="seg-btn active" id="btn-help-how" onclick="switchHelpTab('how')">HOW</button>
                <button class="seg-btn" id="btn-help-what" onclick="switchHelpTab('what')">WHAT</button>
                <button class="seg-btn" id="btn-help-who" onclick="switchHelpTab('who')">WHO</button>
            </div>
        </div>

        <div id="help-content-how" class="help-section">
            <div class="config-card" style="padding: 15px; background-color: #EBF5FB !important;">
                
                <div class="help-card-inner">
                    <span class="help-header-text">1. Setup Your Current Tech</span>
                    <div class="help-body-text">Heads to Tech Tree tab and choose <b>SETUP</b> mode to match your current in-game tech levels.</div>
                    <ul class="help-body-text help-ul">
                        <li><b>Level Up:</b> Click a node.</li>
                        <li><b>Level Down:</b> Right-click (PC) or <b>long-tap</b> (Mobile).</li>
                        <li><b>Shortcut:</b> Hit the <b>MAX</b> button to instantly max an entire tier.</li>
                        <li><b>PC Only:</b> Hold <b>Shift + Click</b> to max a single node.</li>
                    </ul>
                </div>

                <div class="help-card-inner">
                    <span class="help-header-text">2. Plan Your Upgrades</span>
                    <div class="help-body-text">Toggle to <b>PLAN</b> mode to queue up your next upgrades.</div>
                    <ul class="help-body-text help-ul">
                    <li><b>Use Gems:</b> Set a Gem amount using the Gem toggle before clicking a node. The planner will automatically calculate and reduce the time required to research the tech.</li>
                    <li><b>Add to Schedule:</b> Click the nodes you want to upgrade. They will automatically be added to your queue.</li>                        
                    </ul>
                </div>

                <div class="help-card-inner">
                    <span class="help-header-text">3. Organize the Schedule</span>
                    <div class="help-body-text">Open the <b>Schedule</b> tab to manage your queue.</div>
                    <ul class="help-body-text help-ul">
                        <li><b>War Start:</b> Set the time when Day 1 of clan war starts. Tech upgrades finishing on Day 2 or Day 5 of war will be highlighted blue color. <p>Note: This tool isn't smart enough to automatically adjust the blue highlights for Daylight Saving Time. Since game servers don't observe DST, you will need to manually update your War Start time here twice a year when your local clocks shift.</P></i></li>
                        <li><b>Mark Done:</b> Click an item in your schedule to reveal its controls, then hit "DONE" to clear it and update your start time and tech.</li>
                        <li><b>Manage Upgrades:</b> Reorder tasks, insert new ones, or add custom delays (like when you are sleeping or working). To change the amount of gem on a tech, click the gem icon in the Schedule tab.</li>
                    </ul>
                </div>

                <div class="help-card-inner" style="margin-bottom: 0;">
                    <span class="help-header-text">4. Review Stats & Yields</span>
                    <ul class="help-body-text help-ul">
                        <li><b>Overall Bonuses:</b> Open the <b>Stats</b> tab for a complete summary of all the stat boosts your current tech setup provides.</li>
                        <li><b>Calculate Yields:</b> Head to the <b>Weekly Gain</b> tabs and input your in-game progression (like Dungeon levels or League ranks). You can see the expected value of the resources that you get. </li>
                    </ul>
                </div>

            </div>
        </div>

        <div id="help-content-what" class="help-section" style="display:none;">
            <div class="config-card" style="padding: 15px; background-color: #EBF5FB !important;">
                
                <div class="help-card-inner">
                    <span class="help-header-text" style="font-size: 1.3rem !important; text-align: center;">Tool Overview</span>
                    <div class="help-body-text" style="text-align: center; margin-bottom: 12px;">
                        This tool has two main purposes: <b>scheduling your tech upgrades</b> and <b>simulating how those upgrades affect your gameplay.</b>
                    </div>
                    <div class="help-body-text" style="font-size: 0.85rem !important; font-style: italic; background-color: #f8f9fa; padding: 10px; border-radius: 8px; border: 1px dashed #bdc3c7;"><div style="margin-bottom: 6px;"><b>Note:</b> When you see <b>100 <span style="font-family: 'Fredoka One', sans-serif;">➔</span> <span class="help-highlight">120</span></b>: the first number is based on your <b>Setup</b>, and the green number is from your finished <b>Plan</b>.</div>
                    <div>If the projected green values are distracting, you can temporarily clear your Schedule to hide the arrows and view only your current stats. You can just press "Undo" afterward to bring your entire schedule right back.</div> </div></div>

                <div class="help-card-inner">
                    <ul class="help-body-text help-ul" style="padding-left: 15px !important; margin-top: 0 !important;">
                        <li><b>Stats:</b> A complete summary of the overall boosts provided by each of your tech.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Equipment:</b> View expected HP and damage. See exactly how increasing your max item level affects the item levels you pull, your overall power, and your economy.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Weekly Gain:</b> Calculates resources earned from the daily dungeons, weekly league and clan war, plus your total weekly haul (which includes 7x your Daily Gain).</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Summon Calc:</b> Calculate how many resources you need to reach certain level of Skill / Egg / Pet summoning and theirs expected yield.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Forge Calc:</b> Calculate how much cost and time needed to reach target Forge Lv. See how much gold are your hammers worth or how many hammers are needed to reach your target gold. You can add the gem value inside the Forge Upgrade Schedule table by clicking the gem at the top or at each level one by one to see when your forge upgrade is ready after using the gem. </li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>War Calc:</b> Estimate your expected clan war points based on the resources you plan to spend.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Gem Calc:</b> Calculate how much time skipped with certain amount of gem and vice versa.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Egg Planner:</b> Schedule your egg hatching queue </li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Pet & Mount:</b> Calculate the amount of EXP and the resulting power for your pets and mounts.</li>
                        <hr style="border: 0; border-top: 1px solid #ecf0f1; margin: 8px 0;">
                        <li><b>Battle Sim:</b> Simulate PvP battle.</li>
                    </ul>
                </div>

            </div>
        </div>

        <div id="help-content-who" class="help-section" style="display:none;">
            <div class="config-card" style="padding: 15px; background-color: #EBF5FB !important;">
                
                <div class="help-card-inner" style="text-align: center;">
                    <span class="help-header-text">Developed By</span>
                    
                    <div style="display: flex; justify-content: center; margin: 10px 0;">
                        <img src="icons/AbyssDoraemon.png" alt="Profile" style="max-width: 150px; height: auto;">
                    </div>
                    
<style>
    .github-credit-link {
        color: #ffffff; /* Current Text Color */
        text-decoration: none;
        font-weight: 800;
        margin-top: 0px;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: 'Fredoka', sans-serif;
    }

    .github-credit-link svg {
        fill: #466370; /* Current Icon Color */
        transition: fill 0.1s ease-in-out;
    }

    .github-credit-link:hover {
        color: #80bde5; 
        text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .github-credit-link:hover svg {
        fill: #80bde5;
        filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
    }

    .github-credit-link span {
        font-size: 0.85rem; 
    }
</style>

<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
    
    <a href="https://github.com/Doraemon-Forging/TechPlanner" target="_blank" class="github-credit-link">
        <svg height="22" width="22" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        <span>Source Code</span>
    </a>

                <div class="help-card-inner" style="text-align: center;">
                    <span class="help-header-text">Special Thanks</span>
                    <div class="help-body-text"><b>Nienna</b>, <b>Hibiscus</b>, and <b>LexAeterna </b></div>
                    <div class="help-body-text" style="font-size: 0.85rem !important; margin-top: 4px;">For providing various in-game data.</div>
                </div>

                <div class="help-card-inner" style="text-align: center; background-color: transparent !important; border: 2px dashed #bdc3c7 !important; box-shadow: none !important; margin-bottom: 0;">
                    <span class="help-header-text" style="color: #7f8c8d !important; -webkit-text-stroke: 0px transparent !important; font-size: 1rem !important;">Disclaimer</span>
                    <div class="help-body-text" style="font-size: 0.8rem !important; color: #7f8c8d !important;">
                        All original game icons, images, and character designs are the property of <b>Lessmore</b>. I do not claim ownership over these assets.
                    </div>
                </div>

            </div>
        </div>

    </div>
</div>
`;

// Helper function to inject the HTML into the placeholders
function loadAllTemplates() {
    const cCalc = document.getElementById('container-calc');
    if (cCalc) cCalc.innerHTML = HTML_CALC;

    const cWar = document.getElementById('container-war');
    if (cWar) cWar.innerHTML = HTML_WAR;

    const cPet = document.getElementById('container-pet');
    if (cPet) cPet.innerHTML = HTML_PET;

    const cEgg = document.getElementById('container-egg');
    if (cEgg) cEgg.innerHTML = HTML_EGG;

    const cWeekly = document.getElementById('container-weekly');
    if (cWeekly) cWeekly.innerHTML = HTML_WEEKLY;

    const cEquip = document.getElementById('container-equipment');
    if (cEquip) cEquip.innerHTML = HTML_EQUIPMENT;

    const cGem = document.getElementById('container-gem');
    if (cGem) cGem.innerHTML = HTML_GEM;

    const cHelp = document.getElementById('container-help');
    if (cHelp) cHelp.innerHTML = HTML_HELP;
}

loadAllTemplates();