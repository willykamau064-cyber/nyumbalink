const SUPABASE_URL = 'https://laqcnqhyhvtawzvmxlkw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xV0mj5rXsvJb9qgW2fSANQ_5D4OJaFz';

async function check() {
  try {
    const r = await fetch(\/rest/v1/properties?select=*&order=created_at.desc, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': Bearer \
      }
    });
    const data = await r.json();
    console.log('--- DATABASE STATUS ---');
    console.log('Total ListingsFound:', data.length);
    if(data.length > 0) {
      console.log('Latest Listing:', data[0].title, 'at', data[0].location);
    }
  } catch(e) {
    console.log('DATABASE ERROR:', e.message);
  }
}
check();
