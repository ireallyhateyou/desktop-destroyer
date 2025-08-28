let destructionCount = 0;
let gameState = {
    elementsDestroyed: [],
    cracks: [],
    holes: []
};

let damageMap = new Map(); // tracks damage level at each coordinate

// Store multiple glass breaks per location
let glassBreaksMap = new Map(); // key: location, value: array of {sprite, damage, id}
let glassBreakIdCounter = 0;

// Initialize clock
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    document.getElementById('clock').textContent = timeString;
}

let currentTool = null; // Default: no tool selected

// Hammer image sizes (actual size of hammer idle.png)
const HAMMER_WIDTH = 85; 
const HAMMER_HEIGHT = 119; 
const HAMMER_IDLE = 'assets/hammer idle.png';
const HAMMER_CLICK = 'assets/hammer click.png';

// Stamp image sizes 
const STAMP_WIDTH = 144; 
const STAMP_HEIGHT = 144; 
const STAMP_IDLE = 'assets/stamp idle.png';
const STAMP_CLICK = 'assets/stamp click.png';

// Add machine gun tool constants
const MACHINE_GUN_IDLE = 'assets/machine gun idle.png';
const MACHINE_GUN_CLICK = 'assets/machine gun click1.png';
const MACHINE_GUN_CLICK2 = 'assets/machine gun click2.png';

// Add zapper tool constants
const ZAPPER_IDLE = 'assets/zapper idle.png';
const ZAPPER_CLICK = 'assets/zapper click1.png';
const ZAPPER_CLICK2 = 'assets/zapper click2.png';

// Glass break damage system
const GLASS_BREAK_FRAME_WIDTH = 150;
const MAX_DAMAGE_LEVEL = 5; // 6 frames total (0-5)


// Global destruction tool volume
window.destructionVolume = 0.3;

// Global window management variables and functions
let windowCounter = 0;
let openWindows = [];
let importedImages = []; // Track imported images

function openWindow(windowType) {
    const windowId = `window-${windowType}-${++windowCounter}`;
    const windowContent = getWindowContent(windowType);
    
    const window = document.createElement('div');
    window.className = 'win95-window';
    window.id = windowId;
    window.style.position = 'absolute';
    window.style.top = '100px';
    window.style.left = '200px';
    
    // Set specific size for Minesweeper window
    if (windowType === 'minesweeper') {
        window.style.width = '350px';
        window.style.height = '350px';
    } else {
        window.style.width = '400px';
        window.style.height = '300px';
    }
    
    window.style.zIndex = '100';
    
    window.innerHTML = `
        <div class="win95-title-bar">
            <span>${windowContent.title}</span>
            <div class="win95-controls">
                <button class="win95-btn" onclick="minimizeWindow('${windowId}')">_</button>
                <button class="win95-btn" onclick="maximizeWindow('${windowId}')">□</button>
                <button class="win95-btn" onclick="closeWindow('${windowId}')">×</button>
            </div>
        </div>
        <div class="win95-window-body" style="height: calc(100% - 22px); overflow: auto;">
            ${windowContent.content}
        </div>
    `;
    
    document.getElementById('windows-container').appendChild(window);
    openWindows.push(windowId);
    makeWindowDraggable(window);
    bringWindowToFront(window);
    
    // Initialize Minesweeper if this is a Minesweeper window
    if (windowType === 'minesweeper') {
        setTimeout(() => {
            initializeMinesweeper();
        }, 100);
    }
    
    // Achievement: First Window Opened
    if (!achievements.includes("Window Shopper")) {
        showAchievementPopup("Window Shopper");
    }
}

function getWindowContent(windowType) {
    const contents = {
        // Desktop Icons
        'my-computer': {
            title: 'My Computer',
            content: `
                <div style="padding: 10px;">
                    <h3>My Computer</h3>
                    <p>Welcome to your computer! I'm not sure what you're doing here</p>
                    <ul>
                        <li>📁 C: Drive</li>
                        <li>📁 D: Drive</li>
                        <li>📁 Control Panel</li>
                        <li>📁 Printers</li>
                        <li>📁 Homework</li>
                    </ul>
                </div>
            `
        },
        'network-neighborhood': {
            title: 'Network Neighborhood',
            content: `<div style='padding:10px;'><p style="font-family: 'Comic Sans MS', 'Comic Sans', cursive; font-style: italic;">"Neighborhood" you say...</p></div>`
        },
        'inbox': {
            title: 'Inbox',
            content: `<div style='padding:10px;'><h3>Inbox</h3><p>Email client coming soon!</p></div>`
        },
        'recycle-bin': {
            title: 'Recycle Bin',
            content: `
                <div style="padding: 10px;">
                    <h3>Recycle Bin</h3>
                    <p>Empty</p>
                    <p style="color: #666; font-size: 10px;">No files in the Recycle Bin</p>
                </div>
            `
        },
        'michaelsoft-network': {
            title: 'Online Services',
            content: `<div style='padding:10px;'><h3>Online Services</h3><p>Internet services coming soon!</p></div>`
        },
        
        'documents': {
            title: 'Documents',
            content: `
                <div style="padding: 10px;">
                    <h3>My Documents</h3>
                    <p>Your personal documents folder.</p>
                    <ul>
                        <li>📄 al_banane_education.txt</li>
                        <li>📁 Homework</li>
                    </ul>
                </div>
            `
        },
        'settings': {
            title: 'Settings',
            content: `<div style='padding:10px;'><h3>Settings</h3><p>Delete Herobrine</p></div>`
        },
        'find': {
            title: 'Find',
            content: `<div style='padding:10px;'><h3>Find</h3><p>Find my iPhone</p></div>`
        },
        'help': {
            title: 'Help',
            content: `<div style='padding:10px;'><h3>Help</h3><p>please help me dawg :wilted_rose:</p></div>`
        },
        'run': {
            title: 'Run',
            content: `<div style='padding:10px;'><h3>Run</h3><p>dfdssqgsg</p></div>`
        },
        'shutdown': {
            title: 'Shut Down',
            content: `<div style='padding:10px;'><h3>Shut Down</h3><p>You are not supposed to see this</p></div>`
        },
        
        // Programs Submenu
        'notepad': {
            title: 'Notepad',
            content: `
                <div style="padding: 10px;">
                    <h3>Notepad</h3>
                    <textarea style="width: 100%; height: 180px; border: 1px solid #ccc; font-family: monospace; font-size: 12px;" placeholder="Type your text here..."></textarea>
                </div>
            `
        },
        'paint': {
            title: 'Paint',
            content: `
                <div style="padding: 10px;">
                    <h3>Paint</h3>
                    <p>Please paint me a picture of a cat</p>
                    <div style="border: 1px solid #ccc; height: 150px; background: white; margin: 10px 0;">
                        <p style="text-align: center; color: #999; margin-top: 60px;">Pretend you can paint here</p>
                    </div>
                </div>
            `
        },
        'minesweeper': {
            title: 'Minesweeper',
            content: `
                <div style='padding:10px;'>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <button class="win95-btn" onclick="minesweeperNewGame()" style="font-size: 11px;">New Game</button>
                            <div id="minesweeper-smiley" style="width: 48px; height: 48px; cursor: pointer; border: 2px outset #c0c0c0; background-color: #c0c0c0;" onclick="minesweeperNewGame()"></div>
                            <span id="minesweeper-timer" style="font-family: monospace; font-size: 14px;">000</span>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span style="font-size: 12px;">Mines:</span>
                            <span id="minesweeper-mine-count" style="font-family: monospace; font-size: 14px;">10</span>
                        </div>
                    </div>
                    <div id="minesweeper-grid" style="display: grid; grid-template-columns: repeat(9, 25px); grid-template-rows: repeat(9, 25px); gap: 1px; background: #c0c0c0; border: 2px outset #c0c0c0; padding: 2px; margin: 0 auto; width: fit-content;"></div>
                </div>
            `
        },
        'browser': {
            title: 'Internet Explorer',
            content: `<div style='padding:10px;'><h3>Internet Explorer</h3><p>Loading your page soon with blazing speed!</p></div>`
        }
    };
    
    return contents[windowType] || {
        title: 'Unknown Application',
        content: '<p>This application is not available.</p>'
    };
}

function makeWindowDraggable(window) {
    const title = window.querySelector('.win95-title-bar');
    let isDragging = false;
    let currentX, currentY, initialX, initialY;

    title.addEventListener('mousedown', (e) => {
        isDragging = true;
        initialX = e.clientX - window.offsetLeft;
        initialY = e.clientY - window.offsetTop;
        bringWindowToFront(window);
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            window.style.left = currentX + 'px';
            window.style.top = currentY + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

function bringWindowToFront(window) {
    const windows = document.querySelectorAll('.win95-window');
    let maxZ = 100;
    windows.forEach(w => {
        const z = parseInt(w.style.zIndex) || 100;
        maxZ = Math.max(maxZ, z);
    });
    window.style.zIndex = maxZ + 1;
}

function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.style.display = 'none';
    }
}

function maximizeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.style.width = '100%';
        window.style.height = '100%';
        window.style.top = '0';
        window.style.left = '0';
    }
}

