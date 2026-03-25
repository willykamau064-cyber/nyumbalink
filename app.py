from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_talisman import Talisman
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import os
from datetime import datetime, timedelta
import base64
import requests
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# ================= SAFARICOM DARAJA API CONFIG =================
# Replace with your real credentials from developers.safaricom.co.ke
MPESA_CONSUMER_KEY = os.getenv("MPESA_CONSUMER_KEY", "your_consumer_key")
MPESA_CONSUMER_SECRET = os.getenv("MPESA_CONSUMER_SECRET", "your_consumer_secret")
MPESA_SHORTCODE = os.getenv("MPESA_SHORTCODE", "174379") # Sandbox uses 174379
MPESA_PASSKEY = os.getenv("MPESA_PASSKEY", "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919") # Sandbox passkey
MPESA_CALLBACK_URL = "https://yourdomain.com/mpesa/callback" # Must be HTTPS and accessible by Safaricom


STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'static')
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='/static')

# ================= SUPABASE CONFIG =================
SUPABASE_URL = "https://laqcnqhyhvtawzvmxlkw.supabase.co"
SUPABASE_KEY = "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ================= SECURITY CONFIG =================
CORS(app)
Talisman(app, content_security_policy=None, force_https=False)

# Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["2000 per day", "500 per minute"],
    storage_uri="memory://",
)


# File Uploads (Local for now, can be moved to Supabase Storage later)
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================= DASHBOARD ROUTE =================

@app.route('/')
def index():
    return render_template('index.html')

# ================= AUTH ROUTES (Supabase Auth) =================

@app.route('/signup', methods=['POST'])
@app.route('/register', methods=['POST']) # Added compatibility for Node migration
@limiter.limit("5 per minute")
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')

    if not email or not password:
        return jsonify({"success": False, "message": "Missing fields"}), 400

    try:
        # 1. Signup with Supabase Auth
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"phone": phone}}
        })
        
        if res.user:
            # 2. Add entry to our public users table (synced)
            # This is optional if you use Supabase internal auth, 
            # but usually, you want a "profile" table.
            # supabase.table('users').insert({"id": res.user.id, "email": email, "phone": phone}).execute()
            
            return jsonify({"success": True, "message": "User created. Please check your email for confirmation."})
        else:
            return jsonify({"success": False, "message": "Signup failed"}), 400
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if res.user:
            return jsonify({
                "success": True, 
                "token": res.session.access_token, # Send Supabase token to frontend
                "user": {"email": res.user.email, "id": res.user.id}
            })
    except Exception as e:
         return jsonify({"success": False, "message": "Invalid credentials or " + str(e)}), 401
    
    return jsonify({"success": False, "message": "Auth error"}), 401

