"""
LinkPoint - Swap Flutterwave/Paystack -> IntaSend (Kenya-native)
Replaces all payment script tags and JS references across every HTML file.
"""

import os
import re
import glob
import sys

sys.stdout.reconfigure(encoding='utf-8')

DIRS = [
    r"c:\Users\wilson\.gemini\antigravity\scratch",
    r"c:\Users\wilson\.gemini\antigravity\scratch\templates",
    r"c:\Users\wilson\.gemini\antigravity\scratch\link-point-pro",
    r"c:\Users\wilson\.gemini\antigravity\scratch\backup_temp\templates",
]

INTASEND_SDK  = '<script src="https://unpkg.com/intasend-inlinejs-sdk@3.0.4/build/intasend-inline.js"></script>'
INTASEND_JS   = '<script src="intasend.js"></script>'

def swap_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content

    # 1. Replace Flutterwave CDN tag with IntaSend SDK
    content = re.sub(
        r'<script[^>]*checkout\.flutterwave\.com[^>]*>\s*</script>',
        INTASEND_SDK,
        content, flags=re.IGNORECASE
    )

    # 2. Replace Paystack CDN tag with IntaSend SDK
    content = re.sub(
        r'<script[^>]*js\.paystack\.co[^>]*>\s*</script>',
        INTASEND_SDK,
        content, flags=re.IGNORECASE
    )

    # 3. Replace flutterwave.js src -> intasend.js
    content = re.sub(
        r'(src=["\'])([^"\']*/)?(flutterwave\.js)(["\'])',
        r'\1\2intasend.js\4',
        content, flags=re.IGNORECASE
    )

    # 4. Replace paystack.js src -> intasend.js
    content = re.sub(
        r'(src=["\'])([^"\']*/)?(paystack\.js)(["\'])',
        r'\1\2intasend.js\4',
        content, flags=re.IGNORECASE
    )

    # 5. If IntaSend SDK is now in the file but intasend.js script isn't, add it after SDK tag
    if 'intasend-inlinejs-sdk' in content and 'intasend.js' not in content:
        content = content.replace(
            INTASEND_SDK,
            INTASEND_SDK + '\n<script src="intasend.js"></script>'
        )

    # 6. Remove any leftover Flutterwave/Paystack key strings
    content = re.sub(r"['\"]FLWPUBK[^'\"]*['\"]", "'INTASEND_KEY_REPLACED'", content)
    content = re.sub(r"['\"]pk_(test|live)_[A-Za-z0-9]+['\"]", "'INTASEND_KEY_REPLACED'", content)

    changed = content != original
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  [OK] Updated: {os.path.basename(filepath)}")
    else:
        print(f"  [--] Skipped: {os.path.basename(filepath)}")

print("\nLinkPoint: Swapping to IntaSend (Kenya)\n" + "-" * 50)
total = 0
for d in DIRS:
    if not os.path.isdir(d):
        print(f"\n[!] Directory not found, skipping: {d}")
        continue
    print(f"\n[DIR] {d}")
    for f in glob.glob(os.path.join(d, "*.html")):
        swap_file(f)
        total += 1

print(f"\nDone! Processed {total} HTML files.")
print("""
Next steps:
  1. Go to https://sandbox.intasend.com (FREE, no sign-up needed for test key)
  2. Copy your test publishable key
  3. Open intasend.js -> replace INTASEND_PK value with your key
  4. For live: sign up at https://payment.intasend.com (instant approval!)
  5. Add INTASEND_PK=your_key to Vercel environment variables
""")
