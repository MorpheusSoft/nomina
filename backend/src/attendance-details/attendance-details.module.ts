import { Module } from '@nestjs/common';
import { AttendanceDetailsService } from './attendance-details.service';
import { AttendanceDetailsController } from './attendance-details.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceDetailsController],
  providers: [AttendanceDetailsService],
})
export class AttendanceDetailsModule {}
