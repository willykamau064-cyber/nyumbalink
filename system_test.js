async function testFullFlow() {
    console.log("--- 🚀 STARTING FULL SYSTEM TEST ---");

    const testData = {
        title: "REPAIR TEST " + Date.now(),
        location: "System Diagnostic",
        price: "9999",
        type: "Test Listing",
        owner_phone: "0712345678"
    };

    console.log("1. Sending test listing to http://localhost:5000/api/properties...");
    try {
        const res = await fetch('http://localhost:5000/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const data = await res.json();
        console.log("   Result Status:", res.status);
        console.log("   Result Data:", JSON.stringify(data));

        if (res.ok) {
            console.log("2. Fetching pending listings from http://localhost:5000/api/admin/pending...");
            const res2 = await fetch('http://localhost:5000/api/admin/pending');
            const data2 = await res2.json();
            console.log("   Found:", data2.length, "pending properties.");
            
            const found = data2.find(p => p.title.startsWith("REPAIR TEST"));
            if (found) {
                console.log("✅ SUCCESS: Listing was saved and retrieved!");
            } else {
                console.log("❌ FAILED: Listing was saved but not found in Pending list.");
            }
        } else {
            console.log("❌ FAILED: Server returned error during save.");
        }
    } catch (e) {
        console.error("❌ CRITICAL ERROR:", e.message);
    }
}

testFullFlow();
