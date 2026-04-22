import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PayrollEngineService } from './payroll-engine/payroll-engine.service';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const engine = app.get(PayrollEngineService);
  const prisma = new PrismaClient();

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
  } catch (e) {
     console.error("ENGINE ERROR:");
     console.error(e);
  } finally {
     await app.close();
  }
}
bootstrap();
