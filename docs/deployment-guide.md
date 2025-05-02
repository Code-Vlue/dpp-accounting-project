# DPP Accounting Platform Deployment Guide

This guide provides comprehensive instructions for deploying the DPP Accounting Platform to production and other environments.

## Deployment Environments

The DPP Accounting Platform supports three deployment environments:

1. **Development** (`dev`): For ongoing development and integration testing
2. **Staging** (`staging`): For pre-production testing and validation
3. **Production** (`prod`): Live production environment

## Deployment Architecture

The deployment architecture consists of:

- **S3 Buckets**: Static file hosting for the Next.js application
- **CloudFront**: CDN for content delivery and edge caching
- **Route 53**: DNS management
- **AWS Certificate Manager**: SSL certificate management
- **AWS Cognito**: User authentication and management

For a detailed architecture overview, see [Infrastructure Architecture](infrastructure-architecture.md).

## Prerequisites

Before deployment, ensure you have:

1. **AWS CLI** installed and configured with appropriate credentials
2. **AWS account** with necessary permissions for all required services
3. **Domain name** registered and accessible
4. **Build artifacts** generated from a successful build of the application
5. **GitHub Actions** set up for CI/CD (if using automated deployment)

## Deployment Methods

There are three ways to deploy the application:

1. **GitHub Actions CI/CD** (recommended)
2. **Manual deployment** using deployment scripts
3. **AWS Management Console** deployment (not recommended for production)

## Deployment Using GitHub Actions (CI/CD)

### Setting Up GitHub Actions

1. Configure the required GitHub secrets in your repository settings:
   
   ```
   AWS_ACCESS_KEY_ID
   AWS_SECRET_ACCESS_KEY
   DEV_BUCKET_NAME
   DEV_CLOUDFRONT_DISTRIBUTION_ID
   DEV_SITE_URL
   STAGING_BUCKET_NAME
   STAGING_CLOUDFRONT_DISTRIBUTION_ID
   STAGING_SITE_URL
   PROD_BUCKET_NAME
   PROD_CLOUDFRONT_DISTRIBUTION_ID
   PROD_SITE_URL
   ```

2. Deployment workflows are defined in the `.github/workflows` directory:
   - `ci-cd.yml`: Main CI/CD pipeline for automatic deployments
   - `manual-deploy.yml`: Manual deployment workflow

### Automatic Deployment

The CI/CD pipeline automatically deploys:
- To the development environment when changes are pushed to the `main` branch
- To production after a successful deployment to the development environment (with approval)

The deployment process:
1. Builds the Next.js application with environment-specific variables
2. Runs tests to verify the build integrity
3. Synchronizes the build artifacts to the S3 bucket
4. Creates a CloudFront invalidation to refresh the cache
5. Verifies the deployment is accessible

### Manual Deployment via GitHub Actions

To manually trigger a deployment:

1. Go to the **Actions** tab in your GitHub repository
2. Select the **Manual Deployment** workflow
3. Click **Run workflow**
4. Select the target environment (`development`, `staging`, or `production`)
5. Click **Run workflow** to start the deployment

## Manual Deployment Using Scripts

For manual deployment using scripts:

1. Set up AWS credentials:
   ```bash
   aws configure
   ```

2. Create a deployment configuration file `deployment-config.json`:
   ```json
   {
     "environments": {
       "development": {
         "bucketName": "dev-dpp-accounting-platform",
         "cloudfrontDistributionId": "EXXXXXXXXXXXXX",
         "siteUrl": "https://dev.example.com"
       },
       "staging": {
         "bucketName": "staging-dpp-accounting-platform",
         "cloudfrontDistributionId": "EXXXXXXXXXXXXX",
         "siteUrl": "https://staging.example.com"
       },
       "production": {
         "bucketName": "dpp-accounting-platform",
         "cloudfrontDistributionId": "EXXXXXXXXXXXXX",
         "siteUrl": "https://example.com"
       }
     }
   }
   ```

3. Run the deployment script for the desired environment:
   ```bash
   # For development
   ./scripts/deploy-nextjs.sh development
   
   # For staging
   ./scripts/deploy-nextjs.sh staging
   
   # For production
   ./scripts/deploy-nextjs.sh production
   ```

### Deployment Script Workflow

The `deploy-nextjs.sh` script performs the following steps:

1. Builds the Next.js application with environment-specific variables
2. Synchronizes the build artifacts to the S3 bucket with appropriate cache settings:
   - Static assets: `Cache-Control: max-age=31536000, immutable` (1 year)
   - HTML/JSON: `Cache-Control: max-age=3600` (1 hour)
   - Public files: `Cache-Control: max-age=86400` (1 day)
3. Creates a CloudFront invalidation to refresh the cache
4. Verifies the deployment by checking the site URL

## Deployment Configuration

### Environment Variables

Create environment-specific `.env` files for each environment:

- `.env.development` - For development environment
- `.env.staging` - For staging environment
- `.env.production` - For production environment

