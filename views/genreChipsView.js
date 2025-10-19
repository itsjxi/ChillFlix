export class GenreChipsView {
  constructor(onGenreSelect) {
    this.onGenreSelect = onGenreSelect;
    this.selectedGenres = new Set();
  }

  render(genres, mediaType = 'movie') {
    return `
      <div class="genre-chips-container">
        <div class="genre-header">
          <h3>Explore by Genre</h3>
          <div class="media-type-selector">
            <button class="media-type-btn ${mediaType === 'movie' ? 'active' : ''}" data-type="movie">Movies</button>
            <button class="media-type-btn ${mediaType === 'tv' ? 'active' : ''}" data-type="tv">TV Shows</button>
          </div>
        </div>
        <div class="genre-chips">
          ${genres.map(genre => `
            <button class="genre-chip" 
                    data-id="${genre.id}" 
                    data-name="${genre.name}">
              <span>${genre.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindEvents() {
    const genreChips = document.querySelectorAll('.genre-chip');
    const mediaTypeBtns = document.querySelectorAll('.media-type-btn');

    genreChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const genreId = chip.dataset.id;
        const genreName = chip.dataset.name;
        
        if (this.selectedGenres.has(genreId)) {
          this.selectedGenres.delete(genreId);
          chip.classList.remove('active');
        } else {
          this.selectedGenres.add(genreId);
          chip.classList.add('active');
        }

        const activeMediaType = document.querySelector('.media-type-btn.active')?.dataset.type || 'movie';
        this.onGenreSelect(Array.from(this.selectedGenres), activeMediaType);
      });
    });

    mediaTypeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        mediaTypeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Clear selected genres when switching media type
        this.selectedGenres.clear();
        genreChips.forEach(chip => chip.classList.remove('active'));
        
        const mediaType = btn.dataset.type;
        this.onGenreSelect([], mediaType, true); // true indicates media type change
      });
    });
  }

  clearSelection() {
    this.selectedGenres.clear();
    document.querySelectorAll('.genre-chip').forEach(chip => {
      chip.classList.remove('active');
    });
  }
}