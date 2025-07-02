/**
 * Logout function for Heal Track healthcare web app
 * Clears user authentication data and redirects to login page
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get references to logout buttons
  const navbarLogoutBtn = document.querySelector('.logout-btn');
  
  // Attach event listeners to logout buttons if they exist
  if (navbarLogoutBtn) {
    navbarLogoutBtn.addEventListener('click', logout);
  }
  
});

/**
 * Logout function that clears user session data and redirects to login page
 */
function logout() {
  // Clear authentication token from storage
  localStorage.removeItem('token');
  
  // Clear user data from storage
  localStorage.removeItem('userData');
  
  // Optional: Clear any other session-related data
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = 'index.html';
}