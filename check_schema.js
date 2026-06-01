import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("--- 🕵️ SCHEMA CHECK ---");
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ ERROR:", error.message);
    } else if (data.length > 0) {
        console.log("✅ Columns found in 'properties':", Object.keys(data[0]).join(', '));
    } else {
        console.log("⚠️ Table is empty. Trying to list all tables...");
    }
}

checkSchema();
