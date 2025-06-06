


export const config = {
  URL: 'https://lovabhagya.com', // Updated to new backend URL
  MAX_IMAGES: 5
};

// Configure fetch to work with HTTPS in production
if (import.meta.env.DEV) {
  // For development, we'll handle CORS and HTTPS requests
  console.log('Development mode: Using HTTPS backend at', config.URL);
}


