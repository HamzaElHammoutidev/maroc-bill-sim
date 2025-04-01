#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the LanguageContext.tsx file
const filePath = path.join(__dirname, 'src', 'contexts', 'LanguageContext.tsx');

// Read the file
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Find specific sections in the file
  const duplicateSection = fileContent.match(/\/\/ Arabic translations\s*([^]*?)(?=\s*\n\s*')/);
  
  if (duplicateSection) {
    console.log('Found duplicate section starting with "// Arabic translations"');
    console.log('Lines to remove:');
    console.log('-------------------');
    console.log(duplicateSection[0]);
    console.log('-------------------');
  } else {
    console.log('No duplicate section found - this is good!');
  }
  
  // Look for the ar object - improved pattern matching
  const arMatch = fileContent.match(/ar:\s*\{([\s\S]*?)(?=\}\,|\}$)/);
  
  if (!arMatch) {
    console.log('Could not find ar translation object in the file, but this might be expected if the file structure has changed');
  } else {
    console.log('Arabic translations object found!');
    
    // Extract the object as string
    const arString = arMatch[1];
    
    // Capture keys from the ar object section
    const arKeysRegex = /'([^']+)':/g;
    let arKeys = new Set();
    let duplicateKeys = new Set();
    let match;
    
    while ((match = arKeysRegex.exec(arString)) !== null) {
      const key = match[1];
      if (arKeys.has(key)) {
        duplicateKeys.add(key);
      } else {
        arKeys.add(key);
      }
    }
    
    console.log('\nDuplicate keys in AR object:');
    if (duplicateKeys.size === 0) {
      console.log('No duplicate keys found in the main AR object - this is good!');
    } else {
      console.log('Found duplicate keys in Arabic translations:');
      duplicateKeys.forEach(key => console.log(`- '${key}'`));
    }
  }
  
  console.log('\nTo fix any remaining translation issues:');
  console.log('1. Review the MISSING_TRANSLATIONS.md file');
  console.log('2. Add missing Arabic translations');
  console.log('3. Check for any remaining linter errors');
  
} catch (error) {
  console.error(`Error processing file: ${error.message}`);
} 