import os
import glob

def add_why_choose_us():
    html_files = [
        r"c:\Users\wilson\.gemini\antigravity\scratch\templates\index.html",
        r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web\index.html"
    ]
    
    new_section = """
<!-- WHY CHOOSE LINKPOINT -->
<section style="padding: 6rem 5%; background: var(--bg-main); text-align: center; border-top: 1px solid rgba(0,0,0,0.05);">
    <div style="max-width: 900px; margin: 0 auto;" data-aos="fade-up">
        <h2 style="color: var(--text-main); font-size: 2.8rem; margin-bottom: 2rem; font-weight: 800; font-family: var(--font-serif);">✨ Why Choose LinkPoint?</h2>
        <div style="background: var(--bg-alt); padding: 3rem; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.03);">
            <p style="color: var(--primary); font-size: 1.35rem; font-weight: 600; line-height: 1.6; margin-bottom: 1.5rem;">
                At LinkPoint, we don't just list properties — we connect you to quality, verified, and valuable opportunities.
            </p>
            <div style="width: 60px; height: 3px; background: var(--secondary); margin: 0 auto 1.5rem; border-radius: 3px;"></div>
            <p style="color: var(--text-muted); font-size: 1.15rem; line-height: 1.8;">
                We are built for people who are serious about finding the right space, and for property owners who want real results, not wasted time.
            </p>
        </div>
    </div>
</section>
"""

    for file in html_files:
        if not os.path.exists(file):
            continue
            
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        if "Why Choose LinkPoint" not in content:
            # Insert before the FOOTER
            content = content.replace("<!-- FOOTER -->", new_section + "\n    <!-- FOOTER -->")
            
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added 'Why Choose LinkPoint' to {file}")

add_why_choose_us()
