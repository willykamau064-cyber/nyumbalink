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
app.use(cors());
app.use(express.json());

// Serve static files (logo, images, etc.) from /static and /uploads
app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root route to serve the main frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "templates", "index.html"));
});

// 🔐 Supabase Setup (Credentials from .env or placeholder)
const supabase = createClient(
  process.env.SUPABASE_URL || "https://laqcnqhyhvtawzvmxlkw.supabase.co",
  process.env.SUPABASE_ANON_KEY || "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz"
);

// ============================
// 🧑 USER REGISTER
// ============================
app.post("/register", async (req, res) => {
  const { email, password, phone } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { phone: phone }
    }
  });

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "User registered", data });
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
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ success: false, message: error.message });

  res.json({ success: true, message: "Login success", token: data.session.access_token, user: data.user });
});

// ============================
// 🏠 CREATE LISTING
// ============================
app.post("/listings", async (req, res) => {
  const {
    title,
    location,
    price,
    type, // house, bnb, office, shop
    description,
    images,
    is_featured,
    status,
    beds,
    baths
  } = req.body;

  const { data, error } = await supabase.from("properties").insert([
    {
      title,
      location,
      price: parseInt(price),
      type,
      description,
      images: images || ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"],
      is_featured: is_featured || false,
      status: status || 'FOR RENT',
      beds: parseInt(beds) || 2,
      baths: parseInt(baths) || 1
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
// 💳 M-PESA STK PUSH (Ported from existing Python code)
// ============================
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY || "your_consumer_key";
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET || "your_consumer_secret";
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE || "174379";
const MPESA_PASSKEY = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

async function getMpesaToken() {
  const url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64");
  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Basic ${auth}` }
    });
    return res.data.access_token;
  } catch (err) {
    console.error("M-Pesa Token Error:", err.response?.data || err.message);
    return null;
  }
}

app.post("/mpesa/stk-push", async (req, res) => {
  const { phone, amount } = req.body;
  
  const token = await getMpesaToken();
  if (!token) return res.status(500).json({ success: false, message: "Could not authenticate with Safaricom" });

  const date = new Date();
  const timestamp = date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
    
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: parseInt(amount),
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: "https://yourdomain.com/mpesa/callback",
    AccountReference: "NyumbaLinkHub",
    TransactionDesc: "Property Payment"
  };

  try {
    const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.ResponseCode === "0") {
      res.json({ success: true, message: "STK Push sent!", data: response.data });
    } else {
      res.json({ success: false, message: response.data.CustomerMessage || "STK Push failed", error: response.data });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.response?.data?.errorMessage || "STK Push Request error" });
  }
});

app.post("/mpesa/callback", (req, res) => {
  console.log("M-Pesa Callback Status:", JSON.stringify(req.body, null, 2));
  res.json({ ResultCode: 0, ResultDesc: "Accepted" });
});

// ============================
// 🚀 START SERVER
// ============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Premium NyumbaLink backend running on port ${PORT}`);
});
