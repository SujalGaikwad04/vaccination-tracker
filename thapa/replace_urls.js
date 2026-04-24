import fs from 'fs';
import path from 'path';

const searchDir = './src';
const searchString = 'http://localhost:5000';
const replaceString = '${API_URL}';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchString)) {
        // Find relative path to config.js from this file
        const dir = path.dirname(filePath);
        let relativePath = path.relative(dir, path.join(searchDir, 'config.js')).replace(/\\/g, '/');
        if (!relativePath.startsWith('.')) {
            relativePath = './' + relativePath;
        }
        // Remove .js extension from import
        relativePath = relativePath.replace('.js', '');

        // Add import at the top (after other imports)
        const importStatement = `import { API_URL } from '${relativePath}';`;
        
        // Find the last import line
        let lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImportIndex = i;
            }
        }
        
        if (lastImportIndex !== -1) {
            lines.splice(lastImportIndex + 1, 0, importStatement);
        } else {
            lines.unshift(importStatement);
        }
        
        content = lines.join('\n');
        
        // Replace URLs
        // Replace 'http://localhost:5000/api/...' -> `${API_URL}/api/...`
        content = content.replace(/'http:\/\/localhost:5000(.*?)'/g, "`\\${API_URL}$1`");
        // Replace "http://localhost:5000/api/..." -> `${API_URL}/api/...`
        content = content.replace(/"http:\/\/localhost:5000(.*?)"/g, "`\\${API_URL}$1`");
        // Replace http://localhost:5000 inside an existing template literal
        content = content.replace(/http:\/\/localhost:5000/g, "${API_URL}");

        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            processFile(fullPath);
        }
    }
}

walkDir(searchDir);
