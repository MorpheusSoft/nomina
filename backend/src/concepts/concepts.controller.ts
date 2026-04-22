import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ConceptsService } from './concepts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('concepts')
export class ConceptsController {
  constructor(private readonly conceptsService: ConceptsService) {}

  @Post()
  create(@Body() data: any, @CurrentUser() user: any) {
    return this.conceptsService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.conceptsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conceptsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) {
    return this.conceptsService.update(user.tenantId, id, data);
  }

  @Post('import-from-root')
  importFromRootNode(@CurrentUser() user: any) {
    return this.conceptsService.importFromRootNode(user.tenantId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.conceptsService.remove(user.tenantId, id);
  }
}
