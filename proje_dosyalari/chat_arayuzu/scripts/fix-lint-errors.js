#!/usr/bin/env node

/**
 * Bu script, yaygın ESLint hatalarını otomatik olarak düzeltir.
 *
 * Kullanım:
 * node scripts/fix-lint-errors.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ES modüllerinde __dirname ve __filename tanımları
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Proje kök dizini
const rootDir = path.resolve(__dirname, '..');

// Düzeltilecek dosya uzantıları
const extensions = ['.ts', '.tsx'];

// Kullanılmayan importları temizle
function removeUnusedImports(filePath, content) {
  // İmport ifadelerini bul
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  let newContent = content;

  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(i => i.trim());
    const unusedImports = [];

    // Her bir import için kullanılıp kullanılmadığını kontrol et
    for (const importName of imports) {
      // İmport adını temizle (as ile yeniden adlandırma durumunu ele al)
      const cleanName = importName.split(' as ')[0].trim();

      // İmport adı dosyanın geri kalanında kullanılıyor mu?
      const importRegex = new RegExp(`\\b${cleanName}\\b`, 'g');
      const importCount = (content.match(importRegex) || []).length;

      // Sadece bir kez geçiyorsa (import ifadesinde), kullanılmıyor demektir
      if (importCount <= 1) {
        unusedImports.push(importName);
      }
    }

    // Kullanılmayan importları kaldır
    if (unusedImports.length > 0) {
      const importStatement = match[0];
      const source = match[2];

      // Kullanılan importları bul
      const usedImports = imports.filter(i => !unusedImports.includes(i));

      if (usedImports.length === 0) {
        // Tüm importlar kullanılmıyorsa, import ifadesini tamamen kaldır
        newContent = newContent.replace(importStatement, '');
      } else {
        // Bazı importlar kullanılıyorsa, sadece kullanılmayanları kaldır
        const newImportStatement = `import { ${usedImports.join(', ')} } from '${source}'`;
        newContent = newContent.replace(importStatement, newImportStatement);
      }
    }
  }

  return newContent;
}

// @ts-ignore yerine @ts-expect-error kullan
function fixTsComments(content) {
  return content.replace(/@ts-ignore/g, '@ts-expect-error');
}

// any tiplerini düzelt (basit durumlar için)
function fixAnyTypes(content) {
  // Basit any tiplerini unknown ile değiştir
  return content.replace(/: any(\s|,|\))/g, ': unknown$1');
}

// Dosyayı işle
function processFile(filePath) {
  console.log(`İşleniyor: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Düzeltmeleri uygula
    newContent = removeUnusedImports(filePath, newContent);
    newContent = fixTsComments(newContent);
    newContent = fixAnyTypes(newContent);

    // Değişiklik varsa dosyayı güncelle
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`  Düzeltildi: ${filePath}`);
    }
  } catch (error) {
    console.error(`  Hata: ${filePath}`, error);
  }
}

// Dizini tarayarak dosyaları işle
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // node_modules ve dist gibi dizinleri atla
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      processFile(fullPath);
    }
  }
}

// Ana işlev
function main() {
  console.log('ESLint hatalarını düzeltme başlatılıyor...');

  // src dizinini işle
  processDirectory(path.join(rootDir, 'src'));

  console.log('ESLint hatalarını düzeltme tamamlandı.');

  // ESLint ile düzeltmeleri uygula
  try {
    console.log('ESLint ile otomatik düzeltmeler uygulanıyor...');
    execSync('npx eslint --fix src --ext .ts,.tsx', { stdio: 'inherit' });
    console.log('ESLint düzeltmeleri tamamlandı.');
  } catch (error) {
    console.error('ESLint düzeltmeleri sırasında hata oluştu:', error);
  }
}

main();
