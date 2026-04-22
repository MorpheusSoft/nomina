import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { WorkerAbsencesService } from './worker-absences.service';
import { CreateWorkerAbsenceDto } from './dto/create-worker-absence.dto';
import { UpdateWorkerAbsenceDto } from './dto/update-worker-absence.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('worker-absences')
@UseGuards(JwtAuthGuard)
export class WorkerAbsencesController {
  constructor(private readonly workerAbsencesService: WorkerAbsencesService) {}

  @Post()
  create(@Req() req: any, @Body() createWorkerAbsenceDto: CreateWorkerAbsenceDto) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.create(tenantId, createWorkerAbsenceDto);
  }

  @Get()
  findAll(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.findOne(id, tenantId);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateWorkerAbsenceDto: UpdateWorkerAbsenceDto) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.update(id, tenantId, updateWorkerAbsenceDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.remove(id, tenantId);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { status: string; isJustified?: boolean; isPaid?: boolean }
  ) {
    const tenantId = req.user.tenantId;
    return this.workerAbsencesService.updateStatus(id, tenantId, body.status, body.isJustified, body.isPaid);
  }
}
