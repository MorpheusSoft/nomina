import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PayrollGroupsService } from './payroll-groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('payroll-groups')
export class PayrollGroupsController {
  constructor(private readonly payrollGroupsService: PayrollGroupsService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.payrollGroupsService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.payrollGroupsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollGroupsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.payrollGroupsService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollGroupsService.remove(user.tenantId, id);
  }
}
