#!/bin/bash
# /workspace/DPP-Project/scripts/final-verification.sh

# Final Verification Script for DPP Accounting Platform
# This script performs a comprehensive verification of the application
# to ensure it's ready for production deployment.

# Exit on error
set -e

# Configuration
REPORT_PATH="verification-report-$(date +%Y%m%d%H%M%S).md"
REQUIRED_NODE_VERSION="18.0.0"
REQUIRED_NPM_VERSION="9.0.0"

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_header() {
  echo -e "\n${BLUE}=== $1 ===${NC}\n"
}

log_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
  echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Initialize report
initialize_report() {
  cat > "$REPORT_PATH" << EOL
# DPP Accounting Platform - Verification Report

**Date:** $(date)

## Summary

EOL
}

# Update the report with a section
update_report() {
  local section=$1
  local content=$2
  
  echo -e "\n## $section\n\n$content" >> "$REPORT_PATH"
}

# Verify environment
log_header "Verifying Environment"

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
echo "Node.js version: $NODE_VERSION"
if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
  log_success "Node.js version is adequate"
  NODE_VERSION_CHECK="✅ Node.js $NODE_VERSION"
else
  log_warning "Node.js version is below recommended $REQUIRED_NODE_VERSION"
  NODE_VERSION_CHECK="⚠️ Node.js $NODE_VERSION (recommended: $REQUIRED_NODE_VERSION or higher)"
fi

# Check NPM version
NPM_VERSION=$(npm -v)
echo "NPM version: $NPM_VERSION"
if [ "$(printf '%s\n' "$REQUIRED_NPM_VERSION" "$NPM_VERSION" | sort -V | head -n1)" = "$REQUIRED_NPM_VERSION" ]; then
  log_success "NPM version is adequate"
  NPM_VERSION_CHECK="✅ NPM $NPM_VERSION"
else
  log_warning "NPM version is below recommended $REQUIRED_NPM_VERSION"
  NPM_VERSION_CHECK="⚠️ NPM $NPM_VERSION (recommended: $REQUIRED_NPM_VERSION or higher)"
fi

# Verify package.json
log_header "Verifying package.json"

if [ ! -f "package.json" ]; then
  log_error "package.json not found"
  exit 1
fi

# Extract key package versions
REACT_VERSION=$(node -e "console.log(require('./package.json').dependencies.react || 'not found')")
NEXT_VERSION=$(node -e "console.log(require('./package.json').dependencies.next || 'not found')")
TS_VERSION=$(node -e "console.log(require('./package.json').devDependencies.typescript || 'not found')")
TAILWIND_VERSION=$(node -e "console.log(require('./package.json').devDependencies.tailwindcss || 'not found')")

echo "React version: $REACT_VERSION"
echo "Next.js version: $NEXT_VERSION"
echo "TypeScript version: $TS_VERSION"
echo "Tailwind CSS version: $TAILWIND_VERSION"

PACKAGE_INFO="- React: $REACT_VERSION
- Next.js: $NEXT_VERSION
- TypeScript: $TS_VERSION
- Tailwind CSS: $TAILWIND_VERSION"

# Check for Turbopack in scripts
if grep -q "turbo" package.json; then
  log_error "Turbopack found in package.json. This must be removed."
  TURBOPACK_CHECK="❌ Turbopack detected in package.json"
else
  log_success "No Turbopack found in package.json"
  TURBOPACK_CHECK="✅ No Turbopack detected"
fi

# Check dev script
DEV_SCRIPT=$(node -e "console.log(require('./package.json').scripts.dev || 'not found')")
if [[ "$DEV_SCRIPT" == *"turbo"* ]]; then
  log_error "Turbopack found in dev script: $DEV_SCRIPT"
  DEV_SCRIPT_CHECK="❌ Dev script contains Turbopack: '$DEV_SCRIPT'"
elif [[ "$DEV_SCRIPT" == "next dev" ]]; then
  log_success "Dev script is correct: $DEV_SCRIPT"
  DEV_SCRIPT_CHECK="✅ Dev script is correct: '$DEV_SCRIPT'"
else
  log_warning "Unexpected dev script: $DEV_SCRIPT"
  DEV_SCRIPT_CHECK="⚠️ Unexpected dev script: '$DEV_SCRIPT'"
fi

