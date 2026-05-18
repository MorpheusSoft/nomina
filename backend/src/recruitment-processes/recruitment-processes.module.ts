import { Module } from '@nestjs/common';
import { RecruitmentProcessesService } from './recruitment-processes.service';
import { RecruitmentProcessesController } from './recruitment-processes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecruitmentProcessesService],
  controllers: [RecruitmentProcessesController]
})
export class RecruitmentProcessesModule {}
