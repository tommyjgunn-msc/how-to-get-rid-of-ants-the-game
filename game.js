/**
 * How to Get Rid of Ants: The Game
 * A text-based survival simulation set in Lagos, Nigeria
 */

// ========================================================================
// INITIALIZATION MANAGER
// ========================================================================

// Create a global initialization manager to control the startup process
window.GameInitializer = {
    // Initialization status flags
    initialized: false,
    elementsLoaded: false,
    gameStarted: false,
    
    // Error tracking
    hasError: false,
    errorMessage: "",
    
    // Start the initialization process
    init: function() {
        console.log("Starting game initialization...");
        try {
            // Wait for DOM to be fully loaded
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', this.onDOMLoaded.bind(this));
                console.log("Waiting for DOM to load...");
            } else {
                // DOM already loaded, proceed immediately
                this.onDOMLoaded();
            }
        } catch (error) {
            this.handleInitError(error, "Failed to set up initialization");
        }
    },
    
    // Handle DOM loaded event
    onDOMLoaded: function() {
        console.log("DOM loaded, initializing game...");
        try {
            // Cache DOM elements
            window.domElements = {};
            this.cacheDOMElements();
            this.elementsLoaded = true;
            
            // Initialize game state and systems
            this.initializeGameState();
            this.initializeGameSystems();
            
            // Start the game UI
            this.startGame();
            
            // Mark initialization as complete
            this.initialized = true;
            console.log("Game initialization completed successfully");
        } catch (error) {
            this.handleInitError(error, "Error during game initialization");
        }
    },
    
    // Cache all DOM elements
    cacheDOMElements: function() {
        // Stat bars and values
        domElements.joyBar = document.getElementById('joy-bar');
        domElements.fullnessBar = document.getElementById('fullness-bar');
        domElements.stressBar = document.getElementById('stress-bar');
        domElements.joyValue = document.getElementById('joy-value');
        domElements.fullnessValue = document.getElementById('fullness-value');
        domElements.stressValue = document.getElementById('stress-value');
        domElements.moneyValue = document.getElementById('money-value');
        domElements.dayValue = document.getElementById('day-value');
        domElements.timeValue = document.getElementById('time-value');
        
        // Game content sections
        domElements.narrativeText = document.getElementById('narrative-text');
        domElements.choicesContainer = document.getElementById('choices-container');
        domElements.antOverlay = document.getElementById('ant-overlay');
        domElements.gameContent = document.getElementById('game-content');
        domElements.cityscape = document.getElementById('cityscape');
        
        // Deadline elements
        domElements.deadlineContainer = document.getElementById('deadline-container');
        domElements.deadlineBar = document.getElementById('deadline-bar');
        domElements.deadlineValue = document.getElementById('deadline-value');
        
        // Verify essential elements exist
        const essentialElements = ['narrativeText', 'choicesContainer', 'gameContent'];
        const missingElements = essentialElements.filter(el => !domElements[el]);
        
        if (missingElements.length > 0) {
            throw new Error(`Missing essential DOM elements: ${missingElements.join(', ')}`);
        }
        
        console.log("DOM elements cached successfully");
    },
    
    // Initialize game state
    initializeGameState: function() {
        // Reset the game state to initial values
        resetGameState();
        console.log("Game state initialized");
    },
    
    // Initialize game systems
    initializeGameSystems: function() {
        // Initialize visual elements
        this.initializeVisuals();
        
        // Initialize ant system
        initAntSystem();
        
        console.log("Game systems initialized");
    },
    
    // Initialize visual elements
    initializeVisuals: function() {
        // Add floating elements
        addFloatingElements();
        
        // Initialize cityscape
        updateCityscape();
        
        console.log("Visual elements initialized");
    },
    
    // Start the game UI
    startGame: function() {
        try {
            // Start the game by showing character creation
            showCharacterCreation();
            
            // Set flag that game has started
            this.gameStarted = true;
            console.log("Game UI started successfully");
        } catch (error) {
            this.handleInitError(error, "Failed to start game UI");
        }
    },
    
    // Handle initialization errors
    handleInitError: function(error, context) {
        this.hasError = true;
        this.errorMessage = `${context}: ${error.message}`;
        console.error(this.errorMessage, error);
        
        // Display error to user if possible
        this.displayErrorMessage();
    },
    
    // Show error message in the game UI
    displayErrorMessage: function() {
        // Try to display error in game content
        try {
            const narrativeEl = document.getElementById('narrative-text');
            const choicesEl = document.getElementById('choices-container');
            
            if (narrativeEl) {
                narrativeEl.innerHTML = `
                    <h2>Game Error</h2>
                    <p>There was a problem starting the game:</p>
                    <p class="error-message">${this.errorMessage}</p>
                    <p>Please try refreshing the page.</p>
                `;
            }
            
            if (choicesEl) {
                choicesEl.innerHTML = `
                    <button class="choice-btn" onclick="location.reload()">Refresh Page</button>
                `;
            }
        } catch (e) {
            // If we can't even show the error in the UI, log to console as last resort
            console.error("Could not display error message in UI", e);
        }
    }
};

// ========================================================================
// CONSTANTS AND CONFIGURATION
// ========================================================================

// Days and times for display
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const TIMES = ["6:00 AM", "8:00 AM", "10:00 AM", "12:00 PM", 
              "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM", 
              "10:00 PM", "12:00 AM"];

// Define consistent decay rates for activities
const DECAY_RATES = {
    idle: { fullness: 1.2, joy: -2.8, stress: -0.3 },
    work: { fullness: 4.5, joy: -4.0, stress: 0.8 },
    physical: { fullness: 6.0, joy: 0.5, stress: 0.5 },
    sleep: { fullness: 12, joy: -4.0, stress: -6.0 }
};

// Define class-based modifiers
const CLASS_MODIFIERS = {
    'working': {
        eventChance: 1.3,      // 30% more random events
        goodEventChance: 0.4,  // 40% chance of good event
        incomeMultiplier: 0.7, // Lower income
        costMultiplier: 0.9,   // Slightly lower costs (more resourceful)
        communitySupport: 0.35, // 35% chance of community help in crisis
        stressFromWork: 1.3,   // More stress from work
        joyFromLeisure: 1.4    // More joy from leisure
    },
    'middle': {
        eventChance: 1.0,      // Standard event rate
        goodEventChance: 0.5,  // Standard good/bad ratio
        incomeMultiplier: 1.0, // Standard income
        costMultiplier: 1.0,   // Standard costs
        communitySupport: 0.15, // 15% chance of community help
        stressFromWork: 1.0,   // Standard stress from work
        joyFromLeisure: 1.0    // Standard joy from leisure
    },
    'upper': {
        eventChance: 0.75,     // 25% fewer random events
        goodEventChance: 0.6,  // More likely to be good
        incomeMultiplier: 1.2, // Higher income (reduced from 1.3)
        costMultiplier: 1.4,   // Higher costs (luxury living) - increased
        communitySupport: 0.05, // 5% chance of community support
        stressFromWork: 0.9,   // Less stress from work
        joyFromLeisure: 0.7    // Less joy from leisure (diminishing returns)
    }
};

// Food options with effects and availability
const FOOD_OPTIONS = [
    { name: "Suya", cost: 4500, fullnessBoost: 18, joyBoost: 10, location: "roadside", availability: 1.0 },
    { name: "Small chops", cost: 6000, fullnessBoost: 16, joyBoost: 12, location: "all", availability: 0.9 },
    { name: "Rice and chicken stew", cost: 7500, fullnessBoost: 35, joyBoost: 10, location: "all", availability: 1.0 },
    { name: "Jollof rice", cost: 7500, fullnessBoost: 35, joyBoost: 12, location: "all", availability: 1.0 },
    { name: "Peppered Beef", cost: 5500, fullnessBoost: 12, joyBoost: 8, location: "all", availability: 0.95, isside: true },
    { name: "Peppered turkey", cost: 6500, fullnessBoost: 12, joyBoost: 10, location: "all", availability: 0.95, isside: true },
    { name: "Ofada rice and ayamase", cost: 8500, fullnessBoost: 40, joyBoost: 14, location: "all", availability: 0.9 },
    { name: "Creamy pasta", cost: 10000, fullnessBoost: 30, joyBoost: 16, location: "restaurant", availability: 1.0 }
];

// ========================================================================
// GAME STATE
// ========================================================================

// Initialize the global game state object
const gameState = {
    // Player stats
    joy: 100,
    fullness: 100,
    stress: 0,
    money: 0,
    
    // Time tracking
    day: 0, // 0 = Monday, 4 = Friday
    time: 0, // 0 = 6AM, increments by 2 hours, 9 = 12AM
    
    // Player attributes
    job: null,
    class: null,
    age: null,
    location: null,
    playerName: "",
    companyName: "",
    
    // Game flags
    hasTransportation: false,
    hasFamilyEmergency: false,
    isWorking: false,
    isSick: false,
    roadSideFood: false,
    rainedYesterday: false,
    hadRandomEventToday: false,
    sicknessScheduled: false,
    sicknessDay: -1,
    drugComedownDay: null,
    
    // Work tracking
    workProgress: 0,
    workdayStage: 0, // 0 = not started, 1 = morning, 2 = midday, 3 = afternoon
    currentWorkTimeAdvance: 0,
    
    // Other tracking variables
    events: [],
    endingType: null,
    activeAnts: 0,
    antPool: [],
    antUpdateTimer: null,
    lastMealTime: -1,
    
    // Evening activity tracking
    eveningActivities: {
        tv: 0,
        social: 0,
        work: 0,
        exercise: 0,
        creative: 0
    },
    
    // Tuesday's impossible deadline
    deadline: 0,
    deadlineProgress: 0,
    
    // Streak tracking
    streaks: {
        daysWithoutFood: 0,
        daysWithHighStress: 0,
        daysWithLowJoy: 0
    },
    
    // Game state
    isGameOver: false
};

// Function to reset game state to initial values
function resetGameState() {
    // Reset player stats
    gameState.joy = 100;
    gameState.fullness = 100;
    gameState.stress = 0;
    gameState.money = 0;
    
    // Reset time tracking
    gameState.day = 0;
    gameState.time = 0;
    
    // Reset player attributes
    gameState.job = null;
    gameState.class = null;
    gameState.age = null;
    gameState.location = null;
    gameState.playerName = "";
    gameState.companyName = "";
    
    // Reset game flags
    gameState.hasTransportation = false;
    gameState.hasFamilyEmergency = false;
    gameState.isWorking = false;
    gameState.isSick = false;
    gameState.roadSideFood = false;
    gameState.rainedYesterday = false;
    gameState.hadRandomEventToday = false;
    gameState.sicknessScheduled = false;
    gameState.sicknessDay = -1;
    gameState.drugComedownDay = null;
    
    // Reset work tracking
    gameState.workProgress = 0;
    gameState.workdayStage = 0;
    gameState.currentWorkTimeAdvance = 0;
    
    // Reset other tracking variables
    gameState.events = [];
    gameState.endingType = null;
    gameState.activeAnts = 0;
    gameState.antPool = [];
    gameState.antUpdateTimer = null;
    gameState.lastMealTime = -1;
    
    // Reset evening activity tracking
    gameState.eveningActivities = {
        tv: 0,
        social: 0,
        work: 0,
        exercise: 0,
        creative: 0
    };
    
    // Reset deadline
    gameState.deadline = 0;
    gameState.deadlineProgress = 0;
    
    // Reset streak tracking
    gameState.streaks = {
        daysWithoutFood: 0,
        daysWithHighStress: 0,
        daysWithLowJoy: 0
    };
    
    // Reset game state
    gameState.isGameOver = false;
}

// Global DOM elements container
let domElements = {};

// ========================================================================
// CORE UTILITY FUNCTIONS
// ========================================================================

// Add visual notification for stat changes
function showStatChange(statName, amount) {
    if (amount === 0 || gameState.isGameOver) return;
    
    // Create a floating notification element
    const notif = document.createElement('div');
    notif.classList.add('stat-change');
    
    // Determine emoji and color based on stat and direction
    let emoji, color;
    if (statName === 'joy') {
        emoji = amount > 0 ? '😊' : '😔';
        color = amount > 0 ? '#4CAF50' : '#F44336';
    } else if (statName === 'fullness') {
        emoji = amount > 0 ? '🍔' : '🍽️';
        color = amount > 0 ? '#FFC107' : '#F44336';
    } else if (statName === 'stress') {
        emoji = amount > 0 ? '😰' : '😌';
        color = amount > 0 ? '#F44336' : '#4CAF50';
    } else if (statName === 'money') {
        emoji = amount > 0 ? '💰' : '💸';
        color = amount > 0 ? '#4CAF50' : '#F44336';
    }
    
    // Create notification content
    notif.innerHTML = `${emoji} ${statName}: ${amount > 0 ? '+' : ''}${Math.round(amount)}`;
    notif.style.color = color;
    
    // Add to DOM
    const statsContainer = document.getElementById('stats-container');
    if (statsContainer) {
        statsContainer.appendChild(notif);
        
        // Animate and remove
        setTimeout(() => {
            notif.classList.add('fadeout');
            setTimeout(() => notif.remove(), 1000);
        }, 1500);
    }
}

// Update a stat with visual feedback
function updateStat(statName, amount) {
    // Skip if amount is 0 or game is over
    if (amount === 0 || gameState.isGameOver) return gameState[statName];
    
    // Get current value
    let currentValue = gameState[statName];
    
    // Apply change
    let newValue = currentValue + amount;
    
    // Apply appropriate limits based on stat type
    if (statName === 'joy' || statName === 'fullness') {
        newValue = Math.max(0, Math.min(100, newValue));
    } else if (statName === 'stress') {
        newValue = Math.max(0, Math.min(100, newValue));
    }
    
    // Update the stat
    gameState[statName] = newValue;
    
    // Add visual feedback only for significant changes
    if (Math.abs(amount) >= 0.5) {
        showStatChange(statName, amount);
    }
    
    return newValue;
}

// Modify cost based on player's social class
function modifyCost(baseCost) {
    if (!gameState.class) return baseCost;
    
    const mod = CLASS_MODIFIERS[gameState.class];
    return Math.round(baseCost * mod.costMultiplier);
}

// Process income based on player's social class
function receivePay(amount) {
    if (!gameState.class) return amount;
    
    const mod = CLASS_MODIFIERS[gameState.class];
    const adjustedAmount = Math.round(amount * mod.incomeMultiplier);
    
    updateStat('money', adjustedAmount);
    return adjustedAmount;
}

