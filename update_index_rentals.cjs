const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const oldSection = `<div class="listings-grid" id="rentals-grid">
            <div class="property-card" style="margin: 0 auto; max-width: 400px; text-align: center; padding: 2rem; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: #fff;">Browse Rentals</h3>
                <p style="margin-top: 1rem; color: #aaa;">Explore our curated selection of high-end rentals.</p>
                <button class="btn btn-primary" style="margin-top: 1.5rem; margin-left: auto; margin-right: auto;">View All Rentals</button>
            </div>
        </div>`;

const newSection = `<div class="listings-grid" id="rentals-grid" style="grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 2rem auto 0; padding: 0 5%;">
            <!-- Sample Rental Card 1 -->
            <div class="property-card" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; text-align: left;">
                <div style="height: 200px; background-image: url('public/westlands_apt.png'); background-size: cover; background-position: center; position: relative;">
                    <div style="position: absolute; top: 1rem; right: 1rem; background: var(--primary); color: #fff; padding: 0.3rem 0.8rem; border-radius: 100px; font-size: 0.75rem; font-weight: bold;">For Rent</div>
                </div>
                <div style="padding: 1.5rem;">
                    <h3 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">2BR Luxury Apartment</h3>
                    <p style="color: var(--primary); font-size: 1.15rem; font-weight: bold; margin-bottom: 1rem;">KSh 75,000 <span style="font-size: 0.8rem; color: var(--muted); font-weight: normal;">/mo</span></p>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0.8rem 0;">
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-car" style="color: var(--primary);"></i> Parking</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-trash-alt" style="color: var(--primary);"></i> Garbage Collection</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-bolt" style="color: var(--primary);"></i> Backup Generator</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-shield-alt" style="color: var(--primary);"></i> 24/7 Security</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-video" style="color: var(--primary);"></i> CCTV</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">W</div>
                        <div>
                            <p style="font-size: 0.8rem; font-weight: bold; color: #fff;">Wilson Kiarie</p>
                            <p style="font-size: 0.7rem; color: var(--primary);">Landlord • Joined Jan 2024</p>
                        </div>
                    </div>

                    <button class="btn btn-primary" style="margin-top: 1.2rem; width: 100%; justify-content: center;">View Details</button>
                </div>
            </div>
            
            <!-- Sample Rental Card 2 -->
            <div class="property-card" style="background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; text-align: left;">
                <div style="height: 200px; background-image: url('public/runda_mansion.png'); background-size: cover; background-position: center; position: relative;">
                    <div style="position: absolute; top: 1rem; right: 1rem; background: var(--primary); color: #fff; padding: 0.3rem 0.8rem; border-radius: 100px; font-size: 0.75rem; font-weight: bold;">For Rent</div>
                </div>
                <div style="padding: 1.5rem;">
                    <h3 style="font-family: var(--font-display); font-size: 1.25rem; color: #fff; margin-bottom: 0.5rem;">3BR Executive House</h3>
                    <p style="color: var(--primary); font-size: 1.15rem; font-weight: bold; margin-bottom: 1rem;">KSh 120,000 <span style="font-size: 0.8rem; color: var(--muted); font-weight: normal;">/mo</span></p>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0.8rem 0;">
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-car" style="color: var(--primary);"></i> 2 Parking Spots</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-trash-alt" style="color: var(--primary);"></i> Garbage Collection</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-bolt" style="color: var(--primary);"></i> Backup Generator</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-shield-alt" style="color: var(--primary);"></i> 24/7 Security</span>
                        <span style="font-size: 0.75rem; color: #ccc; background: rgba(255,255,255,0.05); padding: 0.3rem 0.6rem; border-radius: 4px;"><i class="fas fa-video" style="color: var(--primary);"></i> CCTV</span>
                    </div>

                    <div style="display: flex; align-items: center; gap: 0.8rem;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #333; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">J</div>
                        <div>
                            <p style="font-size: 0.8rem; font-weight: bold; color: #fff;">James Kamau</p>
                            <p style="font-size: 0.7rem; color: var(--primary);">Landlord • Joined Mar 2023</p>
                        </div>
                    </div>

                    <button class="btn btn-primary" style="margin-top: 1.2rem; width: 100%; justify-content: center;">View Details</button>
                </div>
            </div>
        </div>`;

if(html.includes(oldSection)) {
    html = html.replace(oldSection, newSection);
    fs.writeFileSync('index.html', html);
    console.log('Successfully updated rentals section in index.html');
} else {
    console.log('Error: Could not find old section to replace. Did it already get replaced?');
}
