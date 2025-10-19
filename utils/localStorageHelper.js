export class LocalStorageHelper {
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  // Watchlist methods
  static getWatchlist() {
    return this.get('watchlist', []);
  }

  static addToWatchlist(item) {
    const watchlist = this.getWatchlist();
    if (!watchlist.find(w => w.id === item.id && w.media_type === item.media_type)) {
      watchlist.push(item);
      this.set('watchlist', watchlist);
    }
  }

  static removeFromWatchlist(id, mediaType) {
    const watchlist = this.getWatchlist();
    const filtered = watchlist.filter(item => !(item.id === id && item.media_type === mediaType));
    this.set('watchlist', filtered);
  }

  static isInWatchlist(id, mediaType) {
    const watchlist = this.getWatchlist();
    return watchlist.some(item => item.id === id && item.media_type === mediaType);
  }
}