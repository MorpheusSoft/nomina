import { Module } from '@nestjs/common';
import { CompanyBankAccountsService } from './company-bank-accounts.service';
import { CompanyBankAccountsController } from './company-bank-accounts.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CompanyBankAccountsService],
  controllers: [CompanyBankAccountsController]
})
export class CompanyBankAccountsModule {}
