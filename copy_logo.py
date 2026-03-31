import shutil
import re
import glob

# Copy the generated logo to the project folder
src = r"C:\Users\wilson\.gemini\antigravity\brain\fba90b4b-2f15-4bb0-b805-4c1fbd7f0337\linkpoint_logo_1774694129643.png"
dst = r"C:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\logo.png"

try:
    shutil.copy2(src, dst)
    print(f"Logo copied to {dst}")
except Exception as e:
    print(f"Copy error: {e}")

# Update all HTML files to use logo.png instead of logo.jpg
html_files = glob.glob(r"C:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\*.html")

for filepath in html_files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace all references to old logo
    new_content = re.sub(r'logo\.jpg[^"\']*', 'logo.png', content)
    new_content = re.sub(r'logo_Link\.jpg', 'logo.png', new_content)
    new_content = re.sub(r'/static/logo_Link\.jpg', 'logo.png', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated: {filepath}")
    else:
        print(f"No change needed: {filepath}")

print("Done!")
