const { PrismaClient } = require('@prisma/client');
const http = require('http');

const prisma = new PrismaClient();

async function run() {
  const period = await prisma.payrollPeriod.findFirst({
    where: { status: { in: ['DRAFT', 'PRE_CALCULATED'] } }
  });
  if (!period) return console.log('No open period');

  const req = http.request({
    hostname: '127.0.0.1',
    port: 3002,
    path: `/api/v1/attendance-summaries/generate/${period.id}`,
    method: 'POST',
  }, (res) => {
    let data = '';
    res.on('data', (c) => data += c);
    res.on('end', () => console.log('Status:', res.statusCode, 'Body:', data));
  });
  req.on('error', console.error);
  req.end();
}

run();
