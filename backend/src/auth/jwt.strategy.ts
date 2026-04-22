import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'nebulapay_super_secret_key_2026',
    });
  }

  async validate(payload: any) {
    if (payload.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: payload.tenantId } });
      if (!tenant) throw new UnauthorizedException('Empresa no existente.');
      
      // Eximir al dueño de la plataforma
      if (payload.email !== 'admin@nebulapayrolls.com') {
        if (!tenant.isActive) throw new UnauthorizedException('La empresa se encuentra suspendida.');
        if (tenant.serviceEndDate && new Date(tenant.serviceEndDate).getTime() < Date.now()) {
          throw new UnauthorizedException('La suscripción de la empresa ha expirado.');
        }
      }
    }

    return { 
      userId: payload.sub, 
      email: payload.email, 
      tenantId: payload.tenantId, 
      roleId: payload.roleId,
      permissions: payload.permissions || [],
      canViewConfidential: payload.permissions?.includes('ALL_ACCESS') || payload.permissions?.includes('CONFIDENTIAL_VIEW') || payload.permissions?.includes('access:confidential_payroll') || false,
    };
  }
}
