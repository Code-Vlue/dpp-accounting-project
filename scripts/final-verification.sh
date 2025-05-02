#!/bin/bash

# Terminal colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters for summary
PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0

# Display header
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   DPP Accounting Platform Final Verification ${NC}"
echo -e "${BLUE}==============================================${NC}"
echo

# Function to print success message and increment counter
function print_success() {
  echo -e "✅ ${GREEN}SUCCESS:${NC} $1"
  ((PASS_COUNT++))
}

# Function to print warning message and increment counter
function print_warning() {
  echo -e "⚠️ ${YELLOW}WARNING:${NC} $1"
  ((WARN_COUNT++))
}

# Function to print failure message and increment counter
function print_fail() {
  echo -e "❌ ${RED}FAILURE:${NC} $1"
  ((FAIL_COUNT++))
}

# Function to print section header
function print_section() {
  echo
  echo -e "${BLUE}► $1${NC}"
  echo -e "${BLUE}---------------------------------------------${NC}"
}

# Create verification report file
REPORT_FILE="verification-report-$(date +%Y%m%d%H%M%S).md"
echo "# DPP Accounting Platform Verification Report" > $REPORT_FILE
echo "" >> $REPORT_FILE
echo "Generated: $(date)" >> $REPORT_FILE
echo "" >> $REPORT_FILE

#---------------------------------------------------------
# Check package versions
#---------------------------------------------------------
print_section "Package Version Verification"

# Check if package.json exists
if [ ! -f "package.json" ]; then
  print_fail "package.json not found"
else
  # Check React version
  REACT_VERSION=$(node -e "const pkg=require('./package.json'); console.log(pkg.dependencies?.react || 'not found')")
  if [[ "$REACT_VERSION" == "18.2.0" ]]; then
    print_success "React version is correct: $REACT_VERSION"
    echo "- React version: $REACT_VERSION ✅" >> $REPORT_FILE
  else
    print_fail "React version is incorrect: $REACT_VERSION (expected 18.2.0)"
    echo "- React version: $REACT_VERSION ❌ (expected 18.2.0)" >> $REPORT_FILE
  fi

  # Check Next.js version
  NEXTJS_VERSION=$(node -e "const pkg=require('./package.json'); console.log(pkg.dependencies?.next || 'not found')")
  if [[ "$NEXTJS_VERSION" == "14.2.0" ]]; then
    print_success "Next.js version is correct: $NEXTJS_VERSION"
    echo "- Next.js version: $NEXTJS_VERSION ✅" >> $REPORT_FILE
  else
    print_fail "Next.js version is incorrect: $NEXTJS_VERSION (expected 14.2.0)"
    echo "- Next.js version: $NEXTJS_VERSION ❌ (expected 14.2.0)" >> $REPORT_FILE
  fi

  # Check TypeScript version
  TS_VERSION=$(node -e "const pkg=require('./package.json'); console.log(pkg.devDependencies?.typescript || 'not found')")
  if [[ "$TS_VERSION" == "5.3.3" ]]; then
    print_success "TypeScript version is correct: $TS_VERSION"
    echo "- TypeScript version: $TS_VERSION ✅" >> $REPORT_FILE
  else
    print_fail "TypeScript version is incorrect: $TS_VERSION (expected 5.3.3)"
    echo "- TypeScript version: $TS_VERSION ❌ (expected 5.3.3)" >> $REPORT_FILE
  fi

  # Check Tailwind CSS version
  TAILWIND_VERSION=$(node -e "const pkg=require('./package.json'); console.log(pkg.devDependencies?.tailwindcss || 'not found')")
  if [[ "$TAILWIND_VERSION" == "3.4.0" ]]; then
    print_success "Tailwind CSS version is correct: $TAILWIND_VERSION"
    echo "- Tailwind CSS version: $TAILWIND_VERSION ✅" >> $REPORT_FILE
  else
    print_fail "Tailwind CSS version is incorrect: $TAILWIND_VERSION (expected 3.4.0)"
    echo "- Tailwind CSS version: $TAILWIND_VERSION ❌ (expected 3.4.0)" >> $REPORT_FILE
  fi

  # Check for required development scripts
  DEV_SCRIPT=$(node -e "const pkg=require('./package.json'); console.log(pkg.scripts?.dev || 'not found')")
  if [[ "$DEV_SCRIPT" == "next dev" ]]; then
    print_success "Dev script is correctly configured: '$DEV_SCRIPT'"
    echo "- Dev script: $DEV_SCRIPT ✅" >> $REPORT_FILE
  else
    print_fail "Dev script is incorrectly configured: '$DEV_SCRIPT' (expected 'next dev')"
    echo "- Dev script: $DEV_SCRIPT ❌ (expected 'next dev')" >> $REPORT_FILE
  fi

  # Check for Turbopack usage (which should be avoided)
  if grep -q "turbo" package.json; then
    print_fail "Turbopack detected in package.json (should be avoided)"
    echo "- Turbopack usage: Detected ❌ (should be removed)" >> $REPORT_FILE
  else
    print_success "No Turbopack detected in package.json"
    echo "- Turbopack usage: Not detected ✅" >> $REPORT_FILE
  fi
