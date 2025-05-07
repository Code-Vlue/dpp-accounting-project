/**
 * fix-trace-files.js
 * This script ensures that trace files are properly set up for AWS Amplify SSR deployment.
 */
const fs = require('fs');
const path = require('path');

console.log('Setting up trace files for AWS Amplify SSR deployment...');

// Define paths
const nextDir = path.resolve(process.cwd(), '.next');
const traceDir = path.resolve(process.cwd(), 'trace');
const nextTraceDir = path.join(nextDir, 'trace');

try {
  // Create top-level trace directory if it doesn't exist
  if (!fs.existsSync(traceDir)) {
    fs.mkdirSync(traceDir, { recursive: true });
    console.log(`Created directory: ${traceDir}`);
  }

  // Create required trace files in trace directory
  const serverTraceFile = path.join(traceDir, 'server.js.nft.json');
  const serverEdgeTraceFile = path.join(traceDir, 'server-edge.js.nft.json');
  
  if (!fs.existsSync(serverTraceFile)) {
    // Create a basic server trace file
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
    console.log(`Created file: ${serverTraceFile}`);
  }
  
  if (!fs.existsSync(serverEdgeTraceFile)) {
    // Create a basic server-edge trace file
    const serverEdgeTraceContent = {
      version: 1,
      files: [
        ".next/server/edge-runtime-webpack.js",
        ".next/server/middleware.js",
        "package.json"
      ]
    };
    
    fs.writeFileSync(serverEdgeTraceFile, JSON.stringify(serverEdgeTraceContent, null, 2));
    console.log(`Created file: ${serverEdgeTraceFile}`);
  }

  // Also create .next/trace directory if needed
  if (!fs.existsSync(nextTraceDir)) {
    fs.mkdirSync(nextTraceDir, { recursive: true });
    console.log(`Created directory: ${nextTraceDir}`);
  }

  // Copy trace files to .next/trace for redundancy
  if (fs.existsSync(serverTraceFile)) {
    fs.copyFileSync(serverTraceFile, path.join(nextTraceDir, 'server.js.nft.json'));
    console.log(`Copied to: ${path.join(nextTraceDir, 'server.js.nft.json')}`);
  }
  
  if (fs.existsSync(serverEdgeTraceFile)) {
    fs.copyFileSync(serverEdgeTraceFile, path.join(nextTraceDir, 'server-edge.js.nft.json'));
    console.log(`Copied to: ${path.join(nextTraceDir, 'server-edge.js.nft.json')}`);
  }

  console.log('✅ Trace files setup completed successfully');
} catch (error) {
  console.error('Error setting up trace files:', error);
  process.exit(1);
}