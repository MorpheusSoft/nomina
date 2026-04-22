import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmploymentRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: any) {
    const { initialSalary, currency, ...recordData } = createDto;
    
    if (recordData.tenantId) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: recordData.tenantId },
        select: { maxActiveWorkers: true }
      });
      
      if (tenant) {
        const activeContractsCount = await this.prisma.employmentRecord.count({
          where: { tenantId: recordData.tenantId, isActive: true }
        });
        
        if (activeContractsCount >= tenant.maxActiveWorkers) {
          throw new ForbiddenException(`Límite alcanzado: El plan actual de la empresa permite un máximo de ${tenant.maxActiveWorkers} trabajadores activos.`);
        }
      }
    }

    // Check if there is an active contract and deactivate it if asked, or just create
    return this.prisma.$transaction(async (tx) => {
      // Deactivate other records for this worker to ensure only 1 active
      await tx.employmentRecord.updateMany({
        where: { workerId: recordData.workerId, isActive: true },
        data: { isActive: false, endDate: recordData.startDate }
      });

      const record = await tx.employmentRecord.create({
        data: {
          ...recordData,
          startDate: new Date(recordData.startDate),
          isActive: true
        }
      });

      if (initialSalary) {
        await tx.salaryHistory.create({
          data: {
            employmentRecordId: record.id,
            amount: initialSalary,
            currency: currency || 'USD',
            validFrom: new Date(recordData.startDate)
          }
        });
      }

      return record;
    });
  }

  findAllByWorker(workerId: string) {
    return this.prisma.employmentRecord.findMany({
      where: { workerId },
      include: {
        salaryHistories: {
          orderBy: { validFrom: 'desc' }
        },
        payrollGroup: true,
        costCenter: true,
        department: true,
        crew: true
      },
      orderBy: { startDate: 'desc' }
    });
  }

  async updateSalary(recordId: string, amount: number, currency: string, validFrom: string) {
    return this.prisma.$transaction(async (tx) => {
      // Find the last salary history and close it
      const lastSalary = await tx.salaryHistory.findFirst({
        where: { employmentRecordId: recordId, validTo: null },
        orderBy: { validFrom: 'desc' }
      });

      if (lastSalary) {
        await tx.salaryHistory.update({
          where: { id: lastSalary.id },
          data: { validTo: new Date(validFrom) }
        });
      }

      // Create new salary entry
      return tx.salaryHistory.create({
        data: {
          employmentRecordId: recordId,
          amount,
          validFrom: new Date(validFrom),
          currency: currency // Now explicitly chosen by the user
        }
      });
    });
  }

  async transferWorker(recordId: string, data: { position: string, costCenterId: string, departmentId: string, crewId: string }) {
    return this.prisma.employmentRecord.update({
      where: { id: recordId },
      data: {
        position: data.position,
        costCenterId: data.costCenterId,
        departmentId: data.departmentId,
        crewId: data.crewId
      }
    });
  }

  async toggleConfidentiality(recordId: string, isConfidential: boolean) {
    return this.prisma.employmentRecord.update({
      where: { id: recordId },
      data: { isConfidential }
    });
  }
}
