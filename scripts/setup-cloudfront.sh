#!/bin/bash
# CloudFront and S3 Bucket Setup Script
# This script sets up S3 buckets and CloudFront distribution for the DPP Accounting Platform

set -e

# Check if domain-config.json exists
if [ ! -f "domain-config.json" ]; then
  echo "❌ domain-config.json not found. Please run setup-domain.sh first."
  exit 1
fi

# Load configuration from file
DOMAIN_NAME=$(jq -r '.domainName' domain-config.json)
CERTIFICATE_ARN=$(jq -r '.certificateArn' domain-config.json)
REGION=$(jq -r '.region' domain-config.json)
HOSTED_ZONE_ID=$(jq -r '.hostedZoneId' domain-config.json)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Define bucket names
MAIN_BUCKET_NAME="$DOMAIN_NAME"
WWW_BUCKET_NAME="www.$DOMAIN_NAME"
LOGS_BUCKET_NAME="logs.$DOMAIN_NAME"

echo "=== DPP Accounting Platform - CloudFront and S3 Setup ==="
echo "Started at: $TIMESTAMP"
echo "Domain: $DOMAIN_NAME"
echo "Certificate ARN: $CERTIFICATE_ARN"
echo "Region: $REGION"
echo "Main Bucket: $MAIN_BUCKET_NAME"
echo "WWW Bucket: $WWW_BUCKET_NAME"
echo "Logs Bucket: $LOGS_BUCKET_NAME"

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Verify certificate is issued
echo "Verifying certificate status..."
CERT_STATUS=$(aws acm describe-certificate --certificate-arn "$CERTIFICATE_ARN" --region "$REGION" --query 'Certificate.Status' --output text)

if [ "$CERT_STATUS" != "ISSUED" ]; then
  echo "❌ Certificate is not issued. Current status: $CERT_STATUS"
  echo "Please wait for the certificate to be validated before continuing."
  exit 1
fi
echo "✅ Certificate is validated and issued"

# Step 1: Create S3 buckets
echo "Creating S3 buckets..."

# Create logs bucket
echo "Creating logs bucket: $LOGS_BUCKET_NAME"
if aws s3api head-bucket --bucket "$LOGS_BUCKET_NAME" 2>/dev/null; then
  echo "✅ Logs bucket already exists: $LOGS_BUCKET_NAME"
else
  aws s3 mb "s3://$LOGS_BUCKET_NAME" --region "$REGION"
  
  # Set bucket policy for logs
  aws s3api put-bucket-policy --bucket "$LOGS_BUCKET_NAME" --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "logging.s3.amazonaws.com"
        },
        "Action": "s3:PutObject",
        "Resource": "arn:aws:s3:::'$LOGS_BUCKET_NAME'/*"
      }
    ]
  }'
  
  # Enable bucket logging
  aws s3api put-bucket-logging --bucket "$LOGS_BUCKET_NAME" --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "'$LOGS_BUCKET_NAME'",
      "TargetPrefix": "logs/"
    }
  }'
  
  echo "✅ Created logs bucket: $LOGS_BUCKET_NAME"
fi

# Create main bucket
echo "Creating main bucket: $MAIN_BUCKET_NAME"
if aws s3api head-bucket --bucket "$MAIN_BUCKET_NAME" 2>/dev/null; then
  echo "✅ Main bucket already exists: $MAIN_BUCKET_NAME"
else
  aws s3 mb "s3://$MAIN_BUCKET_NAME" --region "$REGION"
  
  # Configure static website hosting
  aws s3 website "s3://$MAIN_BUCKET_NAME" --index-document index.html --error-document error.html
  
  # Enable bucket logging
  aws s3api put-bucket-logging --bucket "$MAIN_BUCKET_NAME" --bucket-logging-status '{
    "LoggingEnabled": {
      "TargetBucket": "'$LOGS_BUCKET_NAME'",
      "TargetPrefix": "'$MAIN_BUCKET_NAME'/"
    }
  }'
  
  echo "✅ Created main bucket: $MAIN_BUCKET_NAME"
fi

# Create www bucket (for redirection)
echo "Creating www bucket: $WWW_BUCKET_NAME"
if aws s3api head-bucket --bucket "$WWW_BUCKET_NAME" 2>/dev/null; then
  echo "✅ WWW bucket already exists: $WWW_BUCKET_NAME"
else
  aws s3 mb "s3://$WWW_BUCKET_NAME" --region "$REGION"
  
  # Configure website redirect
  aws s3 website "s3://$WWW_BUCKET_NAME" --redirect-all-requests-to "https://$MAIN_BUCKET_NAME"
  
  echo "✅ Created www bucket with redirection: $WWW_BUCKET_NAME -> $MAIN_BUCKET_NAME"
fi

# Step 2: Create CloudFront Origin Access Identity
echo "Creating CloudFront Origin Access Identity..."
OAI_ID=$(aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config CallerReference="dpp-accounting-platform-$(date +%s)",Comment="OAI for $DOMAIN_NAME" \
  --query 'CloudFrontOriginAccessIdentity.Id' \
  --output text)

echo "✅ Created Origin Access Identity: $OAI_ID"

# Step 3: Update bucket policy to allow CloudFront access
echo "Updating main bucket policy to allow CloudFront access..."
aws s3api put-bucket-policy --bucket "$MAIN_BUCKET_NAME" --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity '$OAI_ID'"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$MAIN_BUCKET_NAME'/*"
    }
  ]
}'

