"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const payroll_engine_service_1 = require("./payroll-engine/payroll-engine.service");
const client_1 = require("@prisma/client");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const engine = app.get(payroll_engine_service_1.PayrollEngineService);
    const prisma = new client_1.PrismaClient();
    const periodId = await prisma.payrollPeriod.findFirst({
        where: { name: { contains: "2da" } }
    }).then(p => p?.id);
    if (!periodId) {
        console.error("Period not found");
        return;
    }
    try {
        console.log("Running engine for period: " + periodId);
        await engine.calculateFullPeriod(periodId);
        console.log("Done");
    }
    catch (e) {
        console.error("ENGINE ERROR:");
        console.error(e);
    }
    finally {
        await app.close();
    }
}
bootstrap();
//# sourceMappingURL=debug.js.map