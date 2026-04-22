const axios = require('axios');

async function run() {
  try {
    // 1. Login
    const loginRes = await axios.post('http://localhost:3002/api/v1/auth/login', {
      email: 'admin@nebulapayrolls.com',
      password: '123456'
    });
    console.log('Login OK:', loginRes.data.accessToken ? 'Got Token' : 'No Token');
    const token = loginRes.data.accessToken;

    // 2. Fetch /tenants
    const tenantsRes = await axios.get('http://localhost:3002/api/v1/tenants', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Tenants OK:', tenantsRes.data.length);
  } catch (e) {
    if (e.response) {
      console.error('Error:', e.response.status, e.response.data);
    } else {
      console.error('Error:', e.message);
    }
  }
}
run();
