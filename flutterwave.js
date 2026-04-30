// =============================================
// 💳 FLUTTERWAVE PAYMENT INTEGRATION
// LinkPoint Kenya - Replacing Paystack
// =============================================

// Inject Flutterwave Script if not already loaded
if (!document.querySelector('script[src*="checkout.flutterwave.com"]')) {
    const script = document.createElement('script');
    script.src = "https://checkout.flutterwave.com/v3.js";
    document.head.appendChild(script);
}

// 🔑 Flutterwave Public Key (Test) — swap for live key when approved
// Sign up at: https://dashboard.flutterwave.com
const FLW_PUBLIC_KEY = 'FLWPUBK_TEST-SANDBOXDEMOKEY-X'; // ← Replace with your key from dashboard.flutterwave.com

async function openPaystack(amount, desc) {
    return openFlutterwave(amount, desc);
}

async function openFlutterwave(amount, desc) {
    // Wait for Flutterwave SDK to load
    if (typeof FlutterwaveCheckout === 'undefined') {
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    if (typeof FlutterwaveCheckout === 'undefined') {
        alert('⚠️ Payment gateway is loading. Please try again in a moment.');
        return;
    }

    try {
        const user = JSON.parse(localStorage.getItem('LinkPointUser') || '{}');
        const email = user.email || localStorage.getItem('user_email') || 'customer@linkpoint.co.ke';
        const name = user.name || user.full_name || 'LinkPoint Customer';
        const phone = user.phone || '0700000000';

        const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '') : String(amount);
        const finalAmount = parseFloat(cleanAmount);

        FlutterwaveCheckout({
            public_key: FLW_PUBLIC_KEY,
            tx_ref: 'LP-' + Date.now() + '-' + Math.floor(Math.random() * 99999),
            amount: finalAmount,
            currency: 'KES',
            payment_options: 'card, mobilemoneyrwanda, mpesa',
            customer: {
                email: email,
                phone_number: phone,
                name: name,
            },
            customizations: {
                title: 'LinkPoint Kenya',
                description: desc || 'LinkPoint Platform Payment',
                logo: 'https://linkpoint.co.ke/logo.jpg',
            },
            callback: function(response) {
                console.log('Flutterwave response:', response);
                if (response.status === 'successful' || response.status === 'completed') {
                    alert('✅ Payment Successful!\n\nTransaction ID: ' + response.transaction_id + '\nReference: ' + response.tx_ref + '\n\nThank you for using LinkPoint Kenya!');
                    if (window.location.pathname.includes('sell') || window.location.pathname.includes('pricing')) {
                        setTimeout(() => window.location.href = 'user-dashboard.html', 1000);
                    }
                } else {
                    alert('⚠️ Payment was not completed. Status: ' + response.status + '. Please try again or contact support: 0112012816');
                }
            },
            onclose: function() {
                console.log('Payment window closed.');
            }
        });

    } catch (error) {
        console.error("Flutterwave Error:", error);
        alert('⚠️ Payment gateway error. Please try again or contact support on WhatsApp: 0112012816');
    }
}

// Also expose openPayment globally for backwards compatibility
function openPayment(propertyId, customAmount, customTitle) {
    let amount = 0;
    let title = '';

    if (customAmount && customTitle) {
        amount = parseFloat(customAmount);
        title = customTitle;
    } else if (propertyId && typeof allProperties !== 'undefined') {
        const prop = allProperties ? allProperties.find(p => p.id == propertyId) : null;
        if (prop) {
            amount = parseInt(prop.price);
            title = prop.title;
        } else {
            console.error("Property not found");
            return;
        }
    } else {
        amount = 1000;
        title = 'LinkPoint Platform Custom Payment';
    }

    // Add 0.5% escrow fee for property payments
    if (propertyId) {
        amount = amount + Math.round(amount * 0.005);
    }

    openFlutterwave(amount, title);
}
