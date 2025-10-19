export class BaseComponent {
  static createButton(text, type = 'primary', icon = '', className = '') {
    return `
      <button class="btn btn-${type} ${className}">
        ${icon ? `<span class="btn-icon">${icon}</span>` : ''}
        <span class="btn-text">${text}</span>
      </button>
    `;
  }

  static createBackButton() {
    return `
      <button class="btn btn-back" id="backBtn">
        <span class="btn-icon">←</span>
        <span class="btn-text">Back</span>
      </button>
    `;
  }

  static createWatchlistButton(isActive = false, id, type) {
    return `
      <button class="btn btn-watchlist ${isActive ? 'active' : ''}" 
              data-id="${id}" 
              data-type="${type}">
        <span class="btn-icon">${isActive ? '❤️' : '🤍'}</span>
        <span class="btn-text">${isActive ? 'In Watchlist' : 'Add to Watchlist'}</span>
      </button>
    `;
  }

  static createRatingDisplay(rating) {
    return `
      <div class="rating-display">
        <span class="rating-icon">⭐</span>
        <span class="rating-value">${rating.toFixed(1)}</span>
      </div>
    `;
  }

  static createGenreTag(genre) {
    return `<span class="genre-tag">${genre}</span>`;
  }

  static createLoadingSpinner() {
    return `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>
    `;
  }

  static createErrorMessage(message = 'Something went wrong') {
    return `
      <div class="error-message">
        <div class="error-icon">⚠️</div>
        <p>${message}</p>
      </div>
    `;
  }
}