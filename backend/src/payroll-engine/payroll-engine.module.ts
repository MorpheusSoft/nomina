import { Module } from '@nestjs/common';
import { PayrollEngineService } from './payroll-engine.service';
import { PayrollEngineController } from './payroll-engine.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PayrollEngineService],
  controllers: [PayrollEngineController]
})
export class PayrollEngineModule {}
