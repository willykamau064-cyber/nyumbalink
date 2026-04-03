import os
import re

ws = r'C:\Users\wilson\.gemini\antigravity\brain\10e5545a-9da3-47a6-abb5-4e0329fe46ac'

for root, _, files in os.walk(ws):
    if ".git" in root or "node_modules" in root: continue
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            orig = content
            
            # 1. Fix broken openAuth()') typo if any
            content = content.replace("onclick=\"openAuth()')\"", "onclick=\"openMpesa('1,500', 'Unlock Buyer Access (Homes)')\"")
            
            # 2. Fix Login buttons that were mistakenly changed to openMpesa
            # Look for button or link that has "Login" text and currently has openMpesa
            content = re.sub(r'onclick="openMpesa\(\'[^\']+\', \'Secure Escrow Payment\'\)">([^<]*Login)', r'onclick="openAuth()">\1', content)
            
            if content != orig:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed {file}")
