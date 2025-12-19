document.addEventListener('DOMContentLoaded', () => {
  initializeNav();
  initializeFormValidation();
});

function initializeNav() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navButtons = document.querySelector('.nav-buttons');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks?.classList.toggle('active');
      navButtons?.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.navbar')) {
        navLinks?.classList.remove('active');
        navButtons?.classList.remove('active');
      }
    });
  }

  const navAnchors = document.querySelectorAll('.nav-links a');
  navAnchors.forEach(anchor => {
    anchor.addEventListener('click', () => {
      navLinks?.classList.remove('active');
      navButtons?.classList.remove('active');
    });
  });
}

function initializeFormValidation() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!validateForm(form)) {
        e.preventDefault();
      }
    });
  });
}

function validateForm(form) {
  let isValid = true;
  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    const error = validateInput(input);
    if (error) {
      isValid = false;
      showError(input, error);
    } else {
      clearError(input);
    }
  });

  return isValid;
}

function validateInput(input) {
  const value = input.value.trim();
  const type = input.type;
  const required = input.hasAttribute('required');

  if (required && !value) {
    return `${input.placeholder || input.name || 'This field'} is required`;
  }

  if (value) {
    if (type === 'email' && !isValidEmail(value)) {
      return 'Please enter a valid email address';
    }

    if (input.name === 'phone' && !isValidPhone(value)) {
      return 'Please enter a valid phone number';
    }

    if (input.name === 'password' && value.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (input.name === 'confirm_password') {
      const passwordInput = input.form.querySelector('input[name="password"]');
      if (value !== passwordInput.value) {
        return 'Passwords do not match';
      }
    }

    if (type === 'date') {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return 'Please select a future date';
      }
    }
  }

  return null;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

function showError(input, message) {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  let errorEl = formGroup.querySelector('.form-error');
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    formGroup.appendChild(errorEl);
  }

  errorEl.textContent = message;
  input.style.borderColor = 'var(--danger-color)';
}

function clearError(input) {
  const formGroup = input.closest('.form-group');
  if (!formGroup) return;

  const errorEl = formGroup.querySelector('.form-error');
  if (errorEl) {
    errorEl.remove();
  }

  input.style.borderColor = '';
}

function showAlert(message, type = 'info') {
  const alertContainer = document.querySelector('.alert-container') || createAlertContainer();
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function createAlertContainer() {
  const container = document.createElement('div');
  container.className = 'alert-container';
  container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 2000; max-width: 400px;';
  document.body.appendChild(container);
  return container;
}

function getPatients() {
  const patients = localStorage.getItem('patients');
  return patients ? JSON.parse(patients) : [];
}

function savePatient(patient) {
  const patients = getPatients();
  
  if (patients.some(p => p.email === patient.email)) {
    return { success: false, message: 'Email already registered' };
  }

  patient.id = Date.now().toString();
  patients.push(patient);
  localStorage.setItem('patients', JSON.stringify(patients));

  return { success: true, message: 'Patient registered successfully', patientId: patient.id };
}

function getPatientByEmail(email) {
  const patients = getPatients();
  return patients.find(p => p.email === email);
}

function getAppointments() {
  const appointments = localStorage.getItem('appointments');
  return appointments ? JSON.parse(appointments) : [];
}

function saveAppointment(appointment) {
  const appointments = getAppointments();
  appointment.id = Date.now().toString();
  appointments.push(appointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));

  return { success: true, message: 'Appointment booked successfully', appointmentId: appointment.id };
}

function getAppointmentsByPatientId(patientId) {
  const appointments = getAppointments();
  return appointments.filter(a => a.patientId === patientId);
}

function cancelAppointment(appointmentId) {
  let appointments = getAppointments();
  appointments = appointments.filter(a => a.id !== appointmentId);
  localStorage.setItem('appointments', JSON.stringify(appointments));

  return { success: true, message: 'Appointment cancelled successfully' };
}

function getCurrentUser() {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
}

function setCurrentUser(patient) {
  localStorage.setItem('currentUser', JSON.stringify(patient));
}

function logout() {
  localStorage.removeItem('currentUser');
}

function isUserLoggedIn() {
  return getCurrentUser() !== null;
}

function redirectIfNotLoggedIn() {
  if (!isUserLoggedIn()) {
    window.location.href = '/website/pages/login.html';
  }
}

