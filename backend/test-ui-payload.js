const jwt = require('jsonwebtoken');
async function run() {
  try {
    const token = jwt.sign({ sub: 'some-id', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }, 'nebulapay_super_secret_key_2026', { expiresIn: '1h' });

    console.log("Sending request to oracle...");
    const res = await fetch('http://localhost:3002/api/v1/oracle/generate-concept', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: "Bono nocturno",
        context: { globalVars: [], payrollGroupVars: [], costCenterVars: [], existingConcepts: [], payrollGroups: [], currentForm: {} },
        history: []
      })
    });
    
    if (res.status >= 400) {
      console.log("STATUS:", res.status);
      const err = await res.json();
      console.log("ERROR:", err);
    } else {
      const data = await res.json();
      console.log("SUCCESS");
    }
  } catch (e) {
    console.log("FETCH ERROR:", e);
  }
}
run();
