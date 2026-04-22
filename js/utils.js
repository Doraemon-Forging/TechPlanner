/**
 * UTILS.JS
 * Formatting, UI Helpers, Date Sync, and Modal Table Builder.
 */

// --- FORMATTING HELPERS ---

function toRoman(num) {
    const roman = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1};
    let str = '';
    for (let i of Object.keys(roman)) {
        let q = Math.floor(num / roman[i]);
        num -= q * roman[i];
        str += i.repeat(q);
    }
    return str;
}

function formatSmartTime(totalMins) {
    if (Math.round(totalMins) >= 1440) {
        let roundedMins = Math.round(totalMins);
        
        const d = Math.floor(roundedMins / 1440);
        roundedMins %= 1440;
        
        const h = Math.floor(roundedMins / 60);
        const m = roundedMins % 60;
        
        let parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        
        return parts.join(' ') || '0m';
    }

    let totalSeconds = Math.round(totalMins * 60);
    
    if (totalSeconds === 0) return `0m`;
    
    const h = Math.floor(totalSeconds / 3600); 
    totalSeconds %= 3600;
    
    const m = Math.floor(totalSeconds / 60);   
    const s = totalSeconds % 60;               

    let parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);

    return parts.join(' ');
}

function formatResourceValue(val, type) {
    if (type === 'hammer') return Math.round(val).toLocaleString('en-US');
    if (val < 1000) return val.toLocaleString('en-US', {maximumFractionDigits: 1});
    if (val < 1000000) return (val / 1000).toFixed(1) + 'k';
    return (val / 1000000).toFixed(2) + 'm';
}

function formatForgeCost(val) {
    if(val < 1000) return val.toLocaleString('en-US');
    if(val < 10000) return (val/1000).toFixed(2) + 'k';
    if(val < 1000000) return (val/1000).toFixed(1) + 'k';
    return (val/1000000).toFixed(2) + 'm';
}

function formatSummonKeys(val) {
    if (val < 1000) return Math.round(val).toLocaleString('en-US');
    if (val < 1000000) return (val / 1000).toFixed(1) + 'k';        
    return (val / 1000000).toFixed(1) + 'm';                        
}

// --- INPUT HELPERS ---

function cleanInput(el) {
    el.value = el.value.replace(/[^0-9.]/g, '');
    if ((el.value.match(/\./g) || []).length > 1) el.value = el.value.replace(/\.+$/, "");
}

function formatInput(el) {
    if(!el.value) return;
    const raw = el.value.replace(/,/g, '');
    const val = parseFloat(raw);
    if(!isNaN(val)) el.value = val.toLocaleString('en-US');
}

function unformatInput(el) {
    if(!el.value) return;
    el.value = el.value.replace(/,/g, '');
}

function validateLevelOnBlur(el, isTarget = false) {
    if (el.value === "") {
        if (!isTarget) el.value = 1; 
        return; 
    }
    
    let val = parseInt(el.value);
    if (val > 100) el.value = 100;
    else if (val < 1) el.value = 1;
}

function toggleDropdown(id) {
    const all = document.querySelectorAll('.dropdown-content');
    all.forEach(d => { if(d.id !== id) d.classList.remove('show'); });
    const el = document.getElementById(id);
    if(el) el.classList.toggle('show');
}

