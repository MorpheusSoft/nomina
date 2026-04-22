import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService, private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.originalUrl.includes('/auth/login') || req.originalUrl.includes('/auth/register') || req.originalUrl.includes('/portal') || req.originalUrl.includes('/ari-forms/floor') || req.originalUrl.includes('/ari-forms/employee') || req.originalUrl.includes('/ari-forms/simulate') || req.originalUrl.includes('/ari-forms/details') || req.originalUrl.includes('/uploads')) {
      return next();
    }

    // Permitir CORS options
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de acceso requerido por seguridad.');
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026'
      });
      
      if (payload.tenantId) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: payload.tenantId } });
        if (!tenant) throw new UnauthorizedException('Inquilino no existente.');
        
        // Eximir al dueño de la plataforma
        if (payload.email !== 'admin@nebulapayrolls.com') {
          if (!tenant.isActive) throw new UnauthorizedException('Tu empresa ha sido suspendida.');
          if (tenant.serviceEndDate && new Date(tenant.serviceEndDate).getTime() < Date.now()) {
            throw new UnauthorizedException('La suscripción SaaS ha expirado.');
          }
        }
      }

      // SOBREESCRIBIR: Obligar a todo el sistema a usar el Tenant del JWT
      if (req.body && typeof req.body === 'object') {
        req.body.tenantId = payload.tenantId;
      }
      if (req.query) {
        req.query.tenantId = payload.tenantId;
      }
      
      req['user'] = payload;
      next();
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Token inválido o expirado. Inicia sesión nuevamente.');
    }
  }
}
 
