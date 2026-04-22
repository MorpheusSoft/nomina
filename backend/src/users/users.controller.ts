import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { RequirePermissions } from '../auth/require-permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('ALL_ACCESS')
  create(@Body() createUserDto: any, @CurrentUser() user: any) {
    return this.usersService.create(user.tenantId, createUserDto);
  }

  @Get()
  @RequirePermissions('ALL_ACCESS')
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('ALL_ACCESS')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.findOne(user.tenantId, id);
  }

  @Patch('me/password')
  changePassword(@Body() data: any, @CurrentUser() user: any) {
    return this.usersService.changePassword(user.userId, data.newPassword);
  }

  @Patch(':id')
  @RequirePermissions('ALL_ACCESS')
  update(@Param('id') id: string, @Body() updateUserDto: any, @CurrentUser() user: any) {
    return this.usersService.update(user.tenantId, id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions('ALL_ACCESS')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.usersService.remove(user.tenantId, id);
  }
}
