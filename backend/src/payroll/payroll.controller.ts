import { Controller, Post, Param, Query } from '@nestjs/common';
import { PayrollService } from './payroll.service';

@Controller('payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('calculate/:periodId')
  calculatePeriod(
    @Param('periodId') periodId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.payrollService.calculatePeriod(tenantId, periodId);
  }
}
