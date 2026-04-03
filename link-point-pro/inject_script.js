const fs = require('fs');
const glob = require('fs').readdirSync('.');
const files = glob.filter(f => f.endsWith('.html'));

for (let f of files) {
  let c = fs.readFileSync(f, 'utf8');
  if(!c.includes('linkpoint-3d.js')) {
    c = c.replace('</body>', '<script src="linkpoint-3d.js"></script>\n</body>');
    if(c.charCodeAt(0) === 0xFEFF) c = c.slice(1);
    fs.writeFileSync(f, c, 'utf8');
    console.log("Injected 3D into " + f);
  }
}
