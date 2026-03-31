from flask import Flask, request, jsonify, send_from_directory, render_template, abort
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from werkzeug.utils import secure_filename
from supabase import create_client, Client
import os
from datetime import datetime
import base64
import requests
from dotenv import load_dotenv
import functools

# Load environment variables from .env
load_dotenv()

# ================= CONFIG FROM ENVIRONMENT =================
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://laqcnqhyhvtawzvmxlkw.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz")
PAYSTACK_SECRET_KEY = os.getenv("PAYSTACK_SECRET_KEY")
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "changeme123")  # Set a strong secret in .env!
ALLOWED_ORIGIN = os.getenv("ALLOWED_ORIGIN", "https://linkpointkenya.co.ke")

# ================= SUPABASE CLIENT =================
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ================= APP SETUP =================
STATIC_FOLDER = os.path.join(os.path.dirname(__file__), 'static')
app = Flask(__name__, static_folder=STATIC_FOLDER, static_url_path='/static')

# ================= SECURITY: CORS (Restrict to your domain) =================
CORS(app, resources={r"/*": {"origins": [ALLOWED_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"]}})

# ================= RATE LIMITING =================
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["2000 per day", "200 per hour"],
    storage_uri="memory://",
)

# ================= FILE UPLOADS =================
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ================= ADMIN AUTH DECORATOR =================
def require_admin(f):
    """Protect admin routes with a secret token passed in the X-Admin-Token header."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("X-Admin-Token") or request.args.get("token")
        if not token or token != ADMIN_SECRET:
            return jsonify({"success": False, "message": "Unauthorized"}), 403
        return f(*args, **kwargs)
    return decorated

# ================= PAGE ROUTES =================
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/listings_page')
def listings_page():
    return render_template('listings.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/agents')
def agents():
    return render_template('agents.html')

@app.route('/neighborhoods')
def neighborhoods():
    return render_template('neighborhoods.html')

@app.route('/pricing')
def pricing():
    return render_template('pricing.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# ================= AUTH ROUTES =================
@app.route('/signup', methods=['POST'])
@app.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def signup():
    data = request.json or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')
    phone = data.get('phone', '').strip()

    if not email or not password:
        return jsonify({"success": False, "message": "Email and password are required"}), 400
    if len(password) < 6:
        return jsonify({"success": False, "message": "Password must be at least 6 characters"}), 400

    try:
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {"data": {"phone": phone}}
        })
        if res.user:
            return jsonify({"success": True, "message": "Account created! Please check your email to confirm."})
        return jsonify({"success": False, "message": "Signup failed"}), 400
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login():
    data = request.json or {}
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"success": False, "message": "Missing credentials"}), 400

    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.user:
            return jsonify({
                "success": True,
                "token": res.session.access_token,
                "user": {"email": res.user.email, "id": res.user.id}
            })
    except Exception as e:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401

    return jsonify({"success": False, "message": "Auth error"}), 401

@app.route('/reset-password', methods=['POST'])
@limiter.limit("3 per minute")
def reset_password():
    data = request.json or {}
    email = data.get('email', '').strip()
    if not email:
        return jsonify({"success": False, "message": "Email is required"}), 400
    try:
        supabase.auth.reset_password_for_email(email, {
            "redirect_to": f"{ALLOWED_ORIGIN}/update-password"
        })
        return jsonify({"success": True, "message": "Password reset email sent"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/update-password', methods=['POST'])
def update_user_password():
    data = request.json or {}
    new_password = data.get('password', '')
    if len(new_password) < 6:
        return jsonify({"success": False, "message": "Password too short"}), 400
    try:
        supabase.auth.update_user({"password": new_password})
        return jsonify({"success": True, "message": "Password updated"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# ================= LISTING ROUTES =================
@app.route('/listings', methods=['GET'])
@limiter.exempt
def get_listings():
    try:
        response = supabase.table('properties').select("*").order("verified", desc=True).execute()
        return jsonify(response.data)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/add-listing', methods=['POST'])
@app.route('/listings', methods=['POST'])
@limiter.limit("10 per minute")
def add_listing():
    if request.is_json:
        data = request.json
        title = data.get('title', '').strip()
        location = data.get('location', '').strip()
        price = data.get('price', 0)
        l_type = data.get('type', '')
        status = data.get('status', 'FOR RENT')
        beds = data.get('beds', 1)
        baths = data.get('baths', 1)
        image_urls = data.get('images', ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"])
    else:
        title = request.form.get('title', '').strip()
        location = request.form.get('location', '').strip()
        price = request.form.get('price', 0)
        l_type = request.form.get('type', '')
        status = request.form.get('status', 'FOR RENT')
        beds = request.form.get('beds', 1)
        baths = request.form.get('baths', 1)
        image_urls = []
        for file in request.files.getlist('images'):
            if file and file.filename:
                filename = secure_filename(file.filename)
                unique_name = f"{os.urandom(4).hex()}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_name))
                image_urls.append(f"{ALLOWED_ORIGIN}/uploads/{unique_name}")
        if not image_urls:
            image_urls = ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]

    if not title or not location:
        return jsonify({"success": False, "message": "Title and location are required"}), 400

    try:
        supabase.table('properties').insert({
            "title": title, "location": location, "price": int(price),
            "type": l_type, "status": status, "beds": int(beds),
            "baths": int(baths), "images": image_urls
        }).execute()
        return jsonify({"success": True, "message": "Listing added!"})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/uploads/<filename>')
@limiter.exempt
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ================= ADMIN ROUTES (Protected) =================
@app.route('/verify/<id>', methods=['PATCH'])
@require_admin
def verify_listing(id):
    supabase.table('properties').update({"verified": True}).eq("id", id).execute()
    return jsonify({"message": "Listing verified"})

@app.route('/delete/<id>', methods=['DELETE'])
@require_admin
def delete_listing(id):
    supabase.table('properties').delete().eq("id", id).execute()
    return jsonify({"message": "Listing deleted"})

# ================= HEALTH CHECK =================
@app.route('/health')
@limiter.exempt
def health():
    try:
        supabase.table('properties').select("id").limit(1).execute()
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    return jsonify({
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    })

# ================= PAYSTACK =================
@app.route('/paystack/webhook', methods=['POST'])
@limiter.exempt
def paystack_webhook():
    data = request.json or {}
    # Handle Paystack webhooks (e.g. successful payment verification)
    print(f"Paystack Webhook received: {data.get('event')}")
    return jsonify({"status": "Accepted"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=False)
