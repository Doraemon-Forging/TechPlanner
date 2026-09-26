/**
 * MANAGER.JS
 * Handles multi-profile saving, loading, migration, UI rendering, and reordering.
 */

const ProfileManager = {
    storageKey: 'techPlannerProfiles',
    legacyKey: 'techPlannerData',
    state: { active: null, profiles: {} },
    expandedProfileId: null, 

    init() {
        const preloadIcons = ['icons/accedit.png'];
        preloadIcons.forEach(src => { const img = new Image(); img.src = src; });

        const savedProfiles = localStorage.getItem(this.storageKey);
        if (savedProfiles) {
            this.state = JSON.parse(savedProfiles);
        } else {
            const legacySave = localStorage.getItem(this.legacyKey);
            const id = 'profile_' + Date.now();
            this.state = {
                active: id,
                profiles: {
                    [id]: {
                        name: 'Main Profile',
                        data: legacySave ? JSON.parse(legacySave) : null
                    }
                }
            };
            this.saveToStorage();
        }
        return this.getActiveData();
    },

    getActiveData() {
        if (this.state.active && this.state.profiles[this.state.active]) {
            return this.state.profiles[this.state.active].data;
        }
        return null;
    },

    saveCurrent(data) {
        if (!this.state.active) return;
        if (!this.state.profiles[this.state.active]) {
            this.state.profiles[this.state.active] = { name: 'Main Profile', data: null };
        }
        this.state.profiles[this.state.active].data = data;
        this.saveToStorage();
    },

    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    },

    switchProfile(id, skipSave = false) {
        const wasExpanded = this.expandedProfileId !== null;
        this.expandedProfileId = null; 

        if (id === this.state.active) {
            this.closeModal();
            return;
        }

        if (!this.state.profiles[id]) {
            if (wasExpanded) this.renderModal(); 
            return;
        }

        if (typeof saveTimeout !== 'undefined') {
            clearTimeout(saveTimeout);
        }

        if (!skipSave && typeof captureFullState === 'function') {
            this.saveCurrent(captureFullState());
        }

        window.isSwitchingProfile = true; 

        this.state.active = id;
        this.saveToStorage();

        if (typeof wipeSlateClean === 'function') wipeSlateClean();
        
        const newData = this.getActiveData() || {}; 
        if (typeof loadState === 'function') loadState(newData);

        window.isSwitchingProfile = false;
        if (typeof saveToLocalStorage === 'function') saveToLocalStorage(); 

        this.closeModal();
    },

    createProfile(name) {
        if (!name.trim()) return;
        const id = 'profile_' + Date.now();
        this.state.profiles[id] = { name: name.trim(), data: null };
        this.switchProfile(id);
    },

    // Handles the New Profile Setup Modal
    promptAccountCreation(prefillName = '') {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
            z-index: 999999; font-family: 'Fredoka', sans-serif;
        `;
        
        const modalWrapper = document.createElement('div');
        modalWrapper.style.cssText = `
            display: flex; flex-direction: column; align-items: center; position: relative;
            width: 90%; max-width: 380px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 12px; border: 2px solid #000;
            width: 100%; box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; overflow: hidden;
        `;

        const headerStyle = `
            background-color: #ebf8fa; padding: 12px; border-bottom: 2px solid #000; 
            text-align: center; display: flex; justify-content: center; align-items: center;
        `;

        const titleStyle = `
            font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; 
            -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; letter-spacing: 1px; text-transform: uppercase;
        `;
        
        const btnStyle = (bg, shadow) => `
            padding: 12px; border-radius: 8px; border: 2px solid #000; background-color: ${bg};
            cursor: pointer; font-family: 'Fredoka One', 'Fredoka', sans-serif; font-weight: 500; font-size: 0.9rem; 
            color: #ffffff; -webkit-text-stroke: 2.5px #000000; paint-order: stroke fill;
            box-shadow: inset 0 -4px 0 ${shadow}; transition: transform 0.1s; width: 100%; letter-spacing: 0.5px;
        `;

        modal.innerHTML = `
            <div style="${headerStyle}">
                <span style="${titleStyle}">SETUP NEW PROFILE</span>
            </div>
            <div style="padding: 20px; text-align: center; display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="modal-new-account-name" value="${prefillName}" placeholder="New Profile Name" style="width: 100%; box-sizing: border-box; padding: 10px 15px; border-radius: 8px; border: 2px solid #000; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; outline: none; background-color: #ffffff; color: #000; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); -webkit-text-stroke: 0px transparent; margin-bottom: 8px; transition: border-color 0.2s, transform 0.1s;">
                <button id="btn-brand-new" style="${btnStyle('#00b0ff', '#005680')}">Blank Profile</button>
                <button id="btn-duplicate" style="${btnStyle('#2ecc71', '#27ae60')}">Copy Existing Profile</button>
                <button id="btn-import-old" style="${btnStyle('#ffcc00', '#b38f00')}">Import Old Save File</button>
            </div>
        `;
        
        const closeBtnWrapper = document.createElement('div');
        closeBtnWrapper.style.cssText = `margin-top: -16px; z-index: 10;`;
        
        closeBtnWrapper.innerHTML = `
            <button id="btn-cancel-create" style="
                width: 32px; height: 32px; border-radius: 50%; border: 2px solid #000;
                background-color: #ff4d4d; box-shadow: inset 0 -3px 0 #cc0000;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: transform 0.1s; padding: 0;
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 0px #000);">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        modalWrapper.appendChild(modal);
        modalWrapper.appendChild(closeBtnWrapper);
        overlay.appendChild(modalWrapper);
        document.body.appendChild(overlay);

        const inputField = document.getElementById('modal-new-account-name');
        setTimeout(() => inputField.focus(), 50);
        
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onmousedown = () => { btn.style.transform = 'translateY(2px)'; };
            btn.onmouseup = () => { btn.style.transform = 'translateY(0)'; };
            btn.onmouseleave = () => { btn.style.transform = 'translateY(0)'; };
        });

        const getValidName = () => {
            const name = inputField.value.trim();
            if (!name) {
                inputField.style.transform = 'translateX(-5px)';
                inputField.style.borderColor = '#ff4d4d';
                setTimeout(() => inputField.style.transform = 'translateX(5px)', 50);
                setTimeout(() => inputField.style.transform = 'translateX(-5px)', 100);
                setTimeout(() => {
                    inputField.style.transform = 'translateX(0)';
                    inputField.style.borderColor = '#000';
                }, 150);
                inputField.focus();
                return null;
            }
            return name;
        };

        document.getElementById('btn-brand-new').onclick = () => {
            const name = getValidName();
            if (!name) return;
            document.body.removeChild(overlay);
            this.createProfile(name); 
        };

        document.getElementById('btn-duplicate').onclick = () => {
            const name = getValidName();
            if (!name) return;
            document.body.removeChild(overlay);
            this.promptDuplicateSelection(name); 
        };

        document.getElementById('btn-import-old').onclick = () => {
            const name = getValidName();
            if (!name) return;
            document.body.removeChild(overlay);
            this.createProfile(name); 
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.style.display = 'none';
            fileInput.onchange = () => {
                if (typeof uploadData === 'function') uploadData(fileInput); 
            };
            document.body.appendChild(fileInput);
            fileInput.click();
            
            setTimeout(() => { if (document.body.contains(fileInput)) document.body.removeChild(fileInput); }, 5000);
        };

        document.getElementById('btn-cancel-create').onclick = () => {
            document.body.removeChild(overlay);
        };
    },

    promptDuplicateSelection(newName) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
            z-index: 999999; font-family: 'Fredoka', sans-serif;
        `;
        
        const modalWrapper = document.createElement('div');
        modalWrapper.style.cssText = `
            display: flex; flex-direction: column; align-items: center; position: relative;
            width: 90%; max-width: 380px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #fff; border-radius: 12px; border: 2px solid #000;
            width: 100%; box-shadow: 0 8px 16px rgba(0,0,0,0.2);
            display: flex; flex-direction: column; overflow: hidden;
        `;

        const headerStyle = `
            background-color: #ebf8fa; padding: 12px; border-bottom: 2px solid #000; 
            text-align: center; display: flex; justify-content: center; align-items: center;
        `;

        const titleStyle = `
            font-family: 'Fredoka', sans-serif; font-size: 1.1rem; font-weight: 700; color: #fff; 
            -webkit-text-stroke: 1.5px #000; paint-order: stroke fill; letter-spacing: 1px; text-transform: uppercase;
        `;
        
        let listHtml = '<div style="display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding: 4px;">';
        
        Object.entries(this.state.profiles).forEach(([id, p]) => {
            listHtml += `
                <button class="duplicate-target-btn" data-id="${id}" style="
                    padding: 10px 15px; border-radius: 8px; border: 2px solid transparent; background-color: #f2f2f2;
                    cursor: pointer; font-family: 'Fredoka', sans-serif; font-weight: 600; font-size: 1rem; color: #000;
                    transition: transform 0.1s; width: 100%; text-align: left;
                    display: flex; align-items: center; outline: none;
                ">
                    <span style="-webkit-text-stroke: 0px transparent;">${p.name}</span>
                </button>
            `;
        });
        listHtml += '</div>';

        modal.innerHTML = `
            <div style="${headerStyle}">
                <span style="${titleStyle}">SELECT ACCOUNT</span>
            </div>
            <div style="padding: 15px 20px 20px 20px; display: flex; flex-direction: column; gap: 10px;">
                <div style="text-align: center; font-size: 0.95rem; margin-bottom: 5px; font-family: 'Fredoka', sans-serif !important; font-weight: 600 !important; color: #000000 !important; -webkit-text-stroke: 0px !important; text-shadow: none !important; letter-spacing: 0.5px;">
                    Choose a profile to copy data from:
                </div>
                ${listHtml}
            </div>
        `;
        
        const closeBtnWrapper = document.createElement('div');
        closeBtnWrapper.style.cssText = `margin-top: -16px; z-index: 10;`;
        
        closeBtnWrapper.innerHTML = `
            <button id="btn-cancel-duplicate" style="
                width: 32px; height: 32px; border-radius: 50%; border: 2px solid #000;
                background-color: #ff4d4d; box-shadow: inset 0 -3px 0 #cc0000;
                cursor: pointer; display: flex; align-items: center; justify-content: center;
                transition: transform 0.1s; padding: 0;
            ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 1px 0px #000);">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        modalWrapper.appendChild(modal);
        modalWrapper.appendChild(closeBtnWrapper);
        overlay.appendChild(modalWrapper);
        document.body.appendChild(overlay);
        
        const buttons = overlay.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onmousedown = () => { btn.style.transform = 'translateY(2px)'; };
            btn.onmouseup = () => { btn.style.transform = 'translateY(0)'; };
            btn.onmouseleave = () => { btn.style.transform = 'translateY(0)'; };
        });

        document.getElementById('btn-cancel-duplicate').onclick = () => {
            document.body.removeChild(overlay);
            this.promptAccountCreation(newName);  
        };

        const targetBtns = overlay.querySelectorAll('.duplicate-target-btn');
        targetBtns.forEach(btn => {
            btn.onclick = () => {
                const sourceId = btn.getAttribute('data-id');
                let dataToCopy = null;

                if (sourceId === this.state.active) {
                    if (typeof captureFullState === 'function') {
                        dataToCopy = captureFullState();
                    } else {
                        const savedData = this.getActiveData();
                        if (savedData) dataToCopy = JSON.parse(JSON.stringify(savedData)); 
                    }
                } else {
                    const savedData = this.state.profiles[sourceId].data;
                    if (savedData) dataToCopy = JSON.parse(JSON.stringify(savedData));
                }

                document.body.removeChild(overlay);
                this.createProfile(newName); 
                
                if (dataToCopy) {
                    this.saveCurrent(dataToCopy);
                    if (typeof loadState === 'function') loadState(dataToCopy);
                }
            };
        });
    },

    renameProfile(id, newName) {
        if (!newName.trim() || !this.state.profiles[id]) return;
        this.state.profiles[id].name = newName.trim();
        this.saveToStorage();
        this.renderModal();
    },

    deleteProfile(id) {
        if (Object.keys(this.state.profiles).length <= 1) {
            alert("You cannot delete your only account.");
            return;
        }
        
        if (confirm(`Are you sure you want to delete ${this.state.profiles[id].name}?`)) {
            const isDeletingActive = (this.state.active === id);

            delete this.state.profiles[id];
            if (this.expandedProfileId === id) this.expandedProfileId = null;
            
            if (isDeletingActive) {
                const fallbackId = Object.keys(this.state.profiles)[0];
                this.switchProfile(fallbackId, true); 
            } else {
                this.saveToStorage();
                this.renderModal();
            }
        }
    },

    toggleProfileMenu(id) {
        this.expandedProfileId = (this.expandedProfileId === id) ? null : id;
        this.renderModal();
    },

    moveProfile(id, direction) {
        const entries = Object.entries(this.state.profiles);
        const idx = entries.findIndex(e => e[0] === id);
        if (idx === -1) return;

        if (direction === 'up' && idx > 0) {
            const temp = entries[idx - 1];
            entries[idx - 1] = entries[idx];
            entries[idx] = temp;
        } else if (direction === 'down' && idx < entries.length - 1) {
            const temp = entries[idx + 1];
            entries[idx + 1] = entries[idx];
            entries[idx] = temp;
        } else {
            return;
        }

        this.state.profiles = Object.fromEntries(entries);
        this.saveToStorage();
        this.renderModal();
    },

    openModal() {
        this.expandedProfileId = null;
        this.renderModal();
    },

    closeModal() {
        const modal = document.getElementById('tableModal');
        if (modal) modal.style.display = 'none';
    },

    renderModal() {
        if (typeof MODAL_SETTINGS !== 'undefined' && !MODAL_SETTINGS.accountManager) {
            MODAL_SETTINGS.accountManager = {
                title: "PROFILE MANAGER",
                headerColor: "#ebf8fa",
                titleColor: "#000000",
                disclaimer: ""
            };
        }

        const textFormat = `font-family: 'Fredoka', sans-serif !important; font-size: 1rem !important; color: #000000 !important; -webkit-text-stroke: 0px transparent !important; text-shadow: none !important; font-weight: 600 !important; letter-spacing: 0.5px;`;
        
        const gearBtnStyle = `padding: 6px 12px; border-radius: 8px; border: 2px solid #000; background-color: #00b0ff; cursor: pointer; box-shadow: inset 0 -3px 0 #005680; display: flex; align-items: center; justify-content: center; transition: transform 0.1s;`;
        
        const createBtnStyle = `
            padding: 12px 24px; border-radius: 8px; border: 2px solid #000; background-color: #00b0ff;
            cursor: pointer; font-family: 'Fredoka One', 'Fredoka', sans-serif; font-weight: 500; font-size: 1rem;
            color: #ffffff; -webkit-text-stroke: 2.5px #000000; paint-order: stroke fill;
            box-shadow: inset 0 -4px 0 #005680; transition: transform 0.1s; letter-spacing: 0.5px;
        `;

        let listHtml = '<div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px;">';
        
        const profileKeys = Object.keys(this.state.profiles);

        profileKeys.forEach((id, index) => {
            const p = this.state.profiles[id];
            const isActive = id === this.state.active;
            const isExpanded = id === this.expandedProfileId;
            
            const bg = isActive ? '#ccf0ff' : '#f2f2f2'; 
            const borderStyle = isActive ? 'border: 2px solid #00b0ff;' : 'border: 2px solid transparent;';
            const iconHtml = isActive ? `<span style="color: #00b0ff; font-size: 1.1rem; margin-right: 8px; -webkit-text-stroke: 0px;">▶</span>` : '';
            
            listHtml += `
                <div style="display: flex; flex-direction: column; padding: 10px 15px; border-radius: 8px; background-color: ${bg}; ${borderStyle}">
                    
                    <!-- Main Row -->
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex-grow: 1; ${textFormat} cursor: pointer; display: flex; align-items: center;" onclick="ProfileManager.switchProfile('${id}')">
                            ${iconHtml}${p.name}
                        </div>
                        <div>
                            <button onclick="ProfileManager.toggleProfileMenu('${id}')" style="${gearBtnStyle}" onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='inset 0 -1px 0 #005680';" onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='inset 0 -3px 0 #005680';" onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='inset 0 -3px 0 #005680';" title="Options">
                                <img src="icons/accedit.png" style="width: 20px; height: 20px; object-fit: contain;">
                            </button>
                        </div>
                    </div>
            `;

            if (isExpanded) {
                const disableUp = (index === 0);
                const disableDown = (index === profileKeys.length - 1);
                const disableDelete = (profileKeys.length === 1);

                listHtml += `
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(0,0,0,0.1);">
                        <button class="btn-game-ctrl btn-move" onclick="ProfileManager.moveProfile('${id}', 'up')" ${disableUp ? 'style="opacity:0.4; pointer-events:none;"' : ''}>UP</button>
                        <button class="btn-game-ctrl btn-insert" onclick="ProfileManager.moveProfile('${id}', 'down')" ${disableDown ? 'style="opacity:0.4; pointer-events:none;"' : ''}>DOWN</button>
                        <button class="btn-game-ctrl btn-done" onclick="const n = prompt('New name:', '${p.name}'); if(n) ProfileManager.renameProfile('${id}', n)">RENAME</button>
                        <button class="btn-game-ctrl btn-del" onclick="ProfileManager.deleteProfile('${id}')" ${disableDelete ? 'style="opacity:0.4; pointer-events:none;"' : ''}>DELETE</button>
                    </div>
                `;
            }

            listHtml += `</div>`; 
        });
        
        listHtml += '</div>';

        const bodyContentHTML = `
            ${listHtml}
            <div style="margin-top: 10px; padding: 0 5px; display: flex; justify-content: center;">
                <button onclick="ProfileManager.promptAccountCreation()" style="${createBtnStyle}" 
                    onmousedown="this.style.transform='translateY(2px)'; this.style.boxShadow='inset 0 -2px 0 #005680';" 
                    onmouseup="this.style.transform='translateY(0)'; this.style.boxShadow='inset 0 -4px 0 #005680';" 
                    onmouseleave="this.style.transform='translateY(0)'; this.style.boxShadow='inset 0 -4px 0 #005680';">
                    Create New Profile
                </button>
            </div>
        `;

        if (typeof renderMasterModal === 'function') {
            renderMasterModal('accountManager', bodyContentHTML);
        }
    }
};