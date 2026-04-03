const http = require('http');

async function testApi() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/properties',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log('--- LOCAL API RESPONSE ---');
      console.log('Status:', res.statusCode);
      console.log('Body:', data);
    });
  });

  req.on('error', (e) => {
    console.error(--- LOCAL API ERROR: \);
  });

  req.end();
}
testApi();
