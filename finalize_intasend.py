"""
LinkPoint - Finalize IntaSend Integration
1. Replaces all visible text "Paystack" with "IntaSend (M-Pesa/Card)"
2. Removes duplicate intasend.js and SDK script tags
3. Cleans up old Flutterwave/Paystack tags
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
INTASEND_JS  = '<script src="intasend.js"></script>'

def finalize_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Replace "Paystack" text in UI (buttons, paragraphs, etc.)
    # We use a case-insensitive regex but try to preserve case if it's "PAYSTACK"
    content = re.sub(r'Paystack', 'IntaSend (M-Pesa/Card)', content)
    content = re.sub(r'PAYSTACK', 'INTASEND', content)

    # 2. Clean up duplicate IntaSend SDK tags
    sdk_matches = re.findall(re.escape(INTASEND_SDK), content)
    if len(sdk_matches) > 1:
        content = content.replace(INTASEND_SDK, '', len(sdk_matches) - 1)
        # Put one back at the end of head or before body
        if INTASEND_SDK not in content:
             content = content.replace('</head>', INTASEND_SDK + '\n</head>')

    # 3. Clean up duplicate intasend.js tags
    js_matches = re.findall(re.escape(INTASEND_JS), content)
    if len(js_matches) > 1:
        content = content.replace(INTASEND_JS, '', len(js_matches) - 1)
        if INTASEND_JS not in content:
             content = content.replace('</body>', INTASEND_JS + '\n</body>')

    # 4. Remove any remaining Paystack/Flutterwave script tags just in case
    content = re.sub(r'<script[^>]*js\.paystack\.co[^>]*>\s*</script>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<script[^>]*checkout\.flutterwave\.com[^>]*>\s*</script>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<script src="paystack\.js"></script>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<script src="flutterwave\.js"></script>', '', content, flags=re.IGNORECASE)

    # 5. Fix order: SDK first, then intasend.js
    # (The previous steps might have messed up the order or left gaps)
    
    # Ensure they are present
    if INTASEND_SDK not in content:
        content = content.replace('</head>', INTASEND_SDK + '\n</head>')
    
    if INTASEND_JS not in content:
        content = content.replace('</body>', INTASEND_JS + '\n</body>')

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [FIXED] {os.path.basename(filepath)}")
    else:
        print(f"  [CLEAN] {os.path.basename(filepath)}")

print("\n🚀 Finalizing IntaSend UI Cleanup...\n" + "-" * 50)
total = 0
for d in DIRS:
    if not os.path.isdir(d):
        continue
    print(f"\n📂 Processing {d}...")
    for f in glob.glob(os.path.join(d, "*.html")):
        finalize_file(f)
        total += 1

print(f"\n✅ Done! Cleaned up {total} files.")
