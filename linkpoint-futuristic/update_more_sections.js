const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Update Sell a Property to include List your BnB, Office, Rental Shop
const oldSell = `<div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-primary btn-lg" style="margin: 0 auto;">List Your Property <i class="fas fa-arrow-right"></i></button>
        </div>`;

const newSell = `<div class="listings-grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 2rem auto 0; padding: 0 5%;">
            <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff;">List Your Property</h3>
                <button class="btn btn-primary" style="margin-top: 1rem; width: 100%; justify-content: center;">Start Listing</button>
            </div>
            <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff;">List Your BnB</h3>
                <button class="btn btn-glass" style="margin-top: 1rem; width: 100%; justify-content: center;">Add Your BnB</button>
            </div>
            <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff;">List Your Office</h3>
                <button class="btn btn-glass" style="margin-top: 1rem; width: 100%; justify-content: center;">Add Office Space</button>
            </div>
            <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.3rem; color: #fff;">List Your Rental Shop</h3>
                <button class="btn btn-glass" style="margin-top: 1rem; width: 100%; justify-content: center;">Add Retail Space</button>
            </div>
        </div>`;

// Update Commercial Spaces to include Looking for Office/Shop
const oldCommercial = `<div class="listings-grid" id="commercial-grid">
             <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Commercial</h3>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View Spaces</button>
            </div>
        </div>`;

const newCommercial = `<div class="listings-grid" id="commercial-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 2rem auto 0; padding: 0 5%;">
             <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Looking for Office to Rent</h3>
                <p style="margin-top: 1rem; color: #aaa;">Premium corporate spaces</p>
                <button class="btn btn-primary" style="margin-top: 1.5rem; width: 100%; justify-content: center;">Browse Offices</button>
            </div>
             <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Looking for Shop to Rent</h3>
                <p style="margin-top: 1rem; color: #aaa;">High-traffic retail spaces</p>
                <button class="btn btn-primary" style="margin-top: 1.5rem; width: 100%; justify-content: center;">Browse Shops</button>
            </div>
             <div class="property-card" style="text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Other Commercial</h3>
                <p style="margin-top: 1rem; color: #aaa;">Warehouses & industrial</p>
                <button class="btn btn-glass" style="margin-top: 1.5rem; width: 100%; justify-content: center;">View All</button>
            </div>
        </div>`;

if(html.includes(oldSell)) {
    html = html.replace(oldSell, newSell);
    console.log('Replaced Sell Section');
} else {
    console.log('Could not find oldSell block. Check exact formatting.');
}

if(html.includes(oldCommercial)) {
    html = html.replace(oldCommercial, newCommercial);
    console.log('Replaced Commercial Section');
} else {
    console.log('Could not find oldCommercial block. Check exact formatting.');
}

fs.writeFileSync('index.html', html);
