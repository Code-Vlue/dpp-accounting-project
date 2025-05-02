#!/bin/bash
# AWS Cognito User Pool Setup Script
# This script creates and configures an AWS Cognito User Pool for the DPP Accounting Platform

set -e

# Configuration variables
APP_NAME="DPP-Accounting-Platform"
REGION="us-east-1"
USER_POOL_NAME="${APP_NAME}-UserPool"
CLIENT_NAME="${APP_NAME}-Client"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

echo "=== DPP Accounting Platform - Cognito Setup ==="
echo "Started at: $TIMESTAMP"
echo "Region: $REGION"
echo "User Pool Name: $USER_POOL_NAME"

# Verify AWS credentials
echo "Verifying AWS credentials..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
  echo "❌ Failed to get AWS account ID. Check credentials and try again."
  exit 1
fi
echo "✅ Using AWS Account: $AWS_ACCOUNT_ID"

# Check if Cognito User Pool already exists
echo "Checking if User Pool already exists..."
EXISTING_USER_POOLS=$(aws cognito-idp list-user-pools --max-results 60 --query "UserPools[?Name=='$USER_POOL_NAME'].Id" --output text --region $REGION)

if [ -z "$EXISTING_USER_POOLS" ]; then
  echo "Creating new Cognito User Pool: $USER_POOL_NAME"
  
  # Create User Pool
  USER_POOL_ID=$(aws cognito-idp create-user-pool \
    --pool-name "$USER_POOL_NAME" \
    --auto-verified-attributes email \
    --admin-create-user-config '{"AllowAdminCreateUserOnly":false}' \
    --username-attributes email \
    --schema '[
      {
        "Name": "email",
        "AttributeDataType": "String",
        "Mutable": true,
        "Required": true
      },
      {
        "Name": "given_name",
        "AttributeDataType": "String",
        "Mutable": true,
        "Required": true
      },
      {
        "Name": "family_name",
        "AttributeDataType": "String",
        "Mutable": true,
        "Required": true
      },
      {
        "Name": "custom:role",
        "AttributeDataType": "String",
        "Mutable": true,
        "Required": false
      },
      {
        "Name": "custom:organization",
        "AttributeDataType": "String",
        "Mutable": true,
        "Required": false
      }
    ]' \
    --policies '{
      "PasswordPolicy": {
        "MinimumLength": 8,
        "RequireUppercase": true,
        "RequireLowercase": true,
        "RequireNumbers": true,
        "RequireSymbols": true,
        "TemporaryPasswordValidityDays": 7
      }
    }' \
    --mfa-configuration "OPTIONAL" \
    --account-recovery-setting '{
      "RecoveryMechanisms": [
        {
          "Priority": 1,
          "Name": "verified_email"
        }
      ]
    }' \
    --region $REGION \
    --query 'UserPool.Id' \
    --output text)
  
  echo "✅ Created User Pool: $USER_POOL_ID"
else
  USER_POOL_ID=$EXISTING_USER_POOLS
  echo "✅ Using existing User Pool: $USER_POOL_ID"
fi

# Create Domain for Hosted UI
DOMAIN_PREFIX=$(echo "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]-')
echo "Setting up User Pool domain: $DOMAIN_PREFIX.auth.$REGION.amazoncognito.com"

# Check if domain exists
DOMAIN_EXISTS=$(aws cognito-idp describe-user-pool-domain --domain "$DOMAIN_PREFIX" --region $REGION 2>/dev/null || echo "")

if [ -z "$DOMAIN_EXISTS" ]; then
  aws cognito-idp create-user-pool-domain \
    --domain "$DOMAIN_PREFIX" \
    --user-pool-id "$USER_POOL_ID" \
    --region $REGION
  
  echo "✅ Created User Pool domain: $DOMAIN_PREFIX.auth.$REGION.amazoncognito.com"
else
  echo "✅ User Pool domain already exists: $DOMAIN_PREFIX.auth.$REGION.amazoncognito.com"
fi

# Check if app client exists
EXISTING_CLIENTS=$(aws cognito-idp list-user-pool-clients \
  --user-pool-id "$USER_POOL_ID" \
  --query "UserPoolClients[?ClientName=='$CLIENT_NAME'].ClientId" \
  --output text \
  --region $REGION)

if [ -z "$EXISTING_CLIENTS" ]; then
  echo "Creating App Client: $CLIENT_NAME"
  
  # Create App Client
  CLIENT_ID=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --generate-secret \
    --refresh-token-validity 30 \
    --access-token-validity 1 \
    --id-token-validity 1 \
    --token-validity-units '{
      "AccessToken": "hours",
      "IdToken": "hours",
      "RefreshToken": "days"
    }' \
    --explicit-auth-flows "ALLOW_USER_PASSWORD_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" "ALLOW_USER_SRP_AUTH" \
    --supported-identity-providers "COGNITO" \
    --callback-urls '["http://localhost:3000/api/auth/callback/cognito", "https://dpp-accounting.example.com/api/auth/callback/cognito"]' \
    --logout-urls '["http://localhost:3000/logout", "https://dpp-accounting.example.com/logout"]' \
    --allowed-o-auth-flows "code" \
    --allowed-o-auth-scopes "email" "openid" "profile" \
    --allowed-o-auth-flows-user-pool-client \
    --prevent-user-existence-errors "ENABLED" \
    --region $REGION \
    --query 'UserPoolClient.ClientId' \
    --output text)
  
  # Get Client Secret
  CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-id "$CLIENT_ID" \
    --region $REGION \
    --query 'UserPoolClient.ClientSecret' \
    --output text)
  
  echo "✅ Created App Client: $CLIENT_ID"
