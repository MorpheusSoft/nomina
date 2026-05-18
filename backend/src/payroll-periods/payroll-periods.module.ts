import { Module } from '@nestjs/common';
import { PayrollPeriodsService } from './payroll-periods.service';
import { PayrollPeriodsController } from './payroll-periods.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { BankFileTemplatesModule } from '../bank-file-templates/bank-file-templates.module';

@Module({
  imports: [PrismaModule, BankFileTemplatesModule],
  controllers: [PayrollPeriodsController],
  providers: [PayrollPeriodsService],
})
export class PayrollPeriodsModule {}
