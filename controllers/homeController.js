import { tmdbApi } from '../models/tmdbApi.js';
import { MovieCardView } from '../views/movieCardView.js';
import { GenreChipsView } from '../views/genreChipsView.js';
import { InfiniteScrollListView } from '../views/infiniteScrollListView.js';
import { FilterView } from '../views/filterView.js';
import { LocalStorageHelper } from '../utils/localStorageHelper.js';

export class HomeController {
  constructor() {
    this.currentPage = 1;
    this.currentGenres = [];
    this.currentMediaType = 'movie';
    this.currentFilters = {};
    this.genreChipsView = new GenreChipsView(this.handleGenreSelect.bind(this));
    this.filterView = new FilterView(this.handleFilterChange.bind(this));
    this.infiniteScrollView = null;
  }

  async init() {
    console.log('HomeController initializing...');
    try {
      await this.renderHeroSection();
      await this.renderFilters();
      await this.renderGenreChips();
      await this.renderTrendingSections();
      await this.loadInitialMovies();
      this.setupInfiniteScroll();
      console.log('HomeController initialized successfully');
    } catch (error) {
      console.error('Error initializing HomeController:', error);
    }
  }

  async renderFilters() {
    try {
      await this.filterView.init();
      const filtersContainer = document.getElementById('filtersContainer');
      if (filtersContainer) {
        filtersContainer.innerHTML = this.filterView.render();
        this.filterView.bindEvents();
      }
    } catch (error) {
      console.error('Error rendering filters:', error);
      // Hide filters section if it fails
      const filtersSection = document.getElementById('filtersSection');
      if (filtersSection) {
        filtersSection.style.display = 'none';
      }
    }
  }

  async handleFilterChange(filters) {
    this.currentFilters = filters;
    this.currentPage = 1;
    
    try {
      const response = await tmdbApi.discover(
        'movie',
        1,
        'en-US',
        this.currentGenres,
        filters.sort_by || 'popularity.desc'
      );
      
      const mainGrid = document.getElementById('mainGrid');
      if (mainGrid && response.results) {
        mainGrid.innerHTML = response.results.map(movie => MovieCardView.createCard(movie)).join('');
        this.bindMovieCardEvents();
        this.currentPage = 2;
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  async loadInitialMovies() {
    try {
      console.log('Loading initial movies...');
      const movies = await tmdbApi.getList('movie', 'popular', 1);
      console.log('Movies loaded:', movies);
      
      const mainGrid = document.getElementById('mainGrid');
      console.log('Main grid element:', mainGrid);
      
      if (mainGrid && movies.results) {
        mainGrid.innerHTML = movies.results.map(movie => MovieCardView.createCard(movie)).join('');
        this.bindMovieCardEvents();
        this.currentPage = 2;
        console.log('Movies rendered to grid');
      } else {
        console.error('Main grid not found or no movie results');
      }
    } catch (error) {
      console.error('Error loading initial movies:', error);
    }
  }

  bindMovieCardEvents() {
    const movieCards = document.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const type = card.dataset.type || 'movie';
        window.location.hash = `#/detail/${type}/${id}`;
      });
    });

