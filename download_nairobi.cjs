const https = require('https');
const fs = require('fs');

const url = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Nairobi_skyline.jpg/1280px-Nairobi_skyline.jpg";
const file = fs.createWriteStream("real_nairobi_aerial.jpg");

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
}, response => {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('Download completed');
    });
  } else {
    console.error(`Failed: ${response.statusCode}`);
  }
}).on('error', err => {
  fs.unlink("real_nairobi_aerial.jpg");
  console.error(`Error: ${err.message}`);
});
