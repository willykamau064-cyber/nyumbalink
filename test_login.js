const fetch = require('node-fetch'); // wait, native fetch is in Node 18+

(async () => {
  console.log("Starting login test...");
  const start = Date.now();
  try {
    const r = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" })
    });
    const txt = await r.text();
    console.log("Time taken:", Date.now() - start, "ms");
    console.log("Status:", r.status);
    console.log("Response:", txt);
  } catch(e) {
    console.error("Fetch failed:", e);
  }
})();
