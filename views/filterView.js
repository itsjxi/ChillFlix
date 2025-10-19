import { tmdbApi } from '../models/tmdbApi.js';

export class FilterView {
  constructor(onFilterChange) {
    this.onFilterChange = onFilterChange;
    this.languages = [];
    this.countries = [];
  }

  async init() {
    try {
      const [languages, countries] = await Promise.all([
        tmdbApi.getLanguages(),
        tmdbApi.getCountries()
      ]);
      this.languages = languages;
      this.countries = countries;
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }

  render() {
    return `
      <div class="filter-container">
        <div class="filter-header">
          <h3>Filters</h3>
          <button class="filter-reset">Reset</button>
        </div>
        
        <div class="filter-group">
          <label>Language</label>
          <select class="filter-select" data-filter="language">
            <option value="">All Languages</option>
            ${this.languages.slice(0, 20).map(lang => `
              <option value="${lang.iso_639_1}">${lang.english_name}</option>
            `).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label>Sort By</label>
          <select class="filter-select" data-filter="sort_by">
            <option value="popularity.desc">Most Popular</option>
            <option value="release_date.desc">Newest First</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="revenue.desc">Highest Grossing</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Year</label>
          <div class="year-range">
            <input type="number" class="filter-input" data-filter="primary_release_date.gte" 
                   placeholder="From" min="1900" max="2024">
            <input type="number" class="filter-input" data-filter="primary_release_date.lte" 
                   placeholder="To" min="1900" max="2024">
          </div>
        </div>

        <div class="filter-group">
          <label>Rating</label>
          <div class="rating-range">
            <input type="range" class="filter-range" data-filter="vote_average.gte" 
                   min="0" max="10" step="0.5" value="0">
            <span class="range-value">0+</span>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const filterSelects = document.querySelectorAll('.filter-select');
    const filterInputs = document.querySelectorAll('.filter-input');
    const filterRanges = document.querySelectorAll('.filter-range');
    const resetBtn = document.querySelector('.filter-reset');

    const handleFilterChange = () => {
      const filters = {};
      
      filterSelects.forEach(select => {
        if (select.value) {
          filters[select.dataset.filter] = select.value;
        }
      });

      filterInputs.forEach(input => {
        if (input.value) {
          filters[input.dataset.filter] = input.value;
        }
      });

      filterRanges.forEach(range => {
        if (range.value > 0) {
          filters[range.dataset.filter] = range.value;
        }
      });

      this.onFilterChange(filters);
    };

    filterSelects.forEach(select => {
      select.addEventListener('change', handleFilterChange);
    });

    filterInputs.forEach(input => {
      input.addEventListener('input', debounce(handleFilterChange, 500));
    });

    filterRanges.forEach(range => {
      range.addEventListener('input', (e) => {
        const valueSpan = e.target.parentNode.querySelector('.range-value');
        valueSpan.textContent = `${e.target.value}+`;
        handleFilterChange();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        filterSelects.forEach(select => select.value = '');
        filterInputs.forEach(input => input.value = '');
        filterRanges.forEach(range => {
          range.value = 0;
          const valueSpan = range.parentNode.querySelector('.range-value');
          valueSpan.textContent = '0+';
        });
        this.onFilterChange({});
      });
    }
  }
}

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}