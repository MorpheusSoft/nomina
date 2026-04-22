import { Module } from '@nestjs/common';
import { WorkerFixedConceptsService } from './worker-fixed-concepts.service';
import { WorkerFixedConceptsController } from './worker-fixed-concepts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkerFixedConceptsService],
  controllers: [WorkerFixedConceptsController]
})
export class WorkerFixedConceptsModule {}
