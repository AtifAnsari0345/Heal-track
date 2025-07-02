// Define API base URL for all fetch calls
const API_BASE_URL = 'http://localhost:5000'; // Adjust this to match your backend URL

// Get user data from localStorage
const userData = JSON.parse(localStorage.getItem('userData')) || {
  name: "Guest",
  recentActivities: []
};

// Global variables for medicine store
let medicines = [];
let currentCategory = 'all';
let selectedMedicine = null;
let orderQuantity = 1;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Set user name in welcome message
  const userNameElements = document.querySelectorAll('#user-name, #header-user-name');
  userNameElements.forEach(element => {
    if (element) {
      // Try to use profileData first, fall back to userData if needed
      const profileData = JSON.parse(localStorage.getItem('profileData'));
      if (profileData && profileData.fullName) {
        element.textContent = profileData.fullName; // Use full name from profile
      } else {
        element.textContent = userData.name; // Fallback to userData.name
      }
    }
  });
  
  // Initialize modals
  initModals();
  
  // Populate recent activities
  populateActivities();
  
  // Initialize form submissions
  initForms();
  
  // Add hover effects and animations
  addInteractivity();
  
  // Initialize orders count
  initializeOrdersCount();
  
  // Initialize medicine store
  initMedicineStore();
  
  // Initialize hospital features
  initHospitalFeatures();
  
  // Initialize home doctors
  initHomeDoctors();
  
  // Add event listener for clearAllBtn
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', clearActivities);
  }
});

// Modal functionality
function initModals() {
  // Service buttons
  const emergencyBtn = document.getElementById('emergency-btn');
  const appointmentBtn = document.getElementById('appointment-btn');
  const medicineBtn = document.getElementById('medicine-btn');
  const homeVisitBtn = document.getElementById('home-visit-btn');
  
  // Modals
  const emergencyModal = document.getElementById('emergency-modal');
  const appointmentModal = document.getElementById('appointment-modal');
  const medicineModal = document.getElementById('medicine-modal');
  const homeVisitModal = document.getElementById('home-visit-modal');
  
  // Close buttons
  const closeButtons = document.querySelectorAll('.close-modal');
  
  // Open modals - removing emergency button handler as it's handled in initHospitalFeatures
  if (appointmentBtn && appointmentModal) {
    appointmentBtn.addEventListener('click', () => openModal(appointmentModal));
  }
  
  if (medicineBtn && medicineModal) {
    medicineBtn.addEventListener('click', () => openModal(medicineModal));
  }
  
  if (homeVisitBtn && homeVisitModal) {
    homeVisitBtn.addEventListener('click', () => openModal(homeVisitModal));
  }
  
  // Close modals
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) closeModal(modal);
    });
  });
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  });
}

function openModal(modal) {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  // Add animation
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.add('slide-in');
  }
}

function closeModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
  
  // Remove animation class
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.remove('slide-in');
  }
}

