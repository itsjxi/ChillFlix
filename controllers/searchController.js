import { tmdbApi } from '../models/tmdbApi.js';
import { SearchBarView } from '../views/searchBarView.js';
import { InfiniteScrollListView } from '../views/infiniteScrollListView.js';
import { debounce } from '../utils/debounce.js';

export class SearchController {
  constructor() {
    this.currentQuery = '';
    this.currentMediaType = 'multi';
    this.currentPage = 1;
    this.searchBarView = new SearchBarView(
      this.handleSearch.bind(this),
      this.handleSuggestionClick.bind(this)
    );
    this.infiniteScrollView = null;
    this.debouncedSuggestionSearch = debounce(this.performSuggestionSearch.bind(this), 300);
  }

  init() {
    this.renderSearchBar();
    this.setupInfiniteScroll();
  }

  renderSearchBar() {
    const searchContainer = document.getElementById('searchContainer');
    if (searchContainer) {
      searchContainer.innerHTML = this.searchBarView.render();
      this.searchBarView.bindEvents();
    }
  }

  setupInfiniteScroll() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      this.infiniteScrollView = new InfiniteScrollListView(
        searchResults,
        this.loadMoreSearchResults.bind(this)
      );
    }
  }

  async handleSearch(query, mediaType, isSuggestion = false) {
    this.currentQuery = query;
    this.currentMediaType = mediaType;

    if (isSuggestion) {
      this.debouncedSuggestionSearch(query, mediaType);
    } else {
      await this.performFullSearch(query, mediaType);
    }
  }

  async performSuggestionSearch(query, mediaType) {
    try {
      const response = await tmdbApi.search(query, mediaType, 1);
      const suggestions = response.results.slice(0, 5); // Limit suggestions
      this.searchBarView.showSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.searchBarView.hideSuggestions();
    }
  }

  async performFullSearch(query, mediaType) {
    try {
      // Hide suggestions
      this.searchBarView.hideSuggestions();
      
      // Reset pagination
      this.currentPage = 1;
      
      // Show loading state
      this.showSearchLoading();
      
      // Navigate to search results page
      window.location.hash = `#/search?q=${encodeURIComponent(query)}&type=${mediaType}`;
      
      // Perform search
      const response = await tmdbApi.search(query, mediaType, 1);
      
      // Update UI
      this.displaySearchResults(response.results, query);
      this.currentPage = 2;
      
    } catch (error) {
      console.error('Error performing search:', error);
      this.showSearchError();
    }
  }

  async loadMoreSearchResults() {
    try {
      const response = await tmdbApi.search(this.currentQuery, this.currentMediaType, this.currentPage);
      
      if (response.results.length > 0) {
        this.infiniteScrollView.render(response.results, true);
        this.currentPage++;
        return this.currentPage <= response.total_pages;
      }
      
      return false;
    } catch (error) {
      console.error('Error loading more search results:', error);
      return false;
    }
  }

  displaySearchResults(results, query) {
    const searchResultsContainer = document.getElementById('searchResults');
    const searchHeader = document.getElementById('searchHeader');
    
    if (searchHeader) {
      searchHeader.innerHTML = `
        <h2>Search Results for "${query}"</h2>
        <p>${results.length} results found</p>
      `;
    }

    if (this.infiniteScrollView) {
      this.infiniteScrollView.reset();
      this.infiniteScrollView.render(results);
    }

    // Show search results section
    const searchSection = document.getElementById('searchSection');
    if (searchSection) {
      searchSection.style.display = 'block';
    }

    // Hide other sections
    this.hideOtherSections();
  }

  showSearchLoading() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.innerHTML = Array(8).fill().map(() => `
        <div class="movie-card skeleton">
          <div class="movie-poster skeleton-poster"></div>
          <div class="movie-info">
            <div class="skeleton-title"></div>
            <div class="skeleton-year"></div>
          </div>
        </div>
      `).join('');
    }
  }

  showSearchError() {
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
      searchResults.innerHTML = `
        <div class="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>Unable to fetch search results. Please try again.</p>
        </div>
      `;
    }
  }

  hideOtherSections() {
    const sectionsToHide = ['heroSection', 'trendingNow', 'topMovies', 'topTV', 'genreChips', 'mainGrid'];
    sectionsToHide.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'none';
      }
    });
  }

  showHomeSections() {
    const sectionsToShow = ['heroSection', 'trendingNow', 'topMovies', 'topTV', 'genreChips', 'mainGrid'];
    sectionsToShow.forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = 'block';
      }
    });

    const searchSection = document.getElementById('searchSection');
    if (searchSection) {
      searchSection.style.display = 'none';
    }
  }

  handleSuggestionClick(id, mediaType) {
    window.location.hash = `#/detail/${mediaType}/${id}`;
  }

  // Method to handle search from URL parameters
  async searchFromURL(query, mediaType = 'multi') {
    this.currentQuery = query;
    this.currentMediaType = mediaType;
    this.currentPage = 1;

    // Update search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = query;
    }

    // Update media type toggle
    const mediaToggles = document.querySelectorAll('.media-toggle');
    mediaToggles.forEach(toggle => {
      toggle.classList.toggle('active', toggle.dataset.type === mediaType);
    });

    await this.performFullSearch(query, mediaType);
  }
}