import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ShiftPatternsService } from './shift-patterns.service';
import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('shift-patterns')
export class ShiftPatternsController {
  constructor(private readonly shiftPatternsService: ShiftPatternsService) {}

  @Post()
  create(@Request() req: any, @Body() createShiftPatternDto: CreateShiftPatternDto) {
    return this.shiftPatternsService.create(req.user.tenantId, createShiftPatternDto);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.shiftPatternsService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.shiftPatternsService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateShiftPatternDto: UpdateShiftPatternDto) {
    return this.shiftPatternsService.update(req.user.tenantId, id, updateShiftPatternDto);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.shiftPatternsService.remove(req.user.tenantId, id);
  }
}