// Generate a company name based on job
function generateCompanyName(job) {
    const companyPrefixes = ["Lagos", "Naija", "West African", "Golden", "Royal", "Unity", "Diamond", "Sunrise", "Elite", "Heritage"];
    const companySuffixes = {
        'marketer': ["Marketing Solutions", "Advertising Agency", "Brand Consultants", "Media Group", "Promotions Ltd"],
        'programmer': ["Tech Solutions", "Software Innovations", "Digital Systems", "CodeWorks", "Tech Hub"],
        'designer': ["Design Studio", "Creative Agency", "Visual Arts", "Graphics Plus", "Design Works"],
        'artist': ["Art Gallery", "Creative Collective", "Studio", "Art House", "Cultural Center"]
    };
    
    const prefix = companyPrefixes[Math.floor(Math.random() * companyPrefixes.length)];
    const suffix = companySuffixes[job][Math.floor(Math.random() * companySuffixes[job].length)];
    
    return `${prefix} ${suffix}`;
}

// ========================================================================
// UI HANDLING & RENDERING
// ========================================================================

// Update the UI to reflect current game state
function updateUI() {
    // Skip if game is over or elements aren't available yet
    if (gameState.isGameOver || !domElements.joyBar) return;
    
    try {
        // Update progress bars
        if (domElements.joyBar) domElements.joyBar.style.width = `${gameState.joy}%`;
        if (domElements.fullnessBar) domElements.fullnessBar.style.width = `${gameState.fullness}%`;
        if (domElements.stressBar) domElements.stressBar.style.width = `${gameState.stress}%`;
        
        // Update numerical values
        if (domElements.joyValue) domElements.joyValue.textContent = Math.round(gameState.joy);
        if (domElements.fullnessValue) domElements.fullnessValue.textContent = Math.round(gameState.fullness);
        if (domElements.stressValue) domElements.stressValue.textContent = Math.round(gameState.stress);
        if (domElements.moneyValue) domElements.moneyValue.textContent = `₦${gameState.money.toLocaleString()}`;
        
        // Update day and time
        if (domElements.dayValue) domElements.dayValue.textContent = DAYS[gameState.day];
        if (domElements.timeValue) domElements.timeValue.textContent = TIMES[gameState.time];
        
        // Update background elements
        updateCityscape();
        
        // Update deadline progress if applicable
        updateDeadlineUI();
        
        // Update ant overlay based on joy level and stress
        updateAntVisualization();
        
        // Process stat interactions and check for game over
        processStatInteractions();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

// Update cityscape based on time of day
function updateCityscape() {
    if (!domElements.cityscape) return;
    
    const time = gameState.time;
    
    // Update cityscape class based on time of day
    if (time < 3) { // Morning
        domElements.cityscape.className = 'cityscape morning';
    } else if (time < 6) { // Afternoon
        domElements.cityscape.className = 'cityscape afternoon';
    } else { // Evening
        domElements.cityscape.className = 'cityscape evening';
    }
}

// Update deadline UI if active
function updateDeadlineUI() {
    if (!domElements.deadlineContainer || !domElements.deadlineBar || !domElements.deadlineValue) return;
    
    if (gameState.deadline > 0) {
        // Show deadline container and update progress
        domElements.deadlineContainer.classList.remove('hidden');
        const progress = Math.min(100, Math.round((gameState.deadlineProgress / gameState.deadline) * 100));
        domElements.deadlineBar.style.width = `${progress}%`;
        domElements.deadlineValue.textContent = `${progress}%`;
        
        // ARIA update
        domElements.deadlineBar.setAttribute('aria-valuenow', progress);
        
        // Color coding based on progress and day
        if (gameState.day >= 4) { // Friday
            if (progress < 85) {
                domElements.deadlineBar.style.backgroundColor = '#F44336'; // Red - danger
            } else {
                domElements.deadlineBar.style.backgroundColor = '#FFC107'; // Yellow - caution
            }
        } else if (gameState.day >= 3) { // Thursday
            if (progress < 50) {
                domElements.deadlineBar.style.backgroundColor = '#F44336'; // Red - danger
            } else if (progress < 75) {
                domElements.deadlineBar.style.backgroundColor = '#FFC107'; // Yellow - caution
            } else {
                domElements.deadlineBar.style.backgroundColor = '#4CAF50'; // Green - good
            }
        } else {
            domElements.deadlineBar.style.backgroundColor = '#2196F3'; // Blue - normal
        }
    } else {
        // Hide the deadline container if no active deadline
        domElements.deadlineContainer.classList.add('hidden');
    }
}

// Add floating geometric elements
function addFloatingElements() {
    const shapes = ['pyramid', 'cube', 'sphere', 'star'];
    const container = document.getElementById('geometric-elements');
    
    if (!container) return;
    
    // Remove any existing floating shapes first
    container.innerHTML = '';
    
    // Add new shapes
    for (let i = 0; i < 5; i++) {
        const shape = document.createElement('div');
        const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        shape.className = `floating-shape ${shapeType}`;
        shape.style.left = `${Math.random() * 90}%`;
        shape.style.top = `${Math.random() * 90}%`;
        shape.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(shape);
    }
}

// ========================================================================
// ANT VISUALIZATION SYSTEM
// ========================================================================

// Initialize ant system
function initAntSystem() {
    // First, clear any previous ant system
    clearAntSystem();
    
    // Make sure ant overlay exists before proceeding
    if (!domElements.antOverlay) {
        console.warn("Ant overlay container not found");
        return;
    }
    
    // Initialize ant pool
    gameState.antPool = [];
    const MAX_INTERACTIVE_ANTS = 20; 
    
    for (let i = 0; i < MAX_INTERACTIVE_ANTS; i++) {
        const ant = document.createElement('div');
        ant.className = 'interactive-ant';
        ant.style.display = 'none'; // Hide initially
        ant.style.top = '0%';
        ant.style.left = '0%';
        
        // Make ants clickable
        ant.addEventListener('click', function(e) {
            if (gameState.isGameOver) return;
            
            e.stopPropagation();
            this.classList.add('squished');
            
            // Joy boost from squishing ants
            updateStat('joy', 0.8);
            
            // Remove from DOM after animation completes
            setTimeout(() => {
                if (this && this.parentNode) {
                    this.style.display = 'none';
                    this.classList.remove('squished');
                    gameState.activeAnts--;
                }
            }, 300);
        });
        
        domElements.antOverlay.appendChild(ant);
        gameState.antPool.push(ant);
    }
    
    // Set initial state
    gameState.activeAnts = 0;
    
    // Schedule first update
    scheduleAntUpdate();
}

// Schedule the next ant visualization update
function scheduleAntUpdate() {
    // Clear any existing update timer first
    clearAntUpdateTimer();
    
    // Set new timer
    const updateInterval = gameState.joy < 10 || gameState.stress > 90 ? 2000 : 800;
    gameState.antUpdateTimer = setTimeout(updateAntVisualization, updateInterval);
}

// Clear the ant update timer safely
function clearAntUpdateTimer() {
    if (gameState.antUpdateTimer) {
        clearTimeout(gameState.antUpdateTimer);
        gameState.antUpdateTimer = null;
    }
}

// Clean up the entire ant system
function clearAntSystem() {
    // Clear the update timer
    clearAntUpdateTimer();
    
    // Remove all ant elements
    if (domElements.antOverlay) {
        domElements.antOverlay.innerHTML = '';
    }
    
    // Reset game container classes
    if (domElements.gameContent) {
        domElements.gameContent.classList.remove(
            'text-distortion-light', 
            'text-distortion-medium', 
            'text-distortion-heavy'
        );
    }
    
    // Reset ant-related state
    gameState.activeAnts = 0;
    gameState.antPool = [];
}

// Update ant visualization based on joy and stress levels
function updateAntVisualization() {
    // Skip update if game is over
    if (gameState.isGameOver) return;
    
    try {
        // Enhanced intensity calculation - more ants at lower joy and higher stress
        const joyFactor = Math.max(0, 25 - gameState.joy) / 25; 
        const stressFactor = Math.max(0, gameState.stress - 65) / 35;
        
        // Combined factor - both stress and low joy contribute to ant infestation
        const antIntensity = Math.max(joyFactor, stressFactor * 0.8);
        
        // Update text distortion effects
        if (domElements.gameContent) {
            // Remove all classes first
            domElements.gameContent.classList.remove(
                'text-distortion-light', 
                'text-distortion-medium', 
                'text-distortion-heavy'
            );
            
            // Add appropriate class based on intensity
            if (antIntensity > 0.20) domElements.gameContent.classList.add('text-distortion-light');
            if (antIntensity > 0.45) domElements.gameContent.classList.add('text-distortion-medium');
            if (antIntensity > 0.70) domElements.gameContent.classList.add('text-distortion-heavy');
        }
        
        // Interactive ants - only proceed if antPool exists
        if (gameState.antPool && gameState.antPool.length > 0) {
            const maxAnts = Math.floor(antIntensity * gameState.antPool.length);
            const currentAnts = gameState.activeAnts || 0;
            
            // Add or remove ants gradually
            if (currentAnts < maxAnts) {
                const unusedAnts = gameState.antPool.filter(ant => ant.style.display === 'none');
                if (unusedAnts.length > 0) {
                    const ant = unusedAnts[0];
                    ant.style.top = `${Math.random() * 90}%`;
                    ant.style.left = `${Math.random() * 90}%`;
                    ant.style.transform = `rotate(${Math.random() * 360}deg)`;
                    ant.style.display = 'block';
                    gameState.activeAnts = (gameState.activeAnts || 0) + 1;
                }
            } else if (currentAnts > maxAnts) {
                const visibleAnts = gameState.antPool.filter(ant => ant.style.display !== 'none');
                if (visibleAnts.length > 0) {
                    visibleAnts[0].style.display = 'none';
                    gameState.activeAnts--;
                }
            }
            
            // Move existing ants randomly to create animation effect
            moveAnts();
        }
        
        // Schedule next update
        scheduleAntUpdate();
    } catch (error) {
        console.error("Error in ant visualization:", error);
        // Still schedule next update to recover from errors
        scheduleAntUpdate();
    }
}

// Move existing ants randomly
function moveAnts() {
    if (gameState.isGameOver) return;
    
    // Only get the ants that are currently visible
    const visibleAnts = gameState.antPool.filter(ant => ant.style.display !== 'none');
    
    visibleAnts.forEach(ant => {
        try {
            const currentTop = parseFloat(ant.style.top) || 0;
            const currentLeft = parseFloat(ant.style.left) || 0;
            
            // Calculate new positions with boundaries
            const newTop = Math.max(0, Math.min(95, currentTop + (Math.random() * 10) - 5));
            const newLeft = Math.max(0, Math.min(95, currentLeft + (Math.random() * 10) - 5));
            
            // Apply new positions
            ant.style.top = `${newTop}%`;
            ant.style.left = `${newLeft}%`;
        } catch (e) {
            // Silently ignore any errors with individual ants
        }
    });
}

// Legacy function for backward compatibility
function updateAntOverlay() {
    // Just call visualization to update the ants
    updateAntVisualization();
}

// ========================================================================
// CORE GAME MECHANICS
// ========================================================================

// Process stat interactions and check for game over
function processStatInteractions() {
    if (gameState.isGameOver) return;
    
    // Track streak of days with high stress
    if (gameState.stress > 70) {
        gameState.streaks.daysWithHighStress++;
    } else {
        gameState.streaks.daysWithHighStress = 0;
    }
    
    // Track streak of days with low joy
    if (gameState.joy < 30) {
        gameState.streaks.daysWithLowJoy++;
    } else {
        gameState.streaks.daysWithLowJoy = 0;
    }
    
    // Hunger effects are more severe the longer you go without eating
    if (gameState.fullness <= 20) {
        const hungerSeverity = 1 + (0.2 * Math.min(3, gameState.streaks.daysWithoutFood));
        updateStat('stress', (20 - gameState.fullness) / 10 * hungerSeverity);
        updateStat('joy', -(20 - gameState.fullness) / 8 * hungerSeverity);
    }
    
    // Stress impacts joy more severely when high for multiple days
    if (gameState.stress > 60) {
        const stressSeverity = 1 + (0.3 * Math.min(3, gameState.streaks.daysWithHighStress));
        updateStat('joy', -(gameState.stress - 60) / 20 * stressSeverity);
    }
    
    // Joy can slightly reduce stress when very high
    if (gameState.joy > 85 && gameState.stress > 10) {
        updateStat('stress', -0.3);
    }
    
    // Check for game over conditions
    checkGameOverConditions();
}

// Advance time by specified number of time slots with activity-based decay
function advanceTime(slots, activityType = 'idle') {
    if (gameState.isGameOver) return;
    
    gameState.time += slots;
    
    // If time passes midnight, advance to next day
    if (gameState.time >= 10) {
        gameState.time = 0;
        gameState.day += 1;
        
        // Check if week is over
        if (gameState.day > 4) {
            finishGame();
            return;
        }
        
        // New day updates
        startNewDay();
    }
    
    // Apply appropriate decay based on activity type
    const decay = DECAY_RATES[activityType] || DECAY_RATES.idle;
    updateStat('fullness', -decay.fullness * slots);
    updateStat('joy', -decay.joy * slots);
    updateStat('stress', decay.stress * slots);
    
    // Time-based events
    checkTimeBasedEvents();
    
    updateUI();
}

// Check for game over conditions
function checkGameOverConditions() {
    if (gameState.isGameOver) return false;
    
    // Add warnings at critical levels
    if (gameState.joy <= 15 && gameState.joy > 0) {
        // Add visual feedback for low joy - only if there isn't already a warning
        if (domElements.narrativeText && !document.querySelector('.joy-warning')) {
            const warningMsg = document.createElement('p');
            warningMsg.className = 'joy-warning warning-text';
            warningMsg.textContent = "You're feeling deeply depressed. The ants are closing in. Find some joy in your life soon!";
            domElements.narrativeText.appendChild(warningMsg);
        }
    }
    
    if (gameState.stress >= 85 && gameState.stress < 100) {
        // Add visual feedback for high stress - only if there isn't already a warning
        if (domElements.narrativeText && !document.querySelector('.stress-warning')) {
            const warningMsg = document.createElement('p');
            warningMsg.className = 'stress-warning warning-text';
            warningMsg.textContent = "Your stress level is dangerously high. Take some time to relax or you'll break down!";
            domElements.narrativeText.appendChild(warningMsg);
        }
    }
    
    // Game over conditions
    if (gameState.joy <= 0) {
        gameOver("You've completely lost your joy and will to continue. The ants have won, overwhelming your existence. You give up.");
        return true;
    }
    
    if (gameState.stress >= 100) {
        gameOver("The stress has become too much to bear. You've suffered a breakdown and can no longer continue.");
        return true;
    }
    
    // Add a super critical hunger state
    if (gameState.fullness <= 0) {
        gameState.fullness = 0;
        updateStat('stress', 2.0);
        updateStat('joy', -2.5);
        
        // Add visual feedback for critical hunger
        if (domElements.narrativeText && !document.querySelector('.critical-warning')) {
            const warningMsg = document.createElement('p');
            warningMsg.className = 'critical-warning';
            warningMsg.textContent = "You're starving! Find food immediately or you won't last much longer!";
            domElements.narrativeText.appendChild(warningMsg);
        }
        
        // If both stress is high and fullness is zero
        if (gameState.stress >= 85) {
            gameOver("Exhausted from hunger and overwhelmed by stress, you collapse. Remember to eat and manage your stress next time.");
            return true;
        }
    }
    
    return false;
}

// Events that might occur based on time
function checkTimeBasedEvents() {
    // Reset event flag at the start of each day
    if (gameState.time === 0) { 
        gameState.hadRandomEventToday = false;
        
        // Track days without food
        if (gameState.lastMealTime === -1 || 
            (gameState.day > 0 && gameState.lastMealTime < (gameState.day * 10))) {
            gameState.streaks.daysWithoutFood++;
        } else {
            gameState.streaks.daysWithoutFood = 0;
        }
    }
    
    // Only trigger random events if not already had one today
    if (!gameState.hadRandomEventToday) {
        // Base event chance increases throughout the day
        let eventChance = 0.15;
        
        // Increase chance if day is progressing
        if (gameState.time > 4) {
            eventChance = 0.20;
        }
        
        // If it's late, high chance
        if (gameState.time >= 8) {
            eventChance = 0.75;
        }
        
        // Stress increases event chances
        if (gameState.stress > 70) {
            eventChance += 0.1;
        }
        
        // Apply class modifier to event chance
        if (gameState.class) {
            eventChance *= CLASS_MODIFIERS[gameState.class].eventChance;
        }
        
        // Now check if event should trigger
        if (Math.random() < eventChance) {
            gameState.hadRandomEventToday = true;
            triggerRandomEvent();
        }
    }
    
    // Check for day-specific events
    if (gameState.day === 1 && gameState.time === 1 && !gameState.deadline) {
        // Tuesday morning - boss assigns impossible deadline
        gameState.deadline = 100; // Amount of work needed
    }
    
    // Wednesday family emergency (time = 4 is afternoon)
    if (gameState.day === 2 && gameState.time === 4 && !gameState.hasFamilyEmergency) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>Family Emergency</h2>
                <p>Your phone rings unexpectedly in the middle of the afternoon. It's a call from home.</p>
            `;
        }
        setTimeout(() => triggerFamilyEmergency(), 1000);
        return true; // Indicate we've handled this time slot
    }
    
    return false;
}

// Apply inflation to food prices
function inflateEconomy(percentage) {
    // Store before prices for comparison
    const beforePrices = {
        "Roadside meal": FOOD_OPTIONS.find(f => f.name === "Jollof rice").cost,
        "Restaurant meal": FOOD_OPTIONS.find(f => f.name === "Creamy pasta").cost,
        "Transport": 7500 // Uber base price
    };
    
    // Apply inflation
    for (let i = 0; i < FOOD_OPTIONS.length; i++) {
        FOOD_OPTIONS[i].cost = Math.round(FOOD_OPTIONS[i].cost * (1 + percentage / 100));
    }
    
    // Calculate after prices
    const afterPrices = {
        "Roadside meal": FOOD_OPTIONS.find(f => f.name === "Jollof rice").cost,
        "Restaurant meal": FOOD_OPTIONS.find(f => f.name === "Creamy pasta").cost,
        "Transport": Math.round(7500 * (1 + percentage / 100))
    };
    
    // Create an inflation report
    let inflationReport = `
        <div class="inflation-report">
            <h3>Economic Update: ${percentage}% Inflation</h3>
            <p>Prices have increased across Lagos:</p>
            <table class="price-table">
                <tr>
                    <th>Item</th>
                    <th>Before</th>
                    <th>After</th>
                    <th>Increase</th>
                </tr>
    `;
    
    // Add rows for each item
    for (const [item, before] of Object.entries(beforePrices)) {
        const after = afterPrices[item];
        const increase = after - before;
        
        inflationReport += `
            <tr>
                <td>${item}</td>
                <td>₦${before.toLocaleString()}</td>
                <td>₦${after.toLocaleString()}</td>
                <td>+₦${increase.toLocaleString()}</td>
            </tr>
        `;
    }
    
    inflationReport += `
            </table>
            <p class="warning-text">Your wallet feels lighter already. You'll need to be more careful with spending.</p>
        </div>
    `;
    
    // Display the report
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += inflationReport;
    }
}

// Schedule sickness to occur in 2 days
function scheduleSickness() {
    // Set sickness to occur 2 days later
    gameState.sicknessDay = gameState.day + 2;
    gameState.sicknessScheduled = true;
}

// Check for community support based on class
function checkForCommunitySupport() {
    if (!gameState.class) return false;
    
    const supportChance = CLASS_MODIFIERS[gameState.class].communitySupport;
    if (Math.random() < supportChance) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `
                <p>A neighbor stops by to offer help during your difficult time.
                They've brought some food and encouragement.</p>
            `;
        }
        updateStat('fullness', 25);
        updateStat('joy', 12);
        updateStat('stress', -8);
        return true;
    }
    return false;
}

// Random events
function triggerRandomEvent() {
    // Enhanced good events
    const goodEvents = [
        {
            name: "Help Crossing Road",
            description: "You help an elderly person cross the busy road. They thank you warmly and share some wisdom with you.",
            effects: { joy: 10, stress: -5, fullness: 0, money: 0 }
        },
        {
            name: "Free Meal",
            description: "A colleague buys lunch for everyone in the office today.",
            effects: { joy: 12, stress: -6, fullness: 30, money: 0 }
        },
        {
            name: "Unexpected Bonus",
            description: "Your boss gives you a small bonus for your recent work. Every naira helps in this economy.",
            effects: { joy: 15, stress: -10, fullness: 0, money: 20000 }
        },
        {
            name: "Good Weather",
            description: "The weather is unusually pleasant today, lifting everyone's spirits. A rare respite from Lagos heat.",
            effects: { joy: 12, stress: -12, fullness: 0, money: 0 }
        },
        {
            name: "Encouraging Message",
            description: "You receive an encouraging message from a friend right when you needed it most.",
            effects: { joy: 15, stress: -8, fullness: 0, money: 0 }
        },
        {
            name: "Found Discount",
            description: "You discover a special discount on everyday items at a local store.",
            effects: { joy: 8, stress: -5, fullness: 0, money: 5000 }
        },
        {
            name: "Generator Efficiency",
            description: "Your generator is running exceptionally well today, using less fuel than usual.",
            effects: { joy: 10, stress: -8, fullness: 0, money: 3000 }
        }
    ];
    
    // Enhanced bad events
    const badEvents = [
        {
            name: "Price Increase",
            description: "You notice that the price of your regular groceries has increased.",
            effects: { joy: -8, stress: 15, fullness: 0, money: -8000 }
        },
        {
            name: "Technology Failure",
            description: "Your laptop crashes, losing some of your work progress. Recovery will take precious time.",
            effects: { joy: -15, stress: 20, fullness: 0, money: 0 }
        },
        {
            name: "Work Pressure",
            description: "Your boss adds more tasks to your already heavy workload with an unreasonable deadline.",
            effects: { joy: -10, stress: 20, fullness: 0, money: 0 }
        },
        {
            name: "Minor Illness",
            description: "You come down with a mild fever and headache. It makes you miserable.",
            effects: { joy: -15, stress: 12, fullness: -10, money: -5000 }
        },
        {
            name: "Lost Item",
            description: "You realize you've lost your favorite pen. It was a gift.",
            effects: { joy: -10, stress: 8, fullness: 0, money: 0 }
        },
        {
            name: "Phone Problems",
            description: "Your phone is acting up and needs repairs soon.",
            effects: { joy: -12, stress: 15, fullness: 0, money: -35000 }
        },
        {
            name: "Burst Pipe",
            description: "A pipe has burst in your building, affecting your water supply.",
            effects: { joy: -15, stress: 18, fullness: -5, money: -10000 }
        },
        {
            name: "Bank Fees",
            description: "Your bank has charged unexpected fees for account maintenance.",
            effects: { joy: -8, stress: 10, fullness: 0, money: -4500 }
        }
    ];
    
    // Determine if event is good or bad with class-based probability
    let goodEventChance = 0.35;
    if (gameState.class) {
        goodEventChance = CLASS_MODIFIERS[gameState.class].goodEventChance;
    }
    
    // Stress and joy influence event chance
    if (gameState.stress > 70) goodEventChance -= 0.1;
    if (gameState.joy < 30) goodEventChance -= 0.1;
    
    const isGoodEvent = Math.random() < goodEventChance;
    const eventsList = isGoodEvent ? goodEvents : badEvents;
    
    // Select random event
    const selectedEvent = eventsList[Math.floor(Math.random() * eventsList.length)];
    
    // Apply event effects
    updateStat('joy', selectedEvent.effects.joy);
    updateStat('stress', selectedEvent.effects.stress);
    updateStat('fullness', selectedEvent.effects.fullness);
    updateStat('money', selectedEvent.effects.money);
    
    // Display event
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <div class="event-notification">
                <p><strong>${selectedEvent.name}:</strong> ${selectedEvent.description}</p>
            </div>
        `;
    }
    
    updateUI();
}

// Day state functions
function startNewDay() {
    // Check for overnight rain
    gameState.rainedYesterday = Math.random() < 0.20;
    
    // Reset some daily flags
    gameState.isWorking = false;
    gameState.hadRandomEventToday = false;
    
    // Check for sickness from roadside food
    if (gameState.sicknessScheduled && gameState.day === gameState.sicknessDay) {
        gameState.isSick = true;
        gameState.sicknessScheduled = false; // Reset so it doesn't trigger again
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>You're Sick!</h2>
                <p>The roadside food you ate earlier this week has made you ill. You're miserable.</p>
            `;
        }
        
        updateStat('joy', -20);
        updateStat('stress', 25);
        
        if (domElements.choicesContainer) {
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="restAtHome()">Rest at home</button>
                <button class="choice-btn" onclick="buyMedicine()">Buy medicine (₦10,000)</button>
            `;
        }
        
        return; // Skip normal morning routine
    }
    
    // Check for drug comedown
    if (gameState.drugComedownDay === gameState.day) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>The Morning After</h2>
                <p>You wake up feeling terrible from last night's indulgence. The comedown is rough.</p>
            `;
        }
        
        updateStat('joy', -30);
        updateStat('stress', 35);
        updateStat('fullness', -15);
        
        gameState.drugComedownDay = null;
    } else {
        // Day-specific events
        if (gameState.day === 1) {
            // Tuesday dawn
            startTuesday();
        } else if (gameState.day === 2) {
            // Wednesday dawn
            startWednesday();
        } else if (gameState.day === 3) {
            // Thursday dawn
            startThursday();
        } else if (gameState.day === 4) {
            // Friday dawn
            startFriday();
        }
    }
}

// Day-specific functions
function startTuesday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Tuesday Morning</h2>
            <p>You wake up to the sound of your alarm.</p>
            <p>You check your phone and see reports of further inflation. Prices have risen overnight.</p>
        `;
    }
    
    // Tuesday's inflation effect
    inflateEconomy(15);
    
    showMorningOptions();
}

