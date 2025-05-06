/**
 * amplify-ssr-fix.js
 * This script helps diagnose and fix common AWS Amplify SSR deployment issues.
 * Run this script after the Next.js build but before deployment.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const rootDir = process.cwd();
const nextDir = path.resolve(rootDir, '.next');
const serverFilesPath = path.join(nextDir, 'required-server-files.json');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Log a message with color
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if a file or directory exists
 */
function checkPath(filePath, isRequired = true) {
  const exists = fs.existsSync(filePath);
  const isDirectory = exists && fs.statSync(filePath).isDirectory();
  const type = isDirectory ? 'Directory' : 'File';
  
  if (exists) {
    log(`✓ ${type} exists: ${filePath}`, 'green');
    return true;
  } else {
    const message = isRequired 
      ? `✗ ${type} MISSING (REQUIRED): ${filePath}` 
      : `! ${type} missing (optional): ${filePath}`;
    log(message, isRequired ? 'red' : 'yellow');
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    log(`Creating directory: ${dirPath}`, 'blue');
    fs.mkdirSync(dirPath, { recursive: true });
    return true;
  }
  return false;
}

/**
 * Fix AWS Amplify SSR deployment issues
 */
function fixAmplifySSR() {
  log('🔍 Diagnosing AWS Amplify SSR deployment issues...', 'blue');
  
  // Check Next.js build output
  log('\n📁 Checking Next.js build output:', 'blue');
  checkPath(nextDir, true);
  
  // Check critical directories
  const criticalDirs = [
    path.join(nextDir, 'server'),
    path.join(nextDir, 'static')
  ];
  criticalDirs.forEach(dir => checkPath(dir, true));
  
  // Check required-server-files.json
  log('\n📄 Checking required-server-files.json:', 'blue');
  const hasServerFiles = checkPath(serverFilesPath, true);
  
  if (!hasServerFiles) {
    log('🔧 Generating required-server-files.json...', 'blue');
    
    // Create template for required-server-files.json
    const requiredServerFiles = {
      config: {
        path: path.relative(nextDir, path.join(rootDir, 'next.config.js')),
        outputFileTracingRoot: rootDir
      },
      files: [
        '.',
        path.relative(nextDir, path.join(rootDir, 'package.json')),
        path.relative(nextDir, path.join(rootDir, 'next.config.js')),
        'server',
        'server/pages-manifest.json',
        'server/webpack-runtime.js',
        'prerender-manifest.json',
        'middleware-manifest.json',
      ]
    };
    
    // Write the file
    fs.writeFileSync(
      serverFilesPath,
      JSON.stringify(requiredServerFiles, null, 2)
    );
    
    log('✓ Created required-server-files.json', 'green');
  }
  
  // Check server.js
  log('\n📄 Checking server.js:', 'blue');
  const serverJsPath = path.join(rootDir, 'server.js');
  const hasServerJs = checkPath(serverJsPath, true);
  
  if (!hasServerJs) {
    log('🔧 Creating server.js...', 'blue');
    
    // Create minimal server.js
    const serverJsContent = `
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
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
  }).listen(process.env.PORT || 3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:' + (process.env.PORT || 3000));
  });
});`;
    
    // Write the file
    fs.writeFileSync(serverJsPath, serverJsContent);
    
    log('✓ Created server.js', 'green');
  }
  
  // Check next.config.js
  log('\n📄 Checking next.config.js:', 'blue');
  const nextConfigPath = path.join(rootDir, 'next.config.js');
  const hasNextConfig = checkPath(nextConfigPath, true);
  
  if (hasNextConfig) {
    // Read and check next.config.js content
    const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');
    
    if (!nextConfigContent.includes('output:')) {
      log('! next.config.js missing output configuration', 'yellow');
    } else if (!nextConfigContent.includes("output: 'standalone'")) {
      log('! next.config.js should use output: "standalone" for SSR', 'yellow');
    } else {
      log('✓ next.config.js has correct output configuration', 'green');
    }
  }
  
  // Check amplify.yml
  log('\n📄 Checking amplify.yml:', 'blue');
  const amplifyYmlPath = path.join(rootDir, 'amplify.yml');
  const hasAmplifyYml = checkPath(amplifyYmlPath, true);
  
  if (hasAmplifyYml) {
    // Read and check amplify.yml content
    const amplifyYmlContent = fs.readFileSync(amplifyYmlPath, 'utf8');
    
    if (!amplifyYmlContent.includes('post-build.js')) {
      log('! amplify.yml should include post-build.js script', 'yellow');
    } else {
      log('✓ amplify.yml includes post-build script', 'green');
    }
    
    if (!amplifyYmlContent.includes('server.js')) {
      log('! amplify.yml should include server.js in artifacts', 'yellow');
    } else {
      log('✓ amplify.yml includes server.js in artifacts', 'green');
    }
  }
  
  // Final verification
  log('\n✅ SSR configuration check complete', 'green');
  log('Fix summary:', 'blue');
  log(`1. required-server-files.json: ${hasServerFiles ? 'exists' : 'created'}`, hasServerFiles ? 'green' : 'blue');
  log(`2. server.js: ${hasServerJs ? 'exists' : 'created'}`, hasServerJs ? 'green' : 'blue');
  log('3. Ensure Amplify app is configured for "Next.js - SSR" framework', 'blue');
  log('4. Ensure all TypeScript errors are fixed or ignored during build', 'blue');
  
  return true;
}

// Run the fix function
try {
  const success = fixAmplifySSR();
  process.exit(success ? 0 : 1);
} catch (error) {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
}