function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    if (window) {
        window.remove();
        const index = openWindows.indexOf(windowId);
        if (index > -1) {
            openWindows.splice(index, 1);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateClock();
    setInterval(updateClock, 1000);

    const desktop = document.getElementById('desktop');
    const customCursor = document.getElementById('custom-cursor');

    function setHammerCursorActive(active) {
        if (active) {
            desktop.style.cursor = 'none';
            customCursor.style.display = 'block';
            customCursor.style.width = HAMMER_WIDTH + 'px';
            customCursor.style.height = HAMMER_HEIGHT + 'px';
            customCursor.innerHTML = `<img src="${HAMMER_IDLE}" style="width:auto;height:auto;display:block;">`;
        } else {
            desktop.style.cursor = '';
            customCursor.style.display = 'none';
            customCursor.innerHTML = '';
        }
    }

    function setStampCursorActive(active) {
        if (active) {
            desktop.style.cursor = 'none';
            customCursor.style.display = 'block';
            customCursor.style.width = STAMP_WIDTH + 'px';
            customCursor.style.height = STAMP_HEIGHT + 'px';
            customCursor.innerHTML = `<img src="${STAMP_IDLE}" style="width:100%;height:100%;object-fit:contain;">`;
        } else {
            desktop.style.cursor = '';
            customCursor.style.display = 'none';
            customCursor.innerHTML = '';
        }
    }

    function setMachineGunCursorActive(active) {
        if (active) {
            desktop.style.cursor = 'none';
            customCursor.style.display = 'block';
            customCursor.style.width = '120px';
            customCursor.style.height = '120px';
            customCursor.innerHTML = `<img src="${MACHINE_GUN_IDLE}" style="width:100%;height:100%;object-fit:contain;">`;
        } else {
            desktop.style.cursor = '';
            customCursor.style.display = 'none';
            customCursor.innerHTML = '';
        }
    }

    function setZapperCursorActive(active) {
        if (active) {
            customCursor.style.display = 'block';
            customCursor.style.width = '180px';
            customCursor.style.height = '180px';
            customCursor.innerHTML = `<img src="${ZAPPER_IDLE}" style="width:100%;height:100%;object-fit:contain;">`;
            desktop.style.cursor = 'none';
        } else {
            desktop.style.cursor = '';
            customCursor.style.display = 'none';
            customCursor.innerHTML = '';
        }
    }

    // Get damage level at specific coordinates
    function getDamageLevel(x, y) {
        // For compatibility, return the damage of the last break at this location
        const gridX = Math.floor(x/20)*20;
        const gridY = Math.floor(y/20)*20;
        const locationKey = `${gridX},${gridY}`;
        const breaks = glassBreaksMap.get(locationKey);
        if (breaks && breaks.length > 0) return breaks[breaks.length-1].damage;
        return 0;
    }

    // Set damage level at specific coordinates
    function setDamageLevel(x, y, level) {
        const gridX = Math.floor(x/20)*20;
        const gridY = Math.floor(y/20)*20;
        const locationKey = `${gridX},${gridY}`;
        const breaks = glassBreaksMap.get(locationKey);
        if (breaks && breaks.length > 0) breaks[breaks.length-1].damage = level;
    }

    function showGlassBreakDamageStack(gridX, gridY, breaks) {
        // Remove all existing damage overlays at this location
        document.querySelectorAll(`[data-damage-key="${gridX},${gridY}"]`).forEach(el => el.remove());
        // Render all breaks
        breaks.forEach((brk, idx) => {
            if (brk.damage > 0 && brk.damage <= 6) {
                const damageElement = document.createElement('div');
                damageElement.className = 'glass-break-damage';
                damageElement.setAttribute('data-damage-key', `${gridX},${gridY}`);
                damageElement.style.position = 'absolute';
                damageElement.style.left = (gridX - 90) + 'px';
                damageElement.style.top = (gridY - 65) + 'px';
                damageElement.style.width = GLASS_BREAK_FRAME_WIDTH + 'px';
                damageElement.style.height = GLASS_BREAK_FRAME_WIDTH + 'px';
                damageElement.style.backgroundImage = `url("${brk.sprite}")`;
                damageElement.style.backgroundPosition = `-${(brk.damage - 1) * GLASS_BREAK_FRAME_WIDTH}px 0`;
                damageElement.style.backgroundSize = 'auto 100%';
                damageElement.style.backgroundRepeat = 'no-repeat';
                damageElement.style.pointerEvents = 'none';
                damageElement.style.zIndex = 1000 + idx; // stack
                document.getElementById('desktop').appendChild(damageElement);
            }
        });
    }

    // Update tool button click logic for hammer
    const toolButtons = document.querySelectorAll('.tool-button');
    toolButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.dataset.tool === 'reset') {
                resetDesktop();
                return;
            }
            // If clicking the already active tool, deactivate it
            if (currentTool === this.dataset.tool) {
                this.classList.remove('active');
                currentTool = null;
                setHammerCursorActive(false);
                setStampCursorActive(false);
                setMachineGunCursorActive(false);
                setZapperCursorActive(false);
                // Reset button images to idle state
                const hammerBtn = document.querySelector('[data-tool="hammer"]');
                const stampBtn = document.querySelector('[data-tool="stamp"]');
                const machineGunBtn = document.querySelector('[data-tool="machine-gun"]');
                const zapperBtn = document.querySelector('[data-tool="zapper"]');
                if (hammerBtn) {
                    const hammerImg = hammerBtn.querySelector('img');
                    if (hammerImg) hammerImg.src = HAMMER_IDLE;
                }
                if (stampBtn) {
                    const stampImg = stampBtn.querySelector('img');
                    if (stampImg) stampImg.src = STAMP_IDLE;
                }
                if (machineGunBtn) {
                    const machineGunImg = machineGunBtn.querySelector('img');
                    if (machineGunImg) machineGunImg.src = MACHINE_GUN_IDLE;
                }
                if (zapperBtn) {
                    const zapperImg = zapperBtn.querySelector('img');
                    if (zapperImg) zapperImg.src = ZAPPER_IDLE;
                }
                return;
            }
            // Deactivate all, activate this
            toolButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.dataset.tool;
            
            // Stop any ongoing spraying when switching tools
            if (isMachineGunSpraying) {
                isMachineGunSpraying = false;
                if (machineGunSprayInterval) {
                    clearInterval(machineGunSprayInterval);
                    machineGunSprayInterval = null;
                }
                if (machineGunImageInterval) {
                    clearInterval(machineGunImageInterval);
                    machineGunImageInterval = null;
                }
            }
            if (isHammerSpraying) {
                isHammerSpraying = false;
                if (hammerSprayInterval) {
                    clearInterval(hammerSprayInterval);
                    hammerSprayInterval = null;
                }
            }
            if (isStampSpraying) {
                isStampSpraying = false;
                if (stampSprayInterval) {
                    clearInterval(stampSprayInterval);
                    stampSprayInterval = null;
                }
            }
            if (isZapperSpraying) {
                isZapperSpraying = false;
                if (zapperSprayInterval) {
                    clearInterval(zapperSprayInterval);
                    zapperSprayInterval = null;
                }
                if (zapperImageInterval) {
                    clearInterval(zapperImageInterval);
                    zapperImageInterval = null;
                }
            }
            
            // Change cursor based on tool
            if (currentTool === 'hammer') {
                setHammerCursorActive(true);
                // Update button image to click state
                const hammerImg = this.querySelector('img');
                if (hammerImg) hammerImg.src = HAMMER_CLICK;
            } else if (currentTool === 'stamp') {
                setStampCursorActive(true);
                // Update button image to click state
                const stampImg = this.querySelector('img');
                if (stampImg) stampImg.src = STAMP_CLICK;
            } else if (currentTool === 'machine-gun') {
                setMachineGunCursorActive(true);
                // Update button image to click state
                const machineGunImg = this.querySelector('img');
                if (machineGunImg) machineGunImg.src = MACHINE_GUN_CLICK;
            } else if (currentTool === 'zapper') {
                setZapperCursorActive(true);
                // Update button image to click state
                const zapperImg = this.querySelector('img');
                if (zapperImg) zapperImg.src = ZAPPER_CLICK;
            } else {
                setHammerCursorActive(false);
                setStampCursorActive(false);
                setMachineGunCursorActive(false);
                setZapperCursorActive(false);
                desktop.style.cursor = 'crosshair';
            }
        });
    });

    // Volume slider logic
    const volumeSlider = document.getElementById('destruction-volume');
    if (volumeSlider) {
        volumeSlider.value = window.destructionVolume;
        volumeSlider.addEventListener('input', function() {
            window.destructionVolume = parseFloat(this.value);
        });
    }

    // Move the custom cursor with the mouse
    let lastCursorX = 0, lastCursorY = 0;
    // Add machine gun spraying variables
    let isMachineGunSpraying = false;
    let machineGunSprayInterval = null;
    let machineGunImageInterval = null;
    let sprayX = 0, sprayY = 0; // Track current mouse position for spraying
    
    // Add hammer and stamp spraying variables
    let isHammerSpraying = false;
    let isStampSpraying = false;
    let hammerSprayInterval = null;
    let stampSprayInterval = null;

    // Add zapper spraying variables
    let isZapperSpraying = false;
    let zapperSprayInterval = null;
    let zapperImageInterval = null;

    // Add zapper effect image logic
    let zapperEffectImg = null;
    let zapperEffectToggle = false;

    function updateZapperEffectImg(x, y) {
        if (!zapperEffectImg) {
            zapperEffectImg = document.createElement('img');
            zapperEffectImg.className = 'zapper-effect-img';
            zapperEffectImg.style.position = 'fixed';
            zapperEffectImg.style.pointerEvents = 'none';
            zapperEffectImg.style.zIndex = '100000';
            zapperEffectImg.style.transform = 'scale(0.5)';
            zapperEffectImg.style.display = 'none';
            document.body.appendChild(zapperEffectImg);
        }
        // Align to top-left of zapper sprite image inside customCursor
        const cursorRect = customCursor.getBoundingClientRect();
        const zapperImg = customCursor.querySelector('img');
        let offsetLeft = 0;
        let offsetTop = 0;
        if (zapperImg && currentTool === 'zapper') {
            // If the zapper image is smaller or offset inside the customCursor, get its offset
            const imgRect = zapperImg.getBoundingClientRect();
            offsetLeft = imgRect.left - cursorRect.left;
            offsetTop = imgRect.top - cursorRect.top;
        }
        zapperEffectImg.style.left = (cursorRect.left + offsetLeft - 50 - 10 - 5) + 'px';
        zapperEffectImg.style.top = (cursorRect.top + offsetTop - 50 - 10 - 5) + 'px';
        // Set image source based on toggle
        zapperEffectImg.src = zapperEffectToggle ? 'assets/zap2.png' : 'assets/zap1.png';
        zapperEffectImg.style.display = 'block';
    }
    function hideZapperEffectImg() {
        if (zapperEffectImg) {
            zapperEffectImg.style.display = 'none';
        }
    }

    desktop.addEventListener('mousemove', function(e) {
        if (currentTool === 'hammer' && customCursor.style.display === 'block') {
            // Offset so the tip of the hammer is at the pointer
            const offsetX = 32; 
            const offsetY = 16;
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
            // Update spray position
            sprayX = e.clientX;
            sprayY = e.clientY;
        } else if (currentTool === 'stamp' && customCursor.style.display === 'block') {
            // Offset for stamp cursor 
            const offsetX = 48; 
            const offsetY = 48; 
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
            // Update spray position
            sprayX = e.clientX;
            sprayY = e.clientY;
        } else if (currentTool === 'machine-gun' && customCursor.style.display === 'block') {
            // Offset for machine gun cursor
            const offsetX = 60;
            const offsetY = 60;
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
            // Update spray position
            sprayX = e.clientX;
            sprayY = e.clientY;
        } else if (currentTool === 'zapper' && customCursor.style.display === 'block') {
            const offsetX = 60;
            const offsetY = 60;
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
            sprayX = e.clientX;
            sprayY = e.clientY;
            // Do NOT show zapper effect image on mousemove
            hideZapperEffectImg();
        } else {
            hideZapperEffectImg();
        }
    });

    desktop.addEventListener('mouseenter', function(e) {
        if (currentTool === 'hammer') {
            setHammerCursorActive(true);
        } else if (currentTool === 'stamp') {
            setStampCursorActive(true);
        } else if (currentTool === 'machine-gun') {
            setMachineGunCursorActive(true);
        } else if (currentTool === 'zapper') {
            setZapperCursorActive(true);
            updateZapperEffectImg(lastCursorX, lastCursorY);
        }
    });
    desktop.addEventListener('mouseleave', function(e) {
        setHammerCursorActive(false);
        setStampCursorActive(false);
        setMachineGunCursorActive(false);
        setZapperCursorActive(false);
        hideZapperEffectImg();
    });

    desktop.addEventListener('mousedown', function(e) {
        if (currentTool === 'hammer') {
            customCursor.innerHTML = `<img src="${HAMMER_CLICK}" style="width:auto;height:auto;display:block;">`;
            // Start spraying hammer hits at current mouse position
            isHammerSpraying = true;
            sprayX = e.clientX;
            sprayY = e.clientY;
            
            // Achievement: First Hammer Strike
            if (!achievements.includes("Hammer Time")) {
                showAchievementPopup("Hammer Time");
            }
            hammerSprayInterval = setInterval(() => {
                if (isHammerSpraying) {
                    // Switch to click image when creating effect
                    const hammerImg = customCursor.querySelector('img');
                    if (hammerImg) {
                        hammerImg.src = HAMMER_CLICK;
                    }
                    
                    hammerDestroy(sprayX, sprayY);
                    
                    // Switch back to idle after a short delay
                    setTimeout(() => {
                        if (hammerImg && isHammerSpraying) {
                            hammerImg.src = HAMMER_IDLE;
                        }
                    }, 50);
                }
            }, 150); // Spray a hammer hit every 150ms
        } else if (currentTool === 'stamp') {
            customCursor.innerHTML = `<img src="${STAMP_CLICK}" style="width:auto;height:auto;display:block;">`;
            // Start spraying stamp hits at current mouse position
            isStampSpraying = true;
            sprayX = e.clientX;
            sprayY = e.clientY;
            
            // Achievement: First Stamp Use
            if (!achievements.includes("Stamp Collector")) {
                showAchievementPopup("Stamp Collector");
            }
            stampSprayInterval = setInterval(() => {
                if (isStampSpraying) {
                    // Switch to click image when creating effect
                    const stampImg = customCursor.querySelector('img');
                    if (stampImg) {
                        stampImg.src = STAMP_CLICK;
                    }
                    
                    stampDestroy(sprayX, sprayY);
                    
                    // Switch back to idle after a short delay
                    setTimeout(() => {
                        if (stampImg && isStampSpraying) {
                            stampImg.src = STAMP_IDLE;
                        }
                    }, 50);
                }
            }, 100); // Spray a stamp hit every 100ms
        } else if (currentTool === 'machine-gun') {
            customCursor.innerHTML = `<img src="${MACHINE_GUN_CLICK}" style="width:auto;height:auto;display:block;">`;
            // Start spraying bullets at current mouse position
            isMachineGunSpraying = true;
            sprayX = e.clientX;
            sprayY = e.clientY;
            
            // Achievement: First Machine Gun Use
            if (!achievements.includes("Rambo Mode")) {
                showAchievementPopup("Rambo Mode");
            }

            machineGunSprayInterval = setInterval(() => {
                if (isMachineGunSpraying) {
                    machineGunDestroy(sprayX, sprayY);
                }
            }, 100); // Spray a bullet every 100ms
            
            // Separate interval for image oscillation (slower)
            machineGunImageInterval = setInterval(() => {
                if (isMachineGunSpraying) {
                    // Alternate between click1 and click2 images
                    const machineGunImg = customCursor.querySelector('img');
                    if (machineGunImg) {
                        machineGunImg.src = machineGunImg.src.includes('click1') ? MACHINE_GUN_CLICK2 : MACHINE_GUN_CLICK;
                    }
                }
            }, 50); // Switch image every 50ms
        } else if (currentTool === 'zapper') {
            customCursor.innerHTML = `<img src="${ZAPPER_CLICK}" style="width:auto;height:auto;display:block;">`;
            // Start spraying zapper hits at current mouse position
            isZapperSpraying = true;
            sprayX = e.clientX;
            sprayY = e.clientY;
            
            // Achievement: First Zapper Use
            if (!achievements.includes("Zap Attack")) {
                showAchievementPopup("Zap Attack");
            }
            // Show zap hole immediately on click
            zapperDestroy(sprayX, sprayY);
            zapperSprayInterval = setInterval(() => {
                if (isZapperSpraying) {
                    const zapperImg = customCursor.querySelector('img');
                    if (zapperImg) {
                        zapperImg.src = ZAPPER_CLICK;
                    }
                    zapperEffectToggle = !zapperEffectToggle;
                    updateZapperEffectImg(sprayX, sprayY);
                    setTimeout(() => {
                        if (zapperImg && isZapperSpraying) {
                            zapperImg.src = ZAPPER_IDLE;
                        }
                    }, 50);
                }
            }, 100);
            zapperImageInterval = setInterval(() => {
                if (isZapperSpraying) {
                    const zapperImg = customCursor.querySelector('img');
                    if (zapperImg) {
                        zapperImg.src = zapperImg.src.includes('click1') ? ZAPPER_CLICK2 : ZAPPER_CLICK;
                    }
                }
            }, 120);
            zapperEffectToggle = !zapperEffectToggle;
            updateZapperEffectImg(e.clientX, e.clientY);
        }
    });
    desktop.addEventListener('mouseup', function(e) {
        if (currentTool === 'hammer') {
            customCursor.innerHTML = `<img src="${HAMMER_IDLE}" style="width:auto;height:auto;display:block;">`;
            // Stop spraying hammer hits
            isHammerSpraying = false;
            if (hammerSprayInterval) {
                clearInterval(hammerSprayInterval);
                hammerSprayInterval = null;
            }
            setTimeout(() => {
                isHammerSpraying = false;
                hammerSprayInterval = null;
            }, 50);
        } else if (currentTool === 'stamp') {
            customCursor.innerHTML = `<img src="${STAMP_IDLE}" style="width:auto;height:auto;display:block;">`;
            // Stop spraying stamp hits
            isStampSpraying = false;
            if (stampSprayInterval) {
                clearInterval(stampSprayInterval);
                stampSprayInterval = null;
            }
            setTimeout(() => {
                isStampSpraying = false;
                stampSprayInterval = null;
            }, 50);
        } else if (currentTool === 'machine-gun') {
            customCursor.innerHTML = `<img src="${MACHINE_GUN_IDLE}" style="width:auto;height:auto;display:block;">`;
            // Stop spraying bullets
            isMachineGunSpraying = false;
            if (machineGunSprayInterval) {
                clearInterval(machineGunSprayInterval);
                machineGunSprayInterval = null;
            }
            if (machineGunImageInterval) {
                clearInterval(machineGunImageInterval);
                machineGunImageInterval = null;
            }
            setTimeout(() => {
                isMachineGunSpraying = false;
                machineGunSprayInterval = null;
                machineGunImageInterval = null;
            }, 50);
        } else if (currentTool === 'zapper') {
            customCursor.innerHTML = `<img src="${ZAPPER_IDLE}" style="width:auto;height:auto;display:block;">`;
            // Stop spraying zapper hits
            isZapperSpraying = false;
            if (zapperSprayInterval) {
                clearInterval(zapperSprayInterval);
                zapperSprayInterval = null;
            }
            if (zapperImageInterval) {
                clearInterval(zapperImageInterval);
                zapperImageInterval = null;
            }
            setTimeout(() => {
                isZapperSpraying = false;
                zapperSprayInterval = null;
                zapperImageInterval = null;
            }, 50);
            hideZapperEffectImg();
        }
    });

    // Update destruction event to check for currentTool
    desktop.addEventListener('click', function(e) {
        if (!currentTool) return;
        if (e.target.classList.contains('tool-button') || e.target.closest('.toolbar')) {
            return;
        }
        // Don't trigger single click if we're spraying or if we just stopped spraying
        if (currentTool === 'machine-gun' && (isMachineGunSpraying || machineGunSprayInterval)) {
            return;
        }
        if (currentTool === 'hammer' && (isHammerSpraying || hammerSprayInterval)) {
            return;
        }
        if (currentTool === 'stamp' && (isStampSpraying || stampSprayInterval)) {
            return;
        }
        if (currentTool === 'zapper' && (isZapperSpraying || zapperSprayInterval)) {
            return;
        }
        
        // Don't trigger machine gun if clicking on an existing machine gun hole that's still animating
        if (currentTool === 'machine-gun' && e.target.classList.contains('machine-gun-hole') && !e.target._animationCompleted) {
            return;
        }
        const x = e.clientX;
        const y = e.clientY;
        switch(currentTool) {
            case 'hammer':
                hammerDestroy(x, y);
                break;
            case 'stamp':
                stampDestroy(x, y);
                break;
            case 'drill':
                drillDestroy(x, y);
                break;
            case 'fire':
                fireDestroy(x, y);
                break;
            case 'bomb':
                bombDestroy(x, y);
                break;
            case 'saw':
                sawDestroy(x, y);
                break;
            case 'machine-gun':
                machineGunDestroy(x, y);
                break;
            case 'zapper':
                zapperDestroy(x, y);
                break;
        }
        destructionCount++;
        if (Math.random() < 0.05) {
            if (Math.random() < 0.5) {
                shakeScreen();
            } else {
                glitchEffect();
            }
        }
        if (destructionCount > 20 && Math.random() < 0.1) {
            setTimeout(showBSOD, 1000);
        }
    });

    function hammerDestroy(x, y) {
        // Play random hammer sound
        const hammerSound = Math.random() < 0.5 ? 'assets/hammer1.ogg' : 'assets/hammer2.ogg';
        const audio = new Audio(hammerSound);
        audio.volume = window.destructionVolume;
        audio.play();
        
        // Create falling glass shards
        createFallingGlassShards(x, y);
        
        // Use 20px grid for location
        const gridX = Math.floor(x/20)*20;
        const gridY = Math.floor(y/20)*20;
        const locationKey = `${gridX},${gridY}`;
        if (!glassBreaksMap.has(locationKey)) glassBreaksMap.set(locationKey, []);
        let breaks = glassBreaksMap.get(locationKey);
        // If no breaks or last break is maxed, create a new break
        if (breaks.length === 0 || breaks[breaks.length-1].damage >= 6) {
            const glassBreakNumber = Math.floor(Math.random() * 3) + 1;
            const glassBreakImage = `assets/glass break ${glassBreakNumber}.png`;
            const newBreak = { sprite: glassBreakImage, damage: 1, id: ++glassBreakIdCounter };
            breaks.push(newBreak);
        } else {
            // Otherwise, increment damage of last break
            breaks[breaks.length-1].damage++;
        }
        // Show all glass breaks at this location
        showGlassBreakDamageStack(gridX, gridY, breaks);
    }

    function createFallingGlassShards(x, y) {
        // More scattered: increase randomX range
        for (let i = 0; i < 3; i++) {
            const shard = document.createElement('div');
            shard.className = 'glass-shard';
            shard.style.position = 'absolute';
            shard.style.left = x + 'px';
            shard.style.top = y + 'px';
            shard.style.width = '10px';
            shard.style.height = '10px';
            shard.style.backgroundImage = 'url("assets/shattered glass.png")';
            shard.style.backgroundSize = 'contain';
            shard.style.backgroundRepeat = 'no-repeat';
            shard.style.backgroundPosition = 'center';
            shard.style.zIndex = '1500';
            shard.style.pointerEvents = 'none';
            shard.style.transform = `rotate(${Math.random() * 360}deg)`;
            // Even more scatter
            const randomX = (Math.random() - 0.5) * 200; // -100px to +100px
            shard.style.setProperty('--shard-x', `${randomX}px`);
            shard.style.animation = `fallingShardStraight 1.2s linear forwards`;
            document.getElementById('desktop').appendChild(shard);
            setTimeout(() => {
                if (shard.parentNode) {
                    shard.remove();
                }
            }, 1200);
        }
    }

    function stampDestroy(x, y) {
        // Play stamp sound
        const audio = new Audio('assets/stamp.ogg');
        audio.volume = window.destructionVolume;
        audio.play();
        // Randomly select a stamp image (1-10)
        const stampNumber = Math.floor(Math.random() * 10) + 1;
        
        // Create a stamp effect
        const stampElement = document.createElement('img');
        stampElement.className = 'stamp-effect';
        stampElement.style.position = 'absolute';
        stampElement.style.left = (x - 100) + 'px'; // Adjusted for larger stamp
        stampElement.style.top = (y - 30) + 'px'; // Adjusted for larger stamp
        stampElement.style.width = 'auto';
        stampElement.style.height = 'auto';
        stampElement.style.maxWidth = '150px'; // Increased from 100px
        stampElement.style.maxHeight = '150px'; // Increased from 100px
        stampElement.src = `assets/stamp${stampNumber}.png`;
        stampElement.style.opacity = '1';
        stampElement.style.zIndex = '1000';
        stampElement.style.pointerEvents = 'none';
        document.getElementById('desktop').appendChild(stampElement);
    }

    function machineGunDestroy(x, y) {
        // Play machine gun sound
        const audio = new Audio('assets/machine gun.ogg');
        audio.volume = window.destructionVolume;
        audio.play();
        // Randomly pick a hole sprite (1-5)
        const holeNum = Math.floor(Math.random() * 5) + 1;
        // Create the animated hole effect
        const hole = document.createElement('div');
        hole.className = 'machine-gun-hole';
        hole.style.position = 'absolute';
        hole.style.left = (x - 100) + 'px'; // Center the effect + 100px left offset
        hole.style.top = (y - 100) + 'px'; // Center the effect + 100px up offset
        hole.style.width = '80px';
        hole.style.height = '80px';
        hole.style.backgroundImage = `url("assets/hole${holeNum}.png")`;
        hole.style.backgroundSize = '480px 80px'; // 6 frames horizontally, 80px each
        hole.style.backgroundPosition = '0 0';
        hole.style.backgroundRepeat = 'no-repeat';
        hole.style.pointerEvents = 'none';
        hole.style.zIndex = '1200';
        
        // Mark as not completed initially
        hole._animationCompleted = false;

        document.getElementById('desktop').appendChild(hole);

        // Animate using requestAnimationFrame
        let frame = 0;
        const totalFrames = 6;
        const frameWidth = 80;
        let lastTimestamp = null;
        const frameDuration = 120; // ms per frame

        function animateHole(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const elapsed = timestamp - lastTimestamp;

            if (elapsed >= frameDuration) {
                frame++;
                lastTimestamp = timestamp;
                if (frame >= totalFrames) {
                    hole.style.backgroundPosition = `-${(totalFrames - 1) * frameWidth}px 0`;
                    hole._animationCompleted = true;
                    return; // Stop animating
                } else {
                    hole.style.backgroundPosition = `-${frame * frameWidth}px 0`;
                }
            }
            if (!hole._animationCompleted) {
                requestAnimationFrame(animateHole);
            }
        }
        requestAnimationFrame(animateHole);
    }

    function drillDestroy(x, y) {
        createHole(x, y);
        
        const element = document.elementFromPoint(x, y);
        if (element) {
            damageElement(element);
        }
    }

    function fireDestroy(x, y) {
        createFire(x, y);
        
        const element = document.elementFromPoint(x, y);
        if (element) {
            burnElement(element);
        }
    }

    function bombDestroy(x, y) {
        createExplosion(x, y);
        shakeScreen();
        
        // Damage multiple elements in radius
        const elements = document.elementsFromPoint(x, y);
        elements.forEach(el => damageElement(el));
    }

    function sawDestroy(x, y) {
        createSparks(x, y);
        
        const element = document.elementFromPoint(x, y);
        if (element) {
            cutElement(element);
        }
    }

    function createCrack(x, y) {
        const crack = document.createElement('div');
        crack.className = 'crack';
        crack.style.left = x + 'px';
        crack.style.top = y + 'px';
        crack.style.width = (Math.random() * 50 + 20) + 'px';
        crack.style.height = '2px';
        crack.style.transform = `rotate(${Math.random() * 360}deg)`;
        crack.style.opacity = '0.8';
        document.getElementById('desktop').appendChild(crack);
        
        setTimeout(() => crack.remove(), 10000);
    }

    function createHole(x, y) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.style.left = (x - 15) + 'px';
        hole.style.top = (y - 15) + 'px';
        hole.style.width = '30px';
        hole.style.height = '30px';
        document.getElementById('desktop').appendChild(hole);
        
        setTimeout(() => hole.remove(), 15000);
    }

    function createFire(x, y) {
        for (let i = 0; i < 5; i++) {
            const fire = document.createElement('div');
            fire.className = 'fire-particle';
            fire.style.left = (x - 10 + Math.random() * 20) + 'px';
            fire.style.top = (y - 10 + Math.random() * 20) + 'px';
            fire.style.width = (Math.random() * 20 + 10) + 'px';
            fire.style.height = (Math.random() * 20 + 10) + 'px';
            fire.style.animation = 'fadeOut 2s ease-out forwards';
            document.getElementById('desktop').appendChild(fire);
            
            setTimeout(() => fire.remove(), 2000);
        }
    }

    function createSparks(x, y) {
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.className = 'spark';
            spark.style.left = (x + Math.random() * 40 - 20) + 'px';
            spark.style.top = (y + Math.random() * 40 - 20) + 'px';
            spark.style.width = (Math.random() * 6 + 2) + 'px';
            spark.style.height = (Math.random() * 6 + 2) + 'px';
            spark.style.animation = 'fadeOut 1s ease-out forwards';
            document.getElementById('desktop').appendChild(spark);
            
            setTimeout(() => spark.remove(), 1000);
        }
    }

    function createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.left = (x - 50) + 'px';
        explosion.style.top = (y - 50) + 'px';
        explosion.style.width = '100px';
        explosion.style.height = '100px';
        explosion.style.background = 'radial-gradient(circle, #ff6600 0%, #ff0000 30%, transparent 70%)';
        explosion.style.borderRadius = '50%';
        explosion.style.animation = 'fadeOut 0.5s ease-out forwards';
        explosion.style.zIndex = '2000';
        document.getElementById('desktop').appendChild(explosion);
        
        setTimeout(() => explosion.remove(), 500);
    }

    function damageElement(element) {
        if (element.classList.contains('desktop-icon') || element.classList.contains('window')) {
            element.style.filter = 'sepia(100%) hue-rotate(0deg) saturate(200%) brightness(0.8)';
            element.style.transform = 'rotate(' + (Math.random() * 10 - 5) + 'deg)';
            element.style.animation = 'bounce 0.5s ease-out';
            
            setTimeout(() => {
                if (Math.random() < 0.3) {
                    element.style.opacity = '0.5';
                }
            }, 500);
        }
    }

    function burnElement(element) {
        if (element.classList.contains('desktop-icon') || element.classList.contains('window')) {
            element.style.filter = 'sepia(100%) hue-rotate(0deg) saturate(300%) brightness(0.4)';
            element.style.animation = 'fadeOut 3s ease-out forwards';
            
            setTimeout(() => {
                if (element.parentNode) {
                    element.style.opacity = '0.2';
                    element.style.background = '#333';
                }
            }, 1000);
        }
    }

    function cutElement(element) {
        if (element.classList.contains('desktop-icon') || element.classList.contains('window')) {
            element.style.clipPath = 'polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)';
            element.style.transform = 'skew(' + (Math.random() * 20 - 10) + 'deg)';
        }
    }

    function shakeScreen() {
        document.body.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    function glitchEffect() {
        const elements = document.querySelectorAll('.desktop-icon, .window');
        elements.forEach(el => {
            el.style.filter = 'hue-rotate(' + Math.random() * 360 + 'deg) saturate(200%)';
            setTimeout(() => {
                el.style.filter = '';
            }, 200);
        });
    }

    function showBSOD() {
        document.getElementById('bsod').style.display = 'block';
        setTimeout(() => {
            document.getElementById('bsod').style.display = 'none';
        }, 3000);
    }

    function resetDesktop() {
        // Remove all destruction effects
        document.querySelectorAll('.destruction-particle, .crack, .hole, .fire-particle, .spark, .glass-break-damage, .stamp-effect, .machine-gun-hole, .zapper-zap').forEach(el => {
            // Clear any ongoing animations before removing
            if (el._animationInterval) {
                clearInterval(el._animationInterval);
            }
            el.remove();
        });
        
        // Reset all elements
        document.querySelectorAll('.desktop-icon, .window').forEach(el => {
            el.style.filter = '';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.animation = '';
            el.style.background = '';
            el.style.clipPath = '';
        });
        
        // Remove imported images
        importedImages.forEach(img => {
            if (img.element && img.element.parentNode) {
                img.element.remove();
            }
        });
        importedImages = [];
        
        // Clear damage tracking
        damageMap.clear();
        glassBreaksMap.clear(); // Clear glass breaks map
        glassBreakIdCounter = 0; // Reset glass break ID counter
        
        destructionCount = 0;
        gameState = { elementsDestroyed: [], cracks: [], holes: [] };
        
        // Deselect all tools
        currentTool = null;
        
        // Stop any ongoing spraying
        if (isMachineGunSpraying) {
            isMachineGunSpraying = false;
            if (machineGunSprayInterval) {
                clearInterval(machineGunSprayInterval);
                machineGunSprayInterval = null;
            }
            if (machineGunImageInterval) {
                clearInterval(machineGunImageInterval);
                machineGunImageInterval = null;
            }
        }
        if (isHammerSpraying) {
            isHammerSpraying = false;
            if (hammerSprayInterval) {
                clearInterval(hammerSprayInterval);
                hammerSprayInterval = null;
            }
        }
        if (isStampSpraying) {
            isStampSpraying = false;
            if (stampSprayInterval) {
                clearInterval(stampSprayInterval);
                stampSprayInterval = null;
            }
        }
        if (isZapperSpraying) {
            isZapperSpraying = false;
            if (zapperSprayInterval) {
                clearInterval(zapperSprayInterval);
                zapperSprayInterval = null;
            }
            if (zapperImageInterval) {
                clearInterval(zapperImageInterval);
                zapperImageInterval = null;
            }
        }
        
        // Reset cursor to default
        setHammerCursorActive(false);
        setStampCursorActive(false);
        setMachineGunCursorActive(false);
        setZapperCursorActive(false);
        desktop.style.cursor = 'default';
        
        // Remove active state from all tool buttons
        document.querySelectorAll('.tool-button').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    // Add shake animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-2px, 0); }
            50% { transform: translate(2px, 0); }
            75% { transform: translate(-1px, 0); }
        }
        @keyframes stampFadeOut {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Make windows draggable
    document.querySelectorAll('.window').forEach(window => {
        const title = window.querySelector('.window-title');
        let isDragging = false;
        let currentX, currentY, initialX, initialY;

        title.addEventListener('mousedown', (e) => {
            isDragging = true;
            initialX = e.clientX - window.offsetLeft;
            initialY = e.clientY - window.offsetTop;
            window.style.zIndex = '1000';
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                window.style.left = currentX + 'px';
                window.style.top = currentY + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    });

    // Add some random glitches
    setInterval(() => {
        if (Math.random() < 0.02) {
            glitchEffect();
        }
    }, 5000); 

    // --- Start Menu Interactivity ---
    const startButton = document.getElementById('startButton');
    const startMenu = document.getElementById('startMenu');

    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        startMenu.style.display = (startMenu.style.display === 'none' || !startMenu.style.display) ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!startMenu.contains(e.target) && e.target !== startButton) {
            startMenu.style.display = 'none';
        }
    });

    // Show shutdown overlay when 'Shut Down...' is clicked
    const shutdownMenuItem = Array.from(document.querySelectorAll('#startMenu li')).find(li => li.textContent.trim().includes('Shut Down'));
    if (shutdownMenuItem) {
        shutdownMenuItem.addEventListener('click', function(e) {
            document.getElementById('shutdown-overlay').style.display = 'flex';
        });
    }

    // Allow clicking the overlay to hide it
    const shutdownOverlay = document.getElementById('shutdown-overlay');
    if (shutdownOverlay) {
        shutdownOverlay.addEventListener('click', function() {
            shutdownOverlay.style.display = 'none';
        });
    }

    // --- Destruction Toolbar Arrow Scroll ---
    const leftArrow = document.getElementById('toolbar-arrow-left');
    const rightArrow = document.getElementById('toolbar-arrow-right');
    const buttonsContainer = document.querySelector('.toolbar-buttons');
    if (leftArrow && rightArrow && buttonsContainer) {
        leftArrow.addEventListener('click', function() {
            buttonsContainer.scrollBy({ left: -100, behavior: 'smooth' });
        });
        rightArrow.addEventListener('click', function() {
            buttonsContainer.scrollBy({ left: 100, behavior: 'smooth' });
        });
    }

    // --- Image Import Functionality ---
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    
    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const mediaUrl = event.target.result;
                    addImportedMediaToDesktop(file.name, mediaUrl, file.type);
                };
                reader.onerror = (error) => {
                    console.error('FileReader error:', error);
                };
                reader.readAsDataURL(file);
            } else if (file) {
                alert('Please select an image or video file (PNG, JPG, GIF, MP4, WebM, etc.)');
            }
            // Reset file input
            fileInput.value = '';
        });
    }
    
    function addImportedMediaToDesktop(filename, mediaUrl, fileType) {
        const mediaId = `imported-${Date.now()}`;
        const desktopGrid = document.querySelector('.desktop-grid');
        
        if (!desktopGrid) {
            return;
        }
        
        // Create desktop icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'desktop-icon';
        iconDiv.onclick = () => openImportedMediaWindow(mediaId, filename, mediaUrl, fileType);
        
        // Create appropriate icon content based on file type
        let iconContent;
        if (fileType.startsWith('image/')) {
            iconContent = `<img src="${mediaUrl}" class="icon-image" alt="${filename}" style="max-width: 32px; max-height: 32px; object-fit: contain;">`;
        } else if (fileType.startsWith('video/')) {
            iconContent = `<video src="${mediaUrl}" class="icon-image" style="max-width: 32px; max-height: 32px; object-fit: contain;" muted></video>`;
        }
        
        iconDiv.innerHTML = `
            ${iconContent}
            <div class="icon-label">${filename.length > 12 ? filename.substring(0, 9) + '...' : filename}</div>
        `;
        
        desktopGrid.appendChild(iconDiv);
        
        // Store media data
        importedImages.push({
            id: mediaId,
            filename: filename,
            mediaUrl: mediaUrl,
            fileType: fileType,
            element: iconDiv
        });
    }
    
    function openImportedMediaWindow(mediaId, filename, mediaUrl, fileType) {
        const windowId = `window-imported-${mediaId}`;
        
        const window = document.createElement('div');
        window.className = 'win95-window';
        window.id = windowId;
        window.style.position = 'absolute';
        window.style.top = '100px';
        window.style.left = '200px';
        window.style.width = '600px';
        window.style.height = '500px';
        window.style.zIndex = '100';
        
        // Create appropriate media content based on file type
        let mediaContent;
        if (fileType.startsWith('image/')) {
            mediaContent = `<img src="${mediaUrl}" style="max-width: 100%; max-height: 400px; object-fit: contain; border: 1px solid #ccc;">`;
        } else if (fileType.startsWith('video/')) {
            mediaContent = `<video src="${mediaUrl}" controls style="max-width: 100%; max-height: 400px; object-fit: contain; border: 1px solid #ccc;"></video>`;
        }
        
        window.innerHTML = `
            <div class="win95-title-bar">
                <span>${filename}</span>
                <div class="win95-controls">
                    <button class="win95-btn" onclick="minimizeWindow('${windowId}')">_</button>
                    <button class="win95-btn" onclick="maximizeWindow('${windowId}')">□</button>
                    <button class="win95-btn" onclick="closeWindow('${windowId}')">×</button>
                </div>
            </div>
            <div class="win95-window-body" style="height: calc(100% - 22px); overflow: auto; padding: 10px;">
                <div style="text-align: center;">
                    ${mediaContent}
                    <p style="margin-top: 10px; color: #666;">Imported media: ${filename}</p>
                </div>
            </div>
        `;
        
        document.getElementById('windows-container').appendChild(window);
        openWindows.push(windowId);
        makeWindowDraggable(window);
        bringWindowToFront(window);
    }

    // --- Window Management System ---
    window.openApp = function(app) {
        openWindow(app);
    };
    window.showRunDialog = function() {
        alert('Running...  (not really)');
    };
    window.shutdown = function() {
        alert('Shutting down... (not really)');
    }; 

    // --- KEYBOARD SHORTCUTS ---
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const toolButtonsArr = Array.from(document.querySelectorAll('.tool-button'));
        const toolOrder = ['hammer', 'machine-gun', 'stamp', 'zapper'];
        let currentToolIndex = toolOrder.indexOf(currentTool);
        switch (e.key) {
            case '1':
                selectTool('hammer');
                break;
            case '2':
                selectTool('machine-gun');
                break;
            case '3':
                selectTool('stamp');
                break;
            case '4':
                selectTool('zapper');
                break;
            case 'c':
            case 'C':
                resetDesktop();
                break;
            case '-':
                // Previous weapon
                if (currentToolIndex > 0) {
                    selectTool(toolOrder[currentToolIndex - 1]);
                }
                break;
            case '=':
            case '+':
                // Next weapon
                if (currentToolIndex < toolOrder.length - 1) {
                    selectTool(toolOrder[currentToolIndex + 1]);
                }
                break;
            case ';':
                // Volume down
                if (window.destructionVolume > 0.05) {
                    window.destructionVolume = Math.max(0, window.destructionVolume - 0.05);
                    if (volumeSlider) volumeSlider.value = window.destructionVolume;
                }
                break;
            case "'":
                // Volume up
                if (window.destructionVolume < 1) {
                    window.destructionVolume = Math.min(1, window.destructionVolume + 0.05);
                    if (volumeSlider) volumeSlider.value = window.destructionVolume;
                }
                break;
        }
    });

    function selectTool(toolName) {
        const btn = document.querySelector(`.tool-button[data-tool="${toolName}"]`);
        if (btn) btn.click();
    }

    // --- README FILE ON DESKTOP ---
    function createReadmeOnDesktop() {
        const desktopGrid = document.querySelector('.desktop-grid');
        if (!desktopGrid) return;
        // Prevent duplicate README
        if (document.getElementById('readme-desktop-shortcuts')) return;
        const iconDiv = document.createElement('div');
        iconDiv.className = 'desktop-icon';
        iconDiv.id = 'readme-desktop-shortcuts';
        iconDiv.innerHTML = `
            <img src="assets/icons/help.png" class="icon-image" alt="README" style="max-width: 32px; max-height: 32px; object-fit: contain;">
            <div class="icon-label">README.txt</div>
        `;
        iconDiv.onclick = function() {
            openReadmeWindow();
        };
        desktopGrid.appendChild(iconDiv);
    }

    function openReadmeWindow() {
        const windowId = 'window-readme-shortcuts';
        if (document.getElementById(windowId)) return;
        const windowDiv = document.createElement('div');
        windowDiv.className = 'win95-window';
        windowDiv.id = windowId;
        windowDiv.style.position = 'absolute';
        windowDiv.style.top = '120px';
        windowDiv.style.left = '220px';
        windowDiv.style.width = '600px';
        windowDiv.style.height = '500px';
        windowDiv.style.zIndex = '100';
        windowDiv.innerHTML = `
            <div class="win95-title-bar">
                <span>README.txt</span>
                <div class="win95-controls">
                    <button class="win95-btn" onclick="minimizeWindow('${windowId}')">_</button>
                    <button class="win95-btn" onclick="maximizeWindow('${windowId}')">□</button>
                    <button class="win95-btn" onclick="closeWindow('${windowId}')">×</button>
                </div>
            </div>
            <div class="win95-window-body" style="height: calc(100% - 22px); overflow: auto; padding: 10px; font-family: monospace; font-size: 14px;">
                <div id="achievements-section" style="margin-bottom: 20px;">
                    <b>Achievements</b><br><br>
                    <div id="achievements-list">
                        <em>No achievements collected yet.</em>
                    </div>
                </div>
                
                <hr style="margin: 20px 0;">
                
                <div style="margin-bottom: 20px;">
                    <b>Key Bindings</b><br><br>
                    <table style="width:100%; border-collapse: collapse;">
                      <tr><th style='text-align:left;'>Key</th><th style='text-align:left;'>Function</th></tr>
                      <tr><td>Mouse</td><td>Fire weapon</td></tr>
                      <tr><td>1</td><td>Hammer</td></tr>
                      <tr><td>2</td><td>Machine gun</td></tr>
                      <tr><td>3</td><td>Stamp</td></tr>
                      <tr><td>4</td><td>Zapper</td></tr>
                      <tr><td>C</td><td>Clear screen</td></tr>
                      <tr><td>-</td><td>Previous weapon</td></tr>
                      <tr><td>=</td><td>Next weapon</td></tr>
                      <tr><td>;</td><td>Volume down</td></tr>
                      <tr><td>'</td><td>Volume up</td></tr>
                    </table>
                </div>
            </div>
        `;
        document.getElementById('windows-container').appendChild(windowDiv);
        openWindows.push(windowId);
        makeWindowDraggable(windowDiv);
        bringWindowToFront(windowDiv);
        
        // Update achievements display when window opens
        updateAchievementsDisplay();
    }
    
    // Function to update achievements display in README.txt window
    function updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievements-list');
        if (!achievementsList) return;
        
        if (achievements.length === 0) {
            achievementsList.innerHTML = '<em>No achievements collected yet.</em>';
        } else {
            const achievementsHtml = achievements.map(achievement => 
                `You collected the following: ${achievement} (${achievements.indexOf(achievement) + 1}/${achievements.length})`
            ).join('<br>');
            achievementsList.innerHTML = achievementsHtml;
        }
        
        console.log('✅ Achievements display updated');
    }
    
    // Make function globally accessible
    window.updateAchievementsDisplay = updateAchievementsDisplay;

    // Create the README icon on desktop after DOMContentLoaded
    createReadmeOnDesktop();

    // Initialize Minesweeper if the window is already open
    if (document.getElementById('minesweeper-grid')) {
        initializeMinesweeper();
    }
}); 

