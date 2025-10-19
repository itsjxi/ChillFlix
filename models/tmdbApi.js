import { tmdbFetch } from '../utils/fetchHelper.js';
import { TMDB_IMAGE_BASE_URL, DEFAULT_LANGUAGE, ACCOUNT_ID } from '../config.js';

/**
 * TMDB API wrapper with all required methods
 */
export const tmdbApi = {
  /**
   * Fetch genres for movies or TV shows
   * @param {string} mediaType - 'movie' or 'tv'
   * @param {string} language - Language code (default: 'en-US')
   * @returns {Promise<Object>} Genres list
   * @example tmdbApi.getGenres('movie', 'en-US')
   */
  getGenres: async (mediaType = 'movie', language = DEFAULT_LANGUAGE) => {
    return tmdbFetch(`genre/${mediaType}/list`, { language });
  },

  /**
   * Fetch trending content
   * @param {string} mediaType - 'all', 'movie', or 'tv'
   * @param {string} timeWindow - 'day' or 'week'
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'en-US')
   * @returns {Promise<Object>} Trending content
   * @example tmdbApi.getTrending('movie', 'week', 1, 'en-US')
   */
  getTrending: async (mediaType = 'all', timeWindow = 'week', page = 1, language = DEFAULT_LANGUAGE) => {
    return tmdbFetch(`trending/${mediaType}/${timeWindow}`, { page, language });
  },

  /**
   * Fetch content lists (popular, top_rated, upcoming, etc.)
   * @param {string} mediaType - 'movie' or 'tv'
   * @param {string} listType - 'popular', 'top_rated', 'upcoming', 'now_playing'
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'en-US')
   * @returns {Promise<Object>} Content list
   * @example tmdbApi.getList('movie', 'popular', 1, 'en-US')
   */
  getList: async (mediaType = 'movie', listType = 'popular', page = 1, language = DEFAULT_LANGUAGE) => {
    return tmdbFetch(`${mediaType}/${listType}`, { page, language });
  },

  /**
   * Search for content
   * @param {string} query - Search query
   * @param {string} mediaType - 'multi', 'movie', 'tv', or 'person'
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'en-US')
   * @param {boolean} includeAdult - Include adult content (default: false)
   * @returns {Promise<Object>} Search results
   * @example tmdbApi.search('avengers', 'movie', 1, 'en-US', false)
   */
  search: async (query, mediaType = 'multi', page = 1, language = DEFAULT_LANGUAGE, includeAdult = false) => {
    return tmdbFetch(`search/${mediaType}`, {
      query,
      page,
      language,
      include_adult: includeAdult
    });
  },

  /**
   * Discover content with filters
   * @param {string} mediaType - 'movie' or 'tv'
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'en-US')
   * @param {Array} withGenres - Array of genre IDs
   * @param {string} sortBy - Sort criteria (default: 'popularity.desc')
   * @returns {Promise<Object>} Discovered content
   * @example tmdbApi.discover('movie', 1, 'en-US', [28, 12], 'popularity.desc')
   */
  discover: async (mediaType = 'movie', page = 1, language = DEFAULT_LANGUAGE, withGenres = [], sortBy = 'popularity.desc') => {
    const params = {
      page,
      language,
      sort_by: sortBy
    };
    if (withGenres.length > 0) {
      params.with_genres = withGenres.join(',');
    }
    return tmdbFetch(`discover/${mediaType}`, params);
  },

  /**
   * Get detailed information about a movie or TV show
   * @param {string} mediaType - 'movie' or 'tv'
   * @param {number} id - Content ID
   * @param {string} language - Language code (default: 'en-US')
   * @param {string} appendToResponse - Additional data to append (default: 'credits,similar,reviews')
   * @returns {Promise<Object>} Detailed content information
   * @example tmdbApi.getDetails('movie', 550, 'en-US', 'credits,similar,reviews')
   */
  getDetails: async (mediaType = 'movie', id, language = DEFAULT_LANGUAGE, appendToResponse = 'credits,similar,reviews') => {
    return tmdbFetch(`${mediaType}/${id}`, { language, append_to_response: appendToResponse });
  },

  /**
   * Get user's rated content (requires authentication)
   * @param {string} accountId - Account ID
   * @param {string} mediaType - 'movies' or 'tv'
   * @param {string} sessionId - Session ID
   * @param {number} page - Page number (default: 1)
   * @param {string} language - Language code (default: 'en-US')
   * @returns {Promise<Object>} Rated content
   * @example tmdbApi.getRated('12345', 'movies', 'session123', 1, 'en-US')
   */
  getRated: async (accountId = ACCOUNT_ID, mediaType = 'movies', sessionId, page = 1, language = DEFAULT_LANGUAGE) => {
    return tmdbFetch(`account/${accountId}/rated/${mediaType}`, {
      session_id: sessionId,
      page,
      language
    });
  },

  /**
   * Get image URL with proper base URL and size
   * @param {string} path - Image path from TMDB
   * @param {string} size - Image size (default: 'w500')
   * @returns {string|null} Complete image URL
   */
  getImageUrl: (path, size = 'w500') => {
    return path ? `${TMDB_IMAGE_BASE_URL}/${size}${path}` : null;
  }
};

// Example usage - fetch initial content on module load
// This ensures content is available immediately when the app starts
export const initialContent = {
  trending: null,
  popular: null,
  topRated: null
};

// Load initial content
(async () => {
  try {
    const [trending, popular, topRated] = await Promise.all([
      tmdbApi.getTrending('movie', 'week', 1),
      tmdbApi.getList('movie', 'popular', 1),
      tmdbApi.getList('movie', 'top_rated', 1)
    ]);
    
    initialContent.trending = trending;
    initialContent.popular = popular;
    initialContent.topRated = topRated;
    
    console.log('Initial content loaded:', { trending, popular, topRated });
  } catch (error) {
    console.error('Error loading initial content:', error);
  }
})();