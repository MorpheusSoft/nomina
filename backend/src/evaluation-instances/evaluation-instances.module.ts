import { Module } from '@nestjs/common';
import { EvaluationInstancesService } from './evaluation-instances.service';
import { EvaluationInstancesController } from './evaluation-instances.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [PrismaModule, OracleModule],
  controllers: [EvaluationInstancesController],
  providers: [EvaluationInstancesService],
})
export class EvaluationInstancesModule {}
