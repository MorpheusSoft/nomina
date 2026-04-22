import { Module } from '@nestjs/common';
import { ConceptsService } from './concepts.service';
import { ConceptsController } from './concepts.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ConceptsService],
  controllers: [ConceptsController]
})
export class ConceptsModule {}
