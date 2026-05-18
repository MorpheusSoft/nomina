import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EvaluationTemplatesService } from './evaluation-templates.service';
import { CreateEvaluationTemplateDto } from './dto/create-evaluation-template.dto';
import { UpdateEvaluationTemplateDto } from './dto/update-evaluation-template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('evaluation-templates')
@UseGuards(JwtAuthGuard)
export class EvaluationTemplatesController {
  constructor(private readonly evaluationTemplatesService: EvaluationTemplatesService) {}

  @Post()
  create(@Body() createEvaluationTemplateDto: CreateEvaluationTemplateDto, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.create(user.tenantId, createEvaluationTemplateDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.evaluationTemplatesService.findAll(user.tenantId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.findOne(id, user.tenantId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEvaluationTemplateDto: UpdateEvaluationTemplateDto, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.update(id, user.tenantId, updateEvaluationTemplateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.remove(id, user.tenantId);
  }

  @Post('generate-ai')
  generateAi(@Body() data: { name: string, description: string, prompt: string }, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.generateAi(user.tenantId, data);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: any) {
    return this.evaluationTemplatesService.duplicate(id, user.tenantId);
  }
}
