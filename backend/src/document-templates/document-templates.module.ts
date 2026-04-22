import { Module } from '@nestjs/common';
import { DocumentTemplatesService } from './document-templates.service';
import { DocumentTemplatesController } from './document-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DocumentTemplatesService],
  controllers: [DocumentTemplatesController],
  exports: [DocumentTemplatesService]
})
export class DocumentTemplatesModule {}
