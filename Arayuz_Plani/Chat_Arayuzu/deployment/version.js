/**
 * Version management script
 * 
 * This script updates the version number in package.json and creates a version file.
 * 
 * Usage:
 * node version.js [major|minor|patch|prerelease]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get package.json
const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = require(packageJsonPath);

// Get current version
const currentVersion = packageJson.version;
console.log(`Current version: ${currentVersion}`);

// Get version type from command line
const versionType = process.argv[2] || 'patch';
const validTypes = ['major', 'minor', 'patch', 'prerelease'];

if (!validTypes.includes(versionType)) {
  console.error(`Invalid version type: ${versionType}`);
  console.error(`Valid types: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Get current git branch
let gitBranch;
try {
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
} catch (error) {
  console.warn('Failed to get git branch, using "unknown"');
  gitBranch = 'unknown';
}

// Get current git commit hash
let gitCommit;
try {
  gitCommit = execSync('git rev-parse --short HEAD').toString().trim();
} catch (error) {
  console.warn('Failed to get git commit hash, using "unknown"');
  gitCommit = 'unknown';
}

// Parse current version
const [major, minor, patch] = currentVersion.split('-')[0].split('.').map(Number);
let prerelease = currentVersion.split('-')[1] || '';

// Update version
let newVersion;
switch (versionType) {
  case 'major':
    newVersion = `${major + 1}.0.0`;
    break;
  case 'minor':
    newVersion = `${major}.${minor + 1}.0`;
    break;
  case 'patch':
    newVersion = `${major}.${minor}.${patch + 1}`;
    break;
  case 'prerelease':
    if (prerelease) {
      const [prefix, number] = prerelease.match(/^([a-zA-Z]+)\.?(\d+)?$/).slice(1);
      const newNumber = number ? parseInt(number, 10) + 1 : 1;
      newVersion = `${major}.${minor}.${patch}-${prefix}.${newNumber}`;
    } else {
      // Default to beta.1 if no prerelease exists
      newVersion = `${major}.${minor}.${patch}-beta.1`;
    }
    break;
}

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
console.log(`Updated version: ${newVersion}`);

// Create version file
const versionInfo = {
  version: newVersion,
  buildTime: new Date().toISOString(),
  gitBranch,
  gitCommit,
};

const versionFilePath = path.resolve(__dirname, '../public/version.json');
fs.writeFileSync(versionFilePath, JSON.stringify(versionInfo, null, 2) + '\n');
console.log(`Created version file: ${versionFilePath}`);

// Create version.ts file for import in code
const versionTsContent = `/**
 * Application version information
 * 
 * This file is auto-generated. Do not edit directly.
 */

export const VERSION = '${newVersion}';
export const BUILD_TIME = '${versionInfo.buildTime}';
export const GIT_BRANCH = '${gitBranch}';
export const GIT_COMMIT = '${gitCommit}';

export default {
  version: VERSION,
  buildTime: BUILD_TIME,
  gitBranch: GIT_BRANCH,
  gitCommit: GIT_COMMIT,
};
`;

const versionTsPath = path.resolve(__dirname, '../src/version.ts');
fs.writeFileSync(versionTsPath, versionTsContent);
console.log(`Created version.ts file: ${versionTsPath}`);

// Create git tag
if (versionType !== 'prerelease') {
  try {
    execSync(`git tag -a v${newVersion} -m "Version ${newVersion}"`);
    console.log(`Created git tag: v${newVersion}`);
  } catch (error) {
    console.warn(`Failed to create git tag: ${error.message}`);
  }
}

console.log('Version update complete!');
