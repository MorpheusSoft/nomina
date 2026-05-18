import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { JobPositionsService } from './job-positions.service';
import { CreateJobPositionDto } from './dto/create-job-position.dto';
import { UpdateJobPositionDto } from './dto/update-job-position.dto';

@Controller('job-positions')
export class JobPositionsController {
  constructor(private readonly jobPositionsService: JobPositionsService) {}

  @Post()
  create(@Body() createJobPositionDto: CreateJobPositionDto, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.jobPositionsService.create(createJobPositionDto, tenantId);
  }

  @Get()
  findAll(@Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.jobPositionsService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.jobPositionsService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateJobPositionDto: UpdateJobPositionDto,
    @Request() req: any,
  ) {
    const tenantId = req.user.tenantId;
    return this.jobPositionsService.update(id, updateJobPositionDto, tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const tenantId = req.user.tenantId;
    return this.jobPositionsService.remove(id, tenantId);
  }
}
