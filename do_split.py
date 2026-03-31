import os
import re

base_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Navbar links globally to point to Flask endpoints
nav_block = r'''    <div style="display: flex; gap: 2rem; align-items: center; font-weight: 600;" class="desktop-nav">
        <a href="/" class="nav-link">Home</a>
        <a href="/listings_page" class="nav-link">Listings</a>
        <a href="/services" class="nav-link">Services</a>
        <a href="/agents" class="nav-link">Agents</a>
        <a href="/neighborhoods" class="nav-link">Guides</a>
        <a href="/pricing" class="nav-link">Pricing</a>
    </div>'''

content = re.sub(
    r'<div style="display: flex; gap: 2\.?r?e?m?; align-items: center; font-weight: 600;" class="desktop-nav">.*?</div>',
    nav_block,
    content,
    flags=re.DOTALL | re.IGNORECASE
)

blocks = {
    "hero": r'<!-- HERO SLIDESHOW & SMART SEARCH -->.*?</section>',
    "featured": r'<!-- FEATURED PROPERTY CARDS -->.*?</section>',
    "testimonials": r'<!-- TESTIMONIALS -->.*?</section>',
    "services": r'<!-- 4-SECTION SERVICES PORTAL -->.*?</section>',
    "payment": r'<!-- ========================================== -->\s*<!-- MODULE 1: M-PESA PAYMENT INTEGRATION -->.*?</section>',
    "agent": r'<!-- ========================================== -->\s*<!-- MODULE 2: AGENT VERIFICATION PORTAL -->.*?</section>',
    "pricing": r'<!-- PRICING & PACKAGES SECTION -->.*?</section>',
    "guides": r'<!-- ========================================== -->\s*<!-- MODULE 3: NEIGHBORHOOD GUIDES -->.*?</section>',
    "ads": r'<!-- MODULE 4: SPONSORED ADS.*?-->\s*<section.*?</section>',
    "premium": r'<!-- MODULE 5: AGENT PREMIUM PLANS -->.*?</section>',
}

# The ads regex needs to handle the (MONETIZATION) part safely
# Note: we use re.DOTALL to match across newlines in section blocks

def write_page(name, keep_secs):
    page_content = content
    for k, pattern in blocks.items():
        if k not in keep_secs:
            page_content = re.sub(pattern, '', page_content, flags=re.DOTALL)
            
    # If not index, adjust navbar formatting for a non-hero page
    if name != 'index.html':
        # Add solid-nav class to the <nav> element
        page_content = re.sub(r'<nav.*?style="', '<nav class="solid-nav" style="', page_content)
        # Fix missing body padding so content doesn't slip under standard navbar
        page_content = page_content.replace('<body>', '<body style="padding-top: 80px;">')
        
    with open(os.path.join(base_dir, name), 'w', encoding='utf-8') as f:
        f.write(page_content)

write_page('index.html', ['hero', 'ads', 'testimonials'])
write_page('listings.html', ['featured'])
write_page('services.html', ['services', 'payment'])
write_page('agents.html', ['agent', 'premium'])
write_page('neighborhoods.html', ['guides'])
write_page('pricing.html', ['pricing'])

print("Templates successfully split!")
