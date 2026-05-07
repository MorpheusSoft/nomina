const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ sub: 'some-id', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }, 'nebulapay_super_secret_key_2026', { expiresIn: '1h' });

  // Simulate editData that comes from the backend findOne:
  const editData = {
    "id": "91be4f61-2483-4a1d-a3d8-5b128c706fe5",
    "name": "Pegaso Corporation SaaS",
    "taxId": "J-12345678-9",
    "isActive": true,
    "createdAt": "2026-04-15T11:56:50.033Z",
    "updatedAt": "2026-05-07T01:58:56.820Z",
    "maxActiveWorkers": 50,
    "serviceEndDate": null,
    "hasWorkerPortalAccess": true,
    "hasGeofencingAccess": true,
    "hasOracleAccess": true,
    "oraclePrompt": "Asume el rol de un Consultor...",
    "legalKnowledgeBase": "a".repeat(600 * 1024),
    "logoUrl": "",
    "contactPhone": "",
    "users": [],
    "_count": { "workers": 1 }
  };

  const { logoFile, user, ...restPayload } = editData;
  const payload = {
    ...restPayload,
    maxActiveWorkers: Number(restPayload.maxActiveWorkers)
  };

  try {
    const res = await fetch(`http://localhost:3002/api/v1/tenants/${editData.id}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('STATUS:', res.status);
    const data = await res.json();
    if (res.status >= 400) {
      console.log('ERROR:', data);
    }
  } catch (err) {
    console.error('FETCH ERROR:', err);
  }
}
test();
