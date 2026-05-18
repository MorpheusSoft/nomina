import { Module } from '@nestjs/common';
import { BankFileTemplatesService } from './bank-file-templates.service';
import { BankFileTemplatesController } from './bank-file-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { BankTxtGeneratorService } from './bank-txt-generator.service';

@Module({
  imports: [PrismaModule],
  providers: [BankFileTemplatesService, BankTxtGeneratorService],
  controllers: [BankFileTemplatesController],
  exports: [BankTxtGeneratorService]
})
export class BankFileTemplatesModule {}
