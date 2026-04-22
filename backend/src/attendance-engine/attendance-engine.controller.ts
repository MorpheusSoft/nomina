import { Controller, Post, Body, Param, Query } from '@nestjs/common';
import { AttendanceEngineService } from './attendance-engine.service';

@Controller('attendance-engine')
export class AttendanceEngineController {
  constructor(private readonly engineService: AttendanceEngineService) {}

  @Post('process')
  processDaily(
    @Body() body: { tenantId: string; workerId: string; date: string }
  ) {
    // date formato "YYYY-MM-DD"
    return this.engineService.processDailyAttendance(body.tenantId, body.workerId, body.date);
  }
}
