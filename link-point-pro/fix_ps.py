import os

path = r'C:\Users\wilson\.gemini\antigravity\brain\10e5545a-9da3-47a6-abb5-4e0329fe46ac\server.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken authorization header line
content = content.replace("headers: { 'Authorization': Bearer , 'Content-Type': 'application/json' },", "headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
