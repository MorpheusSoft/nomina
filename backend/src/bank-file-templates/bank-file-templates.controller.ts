import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards } from '@nestjs/common';
import { BankFileTemplatesService } from './bank-file-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bank-file-templates')
export class BankFileTemplatesController {
  constructor(private readonly service: BankFileTemplatesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.service.update(id, req.user.tenantId, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(id, req.user.tenantId);
  }
}
