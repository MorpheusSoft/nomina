import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PayrollPeriodsService } from './payroll-periods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('payroll-periods')
export class PayrollPeriodsController {
  constructor(private readonly payrollPeriodsService: PayrollPeriodsService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.payrollPeriodsService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.payrollPeriodsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollPeriodsService.findOne(user.tenantId, id);
  }

  @Get(':id/budget-analysis')
  getBudgetAnalysis(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollPeriodsService.getBudgetAnalysis(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.payrollPeriodsService.update(user, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollPeriodsService.remove(user.tenantId, id);
  }
}