else
  CLIENT_ID=$EXISTING_CLIENTS
  
  # Get Client Secret
  CLIENT_SECRET=$(aws cognito-idp describe-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-id "$CLIENT_ID" \
    --region $REGION \
    --query 'UserPoolClient.ClientSecret' \
    --output text)
  
  echo "✅ Using existing App Client: $CLIENT_ID"
fi

# Create example user accounts
create_user() {
  local email=$1
  local given_name=$2
  local family_name=$3
  local role=$4
  local organization=$5
  local temp_password="Temp1234!"

  echo "Creating user: $email with role: $role"
  
  USER_EXISTS=$(aws cognito-idp admin-get-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "$email" \
    --region $REGION 2>/dev/null || echo "")
  
  if [ -z "$USER_EXISTS" ]; then
    aws cognito-idp admin-create-user \
      --user-pool-id "$USER_POOL_ID" \
      --username "$email" \
      --temporary-password "$temp_password" \
      --message-action SUPPRESS \
      --user-attributes \
          Name=email,Value="$email" \
          Name=email_verified,Value=true \
          Name=given_name,Value="$given_name" \
          Name=family_name,Value="$family_name" \
          Name="custom:role",Value="$role" \
          Name="custom:organization",Value="$organization" \
      --region $REGION

    echo "✅ Created user: $email"
  else
    echo "✅ User already exists: $email"
  fi
}

# Create user groups
create_group() {
  local group_name=$1
  local description=$2
  
  echo "Creating group: $group_name"
  
  GROUP_EXISTS=$(aws cognito-idp get-group \
    --user-pool-id "$USER_POOL_ID" \
    --group-name "$group_name" \
    --region $REGION 2>/dev/null || echo "")
  
  if [ -z "$GROUP_EXISTS" ]; then
    aws cognito-idp create-group \
      --user-pool-id "$USER_POOL_ID" \
      --group-name "$group_name" \
      --description "$description" \
      --region $REGION
    
    echo "✅ Created group: $group_name"
  else
    echo "✅ Group already exists: $group_name"
  fi
}

# Create groups
create_group "Administrators" "Users with full administrative access"
create_group "Accountants" "Users with accounting department access"
create_group "Managers" "Users with reporting and approval access"
create_group "Providers" "External provider users with limited access"
create_group "ReadOnly" "Users with read-only access"

# Create example users
create_user "admin@dpp-accounting.example.com" "Admin" "User" "administrator" "Denver Preschool Program"
create_user "accountant@dpp-accounting.example.com" "Account" "Manager" "accountant" "Denver Preschool Program"
create_user "manager@dpp-accounting.example.com" "Department" "Manager" "manager" "Denver Preschool Program"
create_user "provider@example.com" "Provider" "Representative" "provider" "Example Preschool"
create_user "readonly@dpp-accounting.example.com" "Read" "Only" "readonly" "Denver Preschool Program"

# Add users to groups
add_user_to_group() {
  local username=$1
  local group_name=$2
  
  echo "Adding user $username to group $group_name"
  
  aws cognito-idp admin-add-user-to-group \
    --user-pool-id "$USER_POOL_ID" \
    --username "$username" \
    --group-name "$group_name" \
    --region $REGION
  
  echo "✅ Added user $username to group $group_name"
}

# Add users to appropriate groups
add_user_to_group "admin@dpp-accounting.example.com" "Administrators"
add_user_to_group "accountant@dpp-accounting.example.com" "Accountants"
add_user_to_group "manager@dpp-accounting.example.com" "Managers"
add_user_to_group "provider@example.com" "Providers"
add_user_to_group "readonly@dpp-accounting.example.com" "ReadOnly"

