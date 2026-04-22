async function run() {
  const loginRes = await fetch('http://127.0.0.1:3002/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@nebulapay.com', password: '123456' })
  });
  if (!loginRes.ok) {
     console.log("LOGIN FAILED", await loginRes.text());
     return;
  }
  const loginData = await loginRes.json();
  const res = await fetch('http://127.0.0.1:3002/api/v1/tenants', {
    headers: { 'Authorization': 'Bearer ' + loginData.accessToken }
  });
  console.log("Status:", res.status);
  console.log("Data:", await res.text());
}
run();