function startWednesday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Wednesday Morning</h2>
            <p>You wake up on the third day of your work week. The city seems particularly busy today.</p>
            <p>Traffic reports indicate there will be major congestion on all routes.</p>
        `;
    }
    
    showMorningOptions();
}

function startThursday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Thursday Morning</h2>
            <p>You wake up feeling the weight of the week so far.</p>
            <p>You check your phone and see reports of even more inflation. Prices continue to rise dramatically.</p>
        `;
    }
    
    // Thursday's inflation effect
    inflateEconomy(20);
    
    // Check deadline status
    if (gameState.deadline > 0) {
        const progressPercent = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You're ${progressPercent}% done with your deadline project. Friday is coming soon.</p>`;
        }
        
        if (progressPercent < 50) {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>You're significantly behind schedule. Your stress increases as you think about tomorrow's deadline.</p>`;
            }
            
            updateStat('stress', 15);
        }
    }
    
    showMorningOptions();
}

function startFriday() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Friday Morning</h2>
            <p>It's the final workday of the week. You've almost made it.</p>
            <p>The economic situation continues to worsen. Prices have increased yet again.</p>
        `;
    }
    
    // Friday's inflation effect
    inflateEconomy(25);
    
    // Check deadline status
    if (gameState.deadline > 0) {
        const progressPercent = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Today is the deadline for your project, and you're ${progressPercent}% complete.</p>`;
        }
        
        if (progressPercent < 85) {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>You're not going to make the deadline without even more stress! You feel sick at the thought.</p>`;
            }
            
            updateStat('stress', 25);
        } else {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>You're on track to complete the project today, though it will still require focus.</p>`;
            }
            
            updateStat('stress', 10);
        }
    }
    
    showMorningOptions();
}

