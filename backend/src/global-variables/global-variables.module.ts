import { Module } from '@nestjs/common';
import { GlobalVariablesService } from './global-variables.service';
import { GlobalVariablesController } from './global-variables.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [GlobalVariablesService],
  controllers: [GlobalVariablesController]
})
export class GlobalVariablesModule {}
