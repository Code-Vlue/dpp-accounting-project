#!/bin/bash
# Next.js Deployment Script for S3 and CloudFront
# This script deploys a Next.js application to S3 and invalidates CloudFront cache

set -e

# Default environment if not provided
ENVIRONMENT=${1:-production}
CONFIG_FILE=${2:-"./domain-config.json"}
echo "=== DPP Accounting Platform - Next.js Deployment (Environment: $ENVIRONMENT) ==="

# Load configuration from file or environment variables
load_config() {
  local config_file=$1
  local env=$2
  
  # First, look for a domain-config file
  if [ -f "$config_file" ]; then
    echo "Loading configuration from $config_file"
    DOMAIN_NAME=$(jq -r '.domainName' "$config_file")
    DISTRIBUTION_ID=$(jq -r '.cloudfrontDistributionId // empty' "$config_file")
    MAIN_BUCKET=$(jq -r '.mainBucket // empty' "$config_file")
  else
    echo "Config file not found: $config_file"
    
    # Try to load from deployment-config.js
    if [ -f "./deployment-config.js" ]; then
      echo "Loading configuration from deployment-config.js"
      CONFIG_JSON=$(node -e "const config = require('./deployment-config.js'); console.log(JSON.stringify(config.getConfig('$env')));")
      
      DOMAIN_NAME=$(echo "$CONFIG_JSON" | jq -r '.url' | sed 's/https:\/\///;s/http:\/\///;s/\/.*//')
      MAIN_BUCKET=$(echo "$CONFIG_JSON" | jq -r '.aws.s3Bucket')
      DISTRIBUTION_ID=$(echo "$CONFIG_JSON" | jq -r '.aws.cloudfrontDistribution')
    else
      # Finally, try environment variables
      echo "Using environment variables for configuration"
      
      # Convert environment to uppercase for env var names
      ENV_UPPER=$(echo "$env" | tr '[:lower:]' '[:upper:]')
      
      # Determine which env vars to use based on environment
      if [ "$ENV_UPPER" = "PRODUCTION" ]; then
        MAIN_BUCKET=${PROD_BUCKET_NAME:-dpp-accounting-platform-prod}
        DISTRIBUTION_ID=${PROD_CLOUDFRONT_DISTRIBUTION_ID:-}
        DOMAIN_NAME=${PROD_SITE_URL:-www.dpp-accounting-platform.example.com}
      elif [ "$ENV_UPPER" = "STAGING" ]; then
        MAIN_BUCKET=${STAGING_BUCKET_NAME:-dpp-accounting-platform-staging}
        DISTRIBUTION_ID=${STAGING_CLOUDFRONT_DISTRIBUTION_ID:-}
        DOMAIN_NAME=${STAGING_SITE_URL:-staging.dpp-accounting-platform.example.com}
      else
        MAIN_BUCKET=${DEV_BUCKET_NAME:-dpp-accounting-platform-dev}
        DISTRIBUTION_ID=${DEV_CLOUDFRONT_DISTRIBUTION_ID:-}
        DOMAIN_NAME=${DEV_SITE_URL:-dev.dpp-accounting-platform.example.com}
      fi
      
      # Clean up domain name if it includes protocol
      DOMAIN_NAME=$(echo "$DOMAIN_NAME" | sed 's/https:\/\///;s/http:\/\///;s/\/.*//')
    fi
  fi
  
  # Remove any protocol from domain name
  DOMAIN_NAME=$(echo "$DOMAIN_NAME" | sed 's/https:\/\///;s/http:\/\///;s/\/.*//')
  
  # Generate timestamp
  TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
  
  echo "Domain: $DOMAIN_NAME"
  echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
  echo "Main S3 Bucket: $MAIN_BUCKET"
  echo "Environment: $ENVIRONMENT"
  echo "Started at: $TIMESTAMP"
}

# Load configuration
load_config "$CONFIG_FILE" "$ENVIRONMENT"