// Populate activities
async function populateActivities() {
    const activitiesList = document.getElementById('activity-list');
    const activityItems = document.getElementById('activity-items');
    const emptyState = document.getElementById('empty-activity');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const spinner = document.getElementById('activitySpinner');

    // Add a flag to prevent duplicate fetches in quick succession
    if (window.isFetchingActivities) {
        console.log('Already fetching activities, skipping duplicate fetch');
        return;
    }

    if (!activitiesList || !activityItems || !emptyState || !clearAllBtn) {
        console.error('One or more activity elements not found in the DOM.');
        return; // Exit if elements are not found to prevent errors
    }

    activityItems.innerHTML = ''; // Clear existing activities
    spinner.style.display = 'block'; // Show spinner

    try {
        window.isFetchingActivities = true; // Set the flag
        
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Token exists' : 'No token');
        
        if (!token) {
            console.error('No token found. User not authenticated.');
            spinner.style.display = 'none';
            emptyState.style.display = 'block';
            clearAllBtn.style.display = 'none';
            return;
        }

        // Fetch activities from backend
        console.log('Fetching activities...');
        const response = await fetch(`${API_BASE_URL}/api/activities`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const activities = await response.json();
        console.log('Activities received:', activities);

        if (activities.length === 0) {
            emptyState.style.display = 'block';
            activityItems.style.display = 'none';
            clearAllBtn.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            activityItems.style.display = 'block';
            clearAllBtn.style.display = 'block';
            
            // Sort activities by timestamp (newest first)
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            activities.forEach(activity => {
                const iconMap = {
                    'appointment': 'calendar-check',
                    'medicine': 'pills',
                    'emergency': 'first-aid',
                    'profile_update': 'user-edit',
                    'login': 'sign-in-alt',
                    'logout': 'sign-out-alt',
                    'home_visit': 'home',
                    'medicine_order': 'prescription-bottle-alt'
                };
                const iconClass = iconMap[activity.type] || 'info-circle'; // Default icon
                
                // Format the timestamp
                const timestamp = new Date(activity.timestamp);
                const now = new Date();
                const diffMs = now - timestamp;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(diffMs / (1000 * 60));
                
                let timeAgo;
                if (diffMinutes < 1) {
                    timeAgo = 'Just now';
                } else if (diffMinutes < 60) {
                    timeAgo = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
                } else if (diffHours < 24) {
                    timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                } else {
                    timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                }

                const activityItem = document.createElement('li');
                activityItem.className = 'activity-item';
                activityItem.setAttribute('data-type', activity.type);
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-description">${activity.description}</div>
                        <div class="activity-time">
                            <i class="fas fa-clock"></i>
                            <span>${timeAgo}</span>
                            <span class="full-date" title="${timestamp.toLocaleString()}">${timestamp.toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
                activityItems.appendChild(activityItem);
            });
        }
    } catch (error) {
        console.error('Error fetching activities:', error);
        emptyState.style.display = 'block';
        activityItems.style.display = 'none';
        clearAllBtn.style.display = 'none';
    } finally {
        spinner.style.display = 'none'; // Hide spinner
        window.isFetchingActivities = false; // Reset the flag
        
        // Add a small delay before allowing another fetch
        setTimeout(() => {
            window.isFetchingActivities = false;
        }, 1000);
    }
}

// Form submissions
function initForms() {
  const appointmentForm = document.getElementById('appointment-form');
  const homeVisitForm = document.getElementById('home-visit-form');
  
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showLoading();
      
      const specialization = document.getElementById('specialization').value;
      const hospitalId = document.getElementById('hospital').value;
      const hospitalName = document.getElementById('hospital').options[document.getElementById('hospital').selectedIndex].text;
      const appointmentDate = document.getElementById('appointment-date').value;
      const appointmentTime = document.getElementById('appointment-time').value;
      const notes = document.getElementById('appointment-notes').value;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            doctorName: 'To be assigned', // Will be assigned by hospital
            specialization,
            hospitalName,
            hospitalId,
            appointmentDate,
            appointmentTime,
            notes
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          hideLoading();
          closeModal(document.getElementById('appointment-modal'));
          showNotification('Appointment scheduled successfully!');
          
          // Store in localStorage for recent activity
          addActivity('appointment', `Booked appointment at ${hospitalName} for ${specialization}`);
        } else {
          throw new Error(data.message || 'Failed to schedule appointment');
        }
      } catch (error) {
        console.error('Error scheduling appointment:', error);
        hideLoading();
        showError(error.message || 'Failed to schedule appointment');
      }
    });
  }
  
  if (homeVisitForm) {
    homeVisitForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await bookHomeVisit();
    });
  }
}

// Add a new activity and update UI
async function addActivity(type, action) {
  console.log(`Adding activity: ${type} - ${action}`);
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found when trying to add activity');
      return;
    }
    
    // Check if this is a duplicate activity within the last minute
    const response = await fetch(`${API_BASE_URL}/api/activities`, {
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
        activity.description === action &&
        new Date(activity.timestamp) > oneMinuteAgo
      );
      
      if (recentDuplicate) {
        console.log('Prevented duplicate activity');
        return; // Don't add duplicate activity
      }
    }
    
    console.log('Sending activity to server:', { type, description: action });
    const createResponse = await fetch(`${API_BASE_URL}/api/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type,
        description: action
      })
    });
    
    const data = await createResponse.json();
    console.log('Activity creation response:', data);
    
    if (createResponse.ok) {
      // Only refresh activities if this is a new activity
      await populateActivities();
    } else {
      console.error('Failed to add activity:', data.message);
    }
  } catch (error) {
    console.error('Error adding activity:', error);
  }
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
function showNotification(message) {
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.display = 'block';
  notification.classList.add('fade-in');
  
  setTimeout(() => {
    notification.classList.remove('fade-in');
    notification.style.display = 'none';
  }, 3000);
}

function showSuccess(message) {
    showNotification(message);
}

function showError(message) {
    showNotification(message);
}

// Clear all activities for the current user
async function clearActivities() {
  if (confirm('Are you sure you want to clear all your recent activities?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/activities`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showNotification('All activities cleared successfully!');
        populateActivities(); // Refresh the list
      } else {
        showError('Failed to clear activities.');
      }
    } catch (error) {
      console.error('Error clearing activities:', error);
      showError('An error occurred while clearing activities.');
    }
  }
}

