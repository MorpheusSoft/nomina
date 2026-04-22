import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ConceptDependenciesService } from './concept-dependencies.service';

@Controller('concept-dependencies')
export class ConceptDependenciesController {
  constructor(private readonly conceptDependenciesService: ConceptDependenciesService) {}

  @Post()
  create(@Body() createDto: any) {
    return this.conceptDependenciesService.create(createDto);
  }

  @Get()
  findAll(@Query('parentConceptId') parentConceptId?: string) {
    return this.conceptDependenciesService.findAll(parentConceptId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conceptDependenciesService.remove(id);
  }
}
