import { Module } from '@nestjs/common';
import { WorkerLoansService } from './worker-loans.service';
import { WorkerLoansController } from './worker-loans.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WorkerLoansController],
  providers: [WorkerLoansService],
})
export class WorkerLoansModule {}
