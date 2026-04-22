import { Module } from '@nestjs/common';
import { PayrollAccumulatorsService } from './payroll-accumulators.service';
import { PayrollAccumulatorsController } from './payroll-accumulators.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollAccumulatorsController],
  providers: [PayrollAccumulatorsService],
})
export class PayrollAccumulatorsModule {}
