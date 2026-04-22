import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrustTransactionDto } from './dto/create-trust-transaction.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ContractTrustsService {
  constructor(private prisma: PrismaService) {}

  async findByEmploymentRecord(tenantId: string, employmentRecordId: string) {
    let trust = await this.prisma.contractTrust.findUnique({
      where: { employmentRecordId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
        employmentRecord: {
          include: { owner: true }
        }
      },
    });

    if (!trust) {
      // Auto-create trust if it doesn't exist yet for this employment record
      const contract = await this.prisma.employmentRecord.findFirst({
        where: { id: employmentRecordId, tenantId },
      });

      if (!contract) {
        throw new NotFoundException('Contrato no encontrado');
      }

      await this.prisma.contractTrust.create({
        data: {
          tenantId,
          employmentRecordId,
        },
      });

      // Refetch with relations
      trust = await this.prisma.contractTrust.findUnique({
        where: { employmentRecordId },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
          },
          employmentRecord: {
            include: { owner: true }
          }
        },
      });
    }

    if (trust?.tenantId !== tenantId) {
      throw new NotFoundException('Fideicomiso no encontrado');
    }

    return trust;
  }

  async addTransaction(tenantId: string, employmentRecordId: string, dto: CreateTrustTransactionDto) {
    return this.prisma.$transaction(async (tx) => {
      const trust = await tx.contractTrust.findUnique({
        where: { employmentRecordId },
      });

      if (!trust || trust.tenantId !== tenantId) {
         throw new NotFoundException('El fideicomiso no ha sido activado para este contrato. Consulta el saldo primero.');
      }

      // Check balance if it's a withdrawal or advance
      if (['WITHDRAWAL', 'ADVANCE'].includes(dto.type)) {
        if (new Decimal(trust.availableBalance).lessThan(dto.amount)) {
          throw new BadRequestException('Fondos insuficientes en el fideicomiso para este retiro/adelanto.');
        }
      }

      // Create transaction
      const transaction = await tx.trustTransaction.create({
        data: {
          tenantId,
          contractTrustId: trust.id,
          type: dto.type,
          amount: dto.amount,
          referenceDate: new Date(dto.referenceDate),
          notes: dto.notes,
        },
      });

      // Update Trust Balances
      let newAccumulated = new Decimal(trust.totalAccumulated);
      let newAdvances = new Decimal(trust.totalAdvances);

      if (['DEPOSIT', 'INTEREST'].includes(dto.type)) {
        newAccumulated = newAccumulated.add(dto.amount);
      } else if (['WITHDRAWAL', 'ADVANCE'].includes(dto.type)) {
        newAdvances = newAdvances.add(dto.amount);
      }

      const newAvailable = newAccumulated.sub(newAdvances);

      await tx.contractTrust.update({
        where: { id: trust.id },
        data: {
          totalAccumulated: newAccumulated,
          totalAdvances: newAdvances,
          availableBalance: newAvailable,
        },
      });

      return transaction;
    });
  }

  findAll(tenantId: string) {
    return this.prisma.contractTrust.findMany({
      where: { tenantId },
      include: {
        employmentRecord: {
          include: {
            owner: true,
          },
        },
      },
    });
  }
}