window.openWindow = openWindow; 

// Remove the zapperDestroy function's visual effect
function zapperDestroy(x, y) {
    // Play zap sound
    const zapAudio = new Audio('assets/zap.ogg');
    zapAudio.volume = window.destructionVolume || 0.3;
    zapAudio.play();
    // Create a zap hole effect at the click location
    const zapHole = document.createElement('div');
    zapHole.className = 'zapper-zap-hole';
    zapHole.style.position = 'absolute';
    zapHole.style.left = (x - 66) + 'px'; // Offset by +15px
    zapHole.style.top = (y - 66) + 'px';  // Offset by +15px
    zapHole.style.width = '55px';
    zapHole.style.height = '55px';
    zapHole.style.backgroundImage = 'url("assets/zap hole.png")';
    zapHole.style.backgroundSize = 'contain';
    zapHole.style.backgroundRepeat = 'no-repeat';
    zapHole.style.pointerEvents = 'none';
    zapHole.style.zIndex = '1300';
    document.getElementById('desktop').appendChild(zapHole);
} 

// ===== MINESWEEPER GAME IMPLEMENTATION =====

// Minesweeper sprite sheet constants
const SPRITE_SIZE = 25;
const SPRITE_COUNT = 16;
const SPRITE_SHEET = 'assets/minesweeper/blocks.png';

