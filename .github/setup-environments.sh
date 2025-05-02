#!/bin/bash
# /workspace/DPP-Project/.github/setup-environments.sh
# Script to set up GitHub environments for multi-environment deployment

# Usage:
# This script should be run manually by a GitHub admin when setting up the repository.
# It requires the gh CLI to be installed and authenticated.

REPO_NAME=$1

if [ -z "$REPO_NAME" ]; then
  echo "Usage: ./setup-environments.sh <repository-name>"
  echo "Example: ./setup-environments.sh org/repository"
  exit 1
fi

echo "Setting up environments for $REPO_NAME"

# Create development environment
echo "Creating development environment..."
gh api -X PUT /repos/$REPO_NAME/environments/development \
  -f wait_timer=0 \
  -f reviewers=[] \
  -f deployment_branch_policy=null

# Create staging environment with approvals
echo "Creating staging environment..."
gh api -X PUT /repos/$REPO_NAME/environments/staging \
  -f wait_timer=0 \
  -f reviewers=[] \
  -f deployment_branch_policy=null

# Create production environment with approvals and branch restriction
echo "Creating production environment..."
gh api -X PUT /repos/$REPO_NAME/environments/production \
  -f wait_timer=60 \
  -f reviewers='[{"type": "Team", "id": 1}]' \
  -f deployment_branch_policy='{"protected_branches": true, "custom_branch_policies": false}'

echo "Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Add required secrets to your repository"
echo "2. Configure branch protection rules"
echo "3. Update reviewer IDs in the production environment"