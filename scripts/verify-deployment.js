// /workspace/DPP-Project/scripts/verify-deployment.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to run shell commands and handle errors
function runCommand(command) {
  try {
    return { success: true, output: execSync(command).toString().trim() };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout ? error.stdout.toString() : '',
      stderr: error.stderr ? error.stderr.toString() : ''
    };
  }
}

// Helper function to load config
function loadConfig(environment) {
  // Try to load from deployment-config.js
  try {
    if (fs.existsSync('./deployment-config.js')) {
      const config = require('../deployment-config');
      return config.getConfig(environment);
    }
  } catch (error) {
    console.warn(`Warning: Could not load config from deployment-config.js: ${error.message}`);
  }
  
  // Try to load from domain-config.json
  try {
    if (fs.existsSync('./domain-config.json')) {
      const domainConfig = JSON.parse(fs.readFileSync('./domain-config.json', 'utf8'));
      
      // Create compatible config object
      return {
        name: environment,
        aws: {
          region: domainConfig.region || 'us-east-1',
          s3Bucket: domainConfig.mainBucket,
          cloudfrontDistribution: domainConfig.cloudfrontDistributionId
        },
        url: `https://${domainConfig.domainName}`
      };
    }
  } catch (error) {
    console.warn(`Warning: Could not load config from domain-config.json: ${error.message}`);
  }
  
  // Fall back to environment variables
  const envPrefix = environment.toUpperCase();
  
  return {
    name: environment,
    aws: {
      region: process.env.AWS_REGION || 'us-east-1',
      s3Bucket: process.env[`${envPrefix}_BUCKET_NAME`] || `dpp-accounting-platform-${environment}`,
      cloudfrontDistribution: process.env[`${envPrefix}_CLOUDFRONT_DISTRIBUTION_ID`] || ''
    },
    url: process.env[`${envPrefix}_SITE_URL`] || `https://${environment === 'production' ? 'www' : environment}.dpp-accounting-platform.example.com`
  };
}

// Get the environment from command line or use development
const envArg = process.argv[2] || 'development';
const envConfig = loadConfig(envArg);

async function verifyDeployment() {
  console.log(`Verifying deployment for environment: ${envConfig.name}`);
  console.log(`Using configuration:`);
  console.log(`- S3 Bucket: ${envConfig.aws.s3Bucket}`);
  console.log(`- CloudFront: ${envConfig.aws.cloudfrontDistribution || 'Not configured'}`);
  console.log(`- URL: ${envConfig.url}`);
  
  let allChecksOk = true;
  
  // Verify AWS Account
  console.log('\nVerifying AWS credentials...');
  const accountResult = runCommand('aws sts get-caller-identity --query "Account" --output text');
  if (accountResult.success) {
    console.log(`✅ Using AWS Account: ${accountResult.output}`);
  } else {
    console.error('❌ Failed to verify AWS credentials');
    console.error(accountResult.stderr);
    allChecksOk = false;
  }
  
  // Verify S3 bucket
  if (envConfig.aws.s3Bucket) {
    console.log(`\nVerifying S3 bucket: ${envConfig.aws.s3Bucket}`);
    const s3Result = runCommand(`aws s3api head-bucket --bucket ${envConfig.aws.s3Bucket}`);
    
    if (s3Result.success) {
      console.log('✅ S3 bucket exists and is accessible');
      
      // Verify bucket contents
      console.log('\nVerifying static assets in bucket:');
      const s3ContentsResult = runCommand(`aws s3 ls s3://${envConfig.aws.s3Bucket}/_next/static/ --recursive --summarize`);
      
      if (s3ContentsResult.success) {
        const summary = s3ContentsResult.output.split('\n')
          .filter(line => line.includes('Total Objects') || line.includes('Total Size'))
          .join(', ');
        
        console.log(`✅ Found assets in bucket: ${summary}`);
      } else {
        console.warn(`⚠️ Could not find static assets in bucket (_next/static/ directory)`);
        console.warn('This might indicate deployment issues or a different deployment structure');
        // Don't fail the entire verification for this
      }
    } else {
      console.error('❌ S3 bucket verification failed');
      console.error(s3Result.stderr);
      allChecksOk = false;
    }
  } else {
    console.warn('⚠️ No S3 bucket specified in configuration');
  }
  
  // Verify CloudFront distribution
  if (envConfig.aws.cloudfrontDistribution) {
    console.log(`\nVerifying CloudFront distribution: ${envConfig.aws.cloudfrontDistribution}`);
    const cfResult = runCommand(`aws cloudfront get-distribution --id ${envConfig.aws.cloudfrontDistribution} --query 'Distribution.Status' --output text`);
    
    if (cfResult.success) {
      console.log(`✅ CloudFront distribution status: ${cfResult.output}`);
      
      if (cfResult.output !== 'Deployed') {
        console.warn(`⚠️ CloudFront distribution is not fully deployed (status: ${cfResult.output})`);
        console.warn('This may cause temporary issues accessing the site');
        // Don't fail verification for this
      }
    } else {
      console.error('❌ CloudFront distribution verification failed');
      console.error(cfResult.stderr);
      allChecksOk = false;
    }
  } else {
    console.warn('⚠️ No CloudFront distribution ID configured for this environment');
  }
  
  // Verify site accessibility
  if (envConfig.url) {
    console.log(`\nVerifying site accessibility: ${envConfig.url}`);
    
    // Use curl with various options to test site availability
    const curlResult = runCommand(`curl -sSf -o /dev/null -w "%{http_code}" ${envConfig.url}`);
    
    if (curlResult.success && ['200', '301', '302'].includes(curlResult.output)) {
      console.log(`✅ Website is accessible (HTTP status: ${curlResult.output})`);
    } else {
      console.warn(`⚠️ Could not verify website accessibility (HTTP status: ${curlResult.output || 'unknown'})`);
      console.warn('This might be expected for server-rendered deployments, or if DNS is not configured yet');
      // Don't fail verification for this as it might be expected in some deployment scenarios
    }
  } else {
    console.warn('⚠️ No site URL configured for this environment');
  }
  
  // Final verification result
  console.log('\nDeployment verification complete!');
  
  if (allChecksOk) {
    console.log('✅ All critical checks passed. Deployment is verified.');
    process.exit(0);
  } else {
    console.error('❌ Some critical checks failed. Please review the errors above.');
    process.exit(1);
  }
}

verifyDeployment().catch(error => {
  console.error('Deployment verification failed with an error:');
  console.error(error);
  process.exit(1);
});
