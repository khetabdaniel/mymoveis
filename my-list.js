const API_KEY = '97a24255';
const BASE_URL = 'https://www.omdbapi.com';

async function fetchFavoriteMovies() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (favorites.length === 0) {
    document.querySelector('.empty-list').style.display = 'block';
    document.querySelector('.movie-grid').style.display = 'none';
    return;
  }

  try {
    const moviePromises = favorites.map(async id => {
      const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${id}`);
      const data = await response.json();
      if (data.Response === 'True') {
        return data;
      }
      return null;
    });

    const movies = await Promise.all(moviePromises);
    displayMovies(movies.filter(movie => movie !== null));
  } catch (error) {
    console.error('Error fetching favorite movies:', error);
  }
}

function displayMovies(movies) {
  const movieGrid = document.querySelector('.movie-grid');
  movieGrid.innerHTML = '';

  if (movies.length === 0) {
    document.querySelector('.empty-list').style.display = 'block';
    movieGrid.style.display = 'none';
    return;
  }

  document.querySelector('.empty-list').style.display = 'none';
  movieGrid.style.display = 'grid';

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.className = 'movie-card';
    
    movieCard.innerHTML = `
      <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450.png?text=No+Poster'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <div class="rating">
          <span>⭐ ${movie.imdbRating}/10</span>
          <button class="favorite-btn active" data-id="${movie.imdbID}">❤️</button>
        </div>
        <p class="overview">${movie.Plot || 'لا يوجد وصف متاح'}</p>
      </div>
    `;
    
    movieGrid.appendChild(movieCard);
  });

  addFavoriteListeners();
}

function addFavoriteListeners() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const movieId = e.target.dataset.id;
      toggleFavorite(movieId);
      // إعادة تحميل القائمة بعد إزالة فيلم
      fetchFavoriteMovies();
    });
  });
}

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

// تحميل الأفلام المفضلة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', fetchFavoriteMovies);
