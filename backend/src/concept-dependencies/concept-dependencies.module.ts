import { Module } from '@nestjs/common';
import { ConceptDependenciesService } from './concept-dependencies.service';
import { ConceptDependenciesController } from './concept-dependencies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConceptDependenciesController],
  providers: [ConceptDependenciesService],
})
export class ConceptDependenciesModule {}
