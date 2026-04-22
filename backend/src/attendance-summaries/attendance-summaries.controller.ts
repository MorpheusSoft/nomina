import { Controller, Get, Post, Body, Param, Delete, HttpException, Query } from '@nestjs/common';
import { AttendanceSummariesService } from './attendance-summaries.service';

@Controller('attendance-summaries')
export class AttendanceSummariesController {
  constructor(private readonly attendanceSummariesService: AttendanceSummariesService) {}

  @Post('upsert')
  async upsert(@Body() data: any) {
    try {
      return await this.attendanceSummariesService.upsertSummary(data);
    } catch (e: any) {
      throw new HttpException(e.message, 500);
    }
  }

  @Post('upsert-bulk')
  async upsertBulk(@Body() data: any[]) {
    try {
      return await this.attendanceSummariesService.upsertBulk(data);
    } catch (e: any) {
      throw new HttpException(e.message, 500);
    }
  }

  @Post('generate/:periodId')
  async generateFromDaily(@Param('periodId') periodId: string, @Query('type') type?: string) {
    try {
      if (type === 'VIRTUAL') {
         return await this.attendanceSummariesService.generateVirtualAttendance(periodId);
      }
      return await this.attendanceSummariesService.generateFromDailyAttendance(periodId);
    } catch (e: any) {
      throw new HttpException(e.message, 500);
    }
  }

  @Get('period/:periodId')
  findByPeriod(@Param('periodId') periodId: string) {
    return this.attendanceSummariesService.findByPeriod(periodId);
  }

  @Get('audit/:tenantId')
  async generateAuditTrail(
    @Param('tenantId') tenantId: string, 
    @Query('workerId') workerId: string, 
    @Query('payrollPeriodId') payrollPeriodId: string
  ) {
    try {
      return await this.attendanceSummariesService.generateAuditTrail(tenantId, workerId, payrollPeriodId);
    } catch (e: any) {
      throw new HttpException(e.message, 500);
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceSummariesService.remove(id);
  }
}
