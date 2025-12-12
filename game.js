/**
 * How to Get Rid of Ants: The Game
 * A text-based survival simulation set in Lagos, Nigeria
 * 
 * Design Philosophy:
 * - The "ants" represent intrusive thoughts, anxiety, and the weight of daily survival
 * - Every mechanic should reinforce the theme of precarious balance
 * - Lagos-specific authenticity in events, prices, and cultural details
 * - Fair but challenging difficulty with meaningful choices
 */

// ========================================================================
// INITIALIZATION MANAGER
// ========================================================================

window.GameInitializer = {
    initialized: false,
    elementsLoaded: false,
    gameStarted: false,
    hasError: false,
    errorMessage: "",
    
    init: function() {
        console.log("🐜 How to Get Rid of Ants: Starting initialization...");
        try {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));
            } else {
                this.onDOMLoaded();
            }
        } catch (error) {
            this.handleInitError(error, "Failed to initialize");
        }
    },
    
    onDOMLoaded: function() {
        console.log("DOM loaded, setting up game systems...");
        try {
            window.domElements = {};
            this.cacheDOMElements();
            this.elementsLoaded = true;
            
            resetGameState();
            this.initializeVisuals();
            initAntSystem();
            
            this.startGame();
            this.initialized = true;
            console.log("🐜 Game initialization complete");
        } catch (error) {
            this.handleInitError(error, "Error during initialization");
        }
    },
    
    cacheDOMElements: function() {
        domElements.joyBar = document.getElementById('joy-bar');
        domElements.fullnessBar = document.getElementById('fullness-bar');
        domElements.stressBar = document.getElementById('stress-bar');
        domElements.joyValue = document.getElementById('joy-value');
        domElements.fullnessValue = document.getElementById('fullness-value');
        domElements.stressValue = document.getElementById('stress-value');
        domElements.moneyValue = document.getElementById('money-value');
        domElements.dayValue = document.getElementById('day-value');
        domElements.timeValue = document.getElementById('time-value');
        domElements.narrativeText = document.getElementById('narrative-text');
        domElements.choicesContainer = document.getElementById('choices-container');
        domElements.antOverlay = document.getElementById('ant-overlay');
        domElements.gameContent = document.getElementById('game-content');
        domElements.cityscape = document.getElementById('cityscape');
        domElements.deadlineContainer = document.getElementById('deadline-container');
        domElements.deadlineBar = document.getElementById('deadline-bar');
        domElements.deadlineValue = document.getElementById('deadline-value');
        
        const essential = ['narrativeText', 'choicesContainer', 'gameContent'];
        const missing = essential.filter(el => !domElements[el]);
        if (missing.length > 0) {
            throw new Error(`Missing elements: ${missing.join(', ')}`);
        }
    },
    
    initializeVisuals: function() {
        addFloatingElements();
        updateCityscape();
    },
    
    startGame: function() {
        showCharacterCreation();
        this.gameStarted = true;
    },
    
    handleInitError: function(error, context) {
        this.hasError = true;
        this.errorMessage = `${context}: ${error.message}`;
        console.error(this.errorMessage, error);
        this.displayErrorMessage();
    },
    
    displayErrorMessage: function() {
        try {
            const narrativeEl = document.getElementById('narrative-text');
            const choicesEl = document.getElementById('choices-container');
            
            if (narrativeEl) {
                narrativeEl.innerHTML = `
                    <h2>Something went wrong</h2>
                    <p>The game encountered an error:</p>
                    <p style="color: var(--danger-red); font-family: var(--font-mono);">${this.errorMessage}</p>
                    <p>Please refresh the page to try again.</p>
                `;
            }
            
            if (choicesEl) {
                choicesEl.innerHTML = `
                    <button class="choice-btn" onclick="location.reload()">Refresh Page</button>
                `;
            }
        } catch (e) {
            console.error("Could not display error:", e);
        }
    }
};

// ========================================================================
// CONSTANTS AND CONFIGURATION
// ========================================================================

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", 
              "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", 
              "10:00 PM", "12:00 AM"];

// REBALANCED: More nuanced decay rates
const DECAY_RATES = {
    idle: { fullness: 1.5, joy: -2.0, stress: -0.2 },
    work: { fullness: 3.5, joy: -2.5, stress: 0.5 },
    physical: { fullness: 5.0, joy: 0.8, stress: 0.3 },
    sleep: { fullness: 10, joy: -2.5, stress: -5.0 }
};

// REBALANCED: More nuanced class differences
const CLASS_MODIFIERS = {
    'working': {
        eventChance: 1.2,
        goodEventChance: 0.35,
        incomeMultiplier: 0.75,
        costMultiplier: 0.85,      // Lower costs (budgeting skills)
        communitySupport: 0.40,    // Strong community bonds
        stressFromWork: 1.2,
        joyFromLeisure: 1.3,       // Simple pleasures mean more
        startingMoney: 0.65
    },
    'middle': {
        eventChance: 1.0,
        goodEventChance: 0.45,
        incomeMultiplier: 1.0,
        costMultiplier: 1.0,
        communitySupport: 0.20,
        stressFromWork: 1.0,
        joyFromLeisure: 1.0,
        startingMoney: 1.0
    },
    'upper': {
        eventChance: 0.85,
        goodEventChance: 0.55,
        incomeMultiplier: 1.15,    // Reduced from 1.2
        costMultiplier: 1.5,       // Higher expectations = higher costs
        communitySupport: 0.08,
        stressFromWork: 0.85,
        joyFromLeisure: 0.75,      // Diminishing returns
        startingMoney: 1.6
    }
};

// ENHANCED: More varied food options with Lagos authenticity
const FOOD_OPTIONS = [
    // Street Food
    { name: "Suya", cost: 4000, fullnessBoost: 20, joyBoost: 12, location: "roadside", sickChance: 0.15 },
    { name: "Akara and pap", cost: 2500, fullnessBoost: 25, joyBoost: 8, location: "roadside", sickChance: 0.10 },
    { name: "Boli and groundnut", cost: 2000, fullnessBoost: 22, joyBoost: 10, location: "roadside", sickChance: 0.08 },
    
    // Regular meals
    { name: "Jollof rice", cost: 5500, fullnessBoost: 38, joyBoost: 14, location: "all", sickChance: 0.05 },
    { name: "Rice and stew with chicken", cost: 6500, fullnessBoost: 40, joyBoost: 12, location: "all", sickChance: 0.04 },
    { name: "Eba and egusi soup", cost: 5000, fullnessBoost: 45, joyBoost: 10, location: "all", sickChance: 0.05 },
    { name: "Amala and ewedu", cost: 4500, fullnessBoost: 42, joyBoost: 11, location: "all", sickChance: 0.05 },
    { name: "Ofada rice and ayamase", cost: 7000, fullnessBoost: 42, joyBoost: 15, location: "all", sickChance: 0.03 },
    
    // Restaurant/Premium
    { name: "Pepper soup and swallow", cost: 8000, fullnessBoost: 38, joyBoost: 16, location: "restaurant", sickChance: 0.02 },
    { name: "Grilled fish platter", cost: 12000, fullnessBoost: 35, joyBoost: 18, location: "restaurant", sickChance: 0.01 },
    { name: "Chinese takeaway", cost: 10000, fullnessBoost: 32, joyBoost: 14, location: "restaurant", sickChance: 0.02 },
    
    // Snacks/Sides
    { name: "Chin chin and zobo", cost: 1500, fullnessBoost: 12, joyBoost: 8, location: "all", sickChance: 0.02, isSnack: true },
    { name: "Puff puff", cost: 1000, fullnessBoost: 10, joyBoost: 9, location: "roadside", sickChance: 0.05, isSnack: true }
];

// ENHANCED: Ant-related flavor text (ludonarrative integration)
const ANT_THOUGHTS = {
    low_joy: [
        "The ants whisper that nothing will ever change.",
        "You feel them crawling at the edges of your thoughts.",
        "Each small failure feeds the colony in your mind.",
        "The ants are louder today. They know you're struggling."
    ],
    high_stress: [
        "The ants march in formation through your anxieties.",
        "You can almost hear them, countless legs on your nerves.",
        "The colony grows with every worry you feed it.",
        "They're building something in the dark corners of your mind."
    ],
    recovering: [
        "The ants retreat, just a little. There's hope.",
        "You push back against the crawling thoughts.",
        "The colony is quieter. You're winning, slowly.",
        "Breathe. The ants don't own this space."
    ],
    thriving: [
        "The ants are silent today. You've found your balance.",
        "Clear thoughts, clear mind. The colony has nothing to feed on.",
        "You remember why you keep fighting.",
        "Lagos is hard, but you're harder."
    ]
};

// ========================================================================
// GAME STATE
// ========================================================================

const gameState = {
    // Core stats
    joy: 100,
    fullness: 100,
    stress: 0,
    money: 0,
    
    // Time
    day: 0,
    time: 0,
    
    // Character
    job: null,
    class: null,
    age: null,
    location: null,
    playerName: "",
    companyName: "",
    
    // Flags
    hasTransportation: false,
    hasFamilyEmergency: false,
    isWorking: false,
    isSick: false,
    sicknessType: null, // 'food' or 'stress'
    rainedYesterday: false,
    hadRandomEventToday: false,
    
    // Work
    workProgress: 0,
    workdayStage: 0,
    currentWorkTimeAdvance: 0,
    deadline: 0,
    deadlineProgress: 0,
    
    // Tracking
    events: [],
    endingType: null,
    activeAnts: 0,
    antPool: [],
    antUpdateTimer: null,
    lastMealTime: -1,
    mealsToday: 0,
    
    // Activity tracking (for diminishing returns)
    eveningActivities: {
        tv: 0,
        social: 0,
        work: 0,
        exercise: 0,
        creative: 0
    },
    
    // Streaks
    streaks: {
        daysWithoutFood: 0,
        daysWithHighStress: 0,
        daysWithLowJoy: 0,
        consecutiveWorkDays: 0
    },
    
    // Anti-death spiral mechanic
    resiliencePoints: 2, // Safety net for new players
    
    // Game state
    isGameOver: false
};

function resetGameState() {
    Object.assign(gameState, {
        joy: 100,
        fullness: 100,
        stress: 0,
        money: 0,
        day: 0,
        time: 0,
        job: null,
        class: null,
        age: null,
        location: null,
        playerName: "",
        companyName: "",
        hasTransportation: false,
        hasFamilyEmergency: false,
        isWorking: false,
        isSick: false,
        sicknessType: null,
        rainedYesterday: false,
        hadRandomEventToday: false,
        workProgress: 0,
        workdayStage: 0,
        currentWorkTimeAdvance: 0,
        deadline: 0,
        deadlineProgress: 0,
        events: [],
        endingType: null,
        activeAnts: 0,
        antPool: [],
        antUpdateTimer: null,
        lastMealTime: -1,
        mealsToday: 0,
        eveningActivities: { tv: 0, social: 0, work: 0, exercise: 0, creative: 0 },
        streaks: { daysWithoutFood: 0, daysWithHighStress: 0, daysWithLowJoy: 0, consecutiveWorkDays: 0 },
        resiliencePoints: 2,
        isGameOver: false
    });
}

let domElements = {};

// ========================================================================
// UTILITY FUNCTIONS
// ========================================================================

