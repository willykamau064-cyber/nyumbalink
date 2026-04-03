import os

files_to_update = {
    "templates/pricing.html": [
        ("KES 500", "KES 400"),
        ("500", "400", 1), # just replacing the first big numbers carefully or I should use regex
    ]
}

# Safer way for python: read file, do string replace.
def replace_in_file(path, old, new):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)

# We need a robust way. Let's rewrite the pricing sections that matter using Python blocks.
# Actually, since I have full context of pricing.html, I can just replace the specific service cards.
