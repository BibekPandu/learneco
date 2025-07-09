AOS.init({
  duration: 1000,
  once: true,
});

// Dark mode toggle
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector("i");

// Function to set the theme
function setTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem("theme", theme); // Save preference to local storage

  // Update the icon
  if (theme === "dark") {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  } else {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  }
}

// Check for saved theme preference on page load
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme) {
    setTheme(savedTheme); // Apply saved theme
  } else if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    // If no saved preference, check system preference
    setTheme("dark");
  } else {
    setTheme("light"); // Default to light if nothing is preferred
  }

  // Image loading animation (kept your existing code here)
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    img.addEventListener("load", function () {
      this.classList.add("loaded");
    });
    if (img.complete) {
      img.classList.add("loaded");
    }
  });
});

// Add click listener to the toggle button
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme;
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme); // Toggle and save the new theme
});
