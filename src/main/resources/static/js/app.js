const images = [
    'https://media.themoviedb.org/t/p/w440_and_h660_face/ybrX94xQm8lXYpZAPRmwD9iIbWP.jpg',
    'https://media.themoviedb.org/t/p/w440_and_h660_face/aabwWZWx6z1aYP4PX2ADvbDKktd.jpg',
    'https://media.themoviedb.org/t/p/w440_and_h660_face/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    'https://media.themoviedb.org/t/p/w440_and_h660_face/qJ2tW6WMUDux911r6m7haRef0WH.jpg',

];

const collage = document.getElementById('collage');

// track which image index each tile is currently showing
const tileImageIndex = [];

// shuffle a copy of images for initial display
let imagePool = [...images].sort(() => Math.random() - 0.5);

for (let i = 0; i < 5; i++) {
    const tile = document.createElement('div');
    tile.className = 'poster-tile';
    tile.style.cssText = `--pd:${(Math.random() * 3).toFixed(1)}s`;

    const imgIndex = i % images.length;
    tileImageIndex.push(imgIndex);

    const img = document.createElement('img');

    // Start hidden to prevent the "double refresh" popping effect on load
    img.classList.add('fading');

    // Set source immediately to load smoothly
    img.src = images[imgIndex];

    img.alt = 'Movie poster';
    img.loading = i < 8 ? 'eager' : 'lazy';

    // Fade in once loaded
    img.onload = () => img.classList.remove('fading');
    img.onerror = () => {
        tile.style.background = '#1a1a2e';
        img.classList.remove('fading');
    };

    tile.appendChild(img);
    collage.appendChild(tile);
}

// Change exactly ONE tile at a time perfectly sequentially
let currentTileIndex = 0;

function rotateCollageImages() {
    const tiles = Array.from(collage.querySelectorAll('.poster-tile'));
    if (tiles.length === 0) return;

    const tile = tiles[currentTileIndex];
    if (!tile) return;

    const img = tile.querySelector('img');
    if (!img) return;

    // Fade out
    img.classList.add('fading');

    setTimeout(() => {
        // Pick the next image in sequence from the array
        let nextImageIdx = (tileImageIndex[currentTileIndex] + 1) % images.length;

        tileImageIndex[currentTileIndex] = nextImageIdx;

        // Attach onload BEFORE changing src to prevent cache issues
        img.onload = () => img.classList.remove('fading');
        img.onerror = () => img.classList.remove('fading');
        img.src = images[nextImageIdx];

        // Safety fallback just in case onload fails because of browser cache
        setTimeout(() => img.classList.remove('fading'), 300);

    }, 1200); // Wait 1200ms to match the new wider CSS fade out animation

    // Move to the next tile for the next interval run
    currentTileIndex = (currentTileIndex + 1) % tiles.length;
}

// Trigger ONE tile rotation every 3 seconds for a continuous, issue-free steady flow
setInterval(rotateCollageImages, 2000);

// ── SEARCH FUNCTIONALITY (TMDB Integration) ──
const searchBox = document.getElementById('searchBox');
const searchBtn = document.getElementById('searchBtn');

const TMDB_KEY  = 'f176353fc63a6655cdfe3aa0902e6d40';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG  = 'https://image.tmdb.org/t/p/w342';
const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w780';

async function performSearch() {
    const query = searchBox.value.trim();
    if (!query) return;

    try {
        const res = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`);
        const data = await res.json();

        if (data.results && data.results.length > 0) {
            const movie = data.results[0]; // Get the best matching movie
            showSearchModal(movie);
        } else {
            alert('No movies found matching your search.');
        }
    } catch (err) {
        console.error('Search failed:', err);
        alert('Failed to connect to movie search service.');
    }
}

function showSearchModal(movie) {
    const modal = document.getElementById('searchModal');
    const backdrop = document.getElementById('searchModalBackdrop');
    const poster = document.getElementById('smPoster');
    const title = document.getElementById('smTitle');
    const year = document.getElementById('smYear');
    const rating = document.getElementById('smRating');
    const overview = document.getElementById('smOverview');

    title.textContent = movie.title || movie.name || 'Unknown';
    year.textContent = (movie.release_date || '').slice(0, 4) || '—';
    rating.textContent = movie.vote_average ? `⭐ ${movie.vote_average.toFixed(1)}/10` : '⭐ —';
    overview.textContent = movie.overview || 'No description available for this movie.';

    if (movie.poster_path) {
        poster.src = `${TMDB_IMG}${movie.poster_path}`;
        poster.style.display = 'block';
    } else {
        poster.style.display = 'none';
    }

    if (movie.backdrop_path) {
        backdrop.style.backgroundImage = `url('${TMDB_BACKDROP}${movie.backdrop_path}')`;
    } else {
        backdrop.style.backgroundImage = '';
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

// Bind search events
if (searchBtn && searchBox) {
    searchBtn.addEventListener('click', performSearch);
    searchBox.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

const searchModal = document.getElementById('searchModal');
if (searchModal) {
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });
}

window.closeSearchModal = closeSearchModal;


