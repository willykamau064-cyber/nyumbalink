// Inject Paystack Script if not exists
if (!document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]')) {
    const script = document.createElement('script');
    script.src = "https://js.paystack.co/v1/inline.js";
    document.head.appendChild(script);
}

// Public key hardcoded so it works on both local and Vercel (no backend call needed)
const PAYSTACK_PK = 'pk_test_924a4eff52a8a9bfcc9c2185fe8d6ddbd46d0466';

async function openPaystack(amount, desc) {
    // Ensure the PaystackPop script is loaded
    if (typeof PaystackPop === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    if (typeof PaystackPop === 'undefined') {
        alert('⚠️ Payment gateway is loading. Please try again in a moment.');
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('LinkPointUser') || '{}');
        const email = user.email || localStorage.getItem('user_email') || 'customer@linkpoint.co.ke';

        const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '') : String(amount);
        const finalAmount = parseFloat(cleanAmount) * 100;

        const handler = PaystackPop.setup({
            key: PAYSTACK_PK,
            email: email,
            amount: finalAmount,
            currency: 'KES',
            ref: 'LP-' + Date.now() + '-' + Math.floor(Math.random() * 9999),
            metadata: {
                custom_fields: [
                    {
                        display_name: "Description",
                        variable_name: "description",
                        value: desc || 'LinkPoint Payment'
                    }
                ]
            },
            callback: function(response) {
                const refId = response.reference;
                alert('✅ Payment Successful!\n\nReference: ' + refId + '\nThank you for using LinkPoint Kenya!');
                // Optionally redirect to dashboard
                if (window.location.pathname.includes('sell')) {
                    setTimeout(() => window.location.href = 'user-dashboard.html', 1000);
                }
            },
            onClose: function() {
                console.log('Payment window closed.');
            }
        });

        handler.openIframe();

    } catch (error) {
        console.error("Paystack Error:", error);
        alert('⚠️ Payment gateway error. Please try again or contact support on WhatsApp: 0112012816');
    }
}