function populateDateDropdowns() {
    const prefixes = ['dm', 'cm', 'em'];
    const baseInputIds = ['start-date', 'calc-start-date', 'egg-date-desktop'];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    prefixes.forEach((prefix, index) => {
        const mEl = document.getElementById(`${prefix}-month`);
        const dEl = document.getElementById(`${prefix}-day`);
        const hEl = document.getElementById(`${prefix}-hour`);
        const minEl = document.getElementById(`${prefix}-min`);
        if (!mEl || !dEl || !hEl || !minEl) return;

        mEl.innerHTML = ''; dEl.innerHTML = ''; hEl.innerHTML = ''; minEl.innerHTML = '';

        let baseDate = new Date();
        const baseInput = document.getElementById(baseInputIds[index]);
        if (baseInput && baseInput.value) {
            const parsed = new Date(baseInput.value);
            if (!isNaN(parsed.getTime())) {
                baseDate = parsed;
            }
        }

        let minDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        let maxDate = new Date(now.getFullYear(), now.getMonth() + 12, 1);

        if (baseDate < minDate) {
            const absoluteMin = new Date(now.getFullYear() - 3, now.getMonth(), 1);
            minDate = baseDate < absoluteMin ? absoluteMin : new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        }
        if (baseDate > maxDate) {
            maxDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
        }

        let current = new Date(minDate);

        while (current <= maxDate) {
            const y = current.getFullYear();
            const mo = current.getMonth();
            const yy = y.toString().slice(-2);
            
            const shortName = monthNames[mo];
            const fullName = `${shortName} '${yy}`;
            
            const opt = new Option(fullName, `${y}-${mo}`);
            opt.setAttribute('data-full', fullName);
            opt.setAttribute('data-short', shortName);
            mEl.add(opt);
            
            current.setMonth(current.getMonth() + 1);
        }

        for (let i = 1; i <= 31; i++) dEl.add(new Option(i, i));
        for (let i = 0; i < 24; i++) hEl.add(new Option(i.toString().padStart(2, '0'), i));
        for (let i = 0; i < 60; i++) minEl.add(new Option(i.toString().padStart(2, '0'), i));

        if (!mEl.dataset.hasEvents) {
            const expand = function() {
                
                if (this.dataset.uiState === 'open') return; 
                this.dataset.uiState = 'open';
            
                if (this.selectedIndex > -1) {
                    this.options[this.selectedIndex].text = this.options[this.selectedIndex].getAttribute('data-full');
                }
            };
            
            const shrink = function() {
                this.dataset.uiState = 'closed';
                if (this.selectedIndex > -1) {
                    Array.from(this.options).forEach(o => o.text = o.getAttribute('data-full'));

                    this.options[this.selectedIndex].text = this.options[this.selectedIndex].getAttribute('data-short');
                }
            };
            
            mEl.addEventListener('mousedown', expand);
            mEl.addEventListener('focus', expand);
            mEl.addEventListener('click', expand);
            
            mEl.addEventListener('blur', shrink);
            mEl.addEventListener('change', shrink);
            
            mEl.dataset.hasEvents = 'true';
            mEl.dataset.uiState = 'closed';
        }
    });
}

function updateFromDropdowns(source) {
    let prefix = 'dm'; 
    let baseInputId = 'start-date';

    if (source === 'calc') { prefix = 'cm'; baseInputId = 'calc-start-date'; }
    if (source === 'egg') { prefix = 'em'; baseInputId = 'egg-date-desktop'; }

    const mEl = document.getElementById(`${prefix}-month`);
    const dEl = document.getElementById(`${prefix}-day`);
    const hEl = document.getElementById(`${prefix}-hour`);
    const minEl = document.getElementById(`${prefix}-min`);

    if(!mEl || !dEl || !hEl || !minEl) return;

    const parts = mEl.value.split('-');
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]);
    let d = parseInt(dEl.value); 

    const maxDaysInMonth = new Date(y, m + 1, 0).getDate();
    if (d > maxDaysInMonth) {
        d = maxDaysInMonth; 
    }

    const h = parseInt(hEl.value);
    const min = parseInt(minEl.value);

    const newDate = new Date(y, m, d, h, min);
    if (isNaN(newDate.getTime())) return;
    
    newDate.setMinutes(newDate.getMinutes() - newDate.getTimezoneOffset());
    const iso = newDate.toISOString().slice(0, 16);

    if (source === 'calc') syncCalcDate(iso); 
    else if (source === 'egg') syncEggDate(iso);
    else syncMainDate(iso);
}

