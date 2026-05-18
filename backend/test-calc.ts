import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PayrollEngineService } from './src/payroll-engine/payroll-engine.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const engine = app.get(PayrollEngineService);
  try {
    const res = await engine.calculateFullPeriod('3638ad41-6910-4b01-862d-126d3eb578d2');
    console.log('SUCCESS:', res);
  } catch (e) {
    console.error('ERROR OCURRIDO:');
    console.error(e.message);
  }
  await app.close();
}
bootstrap();
