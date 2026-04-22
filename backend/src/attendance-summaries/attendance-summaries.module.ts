import { Module } from '@nestjs/common';
import { AttendanceSummariesService } from './attendance-summaries.service';
import { AttendanceSummariesController } from './attendance-summaries.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceEngineModule } from '../attendance-engine/attendance-engine.module';

@Module({
  imports: [PrismaModule, AttendanceEngineModule],
  controllers: [AttendanceSummariesController],
  providers: [AttendanceSummariesService],
})
export class AttendanceSummariesModule {}
