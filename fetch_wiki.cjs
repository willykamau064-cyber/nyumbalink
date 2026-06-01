const https = require('https');
const fs = require('fs');

https.get("https://en.wikipedia.org/w/api.php?action=query&titles=Nairobi&prop=pageimages&pithumbsize=2000&format=json", {
  headers: { 'User-Agent': 'NodeBot/1.0' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const pages = data.query.pages;
      const firstPage = pages[Object.keys(pages)[0]];
      const imageUrl = firstPage.thumbnail.source;
      console.log("Image URL:", imageUrl);
      
      const file = fs.createWriteStream("real_nairobi_aerial.jpg");
      https.get(imageUrl, { headers: { 'User-Agent': 'NodeBot/1.0' } }, (res2) => {
         res2.pipe(file);
         file.on('finish', () => console.log('Downloaded'));
      });
    } catch(e) {
      console.error(e);
    }
  });
});
