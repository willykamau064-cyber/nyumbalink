"""
Fixing the broken JavaScript function names caused by over-zealous replacement.
Replaces "doIntaSend (M-Pesa/Card)" with "doPaystack" (keeping the legacy name for stability)
or "openIntaSend (M-Pesa/Card)" with "openPaystack".
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

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # Fix the broken function names in JS
    content = content.replace('doIntaSend (M-Pesa/Card)', 'doPaystack')
    content = content.replace('openIntaSend (M-Pesa/Card)', 'openPaystack')
    
    # Also fix the weird "IntaSend (M-Pesa/Card) (Card / Bank)" label
    content = content.replace('IntaSend (M-Pesa/Card) (Card / Bank)', 'IntaSend (M-Pesa/Card)')

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [FIXED] {os.path.basename(filepath)}")
    else:
        print(f"  [CLEAN] {os.path.basename(filepath)}")

print("\n🔧 Fixing broken JS function names...\n" + "-" * 50)
for d in DIRS:
    if not os.path.isdir(d):
        continue
    for f in glob.glob(os.path.join(d, "*.html")):
        fix_file(f)

print("\n✅ Done!")
