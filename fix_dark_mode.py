import os, glob, shutil

desktop_dir = r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"
templates_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"

# We must replace the white background assignment for the dark theme.
def fix_dark(filepath):
    with open(filepath, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We'll just precisely replace the exact bg-main and bg-card lines if they are white
    content = content.replace("--bg-main: #F4F6F8;", "--bg-main: #0F172A;")
    content = content.replace("--bg-card: #FFFFFF;", "--bg-card: #1E293B;")
    content = content.replace("--bg-alt: #FFFFFF;", "--bg-alt: #1E293B;")
    content = content.replace("--text-muted: #64748B;", "--text-muted: #94A3B8;")
    content = content.replace("--bg-glass: rgba(255, 255, 255, 0.9);", "--bg-glass: rgba(15, 23, 42, 0.8);")

    # In case there are multiple matches in the light theme, we only want to do it inside the dark theme.
    # Actually, light theme bg-main is #F4F6F8. So a global replace would break light theme!
    # Let's be smart about it.
    
    import re
    def fix_dark_block(match):
        block = match.group(0)
        block = block.replace("--bg-main: #F4F6F8;", "--bg-main: #0F172A;")
        block = block.replace("--bg-card: #FFFFFF;", "--bg-card: #1E293B;")
        block = block.replace("--bg-alt: #FFFFFF;", "--bg-alt: #1E293B;")
        block = block.replace("--text-muted: #64748B;", "--text-muted: #94A3B8;")
        block = block.replace("--bg-glass: rgba(255, 255, 255, 0.9);", "--bg-glass: rgba(15, 23, 42, 0.8);")
        return block

    content = re.sub(r'\[data-theme="dark"\]\s*\{[^}]+\}', fix_dark_block, content)

    with open(filepath, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Fixed {os.path.basename(filepath)}")
    shutil.copy2(filepath, templates_dir)

for f in glob.glob(os.path.join(desktop_dir, "*.html")):
    fix_dark(f)

print("All dark mode files fixed and synced.")
