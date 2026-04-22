import { Module } from '@nestjs/common';
import { AccountingJournalsService } from './accounting-journals.service';
import { AccountingJournalsController } from './accounting-journals.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AccountingJournalsService],
  controllers: [AccountingJournalsController]
})
export class AccountingJournalsModule {}
