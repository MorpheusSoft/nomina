import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  create(@Body() createWorkerDto: CreateWorkerDto, @CurrentUser() user: any) {
    return this.workersService.create(user.tenantId, createWorkerDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
    return this.workersService.findAll(user.tenantId, canViewConfidential);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
    return this.workersService.findOne(user.tenantId, id, canViewConfidential);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWorkerDto: UpdateWorkerDto, @CurrentUser() user: any) {
    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
    return this.workersService.update(user.tenantId, id, updateWorkerDto, canViewConfidential);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');
    return this.workersService.remove(user.tenantId, id, canViewConfidential);
  }
}
