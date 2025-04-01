// find-missing-translations.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Use createRequire to import glob package (which doesn't have a proper ESM version)
const require = createRequire(import.meta.url);
const glob = require('glob');

// Configuration
const SRC_DIR = './src'; // Your source code directory
const TRANSLATION_FILE = '/Users/hamza.elhammouti/Documents/other-projects/maroc-bill-sim/public/locales/fr/translation.json'; // Path to your primary translation file
const OUTPUT_FILE = './missing-translations.json'; // Where to save results

// Regular expressions to match translation keys in different contexts
const TRANSLATION_PATTERNS = [
  /t\(['"](.+?)['"]\)/g,                // t('key')
  /t\s*\(\s*['"]([\w.-]+)['"][),]/g,    // t( 'key' )
  /\{t\(['"](.+?)['"]\)\}/g,            // {t('key')}
  /\{t\((["'])(.+?)\1\)\}/g,            // {t("key")}
  /t\(['"](.+?)(['"](?:,\s*{.+?})?)\)/g, // t('key', { count: 5 })
  /title=["'](.+?)["']/g,               // title="quotes.title" (for PageHeader component)
  /description=["'](.+?)["']/g,         // description="quotes.description"
  /label=["'](.+?)["']/g,               // label="common.save"
];

// Function to extract translation keys from a file
async function extractKeysFromFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const keys = new Set();
  
  TRANSLATION_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // The actual key might be in capturing group 1 or 2 depending on the regex
      const key = match[1];
      // Skip if key starts with a variable or contains a template literal
      if (!key.includes('${') && !key.includes('{') && !key.startsWith('`')) {
        keys.add(key);
      }
    }
  });
  
  return Array.from(keys);
}

// Function to load translation JSON
async function loadTranslations(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading translation file ${filePath}:`, error.message);
    return {};
  }
}

// Function to flatten nested translation object into dot notation keys
function flattenTranslations(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenTranslations(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }
    
    return acc;
  }, {});
}

// Main function
async function findMissingTranslations() {
  // Find all JS/JSX/TS/TSX files
  const files = glob.sync(`${SRC_DIR}/**/*.{js,jsx,ts,tsx}`, {
    ignore: ['**/node_modules/**', '**/.git/**']
  });
  
  console.log(`Found ${files.length} files to scan`);
  
  // Extract all translation keys from the codebase
  const allKeys = new Set();
  for (const file of files) {
    const keys = await extractKeysFromFile(file);
    keys.forEach(key => allKeys.add(key));
  }
  
  console.log(`Found ${allKeys.size} unique translation keys in the codebase`);
  
  // Load and flatten translations
  const translations = await loadTranslations(TRANSLATION_FILE);
  const flattenedTranslations = flattenTranslations(translations);
  
  console.log(`Found ${Object.keys(flattenedTranslations).length} keys in translation file`);
  
  // Find missing translations
  const missingKeys = Array.from(allKeys).filter(key => !flattenedTranslations[key]);
  
  console.log(`Found ${missingKeys.length} missing translation keys`);
  
  // Organize missing keys by their top-level namespace
  const missingByNamespace = missingKeys.reduce((acc, key) => {
    const namespace = key.split('.')[0];
    if (!acc[namespace]) {
      acc[namespace] = [];
    }
    acc[namespace].push(key);
    return acc;
  }, {});
  
  // Create suggested translation structure
  const suggestedTranslations = {};
  
  // First sort keys by length to handle parent paths before child paths
  const sortedKeys = [...missingKeys].sort((a, b) => 
    a.split('.').length - b.split('.').length
  );
  
  sortedKeys.forEach(key => {
    const parts = key.split('.');
    let current = suggestedTranslations;
    
    // Build nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      
      // If the current level is not an object, make it one
      if (typeof current[part] !== 'object' || current[part] === null) {
        // If it's a string (another translation key), store the value in _value property
        const existingValue = current[part];
        current[part] = {};
        
        if (existingValue !== undefined) {
          current[part]['_value'] = existingValue;
        }
      }
      
      current = current[part];
    }
    
    // Add the leaf value
    const lastPart = parts[parts.length - 1];
    current[lastPart] = `[Missing: ${key}]`;
  });
  
  // Save results
  const results = {
    missingKeys,
    missingByNamespace,
    suggestedTranslations
  };
  
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(results, null, 2));
  
  console.log(`Results saved to ${OUTPUT_FILE}`);
  console.log('\nMissing keys by namespace:');
  Object.keys(missingByNamespace).sort().forEach(namespace => {
    console.log(`  - ${namespace}: ${missingByNamespace[namespace].length} keys`);
  });
}

// Execute the main function
findMissingTranslations().catch(console.error);