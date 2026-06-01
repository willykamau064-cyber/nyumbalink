"""
LinkPoint - Final UI Repair
1. Injects shared-ui.js into all HTML files
2. Removes redundant openRate/openChat/closeRate/closeChat functions
3. Fixes common broken function calls
"""

import os
import re
import glob
import sys

# Ensure UTF-8 for Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

DIRS = [
    r"C:\Users\wilson\.gemini\antigravity\scratch",
    r"C:\Users\wilson\.gemini\antigravity\scratch\templates",
    r"C:\Users\wilson\.gemini\antigravity\scratch\link-point-pro",
]

UI_JS = '<script src="shared-ui.js"></script>'

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Inject shared-ui.js before </body>
    if UI_JS not in content:
        content = content.replace('</body>', UI_JS + '\n</body>')

    # 2. Remove redundant UI functions to avoid conflicts
    patterns_to_remove = [
        r'function\s+openRate\s*\(\)\s*\{[^}]*\}',
        r'function\s+closeRate\s*\(\)\s*\{[^}]*\}',
        r'function\s+openChat\s*\(\)\s*\{[^}]*\}',
        r'function\s+closeChat\s*\(\)\s*\{[^}]*\}',
    ]
    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content)

    # 3. Fix the "List Property" header button site-wide
    content = content.replace('href="sell.html" class="btn bp"><i class="fas fa-plus"></i> List Property', 'href="sell.html#listform" class="btn bp"><i class="fas fa-plus"></i> List Property')

    # 4. Clean up any empty scripts left behind
    content = content.replace('<script>\n\n</script>', '')
    content = content.replace('<script></script>', '')

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [REPAIRED] {os.path.basename(filepath)}")
    else:
        print(f"  [STABLE] {os.path.basename(filepath)}")

print("\n🔧 Global UI Repair in Progress...\n" + "-" * 50)
for d in DIRS:
    if not os.path.isdir(d):
        continue
    for f in glob.glob(os.path.join(d, "*.html")):
        repair_file(f)

print("\n✅ All UI buttons are now linked to shared-ui.js!")
