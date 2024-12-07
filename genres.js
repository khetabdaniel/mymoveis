const API_KEY = '97a24255';
const BASE_URL = 'https://www.omdbapi.com';

const genreMovies = {
  action: ['The Dark Knight', 'Mad Max: Fury Road', 'John Wick'],
  comedy: ['The Hangover', 'Superbad', 'Bridesmaids'],
  drama: ['The Shawshank Redemption', 'The Godfather', 'Forrest Gump'],
  horror: ['The Shining', 'A Quiet Place', 'Get Out'],
  scifi: ['Inception', 'Interstellar', 'The Matrix'],
  romance: ['Titanic', 'La La Land', 'The Notebook']
};

async function fetchMoviesByGenre(genre) {
  try {
    const movies = genreMovies[genre];
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
    console.error('Error fetching movies:', error);
    return [];
  }
}

function displayMovies(movies) {
  const movieGrid = document.querySelector('.movie-grid');
  movieGrid.innerHTML = '';

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
    
    movieGrid.appendChild(movieCard);
  });

  addFavoriteListeners();
}

function addFavoriteListeners() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const movieId = e.target.dataset.id;
      toggleFavorite(movieId);
      btn.classList.toggle('active');
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

// إضافة مستمعي الأحداث لبطاقات التصنيفات
document.querySelectorAll('.genre-card').forEach(card => {
  card.addEventListener('click', async () => {
    const genre = card.dataset.genre;
    const movies = await fetchMoviesByGenre(genre);
    displayMovies(movies);
    
    // تحديث العنوان
    document.querySelector('.genre-movies h2').textContent = `أفلام ${card.querySelector('h3').textContent}`;
    
    // تمرير إلى قسم الأفلام
    document.querySelector('.genre-movies').scrollIntoView({ behavior: 'smooth' });
  });
});
