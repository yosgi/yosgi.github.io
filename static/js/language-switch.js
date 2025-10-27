// Language switching functionality
function switchLanguage(lang) {
  const currentPath = window.location.pathname;
  let newPath;
  
  if (lang === 'en') {
    // Switch to English
    if (currentPath.startsWith('/zh')) {
      newPath = currentPath.replace('/zh', '');
    } else {
      newPath = currentPath;
    }
  } else if (lang === 'zh') {
    // Switch to Chinese
    if (currentPath.startsWith('/zh')) {
      newPath = currentPath;
    } else {
      newPath = '/zh' + currentPath;
    }
  }
  
  // Navigate to the new path
  window.location.href = newPath;
}

// Navigation functions
function goToHome() {
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/zh')) {
    window.location.href = '/zh/';
  } else {
    window.location.href = '/';
  }
}

function goToPosts() {
  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/zh')) {
    window.location.href = '/zh/post/';
  } else {
    window.location.href = '/en/post/';
  }
}

// Theme switching functionality
function switchTheme() {
  const currentTheme = localStorage.getItem('data-color-mode') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  localStorage.setItem('data-color-mode', newTheme);
  
  // Apply theme change
  document.documentElement.setAttribute('data-color-mode', newTheme);
  
  // Update theme toggle button
  const toggleButton = document.querySelector('.profile-color-modes-toggle-thumb');
  if (toggleButton) {
    const svg = toggleButton.querySelector('svg');
    if (svg) {
      if (newTheme === 'dark') {
        svg.style.fill = 'var(--color-profile-color-modes-toggle-sun)';
      } else {
        svg.style.fill = 'var(--color-profile-color-modes-toggle-moon)';
      }
    }
  }
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  const savedTheme = localStorage.getItem('data-color-mode') || 'light';
  document.documentElement.setAttribute('data-color-mode', savedTheme);
});
