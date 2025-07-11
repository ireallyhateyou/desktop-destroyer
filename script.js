let destructionCount = 0;
let gameState = {
    elementsDestroyed: [],
    cracks: [],
    holes: []
};

// Damage tracking system
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
const HAMMER_WIDTH = 85; // Reduced from 107
const HAMMER_HEIGHT = 119; // Reduced from 149
const HAMMER_IDLE = 'assets/hammer idle.png';
const HAMMER_CLICK = 'assets/hammer click.png';

// Stamp image sizes 
const STAMP_WIDTH = 96;
const STAMP_HEIGHT = 96;
const STAMP_IDLE = 'assets/stamp idle.png';
const STAMP_CLICK = 'assets/stamp click.png';

// Glass break damage system
const GLASS_BREAK_FRAME_WIDTH = 150;
const MAX_DAMAGE_LEVEL = 5; // 6 frames total (0-5)


// Global destruction tool volume
window.destructionVolume = 0.3;

// Global window management variables and functions
let windowCounter = 0;
let openWindows = [];

function openWindow(windowType) {
    const windowId = `window-${windowType}-${++windowCounter}`;
    const windowContent = getWindowContent(windowType);
    
    const window = document.createElement('div');
    window.className = 'win95-window';
    window.id = windowId;
    window.style.position = 'absolute';
    window.style.top = '100px';
    window.style.left = '200px';
    window.style.width = '400px';
    window.style.height = '300px';
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
            content: `<div style='padding:10px;'><h3>Network Neighborhood</h3><p>uhhhhhhh</p></div>`
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
        
        // Start Menu Items
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
            content: `<div style='padding:10px;'><h3>Minesweeper</h3><p>pretend you can mine here too</p></div>`
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
        // For compatibility, set the damage of the last break at this location
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
                return;
            }
            // Deactivate all, activate this
            toolButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTool = this.dataset.tool;
            // Change cursor based on tool
            if (currentTool === 'hammer') {
                setHammerCursorActive(true);
            } else if (currentTool === 'stamp') {
                setStampCursorActive(true);
            } else {
                setHammerCursorActive(false);
                setStampCursorActive(false);
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
    desktop.addEventListener('mousemove', function(e) {
        if (currentTool === 'hammer' && customCursor.style.display === 'block') {
            // Offset so the tip of the hammer is at the pointer
            const offsetX = 32; // adjust so hammer tip is at pointer
            const offsetY = 16;
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
        } else if (currentTool === 'stamp' && customCursor.style.display === 'block') {
            // Offset for stamp cursor 
            const offsetX = 32; // adjust so stamp center is at pointer
            const offsetY = 32;
            customCursor.style.left = (e.clientX - offsetX) + 'px';
            customCursor.style.top = (e.clientY - offsetY) + 'px';
            lastCursorX = e.clientX;
            lastCursorY = e.clientY;
        }
    });

    desktop.addEventListener('mouseenter', function(e) {
        if (currentTool === 'hammer') {
            setHammerCursorActive(true);
        } else if (currentTool === 'stamp') {
            setStampCursorActive(true);
        }
    });
    desktop.addEventListener('mouseleave', function(e) {
        setHammerCursorActive(false);
        setStampCursorActive(false);
    });
    desktop.addEventListener('mousedown', function(e) {
        if (currentTool === 'hammer') {
            customCursor.innerHTML = `<img src="${HAMMER_CLICK}" style="width:auto;height:auto;display:block;">`;
        } else if (currentTool === 'stamp') {
            customCursor.innerHTML = `<img src="${STAMP_CLICK}" style="width:auto;height:auto;display:block;">`;
        }
    });
    desktop.addEventListener('mouseup', function(e) {
        if (currentTool === 'hammer') {
            customCursor.innerHTML = `<img src="${HAMMER_IDLE}" style="width:auto;height:auto;display:block;">`;
        } else if (currentTool === 'stamp') {
            customCursor.innerHTML = `<img src="${STAMP_IDLE}" style="width:auto;height:auto;display:block;">`;
        }
    });

    // Update destruction event to check for currentTool
    desktop.addEventListener('click', function(e) {
        if (!currentTool) return;
        if (e.target.classList.contains('tool-button') || e.target.closest('.toolbar')) {
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
        stampElement.style.left = (x - 67) + 'px'; // 128px to the left
        stampElement.style.top = (y - 20) + 'px'; // Adjust for stamp size
        stampElement.style.width = 'auto';
        stampElement.style.height = 'auto';
        stampElement.style.maxWidth = '100px'; // Limit size if needed
        stampElement.style.maxHeight = '100px';
        stampElement.src = `assets/stamp${stampNumber}.png`;
        stampElement.style.opacity = '1';
        stampElement.style.zIndex = '1000';
        stampElement.style.pointerEvents = 'none';
        document.getElementById('desktop').appendChild(stampElement);
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
        document.querySelectorAll('.destruction-particle, .crack, .hole, .fire-particle, .spark, .glass-break-damage, .stamp-effect').forEach(el => el.remove());
        
        // Reset all elements
        document.querySelectorAll('.desktop-icon, .window').forEach(el => {
            el.style.filter = '';
            el.style.transform = '';
            el.style.opacity = '';
            el.style.animation = '';
            el.style.background = '';
            el.style.clipPath = '';
        });
        
        // Clear damage tracking
        damageMap.clear();
        glassBreaksMap.clear(); // Clear glass breaks map
        glassBreakIdCounter = 0; // Reset glass break ID counter
        
        destructionCount = 0;
        gameState = { elementsDestroyed: [], cracks: [], holes: [] };
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
}); 

console.log('Script loaded successfully');
window.openWindow = openWindow;
console.log('openWindow function is now globally accessible'); 