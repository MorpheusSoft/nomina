import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createWorkerDto: CreateWorkerDto) {
    // Check if worker with same identity number already exists in this tenant
    const existing = await this.prisma.worker.findUnique({
      where: {
        tenantId_primaryIdentityNumber: {
          tenantId,
          primaryIdentityNumber: createWorkerDto.primaryIdentityNumber,
        }
      }
    });

    if (existing) {
      throw new ConflictException(`Worker with Identity Number ${createWorkerDto.primaryIdentityNumber} already exists in this Tenant`);
    }

    return this.prisma.worker.create({
      data: {
        ...createWorkerDto,
        tenantId, // Ensure it's overriding just in case
        birthDate: new Date(createWorkerDto.birthDate),
      }
    });
  }

  async findAll(tenantId: string, canViewConfidential: boolean = false) {
    const today = new Date();
    const includePosition = {
      employmentRecords: {
        where: { isActive: true },
        select: { 
          id: true,
          isActive: true,
          position: true,
          costCenterId: true,
          departmentId: true,
          crewId: true,
          costCenter: true,
          department: true,
          crew: true,
          vacationHistories: {
            where: {
              startDate: { lte: today },
              endDate: { gte: today }
            }
          }
        }
      },
      workerAbsences: {
        where: {
          startDate: { lte: today },
          endDate: { gte: today }
        }
      }
    };

    const employmentRecordFilter = canViewConfidential 
      ? undefined 
      : { none: { isConfidential: true } };

    const workers = await this.prisma.worker.findMany({ 
      where: { 
        tenantId, 
        deletedAt: null,
        ...(employmentRecordFilter && { employmentRecords: employmentRecordFilter })
      },
      include: includePosition
    });

    return workers.map((w) => {
      let state = 'Inactivo';
      if (w.employmentRecords && w.employmentRecords.length > 0) {
        state = 'Activo';
        if (w.workerAbsences && w.workerAbsences.length > 0) {
          state = 'Suspendido';
        } else {
          const hasVacation = w.employmentRecords.some((er: any) => er.vacationHistories?.length > 0);
          if (hasVacation) state = 'Vacaciones';
        }
      }
      return { ...w, computedState: state };
    });
  }

  async findOne(tenantId: string, id: string, canViewConfidential: boolean = false) {
    const employmentRecordFilter = canViewConfidential 
      ? undefined 
      : { none: { isConfidential: true } };
      
    const worker = await this.prisma.worker.findFirst({ 
      where: { 
        id, 
        tenantId, 
        deletedAt: null,
        ...(employmentRecordFilter && { employmentRecords: employmentRecordFilter })
      },
      include: {
        bankAccounts: {
          include: { bank: true },
          orderBy: { isPrimary: 'desc' }
        }
      }
    });
    if (!worker) throw new NotFoundException('Worker not found or belongs to another tenant');
    return worker;
  }

  async update(tenantId: string, id: string, updateWorkerDto: UpdateWorkerDto, canViewConfidential: boolean = false) {
    await this.findOne(tenantId, id, canViewConfidential); // Ensure it exists, is not deleted, and belongs to tenant
    
    // Convert date if present
    const dataToUpdate: any = { ...updateWorkerDto };
    if (updateWorkerDto.birthDate) {
      dataToUpdate.birthDate = new Date(updateWorkerDto.birthDate);
    }
    
    return this.prisma.worker.updateMany({
      where: { id, tenantId },
      data: dataToUpdate,
    });
  }

  async remove(tenantId: string, id: string, canViewConfidential: boolean = false) {
    await this.findOne(tenantId, id, canViewConfidential); // Check ownership FIRST!
    // Soft delete
    return this.prisma.worker.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }

  // --- BANK ACCOUNTS MANAGEMENT ---

  async addBankAccount(tenantId: string, workerId: string, data: any) {
    await this.findOne(tenantId, workerId); // Check ownership

    if (data.isPrimary) {
      await this.prisma.bankAccount.updateMany({
        where: { workerId },
        data: { isPrimary: false }
      });
    } else {
      // If no accounts exist, force this one to be primary
      const existing = await this.prisma.bankAccount.count({ where: { workerId } });
      if (existing === 0) data.isPrimary = true;
    }

    return this.prisma.bankAccount.create({
      data: {
        workerId,
        bankId: data.bankId,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        isPrimary: data.isPrimary
      }
    });
  }

  async updateBankAccount(tenantId: string, workerId: string, accountId: string, data: any) {
    await this.findOne(tenantId, workerId); // Check ownership
    
    if (data.isPrimary) {
      await this.prisma.bankAccount.updateMany({
        where: { workerId, id: { not: accountId } },
        data: { isPrimary: false }
      });
    }

    return this.prisma.bankAccount.updateMany({
      where: { id: accountId, workerId },
      data: {
        bankId: data.bankId,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
        isPrimary: data.isPrimary
      }
    });
  }

  async removeBankAccount(tenantId: string, workerId: string, accountId: string) {
    await this.findOne(tenantId, workerId); // Check ownership
    
    await this.prisma.bankAccount.deleteMany({
      where: { id: accountId, workerId }
    });

    // If we deleted the primary, make the first remaining one primary
    const remaining = await this.prisma.bankAccount.findFirst({
      where: { workerId }
    });
    if (remaining) {
      const hasPrimary = await this.prisma.bankAccount.findFirst({
        where: { workerId, isPrimary: true }
      });
      if (!hasPrimary) {
        await this.prisma.bankAccount.updateMany({
          where: { id: remaining.id },
          data: { isPrimary: true }
        });
      }
    }
    
    return { success: true };
  }
}
