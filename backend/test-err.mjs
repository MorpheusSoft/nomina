import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/attendance-summaries/generate/cm1sgz76a0006r69u936a10m7', // Need a valid ID, let's query first
  method: 'POST',
}, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
});
req.on('error', console.error);
req.end();
