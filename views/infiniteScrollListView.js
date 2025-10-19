import { MovieCardView } from './movieCardView.js';

export class InfiniteScrollListView {
  constructor(container, onLoadMore) {
    this.container = container;
    this.onLoadMore = onLoadMore;
    this.isLoading = false;
    this.hasMore = true;
    this.observer = null;
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoading && this.hasMore) {
          this.loadMore();
        }
      });
    }, options);
  }

  render(items, append = false) {
    const html = items.map(item => MovieCardView.createCard(item)).join('');
    
    if (append) {
      this.container.insertAdjacentHTML('beforeend', html);
    } else {
      this.container.innerHTML = html;
    }

    this.bindCardEvents();
    this.updateSentinel();
  }

  renderSkeletons(count = 8) {
    const skeletons = Array(count).fill().map(() => MovieCardView.createSkeletonCard()).join('');
    this.container.insertAdjacentHTML('beforeend', skeletons);
  }

  bindCardEvents() {
    // Bind watchlist events
    const watchlistBtns = this.container.querySelectorAll('.watchlist-btn');
    watchlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const type = btn.dataset.type;
        
        // Toggle watchlist status
        const isActive = btn.classList.contains('active');
        if (isActive) {
          btn.classList.remove('active');
          btn.innerHTML = '🤍';
          // Remove from watchlist logic here
        } else {
          btn.classList.add('active');
          btn.innerHTML = '❤️';
          // Add to watchlist logic here
        }
      });
    });

    // Bind card click events for navigation
    const movieCards = this.container.querySelectorAll('.movie-card');
    movieCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const type = card.dataset.type;
        window.location.hash = `#/detail/${type}/${id}`;
      });
    });
  }

  updateSentinel() {
    // Remove existing sentinel
    const existingSentinel = document.querySelector('.scroll-sentinel');
    if (existingSentinel) {
      this.observer.unobserve(existingSentinel);
      existingSentinel.remove();
    }

    // Add new sentinel if there are more items to load
    if (this.hasMore) {
      const sentinel = document.createElement('div');
      sentinel.className = 'scroll-sentinel';
      sentinel.style.height = '1px';
      this.container.appendChild(sentinel);
      this.observer.observe(sentinel);
    }
  }

  async loadMore() {
    if (this.isLoading || !this.hasMore) return;
    
    this.isLoading = true;
    this.renderSkeletons(4);
    
    try {
      const hasMore = await this.onLoadMore();
      this.hasMore = hasMore;
    } catch (error) {
      console.error('Error loading more items:', error);
    } finally {
      // Remove skeleton cards
      const skeletons = this.container.querySelectorAll('.skeleton');
      skeletons.forEach(skeleton => skeleton.remove());
      this.isLoading = false;
    }
  }

  reset() {
    this.hasMore = true;
    this.isLoading = false;
    this.container.innerHTML = '';
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}