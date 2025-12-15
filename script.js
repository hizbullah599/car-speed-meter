// ===== CONFIGURATION =====
const MAX_SPEED = 240;
const MAX_RPM = 8000;
const MAX_TEMP = 120;
const NORMAL_TEMP = 90;
const FUEL_TANK = 60; // Liters

// Drive mode configurations
const DRIVE_MODES = {
    eco: { acceleration: 3, maxSpeed: 160, sound: 0.7, color: '#00ff88' },
    normal: { acceleration: 5, maxSpeed: 200, sound: 1.0, color: '#ffaa00' },
    sport: { acceleration: 8, maxSpeed: 240, sound: 1.3, color: '#ff4444' }
};

// Gear ratios for automatic transmission
const GEAR_RATIOS = [
    { gear: 1, minSpeed: 0, maxSpeed: 40, minRPM: 1000, maxRPM: 3500 },
    { gear: 2, minSpeed: 30, maxSpeed: 70, minRPM: 1500, maxRPM: 4000 },
    { gear: 3, minSpeed: 60, maxSpeed: 110, minRPM: 2000, maxRPM: 4500 },
    { gear: 4, minSpeed: 100, maxSpeed: 160, minRPM: 2200, maxRPM: 5000 },
    { gear: 5, minSpeed: 150, maxSpeed: 200, minRPM: 2500, maxRPM: 5500 },
    { gear: 6, minSpeed: 190, maxSpeed: 240, minRPM: 2800, maxRPM: 6000 }
];

// ===== DOM ELEMENTS =====
const speedValue = document.getElementById('speedValue');
const gaugeProgress = document.getElementById('gaugeProgress');
const needle = document.getElementById('needle');
const rpmValue = document.getElementById('rpmValue');
const rpmGaugeProgress = document.getElementById('rpmGaugeProgress');
const rpmNeedle = document.getElementById('rpmNeedle');
const gearValue = document.getElementById('gearValue');
const tempGauge = document.getElementById('tempGauge');
const tempValue = document.getElementById('tempValue');
const fuelGauge = document.getElementById('fuelGauge');
const fuelValue = document.getElementById('fuelValue');
const maxSpeedDisplay = document.getElementById('maxSpeed');
const avgSpeedDisplay = document.getElementById('avgSpeed');
const zeroToHundredDisplay = document.getElementById('zeroToHundred');
const distanceDisplay = document.getElementById('distance');
const tripTimeDisplay = document.getElementById('tripTime');
const fuelUsedDisplay = document.getElementById('fuelUsed');
const accelerateBtn = document.getElementById('accelerate');
const brakeBtn = document.getElementById('brake');
const cruiseBtn = document.getElementById('cruiseControl');
const resetBtn = document.getElementById('reset');
const themeToggle = document.getElementById('themeToggle');
const engineTypeSelect = document.getElementById('engineType');
const speedLines = document.getElementById('speedLines');
const engineWarning = document.getElementById('engineWarning');
const fuelWarning = document.getElementById('fuelWarning');
const cruiseWarning = document.getElementById('cruiseWarning');
const modeBtns = document.querySelectorAll('.mode-btn');
const container = document.querySelector('.container');

// ===== STATE VARIABLES =====
let currentSpeed = 0;
let currentRPM = 0;
let currentGear = 0; // 0 = Neutral
let currentTemp = NORMAL_TEMP;
let currentFuel = FUEL_TANK;
let maxSpeed = 0;
let speedHistory = [];
let isAccelerating = false;
let isBraking = false;
let cruiseControlActive = false;
let cruiseSpeed = 0;
let animationFrame = null;
let distance = 0;
let tripStartTime = null;
let fuelUsed = 0;
let zeroToHundredTime = null;
let zeroToHundredStarted = false;
let currentDriveMode = 'normal';
let currentEngineType = 'v6';

