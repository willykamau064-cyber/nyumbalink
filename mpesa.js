function openMpesa(amount, plan) {
    const modal = document.createElement("div");
    modal.id = "mpesa-modal";
    modal.style = "position:fixed;inset:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(20px);z-index:10000;display:flex;align-items:center;justify-content:center";
    modal.innerHTML = `
        <div style="background:#111;padding:3rem;border-radius:40px;width:90%;max-width:400px;text-align:center;border:1px solid rgba(255,255,255,0.1);box-shadow:0 40px 100px rgba(0,0,0,0.6)">
            <div style="width:70px;height:70px;background:#10b981;border-radius:20px;margin:0 auto 1.5rem;display:flex;align-items:center;justify-content:center;font-size:2rem;color:#fff;box-shadow:0 0 30px rgba(16,185,129,0.3)"><i class="fas fa-mobile-alt"></i></div>
            <h1 style="font-family:'Playfair Display',serif;color:#fff;font-size:1.8rem;margin-bottom:0.5rem">M-Pesa STK Push</h1>
            <p style="color:rgba(255,255,255,0.6);margin-bottom:2rem;font-size:0.95rem">Securing payment for <strong>${plan}</strong><br>Amount: KES ${amount}</p>
            <input type="tel" id="m-phone" placeholder="Enter Phone (2547...)" style="width:100%;padding:1.1rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:1rem;margin-bottom:1.2rem;text-align:center">
            <button onclick="executeSTK('${amount}')" style="width:100%;padding:1.1rem;background:#10b981;color:#fff;border:none;border-radius:100px;font-weight:800;font-size:1.05rem;cursor:pointer;box-shadow:0 10px 30px rgba(16,185,129,0.3)">Pay Now via M-Pesa</button>
            <button onclick="document.getElementById('mpesa-modal').remove()" style="background:none;border:none;color:rgba(255,255,255,0.4);margin-top:1.5rem;cursor:pointer;font-weight:600">Cancel Payment</button>
        </div>
    `;
    document.body.appendChild(modal);
}
async function executeSTK(amt) {
    const phone = document.getElementById("m-phone").value;
    if(!phone) return alert("Enter M-Pesa Phone Number");
    const btn = document.querySelector("#mpesa-modal button");
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> Sending STK Push...";
    try {
        const r = await fetch("http://localhost:5000/api/stkpush", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone, amount: amt })
        });
        const d = await r.json(); alert(d.message);
        if(r.ok) document.getElementById("mpesa-modal").remove();
    } catch(e) {
        alert("?? SECURITY ALERT: The payment server at http://localhost:5000 is not responding. Please ensure your Node and terminal are active!");
    }
    btn.innerHTML = "Pay Now via M-Pesa";
}

