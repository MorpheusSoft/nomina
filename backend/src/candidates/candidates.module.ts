import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [PrismaModule, OracleModule],
  providers: [CandidatesService],
  controllers: [CandidatesController]
})
export class CandidatesModule {}
