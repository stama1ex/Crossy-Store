import fs from 'fs';
import path from 'path';

const outputFile = 'project.txt';

// Папки, которые нужно игнорировать
const excludeDirs = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'out',
  'public',
  '.vscode',
];

// Файлы, которые нужно полностью исключить
const excludeFiles = ['package-lock.json', '.gitignore', 'project.txt'];

// Файлы, которые всегда нужно включать, даже если они вне обычных папок
const alwaysIncludeFiles = ['package.json'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const relativePath = path.relative('.', fullPath);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        walkDir(fullPath, callback);
      }
    } else if (stat.isFile()) {
      const baseName = path.basename(file);
      const isExcluded = excludeFiles.includes(baseName);
      const isAlwaysIncluded = alwaysIncludeFiles.includes(relativePath);
      if (!isExcluded || isAlwaysIncluded) {
        callback(fullPath);
      }
    }
  });
}

function flattenProject(rootDir) {
  const out = fs.createWriteStream(outputFile, { flags: 'w' });

  walkDir(rootDir, (file) => {
    const relativePath = path.relative(rootDir, file);
    const content = fs.readFileSync(file, 'utf-8');
    out.write(`\n\n=== ${relativePath} ===\n`);
    out.write(content + '\n');
  });

  out.end(() => {
    console.log(`✅ Файл ${outputFile} успешно создан без лишних файлов!`);
  });
}

flattenProject('.');
