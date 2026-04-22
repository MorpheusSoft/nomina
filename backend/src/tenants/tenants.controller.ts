import { Controller, Get, Patch, Post, Body, Param, UseGuards, ForbiddenException, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('my-status')
  async getMyStatus(@CurrentUser() user: any) {
    if (!user?.tenantId) return null;
    return this.tenantsService.findOne(user.tenantId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    if (user?.email !== 'admin@nebulapayrolls.com') throw new ForbiddenException('Acesso Denegado');
    return this.tenantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    if (user?.email !== 'admin@nebulapayrolls.com') throw new ForbiddenException('Acesso Denegado');
    return this.tenantsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateTenantDto, @CurrentUser() user: any) {
    console.log('PATCH received for id:', id, 'data:', data);
    if (user?.email !== 'admin@nebulapayrolls.com') throw new ForbiddenException('Acesso Denegado');
    return this.tenantsService.update(id, data);
  }

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/logos',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${req.params.id}-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return cb(new BadRequestException('Solo se permiten imágenes JPG o PNG'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB
  }))
  uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: any) {
    if (user?.email !== 'admin@nebulapayrolls.com') throw new ForbiddenException('Acesso Denegado');
    if (!file) {
      throw new BadRequestException('No se adjuntó el archivo o superó el límite permitido.');
    }
    const logoUrl = `/uploads/logos/${file.filename}`;
    return this.tenantsService.update(id, { logoUrl });
  }

  @Post(':id/consultants/assign')
  assignConsultant(@Param('id') targetTenantId: string, @Body('consultantUserId') consultantUserId: string, @CurrentUser() user: any) {
    if (user?.email !== 'admin@nebulapayrolls.com') throw new ForbiddenException('Acesso Denegado');
    if (!consultantUserId) throw new BadRequestException('Falta ID del consultor');
    return this.tenantsService.assignConsultant(targetTenantId, consultantUserId);
  }
}
