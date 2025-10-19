import { TMDB_API_KEY, TMDB_BASE_URL } from '../config.js';

/**
 * Helper function to make TMDB API requests
 * @param {string} path - API endpoint path
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - JSON response
 */
export async function tmdbFetch(path, params = {}) {
  const url = new URL(`${TMDB_BASE_URL}/${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`TMDB API error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}