function getAvailableTimeSlots(date) {
  const slots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  const appointments = getAppointments();
  const bookedSlots = appointments
    .filter(a => a.date === date)
    .map(a => a.time);

  return slots.filter(slot => !bookedSlots.includes(slot));
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

function initializeMockupData() {
  const existingPatients = localStorage.getItem('patients');
  const existingAppointments = localStorage.getItem('appointments');

  if (!existingPatients || JSON.parse(existingPatients).length === 0) {
    const mockupPatients = [
      {
        id: '1000001',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@email.com',
        phone: '(555) 123-4567',
        dateOfBirth: '1985-03-15',
        address: {
          street: '456 Oak Avenue',
          city: 'New York',
          state: 'NY',
          zipcode: '10001',
          country: 'USA'
        },
        insurance: {
          company: 'Delta Dental',
          id: 'DD-987654'
        },
        password: 'Patient@123',
        registrationDate: '2024-01-10T10:30:00Z'
      },
      {
        id: '1000002',
        firstName: 'Michael',
        lastName: 'Thompson',
        email: 'michael.thompson@email.com',
        phone: '(555) 234-5678',
        dateOfBirth: '1990-07-22',
        address: {
          street: '789 Maple Street',
          city: 'Los Angeles',
          state: 'CA',
          zipcode: '90001',
          country: 'USA'
        },
        insurance: {
          company: 'Blue Shield',
          id: 'BS-456123'
        },
        password: 'Patient@123',
        registrationDate: '2024-01-12T14:45:00Z'
      },
      {
        id: '1000003',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '(555) 345-6789',
        dateOfBirth: '1988-11-30',
        address: {
          street: '321 Pine Road',
          city: 'Chicago',
          state: 'IL',
          zipcode: '60601',
          country: 'USA'
        },
        insurance: {
          company: 'Aetna',
          id: 'AE-789456'
        },
        password: 'Patient@123',
        registrationDate: '2024-01-15T09:15:00Z'
      },
      {
        id: '1000004',
        firstName: 'James',
        lastName: 'Martinez',
        email: 'james.martinez@email.com',
        phone: '(555) 456-7890',
        dateOfBirth: '1992-05-18',
        address: {
          street: '654 Elm Boulevard',
          city: 'Houston',
          state: 'TX',
          zipcode: '77001',
          country: 'USA'
        },
        insurance: {
          company: 'Cigna',
          id: 'CG-321654'
        },
        password: 'Patient@123',
        registrationDate: '2024-01-18T11:20:00Z'
      },
      {
        id: '1000005',
        firstName: 'Jennifer',
        lastName: 'Anderson',
        email: 'jennifer.anderson@email.com',
        phone: '(555) 567-8901',
        dateOfBirth: '1995-09-12',
        address: {
          street: '987 Cedar Lane',
          city: 'Phoenix',
          state: 'AZ',
          zipcode: '85001',
          country: 'USA'
        },
        insurance: {
          company: 'United Healthcare',
          id: 'UH-654987'
        },
        password: 'Patient@123',
        registrationDate: '2024-01-20T13:30:00Z'
      }
    ];

    localStorage.setItem('patients', JSON.stringify(mockupPatients));
  }

  if (!existingAppointments || JSON.parse(existingAppointments).length === 0) {
    const today = new Date();
    const mockupAppointments = [
      {
        id: '2000001',
        patientName: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '(555) 123-4567',
        service: 'checkup',
        dentist: 'dr-sarah',
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        notes: 'Regular checkup and cleaning',
        bookingDate: '2024-01-22T08:00:00Z',
        status: 'confirmed'
      },
      {
        id: '2000002',
        patientName: 'Michael Thompson',
        email: 'michael.thompson@email.com',
        phone: '(555) 234-5678',
        service: 'whitening',
        dentist: 'dr-emily',
        date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        notes: 'Professional teeth whitening',
        bookingDate: '2024-01-21T10:15:00Z',
        status: 'confirmed'
      },
      {
        id: '2000003',
        patientName: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '(555) 345-6789',
        service: 'filling',
        dentist: 'dr-sarah',
        date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        notes: 'Cavity filling',
        bookingDate: '2024-01-20T09:30:00Z',
        status: 'confirmed'
      },
      {
        id: '2000004',
        patientName: 'James Martinez',
        email: 'james.martinez@email.com',
        phone: '(555) 456-7890',
        service: 'root-canal',
        dentist: 'dr-michael',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '09:00',
        notes: 'Root canal therapy',
        bookingDate: '2024-01-19T14:45:00Z',
        status: 'pending'
      },
      {
        id: '2000005',
        patientName: 'Jennifer Anderson',
        email: 'jennifer.anderson@email.com',
        phone: '(555) 567-8901',
        service: 'orthodontics',
        dentist: 'dr-michael',
        date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:00',
        notes: 'Braces consultation and fitting',
        bookingDate: '2024-01-22T11:00:00Z',
        status: 'confirmed'
      },
      {
        id: '2000006',
        patientName: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        phone: '(555) 123-4567',
        service: 'implant',
        dentist: 'dr-emily',
        date: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:30',
        notes: 'Dental implant procedure',
        bookingDate: '2024-01-18T10:00:00Z',
        status: 'pending'
      }
    ];

    localStorage.setItem('appointments', JSON.stringify(mockupAppointments));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMockupData);
} else {
  initializeMockupData();
}
