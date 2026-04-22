import { Module } from '@nestjs/common';
import { EmploymentRecordsService } from './employment-records.service';
import { EmploymentRecordsController } from './employment-records.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmploymentRecordsController],
  providers: [EmploymentRecordsService]
})
export class EmploymentRecordsModule {}
