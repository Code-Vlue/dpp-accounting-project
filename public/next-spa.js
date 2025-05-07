/**
 * next-spa.js
 * Helper script for Next.js static builds deployed on AWS Amplify
 */

(function() {
  // This script is added to index.html to help with client-side routing
  // in a statically built Next.js app

  // Handle initial page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSPA);
  } else {
    initSPA();
  }

  function initSPA() {
    // Dynamically load the Next.js bundle
    const nextMainScript = document.createElement('script');
    nextMainScript.src = '/_next/static/chunks/main.js';
    nextMainScript.async = true;
    document.body.appendChild(nextMainScript);

    // Load any environment variables from Amplify
    try {
      const envVars = {
        COGNITO_USER_POOL_ID: window.COGNITO_USER_POOL_ID,
        COGNITO_CLIENT_ID: window.COGNITO_CLIENT_ID,
        REGION: window.REGION,
        API_URL: window.API_URL,
        SITE_URL: window.SITE_URL
      };

      // Log environment variables loaded (for debugging)
      console.log('Environment variables loaded:', 
        Object.fromEntries(
          Object.entries(envVars).map(([k, v]) => [k, v ? '[SET]' : '[NOT SET]'])
        )
      );
    } catch (e) {
      console.warn('Error loading environment variables:', e);
    }
  }
})();