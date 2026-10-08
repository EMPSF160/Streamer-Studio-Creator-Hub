#!/usr/bin/env node
/**
 * Cache-Busting Build Script
 * 
 * This script:
 * 1. Generates hash for asset files (JS, CSS, images)
 * 2. Renames files with hash pattern: name.hash.ext
 * 3. Updates HTML references to use hashed filenames
 * 
 * Usage: node build-cache-bust.js
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const ASSET_DIRS = ['assets'];
const HTML_FILES = [
  'index.html',
  'about.html',
  'portfolio.html',
  'services.html',
  'testimonials.html',
  'contact.html',
  'journal.html',
  'admin.html'
];

const ASSET_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp'];

// Generate 8-character hash from file content
function generateHash(filePath) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5').update(content).digest('hex');
  return hash.substring(0, 8);
}

// Get all asset files
function getAssetFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAssetFiles(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ASSET_EXTENSIONS.includes(ext)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Rename file with hash
function renameWithHash(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const hash = generateHash(filePath);
  const newName = `${name}.${hash}${ext}`;
  const newPath = path.join(dir, newName);
  
  fs.renameSync(filePath, newPath);
  return { oldPath: filePath, newPath, oldName: path.basename(filePath), newName };
}

// Update HTML file references
function updateHTMLReferences(htmlFile, renames) {
  let content = fs.readFileSync(htmlFile, 'utf8');
  
  renames.forEach(({ oldName, newName }) => {
    // Replace in src attributes
    content = content.replace(
      new RegExp(`(src=["'])${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
      `$1${newName}`
    );
    
    // Replace in href attributes
    content = content.replace(
      new RegExp(`(href=["'])${oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
      `$1${newName}`
    );
  });
  
  fs.writeFileSync(htmlFile, content, 'utf8');
}

// Main build process
function build() {
  console.log('🚀 Starting cache-busting build...\n');
  
  const allRenames = [];
  
  // Process each asset directory
  ASSET_DIRS.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`⚠️  Directory ${dir} not found, skipping...`);
      return;
    }
    
    console.log(`📁 Processing ${dir}...`);
    const assetFiles = getAssetFiles(dir);
    
    assetFiles.forEach(filePath => {
      const rename = renameWithHash(filePath);
      allRenames.push(rename);
      console.log(`  ✓ ${path.basename(rename.oldPath)} → ${rename.newName}`);
    });
  });
  
  if (allRenames.length === 0) {
    console.log('\n⚠️  No asset files found to process.');
    return;
  }
  
  // Update HTML files
  console.log('\n📝 Updating HTML references...');
  HTML_FILES.forEach(htmlFile => {
    if (fs.existsSync(htmlFile)) {
      updateHTMLReferences(htmlFile, allRenames);
      console.log(`  ✓ Updated ${htmlFile}`);
    }
  });
  
  console.log(`\n✅ Build complete! Processed ${allRenames.length} assets.`);
  console.log('\n📋 Renamed files:');
  allRenames.forEach(({ oldName, newName }) => {
    console.log(`   ${oldName} → ${newName}`);
  });
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

