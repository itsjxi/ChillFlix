export class SearchBarView {
  constructor(onSearch, onSuggestionClick) {
    this.onSearch = onSearch;
    this.onSuggestionClick = onSuggestionClick;
    this.isVisible = false;
  }

  render() {
    return `
      <div class="search-container">
        <div class="search-bar">
          <input type="text" 
                 id="searchInput" 
                 placeholder="Search movies, TV shows..." 
                 autocomplete="off">
          <div class="search-toggle">
            <button class="media-toggle active" data-type="multi">All</button>
            <button class="media-toggle" data-type="movie">Movies</button>
            <button class="media-toggle" data-type="tv">TV Shows</button>
          </div>
          <button class="search-btn">🔍</button>
        </div>
        <div class="search-suggestions" id="searchSuggestions"></div>
      </div>
    `;
  }

  showSuggestions(suggestions) {
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
      const mediaType = item.media_type === 'tv' ? 'TV' : 'Movie';
      
      return `
        <div class="suggestion-item" 
             data-id="${item.id}" 
             data-type="${item.media_type}">
          <img src="${item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : ''}" 
               alt="${title}" 
               onerror="this.style.display='none'">
          <div class="suggestion-info">
            <span class="suggestion-title">${title}${yearText}</span>
            <span class="suggestion-type">${mediaType}</span>
          </div>
        </div>
      `;
    }).join('');

    container.style.display = 'block';
  }

  hideSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (container) {
      container.style.display = 'none';
    }
  }

  bindEvents() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');
    const mediaToggles = document.querySelectorAll('.media-toggle');
    const suggestionsContainer = document.getElementById('searchSuggestions');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        const activeToggle = document.querySelector('.media-toggle.active');
        const mediaType = activeToggle?.dataset.type || 'multi';
        
        if (query.length > 2) {
          this.onSearch(query, mediaType, true); // true for suggestions
        } else {
          this.hideSuggestions();
        }
      });

      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const query = e.target.value.trim();
          const activeToggle = document.querySelector('.media-toggle.active');
          const mediaType = activeToggle?.dataset.type || 'multi';
          
          if (query) {
            this.onSearch(query, mediaType, false); // false for full search
            this.hideSuggestions();
          }
        }
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const query = searchInput?.value.trim();
        const activeToggle = document.querySelector('.media-toggle.active');
        const mediaType = activeToggle?.dataset.type || 'multi';
        
        if (query) {
          this.onSearch(query, mediaType, false);
          this.hideSuggestions();
        }
      });
    }

    mediaToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        mediaToggles.forEach(t => t.classList.remove('active'));
        toggle.classList.add('active');
      });
    });

    if (suggestionsContainer) {
      suggestionsContainer.addEventListener('click', (e) => {
        const suggestionItem = e.target.closest('.suggestion-item');
        if (suggestionItem) {
          const id = suggestionItem.dataset.id;
          const type = suggestionItem.dataset.type;
          this.onSuggestionClick(id, type);
          this.hideSuggestions();
        }
      });
    }

    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        this.hideSuggestions();
      }
    });
  }
}