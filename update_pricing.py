import os
import re
import glob

def update_pricing(path):
    print(f"Updating pricing in: {path}")
    html_files = glob.glob(os.path.join(path, "*.html"))
    
    for file in html_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Update button texts and values
        
        # 1. Rent a home (400)
        # Assuming the button said "Find Properties" or "Find My Next Home"
        content = re.sub(
            r'onsubmit="event\.preventDefault\(\);\s*alert\(\'Request submitted successfully!\'\);\s*"(.*?)>Find My Next Home</button>',
            r'onsubmit="event.preventDefault(); openPayment(null, 400, \'Rent a Home Request\');"\1>Find My Next Home (KSh 400)</button>',
            content, flags=re.DOTALL
        )
        content = re.sub(r'>Find My Next Home</button>', r'>Find My Next Home (KSh 400)</button>', content)

        # 2. Buy a home (1500)
        content = re.sub(
            r'onsubmit="event\.preventDefault\(\);\s*alert\(\'Request submitted successfully!\'\);\s*"(.*?)>Find My Dream Home</button>',
            r'onsubmit="event.preventDefault(); openPayment(null, 1500, \'Buy a Home Request\');"\1>Find My Dream Home (KSh 1,500)</button>',
            content, flags=re.DOTALL
        )
        content = re.sub(r'>Find My Dream Home</button>', r'>Find My Dream Home (KSh 1,500)</button>', content)

        # 3. Find Office (1000)
        content = re.sub(
            r'onsubmit="event\.preventDefault\(\);\s*alert\(\'Office search started!\'\);\s*"(.*?)>Search Offices</button>',
            r'onsubmit="event.preventDefault(); openPayment(null, 1000, \'Office Search Request\');"\1>Search Offices (KSh 1,000)</button>',
            content, flags=re.DOTALL
        )
        content = re.sub(r'>Search Offices</button>', r'>Search Offices (KSh 1,000)</button>', content)

        # 4. Find Shop (1000)
        content = re.sub(
            r'onsubmit="event\.preventDefault\(\);\s*alert\(\'Shop search started!\'\);\s*"(.*?)>Search Shops</button>',
            r'onsubmit="event.preventDefault(); openPayment(null, 1000, \'Shop Search Request\');"\1>Search Shops (KSh 1,000)</button>',
            content, flags=re.DOTALL
        )
        content = re.sub(r'>Search Shops</button>', r'>Search Shops (KSh 1,000)</button>', content)

        # 5. List Rental (2000) -> was 200
        content = re.sub(r'Submit Listing \(KSh 200\)', 'Submit Listing (KSh 2,000)', content)

        # 6. List Office (1500) -> was 1000
        content = re.sub(r'Submit Office \(KSh 1,000\)', 'Submit Office (KSh 1,500)', content)

        # 7. List Shop (1500) -> was 1000
        content = re.sub(r'Submit Shop \(KSh 1,000\)', 'Submit Shop (KSh 1,500)', content)

        # 8. Sell Home (2500) -> was 1000
        content = re.sub(r'List Property For Sale \(KSh 1,000\)', 'List Property For Sale (KSh 2,500)', content)

        # 9. Find BnB (400)
        content = re.sub(
            r'onsubmit="event\.preventDefault\(\);\s*alert\(\'BnB search started!\'\);\s*"(.*?)>Search BnBs</button>',
            r'onsubmit="event.preventDefault(); openPayment(null, 400, \'BnB Search Request\');"\1>Search BnBs (KSh 400)</button>',
            content, flags=re.DOTALL
        )
        content = re.sub(r'>Search BnBs</button>', r'>Search BnBs (KSh 400)</button>', content)

        # 10. List BnB (600) -> was 300
        content = re.sub(r'Submit BnB Listing \(KSh 300\)', 'Submit BnB Listing (KSh 600)', content)

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated pricing in {file}")

update_dirs = [r"c:\Users\wilson\.gemini\antigravity\scratch\templates", r"c:\Users\wilson\OneDrive\Desktop\nyumbanilink-web"]
for path in update_dirs:
    update_pricing(path)
print("Finished updating pricing.")
