/* CineNest – User Dashboard (Real Backend) */
const API = 'http://localhost:8080';
function tok() { return localStorage.getItem('cinenest_token') || ''; }
function hdrs() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok() }; }
function go401() { window.location.href = 'signin_page.html'; }
async function GET(p) { const r = await fetch(API + p, { headers: hdrs() }); if (r.status === 401) go401(); return r.json(); }
async function POST(p, b) { const r = await fetch(API + p, { method: 'POST', headers: hdrs(), body: JSON.stringify(b) }); if (r.status === 401) go401(); return r.json(); }
async function PUT(p, b) { const r = await fetch(API + p, { method: 'PUT', headers: hdrs(), body: JSON.stringify(b) }); if (r.status === 401) go401(); return r.json(); }
async function DEL(p) { const r = await fetch(API + p, { method: 'DELETE', headers: hdrs() }); if (r.status === 401) go401(); return r.text(); }

if (!tok()) { window.location.href = 'signin_page.html'; }

/* AUTH */
let currentUser = { name: 'Guest', email: '', initials: 'G' };
(function initUser() {
  try {
    const u = JSON.parse(localStorage.getItem('cinenest_user') || '{}');
    currentUser.name = u.userName || u.email?.split('@')[0] || 'User';
    currentUser.email = u.email || '';
    currentUser.initials = currentUser.name.slice(0, 2).toUpperCase();
  } catch (e) { }
  document.getElementById('userAvatar').textContent = currentUser.initials;
  document.getElementById('profileAvatarLg').textContent = currentUser.initials;
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('profileName').textContent = currentUser.name;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('pf-name').value = currentUser.name;
  document.getElementById('pf-email').value = currentUser.email;
})();

function logout() { localStorage.removeItem('cinenest_token'); localStorage.removeItem('cinenest_user'); window.location.href = 'signin_page.html'; }

/* TOAST */
let _tt;
function showToast(icon, msg) {
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast'); t.classList.add('show');
  clearTimeout(_tt); _tt = setTimeout(() => t.classList.remove('show'), 3000);
}

/* CUSTOM CONFIRM MODAL */
function showConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const msgEl = document.getElementById('confirmMessage');
    const cancelBtn = document.getElementById('confirmCancelBtn');
    const confirmBtn = document.getElementById('confirmConfirmBtn');

    titleEl.textContent = title;
    msgEl.textContent = message;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    function cleanup(value) {
      modal.classList.remove('open');
      if (!document.getElementById('movieModal')?.classList.contains('open') &&
          !document.getElementById('playerModal')?.classList.contains('open') &&
          !document.getElementById('trailerModal')?.classList.contains('open')) {
        document.body.style.overflow = '';
      }
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
      modal.removeEventListener('click', onOutsideClick);
      resolve(value);
    }

    function onCancel() { cleanup(false); }
    function onConfirm() { cleanup(true); }
    function onOutsideClick(e) { if (e.target === modal) cleanup(false); }

    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
    modal.addEventListener('click', onOutsideClick);
  });
}


/* NAV */
function nav(panel, el) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + panel).classList.add('active');
  if (el) el.classList.add('active');
  const titles = { browse: 'Browse Movies', rentals: 'My Rentals', watchlist: 'My Watchlist', reviews: 'My Reviews', history: 'Watch History', profile: 'Profile & Settings' };
  document.getElementById('topbarTitle').textContent = titles[panel] || panel;
  if (panel === 'browse') loadBrowse();
  if (panel === 'rentals') loadRentals();
  if (panel === 'watchlist') loadWatchlist();
  if (panel === 'reviews') loadMyReviews();
  if (panel === 'history') loadHistory();
  if (panel === 'profile') updateProfileStats();
  loadCounts();
}

/* COUNTS */
let _rentCount = 0, _wlCount = 0, _rvCount = 0;
function loadCounts() {
  document.getElementById('rentalsCount').textContent = _rentCount || '';
  document.getElementById('watchlistCount').textContent = _wlCount || '';
  document.getElementById('s-rentals').textContent = _rentCount;
  document.getElementById('s-watchlist').textContent = _wlCount;
  document.getElementById('s-reviews').textContent = _rvCount;
}
function updateProfileStats() {
  document.getElementById('ps-rentals').textContent = _rentCount;
  document.getElementById('ps-reviews').textContent = _rvCount;
  document.getElementById('ps-watchlist').textContent = _wlCount;
}

/* MOVIE HELPERS */
function genreName(m) { return m.categories && m.categories.length ? m.categories[0] : (m.genre || 'Movie'); }
function posterEl(m) { return m.posterUrl ? `<img class="card-img" src="${m.posterUrl}" alt="${m.title}" loading="lazy" onerror="this.style.display='none'">` : ``; }

