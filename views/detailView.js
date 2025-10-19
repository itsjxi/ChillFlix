import { tmdbApi } from '../models/tmdbApi.js';
import { LocalStorageHelper } from '../utils/localStorageHelper.js';
import { BaseComponent } from '../components/BaseComponent.js';

export class DetailView {
  constructor() {
    this.currentItem = null;
  }

  async render(mediaType, id) {
    try {
      this.currentItem = await tmdbApi.getDetails(mediaType, id);
      this.showDetailPage();
      this.bindEvents();
    } catch (error) {
      console.error('Error loading details:', error);
      this.showError();
    }
  }

  showDetailPage() {
    // Hide other sections
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('trendingNow').style.display = 'none';
    document.getElementById('topMovies').style.display = 'none';
    document.getElementById('topTV').style.display = 'none';
    document.querySelector('.movies-section').style.display = 'none';

    // Show detail content
    const app = document.getElementById('app');
    const existingDetail = document.getElementById('detailPage');
    
    if (existingDetail) {
      existingDetail.remove();
    }

    const detailHTML = this.createDetailHTML();
    app.insertAdjacentHTML('beforeend', detailHTML);
  }

  createDetailHTML() {
    const item = this.currentItem;
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
    const runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]) || 'N/A';
    const mediaType = item.title ? 'movie' : 'tv';
    const isInWatchlist = LocalStorageHelper.isInWatchlist(item.id, mediaType);

    return `
      <div id="detailPage" class="detail-page">
        <div class="detail-hero" style="background-image: url('${tmdbApi.getImageUrl(item.backdrop_path, 'w1280')}')">
          <div class="detail-content">
            ${BaseComponent.createBackButton()}
            <div class="detail-poster">
              <img src="${tmdbApi.getImageUrl(item.poster_path)}" alt="${title}">
            </div>
            <div class="detail-info">
              <h1 class="detail-title">${title}</h1>
              <div class="detail-meta">
                <span class="rating">⭐ ${item.vote_average.toFixed(1)}</span>
                <span class="year">${year}</span>
                <span class="runtime">${runtime} min</span>
                <span class="status">${item.status || 'Released'}</span>
              </div>
              <div class="genres">
                ${item.genres.map(genre => BaseComponent.createGenreTag(genre.name)).join('')}
              </div>
              <p class="overview">${item.overview}</p>
              <div class="detail-actions">
                ${item.videos && item.videos.results && item.videos.results.length > 0 ? BaseComponent.createButton('Play Trailer', 'primary', '▶') : ''}
                ${BaseComponent.createWatchlistButton(isInWatchlist, item.id, mediaType)}
              </div>
            </div>
          </div>
        </div>

        <div class="detail-tabs">
          <div class="container">
            <div class="tab-buttons">
              <button class="tab-btn active" data-tab="overview">Overview</button>
              <button class="tab-btn" data-tab="cast">Cast & Crew</button>
              <button class="tab-btn" data-tab="similar">Similar</button>
              <button class="tab-btn" data-tab="reviews">Reviews</button>
            </div>

            <div class="tab-content">
              <div class="tab-panel active" id="overview">
                ${this.renderOverviewTab()}
              </div>
              <div class="tab-panel" id="cast">
                ${this.renderCastTab()}
              </div>
              <div class="tab-panel" id="similar">
                ${this.renderSimilarTab()}
              </div>
              <div class="tab-panel" id="reviews">
                ${this.renderReviewsTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderOverviewTab() {
    const item = this.currentItem;
    return `
      <div class="overview-content">
        <h3>Storyline</h3>
        <p>${item.overview}</p>
        ${item.tagline ? `<blockquote class="tagline">"${item.tagline}"</blockquote>` : ''}
        
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Budget:</span>
            <span class="value">${item.budget ? '$' + item.budget.toLocaleString() : 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="label">Revenue:</span>
            <span class="value">${item.revenue ? '$' + item.revenue.toLocaleString() : 'N/A'}</span>
          </div>
          <div class="info-item">
            <span class="label">Languages:</span>
            <span class="value">${item.spoken_languages?.map(lang => lang.english_name).join(', ') || 'N/A'}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderCastTab() {
    const credits = this.currentItem.credits;
    if (!credits) return '<p>No cast information available.</p>';

    const cast = credits.cast.slice(0, 12);
    
    return `
      <div class="cast-content">
        <h3>Cast</h3>
        <div class="cast-grid">
          ${cast.map(person => `
            <div class="cast-card">
              <img src="${tmdbApi.getImageUrl(person.profile_path, 'w185')}" 
                   alt="${person.name}"
                   onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1MCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='">
              <div class="cast-info">
                <h4>${person.name}</h4>
                <p>${person.character}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderSimilarTab() {
    const similar = this.currentItem.similar;
    if (!similar || similar.results.length === 0) {
      return '<p>No similar titles found.</p>';
    }

    return `
      <div class="similar-content">
        <h3>Similar Titles</h3>
        <div class="movies-grid">
          ${similar.results.slice(0, 12).map(item => {
            const mediaType = item.title ? 'movie' : 'tv';
            item.media_type = mediaType;
            return this.createSimilarCard(item);
          }).join('')}
        </div>
      </div>
    `;
  }

  createSimilarCard(item) {
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const isInWatchlist = LocalStorageHelper.isInWatchlist(item.id, mediaType);
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
    
    return `
      <div class="movie-card animate-fade-in ${isInWatchlist ? 'in-wishlist' : ''}" data-id="${item.id}" data-type="${mediaType}">
        <div class="movie-poster">
          <img src="${tmdbApi.getImageUrl(item.poster_path)}" 
               alt="${title}"
               loading="lazy"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1zaXplPSIxNiI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
          <div class="movie-overlay">
            <button class="watchlist-btn ${isInWatchlist ? 'active' : ''}" 
                    data-id="${item.id}" 
                    data-type="${mediaType}"
                    onclick="event.stopPropagation()"
                    title="${isInWatchlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
              ${isInWatchlist ? '❤️' : '🤍'}
            </button>
            <div class="rating-display">
              <span class="rating-icon">⭐</span>
              <span class="rating-value">${item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${title}</h3>
          <p class="movie-year">${year}</p>
        </div>
      </div>
    `;
  }

  renderReviewsTab() {
    const reviews = this.currentItem.reviews;
    if (!reviews || reviews.results.length === 0) {
      return '<p>No reviews available.</p>';
    }

    return `
      <div class="reviews-content">
        <h3>User Reviews</h3>
        ${reviews.results.slice(0, 5).map(review => `
          <div class="review-card">
            <div class="review-header">
              <h4>${review.author}</h4>
              ${review.author_details.rating ? `<div class="review-rating">⭐ ${review.author_details.rating}/10</div>` : ''}
            </div>
            <p class="review-content">${review.content.length > 500 ? review.content.substring(0, 500) + '...' : review.content}</p>
            <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents() {
    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.goBack();
      });
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(targetTab).classList.add('active');
      });
    });

    // Wishlist button
    const watchlistBtn = document.querySelector('.btn-watchlist');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(watchlistBtn.dataset.id);
        const type = watchlistBtn.dataset.type;
        const isActive = watchlistBtn.classList.contains('active');

        if (isActive) {
          LocalStorageHelper.removeFromWatchlist(id, type);
          watchlistBtn.classList.remove('active');
          watchlistBtn.innerHTML = '<span class="btn-icon">🤍</span><span class="btn-text">Add to Watchlist</span>';
        } else {
          LocalStorageHelper.addToWatchlist({
            id,
            media_type: type,
            title: this.currentItem.title || this.currentItem.name,
            name: this.currentItem.name,
            poster_path: this.currentItem.poster_path,
            vote_average: this.currentItem.vote_average,
            release_date: this.currentItem.release_date,
            first_air_date: this.currentItem.first_air_date
          });
          watchlistBtn.classList.add('active');
          watchlistBtn.innerHTML = '<span class="btn-icon">❤️</span><span class="btn-text">In Wishlist</span>';
        }
      });
    }

    // Similar movies click and wishlist
    const similarCards = document.querySelectorAll('#similar .movie-card');
    similarCards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.watchlist-btn')) {
          const id = card.dataset.id;
          const type = card.dataset.type;
          window.location.hash = `#/detail/${type}/${id}`;
        }
      });
    });

    const similarWishlistBtns = document.querySelectorAll('#similar .watchlist-btn');
    similarWishlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSimilarWishlist(btn);
      });
    });
  }

  goBack() {
    const detailPage = document.getElementById('detailPage');
    if (detailPage) {
      detailPage.remove();
    }

    // Show home sections
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('trendingNow').style.display = 'block';
    document.getElementById('topMovies').style.display = 'block';
    document.getElementById('topTV').style.display = 'block';
    document.querySelector('.movies-section').style.display = 'block';

    window.location.hash = '#/';
  }

  toggleSimilarWishlist(btn) {
    const id = parseInt(btn.dataset.id);
    const type = btn.dataset.type;
    const isActive = btn.classList.contains('active');
    const movieCard = btn.closest('.movie-card');
    
    if (isActive) {
      LocalStorageHelper.removeFromWatchlist(id, type);
      btn.classList.remove('active');
      btn.innerHTML = '🤍';
      movieCard.classList.remove('in-wishlist');
    } else {
      const title = movieCard.querySelector('.movie-title').textContent;
      const yearElement = movieCard.querySelector('.movie-year');
      const year = yearElement ? yearElement.textContent : '';
      const ratingElement = movieCard.querySelector('.rating-value');
      const rating = ratingElement ? parseFloat(ratingElement.textContent) : 0;
      
      LocalStorageHelper.addToWatchlist({
        id,
        media_type: type,
        title,
        vote_average: rating,
        release_date: year,
        poster_path: movieCard.querySelector('img').src.split('/').pop()
      });
      
      btn.classList.add('active');
      btn.innerHTML = '❤️';
      movieCard.classList.add('in-wishlist');
    }
  }

  showError() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="error-page">
        <h2>Content Not Found</h2>
        <p>The requested content could not be found.</p>
        <button class="btn btn-primary" onclick="window.location.hash='#/'">Go Home</button>
      </div>
    `;
  }
}