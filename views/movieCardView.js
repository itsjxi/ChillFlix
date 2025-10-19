import { tmdbApi } from '../models/tmdbApi.js';
import { LocalStorageHelper } from '../utils/localStorageHelper.js';
import { BaseComponent } from '../components/BaseComponent.js';

export class MovieCardView {
  static createCard(item) {
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
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMzMzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg=='"
          />
          <div class="movie-overlay">
            <button class="watchlist-btn ${isInWatchlist ? 'active' : ''}" 
                    data-id="${item.id}" 
                    data-type="${mediaType}"
                    onclick="event.stopPropagation()"
                    title="${isInWatchlist ? 'Remove from Wishlist' : 'Add to Wishlist'}">
              ${isInWatchlist ? '❤️' : '🤍'}
            </button>
            ${BaseComponent.createRatingDisplay(item.vote_average || 0)}
          </div>
        </div>
        <div class="movie-info">
          <h3 class="movie-title">${title}</h3>
          <p class="movie-year">${year}</p>
        </div>
      </div>
    `;
  }

  static createSkeletonCard() {
    return `
      <div class="movie-card skeleton">
        <div class="movie-poster skeleton-poster"></div>
        <div class="movie-info">
          <div class="skeleton-title"></div>
          <div class="skeleton-year"></div>
        </div>
      </div>
    `;
  }
}