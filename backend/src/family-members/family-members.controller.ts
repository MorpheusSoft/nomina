import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { FamilyMembersService } from './family-members.service';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { UpdateFamilyMemberDto } from './dto/update-family-member.dto';

@Controller('family-members')
export class FamilyMembersController {
  constructor(private readonly familyMembersService: FamilyMembersService) {}

  @Post()
  create(@Body() createFamilyMemberDto: CreateFamilyMemberDto) {
    return this.familyMembersService.create(createFamilyMemberDto);
  }

  @Get()
  findAll(@Query('workerId') workerId?: string) {
    return this.familyMembersService.findAll(workerId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familyMembersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamilyMemberDto: UpdateFamilyMemberDto) {
    return this.familyMembersService.update(id, updateFamilyMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familyMembersService.remove(id);
  }
}