    // Bind watchlist buttons
    const watchlistBtns = document.querySelectorAll('.watchlist-btn');
    watchlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleWatchlist(btn);
      });
    });
  }

  toggleWatchlist(btn) {
    const id = parseInt(btn.dataset.id);
    const type = btn.dataset.type;
    const isActive = btn.classList.contains('active');
    
    if (isActive) {
      LocalStorageHelper.removeFromWatchlist(id, type);
      btn.classList.remove('active');
      btn.innerHTML = '🤍';
    } else {
      // Get movie data for wishlist
      const movieCard = btn.closest('.movie-card');
      const title = movieCard.querySelector('.movie-title').textContent;
      const year = movieCard.querySelector('.movie-year').textContent;
      const rating = movieCard.querySelector('.rating span:last-child').textContent;
      
      LocalStorageHelper.addToWatchlist({
        id,
        media_type: type,
        title,
        vote_average: parseFloat(rating) || 0,
        release_date: year,
        poster_path: movieCard.querySelector('img').src.split('/').pop()
      });
      
      btn.classList.add('active');
      btn.innerHTML = '❤️';
    }
    
    // Update sidebar
    const app = document.querySelector('#app');
    if (app && app.sidebarView) {
      app.sidebarView.render();
    }
  }

  async renderHeroSection() {
    try {
      const trending = await tmdbApi.getTrending('movie', 'week', 1);
      const heroItem = trending.results[0];
      
      const heroSection = document.getElementById('heroSection');
      if (heroSection && heroItem) {
        heroSection.innerHTML = `
          <div class="hero-content" style="background-image: url('${tmdbApi.getImageUrl(heroItem.backdrop_path, 'w1280')}')">
            <div class="hero-bg-animation"></div>
            <div class="hero-info">
              <h1 class="hero-title">${heroItem.title || heroItem.name}</h1>
              <p class="hero-overview">${heroItem.overview}</p>
              <div class="hero-meta">
                <span class="hero-rating">⭐ ${heroItem.vote_average.toFixed(1)}</span>
                <span class="hero-year">${new Date(heroItem.release_date || heroItem.first_air_date).getFullYear()}</span>
              </div>
              <div class="hero-actions">
                <button class="btn btn-primary" onclick="window.location.hash='#/detail/movie/${heroItem.id}'">
                  View Details
                </button>
                <button class="btn btn-secondary watchlist-hero" data-id="${heroItem.id}" data-type="movie">
                  Add to Watchlist
                </button>
              </div>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error rendering hero section:', error);
    }
  }

  async renderGenreChips() {
    try {
      const genres = await tmdbApi.getGenres(this.currentMediaType);
      const genreContainer = document.getElementById('genreChips');
      
      if (genreContainer && genres.genres) {
        const containerDiv = genreContainer.querySelector('.container');
        if (containerDiv) {
          containerDiv.innerHTML = this.genreChipsView.render(genres.genres, this.currentMediaType);
        } else {
          genreContainer.innerHTML = `<div class="container">${this.genreChipsView.render(genres.genres, this.currentMediaType)}</div>`;
        }
        this.genreChipsView.bindEvents();
      }
    } catch (error) {
      console.error('Error rendering genre chips:', error);
    }
  }

  async renderTrendingSections() {
    try {
      // Trending Now
      const trending = await tmdbApi.getTrending('movie', 'week', 1);
      this.renderHorizontalSection('trendingNow', trending.results, 'Trending Now');

      // Top Rated Movies
      const topMovies = await tmdbApi.getList('movie', 'top_rated', 1);
      this.renderHorizontalSection('topMovies', topMovies.results, 'Top Rated Movies');

      // Top Rated TV Shows
      const topTV = await tmdbApi.getList('tv', 'top_rated', 1);
      this.renderHorizontalSection('topTV', topTV.results, 'Top Rated TV Shows');

    } catch (error) {
      console.error('Error rendering trending sections:', error);
    }
  }

  renderHorizontalSection(containerId, items, title) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const html = `
      <div class="container">
        <div class="section-header">
          <h2>${title}</h2>
          <button class="view-all-btn" data-section="${containerId}">View All</button>
        </div>
        <div class="horizontal-scroll">
          ${items.slice(0, 10).map(item => MovieCardView.createCard(item)).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;
    this.bindHorizontalScrollEvents(container);
  }

  bindHorizontalScrollEvents(container) {
    const cards = container.querySelectorAll('.movie-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const type = card.dataset.type || 'movie';
        window.location.hash = `#/detail/${type}/${id}`;
      });
    });

    const viewAllBtn = container.querySelector('.view-all-btn');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', () => {
        const section = viewAllBtn.dataset.section;
        window.location.hash = `#/list/${section}`;
      });
    }
  }

  setupInfiniteScroll() {
    const mainGrid = document.getElementById('mainGrid');
    if (mainGrid) {
      this.infiniteScrollView = new InfiniteScrollListView(
        mainGrid,
        this.loadMoreItems.bind(this)
      );
    }
  }

  async loadMoreItems() {
    try {
      let response;
      
      if (this.currentGenres.length > 0) {
        response = await tmdbApi.discover(
          this.currentMediaType,
          this.currentPage,
          'en-US',
          this.currentGenres
        );
      } else {
        response = await tmdbApi.getList(this.currentMediaType, 'popular', this.currentPage);
      }

      if (response.results.length > 0) {
        this.infiniteScrollView.render(response.results, true);
        this.currentPage++;
        return this.currentPage <= response.total_pages;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading more items:', error);
      return false;
    }
  }

  async handleGenreSelect(genreIds, mediaType, isMediaTypeChange = false) {
    this.currentGenres = genreIds;
    this.currentPage = 1;

    if (isMediaTypeChange) {
      this.currentMediaType = mediaType;
      await this.renderGenreChips();
    }

    // Load initial content for selected genres
    if (this.infiniteScrollView) {
      this.infiniteScrollView.reset();
      
      if (genreIds.length > 0) {
        try {
          const response = await tmdbApi.discover(
            mediaType,
            1,
            'en-US',
            genreIds
          );
          this.infiniteScrollView.render(response.results);
          this.currentPage = 2;
        } catch (error) {
          console.error('Error loading genre content:', error);
        }
      }
    }
  }
}