const SUPABASE_URL = 'https://laqcnqhyhvtawzvmxlkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz';

async function check() {
  const r = await fetch(\/rest/v1/properties?select=*&order=created_at.desc&limit=3, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': Bearer \
    }
  });
  const data = await r.json();
  console.log('--- LATEST ENTRIES IN YOUR DATABASE ---');
  console.log(JSON.stringify(data, null, 2));
}
check();