// Wednesday's family emergency
function triggerFamilyEmergency() {
    gameState.hasFamilyEmergency = true;
    
    // Severity depends on dice roll
    const severity = Math.random();
    let emergencyDesc = "";
    let moneyNeeded = 0;
    
    if (severity < 0.3) {
        // Minor emergency
        emergencyDesc = "Your family member has fallen ill with a mild condition.";
        moneyNeeded = 40000;
    } else if (severity < 0.7) {
        // Moderate emergency
        emergencyDesc = "Your family member has been in a minor accident and needs medical attention.";
        moneyNeeded = 90000;
    } else {
        // Severe emergency
        emergencyDesc = "Your family member has been hospitalized with a serious condition.";
        moneyNeeded = 180000;
    }
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `
            <p>It's a family emergency. ${emergencyDesc}</p>
        `;
    }
    
    // Check for community support before showing options
    if (checkForCommunitySupport()) {
        // If community support happens, reduce the money needed
        moneyNeeded = Math.round(moneyNeeded * 0.7);
    }
    
    // Money needed depends on class
    if (gameState.class === 'working') {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>They need financial help for medical expenses: ₦${moneyNeeded.toLocaleString()}.</p>`;
        }
        
        if (domElements.choicesContainer) {
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="sendMoney(${moneyNeeded})">Send money (₦${moneyNeeded.toLocaleString()})</button>
                <button class="choice-btn" onclick="explainNoMoney()">Explain you can't afford it</button>
            `;
        }
    } else if (gameState.class === 'middle') {
        // 50% chance middle class needs to send money
        const needToSend = Math.random() < 0.5;
        if (needToSend) {
            const middleClassAmount = Math.round(moneyNeeded / 2);
            
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>They could use some financial assistance: ₦${middleClassAmount.toLocaleString()}.</p>`;
            }
            
            if (domElements.choicesContainer) {
                domElements.choicesContainer.innerHTML = `
                    <button class="choice-btn" onclick="sendMoney(${middleClassAmount})">Send money (₦${middleClassAmount.toLocaleString()})</button>
                    <button class="choice-btn" onclick="explainNoMoney()">Explain you can't afford it</button>
                `;
            }
        } else {
            if (domElements.narrativeText) {
                domElements.narrativeText.innerHTML += `<p>Fortunately, they have insurance that covers the expenses.</p>`;
            }
            
            updateStat('stress', 15);
            showMorningOptions();
        }
    } else { // Upper class
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Fortunately, they have good insurance and savings to cover the expenses.</p>`;
        }
        
        updateStat('stress', 10);
        showMorningOptions();
    }
}

// Game ending functions
function gameOver(reason) {
    // Set game over state
    gameState.isGameOver = true;
    
    // Clear any existing timers
    clearAntUpdateTimer();
    
    // Clear all setTimeout timers
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
        clearTimeout(i);
    }
    
    // Pause all animations
    document.body.classList.add('transition-pause');
    
    // Clear all ants
    try {
        const allAnts = document.querySelectorAll('.ant, .interactive-ant');
        allAnts.forEach(ant => {
            if (ant && ant.parentNode) {
                ant.remove();
            }
        });
    } catch (e) {
        console.error("Error removing ants:", e);
    }
    
    // Clear the game containers
    if (domElements.narrativeText) domElements.narrativeText.innerHTML = '';
    if (domElements.choicesContainer) domElements.choicesContainer.innerHTML = '';
    
    // Create dedicated game over screen
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Game Over</h2>
            <p>${reason}</p>
            <p>Your week in Lagos has come to an early end.</p>
            
            <h3>Final Statistics:</h3>
            <p>Day Reached: ${DAYS[gameState.day]}</p>
            <p>Joy: ${Math.round(gameState.joy)}/100</p>
            <p>Fullness: ${Math.round(gameState.fullness)}/100</p>
            <p>Stress: ${Math.round(gameState.stress)}/100</p>
            <p>Money Remaining: ₦${gameState.money.toLocaleString()}</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="location.reload()">Start Over</button>
            <a href="https://pagebookstore.com/products/how-to-get-rid-of-ants" class="preorder-btn" target="_blank">Pre-order "How to Get Rid of Ants"</a>
        `;
    }
    
    // Add a CSS class to create a distinct game over appearance
    if (domElements.gameContent) {
        domElements.gameContent.classList.add('game-over');
    }
    
    // Remove text distortion classes
    if (domElements.gameContent) {
        domElements.gameContent.classList.remove(
            'text-distortion-light',
            'text-distortion-medium', 
            'text-distortion-heavy'
        );
    }
}

// Complete game ending
function finishGame() {
    // Set game over state to prevent further updates
    gameState.isGameOver = true;
    
    // Determine ending type based on final stats
    let endingType = "";
    let endingDescription = "";
    
    if (gameState.joy <= 10) {
        endingType = "Giving Up";
        endingDescription = "The constant struggles of Lagos life have completely drained your joy. You've surrendered to despair, as the ants spread across your psyche.";
    } else if (gameState.stress >= 90) {
        endingType = "Breaking Point";
        endingDescription = "The pressure became too much. In a moment of clarity disguised as madness, you've decided to make a dramatic change in your life path.";
    } else if (gameState.joy < 30 || gameState.fullness < 30 || gameState.stress > 70) {
        endingType = "Survival";
        endingDescription = "You've made it through the week, but at great cost to your wellbeing.";
    } else if (gameState.joy >= 50 && gameState.fullness >= 50 && gameState.stress <= 50) {
        endingType = "Balance";
        endingDescription = "Despite the challenges, you've managed to find a sustainable balance. It's not easy, but you're making it work.";
    } else {
        endingType = "Triumph";
        endingDescription = "Against all odds, you've not only survived but found ways to thrive in Lagos. Your resilience has paid off, and you face the future with something resembling hope.";
    }
    
    // Check deadline completion
    let deadlineResult = "";
    if (gameState.deadline > 0) {
        const progressPercent = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        
        if (progressPercent >= 100) {
            deadlineResult = "You successfully completed your impossible work deadline, earning your boss's reluctant approval.";
        } else if (progressPercent >= 80) {
            deadlineResult = "You made substantial progress on your work deadline, enough to avoid the worst consequences.";
        } else {
            deadlineResult = "You failed to meet your impossible work deadline, which will have repercussions in the coming weeks.";
        }
    }
    
    // Clear any existing timers and clean up
    clearAntUpdateTimer();
    
    // Pause all animations
    document.body.classList.add('transition-pause');
    
    // Final stats
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>The Week Ends: ${endingType}</h2>
            <p>${endingDescription}</p>
            <p>${deadlineResult}</p>
            <h3>Final Statistics:</h3>
            <p>Joy: ${Math.round(gameState.joy)}/100</p>
            <p>Fullness: ${Math.round(gameState.fullness)}/100</p>
            <p>Stress: ${Math.round(gameState.stress)}/100</p>
            <p>Money Remaining: ₦${gameState.money.toLocaleString()}</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="location.reload()">Play Again</button>
            <a href="https://pagebookstore.com/products/how-to-get-rid-of-ants" class="preorder-btn" target="_blank">Pre-order "How to Get Rid of Ants"</a>
        `;
    }
    
    // Clear ant system
    clearAntSystem();
    
    // Remove text distortion classes
    if (domElements.gameContent) {
        domElements.gameContent.classList.remove(
            'text-distortion-light',
            'text-distortion-medium', 
            'text-distortion-heavy'
        );
    }
}

// ========================================================================
// CHARACTER CREATION FUNCTIONS
// ========================================================================

// Show character creation screen
function showCharacterCreation() {
    if (!domElements.narrativeText || !domElements.choicesContainer) {
        console.error("Required DOM elements not found for character creation");
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Welcome to Lagos</h2>
        <p>Can you survive one work week?</p>
        <p>Each decision will affect your journey and test your limits!</p>
    `;
    
    domElements.choicesContainer.innerHTML = `
        <h3>Enter your name:</h3>
        <input type="text" id="player-name" placeholder="Your name" class="name-input">
        <button class="choice-btn" onclick="setPlayerName()">Continue</button>
    `;
}

// Set player name and show job selection
function setPlayerName() {
    const nameInput = document.getElementById('player-name');
    let playerName = nameInput ? nameInput.value.trim() : '';
    
    // Default name if empty
    if (!playerName) {
        playerName = "Traveler";
    }
    
    // Store name in game state
    gameState.playerName = playerName;
    
    // Show job selection
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Choose Your Career</h2>
            <p>${playerName}, what is your job in Lagos?</p>
            <p>Choose carefully - different careers offer different challenges and opportunities.</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="selectJob('marketer')">Marketer</button>
            <button class="choice-btn" onclick="selectJob('programmer')">Programmer</button>
            <button class="choice-btn" onclick="selectJob('designer')">Graphic Designer</button>
            <button class="choice-btn" onclick="selectJob('artist')">Artist</button>
        `;
    }
}

// Select job function - now sets up everything automatically
function selectJob(job) {
    gameState.job = job;
    
    // Set initial stats based on job
    switch(job) {
        case 'marketer':
            gameState.money = 80000;
            gameState.stress = 30;
            gameState.joy = 70;
            break;
        case 'programmer':
            gameState.money = 130000;
            gameState.stress = 50;
            gameState.joy = 60;
            break;
        case 'designer':
            gameState.money = 95000;
            gameState.stress = 35;
            gameState.joy = 75;
            break;
        case 'artist':
            gameState.money = 40000;
            gameState.stress = 20;
            gameState.joy = 90;
            break;
    }
    
    updateUI();
    
    // Automatically assign a social class (without telling the player directly)
    assignRandomClass();
}

// Automatically assign social class
function assignRandomClass() {
    // Array of possible classes
    const classes = ['working', 'middle', 'upper'];
    
    // Randomly select a class
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    gameState.class = randomClass;
    
    // Adjust money based on class
    const classMultiplier = {
        'working': 0.7,
        'middle': 1.0,
        'upper': 1.5
    };
    
    gameState.money = Math.round(gameState.money * classMultiplier[randomClass]);
    
    if (randomClass === 'upper') {
        updateStat('stress', 10);
    } else if (randomClass === 'working') {
        updateStat('joy', 5);
    }
    
    updateUI();
    
    // Continue to automatic age assignment
    assignRandomAge();
}

// Automatically assign age
function assignRandomAge() {
    // Array of possible ages
    const ages = [22, 27, 31];
    
    // Randomly select an age
    const randomAge = ages[Math.floor(Math.random() * ages.length)];
    gameState.age = randomAge;
    
    // Adjust money based on age
    let ageMultiplier = 1.0;
    
    if (randomAge === 27) {
        ageMultiplier = 1.4;
        if (gameState.class === 'middle' || gameState.class === 'upper') {
            gameState.hasTransportation = true;
        }
    } else if (randomAge === 31) {
        ageMultiplier = 1.7;
        if (gameState.class === 'middle' || gameState.class === 'upper') {
            gameState.hasTransportation = true;
        }
    }
    
    gameState.money = Math.round(gameState.money * ageMultiplier);
    
    updateUI();
    
    // Continue to automatic location assignment
    assignRandomLocation();
}

// Automatically assign location based on class
function assignRandomLocation() {
    const locations = [];
    
    if (gameState.class === 'working') {
        locations.push({ name: 'Oshodi', area: 'Lagos Mainland' });
        locations.push({ name: 'Magodo', area: 'Lagos Mainland' });
    } else if (gameState.class === 'middle') {
        locations.push({ name: 'Surulere', area: 'Lagos Mainland' });
        locations.push({ name: 'Ikeja', area: 'Lagos Mainland' });
    } else if (gameState.class === 'upper') {
        locations.push({ name: 'Victoria Island', area: 'Lagos Island' });
        locations.push({ name: 'Lekki', area: 'Lagos Island' });
    }
    
    // Randomly select a location based on the class
    const randomIndex = Math.floor(Math.random() * locations.length);
    const selectedLocation = locations[randomIndex];
    
    // Store location in game state
    gameState.location = selectedLocation;
    
    updateUI();
    
    // Show character summary
    showCharacterSummary();
}

// Show character summary with all the auto-generated details
function showCharacterSummary() {
    const companyName = generateCompanyName(gameState.job);
    gameState.companyName = companyName;
    
    // Format job title
    let jobTitle;
    switch(gameState.job) {
        case 'marketer':
            jobTitle = "Marketing Specialist";
            break;
        case 'programmer':
            jobTitle = "Software Developer";
            break;
        case 'designer':
            jobTitle = "Graphic Designer";
            break;
        case 'artist':
            jobTitle = "Visual Artist";
            break;
        default:
            jobTitle = gameState.job.charAt(0).toUpperCase() + gameState.job.slice(1);
    }
    
    // Create summary of player stats and situation
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Your Life in Lagos</h2>
            <p>Welcome ${gameState.playerName}. You are a ${jobTitle} working at ${companyName}.</p>
            <p>You are ${gameState.age} years old and live in ${gameState.location.name}, ${gameState.location.area}.</p>
            
            <h3>Your Current Situation:</h3>
            <p>Bank Account: ₦${gameState.money.toLocaleString()}</p>
            <p>Joy Level: ${gameState.joy}% - ${gameState.joy > 70 ? "You're generally happy" : gameState.joy > 40 ? "You're content" : "You're struggling emotionally"}</p>
            <p>Stress Level: ${gameState.stress}% - ${gameState.stress < 30 ? "You're relaxed" : gameState.stress < 60 ? "You're managing" : "You're quite stressed"}</p>
            <p>Fullness: ${gameState.fullness}% - ${gameState.fullness > 70 ? "You're well-fed" : gameState.fullness > 40 ? "You could use a meal soon" : "You're hungry"}</p>
            ${gameState.hasTransportation ? "<p>You own a car for transportation.</p>" : "<p>You rely on public transportation or walking.</p>"}
            
            <p class="warning-text">The week ahead will test your ability to balance work, wellbeing, and finances. Good luck!</p>
        `;
    }
    
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="startGame()">Begin Your Week</button>
        `;
    }
}

// ========================================================================
// MORNING ACTIVITIES
// ========================================================================

// Start the game proper
function startGame() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML = `
            <h2>Monday Morning</h2>
            <p>You wake up in your home in ${gameState.location.name}. It's the start of another workweek in Lagos.</p>
            <p>Grumbling generators and ever present horns in traffic remind you that the city never truly sleeps.</p>
            <p>You check your phone: it's 6:00 AM. Time to start your day.</p>
        `;
    }
    
    showMorningOptions();
}

// Show morning options
function showMorningOptions() {
    if (domElements.choicesContainer) {
        domElements.choicesContainer.innerHTML = `
            <h3>What would you like to do first?</h3>
            <button class="choice-btn" onclick="prepareForWork()">Prepare for work</button>
            <button class="choice-btn" onclick="checkPhone()">Check your phone</button>
            <button class="choice-btn" onclick="goBackToSleep()">Try to get more sleep</button>
        `;
    }
}