// ===== AUDIO SYSTEM =====
let audioContext;
let engineOscillator;
let engineGainNode;
let engineFilterNode;
let isEngineSoundPlaying = false;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Engine sound generators for different types
const ENGINE_SOUNDS = {
    v6: { baseFreq: 80, range: 220, waveType: 'sawtooth', filterFreq: 800 },
    v8: { baseFreq: 60, range: 240, waveType: 'sawtooth', filterFreq: 600 },
    electric: { baseFreq: 200, range: 400, waveType: 'sine', filterFreq: 2000 },
    turbo: { baseFreq: 100, range: 280, waveType: 'square', filterFreq: 1200 }
};

function startEngineSound() {
    if (!audioContext || isEngineSoundPlaying) return;
    
    initAudio();
    
    const engineConfig = ENGINE_SOUNDS[currentEngineType];
    
    engineOscillator = audioContext.createOscillator();
    engineGainNode = audioContext.createGain();
    engineFilterNode = audioContext.createBiquadFilter();
    
    engineOscillator.type = engineConfig.waveType;
    engineFilterNode.type = 'lowpass';
    engineFilterNode.frequency.setValueAtTime(engineConfig.filterFreq, audioContext.currentTime);
    
    engineOscillator.connect(engineFilterNode);
    engineFilterNode.connect(engineGainNode);
    engineGainNode.connect(audioContext.destination);
    
    engineOscillator.frequency.setValueAtTime(engineConfig.baseFreq, audioContext.currentTime);
    engineGainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    
    engineOscillator.start();
    isEngineSoundPlaying = true;
}

function updateEngineSound() {
    if (!isEngineSoundPlaying || !engineOscillator) return;
    
    const engineConfig = ENGINE_SOUNDS[currentEngineType];
    const modeConfig = DRIVE_MODES[currentDriveMode];
    
    // Frequency based on RPM
    const rpmPercentage = currentRPM / MAX_RPM;
    const frequency = engineConfig.baseFreq + (rpmPercentage * engineConfig.range);
    engineOscillator.frequency.setTargetAtTime(frequency, audioContext.currentTime, 0.1);
    
    // Volume based on speed and mode
    const volume = (0.08 + (rpmPercentage * 0.17)) * modeConfig.sound;
    engineGainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1);
    
    // Filter frequency for more realistic sound
    const filterFreq = engineConfig.filterFreq + (rpmPercentage * 1000);
    engineFilterNode.frequency.setTargetAtTime(filterFreq, audioContext.currentTime, 0.1);
}

function stopEngineSound() {
    if (!isEngineSoundPlaying || !engineOscillator) return;
    
    try {
        engineGainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
        setTimeout(() => {
            if (engineOscillator) {
                engineOscillator.stop();
                engineOscillator.disconnect();
                engineGainNode.disconnect();
                engineFilterNode.disconnect();
                engineOscillator = null;
                engineGainNode = null;
                engineFilterNode = null;
                isEngineSoundPlaying = false;
            }
        }, 400);
    } catch (e) {
        isEngineSoundPlaying = false;
    }
}

function playBrakeSound() {
    if (!audioContext) initAudio();
    
    const brakeOscillator = audioContext.createOscillator();
    const brakeGain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    brakeOscillator.type = 'sawtooth';
    brakeOscillator.frequency.setValueAtTime(150, audioContext.currentTime);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    
    brakeOscillator.connect(filter);
    filter.connect(brakeGain);
    brakeGain.connect(audioContext.destination);
    
    brakeGain.gain.setValueAtTime(0.15, audioContext.currentTime);
    brakeGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    brakeOscillator.start();
    brakeOscillator.stop(audioContext.currentTime + 0.4);
}