# Verify required values
if [ -z "$MAIN_BUCKET" ]; then
  echo "❌ Missing S3 bucket name. Please check your configuration."
  exit 1
fi

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Check for package.json
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if this is a Next.js project
if ! grep -q '"next":' package.json; then
  echo "❌ This doesn't appear to be a Next.js project. Please check package.json."
  exit 1
fi

# Function to check the Next.js output configuration
detect_nextjs_output() {
  local output_format="default"
  
  # Try to extract the output setting from next.config.js
  if [ -f "next.config.js" ]; then
    local config_output=$(node -e "try { 
      const config = require('./next.config.js'); 
      console.log((typeof config === 'object' && config.output) || 'default'); 
    } catch (e) { 
      console.log('default'); 
    }")
    
    if [ -n "$config_output" ] && [ "$config_output" != "undefined" ]; then
      output_format="$config_output"
    fi
  fi
  
  echo "$output_format"
}

# Build the Next.js application
echo "Building Next.js application for $ENVIRONMENT environment..."
NEXT_PUBLIC_ENVIRONMENT=$ENVIRONMENT npm run build

# Check build result
if [ $? -ne 0 ]; then
  echo "❌ Next.js build failed. Please check the errors above."
  exit 1
fi

# Create a deployment directory
echo "Creating deployment directory..."
DEPLOY_DIR="deployment-$(date +%s)"
mkdir -p "$DEPLOY_DIR"

# Detect Next.js output format
OUTPUT_FORMAT=$(detect_nextjs_output)
echo "Detected Next.js output format: $OUTPUT_FORMAT"

