import { Module } from '@nestjs/common';
import { AttendancePunchesService } from './attendance-punches.service';
import { AttendancePunchesController } from './attendance-punches.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { GeoLocationService } from './geo-location.service';

@Module({
  imports: [PrismaModule],
  providers: [AttendancePunchesService, GeoLocationService],
  controllers: [AttendancePunchesController],
  exports: [GeoLocationService],
})
export class AttendancePunchesModule {}
