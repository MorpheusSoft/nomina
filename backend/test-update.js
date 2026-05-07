const http = require('http');

const data = {
  name: "SEMANA 11 DEL SISTEMA 4X4 DEL 2026",
  payrollGroupId: "b744cecc-b179-43c2-bf72-ec10ef50d6f1",
  type: "REGULAR",
  costCenterId: null,
  departmentIds: [],
  specialConceptIds: null,
  linkedAttendancePeriodIds: null,
  processStatuses: ["ACTIVE"],
  startDate: "2026-03-08T00:00:00.000Z",
  endDate: "2026-03-14T00:00:00.000Z"
};

const req = http.request({
  hostname: 'localhost',
  port: 3002,
  path: '/api/v1/payroll-periods/38e788c1-11e7-4950-8b43-2cc578ecb1b8',
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(JSON.stringify(data));
req.end();
