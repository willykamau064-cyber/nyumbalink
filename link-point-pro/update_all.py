import os, glob

for f in glob.glob('*.html'):
    with open(f, 'r', encoding='utf-8', errors='ignore') as file:
        content = file.read()
    
    # 1. replace mpesa references with paystack
    content = content.replace('mpesa.js', 'paystack.js')
    content = content.replace('openMpesa(', 'openPaystack(')
    content = content.replace('M-Pesa', 'Paystack')
    
    # 2. replace bnb pricing from 600 to 500
    content = content.replace("'600', 'List a BnB / Short Stay'", "'500', 'List a BnB / Short Stay'")
    content = content.replace("BnB / Stay (KSh 600)", "BnB / Stay (KSh 500)")
    content = content.replace("BnB (600)", "BnB (500)")
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print("Done updating HTML files.")