// Function for morning activities
function prepareForWork() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You get ready for the day ahead...</p>`;
    }
    
    updateStat('fullness', -7);
    updateUI();
    showTransportationOptions();
}

function checkPhone() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You check your phone for messages and news...</p>`;
    }
    
    // Random news event
    const newsEvents = [
        "The price of fuel has increased again. People are complaining on social media.",
        "There's a traffic alert for your route to work. Might be best to leave early.",
        "Rema released a new song overnight to rave reviews.",
        "Your local DISCO announced more scheduled outages this week.",
        "The naira has fallen again against the dollar. Prices may rise soon.",
        "Your bank has sent a notification about new transaction fees.",
        "A friend posted photos from a party you missed last weekend.",
        "Your electricity provider has increased tariffs starting today."
    ];
    
    const randomNews = newsEvents[Math.floor(Math.random() * newsEvents.length)];
    
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>Breaking news: ${randomNews}</p>`;
    }
    
    // Social media can cause slight mood changes
    if (Math.random() < 0.4) {
        updateStat('joy', -2);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>Scrolling through social media leaves you feeling a bit down.</p>`;
        }
    } else {
        updateStat('joy', 2);
        
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML += `<p>You see a funny post that makes you smile.</p>`;
        }
    }
    
    setTimeout(() => prepareForWork(), 1500);
}

function goBackToSleep() {
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You decide to sleep a bit more...</p>`;
    }
    
    updateStat('joy', 3);
    updateStat('stress', -2);
    
    // Move time forward
    advanceTime(1, 'sleep');
    
    // Now you're running late
    if (domElements.narrativeText) {
        domElements.narrativeText.innerHTML += `<p>You've overslept! It's now 8:00 AM and you need to hurry.</p>`;
    }
    
    updateStat('stress', 15);
    updateUI();
    showTransportationOptions();
}

// ========================================================================
// TRANSPORTATION FUNCTIONS
// ========================================================================

// Show transportation options
function showTransportationOptions() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>You need to get to work. How will you travel today?</p>`;
    
    let transportHTML = '<h3>Choose your transportation:</h3>';
    
    if (gameState.hasTransportation) {
        const fuelCost = modifyCost(2000);
        transportHTML += `<button class="choice-btn" onclick="useCar()">Drive your car (₦${fuelCost.toLocaleString()} for fuel)</button>`;
    }
    
    const uberCost = modifyCost(7500);
    const busCost = modifyCost(2000);
    
    transportHTML += `
        <button class="choice-btn" onclick="useUber()">Take an Uber (₦${uberCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="takeBus()">Take a bus (₦${busCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="walkToWork()">Walk (free)</button>
    `;
    
    domElements.choicesContainer.innerHTML = transportHTML;
}

// Transportation functions
function useCar() {
    if (!domElements.narrativeText) return;
    
    const fuelCost = modifyCost(2000);
    
    if (gameState.money < fuelCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for fuel.</p>`;
        showTransportationOptions();
        return;
    }
    
    domElements.narrativeText.innerHTML = `<p>You get into your car and start your commute...</p>`;
    updateStat('money', -fuelCost);
    
    // Check for traffic
    const isTraffic = Math.random() < 0.5;
    if (isTraffic) {
        domElements.narrativeText.innerHTML += `<p>Unfortunately, there's heavy traffic today.</p>`;
        updateStat('stress', 15);
        advanceTime(1.5, 'idle'); // Extra time in traffic
    } else {
        advanceTime(1, 'idle'); // Normal commute time
    }
    
    checkForPolice();
}

function useUber() {
    if (!domElements.narrativeText) return;
    
    const uberCost = modifyCost(7500);
    
    if (gameState.money < uberCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for an Uber.</p>`;
        showTransportationOptions();
        return;
    }
    
    domElements.narrativeText.innerHTML = `<p>You call an Uber and wait for it to arrive...</p>`;
    updateStat('money', -uberCost);
    
    // Check for surge pricing
    const isSurge = Math.random() < 0.4;
    if (isSurge) {
        const surgeCost = modifyCost(18000);
        if (gameState.money >= surgeCost) {
            updateStat('money', -surgeCost);
            updateStat('stress', 10);
            domElements.narrativeText.innerHTML += `<p>Unfortunately, it's surge pricing! You're charged an additional ₦${surgeCost.toLocaleString()}.</p>`;
        } else {
            domElements.narrativeText.innerHTML += `<p>It's surge pricing and you can't afford the additional ₦${surgeCost.toLocaleString()}. The driver cancels.</p>`;
            showTransportationOptions();
            return;
        }
    }
    
    checkForPolice();
}

function takeBus() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    const busCost = modifyCost(2000);
    
    if (gameState.money < busCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for the bus fare.</p>`;
        showTransportationOptions();
        return;
    }
    
    domElements.narrativeText.innerHTML = `<p>You head to the bus stop and wait for a bus...</p>`;
    updateStat('money', -busCost);
    
    // Check for random events
    const oneChanceBus = Math.random() < 0.1;
    if (oneChanceBus) {
        gameOver("You unfortunately entered 'one-chance'. Your journey ends here.");
        return;
    }
    
    const foundMoney = Math.random() < 0.4;
    if (foundMoney) {
        const foundAmount = 9000;
        domElements.narrativeText.innerHTML += `<p>While waiting, you notice some money on the ground! It's ₦${foundAmount.toLocaleString()}!</p>`;
        
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="pickUpMoney()">Pick up the money</button>
            <button class="choice-btn" onclick="ignoreFoundMoney()">Ignore it</button>
        `;
        return;
    }
    
    // Chances of altercation on the bus
    const hasAltercation = Math.random() < 0.2;
    if (hasAltercation) {
        domElements.narrativeText.innerHTML += `
            <p>On the bus, an argument breaks out between the conductor and another passenger over change.</p>
            <p>The situation is becoming heated...</p>
        `;
        
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="mediateArgument()">Try to mediate</button>
            <button class="choice-btn" onclick="ignoreArgument()">Mind your own business</button>
        `;
        return;
    }
    
    arriveAtWork();
}

function mediateArgument() {
    if (!domElements.narrativeText) return;
    
    const isSuccessful = Math.random() < 0.6;
    
    if (isSuccessful) {
        domElements.narrativeText.innerHTML += `<p>You calmly help resolve the situation. Both parties appreciate your intervention.</p>`;
        updateStat('joy', 10);
    } else {
        domElements.narrativeText.innerHTML += `<p>Your attempt to help only makes things worse. The conductor slaps you and asks what gives you the right to play mediator. You no be Jesus, so mind your business.</p>`;
        updateStat('stress', 15);
        updateStat('joy', -10);
    }
    
    setTimeout(() => arriveAtWork(), 1500);
}

function ignoreArgument() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `<p>You decide not to get involved. The argument eventually dies down on its own.</p>`;
    setTimeout(() => arriveAtWork(), 1500);
}

function pickUpMoney() {
    if (!domElements.narrativeText) return;
    
    const foundAmount = 9000;
    const turnIntoYam = Math.random() < 0.6;
    if (turnIntoYam) {
        gameOver("As you pick up the money, you suddenly feel a strange sensation. You are now a tuber of yam. Your adventure ends here as you realize some money is not meant to be picked up.");
        return;
    }
    
    updateStat('money', foundAmount);
    updateStat('joy', 10);
    domElements.narrativeText.innerHTML = `<p>You pick up the money and put it in your pocket. Nice!</p>`;
    
    setTimeout(() => arriveAtWork(), 1500);
}

function ignoreFoundMoney() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `<p>You decide not to take the money. It could be a trap or belong to someone who really needs it.</p>`;
    updateStat('joy', 5); // Small joy boost for doing the "right thing"
    
    setTimeout(() => arriveAtWork(), 1500);
}

function walkToWork() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `<p>You decide to walk to work to save money...</p>`;
    
    updateStat('fullness', -15);
    updateStat('stress', 10);
    updateStat('joy', -5);
    
    // Check if it rained last night
    if (gameState.rainedYesterday) {
        domElements.narrativeText.innerHTML += `<p>It rained last night, making the walk more difficult.</p>`;
        updateStat('joy', -5);
        
        // Check if you get splashed by a car
        const getSplashed = Math.random() < 0.9;
        if (getSplashed) {
            domElements.narrativeText.innerHTML += `<p>As you're walking, a car speeds through a puddle, completely soaking you!</p>`;
            updateStat('joy', -10);
            updateStat('stress', 15);
        }
    }
    
    // Check for robbery
    const getRobbed = Math.random() < 0.2;
    if (getRobbed) {
        domElements.narrativeText.innerHTML += `<p>Suddenly, you're confronted by thieves demanding your money and phone!</p>`;
        
        // Take most but not all money
        const stolenAmount = Math.round(gameState.money * 0.85);
        updateStat('money', -stolenAmount);
        updateStat('joy', -25);
        updateStat('stress', 30);
        
        // Check for deadly outcome
        const getKilled = Math.random() < 0.08;
        if (getKilled) {
            gameOver("The thieves become violent. Unfortunately, you don't survive the encounter. Your journey ends here.");
            return;
        }
        
        domElements.narrativeText.innerHTML += `<p>They take most of your money and leave you shaken but alive.</p>`;
    }
    
    advanceTime(1, 'physical');
    setTimeout(() => arriveAtWork(), 1500);
}

function checkForPolice() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    // 40% chance of being stopped by police
    const stoppedByPolice = Math.random() < 0.4;
    
    if (stoppedByPolice) {
        domElements.narrativeText.innerHTML += `<p>You're stopped by police at a checkpoint...</p>`;
        
        // 50% chance they ask for a bribe
        const askForBribe = Math.random() < 0.5;
        
        if (askForBribe) {
            const bribeCost = modifyCost(9000);
            domElements.narrativeText.innerHTML += `<p>The officer claims there's an issue with your papers and suggests a "settlement" of ₦${bribeCost.toLocaleString()}.</p>`;
            
            domElements.choicesContainer.innerHTML = `
                <button class="choice-btn" onclick="payBribe(${bribeCost})">Pay the bribe (₦${bribeCost.toLocaleString()})</button>
                <button class="choice-btn" onclick="refuseBribe()">Refuse to pay</button>
            `;
            return;
        } else {
            domElements.narrativeText.innerHTML += `<p>After checking your papers, the officer lets you go.</p>`;
            setTimeout(() => arriveAtWork(), 1500);
        }
    } else {
        setTimeout(() => arriveAtWork(), 1500);
    }
}

