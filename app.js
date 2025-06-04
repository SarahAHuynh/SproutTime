// getting some dom elements 
const hourContainer = document.querySelector("#hour");
const minContainer = document.querySelector("#min");
const secContainer = document.querySelector("#sec");
const header = document.querySelector("#main-header");

const startBtn = document.getElementById("start");

// default times for each mode
const defaultTimes = {
    sprouting: { hour: 0, min: 25, sec: 0 },
    shortBreak: { hour: 0, min: 5, sec: 0 },
    longBreak: { hour: 0, min: 10, sec: 0 }
};

// this is the default mode
let currentMode = "sprouting";

// this is the timer in seconds 
let timer_set = 0;
let elapsedTime = 0;

// the hour, min and second
let hour = 0;
let min = 0;
let sec = 0;

// if user updates these when editable then check if set >= 60 and stop them from doing that 
minContainer.addEventListener("change", () => {
    min = parseInt(minContainer.value);
    if (min >= 60) {
        hour = Math.floor(hour + min / 60);
        min = min % 60;
    }
    updateUI();
    saveTime(currentMode);
});

secContainer.addEventListener("change", () => {
    sec = parseInt(secContainer.value);
    if (sec >= 60) {
        min = Math.floor(min + sec / 60);
        sec = sec % 60;
        if (min > 60) {
            hour = Math.floor(hour + min / 60);
            min = min % 60;
        }
    }
    updateUI();
    saveTime(currentMode);
});

hourContainer.addEventListener("change", () => {
    hour = parseInt(hourContainer.value);
    updateUI();
    saveTime(currentMode);
});

// updates UI with new changed time values
const updateUI = () => {
    hourContainer.value = hour;
    minContainer.value = min;
    secContainer.value = sec;
}

const toggleTimer = () => {
    if (interval) {
        // if running, stop it 
        clearInterval(interval);
        interval = null;
        startBtn.textContent = "Start";
        startBtn.classList.remove("active");

        setControlsDisabled(false); // re-enable buttons

        hourContainer.removeAttribute("readonly");
        minContainer.removeAttribute("readonly");
        secContainer.removeAttribute("readonly");

        // Remove enlarged state from containers
        [hourContainer, minContainer, secContainer].forEach(container => {
            container.classList.remove("enlarged");
        });
    } else {
        // if not running, start it 
        hourContainer.setAttribute("readonly", "true");
        minContainer.setAttribute("readonly", "true");
        secContainer.setAttribute("readonly", "true");
        
        // Ensure we have valid numbers
        hour = parseInt(hourContainer.value) || 0;
        min = parseInt(minContainer.value) || 0;
        sec = parseInt(secContainer.value) || 0;
        
        timer_set = hour * 3600 + min * 60 + sec;
        elapsedTime = 0; // Reset elapsed time when starting
        
        if (timer_set <= 0) {
            return; // Don't start if no time is set
        }
        
        startBtn.textContent = "Stop";
        startBtn.classList.add("active");

        setControlsDisabled(true); // disable buttons
        updateCountDownTime(); // Update display immediately
        startTicking();

        // start watering and sprouting loop
        if (!watering) {
            watering = true;
            setTimeout(waterAndGrowLoop, 0);
        }
    }
};

// function for reset button 
const resetTime = () => {
    if (interval) {
        clearInterval(interval);
    }

    watering = false;

    startBtn.textContent = "Start";
    startBtn.classList.remove("active");
    interval = null;

    timer_set = 0;
    hourContainer.removeAttribute("readonly");
    minContainer.removeAttribute("readonly");
    secContainer.removeAttribute("readonly");

    // Remove enlarged state from containers
    [hourContainer, minContainer, secContainer].forEach(container => {
        container.classList.remove("enlarged");
    });

    // Flash active state on reset button
    const resetBtn = document.getElementById("reset");
    resetBtn.classList.add("active");
    setTimeout(() => {
        resetBtn.classList.remove("active");
    }, 300);

    setControlsDisabled(false);
    loadTime(currentMode);

    elapsedTime = 0;
    flowerStage = 1;
    document.getElementById("flowerStage").src = flower1.png;
};
 
