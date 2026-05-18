import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExamTemplatesService } from './exam-templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exam-templates')
export class ExamTemplatesController {
  constructor(private readonly service: ExamTemplatesService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAll(req.user.tenantId);
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/exams',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se subió ningún archivo');
    return { url: `/uploads/exams/${file.filename}` };
  }

  @Post('generate-ai')
  generateExamWithAI(@Request() req: any, @Body() data: { topic: string; numQuestions: number }) {
    return this.service.generateExamWithAI(req.user.tenantId, data.topic, data.numQuestions);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.tenantId, id);
  }

  @Post()
  create(@Request() req: any, @Body() data: any) {
    return this.service.create(req.user.tenantId, data);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() data: any) {
    return this.service.update(req.user.tenantId, id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.tenantId, id);
  }
}