// Add interactivity
function addInteractivity() {
  // Add hover effects to cards
  const cards = document.querySelectorAll('.dashboard-card, .service-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
  
  // Load activities from localStorage if available
  try {
    const savedActivities = localStorage.getItem('recentActivities');
    if (savedActivities) {
      const parsedActivities = JSON.parse(savedActivities);
      if (Array.isArray(parsedActivities)) {
        userData.recentActivities = parsedActivities;
        // Re-populate activities
        populateActivities();
      }
    } else {
      // Clear any existing activities for new users
      userData.recentActivities = [];
      populateActivities();
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    // On error, clear activities
    userData.recentActivities = [];
    populateActivities();
  }
}

// Add this function to manage orders count
function initializeOrdersCount() {
    const ordersCount = localStorage.getItem('ordersCount') || 0;
    const ordersSummary = document.querySelector('.dashboard-card:nth-child(2) .card-stat');
    if (ordersSummary) {
        ordersSummary.textContent = `${ordersCount} ${ordersCount === 1 ? 'Order' : 'Orders'}`;
    }
}

// Update the confirmOrder function
async function confirmOrder() {
    if (!selectedMedicine) return;

    try {
        showLoading();
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/medicines/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                medicineId: selectedMedicine.id,
                quantity: orderQuantity
            })
        });

        const data = await response.json();

        if (data.success) {
            // Update the orders count in localStorage and UI
            const currentCount = parseInt(localStorage.getItem('ordersCount')) || 0;
            const newCount = currentCount + 1;
            localStorage.setItem('ordersCount', newCount);

            const ordersSummary = document.querySelector('.dashboard-card:nth-child(2) .card-stat');
            if (ordersSummary) {
                ordersSummary.textContent = `${newCount} ${newCount === 1 ? 'Order' : 'Orders'}`;
            }

            // Add to recent activities
            const totalPrice = selectedMedicine.price * orderQuantity;
            addActivity(
                'medicine',
                `Ordered ${orderQuantity} ${orderQuantity > 1 ? 'units' : 'unit'} of ${selectedMedicine.name} for ₹${totalPrice}`
            );

            // Show success message with total amount
            showSuccess(`Order placed successfully! Total amount: ₹${totalPrice}`);
            await loadMedicines(); // Reload medicines to update stock
        } else {
            showError(data.message || 'Failed to place order');
        }
    } catch (error) {
        console.error('Error ordering medicine:', error);
        showError('Failed to place order');
    } finally {
        hideLoading();
        closeQuantityModal();
    }
}

// Add this function to handle out-of-stock medicines for admin
async function updateMedicineStock(medicineId, newStock) {
    try {
        showLoading();
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/medicines/${medicineId}/stock`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ stock: newStock })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess('Stock updated successfully!');
            await loadMedicines(); // Reload medicines to show updated stock
        } else {
            showError(data.message || 'Failed to update stock');
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        showError('Failed to update stock');
    } finally {
        hideLoading();
    }
}

// Update the displayMedicines function to include price in orderMedicine call
function displayMedicines() {
    const medicineList = document.getElementById('medicine-list');
    const searchQuery = document.getElementById('medicine-search')?.value.toLowerCase() || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Add admin check
    
    const filteredMedicines = medicines.filter(medicine => {
        const matchesSearch = medicine.name.toLowerCase().includes(searchQuery);
        const matchesCategory = currentCategory === 'all' || medicine.type === currentCategory;
        return matchesSearch && matchesCategory;
    });

    if (filteredMedicines.length === 0) {
        medicineList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <p>No medicines found</p>
            </div>
        `;
        return;
    }

    medicineList.innerHTML = filteredMedicines.map(medicine => `
        <div class="medicine-card">
            <h3>${medicine.name}</h3>
            <div class="medicine-brand">${medicine.brand}</div>
            <div class="medicine-price">₹${medicine.price}</div>
            <div class="medicine-description">${medicine.description}</div>
            <div class="medicine-stock ${medicine.stock === 0 ? 'out-of-stock' : ''}">  
                ${medicine.stock === 0 ? 'Out of Stock' : `${medicine.stock} units available`}
            </div>
            <div class="medicine-delivery">Delivery: ${medicine.deliveryTime}</div>
            ${isAdmin ? `
                <div class="admin-controls">
                    <input type="number" min="0" value="${medicine.stock}" 
                           class="stock-input" id="stock-${medicine._id}">
                    <button class="update-stock-btn" 
                            onclick="updateMedicineStock('${medicine._id}', document.getElementById('stock-${medicine._id}').value)">
                        Update Stock
                    </button>
                </div>
            ` : ''}
            <button class="order-btn" 
                    onclick="orderMedicine('${medicine._id}', '${medicine.name}', ${medicine.price}, ${medicine.stock})"
                    ${medicine.stock === 0 ? 'disabled' : ''}>
                Order Now
            </button>
        </div>
    `).join('');
}