// Get ant-related flavor text based on current state
function getAntThought() {
    if (gameState.joy >= 70 && gameState.stress <= 30) {
        return ANT_THOUGHTS.thriving[Math.floor(Math.random() * ANT_THOUGHTS.thriving.length)];
    } else if (gameState.joy >= 50 || gameState.stress <= 50) {
        return ANT_THOUGHTS.recovering[Math.floor(Math.random() * ANT_THOUGHTS.recovering.length)];
    } else if (gameState.stress > 70) {
        return ANT_THOUGHTS.high_stress[Math.floor(Math.random() * ANT_THOUGHTS.high_stress.length)];
    } else {
        return ANT_THOUGHTS.low_joy[Math.floor(Math.random() * ANT_THOUGHTS.low_joy.length)];
    }
}

// Show stat change notification
function showStatChange(statName, amount) {
    if (Math.abs(amount) < 0.5 || gameState.isGameOver) return;
    
    const notif = document.createElement('div');
    notif.classList.add('stat-change');
    
    let emoji, color;
    const isPositive = statName === 'stress' ? amount < 0 : amount > 0;
    
    switch(statName) {
        case 'joy':
            emoji = isPositive ? '😊' : '😔';
            break;
        case 'fullness':
            emoji = isPositive ? '🍚' : '😋';
            break;
        case 'stress':
            emoji = isPositive ? '😌' : '😰';
            break;
        case 'money':
            emoji = isPositive ? '💰' : '💸';
            break;
        default:
            emoji = '';
    }
    
    color = isPositive ? 'var(--success-green)' : 'var(--danger-red)';
    
    const displayAmount = statName === 'money' 
        ? `₦${Math.abs(Math.round(amount)).toLocaleString()}`
        : Math.abs(Math.round(amount));
    
    notif.innerHTML = `${emoji} ${amount > 0 ? '+' : '-'}${displayAmount}`;
    notif.style.color = color;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 2000);
}

// Update stat with bounds checking
function updateStat(statName, amount) {
    if (amount === 0 || gameState.isGameOver) return gameState[statName];
    
    const oldValue = gameState[statName];
    let newValue = oldValue + amount;
    
    // Apply bounds
    if (statName === 'joy' || statName === 'fullness') {
        newValue = Math.max(0, Math.min(100, newValue));
    } else if (statName === 'stress') {
        newValue = Math.max(0, Math.min(100, newValue));
    } else if (statName === 'money') {
        newValue = Math.max(-50000, newValue); // Allow small debt
    }
    
    gameState[statName] = newValue;
    
    // Visual feedback for significant changes
    if (Math.abs(newValue - oldValue) >= 0.5) {
        showStatChange(statName, newValue - oldValue);
    }
    
    return newValue;
}

// Cost modifier based on class
function modifyCost(baseCost) {
    if (!gameState.class) return baseCost;
    return Math.round(baseCost * CLASS_MODIFIERS[gameState.class].costMultiplier);
}

// Process income
function receivePay(amount) {
    if (!gameState.class) return amount;
    const adjusted = Math.round(amount * CLASS_MODIFIERS[gameState.class].incomeMultiplier);
    updateStat('money', adjusted);
    return adjusted;
}

// Generate company name
function generateCompanyName(job) {
    const prefixes = ["Lagos", "Naija", "West African", "Golden", "Royal", "Unity", "Diamond", "Sunrise", "Elite", "Heritage", "Pacific", "Mainland", "Island"];
    const suffixes = {
        'marketer': ["Marketing Solutions", "Advertising Agency", "Brand Consultants", "Media Group", "Promotions Ltd", "Digital Marketing"],
        'programmer': ["Tech Solutions", "Software Innovations", "Digital Systems", "CodeWorks", "Tech Hub", "IT Solutions", "DevOps Ltd"],
        'designer': ["Design Studio", "Creative Agency", "Visual Arts", "Graphics Plus", "Design Works", "Creative Lab"],
        'artist': ["Art Gallery", "Creative Collective", "Studio", "Art House", "Cultural Center", "Visual Arts"]
    };
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[job][Math.floor(Math.random() * suffixes[job].length)];
    return `${prefix} ${suffix}`;
}

// ========================================================================
// UI RENDERING
// ========================================================================

function updateUI() {
    if (gameState.isGameOver || !domElements.joyBar) return;
    
    try {
        // Update progress bars with critical state indicators
        if (domElements.joyBar) {
            domElements.joyBar.style.width = `${gameState.joy}%`;
            domElements.joyBar.classList.toggle('critical', gameState.joy <= 20);
        }
        if (domElements.fullnessBar) {
            domElements.fullnessBar.style.width = `${gameState.fullness}%`;
            domElements.fullnessBar.classList.toggle('critical', gameState.fullness <= 20);
        }
        if (domElements.stressBar) {
            domElements.stressBar.style.width = `${gameState.stress}%`;
            domElements.stressBar.classList.toggle('critical', gameState.stress >= 80);
        }
        
        // Update values
        if (domElements.joyValue) domElements.joyValue.textContent = Math.round(gameState.joy);
        if (domElements.fullnessValue) domElements.fullnessValue.textContent = Math.round(gameState.fullness);
        if (domElements.stressValue) domElements.stressValue.textContent = Math.round(gameState.stress);
        if (domElements.moneyValue) domElements.moneyValue.textContent = `₦${gameState.money.toLocaleString()}`;
        if (domElements.dayValue) domElements.dayValue.textContent = DAYS[gameState.day];
        if (domElements.timeValue) domElements.timeValue.textContent = TIMES[gameState.time];
        
        updateCityscape();
        updateDeadlineUI();
        updateAntVisualization();
        processStatInteractions();
    } catch (error) {
        console.error("UI update error:", error);
    }
}

function updateCityscape() {
    if (!domElements.cityscape) return;
    
    const time = gameState.time;
    if (time < 3) {
        domElements.cityscape.className = 'cityscape morning';
    } else if (time < 6) {
        domElements.cityscape.className = 'cityscape afternoon';
    } else {
        domElements.cityscape.className = 'cityscape evening';
    }
}

function updateDeadlineUI() {
    if (!domElements.deadlineContainer) return;
    
    if (gameState.deadline > 0) {
        domElements.deadlineContainer.classList.remove('hidden');
        const progress = Math.min(100, Math.round((gameState.deadlineProgress / gameState.deadline) * 100));
        
        if (domElements.deadlineBar) {
            domElements.deadlineBar.style.width = `${progress}%`;
            domElements.deadlineBar.setAttribute('aria-valuenow', progress);
            
            // Color coding
            if (gameState.day >= 4 && progress < 85) {
                domElements.deadlineBar.style.background = 'linear-gradient(90deg, var(--danger-red), var(--warning-orange))';
            } else if (gameState.day >= 3 && progress < 60) {
                domElements.deadlineBar.style.background = 'linear-gradient(90deg, var(--warning-orange), var(--accent-amber))';
            } else {
                domElements.deadlineBar.style.background = 'linear-gradient(90deg, var(--primary-emerald), var(--success-green))';
            }
        }
        
        if (domElements.deadlineValue) {
            domElements.deadlineValue.textContent = `${progress}%`;
        }
    } else {
        domElements.deadlineContainer.classList.add('hidden');
    }
}

function addFloatingElements() {
    const shapes = ['pyramid', 'cube', 'sphere', 'star'];
    const container = document.getElementById('geometric-elements');
    
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        shape.className = `floating-shape ${shapeType}`;
        shape.style.left = `${Math.random() * 90}%`;
        shape.style.top = `${Math.random() * 90}%`;
        shape.style.animationDelay = `${Math.random() * 5}s`;
        shape.style.animationDuration = `${15 + Math.random() * 10}s`;
        container.appendChild(shape);
    }
}

// ========================================================================
// ANT VISUALIZATION SYSTEM
// ========================================================================

function initAntSystem() {
    clearAntSystem();
    
    if (!domElements.antOverlay) return;
    
    gameState.antPool = [];
    const MAX_ANTS = 25;
    
    for (let i = 0; i < MAX_ANTS; i++) {
        const ant = document.createElement('div');
        ant.className = 'interactive-ant';
        ant.style.display = 'none';
        
        ant.addEventListener('click', function(e) {
            if (gameState.isGameOver) return;
            
            e.stopPropagation();
            this.classList.add('squished');
            
            // Small joy boost from squishing ants (reclaiming mental space)
            updateStat('joy', 0.5);
            updateStat('stress', -0.3);
            
            setTimeout(() => {
                if (this && this.parentNode) {
                    this.style.display = 'none';
                    this.classList.remove('squished');
                    gameState.activeAnts = Math.max(0, gameState.activeAnts - 1);
                }
            }, 250);
        });
        
        domElements.antOverlay.appendChild(ant);
        gameState.antPool.push(ant);
    }
    
    gameState.activeAnts = 0;
    scheduleAntUpdate();
}

function scheduleAntUpdate() {
    clearAntUpdateTimer();
    const interval = gameState.joy < 20 || gameState.stress > 80 ? 1500 : 600;
    gameState.antUpdateTimer = setTimeout(updateAntVisualization, interval);
}

function clearAntUpdateTimer() {
    if (gameState.antUpdateTimer) {
        clearTimeout(gameState.antUpdateTimer);
        gameState.antUpdateTimer = null;
    }
}

function clearAntSystem() {
    clearAntUpdateTimer();
    if (domElements.antOverlay) {
        domElements.antOverlay.innerHTML = '';
    }
    if (domElements.gameContent) {
        domElements.gameContent.classList.remove('text-distortion-light', 'text-distortion-medium', 'text-distortion-heavy');
    }
    gameState.activeAnts = 0;
    gameState.antPool = [];
}

function updateAntVisualization() {
    if (gameState.isGameOver) return;
    
    try {
        // REBALANCED: More gradual ant appearance
        const joyFactor = Math.max(0, 35 - gameState.joy) / 35;
        const stressFactor = Math.max(0, gameState.stress - 55) / 45;
        const antIntensity = Math.max(joyFactor * 0.7, stressFactor * 0.9);
        
        // Text distortion
        if (domElements.gameContent) {
            domElements.gameContent.classList.remove('text-distortion-light', 'text-distortion-medium', 'text-distortion-heavy');
            
            if (antIntensity > 0.25) domElements.gameContent.classList.add('text-distortion-light');
            if (antIntensity > 0.55) domElements.gameContent.classList.add('text-distortion-medium');
            if (antIntensity > 0.80) domElements.gameContent.classList.add('text-distortion-heavy');
        }
        
        // Interactive ants
        if (gameState.antPool && gameState.antPool.length > 0) {
            const maxAnts = Math.floor(antIntensity * gameState.antPool.length);
            const currentAnts = gameState.activeAnts || 0;
            
            if (currentAnts < maxAnts) {
                const unusedAnts = gameState.antPool.filter(ant => ant.style.display === 'none');
                if (unusedAnts.length > 0) {
                    const ant = unusedAnts[0];
                    ant.style.top = `${Math.random() * 90}%`;
                    ant.style.left = `${Math.random() * 90}%`;
                    ant.style.transform = `rotate(${Math.random() * 360}deg)`;
                    ant.style.display = 'block';
                    gameState.activeAnts++;
                }
            } else if (currentAnts > maxAnts) {
                const visibleAnts = gameState.antPool.filter(ant => ant.style.display !== 'none');
                if (visibleAnts.length > 0) {
                    visibleAnts[0].style.display = 'none';
                    gameState.activeAnts--;
                }
            }
            
            moveAnts();
        }
        
        scheduleAntUpdate();
    } catch (error) {
        console.error("Ant visualization error:", error);
        scheduleAntUpdate();
    }
}

