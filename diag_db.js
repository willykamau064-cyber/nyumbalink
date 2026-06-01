import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkDB() {
    console.log("--- 🕵️ DB DIAGNOSTIC ---");
    const { data, error } = await supabase
        .from('properties')
        .select('id, title, verified, owner_phone, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ ERROR:", error.message);
    } else {
        console.log(`✅ Found ${data.length} recent properties.`);
        data.forEach(p => {
            console.log(`[${p.id}] "${p.title}" | Verified: ${p.verified} | Phone: ${p.owner_phone}`);
        });
    }
}

checkDB();
