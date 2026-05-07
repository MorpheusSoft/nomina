"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const payroll_periods_service_1 = require("./src/payroll-periods/payroll-periods.service");
async function run() {
    const prisma = new client_1.PrismaClient();
    try {
        const service = new payroll_periods_service_1.PayrollPeriodsService(prisma);
        const period = await prisma.payrollPeriod.findFirst({ include: { departments: true } });
        if (!period)
            return console.log("No period found");
        const tenantId = period.tenantId;
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
    }
    catch (e) {
        console.log("Error Caught:", e.status, e.response, e.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
run();
//# sourceMappingURL=scratch.js.map