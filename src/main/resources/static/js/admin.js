/* CineNest – Admin Dashboard Portal Client Logic */
const API_BASE = 'http://localhost:8080';

// Auth checks
const token = localStorage.getItem('cinenest_token');
const role = localStorage.getItem('cinenest_role');

if (!token || role !== 'ROLE_ADMIN') {
  showToast('⚠️', 'Access Denied: Administrator Only');
  setTimeout(() => {
    window.location.href = 'user_page.html';
  }, 1500);
}

// Global cached records
let allMovies = [];
let allCategories = [];
let allUsers = [];

// DOM load init
document.addEventListener('DOMContentLoaded', () => {
  if (token && role === 'ROLE_ADMIN') {
    // Initial fetch of standard database tables
    loadMovies();
    loadCategories();
    loadUsers();
  }
});

// Toast system
let toastTimer;
function showToast(icon, msg) {
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = msg;
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// Custom Modal Confirmation System
let confirmResolve = null;

function customConfirm(message) {
  return new Promise((resolve) => {
    document.getElementById('confirmDeleteMessage').textContent = message;
    const modal = document.getElementById('confirmDeleteModal');
    modal.classList.add('open');

    // Set up the click handler for the proceed button
    const btnProceed = document.getElementById('btnConfirmProceed');
    btnProceed.onclick = () => {
      modal.classList.remove('open');
      resolve(true);
    };

    confirmResolve = resolve;
  });
}

function closeConfirmDeleteModal() {
  const modal = document.getElementById('confirmDeleteModal');
  modal.classList.remove('open');
  if (confirmResolve) {
    confirmResolve(false);
    confirmResolve = null;
  }
}

// Tab switcher
function switchAdminTab(tabName, el) {
  // Toggle sidebar active item
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');

  // Toggle active content panel
  document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById('panel-' + tabName).classList.add('active');

  // Update topbar title
  const titles = { movies: 'Manage Movies', categories: 'Manage Categories', users: 'Manage Users' };
  document.getElementById('adminTitle').textContent = titles[tabName] || tabName;
}

// API helper abstractions
async function adminGet(endpoint) {
  const res = await fetch(API_BASE + endpoint, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (res.status === 401 || res.status === 403) {
    showToast('⚠️', 'Session expired. Logging out.');
    setTimeout(logout, 1500);
    throw new Error('Unauthorized');
  }
  return res.json();
}

async function adminRequest(endpoint, method, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const config = {
    method: method,
    headers: headers
  };
  if (body) {
    config.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + endpoint, config);

  if (res.status === 401 || res.status === 403) {
    showToast('⚠️', 'Session expired. Logging out.');
    setTimeout(logout, 1500);
    throw new Error('Unauthorized');
  }

  // Handle DELETE successfully returning string plaintext instead of JSON
  if (method === 'DELETE') {
    if (!res.ok) throw new Error('Delete failed');
    return res.text();
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'API Request Failed');
  }
  return data;
}

function logout() {
  localStorage.removeItem('cinenest_token');
  localStorage.removeItem('cinenest_user');
  localStorage.removeItem('cinenest_role');
  window.location.href = 'signin_page.html';
}

/* ════════════════════════════════════════
   MOVIES MANAGEMENT
   ════════════════════════════════════════ */
let activeAdminFilter = 'all';

async function loadMovies() {
  const tbody = document.getElementById('moviesTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">Fetching movie catalog...</td></tr>';

  try {
    allMovies = await adminGet('/api/common/movie/get-all-movies');

    const searchInput = document.getElementById('movieSearchInput');
    if (searchInput) searchInput.value = '';

    activeAdminFilter = 'all';

    buildAdminFilterPills();
    renderMovies(allMovies);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--live-red);">Failed to connect. Make sure spring boot server is up.</td></tr>';
  }
}

function renderMovies(moviesList) {
  const tbody = document.getElementById('moviesTableBody');
  tbody.innerHTML = '';

  if (moviesList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-dim);">No movies found.</td></tr>';
    return;
  }

  moviesList.forEach(m => {
    const categoriesText = m.categories && m.categories.length
      ? m.categories.join(', ')
      : 'None';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        ${m.posterUrl
          ? `<img class="table-poster" src="${m.posterUrl}" alt="${m.title}" onerror="this.outerHTML='🎬'">`
          : '🎬'}
      </td>
      <td style="font-weight:600;">${m.title}</td>
      <td>${categoriesText}</td>
      <td>${m.language || 'English'}</td>
      <td>${m.duration || 0} min</td>
      <td>${m.releaseYear || '—'}</td>
      <td>
        <button class="btn-icon-edit" onclick="editMoviePrompt(${m.movieId})">✏️ Edit</button>
        <button class="btn-icon-delete" onclick="deleteMovieConfirm(${m.movieId})">🗑️ Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function buildAdminFilterPills() {
  const bar = document.getElementById('adminGenreBar');
  if (!bar) return;

  if (activeAdminFilter !== 'all') {
    const exists = allCategories.some(cat => cat.name === activeAdminFilter);
    if (!exists) {
      activeAdminFilter = 'all';
    }
  }

  let html = `<div class="f-pill ${activeAdminFilter === 'all' ? 'active' : ''}" data-g="all" onclick="setAdminFilter('all', this)">All</div>`;
  html += allCategories.map(cat => {
    const isActive = cat.name === activeAdminFilter;
    return `<div class="f-pill ${isActive ? 'active' : ''}" data-g="${cat.name}" onclick="setAdminFilter('${cat.name}', this)">${cat.name}</div>`;
  }).join('');

  bar.innerHTML = html;
}

function setAdminFilter(g, el) {
  document.querySelectorAll('#adminGenreBar .f-pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  activeAdminFilter = g;
  applyMovieFilters();
}

function applyMovieFilters() {
  const q = document.getElementById('movieSearchInput').value.trim().toLowerCase();

  const filtered = allMovies.filter(m => {
    // 1. Category Filter
    if (activeAdminFilter !== 'all') {
      const hasCat = m.categories && m.categories.includes(activeAdminFilter);
      if (!hasCat) return false;
    }

    // 2. Text Search Filter
    if (q) {
      const title = (m.title || '').toLowerCase();
      const lang = (m.language || '').toLowerCase();
      const year = String(m.releaseYear || '');
      const categories = m.categories && m.categories.length
        ? m.categories.map(c => c.toLowerCase())
        : [];
      return title.includes(q) || lang.includes(q) || year.includes(q) || categories.some(c => c.includes(q));
    }

    return true;
  });

  renderMovies(filtered);
}

function searchMovie() {
  applyMovieFilters();
}

function clearMovieSearch() {
  document.getElementById('movieSearchInput').value = '';
  applyMovieFilters();
}


// Setup category checkboxes selection inside modal card
function populateCategoryCheckboxes() {
  const box = document.getElementById('categoryCheckboxes');
  box.innerHTML = '';

  if (allCategories.length === 0) {
    box.innerHTML = '<span style="font-size:12px; color:var(--text-dim);">No categories found. Save some categories first!</span>';
    return;
  }

  allCategories.forEach(cat => {
    const lbl = document.createElement('label');
    lbl.className = 'checkbox-label';
    lbl.innerHTML = `
      <input type="checkbox" name="categories" value="${cat.categoryId}">
      <span>${cat.name}</span>
    `;
    box.appendChild(lbl);
  });
}

function openMovieFormModal() {
  document.getElementById('movieFormTitle').textContent = 'Add New Movie';
  document.getElementById('form-movie-id').value = '';
  document.getElementById('movieForm').reset();

  populateCategoryCheckboxes();

  document.getElementById('movieFormModal').classList.add('open');
}

function closeMovieFormModal() {
  document.getElementById('movieFormModal').classList.remove('open');
}

function editMoviePrompt(movieId) {
  const m = allMovies.find(x => x.movieId === movieId);
  if (!m) return;

  document.getElementById('movieFormTitle').textContent = 'Modify Movie Details';
  document.getElementById('form-movie-id').value = m.movieId;
  document.getElementById('form-movie-title').value = m.title || '';
  document.getElementById('form-movie-lang').value = m.language || '';
  document.getElementById('form-movie-dur').value = m.duration || '';
  document.getElementById('form-movie-year').value = m.releaseYear || '';
  document.getElementById('form-movie-poster').value = m.posterUrl || '';
  document.getElementById('form-movie-trailer').value = m.trailerUrl || '';
  document.getElementById('form-movie-desc').value = m.description || '';

  populateCategoryCheckboxes();

  // Pre-check existing categories
  if (m.categories && m.categories.length) {
    const checkedIds = allCategories
      .filter(cat => m.categories.includes(cat.name))
      .map(cat => String(cat.categoryId));
    const checkboxes = document.querySelectorAll('#categoryCheckboxes input[type="checkbox"]');
    checkboxes.forEach(box => {
      if (checkedIds.includes(box.value)) {
        box.checked = true;
      }
    });
  }

  document.getElementById('movieFormModal').classList.add('open');
}

async function saveMovie(event) {
  event.preventDefault();

  const id = document.getElementById('form-movie-id').value;
  const title = document.getElementById('form-movie-title').value.trim();
  const language = document.getElementById('form-movie-lang').value.trim();
  const duration = parseInt(document.getElementById('form-movie-dur').value);
  const releaseYear = parseInt(document.getElementById('form-movie-year').value);
  const posterUrl = document.getElementById('form-movie-poster').value.trim();
  const trailerUrl = document.getElementById('form-movie-trailer').value.trim();
  const description = document.getElementById('form-movie-desc').value.trim();

  // Gather category IDs from checkboxes
  const categoryIds = Array.from(document.querySelectorAll('#categoryCheckboxes input[name="categories"]:checked'))
    .map(chk => parseInt(chk.value));

  try {
    if (id) {
      // Edit mode (PUT)
      // Body parameter for UpdateMovieRequest requires category integers array as 'categoryIds' property
      await adminRequest('/api/admin/movie/update-movie', 'PUT', {
        movieId: id,
        title,
        description,
        language,
        duration,
        releaseYear,
        posterUrl,
        trailerUrl,
        categoryIds: categoryIds
      });
      showToast('✅', 'Movie updated successfully');
    } else {
      // Add mode (POST)
      // CreateMovieRequest takes categoryIds
      await adminRequest('/api/admin/movie/add-movie', 'POST', {
        title,
        description,
        language,
        duration,
        releaseYear,
        posterUrl,
        trailerUrl,
        categoryIds
      });
      showToast('🍿', 'New movie added to CineNest catalog!');
    }

    closeMovieFormModal();
    loadMovies();
  } catch (err) {
    console.error(err);
    showToast('⚠️', 'Error occurred saving movie record.');
  }
}

async function deleteMovieConfirm(movieId) {
  const proceed = await customConfirm('Are you absolutely sure you want to delete this movie? This action is permanent.');
  if (!proceed) return;

  try {
    await adminRequest(`/api/admin/movie/delete-movie/${movieId}`, 'DELETE');
    showToast('🗑️', 'Movie deleted successfully.');
    loadMovies();
  } catch (err) {
    console.error(err);
    showToast('⚠️', 'Failed to delete movie.');
  }
}

/* ════════════════════════════════════════
   CATEGORIES MANAGEMENT
   ════════════════════════════════════════ */
async function loadCategories() {
  const tbody = document.getElementById('categoriesTableBody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">Fetching category list...</td></tr>';

  try {
    allCategories = await adminGet('/api/admin/category/get-all-categories');
    tbody.innerHTML = '';

    // Refresh filter bar on movies tab whenever categories list changes
    buildAdminFilterPills();
    applyMovieFilters();

    if (allCategories.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-dim);">No categories defined yet.</td></tr>';
      return;
    }

    allCategories.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:700; color:var(--gold);">${cat.categoryId}</td>
        <td style="font-weight:600;">${cat.name}</td>
        <td>${cat.description || '—'}</td>
        <td>
          <button class="btn-icon-edit" onclick="editCategoryPrompt(${cat.categoryId})">✏️ Edit</button>
          <button class="btn-icon-delete" onclick="deleteCategoryConfirm(${cat.categoryId})">🗑️ Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--live-red);">Failed to retrieve categories.</td></tr>';
  }
}

function openCategoryFormModal() {
  document.getElementById('categoryFormTitle').textContent = 'Add New Category';
  document.getElementById('form-cat-id').value = '';
  document.getElementById('categoryForm').reset();

  document.getElementById('categoryFormModal').classList.add('open');
}

function closeCategoryFormModal() {
  document.getElementById('categoryFormModal').classList.remove('open');
}

function editCategoryPrompt(catId) {
  const cat = allCategories.find(x => x.categoryId === catId);
  if (!cat) return;

  document.getElementById('categoryFormTitle').textContent = 'Modify Category Details';
  document.getElementById('form-cat-id').value = cat.categoryId;
  document.getElementById('form-cat-name').value = cat.name || '';
  document.getElementById('form-cat-desc').value = cat.description || '';

  document.getElementById('categoryFormModal').classList.add('open');
}

async function saveCategory(event) {
  event.preventDefault();

  const id = document.getElementById('form-cat-id').value;
  const name = document.getElementById('form-cat-name').value.trim();
  const description = document.getElementById('form-cat-desc').value.trim();

  try {
    if (id) {
      await adminRequest('/api/admin/category/update-category', 'PUT', {
        categoryId: id,
        name,
        description
      });
      showToast('✅', 'Category updated successfully.');
    } else {
      await adminRequest('/api/admin/category/add-category', 'POST', {
        name,
        description
      });
      showToast('📂', 'Category saved successfully!');
    }

    closeCategoryFormModal();
    loadCategories();
    // Re-load movies to reflect changes in category references if edit mode
    loadMovies();
  } catch (err) {
    console.error(err);
    showToast('⚠️', 'Error saving category.');
  }
}

async function deleteCategoryConfirm(catId) {
  const cat = allCategories.find(x => x.categoryId === catId);
  if (!cat) return;

  // Filter movies that have this category name in their category list
  const linkedMovies = allMovies.filter(m => m.categories && m.categories.includes(cat.name));

  if (linkedMovies.length > 0) {
    showWarningDeleteModal(cat.name, linkedMovies);
    return;
  }

  const proceed = await customConfirm('Warning: Deleting a category will remove it from all movie attachments. Do you wish to proceed?');
  if (!proceed) return;

  try {
    await adminRequest(`/api/admin/category/delete-category/${catId}`, 'DELETE');
    showToast('🗑️', 'Category deleted successfully.');
    loadCategories();
    loadMovies();
  } catch (err) {
    console.error(err);
    showToast('⚠️', 'Failed to delete category.');
  }
}

function showWarningDeleteModal(categoryName, movies) {
  const modal = document.getElementById('warningDeleteModal');
  const msgEl = document.getElementById('warningDeleteMessage');
  const listEl = document.getElementById('warningMovieList');

  msgEl.innerHTML = `Category <strong>"${categoryName}"</strong> cannot be deleted because it is currently assigned to the following movie(s):`;

  listEl.innerHTML = '';
  movies.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'warning-movie-item';
    item.textContent = movie.title;
    listEl.appendChild(item);
  });

  modal.classList.add('open');
}

function closeWarningDeleteModal() {
  const modal = document.getElementById('warningDeleteModal');
  modal.classList.remove('open');
}

/* ════════════════════════════════════════
   USERS MANAGEMENT
   ════════════════════════════════════════ */
async function loadUsers() {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Fetching users list...</td></tr>';

  try {
    allUsers = await adminGet('/api/admin/user/get-all-users');
    renderUsers(allUsers);
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--live-red);">Failed to retrieve database users.</td></tr>';
  }
}