# Check build script
BUILD_SCRIPT=$(node -e "console.log(require('./package.json').scripts.build || 'not found')")
if [[ "$BUILD_SCRIPT" == "next build" ]]; then
  log_success "Build script is correct: $BUILD_SCRIPT"
  BUILD_SCRIPT_CHECK="✅ Build script is correct: '$BUILD_SCRIPT'"
else
  log_warning "Unexpected build script: $BUILD_SCRIPT"
  BUILD_SCRIPT_CHECK="⚠️ Unexpected build script: '$BUILD_SCRIPT'"
fi

# Check start script
START_SCRIPT=$(node -e "console.log(require('./package.json').scripts.start || 'not found')")
if [[ "$START_SCRIPT" == "next start" ]]; then
  log_success "Start script is correct: $START_SCRIPT"
  START_SCRIPT_CHECK="✅ Start script is correct: '$START_SCRIPT'"
else
  log_warning "Unexpected start script: $START_SCRIPT"
  START_SCRIPT_CHECK="⚠️ Unexpected start script: '$START_SCRIPT'"
fi

# Verify next.config.js
log_header "Verifying Next.js Configuration"

if [ ! -f "next.config.js" ]; then
  log_error "next.config.js not found"
  NEXT_CONFIG_CHECK="❌ next.config.js not found"
else
  log_success "next.config.js found"
  
  # Check for Turbopack in next.config.js
  if grep -q "turbo" next.config.js; then
    log_error "Turbopack found in next.config.js"
    NEXT_CONFIG_TURBO_CHECK="❌ Turbopack found in next.config.js"
  else
    log_success "No Turbopack found in next.config.js"
    NEXT_CONFIG_TURBO_CHECK="✅ No Turbopack found in next.config.js"
  fi
  
  # Check for reactStrictMode
  if grep -q "reactStrictMode: true" next.config.js; then
    log_success "reactStrictMode is set to true"
    STRICT_MODE_CHECK="✅ reactStrictMode is set to true"
  else
    log_warning "reactStrictMode may not be set to true"
    STRICT_MODE_CHECK="⚠️ reactStrictMode may not be set to true"
  fi
  
  # Check for poweredByHeader
  if grep -q "poweredByHeader: false" next.config.js; then
    log_success "poweredByHeader is set to false"
    POWERED_BY_CHECK="✅ poweredByHeader is set to false"
  else
    log_warning "poweredByHeader may not be set to false"
    POWERED_BY_CHECK="⚠️ poweredByHeader may not be set to false"
  fi
  
  NEXT_CONFIG_CHECK="✅ next.config.js found\n$NEXT_CONFIG_TURBO_CHECK\n$STRICT_MODE_CHECK\n$POWERED_BY_CHECK"
fi

# Verify required directories
log_header "Verifying Directory Structure"

REQUIRED_DIRS=("src" "src/app" "src/components" "src/lib" "src/types" "public" "docs" "scripts" "src/store")
MISSING_DIRS=()

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    log_success "Directory $dir exists"
  else
    log_error "Required directory $dir not found"
    MISSING_DIRS+=("$dir")
  fi
done

