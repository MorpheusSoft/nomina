const fs = require('fs');
const jwt = require('jsonwebtoken');

async function test() {
  const token = jwt.sign({ sub: 'some-id', email: 'admin@nebulapayrolls.com', tenantId: '91be4f61-2483-4a1d-a3d8-5b128c706fe5' }, 'nebulapay_super_secret_key_2026', { expiresIn: '1h' });

  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync('/home/lzambrano/Tempo/CONTRATO PETROLERO 2019-2021.pdf')]), 'CONTRATO PETROLERO 2019-2021.pdf');

  console.log('Uploading PDF...');
  const uploadRes = await fetch('http://localhost:3002/api/v1/tenants/91be4f61-2483-4a1d-a3d8-5b128c706fe5/upload-rag-pdf', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  });
  
  const uploadData = await uploadRes.json();
  console.log('Upload Response:', uploadData);
}
test().catch(console.error);