function playGearShiftSound() {
    if (!audioContext) initAudio();
    
    const shiftOscillator = audioContext.createOscillator();
    const shiftGain = audioContext.createGain();
    
    shiftOscillator.type = 'square';
    shiftOscillator.frequency.setValueAtTime(100, audioContext.currentTime);
    shiftOscillator.frequency.exponentialRampToValueAtTime(60, audioContext.currentTime + 0.15);
    
    shiftOscillator.connect(shiftGain);
    shiftGain.connect(audioContext.destination);
    
    shiftGain.gain.setValueAtTime(0.08, audioContext.currentTime);
    shiftGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    shiftOscillator.start();
    shiftOscillator.stop(audioContext.currentTime + 0.15);
}

// ===== GAUGE UPDATES =====
function updateSpeedometer(speed) {
    speed = Math.max(0, Math.min(MAX_SPEED, speed));
    currentSpeed = speed;
    
    speedValue.textContent = Math.round(speed);
    
    const percentage = speed / MAX_SPEED;
    const circumference = 251.2;
    const offset = circumference - (percentage * circumference);
    gaugeProgress.style.strokeDashoffset = offset;
    
    const rotation = -90 + (percentage * 180);
    needle.style.transform = `rotate(${rotation}deg)`;
    
    if (speed > maxSpeed) {
        maxSpeed = speed;
        maxSpeedDisplay.textContent = Math.round(maxSpeed);
    }
    
    speedHistory.push(speed);
    if (speedHistory.length > 100) speedHistory.shift();
    
    const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;
    avgSpeedDisplay.textContent = Math.round(avgSpeed);
    
    // Speed warning effect
    if (speed > 200) {
        container.classList.add('speed-warning');
        setTimeout(() => container.classList.remove('speed-warning'), 1500);
    }
    
    // Speed lines effect
    if (speed > 150) {
        speedLines.classList.add('active');
    } else {
        speedLines.classList.remove('active');
    }
}

function updateRPM() {
    const gear = GEAR_RATIOS.find(g => 
        currentSpeed >= g.minSpeed && currentSpeed <= g.maxSpeed
    ) || GEAR_RATIOS[GEAR_RATIOS.length - 1];
    
    if (currentSpeed === 0) {
        currentRPM = isAccelerating ? 1500 : 800;
        currentGear = 0;
        gearValue.textContent = 'N';
    } else {
        const speedRange = gear.maxSpeed - gear.minSpeed;
        const speedInGear = currentSpeed - gear.minSpeed;
        const speedPercent = speedInGear / speedRange;
        
        currentRPM = gear.minRPM + (speedPercent * (gear.maxRPM - gear.minRPM));
        
        if (currentGear !== gear.gear) {
            const oldGear = currentGear;
            currentGear = gear.gear;
            gearValue.textContent = currentGear;
            if (oldGear > 0) playGearShiftSound();
        }
    }
    
    if (isAccelerating) {
        currentRPM = Math.min(currentRPM * 1.2, MAX_RPM * 0.85);
    }
    
    currentRPM = Math.max(800, Math.min(MAX_RPM, currentRPM));
    rpmValue.textContent = (currentRPM / 1000).toFixed(1);
    
    const rpmPercentage = currentRPM / MAX_RPM;
    const circumference = 251.2;
    const offset = circumference - (rpmPercentage * circumference);
    rpmGaugeProgress.style.strokeDashoffset = offset;
    
    const rotation = -90 + (rpmPercentage * 180);
    rpmNeedle.style.transform = `rotate(${rotation}deg)`;
}

function updateTemperature() {
    if (currentSpeed > 0) {
        const heatRate = (currentSpeed / MAX_SPEED) * 0.05;
        currentTemp = Math.min(MAX_TEMP, currentTemp + heatRate);
    } else {
        const coolRate = 0.03;
        currentTemp = Math.max(NORMAL_TEMP, currentTemp - coolRate);
    }
    
    const tempPercent = ((currentTemp - 60) / (MAX_TEMP - 60)) * 100;
    tempGauge.style.width = tempPercent + '%';
    tempValue.textContent = Math.round(currentTemp) + '°C';
    
    if (currentTemp > 110) {
        engineWarning.classList.add('active');
    } else {
        engineWarning.classList.remove('active');
    }
}