function moveAnts() {
    if (gameState.isGameOver) return;
    
    const visibleAnts = gameState.antPool.filter(ant => ant.style.display !== 'none');
    
    visibleAnts.forEach(ant => {
        try {
            const currentTop = parseFloat(ant.style.top) || 0;
            const currentLeft = parseFloat(ant.style.left) || 0;
            
            const newTop = Math.max(0, Math.min(95, currentTop + (Math.random() * 8) - 4));
            const newLeft = Math.max(0, Math.min(95, currentLeft + (Math.random() * 8) - 4));
            
            ant.style.top = `${newTop}%`;
            ant.style.left = `${newLeft}%`;
        } catch (e) {}
    });
}

// ========================================================================
// CORE GAME MECHANICS
// ========================================================================

function processStatInteractions() {
    if (gameState.isGameOver) return;
    
    // Hunger stress escalation
    if (gameState.fullness <= 25) {
        const hungerSeverity = (25 - gameState.fullness) / 25;
        updateStat('stress', hungerSeverity * 1.5);
        updateStat('joy', -hungerSeverity * 1.2);
    }
    
    // Stress impacts joy
    if (gameState.stress > 55) {
        const stressSeverity = (gameState.stress - 55) / 45;
        updateStat('joy', -stressSeverity * 0.8);
    }
    
    // High joy reduces stress slightly
    if (gameState.joy > 80 && gameState.stress > 15) {
        updateStat('stress', -0.2);
    }
    
    checkGameOverConditions();
}

function advanceTime(slots, activityType = 'idle') {
    if (gameState.isGameOver) return;
    
    gameState.time += slots;
    
    if (gameState.time >= 10) {
        gameState.time = 0;
        gameState.day += 1;
        
        if (gameState.day > 4) {
            finishGame();
            return;
        }
        
        startNewDay();
    }
    
    const decay = DECAY_RATES[activityType] || DECAY_RATES.idle;
    updateStat('fullness', -decay.fullness * slots);
    updateStat('joy', -decay.joy * slots);
    updateStat('stress', decay.stress * slots);
    
    checkTimeBasedEvents();
    updateUI();
}

function checkGameOverConditions() {
    if (gameState.isGameOver) return false;
    
    // Show warnings before game over
    if (gameState.joy <= 20 && gameState.joy > 0) {
        addWarningIfNotPresent('joy-warning', getAntThought());
    }
    
    if (gameState.stress >= 80 && gameState.stress < 100) {
        addWarningIfNotPresent('stress-warning', "Your stress is overwhelming. The pressure is becoming unbearable.");
    }
    
    // REBALANCED: Resilience system for new players
    if (gameState.joy <= 0) {
        if (gameState.resiliencePoints > 0) {
            gameState.resiliencePoints--;
            gameState.joy = 10;
            showResilienceMessage("Something inside you refuses to give up. You find a small reserve of strength.");
            return false;
        }
        gameOver("The weight of everything has crushed your spirit. The ants have won, filling every corner of your mind. You can't continue.");
        return true;
    }
    
    if (gameState.stress >= 100) {
        if (gameState.resiliencePoints > 0) {
            gameState.resiliencePoints--;
            gameState.stress = 85;
            showResilienceMessage("At the breaking point, you somehow pull back from the edge. But barely.");
            return false;
        }
        gameOver("The stress has shattered you completely. Your body refuses to function. You've collapsed.");
        return true;
    }
    
    if (gameState.fullness <= 0) {
        gameState.fullness = 0;
        updateStat('stress', 2.5);
        updateStat('joy', -3);
        
        addWarningIfNotPresent('critical-warning', "You're starving! Your body is shutting down. Find food immediately!");
        
        if (gameState.stress >= 90) {
            gameOver("Exhausted from hunger and overwhelmed by stress, you collapse. Your body has given out.");
            return true;
        }
    }
    
    return false;
}

function addWarningIfNotPresent(className, text) {
    if (domElements.narrativeText && !document.querySelector(`.${className}`)) {
        const warning = document.createElement('p');
        warning.className = className;
        warning.textContent = text;
        domElements.narrativeText.appendChild(warning);
    }
}

function showResilienceMessage(text) {
    if (domElements.narrativeText) {
        const msg = document.createElement('div');
        msg.className = 'event-notification';
        msg.innerHTML = `<p><strong>A moment of resilience:</strong> ${text}</p><p><em>Resilience points remaining: ${gameState.resiliencePoints}</em></p>`;
        domElements.narrativeText.appendChild(msg);
    }
}

function checkTimeBasedEvents() {
    if (gameState.time === 0) {
        gameState.hadRandomEventToday = false;
        gameState.mealsToday = 0;
        
        if (gameState.mealsToday === 0) {
            gameState.streaks.daysWithoutFood++;
        } else {
            gameState.streaks.daysWithoutFood = 0;
        }
    }
    
    // Random events
    if (!gameState.hadRandomEventToday) {
        let eventChance = 0.12;
        if (gameState.time > 4) eventChance = 0.18;
        if (gameState.time >= 8) eventChance = 0.6;
        if (gameState.stress > 65) eventChance += 0.08;
        
        if (gameState.class) {
            eventChance *= CLASS_MODIFIERS[gameState.class].eventChance;
        }
        
        if (Math.random() < eventChance) {
            gameState.hadRandomEventToday = true;
            triggerRandomEvent();
        }
    }
    
    // Tuesday deadline assignment
    if (gameState.day === 1 && gameState.time === 1 && !gameState.deadline) {
        gameState.deadline = 100;
    }
    
    // Wednesday family emergency
    if (gameState.day === 2 && gameState.time === 4 && !gameState.hasFamilyEmergency) {
        triggerFamilyEmergency();
        return true;
    }
    
    return false;
}

// REBALANCED: Inflation is less devastating
function inflateEconomy(percentage) {
    const actualPercentage = Math.min(percentage, 18); // Cap inflation
    
    for (let food of FOOD_OPTIONS) {
        food.cost = Math.round(food.cost * (1 + actualPercentage / 100));
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <div class="event-notification">
                <p><strong>📈 Economic Update:</strong> Prices have risen by approximately ${actualPercentage}%. 
                Your naira stretches a little less today.</p>
            </div>
        `;
    }
}

// ========================================================================
// RANDOM EVENTS - REBALANCED
// ========================================================================

function triggerRandomEvent() {
    const goodEvents = [
        {
            name: "Acts of Kindness",
            description: "You help someone carry their bags across the busy road. They thank you warmly, and the moment of connection lifts your spirits.",
            effects: { joy: 8, stress: -5, fullness: 0, money: 0 }
        },
        {
            name: "Office Treat",
            description: "A colleague brought small chops for everyone. The office feels lighter today.",
            effects: { joy: 10, stress: -4, fullness: 20, money: 0 }
        },
        {
            name: "Unexpected Bonus",
            description: "Your manager slips you a small cash bonus for your recent effort. \"Don't tell the others,\" she winks.",
            effects: { joy: 12, stress: -8, fullness: 0, money: 15000 }
        },
        {
            name: "Cool Weather",
            description: "The harmattan breeze brings relief from the usual Lagos heat. Everyone seems a bit more human today.",
            effects: { joy: 10, stress: -10, fullness: 0, money: 0 }
        },
        {
            name: "Found Money",
            description: "You find a crumpled note on the ground - ₦2,000. Small mercies.",
            effects: { joy: 6, stress: -3, fullness: 0, money: 2000 }
        },
        {
            name: "Generator Works",
            description: "For once, NEPA cooperates and your generator stays off all day. Fuel saved, stress avoided.",
            effects: { joy: 8, stress: -6, fullness: 0, money: 4000 }
        },
        {
            name: "Encouragement",
            description: "An old friend messages you out of nowhere with words of encouragement. You feel less alone.",
            effects: { joy: 14, stress: -6, fullness: 0, money: 0 }
        }
    ];
    
    const badEvents = [
        {
            name: "Price Increase",
            description: "Your regular lunch spot has raised prices again. The vendor shrugs apologetically.",
            effects: { joy: -5, stress: 10, fullness: 0, money: -3000 }
        },
        {
            name: "Tech Problems",
            description: "Your phone screen cracks. Not badly, but enough to be annoying. Repair will cost money you don't want to spend.",
            effects: { joy: -8, stress: 12, fullness: 0, money: 0 }
        },
        {
            name: "Extra Work",
            description: "Your boss drops another task on your desk. \"I need this by end of day.\" No room for negotiation.",
            effects: { joy: -6, stress: 15, fullness: 0, money: 0 }
        },
        {
            name: "Headache",
            description: "A splitting headache develops. The noise of Lagos feels twice as loud.",
            effects: { joy: -10, stress: 8, fullness: -5, money: -2000 }
        },
        {
            name: "Lost Item",
            description: "You can't find your earphones anywhere. It's a small thing, but it stings.",
            effects: { joy: -6, stress: 5, fullness: 0, money: 0 }
        },
        {
            name: "Traffic Jam",
            description: "An unexpected go-slow delays everything. You sit in traffic, watching time drain away.",
            effects: { joy: -7, stress: 12, fullness: -5, money: -1500 }
        },
        {
            name: "Bank Charges",
            description: "Your bank has deducted mysterious \"maintenance fees.\" Again.",
            effects: { joy: -5, stress: 8, fullness: 0, money: -3500 }
        }
    ];
    
    // Determine event type
    let goodChance = 0.40;
    if (gameState.class) {
        goodChance = CLASS_MODIFIERS[gameState.class].goodEventChance;
    }
    if (gameState.stress > 65) goodChance -= 0.08;
    if (gameState.joy < 35) goodChance -= 0.08;
    
    const isGood = Math.random() < goodChance;
    const events = isGood ? goodEvents : badEvents;
    const event = events[Math.floor(Math.random() * events.length)];
    
    // Apply effects
    updateStat('joy', event.effects.joy);
    updateStat('stress', event.effects.stress);
    updateStat('fullness', event.effects.fullness);
    updateStat('money', event.effects.money);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <div class="event-notification">
                <p><strong>${event.name}:</strong> ${event.description}</p>
            </div>
        `;
    }
    
    updateUI();
}

// ========================================================================
// DAY PROGRESSION
// ========================================================================

function startNewDay() {
    gameState.rainedYesterday = Math.random() < 0.25;
    gameState.isWorking = false;
    gameState.hadRandomEventToday = false;
    gameState.mealsToday = 0;
    gameState.workdayStage = 0;
    
    // Check sickness from food
    if (gameState.isSick && gameState.sicknessType === 'food') {
        showSicknessEvent();
        return;
    }
    
    // Day-specific events
    switch(gameState.day) {
        case 1: startTuesday(); break;
        case 2: startWednesday(); break;
        case 3: startThursday(); break;
        case 4: startFriday(); break;
    }
    
    updateUI();
}

function showSicknessEvent() {
    gameState.isSick = true;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>You're Sick</h2>
            <p>That food from earlier has caught up with you. Your stomach churns and your head pounds. 
            The ants seem to dance in your peripheral vision.</p>
            <p><em>${getAntThought()}</em></p>
        `;
    }
    
    updateStat('joy', -15);
    updateStat('stress', 18);
    
    if (domElements.choicesContainer) {
        const medicineCost = modifyCost(8000);
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="restAtHome()">Rest at home (lose the day)</button>
            <button class="choice-btn" onclick="buyMedicine(${medicineCost})">Buy medicine and push through (₦${medicineCost.toLocaleString()})</button>
            <button class="choice-btn" onclick="ignoreSickness()">Ignore it and go to work anyway</button>
        `;
    }
}

