const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/users',
  method: 'GET'
}, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${data.substring(0, 200)}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});
req.end();
