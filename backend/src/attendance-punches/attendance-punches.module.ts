import { Module } from '@nestjs/common';
import { AttendancePunchesService } from './attendance-punches.service';
import { AttendancePunchesController } from './attendance-punches.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AttendancePunchesService],
  controllers: [AttendancePunchesController]
})
export class AttendancePunchesModule {}
