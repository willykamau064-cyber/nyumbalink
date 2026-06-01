"""
LinkPoint - Swap IntaSend -> Paystack
1. Replaces "IntaSend (M-Pesa/Card)" with "Paystack (M-Pesa/Card)"
2. Replaces intasend.js with paystack.js
3. Removes IntaSend SDK
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

INTASEND_SDK = '<script src="https://unpkg.com/intasend-inlinejs-sdk@3.0.4/build/intasend-inline.js"></script>'

def swap_back(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Replace Text
    content = content.replace('IntaSend (M-Pesa/Card)', 'Paystack (M-Pesa/Card)')
    content = content.replace('INTASEND', 'PAYSTACK')

    # 2. Replace Scripts
    content = content.replace('<script src="intasend.js"></script>', '<script src="paystack.js"></script>')
    content = content.replace(INTASEND_SDK, '')

    # 3. Fix potential duplicates of paystack.js
    js_matches = re.findall(r'<script src="paystack\.js"></script>', content)
    if len(js_matches) > 1:
        content = content.replace('<script src="paystack.js"></script>', '', len(js_matches) - 1)
        if '<script src="paystack.js"></script>' not in content:
             content = content.replace('</body>', '<script src="paystack.js"></script>\n</body>')

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [SWAPPED] {os.path.basename(filepath)}")
    else:
        print(f"  [KEEP] {os.path.basename(filepath)}")

print("\n🔄 Reverting to Paystack Site-Wide...\n" + "-" * 50)
for d in DIRS:
    if not os.path.isdir(d):
        continue
    for f in glob.glob(os.path.join(d, "*.html")):
        swap_back(f)

print("\n✅ Done! Paystack is now the active gateway.")
