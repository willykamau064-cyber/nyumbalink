import os
import re
import glob

def apply_rentit_theme(path):
    print(f"Applying RentIt Theme in: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    font_link = '<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">'
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Fonts
        content = re.sub(
            r'<link href="https://fonts\.googleapis\.com/css2\?family=.*?" rel="stylesheet">',
            font_link,
            content
        )
        content = re.sub(r"--font-serif:\s*'.*?',\s*serif;", "--font-serif: 'Outfit', sans-serif;", content)
        content = re.sub(r"--font-sans:\s*'.*?',\s*sans-serif;", "--font-sans: 'Plus Jakarta Sans', sans-serif;", content)
        
        # 2. Colors - exactly matching RentIt Kenya
        content = re.sub(r'--primary:\s*#.*?;', '--primary: #ef4444;', content) # rentit actually uses an orange-red, #F05A28 approx
        content = re.sub(r'--primary: #ef4444;', '--primary: #F05A28;', content)
        
        content = re.sub(r'--secondary:\s*#.*?;', '--secondary: #0A2540;', content) # Deep Navy for buttons
        content = re.sub(r'--accent:\s*#.*?;', '--accent: #F05A28;', content)
        content = re.sub(r'--bg-main:\s*#.*?;', '--bg-main: #F4F6F8;', content) # Very light cream/grey
        content = re.sub(r'--bg-alt:\s*#.*?;', '--bg-alt: #FFFFFF;', content)
        content = re.sub(r'--text-main:\s*#.*?;', '--text-main: #0A2540;', content) # Dark text is deep navy
        content = re.sub(r'--text-muted:\s*#.*?;', '--text-muted: #64748B;', content) 

        # 3. Clean Flat Cards (Undo heavy glassmorphism)
        content = re.sub(r'--bg-card:\s*rgba\(.*?\);', '--bg-card: #FFFFFF;', content)
        content = re.sub(r'backdrop-filter:\s*blur\(.*?\).*?;', '', content)
        content = re.sub(r'-webkit-backdrop-filter:\s*blur\(.*?\).*?;', '', content)
        
        # 4. Buttons (Square-rounded, not pills)
        content = re.sub(r'border-radius:\s*100px\s*!important;', 'border-radius: 8px !important;', content)
        content = re.sub(r'border-radius:\s*99px;', 'border-radius: 8px;', content)
        content = re.sub(r'border-radius:\s*100px;', 'border-radius: 8px;', content)
        content = re.sub(r'border-radius:\s*50px;', 'border-radius: 8px;', content)
        
        # 5. Fix card shadows for realistic flat UI
        # Removing grainy noise
        content = re.sub(r'background:\s*url\(\'(.*?)\'\).*?pointer-events:\s*none;', 'display: none;', content, flags=re.DOTALL)
        
        # Override card CSS 
        content = re.sub(r'\.property-card {\s*border: none !important;(.*?)}', 
            '.property-card {\n    border: 1px solid rgba(0,0,0,0.05) !important;\n    background: #FFFFFF !important;\n    border-radius: 12px !important;\n    box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;\n    transition: transform 0.2s, box-shadow 0.2s !important;\n}', 
            content, flags=re.DOTALL)
            
        content = re.sub(r'\.smart-search {(.*?)}', 
            '.smart-search {\n    background: #FFFFFF !important;\n    border-radius: 12px !important;\n    box-shadow: 0 10px 40px rgba(0,0,0,0.1) !important;\n    border: none !important;\n}', 
            content, flags=re.DOTALL)

        # 6. Navy Header/Footer Colors
        content = re.sub(r'background:\s*#ffffff;', 'background: #0A2540;', content)
        # Footer is black/navy usually
        content = re.sub(r'<footer style=".*?">', '<footer style="padding: 4rem 5% 2rem; background: #0A2540; color: #FFFFFF;">', content)
        
        # Make footer text white/gray
        content = re.sub(r'<h3 style="color: var\(--text-main\)', '<h3 style="color: #FFFFFF', content)
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Applied RentIt Theme to {file}")

update_dirs = [r"c:\Users\wilson\.gemini\antigravity\scratch\templates", r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"]
for path in update_dirs:
    apply_rentit_theme(path)
print("Finished bringing RentIt UI.")
