const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Replace nav
html = html.replace(/<div class="nav-links">[\s\S]*?<\/div>/, `<div class="nav-links">
            <a href="#" class="nav-link active">Home</a>
            <a href="#rentals" class="nav-link">Find a Rental</a>
            <a href="#buy" class="nav-link">Buy a Home</a>
            <a href="#sell" class="nav-link">Sell a Property</a>
            <a href="#bnbs" class="nav-link">BnBs and Short Stay</a>
            <a href="#commercial" class="nav-link">Commercial Spaces</a>
        </div>`);

const sec3Start = html.indexOf('<!-- Section 3: Walkthrough');
const sec7Start = html.indexOf('<!-- Section 7: How It Works');

if(sec3Start !== -1 && sec7Start !== -1) {
    const newSections = `    <!-- Section: Find a Rental -->
    <section class="sec" id="rentals">
        <div class="section-bg-wrapper">
            <div class="section-bg-image anim-kb-zoom" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=3840&q=100')"></div>
            <div class="section-bg-overlay"></div>
        </div>
        <div class="sh scroll-reveal-word">
            <div class="stag">Rentals</div>
            <h2 class="st">Find a <em>Rental</em></h2>
            <p class="ss">Discover premium apartments and homes for rent with verified listings and secure escrow deposits.</p>
        </div>
        <div class="listings-grid" id="rentals-grid">
            <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Rentals</h3>
                <p style="margin-top: 1rem; color: #aaa;">Explore our curated selection of high-end rentals.</p>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View All Rentals</button>
            </div>
        </div>
    </section>

    <!-- Section: Buy a Home -->
    <section class="sec" id="buy">
        <div class="section-bg-wrapper">
            <div class="section-bg-image anim-kb-pan" style="background-image: url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=3840&q=100')"></div>
            <div class="section-bg-overlay"></div>
        </div>
        <div class="sh scroll-reveal-word">
            <div class="stag">Ownership</div>
            <h2 class="st">Buy a <em>Home</em></h2>
            <p class="ss">Invest in your future with our exclusive portfolio of homes for sale across prime locations.</p>
        </div>
        <div class="listings-grid" id="buy-grid">
             <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Homes</h3>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View Properties</button>
            </div>
        </div>
    </section>

    <!-- Section: Sell a Property -->
    <section class="sec" id="sell">
        <div class="section-bg-wrapper">
            <div class="section-bg-image anim-pulse" style="background-image: url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=3840&q=100')"></div>
            <div class="section-bg-overlay"></div>
        </div>
        <div class="sh scroll-reveal-word">
            <div class="stag">Listing Hub</div>
            <h2 class="st">Sell a <em>Property</em></h2>
            <p class="ss">List your property with LinkPoint to reach qualified buyers through our cinematic real estate platform.</p>
        </div>
        <div style="text-align: center; margin-top: 2rem;">
            <button class="btn btn-primary btn-lg" style="margin: 0 auto;">List Your Property <i class="fas fa-arrow-right"></i></button>
        </div>
    </section>

    <!-- Section: BnBs and Short Stay -->
    <section class="sec" id="bnbs">
        <div class="section-bg-wrapper">
            <div class="section-bg-image anim-kb-zoom" style="background-image: url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=3840&q=100')"></div>
            <div class="section-bg-overlay"></div>
        </div>
        <div class="sh scroll-reveal-word">
            <div class="stag">Vacation Rentals</div>
            <h2 class="st">BnBs and <em>Short Stay</em></h2>
            <p class="ss">Find the perfect fully-furnished short stay apartment or boutique BnB for your trip.</p>
        </div>
        <div class="listings-grid" id="bnb-grid">
             <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Short Stays</h3>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View Short Stays</button>
            </div>
        </div>
    </section>

    <!-- Section: Commercial Spaces -->
    <section class="sec" id="commercial">
        <div class="section-bg-wrapper">
            <div class="section-bg-image anim-kb-pan" style="background-image: url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=3840&q=100')"></div>
            <div class="section-bg-overlay"></div>
        </div>
        <div class="sh scroll-reveal-word">
            <div class="stag">Business Hub</div>
            <h2 class="st">Commercial <em>Spaces</em></h2>
            <p class="ss">Elevate your business with premium office spaces, retail storefronts, and commercial properties.</p>
        </div>
        <div class="listings-grid" id="commercial-grid">
             <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Commercial</h3>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View Spaces</button>
            </div>
        </div>
    </section>

`;
    html = html.substring(0, sec3Start) + newSections + html.substring(sec7Start);
    fs.writeFileSync('index.html', html);
    console.log('Replaced successfully');
} else {
    console.log('Could not find section markers');
}
