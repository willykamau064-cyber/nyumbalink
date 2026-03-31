import glob

def fix_paystack():
    files = glob.glob(r'c:\Users\wilson\.gemini\antigravity\scratch\templates\*.html') + glob.glob(r'c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\*.html')
    
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'js.paystack.co' not in content and '</title>' in content:
            content = content.replace('</title>', '</title>\n    <script src="https://js.paystack.co/v1/inline.js"></script>')
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added Paystack to {file}")

fix_paystack()
