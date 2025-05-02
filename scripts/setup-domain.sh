#!/bin/bash
# Domain and SSL Certificate Configuration Script
# This script sets up Route 53 and ACM for the DPP Accounting Platform

set -e

# Configuration variables
DOMAIN_NAME="dpp-accounting.example.com"
REGION="us-east-1"
RECORD_TTL=300
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== DPP Accounting Platform - Domain Configuration ==="
echo "Started at: $TIMESTAMP"
echo "Domain: $DOMAIN_NAME"
echo "Region: $REGION"

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Step 1: Create Route 53 hosted zone
echo "Creating Route 53 hosted zone for $DOMAIN_NAME..."
echo "Checking if hosted zone already exists..."
EXISTING_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name "${DOMAIN_NAME}." --max-items 1 --query 'HostedZones[?Name==`'${DOMAIN_NAME}'.`].Id' --output text)

if [ -z "$EXISTING_ZONE_ID" ]; then
  echo "Creating new hosted zone..."
  ZONE_RESPONSE=$(aws route53 create-hosted-zone \
    --name "$DOMAIN_NAME" \
    --caller-reference "dpp-accounting-platform-$(date +%s)" \
    --hosted-zone-config Comment="Managed by DPP Accounting Platform CI/CD")
  
  HOSTED_ZONE_ID=$(echo "$ZONE_RESPONSE" | jq -r '.HostedZone.Id' | sed 's/\/hostedzone\///')
  echo "✅ Created hosted zone: $HOSTED_ZONE_ID"

  # Extract name servers
  NAME_SERVERS=$(echo "$ZONE_RESPONSE" | jq -r '.DelegationSet.NameServers[]')
  echo "Name servers:"
  echo "$NAME_SERVERS"
  echo "ℹ️ Important: Update your domain registrar's name servers with the above values"
else
  HOSTED_ZONE_ID=$(echo "$EXISTING_ZONE_ID" | sed 's/\/hostedzone\///')
  echo "✅ Using existing hosted zone: $HOSTED_ZONE_ID"
  
  # Get name servers
  NAME_SERVERS=$(aws route53 get-hosted-zone --id "$EXISTING_ZONE_ID" --query 'DelegationSet.NameServers' --output text)
  echo "Name servers:"
  echo "$NAME_SERVERS"
fi

# Step 2: Request ACM certificate
echo "Requesting ACM certificate for $DOMAIN_NAME and www.$DOMAIN_NAME..."

# Check if certificate already exists
echo "Checking if certificate already exists..."
EXISTING_CERT_ARN=$(aws acm list-certificates --region "$REGION" --query "CertificateSummaryList[?DomainName=='$DOMAIN_NAME'].CertificateArn" --output text)

if [ -z "$EXISTING_CERT_ARN" ]; then
  echo "Requesting new certificate..."
  CERTIFICATE_ARN=$(aws acm request-certificate \
    --domain-name "$DOMAIN_NAME" \
    --subject-alternative-names "www.$DOMAIN_NAME" \
    --validation-method DNS \
    --query CertificateArn \
    --output text \
    --region "$REGION")
  
  echo "✅ Certificate requested: $CERTIFICATE_ARN"
  echo "Waiting for certificate details to be available..."
  sleep 10
else
  CERTIFICATE_ARN="$EXISTING_CERT_ARN"
  echo "✅ Using existing certificate: $CERTIFICATE_ARN"
fi

# Step 3: Create DNS validation records
echo "Adding DNS validation records to Route 53..."

# Get certificate details
CERTIFICATE_DETAILS=$(aws acm describe-certificate --certificate-arn "$CERTIFICATE_ARN" --region "$REGION")
VALIDATION_OPTIONS=$(echo "$CERTIFICATE_DETAILS" | jq -r '.Certificate.DomainValidationOptions')

