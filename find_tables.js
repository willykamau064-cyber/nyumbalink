import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function findTables() {
    console.log("--- 🕵️ TABLE DISCOVERY ---");
    // Try to query common tables
    const tables = ['properties', 'listings', 'profiles', 'users', 'transactions'];
    for (const t of tables) {
        const { data, error } = await supabase.from(t).select('*').limit(1);
        if (!error) {
            console.log(`✅ Table '${t}' exists! Columns:`, data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty');
        } else {
            console.log(`❌ Table '${t}' error:`, error.message);
        }
    }
}

findTables();
