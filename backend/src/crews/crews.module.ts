import { Module } from '@nestjs/common';
import { CrewsService } from './crews.service';
import { CrewsController } from './crews.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CrewsController],
  providers: [CrewsService],
})
export class CrewsModule {}
