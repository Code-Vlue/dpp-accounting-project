#!/bin/bash
# /workspace/DPP-Project/scripts/deploy-to-aws.sh

# Usage: ./deploy-to-aws.sh [environment] [config_file]
# Example: ./deploy-to-aws.sh production ./prod-config.json

set -e

# Set default environment if not provided
ENVIRONMENT=${1:-development}
CONFIG_FILE=${2:-""}
ENV_FILE=".env.${ENVIRONMENT}"
echo "Deploying to $ENVIRONMENT environment"

# Configuration loading priority:
# 1. Environment variables already set
# 2. Config file specified as second arg
# 3. Environment-specific .env file
# 4. Default values from deployment-config.js

# Function to load a configuration value
get_config_value() {
  local var_name=$1
  local default_value=$2
  local env_var_value

  # Check if the variable is already defined in environment
  env_var_value=${!var_name}
  if [ -n "$env_var_value" ]; then
    echo "$env_var_value"
    return
  fi

  # Try to get from config file if it exists
  if [ -n "$CONFIG_FILE" ] && [ -f "$CONFIG_FILE" ]; then
    config_value=$(jq -r ".$var_name // \"\"" "$CONFIG_FILE" 2>/dev/null)
    if [ -n "$config_value" ] && [ "$config_value" != "null" ]; then
      echo "$config_value"
      return
    fi
  fi

  # Try to get from environment-specific .env file
  if [ -f "$ENV_FILE" ]; then
    env_file_value=$(grep "^$var_name=" "$ENV_FILE" | cut -d= -f2-)
    if [ -n "$env_file_value" ]; then
      echo "$env_file_value"
      return
    fi
  fi

  # Return default value from deployment-config.js
  echo "$default_value"
}

# Load values from deployment-config.js
if [ -f "./deployment-config.js" ]; then
  echo "Loading defaults from deployment-config.js"
  NODE_CONFIG=$(node -e "const config = require('./deployment-config.js'); console.log(JSON.stringify(config.getConfig('$ENVIRONMENT')));")
  
  # Extract default values
  DEFAULT_BUCKET_NAME=$(echo "$NODE_CONFIG" | jq -r '.aws.s3Bucket')
  DEFAULT_CLOUDFRONT_DISTRIBUTION_ID=$(echo "$NODE_CONFIG" | jq -r '.aws.cloudfrontDistribution')
  DEFAULT_SITE_URL=$(echo "$NODE_CONFIG" | jq -r '.url')
else
  # Fallback defaults based on environment
  if [ "$ENVIRONMENT" = "production" ]; then
    DEFAULT_BUCKET_NAME="dpp-accounting-platform-prod"
    DEFAULT_CLOUDFRONT_DISTRIBUTION_ID=""
    DEFAULT_SITE_URL="https://www.dpp-accounting-platform.example.com"
  elif [ "$ENVIRONMENT" = "staging" ]; then
    DEFAULT_BUCKET_NAME="dpp-accounting-platform-staging"
    DEFAULT_CLOUDFRONT_DISTRIBUTION_ID=""
    DEFAULT_SITE_URL="https://staging.dpp-accounting-platform.example.com"
  else
    DEFAULT_BUCKET_NAME="dpp-accounting-platform-dev"
    DEFAULT_CLOUDFRONT_DISTRIBUTION_ID=""
    DEFAULT_SITE_URL="https://dev.dpp-accounting-platform.example.com"
  fi
  echo "No deployment-config.js found, using default values"
fi

# Get configuration values with fallbacks
BUCKET_NAME=$(get_config_value "BUCKET_NAME" "$DEFAULT_BUCKET_NAME")
CLOUDFRONT_DISTRIBUTION_ID=$(get_config_value "CLOUDFRONT_DISTRIBUTION_ID" "$DEFAULT_CLOUDFRONT_DISTRIBUTION_ID")
SITE_URL=$(get_config_value "SITE_URL" "$DEFAULT_SITE_URL")

echo "Using AWS S3 bucket: $BUCKET_NAME"
echo "Using CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "Site URL: $SITE_URL"

# Check if required variables are set
if [ -z "$BUCKET_NAME" ]; then
  echo "Error: Bucket name not set for $ENVIRONMENT environment"
  exit 1
fi

# Detect Next.js output configuration
OUTPUT_FORMAT=$(node -e "try { 
  const config = require('./next.config.js'); 
  console.log((typeof config === 'object' && config.output) || 'default'); 
} catch (e) { 
  console.log('default'); 
}")

echo "Detected Next.js output format: $OUTPUT_FORMAT"

# Build the application with environment variables
echo "Building the application..."
NEXT_PUBLIC_ENVIRONMENT=$ENVIRONMENT \
NEXT_PUBLIC_SITE_URL=$SITE_URL \
npm run build

