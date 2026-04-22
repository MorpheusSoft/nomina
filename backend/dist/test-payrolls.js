"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const periods = await prisma.payrollPeriod.findMany();
    console.log(periods.map(p => p.status));
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test-payrolls.js.map