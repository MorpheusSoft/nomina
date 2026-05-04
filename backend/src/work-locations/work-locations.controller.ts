import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkLocationsService } from './work-locations.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('work-locations')
export class WorkLocationsController {
  constructor(private readonly workLocationsService: WorkLocationsService) {}

  @Post()
  create(@Body() data: Prisma.WorkLocationUncheckedCreateInput, @CurrentUser() user: any) {
    // Inject the current user's tenantId into the creation payload
    data.tenantId = user.tenantId;
    return this.workLocationsService.create(data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.workLocationsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workLocationsService.findOne(id, user.tenantId);
  }

  @Get(':id/sync-data')
  getSyncData(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workLocationsService.getSyncData(id, user.tenantId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: Prisma.WorkLocationUncheckedUpdateInput,
    @CurrentUser() user: any
  ) {
    return this.workLocationsService.update(id, user.tenantId, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workLocationsService.remove(id, user.tenantId);
  }
}
