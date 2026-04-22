import { Module } from '@nestjs/common';
import { PortalService } from './portal.service';
import { PortalController } from './portal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DocumentTemplatesModule } from '../document-templates/document-templates.module';

@Module({
  imports: [PrismaModule, DocumentTemplatesModule],
  providers: [PortalService],
  controllers: [PortalController]
})
export class PortalModule {}
