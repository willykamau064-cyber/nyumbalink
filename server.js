import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import axios from "axios";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Serving LinkPoint from:", __dirname);

const app = express();
const PORT = process.env.PORT || 5000;

// ============================
// 🔐 DATABASE (Supabase)
// ============================
const supabaseUrl = process.env.SUPABASE_URL || "https://laqcnqhyhvtawzvmxlkw.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz";
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());
// Serve ALL assets and pages from the root directly (LinkPoint Pro structure)
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));

// ============================
// 🔐 AUTHENTICATION
// ============================
app.post(["/api/register", "/signup"], async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
        
        // Use Supabase Auth instead of public users table
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: name, phone: phone }
            }
        });
        
        if (error) return res.status(400).json({ success: false, message: error.message });
        res.json({ success: true, message: "Account created successfully! You can now log in.", data: data.user });
    } catch(e) {
        console.error("Register error:", e.message);
        res.status(500).json({ success: false, message: "Server error during registration. Try again." });
    }
});

app.post(["/api/login", "/login"], async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: "Please enter your email and password." });

        // Add 10 second timeout so login never hangs forever
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Login timed out. Check your Supabase credentials in .env")), 10000));
        
        const loginRequest = supabase.auth.signInWithPassword({ email, password });
        const { data, error } = await Promise.race([loginRequest, timeout]);

        if (error || !data.user) return res.status(401).json({ success: false, message: error ? error.message : "Invalid login credentials." });
        
        res.json({ 
            success: true, 
            message: `Welcome back!`, 
            token: data.session.access_token, 
            user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.full_name } 
        });
    } catch(e) {
        console.error("Login error:", e.message);
        res.status(500).json({ success: false, message: e.message.includes("timed out") ? "⚠️ Connection to database timed out. Please check your Supabase keys in .env" : "Server error during login. Try again." });
    }
});

// ============================
// 🔍 LISTINGS (API)
// ============================
app.get(["/api/listings", "/listings", "/api/properties"], async (req, res) => {
    const { type } = req.query;
    let query = supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (type) query = query.eq("type", type);
    const { data, error } = await query;
    if (error) return res.status(500).json([]);
    res.json(data);
});

app.post(["/api/properties", "/api/listings"], async (req, res) => {
    try {
        const { title, location, price, type, image_url, description } = req.body;
        const { data, error } = await supabase.from("properties").insert([
            { title, location, price: parseFloat(price), type, image_url, description, verified: false }
        ]).select();
        
        if (error) throw error;
        res.json({ success: true, message: "Listing saved successfully", data: data[0] });
    } catch(e) {
        console.error("Save listing error:", e.message);
        res.status(500).json({ success: false, message: e.message });
    }
});

// ============================
// ⭐ WEBSITE RATING
// ============================
app.post("/api/rate", async (req, res) => {
  const { rating, user_email } = req.body;
  await supabase.from("ratings").insert([{ rating, user_email }]);
  res.json({ success: true, message: "Rating submitted" });
});

// ============================
// 📁 LINKPOINT PRO PAGE ROUTING
// ============================
const sendPage = (name) => (req, res) => {
    const filePath = path.join(__dirname, `${name}.html`);
    res.sendFile(filePath, (err) => {
        if (err && !res.headersSent) {
            console.error(`Error sending ${name}.html:`, err.message);
            res.status(404).send("Page Not Found");
        }
    });
};

app.get("/", sendPage("index"));
app.get("/rentals", sendPage("rentals"));
app.get("/buy", sendPage("buy"));
app.get("/sell", sendPage("sell"));
app.get("/bnb", sendPage("bnb"));
app.get("/commercial", sendPage("commercial"));
app.get("/pricing", sendPage("pricing"));
app.get("/account", sendPage("account"));
app.get(["/dashboard", "/user-dashboard.html"], sendPage("user-dashboard"));
app.get("/about", sendPage("about"));
app.get("/services", sendPage("services"));
app.get("/agents", sendPage("agents"));
app.get("/neighborhoods", sendPage("neighborhoods"));
app.get("/join", sendPage("join"));

// ============================
// 💳 PAYSTACK CONFIG & VERIFICATION
// ============================
app.get("/api/config/paystack", (req, res) => {
    res.json({ publicKey: process.env.PAYSTACK_PUBLIC_KEY || "pk_test_yourkeyhere" });
});

app.get("/paystack/verify/:reference", async (req, res) => {
    const { reference } = req.params;
    const SECRET = process.env.PAYSTACK_SECRET_KEY || "sk_test_yourkeyhere";
    try {
        const resp = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: { Authorization: `Bearer ${SECRET}` }
        });
        res.json(resp.data);
    } catch (e) { res.status(500).json({ status: false, message: e.message }); }
});

// ============================
// 💳 M-PESA STK PUSH (Safaricom Daraja API)
// ============================
const getMpesaToken = async () => {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    try {
        const resp = await axios.get("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
            headers: { Authorization: `Basic ${auth}` }
        });
        return resp.data.access_token;
    } catch (e) { console.error("M-Pesa Token Error:", e.response?.data || e.message); throw e; }
};

app.post(["/api/stkpush", "/api/pay"], async (req, res) => {
    const { phone, amount } = req.body;
    try {
        const token = await getMpesaToken();
        const shortcode = process.env.MPESA_SHORTCODE || "174379";
        const passkey = process.env.MPESA_PASSKEY || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
        const timestamp = new Date().toISOString().replace(/[-:T]/g, "").split(".")[0];
        const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
        
        // Ensure phone is 254... format
        let formattedPhone = phone.replace(/[\s+]/g, "");
        if (formattedPhone.startsWith("0")) formattedPhone = "254" + formattedPhone.slice(1);
        if (formattedPhone.startsWith("+")) formattedPhone = formattedPhone.slice(1);

        const resp = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: amount || 1,
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: process.env.MPESA_CALLBACK_URL || "https://linkpoint.vercel.app/api/callback",
            AccountReference: "LinkPointHub",
            TransactionDesc: "Payment for LinkPoint Services"
        }, { headers: { Authorization: `Bearer ${token}` } });

        res.json({ success: true, message: "🚀 STK Push Sent! Check your phone to complete payment.", data: resp.data });
    } catch (e) {
        console.error("STK Push Failed:", e.response?.data || e.message);
        res.status(500).json({ success: false, message: "Security Error: M-Pesa Gateway Connection Failed." });
    }
});

app.listen(PORT, () => console.log(`🚀 LINKPOINT LIVE ON PORT ${PORT}`));
