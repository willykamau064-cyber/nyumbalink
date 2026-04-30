// =============================================
// 💳 INTASEND PAYMENT INTEGRATION
// LinkPoint Kenya — Kenya-born payment gateway
// Supports: M-Pesa, Visa, Mastercard, Google Pay
// Docs: https://developers.intasend.com
// =============================================

// Inject IntaSend SDK if not already loaded
(function() {
    if (!document.querySelector('script[src*="intasend-inlinejs-sdk"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/intasend-inlinejs-sdk@3.0.4/build/intasend-inline.js';
        script.onload = function() { initIntaSend(); };
        document.head.appendChild(script);
    } else {
        // SDK already present — init when DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initIntaSend);
        } else {
            initIntaSend();
        }
    }
})();

// -----------------------------------------------
// 🔑 Your IntaSend Publishable Key
// Get test key FREE (no sign-up): https://sandbox.intasend.com
// Get live key: https://payment.intasend.com → Settings → API Keys
// -----------------------------------------------
const INTASEND_PK  = 'ISPubKey_test_5b04cdbd-2fe6-4148-b5ea-1e7b9f3b1ee2'; // ← Replace with yours
const INTASEND_LIVE = false; // ← Set to true when you go live

let _intaSendInstance = null;

function initIntaSend() {
    if (typeof window.IntaSend === 'undefined') return;
    if (_intaSendInstance) return; // Already initialized
    try {
        _intaSendInstance = new window.IntaSend({
            publicAPIKey: INTASEND_PK,
            live: INTASEND_LIVE
        })
        .on('COMPLETE', function(results) {
            console.log('IntaSend payment complete:', results);
            const ref = results.invoice_id || results.tracking_id || 'N/A';
            alert(
                'Payment Successful!\n\n' +
                'Transaction ID: ' + ref + '\n' +
                'Thank you for using LinkPoint Kenya!'
            );
            // Redirect after successful payment on sell/pricing pages
            if (window.location.pathname.match(/sell|pricing/)) {
                setTimeout(function() {
                    window.location.href = 'user-dashboard.html';
                }, 1200);
            }
        })
        .on('FAILED', function(results) {
            console.error('IntaSend payment failed:', results);
            alert(
                'Payment was not completed.\n' +
                'Please try again or contact support on WhatsApp: 0112012816'
            );
        })
        .on('IN-PROGRESS', function(results) {
            console.log('Payment in progress...', results);
        });
        console.log('IntaSend initialized successfully.');
    } catch(e) {
        console.error('IntaSend init error:', e);
    }
}

// -----------------------------------------------
// openPaystack() — kept for backward compatibility
// All existing calls like openPaystack(amount, desc)
// will now go through IntaSend seamlessly
// -----------------------------------------------
function openPaystack(amount, desc) {
    return openIntaSend(amount, desc);
}

// -----------------------------------------------
// Main function — programmatically trigger checkout
// -----------------------------------------------
function openIntaSend(amount, desc) {
    const user  = JSON.parse(localStorage.getItem('LinkPointUser') || '{}');
    const email = user.email || localStorage.getItem('user_email') || '';
    const name  = user.name  || user.full_name || '';
    const phone = user.phone || '';

    const cleanAmount = typeof amount === 'string' ? amount.replace(/,/g, '') : String(amount);
    const finalAmount = parseFloat(cleanAmount) || 0;

    if (finalAmount <= 0) {
        alert('Invalid payment amount. Please try again.');
        return;
    }

    // Dynamically create an IntaSend button, trigger it, then remove
    const btn = document.createElement('button');
    btn.className      = 'intaSendPayButton';
    btn.style.display  = 'none';
    btn.dataset.amount   = finalAmount;
    btn.dataset.currency = 'KES';
    btn.dataset.comment  = desc || 'LinkPoint Payment';
    if (email) btn.dataset.email      = email;
    if (name)  btn.dataset.firstName  = name.split(' ')[0] || '';
    if (name)  btn.dataset.lastName   = name.split(' ').slice(1).join(' ') || '';
    if (phone) btn.dataset.phoneNumber = phone;

    document.body.appendChild(btn);

    // Re-init so IntaSend picks up the new button
    _intaSendInstance = null;
    initIntaSend();

    setTimeout(function() {
        btn.click();
        setTimeout(function() { btn.remove(); }, 3000);
    }, 300);
}

// -----------------------------------------------
// openPayment() — legacy function used across HTML files
// Handles property-based and custom payments
// -----------------------------------------------
function openPayment(propertyId, customAmount, customTitle) {
    let amount = 0;
    let title  = '';

    if (customAmount && customTitle) {
        amount = parseFloat(customAmount);
        title  = customTitle;
    } else if (propertyId && typeof allProperties !== 'undefined') {
        const prop = allProperties ? allProperties.find(function(p) { return p.id == propertyId; }) : null;
        if (prop) {
            amount = parseInt(prop.price);
            title  = prop.title;
        } else {
            console.error('Property not found:', propertyId);
            return;
        }
    } else {
        amount = 1000;
        title  = 'LinkPoint Platform Custom Payment';
    }

    // Add 0.5% escrow fee for property transactions
    if (propertyId) {
        amount = amount + Math.round(amount * 0.005);
    }

    openIntaSend(amount, title);
}
