import { Controller, Post, Get, Param, Body, Query, UseGuards } from '@nestjs/common';
import { PayrollEngineService } from './payroll-engine.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payroll-engine')
export class PayrollEngineController {
  constructor(private readonly payrollEngineService: PayrollEngineService) {}

  @Post('calculate/:periodId')
  async calculatePeriod(@Param('periodId') periodId: string) {
    return this.payrollEngineService.calculateFullPeriod(periodId);
  }

  @Post('calculate/:periodId/worker/:workerId')
  async calculateWorker(
    @Param('periodId') periodId: string,
    @Param('workerId') workerId: string
  ) {
    return this.payrollEngineService.calculateFullPeriod(periodId, workerId);
  }

  @Get('receipts/:periodId')
  async getReceipts(@Param('periodId') periodId: string, @CurrentUser() user: any) {
    return this.payrollEngineService.getReceiptsForPeriod(periodId, user.canViewConfidential);
  }

  @Post('dry-run')
  async dryRunWorker(@Body() payload: { payrollPeriodId: string; employmentRecordId: string, mockData?: Record<string, any> }, @CurrentUser() user: any) {
    return this.payrollEngineService.dryRunWorker(user.tenantId, payload.payrollPeriodId, payload.employmentRecordId, payload.mockData);
  }
}
