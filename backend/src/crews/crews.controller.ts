import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CrewsService } from './crews.service';
import { CreateCrewDto } from './dto/create-crew.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@UseGuards(JwtAuthGuard)

@Controller('crews')
export class CrewsController {
  constructor(private readonly crewsService: CrewsService) {}

  @Post()
  create(@Body() data: CreateCrewDto, @CurrentUser() user: any) {
    return this.crewsService.create(user.tenantId, data);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.crewsService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.crewsService.findOne(user.tenantId, id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: CreateCrewDto, @CurrentUser() user: any) {
    return this.crewsService.update(user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.crewsService.remove(user.tenantId, id);
  }
}
