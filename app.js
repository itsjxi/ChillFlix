import { HomeController } from './controllers/homeController.js';
import { SearchController } from './controllers/searchController.js';
import { DetailController } from './controllers/detailController.js';
import { ThemeToggle } from './utils/themeToggle.js';
import { SidebarView } from './views/sidebarView.js';

class App {
  constructor() {
    this.homeController = new HomeController();
    this.searchController = new SearchController();
    this.detailController = new DetailController();
    this.themeToggle = new ThemeToggle();
    this.sidebarView = new SidebarView();
    this.currentController = null;
    
    this.init();
  }

  init() {
    this.setupRouting();
    this.handleInitialRoute();
    this.bindGlobalEvents();
  }

  setupRouting() {
    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });
  }

  handleInitialRoute() {
    if (!window.location.hash) {
      window.location.hash = '#/';
    } else {
      this.handleRoute();
    }
  }

  async handleRoute() {
    const hash = window.location.hash.slice(1); // Remove #
    const [path, params] = hash.split('?');
    const pathParts = path.split('/').filter(part => part);

    // Hide all sections first
    this.hideAllSections();

    try {
      switch (pathParts[0]) {
        case '':
        case 'home':
          await this.loadHome();
          break;
          
        case 'search':
          await this.loadSearch(params);
          break;
          
        case 'detail':
          if (pathParts[1] && pathParts[2]) {
            await this.loadDetail(pathParts[1], pathParts[2]);
          } else {
            this.redirectToHome();
          }
          break;
          
        case 'movies':
          await this.loadMovies();
          break;
          
        case 'tv':
          await this.loadTV();
          break;
          
        case 'watchlist':
          await this.loadWatchlist();
          break;
          
        default:
          this.redirectToHome();
      }
    } catch (error) {
      console.error('Routing error:', error);
      this.showError('Something went wrong. Please try again.');
    }
  }

  async loadHome() {
    this.showHomeSections();
    this.searchController.init();
    await this.homeController.init();
    this.sidebarView.render();
    this.currentController = this.homeController;
  }

  async loadSearch(params) {
    const urlParams = new URLSearchParams(params);
    const query = urlParams.get('q');
    const mediaType = urlParams.get('type') || 'multi';
    
    if (query) {
      this.searchController.init();
      await this.searchController.searchFromURL(query, mediaType);
      this.currentController = this.searchController;
    } else {
      this.redirectToHome();
    }
  }

  async loadDetail(mediaType, id) {
    await this.detailController.init(mediaType, parseInt(id));
    this.currentController = this.detailController;
  }

  async loadMovies() {
    // Similar to home but filtered for movies
    this.showHomeSections();
    this.searchController.init();
    // Could implement a movies-specific controller here
    this.currentController = this.homeController;
  }

  async loadTV() {
    // Similar to home but filtered for TV shows
    this.showHomeSections();
    this.searchController.init();
    // Could implement a TV-specific controller here
    this.currentController = this.homeController;
  }

  async loadWatchlist() {
    // Implement watchlist view
    this.showWatchlistSection();
    this.renderWatchlist();
  }

  hideAllSections() {
    const sections = [
      'heroSection', 'filtersSection', 'genreChips', 'trendingNow', 'topMovies', 'topTV', 
      'searchSection', 'detailSection'
    ];
    
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'none';
      }
    });
    
    const mainContent = document.querySelector('.movies-section');
    if (mainContent) {
      mainContent.style.display = 'none';
    }
  }

  showHomeSections() {
    const sections = [
      'heroSection', 'filtersSection', 'genreChips', 'trendingNow', 'topMovies', 'topTV'
    ];
    
    sections.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'block';
      }
    });
    
    const mainContent = document.querySelector('.movies-section');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
  }

  showWatchlistSection() {
    // Implementation for watchlist section
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.style.display = 'block';
    }
  }

  renderWatchlist() {
    // Implementation for rendering watchlist
    const mainGrid = document.getElementById('mainGrid');
    if (mainGrid) {
      mainGrid.innerHTML = `
        <div class="watchlist-header">
          <h2>My Watchlist</h2>
          <p>Your saved movies and TV shows</p>
        </div>
        <div class="watchlist-grid">
          <!-- Watchlist items will be rendered here -->
        </div>
      `;
    }
  }

  redirectToHome() {
    window.location.hash = '#/';
  }

  showError(message) {
    const app = document.getElementById('app');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <h3>Error</h3>
      <p>${message}</p>
      <button class="btn-primary" onclick="window.location.hash='#/'">Go Home</button>
    `;
    app.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  bindGlobalEvents() {
    // Global error handling
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      // ESC key to go back or close modals
      if (event.key === 'Escape') {
        if (window.location.hash !== '#/') {
          window.history.back();
        }
      }
      
      // Ctrl/Cmd + K for search focus
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
          searchInput.focus();
        }
      }
    });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new App();
});