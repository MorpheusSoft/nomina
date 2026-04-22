import { Module } from '@nestjs/common';
import { PayrollGroupsService } from './payroll-groups.service';
import { PayrollGroupsController } from './payroll-groups.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PayrollGroupsController],
  providers: [PayrollGroupsService],
})
export class PayrollGroupsModule {}
