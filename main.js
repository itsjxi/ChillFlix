import './css/styles.css';
import './css/buttons.css';
import { tmdbApi } from './models/tmdbApi.js';
import { MovieCardView } from './views/movieCardView.js';
import { DetailView } from './views/detailView.js';
import { ThemeToggle } from './utils/themeToggle.js';
import { LocalStorageHelper } from './utils/localStorageHelper.js';
import { BaseComponent } from './components/BaseComponent.js';

class ChillFlixApp {
  constructor() {
    this.themeToggle = new ThemeToggle();
    this.detailView = new DetailView();
    this.sidebarOpen = false;
    this.currentGenres = [];
    this.tempGenres = [];
    this.currentView = 'home';
    this.init();
  }

  async init() {
    console.log('ChillFlix App starting...');
    
    this.initSearch();
    this.initSidebar();
    this.initFilters();
    this.initRouting();
    await this.loadHomePage();
    
    console.log('ChillFlix App loaded successfully');
  }

  initRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleRoute() {
    const hash = window.location.hash.slice(1);
    const [path, params] = hash.split('?');
    const pathParts = path.split('/').filter(part => part);

    switch (pathParts[0]) {
      case 'detail':
        if (pathParts[1] && pathParts[2]) {
          this.showDetailPage(pathParts[1], pathParts[2]);
        }
        break;
      case 'search':
        const urlParams = new URLSearchParams(params);
        const query = urlParams.get('q');
        if (query) {
          this.showSearchResults(query);
        }
        break;
      case 'list':
        if (pathParts[1]) {
          this.showListPage(pathParts[1]);
        }
        break;
      default:
        this.showHomePage();
    }
  }

  showHomePage() {
    this.currentView = 'home';
    const detailPage = document.getElementById('detailPage');
    if (detailPage) detailPage.remove();
    
    document.getElementById('heroSection').style.display = 'block';
    document.getElementById('trendingNow').style.display = 'block';
    document.getElementById('topMovies').style.display = 'block';
    document.getElementById('topTV').style.display = 'block';
    document.querySelector('.movies-section').style.display = 'block';
    
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
      sectionHeader.textContent = 'Popular Movies';
    }
    
