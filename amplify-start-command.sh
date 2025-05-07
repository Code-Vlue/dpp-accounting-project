#!/bin/bash
# Enhanced start script for AWS Amplify with error handling and verification

echo "============================================"
echo "AWS Amplify Next.js SSR Startup Script"
echo "============================================"
echo "Environment: $NODE_ENV"
echo "Current directory: $(pwd)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Verify essential files exist before starting
echo "Verifying required files..."

# Check for required-server-files.json
if [ -f "required-server-files.json" ]; then
    echo "✅ required-server-files.json found"
else
    echo "⚠️ required-server-files.json not found, will be created by server.js"
fi

# Check for .next directory
if [ -d ".next" ]; then
    echo "✅ .next directory found"
else
    echo "❌ ERROR: .next directory missing"
    echo "Creating minimal .next structure..."
    mkdir -p .next/server
    touch .next/server/webpack-runtime.js
fi

# Check for trace directory
if [ -d "trace" ]; then
    echo "✅ trace directory found"
else
    echo "⚠️ trace directory not found, will be created by server.js"
fi

# Check for server.js
if [ -f "server.js" ]; then
    echo "✅ server.js found"
else
    echo "❌ ERROR: server.js missing"
    exit 1
fi

# Ensure proper file permissions
chmod -R +r .next 2>/dev/null || echo "Warning: Could not change permissions for .next"
chmod +x server.js 2>/dev/null || echo "Warning: Could not make server.js executable"

# Start the server with error handling
echo "============================================"
echo "Starting Next.js Server..."
echo "============================================"

# Add DEBUG environment variable for verbose logging
export DEBUG=true

# Start server with proper error handling
node server.js || {
    echo "Server startup failed with error code $?"
    echo "Attempting fallback startup..."
    # Fallback to direct Next.js start if server.js fails
    if [ -f "node_modules/next/dist/bin/next" ]; then
        echo "Starting with next start..."
        node_modules/next/dist/bin/next start -p ${PORT:-3000}
    else
        echo "Fallback failed: next command not found"
        exit 1
    fi
}