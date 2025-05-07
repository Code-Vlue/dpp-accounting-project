/**
 * Static Export Fix for AWS Amplify
 * 
 * This script prepares a Next.js static export for deployment on AWS Amplify.
 * It ensures proper routing and authentication works with Cognito in a static site.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Static Export Fix for AWS Amplify');
console.log('=======================================');

// Paths
const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const indexHtml = path.join(outDir, 'index.html');

// Step 1: Verify the Next.js static export
console.log('\n📋 Step 1: Verifying static export');
if (!fs.existsSync(outDir)) {
  console.log('Static export directory not found. Creating for you...');
  // Try to ensure the directory exists
  fs.mkdirSync(outDir, { recursive: true });
} else {
  console.log('✅ Static export directory exists');
}

// Step 2: Create SPA-style redirects for client-side routing
console.log('\n📋 Step 2: Creating SPA-style routing support');

// Create a 404.html file that redirects to index.html with the path in the query
const redirectCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <script>
    // Single Page App redirect - stores the current path in local storage and redirects to index.html
    const pathname = window.location.pathname;
    const search = window.location.search || '';
    const hash = window.location.hash || '';
    const fullPath = pathname + search + hash;
    
    // Store the path for index.html to use
    localStorage.setItem('spaRedirectPath', fullPath);
    
    // Redirect to index.html
    window.location.href = '/index.html';
  </script>
</head>
<body>
  <p>Redirecting...</p>
</body>
</html>
`;

// Write the 404.html file
try {
  fs.writeFileSync(path.join(outDir, '404.html'), redirectCode);
  console.log('✅ Created 404.html for SPA routing');
} catch (error) {
  console.error(`❌ Error creating 404.html: ${error.message}`);
}

// Modify index.html to handle the redirects
if (fs.existsSync(indexHtml)) {
  try {
    let indexContent = fs.readFileSync(indexHtml, 'utf8');
    
    // Add the redirect handling script right after the <head> tag
    const redirectHandler = `
  <script>
    // Check if we have a redirect path stored
    const redirectPath = localStorage.getItem('spaRedirectPath');
    if (redirectPath) {
      // Clear it immediately to avoid loops
      localStorage.removeItem('spaRedirectPath');
      
      // Replace the current URL path without a full page reload
      if (redirectPath !== '/' && redirectPath !== '/index.html') {
        window.history.replaceState(null, null, redirectPath);
      }
    }
  </script>
`;
    
    indexContent = indexContent.replace('<head>', '<head>' + redirectHandler);
    
    fs.writeFileSync(indexHtml, indexContent);
    console.log('✅ Modified index.html to handle SPA routing');
  } catch (error) {
    console.error(`❌ Error modifying index.html: ${error.message}`);
  }
} else {
  console.warn('⚠️ index.html not found. Unable to add SPA routing handler.');
}

// Step 3: Ensure authentication config works with static site
console.log('\n📋 Step 3: Creating client-side authentication configuration');

// Create a static-auth-config.js file that will be loaded by the browser
const authConfigContent = `
// Static authentication configuration for Cognito
window.AUTH_CONFIG = {
  userPoolId: '${process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'us-east-1_VSU1GBv2s'}',
  clientId: '${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '6i5k2cmsrlo1for3bn6dohdlf5'}',
  region: '${process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1'}',
  apiUrl: '${process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com'}',
  siteUrl: '${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com'}'
};
`;

// Write the auth config file
try {
  const publicDir = path.join(outDir, '_next', 'static');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(publicDir, 'auth-config.js'), authConfigContent);
  console.log('✅ Created auth-config.js with Cognito configuration');
  
  // Add the script tag to index.html
  if (fs.existsSync(indexHtml)) {
    let indexContent = fs.readFileSync(indexHtml, 'utf8');
    const scriptTag = '<script src="/_next/static/auth-config.js"></script>';
    
    // Add our auth config script right before the closing </head> tag
    indexContent = indexContent.replace('</head>', scriptTag + '</head>');
    
    fs.writeFileSync(indexHtml, indexContent);
    console.log('✅ Added auth-config.js script to index.html');
  }
} catch (error) {
  console.error(`❌ Error creating auth configuration: ${error.message}`);
}

// Step 4: Create AWS Amplify custom routing config
console.log('\n📋 Step 4: Creating AWS Amplify redirects for SPA routing');

// Create/update the amplify.yml file with custom routing rules
const amplifyConfig = `version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - echo "Building static site with authentication..."
        - npm run build
  artifacts:
    baseDirectory: out
    files:
      - '**/*'
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: Cache-Control
          value: 'public, max-age=0, must-revalidate'
  rewrites:
    - source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/'
      target: '/index.html'
      status: '200'
`;

// Write the amplify.yml file
try {
  fs.writeFileSync(path.join(rootDir, 'amplify.yml'), amplifyConfig);
  console.log('✅ Created amplify.yml with SPA routing configuration');
} catch (error) {
  console.error(`❌ Error creating amplify.yml: ${error.message}`);
}

console.log('\n🎉 Static export preparation completed successfully!');
console.log('Next steps:');
console.log('1. Commit and push your changes to GitHub');
console.log('2. AWS Amplify will deploy your static site');
console.log('3. Authentication will work client-side with Cognito');