function payBribe(amount) {
    if (!domElements.narrativeText) return;
    
    if (gameState.money < amount) {
        // Can't afford the bribe
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for the bribe.</p>`;
        refuseBribe();
        return;
    }
    
    updateStat('money', -amount);
    updateStat('stress', 12);
    updateStat('joy', -8);
    
    domElements.narrativeText.innerHTML += `<p>You reluctantly pay the bribe and are allowed to continue on your way.</p>`;
    
    updateUI();
    setTimeout(() => arriveAtWork(), 1500);
}

function refuseBribe() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `<p>You refuse to pay the bribe, insisting you've done nothing wrong.</p>`;
    
    // 30% chance of being detained
    const getDetained = Math.random() < 0.3;
    
    if (getDetained) {
        gameOver("The officer becomes angry and detains you. You spend the rest of the day at the police station, missing work. Your boss fires you for not showing up. Game over.");
        return;
    }
    
    domElements.narrativeText.innerHTML += `<p>After a tense standoff, the officer lets you go, but not before confiscating some of the money in your wallet.</p>`;
    
    // Take a portion of money, not all
    const confiscatedAmount = Math.min(gameState.money, 12000);
    updateStat('money', -confiscatedAmount);
    updateStat('stress', 25);
    
    updateUI();
    setTimeout(() => arriveAtWork(), 1500);
}

function arriveAtWork() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    advanceTime(1, 'idle'); // 2 hours for commute
    
    // Random event: key holder not at work
    const keyHolderMissing = Math.random() < 0.2;
    
    if (keyHolderMissing) {
        domElements.narrativeText.innerHTML = `
            <h2>Arrival at Work</h2>
            <p>You arrive at work, but the person with the key isn't there yet! Everyone is waiting outside.</p>
        `;
        
        updateStat('stress', 10);
        
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="waitForKey()">Wait patiently</button>
            <button class="choice-btn" onclick="callKeyHolder()">Call the key holder</button>
            <button class="choice-btn" onclick="goGetBreakfast()">Go get breakfast while waiting</button>
        `;
    } else {
        domElements.narrativeText.innerHTML = `
            <h2>Arrival at Work</h2>
            <p>You arrive at work and settle in for the day.</p>
        `;
        
        startWorkDay();
    }
}

// Key holder missing options
function waitForKey() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `<p>You decide to wait patiently. After an hour, the key holder finally arrives.</p>`;
    updateStat('stress', 5);
    updateStat('fullness', -5);
    advanceTime(0.5, 'idle'); // Half a time slot (1 hour)
    
    startWorkDay();
}

function callKeyHolder() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `<p>You call the key holder, who apologizes and says they're stuck in traffic but will be there soon.</p>`;
    
    // 50% chance they come quickly due to your call
    const comeQuickly = Math.random() < 0.5;
    
    if (comeQuickly) {
        domElements.narrativeText.innerHTML += `<p>Your call seems to have motivated them - they arrive just 30 minutes later.</p>`;
        advanceTime(0.25, 'idle'); // Quarter of a time slot
    } else {
        domElements.narrativeText.innerHTML += `<p>Despite your call, they still take over an hour to arrive.</p>`;
        advanceTime(0.5, 'idle'); // Half a time slot
        updateStat('stress', 8);
    }
    
    startWorkDay();
}

function goGetBreakfast() {
    if (!domElements.narrativeText) return;
    
    const breakfastCost = modifyCost(4000);
    
    if (gameState.money < breakfastCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for breakfast.</p>`;
        waitForKey();
        return;
    }
    
    domElements.narrativeText.innerHTML += `<p>You decide to make use of the time by getting breakfast at a nearby food vendor.</p>`;
    
    updateStat('money', -breakfastCost);
    updateStat('fullness', 30);
    updateStat('joy', 5);
    gameState.lastMealTime = gameState.time;
    
    // Check for roadside food vendor availability
    const vendorAvailable = Math.random() > 0.17; // 17% chance the vendor isn't there
    
    if (!vendorAvailable) {
        domElements.narrativeText.innerHTML += `<p>Unfortunately, the usual food vendor isn't there today. You have to find another place to eat, which takes more time.</p>`;
        advanceTime(0.75, 'idle');
    } else {
        // Schedule possible sickness (60% chance of getting sick in 2 days)
        if (Math.random() < 0.6) {
            scheduleSickness();
        }
        
        // Give extra food if from roadside (good thing)
        const getExtraFood = Math.random() < 0.5;
        if (getExtraFood) {
            domElements.narrativeText.innerHTML += `<p>The food vendor gives you extra! "For my loyal customer," she says with a smile.</p>`;
            updateStat('fullness', 10);
            updateStat('joy', 5);
        }
        
        advanceTime(0.5, 'idle');
    }
    
    const keyHolderArrives = Math.random() < 0.5;
    
    if (keyHolderArrives) {
        domElements.narrativeText.innerHTML += `<p>When you return, you find that the key holder has arrived and everyone is already inside.</p>`;
    } else {
        domElements.narrativeText.innerHTML += `<p>You return just as the key holder arrives. Perfect timing!</p>`;
    }
    
    startWorkDay();
}

// ========================================================================
// WORK DAY FUNCTIONS
// ========================================================================

// Work day
function startWorkDay() {
    if (!domElements.narrativeText) return;
    
    gameState.isWorking = true;
    gameState.workdayStage = 1; // Start with morning tasks
    
    // Tuesday always gets an impossible deadline
    if (gameState.day === 1 && gameState.time <= 2) {
        domElements.narrativeText.innerHTML = `
            <h2>Tuesday Work Challenge</h2>
            <p>Your boss calls you into their office and assigns you an almost impossible project due Friday.</p>
            <p>"I need this finished by Friday or there will be consequences," they say firmly.</p>
        `;
        
        updateStat('stress', 25);
        gameState.deadline = 100; // Amount of work needed
    } else {
        domElements.narrativeText.innerHTML = `
            <h2>At Work</h2>
            <p>You settle in at your desk and check your tasks for the day.</p>
        `;
        
        // Random chance of boss suggesting promotion (good thing)
        const promotionHint = Math.random() < 0.04;
        if (promotionHint) {
            domElements.narrativeText.innerHTML += `<p>Your boss stops by your desk. "Keep up the good work," they say. "We'll be discussing promotions soon, and I've been impressed with your performance."</p>`;
            updateStat('joy', 15);
            updateStat('stress', -8);
        }
    }
    
    showWorkStageOptions();
}

// Show work options based on workday stage
function showWorkStageOptions() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    let stageText;
    let timeAdvance;
    
    switch(gameState.workdayStage) {
        case 1: // Morning
            stageText = "Morning Tasks (8:00 AM - 12:00 PM)";
            timeAdvance = 2; // 4 hours
            break;
        case 2: // Midday
            stageText = "Midday Tasks (12:00 PM - 2:00 PM)";
            timeAdvance = 1; // 2 hours
            break;
        case 3: // Afternoon
            stageText = "Afternoon Tasks (2:00 PM - 5:00 PM)";
            timeAdvance = 1.5; // 3 hours
            break;
        default:
            // Fallback for any unexpected stages
            stageText = "Work Tasks";
            timeAdvance = 1.5;
            gameState.workdayStage = 1; // Reset to morning
            break;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Work Day: ${stageText}</h2>
        <p>Select how you want to use this part of your workday:</p>
    `;
    
    // Different options based on job
    let workHTML = '<h3>How will you approach this work period?</h3>';
    
    switch(gameState.job) {
        case 'marketer':
            workHTML += `
                <button class="choice-btn" onclick="doWorkTask('client')">Visit potential clients</button>
                <button class="choice-btn" onclick="doWorkTask('pitch')">Work on pitch materials</button>
                <button class="choice-btn" onclick="doWorkTask('research')">Research market trends</button>
            `;
            break;
        case 'programmer':
            workHTML += `
                <button class="choice-btn" onclick="doWorkTask('debug')">Debug code issues</button>
                <button class="choice-btn" onclick="doWorkTask('feature')">Implement new features</button>
                <button class="choice-btn" onclick="doWorkTask('optimize')">Optimize existing code</button>
            `;
            break;
        case 'designer':
            workHTML += `
                <button class="choice-btn" onclick="doWorkTask('create')">Create new designs</button>
                <button class="choice-btn" onclick="doWorkTask('revise')">Revise client work</button>
                <button class="choice-btn" onclick="doWorkTask('mockup')">Develop mockups</button>
            `;
            break;
        case 'artist':
            workHTML += `
                <button class="choice-btn" onclick="doWorkTask('paint')">Work on paintings</button>
                <button class="choice-btn" onclick="doWorkTask('commission')">Complete a commission</button>
                <button class="choice-btn" onclick="doWorkTask('exhibit')">Prepare for exhibition</button>
            `;
            break;
    }
    
    // Add break options
    workHTML += `
        <button class="choice-btn" onclick="takeBreak()">Take a short break</button>
        <button class="choice-btn" onclick="eatLunch()">Go for lunch</button>
        <button class="choice-btn status-check" onclick="checkStatus()">Check status and progress</button>
    `;
    
    domElements.choicesContainer.innerHTML = workHTML;
    
    // Store the time advance for this stage
    gameState.currentWorkTimeAdvance = timeAdvance;
}

// Status check function
function checkStatus() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    let statusHTML = `<h2>Current Status</h2>`;
    
    // Basic stats
    statusHTML += `
        <div class="status-section">
            <h3>Personal Wellbeing</h3>
            <p>Joy: ${Math.round(gameState.joy)}/100 - ${gameState.joy > 70 ? "You're feeling good" : gameState.joy > 40 ? "You're feeling okay" : "You're feeling down"}</p>
            <p>Stress: ${Math.round(gameState.stress)}/100 - ${gameState.stress < 30 ? "You're relaxed" : gameState.stress < 60 ? "You're managing" : "You're very stressed"}</p>
            <p>Fullness: ${Math.round(gameState.fullness)}/100 - ${gameState.fullness > 70 ? "You're well-fed" : gameState.fullness > 40 ? "You could use a meal soon" : "You're hungry"}</p>
        </div>
    `;
    
    // Work progress
    statusHTML += `
        <div class="status-section">
            <h3>Work Progress</h3>
            <p>General productivity: ${Math.round(gameState.workProgress)}/100</p>
    `;
    
    // Add deadline info if active
    if (gameState.deadline > 0) {
        const progress = Math.round((gameState.deadlineProgress / gameState.deadline) * 100);
        const daysLeft = 5 - gameState.day; // Friday is day 4
        
        statusHTML += `
            <p>Deadline project: ${progress}% complete</p>
            <p>Time remaining: ${daysLeft} day${daysLeft !== 1 ? 's' : ''}</p>
            <p class="${progress < (100 - daysLeft * 20) ? 'warning-text' : ''}">
                Status: ${
                    progress >= 90 ? "Nearly complete" :
                    progress >= 75 ? "Good progress" :
                    progress >= 50 ? "Halfway there" :
                    progress >= 25 ? "Just getting started" :
                    "Minimal progress"
                }
            </p>
        `;
    }
    
    statusHTML += `</div>`;
    
    // Financial status
    statusHTML += `
        <div class="status-section">
            <h3>Financial Status</h3>
            <p>Current money: ₦${gameState.money.toLocaleString()}</p>
            <p>Estimated daily expenses: ₦${estimateDailyExpenses().toLocaleString()}</p>
        </div>
    `;
    
    // Social/personal status
    statusHTML += `
        <div class="status-section">
            <h3>Personal</h3>
            <p>Job: ${gameState.job.charAt(0).toUpperCase() + gameState.job.slice(1)} at ${gameState.companyName}</p>
            <p>Living in: ${gameState.location.name}, ${gameState.location.area}</p>
            ${gameState.hasTransportation ? "<p>You own a car for transportation.</p>" : "<p>You rely on public transportation.</p>"}
        </div>
    `;
    
    // Show in a modal-like display
    domElements.narrativeText.innerHTML = statusHTML;
    
    // Return button
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="showWorkStageOptions()">Return to work</button>
    `;
}

// Helper function to estimate daily expenses
function estimateDailyExpenses() {
    let estimate = 0;
    
    // Transportation (average)
    estimate += gameState.hasTransportation ? 2000 : 6000;
    
    // Food (average)
    estimate += 10000;
    
    // Other (random expenses)
    estimate += 5000;
    
    return modifyCost(estimate);
}

// Do a work task
function doWorkTask(taskType) {
    if (!domElements.narrativeText) return;
    
    // General work progress
    let progressGain = 0;
    let stressChange = 0;
    let joyChange = 0;
    let taskDesc = "";
    
    // Base chance of success - lower when stats are bad
    let successModifier = 1.0;
    if (gameState.fullness < 30) successModifier *= 0.7;
    if (gameState.joy < 30) successModifier *= 0.8;
    if (gameState.stress > 70) successModifier *= 0.75;
    
    // Task-specific outcomes with more variance and risk
    switch(gameState.job) {
        case 'marketer':
            if (taskType === 'client') {
                taskDesc = "You visit potential clients to pitch your company's services.";
                const clientMeeting = Math.random() * successModifier;
                
                if (clientMeeting > 0.7) {
                    taskDesc += " The meeting goes exceptionally well! The client is eager to work with your company.";
                    progressGain = 30;
                    stressChange = -5;
                    joyChange = 12;
                } else if (clientMeeting > 0.3) {
                    taskDesc += " The client seems interested but non-committal.";
                    progressGain = 15;
                    stressChange = 5;
                    joyChange = 0;
                } else {
                    taskDesc += " Unfortunately, the client is not interested at all and the meeting is quite unpleasant.";
                    progressGain = 5;
                    stressChange = 15;
                    joyChange = -10;
                }
            } else if (taskType === 'pitch') {
                taskDesc = "You work on developing pitch materials for future clients.";
                progressGain = 20;
                stressChange = 10;
                joyChange = -5;
            } else if (taskType === 'research') {
                taskDesc = "You research market trends to refine your strategy.";
                progressGain = 12;
                stressChange = 5;
                joyChange = 0;
            }
            break;
            
        case 'programmer':
            if (taskType === 'debug') {
                taskDesc = "You hunt down bugs in the codebase.";
                const debugSuccess = Math.random() * successModifier;
                
                if (debugSuccess > 0.6) {
                    taskDesc += " You fix a critical bug that's been causing problems! Your colleagues are impressed.";
                    progressGain = 30;
                    stressChange = -8;
                    joyChange = 15;
                } else if (debugSuccess > 0.2) {
                    taskDesc += " You make some progress, but the root cause remains elusive.";
                    progressGain = 12;
                    stressChange = 10;
                    joyChange = -5;
                } else {
                    taskDesc += " The bugs seem to multiply as you fix them. It's a complete nightmare.";
                    progressGain = 3;
                    stressChange = 20;
                    joyChange = -15;
                }
            } else if (taskType === 'feature') {
                taskDesc = "You work on implementing new features.";
                progressGain = 20;
                stressChange = 15;
                joyChange = 3;
            } else if (taskType === 'optimize') {
                taskDesc = "You focus on optimizing existing code for better performance.";
                progressGain = 16;
                stressChange = 8;
                joyChange = 0;
            }
            break;
            
        case 'designer':
            if (taskType === 'create') {
                taskDesc = "You work on creating new designs from scratch.";
                const creativeSuccess = Math.random() * successModifier;
                
                if (creativeSuccess > 0.7) {
                    taskDesc += " Inspiration strikes and your designs flow effortlessly! You create something truly innovative.";
                    progressGain = 30;
                    stressChange = -10;
                    joyChange = 18;
                } else if (creativeSuccess > 0.3) {
                    taskDesc += " You create some decent designs, though nothing groundbreaking.";
                    progressGain = 16;
                    stressChange = 5;
                    joyChange = 3;
                } else {
                    taskDesc += " Designer's block hits hard. Nothing seems to work today and the pressure is mounting.";
                    progressGain = 3;
                    stressChange = 15;
                    joyChange = -12;
                }
            } else if (taskType === 'revise') {
                taskDesc = "You revise designs based on client feedback.";
                progressGain = 20;
                stressChange = 12;
                joyChange = -5;
            } else if (taskType === 'mockup') {
                taskDesc = "You develop mockups for upcoming projects.";
                progressGain = 16;
                stressChange = 8;
                joyChange = 0;
            }
            break;
            
        case 'artist':
            if (taskType === 'paint') {
                taskDesc = "You work on your personal art pieces.";
                const artisticFlow = Math.random() * successModifier;
                
                if (artisticFlow > 0.6) {
                    taskDesc += " You enter a state of flow and create something truly beautiful! The hours fly by effortlessly.";
                    progressGain = 18;
                    stressChange = -15;
                    joyChange = 25;
                } else if (artisticFlow > 0.2) {
                    taskDesc += " The work progresses steadily, if not spectacularly.";
                    progressGain = 12;
                    stressChange = 0;
                    joyChange = 8;
                } else {
                    taskDesc += " Your vision exceeds your current abilities, leading to intense frustration.";
                    progressGain = 3;
                    stressChange = 12;
                    joyChange = -8;
                }
            } else if (taskType === 'commission') {
                taskDesc = "You work on a commissioned piece for a client.";
                progressGain = 20;
                stressChange = 15;
                joyChange = 3;
            } else if (taskType === 'exhibit') {
                taskDesc = "You prepare pieces for an upcoming exhibition.";
                progressGain = 25;
                stressChange = 18;
                joyChange = 5;
            }
            break;
    }
    
    // Apply class-based modifiers
    if (gameState.class) {
        const mod = CLASS_MODIFIERS[gameState.class];
        stressChange *= mod.stressFromWork;
        
        // Only modify positive joy (joy from leisure)
        if (joyChange > 0) {
            joyChange *= mod.joyFromLeisure;
        }
    }
    
    // Hunger affects work performance
    if (gameState.fullness < 30) {
        progressGain *= 0.7; // 30% less productive when hungry
        stressChange *= 1.3; // 30% more stress when hungry
    }
    
    // If Tuesday's deadline is active, advance that too
    if (gameState.deadline > 0) {
        // Progress on deadline
        gameState.deadlineProgress += progressGain * 0.7;
        
        // More stress due to deadline
        stressChange += 5;
        joyChange -= 5;
    }
    
    // Apply changes to game state
    gameState.workProgress += progressGain;
    updateStat('stress', stressChange);
    updateStat('joy', joyChange);
    updateStat('fullness', -12); // Working makes you hungry
    
    domElements.narrativeText.innerHTML = `
        <h2>Working</h2>
        <p>${taskDesc}</p>
    `;
    
    updateUI();
    
    // Use stored time advance instead of fixed value
    advanceTime(gameState.currentWorkTimeAdvance, 'work');
    
    // Progress to next work stage
    if (gameState.workdayStage === 1) {
        gameState.workdayStage = 2;
        showWorkStageOptions();
    } else if (gameState.workdayStage === 2) {
        gameState.workdayStage = 3;
        showWorkStageOptions();
    } else if (gameState.workdayStage >= 3) {
        // End workday when we're at or past the final stage
        endWorkDay();
    } else {
        // Fallback in case workdayStage is undefined or invalid
        gameState.workdayStage = 1;
        showWorkStageOptions();
    }
}

// Take a break at work
function takeBreak() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Taking a Break</h2>
        <p>You step away from your work for a short break.</p>
    `;
    
    updateStat('stress', -10);
    updateStat('joy', 4);
    
    // Random break event
    const breakEvents = [
        "You chat with a friendly coworker about weekend plans.",
        "You grab a cup of coffee from the break room.",
        "You step outside for some fresh air.",
        "You scroll through social media for a few minutes.",
        "You do some quick stretches to relieve tension.",
        "You make a quick personal call.",
        "You browse news headlines on your phone.",
        "You take a walk around the office building.",
        "You have a small snack you brought from home."
    ];
    
    const randomBreak = breakEvents[Math.floor(Math.random() * breakEvents.length)];
    domElements.narrativeText.innerHTML += `<p>${randomBreak}</p>`;
    
    updateUI();
    advanceTime(0.5, 'idle'); // Break takes half a time unit (1 hour)
    
    // Advance the work stage appropriately
    if (gameState.workdayStage === 1) {
        gameState.workdayStage = 2;
    } else if (gameState.workdayStage === 2) {
        gameState.workdayStage = 3;
    } else if (gameState.workdayStage >= 3) {
        endWorkDay();
        return;
    }
    
    showWorkStageOptions();
}

// Go for lunch
function eatLunch() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Lunch Time</h2>
        <p>It's time for lunch. Where would you like to eat?</p>
    `;
    
    const roadsideCost = modifyCost(6000);
    const deliveryCost = modifyCost(10000);
    const restaurantCost = modifyCost(15000);
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="buyLunch('roadside')">Buy from roadside vendor (₦${roadsideCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="buyLunch('delivery')">Order food delivery (₦${deliveryCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="buyLunch('restaurant')">Go to a restaurant (₦${restaurantCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="skipLunch()">Skip lunch to save money</button>
    `;
}

// Buy lunch options
function buyLunch(lunchType) {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    let cost = 0;
    let fullnessGain = 0;
    let joyGain = 0;
    let description = "";
    
    switch(lunchType) {
        case 'roadside':
            // Check if roadside vendor is available
            const vendorAvailable = Math.random() > 0.17; // 17% chance the vendor isn't there
            
            if (!vendorAvailable) {
                domElements.narrativeText.innerHTML = `
                    <p>The roadside food vendor isn't there today. You'll need to choose another option.</p>
                `;
                eatLunch();
                return;
            }
            
            // Select random roadside food
            const roadsideFoods = FOOD_OPTIONS.filter(food => food.location === "roadside" || food.location === "all");
            const selectedFood = roadsideFoods[Math.floor(Math.random() * roadsideFoods.length)];
            
            cost = modifyCost(selectedFood.cost);
            fullnessGain = selectedFood.fullnessBoost;
            joyGain = selectedFood.joyBoost;
            
            // Schedule possible sickness (60% chance)
            if (Math.random() < 0.6) {
                scheduleSickness();
            }
            
            description = `You buy ${selectedFood.name} from a roadside vendor.`;
            
            // Extra food chance (good thing)
            const extraFood = Math.random() < 0.5;
            if (extraFood) {
                description += " They give you an extra portion for being a regular customer!";
                fullnessGain += 10;
                joyGain += 5;
            }
            
            break;
            
        case 'delivery':
            // Select random delivery food
            const deliveryFoods = FOOD_OPTIONS.filter(food => food.location === "all");
            const selectedDeliveryFood = deliveryFoods[Math.floor(Math.random() * deliveryFoods.length)];
            
            cost = modifyCost(selectedDeliveryFood.cost + 4000); // Delivery fee
            fullnessGain = selectedDeliveryFood.fullnessBoost;
            joyGain = selectedDeliveryFood.joyBoost;
            
            description = `You order ${selectedDeliveryFood.name} for delivery.`;
            
            // 15% chance of getting sick
            if (Math.random() < 0.15) {
                scheduleSickness();
            }
            
            // 35% chance of delivery person never showing up
            const deliveryNoShow = Math.random() < 0.35;
            if (deliveryNoShow) {
                description += " Unfortunately, the delivery person never shows up with your food.";
                cost = modifyCost(4000); // Only charged the delivery fee
                fullnessGain = 0;
                joyGain = -15;
                updateStat('stress', 20);
            } else {
                // 40% chance of food being late
                const foodLate = Math.random() < 0.4;
                if (foodLate) {
                    description += " The food arrives very late, when you're already extremely hungry.";
                    joyGain = 0; // No joy from late food
                    updateStat('stress', 10);
                }
            }
            
            break;
            
        case 'restaurant':
            // Select random restaurant food
            const restaurantFoods = FOOD_OPTIONS.filter(food => food.location === "restaurant" || food.location === "all");
            const selectedRestaurantFood = restaurantFoods[Math.floor(Math.random() * restaurantFoods.length)];
            
            cost = modifyCost(selectedRestaurantFood.cost * 2); // Restaurant markup
            fullnessGain = selectedRestaurantFood.fullnessBoost;
            joyGain = selectedRestaurantFood.joyBoost + 10; // Extra joy from restaurant experience
            
            description = `You go to a restaurant and order ${selectedRestaurantFood.name}.`;
            
            // 20% chance of bad experience
            const badExperience = Math.random() < 0.2;
            if (badExperience) {
                description += " Unfortunately, the service is poor and the food isn't great.";
                joyGain = 0;
                updateStat('stress', 15);
            } else {
                description += " The meal is delicious and the atmosphere is pleasant.";
                updateStat('stress', -15);
            }
            
            break;
    }
    
    // Check if player can afford it
    if (gameState.money < cost) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money for this option (₦${cost.toLocaleString()}).</p>
        `;
        eatLunch();
        return;
    }
    
    // Apply effects
    updateStat('money', -cost);
    updateStat('fullness', fullnessGain);
    updateStat('joy', joyGain);
    gameState.lastMealTime = gameState.time;
    
    domElements.narrativeText.innerHTML = `
        <h2>Lunch</h2>
        <p>${description}</p>
    `;
    
    updateUI();
    advanceTime(1, 'idle'); // Lunch takes 1 time unit (2 hours)
    
    // Advance to next work stage
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
    }
    
    showWorkStageOptions();
}

function skipLunch() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Skipping Lunch</h2>
        <p>You decide to skip lunch to save money. Your stomach growls in protest.</p>
    `;
    
    // Skipping lunch is more punishing now
    updateStat('fullness', -20);
    updateStat('joy', -10);
    updateStat('stress', 6);
    
    updateUI();
    advanceTime(0.5, 'idle'); // Skipping lunch still takes time (1 hour)
    
    // Advance to next work stage
    if (gameState.workdayStage < 3) {
        gameState.workdayStage++;
    }
    
    showWorkStageOptions();
}

// End the work day
function endWorkDay() {
    if (!domElements.narrativeText) return;
    
    gameState.isWorking = false;
    
    domElements.narrativeText.innerHTML = `
        <h2>End of Work Day</h2>
        <p>You've finished your work for the day. Evening has arrived.</p>
    `;
    
    // Check if there's a power outage at home (bad thing)
    const powerOutage = Math.random() < 0.25;
    if (powerOutage) {
        domElements.narrativeText.innerHTML += `<p>You receive a text from your neighbor that there's no electricity in your area.</p>`;
        updateStat('stress', 10);
        updateStat('joy', -6);
    }
    
    eveningActivities();
}

// ========================================================================
// FAMILY EMERGENCY FUNCTIONS
// ========================================================================

function sendMoney(amount) {
    if (!domElements.narrativeText) return;
    
    if (gameState.money < amount) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money to send. You'll need to explain the situation.</p>
        `;
        
        explainNoMoney();
        return;
    }
    
    updateStat('money', -amount);
    updateStat('joy', -8);
    updateStat('stress', 10);
    
    domElements.narrativeText.innerHTML = `
        <p>You send ₦${amount.toLocaleString()} to help with the medical expenses. It's a financial strain, but family comes first.</p>
    `;
    
    updateUI();
    showMorningOptions();
}

function explainNoMoney() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <p>You explain that you're struggling financially and can't send money right now. The conversation is difficult and weighs on your conscience.</p>
    `;
    
    updateStat('joy', -18);
    updateStat('stress', 25);
    
    updateUI();
    showMorningOptions();
}

// ========================================================================
// EVENING ACTIVITY FUNCTIONS
// ========================================================================

// Show evening activities
function eveningActivities() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>How would you like to spend your evening?</p>`;
    
    // Calculate costs for activities
    const socialCost = modifyCost(9000);
    const dinnerCost = modifyCost(18000);
    const raveCost = modifyCost(18000);
    const clubCost = modifyCost(25000);
    
    let options = `
        <h3>Evening Activities:</h3>
        <button class="choice-btn" onclick="goHome()">Go home and rest</button>
        <button class="choice-btn" onclick="socializeWithFriends(${socialCost})">Socialize with friends (₦${socialCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="continueworking()">Continue working on projects</button>
        <button class="choice-btn" onclick="goOutForDinner(${dinnerCost})">Go out for dinner (₦${dinnerCost.toLocaleString()})</button>
    `;
    
    // Add new options
    options += `
        <button class="choice-btn" onclick="doExercise()">Exercise</button>
        <button class="choice-btn" onclick="creativeHobby()">Do something creative</button>
    `;
    
    // Special Thursday/Friday options
    if (gameState.day >= 3) {
        options += `
            <button class="choice-btn" onclick="goToRave(${raveCost})">Go to a rave (₦${raveCost.toLocaleString()} for ticket)</button>
            <button class="choice-btn" onclick="goToClub(${clubCost})">Go to a club (₦${clubCost.toLocaleString()}+ for bottles)</button>
        `;
    }
    
    domElements.choicesContainer.innerHTML = options;
}

// New evening activities
function doExercise() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    gameState.eveningActivities.exercise++;
    
    domElements.narrativeText.innerHTML = `<h2>Evening Exercise</h2>`;
    
    // Different effects based on how often you exercise
    if (gameState.eveningActivities.exercise == 1) {
        domElements.narrativeText.innerHTML += `<p>You decide to start exercising. It's tough getting started but feels good afterward.</p>`;
        updateStat('joy', 4);
        updateStat('stress', -8);
        updateStat('fullness', -15);
    } else if (gameState.eveningActivities.exercise < 4) {
        domElements.narrativeText.innerHTML += `<p>You continue your exercise routine. Your body is getting used to it.</p>`;
        updateStat('joy', 6);
        updateStat('stress', -12);
        updateStat('fullness', -15);
    } else {
        domElements.narrativeText.innerHTML += `<p>You've established a solid exercise routine. Your body feels stronger and your mind clearer.</p>`;
        updateStat('joy', 9);
        updateStat('stress', -18);
        updateStat('fullness', -15);
    }
    
    advanceTime(1.5, 'physical');
    updateUI();
    
    domElements.narrativeText.innerHTML += `<p>You're hungry after your workout.</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="cookDinner()">Cook a healthy dinner</button>
        <button class="choice-btn" onclick="orderFoodDelivery()">Order food delivery</button>
    `;
}

function creativeHobby() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    gameState.eveningActivities.creative++;
    
    const hobbies = ["writing", "sketching", "playing music", "crafting"];
    const hobby = hobbies[gameState.eveningActivities.creative % hobbies.length];
    
    domElements.narrativeText.innerHTML = `<h2>Creative Time</h2>`;
    
    // Different effects based on how often you engage in creative activities
    if (gameState.eveningActivities.creative == 1) {
        domElements.narrativeText.innerHTML += `<p>You spend some time ${hobby}. It's been a while since you've been creative.</p>`;
        updateStat('joy', 10);
        updateStat('stress', -8);
    } else if (gameState.eveningActivities.creative < 4) {
        domElements.narrativeText.innerHTML += `<p>You continue ${hobby}. You're starting to find your creative flow again.</p>`;
        updateStat('joy', 12);
        updateStat('stress', -10);
    } else {
        domElements.narrativeText.innerHTML += `<p>Your regular practice of ${hobby} has become a meaningful creative outlet. It's becoming a real source of joy.</p>`;
        updateStat('joy', 15);
        updateStat('stress', -12);
    }
    
    advanceTime(2, 'idle');
    updateUI();
    
    // After creative work
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="goToSleep()">Go to sleep</button>
        <button class="choice-btn" onclick="eatFood('delivery', true)">Get some food</button>
    `;
}

function goHome() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>Evening at Home</h2>
        <p>You return to your apartment for a quiet evening.</p>
    `;
    
    updateStat('stress', -10);
    updateStat('joy', 3);
    
    // Home activity options
    domElements.choicesContainer.innerHTML = `
        <h3>What would you like to do at home?</h3>
        <button class="choice-btn" onclick="cookDinner()">Cook dinner</button>
        <button class="choice-btn" onclick="watchTV()">Watch TV or browse social media</button>
        <button class="choice-btn" onclick="doHouseChores()">Do house chores</button>
        <button class="choice-btn" onclick="goToSleep()">Go to sleep early</button>
    `;
}

function cookDinner() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    // Only possible if you have groceries
    const hasGroceries = Math.random() < 0.65;
    
    if (!hasGroceries) {
        domElements.narrativeText.innerHTML = `
            <p>You check your kitchen but realize you don't have enough ingredients to make a proper meal.</p>
        `;
        
        const groceryCost = modifyCost(9000);
        
        domElements.choicesContainer.innerHTML = `
            <button class="choice-btn" onclick="goGroceryShopping(${groceryCost})">Go grocery shopping (₦${groceryCost.toLocaleString()})</button>
            <button class="choice-btn" onclick="orderFoodDelivery()">Order food delivery instead</button>
            <button class="choice-btn" onclick="skipDinner()">Skip dinner</button>
        `;
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <p>You prepare a simple but satisfying meal at home.</p>
    `;
    
    updateStat('fullness', 40);
    updateStat('joy', 6);
    updateStat('stress', -3);
    gameState.lastMealTime = gameState.time;
    
    advanceTime(1, 'idle');
    updateUI();
    eveningLeisure();
}

function goGroceryShopping(groceryCost) {
    if (!domElements.narrativeText) return;
    
    if (gameState.money < groceryCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for groceries.</p>`;
        goHome();
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <p>You make a quick trip to the local market to buy groceries.</p>
    `;
    
    updateStat('money', -groceryCost);
    updateStat('stress', 10);
    updateStat('fullness', -8);
    
    advanceTime(1, 'physical');
    updateUI();
    
    domElements.narrativeText.innerHTML += `<p>Now you can cook a proper meal.</p>`;
    
    updateStat('fullness', 45);
    updateStat('joy', 10);
    gameState.lastMealTime = gameState.time;
    
    advanceTime(1, 'idle');
    updateUI();
    eveningLeisure();
}

function orderFoodDelivery() {
    eatFood('delivery', true); // Call the food function with delivery option for evening
}

function skipDinner() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `<p>You decide to skip dinner tonight.</p>`;
    
    updateStat('fullness', -20);
    updateStat('joy', -10);
    
    updateUI();
    eveningLeisure();
}

function watchTV() {
    if (!domElements.narrativeText) return;
    
    gameState.eveningActivities.tv++;
    
    // Add diminishing returns
    let joyGain = 10;
    if (gameState.eveningActivities.tv > 3) {
        joyGain = 5;
        domElements.narrativeText.innerHTML = `<p>You watch TV again. The shows are starting to seem repetitive.</p>`;
    } else {
        domElements.narrativeText.innerHTML = `<p>You relax by watching TV or browsing social media.</p>`;
    }
    
    updateStat('joy', joyGain);
    updateStat('stress', -12);
    
    advanceTime(2, 'idle');
    updateUI();
    goToSleep();
}

function doHouseChores() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <p>You spend some time cleaning your apartment and doing laundry.</p>
    `;
    
    updateStat('stress', 5);
    updateStat('fullness', -5);
    
    // But having a clean space provides joy afterwards
    updateStat('joy', 6);
    
    advanceTime(1, 'physical');
    updateUI();
    eveningLeisure();
}

function eveningLeisure() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    domElements.narrativeText.innerHTML += `<p>You have some free time before bed.</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="watchTV()">Watch TV or browse social media</button>
        <button class="choice-btn" onclick="callFamily()">Call family or friends</button>
        <button class="choice-btn" onclick="goToSleep()">Go to sleep</button>
    `;
}

