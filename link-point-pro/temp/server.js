const http = require("http");
const fs = require("fs");
const path = require("path");

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

    // DARAJA MPESA STK PUSH LIVE CONNECTION
    if (req.method === "POST" && req.url === "/api/stkpush") {
        try {
            let body = ""; for await (const chunk of req) body += chunk;
            const { phone, amount } = JSON.parse(body || "{}");
            const token = await getAccessToken();
            const date = new Date().toISOString().replace(/[:\-T\.Z]/g, "").slice(0, 14);
            const pass = Buffer.from(`174379bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919${date}`).toString("base64");

            const r = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    BusinessShortCode: "174379", Password: pass, Timestamp: date,
                    TransactionType: "CustomerPayBillOnline", Amount: amount, PartyA: phone,
                    PartyB: "174379", PhoneNumber: phone, CallBackURL: "https://mydomain.com/callback",
                    AccountReference: "LinkPoint", TransactionDesc: "Property Payment"
                })
            });
            const d = await r.json();
            console.log("M-Pesa Response:", d);
            res.writeHead(200, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ status: "success", message: d.CustomerMessage || "STK Push Initiated!" }));
        } catch(e) { 
            console.error("M-Pesa Error:", e);
            res.writeHead(500, {"Content-Type":"application/json"});
            res.end(JSON.stringify({ status: "error", message: "Daraja Hub Connection Failed" }));
        }
        return;
    }

    // AUTH & STATIC FILES (RESTORED)
    if (req.method === "POST" && (req.url === "/api/register" || req.url === "/register")) {
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify({ status: "success", message: "Account registered!" })); return;
    }
    if (req.method === "POST" && (req.url === "/api/login" || req.url === "/login")) {
        res.writeHead(200, {"Content-Type":"application/json"});
        res.end(JSON.stringify({ status: "success", message: "Login success!", token: "abc_123" })); return;
    }

    let filePath = "." + req.url; if (filePath === "./") filePath = "./index.html";
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, content) => {
        if (err) { res.writeHead(404); res.end("Not Found"); return; }
        const mimes = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png" };
        res.writeHead(200, { "Content-Type": mimes[ext] || "text/plain" });
        res.end(content);
    });
});

server.listen(5000, "0.0.0.0", () => console.log("LIVE DARAJA HUB ON 5000"));
