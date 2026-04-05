from supabase import create_client, Client
import random

SUPABASE_URL = "https://laqcnqhyhvtawzvmxlkw.supabase.co"
SUPABASE_KEY = "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Expanded Sample Data for Kenya Marketplace
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
        "title": "Oceanfront Bliss - Diani Beach",
        "location": "Diani, South Coast",
        "price": 35000000,
        "type": "Villa",
        "status": "FOR SALE",
        "beds": 5,
        "baths": 4,
        "images": ["https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"],
        "verified": True
    },
    {
        "title": "Coastal Apartment - Nyali",
        "location": "Nyali, Mombasa",
        "price": 25000,
        "type": "Apartment",
        "status": "FOR RENT",
        "beds": 2,
        "baths": 2,
        "images": ["https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800"],
        "verified": True
    },
    {
        "title": "Business Hub Office - Nakuru",
        "location": "Nakuru CBD",
        "price": 45000,
        "type": "Commercial",
        "status": "FOR RENT",
        "beds": 0,
        "baths": 1,
        "images": ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"],
        "verified": True
    },
    {
        "title": "Highland Retreat - Eldoret",
        "location": "Eldoret Town",
        "price": 12000000,
        "type": "Bungalow",
        "status": "FOR SALE",
        "beds": 3,
        "baths": 2,
        "images": ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800"],
        "verified": True
    },
    {
        "title": "Nairobi Skyline View Studio",
        "location": "Upper Hill, Nairobi",
        "price": 8500,
        "type": "BnB",
        "status": "BNB",
        "beds": 1,
        "baths": 1,
        "images": ["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"],
        "verified": True
    }
]

print(f"Seeding Supabase with {len(properties)} properties...")
try:
    supabase.table('properties').insert(properties).execute()
    print("Successfully seeded marketplace!")
except Exception as e:
    print(f"Error seeding: {e}")
