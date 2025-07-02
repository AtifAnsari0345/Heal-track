// Global variables
let generatedOTP = null;
let isOTPVerified = false;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Login form handling
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Signup form handling
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
});

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  // Reset error messages
  clearErrors();
  
  // Get form data
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  // Validate form data
  let isValid = true;
  
  if (!email) {
    displayError('email-error', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    displayError('email-error', 'Please enter a valid email');
    isValid = false;
  }
  
  if (!password) {
    displayError('password-error', 'Password is required');
    isValid = false;
  }
  
  if (!isValid) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Login successful
      alert('Login successful!');
      // Redirect to dashboard
      window.location.href = 'dashboard.html';
    } else {
      // Login failed
      displayError('password-error', data.message || 'Login failed. Please check your credentials.');
    }
  } catch (error) {
    displayError('password-error', 'An error occurred. Please try again later.');
    console.error('Login error:', error);
  }
}

// Handle signup form submission
async function handleSignup(e) {
  e.preventDefault();
  
  // Reset error messages
  clearErrors();
  
  // Get form data
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;
  
  // Validate form data
  let isValid = true;
  
  if (!name) {
    displayError('name-error', 'Full name is required');
    isValid = false;
  }
  
  if (!email) {
    displayError('email-error', 'Email is required');
    isValid = false;
  } else if (!isValidEmail(email)) {
    displayError('email-error', 'Please enter a valid email');
    isValid = false;
  }
  
  if (!phone) {
    displayError('phone-error', 'Phone number is required');
    isValid = false;
  }
  
  if (!password) {
    displayError('password-error', 'Password is required');
    isValid = false;
  } else if (password.length < 6) {
    displayError('password-error', 'Password must be at least 6 characters');
    isValid = false;
  }
  
  if (!confirmPassword) {
    displayError('confirm-password-error', 'Please confirm your password');
    isValid = false;
  } else if (password !== confirmPassword) {
    displayError('confirm-password-error', 'Passwords do not match');
    isValid = false;
  }
  
  if (!isValid) return;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Store token and user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Registration successful
      alert('Registration successful! Redirecting to dashboard.');
      window.location.href = 'dashboard.html';
    } else {
      // Registration failed
      displayError('email-error', data.message || 'Registration failed. Please try again.');
    }
  } catch (error) {
    displayError('email-error', 'An error occurred. Please try again later.');
    console.error('Registration error:', error);
  }
}

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
}

// Helper function to display error messages
function displayError(elementId, message) {
  const errorElement = document.getElementById(elementId);
  if (errorElement) {
    errorElement.textContent = message;
  }
}

// Helper function to clear all error messages
function clearErrors() {
  const errorElements = document.querySelectorAll('.error');
  errorElements.forEach(element => {
    element.textContent = '';
  });
}