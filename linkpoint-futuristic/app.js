// LinkPoint Futuristic App Controller

// 1. Mock Listings Data (Futuristic/Premium Theme)
const PROPERTIES_DB = [
    {
        id: "cyber-loft",
        title: "The Neon Cyber-Loft",
        location: "Nairobi",
        neighborhood: "Westlands",
        type: "Penthouse",
        price: 45000000, // KSh 45M
        priceFormatted: "KSh 45,000,000",
        beds: 3,
        baths: 4,
        size: "3,200 sqft",
        badge: "Escrow Verified",
        img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop",
        dimensions: {
            living: "8.5m x 6.2m",
            kitchen: "4.8m x 5.0m",
            balcony: "6.0m x 2.5m"
        }
    },
    {
        id: "crystal-villa",
        title: "Marina Crystal Villa",
        location: "Diani",
        neighborhood: "Diani Beach",
        type: "Villa",
        price: 85000000, // KSh 85M
        priceFormatted: "KSh 85,000,000",
        beds: 5,
        baths: 6,
        size: "6,500 sqft",
        badge: "Ocean Front",
        img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop",
        dimensions: {
            living: "12.0m x 8.5m",
            kitchen: "6.0m x 5.5m",
            balcony: "10.0m x 4.0m"
        }
    },
    {
        id: "orbital-plaza",
        title: "Orbital Office Plaza",
        location: "Nairobi",
        neighborhood: "Upper Hill",
        type: "Office",
        price: 120000000, // KSh 120M
        priceFormatted: "KSh 120,000,000",
        beds: "Commercial",
        baths: 12,
        size: "14,500 sqft",
        badge: "Pre-Leased",
        img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
        dimensions: {
            living: "24.0m x 18.0m",
            kitchen: "8.0m x 6.0m",
            balcony: "12.0m x 3.0m"
        }
    },
    {
        id: "smart-glass",
        title: "Smart Glass Apartment",
        location: "Nairobi",
        neighborhood: "Kilimani",
        type: "Apartment",
        price: 18500000, // KSh 18.5M
        priceFormatted: "KSh 18,500,000",
        beds: 2,
        baths: 2,
        size: "1,400 sqft",
        badge: "94% Yield Match",
        img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=600&auto=format&fit=crop",
        dimensions: {
            living: "6.2m x 5.5m",
            kitchen: "3.5m x 4.0m",
            balcony: "4.0m x 1.8m"
        }
    },
    {
        id: "tek-mansion",
        title: "Runda Tek-Mansion",
        location: "Nairobi",
        neighborhood: "Runda",
        type: "Villa",
        price: 140000000, // KSh 140M
        priceFormatted: "KSh 140,000,000",
        beds: 6,
        baths: 7,
        size: "8,200 sqft",
        badge: "Cybernetic Oasis",
        img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop",
        dimensions: {
            living: "14.5m x 10.2m",
            kitchen: "7.0m x 6.5m",
            balcony: "12.0m x 5.0m"
        }
    },
    {
        id: "skyline-suite",
        title: "Mombasa Skyline Suite",
        location: "Mombasa",
        neighborhood: "Nyali",
        type: "Apartment",
        price: 28000000, // KSh 28M
        priceFormatted: "KSh 28,000,000",
        beds: 3,
        baths: 3,
        size: "2,100 sqft",
        badge: "Ocean Breezy",
        img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=600&auto=format&fit=crop", // reused high quality
        dimensions: {
            living: "7.5m x 6.0m",
            kitchen: "4.0m x 4.2m",
            balcony: "5.5m x 2.2m"
        }
    }
];

// Active State
let currentFilteredProperties = [...PROPERTIES_DB];
let selectedWalkthroughProperty = PROPERTIES_DB[0];

// 2. DOMContentLoaded Initialization
document.addEventListener("DOMContentLoaded", () => {
    // 2.1 Render Initial Listings
    renderListings(currentFilteredProperties);
    
    // 2.2 Setup Filter Logic
    setupFilters();
    
    // 2.3 Setup Scroll Reveal Observer
    setupScrollReveal();
    
    // 2.4 Setup Walkthrough Interactions
    setupWalkthroughUI();
});