# Save configuration to file for future reference
cat > auth-config.json << EOF
{
  "userPoolId": "$USER_POOL_ID",
  "clientId": "$CLIENT_ID",
  "clientSecret": "$CLIENT_SECRET",
  "region": "$REGION",
  "domain": "$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com",
  "callbackUrls": [
    "http://localhost:3000/api/auth/callback/cognito",
    "https://dpp-accounting.example.com/api/auth/callback/cognito"
  ],
  "logoutUrls": [
    "http://localhost:3000/logout",
    "https://dpp-accounting.example.com/logout"
  ],
  "exampleUsers": [
    {
      "email": "admin@dpp-accounting.example.com",
      "role": "administrator",
      "group": "Administrators"
    },
    {
      "email": "accountant@dpp-accounting.example.com",
      "role": "accountant",
      "group": "Accountants"
    },
    {
      "email": "manager@dpp-accounting.example.com",
      "role": "manager",
      "group": "Managers"
    },
    {
      "email": "provider@example.com",
      "role": "provider",
      "group": "Providers"
    },
    {
      "email": "readonly@dpp-accounting.example.com",
      "role": "readonly",
      "group": "ReadOnly"
    }
  ]
}
EOF

echo "✅ Saved authentication configuration to auth-config.json"

# Update .env file with Cognito configuration
if [ -f ".env" ]; then
  # Check if COGNITO variables already exist in .env
  if grep -q "NEXT_PUBLIC_COGNITO_USER_POOL_ID" .env; then
    # Update existing variables
    sed -i "/NEXT_PUBLIC_COGNITO_USER_POOL_ID/c\NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID" .env
    sed -i "/NEXT_PUBLIC_COGNITO_CLIENT_ID/c\NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID" .env
    sed -i "/NEXT_PUBLIC_COGNITO_REGION/c\NEXT_PUBLIC_COGNITO_REGION=$REGION" .env
    sed -i "/COGNITO_CLIENT_SECRET/c\COGNITO_CLIENT_SECRET=$CLIENT_SECRET" .env
    sed -i "/NEXT_PUBLIC_COGNITO_DOMAIN/c\NEXT_PUBLIC_COGNITO_DOMAIN=$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com" .env
  else
    # Append new variables
    cat >> .env << EOF

# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
NEXT_PUBLIC_COGNITO_REGION=$REGION
COGNITO_CLIENT_SECRET=$CLIENT_SECRET
NEXT_PUBLIC_COGNITO_DOMAIN=$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com
EOF
  fi
  
  echo "✅ Updated .env file with Cognito configuration"
else
  # Create new .env file
  cat > .env << EOF
# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
NEXT_PUBLIC_COGNITO_REGION=$REGION
COGNITO_CLIENT_SECRET=$CLIENT_SECRET
NEXT_PUBLIC_COGNITO_DOMAIN=$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com
EOF
  
  echo "✅ Created .env file with Cognito configuration"
fi

# Update .env.example file with Cognito placeholders
if [ -f ".env.example" ]; then
  # Check if COGNITO variables already exist in .env.example
  if grep -q "NEXT_PUBLIC_COGNITO_USER_POOL_ID" .env.example; then
    echo "✅ .env.example already contains Cognito configuration"
  else
    # Append Cognito placeholders
    cat >> .env.example << EOF

# Cognito Configuration
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_example
NEXT_PUBLIC_COGNITO_CLIENT_ID=example
NEXT_PUBLIC_COGNITO_REGION=us-east-1
COGNITO_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_COGNITO_DOMAIN=your-domain.auth.us-east-1.amazoncognito.com
EOF
    
    echo "✅ Updated .env.example with Cognito configuration placeholders"
  fi
fi

# Summary
cat << EOF

=== Cognito Setup Summary ===
User Pool ID: $USER_POOL_ID
App Client ID: $CLIENT_ID
Region: $REGION
Domain: $DOMAIN_PREFIX.auth.$REGION.amazoncognito.com

Example Users:
- Administrator: admin@dpp-accounting.example.com
- Accountant: accountant@dpp-accounting.example.com
- Manager: manager@dpp-accounting.example.com
- Provider: provider@example.com
- Read-Only: readonly@dpp-accounting.example.com

Temporary password for all users: Temp1234!

User Groups:
- Administrators
- Accountants
- Managers
- Providers
- ReadOnly

Setup completed at: $(date +"%Y-%m-%d %H:%M:%S")
EOF

# Next steps
cat << EOF

Next steps:
1. Update your application with the Cognito configuration
2. Implement login/signup flows using the configurations in auth-config.json
3. Create authorization middleware using the user roles and groups
4. Set up secure token handling and session management

For local development, use the .env variables:
NEXT_PUBLIC_COGNITO_USER_POOL_ID=$USER_POOL_ID
NEXT_PUBLIC_COGNITO_CLIENT_ID=$CLIENT_ID
NEXT_PUBLIC_COGNITO_REGION=$REGION
COGNITO_CLIENT_SECRET=$CLIENT_SECRET
NEXT_PUBLIC_COGNITO_DOMAIN=$DOMAIN_PREFIX.auth.$REGION.amazoncognito.com
EOF