// Update the loadMedicines function
async function loadMedicines() {
    try {
        showLoading();
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/medicines`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Handle different response formats
        if (data.success && data.data) {
            medicines = data.data;
        } else if (Array.isArray(data)) {
            medicines = data;
        } else if (data.medicines && Array.isArray(data.medicines)) {
            medicines = data.medicines;
        } else {
            throw new Error('Unexpected data format');
        }
        
        displayMedicines();
    } catch (error) {
        console.error('Error loading medicines:', error);
        const medicineList = document.getElementById('medicine-list');
        if (medicineList) {
            medicineList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Error loading medicines: ${error.message}. Please check your connection.</p>
                </div>
            `;
        }
    } finally {
        hideLoading();
    }
}

// Update the initMedicineStore function
function initMedicineStore() {
    const medicineModal = document.getElementById('medicine-modal');
    // Update selector to target both service button and card button
    const medicineBtns = document.querySelectorAll('#medicine-btn, .dashboard-card:nth-child(2) .card-action-btn');
    const searchInput = document.getElementById('medicine-search');
    const categoryBtns = document.querySelectorAll('.category-btn');

    medicineBtns.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => {
                openModal(medicineModal);
                loadMedicines(); // Load medicines when modal opens
            });
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', debounce(displayMedicines, 300));
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.type;
            displayMedicines();
        });
    });
}

// Debounce function to prevent too many search updates
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Quantity modal functions
function openQuantityModal() {
    const modal = document.getElementById('quantity-modal');
    if (modal) {
        orderQuantity = 1;
        const input = document.getElementById('quantity-input');
        if (input) {
            input.value = orderQuantity;
        }
        modal.style.display = 'block';
        updateQuantityUI();
    }
}

function closeQuantityModal() {
    const modal = document.getElementById('quantity-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Unified function to handle quantity changes
function handleQuantityChange(change) {
    const input = document.getElementById('quantity-input');
    if (!input || !selectedMedicine) return;
    
    // Get current value, defaulting to 1 if NaN
    let currentValue = parseInt(input.value);
    if (isNaN(currentValue)) currentValue = 1;
    
    // Calculate new value with bounds checking
    const maxValue = Math.min(10, selectedMedicine.stock);
    let newValue = currentValue + change;
    
    // Enforce bounds
    if (newValue < 1) newValue = 1;
    if (newValue > maxValue) newValue = maxValue;
    
    // Update both the input value and orderQuantity
    input.value = newValue;
    orderQuantity = newValue;
    
    // Update UI elements
    updateQuantityUI();
}

function updateQuantityUI() {
    const quantityInput = document.getElementById('quantity-input');
    const incrementBtn = document.querySelector('.increment-btn');
    const decrementBtn = document.querySelector('.decrement-btn');
    
    if (!quantityInput || !selectedMedicine) return;
    
    // Ensure the value is a number
    const currentValue = parseInt(quantityInput.value) || 1;
    const maxValue = Math.min(10, selectedMedicine.stock);
    
    // Update button states
    if (incrementBtn) {
        incrementBtn.disabled = currentValue >= maxValue;
    }
    
    if (decrementBtn) {
        decrementBtn.disabled = currentValue <= 1;
    }
    
    // Update the confirm button
    const confirmBtn = document.querySelector('.confirm-btn');
    if (confirmBtn) {
        confirmBtn.textContent = "Confirm Order";
    }
}

// Update the orderMedicine function
function orderMedicine(id, name, price, stock) {
    selectedMedicine = {
        id: id,
        name: name,
        price: price,
        stock: stock
    };
    orderQuantity = 1;
    openQuantityModal();
}

// Global variables for hospital functionality
let userLocation = null;
let hospitals = [];

// Initialize geolocation and hospital functionality
function initHospitalFeatures() {
  const emergencyBtn = document.getElementById('emergency-btn');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
      openModal(document.getElementById('emergency-modal'));
      getUserLocation();
    });
  }
  
  // Initialize hospital dropdown for appointment form
  const appointmentBtn = document.getElementById('appointment-btn');
  if (appointmentBtn) {
    appointmentBtn.addEventListener('click', () => {
      loadHospitalsForDropdown();
    });
  }
}

