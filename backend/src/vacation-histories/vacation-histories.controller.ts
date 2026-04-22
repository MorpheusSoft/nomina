import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VacationHistoriesService } from './vacation-histories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('vacation-histories')
export class VacationHistoriesController {
  constructor(private readonly vacationHistoriesService: VacationHistoriesService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() createData: any) {
    return this.vacationHistoriesService.create(user.tenantId, createData);
  }

  @Get('by-employment/:id')
  findByEmploymentRecord(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vacationHistoriesService.findByEmploymentRecord(user.tenantId, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vacationHistoriesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateData: any) {
    return this.vacationHistoriesService.update(user.tenantId, id, updateData);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.vacationHistoriesService.remove(user.tenantId, id);
  }
}
