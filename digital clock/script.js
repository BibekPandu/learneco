// DOM Content Loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initTheme();
  initClock();
  initTimer();
  initModeSwitcher();
  initPresets();

  // Start the clock
  updateClock();
  setInterval(updateClock, 1000);
});

// Theme Management
function initTheme() {
  const themeBtn = document.getElementById("themeBtn");
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem("clockTheme");
  if (savedTheme === "light") {
    body.classList.add("light-theme");
    themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }

  themeBtn.addEventListener("click", function () {
    body.classList.toggle("light-theme");

    if (body.classList.contains("light-theme")) {
      themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
      localStorage.setItem("clockTheme", "light");
    } else {
      themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
      localStorage.setItem("clockTheme", "dark");
    }
  });
}

// Clock Functionality
function initClock() {
  updateClock();
  updateDate();
  updateClockInfo();
}

function updateClock() {
  const now = new Date();
  const timeElement = document.getElementById("currentTime");
  const periodElement = document.getElementById("currentPeriod");

  // Format time
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  // Convert to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12

  const timeString = `${hours
    .toString()
    .padStart(2, "0")}:${minutes}:${seconds}`;

  timeElement.textContent = timeString;
  periodElement.textContent = period;
}

function updateDate() {
  const now = new Date();
  const dateElement = document.getElementById("currentDate");

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const dateString = now.toLocaleDateString("en-US", options);

  dateElement.textContent = dateString;
}

function updateClockInfo() {
  const now = new Date();
  const dayOfYearElement = document.getElementById("dayOfYear");
  const weekNumberElement = document.getElementById("weekNumber");

  // Calculate day of year
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  // Calculate week number
  const weekNumber = getWeekNumber(now);

  dayOfYearElement.textContent = `Day ${dayOfYear}`;
  weekNumberElement.textContent = `Week ${weekNumber}`;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Timer Functionality
let timerInterval;
let totalSeconds = 0;
let remainingSeconds = 0;
let isRunning = false;
let isPaused = false;

function initTimer() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");
  const hoursInput = document.getElementById("hours");
  const minutesInput = document.getElementById("minutes");
  const secondsInput = document.getElementById("seconds");

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  // Input validation
  [hoursInput, minutesInput, secondsInput].forEach((input) => {
    input.addEventListener("input", function () {
      const value = parseInt(this.value) || 0;
      const max = parseInt(this.max);

      if (value > max) {
        this.value = max;
      } else if (value < 0) {
        this.value = 0;
      }

      updateTimerDisplay();
    });
  });
}

function startTimer() {
  if (!isRunning) {
    // Get time from inputs
    const hours = parseInt(document.getElementById("hours").value) || 0;
    const minutes = parseInt(document.getElementById("minutes").value) || 0;
    const seconds = parseInt(document.getElementById("seconds").value) || 0;

    totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) {
      showNotification("Please set a valid time!", "error");
      return;
    }

    remainingSeconds = totalSeconds;
    isRunning = true;
    isPaused = false;

    // Update UI
    document.getElementById("startBtn").disabled = true;
    document.getElementById("pauseBtn").disabled = false;

    // Start countdown
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
  }
}

function pauseTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    isPaused = true;

    // Update UI
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;

    document.getElementById("startBtn").innerHTML =
      '<i class="fas fa-play"></i><span>Resume</span>';
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isPaused = false;
  remainingSeconds = 0;

  // Reset inputs
  document.getElementById("hours").value = 0;
  document.getElementById("minutes").value = 0;
  document.getElementById("seconds").value = 0;

  // Update UI
  document.getElementById("startBtn").disabled = false;
  document.getElementById("pauseBtn").disabled = true;
  document.getElementById("startBtn").innerHTML =
    '<i class="fas fa-play"></i><span>Start</span>';

  updateTimerDisplay();
  updateProgressRing(0);
}

