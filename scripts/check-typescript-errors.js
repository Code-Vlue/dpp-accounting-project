#!/usr/bin/env node
// /workspace/DPP-Project/scripts/check-typescript-errors.js

/**
 * TypeScript Error Analyzer
 * 
 * This script analyzes TypeScript compiler errors, categorizes them,
 * and generates a detailed report with statistics and recommendations.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_REPORT_FILE = 'typescript-error-report.md';
const TS_CONFIG_PATH = './tsconfig.json';
const MAX_FILES_TO_SHOW = 10;
const MAX_ERROR_TYPES_TO_SHOW = 10;

/**
 * Main function to run the analysis and generate report
 */
async function main() {
  console.log('🔍 TypeScript Error Analyzer');
  console.log('============================');
  
  // Step 1: Check if TypeScript is installed
  try {
    console.log('Checking TypeScript installation...');
    execSync('npx tsc --version', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ TypeScript is not installed. Please run: npm install typescript');
    process.exit(1);
  }
  
  // Step 2: Check if tsconfig.json exists
  if (!fs.existsSync(TS_CONFIG_PATH)) {
    console.error(`❌ TypeScript configuration file not found at: ${TS_CONFIG_PATH}`);
    process.exit(1);
  }
  
  // Step 3: Run TypeScript compiler to get errors
  console.log('Running TypeScript compiler check...');
  let tsOutput;
  try {
    tsOutput = execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
    console.log('✅ No TypeScript errors found!');
    
    // Generate success report
    generateSuccessReport();
    return;
  } catch (error) {
    tsOutput = error.stdout.toString();
    console.log(`Found TypeScript errors. Analyzing...`);
  }
  
  // Step 4: Parse and analyze errors
  const errors = parseTypeScriptErrors(tsOutput);
  console.log(`Found ${errors.length} TypeScript errors.`);
  
  // Step 5: Analyze and categorize errors
  const analysis = analyzeErrors(errors);
  
  // Step 6: Generate report
  generateErrorReport(errors, analysis);
  
  console.log(`\n📊 Error analysis complete! Report saved to: ${OUTPUT_REPORT_FILE}`);
}

/**
 * Parse TypeScript compiler output into structured error objects
 */
function parseTypeScriptErrors(output) {
  const errors = [];
  const lines = output.split('\n');
  
  // Regular expression to match TS error lines
  // Format: file(line,col): error TS1234: Error message
  const errorRegex = /^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/;
  
  for (const line of lines) {
    const match = line.match(errorRegex);
    if (match) {
      errors.push({
        filePath: match[1],
        fileName: path.basename(match[1]),
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5]
      });
    }
  }
  
  return errors;
}

/**
 * Analyze errors to generate statistics and recommendations
 */
function analyzeErrors(errors) {
  // Group errors by file
  const fileErrors = {};
  errors.forEach(error => {
    if (!fileErrors[error.filePath]) {
      fileErrors[error.filePath] = [];
    }
    fileErrors[error.filePath].push(error);
  });
  
  // Group errors by error code
  const errorTypeCount = {};
  errors.forEach(error => {
    if (!errorTypeCount[error.code]) {
      errorTypeCount[error.code] = 0;
    }
    errorTypeCount[error.code]++;
  });
  
  // Group errors by directory
  const directoryErrors = {};
  errors.forEach(error => {
    const directory = path.dirname(error.filePath);
    if (!directoryErrors[directory]) {
      directoryErrors[directory] = 0;
    }
    directoryErrors[directory]++;
  });
  
  // Sort files by error count
  const sortedFiles = Object.entries(fileErrors)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([filePath, fileErrors]) => ({
      filePath,
      fileName: path.basename(filePath),
      count: fileErrors.length
    }));
  
  // Sort error types by frequency
  const sortedErrorTypes = Object.entries(errorTypeCount)
    .sort((a, b) => b[1] - a[1])
    .map(([code, count]) => ({ code, count }));
  
  // Sort directories by error count
  const sortedDirectories = Object.entries(directoryErrors)
    .sort((a, b) => b[1] - a[1])
    .map(([directory, count]) => ({ directory, count }));
  
  return {
    totalErrors: errors.length,
    fileCount: Object.keys(fileErrors).length,
    errorTypeCount: Object.keys(errorTypeCount).length,
    mostErrorProneFiles: sortedFiles.slice(0, MAX_FILES_TO_SHOW),
    mostCommonErrorTypes: sortedErrorTypes.slice(0, MAX_ERROR_TYPES_TO_SHOW),
    mostErrorProneDirectories: sortedDirectories.slice(0, MAX_FILES_TO_SHOW),
    allErrorsByFile: fileErrors
  };
}