# Prepare deployment based on output format
if [ "$OUTPUT_FORMAT" = "standalone" ]; then
  echo "Using standalone output mode..."
  
  # Copy the standalone output
  if [ -d ".next/standalone" ]; then
    cp -r .next/standalone/* "$DEPLOY_DIR/"
    mkdir -p "$DEPLOY_DIR/public" "$DEPLOY_DIR/.next/static"
    cp -r public/* "$DEPLOY_DIR/public/" 2>/dev/null || true
    cp -r .next/static "$DEPLOY_DIR/.next/"
  else
    echo "❌ .next/standalone directory not found. Build may have failed."
    exit 1
  fi
  
elif [ "$OUTPUT_FORMAT" = "export" ]; then
  echo "Using export output mode..."
  
  # For static export - check if 'out' directory exists
  if [ -d "out" ]; then
    cp -r out/* "$DEPLOY_DIR/"
  else
    echo "❌ 'out' directory not found, but 'export' output mode is configured."
    echo "   You may need to run 'npx next export' first."
    exit 1
  fi
  
else
  echo "Using default (server) output mode..."
  
  # Default deployment method for App Router
  # Copy necessary files for S3 static hosting
  if [ -d ".next/static" ]; then
    mkdir -p "$DEPLOY_DIR/_next/static"
    cp -r .next/static "$DEPLOY_DIR/_next/"
  fi
  
  # Copy public assets
  if [ -d "public" ]; then
    cp -r public/* "$DEPLOY_DIR/" 2>/dev/null || true
  fi
  
  # Export HTML files if needed, this would require SSG pages
  # Note: Modern Next.js App Router typically doesn't use full static export
  if [ -d ".next/server/app" ]; then
    echo "Attempting to prepare static files from App Router output..."
    find .next/server/app -name "*.html" -exec cp --parents {} "$DEPLOY_DIR/" \;
    # Copy any static JSON files
    find .next/server/app -name "*.json" -exec cp --parents {} "$DEPLOY_DIR/" \;
  fi
fi

# Add a deployment manifest file for tracking
cat > "$DEPLOY_DIR/deployment-manifest.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "environment": "$ENVIRONMENT",
  "version": "$(node -e "try { console.log(require('./package.json').version || 'unknown'); } catch(e) { console.log('unknown'); }"))",
  "outputFormat": "$OUTPUT_FORMAT"
}
EOF

# Create a backup of the current deployment
echo "Creating backup point before deployment..."
TIMESTAMP_BACKUP=$(date +%Y%m%d%H%M%S)
aws s3 cp "s3://$MAIN_BUCKET/deployment-manifest.json" "s3://$MAIN_BUCKET/deployment-manifest.backup.$TIMESTAMP_BACKUP.json" 2>/dev/null || true

# Function for rollback in case of failure
rollback() {
  echo "\n❌ Deployment failed! Initiating rollback..."
  
  # Find the most recent backup
  LATEST_BACKUP=$(aws s3 ls "s3://$MAIN_BUCKET/" --recursive | grep 'deployment-manifest.backup' | sort | tail -n 1 | awk '{print $4}')
  
  if [ -n "$LATEST_BACKUP" ]; then
    echo "Rolling back to previous deployment: $LATEST_BACKUP"
    aws s3 cp "s3://$MAIN_BUCKET/$LATEST_BACKUP" "s3://$MAIN_BUCKET/deployment-manifest.json"
    
    echo "Rollback complete. Check the application to verify functionality."
  else
    echo "No previous deployment found for rollback!"
  fi
  
  # Clean up temporary files
  rm -rf "$DEPLOY_DIR"
  
  exit 1
}

# Setup trap for errors
trap rollback ERR

# Deploy to S3
echo "Deploying to S3 bucket: $MAIN_BUCKET..."

# Sync static assets first with long cache duration
echo "Syncing static assets with long cache duration..."
aws s3 sync "$DEPLOY_DIR/_next/static" "s3://$MAIN_BUCKET/_next/static" \
  --delete \
  --cache-control "public, max-age=31536000, immutable"

# Sync public directory with medium cache duration
echo "Syncing public directory..."
aws s3 sync "$DEPLOY_DIR" "s3://$MAIN_BUCKET" \
  --exclude "_next/static/*" \
  --exclude "*.html" \
  --exclude "deployment-manifest.json" \
  --delete \
  --cache-control "public, max-age=86400"

# Sync HTML files and other content with short cache duration
echo "Syncing HTML and other content with short cache duration..."
aws s3 sync "$DEPLOY_DIR" "s3://$MAIN_BUCKET" \
  --exclude "*" \
  --include "*.html" \
  --include "deployment-manifest.json" \
  --delete \
  --cache-control "public, max-age=3600"

# Create CloudFront invalidation if distribution is configured
if [ -n "$DISTRIBUTION_ID" ]; then
  echo "Creating CloudFront invalidation..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  
  echo "✅ Created CloudFront invalidation: $INVALIDATION_ID"
else
  echo "⚠️ No CloudFront distribution ID provided. Skipping invalidation."
fi

# Clean up
echo "Cleaning up..."
rm -rf "$DEPLOY_DIR"

# Verify deployment
echo "Verifying deployment..."
node ./scripts/verify-deployment.js "$ENVIRONMENT"

# Summary
cat << EOF

=== Next.js Deployment Summary ===
Domain: $DOMAIN_NAME
S3 Bucket: $MAIN_BUCKET
Environment: $ENVIRONMENT
Deployment Timestamp: $TIMESTAMP
EOF

if [ -n "$DISTRIBUTION_ID" ]; then
  echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
  echo "CloudFront Invalidation ID: $INVALIDATION_ID"
  echo "Note: CloudFront invalidation may take 5-10 minutes to complete."
fi

echo "
Deployment completed successfully at: $(date +"%Y-%m-%d %H:%M:%S")"

if [ -n "$DOMAIN_NAME" ]; then
  echo "
Website URLs:"
  echo "- https://$DOMAIN_NAME"
  echo "- https://www.$DOMAIN_NAME"
fi

echo "\n✅ Deployment successful!"
