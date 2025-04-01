#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Path to the LanguageContext.tsx file
const filePath = path.join(__dirname, 'src', 'contexts', 'LanguageContext.tsx');

// Read the file
try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Find the fr and ar objects in the file
  const frMatch = fileContent.match(/const fr = (\{[\s\S]*?\n\s*\});/);
  const arMatch = fileContent.match(/const ar = (\{[\s\S]*?\n\s*\});/);
  
  if (!frMatch || !arMatch) {
    console.error('Could not find translation objects in the file');
    process.exit(1);
  }
  
  // Extract the objects as strings
  const frString = frMatch[1];
  const arString = arMatch[1];
  
  // Convert string to actual object (with some preprocessing)
  const evalFr = (str) => {
    // Replace the object string with proper JSON syntax
    const jsonLike = str
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are double-quoted
      .replace(/'/g, '"'); // Replace single quotes with double quotes
    
    try {
      return JSON.parse(jsonLike);
    } catch (e) {
      console.error('Error parsing FR object:', e);
      return {};
    }
  };
  
  const evalAr = (str) => {
    // Replace the object string with proper JSON syntax
    const jsonLike = str
      .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure keys are double-quoted
      .replace(/'/g, '"'); // Replace single quotes with double quotes
    
    try {
      return JSON.parse(jsonLike);
    } catch (e) {
      console.error('Error parsing AR object:', e);
      return {};
    }
  };
  
  // This is a simplified approach - in practice, you'd need a more robust parser
  // to handle the actual JavaScript object syntax correctly
  
  console.log('To fix the translation file:');
  console.log('1. Open src/contexts/LanguageContext.tsx');
  console.log('2. Search for the following text: "// Arabic translations"');
  console.log('3. Remove the entire block of duplicate translations starting at this comment');
  console.log('4. Save the file');
  
  // Additional help for manual inspection
  console.log('\nPossible duplicates in the file:');
  
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
  duplicateKeys.forEach(key => console.log(`- '${key}'`));
  
} catch (error) {
  console.error(`Error processing file: ${error.message}`);
} 