/**
 * Generate recommendations based on common error types
 */
function generateRecommendations(errorTypes) {
  const recommendations = [];
  
  // Common TypeScript error codes and recommendations
  const errorRecommendations = {
    'TS2307': {
      title: 'Module not found errors',
      description: "These errors occur when TypeScript can't find imported modules.",
      steps: [
        'Check import paths for typos',
        'Ensure the module is installed (for npm packages)',
        'Add module declaration files with `npm install --save-dev @types/[package-name]`',
        'Create custom declaration files (.d.ts) for custom modules'
      ]
    },
    'TS2339': {
      title: 'Property does not exist errors',
      description: "These errors occur when accessing properties that don't exist on an object type.",
      steps: [
        'Check for typos in property names',
        'Add the missing property to the interface/type definition',
        'Use optional chaining (`?.`) for properties that might not exist',
        'Use type guards to narrow types before accessing properties'
      ]
    },
    'TS2322': {
      title: 'Type assignment errors',
      description: "These errors occur when assigning a value of the wrong type.",
      steps: [
        'Update the variable type declaration to match the assigned value',
        'Convert the value to the expected type',
        'Use type assertions when you know more about the type than TypeScript does',
        'Consider using a union type if the variable can accept multiple types'
      ]
    },
    'TS2345': {
      title: 'Argument type errors',
      description: "These errors occur when passing the wrong type of argument to a function.",
      steps: [
        'Check the function signature for the expected parameter types',
        'Convert the argument to the expected type before passing it',
        'Update the function definition if it should accept the provided type',
        'Use generic functions when working with multiple types'
      ]
    },
    'TS2531': {
      title: 'Object is possibly null errors',
      description: "These errors occur when accessing properties on potentially null/undefined objects.",
      steps: [
        'Add null checks before accessing properties (`if (obj) { obj.prop }`)',
        'Use optional chaining (`obj?.prop`)',
        'Use the non-null assertion operator when appropriate (`obj!.prop`)',
        'Make the property non-nullable in the type definition'
      ]
    },
    'TS2741': {
      title: 'Interface implementation errors',
      description: "These errors occur when a class doesn't properly implement an interface.",
      steps: [
        'Implement all required properties and methods from the interface',
        'Ensure method signatures exactly match the interface definition',
        'Check return types match the interface requirements',
        'Consider using abstract classes instead of interfaces for complex implementations'
      ]
    },
    'TS7006': {
      title: 'Implicit any errors',
      description: "These errors occur when TypeScript can't infer the type of a variable.",
      steps: [
        'Add explicit type annotations to variables and parameters',
        'Enable `noImplicitAny: false` in tsconfig.json (not recommended for type safety)',
        'Use the `any` type explicitly where appropriate',
        'Create interfaces or type aliases for complex types'
      ]
    }
  };
  
  // Add general recommendations
  recommendations.push({
    title: 'General TypeScript Error Resolution',
    description: 'These steps can help you address TypeScript errors systematically:',
    steps: [
      'Start by fixing the files with the most errors',
      'Address one error type at a time across the codebase',
      'Create or update interfaces for consistent typing',
      'Use proper TypeScript utility types (Partial, Pick, Omit, etc.)',
      'Consider adding ESLint with TypeScript rules for ongoing enforcement',
      'Update your dependencies and TypeScript version regularly'
    ]
  });
  
  // Add specific recommendations based on the most common errors
  errorTypes.forEach(({ code }) => {
    if (errorRecommendations[code]) {
      recommendations.push(errorRecommendations[code]);
    }
  });
  
  return recommendations;
}

