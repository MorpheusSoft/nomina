import { PrismaClient } from '@prisma/client';
import { PayrollPeriodsService } from './src/payroll-periods/payroll-periods.service';

async function run() {
  const prisma = new PrismaClient();
  try {
    const service = new PayrollPeriodsService(prisma as any);

    const period = await prisma.payrollPeriod.findFirst({ include: { departments: true } });
    if (!period) return console.log("No period found");
    const tenantId = period.tenantId;
    
    // Simulate non-overlapping dates
    const data = {
      name: "NON OVERLAPPING",
      payrollGroupId: period.payrollGroupId,
      type: period.type,
      costCenterId: null,
      departmentIds: [],
      specialConceptIds: null,
      linkedAttendancePeriodIds: null,
      processStatuses: ["ACTIVE"],
      startDate: new Date("2030-01-01T00:00:00.000Z"),
      endDate: new Date("2030-01-15T00:00:00.000Z")
    };

    const res = await service.create(tenantId, data);
    console.log("Success", res.id);
  } catch (e) {
    console.log("Error Caught:", e.status, e.response, e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