function syncMainDate(val, shouldSave = true) {
    if (!val) return;
    const date = new Date(val);
    if (isNaN(date.getTime())) return;
    const el = document.getElementById('start-date');
    if (el) el.value = val;
    
    const setVal = (id, v) => { 
        const e = document.getElementById(id); 
        if (e) {
            e.value = v; 
            if (id.includes('-month') && e.selectedIndex > -1) {
                Array.from(e.options).forEach(o => o.text = o.getAttribute('data-full'));
                e.options[e.selectedIndex].text = e.options[e.selectedIndex].getAttribute('data-short');
            }
        }
    };
    
    setVal('dm-month', date.getFullYear() + '-' + date.getMonth());
    setVal('dm-day', date.getDate());
    setVal('dm-hour', date.getHours());
    setVal('dm-min', date.getMinutes());
    
    if (typeof updateCalculations === 'function') updateCalculations();
    if (shouldSave && typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function syncCalcDate(val, shouldSave = true) {
    if (!val) return;
    const date = new Date(val);
    if (isNaN(date.getTime())) return;
    const el = document.getElementById('calc-start-date');
    if (el) el.value = val;
    
    const setVal = (id, v) => { 
        const e = document.getElementById(id); 
        if (e) {
            e.value = v; 
            if (id.includes('-month') && e.selectedIndex > -1) {
                Array.from(e.options).forEach(o => o.text = o.getAttribute('data-full'));
                e.options[e.selectedIndex].text = e.options[e.selectedIndex].getAttribute('data-short');
            }
        }
    };
    
    setVal('cm-month', date.getFullYear() + '-' + date.getMonth());
    setVal('cm-day', date.getDate());
    setVal('cm-hour', date.getHours());
    setVal('cm-min', date.getMinutes());
    
    if (typeof updateCalculator === 'function') updateCalculator();
    if (shouldSave && typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

function syncEggDate(val, shouldSave = true) {
    if (!val) return; 
    const date = new Date(val);
    if (isNaN(date.getTime())) return; 
    const el = document.getElementById('egg-date-desktop');
    if (el) el.value = val;
    
    const setVal = (id, v) => { 
        const e = document.getElementById(id); 
        if (e) {
            e.value = v; 
            if (id.includes('-month') && e.selectedIndex > -1) {
                Array.from(e.options).forEach(o => o.text = o.getAttribute('data-full'));
                e.options[e.selectedIndex].text = e.options[e.selectedIndex].getAttribute('data-short');
            }
        }
    };
    
    setVal('em-month', date.getFullYear() + '-' + date.getMonth());
    setVal('em-day', date.getDate());
    setVal('em-hour', date.getHours());
    setVal('em-min', date.getMinutes());
    
    if (typeof renderEggLog === 'function') renderEggLog();
    if (shouldSave && typeof saveToLocalStorage === 'function') saveToLocalStorage();
}

// --- TABLE MODAL BUILDER ---
function showTable(title, iconSrc, statData, headers, rows, pageSize = 30, customTabLabels = null) {
    const modal = document.getElementById('tableModal');
    const content = modal.querySelector('.modal-content');

    content.className = 'modal-content'; 
    content.style.cssText = ''; 

    const tLower = title.toLowerCase();
    let valueIconHTML = '';
    if (tLower.includes('tech') && tLower.includes('cost')) valueIconHTML = `<img src="icons/red_potion.png" class="icon-gold-inline">`;
    else if (tLower.includes('price') || tLower.includes('sell') || tLower.includes('cost')) valueIconHTML = `<img src="icons/fm_gold.png" class="icon-gold-inline">`;
    
    let statHTML = '';
    if (statData && typeof statData === 'object' && statData.label) {
        if (statData.before === statData.after) {
            statHTML = `<div class="modal-sub-row"><span class="stat-val-old">${statData.label}: ${statData.before}</span></div>`;
        } else {
            statHTML = `<div class="modal-sub-row"><span class="stat-val-old">${statData.label} ${statData.before}</span><span class="stat-arrow">➜</span><span class="stat-val-new">${statData.after}</span></div>`;
        }
    }

    const thHTML = headers.map(h => `<th>${h}</th>`).join('');
    
    let footerHTML = '';
    let scrollStyle = 'padding: 10px 20px; background: #ffffff;';

    if (title !== "TECH RESEARCH TIMER" && title !== "EQUIPMENT SELL PRICE") {
        footerHTML = `<div class="modal-footer"><div class="modal-disclaimer">Values may differ slightly from the game</div></div>`;
    } else {
        scrollStyle = 'padding: 10px 20px 25px 20px; background: #ffffff; border-radius: 0 0 16px 16px;';
    }

    content.innerHTML = `
        <button class="btn-close-floating" onclick="document.getElementById('tableModal').style.display='none'"><span>&times;</span></button>
        <div class="modal-header-fixed"><h2 class="modal-title-text">${title}</h2>${statHTML}<div id="modal-tabs-container" class="segmented-control" style="display:none;"></div></div>
        <div id="modal-scroll-area" class="modal-body-scroll" style="${scrollStyle}">
            <table class="clean-table"><thead><tr>${thHTML}</tr></thead><tbody id="modal-tbody"></tbody></table>
        </div>
        ${footerHTML}
    `;

    const tbody = document.getElementById('modal-tbody');
    const tabContainer = document.getElementById('modal-tabs-container');
    const scrollContainer = document.getElementById('modal-scroll-area'); 
    const scrollPositions = {}; 
    let activePageIndex = 0; 
    
    const renderChunk = (start, end) => {
        tbody.innerHTML = ''; 
        for (let i = start; i < end; i++) {
            if (!rows[i]) break;
            const rowData = rows[i];
            const tr = document.createElement('tr');
            const cells = Array.isArray(rowData) ? rowData : Object.values(rowData);
            cells.forEach((cellContent, index) => {
                const td = document.createElement('td');
                const isString = typeof cellContent === 'string';
                const hasArrow = isString && (cellContent.includes('➜') || cellContent.includes('→'));
                if (index > 0) {
                    if (hasArrow) {
                        const separator = cellContent.includes('➜') ? '➜' : '→';
                        const parts = cellContent.split(separator).map(s => s.trim());
                        const cleanBefore = parts[0].replace(/[^0-9.]/g, '');
                        const cleanAfter = (parts[1] || parts[0]).replace(/[^0-9.]/g, '');
                        const rightClass = cleanBefore !== cleanAfter ? 'val-green' : 'val-white';
                        td.innerHTML = `<div class="spine-grid"><div class="spine-left">${valueIconHTML}${parts[0]} </div><div class="spine-center"><span class="stat-arrow-table">➜</span></div><div class="spine-right">${valueIconHTML}<span class="${rightClass}">${parts[1]||parts[0]}</span> </div></div>`;
                    } else {
                        td.innerHTML = `<div style="display:flex; justify-content:center; align-items:center; gap:4px; color:#fff;">${valueIconHTML}${cellContent} </div>`;
                    }
                } else {
                    td.innerHTML = cellContent;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        }
    };

    if (rows.length > pageSize) {
        tabContainer.style.display = 'flex';
        const pageCount = Math.ceil(rows.length / pageSize);
        for (let i = 0; i < pageCount; i++) {
            const btn = document.createElement('button');
            const start = i * pageSize;
            const end = Math.min((i + 1) * pageSize, rows.length);
            btn.innerText = (customTabLabels && customTabLabels[i]) ? customTabLabels[i] : `${start + 1}-${end}`;
            btn.className = 'seg-btn'; 
            btn.onclick = () => {
                scrollPositions[activePageIndex] = scrollContainer.scrollTop;
                Array.from(tabContainer.children).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderChunk(start, end);
                activePageIndex = i;
                setTimeout(() => { scrollContainer.scrollTop = scrollPositions[i] || 0; }, 0);
            };
            tabContainer.appendChild(btn);
            if (i === 0) { btn.classList.add('active'); renderChunk(start, end); }
        }
    } else {
        tabContainer.style.display = 'none';
        renderChunk(0, rows.length);
    }
    modal.style.display = 'block';
}

// ==========================================
// LAYOUT & HEADER VISUALS
// ==========================================

function updateRightPaneVisuals(panelId) {
    const iconEl = document.getElementById('fh-icon');
    const titleEl = document.getElementById('fh-title');

    const img = (src) => `<img src="icons/${src}" style="width: 100%; height: 100%; object-fit: contain;">`;

    let iconHtml = "📜"; 
    let titleText = "SCHEDULE";

    if (panelId === 'logs') { iconHtml = img("icon_timeline.png"); titleText = "SCHEDULE"; }
    else if (panelId === 'stats') { iconHtml = img("icon_stats.png"); titleText = "STATS"; }
    else if (panelId === 'calc') { iconHtml = img("anvil.png"); titleText = "FORGE CALC"; }
    else if (panelId === 'daily') { iconHtml = img("icon_daily.png"); titleText = "DAILY GAIN"; }
    else if (panelId === 'weekly') { iconHtml = img("icon_weekly.png"); titleText = "WEEKLY GAIN"; }
    else if (panelId === 'egg') { iconHtml = img("icon_eggplan.png"); titleText = "EGG PLANNER"; }
    else if (panelId === 'war') { iconHtml = img("warcalc.png"); titleText = "WAR CALC"; }
    else if (panelId === 'pet') { iconHtml = img("petmount.png"); titleText = "PET & MOUNT"; }
    else if (panelId === 'equipment') { iconHtml = img("equipment.png"); titleText = "EQUIPMENT"; }
    else if (panelId === 'summon') { iconHtml = img("summon.png"); titleText = "SUMMON CALC"; }
    else if (panelId === 'help') { iconHtml = img("icon_help.png"); titleText = "HELP"; }

    if(iconEl) iconEl.innerHTML = iconHtml;
    if(titleEl) titleEl.innerText = titleText;

    const logCap = document.getElementById('capsule-logs');
    const eggCap = document.getElementById('capsule-egg');

    if(logCap) {
        if(panelId === 'logs') logCap.classList.add('show-capsule');
        else logCap.classList.remove('show-capsule');
    }

    if(eggCap) {
        if(panelId === 'egg') eggCap.classList.add('show-capsule');
        else eggCap.classList.remove('show-capsule');
    }
}

function togglePetMountTab(tab) {
    const btnPet = document.getElementById('btn-toggle-pet');
    const btnMount = document.getElementById('btn-toggle-mount');
    
    if (btnPet) btnPet.classList.remove('active');
    if (btnMount) btnMount.classList.remove('active');
    
    const activeBtn = document.getElementById(`btn-toggle-${tab}`);
    if (activeBtn) activeBtn.classList.add('active');

    const petContent = document.getElementById('view-pet-content');
    const mountContent = document.getElementById('view-mount-content');
    
    if (tab === 'pet') {
        if (petContent) petContent.style.display = 'block';
        if (mountContent) mountContent.style.display = 'none';
    } else {
        if (petContent) petContent.style.display = 'none';
        if (mountContent) mountContent.style.display = 'block';
    }
}

// WebGL
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('ambient-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const pane = canvas.closest('.left-pane');
    
    let particlesArray = [];
    let currentTheme = 'theme-forge';

    let mouse = { 
        x: null, 
        y: null, 
        radius: 150, 
        isDown: false 
    };

    pane.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;
    });

    pane.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
        mouse.isDown = false; 
    });

    pane.addEventListener('mousedown', () => mouse.isDown = true);
    pane.addEventListener('mouseup', () => mouse.isDown = false);

    function resizeCanvas() {
        canvas.width = pane.clientWidth;
        canvas.height = pane.clientHeight;
        initParticles();
    }
    window.addEventListener('resize', resizeCanvas);

    const themeSettings = {
        'theme-forge': { 
            colors: ['#81c784', '#a5d6a7', '#c8e6c9', '#66bb6a'],
            count: 70, shape: 'circle',
            speedX: () => (Math.random() - 0.5) * 0.5,
            speedY: () => (Math.random() - 0.5) * 0.5
        },
        'theme-spt': { 
            colors: ['#ffd700', '#ffc107', '#ffeb3b', '#ffe082'],
            count: 60, shape: 'square',            
            speedX: () => Math.sin(Math.random() * Math.PI) * 0.3, 
            speedY: () => (Math.random() * -0.4) - 0.2 
        },
        'theme-power': { 
            colors: ['#ff9eaf', '#ffb7c5', '#ffc0cb', '#ffd1dc'],
            count: 80, shape: 'ellipse',            
            speedX: () => (Math.random() * 0.4) + 0.2,
            speedY: () => (Math.random() * 0.4) + 0.2  
        }
    };

    class Particle {
        constructor() {
            this.setup();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }

        setup() {
            const settings = themeSettings[currentTheme] || themeSettings['theme-forge'];
            this.z = Math.random() * 1.3 + 0.2; 
            this.baseSize = (Math.random() * 3 + 1.5);
            this.size = this.baseSize * this.z; 
            this.color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
            this.shape = settings.shape;
            this.baseVx = settings.speedX() * this.z;
            this.baseVy = settings.speedY() * this.z;
            this.vx = this.baseVx;
            this.vy = this.baseVy;
        }

        draw() {
            ctx.globalAlpha = Math.min(this.z * 0.6, 0.8); 
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            if (this.shape === 'circle') {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            } else if (this.shape === 'square') {
                ctx.rect(this.x, this.y, this.size * 2, this.size * 2);
            } else if (this.shape === 'ellipse') {
                let angle = Math.atan2(this.vy, this.vx);
                ctx.ellipse(this.x, this.y, this.size * 1.8, this.size, angle, 0, Math.PI * 2);
            }
            
            ctx.fill();
        }

        update() {
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    let angle = Math.atan2(dy, dx);
                    let force = (mouse.radius - distance) / mouse.radius;

                    if (mouse.isDown) {
                        this.vx += Math.cos(angle) * force * 1.5;
                        this.vy += Math.sin(angle) * force * 1.5;
                    } else {
                        this.vx -= Math.cos(angle) * force * 0.5;
                        this.vy -= Math.sin(angle) * force * 0.5;
                        this.vx += Math.cos(angle + Math.PI/2) * force * 0.8;
                        this.vy += Math.sin(angle + Math.PI/2) * force * 0.8;
                    }
                }
            }

            this.vx += (this.baseVx - this.vx) * 0.05;
            this.vy += (this.baseVy - this.vy) * 0.05;

            const maxSpeed = 15;
            let currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (currentSpeed > maxSpeed) {
                this.vx = (this.vx / currentSpeed) * maxSpeed;
                this.vy = (this.vy / currentSpeed) * maxSpeed;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (this.x > canvas.width + 20) this.x = -20;
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.y > canvas.height + 20) this.y = -20;
            if (this.y < -20) this.y = canvas.height + 20;

            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        const count = themeSettings[currentTheme] ? themeSettings[currentTheme].count : 50;
        for (let i = 0; i < count; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        requestAnimationFrame(animate);
    }

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const classList = pane.className;
                let newTheme = currentTheme;
                if (classList.includes('theme-forge')) newTheme = 'theme-forge';
                else if (classList.includes('theme-spt')) newTheme = 'theme-spt';
                else if (classList.includes('theme-power')) newTheme = 'theme-power';

                if (newTheme !== currentTheme) {
                    currentTheme = newTheme;
                    initParticles();
                }
            }
        });
    });

    observer.observe(pane, { attributes: true });

    resizeCanvas();
    animate();
});