import os
import glob

files = glob.glob('*.html')
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
            
        initial_content = content
        
        # Remove exact matches
        content = content.replace('<script src="linkpoint-3d.js"></script>', '')
        content = content.replace("<script src='linkpoint-3d.js'></script>", '')
        content = content.replace('<script src="/linkpoint-3d.js"></script>', '')
        
        # If there are empty script tags related to it, or similar, those should be removed but the simple string replace is robust.
        
        if initial_content != content:
            with open(f, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f'Removed 3D script from {f}')
    except Exception as e:
        print(f"Error processing {f}: {e}")