if [ ${#MISSING_DIRS[@]} -eq 0 ]; then
  DIRECTORY_CHECK="✅ All required directories exist"
else
  DIRECTORY_CHECK="❌ Missing required directories: ${MISSING_DIRS[*]}"
fi

# Verify documentation
log_header "Verifying Documentation"

REQUIRED_DOCS=(
  "docs/api-documentation.md"
  "docs/application-architecture.md"
  "docs/database-schema.md"
  "docs/deployment-guide.md"
  "docs/local-development-guide.md"
  "docs/aws-verification-guide.md"
  "README.md"
  "FINAL-PROJECT-SUMMARY.md"
)
MISSING_DOCS=()

for doc in "${REQUIRED_DOCS[@]}"; do
  if [ -f "$doc" ]; then
    log_success "Documentation $doc exists"
  else
    log_error "Required documentation $doc not found"
    MISSING_DOCS+=("$doc")
  fi
done

if [ ${#MISSING_DOCS[@]} -eq 0 ]; then
  DOCS_CHECK="✅ All required documentation exists"
else
  DOCS_CHECK="❌ Missing required documentation: ${MISSING_DOCS[*]}"
fi

# Verify AWS configuration
log_header "Verifying AWS Configuration"

if [ -f "verify_aws_access.sh" ] && [ -x "verify_aws_access.sh" ]; then
  echo "Checking AWS access..."
  if ./verify_aws_access.sh > /dev/null 2>&1; then
    log_success "AWS access verified successfully"
    AWS_CHECK="✅ AWS access verified successfully"
  else
    log_error "AWS access verification failed"
    AWS_CHECK="❌ AWS access verification failed"
  fi
else
  log_warning "AWS access verification script not found or not executable"
  AWS_CHECK="⚠️ AWS access verification script not found or not executable"
fi

# Check AWS configuration files
if [ -f "deployment-config.js" ]; then
  log_success "AWS deployment configuration file exists"
  AWS_CONFIG_CHECK="✅ AWS deployment configuration file exists"
else
  log_warning "AWS deployment configuration file missing"
  AWS_CONFIG_CHECK="⚠️ AWS deployment configuration file missing"
fi

# Clean installation verification
log_header "Verifying Clean Installation"

echo "Checking for node_modules..."
if [ -d "node_modules" ]; then
  echo "node_modules exists, proceeding with clean install test"
  
  # Move existing node_modules
  mkdir -p .temp
  mv node_modules .temp/
  mv package-lock.json .temp/ 2>/dev/null || true
  
  # Try a clean install
  echo "Attempting clean install..."
  if npm install; then
    log_success "Clean installation successful"
    CLEAN_INSTALL_CHECK="✅ Clean installation successful"
  else
    log_error "Clean installation failed"
    CLEAN_INSTALL_CHECK="❌ Clean installation failed"
  fi
  
  # Restore previous node_modules
  rm -rf node_modules
  mv .temp/node_modules .
  [ -f .temp/package-lock.json ] && mv .temp/package-lock.json .
  rm -rf .temp
else
  echo "No node_modules found, running fresh install..."
  if npm install; then
    log_success "Fresh installation successful"
    CLEAN_INSTALL_CHECK="✅ Fresh installation successful"
  else
    log_error "Fresh installation failed"
    CLEAN_INSTALL_CHECK="❌ Fresh installation failed"
  fi
fi

# Verify linting
log_header "Verifying Linting"

echo "Running ESLint..."
if npm run lint > lint_output.txt 2>&1; then
  log_success "Linting passed"
  LINT_CHECK="✅ Linting passed"
else
  log_error "Linting failed"
  LINT_CHECK="❌ Linting failed"
fi

# Verify TypeScript
log_header "Verifying TypeScript"

echo "Running TypeScript checks..."
if npm run type-check > typecheck_output.txt 2>&1; then
  log_success "TypeScript checks passed"
  TS_CHECK="✅ TypeScript checks passed"
else
  TS_ERROR_COUNT=$(grep -c "error TS" typecheck_output.txt)
  log_warning "TypeScript has $TS_ERROR_COUNT errors"
  TS_CHECK="⚠️ TypeScript has $TS_ERROR_COUNT errors"
fi

# Run TypeScript analysis tool
log_header "Running TypeScript Error Analysis"

if [ -f "scripts/check-typescript-errors.js" ]; then
  echo "Generating TypeScript error analysis report..."
  node scripts/check-typescript-errors.js
  if [ -f "typescript-error-report.md" ]; then
    log_success "TypeScript error analysis completed"
    TS_ANALYSIS_CHECK="✅ TypeScript error analysis report generated"
  else
    log_error "TypeScript error analysis failed"
    TS_ANALYSIS_CHECK="❌ TypeScript error analysis failed"
  fi
else
  log_warning "TypeScript error analysis script not found"
  TS_ANALYSIS_CHECK="⚠️ TypeScript error analysis script not found"
fi

# Verify build
log_header "Verifying Build"

echo "Building the application..."
if npm run build > build_output.txt 2>&1; then
  log_success "Build successful"
  BUILD_CHECK="✅ Build successful"
else
  log_error "Build failed"
  BUILD_CHECK="❌ Build failed"
fi

# Calculate overall status
TOTAL_CHECKS=12
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

# Count successes
[[ "$NODE_VERSION_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$NPM_VERSION_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$TURBOPACK_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$NEXT_CONFIG_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$DIRECTORY_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$DOCS_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$AWS_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$AWS_CONFIG_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$CLEAN_INSTALL_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$LINT_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$TS_CHECK" == ✅* ]] && ((PASSED_CHECKS++))
[[ "$BUILD_CHECK" == ✅* ]] && ((PASSED_CHECKS++))

# Count warnings
[[ "$NODE_VERSION_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$NPM_VERSION_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$TURBOPACK_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$NEXT_CONFIG_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$DIRECTORY_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$DOCS_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$AWS_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$AWS_CONFIG_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$CLEAN_INSTALL_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$LINT_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$TS_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))
[[ "$BUILD_CHECK" == ⚠️* ]] && ((WARNING_CHECKS++))

# Count failures
[[ "$NODE_VERSION_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$NPM_VERSION_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$TURBOPACK_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$NEXT_CONFIG_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$DIRECTORY_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$DOCS_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$AWS_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$AWS_CONFIG_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$CLEAN_INSTALL_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$LINT_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$TS_CHECK" == ❌* ]] && ((FAILED_CHECKS++))
[[ "$BUILD_CHECK" == ❌* ]] && ((FAILED_CHECKS++))

# Determine overall status
OVERALL_SCORE=$((100 * PASSED_CHECKS / TOTAL_CHECKS))

if [ $FAILED_CHECKS -gt 0 ]; then
  OVERALL_STATUS="❌ NOT READY - FIX CRITICAL ISSUES"
elif [ $WARNING_CHECKS -gt 0 ]; then
  OVERALL_STATUS="⚠️ READY WITH WARNINGS"
else
  OVERALL_STATUS="✅ READY FOR DEPLOYMENT"
fi

# Generate report
initialize_report

# Add summary section
SUMMARY="- **Total Checks:** $TOTAL_CHECKS
- **Passed:** $PASSED_CHECKS
- **Failed:** $FAILED_CHECKS
- **Warnings:** $WARNING_CHECKS
- **Overall Score:** $OVERALL_SCORE%

**Status:** $OVERALL_STATUS"

echo "$SUMMARY" >> "$REPORT_PATH"

# Add details to the report
update_report "Package Versions" "$PACKAGE_INFO"
update_report "Scripts Configuration" "$DEV_SCRIPT_CHECK\n$BUILD_SCRIPT_CHECK\n$START_SCRIPT_CHECK\n$TURBOPACK_CHECK"
update_report "Next.js Configuration" "$NEXT_CONFIG_CHECK"
update_report "Key Files and Directories" "$DIRECTORY_CHECK"
update_report "Documentation" "$DOCS_CHECK"
update_report "AWS Configuration" "$AWS_CHECK\n$AWS_CONFIG_CHECK"
update_report "Build Process" "$CLEAN_INSTALL_CHECK\n$LINT_CHECK\n$TS_CHECK\n$BUILD_CHECK"

# Add recommendations section
RECOMMENDATIONS="### Critical Issues to Fix"
if [ $FAILED_CHECKS -eq 0 ]; then
  RECOMMENDATIONS="$RECOMMENDATIONS\n- No critical issues found"
else
  [ "$TURBOPACK_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Remove Turbopack from package.json"
  [ "$NEXT_CONFIG_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Fix Next.js configuration issues"
  [ "$DIRECTORY_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Create missing key directories and files"
  [ "$DOCS_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Create missing documentation files"
  [ "$CLEAN_INSTALL_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Fix dependency issues preventing clean installation"
  [ "$LINT_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Address linting issues"
  [ "$BUILD_CHECK" == ❌* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Resolve build failures"
fi

RECOMMENDATIONS="$RECOMMENDATIONS\n\n### Recommendations"
if [ $WARNING_CHECKS -eq 0 ]; then
  RECOMMENDATIONS="$RECOMMENDATIONS\n- Continue monitoring for potential issues"
else
  [ "$TS_CHECK" == ⚠️* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Resolve TypeScript errors"
  [ "$NODE_VERSION_CHECK" == ⚠️* ] || [ "$NPM_VERSION_CHECK" == ⚠️* ] && RECOMMENDATIONS="$RECOMMENDATIONS\n- Update Node.js/NPM to recommended versions"
fi

update_report "Recommendations" "$RECOMMENDATIONS"

# Add next steps section
NEXT_STEPS="- Fix all critical errors\n- Run verification script again\n- Do not proceed with delivery until all errors are fixed"
update_report "Next Steps" "$NEXT_STEPS"

# Print summary
log_header "Verification Summary"
echo -e "Total Checks: $TOTAL_CHECKS"
echo -e "Passed: $PASSED_CHECKS"
echo -e "Failed: $FAILED_CHECKS"
echo -e "Warnings: $WARNING_CHECKS"
echo -e "Overall Score: $OVERALL_SCORE%"
echo
echo -e "Status: $OVERALL_STATUS"
echo
echo -e "Report saved to: $REPORT_PATH"

# Create symbolic link to the latest report
ln -sf "$REPORT_PATH" "verification-report-latest.md"