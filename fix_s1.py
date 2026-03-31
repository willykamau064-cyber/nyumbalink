import glob, os, re

for file in glob.glob(r'c:\Users\wilson\.gemini\antigravity\scratch\templates\*.html') + glob.glob(r'c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # SECTION 1 fix. The previous regex likely accidentally matched starting from Section 1's alert all the way to Section 2's button.
    # Actually wait, let's look for exactly what view_file showed
    content = content.replace(
        "onsubmit=\"event.preventDefault(); openPayment(null, 1500, \\'Buy a Home Request\\');\"",
        "onsubmit=\"event.preventDefault(); openPayment(null, 400, 'Rent a Home Request');\""
    )
    
    content = content.replace(
        '<button class="btn btn-primary" type="submit" style="grid-column: 1 / -1; justify-content: center;">Submit Request</button>',
        '<button class="btn btn-primary" type="submit" style="grid-column: 1 / -1; justify-content: center;">Submit Request (KSh 400)</button>'
    )

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
print("done section1")
