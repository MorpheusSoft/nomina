import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WorkerFixedConceptsService } from './worker-fixed-concepts.service';
import { CreateWorkerFixedConceptDto } from './dto/create-worker-fixed-concept.dto';

@Controller('worker-fixed-concepts')
export class WorkerFixedConceptsController {
  constructor(private readonly service: WorkerFixedConceptsService) {}

  @Post()
  create(@Body() data: CreateWorkerFixedConceptDto) {
    return this.service.create(data);
  }

  @Get()
  findAll(@Query('workerId') workerId?: string, @Query('employmentRecordId') employmentRecordId?: string) {
    if (workerId) return this.service.findAllByWorker(workerId);
    if (employmentRecordId) return this.service.findAllByEmploymentRecord(employmentRecordId);
    return [];
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
