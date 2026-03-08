import fs from 'fs';

const data = JSON.parse(fs.readFileSync('C:\\Users\\Sahil\\.gemini\\antigravity\\brain\\e3e7d241-611a-47fd-9e5a-c1828d1a9800\\.system_generated\\steps\\140\\output.txt', 'utf8'));

data.screens.forEach(screen => {
    const title = (screen.title || '').toLowerCase();
    if (title.includes('multi') || title.includes('update') || title.includes('vaxi') || title.includes('dash') || title.includes('child')) {
        console.log(`ID: ${screen.name} TITLE: ${screen.title}`);
    }
});
