import { Module } from '@nestjs/common';
import { WorkerAbsencesService } from './worker-absences.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkerAbsencesController } from './worker-absences.controller';

@Module({
  imports: [PrismaModule],
  controllers: [WorkerAbsencesController],
  providers: [WorkerAbsencesService],
})
export class WorkerAbsencesModule {}
