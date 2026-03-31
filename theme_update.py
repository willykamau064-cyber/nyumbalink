import os
import re
import glob

def update_theme(path):
    print(f"Updating theme in: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    font_link = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">'
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update Google Fonts link
        content = re.sub(
            r'<link href="https://fonts\.googleapis\.com/css2\?family=.*?" rel="stylesheet">',
            font_link,
            content
        )
        
        # Update CSS Variables for Light Theme (Orange & White)
        content = re.sub(r'--primary:\s*#.*?;', '--primary: #FF6B00;', content)
        content = re.sub(r'--secondary:\s*#.*?;', '--secondary: #FF8E3C;', content)
        content = re.sub(r'--accent:\s*#.*?;', '--accent: #FFB373;', content)
        content = re.sub(r'--bg-main:\s*#.*?;', '--bg-main: #FFFFFF;', content)
        content = re.sub(r'--bg-alt:\s*#.*?;', '--bg-alt: #FAFAFB;', content)
        content = re.sub(r'--text-main:\s*#.*?;', '--text-main: #111111;', content)
        content = re.sub(r'--text-muted:\s*#.*?;', '--text-muted: #666666;', content)
        
        # Update Dark Theme just to keep Orange identity
        content = re.sub(r'\[data-theme="dark"\]\s*{(.*?)}', 
                         lambda m: re.sub(r'--primary:\s*#.*?;', '--primary: #FF6B00;', m.group(0)), 
                         content, flags=re.DOTALL)
        content = re.sub(r'\[data-theme="dark"\]\s*{(.*?)}', 
                         lambda m: re.sub(r'--secondary:\s*#.*?;', '--secondary: #FF8E3C;', m.group(0)), 
                         content, flags=re.DOTALL)
        
        # Update Font families
        content = re.sub(r'--font-serif:\s*.*?;', "--font-serif: 'Playfair Display', serif;", content)
        content = re.sub(r'--font-sans:\s*.*?;', "--font-sans: 'Plus Jakarta Sans', sans-serif;", content)
        
        # Refine glassmorphism to be stark frosted white
        content = re.sub(r'--glass-bg:\s*rgba\(.*?\);', '--glass-bg: rgba(255, 255, 255, 0.7);', content)
        content = re.sub(r'--bg-card:\s*rgba\(.*?\);', '--bg-card: rgba(255, 255, 255, 0.85);', content)
        content = re.sub(r'--bg-glass:\s*rgba\(.*?\);', '--bg-glass: rgba(255, 255, 255, 0.9);', content)

        # Remove the weird mesh gradient if it's there to force WHITE background
        content = re.sub(r'radial-gradient.*?;\s*background-attachment:\s*fixed\s*!important;\s*background-size:\s*cover\s*!important;', '', content, flags=re.DOTALL)
        
        # Force background white explicitly
        content = re.sub(r'body\s*{.*?background-color:\s*var\(--bg-main\).*?}', 'body { background-color: var(--bg-main) !important; color: var(--text-main); font-family: var(--font-sans); }', content, flags=re.DOTALL)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")

update_theme(r"c:\Users\wilson\.gemini\antigravity\scratch\templates")
update_theme(r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web")
print("Done styling to orange and white theme.")
