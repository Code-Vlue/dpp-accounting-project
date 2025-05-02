# AWS Environment Verification Guide

This guide explains how to verify AWS environment configurations for the DPP Accounting Platform before and after deployment.

## Prerequisites

Before running verification steps, ensure you have:

1. AWS CLI installed and configured
2. Proper AWS credentials with permissions to access relevant services
3. JQ installed for JSON processing (used in various scripts)

## AWS Credential Verification

Start by verifying your AWS credentials are properly configured:

```bash
# Verify AWS CLI can access your account
./verify_aws_access.sh
```

This will check your ability to:
- Get your AWS account identity
- List S3, Route 53, and other necessary resources
- Verify permissions for required actions

## Deployment Readiness Verification

Before attempting deployment, verify your AWS environment is properly configured:

```bash
# Check deployment readiness
./verify_aws_deployment_readiness.sh
```

This script checks:
- AWS account access
- Required service permissions
- Ability to create and manage necessary resources

If any checks fail, review the error messages and ensure proper permissions are granted.

## Domain and DNS Verification

After setting up your domain, verify DNS configuration:

```bash
# Verify domain configuration
./scripts/verify-domain.sh
```

This script verifies:
- Route 53 hosted zone existence and configuration
- ACM certificate status and validation
- DNS record presence and configuration

### Expected Output

Successful verification will produce output similar to:

```
=== Domain Configuration Verification ===
Domain: example.com
Hosted Zone ID: Z0123456789ABCDEFGHIJ

✅ Route 53 hosted zone exists
✅ ACM certificate exists
✅ ACM certificate status: ISSUED
✅ ACM certificate covers domain and www subdomain
✅ DNS validation records exist
✅ DNS records for apex domain exist
✅ DNS records for www subdomain exist

Domain configuration verified successfully!
```

## CloudFront and S3 Verification

After setting up CloudFront and S3, verify the configuration:

```bash
# Verify CloudFront and S3 configuration
./scripts/verify-cloudfront.sh
```

This script verifies:
- S3 buckets (main, www, logs) existence and configuration
- CloudFront distribution existence and status
- Origin access identity configuration
- DNS records pointing to CloudFront
- Website content accessibility

### Expected Output

Successful verification will produce output similar to:

```
=== CloudFront and S3 Verification ===
Domain: example.com
CloudFront Distribution ID: EXXXXXXXXXXXXX

✅ Main S3 bucket exists: example.com
✅ WWW S3 bucket exists: www.example.com
✅ Logs S3 bucket exists: logs.example.com
✅ CloudFront distribution exists and is enabled
✅ CloudFront distribution is deployed
✅ Origin access identity is configured
✅ Route 53 records point to CloudFront
✅ Website content is accessible

CloudFront and S3 configuration verified successfully!
```

## Deployment Verification

After deploying the application, verify it's working correctly:

```bash
# Verify deployment
./scripts/verify-deployment.js https://example.com
```

This script checks:
- Website accessibility
- SSL/TLS configuration
- Page load performance
- Authentication endpoints
- Critical application features

### Expected Output

Successful verification will produce output similar to:

```
=== Deployment Verification ===
URL: https://example.com
Timestamp: 2025-04-29 16:30:00

✅ Website is accessible
✅ SSL certificate is valid
✅ HTML contains expected content
✅ JavaScript loads successfully
✅ CSS loads successfully
✅ Authentication endpoints respond correctly
✅ API endpoints are accessible
✅ Page load time: 1.25s

Deployment verified successfully!
```

## AWS Resources Verification Matrix

Use this matrix to verify all required AWS resources:

| Resource Type | Verification Command | Success Criteria |
|---------------|----------------------|------------------|
| Route 53 Hosted Zone | `aws route 53 get-hosted-zone --id [ID]` | Status code 200 |
| ACM Certificate | `aws acm describe-certificate --certificate-arn [ARN]` | Status "ISSUED" |
| S3 Buckets | `aws s3api head-bucket --bucket [BUCKET]` | Status code 200 |
| CloudFront Distribution | `aws cloudfront get-distribution --id [ID]` | Status "Deployed" |
| Cognito User Pool | `aws cognito-idp describe-user-pool --user-pool-id [ID]` | Status code 200 |
| IAM Roles | `aws iam get-role --role-name [NAME]` | Role exists |

## Common Verification Issues and Solutions

### Route 53 Issues

**Problem**: Hosted zone not found or DNS records missing
**Solution**:
- Check domain registration status
- Verify nameservers are correctly set at registrar
- Run setup-domain.sh again to create missing records

### ACM Issues

**Problem**: Certificate not issued or pending validation
**Solution**:
- Verify DNS validation records exist
- Wait for DNS propagation (can take up to 48 hours)
- Check for CNAME record conflicts

### S3 Issues

**Problem**: Cannot access S3 buckets
**Solution**:
- Check bucket policy for proper permissions
- Verify bucket naming follows conventions
- Check for conflicting bucket names (globally unique)

### CloudFront Issues

