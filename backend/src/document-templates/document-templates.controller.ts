import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards, HttpException } from '@nestjs/common';
import { DocumentTemplatesService } from './document-templates.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('document-templates')
@UseGuards(JwtAuthGuard)
export class DocumentTemplatesController {
  constructor(private readonly documentTemplatesService: DocumentTemplatesService) {}

  @Post()
  async create(@Body() data: Prisma.DocumentTemplateCreateInput, @CurrentUser() user: any) {
    try {
      return await this.documentTemplatesService.create(user.tenantId, data);
    } catch (error: any) {
      throw new HttpException(error.message, 500);
    }
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.documentTemplatesService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentTemplatesService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.DocumentTemplateUpdateInput, @CurrentUser() user: any) {
    return this.documentTemplatesService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentTemplatesService.remove(user.tenantId, id);
  }

  @Post(':id/compile')
  compile(@Param('id') id: string, @Body('workerId') workerId: string, @CurrentUser() user: any) {
    return this.documentTemplatesService.compile(user.tenantId, id, workerId);
  }
}