// Smiley face sprite sheet constants
const SMILEY_SIZE = 44; // 48x48 scaled down to 44x44 to fit nicely in header
const SMILEY_COUNT = 5;
const SMILEY_SHEET = 'assets/minesweeper/smileys.png';

// Sprite indices (from top to bottom in the 40x640 image)
const SPRITES = {
    UNCLICKED: 0,      // block (unclicked closed, normal default)
    FLAGGED: 1,        // block (flagged, closed)
    QUESTIONED: 2,     // block (questioned, closed)
    RED_BOMBED: 3,     // block (red and bombed, open)
    BOMB_CROSS: 4,     // block (bomb with cross, open)
    BOMB: 5,           // block (bomb, open)
    QUESTIONED_OPEN: 6, // block (questioned, open)
    NUMBER_7: 7,       // blocks representing numbers 7 to 1
    NUMBER_6: 8,
    NUMBER_5: 9,
    NUMBER_4: 10,
    NUMBER_3: 11,
    NUMBER_2: 12,
    NUMBER_1: 13,
    EMPTY: 14          // empty block
};

// Smiley face sprite indices (from top to bottom in the 48x240 image)
const SMILEYS = {
    HAPPY_CLICKED: 0,   // smiley (clicked) - top
    SUNGLASSES: 1,      // sunglasses - second
    DEAD: 2,            // dead - third
    OPEN_MOUTH: 3,      // open mouth - fourth
    HAPPY_UNOPENED: 4   // smiley (unopened) - bottom
};