echo "✅ Updated bucket policy for CloudFront access"

# Step 4: Create CloudFront distribution
echo "Creating CloudFront distribution..."

# Create a JSON configuration file for the distribution
cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "dpp-accounting-platform-$(date +%s)",
  "Aliases": {
    "Quantity": 2,
    "Items": ["$DOMAIN_NAME", "www.$DOMAIN_NAME"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-$MAIN_BUCKET_NAME",
        "DomainName": "$MAIN_BUCKET_NAME.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/$OAI_ID"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-$MAIN_BUCKET_NAME",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/error.html",
        "ResponseCode": "404",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "$CERTIFICATE_ARN",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "Enabled": true,
  "PriceClass": "PriceClass_100",
  "Logging": {
    "Enabled": true,
    "IncludeCookies": false,
    "Bucket": "$LOGS_BUCKET_NAME.s3.amazonaws.com",
    "Prefix": "cloudfront/"
  }
}
EOF

DISTRIBUTION_ID=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json --query 'Distribution.Id' --output text)
DISTRIBUTION_DOMAIN=$(aws cloudfront describe-distribution --id "$DISTRIBUTION_ID" --query 'Distribution.DomainName' --output text)

echo "✅ Created CloudFront distribution: $DISTRIBUTION_ID"
echo "  Domain: $DISTRIBUTION_DOMAIN"

# Step 5: Update Route 53 records to point to CloudFront
echo "Updating Route 53 records to point to CloudFront..."

cat > /tmp/route53-records.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN_NAME",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$DISTRIBUTION_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.$DOMAIN_NAME",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$DISTRIBUTION_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/route53-records.json

echo "✅ Updated Route 53 records to point to CloudFront"

# Step 6: Upload placeholder content
echo "Uploading placeholder content to S3..."

# Create a simple index.html file
cat > /tmp/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DPP Accounting Platform</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #001A49;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #003087;
      margin-bottom: 20px;
    }
    .banner {
      background-color: #0055B8;
      color: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .button {
      display: inline-block;
      background-color: #00843D;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
    .button:hover {
      background-color: #006B31;
    }
  </style>
</head>
<body>
  <div class="banner">
    <h1>DPP Accounting Platform</h1>
    <p>Comprehensive financial management system for the Denver Preschool Program</p>
  </div>
  <p>The website is currently under construction.</p>
  <p>Our platform will help streamline financial processes, manage tuition credits, and provide robust financial reporting.</p>
  <a href="#" class="button">Learn More</a>
</body>
</html>
EOF

# Create an error page
cat > /tmp/error.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found - DPP Accounting Platform</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #001A49;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #003087;
      margin-bottom: 20px;
    }
    .error-container {
      background-color: #f8f9fa;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      border: 1px solid #ddd;
    }
    .button {
      display: inline-block;
      background-color: #00843D;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
    .button:hover {
      background-color: #006B31;
    }
  </style>
</head>
<body>
  <div class="error-container">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
  </div>
  <a href="/" class="button">Go to Homepage</a>
</body>
</html>
EOF

# Upload files to S3
aws s3 cp /tmp/index.html "s3://$MAIN_BUCKET_NAME/index.html" --content-type "text/html"
aws s3 cp /tmp/error.html "s3://$MAIN_BUCKET_NAME/error.html" --content-type "text/html"

echo "✅ Uploaded placeholder content to S3"

# Step 7: Create CloudFront invalidation to apply changes
echo "Creating CloudFront invalidation to apply changes..."
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --query 'Invalidation.Id' --output text)

echo "✅ Created CloudFront invalidation: $INVALIDATION_ID"

# Save CloudFront configuration to file
cat >> domain-config.json << EOF
{
  "domainName": "$DOMAIN_NAME",
  "hostedZoneId": "$HOSTED_ZONE_ID",
  "certificateArn": "$CERTIFICATE_ARN",
  "region": "$REGION",
  "nameServers": $(jq '.nameServers' domain-config.json),
  "configuredAt": "$(date +"%Y-%m-%d %H:%M:%S")",
  "cloudfrontDistributionId": "$DISTRIBUTION_ID",
  "cloudfrontDomain": "$DISTRIBUTION_DOMAIN",
  "mainBucket": "$MAIN_BUCKET_NAME",
  "wwwBucket": "$WWW_BUCKET_NAME",
  "logsBucket": "$LOGS_BUCKET_NAME",
  "originAccessIdentity": "$OAI_ID"
}
EOF

# Summary
cat << EOF

=== CloudFront and S3 Setup Summary ===
Domain: $DOMAIN_NAME
CloudFront Distribution ID: $DISTRIBUTION_ID
CloudFront Domain: $DISTRIBUTION_DOMAIN
Main S3 Bucket: $MAIN_BUCKET_NAME
WWW S3 Bucket: $WWW_BUCKET_NAME
Logs S3 Bucket: $LOGS_BUCKET_NAME
Origin Access Identity: $OAI_ID

Configuration:
- S3 buckets created and configured
- CloudFront distribution created with SSL certificate
- Route 53 records updated to point to CloudFront
- Placeholder content uploaded to S3
- CloudFront invalidation created to apply changes

Next Steps:
1. It may take up to 30 minutes for the CloudFront distribution to deploy globally
2. Verify the website is accessible at https://$DOMAIN_NAME and https://www.$DOMAIN_NAME
3. Deploy your Next.js application to the S3 bucket

Script completed at: $(date +"%Y-%m-%d %H:%M:%S")
EOF