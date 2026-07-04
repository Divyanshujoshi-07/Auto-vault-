/* ═══════════════════════════════════════════════
   AutoVault 3D — Booking Module
   Test Drive form · Validation · Toast
═══════════════════════════════════════════════ */

const Booking = (() => {

  let currentCarId = null;

  function init() {
    // Open via panel button
    document.getElementById('panel-book').addEventListener('click', () => {
      openModal(currentCarId);
    });

    // Open via navbar
    document.getElementById('booking-nav-btn').addEventListener('click', () => {
      openModal(currentCarId);
    });

    // Close
    document.getElementById('booking-close').addEventListener('click', closeModal);
    document.getElementById('booking-overlay').addEventListener('click', closeModal);

    // Populate car select
    const sel = document.getElementById('f-car');
    CARS.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.brand} ${c.name}`;
      sel.appendChild(opt);
    });

    // Set min date to today
    const dateInput = document.getElementById('f-date');
    const today = new Date();
    today.setDate(today.getDate() + 1);
    dateInput.min = today.toISOString().split('T')[0];

    // Submit
    document.getElementById('booking-submit').addEventListener('click', handleSubmit);
  }

  function setCurrentCar(carId) {
    currentCarId = carId;
  }

  function openModal(carId) {
    const car = CARS.find(c => c.id === carId) || CARS[0];

    // Preview
    const preview = document.getElementById('booking-preview');
    preview.innerHTML = `
      <div class="preview-color" style="background:${car.defaultColor}"></div>
      <div class="preview-info">
        <div class="preview-brand">${car.brand}</div>
        <div class="preview-name">${car.name}</div>
        <div class="preview-price">${formatPrice(car.price)}</div>
      </div>
    `;

    // Pre-select car
    document.getElementById('f-car').value = car.id;

    // Clear previous errors & values
    clearForm();

    document.getElementById('booking-modal').classList.remove('hidden');
  }

  function closeModal() {
    document.getElementById('booking-modal').classList.add('hidden');
  }

  function clearForm() {
    ['f-name','f-phone','f-email','f-msg'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.getElementById('f-date').value = '';
    document.getElementById('f-time').value = '';
    hideError();
  }

  function showError(msg) {
    const el = document.getElementById('form-err');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function hideError() {
    document.getElementById('form-err').classList.add('hidden');
  }

  function handleSubmit() {
    const name  = document.getElementById('f-name').value.trim();
    const phone = document.getElementById('f-phone').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const car   = document.getElementById('f-car').value;
    const date  = document.getElementById('f-date').value;
    const time  = document.getElementById('f-time').value;

    // Validation
    if (!name)  return showError('Please enter your full name.');
    if (!phone || phone.length < 10) return showError('Please enter a valid phone number.');
    if (!email || !email.includes('@')) return showError('Please enter a valid email address.');
    if (!car)   return showError('Please select a car.');
    if (!date)  return showError('Please select a preferred date.');
    if (!time)  return showError('Please select a preferred time.');

    hideError();

    // Simulate booking
    const btn = document.getElementById('booking-submit');
    btn.textContent = 'Confirming…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Confirm Booking';
      btn.disabled = false;
      closeModal();
      showSuccessToast(name, time, date);
    }, 1200);
  }

  function showSuccessToast(name, time, date) {
    const toast = document.getElementById('toast');
    toast.innerHTML = `
      <span class="toast-icon">✅</span>
      <div>
        <strong>Booking Confirmed!</strong><br>
        <small>Hi ${name.split(' ')[0]}, see you on ${date} at ${time}.</small>
      </div>
    `;
    toast.style.borderColor = 'var(--green)';
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 5000);
  }

  return { init, setCurrentCar, openModal };
})();
