import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { AttendancePunchesService } from './attendance-punches.service';
import { Prisma } from '@prisma/client';

@Controller('attendance-punches')
export class AttendancePunchesController {
  constructor(private readonly punchesService: AttendancePunchesService) {}

  @Post()
  create(@Body() data: Prisma.AttendancePunchUncheckedCreateInput) {
    return this.punchesService.create(data);
  }

  @Post('bulk')
  createBulk(@Body() body: { tenantId: string; punches: any[] }) {
    return this.punchesService.createBulk(body.tenantId, body.punches);
  }

  @Get()
  findAll(
    @Query('tenantId') tenantId: string,
    @Query('workerId') workerId?: string,
  ) {
    return this.punchesService.findAll(tenantId, workerId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.punchesService.remove(id, tenantId);
  }
}
