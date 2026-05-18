import { Module } from '@nestjs/common';
import { EvaluationTemplatesService } from './evaluation-templates.service';
import { EvaluationTemplatesController } from './evaluation-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [PrismaModule, OracleModule],
  controllers: [EvaluationTemplatesController],
  providers: [EvaluationTemplatesService],
})
export class EvaluationTemplatesModule {}
