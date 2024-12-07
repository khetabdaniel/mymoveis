// API configuration
const API_KEY = '97a24255';
const BASE_URL = 'https://www.omdbapi.com';

// قوائم الأفلام حسب الأقسام
const movieLists = {
  trending: [
    'Oppenheimer',
    'Barbie',
    'Mission: Impossible - Dead Reckoning',
    'The Super Mario Bros. Movie',
    'Guardians of the Galaxy Vol. 3'
  ],
  featured: [
    'The Dark Knight',
    'Inception',
    'Interstellar',
    'The Shawshank Redemption',
    'Pulp Fiction',
    'The Matrix'
  ],
  topRated: [
    'The Godfather',
    'The Lord of the Rings',
    'Forrest Gump',
    'Gladiator',
    'Saving Private Ryan',
    'Schindler\'s List'
  ]
};

// جلب الأفلام حسب القائمة
async function fetchMoviesByList(listName) {
  try {
    const movies = movieLists[listName];
    const moviePromises = movies.map(async title => {
      const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&t=${title}&type=movie`);
      const data = await response.json();
      if (data.Response === 'True') {
        return data;
      }
      return null;
    });

    const results = await Promise.all(moviePromises);
    return results.filter(movie => movie !== null);
  } catch (error) {
    console.error(`Error fetching ${listName} movies:`, error);
    return [];
  }
}

// عرض الأفلام في قسم معين
function displayMoviesInSection(movies, sectionClass) {
  const container = document.querySelector(`${sectionClass} .movie-grid`) || 
                   document.querySelector(`${sectionClass}`);
  if (!container) return;

  container.innerHTML = '';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    
    movieCard.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <div class="rating">
          <span>⭐ ${movie.imdbRating}/10</span>
          <button class="favorite-btn" data-id="${movie.imdbID}">❤️</button>
        </div>
        <p class="overview">${movie.Plot || 'لا يوجد وصف متاح'}</p>
      </div>
    `;
    
    container.appendChild(movieCard);
  });

  addFavoriteListeners();
}

// عرض الأفلام في قسم التصفح الأفقي
function displayTrendingMovies(movies) {
  const container = document.querySelector('.trending-scroll');
  if (!container) return;

  container.innerHTML = '';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    
    movieCard.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <div class="rating">⭐ ${movie.imdbRating}/10</div>
      </div>
    `;
    
    container.appendChild(movieCard);
  });
}

// وظيفة البحث
async function searchMovies(query) {
  try {
    const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${query}&type=movie`);
    const data = await response.json();
    if (data.Response === 'True') {
      const detailedMovies = await Promise.all(
        data.Search.map(async movie => {
          const detailResponse = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${movie.imdbID}`);
          return detailResponse.json();
        })
      );
      return detailedMovies;
    }
    return [];
  } catch (error) {
    console.error('Error searching movies:', error);
    return [];
  }
}

// إضافة مستمع البحث
const searchBar = document.querySelector('.search-bar');
let searchTimeout;

searchBar.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const searchTerm = e.target.value.trim();
  
  if (searchTerm.length > 2) {
    searchTimeout = setTimeout(async () => {
      const movies = await searchMovies(searchTerm);
      displayMoviesInSection(movies, '.featured-section');
      
      // إخفاء الأقسام الأخرى أثناء البحث
      document.querySelector('.trending-section').style.display = 'none';
      document.querySelector('.top-rated-section').style.display = 'none';
    }, 500);
  } else if (searchTerm.length === 0) {
    // إظهار جميع الأقسام عند مسح البحث
    document.querySelector('.trending-section').style.display = 'block';
    document.querySelector('.top-rated-section').style.display = 'block';
    loadAllSections();
  }
});

// إضافة مستمعي الأحداث للأفلام المفضلة
function addFavoriteListeners() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const movieId = e.target.dataset.id;
      toggleFavorite(movieId);
      btn.classList.toggle('active');
    });
  });
}

// تبديل حالة الفيلم المفضل
function toggleFavorite(movieId) {
  let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const index = favorites.indexOf(movieId);
  
  if (index === -1) {
    favorites.push(movieId);
  } else {
    favorites.splice(index, 1);
  }
  
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// تحميل جميع الأقسام
async function loadAllSections() {
  const trendingMovies = await fetchMoviesByList('trending');
  const featuredMovies = await fetchMoviesByList('featured');
  const topRatedMovies = await fetchMoviesByList('topRated');

  displayTrendingMovies(trendingMovies);
  displayMoviesInSection(featuredMovies, '.featured-section');
  displayMoviesInSection(topRatedMovies, '.top-rated-section');
}

// تحميل الأفلام عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadAllSections);

// إضافة التمرير السلس للقسم المتحرك
document.querySelector('.trending-scroll')?.addEventListener('wheel', (e) => {
  e.preventDefault();
  document.querySelector('.trending-scroll').scrollLeft += e.deltaY;
});

// Genre card click handler
document.querySelectorAll('.genre-card').forEach(card => {
  card.addEventListener('click', () => {
    const genre = card.querySelector('h3').textContent;
    window.location.href = `https://watchmovies.com/genres/${genre.toLowerCase()}`;
  });
});