function updateFuel() {
    if (currentSpeed > 0) {
        const consumption = (currentSpeed / MAX_SPEED) * 0.0002;
        const modeMultiplier = currentDriveMode === 'eco' ? 0.7 : currentDriveMode === 'sport' ? 1.3 : 1.0;
        currentFuel = Math.max(0, currentFuel - (consumption * modeMultiplier));
        fuelUsed += (consumption * modeMultiplier);
    }
    
    const fuelPercent = (currentFuel / FUEL_TANK) * 100;
    fuelGauge.style.width = fuelPercent + '%';
    fuelValue.textContent = Math.round(fuelPercent) + '%';
    fuelUsedDisplay.textContent = fuelUsed.toFixed(1) + ' L';
    
    if (fuelPercent < 15) {
        fuelWarning.classList.add('active');
    } else {
        fuelWarning.classList.remove('active');
    }
}

function updateTripComputer() {
    if (currentSpeed > 0) {
        distance += (currentSpeed / 3600) * 0.1;
        distanceDisplay.textContent = distance.toFixed(1) + ' km';
        
        if (!tripStartTime) {
            tripStartTime = Date.now();
        }
        
        const elapsed = Math.floor((Date.now() - tripStartTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        tripTimeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // 0-100 km/h timer
    if (currentSpeed >= 1 && currentSpeed < 100 && !zeroToHundredStarted && isAccelerating) {
        zeroToHundredStarted = true;
        zeroToHundredTime = Date.now();
    }
    
    if (zeroToHundredStarted && currentSpeed >= 100 && zeroToHundredTime) {
        const time = ((Date.now() - zeroToHundredTime) / 1000).toFixed(1);
        zeroToHundredDisplay.textContent = time;
        zeroToHundredStarted = false;
        zeroToHundredTime = null;
    }
}

// ===== ANIMATION LOOP =====
function animate() {
    const modeConfig = DRIVE_MODES[currentDriveMode];
    
    if (cruiseControlActive && cruiseSpeed > 0) {
        if (currentSpeed < cruiseSpeed - 1) {
            currentSpeed += modeConfig.acceleration * 0.08;
        } else if (currentSpeed > cruiseSpeed + 1) {
            currentSpeed -= modeConfig.acceleration * 0.08;
        }
    } else if (isAccelerating) {
        currentSpeed += modeConfig.acceleration * 0.1;
        currentSpeed = Math.min(currentSpeed, modeConfig.maxSpeed);
    } else if (isBraking) {
        const brakeRate = currentDriveMode === 'sport' ? 10 : 8;
        currentSpeed -= brakeRate * 0.1;
    } else if (currentSpeed > 0) {
        const deceleration = currentDriveMode === 'eco' ? 0.3 : 0.5;
        currentSpeed -= deceleration * 0.1;
    }
    
    currentSpeed = Math.max(0, Math.min(modeConfig.maxSpeed, currentSpeed));
    
    updateSpeedometer(currentSpeed);
    updateRPM();
    updateEngineSound();
    updateTemperature();
    updateFuel();
    updateTripComputer();
    
    if (isAccelerating || isBraking || cruiseControlActive || currentSpeed > 0.1) {
        animationFrame = requestAnimationFrame(animate);
    } else {
        currentSpeed = 0;
        updateSpeedometer(0);
        updateRPM();
        stopEngineSound();
        animationFrame = null;
    }
}

function startAnimation() {
    if (!animationFrame) {
        animationFrame = requestAnimationFrame(animate);
    }
}

// ===== EVENT LISTENERS =====

// Accelerate
accelerateBtn.addEventListener('mousedown', () => {
    initAudio();
    isAccelerating = true;
    isBraking = false;
    cruiseControlActive = false;
    cruiseWarning.classList.remove('active');
    cruiseBtn.classList.remove('active');
    startEngineSound();
    startAnimation();
});

accelerateBtn.addEventListener('mouseup', () => {
    isAccelerating = false;
});

accelerateBtn.addEventListener('mouseleave', () => {
    isAccelerating = false;
});

accelerateBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    isAccelerating = true;
    isBraking = false;
    cruiseControlActive = false;
    cruiseWarning.classList.remove('active');
    cruiseBtn.classList.remove('active');
    startEngineSound();
    startAnimation();
});

accelerateBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    isAccelerating = false;
});

