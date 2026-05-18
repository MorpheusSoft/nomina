import { ExamTemplatesController } from './exam-templates.controller';
import { Module } from '@nestjs/common';
import { ExamTemplatesService } from './exam-templates.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';

@Module({
  imports: [PrismaModule, OracleModule],
  providers: [ExamTemplatesService],
  controllers: [ExamTemplatesController]
})
export class ExamTemplatesModule {}
