#\!/bin/bash
echo "Verifying AWS access..."

# Check caller identity
echo "Checking AWS identity..."
aws sts get-caller-identity

# Check S3 access
echo "Checking S3 access..."
aws s3 ls

# Check Route53 access
echo "Checking Route53 access..."
aws route53 list-hosted-zones

echo "AWS access verification complete."
