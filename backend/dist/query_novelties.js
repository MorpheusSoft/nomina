"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const period = await prisma.payrollPeriod.findUnique({ where: { id: "4a562332-6377-4c33-a496-601c60a2c991" } });
    console.log("Period:", period);
    const novelties = await prisma.workerNovelty.findMany();
    console.log("Novelties:", novelties);
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=query_novelties.js.map