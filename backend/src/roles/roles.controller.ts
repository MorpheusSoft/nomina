import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('ALL_ACCESS')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: any, @CurrentUser() user: any) {
    return this.rolesService.create(user.tenantId, createRoleDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.rolesService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: any, @CurrentUser() user: any) {
    return this.rolesService.update(user.tenantId, id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.rolesService.remove(user.tenantId, id);
  }
}
