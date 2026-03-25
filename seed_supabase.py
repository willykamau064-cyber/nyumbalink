from supabase import create_client, Client
import random

SUPABASE_URL = "https://laqcnqhyhvtawzvmxlkw.supabase.co"
SUPABASE_KEY = "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Sample Data to get the website started
properties = [
    {
        "title": "Modern 4BR Villa - Karen",
        "location": "Karen, Nairobi",
        "price": 18500000,
        "type": "Villa",
        "status": "FOR SALE",
        "beds": 4,
        "baths": 3,
        "images": ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
        "verified": True
    },
    {
        "title": "Luxury Penthouse - Westlands",
        "location": "Westlands, Nairobi",
        "price": 120000,
        "type": "Apartment",
        "status": "FOR RENT",
        "beds": 3,
        "baths": 2,
        "images": ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
        "verified": True
    },
    {
        "title": "Cozy Studio - Roysambu",
        "location": "Roysambu, Nairobi",
        "price": 3000,
        "type": "BnB",
        "status": "BNB",
        "beds": 1,
        "baths": 1,
        "images": ["https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800"],
        "verified": True
    }
]

print("Seeding Supabase with sample properties...")
try:
    supabase.table('properties').insert(properties).execute()
    print("Successfully seeded 3 properties!")
except Exception as e:
    print(f"Error seeding: {e}")
