import { Module } from '@nestjs/common';
import { WorkerTicketsService } from './worker-tickets.service';
import { WorkerTicketsController } from './worker-tickets.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkerTicketsController],
  providers: [WorkerTicketsService],
})
export class WorkerTicketsModule {}