**Problem**: Distribution not deployed or inaccessible
**Solution**:
- Wait for deployment to complete (can take up to 30 minutes)
- Check origin access identity configuration
- Verify SSL certificate is properly attached

### Cognito Issues

**Problem**: Unable to authenticate or create users
**Solution**:
- Verify user pool and client IDs are correct
- Check app client settings for callback URLs
- Ensure correct OAuth flows are enabled

## Comprehensive AWS Resource Audit

For a comprehensive audit of all AWS resources used by the application:

```bash
# Create audit report
cat > audit-aws-resources.sh << 'EOF'
#!/bin/bash
echo "=== AWS Resources Audit ==="
echo "Timestamp: $(date)"

echo -e "\n=== Account Information ==="
aws sts get-caller-identity

echo -e "\n=== S3 Buckets ==="
aws s3api list-buckets --query 'Buckets[?starts_with(Name, `'"$1"'`) == `true`].Name'

echo -e "\n=== CloudFront Distributions ==="
aws cloudfront list-distributions --query 'DistributionList.Items[*].{Id:Id, Domain:DomainName, Origin:Origins.Items[0].DomainName, Enabled:Enabled}'

echo -e "\n=== Route 53 Hosted Zones ==="
aws route53 list-hosted-zones

echo -e "\n=== ACM Certificates ==="
aws acm list-certificates

echo -e "\n=== Cognito User Pools ==="
aws cognito-idp list-user-pools --max-results 20

echo -e "\n=== IAM Roles ==="
aws iam list-roles --query 'Roles[?starts_with(RoleName, `'"$1"'`) == `true`].RoleName'

echo -e "\n=== Audit Complete ==="
EOF

chmod +x audit-aws-resources.sh
./audit-aws-resources.sh "dpp-accounting"
```

This script creates a comprehensive audit of all AWS resources associated with the application.

## Scheduled Verification

For ongoing verification, set up scheduled checks:

1. Create a cron job to run verification scripts periodically:
   ```bash
   # Example cron entry (daily at 1 AM)
   0 1 * * * /path/to/project/scripts/verify-deployment.js https://example.com >> /path/to/logs/verification.log 2>&1
   ```

2. Set up CloudWatch alarms for key metrics:
   ```bash
   # Example CloudWatch alarm for S3 bucket existence
   aws cloudwatch put-metric-alarm \
     --alarm-name "S3BucketCheck" \
     --metric-name "BucketExistence" \
     --namespace "Custom/DPP" \
     --statistic "Sum" \
     --period 86400 \
     --threshold 1 \
     --comparison-operator "LessThan" \
     --evaluation-periods 1 \
     --alarm-actions "arn:aws:sns:us-east-1:123456789012:AlertTopic"
   ```

## Resource Cleanup Verification

When cleaning up resources, verify complete removal:

```bash
# Verify resource removal
cat > verify-cleanup.sh << 'EOF'
#!/bin/bash
DOMAIN_NAME=$1
echo "=== Resource Cleanup Verification ==="
echo "Domain: $DOMAIN_NAME"

# Check S3 buckets
echo "Checking S3 buckets..."
aws s3api head-bucket --bucket "$DOMAIN_NAME" 2>/dev/null && echo "❌ Main bucket still exists" || echo "✅ Main bucket removed"
aws s3api head-bucket --bucket "www.$DOMAIN_NAME" 2>/dev/null && echo "❌ WWW bucket still exists" || echo "✅ WWW bucket removed"
aws s3api head-bucket --bucket "logs.$DOMAIN_NAME" 2>/dev/null && echo "❌ Logs bucket still exists" || echo "✅ Logs bucket removed"

# Check CloudFront distribution
echo "Checking CloudFront distribution..."
CF_DIST=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Aliases.Items, '$DOMAIN_NAME')].Id" --output text)
if [ -n "$CF_DIST" ]; then
  echo "❌ CloudFront distribution still exists: $CF_DIST"
else
  echo "✅ CloudFront distribution removed"
fi

# Check Route 53 hosted zone
echo "Checking Route 53 hosted zone..."
HZ_ID=$(aws route53 list-hosted-zones-by-name --dns-name "$DOMAIN_NAME." --query 'HostedZones[0].Id' --output text)
if [ -n "$HZ_ID" ] && [ "$HZ_ID" != "None" ]; then
  echo "❌ Route 53 hosted zone still exists: $HZ_ID"
else
  echo "✅ Route 53 hosted zone removed"
fi

# Check ACM certificate
echo "Checking ACM certificate..."
CERT_ARN=$(aws acm list-certificates --query "CertificateSummaryList[?contains(DomainName, '$DOMAIN_NAME')].CertificateArn" --output text)
if [ -n "$CERT_ARN" ] && [ "$CERT_ARN" != "None" ]; then
  echo "❌ ACM certificate still exists: $CERT_ARN"
else
  echo "✅ ACM certificate removed"
fi

echo "Resource cleanup verification complete"
EOF

chmod +x verify-cleanup.sh
./verify-cleanup.sh example.com
```

This script verifies that all resources have been properly removed during cleanup.