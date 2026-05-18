import { CandidateExamsController } from './candidate-exams.controller';
import { Module } from '@nestjs/common';
import { CandidateExamsService } from './candidate-exams.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [PrismaModule, OracleModule],
  providers: [CandidateExamsService],
  controllers: [CandidateExamsController]
})
export class CandidateExamsModule {}