function restAtHome() {
    gameState.isSick = false;
    gameState.sicknessType = null;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Rest Day</h2>
            <p>You spend the day in bed, letting your body recover. The hours pass slowly, 
            but by evening you feel almost human again.</p>
        `;
    }
    
    updateStat('joy', -5);
    updateStat('stress', -15);
    updateStat('fullness', -25);
    
    advanceTime(8, 'sleep');
    goToSleep();
}

function buyMedicine(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford medicine right now.</p>`;
        }
        return;
    }
    
    gameState.isSick = false;
    gameState.sicknessType = null;
    
    updateStat('money', -cost);
    updateStat('stress', 5);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Pushing Through</h2>
            <p>You down some medication and force yourself to function. The day will be hard, 
            but you'll manage.</p>
        `;
    }
    
    showMorningOptions();
}

function ignoreSickness() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Pushing Through</h2>
            <p>You ignore your body's protests and head to work anyway. Every step is a battle, 
            but you refuse to give in.</p>
        `;
    }
    
    updateStat('stress', 20);
    updateStat('joy', -10);
    
    // 50% chance of getting worse
    if (Math.random() < 0.5) {
        gameState.isSick = true; // Will continue tomorrow
    } else {
        gameState.isSick = false;
        gameState.sicknessType = null;
    }
    
    showMorningOptions();
}

function startTuesday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Tuesday Morning</h2>
            <p>You wake to the familiar sounds of Lagos - distant generators, the call of street vendors, 
            the endless hum of a city that never truly sleeps.</p>
            <p>Your phone buzzes with news alerts. Prices have risen again.</p>
        `;
    }
    
    inflateEconomy(12);
    showMorningOptions();
}

function startWednesday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Wednesday Morning</h2>
            <p>Hump day. You're halfway through the week. The city outside your window 
            seems particularly chaotic today - traffic reports warn of major delays on all routes.</p>
        `;
    }
    
    showMorningOptions();
}

function startThursday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Thursday Morning</h2>
            <p>The week's weight presses down on your shoulders. Your phone shows more bad economic news.</p>
        `;
    }
    
    inflateEconomy(15);
    
    if (gameState.deadline > 0) {
        const progress = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Your deadline project is ${progress}% complete. Friday is tomorrow.</p>`;
        }
        
        if (progress < 50) {
            domElements.narrativeText.innerHTML += `<p class="warning-text">You're significantly behind. The ants are getting louder.</p>`;
            updateStat('stress', 12);
        }
    }
    
    showMorningOptions();
}

function startFriday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Friday Morning</h2>
            <p>The final day. If you can make it through today, you'll have survived another week in Lagos.</p>
        `;
    }
    
    inflateEconomy(18);
    
    if (gameState.deadline > 0) {
        const progress = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Today is D-Day. Your project is ${progress}% complete.</p>`;
        }
        
        if (progress < 80) {
            domElements.narrativeText.innerHTML += `<p class="critical-warning">You won't make the deadline at this rate. Panic sets in.</p>`;
            updateStat('stress', 20);
        } else {
            domElements.narrativeText.innerHTML += `<p>You can finish this. Just stay focused.</p>`;
            updateStat('stress', 8);
        }
    }
    
    showMorningOptions();
}

// ========================================================================
// FAMILY EMERGENCY
// ========================================================================

function triggerFamilyEmergency() {
    gameState.hasFamilyEmergency = true;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Family Emergency</h2>
            <p>Your phone rings. It's home. The voice on the other end is worried.</p>
        `;
    }
    
    // Severity based on chance
    const severity = Math.random();
    let emergencyDesc, moneyNeeded;
    
    if (severity < 0.4) {
        emergencyDesc = "A family member needs money for medication. Nothing too serious, but it can't wait.";
        moneyNeeded = 25000;
    } else if (severity < 0.8) {
        emergencyDesc = "There's been an accident. Nothing life-threatening, but hospital bills are adding up.";
        moneyNeeded = 60000;
    } else {
        emergencyDesc = "A family member has been hospitalized. It's serious. They need help immediately.";
        moneyNeeded = 120000;
    }
    
    // Community support check
    if (checkForCommunitySupport()) {
        moneyNeeded = Math.round(moneyNeeded * 0.6);
    }
    
    // Class-based adjustment
    if (gameState.class === 'upper') {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `
                <p>${emergencyDesc}</p>
                <p>Fortunately, your family has savings and insurance to handle this.</p>
            `;
        }
        updateStat('stress', 10);
        updateStat('joy', -5);
        showMorningOptions();
        return;
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <p>${emergencyDesc}</p>
            <p>They need ₦${moneyNeeded.toLocaleString()}.</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="sendMoney(${moneyNeeded})">Send the money (₦${moneyNeeded.toLocaleString()})</button>
            <button class="choice-btn" onclick="sendPartialMoney(${Math.round(moneyNeeded * 0.5)})">Send what you can (₦${Math.round(moneyNeeded * 0.5).toLocaleString()})</button>
            <button class="choice-btn" onclick="explainNoMoney()">Explain you can't afford it</button>
        `;
    }
}

function checkForCommunitySupport() {
    if (!gameState.class) return false;
    
    const supportChance = CLASS_MODIFIERS[gameState.class].communitySupport;
    if (Math.random() < supportChance) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `
                <p>A neighbor who heard about the situation stops by with some food and offers to help cover part of the cost. 
                "We look out for each other here," they say.</p>
            `;
        }
        updateStat('joy', 10);
        return true;
    }
    return false;
}

function sendMoney(amount) {
    if (gameState.money < amount) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You don't have enough. You'll have to find another way.</p>`;
        }
        return;
    }
    
    updateStat('money', -amount);
    updateStat('joy', -5);
    updateStat('stress', 8);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <p>You transfer the money immediately. It hurts financially, but family comes first. 
            Always has in Lagos.</p>
        `;
    }
    
    showMorningOptions();
}

function sendPartialMoney(amount) {
    if (gameState.money < amount) {
        explainNoMoney();
        return;
    }
    
    updateStat('money', -amount);
    updateStat('joy', -10);
    updateStat('stress', 12);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <p>You send what you can. It's not enough, but it's something. 
            The guilt sits heavy in your chest.</p>
        `;
    }
    
    showMorningOptions();
}

function explainNoMoney() {
    updateStat('joy', -15);
    updateStat('stress', 20);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <p>You explain your situation. The silence on the other end speaks volumes. 
            You know they understand, but it doesn't make it easier.</p>
            <p><em>${getAntThought()}</em></p>
        `;
    }
    
    showMorningOptions();
}

// ========================================================================
// CHARACTER CREATION
// ========================================================================

function showCharacterCreation() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Welcome to Lagos</h2>
        <p>The city of dreams and struggles. Of hustle and heart. 
        Of millions of stories playing out every single day.</p>
        <p>This is yours.</p>
        <p>Can you survive one work week?</p>
    `;
    
    domElements.choicesContainer.innerHTML = `
        <h3>What's your name?</h3>
        <input type="text" id="player-name" placeholder="Enter your name" class="name-input" maxlength="20">
        <button class="choice-btn" onclick="setPlayerName()">Continue</button>
    `;
    
    // Focus the input
    setTimeout(() => {
        const input = document.getElementById('player-name');
        if (input) input.focus();
    }, 100);
}

function setPlayerName() {
    const nameInput = document.getElementById('player-name');
    let playerName = nameInput ? nameInput.value.trim() : '';
    
    if (!playerName) {
        playerName = "Lagosian";
    }
    
    gameState.playerName = playerName;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Choose Your Path</h2>
            <p>${playerName}, what do you do for a living?</p>
            <p>Each path has its own challenges and rewards.</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="selectJob('marketer')">
                <strong>Marketer</strong> - Hustle is your middle name. Client meetings, deadlines, and sales targets.
            </button>
            <button class="choice-btn" onclick="selectJob('programmer')">
                <strong>Software Developer</strong> - Code is your language. Late nights, debugging, and digital solutions.
            </button>
            <button class="choice-btn" onclick="selectJob('designer')">
                <strong>Graphic Designer</strong> - Visuals are your currency. Client revisions, creative blocks, and pixel perfection.
            </button>
            <button class="choice-btn" onclick="selectJob('artist')">
                <strong>Artist</strong> - Your soul is your product. Passion projects, financial uncertainty, and creative freedom.
            </button>
        `;
    }
}

function selectJob(job) {
    gameState.job = job;
    
    // Base stats by job
    switch(job) {
        case 'marketer':
            gameState.money = 70000;
            gameState.stress = 25;
            gameState.joy = 72;
            break;
        case 'programmer':
            gameState.money = 110000;
            gameState.stress = 40;
            gameState.joy = 65;
            break;
        case 'designer':
            gameState.money = 85000;
            gameState.stress = 30;
            gameState.joy = 75;
            break;
        case 'artist':
            gameState.money = 35000;
            gameState.stress = 15;
            gameState.joy = 88;
            break;
    }
    
    // Assign random class
    const classes = ['working', 'middle', 'upper'];
    const weights = [0.35, 0.45, 0.20]; // More realistic distribution
    const roll = Math.random();
    
    if (roll < weights[0]) {
        gameState.class = 'working';
    } else if (roll < weights[0] + weights[1]) {
        gameState.class = 'middle';
    } else {
        gameState.class = 'upper';
    }
    
    // Apply class modifier to starting money
    gameState.money = Math.round(gameState.money * CLASS_MODIFIERS[gameState.class].startingMoney);
    
    // Assign random age
    gameState.age = [23, 28, 33][Math.floor(Math.random() * 3)];
    
    if (gameState.age >= 28) {
        gameState.money = Math.round(gameState.money * 1.3);
        if (gameState.class !== 'working') {
            gameState.hasTransportation = true;
        }
    }
    
    // Assign location based on class
    const locations = {
        'working': [
            { name: 'Oshodi', area: 'Lagos Mainland' },
            { name: 'Mushin', area: 'Lagos Mainland' }
        ],
        'middle': [
            { name: 'Surulere', area: 'Lagos Mainland' },
            { name: 'Ikeja', area: 'Lagos Mainland' }
        ],
        'upper': [
            { name: 'Victoria Island', area: 'Lagos Island' },
            { name: 'Lekki', area: 'Lagos Island' }
        ]
    };
    
    gameState.location = locations[gameState.class][Math.floor(Math.random() * 2)];
    gameState.companyName = generateCompanyName(job);
    
    updateUI();
    showCharacterSummary();
}

