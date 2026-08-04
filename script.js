// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Position selection
function selectPosition(card) {
    // Remove active from all
    document.querySelectorAll('.position-card').forEach(c => c.classList.remove('active'));
    // Add active to clicked
    card.classList.add('active');

    // Update select dropdown
    const position = card.dataset.position;
    const select = document.getElementById('positionSelect');
    select.value = position;

    // Scroll to form
    document.getElementById('application').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Focus on full name
    setTimeout(() => {
        document.querySelector('input[name="fullName"]').focus();
    }, 600);
}

// Form validation
const form = document.getElementById('applyForm');
const inputs = form.querySelectorAll('input[required], select[required]');

inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.parentElement.classList.contains('error')) {
            validateField(input);
        }
    });
});

function validateField(field) {
    const group = field.closest('.form-group');
    let valid = true;

    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        valid = emailRegex.test(field.value);
    } else if (field.type === 'file') {
        valid = field.files.length > 0;
    } else {
        valid = field.value.trim() !== '';
    }

    if (!valid && field.hasAttribute('required')) {
        group.classList.add('error');
    } else {
        group.classList.remove('error');
    }

    return valid;
}

function validateForm() {
    let valid = true;
    inputs.forEach(input => {
        if (!validateField(input)) valid = false;
    });

    const privacy = document.getElementById('privacy');
    if (!privacy.checked) {
        valid = false;
        privacy.closest('.form-group').classList.add('error');
    } else {
        privacy.closest('.form-group').classList.remove('error');
    }

    return valid;
}

// Generate reference ID
function generateRefId() {
    const year = new Date().getFullYear();
    const num = Math.floor(1000 + Math.random() * 9000);
    return `NTS-${year}-${num}`;
}

const WEBHOOK_URL = 'https://momina2005.app.n8n.cloud/webhook-test/resume-upload';

// Handle submit
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const btn = document.getElementById('submitBtn');
    const submitError = document.getElementById('submitError');
    const refId = generateRefId();

    submitError.textContent = '';
    submitError.classList.remove('visible');
    btn.classList.add('loading');
    btn.disabled = true;

    try {
        // FormData sends the text fields and the selected resume as multipart/form-data.
        const formData = new FormData(form);
        formData.append('referenceId', refId);
        formData.append('submittedAt', new Date().toISOString());

        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}`);
        }

        btn.classList.remove('loading');
        btn.disabled = false;

        form.style.display = 'none';
        const successState = document.getElementById('successState');
        successState.classList.add('active');

        document.getElementById('refId').textContent = refId;

        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (error) {
        console.error('Application submission failed:', error);
        submitError.textContent = 'We could not submit your application. Please try again.';
        submitError.classList.add('visible');
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

// Reset form
function resetForm() {
    form.reset();
    document.querySelectorAll('.position-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));
    document.getElementById('submitError').textContent = '';
    document.getElementById('submitError').classList.remove('visible');

    const successState = document.getElementById('successState');
    successState.classList.remove('active');

    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