function callFamily() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <p>You spend some time on the phone with family or friends, catching up on life.</p>
    `;
    
    updateStat('joy', 12);
    updateStat('stress', -10);
    
    advanceTime(1, 'idle');
    updateUI();
    goToSleep();
}

function socializeWithFriends(socialCost) {
    if (!domElements.narrativeText) return;
    
    gameState.eveningActivities.social++;
    
    if (gameState.money < socialCost) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money to go out with friends right now.</p>
        `;
        eveningActivities();
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Out with Friends</h2>
        <p>You meet up with some friends to unwind after work.</p>
    `;
    
    // Apply class-based joy from leisure
    let joyBoost = 18;
    if (gameState.class) {
        joyBoost *= CLASS_MODIFIERS[gameState.class].joyFromLeisure;
    }
    
    updateStat('joy', joyBoost);
    updateStat('stress', -12);
    updateStat('money', -socialCost);
    
    // Random social event
    const socialEvents = [
        "You have a great conversation about life and current events.",
        "Your friend shares some hilarious stories about their workplace.",
        "You run into an old acquaintance and catch up.",
        "The group discusses plans for a future weekend trip.",
        "You play some board games and have a competitive but fun time.",
        "Someone shares their struggles at work, and you all commiserate.",
        "You try a new drink that everyone's talking about.",
        "A friend introduces you to someone interesting.",
        "You share your own funny stories from the week."
    ];
    
    const randomEvent = socialEvents[Math.floor(Math.random() * socialEvents.length)];
    domElements.narrativeText.innerHTML += `<p>${randomEvent}</p>`;
    
    advanceTime(3, 'idle');
    updateUI();
    
    // Late night - go straight to sleep
    goToSleep();
}

function continueworking() {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    gameState.eveningActivities.work++;
    
    // Diminishing returns for overwork
    let stressIncrease = 15;
    let progressIncrease = 20;
    let deadlineIncrease = 15;
    
    if (gameState.eveningActivities.work > 2) {
        stressIncrease = 25;
        progressIncrease = 15;
        deadlineIncrease = 12;
        
        domElements.narrativeText.innerHTML = `
            <h2>Working Overtime Again</h2>
            <p>You force yourself to keep working, even though your mind is tired. It's increasingly difficult to focus.</p>
        `;
    } else {
        domElements.narrativeText.innerHTML = `
            <h2>Working Overtime</h2>
            <p>You decide to put in some extra hours on your projects.</p>
        `;
    }
    
    gameState.workProgress += progressIncrease;
    
    // If working on Tuesday's deadline
    if (gameState.deadline > 0) {
        gameState.deadlineProgress += deadlineIncrease;
        domElements.narrativeText.innerHTML += `<p>You make good progress on your deadline project.</p>`;
    }
    
    updateStat('stress', stressIncrease);
    updateStat('fullness', -15);
    updateStat('joy', -10);
    
    advanceTime(2, 'work');
    updateUI();
    
    // Option to eat after working
    domElements.narrativeText.innerHTML += `<p>You're hungry after all that extra work.</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="eatFood('delivery', true)">Order food delivery</button>
        <button class="choice-btn" onclick="goToSleep()">Skip dinner and go to sleep</button>
    `;
}

function goOutForDinner(dinnerCost) {
    if (!domElements.narrativeText) return;
    
    if (gameState.money < dinnerCost) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money for a restaurant dinner right now.</p>
        `;
        eveningActivities();
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Dinner Out</h2>
        <p>You decide to treat yourself to a nice dinner at a restaurant.</p>
    `;
    
    // Select a restaurant food
    const restaurantFoods = FOOD_OPTIONS.filter(food => food.location === "restaurant" || food.location === "all");
    const selectedFood = restaurantFoods[Math.floor(Math.random() * restaurantFoods.length)];
    
    // Restaurant prices are higher
    const cost = modifyCost(selectedFood.cost * 2);
    
    // Check for menu price increases for repeat visits
    const repeatVisitPriceIncrease = Math.random() < 0.9;
    const finalCost = repeatVisitPriceIncrease ? Math.round(cost * 1.4) : cost;
    
    updateStat('money', -finalCost);
    updateStat('fullness', selectedFood.fullnessBoost * 1.2);
    updateStat('joy', selectedFood.joyBoost + 10);
    updateStat('stress', -12);
    gameState.lastMealTime = gameState.time;
    
    if (repeatVisitPriceIncrease) {
        domElements.narrativeText.innerHTML += `<p>You notice the prices have increased since your last visit. You pay ₦${finalCost.toLocaleString()} for your ${selectedFood.name}.</p>`;
    } else {
        domElements.narrativeText.innerHTML += `<p>You enjoy a delicious ${selectedFood.name} for ₦${finalCost.toLocaleString()}.</p>`;
    }
    
    // 20% chance of bad experience
    const badExperience = Math.random() < 0.2;
    if (badExperience) {
        domElements.narrativeText.innerHTML += `<p>Unfortunately, the service is slow and the food isn't as good as expected.</p>`;
        updateStat('joy', -10);
        updateStat('stress', 15);
    } else {
        domElements.narrativeText.innerHTML += `<p>The meal is excellent and the atmosphere helps you relax.</p>`;
    }
    
    advanceTime(2, 'idle');
    updateUI();
    
    // Eating out takes time, so go straight to sleep after
    goToSleep();
}

