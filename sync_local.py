import os
import shutil
import glob
import re

print("Syncing files to Desktop so they work locally...")

src_templates = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"
src_static = r"c:\Users\wilson\.gemini\antigravity\scratch\static"
dest_dir = r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"
dest_static = os.path.join(dest_dir, "static")

# Create static folder on Desktop if it doesn't exist
os.makedirs(dest_static, exist_ok=True)

# Copy templates to Desktop
for filepath in glob.glob(os.path.join(src_templates, "*.html")):
    filename = os.path.basename(filepath)
    dest_path = os.path.join(dest_dir, filename)
    shutil.copy2(filepath, dest_path)
    
    # Patch the /static/ to static/ so they work locally over file:///
    with open(dest_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # replace absolute /static/ with relative static/
    content = re.sub(r'src="/static/', 'src="static/', content)
    content = re.sub(r'href="/static/', 'href="static/', content)
    content = re.sub(r"url\('/static/", "url('static/", content)
    # also replace /sw.js etc
    content = content.replace('href="/manifest.json"', 'href="manifest.json"')
    content = content.replace("register('/sw.js')", "register('sw.js')")
    
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Synced and fixed HTML: {filename}")

# Copy static assets to Desktop/static
for filepath in glob.glob(os.path.join(src_static, "*")):
    if os.path.isfile(filepath):
        shutil.copy2(filepath, dest_static)
        
print("All static assets synced to Desktop folder. File paths adjusted for local viewing.")
