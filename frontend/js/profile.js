// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Set user data from localStorage
  setUserData();
  
  // Initialize profile functionality
  initProfile();
});


// Set user data from localStorage
function setUserData() {
  // Get user data from localStorage
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  if (userData) {
    // Set user name in welcome message
    const userNameElements = document.querySelectorAll('#user-name');
    userNameElements.forEach(element => {
      if (element) {
        // Try to use profileData first, fall back to userData if needed
        const profileData = JSON.parse(localStorage.getItem('profileData'));
        if (profileData && profileData.fullName) {
          element.textContent = profileData.fullName; // Use full name from profile
        } else if (userData && userData.name) {
          element.textContent = userData.name; // Fallback to userData.name
        }
      }
    });
    
    // Set email in the form
    const emailInput = document.getElementById('email');
    if (emailInput && userData.email) {
      emailInput.value = userData.email;
    }
  }
}

// Profile functionality
function initProfile() {
  const profileView = document.getElementById('profile-view');
  const profileForm = document.getElementById('profile-form');
  const editProfileBtn = document.getElementById('edit-profile-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const healthProfileForm = document.getElementById('health-profile-form');
  const formTitle = document.getElementById('form-title');
  
  // Check if profile exists
  fetchProfile();
  
  // Edit profile button
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      profileView.style.display = 'none';
      profileForm.style.display = 'block';
      formTitle.textContent = 'Edit Your Profile';
      
      // Populate form with existing data
      populateProfileForm();
    });
  }
  
  // Cancel button
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      profileForm.style.display = 'none';
      profileView.style.display = 'block';
    });
  }
  
  // Form submission
  if (healthProfileForm) {
    healthProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (validateForm()) {
        const profileData = {
          fullName: document.getElementById('fullName').value,
          dateOfBirth: document.getElementById('dateOfBirth').value,
          gender: document.getElementById('gender').value,
          bloodGroup: document.getElementById('bloodGroup').value,
          phoneNumber: document.getElementById('phoneNumber').value,
          address: document.getElementById('address').value,
          medicalHistory: document.getElementById('medicalHistory').value
        };
        
        // Check if we're creating or updating
        const isUpdate = localStorage.getItem('profileExists') === 'true';
        
        if (isUpdate) {
          updateProfile(profileData);
        } else {
          createProfile(profileData);
        }
      }
    });
  }
}

// Fetch profile from API
async function fetchProfile() {
  showLoading();
  
  try {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    if (!userData || !userData.id) {
      throw new Error('User data not found');
    }
    
    const response = await fetch('http://localhost:5000/api/profile/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Profile exists
      localStorage.setItem('profileExists', 'true');
      localStorage.setItem('profileData', JSON.stringify(data.data));
      
      // Display profile data
      displayProfileData(data.data);
      
      // Show profile view
      document.getElementById('profile-view').style.display = 'block';
      document.getElementById('profile-form').style.display = 'none';
    } else {
      // Profile doesn't exist
      localStorage.setItem('profileExists', 'false');
      
      // Show profile form
      document.getElementById('profile-view').style.display = 'none';
      document.getElementById('profile-form').style.display = 'block';
    }
  } catch (error) {
    console.error('Error fetching profile:', error);
    showNotification('Error fetching profile. Please try again.', 'error');
    
    // Show profile form as fallback
    document.getElementById('profile-view').style.display = 'none';
    document.getElementById('profile-form').style.display = 'block';
  } finally {
    hideLoading();
  }
}

// Display profile data in view mode
function displayProfileData(profileData) {
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  // Set profile name and email
  document.getElementById('profile-name').textContent = profileData.fullName;
  document.getElementById('profile-email').textContent = userData ? userData.email : '';
  
  // Format date of birth
  const dob = new Date(profileData.dateOfBirth);
  const formattedDob = dob.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Set other profile details
  document.getElementById('profile-dob').textContent = formattedDob;
  document.getElementById('profile-gender').textContent = profileData.gender;
  document.getElementById('profile-blood').textContent = profileData.bloodGroup;
  document.getElementById('profile-phone').textContent = profileData.phoneNumber;
  document.getElementById('profile-address').textContent = profileData.address;
  document.getElementById('profile-medical').textContent = profileData.medicalHistory || 'No medical history provided';
}

// Populate form with existing profile data
function populateProfileForm() {
  const profileData = JSON.parse(localStorage.getItem('profileData'));
  
  if (profileData) {
    // Format date for input
    const dob = new Date(profileData.dateOfBirth);
    const formattedDob = dob.toISOString().split('T')[0];
    
    // Set form values
    document.getElementById('fullName').value = profileData.fullName;
    document.getElementById('dateOfBirth').value = formattedDob;
    document.getElementById('gender').value = profileData.gender;
    document.getElementById('bloodGroup').value = profileData.bloodGroup;
    document.getElementById('phoneNumber').value = profileData.phoneNumber;
    document.getElementById('address').value = profileData.address;
    document.getElementById('medicalHistory').value = profileData.medicalHistory || '';
  }
}

