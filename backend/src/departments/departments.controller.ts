import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() data: CreateDepartmentDto, @CurrentUser() user: any) {
    return this.departmentsService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.departmentsService.findAll(user.tenantId);
  }

  @Get('metrics/budget')
  getBudgetMetrics(@CurrentUser() user: any) {
    return this.departmentsService.getBudgetMetrics(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreateDepartmentDto, @CurrentUser() user: any) {
    return this.departmentsService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.departmentsService.remove(user.tenantId, id);
  }
}