/* BROWSE */
let allMovies = [], activeFilter = 'all', watchlistIds = new Set();

async function loadBrowse() {
  const grid = document.getElementById('browseGrid');
  grid.innerHTML = '<div style="color:var(--dim);padding:40px;text-align:center">Loading movies…</div>';
  try {
    const [moviesData, rentalsData] = await Promise.all([
      GET('/api/common/movie/get-all-movies'),
      GET('/api/user/rental/get-active-rentals').catch(() => [])
    ]);
    allMovies = moviesData || [];
    activeRentals = rentalsData || [];
    buildFilterPills();
    renderBrowse();
  } catch (e) { grid.innerHTML = '<div style="color:var(--dim);padding:40px;text-align:center">Failed to load movies.</div>'; }
}

function buildFilterPills() {
  const cats = new Set(); allMovies.forEach(m => { if (m.categories) m.categories.forEach(c => cats.add(c)); });
  const bar = document.getElementById('genreBar');
  bar.innerHTML = `<div class="f-pill active" data-g="all" onclick="setFilter('all',this)">All</div>`
    + [...cats].map(c => `<div class="f-pill" data-g="${c}" onclick="setFilter('${c}',this)">${c}</div>`).join('');
}

function setFilter(g, el) {
  document.querySelectorAll('[data-g]').forEach(p => p.classList.remove('active'));
  el.classList.add('active'); activeFilter = g; renderBrowse();
}

function renderBrowse() {
  let list = activeFilter === 'all'
    ? [...allMovies]
    : allMovies.filter(m => (m.categories && m.categories.includes(activeFilter)) || (m.genre === activeFilter));
  const grid = document.getElementById('browseGrid'); grid.innerHTML = '';
  list.forEach((m, i) => {
    const saved = watchlistIds.has(m.movieId);
    const isRented = activeRentals.some(r => r.movieTitle === m.title && r.rentalStatus === 'ACTIVE');
    const card = document.createElement('div'); card.className = 'movie-card';
    card.style.animationDelay = `${i * 0.03}s`;
    card.innerHTML = `
      <div class="card-poster">
        ${posterEl(m)}
        <div class="card-badge-top">${genreName(m)}</div>
        <div class="card-overlay">
          ${isRented
            ? `<button class="card-btn card-btn-rent" style="background:var(--accent); color:#000;" onclick="event.stopPropagation();openPlayerByMovieId(${m.movieId})">▶️ Watch Now</button>`
            : `<button class="card-btn card-btn-rent" onclick="event.stopPropagation();openMovieModal(${m.movieId})">🎫 Rent Now</button>`
          }
          <button class="card-btn card-btn-play" onclick="event.stopPropagation();openMovieModal(${m.movieId})">ℹ Details</button>
        </div>
        <button class="card-wishlist ${saved ? 'saved' : ''}" onclick="event.stopPropagation();toggleWatchlist(${m.movieId},this)">${saved ? '❤️' : '🤍'}</button>
      </div>
      <div class="card-info">
        <div class="card-title">${m.title}</div>
        <div class="card-sub"><span>${m.releaseYear || ''}</span><span class="card-price">${m.language || ''}</span></div>
      </div>`;
    card.addEventListener('click', () => openMovieModal(m.movieId));
    grid.appendChild(card);
  });
  if (!list.length) grid.innerHTML = '<div style="color:var(--dim);padding:40px;text-align:center">No movies found.</div>';
}

/* LIVE SEARCH */
function liveSearch(q) {
  const dd = document.getElementById('searchDropdown');
  if (!q.trim()) { dd.classList.remove('show'); return; }
  const res = allMovies.filter(m => m.title.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
  if (!res.length) { dd.classList.remove('show'); return; }
  dd.innerHTML = res.map(m => `
    <div class="search-result" onclick="openMovieModal(${m.movieId});document.getElementById('searchDropdown').classList.remove('show');document.getElementById('searchBox').value=''">
      ${m.posterUrl ? `<img class="search-poster-sm" src="${m.posterUrl}" alt="${m.title}" onerror="this.style.display='none'">` : ''}
      <div class="search-result-info"><div class="title">${m.title}</div><div class="meta">${m.releaseYear || ''} · ${genreName(m)}</div></div>
    </div>`).join('');
  dd.classList.add('show');
}
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) document.getElementById('searchDropdown').classList.remove('show'); });

