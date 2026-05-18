import { Module } from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { JobPositionsController } from './job-positions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobPositionsController],
  providers: [JobPositionsService],
})
export class JobPositionsModule {}