// Minesweeper game state
let minesweeperGame = {
    grid: [],
    revealed: [],
    flagged: [],
    gameOver: false,
    gameWon: false,
    mineCount: 10,
    timer: 0,
    timerInterval: null,
    firstClick: true,
    spriteSheet: null,
    smileySheet: null
};

// Load the sprite sheet
function loadMinesweeperSprites() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            minesweeperGame.spriteSheet = img;
            resolve(img);
        };
        img.onerror = (error) => {
            console.error('Failed to load block sprite sheet:', error);
            reject(error);
        };
        img.src = SPRITE_SHEET;
    });
}

// Load the smiley face sprite sheet
function loadMinesweeperSmileys() {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            minesweeperGame.smileySheet = img;
            
            // Check if dimensions match expectations
            if (img.width !== 48 || img.height !== 240) {
                console.warn('WARNING: Smiley sheet dimensions do not match expected 48x240!');
                console.warn('This may cause incorrect sprite positioning.');
            }
            
            resolve(img);
        };
        img.onerror = (error) => {
            console.error('Failed to load smiley face sprite sheet:', error);
            reject(error);
        };
        img.src = SMILEY_SHEET;
    });
}

// Render a smiley face from the sprite sheet
function renderSmiley(spriteIndex) {
    const smileyElement = document.getElementById('minesweeper-smiley');
    if (!smileyElement) {
        console.warn('Smiley element not found, cannot render smiley face');
        return;
    }
    
    const smileyName = Object.keys(SMILEYS).find(key => SMILEYS[key] === spriteIndex);
        
    // Clear any existing content and styles
    smileyElement.innerHTML = '';
    smileyElement.style.backgroundImage = '';
    smileyElement.style.backgroundSize = '';
    smileyElement.style.backgroundPosition = '';
    smileyElement.style.backgroundRepeat = '';
    smileyElement.style.animation = 'none';
    smileyElement.style.transition = 'none';
    
    // Set the smiley sheet as background
    smileyElement.style.backgroundImage = `url(${SMILEY_SHEET})`;
    
    // The original smiley sheet is 48x240 (5 sprites of 48x48 each)
    // CSS scales it down to 44x220 (5 sprites of 44x44 each)
    // So each sprite is now 44px tall in the scaled sheet
    
    // Calculate the Y position in the scaled sheet
    // Each sprite is now 44px tall, so position = spriteIndex * 44
    const y = spriteIndex * 44;
    // For sprite sheets, use negative Y to move "up" in the sheet
    // This positions the sprite correctly within the original sheet
    smileyElement.style.backgroundPosition = `0 -${y}px`;
    
    smileyElement.style.backgroundRepeat = 'no-repeat';

}

