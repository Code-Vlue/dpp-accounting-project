/**
 * This script prepares environment variables for the static build.
 * It creates a script that will be injected into the HTML to make environment
 * variables available to the client-side JavaScript.
 */
const fs = require('fs');
const path = require('path');

// Define the path to the environment config file
const envConfigPath = path.resolve(process.cwd(), 'public/env-config.js');

// Create the content for the environment config file
// This will be replaced with actual values by Amplify during the build
const envConfigContent = `// This file is dynamically generated during the Amplify deployment
// It contains environment variables that can be accessed client-side
window.ENV = {
  COGNITO_USER_POOL_ID: '${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''}',
  COGNITO_CLIENT_ID: '${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''}',
  REGION: '${process.env.AWS_REGION || 'us-east-1'}',
  API_URL: '${process.env.NEXT_PUBLIC_API_URL || ''}',
  SITE_URL: '${process.env.NEXT_PUBLIC_SITE_URL || ''}'
};
`;

// Write the file
try {
  fs.writeFileSync(envConfigPath, envConfigContent);
  console.log(`✅ Environment config file created at ${envConfigPath}`);
} catch (error) {
  console.error(`❌ Error creating environment config file: ${error.message}`);
  process.exit(1);
}

// Create index.html with meta tags for environment variables
const indexHtmlPath = path.resolve(process.cwd(), 'public/index.html');
const indexHtmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Environment Variables -->
    <meta name="env-COGNITO_USER_POOL_ID" content="${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || ''}" />
    <meta name="env-COGNITO_CLIENT_ID" content="${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || ''}" />
    <meta name="env-REGION" content="${process.env.AWS_REGION || 'us-east-1'}" />
    <meta name="env-API_URL" content="${process.env.NEXT_PUBLIC_API_URL || ''}" />
    <meta name="env-SITE_URL" content="${process.env.NEXT_PUBLIC_SITE_URL || ''}" />
    <title>DPP Accounting Platform</title>
    <!-- Environment Config Script -->
    <script src="/env-config.js"></script>
  </head>
  <body>
    <div id="__next"></div>
    <script>
      // This script helps with Amplify static deployments
      // by redirecting to the correct Next.js generated page
      (function() {
        // Redirect handling for SPA routing
        window.addEventListener('DOMContentLoaded', function() {
          if (window.location.pathname !== '/' && !window.location.pathname.match(/\\.(js|css|png|jpg|jpeg|gif|svg|ico|html)$/)) {
            const nextData = document.getElementById('__NEXT_DATA__');
            if (!nextData) {
              window.location.href = '/';
            }
          }
        });
      })();
    </script>
  </body>
</html>
`;

try {
  fs.writeFileSync(indexHtmlPath, indexHtmlContent);
  console.log(`✅ Index HTML file created at ${indexHtmlPath}`);
} catch (error) {
  console.error(`❌ Error creating index HTML file: ${error.message}`);
}

console.log('✅ Environment preparation complete');