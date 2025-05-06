/**
 * post-build.js
 * This script generates the required-server-files.json file needed by AWS Amplify for SSR deployments.
 * It should be run after the Next.js build completes and before deployment.
 */
const fs = require('fs');
const path = require('path');

// Define paths
const nextDir = path.resolve(process.cwd(), '.next');
const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');

// Generate the required-server-files.json file
function generateRequiredServerFiles() {
  console.log('Generating required-server-files.json for AWS Amplify SSR deployment...');
  
  // Create the content for required-server-files.json
  // This is a simplified version that tells Amplify which files are needed for SSR
  const requiredServerFiles = {
    config: {
      // Include the next.config.js file
      path: path.relative(nextDir, path.resolve(process.cwd(), 'next.config.js')),
      // Ensure standalone output mode is used
      outputFileTracingRoot: process.cwd(),
      // Ensure ISR/SSR compatibility
      experimental: {
        missingSuspenseWithCSRBailout: false
      }
    },
    // Include the necessary server files
    files: [
      // Include server components directory
      path.relative(nextDir, path.resolve(nextDir, 'server')), 
      // Include middleware files
      path.relative(nextDir, path.resolve(nextDir, 'server/middleware-manifest.json')),
      path.relative(nextDir, path.resolve(nextDir, 'server/middleware-build-manifest.js')),
      // Include server pages and app directory
      path.relative(nextDir, path.resolve(nextDir, 'server/pages')),
      path.relative(nextDir, path.resolve(nextDir, 'server/app')),
      // Include server chunks
      path.relative(nextDir, path.resolve(nextDir, 'server/chunks')),
      // Include webpack runtime
      path.relative(nextDir, path.resolve(nextDir, 'server/webpack-runtime.js')),
      // Include package.json
      path.relative(nextDir, path.resolve(process.cwd(), 'package.json')),
      // Include next.config.js
      path.relative(nextDir, path.resolve(process.cwd(), 'next.config.js'))
    ]
  };

  try {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }

    // Write the required-server-files.json file
    fs.writeFileSync(
      requiredServerFilesPath,
      JSON.stringify(requiredServerFiles, null, 2)
    );

    console.log(`Successfully created ${requiredServerFilesPath}`);
    
    // Also create an empty server.js file if it doesn't exist
    const serverJsPath = path.resolve(process.cwd(), 'server.js');
    if (!fs.existsSync(serverJsPath)) {
      const serverJsContent = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(\`> Ready on http://\${hostname}:\${port}\`);
    });
});
      `;
      fs.writeFileSync(serverJsPath, serverJsContent);
      console.log(`Created server.js file at ${serverJsPath}`);
    }
    
    // Verify all required files exist
    console.log('Verifying essential NextJS files for SSR deployment...');
    
    // Check if key Next.js directories exist
    const requiredDirs = [
      path.join(nextDir, 'server'),
      path.join(nextDir, 'server/pages'),
      path.join(nextDir, 'server/chunks')
    ];
    
    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        console.warn(`Warning: Directory ${dir} does not exist. This might cause deployment issues.`);
      } else {
        console.log(`✓ Directory ${dir} exists.`);
      }
    }
    
    // Check if key Next.js files exist
    const requiredFiles = [
      path.join(nextDir, 'server/middleware-manifest.json'),
      path.join(nextDir, 'server/webpack-runtime.js')
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        console.warn(`Warning: File ${file} does not exist. This might cause deployment issues.`);
      } else {
        console.log(`✓ File ${file} exists.`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error generating required-server-files.json:', error);
    return false;
  }
}

// Execute the function
const success = generateRequiredServerFiles();

// Exit with appropriate code
process.exit(success ? 0 : 1);