// Brake
brakeBtn.addEventListener('mousedown', () => {
    initAudio();
    isBraking = true;
    isAccelerating = false;
    cruiseControlActive = false;
    cruiseWarning.classList.remove('active');
    cruiseBtn.classList.remove('active');
    if (currentSpeed > 10) playBrakeSound();
    startAnimation();
});

brakeBtn.addEventListener('mouseup', () => {
    isBraking = false;
});

brakeBtn.addEventListener('mouseleave', () => {
    isBraking = false;
});

brakeBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    initAudio();
    isBraking = true;
    isAccelerating = false;
    cruiseControlActive = false;
    cruiseWarning.classList.remove('active');
    cruiseBtn.classList.remove('active');
    if (currentSpeed > 10) playBrakeSound();
    startAnimation();
});

brakeBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    isBraking = false;
});

// Cruise Control
cruiseBtn.addEventListener('click', () => {
    if (currentSpeed > 30) {
        cruiseControlActive = !cruiseControlActive;
        if (cruiseControlActive) {
            cruiseSpeed = currentSpeed;
            cruiseWarning.classList.add('active');
            cruiseBtn.classList.add('active');
            startAnimation();
        } else {
            cruiseWarning.classList.remove('active');
            cruiseBtn.classList.remove('active');
        }
    }
});

// Reset
resetBtn.addEventListener('click', () => {
    isAccelerating = false;
    isBraking = false;
    cruiseControlActive = false;
    currentSpeed = 0;
    maxSpeed = 0;
    speedHistory = [];
    distance = 0;
    tripStartTime = null;
    fuelUsed = 0;
    currentFuel = FUEL_TANK;
    currentTemp = NORMAL_TEMP;
    zeroToHundredStarted = false;
    zeroToHundredTime = null;
    stopEngineSound();
    updateSpeedometer(0);
    updateRPM();
    updateTemperature();
    updateFuel();
    maxSpeedDisplay.textContent = '0';
    avgSpeedDisplay.textContent = '0';
    zeroToHundredDisplay.textContent = '--';
    distanceDisplay.textContent = '0.0 km';
    tripTimeDisplay.textContent = '00:00';
    cruiseWarning.classList.remove('active');
    cruiseBtn.classList.remove('active');
    speedLines.classList.remove('active');
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('night-mode');
});

// Engine Type
engineTypeSelect.addEventListener('change', (e) => {
    currentEngineType = e.target.value;
    if (isEngineSoundPlaying) {
        stopEngineSound();
        setTimeout(() => {
            if (isAccelerating || cruiseControlActive || currentSpeed > 0) {
                startEngineSound();
            }
        }, 100);
    }
});

// Drive Mode
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDriveMode = btn.dataset.mode;
    });
});

// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (!isAccelerating) {
            initAudio();
            isAccelerating = true;
            isBraking = false;
            cruiseControlActive = false;
            cruiseWarning.classList.remove('active');
            cruiseBtn.classList.remove('active');
            startEngineSound();
            startAnimation();
        }
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!isBraking) {
            initAudio();
            isBraking = true;
            isAccelerating = false;
            cruiseControlActive = false;
            cruiseWarning.classList.remove('active');
            cruiseBtn.classList.remove('active');
            if (currentSpeed > 10) playBrakeSound();
            startAnimation();
        }
    } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        cruiseBtn.click();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        isAccelerating = false;
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        isBraking = false;
    }
});

// ===== INITIALIZATION =====
updateSpeedometer(0);
updateRPM();
updateTemperature();
updateFuel();
cruiseWarning.classList.remove('active');
