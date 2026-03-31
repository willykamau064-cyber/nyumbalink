import os
import glob

# We need to fix the horribly corrupted HTML that causes the blank page.
def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The corrupted segment looks like this:
    # 383: <!-- AUTHENTICATION GATE -->
    # 384: <div id="authGate" style="position: fixed; inset: 0; z-index: 99999; display: none;
    # 385:     background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
    # 386: }
    # 387: .smart-search {
    
    # We will replace the entire broken authGate start tag and the orphaned CSS with the proper authGate start tag.
    # Note: we need to safely wrap the orphaned CSS back into a <style> tag OR just delete it if the styles already exist.
    # .smart-search exists natively in the file anyway! We can just delete the orphaned CSS chunk.
    
    import re
    # Find <!-- AUTHENTICATION GATE --> up to <div style="position: absolute; inset: 0;
    # Or just replace the exact broken string.
    
    broken_pattern = r'<div id="authGate" style="position: fixed; inset: 0; z-index: 99999; display: none;\s*background: radial-gradient[^;]*;\s*}\s*\.smart-search\s*\{[^}]*\}\s*\.search-grid\s*\{[^}]*\}\s*\.search-input\s*\{[^}]*\}\s*\.search-input:focus\s*\{[^}]*\}\s*\.search-field\s*\{[^}]*\}\s*\.search-field i\s*\{[^}]*\}\s*@media[^}]*\}\s*\}\s*/\*\s*Feature Cards CSS\s*\*/\s*\.property-card\s*\{.*?\s*:not\(\[data-theme="dark"\]\) \.solid-nav i \{ color: #000000 !important; \}\s*</style>'
    
    if '<div id="authGate" style="position: fixed; inset: 0; z-index: 99999; display: none;' in content:
        # Instead of complex regex, let's just do a clean cut
        start_marker = '<!-- AUTHENTICATION GATE -->'
        end_marker = '<div style="background: var(--bg-glass);'
        
        if start_marker in content and end_marker in content:
            # Proper gate replacement!
            proper_gate = start_marker + """
<div id="authGate" style="position: fixed; inset: 0; z-index: 99999; background: url('static/villa.png') center/cover no-repeat; display: none; opacity: 0; transform: scale(0.98); align-items: center; justify-content: center; transition: all 0.4s ease;">
    <div style="position: absolute; inset: 0; background: var(--bg-overlay); "></div>
    """ + end_marker
            
            # Use string slicing to cut out the corrupted garbage
            start_idx = content.find(start_marker)
            end_idx = content.find(end_marker)
            if start_idx != -1 and end_idx != -1 and start_idx < end_idx:
                content = content[:start_idx] + proper_gate + content[end_idx + len(end_marker):]
                
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Repaired: {filepath}")

# Fix templates
templates_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"
for filepath in glob.glob(os.path.join(templates_dir, "*.html")):
    repair_file(filepath)

# Fix Desktop directly
desktop_dir = r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"
for filepath in glob.glob(os.path.join(desktop_dir, "*.html")):
    repair_file(filepath)

print("HTML Structure Repaired.")