// Get user's current location
function getUserLocation() {
  const locationStatus = document.getElementById('location-status');
  
  if (!navigator.geolocation) {
    if (locationStatus) {
      locationStatus.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Geolocation is not supported by your browser';
      locationStatus.classList.add('error');
    }
    return;
  }
  
  if (locationStatus) {
    locationStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting your location...';
    locationStatus.classList.remove('success', 'error');
  }
  
  // Options for high accuracy and longer timeout
  const options = {
    enableHighAccuracy: true,
    timeout: 15000, // Increased timeout to 15 seconds
    maximumAge: 0
  };
  
  // Use getCurrentPosition instead of watchPosition for better reliability
  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      userLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      if (locationStatus) {
        locationStatus.innerHTML = '<i class="fas fa-check-circle"></i> Location found successfully';
        locationStatus.classList.add('success');
      }
      
      // Load nearby hospitals
      loadNearbyHospitals();
      
      // REMOVED: No more Google Maps initialization
    },
    // Error callback
    (error) => {
      console.error('Error getting location:', error);
      if (locationStatus) {
        let errorMessage = 'Unable to retrieve your location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
        }
        
        locationStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMessage}`;
        locationStatus.classList.add('error');
        
        // Show fallback option for manual location entry
        const mapElement = document.getElementById('emergency-map');
        if (mapElement) {
          mapElement.innerHTML = `
            <div class="map-error-container">
              <i class="fas fa-map-marker-alt"></i>
              <p>We couldn't get your location automatically.</p>
              <p>Please try again or use the emergency contacts below.</p>
            </div>
          `;
        }
      }
    },
    options
  );
}

// Load nearby hospitals from API
async function loadNearbyHospitals() {
  try {
    if (!userLocation) {
      console.error('User location not available');
      return;
    }
    
    showLoading();
    
    console.log('Fetching hospitals with coordinates:', userLocation.latitude, userLocation.longitude);
    
    // FIXED: Swapped parameter order to match backend expectations (longitude first, then latitude)
    const response = await fetch(`${API_BASE_URL}/api/hospitals/nearby?longitude=${userLocation.longitude}&latitude=${userLocation.latitude}&maxDistance=10000`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API response not OK:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Raw API response:', data);
    hospitals = data.data || [];
    
    console.log('Loaded hospitals:', hospitals);
    console.log('Number of hospitals found:', hospitals.length);
    
    // Log the first hospital to check its structure
    if (hospitals.length > 0) {
      console.log('First hospital data:', JSON.stringify(hospitals[0]));
    }
    
    // Validate hospital data before proceeding
    hospitals = hospitals.filter(hospital => {
      if (!hospital.location || !hospital.location.coordinates || 
          !Array.isArray(hospital.location.coordinates) || 
          hospital.location.coordinates.length !== 2) {
        console.warn(`Hospital ${hospital.name} has invalid location data:`, hospital.location);
        return false;
      }
      return true;
    });
    
    console.log('Valid hospitals after filtering:', hospitals.length);
    
    // Calculate distances
    if (userLocation) {
      hospitals.forEach(hospital => {
        if (hospital.location && hospital.location.coordinates) {
          hospital.distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            hospital.location.coordinates[1],
            hospital.location.coordinates[0]
          );
        } else {
          hospital.distance = null;
        }
      });
      
      // Sort by distance
      hospitals.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }
    
    // Display hospitals in the list
    displayHospitals();
    
    // Display the nearest hospital in the map area
    displayNearestHospital();
    
  } catch (error) {
    console.error('Error loading nearby hospitals:', error);
    const hospitalList = document.getElementById('hospital-list');
    if (hospitalList) {
      hospitalList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-circle"></i>
          <p>Error loading hospitals: ${error.message}. Please try again later.</p>
          <button class="retry-btn" onclick="loadNearbyHospitals()">Retry</button>
        </div>
      `;
    }
    
    // Also update the map area to show the error
    const mapElement = document.getElementById('emergency-map');
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="map-error-container">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Error loading hospital data: ${error.message}</p>
          <small>Please check your internet connection or try again later.</small>
        </div>
      `;
    }
  } finally {
    hideLoading();
  }
}

// Display hospitals in the list
function displayHospitals() {
  const hospitalList = document.getElementById('hospital-list');
  const emptyHospitals = document.getElementById('empty-hospitals');
  
  if (!hospitalList) return;
  
  if (hospitals.length === 0) {
    hospitalList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-hospital"></i>
        <p>No hospitals found nearby. Please try a different location.</p>
      </div>
    `;
    return;
  }
  
  // Hide empty state
  if (emptyHospitals) {
    emptyHospitals.style.display = 'none';
  }
  
  // Calculate distances
  hospitals.forEach(hospital => {
    if (userLocation && hospital.location && hospital.location.coordinates) {
      hospital.distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        hospital.location.coordinates[1],
        hospital.location.coordinates[0]
      );
    } else {
      hospital.distance = null;
    }
  });
  
  // Sort by distance
  hospitals.sort((a, b) => {
    if (a.distance === null) return 1;
    if (b.distance === null) return -1;
    return a.distance - b.distance;
  });
  
  // Generate HTML
  hospitalList.innerHTML = hospitals.map(hospital => {
    const distanceText = hospital.distance !== null 
      ? `<span class="distance-badge">${hospital.distance.toFixed(1)} km</span>` 
      : '';
      
    const ambulanceBadge = hospital.hasAmbulance 
      ? '<span class="ambulance-badge"><i class="fas fa-ambulance"></i> Ambulance</span>' 
      : '';
      
    return `
      <div class="hospital-card" data-id="${hospital._id}">
        <div class="hospital-info">
          <div class="hospital-name">
            ${hospital.name} ${distanceText} ${ambulanceBadge}
          </div>
          <div class="hospital-address">${hospital.address}</div>
          <div class="hospital-details">
            <div class="hospital-phone"><i class="fas fa-phone"></i> ${hospital.phone}</div>
            <div class="hospital-hours"><i class="fas fa-clock"></i> ${hospital.operatingHours}</div>
          </div>
        </div>
        <div class="hospital-actions">
          <button class="call-btn" onclick="callHospital('${hospital.phone}')"><i class="fas fa-phone"></i> Call</button>
          <button class="directions-btn" onclick="getDirections(${hospital.location.coordinates[1]}, ${hospital.location.coordinates[0]})"><i class="fas fa-directions"></i> Directions</button>
        </div>
      </div>
    `;
  }).join('');
}

