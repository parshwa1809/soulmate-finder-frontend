

export const config = {
  URL: 'http://18.218.180.137:8080', // Changed back to HTTP to avoid SSL issues
  MAX_IMAGES: 5
};

// Configure fetch to work with HTTP in development
if (import.meta.env.DEV) {
  // For development, we'll handle CORS and HTTP requests
  console.log('Development mode: Using HTTP backend at', config.URL);
}

