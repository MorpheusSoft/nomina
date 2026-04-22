import { Module } from '@nestjs/common';
import { VacationHistoriesController } from './vacation-histories.controller';
import { VacationHistoriesService } from './vacation-histories.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VacationHistoriesController],
  providers: [VacationHistoriesService]
})
export class VacationHistoriesModule {}
