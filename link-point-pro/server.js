import http from "http";
import fs from "fs";
import path from "path";
import { Buffer } from "node:buffer";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";

const db = new sqlite3.Database("linkpoint.db");
db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, password TEXT)");
const CONSUMER_KEY = "S9TnrELYZPAXhpSs2uM0cVO2wUAAKeyNfTAuEsAtEQ3hdZO5";
const CONSUMER_SECRET = "1SsB13hn8uoaGYLANpg0bhG29XzXMKcazIz5XqbOgKHZLQBaMCs8KNKppmrrAiuN";

async function getAccessToken() {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
    const r = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
        headers: { Authorization: `Basic ${auth}` }
    });
    const d = await r.json(); return d.access_token;
}

const server = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") { res.writeHead(200); res.end(); return; }

    // PAYSTACK API ENDPOINT (MOCK)
    if (req.method === "POST" && req.url === "/api/paystack/callback") {
        try {
            let body = ""; for await (const chunk of req) body += chunk;
            console.log("Paystack Webhook Body:", body);
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ status: "success", message: "Webhook received!" }));
        } catch(e) { 
            console.error("Paystack Error:", e);
            res.writeHead(500, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ status: "error", message: "Webhook failed" }));
        }
        return;
    }

    // AUTH & STATIC FILES (RESTORED TO DB)
    if (req.method === "POST" && (req.url === "/api/register" || req.url === "/signup")) {
        let body = ""; for await (const chunk of req) body += chunk;
        const user = JSON.parse(body || "{}");
        if (!user.email || !user.password) {
            res.writeHead(400, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ success: false, message: "Missing credentials" })); return;
        }
        const userName = user.name || user.fullname || user.email.split('@')[0];
        bcrypt.hash(user.password, 10, (err, hash) => {
            if (err) { res.writeHead(500); res.end(); return; }
            db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [userName, user.email, hash], function(err) {
                if (err) {
                    res.writeHead(400, {"Content-Type":"application/json"});
                    res.end(JSON.stringify({ success: false, message: "Email already exists" })); return;
                }
                res.writeHead(200, {"Content-Type":"application/json"});
                res.end(JSON.stringify({ success: true, message: "Account registered successfully!", token: "tok_" + this.lastID }));
            });
        });
        return;
    }
    if (req.method === "POST" && (req.url === "/api/login" || req.url === "/login")) {
        let body = ""; for await (const chunk of req) body += chunk;
        const user = JSON.parse(body || "{}");
        if (!user.email || !user.password) {
            res.writeHead(400, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ success: false, message: "Missing credentials" })); return;
        }
        db.get("SELECT * FROM users WHERE email = ?", [user.email], (err, row) => {
            if (err || !row) {
                res.writeHead(401, {"Content-Type":"application/json"});
                res.end(JSON.stringify({ success: false, message: "Invalid email or password" })); return;
            }
            bcrypt.compare(user.password, row.password, (err, result) => {
                if (result) {
                    res.writeHead(200, {"Content-Type":"application/json"});
                    res.end(JSON.stringify({ success: true, message: "Login successful!", token: "tok_" + row.id, user: { name: row.name, email: row.email } }));
                } else {
                    res.writeHead(401, {"Content-Type":"application/json"});
                    res.end(JSON.stringify({ success: false, message: "Invalid email or password" }));
                }
            });
        });
        return;
    }

    // LISTINGS ENDPOINT
    if (req.method === "GET" && (req.url === "/api/listings" || req.url === "/listings")) {
        const dummyListings = [
            { id: '1', title: 'Modern 4BR Villa', location: 'Karen, Nairobi', price: 18500000, status: 'FOR SALE', type: 'house', beds: 4, baths: 3, images: ['villa.png'] },
            { id: '2', title: 'Luxury 2BR Apartment', location: 'Kilimani, Nairobi', price: 65000, status: 'FOR RENT', type: 'apartment', beds: 2, baths: 2, images: ['apartment.png'] },
            { id: '3', title: 'Sunny Vacation BnB', location: 'Diani Beach', price: 8500, status: 'BNB', type: 'bnb', beds: 1, baths: 1, images: ['bnb.png'] },
            { id: '4', title: 'Prime Retail Shop', location: 'CBD, Nairobi', price: 45000, status: 'FOR RENT', type: 'shop', beds: 0, baths: 1, images: ['kenya_house.png'] },
            { id: '5', title: 'Executive Office Space', location: 'Westlands', price: 120000, status: 'FOR RENT', type: 'office', beds: 0, baths: 2, images: ['kenyan_apartment.png'] },
            { id: '6', title: 'Cozy 3BR Bungalow', location: 'Ruiru, Kiambu', price: 7500000, status: 'FOR SALE', type: 'house', beds: 3, baths: 2, images: ['kenya_shop.png'] }
        ];
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify(dummyListings)); return;
    }

    let filePath = "." + req.url; if (filePath === "./") filePath = "./index.html";
    const ext = path.extname(filePath).toLowerCase();
    fs.readFile(filePath, (err, content) => {
        if (err) { 
            // Try secondary extensions or index.html logic
            if (ext === "") {
                const altPath = filePath + ".html";
                fs.readFile(altPath, (err2, content2) => {
                    if (err2) { res.writeHead(404); res.end("Not Found"); }
                    else { res.writeHead(200, { "Content-Type": "text/html" }); res.end(content2); }
                });
                return;
            }
            res.writeHead(404); res.end("Not Found"); return; 
        }
        const mimes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
        res.writeHead(200, { "Content-Type": mimes[ext] || "text/plain" });
        res.end(content);
    });
});

server.listen(3000, "0.0.0.0", () => console.log("LINKPOINT LIVE NODE BACKEND ON 3000"));

