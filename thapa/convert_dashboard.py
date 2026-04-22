import re

def convert_to_jsx(html_content):
    # Extract the <main> block
    match = re.search(r'<main.*?>(.*?)</main>', html_content, re.DOTALL)
    if not match:
        print("Could not find <main> in the HTML file")
        return ""
    main_content = match.group(0)

    # Basic JSX replacements
    jsx = main_content.replace('class=', 'className=')
    jsx = jsx.replace('style="width: 70%"', 'style={{ width: "70%" }}')
    
    # Close img tags
    jsx = re.sub(r'(<img[^>]*?[^\/])>', r'\1 />', jsx)
    
    # Close input tags
    jsx = re.sub(r'(<input[^>]*?[^\/])>', r'\1 />', jsx)
    
    # Replace HTML comments
    jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx)
    
    return jsx

with open('download.html', 'r', encoding='utf-8') as f:
    html = f.read()

jsx_content = convert_to_jsx(html)

react_component = f"""import React from 'react';

const Dashboard = () => {{
    return (
        <div className="dashboard-container bg-background-light dark:bg-background-dark min-h-screen font-display">
            {{/* The primary color from the generated screen is #ec5b13. 
                 Ensure tailwind config has this or it's added to global css */}}
            {jsx_content}
        </div>
    );
}};

export default Dashboard;
"""

with open('src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(react_component)
print("Updated Dashboard.jsx")
