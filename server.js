import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5000'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-Admin-Token']
}));
app.use(express.json());

// Serve static files (logo, images, etc.) from /static and /uploads
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ============================
// 📄 PAGE ROUTES — 6 Dedicated Pages + Home + Account
// ============================
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "templates", "index.html")));
app.get("/find-rental", (req, res) => res.sendFile(path.join(__dirname, "templates", "find-rental.html")));
app.get("/list-rental", (req, res) => res.sendFile(path.join(__dirname, "templates", "list-rental.html")));
app.get("/buy-home", (req, res) => res.sendFile(path.join(__dirname, "templates", "buy-home.html")));
app.get("/sell-home", (req, res) => res.sendFile(path.join(__dirname, "templates", "sell-home.html")));
app.get("/bnb", (req, res) => res.sendFile(path.join(__dirname, "templates", "bnb.html")));
app.get("/commercial", (req, res) => res.sendFile(path.join(__dirname, "templates", "commercial.html")));
app.get("/pricing", (req, res) => res.sendFile(path.join(__dirname, "templates", "pricing.html")));
app.get("/account", (req, res) => res.sendFile(path.join(__dirname, "templates", "account.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "templates", "dashboard.html")));
// Legacy redirects
app.get("/rentals", (req, res) => res.redirect("/find-rental"));
app.get("/sales", (req, res) => res.redirect("/buy-home"));
app.get("/offices", (req, res) => res.redirect("/commercial"));
app.get("/shops", (req, res) => res.redirect("/commercial"));



// 🔐 Supabase Setup
const supabase = createClient(
  process.env.SUPABASE_URL || "https://laqcnqhyhvtawzvmxlkw.supabase.co",
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz"
);
console.log(`📡 Supabase URL: ${process.env.SUPABASE_URL || 'using default'}`);

// ============================
// 🧑 USER REGISTER
// ============================
app.post("/register", async (req, res) => {
  const { email, password, phone } = req.body || {};

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });
  if (password.length < 6)
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone: phone || '' } }
    });

    if (error) return res.status(400).json({ success: false, message: error.message });

    // signUp returns a user even if email confirmation is required
    const user = data.user;
    const session = data.session;
    res.json({
      success: true,
      message: session
        ? "Account created! Welcome to LinkPoint."
        : "Account created! Please check your email to confirm your account.",
      token: session ? session.access_token : null,
      user: user ? { id: user.id, email: user.email } : null
    });
  } catch(e) {
    console.error('Register error:', e);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// ============================
// 🔑 PASSWORD RECOVERY
// ============================
app.post("/reset-password", async (req, res) => {
  const { email } = req.body;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "http://localhost:5000/update-password", // Change in production
  });

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Password reset email sent", data });
});

app.post("/update-password", async (req, res) => {
  const { password, access_token } = req.body;
  
  // Note: Supabase usually handles this via the client-side session, 
  // but we can also use the access_token directly if needed.
  const { data, error } = await supabase.auth.updateUser({
    password: password
  }, { access_token });

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Password updated successfully", data });
});

// ============================
// 🔑 LOGIN
// ============================
app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Email and password are required" });

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return res.status(401).json({ success: false, message: error.message });
    if (!data.session) return res.status(401).json({ success: false, message: "Login failed – no session returned" });

    res.json({
      success: true,
      message: "Login successful!",
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email }
    });
  } catch(e) {
    console.error('Login error:', e);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// ============================
// 👤 GET CURRENT USER (verify token)
// ============================
app.get("/me", async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, message: "No token" });

  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ success: false, message: "Invalid or expired token" });
    res.json({ success: true, user: { id: data.user.id, email: data.user.email } });
  } catch(e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================
// 🚪 LOGOUT
// ============================
app.post("/logout", async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token) {
    try { await supabase.auth.admin.signOut(token); } catch(e) {}
  }
  res.json({ success: true, message: "Logged out" });
});

// ============================
// 🏠 CREATE LISTING
// ============================
app.post("/listings", async (req, res) => {
  const {
    title,
    location,
    price,
    type, // house_rent, house_sale, bnb, office, shop
    description,
    images,
    videos, // Added as requested
    is_featured,
    status,
    beds,
    baths,
    rooms, // Added as requested (e.g. number of rooms)
    amenities, // Array: CCTV, WiFi, Parking, Gym
    neighborhood_amenities, // For Section 4 (Sale): Balcony, Playground, Pet Friendly, Backup Generator
    contact_name,
    contact_phone,
    contact_email,
    caretaker_name,
    caretaker_phone,
    caretaker_email,
    owner_name,
    owner_email
  } = req.body;

  const { data, error } = await supabase.from("properties").insert([
    {
      title,
      location,
      price: parseInt(price),
      type,
      description,
      images: images || ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
      videos: videos || [],
      is_featured: is_featured || false,
      status: status || 'FOR RENT',
      beds: parseInt(beds) || 0,
      baths: parseInt(baths) || 0,
      rooms: parseInt(rooms) || 0,
      amenities: amenities || [],
      neighborhood_amenities: neighborhood_amenities || [],
      contact_info: {
        name: contact_name,
        phone: contact_phone,
        email: contact_email,
        caretaker_name,
        caretaker_phone,
        caretaker_email,
        owner_name,
        owner_email
      }
    },
  ]);

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Listing created", data });
});

// ============================
// 🔍 GET ALL LISTINGS
// ============================
app.get("/listings", async (req, res) => {
  const { type } = req.query;

  let query = supabase.from("properties").select("*").order("verified", { ascending: false });

  if (type) query = query.eq("type", type);

  const { data, error } = await query;

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json(data);
});

// ============================
// 🔥 FEATURE LISTING
// ============================
app.post("/feature/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("properties")
    .update({ is_featured: true })
    .eq("id", id);

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Listing featured", data });
});

// ============================
// 💸 RECORD PAYMENT
// ============================
app.post("/payments", async (req, res) => {
  const { user_id, amount, type } = req.body;

  const { data, error } = await supabase.from("payments").insert([
    {
      user_id,
      amount,
      type, // listing, featured, subscription
    },
  ]);

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Payment recorded", data });
});

// ============================
// 💰 COMMISSION TRACKING
// ============================
app.post("/commission", async (req, res) => {
  const { property_id, sale_price } = req.body;

  const commission = sale_price * 0.02; // 2%

  const { data, error } = await supabase.from("commissions").insert([
    {
      property_id,
      sale_price,
      commission,
    },
  ]);

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Commission recorded", data });
});

// ============================
// 🖼️ IMAGE UPLOAD (Supabase Storage)
// ============================
app.post("/upload", async (req, res) => {
  const { fileName, fileData } = req.body;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, fileData, {
      contentType: "image/png",
    });

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Uploaded", data });
});

// ============================
// 💳 PAYSTACK INTEGRATION
// ============================
// Note: Currently Paystack is handled client-side via the inline.js popup.
// If you need server-side verification, add a /paystack/verify endpoint here.
app.post("/paystack/webhook", (req, res) => {
  // Handle Paystack webhooks (e.g. successful payment verification)
  const event = req.body;
  console.log("Paystack Webhook received:", event.event);
  res.sendStatus(200);
});


// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Premium LinkPoint backend running on port ${PORT}`);
});