// Calculate distance between two coordinates in kilometers (using Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Call hospital function
function callHospital(phoneNumber) {
  window.location.href = `tel:${phoneNumber.replace(/\s/g, '')}`;
}

// Get directions function - using OpenStreetMap instead of Google Maps
function getDirections(lat, lng) {
  if (!userLocation) {
    showNotification('Your location is not available. Please enable location services.', 'error');
    return;
  }
  
  // Use OpenStreetMap for directions
  const url = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${userLocation.latitude},${userLocation.longitude};${lat},${lng}`;
  window.open(url, '_blank');
}

// Display the nearest hospital in the map area
function displayNearestHospital() {
  const mapElement = document.getElementById('emergency-map');
  if (!mapElement || !hospitals || hospitals.length === 0) {
    if (mapElement) {
      mapElement.innerHTML = `
        <div class="no-hospital-container">
          <i class="fas fa-hospital-alt"></i>
          <p>No nearby hospitals found.</p>
        </div>
      `;
    }
    return;
  }
  
  console.log('Displaying nearest hospital in map area');
  
  // The hospitals array is already sorted by distance in loadNearbyHospitals()
  const nearestHospital = hospitals[0];
  console.log('Nearest hospital:', nearestHospital.name, 'Distance:', nearestHospital.distance);
  
  // Format the distance
  const distanceText = nearestHospital.distance !== null 
    ? `${nearestHospital.distance.toFixed(1)} km away` 
    : 'Distance unknown';
  
  // Format operating hours
  const hours = nearestHospital.operatingHours || 'Not specified';
  
  // Format ambulance availability
  const ambulanceAvailable = nearestHospital.hasAmbulance 
    ? '<span class="available"><i class="fas fa-check-circle"></i> Available</span>' 
    : '<span class="unavailable"><i class="fas fa-times-circle"></i> Not available</span>';
  
  // Create HTML for the nearest hospital card
  mapElement.innerHTML = `
    <div class="nearest-hospital-card">
      <h3>Nearest Hospital</h3>
      <div class="hospital-header">
        <div class="hospital-name">${nearestHospital.name}</div>
        <div class="hospital-distance">${distanceText}</div>
      </div>
      <div class="hospital-address">
        <i class="fas fa-map-marker-alt"></i> ${nearestHospital.address || 'Address not available'}
      </div>
      <div class="hospital-details">
        <div class="detail-item">
          <i class="fas fa-phone"></i>
          <span>${nearestHospital.phone || 'No phone available'}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-clock"></i>
          <span>${hours}</span>
        </div>
        <div class="detail-item">
          <i class="fas fa-ambulance"></i>
          <span>Ambulance: ${ambulanceAvailable}</span>
        </div>
      </div>
      <div class="hospital-actions">
        <button class="call-btn" onclick="callHospital('${nearestHospital.phone || ''}')">
          <i class="fas fa-phone"></i> Call Hospital
        </button>
        <button class="directions-btn" onclick="getDirections(${nearestHospital.location.coordinates[1]}, ${nearestHospital.location.coordinates[0]})">
          <i class="fas fa-directions"></i> Get Directions
        </button>
      </div>
    </div>
  `;
  console.log('Nearest hospital card rendered');
}

// Initialize home doctors
async function initHomeDoctors() {
  const homeVisitBtn = document.getElementById('home-visit-btn');
  
  if (homeVisitBtn) {
    homeVisitBtn.addEventListener('click', async () => {
      openModal(document.getElementById('home-visit-modal'));
      await loadHomeDoctors();
    });
  }
  
  // Set minimum date for visit date input
  const visitDateInput = document.getElementById('visit-date');
  if (visitDateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    visitDateInput.min = tomorrow.toISOString().split('T')[0];
  }
}

// Load home doctors from API
async function loadHomeDoctors() {
  const doctorsContainer = document.getElementById('doctors-container');
  const emptyDoctors = document.getElementById('empty-doctors');
  
  if (!doctorsContainer) return;
  
  try {
    showLoading();
    
    // Fetch doctors from API
    const response = await fetch(`${API_BASE_URL}/api/home-visits/doctors`);
    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      // Hide empty state
      if (emptyDoctors) emptyDoctors.style.display = 'none';
      
      // Clear container
      doctorsContainer.innerHTML = '';
      
      // Add doctor cards
      data.data.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        doctorCard.dataset.id = doctor._id;
        
        // Generate stars based on rating
        const stars = generateStars(doctor.rating);
        
        // Handle potentially missing specialization
        const specializationHTML = doctor.specialization 
          ? `<p><i class="fas fa-stethoscope"></i> ${doctor.specialization}</p>` 
          : '';

        doctorCard.innerHTML = `
          <h3 class="doctor-name">${doctor.name}</h3>
          <div class="doctor-rating">
            ${stars}
            <span>${doctor.rating ? doctor.rating.toFixed(1) : 'N/A'}</span>
          </div>
          <div class="doctor-info">
            <p><i class="fas fa-map-marker-alt"></i> ${doctor.address || 'Address not available'}</p>
            <p><i class="fas fa-clock"></i> ${doctor.hours || 'Hours not available'}</p>
            <p><i class="fas fa-phone"></i> ${doctor.contact || 'Contact not available'}</p>
            ${specializationHTML}
          </div>
        `;
        
        // Add click event to select doctor
        doctorCard.addEventListener('click', () => {
          // Remove selected class from all cards
          document.querySelectorAll('.doctor-card').forEach(card => {
            card.classList.remove('selected');
          });
          
          // Add selected class to clicked card
          doctorCard.classList.add('selected');
          
          // Set selected doctor ID
          document.getElementById('selected-doctor-id').value = doctor._id;
        });
        
        doctorsContainer.appendChild(doctorCard);
      });
    } else {
      // Show empty state
      if (emptyDoctors) {
        emptyDoctors.style.display = 'flex';
        emptyDoctors.innerHTML = `
          <i class="fas fa-user-md"></i>
          <p>No doctors available at the moment</p>
        `;
      }
    }
  } catch (error) {
    console.error('Error loading home doctors:', error);
    if (emptyDoctors) {
      emptyDoctors.style.display = 'flex';
      emptyDoctors.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load doctors. Please try again.</p>
      `;
    }
  } finally {
    hideLoading();
  }
}

