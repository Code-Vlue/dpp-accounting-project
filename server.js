/**
 * server.js
 * Enhanced Next.js server for AWS Amplify SSR deployment with trace file handling
 */
const { createServer } = require('http');
const { parse } = require('url');
const path = require('path');
const fs = require('fs');
const next = require('next');

// Log server startup info for debugging
console.log('Starting server.js with:');
console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`- PORT: ${process.env.PORT || 3000}`);
console.log(`- Current Directory: ${process.cwd()}`);

// Check if required server files exist and create if missing
const requiredServerFilesPath = path.join(process.cwd(), 'required-server-files.json');
if (!fs.existsSync(requiredServerFilesPath)) {
  console.log('Creating missing required-server-files.json...');
  const basicRequiredServerFiles = {
    config: {
      path: "next.config.js",
      outputFileTracingRoot: process.cwd(),
      experimental: {
        missingSuspenseWithCSRBailout: false
      }
    },
    files: [
      "server",
      "server/middleware-manifest.json",
      "server/middleware-build-manifest.js",
      "server/pages",
      "server/app",
      "server/chunks",
      "server/webpack-runtime.js",
      "package.json",
      "next.config.js"
    ]
  };
  fs.writeFileSync(requiredServerFilesPath, JSON.stringify(basicRequiredServerFiles, null, 2));
  console.log('Created required-server-files.json');
}

// Ensure trace directory and files exist
const traceDir = path.join(process.cwd(), 'trace');
if (!fs.existsSync(traceDir)) {
  console.log('Creating missing trace directory...');
  fs.mkdirSync(traceDir, { recursive: true });
}

// Create server trace files if missing
const serverTraceFile = path.join(traceDir, 'server.js.nft.json');
if (!fs.existsSync(serverTraceFile)) {
  console.log('Creating missing server trace file...');
  const serverTraceContent = {
    version: 1,
    files: [
      ".next/server/app/page.js",
      ".next/server/pages/_app.js",
      ".next/server/pages/_document.js",
      "server.js",
      "package.json"
    ]
  };
  fs.writeFileSync(serverTraceFile, JSON.stringify(serverTraceContent, null, 2));
}

const serverEdgeTraceFile = path.join(traceDir, 'server-edge.js.nft.json');
if (!fs.existsSync(serverEdgeTraceFile)) {
  console.log('Creating missing server-edge trace file...');
  const serverEdgeTraceContent = {
    version: 1,
    files: [
      ".next/server/edge-runtime-webpack.js",
      ".next/server/middleware.js",
      "package.json"
    ]
  };
  fs.writeFileSync(serverEdgeTraceFile, JSON.stringify(serverEdgeTraceContent, null, 2));
}

// Determine the environment
const dev = process.env.NODE_ENV !== 'production';
// Use the PORT environment variable provided by Amplify, or default to 3000
const port = process.env.PORT || 3000;

// Create an empty headers object to avoid Next.js throwing errors on undefined headers
const headersFallback = {};

// Initialize Next.js app
console.log('Initializing Next.js app...');
const app = next({ 
  dev,
  conf: { 
    // Ensure we use the same buildId as in the build
    generateBuildId: async () => 'amplify-ssr-build',
    // Disable experimental features that might cause issues
    experimental: {
      missingSuspenseWithCSRBailout: false
    }
  }
});
const handle = app.getRequestHandler();

console.log('Preparing Next.js app...');
app.prepare()
  .then(() => {
    console.log('Creating HTTP server...');
    createServer(async (req, res) => {
      try {
        // Ensure headers exist to avoid Next.js errors
        if (!req.headers) {
          req.headers = headersFallback;
        }
        
        // Parse the URL
        const parsedUrl = parse(req.url, true);
        
        // Log request details in debug mode
        if (process.env.DEBUG) {
          console.log(`Request: ${req.method} ${parsedUrl.pathname}`);
        }
        
        // Let Next.js handle the request
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error occurred handling request:', err);
        
        // Log detailed error information for debugging
        console.error({
          method: req.method,
          url: req.url,
          headers: req.headers,
          errorMessage: err.message,
          errorStack: err.stack
        });
        
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    }).listen(port, (err) => {
      if (err) {
        console.error('Error starting server:', err);
        throw err;
      }
      console.log(`> Ready on http://localhost:${port}`);
    });
  })
  .catch(err => {
    console.error('Error occurred during server initialization:', err);
    console.error(err.stack);
    process.exit(1);
  });