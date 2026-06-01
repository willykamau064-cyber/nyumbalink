/* 
   Shared UI Logic for LinkPoint Kenya
   Handles Modals, Ratings, Chat, and Payment Aliases
*/

console.log('🎨 Shared UI Library Loaded');

// 1. Rating Modal
function openRate() {
    const rov = document.getElementById('rov');
    if (rov) {
        rov.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        console.warn('Rating modal (rov) not found on this page.');
    }
}

function closeRate() {
    const rov = document.getElementById('rov');
    if (rov) {
        rov.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// 2. Chat Modal
function openChat() {
    const chatOv = document.getElementById('chat-ov');
    if (chatOv) {
        chatOv.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        console.warn('Chat modal (chat-ov) not found on this page.');
    }
}

function closeChat() {
    const chatOv = document.getElementById('chat-ov');
    if (chatOv) {
        chatOv.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// 3. Manual M-Pesa Workaround (Direct Payment)
function showManualMpesa(amount, desc) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(8,13,26,.98);backdrop-filter:blur(15px);display:flex;align-items:center;justify-content:center';
    ov.innerHTML = `<div style="background:#111827;border:1px solid #25D366;border-radius:30px;padding:2.5rem;width:90%;max-width:420px;text-align:center;box-shadow:0 20px 60px rgba(37,211,102,0.15)">
      <div style="width:70px;height:70px;background:#25D366;border-radius:20px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:2.5rem;color:#fff"><i class="fas fa-mobile-alt"></i></div>
      <h2 style="font-family:'Playfair Display', serif;font-size:1.6rem;font-weight:800;margin-bottom:.8rem;color:#fff">Direct M-Pesa Payment</h2>
      <p style="color:rgba(255,255,255,.6);font-size:.9rem;margin-bottom:1.5rem">Pay <strong>KSh ${amount}</strong> for <strong>${desc}</strong></p>
      
      <div style="background:rgba(37,211,102,.1);border:1px dashed #25D366;padding:1.2rem;border-radius:18px;margin-bottom:1.5rem">
        <div style="font-size:.75rem;color:#25D366;font-weight:700;text-transform:uppercase;letter-spacing:1px">Send Money To</div>
        <div style="font-size:1.8rem;font-weight:900;color:#fff;margin:.3rem 0">0118 901 474</div>
        <div style="font-size:.85rem;color:rgba(255,255,255,0.7)">Name: <strong>Wilson Kiarie</strong></div>
      </div>

      <div style="text-align:left;background:rgba(255,255,255,0.05);padding:1rem;border-radius:14px;margin-bottom:1.8rem">
        <p style="font-size:.8rem;color:var(--muted);margin-bottom:.5rem"><strong>Steps:</strong></p>
        <p style="font-size:.82rem;color:#fff;margin-bottom:.4rem">1. Go to M-Pesa > Send Money</p>
        <p style="font-size:.82rem;color:#fff;margin-bottom:.4rem">2. Enter Phone <strong>0118 901 474</strong></p>
        <p style="font-size:.82rem;color:#fff">3. Click the button below to confirm with Support</p>
      </div>

      <a href="https://wa.me/254112012816?text=Hello Wilson, I have paid KSh ${amount} for ${desc} to 0118901474. My M-Pesa Transaction Code is: " target="_blank" class="btn" style="background:#25D366;color:#fff;width:100%;padding:1rem;border-radius:100px;font-weight:800;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:.6rem;font-size:1rem">
        <i class="fab fa-whatsapp"></i> Confirm via WhatsApp
      </a>
      <button onclick="this.closest('[style]').remove()" style="background:transparent;border:none;color:rgba(255,255,255,.4);margin-top:1.2rem;cursor:pointer;font-weight:600">Cancel & Go Back</button>
    </div>`;
    document.body.appendChild(ov);
}

// 4. Simplified Payment Trigger (Full Manual Mode)
function showPayMethodModal(amount, desc) {
    // Skip the method selection and go straight to M-Pesa Manual
    showManualMpesa(amount, desc);
}

function doMpesa(amt, desc) { showManualMpesa(amt, desc); }
function doPaystack(amt, desc) { showManualMpesa(amt, desc); }

// 5. Login Modal (Used when user is not logged in)
function showLoginModal(description) {
    const ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(8,13,26,.95);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center';
    ov.innerHTML = `<div style="background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:2.5rem;width:90%;max-width:400px;text-align:center">
      <div style="font-size:3rem;margin-bottom:1rem">🔒</div>
      <h2 style="font-family: 'Playfair Display', serif; font-size:1.6rem;font-weight:800;margin-bottom:.5rem;color:#fff">Login Required</h2>
      <p style="color:rgba(255,255,255,.6);font-size:.92rem;margin-bottom:2rem;line-height:1.6">Please sign in to access <strong>${description || 'this feature'}</strong> and process payments securely.</p>
      <div style="display:flex;gap:1rem;justify-content:center">
        <a href="join.html" style="background:#FF6B35;color:#fff;padding:.9rem 2rem;border-radius:100px;font-weight:700;text-decoration:none;font-size:1rem"><i class="fas fa-sign-in-alt"></i> Sign In</a>
        <button onclick="this.closest('[style]').remove()" style="background:transparent;border:1px solid rgba(255,255,255,.2);color:#fff;padding:.9rem 2rem;border-radius:100px;font-weight:700;cursor:pointer;font-size:1rem">Cancel</button>
      </div>
    </div>`;
    document.body.appendChild(ov);
}

// 4. Global Click Listeners for Overlays
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('auth-ov')) {
        closeRate();
        closeChat();
    }
});

// 5. Shared Scroll Logic
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 55);
        });
    }
});
