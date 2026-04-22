import { Controller, Get, Post, Body, Param, Delete, Query, Patch, UseGuards } from '@nestjs/common';
import { PayrollGroupVariablesService } from './payroll-group-variables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('payroll-group-variables')
export class PayrollGroupVariablesController {
  constructor(private readonly variablesService: PayrollGroupVariablesService) {}

  @Get()
  findAll(@Query('payrollGroupId') payrollGroupId: string, @CurrentUser() user: any) {
    if (payrollGroupId) {
      return this.variablesService.findAll(payrollGroupId);
    }
    return this.variablesService.findAllByTenant(user.tenantId);
  }

  @Post()
  create(@Body() createDto: any) {
    return this.variablesService.create(createDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    return this.variablesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.variablesService.remove(id);
  }
}
