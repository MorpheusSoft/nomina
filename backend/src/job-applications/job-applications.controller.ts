import { Controller, Get, Put, Post, Param, Body, Request, UseGuards } from '@nestjs/common';
import { JobApplicationsService } from './job-applications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('job-applications')
export class JobApplicationsController {
  constructor(private readonly service: JobApplicationsService) {}

  @Get('process/:processId')
  findAllByProcess(@Request() req: any, @Param('processId') processId: string) {
    return this.service.findAllByProcess(req.user.tenantId, processId);
  }

  @Put(':id/star')
  toggleStar(@Request() req: any, @Param('id') id: string) {
    return this.service.toggleStar(req.user.tenantId, id);
  }

  @Put(':id/shortlist')
  setShortlisted(@Request() req: any, @Param('id') id: string, @Body() body: { isShortlisted: boolean }) {
    return this.service.setShortlisted(req.user.tenantId, id, body.isShortlisted);
  }

  @Post('process/:processId/assign-exams')
  assignExamsToElegibles(@Request() req: any, @Param('processId') processId: string) {
    return this.service.assignExamsToElegibles(req.user.tenantId, processId);
  }

  @Post('process/:processId/auto-screen')
  autoScreenCandidates(@Request() req: any, @Param('processId') processId: string) {
    return this.service.autoScreenCandidates(req.user.tenantId, processId);
  }

  @Get(':id/holistic-summary')
  generateHolisticSummary(@Request() req: any, @Param('id') id: string) {
    return this.service.generateHolisticSummary(req.user.tenantId, id);
  }

  @Post(':id/hire')
  hireCandidate(@Request() req: any, @Param('id') id: string, @Body() body: { closeVacancy: boolean }) {
    return this.service.hireCandidate(req.user.tenantId, id, body.closeVacancy);
  }

  @Post(':id/reject')
  rejectCandidate(@Request() req: any, @Param('id') id: string) {
    return this.service.rejectCandidate(req.user.tenantId, id);
  }

  @Post(':id/restore')
  restoreCandidate(@Request() req: any, @Param('id') id: string) {
    return this.service.restoreCandidate(req.user.tenantId, id);
  }

  @Post(':id/interviews')
  addInterview(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    return this.service.addInterview(req.user.tenantId, id, body);
  }
}