// 3. Render Listings Grid with 3D Tilt Effect
function renderListings(properties) {
    const grid = document.getElementById("listings-grid");
    if (!grid) return;
    
    if (properties.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; background: var(--bg-surface); border: 1px dashed var(--border-light); border-radius: 20px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 1rem;"></i>
                <h3 style="font-family: var(--font-heading); margin-bottom: 0.5rem;">No Portals Located</h3>
                <p style="color: var(--text-muted);">Adjust your coordinate parameters in the search console.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = "";
    
    properties.forEach(p => {
        const cardWrap = document.createElement("div");
        cardWrap.className = "tilt-card-wrap";
        
        cardWrap.innerHTML = `
            <div class="property-card" data-id="${p.id}">
                <div class="card-img-container" style="background-image: url('${p.img}')">
                    <div class="card-badge">${p.badge}</div>
                </div>
                <div class="card-details">
                    <div class="card-price">${p.priceFormatted}</div>
                    <h3 class="card-title">${p.title}</h3>
                    <div class="card-loc">
                        <i class="fas fa-map-marker-alt"></i> ${p.neighborhood}, ${p.location}
                    </div>
                    <div class="card-specs">
                        <div class="spec-item"><i class="fas fa-bed"></i> ${p.beds} ${p.beds === 'Commercial' ? '' : 'Beds'}</div>
                        <div class="spec-item"><i class="fas fa-bath"></i> ${p.baths} Baths</div>
                        <div class="spec-item"><i class="fas fa-ruler-combined"></i> ${p.size}</div>
                    </div>
                </div>
            </div>
        `;
        
        grid.appendChild(cardWrap);
        
        // Add interactive hover tilt effect
        const card = cardWrap.querySelector(".property-card");
        setupTiltEffect(cardWrap, card);
        
        // Click listener to load property in Walkthrough Viewport
        card.addEventListener("click", () => {
            selectPropertyForWalkthrough(p.id);
            // Smooth scroll to walkthrough section
            document.getElementById("walkthrough").scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// 4. Custom 3D Parallax Tilt Effect Engine
function setupTiltEffect(wrap, card) {
    wrap.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        
        // Get absolute coordinates relative to container
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Normalize coordinates to range (-0.5, 0.5)
        const normalizeX = (x / rect.width) - 0.5;
        const normalizeY = (y / rect.height) - 0.5;
        
        // Calculate max tilt range: 12 degrees
        const tiltX = -normalizeY * 12;
        const tiltY = normalizeX * 12;
        
        // Apply transform
        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(10px)`;
        
        // Dynamic border highlight
        card.style.borderColor = `rgba(255, 107, 0, ${0.15 + Math.abs(normalizeX) * 0.45})`;
    });
    
    wrap.addEventListener("mouseleave", () => {
        card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
        card.style.borderColor = "var(--border-light)";
    });
}

// 5. Search Console Filter Mechanism
function setupFilters() {
    const btnSearch = document.getElementById("btn-search");
    if (!btnSearch) return;
    
    btnSearch.addEventListener('click', () => {
        btnSearch.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Filtering...`;
        btnSearch.disabled = true;
        
        const locVal = document.getElementById('filter-location').value;
        const typeVal = document.getElementById('filter-type').value;
        const priceVal = document.getElementById('filter-price').value;
        
        setTimeout(() => {
            currentFilteredProperties = PROPERTIES_DB.filter(p => {
                if (locVal !== 'all' && p.location !== locVal) return false;
                if (typeVal !== 'all' && p.type !== typeVal) return false;
                if (priceVal !== 'all') {
                    if (priceVal === 'under-15m' && p.price >= 15000000) return false;
                    if (priceVal === '15m-30m' && (p.price < 15000000 || p.price > 30000000)) return false;
                    if (priceVal === '30m-60m' && (p.price < 30000000 || p.price > 60000000)) return false;
                    if (priceVal === 'over-60m' && p.price <= 60000000) return false;
                }
                return true;
            });
            
            renderListings(currentFilteredProperties);
            btnSearch.innerHTML = `<i class="fas fa-search"></i> Search`;
            btnSearch.disabled = false;
            
            document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
        }, 600);
    });
}

// 6. Intersection Observer for Scroll Reveals
function setupScrollReveal() {
    // Observe BOTH .reveal and .scroll-reveal-word elements
    const reveals = document.querySelectorAll('.reveal, .scroll-reveal-word');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
    
    // Immediately reveal hero elements (above the fold — no scroll needed)
    document.querySelectorAll('.hero .scroll-reveal-word').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 200 + i * 100);
    });
    
    // Navbar scroll shadow
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// 7. Load Listing into Walkthrough Viewport
function selectPropertyForWalkthrough(id) {
    const p = PROPERTIES_DB.find(x => x.id === id);
    if (!p) return;
    
    selectedWalkthroughProperty = p;
    
    // Update labels
    document.getElementById("walkthrough-title").innerText = p.title;
    document.getElementById("walkthrough-location").innerHTML = `<i class="fas fa-map-marker-alt" style="color:var(--primary)"></i> ${p.neighborhood}, ${p.location}`;
    
    // Default back to Living Room button
    document.querySelectorAll(".room-btn").forEach(btn => {
        if (btn.getAttribute("data-room") === "living") {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
    
    updateRoomMeta("living");
    
    // Update Walkthrough Canvas (global trigger function)
    if (window._lp_loadWalkthroughProperty) {
        window._lp_loadWalkthroughProperty(p.id);
    }
}

// Update walkthrough sidebar room meta
function updateRoomMeta(roomType) {
    const p = selectedWalkthroughProperty;
    const nameMap = {
        living: "Living Room",
        kitchen: "Cyber Kitchen",
        balcony: "Panoramic Balcony"
    };
    
    document.getElementById("walkthrough-area-name").innerText = nameMap[roomType] || roomType;
    document.getElementById("walkthrough-dimensions").innerText = p.dimensions[roomType] || "N/A";
}

// Setup Room Click Actions
function setupWalkthroughUI() {
    const btns = document.querySelectorAll(".room-btn");
    
    btns.forEach(btn => {
        btn.addEventListener("click", () => {
            btns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const roomType = btn.getAttribute("data-room");
            updateRoomMeta(roomType);
            
            // Execute room change inside Three.js script
            if (window._lp_changeWalkthroughRoom) {
                window._lp_changeWalkthroughRoom(roomType);
            }
        });
    });
}

// Global utility to bind 3D map clicks to Search/Listing highlights
window._lp_selectPropertyFromMap = function(propertyId) {
    const p = PROPERTIES_DB.find(x => x.id === propertyId);
    if (!p) return;
    
    // Update side panel in Neighborhood section
    document.getElementById("map-building-name").innerText = p.title;
    document.getElementById("map-building-address").innerText = `${p.neighborhood}, ${p.location}`;
    document.getElementById("map-building-height").innerText = p.type === 'Penthouse' ? "48 Storeys" : (p.type === 'Office' ? "18 Storeys" : "2 Storeys");
    
    const statusVal = document.getElementById("map-building-status");
    statusVal.innerText = "Available Portal";
    statusVal.style.color = "#FF6B00";
    
    // Update preview card
    document.getElementById("map-preview-title").innerText = p.title;
    document.getElementById("map-preview-price").innerText = p.priceFormatted;
    document.getElementById("map-preview-img").src = p.img;
    
    // Enable button
    const btn = document.getElementById("btn-view-building");
    btn.removeAttribute("disabled");
    btn.onclick = () => {
        selectPropertyForWalkthrough(p.id);
        document.getElementById("walkthrough").scrollIntoView({ behavior: 'smooth' });
    };
};
