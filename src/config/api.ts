
export const config = {
  URL: 'https://18.218.180.137:8080', // Updated to HTTPS backend URL
  MAX_IMAGES: 5
};

// Configure fetch to work with HTTPS and skip SSL verification in development
if (import.meta.env.DEV) {
  // For development, we'll handle CORS and HTTPS requests
  console.log('Development mode: Using HTTPS backend at', config.URL);
}
