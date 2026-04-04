import os
import re
import glob

def apply_paystack(path):
    print(f"Adding Paystack to: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    paystack_script = '<script src="https://js.paystack.co/v1/inline.js"></script>\n</head>'
    
    paystack_logic = """function openPayment(propertyId, customAmount, customTitle) {
    let email = "user@example.com";
    let user_data = localStorage.getItem('linkpointUser');
    if(user_data) {
        try {
            let user = JSON.parse(user_data);
            if(user && user.email) email = user.email;
        } catch(e) {}
    }

    let amount = 0;
    let title = "";
    
    if (customAmount && customTitle) {
        amount = parseInt(customAmount);
        title = customTitle;
    } else if (propertyId) {
        const prop = allProperties ? allProperties.find(p => p.id == propertyId) : null;
        if (prop) {
            amount = parseInt(prop.price);
            title = prop.title;
        } else {
            console.error("Property not found");
            return; // Abort if property doesn't exist
        }
    } else {
        amount = 1000;
        title = "LinkPoint Platform Custom Payment";
    }

    // Add 0.5% Escrow Fee if it's a property payment
    if(propertyId) {
        amount = amount + Math.round(amount * 0.005);
    }
    
    // Paystack takes amount in lowest currency unit (cents/kobo). For KES it's 100
    let amountInCents = amount * 100;

    let handler = PaystackPop.setup({
        key: 'pk_test_924a4eff52a8a9bfcc9c2185fe8d6ddbd46d0466', // Mock public key for testing
        email: email,
        amount: amountInCents,
        currency: 'KES',
        ref: 'LNKPT_'+Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Service/Property",
                    variable_name: "service",
                    value: title
                }
            ]
        },
        callback: function(response){
            alert('Success! Payment Ref: ' + response.reference);
        },
        onClose: function(){
            console.log('Payment window closed by user.');
        }
    });

    handler.openIframe();
}"""

    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Add Paystack JS
        if 'js.paystack.co' not in content:
            content = content.replace('</head>', paystack_script, 1)
        
        # 2. Replace old openPayment logic precisely
        # Old logic goes from "function openPayment(propertyId" to the end of its brace, before launchMap
        content = re.sub(
            r'function openPayment\(propertyId, customAmount, customTitle\)\s*{.*?paymentSec\.scrollIntoView.*?}',
            paystack_logic,
            content,
            flags=re.DOTALL
        )
        
        # In case the old logic was slightly different and missed, trying a more aggressive regex for openPayment
        if 'PaystackPop.setup' not in content and 'function openPayment' in content:
            content = re.sub(
                r'function openPayment\(propertyId, customAmount, customTitle\)\s*{.*?}(?=\s*function launchMap|\s*</script>|\s*function closeMap)',
                paystack_logic,
                content,
                flags=re.DOTALL
            )
            
        # Hide the old M-Pesa section completely so it never shows
        content = content.replace('id="paymentSystem" style="padding: 6rem 5%;', 'id="paymentSystem" style="display:none !important; padding: 6rem 5%;')

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Applied Paystack to {file}")

update_dirs = [r"c:\Users\wilson\.gemini\antigravity\scratch\templates", r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"]
for path in update_dirs:
    apply_paystack(path)
print("Finished setting up Paystack.")
