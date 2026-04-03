import os
import glob

dir_path = "templates"
html_files = glob.glob(os.path.join(dir_path, "*.html"))

original_logo_1 = '<a href="/" class="logo">Link<em>Point</em></a>'
new_logo_1 = '<a href="/" class="logo" style="display:flex;align-items:center;gap:8px;"><img src="/logo.png" alt="Logo" style="height:35px;border-radius:8px;object-fit:contain;">Link<em>Point</em></a>'

original_logo_2 = '<a href="/" class="logo">Link<span>Point</span></a>'
new_logo_2 = '<a href="/" class="logo" style="display:flex;align-items:center;gap:8px;"><img src="/logo.png" alt="Logo" style="height:35px;border-radius:8px;object-fit:contain;">Link<span>Point</span></a>'

for file_name in html_files:
    with open(file_name, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We only want to replace the first occurrence (navbar) generally, or just all of them (even in footer).
    # Since they are mostly identical, let's just replace all occurrences.
    content = content.replace(original_logo_1, new_logo_1)
    content = content.replace(original_logo_2, new_logo_2)
    
    with open(file_name, 'w', encoding='utf-8') as f:
        f.write(content)
print("Logo restored successfully across all templates")
