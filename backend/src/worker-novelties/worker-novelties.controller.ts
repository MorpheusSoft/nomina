import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { WorkerNoveltiesService } from './worker-novelties.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('worker-novelties')
export class WorkerNoveltiesController {
  constructor(private readonly noveltiesService: WorkerNoveltiesService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.noveltiesService.create(user.tenantId, data);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('payrollPeriodId') payrollPeriodId?: string,
    @Query('workerId') workerId?: string
  ) {
    return this.noveltiesService.findAll(user.tenantId, payrollPeriodId, workerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.noveltiesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.noveltiesService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.noveltiesService.remove(user.tenantId, id);
  }
}
