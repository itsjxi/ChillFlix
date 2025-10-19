import { LocalStorageHelper } from '../utils/localStorageHelper.js';
import { tmdbApi } from '../models/tmdbApi.js';

export class SidebarView {
  constructor() {
    this.container = document.getElementById('wishlistContainer');
  }

  render() {
    if (!this.container) return;
    
    const wishlist = LocalStorageHelper.getWatchlist();
    
    if (wishlist.length === 0) {
      this.container.innerHTML = `
        <div class="empty-wishlist">
          <div class="empty-wishlist-icon">🎬</div>
          <p>No movies in your wishlist yet</p>
        </div>
      `;
      return;
    }

    this.container.innerHTML = wishlist.map(item => this.createWishlistItem(item)).join('');
    this.bindEvents();
  }

  createWishlistItem(item) {
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
        <button class="wishlist-remove" data-id="${item.id}" data-type="${item.media_type}">
          ✕
        </button>
      </div>
    `;
  }

  bindEvents() {
    // Click to view details
    const wishlistItems = this.container.querySelectorAll('.wishlist-item');
    wishlistItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('wishlist-remove')) return;
        
        const id = item.dataset.id;
        const type = item.dataset.type;
        window.location.hash = `#/detail/${type}/${id}`;
      });
    });

    // Remove from wishlist
    const removeButtons = this.container.querySelectorAll('.wishlist-remove');
    removeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        
        LocalStorageHelper.removeFromWatchlist(id, type);
        this.render(); // Re-render after removal
        
        // Update movie card if visible
        const movieCard = document.querySelector(`[data-id="${id}"][data-type="${type}"] .watchlist-btn`);
        if (movieCard) {
          movieCard.classList.remove('active');
          movieCard.innerHTML = '🤍';
        }
      });
    });
  }

  updateWishlist() {
    this.render();
  }
}