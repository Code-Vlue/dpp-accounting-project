#!/bin/bash
# CloudFront and S3 Verification Script
# This script verifies the configuration of CloudFront and S3 for the DPP Accounting Platform

set -e

# Check if domain-config.json exists
if [ ! -f "domain-config.json" ]; then
  echo "❌ domain-config.json not found. Please run setup-domain.sh and setup-cloudfront.sh first."
  exit 1
fi

# Load configuration from file
DOMAIN_NAME=$(jq -r '.domainName' domain-config.json)
DISTRIBUTION_ID=$(jq -r '.cloudfrontDistributionId // empty' domain-config.json)
MAIN_BUCKET=$(jq -r '.mainBucket // empty' domain-config.json)
WWW_BUCKET=$(jq -r '.wwwBucket // empty' domain-config.json)
LOGS_BUCKET=$(jq -r '.logsBucket // empty' domain-config.json)
REGION=$(jq -r '.region' domain-config.json)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== DPP Accounting Platform - CloudFront and S3 Verification ==="
echo "Started at: $TIMESTAMP"
echo "Domain: $DOMAIN_NAME"
echo "CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "Main S3 Bucket: $MAIN_BUCKET"
echo "WWW S3 Bucket: $WWW_BUCKET"
echo "Logs S3 Bucket: $LOGS_BUCKET"
echo "Region: $REGION"

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Verify CloudFront distribution
echo "Verifying CloudFront distribution..."
if [ -z "$DISTRIBUTION_ID" ]; then
  echo "❌ CloudFront distribution ID not found in domain-config.json."
  echo "   Please run setup-cloudfront.sh first."
  exit 1
fi

DISTRIBUTION_INFO=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" 2>/dev/null || echo "")

if [ -z "$DISTRIBUTION_INFO" ]; then
  echo "❌ CloudFront distribution $DISTRIBUTION_ID not found."
  exit 1
fi

DISTRIBUTION_STATUS=$(echo "$DISTRIBUTION_INFO" | jq -r '.Distribution.Status')
DISTRIBUTION_DOMAIN=$(echo "$DISTRIBUTION_INFO" | jq -r '.Distribution.DomainName')
DISTRIBUTION_ENABLED=$(echo "$DISTRIBUTION_INFO" | jq -r '.Distribution.DistributionConfig.Enabled')

echo "✅ CloudFront distribution verified: $DISTRIBUTION_ID"
echo "   Status: $DISTRIBUTION_STATUS"
echo "   Domain: $DISTRIBUTION_DOMAIN"
echo "   Enabled: $DISTRIBUTION_ENABLED"

# Verify S3 buckets
echo "Verifying S3 buckets..."

# Main bucket
if [ -z "$MAIN_BUCKET" ]; then
  echo "❌ Main S3 bucket name not found in domain-config.json."
  echo "   Please run setup-cloudfront.sh first."
  exit 1
fi

MAIN_BUCKET_EXISTS=$(aws s3api head-bucket --bucket "$MAIN_BUCKET" 2>/dev/null && echo "true" || echo "false")
if [ "$MAIN_BUCKET_EXISTS" = "false" ]; then
  echo "❌ Main S3 bucket $MAIN_BUCKET not found."
  exit 1
fi

MAIN_BUCKET_WEBSITE=$(aws s3api get-bucket-website --bucket "$MAIN_BUCKET" 2>/dev/null || echo "")
MAIN_BUCKET_POLICY=$(aws s3api get-bucket-policy --bucket "$MAIN_BUCKET" 2>/dev/null || echo "")

echo "✅ Main S3 bucket verified: $MAIN_BUCKET"
echo "   Website configuration: $([ -n "$MAIN_BUCKET_WEBSITE" ] && echo "✓ Enabled" || echo "✗ Not configured")"
echo "   Bucket policy: $([ -n "$MAIN_BUCKET_POLICY" ] && echo "✓ Set" || echo "✗ Not set")"

# WWW bucket
if [ -z "$WWW_BUCKET" ]; then
  echo "❌ WWW S3 bucket name not found in domain-config.json."
  echo "   Please run setup-cloudfront.sh first."
  exit 1
fi

WWW_BUCKET_EXISTS=$(aws s3api head-bucket --bucket "$WWW_BUCKET" 2>/dev/null && echo "true" || echo "false")
if [ "$WWW_BUCKET_EXISTS" = "false" ]; then
  echo "❌ WWW S3 bucket $WWW_BUCKET not found."
  exit 1
fi

WWW_BUCKET_WEBSITE=$(aws s3api get-bucket-website --bucket "$WWW_BUCKET" 2>/dev/null || echo "")

echo "✅ WWW S3 bucket verified: $WWW_BUCKET"
echo "   Website configuration: $([ -n "$WWW_BUCKET_WEBSITE" ] && echo "✓ Enabled" || echo "✗ Not configured")"

