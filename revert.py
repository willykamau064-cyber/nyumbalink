import os
import glob
import shutil

desktop_dir = r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"
templates_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\templates"
public_dir = r"c:\Users\wilson\.gemini\antigravity\scratch\public"

print("Starting complete rollback...")

# 1. Move static contents out of static into public root so `src="logo.png"` works on Vercel natively without /static/
static_sub = os.path.join(public_dir, "static")
if os.path.exists(static_sub):
    for item in os.listdir(static_sub):
        s = os.path.join(static_sub, item)
        d = os.path.join(public_dir, item)
        shutil.move(s, d)
    # Don't delete static_sub yet just in case

def revert_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Revert image paths from static/ to root
    content = content.replace('src="static/', 'src="')
    content = content.replace('href="static/', 'href="')
    content = content.replace("url('static/", "url('")
    content = content.replace('src="/static/', 'src="')
    content = content.replace('href="/static/', 'href="')
    content = content.replace("url('/static/", "url('")

    # Revert names
    content = content.replace("Kamau Ndung'u", "James Mwangi")
    content = content.replace("Wanjiru Kamau", "Mercy Atieno")
    
    # Revert images
    content = content.replace("agent_kamau.png", "james.png")
    content = content.replace("agent_wanjiru.png", "mercy.png")
    content = content.replace("agent_brian.png", "brian.png")
    
    content = content.replace("location_karen.png", "https://images.unsplash.com/photo-1577637841315-9c8828b8ebd3?auto=format&fit=crop&q=80")
    content = content.replace("location_westlands.png", "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80")
    content = content.replace("location_kilimani.png", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&q=80")

    # Revert Video Background
    if '<video autoplay muted loop playsinline class="hero-video">' in content or '<video autoplay loop muted playsinline' in content:
        import re
        content = re.sub(r'<div style="position: absolute; top:0; left:0; width:100%; height:100%; z-index:0; overflow:hidden;">.*?</div>\s*', '', content, flags=re.DOTALL)
        content = content.replace("/* animation: slide 18s */", "animation: slide 18s")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Revert local Desktop files
for filepath in glob.glob(os.path.join(desktop_dir, "*.html")):
    revert_file(filepath)

# Revert scratch templates
for filepath in glob.glob(os.path.join(templates_dir, "*.html")):
    revert_file(filepath)

print("Rollback script complete. All files returned to original state.")
