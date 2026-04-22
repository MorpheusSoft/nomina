import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HolidaysService } from './holidays.service';

@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Post()
  create(@Body() data: any) {
    return this.holidaysService.create(data);
  }

  @Get()
  findAll() {
    return this.holidaysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.holidaysService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.holidaysService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.holidaysService.remove(id);
  }
}