/**
 * Generate a Markdown report for TypeScript errors
 */
function generateErrorReport(errors, analysis) {
  const { 
    totalErrors, 
    fileCount, 
    errorTypeCount, 
    mostErrorProneFiles, 
    mostCommonErrorTypes,
    mostErrorProneDirectories,
    allErrorsByFile 
  } = analysis;
  
  // Generate recommendations based on common error types
  const recommendations = generateRecommendations(mostCommonErrorTypes);
  
  // Sample errors for the most common error types
  const errorSamples = {};
  mostCommonErrorTypes.forEach(({ code }) => {
    errorSamples[code] = errors.find(e => e.code === code);
  });
  
  // Create the report
  let report = `# TypeScript Error Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary statistics
  report += `## Summary\n\n`;
  report += `- **Total Errors:** ${totalErrors}\n`;
  report += `- **Files with Errors:** ${fileCount}\n`;
  report += `- **Distinct Error Types:** ${errorTypeCount}\n\n`;
  
  // Progress indicators
  const filesWithoutErrors = mostErrorProneFiles.length === 0;
  report += `### Status\n\n`;
  report += filesWithoutErrors 
    ? `✅ **PASSING:** No TypeScript errors detected.\n\n`
    : `❌ **FAILING:** TypeScript errors found in ${fileCount} files.\n\n`;
  
  // Most error-prone files
  if (mostErrorProneFiles.length > 0) {
    report += `## Most Error-Prone Files\n\n`;
    report += `| File | Error Count |\n`;
    report += `| ---- | ----------- |\n`;
    mostErrorProneFiles.forEach(file => {
      report += `| ${file.filePath} | ${file.count} |\n`;
    });
    report += `\n`;
  }
  
  // Most error-prone directories
  if (mostErrorProneDirectories.length > 0) {
    report += `## Most Error-Prone Directories\n\n`;
    report += `| Directory | Error Count |\n`;
    report += `| --------- | ----------- |\n`;
    mostErrorProneDirectories.forEach(dir => {
      report += `| ${dir.directory} | ${dir.count} |\n`;
    });
    report += `\n`;
  }
  
  // Most common error types
  if (mostCommonErrorTypes.length > 0) {
    report += `## Most Common Error Types\n\n`;
    report += `| Error Code | Count | Description |\n`;
    report += `| ---------- | ----- | ----------- |\n`;
    mostCommonErrorTypes.forEach(error => {
      const sample = errorSamples[error.code];
      const description = sample ? sample.message : 'Unknown error';
      report += `| ${error.code} | ${error.count} | ${description} |\n`;
    });
    report += `\n`;
  }
  
  // Recommendations section
  if (recommendations.length > 0) {
    report += `## Recommendations\n\n`;
    recommendations.forEach(rec => {
      report += `### ${rec.title}\n\n`;
      report += `${rec.description}\n\n`;
      report += `**Steps to resolve:**\n\n`;
      rec.steps.forEach(step => {
        report += `- ${step}\n`;
      });
      report += `\n`;
    });
  }
  
  // Detailed errors by file
  if (Object.keys(allErrorsByFile).length > 0) {
    report += `## Detailed Errors by File\n\n`;
    Object.entries(allErrorsByFile).forEach(([filePath, fileErrors]) => {
      report += `### ${filePath}\n\n`;
      report += `| Line | Column | Error Code | Message |\n`;
      report += `| ---- | ------ | ---------- | ------- |\n`;
      fileErrors.forEach(error => {
        report += `| ${error.line} | ${error.column} | ${error.code} | ${error.message} |\n`;
      });
      report += `\n`;
    });
  }
  
  // Next steps section
  report += `## Next Steps\n\n`;
  if (filesWithoutErrors) {
    report += `🎉 Congratulations! Your codebase is TypeScript error-free. Here are some next steps:\n\n`;
    report += `- Consider making your TypeScript configuration stricter for better type safety\n`;
    report += `- Add more comprehensive type definitions where appropriate\n`;
    report += `- Implement runtime type validation for API boundaries\n`;
    report += `- Set up automated TypeScript checks in your CI/CD pipeline\n`;
  } else {
    report += `Here's a suggested plan of action to resolve the TypeScript errors:\n\n`;
    report += `1. **Start with high-impact fixes first:**\n`;
    report += `   - Address the most common error types that affect multiple files\n`;
    report += `   - Fix errors in critical application components first\n\n`;
    report += `2. **Improve your type definitions:**\n`;
    report += `   - Create proper interfaces for your data structures\n`;
    report += `   - Define function parameter and return types explicitly\n\n`;
    report += `3. **Set incremental goals:**\n`;
    report += `   - Aim to reduce errors by 20% each sprint\n`;
    report += `   - Prioritize fixing errors that affect the application runtime\n\n`;
    report += `4. **Consider gradual typing:**\n`;
    report += `   - For large codebases, temporarily use the any type where needed\n`;
    report += `   - Replace any with proper types over time\n`;
    report += `   - Use // @ts-ignore sparingly for third-party code issues\n\n`;
  }
  
  // Save the report to a file
  fs.writeFileSync(OUTPUT_REPORT_FILE, report);
}