# Verify the build was successful
if [ $? -ne 0 ]; then
  echo "Error: Build failed"
  exit 1
fi

# Create a backup of the current deployment
echo "Creating backup point before deployment..."
TIMESTAMP=$(date +%Y%m%d%H%M%S)
aws s3 cp "s3://$BUCKET_NAME/deployment-manifest.json" "s3://$BUCKET_NAME/deployment-manifest.backup.$TIMESTAMP.json" 2>/dev/null || true

# Function for rollback in case of failure
rollback() {
  echo "\n❌ Deployment failed! Initiating rollback..."
  
  # Find the most recent backup
  LATEST_BACKUP=$(aws s3 ls "s3://$BUCKET_NAME/" --recursive | grep 'deployment-manifest.backup' | sort | tail -n 1 | awk '{print $4}')
  
  if [ -n "$LATEST_BACKUP" ]; then
    echo "Rolling back to previous deployment: $LATEST_BACKUP"
    aws s3 cp "s3://$BUCKET_NAME/$LATEST_BACKUP" "s3://$BUCKET_NAME/deployment-manifest.json"
    echo "Rollback complete. Check the application to verify functionality."
  else
    echo "No previous deployment found for rollback!"
  fi
  
  exit 1
}

# Set up trap for errors
trap rollback ERR

# Deploy based on the output format
if [ "$OUTPUT_FORMAT" = "standalone" ]; then
  echo "Deploying standalone build to S3..."
  
  # For standalone output (Server components with minimal Node.js server)
  aws s3 sync .next/static "s3://$BUCKET_NAME/_next/static/" --delete
  aws s3 sync public "s3://$BUCKET_NAME/" \
    --exclude "_next/*" \
    --delete
  
  # Create deployment manifest
  echo "{\"environment\":\"$ENVIRONMENT\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"version\":\"$(node -e "try { console.log(require('./package.json').version || 'unknown'); } catch(e) { console.log('unknown'); }")\",\"outputFormat\":\"standalone\"}" > deployment-manifest.json
  aws s3 cp deployment-manifest.json "s3://$BUCKET_NAME/deployment-manifest.json"
  
  echo "Note: Standalone output requires additional deployment steps for the Node.js server."
  echo "This script has deployed the static assets, but you'll need to deploy the server separately."
  
elif [ "$OUTPUT_FORMAT" = "export" ]; then
  echo "Deploying static export to S3..."
  
  # Check if out directory exists
  if [ ! -d "out" ]; then
    echo "'out' directory not found. Running 'npx next export'..."
    npx next export
  fi
  
  # For static export (fully static site)
  aws s3 sync out "s3://$BUCKET_NAME/" --delete
  
  # Create deployment manifest
  echo "{\"environment\":\"$ENVIRONMENT\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"version\":\"$(node -e "try { console.log(require('./package.json').version || 'unknown'); } catch(e) { console.log('unknown'); }")\",\"outputFormat\":\"export\"}" > deployment-manifest.json
  aws s3 cp deployment-manifest.json "s3://$BUCKET_NAME/deployment-manifest.json"
  
else
  echo "Deploying standard build to S3..."
  
  # For default output (mixture of static and server-rendered content)
  # Deploy static assets
  aws s3 sync .next/static "s3://$BUCKET_NAME/_next/static/" --delete
  aws s3 sync public "s3://$BUCKET_NAME/" \
    --exclude "_next/*" \
    --delete
  
  # Create deployment manifest
  echo "{\"environment\":\"$ENVIRONMENT\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",\"version\":\"$(node -e "try { console.log(require('./package.json').version || 'unknown'); } catch(e) { console.log('unknown'); }")\",\"outputFormat\":\"default\"}" > deployment-manifest.json
  aws s3 cp deployment-manifest.json "s3://$BUCKET_NAME/deployment-manifest.json"
  
  echo "Note: Default output requires additional deployment steps for the server-rendered content."
  echo "This script has deployed the static assets, but you'll need to deploy the server separately."
fi

# If CloudFront distribution is configured, invalidate the cache
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)
  echo "✅ Created CloudFront invalidation: $INVALIDATION_ID"
fi

# Log deployment details
echo "Deployment complete!"
echo "Verifying deployment..."

if [ -f "./scripts/verify-deployment.js" ]; then
  node ./scripts/verify-deployment.js "$ENVIRONMENT"
  
  if [ $? -eq 0 ]; then
    echo "✅ Deployment verification successful"
    echo "Website URL: $SITE_URL"
  else
    echo "❌ Deployment verification failed, please check the logs"
    exit 1
  fi
else 
  echo "Verification script not found. Assuming deployment is successful."
  echo "Website URL: $SITE_URL"
fi
