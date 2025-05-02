# Domain and SSL Configuration Guide for DPP Accounting Platform

This guide explains how to configure a domain name and SSL certificates for the DPP Accounting Platform using AWS Route 53, ACM, CloudFront, and S3.

## Prerequisites

Before you begin, you'll need:

1. A domain name registered with a domain registrar
2. AWS account with appropriate permissions
3. AWS CLI configured with admin access
4. JQ installed for JSON processing

## Step 1: Configure Domain in Route 53 and ACM

Run the `setup-domain.sh` script to:

1. Create a Route 53 hosted zone for your domain
2. Request an ACM certificate for the domain and www subdomain
3. Add DNS validation records to Route 53
4. Set up placeholder DNS records for CloudFront

```bash
# Make the script executable
chmod +x scripts/setup-domain.sh

# Run the script
./scripts/setup-domain.sh
```

### What this script does:

- Creates a Route 53 hosted zone for your domain
- Requests an SSL certificate from ACM for your domain and www subdomain
- Sets up DNS validation records for certificate verification
- Creates placeholder DNS records for CloudFront
- Saves configuration information to `domain-config.json`

### Important Notes:

- If you're using a third-party domain registrar, you must update your domain's name servers to the ones provided by Route 53
- Certificate validation might take up to 30 minutes
- The script will check the validation status but won't wait for completion

## Step 2: Verify Route 53 and ACM Configuration

Run the `verify-domain.sh` script to check that your domain and certificate have been configured correctly:

```bash
# Make the script executable
chmod +x scripts/verify-domain.sh

# Run the script
./scripts/verify-domain.sh
```

### What this script checks:

- Existence and configuration of Route 53 hosted zone
- Existence and status of ACM certificate
- Presence of DNS validation records
- Presence of DNS records for the apex domain and www subdomain

## Step 3: Set Up CloudFront and S3

After certificate validation is complete, run the `setup-cloudfront.sh` script to:

1. Create S3 buckets for hosting the website
2. Create a CloudFront distribution using the validated certificate
3. Update Route 53 records to point to CloudFront
4. Upload placeholder content

```bash
# Make the script executable
chmod +x scripts/setup-cloudfront.sh

# Run the script
./scripts/setup-cloudfront.sh
```

### What this script does:

- Creates three S3 buckets:
  - Main bucket for the apex domain
  - WWW bucket for redirecting www to the apex domain
  - Logs bucket for storing access logs
- Creates a CloudFront distribution with:
  - SSL certificate from ACM
  - Custom domain names
  - Origin access identity for S3 access
  - Appropriate cache behaviors
  - Error page configuration
- Updates Route 53 records to point to CloudFront
- Uploads placeholder content to the S3 bucket
- Updates the `domain-config.json` file with CloudFront details

### Important Notes:

- The CloudFront distribution can take up to 30 minutes to deploy globally
- During this time, the website might not be accessible

## Step 4: Verify CloudFront and S3 Configuration

Run the `verify-cloudfront.sh` script to check that CloudFront and S3 have been configured correctly:

```bash
# Make the script executable
chmod +x scripts/verify-cloudfront.sh

# Run the script
./scripts/verify-cloudfront.sh
```

### What this script checks:

- Existence and status of CloudFront distribution
- Existence and configuration of S3 buckets
- Presence of website content in the main bucket
- Accessibility of the domain (may initially fail due to DNS propagation)

## Step 5: Deploy the Application

After verifying that CloudFront and S3 are configured correctly, you can deploy your Next.js application to the S3 bucket. This is typically done through the CI/CD pipeline configured with GitHub Actions.

## Infrastructure Management

- All infrastructure resources are managed through the scripts in the `scripts/` directory
- Configuration details are stored in `domain-config.json`
- The `domain-config.example.json` file provides a template of the configuration

## Troubleshooting

### Certificate Validation Issues:

- Ensure DNS validation records are present in Route 53
- Check that your domain's name servers are correctly set at your registrar
- Validate that ACM shows the correct domain and status

### CloudFront and S3 Issues:

- Verify that S3 buckets are correctly configured for static website hosting
- Ensure the CloudFront distribution is enabled and deployed
- Check that Route 53 records point to the correct CloudFront distribution
- Validate origin access identity is correctly configured

### Domain Accessibility Issues:

- DNS changes can take time to propagate globally
- Use `curl` to check HTTP status codes
- Verify CloudFront distribution status is "Deployed"

## Resource Cleanup

If you need to remove these resources:

1. Delete the CloudFront distribution
2. Delete S3 buckets (must be empty)
3. Delete ACM certificate
4. Delete Route 53 hosted zone

Important: Remember that Route 53 charges a monthly fee for each hosted zone, so clean up resources when no longer needed.

## Security Considerations

- Use origin access identity to restrict S3 bucket access
- Enable CloudFront logging to S3
- Configure appropriate bucket policies
- Use TLSv1.2_2021 minimum protocol version
- Implement HTTPS-only access