# Logs bucket
if [ -z "$LOGS_BUCKET" ]; then
  echo "❌ Logs S3 bucket name not found in domain-config.json."
  echo "   Please run setup-cloudfront.sh first."
  exit 1
fi

LOGS_BUCKET_EXISTS=$(aws s3api head-bucket --bucket "$LOGS_BUCKET" 2>/dev/null && echo "true" || echo "false")
if [ "$LOGS_BUCKET_EXISTS" = "false" ]; then
  echo "❌ Logs S3 bucket $LOGS_BUCKET not found."
  exit 1
fi

LOGS_BUCKET_LOGGING=$(aws s3api get-bucket-logging --bucket "$LOGS_BUCKET" 2>/dev/null || echo "")

echo "✅ Logs S3 bucket verified: $LOGS_BUCKET"
echo "   Logging configuration: $([ -n "$LOGS_BUCKET_LOGGING" ] && echo "✓ Enabled" || echo "✗ Not configured")"

# Verify website content
echo "Verifying website content..."
INDEX_CONTENT=$(aws s3 cp "s3://$MAIN_BUCKET/index.html" - 2>/dev/null || echo "")
ERROR_CONTENT=$(aws s3 cp "s3://$MAIN_BUCKET/error.html" - 2>/dev/null || echo "")

echo "   Index page: $([ -n "$INDEX_CONTENT" ] && echo "✓ Found" || echo "✗ Not found")"
echo "   Error page: $([ -n "$ERROR_CONTENT" ] && echo "✓ Found" || echo "✗ Not found")"

# Verify domain accessibility (optional)
echo "Checking domain accessibility..."
echo "Note: DNS propagation may take time, so this check may initially fail."

DOMAIN_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME" 2>/dev/null || echo "000")
WWW_ACCESS=$(curl -s -o /dev/null -w "%{http_code}" "https://www.$DOMAIN_NAME" 2>/dev/null || echo "000")

echo "   $DOMAIN_NAME status: $([ "$DOMAIN_ACCESS" = "200" ] && echo "✓ Accessible (HTTP 200)" || echo "✗ Not accessible (HTTP $DOMAIN_ACCESS)")"
echo "   www.$DOMAIN_NAME status: $([ "$WWW_ACCESS" = "200" ] && echo "✓ Accessible (HTTP 200)" || echo "✗ Not accessible (HTTP $WWW_ACCESS)")"

# Summary
cat << EOF

=== CloudFront and S3 Verification Summary ===
Domain: $DOMAIN_NAME
CloudFront Distribution ID: $DISTRIBUTION_ID - $([ -n "$DISTRIBUTION_INFO" ] && echo "✅ Verified" || echo "❌ Not Found")
CloudFront Status: $DISTRIBUTION_STATUS

S3 Buckets:
- Main Bucket: $MAIN_BUCKET - $([ "$MAIN_BUCKET_EXISTS" = "true" ] && echo "✅ Verified" || echo "❌ Not Found")
- WWW Bucket: $WWW_BUCKET - $([ "$WWW_BUCKET_EXISTS" = "true" ] && echo "✅ Verified" || echo "❌ Not Found")
- Logs Bucket: $LOGS_BUCKET - $([ "$LOGS_BUCKET_EXISTS" = "true" ] && echo "✅ Verified" || echo "❌ Not Found")

Website Content:
- Index Page: $([ -n "$INDEX_CONTENT" ] && echo "✅ Found" || echo "❌ Not Found")
- Error Page: $([ -n "$ERROR_CONTENT" ] && echo "✅ Found" || echo "❌ Not Found")

Domain Accessibility:
- $DOMAIN_NAME: $([ "$DOMAIN_ACCESS" = "200" ] && echo "✅ Accessible" || echo "⚠️ Not Yet Accessible")
- www.$DOMAIN_NAME: $([ "$WWW_ACCESS" = "200" ] && echo "✅ Accessible" || echo "⚠️ Not Yet Accessible")

Verification completed at: $(date +"%Y-%m-%d %H:%M:%S")
EOF

# Check if all critical components are verified
if [ -n "$DISTRIBUTION_INFO" ] && [ "$MAIN_BUCKET_EXISTS" = "true" ] && [ "$WWW_BUCKET_EXISTS" = "true" ] && [ "$LOGS_BUCKET_EXISTS" = "true" ] && [ -n "$INDEX_CONTENT" ] && [ -n "$ERROR_CONTENT" ]; then
  echo "✅ CloudFront and S3 configuration is complete and verified."
  
  if [ "$DOMAIN_ACCESS" = "200" ] && [ "$WWW_ACCESS" = "200" ]; then
    echo "✅ Domains are accessible."
    exit 0
  else
    echo "⚠️ Infrastructure is set up correctly, but domains are not accessible yet."
    echo "   This is normal if DNS changes are still propagating. Please try again later."
    exit 2
  fi
else
  echo "❌ CloudFront and S3 configuration is incomplete or has issues that need to be addressed."
  exit 1
fi