const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { AttendanceSummariesService } = require('./dist/src/attendance-summaries/attendance-summaries.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bootstrap() {
  const period = await prisma.payrollPeriod.findFirst({
    where: { status: { in: ['DRAFT', 'PRE_CALCULATED'] } }
  });
  if (!period) return console.log('No period');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  const svc = app.get(AttendanceSummariesService);
  
  try {
      await svc.generateFromDailyAttendance(period.id);
      console.log('Success!');
  } catch (err) {
      console.error('FAILED:', err);
  }
  await app.close();
}
bootstrap();
