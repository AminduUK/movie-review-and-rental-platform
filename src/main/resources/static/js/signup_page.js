const API = {
    BASE_URL: 'http://localhost:8080',
    SIGN_UP: '/api/auth/signup',
    DEFAULT_ROLE: 'ROLE_USER'
};

const BG_IMAGES = [
    'https://media.themoviedb.org/t/p/w1280/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg',
    'https://media.themoviedb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
];

/* ── Background slideshow ── */
const pageBg = document.getElementById('pageBg');
let bgIndex = 0;
BG_IMAGES.forEach((src, i) => {
    const s = document.createElement('div');
    s.className = 'bg-slide' + (i === 0 ? ' active' : '');
    s.style.backgroundImage = `url('${src}')`;
    pageBg.appendChild(s);
});
setInterval(() => {
    const slides = pageBg.querySelectorAll('.bg-slide');
    slides[bgIndex].classList.remove('active');
    bgIndex = (bgIndex + 1) % slides.length;
    slides[bgIndex].classList.add('active');
}, 5000);

/* ── Password strength ── */
function checkStrength(val) {
    const bar = document.getElementById('strengthBar');
    const fill = document.getElementById('strengthFill');
    const label = document.getElementById('strengthLabel');
    if (!val) { bar.classList.remove('show'); return; }
    bar.classList.add('show');
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    const levels = [
        { pct: '20%', color: '#e53935', text: 'Weak' },
        { pct: '45%', color: '#ff9800', text: 'Fair' },
        { pct: '70%', color: '#fdd835', text: 'Good' },
        { pct: '100%', color: '#43a047', text: 'Strong' },
    ];
    const l = levels[Math.max(0, score - 1)];
    fill.style.width = l.pct; fill.style.background = l.color;
    label.textContent = l.text; label.style.color = l.color;
}

/* ── Helpers ── */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function togglePw(id, btn) {
    const inp = document.getElementById(id);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.innerHTML = show
        ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
        : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function setFieldError(inputId, errId, hasError) {
    document.getElementById(inputId).classList.toggle('error', hasError);
    document.getElementById(errId).classList.toggle('show', hasError);
    return hasError;
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(e => e.classList.remove('show'));
    document.querySelectorAll('.form-input').forEach(e => e.classList.remove('error'));
    // Reset text content of error fields to defaults
    document.getElementById('UserNameErr').textContent = 'Username must be at least 3 characters.';
    document.getElementById('EmailErr').textContent = 'Please enter a valid email.';
    document.getElementById('PasswordErr').textContent = 'Password must be at least 8 characters.';
}

function showToast(message, type = 'error') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    if (type === 'success') {
        toast.style.borderLeftColor = 'var(--accent)';
        toast.style.borderColor = 'rgba(229, 160, 13, 0.3)';
    }

    toast.innerHTML = `
                <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:16px;padding:0;display:flex;align-items:center;">&times;</button>
            `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    });

    container.appendChild(toast);

    // Trigger reflow/animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }
    }, 4000);
}

function showApiError(msg) {
    document.getElementById('ApiError').classList.add('show');
    document.getElementById('ApiErrorMsg').textContent = msg;
    showToast(msg);
}

function setLoading(loading) {
    document.getElementById('suBtn').disabled = loading;
    document.getElementById('suSpinner').classList.toggle('show', loading);
    document.getElementById('suBtnText').style.opacity = loading ? '0.6' : '1';
}

function saveSession(token, user) {
    if (token) localStorage.setItem('cinenest_token', token);
    if (user) localStorage.setItem('cinenest_user', JSON.stringify(user));
    if (user?.role) localStorage.setItem('cinenest_role', user.role);
}

function showSuccess(msg) {
    document.getElementById('panelSignup').style.display = 'none';
    document.getElementById('successMsg').textContent = msg;
    document.getElementById('successState').classList.add('show');
    const redirect = sessionStorage.getItem('cinenest_redirect');
    sessionStorage.removeItem('cinenest_redirect');
    setTimeout(() => { window.location.href = redirect || 'user_page.html'; }, 2000);
}

async function handleSignup() {
    document.getElementById('ApiError').classList.remove('show');
    clearErrors();

    const userName = document.getElementById('UserName').value.trim();
    const email = document.getElementById('Email').value.trim();
    const password = document.getElementById('Password').value;

    let hasErr = false;
    hasErr = setFieldError('UserName', 'UserNameErr', userName.length < 3) || hasErr;
    hasErr = setFieldError('Email', 'EmailErr', !isEmail(email)) || hasErr;
    hasErr = setFieldError('Password', 'PasswordErr', password.length < 8) || hasErr;
    if (hasErr) return;

    setLoading(true);
    try {
        const res = await fetch(`${API.BASE_URL}${API.SIGN_UP}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName,               // ← matches your SignUpRequest.userName
                email,                  // ← matches your SignUpRequest.email
                password,               // ← matches your SignUpRequest.password
                role: API.DEFAULT_ROLE  // ← always ROLE_USER from frontend
            }),
        });

        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            console.warn("Failed to parse JSON response:", e);
        }

        if (!res.ok) {
            let errMsg = data?.message || 'Sign up failed. Please try again.';
            if (errMsg === 'Email already registered' || errMsg.toLowerCase().includes('already registered') || errMsg.toLowerCase().includes('already used')) {
                errMsg = 'Already Registered Mail';
                setFieldError('Email', 'EmailErr', true);
                document.getElementById('EmailErr').textContent = errMsg;
            }
            showApiError(errMsg);
            return;
        }

        const token = data.token;
        const role = data.role;
        const name = data.name;
        const userId = data.userId || data.id || null;

        saveSession(token, { email, userName: name, role, userId });
        showSuccess(`Welcome, ${name}! Your account is ready.`);

    } catch (err) {
        showApiError('Cannot reach the server. Check your connection.');
    } finally {
        setLoading(false);
    }
}