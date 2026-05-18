import { Controller, Get, Post, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.banksService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() data: { name: string; code: string }) {
    return this.banksService.create(req.user.tenantId, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.banksService.remove(id, req.user.tenantId);
  }
}