/* WATCHLIST */
async function loadWatchlist() {
  const grid = document.getElementById('watchlistGrid'); grid.innerHTML = '';
  try {
    const data = await GET('/api/user/watchlist/get-watchlist');
    const movies = data.movies || [];
    watchlistIds = new Set(movies.map(m => m.movieId));
    _wlCount = movies.length; loadCounts();
    if (!movies.length) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🤍</div><p>Your watchlist is empty.</p></div>'; return; }
    movies.forEach(m => {
      const card = document.createElement('div'); card.className = 'movie-card';
      card.innerHTML = `
        <div class="card-poster">
          ${posterEl(m)}
          <div class="card-overlay">
            <button class="card-btn card-btn-rent" onclick="event.stopPropagation();openMovieModal(${m.movieId})">🎫 Rent</button>
            <button class="card-btn card-btn-play" style="background:rgba(229,57,53,0.7)" onclick="event.stopPropagation();removeFromWatchlist(${m.movieId})">✕ Remove</button>
          </div>
        </div>
        <div class="card-info"><div class="card-title">${m.title}</div><div class="card-sub">${m.releaseYear || ''}</div></div>`;
      card.addEventListener('click', () => openMovieModal(m.movieId));
      grid.appendChild(card);
    });
  } catch (e) { grid.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Failed to load watchlist.</p></div>'; }
}

async function toggleWatchlist(id, btn) {
  if (watchlistIds.has(id)) {
    await removeFromWatchlist(id);
    if (btn) { btn.textContent = '🤍'; btn.classList.remove('saved'); }
  } else {
    await addToWatchlist(id);
    if (btn) { btn.textContent = '❤️'; btn.classList.add('saved'); }
  }
}
async function addToWatchlist(id) {
  try { await POST(`/api/user/watchlist/add-movie/${id}`); watchlistIds.add(id); _wlCount++; loadCounts(); showToast('❤️', 'Added to Watchlist'); }
  catch (e) { showToast('⚠️', 'Failed to add'); }
}
async function removeFromWatchlist(id) {
  try { await DEL(`/api/user/watchlist/remove-movie/${id}`); watchlistIds.delete(id); _wlCount = Math.max(0, _wlCount - 1); loadCounts(); showToast('💔', 'Removed from Watchlist'); if (document.getElementById('panel-watchlist').classList.contains('active')) loadWatchlist(); }
  catch (e) { showToast('⚠️', 'Failed to remove'); }
}

async function clearWishlist() {
  if (!watchlistIds || !watchlistIds.size) {
    showToast('ℹ️', 'Watchlist is already empty');
    return;
  }
  const confirmed = await showConfirm('Clear Watchlist', 'Are you sure you want to clear all items from your watchlist?');
  if (!confirmed) return;

  const ids = Array.from(watchlistIds);

  // Instantly update UI and state for immediate responsiveness
  watchlistIds.clear();
  _wlCount = 0;
  loadCounts();

  const grid = document.getElementById('watchlistGrid');
  if (grid) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🤍</div><p>Your watchlist is empty.</p></div>';
  }

  showToast('💔', 'Watchlist cleared');

  // Perform backend deletes in the background
  Promise.all(ids.map(async (id) => {
    try {
      await DEL(`/api/user/watchlist/remove-movie/${id}`);
    } catch (err) {
      console.error('Error removing movie ID:', id, err);
    }
  })).catch(err => {
    console.error('Background watchlist clearance error:', err);
  });
}