function goToRave(raveCost) {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    if (gameState.money < raveCost) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money for a rave ticket right now.</p>
        `;
        eveningActivities();
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Night Out at a Rave</h2>
        <p>You decide to let loose at a high-energy rave party.</p>
    `;
    
    updateStat('money', -raveCost);
    updateStat('joy', 25);
    updateStat('stress', -25);
    updateStat('fullness', -20);
    
    // Offers of drugs/alcohol
    domElements.narrativeText.innerHTML += `<p>Someone offers you substances to enhance your experience. Do you accept?</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="takeDrugs()">Accept the offer</button>
        <button class="choice-btn" onclick="refuseDrugs()">Politely decline</button>
    `;
}

function takeDrugs() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <p>You decide to indulge. The night becomes a blur of music, lights, and euphoria.</p>
    `;
    
    updateStat('joy', 35);
    updateStat('stress', -35);
    
    // Schedule comedown for next day
    gameState.drugComedownDay = gameState.day + 1;
    
    advanceTime(4, 'physical'); // Takes all night
    updateUI();
    goToSleep();
}

function refuseDrugs() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `
        <p>You decline the offer but still have a great time dancing and enjoying the music.</p>
    `;
    
    advanceTime(3, 'physical');
    updateUI();
    goToSleep();
}

function goToClub(clubCost) {
    if (!domElements.narrativeText || !domElements.choicesContainer) return;
    
    if (gameState.money < clubCost) {
        domElements.narrativeText.innerHTML = `
            <p>You don't have enough money for the club right now.</p>
        `;
        eveningActivities();
        return;
    }
    
    domElements.narrativeText.innerHTML = `
        <h2>Night at the Club</h2>
        <p>You head to an upscale club for a night of luxury and excitement.</p>
    `;
    
    updateStat('money', -clubCost);
    updateStat('joy', 18);
    updateStat('stress', -12);
    
    // Option to buy bottles
    const bottleCost = modifyCost(90000);
    domElements.narrativeText.innerHTML += `<p>The server suggests buying a bottle for your table (₦${bottleCost.toLocaleString()}). This would impress everyone around.</p>`;
    
    domElements.choicesContainer.innerHTML = `
        <button class="choice-btn" onclick="buyBottles(${bottleCost})">Buy bottles (₦${bottleCost.toLocaleString()})</button>
        <button class="choice-btn" onclick="declineBottles()">Stick to regular drinks</button>
    `;
}

function buyBottles(bottleCost) {
    if (!domElements.narrativeText) return;
    
    if (gameState.money < bottleCost) {
        domElements.narrativeText.innerHTML += `<p>You don't have enough money for bottles.</p>`;
        declineBottles();
        return;
    }
    
    updateStat('money', -bottleCost);
    updateStat('joy', 12);
    
    domElements.narrativeText.innerHTML += `
        <p>You splurge on bottles. The server brings them with sparklers, and for a moment, you're the center of attention.</p>
    `;
    
    advanceTime(3, 'idle');
    updateUI();
    goToSleep();
}

function declineBottles() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML += `
        <p>You decline the expensive bottles and enjoy your night with regular drinks.</p>
    `;
    
    advanceTime(3, 'idle');
    updateUI();
    goToSleep();
}

function eatFood(foodType, isEvening) {
    buyLunch(foodType); // Reuse the lunch functionality
    
    if (isEvening) {
        advanceTime(1, 'idle');
        goToSleep();
    }
}

function goToSleep() {
    if (!domElements.narrativeText) return;
    
    domElements.narrativeText.innerHTML = `
        <h2>End of Day</h2>
        <p>You get ready for bed and turn in for the night.</p>
    `;
    
    // Sleep quality varies based on stress and hunger
    let sleepQuality = "good";
    let joyBoost = 6;
    let stressReduction = 12;
    
    // Poor sleep if stressed
    if (gameState.stress > 70) {
        sleepQuality = "poor";
        joyBoost = 3;
        stressReduction = 6;
        domElements.narrativeText.innerHTML += `<p>Your sleep is restless due to stress.</p>`;
    } 
    // Poor sleep if hungry
    else if (gameState.fullness < 30) {
        sleepQuality = "poor";
        joyBoost = 3;
        stressReduction = 6;
        domElements.narrativeText.innerHTML += `<p>Your sleep is restless due to hunger.</p>`;
    }
    // Average sleep
    else if (gameState.stress > 40) {
        sleepQuality = "average";
        joyBoost = 4;
        stressReduction = 8;
        domElements.narrativeText.innerHTML += `<p>You sleep adequately, though not perfectly.</p>`;
    } 
    // Good sleep
    else {
        domElements.narrativeText.innerHTML += `<p>You enjoy a deep, refreshing sleep.</p>`;
    }
    
    updateStat('joy', joyBoost);
    updateStat('stress', -stressReduction);
    
    // Advance to next day morning
    advanceToNextDay();
}

function advanceToNextDay() {
    // Advance time to next morning
    gameState.time = 0; // 6AM
    gameState.day += 1;
    
    // Reset some daily flags
    gameState.isWorking = false;
    gameState.workdayStage = 0;
    
    // Check if week is over
    if (gameState.day > 4) {
        finishGame();
        return;
    }
    
    // Natural resource recovery from sleep
    updateStat('fullness', -25);
    
    // Check for drug comedown
    if (gameState.drugComedownDay === gameState.day) {
        if (domElements.narrativeText) {
            domElements.narrativeText.innerHTML = `
                <h2>The Morning After</h2>
                <p>You wake up feeling terrible from last night's indulgence. The comedown is rough.</p>
            `;
        }
        
        updateStat('joy', -30);
        updateStat('stress', 35);
        updateStat('fullness', -15);
        
        gameState.drugComedownDay = null;
    } else {
        // Day-specific events
        if (gameState.day === 1) {
            // Tuesday dawn
            startTuesday();
        } else if (gameState.day === 2) {
            // Wednesday dawn
            startWednesday();
        } else if (gameState.day === 3) {
            // Thursday dawn
            startThursday();
        } else if (gameState.day === 4) {
            // Friday dawn
            startFriday();
        }
    }
    
    updateUI();
}

// ========================================================================
// START THE GAME
// ========================================================================

// Initialize the game once the page has loaded
document.addEventListener('DOMContentLoaded', function() {
    // Start initialization through the GameInitializer
    window.GameInitializer.init();
});

// If document is already loaded, initialize immediately
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(function() {
        if (window.GameInitializer) {
            window.GameInitializer.init();
        }
    }, 1);
}