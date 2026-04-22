import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { WorkerLoansService } from './worker-loans.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('worker-loans')
export class WorkerLoansController {
  constructor(private readonly workerLoansService: WorkerLoansService) {}

  @Post()
  create(@Body() createWorkerLoanDto: any, @CurrentUser() user: any) {
    return this.workerLoansService.create(user.tenantId, createWorkerLoanDto);
  }

  @Get()
  findAll(@Query('workerId') workerId: string, @CurrentUser() user: any) {
    return this.workerLoansService.findAll(user.tenantId, workerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workerLoansService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkerLoanDto: any, @CurrentUser() user: any) {
    return this.workerLoansService.update(user.tenantId, id, updateWorkerLoanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.workerLoansService.remove(user.tenantId, id);
  }
}

