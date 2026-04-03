function openPaystack(amount, desc) {
    const user = JSON.parse(localStorage.getItem('LinkPointUser') || '{}');
    const email = user.email || 'customer@example.com';
    
    // Convert KSh to sub-units (Paystack expects amount in smallest currency unit)
    // However, if the user doesn't have a currency specified, Paystack defaults to GHS or NGN.
    // For Kenya Shilling (KES), Paystack should handle it if the merchant account supports KES.
    // Assuming KES 1 = 100 units.
    const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '') : amount;
    const finalAmount = parseFloat(cleanAmount) * 100;

    const handler = PaystackPop.setup({
        key: 'pk_test_linkpoint_default_key', // Replace with actual public key if provided
        email: email,
        amount: finalAmount,
        currency: 'KES',
        ref: 'LP-' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
            custom_fields: [
                {
                    display_name: "Transaction Description",
                    variable_name: "description",
                    value: desc
                }
            ]
        },
        callback: function(response) {
            alert('Payment successful! Transaction Ref: ' + response.reference);
            // Here you would typically notify your backend
        },
        onClose: function() {
            alert('Window closed before payment was completed.');
        }
    });

    handler.openIframe();
}

// Inject Paystack Script if not exists
if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
}
