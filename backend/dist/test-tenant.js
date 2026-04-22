"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const users = await prisma.user.findMany();
    const periods = await prisma.payrollPeriod.findMany({ select: { tenantId: true, status: true, name: true } });
    console.log("Users:", users.map(u => ({ email: u.email, tenantId: u.tenantId })));
    console.log("Periods by tenant:", periods);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test-tenant.js.map