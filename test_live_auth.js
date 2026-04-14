(async () => {
    try {
        const rand = Math.floor(Math.random() * 10000);
        const email = `testuser${rand}@example.com`;
        const testUser = { name: "Test User", email: email, phone: "0712345678", password: "password123" };
        
        console.log("Registering:", email);
        const regRes = await fetch("https://linkpoint-kenya.vercel.app/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(testUser)
        });
        const regData = await regRes.text();
        console.log("Reg Status:", regRes.status, regData);

        console.log("Logging in...");
        const logRes = await fetch("https://linkpoint-kenya.vercel.app/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: testUser.email, password: testUser.password })
        });
        const logData = await logRes.text();
        console.log("Log Status:", logRes.status, logData);
    } catch(e) {
        console.error("Error:", e);
    }
})();
