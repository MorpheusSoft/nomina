import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PayrollPeriodsService } from './payroll-periods.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

import { BankTxtGeneratorService } from '../bank-file-templates/bank-txt-generator.service';

@UseGuards(JwtAuthGuard)

@Controller('payroll-periods')
export class PayrollPeriodsController {
  constructor(
    private readonly payrollPeriodsService: PayrollPeriodsService,
    private readonly bankTxtGeneratorService: BankTxtGeneratorService
  ) {}

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

  @Post(':id/generate-txt')
  async generateTxt(
    @Param('id') id: string,
    @Body() data: { companyBankAccountId: string, templateId: string },
    @CurrentUser() user: any
  ) {
    const hasApproverRole = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('PAYROLL_APPROVE');
    const txtContent = await this.bankTxtGeneratorService.generateTxtFile(
      user.tenantId,
      id,
      data.companyBankAccountId,
      data.templateId,
      user.id,
      hasApproverRole
    );
    return { txt: txtContent };
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
