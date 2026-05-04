import { Injectable, UnauthorizedException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ 
      where: { email: cleanEmail },
      include: { 
        role: true, 
        tenant: true,
        tenantAccesses: { include: { tenant: true, role: true } }
      }
    });
    
    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        // Eximir al dueño de la plataforma (admin maestro) de las reglas de suspensión comercial para evitar bloqueos del sistema
        if (user.tenant && user.email !== 'admin@nebulapayrolls.com') {
          if (!user.tenant.isActive) {
            throw new ForbiddenException('La cuenta de esta empresa se encuentra suspendida.');
          }
          if (user.tenant.serviceEndDate && new Date(user.tenant.serviceEndDate).getTime() < Date.now()) {
            throw new ForbiddenException('La suscripción de esta empresa ha expirado.');
          }
        }
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(email: string, pass: string) {
    const user = await this.validateUser(email, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas o cuenta inactiva');
    }
    
    const payload = { 
      email: user.email, 
      sub: user.id, 
      tenantId: user.tenantId,
      roleId: user.roleId,
      permissions: user.role.permissions
    };
    
    let availableTenants = [];
    if (user.email === 'admin@nebulapayrolls.com') {
      const allTenants = await this.prisma.tenant.findMany();
      availableTenants = allTenants.map(t => ({
        tenantId: t.id,
        tenantName: t.name,
        roleId: user.roleId,
        roleName: 'Súper Administrador'
      }));
    } else {
      availableTenants = user.tenantAccesses?.map((acc: any) => ({
        tenantId: acc.tenantId,
        tenantName: acc.tenant.name,
        roleId: acc.roleId,
        roleName: acc.role.name
      })) || [];
    }

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        permissions: user.role.permissions,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name,
        availableTenants
      }
    };
  }

  async register(data: any, currentUser: any) {
    // SECURITY: Only the Platform Owner can create Tenants logic here
    if (currentUser?.email !== 'admin@nebulapayrolls.com') {
      throw new ForbiddenException('Acesso Denegado. Solo el Dueño de Plataforma puede dar de alta nuevos Clientes.');
    }

    const cleanEmail = data.email.trim().toLowerCase();
    
    if (data.password.length < 6) {
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres.');
    }

    const existingUser = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    // 1. Transaction to guarantee all or nothing
    return this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.companyName,
          taxId: data.taxId,
          hasWorkerPortalAccess: data.hasWorkerPortalAccess ?? false,
          hasOracleAccess: data.hasOracleAccess ?? false,
          hasGeofencingAccess: data.hasGeofencingAccess ?? false,
          logoUrl: data.logoUrl || null,
          contactPhone: data.contactPhone || null,
          serviceEndDate: data.serviceEndDate ? new Date(data.serviceEndDate) : null,
        }
      });

      // 2. Create SuperAdmin Role
      const role = await tx.role.create({
        data: {
          tenantId: tenant.id,
          name: 'Super Administrador',
          permissions: ['ALL_ACCESS']
        }
      });

      // 3. Create User
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          roleId: role.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: cleanEmail,
          passwordHash,
        }
      });

      // 4. Create UserTenantAccess binding
      await tx.userTenantAccess.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          roleId: role.id
        }
      });
    });

    // Auto-login upon successful registration
    return this.login(data.email, data.password);
  }

  async switchTenant(userId: string, targetTenantId: string) {
    try {
      const godUser = await this.prisma.user.findUnique({ where: { id: userId } });

      let finalRoleId = '';
      
      if (godUser?.email === 'admin@nebulapayrolls.com') {
        let superRole = await this.prisma.role.findFirst({
          where: { tenantId: targetTenantId, name: 'Super Administrador' } // Sin tilde (creado así en register)
        });
        // Fallback extremo por si el cliente fue creado manualmente sin rol
        if (!superRole) {
          superRole = await this.prisma.role.create({
              data: { tenantId: targetTenantId, name: 'Super Administrador', permissions: ['ALL_ACCESS'] }
          });
        }
        
        finalRoleId = superRole.id;
      } else {
        const access = await this.prisma.userTenantAccess.findUnique({
          where: { userId_tenantId: { userId, tenantId: targetTenantId } },
          include: { role: true, tenant: true, user: true }
        });

        if (!access) {
          throw new ForbiddenException('No tienes acceso a esta empresa o no existe.');
        }
        finalRoleId = access.roleId;
      }

      // Update active context
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { tenantId: targetTenantId, roleId: finalRoleId },
        include: { role: true, tenant: true, tenantAccesses: { include: { tenant: true, role: true } } }
      });

      // Generate new payload
      const payload = { 
        email: updatedUser.email, 
        sub: updatedUser.id, 
        tenantId: updatedUser.tenantId,
        roleId: updatedUser.roleId,
        permissions: updatedUser.role.permissions
      };

      let availableTenants = [];
      if (updatedUser.email === 'admin@nebulapayrolls.com') {
        const allTenants = await this.prisma.tenant.findMany();
        availableTenants = allTenants.map(t => ({
          tenantId: t.id,
          tenantName: t.name,
          roleId: finalRoleId,
          roleName: 'Súper Administrador'
        }));
      } else {
        availableTenants = updatedUser.tenantAccesses?.map((acc: any) => ({
          tenantId: acc.tenantId,
          tenantName: acc.tenant.name,
          roleId: acc.roleId,
          roleName: acc.role.name
        })) || [];
      }

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          role: updatedUser.role.name,
          permissions: updatedUser.role.permissions,
          tenantId: updatedUser.tenantId,
          tenantName: updatedUser.tenant?.name,
          availableTenants
        }
      };
    } catch (e: any) {
      console.error("SWITCH ERROR:", e);
      throw new BadRequestException('Error interno: ' + e.message);
    }
  }

  async returnToRoot(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { tenantId: true }
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // tenantId es el nodo original donde nació el usuario (ej. Nebula Root Node).
    return this.switchTenant(userId, user.tenantId);
  }
}
