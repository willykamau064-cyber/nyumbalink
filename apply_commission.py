import os
import glob
import re

def apply_commission(path):
    print(f"Applying 7% commission in: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update the openPayment JavaScript
        # Look for the exact escrow calculation logic in openPayment
        old_logic = "amount = amount + Math.round(amount * 0.005);"
        new_logic = """
        let isSale = false;
        if (propertyId) {
            const prop = allProperties.find(p => p.id == propertyId);
            if (prop && (prop.status === 'FOR SALE' || prop.title.toLowerCase().includes('sale'))) {
                isSale = true;
            }
        }
        
        if (isSale) {
            // 7% Commission for successful house sales
            amount = amount + Math.round(amount * 0.07);
        } else {
            // standard 0.5% escrow fee for rentals/booking
            amount = amount + Math.round(amount * 0.005);
        }
        """
        
        # In case the python replacement missed it or hit it twice, only replace if not already replaced
        if "amount * 0.07" not in content:
            content = content.replace(old_logic, new_logic.strip())
            
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Applied 7% logic to {file}")

update_dirs = [r"c:\Users\wilson\.gemini\antigravity\scratch\templates", r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"]
for path in update_dirs:
    apply_commission(path)
print("Finished setting up 7% commission.")
