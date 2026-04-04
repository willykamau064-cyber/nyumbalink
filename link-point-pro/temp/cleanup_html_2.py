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
            
            # Simple string replacement for common buttons I messed up
            content = content.replace("onclick=\"openMpesa('1,500', 'Secure Escrow Payment')\"><i class=\"fas fa-user\"></i> Login", "onclick=\"openAuth()\"><i class=\"fas fa-user\"></i> Login")
            content = content.replace("onclick=\"openMpesa('1,500', 'Secure Escrow Payment')\">Login", "onclick=\"openAuth()\">Login")
            
            # Fix typos like openAuth()')
            content = content.replace("onclick=\"openAuth()')\"", "onclick=\"openMpesa('1,500', 'Unlock Buyer Access (Homes)')\"")
            
            if content != orig:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Fixed {file}")
