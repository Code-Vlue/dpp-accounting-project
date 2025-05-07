/**
 * fix-required-server-files.js
 * This script fixes the issue with required-server-files.json location in AWS Amplify.
 * It copies the file from .next/ to the root directory.
 */
const fs = require('fs');
const path = require('path');

console.log('Fixing required-server-files.json location for AWS Amplify...');

// Define paths
const nextDir = path.resolve(process.cwd(), '.next');
const requiredServerFilesPath = path.join(nextDir, 'required-server-files.json');
const rootRequiredServerFilesPath = path.resolve(process.cwd(), 'required-server-files.json');

try {
  // Check if required-server-files.json exists in .next directory
  if (fs.existsSync(requiredServerFilesPath)) {
    // Read the file
    const fileContent = fs.readFileSync(requiredServerFilesPath, 'utf8');
    
    // Write to root directory
    fs.writeFileSync(rootRequiredServerFilesPath, fileContent);
    
    console.log(`Successfully copied required-server-files.json to ${rootRequiredServerFilesPath}`);
    console.log('Content:');
    console.log(fileContent);
  } else if (fs.existsSync(rootRequiredServerFilesPath)) {
    console.log(`required-server-files.json already exists at ${rootRequiredServerFilesPath}`);
    console.log('Content:');
    console.log(fs.readFileSync(rootRequiredServerFilesPath, 'utf8'));
  } else {
    // Create a basic file if none exists
    const basicContent = {
      config: {
        path: "../next.config.js",
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
        "../package.json",
        "../next.config.js"
      ]
    };
    
    fs.writeFileSync(rootRequiredServerFilesPath, JSON.stringify(basicContent, null, 2));
    console.log(`Created new required-server-files.json at ${rootRequiredServerFilesPath}`);
  }
  
  // Verify the file exists
  if (fs.existsSync(rootRequiredServerFilesPath)) {
    console.log('✅ required-server-files.json exists in the root directory');
  } else {
    console.error('❌ Failed to create or verify required-server-files.json');
    process.exit(1);
  }
} catch (error) {
  console.error('Error fixing required-server-files.json:', error);
  process.exit(1);
}

console.log('Fix completed successfully');