    // Hide pagination info since we don't have pagination
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
      paginationInfo.style.display = 'none';
    }
  }

  showSearchResults(query) {
    this.currentView = 'search';
    const detailPage = document.getElementById('detailPage');
    if (detailPage) detailPage.remove();
    
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('trendingNow').style.display = 'none';
    document.getElementById('topMovies').style.display = 'none';
    document.getElementById('topTV').style.display = 'none';
    document.querySelector('.movies-section').style.display = 'block';
    
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
      sectionHeader.textContent = `Search Results for "${query}"`;
    }
  }

  showListPage(listType) {
    this.currentView = 'list';
    const detailPage = document.getElementById('detailPage');
    if (detailPage) detailPage.remove();
    
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('trendingNow').style.display = 'none';
    document.getElementById('topMovies').style.display = 'none';
    document.getElementById('topTV').style.display = 'none';
    document.querySelector('.movies-section').style.display = 'block';
    
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
      const titles = {
        'trendingNow': 'Trending Movies',
        'topMovies': 'Top Rated Movies',
        'topTV': 'Top Rated TV Shows'
      };
      sectionHeader.textContent = titles[listType] || 'Movies';
    }
    
    this.loadListContent(listType);
  }

  async loadListContent(listType) {
    try {
      let response;
      switch (listType) {
        case 'trendingNow':
          response = await tmdbApi.getTrending('movie', 'week', 1);
          break;
        case 'topMovies':
          response = await tmdbApi.getList('movie', 'top_rated', 1);
          break;
        case 'topTV':
          response = await tmdbApi.getList('tv', 'top_rated', 1);
          break;
        default:
          response = await tmdbApi.getList('movie', 'popular', 1);
      }
      
      const mainGrid = document.getElementById('mainGrid');
      if (mainGrid && response.results) {
        mainGrid.innerHTML = response.results.map(item => MovieCardView.createCard(item)).join('');
        this.bindMovieCardEvents();
      }
    } catch (error) {
      console.error('Error loading list content:', error);
    }
  }

  async showDetailPage(mediaType, id) {
    this.currentView = 'detail';
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('trendingNow').style.display = 'none';
    document.getElementById('topMovies').style.display = 'none';
    document.getElementById('topTV').style.display = 'none';
    document.querySelector('.movies-section').style.display = 'none';
    await this.detailView.render(mediaType, id);
  }

  initSearch() {
    // Desktop search
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
      searchContainer.innerHTML = `
        <div class="search-bar">
          <input type="text" id="searchInput" placeholder="Search movies, TV shows..." autocomplete="off">
          <button class="search-btn">🔍</button>
        </div>
        <div class="search-suggestions" id="searchSuggestions"></div>
      `;

      const searchInput = document.getElementById('searchInput');
      const searchBtn = document.querySelector('.search-btn');
      searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performSearch();
        }
      });
      searchBtn.addEventListener('click', () => this.performSearch());
    }

    // Mobile search
    const mobileSearchContainer = document.getElementById('mobileSearchContainer');
    if (mobileSearchContainer) {
      mobileSearchContainer.innerHTML = `
        <div class="search-bar">
          <input type="text" id="mobileSearchInput" placeholder="Search movies, TV shows..." autocomplete="off">
          <button class="search-btn">🔍</button>
        </div>
        <div class="search-suggestions" id="mobileSearchSuggestions"></div>
      `;

      const mobileSearchInput = document.getElementById('mobileSearchInput');
      const mobileSearchBtn = mobileSearchContainer.querySelector('.search-btn');
      mobileSearchInput.addEventListener('input', this.debounce(this.handleMobileSearch.bind(this), 300));
      mobileSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.performMobileSearch();
        }
      });
      mobileSearchBtn.addEventListener('click', () => this.performMobileSearch());
    }

    // Mobile theme toggle
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    if (mobileThemeToggle) {
      mobileThemeToggle.addEventListener('click', () => {
        this.themeToggle.toggle();
      });
    }


  }

  initSidebar() {
    const wishlistTab = document.getElementById('wishlistTab');
    const sidebarClose = document.getElementById('sidebarClose');
    const clearWishlist = document.getElementById('clearWishlist');

    wishlistTab.addEventListener('click', () => this.toggleSidebar());
    sidebarClose.addEventListener('click', () => this.closeSidebar());
    clearWishlist.addEventListener('click', () => this.clearWishlist());
  }

  async initFilters() {
    try {
      const genres = await tmdbApi.getGenres('movie');
      const genreGrid = document.getElementById('genreGrid');
      const genreBtn = document.getElementById('genreBtn');
      const genrePopup = document.getElementById('genrePopup');
      const genreApply = document.getElementById('genreApply');
      const genreCancel = document.getElementById('genreCancel');
      const genreReset = document.getElementById('genreReset');
      
      if (genreGrid && genres.genres) {
        genreGrid.innerHTML = genres.genres.map(genre => `
          <div class="genre-item" data-id="${genre.id}">${genre.name}</div>
        `).join('');

        genreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          genrePopup.classList.toggle('show');
          this.tempGenres = [...this.currentGenres];
          this.updateGenreSelection();
        });

        genreGrid.addEventListener('click', (e) => {
          if (e.target.classList.contains('genre-item')) {
            const genreId = e.target.dataset.id;
            
            if (this.tempGenres.includes(genreId)) {
              this.tempGenres = this.tempGenres.filter(id => id !== genreId);
              e.target.classList.remove('active');
            } else {
              this.tempGenres.push(genreId);
              e.target.classList.add('active');
            }
          }
        });

        genreApply.addEventListener('click', async () => {
          // Show loading state immediately
          this.showLoadingState('Applying filters...');
          
          this.currentGenres = [...this.tempGenres];
          this.updateGenreButton();
          genrePopup.classList.remove('show');
          
          // Force screen change by hiding other sections
          this.hideHomeSections();
          
          // Apply filters with delay to show loading
          setTimeout(async () => {
            await this.applyFilters();
            this.updateSectionHeader();
            this.showFilteredView();
          }, 500);
        });

        genreCancel.addEventListener('click', () => {
          this.tempGenres = [...this.currentGenres];
          this.updateGenreSelection();
          genrePopup.classList.remove('show');
        });

        genreReset.addEventListener('click', () => {
          this.tempGenres = [];
          this.currentGenres = [];
          this.updateGenreSelection();
          this.updateGenreButton();
          genrePopup.classList.remove('show');
          
          // Show loading and reset to popular movies
          this.showLoadingState('Resetting filters...');
          setTimeout(async () => {
            await this.applyFilters();
            this.updateSectionHeader();
            this.showHomePage();
          }, 500);
        });

        document.addEventListener('click', (e) => {
          if (!e.target.closest('.genre-dropdown')) {
            genrePopup.classList.remove('show');
          }
        });
      }
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  }

  updateGenreSelection() {
    const genreItems = document.querySelectorAll('.genre-item');
    genreItems.forEach(item => {
      if (this.tempGenres.includes(item.dataset.id)) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  updateGenreButton() {
    const genreBtn = document.getElementById('genreBtn');
    if (this.currentGenres.length > 0) {
      genreBtn.textContent = `${this.currentGenres.length} Genre(s) ▼`;
    } else {
      genreBtn.textContent = 'Genres ▼';
    }
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const wishlistTab = document.getElementById('wishlistTab');
    const mainContent = document.querySelector('.main-content');

    this.sidebarOpen = !this.sidebarOpen;
    
    if (this.sidebarOpen) {
      sidebar.classList.add('open');
      wishlistTab.classList.add('open');
      mainContent.classList.add('sidebar-open');
      this.renderWishlist();
    } else {
      sidebar.classList.remove('open');
      wishlistTab.classList.remove('open');
      mainContent.classList.remove('sidebar-open');
    }
  }

  closeSidebar() {
    this.sidebarOpen = false;
    const sidebar = document.getElementById('sidebar');
    const wishlistTab = document.getElementById('wishlistTab');
    const mainContent = document.querySelector('.main-content');

    sidebar.classList.remove('open');
    wishlistTab.classList.remove('open');
    mainContent.classList.remove('sidebar-open');
  }

  clearWishlist() {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.removeItem('watchlist');
      this.renderWishlist();
      
      document.querySelectorAll('.watchlist-btn.active').forEach(btn => {
        btn.classList.remove('active');
        btn.innerHTML = '🤍';
      });
    }
  }

  renderWishlist() {
    const container = document.getElementById('wishlistContainer');
    const clearBtn = document.getElementById('clearWishlist');
    if (!container) return;
    
    const wishlist = LocalStorageHelper.getWatchlist();
    
    if (wishlist.length === 0) {
      container.innerHTML = `
        <div class="empty-wishlist">
          <div class="empty-wishlist-icon">🎬</div>
          <p>No movies in your wishlist yet</p>
          <p class="empty-wishlist-subtitle">Add movies to see them here</p>
        </div>
      `;
      if (clearBtn) clearBtn.style.display = 'none';
      return;
    }
    
    if (clearBtn) clearBtn.style.display = 'block';

    container.innerHTML = wishlist.map(item => {
      const title = item.title || item.name;
      const year = item.release_date || item.first_air_date;
      const yearText = year ? new Date(year).getFullYear() : '';

      return `
        <div class="wishlist-item" data-id="${item.id}" data-type="${item.media_type}">
          <div class="wishlist-poster">
            <img src="${tmdbApi.getImageUrl(item.poster_path, 'w185')}" 
                 alt="${title}"
                 onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iOTAiIHZpZXdCb3g9IjAgMCA2MCA5MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjkwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjMwIiB5PSI0NSIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtc2l6ZT0iOCI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='">
          </div>
          <div class="wishlist-info">
            <h4 class="wishlist-title">${title}</h4>
            <p class="wishlist-year">${yearText}</p>
            <div class="wishlist-rating">
              <span class="star">⭐</span>
              <span>${item.vote_average?.toFixed(1) || 'N/A'}</span>
            </div>
          </div>
          <button class="wishlist-remove" data-id="${item.id}" data-type="${item.media_type}">✕</button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.wishlist-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.classList.contains('wishlist-remove')) {
          const id = item.dataset.id;
          const type = item.dataset.type;
          window.location.hash = `#/detail/${type}/${id}`;
        }
      });
    });

    container.querySelectorAll('.wishlist-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        
        LocalStorageHelper.removeFromWatchlist(id, type);
        this.renderWishlist();
        
        const movieCard = document.querySelector(`[data-id="${id}"][data-type="${type}"] .watchlist-btn`);
        if (movieCard) {
          movieCard.classList.remove('active');
          movieCard.innerHTML = '🤍';
        }
      });
    });
  }

  async handleSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
      try {
        const mediaType = 'multi';
        const results = await tmdbApi.search(query, mediaType, 1);
        this.showSearchSuggestions(results.results.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
      }
    } else {
      this.hideSearchSuggestions();
    }
  }

  showSearchSuggestions(suggestions) {
    const container = document.getElementById('searchSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = suggestions.map(item => {
      const title = item.title || item.name;
      const year = item.release_date || item.first_air_date;
      const yearText = year ? ` (${new Date(year).getFullYear()})` : '';
      
      return `
        <div class="suggestion-item" data-id="${item.id}" data-type="${item.media_type}">
          <img src="${tmdbApi.getImageUrl(item.poster_path, 'w92')}" alt="${title}">
          <div class="suggestion-info">
            <span class="suggestion-title">${title}${yearText}</span>
            <span class="suggestion-type">${item.media_type === 'tv' ? 'TV' : 'Movie'}</span>
          </div>
        </div>
      `;
    }).join('');

    container.style.display = 'block';

    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const type = item.dataset.type;
        window.location.hash = `#/detail/${type}/${id}`;
        this.hideSearchSuggestions();
      });
    });
  }

  hideSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (container) {
      container.style.display = 'none';
    }
  }

  async performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput?.value.trim();
    
    if (query) {
      const mediaType = 'multi';
      
      try {
        const results = await tmdbApi.search(query, mediaType, 1);
        
        window.location.hash = `#/search?q=${encodeURIComponent(query)}`;
        this.displaySearchResults(results.results, query);
        this.hideSearchSuggestions();
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  }

  async handleMobileSearch(e) {
    const query = e.target.value.trim();
    if (query.length > 2) {
      try {
        const mediaType = 'multi';
        const results = await tmdbApi.search(query, mediaType, 1);
        this.showMobileSearchSuggestions(results.results.slice(0, 5));
      } catch (error) {
        console.error('Mobile search error:', error);
      }
    } else {
      this.hideMobileSearchSuggestions();
    }
  }

  async performMobileSearch() {
    const mobileSearchInput = document.getElementById('mobileSearchInput');
    const query = mobileSearchInput?.value.trim();
    
    if (query) {
      const mediaType = 'multi';
      
      try {
        const results = await tmdbApi.search(query, mediaType, 1);
        
        window.location.hash = `#/search?q=${encodeURIComponent(query)}`;
        this.displaySearchResults(results.results, query);
        this.hideMobileSearchSuggestions();
      } catch (error) {
        console.error('Mobile search error:', error);
      }
    }
  }

  showMobileSearchSuggestions(suggestions) {
    const container = document.getElementById('mobileSearchSuggestions');
    if (!container) return;

    if (suggestions.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = suggestions.map(item => {
      const title = item.title || item.name;
      const year = item.release_date || item.first_air_date;
      const yearText = year ? ` (${new Date(year).getFullYear()})` : '';
      
      return `
        <div class="suggestion-item" data-id="${item.id}" data-type="${item.media_type}">
          <img src="${tmdbApi.getImageUrl(item.poster_path, 'w92')}" alt="${title}">
          <div class="suggestion-info">
            <span class="suggestion-title">${title}${yearText}</span>
            <span class="suggestion-type">${item.media_type === 'tv' ? 'TV' : 'Movie'}</span>
          </div>
        </div>
      `;
    }).join('');

    container.style.display = 'block';

    container.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const type = item.dataset.type;
        window.location.hash = `#/detail/${type}/${id}`;
        this.hideMobileSearchSuggestions();
      });
    });
  }

  hideMobileSearchSuggestions() {
    const container = document.getElementById('mobileSearchSuggestions');
    if (container) {
      container.style.display = 'none';
    }
  }

  displaySearchResults(results, query) {
    const mainGrid = document.getElementById('mainGrid');
    
    if (mainGrid) {
      mainGrid.innerHTML = results.map(item => MovieCardView.createCard(item)).join('');
      this.bindMovieCardEvents();
    }
  }

  updateSectionHeader() {
    const sectionHeader = document.querySelector('.section-header h2');
    if (sectionHeader) {
      if (this.currentGenres.length > 0) {
        sectionHeader.textContent = 'Filtered Movies';
      } else {
        sectionHeader.textContent = 'Popular Movies';
      }
    }
  }

  async applyFilters() {
    if (this.currentView !== 'home') return;
    
    try {
      let response;
      if (this.currentGenres.length > 0) {
        response = await tmdbApi.discover(
          'movie',
          1,
          'en',
          this.currentGenres
        );
      } else {
        response = await tmdbApi.getList('movie', 'popular', 1);
      }
      
      const mainGrid = document.getElementById('mainGrid');
      if (mainGrid && response.results) {
        mainGrid.innerHTML = response.results.map(movie => MovieCardView.createCard(movie)).join('');
        this.bindMovieCardEvents();
      }
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  async loadHomePage() {
    try {
      await this.loadHeroSection();
      await this.loadMoviesGrid();
      await this.loadTrendingSections();
    } catch (error) {
      console.error('Error loading home page:', error);
    }
  }

  async loadHeroSection() {
    try {
      const latestMovies = await tmdbApi.getList('movie', 'now_playing', 1);
      const heroMovies = latestMovies.results.slice(0, 5);
      
      const heroSection = document.getElementById('heroSection');
      if (heroSection && heroMovies.length > 0) {
        let currentSlide = 0;
        
        const renderSlide = (index) => {
          const movie = heroMovies[index];
          return `
            <div class="hero-content" style="background-image: url('${tmdbApi.getImageUrl(movie.backdrop_path, 'w1280')}')">
              <div class="hero-info">
                <h1 class="hero-title">${movie.title}</h1>
                <p class="hero-overview">${movie.overview.substring(0, 200)}...</p>
                <div class="hero-meta">
                  <span class="hero-rating">⭐ ${movie.vote_average.toFixed(1)}</span>
                  <span class="hero-year">${new Date(movie.release_date).getFullYear()}</span>
                </div>
                <div class="hero-actions">
                  <button class="btn btn-secondary watchlist-hero" data-id="${movie.id}" data-type="movie">
                    🤍 Add to Watchlist
                  </button>
                </div>
              </div>
              <div class="hero-nav">
                ${heroMovies.map((_, i) => `<div class="hero-dot ${i === index ? 'active' : ''}" data-slide="${i}"></div>`).join('')}
              </div>
            </div>
          `;
        };
        
        heroSection.innerHTML = renderSlide(0);
        this.bindCarouselEvents();
        
        // Auto-rotate every 5 seconds
        setInterval(() => {
          currentSlide = (currentSlide + 1) % heroMovies.length;
          heroSection.innerHTML = renderSlide(currentSlide);
          this.bindCarouselEvents();
        }, 5000);
      }
    } catch (error) {
      console.error('Error loading hero section:', error);
    }
  }

  async loadMoviesGrid() {
    try {
      const movies = await tmdbApi.getList('movie', 'popular', 1);
      const mainGrid = document.getElementById('mainGrid');
      
      if (mainGrid && movies.results) {
        mainGrid.innerHTML = movies.results.map(movie => MovieCardView.createCard(movie)).join('');
        this.bindMovieCardEvents();
      }
    } catch (error) {
      console.error('Error loading movies grid:', error);
    }
  }

  async loadTrendingSections() {
    try {
      const trending = await tmdbApi.getTrending('movie', 'week', 1);
      this.renderHorizontalSection('trendingNow', trending.results, 'Trending Now');

      const topMovies = await tmdbApi.getList('movie', 'top_rated', 1);
      this.renderHorizontalSection('topMovies', topMovies.results, 'Top Rated Movies');

      const topTV = await tmdbApi.getList('tv', 'top_rated', 1);
      this.renderHorizontalSection('topTV', topTV.results, 'Top Rated TV Shows');
    } catch (error) {
      console.error('Error loading trending sections:', error);
    }
  }

  renderHorizontalSection(containerId, items, title) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
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

    this.bindHorizontalScrollEvents(container);
  }

  bindMovieCardEvents() {
    // Use event delegation for better performance and dynamic content
    document.addEventListener('click', (e) => {
      const movieCard = e.target.closest('.movie-card');
      const wishlistBtn = e.target.closest('.watchlist-btn');
      
      if (wishlistBtn) {
        e.stopPropagation();
        this.toggleWatchlist(wishlistBtn);
      } else if (movieCard && !wishlistBtn) {
        const id = movieCard.dataset.id;
        const type = movieCard.dataset.type;
        if (id && type) {
          window.location.hash = `#/detail/${type}/${id}`;
        }
      }
    });
  }

  bindHorizontalScrollEvents(container) {
    const cards = container.querySelectorAll('.movie-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.watchlist-btn')) {
          const id = card.dataset.id;
          const type = card.dataset.type;
          window.location.hash = `#/detail/${type}/${id}`;
        }
      });
    });

    const watchlistBtns = container.querySelectorAll('.watchlist-btn');
    watchlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleWatchlist(btn);
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

  toggleWatchlist(btn) {
    try {
      const id = parseInt(btn.dataset.id);
      const type = btn.dataset.type;
      
      if (!id || !type) {
        console.error('Invalid wishlist button data:', { id, type });
        return;
      }
      
      const isActive = btn.classList.contains('active');
      
      if (isActive) {
        LocalStorageHelper.removeFromWatchlist(id, type);
        this.updateButtonState(btn, false);
      } else {
        const movieData = this.extractMovieData(btn, id, type);
        LocalStorageHelper.addToWatchlist(movieData);
        this.updateButtonState(btn, true);
      }
      
      // Update all buttons with same movie ID
      this.updateAllWishlistButtons(id, type, !isActive);
      
      // Update wishlist sidebar if open
      if (this.sidebarOpen) {
        this.renderWishlist();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  }
  
  extractMovieData(btn, id, type) {
    const movieData = { id, media_type: type };
    const movieCard = btn.closest('.movie-card');
    
    if (movieCard) {
      const titleElement = movieCard.querySelector('.movie-title');
      const yearElement = movieCard.querySelector('.movie-year');
      const imgElement = movieCard.querySelector('img');
      const ratingElement = movieCard.querySelector('.rating span:last-child, .rating-display span:last-child');
      
      movieData.title = titleElement?.textContent?.trim() || 'Unknown';
      movieData.name = movieData.title;
      movieData.release_date = yearElement?.textContent?.trim() || '';
      movieData.first_air_date = movieData.release_date;
      movieData.vote_average = ratingElement ? parseFloat(ratingElement.textContent) || 0 : 0;
      
      if (imgElement?.src && !imgElement.src.includes('data:image')) {
        const srcParts = imgElement.src.split('/');
        movieData.poster_path = srcParts[srcParts.length - 1];
      }
    } else {
      const heroContent = btn.closest('.hero-content');
      if (heroContent) {
        const titleElement = heroContent.querySelector('.hero-title');
        const yearElement = heroContent.querySelector('.hero-year');
        const ratingElement = heroContent.querySelector('.hero-rating');
        
        movieData.title = titleElement?.textContent?.trim() || 'Unknown';
        movieData.release_date = yearElement?.textContent?.trim() || new Date().getFullYear().toString();
        movieData.vote_average = ratingElement ? parseFloat(ratingElement.textContent.replace('⭐', '').trim()) || 0 : 0;
      }
    }
    
    return movieData;
  }
  
  updateButtonState(btn, isActive) {
    const isHeroBtn = btn.classList.contains('watchlist-hero');
    
    if (isActive) {
      btn.classList.add('active');
      btn.innerHTML = isHeroBtn ? '❤️ In Watchlist' : '❤️';
      btn.title = 'Remove from Wishlist';
    } else {
      btn.classList.remove('active');
      btn.innerHTML = isHeroBtn ? '🤍 Add to Watchlist' : '🤍';
      btn.title = 'Add to Wishlist';
    }
  }
  
  updateAllWishlistButtons(id, type, isActive) {
    const allButtons = document.querySelectorAll(`[data-id="${id}"][data-type="${type}"].watchlist-btn`);
    allButtons.forEach(button => {
      if (isActive) {
        button.classList.add('active');
        button.innerHTML = button.classList.contains('watchlist-hero') ? '❤️ In Watchlist' : '❤️';
        button.title = 'Remove from Wishlist';
      } else {
        button.classList.remove('active');
        button.innerHTML = button.classList.contains('watchlist-hero') ? '🤍 Add to Watchlist' : '🤍';
        button.title = 'Add to Wishlist';
      }
    });
  }

  initCarousel() {
    let currentSlide = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dot');
    const prevBtn = document.querySelector('.carousel-arrow.prev');
    const nextBtn = document.querySelector('.carousel-arrow.next');
    
    const showSlide = (index) => {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    };
    
    const nextSlide = () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    };
    
    const prevSlide = () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    };
    
    nextBtn?.addEventListener('click', nextSlide);
    prevBtn?.addEventListener('click', prevSlide);
    
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
    
    // Auto-play
    setInterval(nextSlide, 5000);
  }

  bindCarouselEvents() {
    const wishlistBtns = document.querySelectorAll('.watchlist-hero');
    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleWatchlist(btn);
      });
    });
  }

  showLoadingState(message = 'Loading...') {
    const mainGrid = document.getElementById('mainGrid');
    if (mainGrid) {
      mainGrid.innerHTML = `
        <div class="loading-indicator" style="text-align: center; padding: 60px 20px;">
          <div class="loading-spinner" style="margin: 0 auto 20px; width: 40px; height: 40px; border: 4px solid #333; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="color: #666; font-size: 16px;">${message}</p>
        </div>
      `;
    }
  }

  hideHomeSections() {
    document.getElementById('heroSection').style.display = 'none';
    document.getElementById('trendingNow').style.display = 'none';
    document.getElementById('topMovies').style.display = 'none';
    document.getElementById('topTV').style.display = 'none';
  }

  showFilteredView() {
    document.querySelector('.movies-section').style.display = 'block';
    // Hide pagination info since we don't have pagination
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
      paginationInfo.style.display = 'none';
    }
  }

  debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ChillFlixApp();
});