/* RENTALS */
let activeRentals = [], rentalHistory = [];
async function loadRentals() {
  const el = document.getElementById('rentalsList'); el.innerHTML = '<div style="color:var(--dim);padding:40px;text-align:center">Loading…</div>';
  try {
    if (!allMovies || !allMovies.length) {
      allMovies = await GET('/api/common/movie/get-all-movies') || [];
    }
    activeRentals = await GET('/api/user/rental/get-active-rentals') || [];
    _rentCount = activeRentals.length; loadCounts();
    el.innerHTML = '';

    // Only show active rentals in My Rentals panel
    const list = activeRentals.filter(r => r.rentalStatus === 'ACTIVE');

    if (!list.length) {
      el.innerHTML = '<div class="empty-state"><div class="icon">🎫</div><p>No active rentals. Browse to get started.</p></div>';
      return;
    }

    list.forEach(r => {
      const m = allMovies.find(x => x.title === r.movieTitle);
      const item = document.createElement('div'); item.className = 'rental-item';
      if (m) {
        item.style.cursor = 'pointer';
        item.onclick = () => openMovieModal(m.movieId);
      }

      item.innerHTML = `
        ${r.posterUrl ? `<img class="rental-poster" src="${r.posterUrl}" alt="${r.movieTitle || ''}" onerror="this.style.display='none'">` : `<div class="rental-poster-ph">🎬</div>`}
        <div class="rental-info">
          <div class="rental-title">${r.movieTitle || 'Movie'}</div>
          <div class="rental-meta">Rented on: ${r.rentalDate ? new Date(r.rentalDate).toLocaleDateString() : ''}</div>
          <div class="rental-tags">
            <span class="tag tag-active">● Active</span>
          </div>
        </div>
        <div class="rental-actions" style="display: flex; gap: 8px; align-items: center;">
          ${m ? `<button class="btn btn-primary btn-sm" style="display: flex; align-items: center; gap: 4px; background: var(--accent); color: #000; border: none; font-weight: 600;" onclick="event.stopPropagation(); openPlayerByMovieId(${m.movieId})">▶️ Watch</button>` : ''}
          <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); returnRental(${r.rentalId})">Return</button>
        </div>`;
      el.appendChild(item);
    });
  } catch (e) { el.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Failed to load rentals.</p></div>'; }
}

function openPlayerByMovieId(movieId) {
  const m = allMovies.find(x => x.movieId === movieId);
  if (m) openPlayer(m);
}

async function returnRental(rentalId) {
  try {
    await PUT(`/api/user/rental/return-rental/${rentalId}`);
    showToast('✅', 'Movie returned');
    const rentalsData = await GET('/api/user/rental/get-active-rentals').catch(() => []);
    activeRentals = rentalsData || [];
    loadRentals();
  }
  catch (e) { showToast('⚠️', 'Return failed'); }
}

/* HISTORY */
async function loadHistory() {
  const grid = document.getElementById('historyGrid'); grid.innerHTML = '';
  try {
    const history = await GET('/api/user/rental/get-rental-history');

    // Filter out cleared history items
    const userId = getUserId();
    let clearedIds = [];
    if (userId) {
      try {
        clearedIds = JSON.parse(localStorage.getItem(`cinenest_cleared_rentals_${userId}`) || '[]');
      } catch (e) { console.error('Error reading cleared history', e); }
    }

    const visibleHistory = history.filter(r => !clearedIds.includes(r.rentalId));

    if (!visibleHistory.length) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">🕐</div><p>No rental history yet.</p></div>'; return; }
    visibleHistory.forEach(r => {
      const card = document.createElement('div'); card.className = 'movie-card';
      card.innerHTML = `
        <div class="card-poster">
          ${r.posterUrl ? `<img class="card-img" src="${r.posterUrl}" alt="${r.movieTitle || ''}" loading="lazy">` : ''}
        </div>
        <div class="card-info"><div class="card-title">${r.movieTitle || 'Movie'}</div><div class="card-sub">Rented: ${r.rentalDate ? new Date(r.rentalDate).toLocaleDateString() : ''}</div></div>`;
      grid.appendChild(card);
    });
  } catch (e) { grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">⚠️</div><p>Failed to load history.</p></div>'; }
}

async function clearHistory() {
  const userId = getUserId();
  if (!userId) {
    showToast('⚠️', 'Please sign in first');
    return;
  }

  try {
    const history = await GET('/api/user/rental/get-rental-history');

    // Read currently cleared IDs
    let clearedIds = [];
    try {
      clearedIds = JSON.parse(localStorage.getItem(`cinenest_cleared_rentals_${userId}`) || '[]');
    } catch (e) {}

    const visibleHistory = history.filter(r => !clearedIds.includes(r.rentalId));

    if (!visibleHistory.length) {
      showToast('ℹ️', 'History is already empty');
      return;
    }

    const confirmed = await showConfirm('Clear History', 'Are you sure you want to clear your rental history?');
    if (!confirmed) return;

    // Add all visible rentalIds to cleared list
    visibleHistory.forEach(r => {
      if (r.rentalId && !clearedIds.includes(r.rentalId)) {
        clearedIds.push(r.rentalId);
      }
    });

    localStorage.setItem(`cinenest_cleared_rentals_${userId}`, JSON.stringify(clearedIds));
    showToast('🗑️', 'Rental history cleared');
    loadHistory();
  } catch (e) {
    showToast('⚠️', 'Failed to clear rental history');
  }
}

/* MY REVIEWS */
let myReviewsData = {};

async function loadMyReviews() {
  const el = document.getElementById('myReviews'); el.innerHTML = '';
  try {
    const movies = allMovies.length ? allMovies : await GET('/api/common/movie/get-all-movies');
    let allRevs = [];
    await Promise.all(movies.slice(0, 20).map(async m => {
      try {
        const revs = await GET(`/api/common/movie/get-all-reviews/${m.movieId}`);
        const mine = revs.filter(r => r.userName === currentUser.name);
        mine.forEach(r => allRevs.push({ ...r, movie: m }));
      } catch (e) { }
    }));
    _rvCount = allRevs.length; loadCounts();
    if (!allRevs.length) { el.innerHTML = '<div class="empty-state"><div class="icon">⭐</div><p>You haven\'t written any reviews yet.</p></div>'; return; }

    // Reset cache
    myReviewsData = {};

    allRevs.forEach(r => {
      const m = r.movie; const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
      const card = document.createElement('div'); card.className = 'review-card';
      card.id = `review-card-${r.reviewId}`;
      myReviewsData[r.reviewId] = r.comment || '';
      card.innerHTML = `
        <div class="review-header">
          ${m.posterUrl ? `<img class="review-poster" src="${m.posterUrl}" alt="${m.title}" onerror="this.style.display='none'">` : `<div class="review-poster-ph">🎬</div>`}
          <div class="review-movie-info"><div class="title">${m.title}</div><div class="meta">${m.releaseYear || ''}</div><div style="color:var(--accent);font-size:14px">${stars}</div></div>
        </div>
        <div class="review-text-display" id="review-comment-${r.reviewId}">${r.comment || ''}</div>
        <div class="review-footer-row">
          <span class="review-date">${r.reviewDate ? new Date(r.reviewDate).toLocaleDateString() : ''}</span>
          <div class="review-actions" id="review-actions-${r.reviewId}">
            <button class="btn btn-secondary btn-sm" onclick="startEditReview(${r.reviewId})">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteReview(${r.reviewId})">🗑️ Delete</button>
          </div>
        </div>`;
      el.appendChild(card);
    });
  } catch (e) { el.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Failed to load reviews.</p></div>'; }
}

async function deleteReview(id) {
  try {
    await DEL(`/api/user/review/delete-review/${id}`);
    showToast('🗑️', 'Review deleted');
    loadMyReviews();
    if (currentMovieId) loadModalReviews(currentMovieId);
  }
  catch (e) { showToast('⚠️', 'Delete failed'); }
}

function startEditReview(reviewId) {
  const commentText = myReviewsData[reviewId];
  const commentElId = `review-comment-${reviewId}`;
  const actionsElId = `review-actions-${reviewId}`;

  const commentEl = document.getElementById(commentElId);
  const actionsEl = document.getElementById(actionsElId);

  if (!commentEl || !actionsEl) return;

  commentEl.innerHTML = `
    <textarea class="review-textarea edit-mode-textarea" id="edit-textarea-${reviewId}" style="width: 100%; margin-top: 8px; margin-bottom: 8px;">${commentText}</textarea>
  `;

  actionsEl.innerHTML = `
    <button class="btn btn-primary btn-sm" onclick="saveEditedReview(${reviewId})">Save</button>
    <button class="btn btn-secondary btn-sm" onclick="cancelEditReview(${reviewId})">Cancel</button>
  `;
}

function cancelEditReview(reviewId) {
  const commentText = myReviewsData[reviewId];
  const commentElId = `review-comment-${reviewId}`;
  const actionsElId = `review-actions-${reviewId}`;

  const commentEl = document.getElementById(commentElId);
  const actionsEl = document.getElementById(actionsElId);

  if (commentEl) {
    commentEl.textContent = commentText;
  }

  if (actionsEl) {
    actionsEl.innerHTML = `
      <button class="btn btn-secondary btn-sm" onclick="startEditReview(${reviewId})">✏️ Edit</button>
      <button class="btn btn-danger btn-sm" onclick="deleteReview(${reviewId})">🗑️ Delete</button>
    `;
  }
}

async function saveEditedReview(reviewId) {
  const textarea = document.getElementById(`edit-textarea-${reviewId}`);
  if (!textarea) return;

  const newComment = textarea.value.trim();
  if (!newComment) {
    showToast('⚠️', 'Please write a review comment');
    return;
  }

  try {
    await PUT('/api/user/review/update-review', {
      reviewId: reviewId,
      comment: newComment
    });

    showToast('✅', 'Review updated!');

    myReviewsData[reviewId] = newComment;

    loadMyReviews();
    if (currentMovieId) {
      loadModalReviews(currentMovieId);
    }
  } catch (e) {
    showToast('⚠️', 'Update failed');
  }
}

function getUserId() { try { return JSON.parse(localStorage.getItem('cinenest_user') || '{}').userID || JSON.parse(localStorage.getItem('cinenest_user') || '{}').userId; } catch (e) { return null; } }

/* MOVIE MODAL */
let currentMovieId = null;
async function openMovieModal(id) {
  currentMovieId = id;
  const m = allMovies.find(x => x.movieId === id) || { movieId: id };
  const backdrop = document.getElementById('modalBackdrop');
  backdrop.innerHTML = `<button class="modal-close-btn" onclick="closeMovieModal()">✕</button>`;
  if (m.posterUrl) {
    backdrop.style.backgroundImage = `url('${m.posterUrl}')`;
    backdrop.style.backgroundSize = 'cover';
    backdrop.style.backgroundPosition = 'center 20%';
    backdrop.style.backgroundRepeat = 'no-repeat';
    backdrop.style.backgroundAttachment = 'local';
    backdrop.style.filter = 'none';
  }

  document.getElementById('modalPosterWrap').innerHTML = m.posterUrl ? `<img class="modal-poster-float" src="${m.posterUrl}" alt="${m.title || ''}" onerror="this.outerHTML=''">` : '';
  const catsText = m.categories && m.categories.length ? m.categories.join(', ') : (m.genre || 'Movie');
  document.getElementById('mGenre').textContent = catsText;
  document.getElementById('mTitle').textContent = m.title || '';
  document.getElementById('mDesc').textContent = m.description || m.desc || '';
  document.getElementById('mCast').innerHTML = m.language ? `<strong>Language:</strong> ${m.language}` : '';
  document.getElementById('mMeta').innerHTML = `<span>${m.releaseYear || ''}</span><span>·</span><span>${m.duration || 0} min</span><span>·</span><span>${catsText}</span>`;
  document.getElementById('rp-sd').textContent = '$2.99';
  document.querySelectorAll('.rent-opt').forEach(o => o.classList.remove('selected'));
  document.querySelector('[data-plan="SD"]').classList.add('selected');
  // Conditionally show review form and adjust action buttons if rented
  try {
    const rentals = await GET('/api/user/rental/get-active-rentals');
    const isRenting = rentals.some(r => r.movieTitle === m.title && r.rentalStatus === 'ACTIVE');
    document.getElementById('reviewFormCard').style.display = isRenting ? 'block' : 'none';
    if (isRenting) {
      document.getElementById('btnWatchNow').style.display = 'flex';
      document.getElementById('btnRentNow').style.display = 'none';
    } else {
      document.getElementById('btnWatchNow').style.display = 'none';
      document.getElementById('btnRentNow').style.display = 'flex';
    }
  } catch (e) {
    document.getElementById('reviewFormCard').style.display = 'none';
    document.getElementById('btnWatchNow').style.display = 'none';
    document.getElementById('btnRentNow').style.display = 'flex';
  }

  loadModalReviews(id);
  document.getElementById('movieModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMovieModal() { document.getElementById('movieModal').classList.remove('open'); document.body.style.overflow = ''; currentMovieId = null; }
document.getElementById('movieModal').addEventListener('click', e => { if (e.target === document.getElementById('movieModal')) closeMovieModal(); });

let selectedPlan = 'SD';
function selectPlan(el, plan) { document.querySelectorAll('.rent-opt').forEach(o => o.classList.remove('selected')); el.classList.add('selected'); selectedPlan = plan; }

function goRent() {
  if (!currentMovieId) return;
  const m = allMovies.find(x => x.movieId === currentMovieId) || { movieId: currentMovieId, title: 'Movie' };
  const prices = { 'SD': 2.99, 'HD': 3.99, '4K': 4.99 };
  const price = prices[selectedPlan];
  closeMovieModal();
  const params = new URLSearchParams({ id: m.movieId, title: m.title || '', plan: selectedPlan, price: price.toFixed(2), poster: m.posterUrl || '' });
  window.location.href = 'payment.html?' + params.toString();
}

function watchNow() {
  if (!currentMovieId) return;
  const m = allMovies.find(x => x.movieId === currentMovieId);
  if (!m) return;
  closeMovieModal();
  openPlayer(m);
}

/* REVIEWS IN MODAL */
async function loadModalReviews(movieId) {
  const count = document.getElementById('reviewCount');
  const list = document.getElementById('reviewsList');
  list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--dim);font-size:13px">Loading reviews…</div>';
  document.querySelectorAll('#starInput input').forEach(i => i.checked = false);
  document.getElementById('reviewText').value = '';
  try {
    const revs = await GET(`/api/common/movie/get-all-reviews/${movieId}`);
    count.textContent = `${revs.length} review${revs.length !== 1 ? 's' : ''}`;
    list.innerHTML = '';
    if (!revs.length) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--dim);font-size:13px">No reviews yet. Be the first!</div>'; return; }

    revs.forEach(r => {
      const stars = '★'.repeat(r.rating || 0) + '☆'.repeat(5 - (r.rating || 0));
      const item = document.createElement('div'); item.className = 'review-item';
      item.id = `modal-review-item-${r.reviewId}`;

      item.innerHTML = `
        <div class="r-avatar">${(r.userName || 'U').slice(0, 2).toUpperCase()}</div>
        <div class="r-content" style="flex: 1;">
          <div class="r-user">${r.userName || 'User'} <span class="r-stars">${stars}</span></div>
          <div class="r-text">${r.comment || ''}</div>
          <div class="r-date">${r.reviewDate || r.createdAt ? new Date(r.reviewDate || r.createdAt).toLocaleDateString() : ''}</div>
        </div>`;
      list.appendChild(item);
    });
  } catch (e) { list.innerHTML = '<div style="text-align:center;padding:20px;color:var(--dim)">Failed to load reviews.</div>'; }
}

async function submitReview() {
  if (!currentMovieId) return;
  const rating = +document.querySelector('#starInput input:checked')?.value;
  const comment = document.getElementById('reviewText').value.trim();
  if (!rating) { showToast('⚠️', 'Please select a star rating'); return; }
  if (!comment) { showToast('⚠️', 'Please write a review'); return; }
  try {
    await POST('/api/user/review/add-review', { movieId: String(currentMovieId), rating: String(rating), comment });
    showToast('⭐', 'Review posted!');
    loadModalReviews(currentMovieId);
  } catch (e) { showToast('⚠️', 'Failed to post review'); }
}

/* PROFILE */
function saveProfile() {
  const name = document.getElementById('pf-name').value.trim();
  const email = document.getElementById('pf-email').value.trim();
  if (!name) { showToast('⚠️', 'Name is required'); return; }
  currentUser.name = name; currentUser.email = email; currentUser.initials = name.slice(0, 2).toUpperCase();
  const u = JSON.parse(localStorage.getItem('cinenest_user') || '{}');
  u.userName = name; u.email = email;
  localStorage.setItem('cinenest_user', JSON.stringify(u));
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = currentUser.initials;
  document.getElementById('profileName').textContent = name;
  document.getElementById('profileAvatarLg').textContent = currentUser.initials;
  document.getElementById('profileEmail').textContent = email;
  showToast('✅', 'Profile saved');
}

//update password
async function updatePassword() {
  const curr = document.getElementById('pw-current')?.value.trim();
  const newpw = document.getElementById('pw-new')?.value.trim();

  if (!curr) { showToast('⚠️', 'Enter your current password'); return; }
  if (!newpw) { showToast('⚠️', 'Enter a new password'); return; }
  if (newpw.length < 8) { showToast('⚠️', 'New password must be at least 8 characters'); return; }

  // Get user ID from localStorage (optional now, as the backend resolves it from the token)
  const u = JSON.parse(localStorage.getItem('cinenest_user') || '{}');
  const userID = u.userID || u.userId || null;

  try {
    const res = await fetch(`${API}/api/user/update-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tok()}`
      },
      body: JSON.stringify({
        userID: userID,
        currentPassword: curr,
        newPassword: newpw
      })
    });

    if (res.status === 401) { go401(); return; }

    if (!res.ok) {
      const msg = await res.text();
      showToast('⚠️', msg || 'Password update failed');
      return;
    }

    showToast('✅', 'Password updated successfully');
    document.getElementById('pw-current').value = '';
    document.getElementById('pw-new').value = '';

  } catch (err) {
    showToast('⚠️', 'Cannot reach the server.');
    console.error('[UpdatePassword]', err);
  }
}

/* DUMMY PLAYER (kept for UI) */
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h > 0 ? h + ':' : ''}${h > 0 ? String(m).padStart(2, '0') : m}:${String(s).padStart(2, '0')}`;
}

function openPlayer(m) {
  if (!m) return;

  const modal = document.getElementById('playerModal');
  const iframe = document.getElementById('playerIframe');
  const video = document.getElementById('playerVideoElement');
  const poster = document.getElementById('playerPoster');

  document.getElementById('playerTitle').textContent = m.title || '';
  document.getElementById('playerTitleBottom').textContent = m.title || '';
  document.getElementById('playerMeta').textContent = `${m.releaseYear || ''} · ${m.language || 'English'} · ${m.duration || 0} min`;

  if (m.posterUrl) {
    poster.src = m.posterUrl;
    poster.style.display = 'block';
  } else {
    poster.style.display = 'none';
  }

  // Clean up any old listeners/sources
  video.pause();
  video.src = '';
  iframe.src = '';

  // Set up new source
  const isDirectVideo = m.trailerUrl && (m.trailerUrl.trim().endsWith('.mp4') || m.trailerUrl.trim().endsWith('.webm') || m.trailerUrl.trim().endsWith('.ogg'));

  // If no URL is given, we play a beautiful open-source film stream as a high quality demo!
  const videoSrc = isDirectVideo ? m.trailerUrl.trim() : (m.trailerUrl ? null : 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4');

  if (videoSrc) {
    // Play direct/stock video
    iframe.style.display = 'none';
    video.style.display = 'block';
    video.src = videoSrc;

    // Bind video events to update custom player controls
    video.onplay = () => {
      document.getElementById('playerPlayBtn').innerHTML = '<svg width="28" height="28" fill="#000" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      poster.style.display = 'none';
    };

    video.onpause = () => {
      document.getElementById('playerPlayBtn').innerHTML = '<svg width="28" height="28" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
    };

    video.ontimeupdate = () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        document.getElementById('playerProgress').style.width = pct + '%';
        document.getElementById('playerTime').textContent = formatTime(video.currentTime);
      }
    };

    video.onloadedmetadata = () => {
      document.getElementById('playerDuration').textContent = formatTime(video.duration);
    };

    video.load();
    video.play();
  } else {
    // Play YouTube/embedded video (it has its own player controls, so we hide ours)
    video.style.display = 'none';
    iframe.style.display = 'block';
    iframe.src = getTrailerEmbedUrl(m);

    // Hide custom control elements that conflict with YouTube's controls
    document.querySelector('.player-controls').style.opacity = '0.3';
    document.querySelector('.player-controls').style.pointerEvents = 'none';
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  const modal = document.getElementById('playerModal');
  const iframe = document.getElementById('playerIframe');
  const video = document.getElementById('playerVideoElement');

  video.pause();
  video.src = '';
  iframe.src = '';

  // Reset custom controls style
  document.querySelector('.player-controls').style.opacity = '1';
  document.querySelector('.player-controls').style.pointerEvents = 'auto';
  document.getElementById('playerProgress').style.width = '0%';
  document.getElementById('playerTime').textContent = '0:00';

  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function togglePlay() {
  const video = document.getElementById('playerVideoElement');
  if (video.src) {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }
}

function seekVideo(e) {
  const video = document.getElementById('playerVideoElement');
  if (video.src && video.duration) {
    const bar = e.currentTarget;
    const pct = e.offsetX / bar.offsetWidth;
    video.currentTime = pct * video.duration;
  }
}

/* TRAILER PLAYER */
function getTrailerEmbedUrl(m) {
  if (!m.trailerUrl || !m.trailerUrl.trim()) {
    return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(m.title + ' official trailer')}&autoplay=1`;
  }

  const url = m.trailerUrl.trim();

  // YouTube watch link conversion (e.g., youtube.com/watch?v=VIDEO_ID or youtu.be/VIDEO_ID)
  let videoId = '';
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(ytRegExp);

  if (match && match[2].length === 11) {
    videoId = match[2];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  // If it's already an embed link, ensure autoplay is active
  if (url.includes('youtube.com/embed/')) {
    return url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
  }

  // Default fallback to the provided URL if it's a valid link
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(m.title + ' official trailer')}&autoplay=1`;
}

function watchTrailer() {
  if (!currentMovieId) return;
  const m = allMovies.find(x => x.movieId === currentMovieId);
  if (!m) return;

  const modal = document.getElementById('trailerModal');
  const iframe = document.getElementById('trailerPlayer');
  const video = document.getElementById('trailerVideo');
  const title = document.getElementById('trailerMovieTitle');
  const ytButton = document.getElementById('btnWatchOnYoutube');

  title.textContent = m.title;

  const isDirectVideo = m.trailerUrl && (m.trailerUrl.trim().endsWith('.mp4') || m.trailerUrl.trim().endsWith('.webm') || m.trailerUrl.trim().endsWith('.ogg'));

  if (isDirectVideo) {
    iframe.style.display = 'none';
    iframe.src = '';
    video.style.display = 'block';
    video.src = m.trailerUrl.trim();
    video.load();
    video.play();
    ytButton.style.display = 'none';
  } else {
    video.style.display = 'none';
    video.src = '';
    iframe.style.display = 'block';
    iframe.src = getTrailerEmbedUrl(m);

    if (m.trailerUrl && m.trailerUrl.trim()) {
      ytButton.href = m.trailerUrl.trim();
      ytButton.style.display = 'flex';
    } else {
      ytButton.style.display = 'none';
    }
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTrailer() {
  const modal = document.getElementById('trailerModal');
  const iframe = document.getElementById('trailerPlayer');
  const video = document.getElementById('trailerVideo');

  iframe.src = '';
  video.pause();
  video.src = '';

  modal.classList.remove('open');

  // Only restore overflow if the parent movie modal is also closed
  if (!document.getElementById('movieModal').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}

/* DUMMY STAT */
document.getElementById('s-spent').textContent = '$0';
document.getElementById('ps-spent').textContent = '$0';

/* INIT */
loadBrowse();
loadWatchlist().then(() => loadCounts());