// Generate star rating HTML
function generateStars(rating) {
  let stars = '';
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  
  // Add half star if needed
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  
  // Add empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

// Book home visit
async function bookHomeVisit() {
  const selectedDoctorId = document.getElementById('selected-doctor-id').value;
  const reason = document.getElementById('visit-reason').value;
  const visitDate = document.getElementById('visit-date').value;
  const visitTime = document.getElementById('visit-time').value;
  const address = document.getElementById('visit-address').value;
  const notes = document.getElementById('visit-notes').value;
  
  // Validate form
  if (!selectedDoctorId) {
    showError('Please select a doctor');
    return;
  }
  
  if (!reason || !visitDate || !visitTime || !address) {
    showError('Please fill all required fields');
    return;
  }
  
  try {
    showLoading();
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'index.html';
      return;
    }
    
    // Get the doctor name before making the API call
    const selectedDoctorCard = document.querySelector('.doctor-card.selected');
    const doctorName = selectedDoctorCard ? selectedDoctorCard.querySelector('.doctor-name').textContent : 'Unknown Doctor';
    
    const response = await fetch(`${API_BASE_URL}/api/home-visits/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        doctorId: selectedDoctorId,
        reason,
        visitDate,
        visitTime,
        address,
        notes
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      // Close modal
      closeModal(document.getElementById('home-visit-modal'));
      
      // Show success message
      showSuccess(data.message || 'Home visit scheduled successfully!');
      
      // Add to recent activities using the doctor name we got earlier
      addActivity('home_visit', `Booked home visit with ${doctorName}`);
      
      // Reset form
      document.getElementById('home-visit-form').reset();
      document.getElementById('selected-doctor-id').value = '';
      document.querySelectorAll('.doctor-card').forEach(card => {
        card.classList.remove('selected');
      });
    } else {
      // Show error message from server
      showError(data.message || 'Failed to schedule home visit');
    }
  } catch (error) {
    console.error('Error booking home visit:', error);
    showError('Failed to schedule home visit. Please try again.');
  } finally {
    hideLoading();
  }
}

// Load hospitals for appointment dropdown with enhanced details
async function loadHospitalsForDropdown() {
  try {
    const hospitalSelect = document.getElementById('hospital');
    const hospitalDetailsContainer = document.getElementById('hospital-details-container') || createHospitalDetailsContainer();
    if (!hospitalSelect) return;
    
    // Show loading state
    hospitalSelect.innerHTML = '<option value="">Loading hospitals...</option>';
    hospitalDetailsContainer.innerHTML = '<div class="loading-hospitals"><i class="fas fa-spinner fa-pulse"></i> Loading hospitals...</div>';
    
    const response = await fetch(`${API_BASE_URL}/api/hospitals`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const hospitals = data.data || [];
    
    if (hospitals.length === 0) {
      hospitalSelect.innerHTML = '<option value="">No hospitals available</option>';
      hospitalDetailsContainer.innerHTML = '<div class="empty-hospitals"><i class="fas fa-hospital-alt"></i><p>No hospitals available</p></div>';
      return;
    }
    
    // Sort hospitals alphabetically
    hospitals.sort((a, b) => a.name.localeCompare(b.name));
    
    // Generate options
    hospitalSelect.innerHTML = '<option value="">Select Hospital</option>' + 
      hospitals.map(hospital => `<option value="${hospital._id}">${hospital.name}</option>`).join('');
    
    // Create detailed hospital cards with enhanced formatting
    hospitalDetailsContainer.innerHTML = hospitals.map(hospital => {
      // Format specialties with proper display
      const specialtiesHTML = hospital.specialties && hospital.specialties.length > 0 
        ? `<p><i class="fas fa-stethoscope"></i> ${hospital.specialties.join(', ')}</p>` 
        : '<p><i class="fas fa-stethoscope"></i> General Healthcare</p>';
      
      // Format hours with proper display - Fixed to use operatingHours instead of hours
      const hoursHTML = hospital.operatingHours 
        ? `<p><i class="fas fa-clock"></i> ${hospital.operatingHours}</p>` 
        : '<p><i class="fas fa-clock"></i> Hours not specified</p>';
      
      // Format description with proper display
      const descriptionHTML = hospital.description 
        ? `<p><i class="fas fa-info-circle"></i> ${hospital.description}</p>` 
        : '';
      
      return `
        <div class="hospital-card" data-hospital-id="${hospital._id}">
          <h3>${hospital.name}</h3>
          <div class="hospital-info">
            <p><i class="fas fa-map-marker-alt"></i> ${hospital.address || 'Address not available'}</p>
            <p><i class="fas fa-phone"></i> ${hospital.phone || 'Contact not available'}</p>
            ${hoursHTML}
            ${specialtiesHTML}
            ${descriptionHTML}
          </div>
        </div>
      `;
    }).join('');
    
    // Add event listeners
    hospitalSelect.addEventListener('change', (e) => {
      const selectedId = e.target.value;
      document.querySelectorAll('.hospital-card').forEach(card => {
        if (card.dataset.hospitalId === selectedId) {
          card.classList.add('selected');
          card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          card.classList.remove('selected');
        }
      });
    });
    
    document.querySelectorAll('.hospital-card').forEach(card => {
      card.addEventListener('click', () => {
        const hospitalId = card.dataset.hospitalId;
        hospitalSelect.value = hospitalId;
        document.querySelectorAll('.hospital-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        // Trigger change event to ensure form validation works
        const event = new Event('change');
        hospitalSelect.dispatchEvent(event);
      });
    });
    
  } catch (error) {
    console.error('Error loading hospitals for dropdown:', error);
    const hospitalSelect = document.getElementById('hospital');
    const hospitalDetailsContainer = document.getElementById('hospital-details-container');
    
    if (hospitalSelect) {
      hospitalSelect.innerHTML = '<option value="">Error loading hospitals</option>';
    }
    
    if (hospitalDetailsContainer) {
      hospitalDetailsContainer.innerHTML = `
        <div class="error-hospitals">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load hospitals. Please try again.</p>
        </div>
      `;
    }
  }
}

// Helper function to create hospital details container
function createHospitalDetailsContainer() {
  const container = document.createElement('div');
  container.id = 'hospital-details-container';
  container.className = 'hospital-details-container';
  
  // Insert after the hospital select element
  const hospitalSelect = document.getElementById('hospital');
  hospitalSelect.parentNode.insertBefore(container, hospitalSelect.nextSibling);
  
  return container;
}

// Update the appointment form submission
// This function is already defined earlier in the code, so removing the duplicate

// Add to DOMContentLoaded
/* Removed duplicate event listener */

// Test function - call this from console when needed
function createTestActivity() {
  addActivity('profile_update', 'Test activity ' + new Date().toLocaleTimeString());
  return 'Test activity created';
}

// Make it available globally for testing
window.createTestActivity = createTestActivity;