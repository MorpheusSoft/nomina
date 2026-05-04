import { Module } from '@nestjs/common';
import { WorkLocationsController } from './work-locations.controller';
import { WorkLocationsService } from './work-locations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkLocationsController],
  providers: [WorkLocationsService]
})
export class WorkLocationsModule {}
