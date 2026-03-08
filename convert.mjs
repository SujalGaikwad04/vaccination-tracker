import fs from 'fs';

let html = fs.readFileSync('download.html', 'utf8');

let startIndex = html.indexOf('<main');
let endIndex = html.indexOf('</main>') + 7;
if (startIndex === -1 || endIndex === -1) {
    console.error("No <main> tag found");
    process.exit(1);
}

let mainContent = html.substring(startIndex, endIndex);

// Convert class to className
let jsx = mainContent.replace(/class=/g, 'className=');

// Fix style
jsx = jsx.replace(/style="width: 70%"/g, 'style={{ width: "70%" }}');

// Self closing tags
jsx = jsx.replace(/<img(.*?)>/g, (match, p1) => {
    if (match.endsWith('/>')) return match;
    return `<img${p1} />`;
});
jsx = jsx.replace(/<input(.*?)>/g, (match, p1) => {
    if (match.endsWith('/>')) return match;
    return `<input${p1} />`;
});

// HTML comments
jsx = jsx.replace(/<!--(.*?)-->/g, '{/*$1*/}');

let output = `import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container relative min-h-screen text-slate-900 dark:text-slate-100">
            {/* The primary color from the generated screen is #ec5b13. */}
            ${jsx}
        </div>
    );
};

export default Dashboard;
`;

fs.writeFileSync('src/pages/Dashboard.jsx', output, 'utf8');
console.log("Successfully converted and saved Dashboard.jsx");
