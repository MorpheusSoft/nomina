import { Module } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsController } from './job-applications.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OracleModule } from '../oracle/oracle.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, OracleModule, EmailModule],
  providers: [JobApplicationsService],
  controllers: [JobApplicationsController]
})
export class JobApplicationsModule {}
