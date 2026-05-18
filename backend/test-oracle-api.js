const jwt = require('jsonwebtoken');
const axios = require('axios');

const secret = process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026';

// create dummy payload that bypasses DB check
const payload = {
  sub: "123",
  email: "admin@nebulapayrolls.com",
  tenantId: "dummy-tenant",
  roleId: "admin",
  permissions: ['ALL_ACCESS']
};

const token = jwt.sign(payload, secret);

async function test() {
  try {
    const res = await axios.post('http://localhost:3002/api/v1/oracle/generate-concept', {
      prompt: "Explícame la ley de trabajo",
      context: { existingConcepts: [], globalVars: [] },
      history: []
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("SUCCESS:", res.data);
  } catch(err) {
    if (err.response) {
      console.error("HTTP ERROR:", err.response.status, err.response.data);
    } else {
      console.error("NETWORK ERROR:", err.message);
    }
  }
}
test();
