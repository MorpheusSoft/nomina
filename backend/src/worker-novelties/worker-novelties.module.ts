import { Module } from '@nestjs/common';
import { WorkerNoveltiesService } from './worker-novelties.service';
import { WorkerNoveltiesController } from './worker-novelties.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkerNoveltiesController],
  providers: [WorkerNoveltiesService],
  exports: [WorkerNoveltiesService]
})
export class WorkerNoveltiesModule {}
