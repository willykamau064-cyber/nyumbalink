import os
import re

desktop_dir = r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"
scratch_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"

# 1. Check if static/logo.png exists
static_dir = os.path.join(desktop_dir, 'static')
if os.path.exists(static_dir):
    print("Static files:", os.listdir(static_dir))
else:
    print("STATIC DIR MISSING!")

# 2. Overhaul Agents
def patch_agents(filepath):
    print(f"Processing {filepath}")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Names
    content = content.replace("James Mwangi", "Kamau Ndung'u")
    content = content.replace("James", "Kamau")
    content = content.replace("Sarah Jenkins", "Wanjiru Kamau")
    content = content.replace("Sarah", "Wanjiru")
    content = content.replace("Mercy Atieno", "Wanjiru Kamau")
    content = content.replace("Michael Chen", "Brian K")
    content = content.replace("Michael", "Brian K")

    # Images
    content = content.replace("agent_kamau.png", "agent_kamau.png") # already done by prev script
    content = content.replace("james.png", "agent_kamau.png")
    content = content.replace("mercy.png", "agent_wanjiru.png")
    content = content.replace("sarah.png", "agent_wanjiru.png")
    content = content.replace("brian.png", "agent_brian.png")
    content = content.replace("michael.png", "agent_brian.png")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Overhaul Hero Background
def patch_hero(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for the hero container
    if 'hero-slider' in content and 'hero-bg.mp4' not in content:
        print("Found hero-slider, patching video...")
        
        video_html = """
<div style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; overflow:hidden;">
    <video autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;">
        <source src="static/hero-bg.mp4" type="video/mp4">
    </video>
    <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:var(--bg-overlay); opacity:0.8;"></div>
</div>
"""
        # Inject right after `<header ...>` or similar
        content = re.sub(r'(<header[^>]*class="[^"]*hero-[^>]*>)', r'\1\n' + video_html, content, count=1)
        
        # If there isn't a header tag, maybe it's just a section?
        if "hero-bg.mp4" not in content:
            content = re.sub(r'(<section[^>]*id="home"[^>]*>)', r'\1\n' + video_html, content, count=1)
            
        # Disable the old slide animation fallback
        content = content.replace("animation: slide 18s", "/* animation: slide 18s */")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


for filename in os.listdir(desktop_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(desktop_dir, filename)
        patch_agents(filepath)
        if filename == "index.html":
            patch_hero(filepath)

print("Overhaul complete on Desktop files.")
