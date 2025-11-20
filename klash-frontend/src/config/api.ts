// API Configuration for Klash Backend
export const API_CONFIG = {
  // Backend server URL - change to your backend URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  // API prefix
  API_PREFIX: '/api',
  // WebSocket URL for real-time updates
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string) => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const path = endpoint.replace(/^\//, '');
  return `${baseUrl}/${path}`;
};

// API endpoints
export const API_ENDPOINTS = {
  // Markets
  MARKETS: 'markets',
  MARKET_DETAIL: (id: string) => `markets/${id}`,
  CREATE_MARKET: 'markets',

  // Bets
  PLACE_BET: 'bets',
  USER_BETS: 'bets/user',

  // Resolution
  RESOLVE_MARKET: (id: string) => `resolution/resolve/${id}`,
  MANUAL_RESOLVE: (id: string) => `resolution/manual-resolve/${id}`,
  PENDING_MARKETS: 'resolution/pending',

  // Twitter
  ANALYZE_TWEET: 'twitter/analyze',

  // Auth
  LOGIN: 'auth/login',
  REGISTER: 'auth/register',
  PROFILE: 'auth/profile',

  // Admin
  ADMIN_MARKETS: 'admin/markets',
  ADMIN_USERS: 'admin/users',
} as const;
