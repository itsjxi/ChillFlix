import { tmdbApi } from '../models/tmdbApi.js';
import { LocalStorageHelper } from '../utils/localStorageHelper.js';
import { MovieCardView } from '../views/movieCardView.js';

export class DetailController {
  constructor() {
    this.currentItem = null;
  }

  async init(mediaType, id) {
    try {
      this.currentItem = await tmdbApi.getDetails(mediaType, id);
      this.renderDetailPage();
      this.bindEvents();
    } catch (error) {
      console.error('Error loading details:', error);
      this.renderError();
    }
  }

  renderDetailPage() {
    const detailContainer = document.getElementById('detailContainer');
    if (!detailContainer || !this.currentItem) return;

    const item = this.currentItem;
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : '';
    const runtime = item.runtime || (item.episode_run_time && item.episode_run_time[0]) || 'N/A';
    const isInWatchlist = LocalStorageHelper.isInWatchlist(item.id, item.media_type || 'movie');

    detailContainer.innerHTML = `
      <div class="detail-hero" style="background-image: url('${tmdbApi.getImageUrl(item.backdrop_path, 'w1280')}')">
        <div class="hero-bg-animation"></div>
        <div class="detail-content">
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
              ${item.genres.map(genre => `<span class="genre-tag">${genre.name}</span>`).join('')}
            </div>
            <p class="overview">${item.overview}</p>
            <div class="detail-actions">
              <button class="btn btn-primary play-btn">▶ Play Trailer</button>
              <button class="btn btn-secondary watchlist-btn ${isInWatchlist ? 'active' : ''}" 
                      data-id="${item.id}" 
                      data-type="${item.media_type || 'movie'}">
                ${isInWatchlist ? '❤️ In Watchlist' : '🤍 Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-tabs">
        <div class="container">
          <div class="tab-buttons">
            <button class="tab-btn active" data-tab="overview"><span>Overview</span></button>
            <button class="tab-btn" data-tab="cast"><span>Cast & Crew</span></button>
            <button class="tab-btn" data-tab="similar"><span>Similar</span></button>
            <button class="tab-btn" data-tab="reviews"><span>Reviews</span></button>
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
    `;

    // Show detail section, hide others
    this.showDetailSection();
  }

  renderOverviewTab() {
    const item = this.currentItem;
    const productionCompanies = item.production_companies || [];
    const spokenLanguages = item.spoken_languages || [];

    return `
      <div class="overview-content">
        <div class="overview-grid">
          <div class="overview-main">
            <h3>Storyline</h3>
            <p>${item.overview}</p>
            
            ${item.tagline ? `<blockquote class="tagline">"${item.tagline}"</blockquote>` : ''}
          </div>
          
          <div class="overview-sidebar">
            <div class="info-group">
              <h4>Details</h4>
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
                <span class="value">${spokenLanguages.map(lang => lang.english_name).join(', ') || 'N/A'}</span>
              </div>
            </div>

            ${productionCompanies.length > 0 ? `
              <div class="info-group">
                <h4>Production</h4>
                ${productionCompanies.slice(0, 3).map(company => `
                  <div class="production-company">
                    ${company.logo_path ? `<img src="${tmdbApi.getImageUrl(company.logo_path, 'w92')}" alt="${company.name}">` : ''}
                    <span>${company.name}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  renderCastTab() {
    const credits = this.currentItem.credits;
    if (!credits) return '<p>No cast information available.</p>';

    const cast = credits.cast.slice(0, 12);
    const crew = credits.crew.filter(person => 
      ['Director', 'Producer', 'Writer', 'Screenplay'].includes(person.job)
    ).slice(0, 8);

    return `
      <div class="cast-content">
        <div class="cast-section">
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

        ${crew.length > 0 ? `
          <div class="crew-section">
            <h3>Crew</h3>
            <div class="crew-grid">
              ${crew.map(person => `
                <div class="crew-item">
                  <h4>${person.name}</h4>
                  <p>${person.job}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
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
        <div class="similar-grid">
          ${similar.results.slice(0, 12).map(item => MovieCardView.createCard(item)).join('')}
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
              <div class="review-rating">
                ${review.author_details.rating ? `⭐ ${review.author_details.rating}/10` : ''}
              </div>
            </div>
            <p class="review-content">${review.content.length > 500 ? review.content.substring(0, 500) + '...' : review.content}</p>
            <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  bindEvents() {
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

    // Watchlist button
    const watchlistBtn = document.querySelector('.watchlist-btn');
    if (watchlistBtn) {
      watchlistBtn.addEventListener('click', () => {
        const id = parseInt(watchlistBtn.dataset.id);
        const type = watchlistBtn.dataset.type;
        const isActive = watchlistBtn.classList.contains('active');

        if (isActive) {
          LocalStorageHelper.removeFromWatchlist(id, type);
          watchlistBtn.classList.remove('active');
          watchlistBtn.innerHTML = '🤍 Add to Watchlist';
        } else {
          LocalStorageHelper.addToWatchlist({
            id,
            media_type: type,
            title: this.currentItem.title || this.currentItem.name,
            poster_path: this.currentItem.poster_path,
            vote_average: this.currentItem.vote_average
          });
          watchlistBtn.classList.add('active');
          watchlistBtn.innerHTML = '❤️ In Watchlist';
        }
      });
    }

    // Similar movies click events
    const similarCards = document.querySelectorAll('.similar-grid .movie-card');
    similarCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        window.location.hash = `#/detail/${type}/${id}`;
      });
    });
  }

  showDetailSection() {
    const detailSection = document.getElementById('detailSection');
    if (detailSection) {
      detailSection.style.display = 'block';
    }

    // Hide other sections
    const sectionsToHide = ['heroSection', 'trendingNow', 'topMovies', 'topTV', 'genreChips', 'mainGrid', 'searchSection'];
    sectionsToHide.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'none';
      }
    });
  }

  renderError() {
    const detailContainer = document.getElementById('detailContainer');
    if (detailContainer) {
      detailContainer.innerHTML = `
        <div class="error-message">
          <h2>Content Not Found</h2>
          <p>The requested content could not be found.</p>
          <button class="btn-primary" onclick="window.location.hash='#/'">Go Home</button>
        </div>
      `;
    }
  }
}