fi

#---------------------------------------------------------
# Directory and file structure verification
#---------------------------------------------------------
print_section "Directory and File Structure Verification"
echo "" >> $REPORT_FILE
echo "## Directory and File Structure" >> $REPORT_FILE

# Check for required directories
REQUIRED_DIRS=("src" "src/app" "src/components" "src/lib" "scripts" "docs" "src/store" "src/types")
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    print_success "Required directory exists: $dir"
    echo "- Directory: $dir ✅" >> $REPORT_FILE
  else
    print_fail "Required directory missing: $dir"
    echo "- Directory: $dir ❌" >> $REPORT_FILE
  fi
done

# Check for critical files
CRITICAL_FILES=(
  "next.config.js" 
  "tailwind.config.js" 
  "tsconfig.json" 
  "src/app/layout.tsx" 
  "src/app/page.tsx" 
  "CLAUDE.md" 
  "CLAUDEtask-archive.md"
  "docs/application-architecture.md"
  "docs/deployment-guide.md"
  "docs/api-documentation.md"
  "verification-report-final.md"
)

for file in "${CRITICAL_FILES[@]}"; do
  if [ -f "$file" ]; then
    print_success "Critical file exists: $file"
    echo "- File: $file ✅" >> $REPORT_FILE
  else
    print_fail "Critical file missing: $file"
    echo "- File: $file ❌" >> $REPORT_FILE
  fi
done

# Check for empty critical files (files that shouldn't be empty)
NON_EMPTY_CRITICAL_FILES=(
  "src/app/layout.tsx" 
  "src/app/page.tsx"
  "docs/application-architecture.md"
  "docs/deployment-guide.md"
)

for file in "${NON_EMPTY_CRITICAL_FILES[@]}"; do
  if [ -f "$file" ] && [ -s "$file" ]; then
    print_success "File has content: $file"
  elif [ -f "$file" ]; then
    print_warning "File exists but is empty: $file"
    echo "- File content: $file ⚠️ (file is empty)" >> $REPORT_FILE
  fi
done

#---------------------------------------------------------
# Build process verification
#---------------------------------------------------------
print_section "Build Process Verification"
echo "" >> $REPORT_FILE
echo "## Build Process Verification" >> $REPORT_FILE

# Check ESLint
echo "Running ESLint..."
npm run lint > lint_output.txt 2>&1
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
  print_success "ESLint completed successfully"
  echo "- ESLint: PASS ✅" >> $REPORT_FILE
else
  print_warning "ESLint found issues (exit code: $LINT_EXIT_CODE)"
  LINT_ISSUES=$(grep -c "error" lint_output.txt)
  echo "- ESLint: WARNING ⚠️ ($LINT_ISSUES issues found)" >> $REPORT_FILE
  echo "  See lint_output.txt for details" >> $REPORT_FILE
fi

# Check TypeScript
echo "Running TypeScript check..."
npm run type-check > typecheck_output.txt 2>&1
TS_EXIT_CODE=$?

if [ $TS_EXIT_CODE -eq 0 ]; then
  print_success "TypeScript check completed successfully"
  echo "- TypeScript check: PASS ✅" >> $REPORT_FILE
else
  ERROR_COUNT=$(grep -c "error TS" typecheck_output.txt)
  print_warning "TypeScript check found $ERROR_COUNT errors (exit code: $TS_EXIT_CODE)"
  echo "- TypeScript check: WARNING ⚠️ ($ERROR_COUNT errors found)" >> $REPORT_FILE
  echo "  See typecheck_output.txt for details" >> $REPORT_FILE
fi

# Attempt a build
echo "Attempting to build application..."
npm run build > build_output.txt 2>&1
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
  print_success "Build completed successfully"
  echo "- Build: PASS ✅" >> $REPORT_FILE
else
  print_fail "Build failed (exit code: $BUILD_EXIT_CODE)"
  echo "- Build: FAIL ❌" >> $REPORT_FILE
  echo "  See build_output.txt for details" >> $REPORT_FILE
fi

#---------------------------------------------------------
# AWS Configuration Verification
#---------------------------------------------------------
print_section "AWS Configuration Verification"
echo "" >> $REPORT_FILE
echo "## AWS Configuration" >> $REPORT_FILE

# Check for AWS verification scripts
EXPECTED_AWS_SCRIPTS=("verify_aws_access.sh" "verify_aws_deployment_readiness.sh")
for script in "${EXPECTED_AWS_SCRIPTS[@]}"; do
  if [ -f "$script" ] && [ -x "$script" ]; then
    print_success "AWS verification script exists and is executable: $script"
    echo "- AWS script: $script ✅" >> $REPORT_FILE
  elif [ -f "$script" ]; then
    print_warning "AWS verification script exists but is not executable: $script"
    echo "- AWS script: $script ⚠️ (not executable)" >> $REPORT_FILE
  else
    print_fail "AWS verification script missing: $script"
    echo "- AWS script: $script ❌" >> $REPORT_FILE
  fi
