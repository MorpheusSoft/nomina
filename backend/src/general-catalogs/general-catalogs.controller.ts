import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GeneralCatalogsService } from './general-catalogs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('general-catalogs')
export class GeneralCatalogsController {
  constructor(private readonly catalogsService: GeneralCatalogsService) {}

  @Get()
  findAll(@Query('category') category: string, @CurrentUser() user: any) {
    return this.catalogsService.findAllByCategory(user.tenantId, category);
  }

  @Post()
  create(@Body() data: { category: string, value: string }, @CurrentUser() user: any) {
    return this.catalogsService.create(user.tenantId, data.category, data.value);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.catalogsService.remove(id, user.tenantId);
  }
}
