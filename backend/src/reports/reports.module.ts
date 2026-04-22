import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportsService } from './reports.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
