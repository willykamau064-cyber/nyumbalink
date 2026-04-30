"""
LinkPoint - Swap Paystack -> Flutterwave
Replaces all Paystack script tags and JS references across every HTML file.
Run this once to apply the change site-wide.
"""

import os
import re
import glob
import sys

# Force UTF-8 output on Windows
sys.stdout.reconfigure(encoding='utf-8')

# ─── Paths to update ──────────────────────────────────────────────────────────
DIRS = [
    r"c:\Users\wilson\.gemini\antigravity\scratch",
    r"c:\Users\wilson\.gemini\antigravity\scratch\templates",
    r"c:\Users\wilson\.gemini\antigravity\scratch\link-point-pro",
    r"c:\Users\wilson\.gemini\antigravity\scratch\backup_temp\templates",
]

# ─── Replacements ─────────────────────────────────────────────────────────────
FLUTTERWAVE_SCRIPT_TAG = '<script src="https://checkout.flutterwave.com/v3.js"></script>'
FLUTTERWAVE_JS_SRC     = 'flutterwave.js'

def swap_file(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    original = content
    changed  = False

    # 1. Replace Paystack inline script tag with Flutterwave
    new_content = re.sub(
        r'<script[^>]*js\.paystack\.co[^>]*>\s*</script>',
        FLUTTERWAVE_SCRIPT_TAG,
        content,
        flags=re.IGNORECASE
    )
    if new_content != content:
        content = new_content
        changed = True

    # 2. Replace paystack.js src references with flutterwave.js
    new_content = re.sub(
        r'(src=["\'])([^"\']*/)?(paystack\.js)(["\'])',
        r'\1\2flutterwave.js\4',
        content,
        flags=re.IGNORECASE
    )
    if new_content != content:
        content = new_content
        changed = True

    # 3. Replace any hardcoded pk_test / pk_live Paystack keys in inline scripts
    new_content = re.sub(
        r"['\"]pk_(test|live)_[A-Za-z0-9]+['\"]",
        "'FLWPUBK_TEST-SANDBOXDEMOKEY-X'",
        content
    )
    if new_content != content:
        content = new_content
        changed = True

    # 4. Replace PaystackPop.setup({ ... }) blocks with FlutterwaveCheckout call note
    #    (only if the full inline logic is embedded — not when using external paystack.js)
    new_content = re.sub(
        r'PaystackPop\.setup\(',
        'FlutterwaveCheckout(',
        content
    )
    if new_content != content:
        content = new_content
        changed = True

    # 5. If the file still loads js.paystack.co but has no Flutterwave yet, inject it
    if 'js.paystack.co' in content and 'checkout.flutterwave.com' not in content:
        content = re.sub(
            r'<script[^>]*js\.paystack\.co[^>]*>.*?</script>',
            FLUTTERWAVE_SCRIPT_TAG,
            content,
            flags=re.IGNORECASE | re.DOTALL
        )
        changed = True

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✅ Updated: {os.path.basename(filepath)}")
    else:
        print(f"  ⏭  No Paystack found: {os.path.basename(filepath)}")

# ─── Run ──────────────────────────────────────────────────────────────────────
print("\n🔄 LinkPoint: Swapping Paystack → Flutterwave\n" + "─" * 50)
total = 0
for d in DIRS:
    if not os.path.isdir(d):
        print(f"\n⚠️  Directory not found, skipping: {d}")
        continue
    print(f"\n📁 {d}")
    html_files = glob.glob(os.path.join(d, "*.html"))
    for f in html_files:
        swap_file(f)
        total += 1

print(f"\n✅ Done! Processed {total} HTML files.")
print("\n📌 Next steps:")
print("   1. Open dashboard.flutterwave.com and register/login")
print("   2. Copy your TEST public key (starts with FLWPUBK_TEST-)")
print("   3. Paste it into flutterwave.js  →  const FLW_PUBLIC_KEY = '...'")
print("   4. Add FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY to Vercel env vars")
print("   5. When you get LIVE keys, swap FLWPUBK_TEST- → FLWPUBK- in flutterwave.js")
