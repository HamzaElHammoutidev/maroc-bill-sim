#!/usr/bin/env node

/**
 * Script to update components from useLanguage to useTranslation
 * This script will:
 * 1. Replace imports of useLanguage with useTranslation
 * 2. Replace useLanguage() calls with useTranslation()
 * 3. Update isRTL assignment to use i18n.dir() === 'rtl'
 * 
 * Usage: node update-translations.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Directory to scan for files
const rootDir = './src';

// Find all files in the project that import useLanguage
const findFilesWithUseLanguage = () => {
  try {
    const output = execSync(`grep -l "import { useLanguage }" --include="*.tsx" --include="*.ts" -r ${rootDir}`).toString();
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
};

// Update the content of a file
const updateFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statement
    content = content.replace(
      /import\s+{\s*useLanguage\s*}\s+from\s+['"]@\/contexts\/LanguageContext['"];?/g,
      `import { useTranslation } from 'react-i18next';`
    );
    
    // Replace useLanguage hook with useTranslation
    content = content.replace(
      /const\s+{\s*t\s*(?:,\s*language\s*)?(?:,\s*setLanguage\s*)?(?:,\s*isRTL\s*)?\s*}\s*=\s*useLanguage\(\);/g,
      (match) => {
        if (match.includes('isRTL')) {
          return `const { t, i18n } = useTranslation();\n  const isRTL = i18n.dir() === 'rtl';`;
        } else if (match.includes('language') && match.includes('setLanguage')) {
          return `const { t, i18n } = useTranslation();`;
        } else if (match.includes('language')) {
          return `const { t, i18n } = useTranslation();`;
        } else {
          return `const { t } = useTranslation();`;
        }
      }
    );
    
    // Replace language with i18n.language
    content = content.replace(/language(?!\s*[=:])/g, 'i18n.language');
    
    // Replace setLanguage with i18n.changeLanguage
    content = content.replace(/setLanguage\((['"][a-z]{2}['"])\)/g, 'i18n.changeLanguage($1)');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
};

// Main function
const main = () => {
  console.log('Finding files with useLanguage...');
  const files = findFilesWithUseLanguage();
  
  if (files.length === 0) {
    console.log('No files found with useLanguage imports.');
    return;
  }
  
  console.log(`Found ${files.length} files to update.`);
  
  let successCount = 0;
  for (const file of files) {
    const updated = updateFile(file);
    if (updated) {
      successCount++;
    }
  }
  
  console.log(`\nUpdated ${successCount} of ${files.length} files successfully.`);
  console.log('Remember to manually check all files for any edge cases that weren\'t automatically updated.');
};

main(); 