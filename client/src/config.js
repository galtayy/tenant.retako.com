// API endpoints configuration
const config = {
  // Development API URL (when running locally)
  dev: {
    apiUrl: 'http://localhost:8080'
  },
  // Production API URL (when deployed)
  prod: {
    apiUrl: 'https://api.tenant.retako.com' // Canlı ortam API URL'si
  }
};

// Is this production environment?
const isProduction = process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost';

// Export the appropriate API URL based on environment
export const API_URL = isProduction ? config.prod.apiUrl : config.dev.apiUrl;