@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email')
    try:
        supabase.auth.reset_password_for_email(email, {
            "redirect_to": "http://localhost:3000/update-password"
        })
        return jsonify({"success": True, "message": "Reset email sent"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/update-password', methods=['POST'])
def update_user_password():
    data = request.json
    new_password = data.get('password')
    access_token = data.get('access_token')
    
    try:
        # We need to set the session first if using access token manually
        # supabase.auth.set_session(access_token)
        supabase.auth.update_user({"password": new_password})
        return jsonify({"success": True, "message": "Password updated"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# ================= LISTING ROUTES (Supabase Table) =================

@app.route('/listings', methods=['GET'])
@limiter.exempt
def get_listings():
    try:
        # Fetch properties from Supabase 'properties' table
        response = supabase.table('properties').select("*").order("verified", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/add-listing', methods=['POST'])
@app.route('/listings', methods=['POST']) # Added compatibility for Node migration
def add_listing():
    # Detect JSON or Form data (Node uses JSON, legacy uses Form)
    if request.is_json:
        data = request.json
        title = data.get('title')
        location = data.get('location')
        price = data.get('price')
        l_type = data.get('type')
        status = data.get('status', 'FOR RENT')
        beds = data.get('beds', 1)
        baths = data.get('baths', 1)
        image_urls = data.get('images', ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"])
    else:
        # Note: In a production app, we would use JWT verification here.
        # For now, we follow the user's existing logic.
        
        title = request.form.get('title')
        location = request.form.get('location')
        price = request.form.get('price')
        l_type = request.form.get('type')
        status = request.form.get('status', 'FOR RENT')
        beds = request.form.get('beds', 1)
        baths = request.form.get('baths', 1)

        # Handle Multiple Images (Local upload -> for now)
        image_urls = []
        files = request.files.getlist('images')
        
        for file in files:
            if file and file.filename != '':
                filename = secure_filename(file.filename)
                unique_name = f"{os.urandom(4).hex()}_{filename}"
                full_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
                file.save(full_path)
                image_urls.append(f"http://localhost:3000/uploads/{unique_name}")

        if not image_urls:
            image_urls = ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]

    try:
        # Insert into Supabase table
        supabase.table('properties').insert({
            "title": title,
            "location": location,
            "price": int(price),
            "type": l_type,
            "status": status,
            "beds": int(beds),
            "baths": int(baths),
            "images": image_urls
        }).execute()
        return jsonify({"success": True, "message": "Listing added successfully to Supabase!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/uploads/<filename>')
@limiter.exempt
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ================= ADMIN ACTIONS (Supabase) =================

@app.route('/verify/<id>', methods=['PATCH'])
def verify_listing(id):
    supabase.table('properties').update({"verified": True}).eq("id", id).execute()
    return jsonify({"message": "Verified in Supabase"})

@app.route('/delete/<id>', methods=['DELETE'])
def delete_listing(id):
    supabase.table('properties').delete().eq("id", id).execute()
    return jsonify({"message": "Deleted from Supabase"})

# End of configuration routes

# ================= MPESA REAL INTEGRATION =================

def get_mpesa_access_token():
    # Always refresh from .env to avoid stale keys
    load_dotenv(override=True)
    c_key = os.getenv("MPESA_CONSUMER_KEY") or os.getenv("CONSUMER_KEY")
    c_secret = os.getenv("MPESA_CONSUMER_SECRET") or os.getenv("CONSUMER_SECRET")
    
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    try:
        res = requests.get(url, auth=(c_key, c_secret))
        if res.status_code == 200:
            return res.json().get('access_token')
        else:
            print(f"❌ SAFARICOM AUTH FAILED ({res.status_code}): {res.text}")
            return None
    except Exception as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
        return None

@app.route('/mpesa/stk-push', methods=['POST'])
@app.route('/pay', methods=['POST'])
@limiter.limit("3 per minute")
def stk_push():
    data = request.json
    phone = data.get('phone') # Format: 254700000000
    amount = data.get('amount')
    
    if not phone or not amount:
        return jsonify({"success": False, "message": "Missing phone or amount"}), 400

    token = get_mpesa_access_token()
    if not token:
        return jsonify({"success": False, "message": "Could not authenticate with Safaricom"}), 500

    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password = base64.b64encode(f"{MPESA_SHORTCODE}{MPESA_PASSKEY}{timestamp}".encode()).decode()

    headers = { "Authorization": f"Bearer {token}" }
    payload = {
        "BusinessShortCode": MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline", # or CustomerBuyGoodsOnline
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": MPESA_CALLBACK_URL,
        "AccountReference": "NyumbaLinkHub",
        "TransactionDesc": "Property Payment"
    }

    try:
        # Sandbox URL. Use https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest for production
        res = requests.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", json=payload, headers=headers)
        response_data = res.json()
        
        if response_data.get('ResponseCode') == '0':
            # LOG TRANSACTION TO SUPABASE
            try:
                supabase.table('transactions').insert({
                    "type": "MPESA_STK",
                    "id_ref": response_data.get('CheckoutRequestID'),
                    "amount": int(amount),
                    "phone": phone,
                    "status": "PENDING",
                    "created_at": datetime.now().isoformat()
                }).execute()
            except Exception as e:
                print(f"⚠️ Supabase Transaction Log Failed (M-Pesa): {e}")

            return jsonify({"success": True, "message": "STK Push sent! Please check your phone.", "data": response_data})
        else:
            return jsonify({"success": False, "message": response_data.get('CustomerMessage', 'STK Push failed'), "error": response_data})
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/mpesa/callback', methods=['POST'])
@limiter.exempt
def mpesa_callback():
    # Safaricom will POST here with the final result (Success/Fail)
    data = request.json
    print("M-Pesa Callback Status:", data)
    # You would typically update your database (Supabase) here to "Paid"
    return jsonify({"ResultCode": 0, "ResultDesc": "Accepted"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
