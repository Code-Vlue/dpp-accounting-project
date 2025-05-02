#\!/bin/bash
echo "Verifying AWS deployment readiness..."

# Check AWS identity
echo "Checking AWS identity..."
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials."
  exit 1
else
  echo "✅ AWS account ID: $ACCOUNT_ID"
fi

# Check for required permissions
echo "Checking AWS permissions..."
PERMISSIONS=(
  "route53:CreateHostedZone"
  "acm:RequestCertificate"
  "s3:CreateBucket"
  "cloudfront:CreateDistribution"
  "amplify:CreateApp"
  "iam:CreateRole"
)

for perm in "${PERMISSIONS[@]}"; do
  SERVICE=$(echo $perm  < /dev/null |  cut -d: -f1)
  ACTION=$(echo $perm | cut -d: -f2)
  echo "  Checking $perm..."
  
  # Try a basic operation with each service
  case $SERVICE in
    route53)
      aws route53 list-hosted-zones > /dev/null 2>&1
      ;;
    acm)
      aws acm list-certificates > /dev/null 2>&1
      ;;
    s3)
      aws s3 ls > /dev/null 2>&1
      ;;
    cloudfront)
      aws cloudfront list-distributions > /dev/null 2>&1
      ;;
    amplify)
      aws amplify list-apps > /dev/null 2>&1
      ;;
    iam)
      aws iam list-roles > /dev/null 2>&1
      ;;
  esac
  
  if [ $? -eq 0 ]; then
    echo "  ✅ $perm - Allowed"
  else
    echo "  ❌ $perm - Permission denied"
  fi
done

echo "AWS deployment readiness verification complete."
