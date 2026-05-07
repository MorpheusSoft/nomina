const jwt = require('jsonwebtoken');
const token = jwt.sign({ sub: 'some-id', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }, 'nebulapay_super_secret_key_2026', { expiresIn: '1h' });
const bigString = 'a'.repeat(600 * 1024);
fetch('http://localhost:3002/api/v1/tenants/91be4f61-2483-4a1d-a3d8-5b128c706fe5', {
  method: 'PATCH',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ legalKnowledgeBase: bigString })
}).then(res => res.json().then(data => console.log('STATUS:', res.status, 'LENGTH:', data.legalKnowledgeBase?.length)))
  .catch(err => console.error('ERROR:', err));