done

# Check AWS environmental variables in .env
AWS_ENV_VARS=("AWS_REGION" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY")
if [ -f ".env" ]; then
  echo "Checking AWS environment variables in .env..."
  for var in "${AWS_ENV_VARS[@]}"; do
    if grep -q "^$var=" .env; then
      VAR_VALUE=$(grep "^$var=" .env | cut -d= -f2)
      if [ -n "$VAR_VALUE" ] && [ "$VAR_VALUE" != "your_access_key_id" ] && [ "$VAR_VALUE" != "your_secret_access_key" ]; then
        print_success "AWS environment variable properly set: $var"
        echo "- AWS env var: $var ✅" >> $REPORT_FILE
      else
        print_warning "AWS environment variable has placeholder value: $var"
        echo "- AWS env var: $var ⚠️ (placeholder value)" >> $REPORT_FILE
      fi
    else
      print_fail "AWS environment variable missing from .env: $var"
      echo "- AWS env var: $var ❌ (missing)" >> $REPORT_FILE
    fi
  done
else
  print_fail ".env file missing"
  echo "- .env file: Missing ❌" >> $REPORT_FILE
fi

#---------------------------------------------------------
# Documentation Verification
#---------------------------------------------------------
print_section "Documentation Verification"
echo "" >> $REPORT_FILE
echo "## Documentation Verification" >> $REPORT_FILE

# Expected documentation files
DOC_FILES=(
  "docs/application-architecture.md"
  "docs/api-documentation.md"
  "docs/database-schema.md"
  "docs/deployment-guide.md"
  "docs/local-development-guide.md"
  "docs/aws-verification-guide.md"
  "README.md"
  "verification-report-final.md"
  "FINAL-PROJECT-SUMMARY.md"
)

for doc in "${DOC_FILES[@]}"; do
  if [ -f "$doc" ]; then
    DOC_LINES=$(wc -l < "$doc")
    if [ $DOC_LINES -gt 10 ]; then
      print_success "Documentation file exists with substantial content: $doc ($DOC_LINES lines)"
      echo "- Doc file: $doc ✅ ($DOC_LINES lines)" >> $REPORT_FILE
    else
      print_warning "Documentation file exists but has minimal content: $doc ($DOC_LINES lines)"
      echo "- Doc file: $doc ⚠️ (only $DOC_LINES lines)" >> $REPORT_FILE
    fi
  else
    print_fail "Documentation file missing: $doc"
    echo "- Doc file: $doc ❌" >> $REPORT_FILE
  fi
done

#---------------------------------------------------------
# Summarize results
#---------------------------------------------------------
print_section "Verification Summary"
echo "" >> $REPORT_FILE
echo "## Verification Summary" >> $REPORT_FILE

TOTAL_CHECKS=$((PASS_COUNT + WARN_COUNT + FAIL_COUNT))

echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${YELLOW}Warnings:${NC} $WARN_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"
echo -e "Total checks: $TOTAL_CHECKS"

# Add summary to report file
echo "- Passed: $PASS_COUNT" >> $REPORT_FILE
echo "- Warnings: $WARN_COUNT" >> $REPORT_FILE
echo "- Failed: $FAIL_COUNT" >> $REPORT_FILE
echo "- Total checks: $TOTAL_CHECKS" >> $REPORT_FILE

# Overall assessment
if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
  echo -e "\n${GREEN}✅ VERIFICATION SUCCESSFUL: All checks passed${NC}"
  echo -e "\nRecommendation: Project is ready for delivery"
  echo -e "\n✅ VERIFICATION SUCCESSFUL: All checks passed" >> $REPORT_FILE
  echo -e "\nRecommendation: Project is ready for delivery" >> $REPORT_FILE
elif [ $FAIL_COUNT -eq 0 ]; then
  echo -e "\n${YELLOW}⚠️ VERIFICATION PARTIALLY SUCCESSFUL: No failures, but warnings exist${NC}"
  echo -e "\nRecommendation: Address warnings before delivery if possible"
  echo -e "\n⚠️ VERIFICATION PARTIALLY SUCCESSFUL: No failures, but warnings exist" >> $REPORT_FILE
  echo -e "\nRecommendation: Address warnings before delivery if possible" >> $REPORT_FILE
else
  echo -e "\n${RED}❌ VERIFICATION FAILED: $FAIL_COUNT checks failed${NC}"
  echo -e "\nRecommendation: Critical issues must be fixed before delivery"
  echo -e "\n❌ VERIFICATION FAILED: $FAIL_COUNT checks failed" >> $REPORT_FILE
  echo -e "\nRecommendation: Critical issues must be fixed before delivery" >> $REPORT_FILE
fi

echo 
echo -e "Detailed verification report saved to: ${BLUE}$REPORT_FILE${NC}"
echo
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE}   Verification Process Complete             ${NC}"
echo -e "${BLUE}==============================================${NC}"