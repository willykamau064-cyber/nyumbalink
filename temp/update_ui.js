const fs = require('fs');
const glob = require('fs').readdirSync('.');
const files = glob.filter(f => f.endsWith('.html'));

const modals = 
<!-- Live Chat Modal -->
<div class=\"auth-ov\" id=\"chat-ov\"><div class=\"auth-box\" style=\"padding:0;overflow:hidden;max-width:380px;border-color:#25D366\"><div style=\"background:#25D366;padding:1.5rem;display:flex;justify-content:space-between;align-items:center\"><div style=\"color:#fff;font-weight:700;font-size:1.1rem\"><i class=\"fab fa-whatsapp\"></i> Live Agent Chat</div><button style=\"background:none;border:none;color:#fff;cursor:pointer;font-size:1.2rem\" onclick=\"closeChat()\"><i class=\"fas fa-times\"></i></button></div><div style=\"padding:1.5rem;height:350px;overflow-y:auto;background:#0d1424;display:flex;flex-direction:column;gap:1rem\"><div style=\"background:rgba(255,255,255,.05);padding:1rem;border-radius:12px 12px 12px 0;width:85%;color:var(--muted);font-size:.85rem;line-height:1.5\">Hello! ???? Welcome to LinkPoint Kenya. How can our agents help you today? Are you looking to buy, sell, or rent?</div></div><div style=\"padding:1rem;background:#111827;border-top:1px solid var(--gb);display:flex;gap:.5rem\"><input type=\"text\" class=\"fi\" placeholder=\"Type a message...\" style=\"margin:0;padding:.8rem;border-radius:100px\"><button class=\"btn bp\" style=\"padding:.8rem;border-radius:50%;width:42px;height:42px;background:#25D366;box-shadow:0 4px 15px rgba(37,211,102,0.4)\" onclick=\"alert('Message forwarded to Live Agent Dashboard!')\"><i class=\"fas fa-paper-plane\"></i></button></div></div></div>

<!-- Amenities Modal -->
<div class=\"auth-ov\" id=\"amenities-ov\"><div class=\"auth-box\"><button class=\"acl\" onclick=\"closeAmenities()\"><i class=\"fas fa-times\"></i></button><div style=\"text-align:center;margin-bottom:1.5rem\"><div style=\"width:60px;height:60px;background:rgba(59,130,246,.18);border-radius:12px;margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:#60a5fa\"><i class=\"fas fa-map-signs\"></i></div><h2 style=\"font-family:var(--serif);font-size:1.7rem;color:#60a5fa;margin-bottom:0.5rem\">Social Amenities</h2><p style=\"color:var(--muted);font-size:.87rem\" id=\"amenity-loc\">Local Area</p></div><div style=\"display:flex;flex-direction:column;gap:.8rem\"><div style=\"background:var(--glass);padding:1rem;border-radius:12px;border:1px solid var(--gb)\"><div style=\"color:#f87171;font-weight:700;margin-bottom:.3rem;font-size:.9rem\"><i class=\"fas fa-hospital\"></i> Healthcare</div><p style=\"color:var(--muted);font-size:.8rem\">Aga Khan Hospital, Getrudes Childrens Clinic (1.5km)</p></div><div style=\"background:var(--glass);padding:1rem;border-radius:12px;border:1px solid var(--gb)\"><div style=\"color:#fbbf24;font-weight:700;margin-bottom:.3rem;font-size:.9rem\"><i class=\"fas fa-shopping-cart\"></i> Malls & Shopping</div><p style=\"color:var(--muted);font-size:.8rem\">Sarit Centre, Local Minimart, Quickmart (500m)</p></div><div style=\"background:var(--glass);padding:1rem;border-radius:12px;border:1px solid var(--gb)\"><div style=\"color:#34d399;font-weight:700;margin-bottom:.3rem;font-size:.9rem\"><i class=\"fas fa-graduation-cap\"></i> Schools & Education</div><p style=\"color:var(--muted);font-size:.8rem\">Braeburn International, Strathmore, Local Academies (2km)</p></div></div></div></div>

<!-- Floating Chat Button -->
<button class=\"chat-btn\" onclick=\"openChat()\"><i class=\"fas fa-comment-dots\"></i> Live Chat</button>

<style>
.chat-btn { position:fixed; bottom:20px; left:20px; background:#25D366; color:#111; padding:0.8rem 1.4rem; border-radius:100px; font-weight:800; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 20px rgba(37,211,102,0.4); z-index:1000; display:flex; align-items:center; gap:0.6rem; transition:all 0.3s; border:none; font-family:var(--sans) }
.chat-btn:hover { transform:translateY(-3px); box-shadow:0 6px 25px rgba(37,211,102,0.6) }
.amenity-btn { cursor:pointer; background:rgba(59,130,246,.12); color:#60a5fa; padding:0.4rem 0.8rem; border-radius:8px; display:inline-flex; align-items:center; gap:0.4rem; font-size:0.75rem; font-weight:700; transition:all 0.3s; margin-top:1rem; border:1px solid rgba(59,130,246,.2) }
.amenity-btn:hover { background:#3b82f6; color:#fff }
</style>

<script>
function openChat(){ document.getElementById('chat-ov').classList.add('open'); document.body.style.overflow='hidden'; }
function closeChat(){ document.getElementById('chat-ov').classList.remove('open'); document.body.style.overflow=''; }
document.getElementById('chat-ov')?.addEventListener('click', e => { if(e.target === e.currentTarget) closeChat(); });
function openAmenities(loc){ document.getElementById('amenity-loc').innerText = loc + ' Area Information'; document.getElementById('amenities-ov').classList.add('open'); document.body.style.overflow='hidden'; }
function closeAmenities(){ document.getElementById('amenities-ov').classList.remove('open'); document.body.style.overflow=''; }
document.getElementById('amenities-ov')?.addEventListener('click', e => { if(e.target === e.currentTarget) closeAmenities(); });
</script>
;

for (let f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if(!c.includes('chat-btn')) {
    c = c.replace(/<div class="pfeats">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g, '<div class="pfeats"></div><div class="amenity-btn" onclick="openAmenities(Neighbourhood)"><i class="fas fa-map-signs"></i> View Amenities</div></div></div></div>');
    c = c.replace(/<a href="\/" class="nl">Home<\/a>/g, '<a href="/" class="nl">Home</a>\\n    <a href="javascript:void(0)" onclick="openRate()" class="nl" style="color:#f59e0b;font-weight:700"><i class="fas fa-star"></i> Feedback</a>');
    c = c.replace('</body>', modals + '\\n</body>');
    
    // Removing BOM and ensuring strict standard UTF-8 buffer!
    if(c.charCodeAt(0) === 0xFEFF) {
        c = c.slice(1);
    }
    fs.writeFileSync(f, c, 'utf8');
    console.log("Updated " + f);
  }
}
