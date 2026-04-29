import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('cost-centers')
export class CostCentersController {
  constructor(private readonly costCentersService: CostCentersService) {}

  @Post()
  create(@Body() data: CreateCostCenterDto, @CurrentUser() user: any) {
    return this.costCentersService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.costCentersService.findAll(user.tenantId);
  }

  @Get('variables/all')
  findAllVariables(@CurrentUser() user: any) {
    return this.costCentersService.findAllVariablesGroupedByCode(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreateCostCenterDto, @CurrentUser() user: any) {
    return this.costCentersService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.remove(user.tenantId, id);
  }

  // --- VARIABLES ROUTES ---
  @Get(':id/variables')
  findVariables(@Param('id') id: string, @CurrentUser() user: any) {
    return this.costCentersService.findVariablesByCostCenter(user.tenantId, id);
  }

  @Post(':id/variables')
  createVariable(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.costCentersService.createVariable(user.tenantId, id, data);
  }

  @Patch(':id/variables/:varId')
  updateVariable(@Param('id') id: string, @Param('varId') varId: string, @Body() data: any, @CurrentUser() user: any) {
    return this.costCentersService.updateVariable(user.tenantId, id, varId, data);
  }

  @Delete(':id/variables/:varId')
  removeVariable(@Param('id') id: string, @Param('varId') varId: string, @CurrentUser() user: any) {
    return this.costCentersService.removeVariable(user.tenantId, id, varId);
  }
}