function showCharacterSummary() {
    let jobTitle;
    switch(gameState.job) {
        case 'marketer': jobTitle = "Marketing Executive"; break;
        case 'programmer': jobTitle = "Software Developer"; break;
        case 'designer': jobTitle = "Graphic Designer"; break;
        case 'artist': jobTitle = "Visual Artist"; break;
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Your Life in Lagos</h2>
            <p>You are <strong>${gameState.playerName}</strong>, a ${gameState.age}-year-old ${jobTitle} 
            working at ${gameState.companyName}.</p>
            <p>You live in ${gameState.location.name}, ${gameState.location.area}.</p>
            
            <div class="status-section">
                <h3>Current Situation</h3>
                <p>💰 Bank Balance: ₦${gameState.money.toLocaleString()}</p>
                <p>😊 Mood: ${gameState.joy > 70 ? "Hopeful" : gameState.joy > 50 ? "Steady" : "Struggling"}</p>
                <p>😰 Stress: ${gameState.stress < 30 ? "Manageable" : gameState.stress < 50 ? "Building" : "Concerning"}</p>
                <p>🚗 Transport: ${gameState.hasTransportation ? "You own a car" : "Public transport only"}</p>
            </div>
            
            <p>The week ahead will test everything. Your joy, your finances, your sanity.</p>
            <p><em>And then there are the ants...</em></p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="startGame()">Begin Your Week</button>
        `;
    }
}

// ========================================================================
// GAME START & MORNING ROUTINES
// ========================================================================

function startGame() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Monday Morning</h2>
            <p>6:00 AM. Your alarm cuts through the darkness.</p>
            <p>Outside, Lagos is already awake - the distant hum of generators, 
            the call of a muezzin, the first honks of impatient drivers.</p>
            <p>Another week begins.</p>
        `;
    }
    
    showMorningOptions();
}

function showMorningOptions() {
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <h3>How do you start your day?</h3>
            <button class="choice-btn" onclick="prepareForWork()">Get ready for work</button>
            <button class="choice-btn" onclick="checkPhone()">Check your phone first</button>
            <button class="choice-btn" onclick="goBackToSleep()">Snooze the alarm</button>
        `;
    }
}

function prepareForWork() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You drag yourself out of bed and begin the morning ritual.</p>`;
    }
    
    updateStat('fullness', -5);
    showTransportationOptions();
}

function checkPhone() {
    const newsEvents = [
        "Twitter is ablaze with debates about the economy. Nothing new.",
        "WhatsApp groups are already buzzing with forwards and memes.",
        "Your data plan is dangerously low. You'll need to top up soon.",
        "A friend posted pictures from a party you couldn't attend.",
        "The naira fell again. Everything costs more now.",
        "Someone is selling land on your timeline. Classic Lagos.",
        "Your bank sent another promotion you'll never use.",
        "Traffic alerts warn of unusual congestion. Unusual for Lagos means apocalyptic."
    ];
    
    const news = newsEvents[Math.floor(Math.random() * newsEvents.length)];
    
    if (Math.random() < 0.35) {
        updateStat('joy', -3);
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You check your phone. ${news} You feel slightly worse.</p>`;
        }
    } else {
        updateStat('joy', 2);
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You check your phone. ${news} At least you're informed.</p>`;
        }
    }
    
    setTimeout(prepareForWork, 800);
}

function goBackToSleep() {
    updateStat('joy', 4);
    updateStat('stress', -3);
    advanceTime(1, 'sleep');
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <p>You hit snooze and drift back to sleep. When you wake again, it's 8:00 AM.</p>
            <p class="warning-text">You're running late!</p>
        `;
    }
    
    updateStat('stress', 12);
    showTransportationOptions();
}

// ========================================================================
// TRANSPORTATION
// ========================================================================

function showTransportationOptions() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>Time to get to work. How are you getting there?</p>`;
    
    let html = '<h3>Transportation</h3>';
    
    if (gameState.hasTransportation) {
        const fuelCost = modifyCost(2500);
        html += `<button class="choice-btn" onclick="useCar()">Drive (₦${fuelCost.toLocaleString()} fuel)</button>`;
    }
    
    const uberCost = modifyCost(6500);
    const busCost = modifyCost(1800);
    
    html += `
        <button class="choice-btn" onclick="useUber()">Call a ride (₦${uberCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="takeBus()">Take a bus (₦${busCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="walkToWork()">Walk (free, but risky)</button>
    `;
    
    domElements.choicesContainer.innerHTML = html;
}

function useCar() {
    const fuelCost = modifyCost(2500);
    
    if (gameState.money < fuelCost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You're low on fuel and can't afford more right now.</p>`;
        }
        showTransportationOptions();
        return;
    }
    
    updateStat('money', -fuelCost);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You start the car and pull into Lagos traffic.</p>`;
    }
    
    // Traffic check
    if (Math.random() < 0.45) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Traffic is brutal today. You inch forward, watching time slip away.</p>`;
        }
        updateStat('stress', 12);
        advanceTime(1.5, 'idle');
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Traffic is manageable for once. Small victories.</p>`;
        }
        advanceTime(1, 'idle');
    }
    
    checkForPolice();
}

function useUber() {
    const baseCost = modifyCost(6500);
    
    if (gameState.money < baseCost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford a ride right now.</p>`;
        }
        showTransportationOptions();
        return;
    }
    
    // Surge check
    const isSurge = Math.random() < 0.35;
    const finalCost = isSurge ? Math.round(baseCost * 1.8) : baseCost;
    
    if (isSurge && gameState.money < finalCost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>It's surge pricing (₦${finalCost.toLocaleString()}) and you can't afford it.</p>`;
        }
        showTransportationOptions();
        return;
    }
    
    updateStat('money', -finalCost);
    
    if (isSurge) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>Surge pricing. You wince as you confirm the ride (₦${finalCost.toLocaleString()}).</p>`;
        }
        updateStat('stress', 8);
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You call a ride and wait for it to arrive.</p>`;
        }
    }
    
    advanceTime(1, 'idle');
    checkForPolice();
}

function takeBus() {
    const busCost = modifyCost(1800);
    
    if (gameState.money < busCost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't even afford the bus fare.</p>`;
        }
        showTransportationOptions();
        return;
    }
    
    updateStat('money', -busCost);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You head to the bus stop and wait with the morning crowd.</p>`;
    }
    
    // REBALANCED: One-chance is very rare but still present
    if (Math.random() < 0.03) {
        gameOver("You got into a 'one-chance' vehicle. These criminals robbed you of everything and abandoned you far from home. Your week ends here.");
        return;
    }
    
    // Found money chance
    if (Math.random() < 0.25) {
        const foundAmount = Math.floor(Math.random() * 3000) + 1000;
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>While waiting, you notice some money on the ground. ₦${foundAmount.toLocaleString()}.</p>`;
        }
        
        if (domElements.choicesContainer) {
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="pickUpMoney(${foundAmount})">Pick it up</button>
                <button class="choice-btn" onclick="ignoreFoundMoney()">Leave it alone</button>
            `;
        }
        return;
    }
    
    // Bus altercation
    if (Math.random() < 0.15) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>An argument erupts between the conductor and a passenger over change.</p>`;
        }
        
        if (domElements.choicesContainer) {
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="mediateArgument()">Try to help calm things</button>
                <button class="choice-btn" onclick="ignoreArgument()">Mind your business</button>
            `;
        }
        return;
    }
    
    advanceTime(1.5, 'idle');
    arriveAtWork();
}

function pickUpMoney(amount) {
    // REBALANCED: Much lower curse chance
    if (Math.random() < 0.08) {
        gameOver("As you reach for the money, something strange happens. Your limbs feel heavy, your vision blurs... You've been transformed. The juju is real. Your journey ends here.");
        return;
    }
    
    updateStat('money', amount);
    updateStat('joy', 6);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You pocket the money. Lucky day!</p>`;
    }
    
    advanceTime(1.5, 'idle');
    arriveAtWork();
}

function ignoreFoundMoney() {
    updateStat('joy', 3);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You leave the money where it is. Not worth the risk.</p>`;
    }
    
    advanceTime(1.5, 'idle');
    arriveAtWork();
}

function mediateArgument() {
    if (Math.random() < 0.55) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You calmly help resolve the situation. Both parties thank you.</p>`;
        }
        updateStat('joy', 8);
        updateStat('stress', -3);
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Your intervention backfires. "Who invited you?" someone snaps. You retreat, embarrassed.</p>`;
        }
        updateStat('joy', -6);
        updateStat('stress', 10);
    }
    
    advanceTime(1.5, 'idle');
    arriveAtWork();
}

function ignoreArgument() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You stay out of it. The argument eventually dies down on its own.</p>`;
    }
    
    advanceTime(1.5, 'idle');
    arriveAtWork();
}

function walkToWork() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You decide to walk. It's a long journey, but you'll save money.</p>`;
    }
    
    updateStat('fullness', -12);
    updateStat('stress', 8);
    updateStat('joy', -3);
    
    if (gameState.rainedYesterday) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Last night's rain has left puddles everywhere. The walk is miserable.</p>`;
        }
        updateStat('joy', -5);
        
        // Car splash
        if (Math.random() < 0.6) {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>A car speeds through a puddle, completely soaking you. The driver doesn't even slow down.</p>`;
            }
            updateStat('joy', -8);
            updateStat('stress', 12);
        }
    }
    
    // REBALANCED: Robbery less common and less severe
    if (Math.random() < 0.12) {
        const stolenAmount = Math.round(gameState.money * 0.5);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Someone bumps into you roughly. By the time you check, half your money is gone. A pickpocket.</p>`;
        }
        
        updateStat('money', -stolenAmount);
        updateStat('joy', -15);
        updateStat('stress', 20);
    }
    
    advanceTime(1.5, 'physical');
    arriveAtWork();
}

function checkForPolice() {
    if (Math.random() < 0.35) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You're stopped at a checkpoint.</p>`;
        }
        
        if (Math.random() < 0.45) {
            const bribeCost = modifyCost(6000);
            
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>The officer claims there's an "issue" with your papers. He suggests a "settlement."</p>`;
            }
            
            if (domElements.choicesContainer) {
                domElements.choicesContainer.innerHTML = `
                    <button class="choice-btn" onclick="payBribe(${bribeCost})">Pay ₦${bribeCost.toLocaleString()}</button>
                    <button class="choice-btn" onclick="refuseBribe()">Refuse and stand your ground</button>
                `;
            }
            return;
        } else {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>They check your papers and wave you through. Relief.</p>`;
            }
        }
    }
    
    arriveAtWork();
}

function payBribe(amount) {
    if (gameState.money < amount) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>"I don't have that much," you explain truthfully.</p>`;
        }
        refuseBribe();
        return;
    }
    
    updateStat('money', -amount);
    updateStat('stress', 10);
    updateStat('joy', -5);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You hand over the money. The officer pockets it and waves you through. This is Lagos.</p>`;
    }
    
    arriveAtWork();
}

function refuseBribe() {
    if (Math.random() < 0.25) {
        gameOver("The officer doesn't take kindly to your refusal. You spend the rest of the day at the station. Your boss fires you for not showing up.");
        return;
    }
    
    const confiscated = Math.min(gameState.money, 8000);
    updateStat('money', -confiscated);
    updateStat('stress', 18);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>After a tense standoff, they let you go but somehow your wallet is lighter. You're too rattled to argue.</p>`;
    }
    
    arriveAtWork();
}

function arriveAtWork() {
    advanceTime(0.5, 'idle');
    
    // Key holder missing
    if (Math.random() < 0.15) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>At the Office</h2>
                <p>You arrive to find everyone waiting outside. The person with the office key isn't here yet.</p>
            `;
        }
        
        updateStat('stress', 8);
        
        if (domElements.choicesContainer) {
            const breakfastCost = modifyCost(3500);
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="waitForKey()">Wait patiently</button>
                <button class="choice-btn" onclick="callKeyHolder()">Call the key holder</button>
                <button class="choice-btn" onclick="goGetBreakfast(${breakfastCost})">Get breakfast while waiting (₦${breakfastCost.toLocaleString()})</button>
            `;
        }
        return;
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>At the Office</h2>
            <p>You settle into your desk and prepare for the day ahead.</p>
        `;
    }
    
    startWorkDay();
}

function waitForKey() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You wait. And wait. Eventually, they arrive and everyone files in.</p>`;
    }
    updateStat('stress', 5);
    updateStat('fullness', -5);
    advanceTime(0.5, 'idle');
    startWorkDay();
}

