import { Module } from '@nestjs/common';
import { AttendanceEngineService } from './attendance-engine.service';
import { AttendanceEngineController } from './attendance-engine.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HolidaysModule } from '../holidays/holidays.module';

@Module({
  imports: [PrismaModule, HolidaysModule],
  providers: [AttendanceEngineService],
  controllers: [AttendanceEngineController],
  exports: [AttendanceEngineService]
})
export class AttendanceEngineModule {}
