#!/bin/bash
# Domain and SSL Certificate Verification Script
# This script verifies the configuration of Route 53 and ACM for the DPP Accounting Platform

set -e

# Check if domain-config.json exists
if [ ! -f "domain-config.json" ]; then
  echo "❌ domain-config.json not found. Please run setup-domain.sh first."
  exit 1
fi

# Load configuration from file
DOMAIN_NAME=$(jq -r '.domainName' domain-config.json)
HOSTED_ZONE_ID=$(jq -r '.hostedZoneId' domain-config.json)
CERTIFICATE_ARN=$(jq -r '.certificateArn' domain-config.json)
REGION=$(jq -r '.region' domain-config.json)
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== DPP Accounting Platform - Domain Verification ==="
echo "Started at: $TIMESTAMP"
echo "Domain: $DOMAIN_NAME"
echo "Hosted Zone ID: $HOSTED_ZONE_ID"
echo "Certificate ARN: $CERTIFICATE_ARN"
echo "Region: $REGION"

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Verify Route 53 hosted zone
echo "Verifying Route 53 hosted zone..."
ZONE_INFO=$(aws route53 get-hosted-zone --id "$HOSTED_ZONE_ID" 2>/dev/null || echo "")

if [ -z "$ZONE_INFO" ]; then
  echo "❌ Hosted zone $HOSTED_ZONE_ID not found."
  exit 1
fi

ZONE_DOMAIN=$(echo "$ZONE_INFO" | jq -r '.HostedZone.Name' | sed 's/\.$//')
if [ "$ZONE_DOMAIN" != "$DOMAIN_NAME" ]; then
  echo "❌ Hosted zone domain mismatch: $ZONE_DOMAIN ≠ $DOMAIN_NAME"
  exit 1
fi

echo "✅ Hosted zone verified: $HOSTED_ZONE_ID ($ZONE_DOMAIN)"

# Verify name servers
echo "Verifying name servers..."
NAME_SERVERS=$(echo "$ZONE_INFO" | jq -r '.DelegationSet.NameServers[]')
echo "$NAME_SERVERS"

# Verify ACM certificate
echo "Verifying ACM certificate..."
CERT_INFO=$(aws acm describe-certificate --certificate-arn "$CERTIFICATE_ARN" --region "$REGION" 2>/dev/null || echo "")

if [ -z "$CERT_INFO" ]; then
  echo "❌ Certificate $CERTIFICATE_ARN not found."
  exit 1
fi

CERT_DOMAIN=$(echo "$CERT_INFO" | jq -r '.Certificate.DomainName')
if [ "$CERT_DOMAIN" != "$DOMAIN_NAME" ]; then
  echo "❌ Certificate domain mismatch: $CERT_DOMAIN ≠ $DOMAIN_NAME"
  exit 1
fi

CERT_STATUS=$(echo "$CERT_INFO" | jq -r '.Certificate.Status')
echo "✅ Certificate verified: $CERTIFICATE_ARN ($CERT_DOMAIN)"
echo "   Status: $CERT_STATUS"

# Verify alternate names
SANS=$(echo "$CERT_INFO" | jq -r '.Certificate.SubjectAlternativeNames[]')
echo "   Subject Alternative Names:"
echo "$SANS" | sed 's/^/   - /'

# Verify DNS records
echo "Verifying DNS records..."
RECORDS=$(aws route53 list-resource-record-sets --hosted-zone-id "$HOSTED_ZONE_ID" 2>/dev/null || echo "")

if [ -z "$RECORDS" ]; then
  echo "❌ Failed to retrieve DNS records."
  exit 1
fi

# Check for A record
A_RECORD=$(echo "$RECORDS" | jq -r '.ResourceRecordSets[] | select(.Name == "'$DOMAIN_NAME'." and .Type == "A")')
if [ -z "$A_RECORD" ]; then
  echo "❓ Apex A record not found for $DOMAIN_NAME"
else
  echo "✅ Apex A record found for $DOMAIN_NAME"
fi

# Check for CNAME record
CNAME_RECORD=$(echo "$RECORDS" | jq -r '.ResourceRecordSets[] | select(.Name == "www.'$DOMAIN_NAME'." and .Type == "CNAME")')
if [ -z "$CNAME_RECORD" ]; then
  echo "❓ www CNAME record not found for www.$DOMAIN_NAME"
else
  echo "✅ www CNAME record found for www.$DOMAIN_NAME"
fi

# Check for DNS validation records
VALIDATION_OPTIONS=$(echo "$CERT_INFO" | jq -r '.Certificate.DomainValidationOptions')
echo "$VALIDATION_OPTIONS" | jq -c '.[]' | while read -r OPTION; do
  RECORD_NAME=$(echo "$OPTION" | jq -r '.ResourceRecord.Name')
  RECORD_TYPE=$(echo "$OPTION" | jq -r '.ResourceRecord.Type')
  
  VALIDATION_RECORD=$(echo "$RECORDS" | jq -r '.ResourceRecordSets[] | select(.Name == "'$RECORD_NAME'" and .Type == "'$RECORD_TYPE'")')
  if [ -z "$VALIDATION_RECORD" ]; then
    echo "❌ Validation record not found: $RECORD_NAME ($RECORD_TYPE)"
  else
    echo "✅ Validation record found: $RECORD_NAME ($RECORD_TYPE)"
  fi
done

# Summary
cat << EOF

=== Domain Verification Summary ===
Domain: $DOMAIN_NAME
Route 53 Hosted Zone ID: $HOSTED_ZONE_ID - $([ -n "$ZONE_INFO" ] && echo "✅ Verified" || echo "❌ Not Found")
ACM Certificate ARN: $CERTIFICATE_ARN - $([ -n "$CERT_INFO" ] && echo "✅ Verified" || echo "❌ Not Found")
Certificate Status: $CERT_STATUS
Region: $REGION

Apex Record (A): $([ -n "$A_RECORD" ] && echo "✅ Found" || echo "❓ Not Found")
WWW Record (CNAME): $([ -n "$CNAME_RECORD" ] && echo "✅ Found" || echo "❓ Not Found")

Verification completed at: $(date +"%Y-%m-%d %H:%M:%S")
EOF

# Check if all critical components are verified
if [ -n "$ZONE_INFO" ] && [ -n "$CERT_INFO" ] && [ "$CERT_STATUS" = "ISSUED" ]; then
  echo "✅ Domain and SSL certificate configuration is complete and verified."
  exit 0
elif [ -n "$ZONE_INFO" ] && [ -n "$CERT_INFO" ] && [ "$CERT_STATUS" = "PENDING_VALIDATION" ]; then
  echo "⏳ Domain setup is in progress. Certificate is pending validation."
  exit 2
else
  echo "❌ Domain configuration is incomplete or has issues that need to be addressed."
  exit 1
fi