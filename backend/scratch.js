const axios = require('axios');

async function run() {
  try {
    // I don't have the auth token. Let me mock the service call instead.
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find the first period
    const period = await prisma.payrollPeriod.findFirst();
    if (!period) return console.log("No period found");

    const { PayrollPeriodsService } = require('./src/payroll-periods/payroll-periods.service');
    const service = new PayrollPeriodsService(prisma);

    const user = { tenantId: period.tenantId };
    
    // Simulate what the frontend sends
    const data = {
      name: "Test Update",
      payrollGroupId: period.payrollGroupId,
      type: "REGULAR",
      costCenterId: null,
      departmentIds: [],
      specialConceptIds: [],
      linkedAttendancePeriodIds: [],
      processStatuses: ["ACTIVE"],
      startDate: new Date(),
      endDate: new Date()
    };

    await service.update(user, period.id, data);
    console.log("Success");
  } catch (e) {
    console.log("Error:", e.message);
    if (e.response) console.log(e.response.data);
  }
}
run();
