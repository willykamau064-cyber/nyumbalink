import os
import re
import glob

def apply_beautiful_fonts(path):
    print(f"Applying Beautiful Fonts in: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    font_link = '<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">'
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update Google Fonts link
        content = re.sub(
            r'<link href="https://fonts\.googleapis\.com/css2\?family=.*?" rel="stylesheet">',
            font_link,
            content
        )
        
        # Update CSS Variables
        content = re.sub(r"--font-serif:\s*'.*?',\s*(serif|sans-serif);", "--font-serif: 'Cormorant Garamond', serif;", content)
        content = re.sub(r"--font-sans:\s*'.*?',\s*(serif|sans-serif);", "--font-sans: 'Montserrat', sans-serif;", content)
        
        # Enhance heading styles dynamically for extra beauty
        if '/* BEAUTIFUL_TYPOGRAPHY_MARKER */' not in content:
            new_css = """
/* BEAUTIFUL_TYPOGRAPHY_MARKER */
h1, h2, .hero-title {
    font-family: var(--font-serif) !important;
    font-weight: 600 !important;
    letter-spacing: -0.5px !important;
}
h3, h4, h5, .btn, .nav-link, input, select, button, body, p {
    font-family: var(--font-sans) !important;
}
.hero-title span {
    font-style: italic !important;
    font-family: var(--font-serif) !important;
}
"""
            content = content.replace('</style>', new_css + '\n</style>', 1)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Applied beautiful fonts to {file}")

update_dirs = [r"c:\Users\wilson\.gemini\antigravity\scratch\templates", r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"]
for path in update_dirs:
    apply_beautiful_fonts(path)
print("Finished adding beautiful fonts.")
