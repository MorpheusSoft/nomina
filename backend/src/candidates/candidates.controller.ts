import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { OracleService } from '../oracle/oracle.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
const pdfParse = require('pdf-parse');

@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly oracleService: OracleService
  ) {}

  @Post('upload-resume')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/resumes',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    limits: {
      fileSize: 1024 * 1024 * 2 // 2 MB limit (as 1MB might be too strict for PDFs with images)
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'application/pdf') {
        return cb(new BadRequestException('Solo se permiten archivos PDF'), false);
      }
      cb(null, true);
    }
  }))
  async uploadResume(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('El archivo PDF es requerido o supera el peso permitido (2MB).');
    }

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);
      const extractedText = pdfData.text || '';

      let parsedData = null;
      if (extractedText) {
        parsedData = await this.oracleService.extractCandidateData(extractedText);
      }

      return {
        resumeUrl: `/uploads/resumes/${file.filename}`,
        rawResumeText: extractedText,
        parsedData
      };
    } catch (error) {
      // Si falla la extracción, igual devolvemos la URL pero con texto vacío para no bloquear
      return {
        resumeUrl: `/uploads/resumes/${file.filename}`,
        rawResumeText: '',
        parsedData: null
      };
    }
  }

  // PÚBLICO: Aplicar a una vacante
  @Post('apply/:processId')
  applyToProcess(@Param('processId') processId: string, @Body() data: any) {
    return this.candidatesService.applyToProcess(processId, data);
  }

  // PÚBLICO: Aplicar a la base global sin token
  @Post('apply')
  applyToGlobalPool(@Body() data: any) {
    return this.candidatesService.applyToGlobalPool(data);
  }

  // PÚBLICO: Obtener datos del portal del candidato
  @Get('portal/:portalToken')
  getPortalData(@Param('portalToken') portalToken: string) {
    return this.candidatesService.getPortalData(portalToken);
  }

  // PRIVADO: Obtener todos los candidatos de la base
  @Get()
  getAllCandidates() {
    return this.candidatesService.findAll();
  }

  // PRIVADO: Asignar candidato existente a vacante
  @Post('assign-to-vacancy')
  assignToVacancy(@Body() body: { candidateId: string, processId: string }) {
    return this.candidatesService.assignToVacancy(body.candidateId, body.processId);
  }

  // PRIVADO: Búsqueda con IA Oráculo
  @Post('oracle-match')
  oracleMatch(@Body() body: { processId: string }) {
    return this.candidatesService.oracleMatch(body.processId, this.oracleService);
  }
}

