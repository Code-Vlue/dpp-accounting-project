// This file is dynamically generated during the Amplify deployment
// It contains environment variables that can be accessed client-side
window.ENV = {
  COGNITO_USER_POOL_ID: '__COGNITO_USER_POOL_ID__',
  COGNITO_CLIENT_ID: '__COGNITO_CLIENT_ID__',
  REGION: '__REGION__',
  API_URL: '__API_URL__',
  SITE_URL: '__SITE_URL__'
};

// Make environment variables accessible through simpler variables
window.COGNITO_USER_POOL_ID = window.ENV.COGNITO_USER_POOL_ID;
window.COGNITO_CLIENT_ID = window.ENV.COGNITO_CLIENT_ID;
window.REGION = window.ENV.REGION;

// Load environment variables from meta tags if available
(function loadEnvFromMetaTags() {
  try {
    // Try to get environment variables from meta tags (Amplify injects these)
    const envVars = document.querySelectorAll('meta[name^="env-"]');
    envVars.forEach(meta => {
      const name = meta.getAttribute('name')?.replace('env-', '') || '';
      const content = meta.getAttribute('content') || '';
      if (name && content) {
        window.ENV[name.toUpperCase()] = content;
        window[name.toUpperCase()] = content;
      }
    });
    
    console.log('Environment variables loaded successfully');
  } catch (error) {
    console.warn('Failed to load environment variables from meta tags', error);
  }
})();