function renderUsers(usersList) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '';

  if (usersList.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">No users found.</td></tr>';
    return;
  }

  usersList.forEach(u => {
    const roleTagClass = u.role === 'ROLE_ADMIN' ? 'active' : 'plan';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:700; color:var(--text-dim);">${u.userID || '—'}</td>
      <td style="font-weight:600;">${u.userName || '—'}</td>
      <td>${u.email}</td>
      <td><span class="table-tag ${roleTagClass}">${u.role || 'ROLE_USER'}</span></td>
      <td>
        <button class="btn-icon-delete" onclick="deleteUserConfirm(${u.userID})">🗑️ Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function searchUser() {
  const email = document.getElementById('userSearchInput').value.trim();
  if (!email) {
    showToast('⚠️', 'Please input an email to search.');
    return;
  }

  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Searching user...</td></tr>';

  try {
    // Search API returns a single UserResponse body on success
    const res = await adminGet(`/api/admin/user/search-user?email=${encodeURIComponent(email)}`);

    if (res && res.email) {
      renderUsers([res]);
    } else {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">No matching user found.</td></tr>';
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">User search failed or not found.</td></tr>';
  }
}

function clearUserSearch() {
  document.getElementById('userSearchInput').value = '';
  renderUsers(allUsers);
}

async function deleteUserConfirm(userId) {
  if (!userId) {
    showToast('⚠️', 'Invalid user ID');
    return;
  }
  const proceed = await customConfirm('Warning: This will permanently delete the user and revoke their platform access. Proceed?');
  if (!proceed) return;

  try {
    await adminRequest(`/api/admin/user/delete-user/${userId}`, 'DELETE');
    showToast('🗑️', 'User account successfully deleted.');
    loadUsers();
  } catch (err) {
    console.error(err);
    showToast('⚠️', 'Failed to delete user.');
  }
}