function callKeyHolder() {
    if (Math.random() < 0.5) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Your call lights a fire under them. They arrive soon after.</p>`;
        }
        advanceTime(0.25, 'idle');
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>They apologize profusely but still take forever to arrive.</p>`;
        }
        advanceTime(0.5, 'idle');
        updateStat('stress', 6);
    }
    startWorkDay();
}

function goGetBreakfast(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford breakfast right now.</p>`;
        }
        waitForKey();
        return;
    }
    
    updateStat('money', -cost);
    updateStat('fullness', 25);
    updateStat('joy', 5);
    gameState.mealsToday++;
    gameState.lastMealTime = gameState.time;
    
    // Small chance of food poisoning from roadside
    const food = FOOD_OPTIONS.filter(f => f.location === 'roadside')[Math.floor(Math.random() * 3)];
    if (Math.random() < (food.sickChance || 0.1)) {
        gameState.isSick = true;
        gameState.sicknessType = 'food';
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You grab some ${food.name} while waiting. When you return, the office is open.</p>`;
    }
    
    advanceTime(0.5, 'idle');
    startWorkDay();
}

// ========================================================================
// WORK DAY
// ========================================================================

function startWorkDay() {
    gameState.isWorking = true;
    gameState.workdayStage = 1;
    
    if (gameState.day === 1 && gameState.time <= 2) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>The Impossible Deadline</h2>
                <p>Your boss calls you into their office. Their expression is grim.</p>
                <p>"I need this project completed by Friday. No excuses."</p>
                <p>You know it's nearly impossible. But you also know you have no choice.</p>
            `;
        }
        
        updateStat('stress', 20);
        gameState.deadline = 100;
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Work Day</h2>
                <p>Time to earn your keep.</p>
            `;
        }
    }
    
    showWorkStageOptions();
}

function showWorkStageOptions() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    const stages = {
        1: { name: "Morning (8:00 AM - 12:00 PM)", time: 2 },
        2: { name: "Midday (12:00 PM - 2:00 PM)", time: 1 },
        3: { name: "Afternoon (2:00 PM - 5:00 PM)", time: 1.5 }
    };
    
    const current = stages[gameState.workdayStage] || stages[1];
    
    domElements.narrativeText.innerHTML = `<h2>Work: ${current.name}</h2>`;
    gameState.currentWorkTimeAdvance = current.time;
    
    let workOptions = '';
    
    switch(gameState.job) {
        case 'marketer':
            workOptions = `
                <button class="choice-btn" onclick="doWorkTask('client')">Visit clients</button>
                <button class="choice-btn" onclick="doWorkTask('pitch')">Work on presentations</button>
                <button class="choice-btn" onclick="doWorkTask('research')">Research market trends</button>
            `;
            break;
        case 'programmer':
            workOptions = `
                <button class="choice-btn" onclick="doWorkTask('debug')">Fix bugs</button>
                <button class="choice-btn" onclick="doWorkTask('feature')">Build new features</button>
                <button class="choice-btn" onclick="doWorkTask('optimize')">Optimize code</button>
            `;
            break;
        case 'designer':
            workOptions = `
                <button class="choice-btn" onclick="doWorkTask('create')">Create new designs</button>
                <button class="choice-btn" onclick="doWorkTask('revise')">Handle revisions</button>
                <button class="choice-btn" onclick="doWorkTask('mockup')">Build mockups</button>
            `;
            break;
        case 'artist':
            workOptions = `
                <button class="choice-btn" onclick="doWorkTask('paint')">Work on personal pieces</button>
                <button class="choice-btn" onclick="doWorkTask('commission')">Complete commissions</button>
                <button class="choice-btn" onclick="doWorkTask('exhibit')">Prepare for exhibition</button>
            `;
            break;
    }
    
    domElements.choicesContainer.innerHTML = `
        <h3>What do you focus on?</h3>
        ${workOptions}
        <button class="choice-btn" onclick="takeBreak()">Take a break</button>
        <button class="choice-btn" onclick="eatLunch()">Get food</button>
        <button class="choice-btn status-check" onclick="checkStatus()">Check your status</button>
    `;
}

function doWorkTask(taskType) {
    let progressGain = 0;
    let stressChange = 0;
    let joyChange = 0;
    let taskDesc = "";
    
    // Success modifier based on current state
    let successMod = 1.0;
    if (gameState.fullness < 35) successMod *= 0.75;
    if (gameState.joy < 35) successMod *= 0.8;
    if (gameState.stress > 65) successMod *= 0.8;
    
    const roll = Math.random() * successMod;
    
    // Task outcomes by job
    const outcomes = {
        'marketer': {
            'client': {
                high: { desc: "The client meeting goes brilliantly. They're excited to work with you.", progress: 28, stress: -5, joy: 12 },
                mid: { desc: "The client seems interested but wants to think about it.", progress: 15, stress: 5, joy: 0 },
                low: { desc: "The client isn't receptive. Another wasted trip.", progress: 5, stress: 12, joy: -8 }
            },
            'pitch': {
                high: { desc: "Your presentation comes together beautifully.", progress: 22, stress: -3, joy: 8 },
                mid: { desc: "Decent progress on the pitch deck.", progress: 18, stress: 8, joy: 0 },
                low: { desc: "Writer's block. The slides just won't cooperate.", progress: 8, stress: 12, joy: -5 }
            },
            'research': {
                high: { desc: "You find some valuable market insights.", progress: 18, stress: 0, joy: 6 },
                mid: { desc: "Standard research day. Nothing exciting.", progress: 14, stress: 5, joy: 0 },
                low: { desc: "The data doesn't make sense. Frustrating.", progress: 8, stress: 10, joy: -4 }
            }
        },
        'programmer': {
            'debug': {
                high: { desc: "You finally track down that bug that's been haunting the codebase. Victory!", progress: 30, stress: -8, joy: 15 },
                mid: { desc: "Some progress on debugging. The issues are complex.", progress: 14, stress: 10, joy: -3 },
                low: { desc: "The bugs multiply as you fix them. It's a nightmare.", progress: 5, stress: 18, joy: -12 }
            },
            'feature': {
                high: { desc: "The new feature comes together smoothly. Your code is elegant.", progress: 25, stress: -2, joy: 10 },
                mid: { desc: "Steady progress on the feature.", progress: 18, stress: 12, joy: 2 },
                low: { desc: "Technical debt catches up with you. Progress stalls.", progress: 8, stress: 15, joy: -8 }
            },
            'optimize': {
                high: { desc: "Your optimization cuts load time by 40%. Impressive.", progress: 20, stress: -5, joy: 10 },
                mid: { desc: "Small performance gains. Every bit helps.", progress: 15, stress: 6, joy: 2 },
                low: { desc: "The optimization breaks something else. Back to square one.", progress: 5, stress: 14, joy: -8 }
            }
        },
        'designer': {
            'create': {
                high: { desc: "Inspiration strikes! Your designs flow effortlessly.", progress: 28, stress: -10, joy: 18 },
                mid: { desc: "Decent designs. Not your best work, but solid.", progress: 16, stress: 5, joy: 3 },
                low: { desc: "Designer's block. Everything you create looks wrong.", progress: 5, stress: 12, joy: -10 }
            },
            'revise': {
                high: { desc: "The client loves your revisions. Finally!", progress: 22, stress: -5, joy: 10 },
                mid: { desc: "Standard revisions. The client is satisfied enough.", progress: 18, stress: 10, joy: -2 },
                low: { desc: "More revisions requested. \"Can you make the logo bigger?\"", progress: 10, stress: 16, joy: -10 }
            },
            'mockup': {
                high: { desc: "Your mockups impress the team.", progress: 20, stress: -3, joy: 8 },
                mid: { desc: "Mockups coming along steadily.", progress: 16, stress: 6, joy: 2 },
                low: { desc: "The mockups don't capture the vision. More work needed.", progress: 8, stress: 10, joy: -5 }
            }
        },
        'artist': {
            'paint': {
                high: { desc: "You enter a flow state. Hours disappear as you create something beautiful.", progress: 18, stress: -15, joy: 25 },
                mid: { desc: "Steady work on your art. Progress feels good.", progress: 14, stress: 0, joy: 8 },
                low: { desc: "Your vision exceeds your execution. Frustration sets in.", progress: 5, stress: 10, joy: -6 }
            },
            'commission': {
                high: { desc: "The commission comes together perfectly. The client will love it.", progress: 25, stress: -5, joy: 12 },
                mid: { desc: "Progress on the commission. It's coming along.", progress: 18, stress: 8, joy: 3 },
                low: { desc: "The client's requirements don't match your style. Struggling.", progress: 10, stress: 14, joy: -8 }
            },
            'exhibit': {
                high: { desc: "Your exhibition pieces are stunning. You feel proud.", progress: 22, stress: -8, joy: 15 },
                mid: { desc: "Preparing pieces for the exhibition. Steady progress.", progress: 18, stress: 10, joy: 5 },
                low: { desc: "Nothing feels exhibition-worthy. Self-doubt creeps in.", progress: 8, stress: 12, joy: -10 }
            }
        }
    };
    
    const task = outcomes[gameState.job][taskType];
    let result;
    
    if (roll > 0.65) {
        result = task.high;
    } else if (roll > 0.25) {
        result = task.mid;
    } else {
        result = task.low;
    }
    
    taskDesc = result.desc;
    progressGain = result.progress;
    stressChange = result.stress;
    joyChange = result.joy;
    
    // Apply class modifiers
    if (gameState.class) {
        stressChange *= CLASS_MODIFIERS[gameState.class].stressFromWork;
        if (joyChange > 0) joyChange *= CLASS_MODIFIERS[gameState.class].joyFromLeisure;
    }
    
    // Deadline progress
    if (gameState.deadline > 0) {
        gameState.deadlineProgress += progressGain * 0.8;
        stressChange += 4;
        joyChange -= 3;
    }
    
    gameState.workProgress += progressGain;
    updateStat('stress', stressChange);
    updateStat('joy', joyChange);
    updateStat('fullness', -10);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<h2>Working</h2><p>${taskDesc}</p>`;
    }
    
    advanceTime(gameState.currentWorkTimeAdvance, 'work');
    
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
        showWorkStageOptions();
    } else {
        endWorkDay();
    }
}

function takeBreak() {
    if (domElements.narrativeText) {
        const breakEvents = [
            "You step away for a quick coffee break. Your mind clears a little.",
            "You chat with a colleague about nothing important. It helps.",
            "You take a walk around the office. Movement helps.",
            "You scroll through your phone briefly. A guilty pleasure.",
            "You step outside for fresh air. Well, Lagos air anyway.",
            "You close your eyes for a moment. Brief respite."
        ];
        
        const event = breakEvents[Math.floor(Math.random() * breakEvents.length)];
        domElements.narrativeText.innerHTML = `<h2>Taking a Break</h2><p>${event}</p>`;
    }
    
    updateStat('stress', -8);
    updateStat('joy', 4);
    advanceTime(0.5, 'idle');
    
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
    } else {
        endWorkDay();
        return;
    }
    
    showWorkStageOptions();
}

function eatLunch() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML = `<h2>Lunch Time</h2><p>Your stomach is demanding attention.</p>`;
    
    const roadsideCost = modifyCost(4500);
    const deliveryCost = modifyCost(8000);
    const restaurantCost = modifyCost(12000);
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="buyLunch('roadside')">Street food (₦${roadsideCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="buyLunch('delivery')">Food delivery (₦${deliveryCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="buyLunch('restaurant')">Restaurant (₦${restaurantCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="skipLunch()">Skip lunch</button>
    `;
}

