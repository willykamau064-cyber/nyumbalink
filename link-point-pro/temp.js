
const API_BASE = "http://127.0.0.1:3000"; // Point to local backend for testing
let authMode = 'login';

function toggleAuthMode(mode) {
    authMode = mode;
    document.getElementById('authError').style.display = 'none';
    const loginBtn = document.getElementById('btn-login-tab');
    const registerBtn = document.getElementById('btn-register-tab');
    const phoneGrp = document.getElementById('phoneGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const subtitle = document.getElementById('authSubtitle');
    const phoneInput = document.getElementById('authPhone');
    
    // Reset styles
    loginBtn.style.background = 'transparent'; loginBtn.style.color = 'var(--text-muted)'; loginBtn.style.borderColor = 'rgba(0, 212, 255, 0.3)';
    registerBtn.style.background = 'transparent'; registerBtn.style.color = 'var(--text-muted)'; registerBtn.style.borderColor = 'rgba(0, 212, 255, 0.3)';
    
    if (mode === 'login') {
        loginBtn.style.background = 'linear-gradient(135deg, var(--primary), #0082c8)'; loginBtn.style.color = 'white'; loginBtn.style.borderColor = 'transparent';
        phoneGrp.style.display = 'none';
        phoneInput.required = false;
        submitBtn.innerHTML = 'Sign In <i class="fas fa-sign-in-alt"></i>';
        subtitle.innerText = 'Sign in to your premium real estate hub';
    } else {
        registerBtn.style.background = 'linear-gradient(135deg, var(--primary), #0082c8)'; registerBtn.style.color = 'white'; registerBtn.style.borderColor = 'transparent';
        phoneGrp.style.display = 'block';
        phoneInput.required = true;
        submitBtn.innerHTML = 'Create Account <i class="fas fa-user-plus"></i>';
        subtitle.innerText = 'Join our premium real estate hub';
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const phone = document.getElementById('authPhone').value;
    const errorDiv = document.getElementById('authError');
    const submitBtn = document.getElementById('authSubmitBtn');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
    errorDiv.style.display = 'none';
    
    try {
        const endpoint = authMode === 'login' ? '/login' : '/signup';
        const payload = authMode === 'login' ? { email, password } : { email, password, phone };
        
        const res = await fetch(API_BASE + endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
            // Authentication successful!
            localStorage.setItem('nyumbaToken', data.token); // Save JWT
            localStorage.setItem('nyumbaUser', JSON.stringify(data.user));
            closeAuthGate();
            updateUIAfterLogin();
        } else {
            errorDiv.innerText = data.message || 'Authentication failed';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.innerText = 'Network error. Make sure the Node server is running on port 3000.';
        errorDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = authMode === 'login' ? 'Sign In <i class="fas fa-sign-in-alt"></i>' : 'Create Account <i class="fas fa-user-plus"></i>';
    }
}

function closeAuthGate() {
    document.getElementById('authGate').style.opacity = '0';
    document.getElementById('authGate').style.transform = 'scale(0.98)';
    setTimeout(() => {
        document.getElementById('authGate').style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 400);
}

function updateUIAfterLogin() {
    const user = JSON.parse(localStorage.getItem('nyumbaUser'));
    if (user) {
        const loginBtn = document.querySelector('button[onclick="openAuth()"]');
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${user.email.split('@')[0]}`;
            loginBtn.onclick = () => {
                if(confirm("Do you want to logout?")) {
                    localStorage.removeItem('nyumbaUser');
                    location.reload();
                }
            };
        }
    }
}

window.addEventListener('scroll', () => {
    const sections = ['featured', 'servicesPortal', 'agentVerification', 'neighborhoodGuides'];
    const navLinks = document.querySelectorAll('.desktop-nav a');
    
    let current = '';
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                current = id;
            }
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('nav-active');
        if (link.getAttribute('href') === '#' + current || (current === '' && link.getAttribute('href') === '#')) {
            link.classList.add('nav-active');
        }
    });

    // Navbar transparency effect
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.background = 'var(--bg-overlay)';
        nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
    } else {
        nav.style.background = 'transparent';
        nav.style.boxShadow = 'none';
    }
});



let allProperties = [];

async function loadFeaturedProperties() {
    console.log("Loading properties from:", API_BASE + '/listings');
    const grid = document.getElementById('featured-properties-grid');
    if (!grid) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    try {
        const res = await fetch(API_BASE + '/listings', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("Backend error: " + res.status);
        const properties = await res.json();
        console.log("Fetched Properties:", properties);
        
        if (!properties || properties.length === 0) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">No properties found. Be the first to list!</div>';
            return;
        }

        grid.innerHTML = ''; // Clear loader
        allProperties = properties; // Cache for filtering
        renderProperties(allProperties);
        
    } catch (err) {
        clearTimeout(timeoutId);
        console.warn("Load properties from backend failed (likely local dev), using local fallbacks:", err);
        allProperties = [
            { id: '1', title: 'Modern 4BR Villa', location: 'Karen, Nairobi', price: 18500000, status: 'FOR SALE', type: 'house', beds: 4, baths: 3, images: ['villa.png'] },
            { id: '2', title: 'Luxury 2BR Apartment', location: 'Kilimani, Nairobi', price: 65000, status: 'FOR RENT', type: 'apartment', beds: 2, baths: 2, images: ['apartment.png'] },
            { id: '3', title: 'Sunny Vacation BnB', location: 'Diani Beach', price: 8500, status: 'BNB', type: 'bnb', beds: 1, baths: 1, images: ['bnb.png'] },
            { id: '4', title: 'Prime Retail Shop', location: 'CBD, Nairobi', price: 45000, status: 'FOR RENT', type: 'shop', beds: 0, baths: 1, images: ['https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop'] },
            { id: '5', title: 'Executive Office Space', location: 'Westlands', price: 120000, status: 'FOR RENT', type: 'office', beds: 0, baths: 2, images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop'] },
            { id: '6', title: 'Cozy 3BR Bungalow', location: 'Ruiru, Kiambu', price: 7500000, status: 'FOR SALE', type: 'house', beds: 3, baths: 2, images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop'] }
        ];
        renderProperties(allProperties);
    }
}

function getBadgeStyle(status) {
    if (!status) return 'background: var(--text-muted);';
    const s = status.toUpperCase();
    if (s.includes('SALE')) return 'background: var(--danger);';
    if (s.includes('RENT')) return 'background: var(--secondary);';
    if (s.includes('BNB')) return 'background: var(--primary);';
    return 'background: var(--accent);';
}


function renderProperties(properties) {
    const grid = document.getElementById('featured-properties-grid');
    if (!grid) return;

    if (!properties || properties.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 3rem;">No properties found. Try a different search!</div>';
        return;
    }

    grid.innerHTML = ''; 
    properties.forEach((prop, index) => {
        const badgeStyle = getBadgeStyle(prop.status);
        const formattedPrice = "KSh " + parseInt(prop.price).toLocaleString();
        const delay = (index % 3 + 1) * 100;
        const thumb = prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';

        const cardHTML = `
        <div class="property-card" data-aos="fade-up" data-aos-delay="${delay}">
            <div style="height: 220px; background: url('${thumb}') center/cover; position: relative;">
                <div class="property-badge" style="${badgeStyle}">${prop.status}</div>
            </div>
            <div style="padding: 1.5rem;">
                <h3 style="color: var(--text-main); font-size: 1.25rem; margin-bottom: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${prop.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;"><i class="fas fa-map-marker-alt"></i> ${prop.location}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    <div style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">${formattedPrice}</div>
                    <button class="btn btn-outline" onclick="viewPropertyDetails('${prop.id}')" style="padding: 0.5rem 1rem; font-size: 0.85rem;">View Details</button>
                </div>
            </div>
        </div>`;
        grid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

function filterProperties() {
    const loc = document.getElementById('searchLocation').value.toLowerCase();
    const type = document.getElementById('searchType').value;
    const maxPrice = document.getElementById('searchMaxPrice').value;

    const filtered = allProperties.filter(p => {
        const matchLoc = p.location.toLowerCase().includes(loc) || p.title.toLowerCase().includes(loc);
        const matchType = type === 'Any' || (p.type && p.type.toLowerCase() === type.toLowerCase());
        const matchPrice = !maxPrice || parseInt(p.price) <= parseInt(maxPrice);
        return matchLoc && matchType && matchPrice;
    });

    renderProperties(filtered);
    document.getElementById('featured').scrollIntoView({ behavior: 'smooth' });
}

function viewPropertyDetails(id) {
    const prop = allProperties.find(p => p.id === id);
    if (!prop) return;
    
    // Create a detail modal dynamically or use a hidden one
    const modal = document.createElement('div');
    modal.id = 'detailsModal';
    modal.style = "position: fixed; inset: 0; z-index: 100000; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 2rem;";
    
    const formattedPrice = "KSh " + parseInt(prop.price).toLocaleString();
    const mainImg = prop.images && prop.images.length > 0 ? prop.images[0] : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
    
    modal.innerHTML = `
        <div style="background: var(--bg-card); width: 100%; max-width: 900px; max-height: 90vh; border-radius: 24px; overflow-y: auto; position: relative; border: 1px solid var(--border-color);">
            <button onclick="this.closest('#detailsModal').remove(); document.body.style.overflow='auto';" style="position: absolute; top: 1.5rem; right: 1.5rem; background: rgba(0,0,0,0.5); color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; z-index: 10;"><i class="fas fa-times"></i></button>
            <div style="height: 400px; background: url('${mainImg}') center/cover;"></div>
            <div style="padding: 3rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h2 style="color: var(--text-main); font-size: 2.5rem; margin-bottom: 0.5rem;">${prop.title}</h2>
                        <p style="color: var(--text-muted); font-size: 1.1rem;"><i class="fas fa-map-marker-alt" style="color: var(--primary);"></i> ${prop.location}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 2.5rem; font-weight: 800; color: var(--secondary);">${formattedPrice}</div>
                        <span style="background: var(--primary); color: white; padding: 0.25rem 1rem; border-radius: 99px; font-weight: 700;">${prop.status}</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; background: var(--bg-alt); padding: 1.5rem; border-radius: 16px;">
                    <div style="text-align: center;">
                        <i class="fas fa-bed" style="color: var(--primary); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Bedrooms</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${prop.beds || 2} Beds</div>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-bath" style="color: var(--primary); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Bathrooms</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">${prop.baths || 1} Baths</div>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-rocket" style="color: var(--accent); font-size: 1.5rem; margin-bottom: 0.5rem; cursor:pointer;" onclick="boostListing(${prop.id})" title="Boost to Featured"></i>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Featured</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">Available</div>
                    </div>
                    <div style="text-align: center;">
                        <i class="fas fa-parking" style="color: var(--primary); font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <div style="color: var(--text-muted); font-size: 0.85rem;">Parking</div>
                        <div style="font-weight: 700; color: var(--text-main); font-size: 1.1rem;">Available</div>
                    </div>
                </div>

                <h3 style="color: var(--text-main); margin-bottom: 1rem;">Description</h3>
                <p style="color: var(--text-muted); line-height: 1.8; margin-bottom: 3rem;">
                    This stunning ${prop.type || 'property'} located in the heart of ${prop.location} offers the perfect blend of luxury and convenience. Featuring modern finishes, spacious living areas, and top-tier security.
                </p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <button class="btn btn-outline" onclick="unlockContact(${prop.id})" style="width: 100%; padding: 1.25rem; font-size: 1.1rem;"><i class="fas fa-lock"></i> Unlock Contact</button>
                    <button class="btn btn-primary" onclick="openPayment('${prop.id}')" style="width: 100%; padding: 1.25rem; font-size: 1.1rem;"><i class="fas fa-shopping-cart"></i> Book / Buy Now (Escrow)</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

async function submitProperty(e, status) {
    e.preventDefault();
    const form = e.target;
    const inputs = form.querySelectorAll('input, select');
    const formData = new FormData();
    
    formData.append('status', status);
    
    let title = "Property Listing";
    if (status === 'FOR RENT') title = "Rental Property";
    if (status === 'FOR SALE') title = "Home for Sale";
    if (status === 'BNB') title = "BnB Listing";
    
    let location = "";
    let price = 0;
    
    inputs.forEach(input => {
        const type = input.type;
        const placeholder = input.placeholder || "";
        const label = input.previousElementSibling ? input.previousElementSibling.innerText.toLowerCase() : "";
        
        if (type === 'text' && !location && (label.includes('location') || placeholder.includes('Location'))) {
            location = input.value;
        } else if (type === 'text' && title.includes('Listing')) {
            title = input.value + " " + title;
        }
        
        if (type === 'number' && (label.includes('price') || label.includes('rent') || label.includes('budget'))) {
            price = input.value;
        }
        
        if (type === 'file' && input.files.length > 0) {
            const fieldName = input.accept.includes('image') ? 'images' : 'videos';
            for (let i = 0; i < input.files.length; i++) {
                formData.append(fieldName, input.files[i]);
            }
        }
    });

    const firstText = form.querySelector('input[type="text"]')?.value;
    formData.append('title', firstText || title);
    formData.append('location', location || "Kenya");
    formData.append('price', price);
    formData.append('type', status === 'FOR RENT' ? "apartment" : status === 'FOR SALE' ? "house" : "bnb");
    formData.append('beds', 2);
    formData.append('baths', 1);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const token = localStorage.getItem('nyumbaToken');
        if(!token) {
            alert("Please sign in first to list a property.");
            openAuth();
            return;
        }

        const res = await fetch(API_BASE + '/add-listing', {
            method: 'POST',
            headers: { 'Authorization': token },
            body: formData
        });
        const data = await res.json();
        if (res.ok && data.success) {
            alert("Property listed successfully! Refresh page to see it.");
            form.reset();
        } else {
            alert("Error: " + data.message);
        }
    } catch(err) {
        alert("Network error: Make sure Node server is running on port 3000.");
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.style.background = 'transparent';
        b.style.color = 'var(--text-muted)';
        b.style.borderColor = 'rgba(0, 212, 255, 0.3)';
    });
    
    document.getElementById(tabId).style.display = 'block';
    const activeBtn = document.getElementById('btn-' + tabId);
    if(activeBtn) {
        activeBtn.style.background = 'linear-gradient(135deg, var(--primary), #0082c8)';
        activeBtn.style.color = 'white';
        activeBtn.style.borderColor = 'transparent';
    }
}
function unlockContact(id) {
    if(confirm("Unlock direct contact for this property? (Cost: KSh 100)")) {
        openPayment(id, 100, "Unlock Contact & Direct Link");
    }
}

function boostListing(id) {
    if(confirm("Boost this property to the 'Featured' section for 30 days? (Cost: KSh 1,000)")) {
        openPayment(id, 1000, "Property Boost - Featured Status");
    }
}
// Init body overflow
document.body.style.overflow = 'auto';
function openAuth() {
    const gate = document.getElementById('authGate');
    gate.style.display = 'flex';
    setTimeout(() => { gate.style.opacity = '1'; gate.style.transform = 'scale(1)'; }, 10);
    document.body.style.overflow = 'hidden';
}
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if(isDark) {
        document.documentElement.removeAttribute('data-theme');
        document.getElementById('themeIcon').className = 'fas fa-moon';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').className = 'fas fa-sun';
    }
}
document.documentElement.removeAttribute('data-theme'); // default Light Mode
// THE VERY LAST STEP - Load everything
(function() {
    console.log("Starting debug load...");
    updateUIAfterLogin();
    loadFeaturedProperties();
    setTimeout(() => switchTab('tabRenting'), 100);
})();
