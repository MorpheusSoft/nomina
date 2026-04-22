import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { GlobalVariablesService } from './global-variables.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('global-variables')
export class GlobalVariablesController {
  constructor(private readonly baseService: GlobalVariablesService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.baseService.create(user.tenantId, data);
  }

  @Post('import-from-root')
  importFromRoot(@CurrentUser() user: any) {
    return this.baseService.importFromRoot(user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.baseService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.baseService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.baseService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.baseService.remove(user.tenantId, id);
  }
}
