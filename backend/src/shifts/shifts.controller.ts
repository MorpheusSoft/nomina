import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.shiftsService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.shiftsService.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.shiftsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }
}
