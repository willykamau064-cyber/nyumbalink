import os
import re
import glob

print("Starting UI Repair Script...")

templates_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"
html_files = glob.glob(os.path.join(templates_dir, "*.html"))

# 1. Dark Mode Fix
def fix_dark_mode(content):
    # Ensure dark mode text is visible
    content = re.sub(
        r'(\[data-theme="dark"\]\s*\{.*?--text-main:\s*)#0A2540(;.*?})',
        r'\1#FFFFFF\2',
        content,
        flags=re.DOTALL
    )
    # Fix .solid-nav forcing black text globally by scoping to light mode
    content = re.sub(
        r'\.solid-nav\s+\.nav-link\s*\{\s*color:\s*#000000\s*!important;\s*\}',
        r':not([data-theme="dark"]) .solid-nav .nav-link { color: #000000 !important; }',
        content
    )
    content = re.sub(
        r'\.solid-nav\s+h1\s*\{\s*color:\s*#000000\s*!important;\s*\}',
        r':not([data-theme="dark"]) .solid-nav h1 { color: #000000 !important; }',
        content
    )
    content = re.sub(
        r'\.solid-nav\s+i\s*\{\s*color:\s*#000000\s*!important;\s*\}',
        r':not([data-theme="dark"]) .solid-nav i { color: #000000 !important; }',
        content
    )
    return content

# 2. Add Search JS snippet
search_js = """
// --- SEARCH LOGIC ---
function handleSearch() {
    const type = document.getElementById('search-type') ? document.getElementById('search-type').value : 'Rent';
    const loc = document.getElementById('search-location') ? document.getElementById('search-location').value : 'Nairobi';
    alert('Searching for properties to ' + type + ' in ' + loc + '...\\n(This will connect to the Supabase Database backend)');
    window.location.href = '/listings_page?type=' + type + '&loc=' + loc;
}
"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply Dark Mode Fixes
    content = fix_dark_mode(content)

    # Apply Image Path Fixes (only for broken links like src="logo.png" -> src="/static/logo.png")
    # For all generic assets without absolute paths in src or url(), we namespace them
    content = re.sub(r'src="logo\.png"', 'src="/static/logo.png"', content)
    content = re.sub(r'src="logo\.jpg"', 'src="/static/logo.png"', content)
    # Also fix background urls for headers
    content = re.sub(r"url\('shop_bg\.png'\)", "url('/static/list_shop_bg.png')", content)
    content = re.sub(r"url\('office_bg\.png'\)", "url('/static/office_bg.png')", content)
    content = re.sub(r"url\('villa\.png'\)", "url('/static/villa.png')", content)
    content = re.sub(r"url\('apartment\.png'\)", "url('/static/apartment.png')", content)

    # 3. Specific Agent/Neighborhood Replacements
    if "index.html" in filepath or "agents.html" in filepath:
        # Agents -> Kenyan (Wanjiru, Kamau, Brian K)
        content = re.sub(r'James Thompson', 'Kamau Ndung\'u', content)
        content = re.sub(r'src="james\.png"', 'src="/static/agent_kamau.png"', content)
        content = re.sub(r"url\('james\.png'\)", "url('/static/agent_kamau.png')", content)

        content = re.sub(r'Mercy Atieno', 'Wanjiru Kamau', content)
        content = re.sub(r'Sarah Jenkins', 'Wanjiru Kamau', content)
        content = re.sub(r'src="mercy\.png"', 'src="/static/agent_wanjiru.png"', content)
        content = re.sub(r"url\('mercy\.png'\)", "url('/static/agent_wanjiru.png')", content)

        content = re.sub(r'Brian Kiptoo', 'Brian K', content)
        content = re.sub(r'Michael Chen', 'Brian K', content)
        content = re.sub(r'src="brian\.png"', 'src="/static/agent_brian.png"', content)
        content = re.sub(r"url\('brian\.png'\)", "url('/static/agent_brian.png')", content)

    if "index.html" in filepath:
        # Replace Homepage Image Hero with Video Background
        hero_video_html = """
<div style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:-1; overflow:hidden;">
    <video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;">
        <source src="/static/hero-bg.mp4" type="video/mp4">
    </video>
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:var(--bg-overlay); opacity:0.8;"></div>
</div>
"""
        # Cleanly replace the old hero background structure
        if "hero-bg.mp4" not in content and 'class="hero"' in content:
            # Inject video inside the hero section
            content = re.sub(
                r'(<header class="hero"[^>]*>)\s*<div\s+class="hero-content">',
                r'\1\n' + hero_video_html + '\n<div class="hero-content" style="position:relative; z-index:1;">',
                content,
                count=1
            )
            # Remove any inline background-image from the hero header that conflicts
            content = re.sub(r'(<header class="hero"[^>]*)style="background:[^"]*"', r'\1', content)

        # Connect search button
        content = re.sub(r'<button class="btn btn-primary" style="padding: 1rem 2rem;">.*?(<i class="fas fa-search"></i> Search)</button>', r'<button class="btn btn-primary" onclick="handleSearch()" style="padding: 1rem 2rem;">\1</button>', content)

        # Ensure search_js is injected inside <script>
        if "handleSearch()" not in content:
             content = content.replace("</script>", search_js + "\n</script>", 1)

        # Neighborhood background replacements
        content = re.sub(r"url\('https://images\.unsplash\.com/photo-15776378[^\)]+'\)", "url('/static/location_karen.png')", content)
        content = re.sub(r"url\('https://images\.unsplash\.com/photo-15187806[^\)]+'\)", "url('/static/location_westlands.png')", content)
        content = re.sub(r"url\('https://images\.unsplash\.com/photo-15805877[^\)]+'\)", "url('/static/location_kilimani.png')", content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched: {filepath}")

for fp in html_files:
    process_file(fp)

print("UI Repair Completed.")
