import { Module } from '@nestjs/common';
import { PayrollGroupVariablesService } from './payroll-group-variables.service';
import { PayrollGroupVariablesController } from './payroll-group-variables.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PayrollGroupVariablesService],
  controllers: [PayrollGroupVariablesController]
})
export class PayrollGroupVariablesModule {}