# Create a JSON file for the validation records
cat > /tmp/validation-records.json << EOF
{
  "Changes": [
EOF

FIRST_RECORD=true
echo "$VALIDATION_OPTIONS" | jq -c '.[]' | while read -r OPTION; do
  DOMAIN=$(echo "$OPTION" | jq -r '.DomainName')
  RECORD_NAME=$(echo "$OPTION" | jq -r '.ResourceRecord.Name')
  RECORD_VALUE=$(echo "$OPTION" | jq -r '.ResourceRecord.Value')
  RECORD_TYPE=$(echo "$OPTION" | jq -r '.ResourceRecord.Type')
  
  if [ "$FIRST_RECORD" = "false" ]; then
    echo "," >> /tmp/validation-records.json
  else
    FIRST_RECORD=false
  fi
  
  cat >> /tmp/validation-records.json << EOF
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$RECORD_NAME",
        "Type": "$RECORD_TYPE",
        "TTL": $RECORD_TTL,
        "ResourceRecords": [
          {
            "Value": "$RECORD_VALUE"
          }
        ]
      }
    }
EOF
done

# Close the JSON structure
cat >> /tmp/validation-records.json << EOF
  ]
}
EOF

# Apply the validation records
echo "Applying validation records to Route 53..."
aws route53 change-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" --change-batch file:///tmp/validation-records.json

echo "✅ DNS validation records added"

# Step 4: Create A and CNAME records for CloudFront (placeholder values)
echo "Creating A and CNAME records for CloudFront (using placeholder values)..."

# We'll use a placeholder CloudFront distribution for now
CLOUDFRONT_DOMAIN="placeholder-distribution.cloudfront.net"

cat > /tmp/cloudfront-records.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$DOMAIN_NAME",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "$CLOUDFRONT_DOMAIN",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.$DOMAIN_NAME",
        "Type": "CNAME",
        "TTL": $RECORD_TTL,
        "ResourceRecords": [
          {
            "Value": "$DOMAIN_NAME"
          }
        ]
      }
    }
  ]
}
EOF

echo "Note: These are placeholder records. Update with actual CloudFront distribution when available."
echo "To apply these records later, run: aws route53 change-resource-record-sets --hosted-zone-id \"$HOSTED_ZONE_ID\" --change-batch file:///tmp/cloudfront-records.json"

# Step 5: Wait for certificate validation
echo "Checking certificate validation status..."
CERT_STATUS=$(aws acm describe-certificate --certificate-arn "$CERTIFICATE_ARN" --region "$REGION" --query 'Certificate.Status' --output text)

if [ "$CERT_STATUS" != "ISSUED" ]; then
  echo "⏳ Certificate status: $CERT_STATUS"
  echo "Certificate validation is in progress. This may take up to 30 minutes."
  echo "To check the status manually, run:"
  echo "aws acm describe-certificate --certificate-arn \"$CERTIFICATE_ARN\" --region \"$REGION\" --query 'Certificate.Status' --output text"
else
  echo "✅ Certificate is already validated and issued"
fi

# Summary
cat << EOF

=== Domain Configuration Summary ===
Domain: $DOMAIN_NAME
Route 53 Hosted Zone ID: $HOSTED_ZONE_ID
ACM Certificate ARN: $CERTIFICATE_ARN
Certificate Status: $CERT_STATUS
Region: $REGION

Next Steps:
1. If you're using a domain from a third-party registrar, update the name servers at your registrar to:
$NAME_SERVERS

2. Wait for the certificate to be validated (if not already)

3. Update the CloudFront distribution with the certificate ARN when ready

Script completed at: $(date +"%Y-%m-%d %H:%M:%S")
EOF

# Save configuration to file for future reference
cat > domain-config.json << EOF
{
  "domainName": "$DOMAIN_NAME",
  "hostedZoneId": "$HOSTED_ZONE_ID",
  "certificateArn": "$CERTIFICATE_ARN",
  "region": "$REGION",
  "nameServers": $(echo "$NAME_SERVERS" | jq -R -s -c 'split("\n")[:-1]'),
  "configuredAt": "$(date +"%Y-%m-%d %H:%M:%S")"
}
EOF

echo "✅ Configuration saved to domain-config.json"