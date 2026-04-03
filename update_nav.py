import os
import re

dir_path = "templates"
files = ["account.html", "bnb.html", "buy-home.html", "commercial.html", "find-rental.html", "list-rental.html", "pricing.html", "sell-home.html"]

new_nav = """    <div class="nav-links">
        <a href="/">Home</a>
        <a href="/find-rental">Find Rental</a>
        <a href="/buy-home">Buy Home</a>
        <a href="/bnb">BnB</a>
        <a href="/commercial">Commercial</a>
        <a href="/pricing">Pricing</a>
    </div>"""

# Match `<div class="nav-links">...</div>` across multiple lines
pattern = re.compile(r'^[ \t]*<div class="nav-links">.*?</div>', re.DOTALL | re.MULTILINE)

for file_name in files:
    path = os.path.join(dir_path, file_name)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated_content = pattern.sub(new_nav, content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        print(f"Updated {file_name}")
