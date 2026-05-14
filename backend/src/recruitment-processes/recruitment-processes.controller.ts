import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { RecruitmentProcessesService } from './recruitment-processes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('recruitment-processes')
export class RecruitmentProcessesController {
  constructor(private readonly service: RecruitmentProcessesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.service.update(req.user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.tenantId, id);
  }

  @Post(':id/cancel')
  cancel(@Request() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    return this.service.cancelProcess(req.user.tenantId, id, body.reason);
  }

  @Post(':id/reopen')
  reopen(@Request() req: any, @Param('id') id: string) {
    return this.service.reopenProcess(req.user.tenantId, id);
  }
}
