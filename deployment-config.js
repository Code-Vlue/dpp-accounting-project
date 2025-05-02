// /workspace/DPP-Project/deployment-config.js
module.exports = {
  environments: {
    development: {
      name: 'development',
      aws: {
        region: 'us-east-1',
        s3Bucket: process.env.DEV_BUCKET_NAME || 'dpp-accounting-platform-dev',
        cloudfrontDistribution: process.env.DEV_CLOUDFRONT_DISTRIBUTION_ID || '',
      },
      url: process.env.DEV_SITE_URL || 'https://dev.dpp-accounting-platform.example.com',
      apiUrl: process.env.DEV_API_URL || 'https://api-dev.dpp-accounting-platform.example.com',
    },
    staging: {
      name: 'staging',
      aws: {
        region: 'us-east-1',
        s3Bucket: process.env.STAGING_BUCKET_NAME || 'dpp-accounting-platform-staging',
        cloudfrontDistribution: process.env.STAGING_CLOUDFRONT_DISTRIBUTION_ID || '',
      },
      url: process.env.STAGING_SITE_URL || 'https://staging.dpp-accounting-platform.example.com',
      apiUrl: process.env.STAGING_API_URL || 'https://api-staging.dpp-accounting-platform.example.com',
    },
    production: {
      name: 'production',
      aws: {
        region: 'us-east-1',
        s3Bucket: process.env.PROD_BUCKET_NAME || 'dpp-accounting-platform-prod',
        cloudfrontDistribution: process.env.PROD_CLOUDFRONT_DISTRIBUTION_ID || '',
      },
      url: process.env.PROD_SITE_URL || 'https://www.dpp-accounting-platform.example.com',
      apiUrl: process.env.PROD_API_URL || 'https://api.dpp-accounting-platform.example.com',
    },
  },
  
  // Helper function to get config based on environment
  getConfig: function(environment) {
    return this.environments[environment] || this.environments.development;
  },
  
  // Helper function to get current environment config based on NODE_ENV
  getCurrentConfig: function() {
    const env = process.env.DEPLOYMENT_ENV || process.env.NODE_ENV || 'development';
    return this.getConfig(env);
  }
};