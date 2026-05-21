const API = {
    BASE_URL: 'http://localhost:8080',
    SIGN_IN: '/api/auth/signin',
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

/* ── Helpers ── */
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function togglePw(id, btn) {
    const inp = document.getElementById(id);
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    btn.innerHTML = show
        ? `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
             <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
             <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
             <line x1="1" y1="1" x2="23" y2="23"/>
           </svg>`
        : `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
             <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
             <circle cx="12" cy="12" r="3"/>
           </svg>`;
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
    document.getElementById('siEmailErr').textContent = 'Please enter a valid email.';
    document.getElementById('siPasswordErr').textContent = 'Password is required.';
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
    document.getElementById('siApiError').classList.add('show');
    document.getElementById('siApiErrorMsg').textContent = msg;
    showToast(msg);
}

function setLoading(loading) {
    document.getElementById('siBtn').disabled = loading;
    document.getElementById('siSpinner').classList.toggle('show', loading);
    document.getElementById('siBtnText').style.opacity = loading ? '0.6' : '1';
}

function saveSession(token, user) {
    if (token) localStorage.setItem('cinenest_token', token);
    if (user) localStorage.setItem('cinenest_user', JSON.stringify(user));
    if (user?.role) localStorage.setItem('cinenest_role', user.role);
}

function redirectByRole(role) {
    const redirect = sessionStorage.getItem('cinenest_redirect');
    sessionStorage.removeItem('cinenest_redirect');

    if (role === 'ROLE_ADMIN') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = redirect || 'user_page.html';
    }
}

function showSuccess(name, role) {
    document.getElementById('panelSignin').style.display = 'none';
    document.getElementById('successMsg').textContent =
        role === 'ROLE_ADMIN'
            ? `Welcome, ${name}! Loading admin dashboard…`
            : `Welcome back, ${name}! Redirecting…`;
    document.getElementById('successState').classList.add('show');
    setTimeout(() => redirectByRole(role), 2000);
}

/* ── Main Sign In ── */
async function handleSignin() {
    document.getElementById('siApiError').classList.remove('show');
    clearErrors();

    const email = document.getElementById('siEmail').value.trim();
    const password = document.getElementById('siPassword').value;

    let hasErr = false;
    hasErr = setFieldError('siEmail', 'siEmailErr', !isEmail(email)) || hasErr;
    hasErr = setFieldError('siPassword', 'siPasswordErr', password.length < 1) || hasErr;
    if (hasErr) return;

    setLoading(true);
    try {
        const res = await fetch(`${API.BASE_URL}${API.SIGN_IN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        let data = {};
        try {
            data = await res.json();
        } catch (e) {
            console.warn("Failed to parse JSON response:", e);
        }

        if (!res.ok) {
            let errMsg = data?.message || data?.error || 'Invalid email or password.';
            if (errMsg === 'Bad credentials' || errMsg.toLowerCase().includes('credentials') || errMsg.toLowerCase().includes('password') || errMsg.toLowerCase().includes('invalid')) {
                errMsg = 'Wrong Password. Please Enter Your correct Password.';
                setFieldError('siPassword', 'siPasswordErr', true);
                document.getElementById('siPasswordErr').textContent = errMsg;
            }
            showApiError(errMsg);
            return;
        }

        const token = data?.token || data?.accessToken || data?.jwt || '';
        const role = data?.role || 'ROLE_USER';
        const name = data?.name || data?.userName || email.split('@')[0];
        const userId = data?.userId || data?.id || null;

        saveSession(token, { email, userName: name, role, userId });
        showSuccess(name, role);

    } catch (err) {
        showApiError('Cannot reach the server. Check your connection.');
        console.error('[SignIn]', err);
    } finally {
        setLoading(false);
    }
}