/**
 * Generate a success report when no TypeScript errors are found
 */
function generateSuccessReport() {
  let report = `# TypeScript Error Analysis Report\n\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;
  
  // Summary statistics
  report += `## Summary\n\n`;
  report += `- **Total Errors:** 0\n`;
  report += `- **Files with Errors:** 0\n`;
  report += `- **Distinct Error Types:** 0\n\n`;
  
  // Status section
  report += `### Status\n\n`;
  report += `✅ **PASSING:** No TypeScript errors detected.\n\n`;
  
  // Recommendations for type-safe code
  report += `## Recommendations for Maintaining Type Safety\n\n`;
  
  report += `### Continue TypeScript Best Practices\n\n`;
  report += `Even with a clean TypeScript codebase, consider these practices to maintain type safety:\n\n`;
  report += `- Avoid using the \`any\` type wherever possible\n`;
  report += `- Use strict null checks consistently\n`;
  report += `- Add explicit return types to all functions\n`;
  report += `- Create interfaces for all data structures\n`;
  report += `- Use TypeScript utility types (Partial, Omit, Pick, etc.) when appropriate\n`;
  report += `- Consider enabling stricter TypeScript configuration\n\n`;
  
  report += `### Consider Advanced TypeScript Features\n\n`;
  report += `Now that your codebase is error-free, you might want to explore:\n\n`;
  report += `- Generics for more reusable components and functions\n`;
  report += `- Discriminated unions for type-safe state management\n`;
  report += `- Branded types for improved type safety\n`;
  report += `- Conditional types for advanced type transformations\n`;
  report += `- Type guards for runtime type checking\n\n`;
  
  report += `## Next Steps\n\n`;
  report += `🎉 Congratulations! Your codebase is TypeScript error-free. Here are some next steps:\n\n`;
  report += `- Consider making your TypeScript configuration stricter for better type safety\n`;
  report += `- Add unit tests that verify type correctness at runtime\n`;
  report += `- Implement runtime type validation for API boundaries\n`;
  report += `- Set up automated TypeScript checks in your CI/CD pipeline\n`;
  
  // Save the report to a file
  fs.writeFileSync(OUTPUT_REPORT_FILE, report);
}

// Run the main function
main().catch(error => {
  console.error('Error running TypeScript error analysis:', error);
  process.exit(1);
});