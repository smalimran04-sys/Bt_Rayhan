const fs = require('fs');
const path = require('path');

// Test if routes-manifest.json exists in various locations
const possiblePaths = [
  '.next/routes-manifest.json',
  '.next/standalone/.next/routes-manifest.json',
  'routes-manifest.json'
];

possiblePaths.forEach(p => {
  const fullPath = path.join(__dirname, p);
  console.log(`Checking ${fullPath}`);
  if (fs.existsSync(fullPath)) {
    console.log(`✓ Found routes-manifest.json at ${p}`);
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      const json = JSON.parse(content);
      console.log(`  Version: ${json.version}`);
      console.log(`  Routes count: ${json.staticRoutes.length + json.dynamicRoutes.length}`);
    } catch (err) {
      console.log(`  Error reading file: ${err.message}`);
    }
  } else {
    console.log(`✗ Not found at ${p}`);
  }
});