// this is to store the interval to terminate it 
let interval;
// function that countdowns the timer
const startTicking = () => {
    if (timer_set > 0) {
        interval = setInterval(() => {
            // Enlarge timer containers
            [hourContainer, minContainer, secContainer].forEach(container => {
                container.classList.add("enlarged");
            });
            
            if (timer_set > 0) {
                timer_set -= 1;
                elapsedTime += 1;
                updateCountDownTime();
                
                if (timer_set <= 0) {
                    endTicking();
                    clearInterval(interval);
                }
            }
        }, 1000);
    } else {
        endTicking();
    }
}

const updateCountDownTime = () => {
    hour = Math.floor(timer_set / 3600);
    min = Math.floor((timer_set % 3600) / 60);
    sec = timer_set % 60;
    
    // Ensure values are not negative
    hour = Math.max(0, hour);
    min = Math.max(0, min);
    sec = Math.max(0, sec);
    
    updateUI();
}

const endTicking = () => {
    var audio = new Audio('lofiTimer.mp3');
    audio.volume = 1.0; // max volume
    audio.play();
    
    setTimeout(() => {
        header.innerText = "Sprout Time!"
    }, 3000);

    // stop timer
    clearInterval(interval);
    interval = null;
    watering = false;

    // reset Start button
    const startBtn = document.getElementById("start");
    startBtn.textContent = "Start";
    startBtn.classList.remove("active");

    // re-enable input fields
    hourContainer.removeAttribute("readonly");
    minContainer.removeAttribute("readonly");
    secContainer.removeAttribute("readonly");

    setControlsDisabled(false);
    // reset values to current mode
    loadTime(currentMode);

};

// load saved or default time for a mode
const loadTime = (mode) => {
    const saved = sessionStorage.getItem(mode);
    const fallback = defaultTimes[mode];
    const data = saved ? JSON.parse(saved) : fallback;

    hour = data.hour;
    min = data.min;
    sec = data.sec;

    updateUI();

    if (!saved) {
        saveTime(mode);
    }
  };
  
// save current time to localStorage for the active mode
const saveTime = (mode) => {
    sessionStorage.setItem(mode, JSON.stringify({ hour, min, sec }));
};

// disable buttons when timer is running 
const setControlsDisabled = (disabled) => {
    document.querySelectorAll(".mode-btn, #reset, #resetDefaults").forEach(btn => {
        btn.disabled = disabled;
        btn.style.opacity = disabled;
        btn.style.pointerEvents = disabled ? "0.5" : "1";
    });
};

const updateActiveModeUI = () => {
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.id === currentMode);
    });
    // remove active state from defaults button when a mode is selected
    document.getElementById("resetDefaults").classList.remove("active");
};

let currentGrowth = 0;
let watering = false;

const waterFlow = document.getElementById("waterFlow");
const sprout = document.getElementById("sprout");

function waterAndGrowLoop() {
    if (!watering) return;

    // step 1: start water animation 
    waterFlow.style.animation = "none";
    void waterFlow.offsetWidth; // trigger reflow
    waterFlow.style.animation = "pourWater 2s ease-out forwards";

    // step 2: after 2s (when water finishes), grow the sprout 
    setTimeout(() => {
        if (currentGrowth < 2) {
            currentGrowth += 0.2;
            sprout.style.transform = `scaleY(${currentGrowth})`;
        }

        // step 3: wait remaining time (3s) to make full cycle = 5s
        setTimeout(() => {
            if (watering) waterAndGrowLoop(); // repeat
        }, 30000);
    }, 3000); // water lasts 2 secs
}

// handle mode button clicks
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        saveTime(currentMode); // save old mode time
        currentMode = btn.id;
        loadTime(currentMode); // load new mode time
        updateActiveModeUI();
    });
});

document.getElementById("resetDefaults").addEventListener("click", () => {
    // clear session data
    sessionStorage.clear();

    // reload current mode with default time
    loadTime(currentMode);
    
    // Add active state to defaults button and remove from mode buttons
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    document.getElementById("resetDefaults").classList.add("active");
    
    // Remove active state after a short delay
    setTimeout(() => {
        document.getElementById("resetDefaults").classList.remove("active");
        updateActiveModeUI();
    }, 1000);
});

// Start/Reset button listeners
document.addEventListener("DOMContentLoaded", () => {
    watering = false;
    currentGrowth = 0;
    sprout.style.transform = "scaleY(0)";
    waterFlow.style.animation = "none";
    
    startBtn.addEventListener("click", toggleTimer);
    document.getElementById("reset").addEventListener("click", resetTime);
     
    // initial load
    currentMode = "sprouting";
    loadTime(currentMode); 
    updateUI();
    updateActiveModeUI();
});