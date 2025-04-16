// getting some dom elements 
const hourContainer = document.querySelector("#hour");
const minContainer = document.querySelector("#min");
const secContainer = document.querySelector("#sec");

// as there is only one h1 so this won't be any problem
const header = document.querySelector("#main-header");

// this is the timer in seconds 
let timer_set = 0;

// the hour, min and second
let hour = 0;
let min = 0;
let sec = 0;

// this is to stop the interval to terminate it
let interval;

// if user updates these when editable then check if set >= 60 and stop them from doing that 
minContainer.addEventListener("change", () => {
    min = parseInt(minContainer.value);
    if (min >= 60) {
        hour += Math.floor(min / 60);
        min = min % 60;
    }
    updateUI();
});

secContainer.addEventListener("change", () => {
    sec = parseInt(secContainer.value);
    if (sec >= 60) {
        min += Math.floor(sec / 60);
        sec = sec % 60;
        if (min >= 60) {
            hour += Math.floor(min / 60);
            min = min % 60;
        }
    }
    updateUI();
});

hourContainer.addEventListener("change", () => {
    hour = parseInt(hourContainer.value);
    updateUI();
});

// updates UI with new changed time values
const updateUI = () => {
    hourContainer.value = hour;
    minContainer.value = min;
    secContainer.value = sec;
}

// function for reset button 
const resetTime = () => {
    hour = 0;
    min = 0;
    sec = 0;
    timer_set = 0;
    if (interval) {
        clearInterval(interval);
    }
    hourContainer.removeAttribute("readonly");
    minContainer.removeAttribute("readonly");
    secContainer.removeAttribute("readonly");
    updateUI();
}

// function to call when start button clicked
const startTime = () => {
    hourContainer.setAttribute("readonly", "true");
    minContainer.setAttribute("readonly", "true");
    secContainer.setAttribute("readonly", "true");

    timer_set = hour * 60 * 60 + min * 60 + sec;
    startTicking();
};

// function that countdowns the timer
const startTicking = () => {
    if (timer_set > 0) {
        interval = setInterval(() => {

            if (timer_set <= 0) {
                clearInterval(interval);
                endTicking();
            }
            timer_set -=1;
            updateCountDownTime();
        }, 1000)
    } else {
        endTicking();
    }
}

const updateCountDownTime = () => {
    sec = timer_set % 60;
    min = Math.floor(timer_set / 60);
    hour = Math.floor(min /60);
    min = min % 60;
    updateUI();
}

const endTicking = () => {
    header.innerHTML = "Time's Up!";
    const audio = new Audio('lofiTimer.mp3');
    audio.play();

    setTimeout(() => {
        header.innerHTML = "Sprout Time!";
        resetTime();
    }, 3000);
}

