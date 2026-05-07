const { execSync } = require('child_process');
const axios = require('axios');

async function test() {
  const token = execSync("node -e \"console.log(require('jsonwebtoken').sign({ sub: 'some-id', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }, 'nebulapay_super_secret_key_2026', { expiresIn: '1h' }))\"").toString().trim();

  // Fetch tenant
  const tenantRes = await axios.get('http://localhost:3002/api/v1/tenants/91be4f61-2483-4a1d-a3d8-5b128c706fe5', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  let editData = tenantRes.data;
  
  // Simulate appending 600KB text
  editData.legalKnowledgeBase = "a".repeat(600 * 1024);
  
  // What handleUpdate does:
  const { logoFile, user, ...restPayload } = editData;
  const payload = {
    ...restPayload,
    maxActiveWorkers: Number(restPayload.maxActiveWorkers)
  };

  try {
    const res = await axios.patch(`http://localhost:3002/api/v1/tenants/${editData.id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('SUCCESS:', res.status);
  } catch (err) {
    console.error('ERROR IN PATCH:', err.response?.status, err.response?.data);
  }
}
test();