function updateTimer() {
  remainingSeconds--;

  if (remainingSeconds <= 0) {
    // Timer finished
    clearInterval(timerInterval);
    isRunning = false;
    remainingSeconds = 0;

    // Update UI
    document.getElementById("startBtn").disabled = false;
    document.getElementById("pauseBtn").disabled = true;
    document.getElementById("startBtn").innerHTML =
      '<i class="fas fa-play"></i><span>Start</span>';

    // Play sound and show notification
    playTimerSound();
    showNotification("Timer Complete!", "success");

    // Vibration (if supported)
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  updateTimerDisplay();
  updateProgressRing();
}

function updateTimerDisplay() {
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const timeString = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  document.getElementById("timerDisplay").textContent = timeString;
}

function updateProgressRing() {
  const progressPercent =
    totalSeconds > 0
      ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100
      : 0;
  const progressElement = document.querySelector(".progress-fill");
  const progressText = document.getElementById("progressPercent");

  // Update progress ring
  const circumference = 2 * Math.PI * 90; // r = 90
  const offset = circumference - (progressPercent / 100) * circumference;
  progressElement.style.strokeDashoffset = offset;

  // Update percentage text
  progressText.textContent = `${Math.round(progressPercent)}%`;
}

// Mode Switcher
function initModeSwitcher() {
  const modeBtns = document.querySelectorAll(".mode-btn");
  const clockMode = document.getElementById("clockMode");
  const timerMode = document.getElementById("timerMode");

  modeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const mode = this.dataset.mode;

      // Update active button
      modeBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Show/hide modes
      if (mode === "clock") {
        clockMode.classList.add("active");
        timerMode.classList.remove("active");
      } else {
        timerMode.classList.add("active");
        clockMode.classList.remove("active");
      }
    });
  });
}

// Timer Presets
function initPresets() {
  const presetBtns = document.querySelectorAll(".preset-btn");

  presetBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const seconds = parseInt(this.dataset.time);
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      document.getElementById("hours").value = hours;
      document.getElementById("minutes").value = minutes;
      document.getElementById("seconds").value = secs;

      updateTimerDisplay();

      // Switch to timer mode
      document.querySelector('[data-mode="timer"]').click();
    });
  });
}

// Sound and Notification
function playTimerSound() {
  const audio = document.getElementById("timerSound");
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch((e) => console.log("Audio play failed:", e));
  }
}

function showNotification(message, type = "info") {
  const notification = document.getElementById("notification");
  const notificationContent = notification.querySelector("span");

  notificationContent.textContent = message;

  // Update notification style based on type
  notification.className = `notification notification-${type}`;

  // Show notification
  notification.classList.add("show");

  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Add CSS for notification types
const notificationStyles = `
    .notification-success {
        background: #00ff41;
        color: #000;
    }
    
    .notification-error {
        background: #ff6b6b;
        color: #fff;
    }
    
    .notification-info {
        background: #3498db;
        color: #fff;
    }
`;

// Inject notification styles
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  // Space bar to start/pause timer
  if (
    e.code === "Space" &&
    document.getElementById("timerMode").classList.contains("active")
  ) {
    e.preventDefault();
    const startBtn = document.getElementById("startBtn");
    const pauseBtn = document.getElementById("pauseBtn");

    if (!startBtn.disabled) {
      startTimer();
    } else if (!pauseBtn.disabled) {
      pauseTimer();
    }
  }

  // Escape to reset timer
  if (
    e.code === "Escape" &&
    document.getElementById("timerMode").classList.contains("active")
  ) {
    resetTimer();
  }

  // R key to reset timer
  if (
    e.code === "KeyR" &&
    document.getElementById("timerMode").classList.contains("active")
  ) {
    resetTimer();
  }
});

// Add smooth animations for better UX
function addSmoothAnimations() {
  // Add entrance animation
  const container = document.querySelector(".clock-container");
  container.style.opacity = "0";
  container.style.transform = "translateY(20px)";

  setTimeout(() => {
    container.style.transition = "all 0.5s ease";
    container.style.opacity = "1";
    container.style.transform = "translateY(0)";
  }, 100);
}

// Initialize smooth animations
addSmoothAnimations();

// Add hover effects for better interactivity
document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {
    button.addEventListener("mouseenter", function () {
      this.style.transform = "scale(1.05)";
    });

    button.addEventListener("mouseleave", function () {
      this.style.transform = "scale(1)";
    });
  });
});

// Add focus management for accessibility
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    // Add focus indicators
    const focusableElements = document.querySelectorAll(
      "button, input, select, textarea"
    );
    focusableElements.forEach((el) => {
      el.addEventListener("focus", function () {
        this.style.outline = "2px solid #00ff41";
        this.style.outlineOffset = "2px";
      });

      el.addEventListener("blur", function () {
        this.style.outline = "";
        this.style.outlineOffset = "";
      });
    });
  }
});