// Render a sprite from the sprite sheet
function renderSprite(cell, spriteIndex) {
    // Clear any existing content and styles
    cell.innerHTML = '';
    cell.style.backgroundImage = '';
    cell.style.backgroundSize = '';
    cell.style.backgroundPosition = '';
    cell.style.backgroundRepeat = '';
    cell.style.animation = 'none';
    cell.style.transition = 'none';
    
    // Set the sprite sheet as background
    cell.style.backgroundImage = `url(${SPRITE_SHEET})`;
    
    // The original sprite sheet is 40x640 (16 sprites of 40x40 each)
    // We want to display it in 25x25 cells
    // So we need to scale the entire sheet proportionally
    const originalSpriteSize = 40;
    const originalSheetHeight = 640;
    const scaleFactor = SPRITE_SIZE / originalSpriteSize; // 25/40 = 0.625
    
    // Scale the entire sprite sheet: 40x640 becomes 25x400
    const scaledSheetHeight = originalSheetHeight * scaleFactor;
    cell.style.backgroundSize = `25px ${scaledSheetHeight}px`;
    
    // Calculate the Y position in the scaled sheet
    const y = spriteIndex * SPRITE_SIZE;
    cell.style.backgroundPosition = `0 -${y}px`;
    
    cell.style.backgroundRepeat = 'no-repeat';
    
}

