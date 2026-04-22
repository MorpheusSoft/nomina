import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const passwordHash = await bcrypt.hash(data.password || '123456', 10);
    const { password, ...userData } = data;
    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        tenantId,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
  }

  findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId },
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true, 
        role: true, 
        isActive: true, 
        createdAt: true,
        tenantAccesses: {
          select: {
            tenant: {
              select: { id: true, name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(tenantId: string, id: string) {
    return this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
  }

  async update(tenantId: string, id: string, data: any) {
    if (data.password) {
      data.passwordHash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    
    await this.prisma.user.updateMany({
      where: { id, tenantId },
      data,
    });
    return this.findOne(tenantId, id);
  }

  async changePassword(id: string, newPassword: string) {
    if (!newPassword || newPassword.trim() === '') {
      throw new NotFoundException('Contraseña no válida');
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return { success: true };
  }

  remove(tenantId: string, id: string) {
    return this.prisma.user.deleteMany({
      where: { id, tenantId },
    });
  }
}