These files should contain all the required environment variables for their respective environments.

### Next.js Build Configuration

The Next.js build process creates a static export optimized for S3 and CloudFront hosting:

```bash
# Example build command
NEXT_PUBLIC_API_URL=https://api.example.com \
NEXT_PUBLIC_SITE_URL=https://example.com \
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_example \
NEXT_PUBLIC_COGNITO_CLIENT_ID=example \
npm run build
```

## Deployment Verification

After deployment, verify that:

1. The site is accessible at the expected URL
2. SSL/TLS is working correctly (HTTPS)
3. Authentication flows work properly
4. Critical application features function correctly

Use the verification script to automate these checks:

```bash
./scripts/verify-deployment.js https://example.com
```

## CloudFront Configuration

The CloudFront distribution is configured for optimal performance and security:

- **Origin Access Identity**: Restricts S3 access to CloudFront only
- **Custom Error Responses**: Handles SPA routing for client-side navigation
- **Cache Behaviors**:
  - Default: 1-hour cache for HTML/JSON files
  - Static Assets: 1-year cache with immutable flag
  - API: No cache, passthrough to API origin
- **HTTPS**: Required for all connections
- **Security Headers**: Set via CloudFront Functions
- **Geo-Restrictions**: If applicable for regulatory compliance

## Rollback Procedure

If a deployment causes issues, follow these rollback steps:

1. Identify the last known good deployment version
2. Deploy the previous stable version using the deployment script:
   ```bash
   ./scripts/deploy-nextjs.sh production v1.2.3
   ```
3. Create a CloudFront invalidation to refresh the cache:
   ```bash
   aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"
   ```
4. Verify the rollback is successful by accessing the site

## Database Migration (If Applicable)

If the deployment includes database schema changes:

1. Back up the existing database:
   ```bash
   aws rds create-db-snapshot \
     --db-instance-identifier dpp-accounting-db \
     --db-snapshot-identifier pre-deploy-backup-$(date +%Y%m%d)
   ```

2. Apply migrations carefully, preferably with a migration script that allows for rollback

## Automated Monitoring After Deployment

After deployment, monitor for any issues:

1. **CloudWatch Alarms**: Set up alarms for error rates and performance metrics
2. **Log Analysis**: Check CloudWatch Logs for error patterns
3. **Synthetic Monitoring**: Run synthetic tests to verify critical user flows
4. **Real User Monitoring**: Track actual user experience metrics

## Security Considerations

Ensure these security measures are in place for production deployments:

1. **HTTPS Only**: Force HTTPS for all connections
2. **Content Security Policy**: Implement strict CSP headers
3. **AWS Resource Policies**: Restrict access to AWS resources
4. **API Rate Limiting**: Protect API endpoints from abuse
5. **WAF Rules**: Consider adding AWS WAF for additional protection
6. **Regular Security Scans**: Schedule automated security scans

## Production Launch Checklist

Before final production launch, verify:

- [ ] DNS is correctly configured
- [ ] SSL certificates are valid and properly installed
- [ ] CloudFront distribution is properly configured
- [ ] S3 bucket policies are secure
- [ ] Authentication system is functioning correctly
- [ ] All critical user flows have been tested
- [ ] Monitoring is set up and functioning
- [ ] Backup and disaster recovery procedures are in place
- [ ] Performance testing has been conducted
- [ ] Security assessment has been completed
- [ ] Compliance requirements have been met
- [ ] Documentation is complete and up-to-date

## Troubleshooting Common Deployment Issues

### CloudFront Cache Issues

**Problem**: Changes not appearing after deployment
**Solution**: 
- Create a wildcard CloudFront invalidation: `aws cloudfront create-invalidation --distribution-id EXXXXXXXXXXXXX --paths "/*"`
- Verify cache headers are set correctly in S3

### S3 Synchronization Issues

**Problem**: Files not uploading correctly to S3
**Solution**:
- Check AWS credentials have correct permissions
- Verify the bucket name is correct
- Check for file permission issues in the build directory

### DNS Configuration Issues

**Problem**: Domain not resolving to CloudFront
**Solution**:
- Verify Route 53 records are correctly configured
- Check that DNS propagation has completed (can take up to 48 hours)
- Confirm ALIAS records are pointing to the right CloudFront distribution

### Authentication Issues

**Problem**: Unable to log in after deployment
**Solution**:
- Verify Cognito pool and client IDs are correctly set
- Check Cognito service is available in the deployment region
- Confirm authentication configuration in the application

## Deployment Resources

- **AWS S3 Documentation**: [S3 Developer Guide](https://docs.aws.amazon.com/AmazonS3/latest/dev/Welcome.html)
- **CloudFront Documentation**: [CloudFront Developer Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html)
- **Next.js Deployment**: [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)

## Contact and Support

For deployment assistance, contact:
- DevOps Team: devops@example.com
- Infrastructure Support: infrastructure@example.com