function buyLunch(type) {
    let cost, fullness, joy, sickChance;
    let foodName;
    
    const foods = FOOD_OPTIONS.filter(f => {
        if (type === 'roadside') return f.location === 'roadside' || (f.location === 'all' && f.cost < 5000);
        if (type === 'delivery') return f.location === 'all';
        return f.location === 'restaurant' || f.location === 'all';
    });
    
    const food = foods[Math.floor(Math.random() * foods.length)];
    
    cost = modifyCost(type === 'roadside' ? food.cost : type === 'delivery' ? food.cost + 2500 : food.cost * 1.8);
    fullness = food.fullnessBoost;
    joy = food.joyBoost;
    sickChance = food.sickChance || 0;
    foodName = food.name;
    
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford this option.</p>`;
        }
        eatLunch();
        return;
    }
    
    updateStat('money', -cost);
    updateStat('fullness', fullness);
    updateStat('joy', joy);
    gameState.mealsToday++;
    gameState.lastMealTime = gameState.time;
    
    // Delivery issues
    if (type === 'delivery' && Math.random() < 0.25) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>The delivery takes forever. By the time your ${foodName} arrives, you're starving and annoyed.</p>`;
        }
        updateStat('joy', -joy / 2);
        updateStat('stress', 8);
    } else if (type === 'restaurant' && Math.random() < 0.15) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>The restaurant is packed. Service is slow, but the ${foodName} is worth it.</p>`;
        }
        updateStat('stress', -10);
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You enjoy your ${foodName}. Simple pleasures.</p>`;
        }
    }
    
    // Food poisoning check
    if (Math.random() < sickChance) {
        gameState.isSick = true;
        gameState.sicknessType = 'food';
    }
    
    advanceTime(1, 'idle');
    
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
    }
    showWorkStageOptions();
}

function skipLunch() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You decide to power through without eating. Your stomach protests.</p>`;
    }
    
    updateStat('fullness', -15);
    updateStat('joy', -8);
    updateStat('stress', 5);
    
    advanceTime(0.5, 'idle');
    
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
    }
    showWorkStageOptions();
}

function checkStatus() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    let statusHTML = `<h2>Status Check</h2>`;
    
    statusHTML += `
        <div class="status-section">
            <h3>Wellbeing</h3>
            <p>Joy: ${Math.round(gameState.joy)}/100 - ${gameState.joy > 70 ? "Good" : gameState.joy > 40 ? "Managing" : "Struggling"}</p>
            <p>Stress: ${Math.round(gameState.stress)}/100 - ${gameState.stress < 30 ? "Low" : gameState.stress < 60 ? "Moderate" : "High"}</p>
            <p>Fullness: ${Math.round(gameState.fullness)}/100 - ${gameState.fullness > 70 ? "Satisfied" : gameState.fullness > 40 ? "Could eat" : "Hungry"}</p>
            <p><em>${getAntThought()}</em></p>
        </div>
        
        <div class="status-section">
            <h3>Work</h3>
            <p>Progress: ${Math.round(gameState.workProgress)}/100</p>
    `;
    
    if (gameState.deadline > 0) {
        const progress = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        const daysLeft = 5 - gameState.day;
        statusHTML += `
            <p>Deadline: ${progress}% complete</p>
            <p>Time left: ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</p>
        `;
    }
    
    statusHTML += `
        </div>
        
        <div class="status-section">
            <h3>Finances</h3>
            <p>Balance: ₦${gameState.money.toLocaleString()}</p>
            <p>Resilience: ${gameState.resiliencePoints} point${gameState.resiliencePoints !== 1 ? 's' : ''}</p>
        </div>
    `;
    
    domElements.narrativeText.innerHTML = statusHTML;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="showWorkStageOptions()">Back to work</button>
    `;
}

function endWorkDay() {
    gameState.isWorking = false;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>End of Work Day</h2>
            <p>The office empties. Another day survived.</p>
        `;
    }
    
    // Power outage check
    if (Math.random() < 0.20) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Your phone buzzes - NEPA has struck again. Your area has no power.</p>`;
        }
        updateStat('stress', 8);
        updateStat('joy', -4);
    }
    
    eveningActivities();
}

// ========================================================================
// EVENING ACTIVITIES
// ========================================================================

function eveningActivities() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>The evening stretches ahead of you. What do you do?</p>`;
    
    const socialCost = modifyCost(7000);
    const dinnerCost = modifyCost(15000);
    
    let options = `
        <h3>Evening</h3>
        <button class="choice-btn" onclick="goHome()">Go home and rest</button>
        <button class="choice-btn" onclick="socializeWithFriends(${socialCost})">Meet up with friends (₦${socialCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="continueWorking()">Keep working on projects</button>
        <button class="choice-btn" onclick="goOutForDinner(${dinnerCost})">Treat yourself to dinner (₦${dinnerCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="doExercise()">Exercise</button>
        <button class="choice-btn" onclick="creativeHobby()">Do something creative</button>
    `;
    
    // Weekend preview options on Thursday/Friday
    if (gameState.day >= 3) {
        const raveCost = modifyCost(15000);
        options += `<button class="choice-btn" onclick="goToRave(${raveCost})">Go out to party (₦${raveCost.toLocaleString()})</button>`;
    }
    
    domElements.choicesContainer.innerHTML = options;
}

function goHome() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Evening at Home</h2>
        <p>You return to your place in ${gameState.location.name}. The familiar walls offer some comfort.</p>
    `;
    
    updateStat('stress', -8);
    updateStat('joy', 3);
    
    domElements.choicesContainer.innerHTML = `
        <h3>Home Activities</h3>
        <button class="choice-btn" onclick="cookDinner()">Cook something</button>
        <button class="choice-btn" onclick="watchTV()">Relax with entertainment</button>
        <button class="choice-btn" onclick="doHouseChores()">Do some chores</button>
        <button class="choice-btn" onclick="goToSleep()">Go to bed early</button>
    `;
}

function cookDinner() {
    const hasIngredients = Math.random() < 0.6;
    
    if (!hasIngredients) {
        const groceryCost = modifyCost(6000);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Your kitchen is nearly empty. You'll need to shop first.</p>`;
        }
        
        if (domElements.choicesContainer) {
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="goGroceryShopping(${groceryCost})">Buy groceries (₦${groceryCost.toLocaleString()})</button>
                <button class="choice-btn" onclick="orderFoodDelivery()">Just order delivery</button>
                <button class="choice-btn" onclick="skipDinner()">Skip dinner</button>
            `;
        }
        return;
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You cook a simple meal. The familiar routine is calming.</p>`;
    }
    
    updateStat('fullness', 38);
    updateStat('joy', 6);
    updateStat('stress', -4);
    gameState.mealsToday++;
    
    advanceTime(1, 'idle');
    eveningLeisure();
}

function goGroceryShopping(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford groceries right now.</p>`;
        }
        goHome();
        return;
    }
    
    updateStat('money', -cost);
    updateStat('stress', 6);
    updateStat('fullness', -5);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You make a quick trip to the market. Then cook a proper meal.</p>`;
    }
    
    updateStat('fullness', 42);
    updateStat('joy', 8);
    gameState.mealsToday++;
    
    advanceTime(2, 'physical');
    eveningLeisure();
}

function orderFoodDelivery() {
    const deliveryCost = modifyCost(8000);
    
    if (gameState.money < deliveryCost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You can't afford delivery right now.</p>`;
        }
        goHome();
        return;
    }
    
    updateStat('money', -deliveryCost);
    
    // Delivery problems
    if (Math.random() < 0.3) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>The delivery takes forever. When it finally arrives, it's lukewarm.</p>`;
        }
        updateStat('fullness', 30);
        updateStat('joy', 0);
        updateStat('stress', 8);
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>Your food arrives hot and delicious. Small victories.</p>`;
        }
        updateStat('fullness', 35);
        updateStat('joy', 8);
    }
    
    gameState.mealsToday++;
    advanceTime(1, 'idle');
    eveningLeisure();
}

function skipDinner() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You go to bed hungry. It's not comfortable.</p>`;
    }
    
    updateStat('fullness', -18);
    updateStat('joy', -10);
    updateStat('stress', 5);
    
    goToSleep();
}

function watchTV() {
    gameState.eveningActivities.tv++;
    
    // Diminishing returns
    let joyGain = 10 - (gameState.eveningActivities.tv * 2);
    joyGain = Math.max(3, joyGain);
    
    if (gameState.eveningActivities.tv > 3) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You scroll through channels, but nothing holds your attention. The familiar numbing effect.</p>`;
        }
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You unwind with some entertainment. Your mind gets a break.</p>`;
        }
    }
    
    updateStat('joy', joyGain);
    updateStat('stress', -10);
    
    advanceTime(2, 'idle');
    goToSleep();
}

function doHouseChores() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You clean up, do laundry, and generally get your life in order. It's satisfying work.</p>`;
    }
    
    updateStat('stress', 3);
    updateStat('fullness', -5);
    updateStat('joy', 5); // Sense of accomplishment
    
    advanceTime(1, 'physical');
    eveningLeisure();
}

function eveningLeisure() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>You have some time before bed.</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="watchTV()">Watch something</button>
        <button class="choice-btn" onclick="callFamily()">Call family or friends</button>
        <button class="choice-btn" onclick="goToSleep()">Go to sleep</button>
    `;
}

function callFamily() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>You spend time on the phone with loved ones. The connection reminds you why you keep going.</p>`;
    }
    
    updateStat('joy', 12);
    updateStat('stress', -8);
    
    advanceTime(1, 'idle');
    goToSleep();
}

