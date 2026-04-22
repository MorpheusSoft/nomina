import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { OracleController } from './oracle.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OracleService],
  controllers: [OracleController]
})
export class OracleModule {}
