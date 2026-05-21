const TMDB_KEY  = 'f176353fc63a6655cdfe3aa0902e6d40';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w342';

const GENRE_MAP = {
    'Action':      28,
    'Animation':   16,
    'Comedy':      35,
    'Crime':       80,
    'Documentary': 99,
    'Drama':       18,
    'Horror':      27,
    'Romance':     10749,
    'Sci-Fi':      878,
    'Thriller':    53,
};

/* ── FETCH HELPERS ── */
async function tmdbFetch(endpoint) {
    const sep = endpoint.includes('?') ? '&' : '?';
    const res = await fetch(`${TMDB_BASE}${endpoint}${sep}api_key=${TMDB_KEY}`);
    return res.json();
}

async function fetchMoviesByGenre(genreId = null) {
    const params = new URLSearchParams({
        api_key:         TMDB_KEY,
        sort_by:         'popularity.desc',
        include_adult:   false,
        page:            1,
        ...(genreId && { with_genres: genreId }),
    });
    const res  = await fetch(`${TMDB_BASE}/discover/movie?${params}`);
    const data = await res.json();
    return data.results;
}

/* ── RENDER MOVIE CARD ── */
function renderMovieCard(container, movie) {
    const posterUrl = movie.poster_path ? `${TMDB_IMG}${movie.poster_path}` : null;
    const rating    = movie.vote_average?.toFixed(1) || '—';
    const year      = (movie.release_date || movie.first_air_date || '').slice(0, 4);
    const title     = movie.title || movie.name || 'Unknown';

    // NEW badge — if released within last 90 days
    const releaseDate = new Date(movie.release_date || movie.first_air_date || 0);
    const isNew = (Date.now() - releaseDate) < 90 * 24 * 60 * 60 * 1000;

    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <div class="card-thumb">
        ${posterUrl
        ? `<img src="${posterUrl}" alt="${title}" style="width:100%;height:100%;object-fit:cover;display:block;border-radius:var(--card-radius)" loading="lazy">`
        : `<div class="thumb-bg" style="background:linear-gradient(145deg,#2a1f5e,#0d0d1a)">🎬</div>`
    }

        ${isNew ? `<div class="card-new-badge">NEW</div>` : ''}
        <div class="card-rating">⭐ ${rating}</div>

        <div class="card-overlay">
          <div class="play-btn-sm">
            <svg width="14" height="14" fill="#000" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>
        </div>
      </div>
      <div class="card-meta">
        <div class="card-title">${title}</div>
        <div class="card-sub">${year}</div>
      </div>
    `;
    container.appendChild(card);
}

/* ── GENRE PILLS ── */
function initGenrePills() {
    const pills       = document.querySelectorAll('.genres-section .pill');
    const trendingRow = document.getElementById('trendingRow');

    pills.forEach(pill => {
        pill.addEventListener('click', async () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');

            const label   = pill.textContent.trim();
            const genreId = label === 'All' ? null : GENRE_MAP[label];

            trendingRow.innerHTML = '<div style="color:var(--text-muted);padding:20px">Loading...</div>';

            try {
                const movies = await fetchMoviesByGenre(genreId);
                trendingRow.innerHTML = '';
                movies.slice(0, 15).forEach(m => renderMovieCard(trendingRow, m));
            } catch (err) {
                console.error('Genre fetch failed:', err);
                trendingRow.innerHTML = '<div style="color:var(--text-muted);padding:20px">Failed to load.</div>';
            }
        });
    });
}

/* ── SEE ALL HANDLER ── */
document.querySelectorAll('.see-all').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const section = e.target.dataset.section;
        const routes  = {
            trending: 'browse.html?category=trending',
            tv:       'browse.html?category=tv',
            new:      'browse.html?category=new',
        };
        if (routes[section]) window.location.href = routes[section];
    });
});

/* ── INIT ── */
async function loadHomepage() {
    const [trending, tvShows, nowPlaying] = await Promise.allSettled([
        tmdbFetch('/trending/movie/week?language=en-US'),
        tmdbFetch('/tv/popular?language=en-US&page=1'),
        tmdbFetch('/movie/now_playing?language=en-US&page=1'),
    ]);

    if (trending.status === 'fulfilled')
        trending.value.results.slice(0, 10).forEach(m => renderMovieCard(document.getElementById('trendingRow'), m));

    if (tvShows.status === 'fulfilled')
        tvShows.value.results.slice(0, 10).forEach(m => renderMovieCard(document.getElementById('tvRow'), m));

    if (nowPlaying.status === 'fulfilled')
        nowPlaying.value.results.slice(0, 10).forEach(m => renderMovieCard(document.getElementById('newRow'), m));

    initGenrePills();

    // Auto-select genre from URL param e.g. moviepage.html?genre=Action
    const urlGenre = new URLSearchParams(window.location.search).get('genre');
    if (urlGenre) {
        const match = [...document.querySelectorAll('.pill')].find(p => p.textContent.trim() === urlGenre);
        if (match) match.click();
    }
}

loadHomepage();