// Create new profile
async function createProfile(profileData) {
  showLoading();
  
  try {
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Profile created successfully
      localStorage.setItem('profileExists', 'true');
      localStorage.setItem('profileData', JSON.stringify(data.data));
      
      // Display profile data
      displayProfileData(data.data);
      
      // Show profile view
      document.getElementById('profile-view').style.display = 'block';
      document.getElementById('profile-form').style.display = 'none';
      
      showNotification('Profile created successfully!', 'success');
      
      // Add activity for profile creation
      await createActivity('profile_update', 'Created health profile');
    } else {
      showNotification(data.message || 'Error creating profile', 'error');
    }
  } catch (error) {
    console.error('Error creating profile:', error);
    showNotification('Error creating profile. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

// Update existing profile
async function updateProfile(profileData) {
  showLoading();
  
  try {
    const response = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Profile updated successfully
      localStorage.setItem('profileData', JSON.stringify(data.data));
      
      // Display profile data
      displayProfileData(data.data);
      
      // Show profile view
      document.getElementById('profile-view').style.display = 'block';
      document.getElementById('profile-form').style.display = 'none';
      
      showNotification('Profile updated successfully!', 'success');
      
      // Add activity for profile update
      await createActivity('profile_update', 'Updated health profile');
    } else {
      showNotification(data.message || 'Error updating profile', 'error');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showNotification('Error updating profile. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

// Create activity without causing duplicates
async function createActivity(type, description) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found when trying to add activity');
      return;
    }
    
    // Check if this is a duplicate activity within the last minute
    const response = await fetch('http://localhost:5000/api/activities', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const activities = await response.json();
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60000); // 1 minute ago
      
      // Check if there's a recent identical activity
      const recentDuplicate = activities.find(activity => 
        activity.type === type && 
        activity.description === description &&
        new Date(activity.timestamp) > oneMinuteAgo
      );
      
      if (recentDuplicate) {
        console.log('Prevented duplicate activity');
        return;
      }
    }
    
    // Create new activity
    const createResponse = await fetch('http://localhost:5000/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        description
      })
    });
    
    // Log the response for debugging
    const data = await createResponse.json();
    console.log('Activity creation response:', data);
    
    // Don't need to refresh activities here as dashboard will handle that
  } catch (error) {
    console.error('Error creating activity:', error);
  }
}

// Form validation
function validateForm() {
  let isValid = true;
  
  // Clear previous errors
  clearErrors();
  
  // Validate full name
  const fullName = document.getElementById('fullName').value;
  if (!fullName) {
    displayError('fullName-error', 'Full name is required');
    isValid = false;
  }
  
  // Validate date of birth
  const dateOfBirth = document.getElementById('dateOfBirth').value;
  if (!dateOfBirth) {
    displayError('dateOfBirth-error', 'Date of birth is required');
    isValid = false;
  } else {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    if (dob > today) {
      displayError('dateOfBirth-error', 'Date of birth cannot be in the future');
      isValid = false;
    }
  }
  
  // Validate gender
  const gender = document.getElementById('gender').value;
  if (!gender) {
    displayError('gender-error', 'Please select your gender');
    isValid = false;
  }
  
  // Validate blood group
  const bloodGroup = document.getElementById('bloodGroup').value;
  if (!bloodGroup) {
    displayError('bloodGroup-error', 'Please select your blood group');
    isValid = false;
  }
  
  // Validate phone number
  const phoneNumber = document.getElementById('phoneNumber').value;
  if (!phoneNumber) {
    displayError('phoneNumber-error', 'Phone number is required');
    isValid = false;
  } else if (!isValidPhone(phoneNumber)) {
    displayError('phoneNumber-error', 'Please enter a valid phone number');
    isValid = false;
  }
  
  // Validate address
  const address = document.getElementById('address').value;
  if (!address) {
    displayError('address-error', 'Address is required');
    isValid = false;
  }
  
  return isValid;
}

// Helper function to validate phone number
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
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

// Loading spinner
function showLoading() {
  let loadingOverlay = document.querySelector('.loading-overlay');
  
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingOverlay);
  }
  
  loadingOverlay.style.display = 'flex';
}

function hideLoading() {
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'none';
  }
}

// Notification
function showNotification(message, type = 'success') {
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set type class
  notification.className = 'notification';
  notification.classList.add(`notification-${type}`);
  
  notification.textContent = message;
  notification.style.display = 'block';
  notification.classList.add('fade-in');
  
  setTimeout(() => {
    notification.classList.remove('fade-in');
    notification.style.display = 'none';
  }, 3000);
}
