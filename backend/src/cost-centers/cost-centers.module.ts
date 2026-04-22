import { Module } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CostCentersController } from './cost-centers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CostCentersController],
  providers: [CostCentersService],
})
export class CostCentersModule {}