function socializeWithFriends(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You can't afford to go out right now.</p>`;
        }
        eveningActivities();
        return;
    }
    
    gameState.eveningActivities.social++;
    
    updateStat('money', -cost);
    
    // Class-modified joy
    let joyBoost = 15;
    if (gameState.class) {
        joyBoost *= CLASS_MODIFIERS[gameState.class].joyFromLeisure;
    }
    
    updateStat('joy', joyBoost);
    updateStat('stress', -12);
    
    const socialEvents = [
        "Great conversations about life, dreams, and surviving Lagos.",
        "Your friend tells a story that has everyone in stitches.",
        "You all commiserate about work. Shared misery is lighter.",
        "Someone brought small chops. Perfect.",
        "The group makes plans for when life is easier. Someday.",
        "A friend shares good news. Their joy lifts everyone."
    ];
    
    const event = socialEvents[Math.floor(Math.random() * socialEvents.length)];
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Time with Friends</h2>
            <p>${event}</p>
        `;
    }
    
    updateStat('fullness', -10);
    advanceTime(3, 'idle');
    goToSleep();
}

function continueWorking() {
    gameState.eveningActivities.work++;
    
    // Diminishing returns and increasing stress
    let progressGain = 18 - (gameState.eveningActivities.work * 3);
    progressGain = Math.max(8, progressGain);
    
    let stressGain = 12 + (gameState.eveningActivities.work * 4);
    
    if (gameState.eveningActivities.work > 2) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Burning the Midnight Oil</h2>
                <p>You're exhausted, but you force yourself to keep working. Every keystroke is a battle.</p>
                <p><em>${getAntThought()}</em></p>
            `;
        }
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Working Late</h2>
                <p>You put in extra hours. The office is quiet - just you and the work.</p>
            `;
        }
    }
    
    gameState.workProgress += progressGain;
    
    if (gameState.deadline > 0) {
        gameState.deadlineProgress += progressGain * 0.9;
    }
    
    updateStat('stress', stressGain);
    updateStat('fullness', -12);
    updateStat('joy', -8);
    
    advanceTime(2, 'work');
    
    // Prompt for food after working
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You're hungry after all that work.</p>`;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="orderFoodDelivery()">Order something</button>
            <button class="choice-btn" onclick="goToSleep()">Just go to sleep</button>
        `;
    }
}

function goOutForDinner(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You can't afford a nice dinner right now.</p>`;
        }
        eveningActivities();
        return;
    }
    
    updateStat('money', -cost);
    updateStat('fullness', 40);
    updateStat('joy', 12);
    updateStat('stress', -10);
    gameState.mealsToday++;
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Dinner Out</h2>
            <p>You treat yourself to a proper meal. The atmosphere, the food, the brief escape from routine - it's worth it.</p>
        `;
    }
    
    advanceTime(2, 'idle');
    goToSleep();
}

function doExercise() {
    gameState.eveningActivities.exercise++;
    
    // Exercise gets easier and more beneficial over time
    let stressReduction = -8 - (gameState.eveningActivities.exercise * 2);
    let joyGain = 5 + (gameState.eveningActivities.exercise * 1.5);
    
    if (gameState.eveningActivities.exercise === 1) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Exercise</h2>
                <p>You force yourself to work out. It's hard, but you feel better afterwards.</p>
            `;
        }
    } else if (gameState.eveningActivities.exercise < 4) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Exercise</h2>
                <p>Another workout. Your body is getting used to this. It's becoming a habit.</p>
            `;
        }
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Exercise</h2>
                <p>Your exercise routine is paying off. You feel stronger, clearer, more capable.</p>
            `;
        }
        joyGain += 5;
    }
    
    updateStat('joy', joyGain);
    updateStat('stress', stressReduction);
    updateStat('fullness', -15);
    
    advanceTime(1.5, 'physical');
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You worked up an appetite.</p>`;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="cookDinner()">Cook something healthy</button>
            <button class="choice-btn" onclick="orderFoodDelivery()">Order food</button>
            <button class="choice-btn" onclick="goToSleep()">Skip dinner and sleep</button>
        `;
    }
}

function creativeHobby() {
    gameState.eveningActivities.creative++;
    
    const hobbies = ["writing", "sketching", "making music", "crafting"];
    const hobby = hobbies[(gameState.eveningActivities.creative - 1) % hobbies.length];
    
    let joyGain = 10 + (gameState.eveningActivities.creative * 2);
    let stressReduction = -8 - (gameState.eveningActivities.creative);
    
    if (gameState.eveningActivities.creative === 1) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Creative Time</h2>
                <p>You spend time ${hobby}. It's been a while since you've done something purely for yourself.</p>
            `;
        }
    } else if (gameState.eveningActivities.creative < 4) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Creative Time</h2>
                <p>More ${hobby}. You're finding your flow again. The stress of Lagos fades a little.</p>
            `;
        }
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Creative Time</h2>
                <p>Your ${hobby} practice is becoming meaningful. This is who you are beyond the daily grind.</p>
            `;
        }
        joyGain += 8;
    }
    
    updateStat('joy', joyGain);
    updateStat('stress', stressReduction);
    
    advanceTime(2, 'idle');
    goToSleep();
}

function goToRave(cost) {
    if (gameState.money < cost) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `<p>You can't afford to party right now.</p>`;
        }
        eveningActivities();
        return;
    }
    
    updateStat('money', -cost);
    updateStat('joy', 22);
    updateStat('stress', -20);
    updateStat('fullness', -18);
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Night Out</h2>
            <p>The music, the lights, the energy. For a few hours, you forget about everything else.</p>
        `;
    }
    
    // Offer of substances
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <p>Someone offers you something to "enhance the experience."</p>
            <button class="choice-btn" onclick="acceptSubstances()">Why not</button>
            <button class="choice-btn" onclick="declineSubstances()">No thanks</button>
        `;
    }
}

function acceptSubstances() {
    updateStat('joy', 30);
    updateStat('stress', -30);
    
    // Tomorrow will hurt
    gameState.isSick = true;
    gameState.sicknessType = 'hangover';
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `<p>The night becomes a blur of euphoria. You'll pay for this tomorrow, but right now, you don't care.</p>`;
    }
    
    advanceTime(4, 'physical');
    goToSleep();
}

function declineSubstances() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You decline politely and enjoy the night naturally. Still fun, still an escape.</p>`;
    }
    
    advanceTime(3, 'physical');
    goToSleep();
}

function goToSleep() {
    let sleepQuality = "good";
    let joyBoost = 5;
    let stressReduction = 10;
    
    if (gameState.stress > 65) {
        sleepQuality = "poor";
        joyBoost = 2;
        stressReduction = 5;
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Night</h2>
                <p>Sleep comes hard. Your mind races with worries. The ants are loud tonight.</p>
                <p><em>${getAntThought()}</em></p>
            `;
        }
    } else if (gameState.fullness < 30) {
        sleepQuality = "poor";
        joyBoost = 2;
        stressReduction = 5;
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Night</h2>
                <p>Your stomach keeps you awake. Hunger is a persistent companion.</p>
            `;
        }
    } else if (gameState.stress > 40) {
        sleepQuality = "average";
        joyBoost = 4;
        stressReduction = 7;
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Night</h2>
                <p>Sleep is fitful but you get some rest.</p>
            `;
        }
    } else {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Night</h2>
                <p>You sleep deeply. Tomorrow is another day.</p>
            `;
        }
    }
    
    updateStat('joy', joyBoost);
    updateStat('stress', -stressReduction);
    
    // Advance to next day
    gameState.time = 0;
    gameState.day += 1;
    gameState.workdayStage = 0;
    
    if (gameState.day > 4) {
        finishGame();
        return;
    }
    
    // Natural overnight decay
    updateStat('fullness', -20);
    
    // Check for hangover
    if (gameState.isSick && gameState.sicknessType === 'hangover') {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>The Morning After</h2>
                <p>You wake up feeling terrible. Head pounding, stomach churning. Worth it? You're not sure.</p>
            `;
        }
        
        updateStat('joy', -20);
        updateStat('stress', 25);
        gameState.isSick = false;
        gameState.sicknessType = null;
        
        showMorningOptions();
    } else if (gameState.isSick && gameState.sicknessType === 'food') {
        showSicknessEvent();
    } else {
        startNewDay();
    }
    
    updateUI();
}

// ========================================================================
// GAME ENDINGS
// ========================================================================

function gameOver(reason) {
    gameState.isGameOver = true;
    clearAntSystem();
    
    // Clear timers
    const highestId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
    }
    
    document.body.classList.add('transition-pause');
    
    if (domElements.gameContent) {
        domElements.gameContent.classList.add('game-over');
        domElements.gameContent.classList.remove('text-distortion-light', 'text-distortion-medium', 'text-distortion-heavy');
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Game Over</h2>
            <p>${reason}</p>
            <p><em>${getAntThought()}</em></p>
            
            <div class="status-section">
                <h3>Final Statistics</h3>
                <p>Day Reached: ${DAYS[gameState.day]}</p>
                <p>Joy: ${Math.round(gameState.joy)}/100</p>
                <p>Fullness: ${Math.round(gameState.fullness)}/100</p>
                <p>Stress: ${Math.round(gameState.stress)}/100</p>
                <p>Money: ₦${gameState.money.toLocaleString()}</p>
            </div>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="location.reload()">Try Again</button>
            <a href="https://pagebookstore.com/products/how-to-get-rid-of-ants" class="preorder-btn" target="_blank">Pre-order the Book</a>
        `;
    }
}

function finishGame() {
    gameState.isGameOver = true;
    clearAntSystem();
    
    document.body.classList.add('transition-pause');
    
    if (domElements.gameContent) {
        domElements.gameContent.classList.remove('text-distortion-light', 'text-distortion-medium', 'text-distortion-heavy');
    }
    
    // Determine ending
    let endingType, endingDesc;
    
    if (gameState.joy <= 20) {
        endingType = "Barely Surviving";
        endingDesc = "You made it through the week, but at what cost? The ants are loud, your spirit is dim. But you're still here. That counts for something.";
    } else if (gameState.stress >= 75) {
        endingType = "On the Edge";
        endingDesc = "The week nearly broke you. You're running on fumes and anxiety. But the weekend is here. Time to breathe.";
    } else if (gameState.joy < 40 || gameState.fullness < 35 || gameState.stress > 60) {
        endingType = "Survival";
        endingDesc = "Another week survived. It wasn't pretty, but you made it. In Lagos, that's not nothing.";
    } else if (gameState.joy >= 60 && gameState.stress <= 45) {
        endingType = "Balance";
        endingDesc = "Against the odds, you found balance. Work, life, sanity - you kept all the plates spinning. The ants are quiet.";
    } else {
        endingType = "Thriving";
        endingDesc = "You didn't just survive - you lived. Lagos threw everything at you, and you met it with grace. The ants have nothing to feed on.";
    }
    
    // Deadline result
    let deadlineResult = "";
    if (gameState.deadline > 0) {
        const progress = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        
        if (progress >= 100) {
            deadlineResult = "You completed the impossible deadline. Your boss is impressed, even if they won't say it.";
        } else if (progress >= 80) {
            deadlineResult = "You made substantial progress on the deadline. Not perfect, but enough to avoid the worst consequences.";
        } else {
            deadlineResult = "The deadline wasn't met. There will be consequences next week. But that's a problem for future you.";
        }
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Friday Night: ${endingType}</h2>
            <p>${endingDesc}</p>
            ${deadlineResult ? `<p>${deadlineResult}</p>` : ''}
            
            <div class="status-section">
                <h3>Final Statistics</h3>
                <p>Joy: ${Math.round(gameState.joy)}/100</p>
                <p>Fullness: ${Math.round(gameState.fullness)}/100</p>
                <p>Stress: ${Math.round(gameState.stress)}/100</p>
                <p>Money Remaining: ₦${gameState.money.toLocaleString()}</p>
                <p>Resilience Remaining: ${gameState.resiliencePoints}</p>
            </div>
            
            <p><em>The weekend stretches ahead. A chance to recover, to prepare for next week. The cycle continues. But for now, you rest.</em></p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="location.reload()">Play Again</button>
            <a href="https://pagebookstore.com/products/how-to-get-rid-of-ants" class="preorder-btn" target="_blank">Pre-order "How to Get Rid of Ants"</a>
        `;
    }
}

// ========================================================================
// INITIALIZATION
// ========================================================================

document.addEventListener('DOMContentLoaded', function() {
    window.GameInitializer.init();
});

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (window.GameInitializer && !window.GameInitializer.initialized) {
            window.GameInitializer.init();
        }
    }, 1);
}
