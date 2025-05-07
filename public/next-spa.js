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
    // Check for path from 404.html redirect
    const pathFromSearch = window.location.search.match(/(\?|&)path=([^&]*)/);
    if (pathFromSearch) {
      // Extract the path from the search parameter
      const redirectPath = '/' + pathFromSearch[2];
      // Use history API to replace the URL without reloading
      history.replaceState(null, null, redirectPath);
      console.log('Redirected from 404 page to:', redirectPath);
    }

    // Load environment variables from multiple sources
    tryLoadEnvironmentVariables();

    // Dynamically load the Next.js bundle
    const nextMainScript = document.createElement('script');
    nextMainScript.src = '/_next/static/chunks/main.js';
    nextMainScript.async = true;
    document.body.appendChild(nextMainScript);

    // Enhance console with debugging info
    console.log('Next.js SPA initialized');
  }

  function tryLoadEnvironmentVariables() {
    try {
      // Try to load from window.ENV (from env-config.js)
      if (window.ENV) {
        const envVars = {
          COGNITO_USER_POOL_ID: window.ENV.COGNITO_USER_POOL_ID,
          COGNITO_CLIENT_ID: window.ENV.COGNITO_CLIENT_ID,
          REGION: window.ENV.REGION,
          API_URL: window.ENV.API_URL,
          SITE_URL: window.ENV.SITE_URL
        };

        // Set directly on window for easy access
        for (const [key, value] of Object.entries(envVars)) {
          if (value && value !== `__${key}__`) {
            window[key] = value;
          }
        }

        // Log environment variables loaded (for debugging)
        console.log('Environment variables loaded:', 
          Object.fromEntries(
            Object.entries(envVars).map(([k, v]) => 
              [k, v && v !== `__${k}__` ? '[SET]' : '[NOT SET]']
            )
          )
        );
      } else {
        console.warn('window.ENV not available - environment variables may not be loaded correctly');
      }

      // Try to load from meta tags as well (Amplify sometimes adds these)
      const envVars = document.querySelectorAll('meta[name^="env-"]');
      if (envVars.length > 0) {
        console.log(`Found ${envVars.length} environment variables in meta tags`);
        envVars.forEach(meta => {
          const name = meta.getAttribute('name')?.replace('env-', '') || '';
          const content = meta.getAttribute('content') || '';
          if (name && content) {
            // Set on window
            window[name.toUpperCase()] = content;
            // Also set in ENV object if it exists
            if (window.ENV) {
              window.ENV[name.toUpperCase()] = content;
            }
            console.log(`Loaded ${name} from meta tag`);
          }
        });
      }
    } catch (e) {
      console.warn('Error loading environment variables:', e);
    }
  }
})();