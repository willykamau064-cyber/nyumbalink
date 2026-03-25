import os
import requests
import base64
from dotenv import load_dotenv

# Load credentials from .env
load_dotenv()

# We look for both naming conventions
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY") or os.getenv("CONSUMER_KEY")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET") or os.getenv("CONSUMER_SECRET")

print("--- M-Pesa Connection Test ---")

if not MPESA_CONSUMER_KEY or "your_" in MPESA_CONSUMER_KEY:
    print("❌ ERROR: Your .env file is missing real M-Pesa keys!")
    print("Replace 'your_consumer_key' with your actual Sandbox keys from Safaricom.")
else:
    print(f"Testing Key: {MPESA_CONSUMER_KEY[:5]}...")
    
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    auth = base64.b64encode(f"{MPESA_CONSUMER_KEY}:{MPESA_CONSUMER_SECRET}".encode()).decode()
    
    headers = {"Authorization": f"Basic {auth}"}
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print("✅ SUCCESS! Successfully connected to Safaricom.")
            print(f"Access Token: {token[:10]}...")
        else:
            print(f"❌ FAILED! Safaricom rejected the keys ({response.status_code}).")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"❌ NETWORK ERROR: {str(e)}")

print("------------------------------")