// Initialize Minesweeper when window opens
function initializeMinesweeper() {
    if (minesweeperGame.timerInterval) {
        clearInterval(minesweeperGame.timerInterval);
    }
    
    // Reset game state completely
    minesweeperGame = {
        grid: [],
        revealed: [],
        flagged: [],
        gameOver: false,
        gameWon: false,
        mineCount: 10,
        timer: 0,
        timerInterval: null,
        firstClick: true,
        spriteSheet: null,
        smileySheet: null
    };
    
    // Load both sprite sheets first, then create grid
    Promise.all([
        loadMinesweeperSprites(),
        loadMinesweeperSmileys()
    ]).then(() => {
        updateMineCount();
        updateTimer();
        createGrid();
        // Set initial smiley face based on game state - only after sheets are loaded
        updateSmileyFace();
    }).catch(error => {
        console.error('Failed to load Minesweeper sprites:', error);
        // Fallback to text-based display
        updateMineCount();
        updateTimer();
        createGrid();
        console.warn('Skipping smiley face update due to sprite loading failure');
    });
}

function createGrid() {
    const gridContainer = document.getElementById('minesweeper-grid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    // Initialize empty grid
    for (let row = 0; row < 9; row++) {
        minesweeperGame.grid[row] = [];
        minesweeperGame.revealed[row] = [];
        minesweeperGame.flagged[row] = [];
        
        for (let col = 0; col < 9; col++) {
            minesweeperGame.grid[row][col] = 0;
            minesweeperGame.revealed[row][col] = false;
            minesweeperGame.flagged[row][col] = false;
        }
    }
    
    // Create grid cells
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement('div');
            cell.className = 'minesweeper-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.style.cssText = `
                width: ${SPRITE_SIZE}px;
                height: ${SPRITE_SIZE}px;
                border: 2px outset #c0c0c0;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                user-select: none;
                animation: none !important;
                transition: none !important;
            `;
            
            // Left click to reveal
            cell.addEventListener('click', (e) => handleCellClick(row, col));
            // Right click to flag
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(row, col);
            });
            
            gridContainer.appendChild(cell);
            
            // Set initial sprite for unclicked cell
            renderSprite(cell, SPRITES.UNCLICKED);
        }
    }
}

// Handle left click on cell
function handleCellClick(row, col) {
    if (minesweeperGame.gameOver || minesweeperGame.gameWon || minesweeperGame.flagged[row][col]) {
        return;
    }
    
    // Show open mouth smiley when clicking
    renderSmiley(SMILEYS.OPEN_MOUTH);
    
    if (minesweeperGame.firstClick) {
        placeMines(row, col);
        startTimer();
        minesweeperGame.firstClick = false;
    }
    
    if (minesweeperGame.grid[row][col] === -1) {
        gameOver(false);
        return;
    }
    
    revealCell(row, col);
    checkWinCondition();
    
    // Update smiley face based on new game state
    setTimeout(() => {
        updateSmileyFace();
    }, 100);
}

// Handle right click on cell
function handleRightClick(row, col) {
    if (minesweeperGame.gameOver || minesweeperGame.gameWon || minesweeperGame.revealed[row][col]) {
        return;
    }
    
    // Show open mouth smiley when flagging
    renderSmiley(SMILEYS.OPEN_MOUTH);
    
    minesweeperGame.flagged[row][col] = !minesweeperGame.flagged[row][col];
    updateCellDisplay(row, col);
    updateMineCount();
    
    setTimeout(() => {
        updateSmileyFace();
    }, 100);
}

// Place mines after first click
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    
    while (minesPlaced < minesweeperGame.mineCount) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        
        // Don't place mine on first click or where there's already a mine
        if ((row !== firstRow || col !== firstCol) && minesweeperGame.grid[row][col] !== -1) {
            minesweeperGame.grid[row][col] = -1;
            minesPlaced++;
        }
    }
    
    // Calculate numbers for adjacent cells
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (minesweeperGame.grid[row][col] !== -1) {
                minesweeperGame.grid[row][col] = countAdjacentMines(row, col);
            }
        }
    }
}

// Count adjacent mines
function countAdjacentMines(row, col) {
    let count = 0;
    for (let r = Math.max(0, row - 1); r <= Math.min(8, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(8, col + 1); c++) {
            if (minesweeperGame.grid[r][c] === -1) {
                count++;
            }
        }
    }
    return count;
}

// Reveal a cell
function revealCell(row, col) {
    if (minesweeperGame.revealed[row][col] || minesweeperGame.flagged[row][col]) {
        return;
    }
    
    minesweeperGame.revealed[row][col] = true;
    updateCellDisplay(row, col);
    
    // If cell has no adjacent mines, reveal adjacent cells
    if (minesweeperGame.grid[row][col] === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(8, row + 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(8, col + 1); c++) {
                if (!minesweeperGame.revealed[r][c] && !minesweeperGame.flagged[r][c]) {
                    revealCell(r, c);
                }
            }
        }
    }
}

// Update cell display
function updateCellDisplay(row, col) {
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (!cell) return;
    
    // Use sprites instead of emojis
    if (minesweeperGame.flagged[row][col]) {
        renderSprite(cell, SPRITES.FLAGGED);
        cell.style.border = '2px outset #c0c0c0';
    } else if (minesweeperGame.revealed[row][col]) {
        if (minesweeperGame.grid[row][col] === -1) {
            renderSprite(cell, SPRITES.RED_BOMBED);
            cell.style.border = '2px inset #c0c0c0';
        } else if (minesweeperGame.grid[row][col] === 0) {
            renderSprite(cell, SPRITES.EMPTY);
            cell.style.border = '2px inset #c0c0c0';
        } else {
            // Map numbers to sprite indices (7 to 1)
            const numberSpriteMap = {
                7: SPRITES.NUMBER_7,
                6: SPRITES.NUMBER_6,
                5: SPRITES.NUMBER_5,
                4: SPRITES.NUMBER_4,
                3: SPRITES.NUMBER_3,
                2: SPRITES.NUMBER_2,
                1: SPRITES.NUMBER_1
            };
            renderSprite(cell, numberSpriteMap[minesweeperGame.grid[row][col]]);
            cell.style.border = '2px inset #c0c0c0';
        }
    } else {
        renderSprite(cell, SPRITES.UNCLICKED);
        cell.style.border = '2px outset #c0c0c0';
    }
}

// Start timer
function startTimer() {
    minesweeperGame.timerInterval = setInterval(() => {
        minesweeperGame.timer++;
        updateTimer();
    }, 1000);
}

// Update timer display
function updateTimer() {
    const timerElement = document.getElementById('minesweeper-timer');
    if (timerElement) {
        timerElement.textContent = minesweeperGame.timer.toString().padStart(3, '0');
    }
}

// Update mine count display
function updateMineCount() {
    const mineCountElement = document.getElementById('minesweeper-mine-count');
    if (mineCountElement) {
        const flaggedCount = minesweeperGame.flagged.flat().filter(Boolean).length;
        mineCountElement.textContent = (minesweeperGame.mineCount - flaggedCount).toString();
    }
}

// Check win condition
function checkWinCondition() {
    let revealedCount = 0;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (minesweeperGame.revealed[row][col]) {
                revealedCount++;
            }
        }
    }
    
    if (revealedCount === 81 - minesweeperGame.mineCount) {
        gameOver(true);
    }
}

function gameOver(won) {
    minesweeperGame.gameOver = true;
    minesweeperGame.gameWon = won;
    
    if (minesweeperGame.timerInterval) {
        clearInterval(minesweeperGame.timerInterval);
    }
    
    // Update smiley face based on game result
    updateSmileyFace();
    
    // Reveal all mines and show incorrectly flagged cells
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (minesweeperGame.grid[row][col] === -1) {
                // Show mine
                minesweeperGame.revealed[row][col] = true;
                updateCellDisplay(row, col);
            } else if (minesweeperGame.flagged[row][col]) {
                // Show incorrectly flagged cell with cross
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    renderSprite(cell, SPRITES.BOMB_CROSS);
                    cell.style.border = '2px inset #c0c0c0';
                }
            }
        }
    }
    
    // Show game over message
    setTimeout(() => {
        if (won) {
            alert('Congratulations! You won! 🎉');
        } else {
            alert('Game Over! 💣');
            // Show "Blown Up" achievement when player loses
            setTimeout(() => {
                showAchievementPopup("Blown Up");
            }, 500);
        }
    }, 100);
}

// New game function
function minesweeperNewGame() {
    initializeMinesweeper();
    // Reset smiley face based on game state
    updateSmileyFace();
}

// Update smiley face based on game state
function updateSmileyFace() {
    if (minesweeperGame.gameOver) {
        if (minesweeperGame.gameWon) {
            renderSmiley(SMILEYS.SUNGLASSES);
        } else {
            renderSmiley(SMILEYS.DEAD);
        }
    } else if (minesweeperGame.firstClick) {
        renderSmiley(SMILEYS.HAPPY_UNOPENED);
    } else {
        renderSmiley(SMILEYS.HAPPY_CLICKED);
    }
}

// Make functions globally accessible
window.minesweeperNewGame = minesweeperNewGame;
window.initializeMinesweeper = initializeMinesweeper;
window.renderSprite = renderSprite;
window.loadMinesweeperSprites = loadMinesweeperSprites; 
window.loadMinesweeperSmileys = loadMinesweeperSmileys;
window.renderSmiley = renderSmiley; 
window.updateSmileyFace = updateSmileyFace;



// Achievement tracking system
let achievements = [];
let achievementsAddedToReadme = false;

// Achievement popup functions
function showAchievementPopup(achievementTitle = "Boulevard of Broken Dreams") {
    const popup = document.getElementById('achievementPopup');
    const titleElement = popup.querySelector('.achievement-content p');
    
    // Update the achievement title
    titleElement.textContent = achievementTitle;
    
    // Track the achievement
    if (!achievements.includes(achievementTitle)) {
        achievements.push(achievementTitle);
        
        // If this is the first achievement, add to README
        if (!achievementsAddedToReadme) {
            addAchievementsToReadme();
            achievementsAddedToReadme = true;
        }
        
        // Update achievements display in README.txt window
        updateAchievementsDisplay();
    }
    
    popup.classList.remove('hidden');
    
    // Add a small delay to make it feel more natural
    setTimeout(() => {
        popup.style.opacity = '1';
    }, 100);
}

function closeAchievementPopup() {
    const popup = document.getElementById('achievementPopup');
    popup.classList.add('hidden');
}



// Function to add achievements to README.txt window
function addAchievementsToReadme() {
    // Update the achievements display in README.txt window
    updateAchievementsDisplay();
    
    // Show popup with achievement info
    const achievementInfo = document.createElement('div');
    achievementInfo.className = 'achievement-info';
    achievementInfo.innerHTML = `
        <div style="background: #c0c0c0; border: 2px outset #c0c0c0; padding: 15px; margin: 20px; font-family: 'W95FA', monospace;">
            <h3 style="margin-top: 0;">🏆 Achievement Unlocked!</h3>
            <p>You've unlocked your first achievement! Check the README.txt window to see your progress.</p>
            <button onclick="this.parentElement.remove()" style="background: #c0c0c0; border: 2px outset #c0c0c0; padding: 5px 15px; cursor: pointer;">Close</button>
        </div>
    `;
    
    // Add it to the page
    document.body.appendChild(achievementInfo);
    
    console.log('🏆 Achievement added to README.txt window');
}

// Show achievement popup when Network Neighborhood is opened
function openWindowWithAchievement(windowId) {
    openWindow(windowId);
    
    // Check if this is the Network Neighborhood window
    if (windowId === 'network-neighborhood') {
        // Show achievement popup after a short delay
        setTimeout(() => {
            showAchievementPopup("Boulevard of Broken Dreams");
        }, 500);
    }
}

// Make achievement functions globally accessible
window.showAchievementPopup = showAchievementPopup;
window.closeAchievementPopup = closeAchievementPopup;
window.openWindowWithAchievement = openWindowWithAchievement;
window.addAchievementsToReadme = addAchievementsToReadme;

// Debug function to test achievements
window.testAchievements = function() {
    console.log('Current achievements:', achievements);
    if (achievements.length > 0) {
        updateAchievementsDisplay();
    } else {
        console.log('No achievements unlocked yet!');
    }
};