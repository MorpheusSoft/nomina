import { Module } from '@nestjs/common';
import { ContractTrustsService } from './contract-trusts.service';
import { ContractTrustsController } from './contract-trusts.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContractTrustsController],
  providers: [ContractTrustsService],
})
export class ContractTrustsModule {}
