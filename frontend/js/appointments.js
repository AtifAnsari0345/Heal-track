// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize modal
  initModal();
  
  // Load appointments
  loadAppointments();
  
  // Initialize form submission
  initForm();
});

// Modal functionality
function initModal() {
  const newAppointmentBtn = document.getElementById('new-appointment-btn');
  const appointmentModal = document.getElementById('appointment-modal');
  const closeButtons = document.querySelectorAll('.close-modal');
  
  if (newAppointmentBtn && appointmentModal) {
    newAppointmentBtn.addEventListener('click', () => openModal(appointmentModal));
  }
  
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) closeModal(modal);
    });
  });
  
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target);
    }
  });
}

function openModal(modal) {
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.add('slide-in');
  }
}

function closeModal(modal) {
  modal.style.display = 'none';
  document.body.style.overflow = '';
  
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.classList.remove('slide-in');
  }
}

// Load appointments from API
async function loadAppointments() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'index.html';
      return;
    }

    const response = await fetch('http://localhost:5000/api/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      displayAppointments(data.data);
    } else {
      showError('Failed to load appointments');
    }
  } catch (error) {
    showError('Error loading appointments');
  }
}

// Display appointments in the list
function displayAppointments(appointments) {
  const appointmentsList = document.getElementById('appointments-list');
  const emptyState = document.getElementById('empty-appointments');

  if (!appointments || appointments.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  appointmentsList.innerHTML = appointments.map(appointment => `
    <div class="appointment-card">
      <div class="appointment-info">
        <h3 class="appointment-title">Dr. ${appointment.doctorName} - ${appointment.specialization}</h3>
        <div class="appointment-details">
          <p><i class="fas fa-hospital"></i> ${appointment.hospitalName}</p>
          <p><i class="fas fa-calendar"></i> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
          <p><i class="fas fa-clock"></i> ${appointment.appointmentTime}</p>
        </div>
      </div>
      <div class="appointment-status status-${appointment.status.toLowerCase()}">
        ${appointment.status}
      </div>
    </div>
  `).join('');
}

// Initialize form submission
function initForm() {
  const appointmentForm = document.getElementById('appointment-form');

  if (appointmentForm) {
    appointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = {
        doctorName: document.getElementById('doctor-name').value,
        specialization: document.getElementById('specialization').value,
        hospitalName: document.getElementById('hospital-name').value,
        appointmentDate: document.getElementById('appointment-date').value,
        appointmentTime: document.getElementById('appointment-time').value,
        notes: document.getElementById('notes').value
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
          // Close modal and reload appointments
          closeModal(document.getElementById('appointment-modal'));
          loadAppointments();
          showSuccess('Appointment scheduled successfully');
          appointmentForm.reset();
        } else {
          showError(data.message || 'Failed to schedule appointment');
        }
      } catch (error) {
        showError('Error scheduling appointment');
      }
    });
  }
}

// Utility functions for notifications
function showSuccess(message) {
  // Implement your success notification
  alert(message); // Replace with your notification system
}

function showError(message) {
  // Implement your error notification
  alert(message); // Replace with your notification system
}