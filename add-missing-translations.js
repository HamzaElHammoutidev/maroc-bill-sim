#!/usr/bin/env node

/**
 * Script to add missing translations to the translation files
 * This script will:
 * 1. Read the missing-translations.json file
 * 2. Add all missing keys to both fr and ar translation files with placeholder values
 * 3. Save the updated translation files
 * 
 * Usage: node add-missing-translations.js
 */

const fs = require('fs');
const path = require('path');

// Paths to files
const MISSING_TRANSLATIONS_FILE = './missing-translations.json';
const FR_TRANSLATION_FILE = './public/locales/fr/translation.json';
const AR_TRANSLATION_FILE = './public/locales/ar/translation.json';

// Helper function to set nested property with dot notation
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  const lastPart = parts[parts.length - 1];
  current[lastPart] = value;
  
  return obj;
}

// Main function
function addMissingTranslations() {
  console.log('Reading missing translations...');
  
  // Load missing translations
  const missingData = JSON.parse(fs.readFileSync(MISSING_TRANSLATIONS_FILE, 'utf8'));
  const missingKeys = missingData.missingKeys;
  
  console.log(`Found ${missingKeys.length} missing translations`);
  
  // Load existing translations
  const frTranslations = JSON.parse(fs.readFileSync(FR_TRANSLATION_FILE, 'utf8'));
  const arTranslations = JSON.parse(fs.readFileSync(AR_TRANSLATION_FILE, 'utf8'));
  
  console.log('Adding missing translations...');
  
  // Add missing translations with placeholder values
  missingKeys.forEach(key => {
    // French placeholder
    setNestedProperty(frTranslations, key, `[${key}]`);
    
    // Arabic placeholder (using the same format)
    setNestedProperty(arTranslations, key, `[${key}]`);
  });
  
  // Save updated translations
  fs.writeFileSync(FR_TRANSLATION_FILE, JSON.stringify(frTranslations, null, 4));
  fs.writeFileSync(AR_TRANSLATION_FILE, JSON.stringify(arTranslations, null, 4));
  
  console.log('Translations updated successfully!');
  console.log('French translation file size:', (fs.statSync(FR_TRANSLATION_FILE).size / 1024).toFixed(2), 'KB');
  console.log('Arabic translation file size:', (fs.statSync(AR_TRANSLATION_FILE).size / 1024).toFixed(2), 'KB');
  
  // Print a few examples of added translations
  console.log('\nExamples of added translations:');
  missingKeys.slice(0, 5).forEach(key => {
    console.log(`- ${key}: [${key}]`);
  });
  
  console.log('\nRemember to properly translate these placeholders before deploying to production!');
}

// Execute the main function
addMissingTranslations(); 