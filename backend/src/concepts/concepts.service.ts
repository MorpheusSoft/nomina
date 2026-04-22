import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConceptsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    const { payrollGroupIds, executionSequence, ...conceptData } = data;
    try {
      return await this.prisma.concept.create({
        data: { 
          ...conceptData, 
          executionSequence: executionSequence ? parseInt(executionSequence.toString(), 10) : 10,
          tenantId,
          payrollGroupConcepts: payrollGroupIds?.length ? {
            create: payrollGroupIds.map((pgId: string) => ({ payrollGroupId: pgId }))
          } : undefined
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('Ya existe un concepto con este código o nombre en la empresa. Utiliza otro código único.');
      }
      throw e;
    }
  }

  async findAll(tenantId: string) {
    return this.prisma.concept.findMany({
      where: { tenantId },
      include: {
        payrollGroupConcepts: { include: { payrollGroup: true } }
      },
      orderBy: { executionSequence: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const v = await this.prisma.concept.findFirst({ 
      where: { id, tenantId },
      include: {
        payrollGroupConcepts: true
      }
    });
    if (!v) throw new NotFoundException('Concept not found or unauthorized');
    return v;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    const { 
      code, name, description, type, accountingCode, accountingOperation,
      isSalaryIncidence, isTaxable, isAuxiliary,
      formulaFactor, formulaRate, formulaAmount, condition, executionSequence,
      executionPeriodTypes, payrollGroupIds
    } = data;
    
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.concept.updateMany({
        where: { id, tenantId },
        data: {
          name, description, type, accountingCode, accountingOperation,
          isSalaryIncidence, isTaxable, isAuxiliary,
          formulaFactor, formulaRate, formulaAmount, condition,
          executionPeriodTypes: executionPeriodTypes || ['REGULAR'],
          executionSequence: executionSequence ? parseInt(executionSequence.toString(), 10) : 10
        },
      });

      if (payrollGroupIds !== undefined) {
        await tx.payrollGroupConcept.deleteMany({ where: { conceptId: id } });
        if (payrollGroupIds.length > 0) {
          await tx.payrollGroupConcept.createMany({
            data: payrollGroupIds.map((pgId: string) => ({
              conceptId: id,
              payrollGroupId: pgId
            }))
          });
        }
      }
      return updated;
    });
  }

  async remove(tenantId: string, id: string) {
    const usedInReceipts = await this.prisma.payrollReceiptDetail.findFirst({ where: { conceptId: id } });
    if (usedInReceipts) {
      throw new ConflictException('Este concepto está en uso en recibos de nómina históricos. Para proteger la contabilidad no puede borrarse, por favor desmarque "Es Activo" para ocultarlo.');
    }

    const usedInWorkers = await this.prisma.workerFixedConcept.findFirst({ where: { conceptId: id } });
    if (usedInWorkers) {
      throw new ConflictException('Este concepto está asignado de forma fija a uno o más trabajadores. Retire la asignación a trabajadores antes de eliminarlo.');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.payrollGroupConcept.deleteMany({ where: { conceptId: id } });
      await tx.conceptDependency.deleteMany({ where: { parentConceptId: id } });
      await tx.conceptDependency.deleteMany({ where: { childConceptId: id } });
      return tx.concept.delete({ where: { id } });
    });
  }

  async importFromRootNode(targetTenantId: string) {
    // 1. Find root node
    const adminUser = await this.prisma.user.findUnique({ where: { email: 'admin@nebulapayrolls.com' } });
    if (!adminUser) throw new NotFoundException('Nodo maestro inaccesible.');
    if (adminUser.tenantId === targetTenantId) throw new ConflictException('Ya estás en el nodo maestro.');

    // 2. Fetch all concepts from the root library
    const rootConcepts = await this.prisma.concept.findMany({ where: { tenantId: adminUser.tenantId } });
    let importedCount = 0;

    // 3. Replicate concepts safely
    for (const concept of rootConcepts) {
      const exists = await this.prisma.concept.findFirst({ 
        where: { tenantId: targetTenantId, code: concept.code } 
      });

      if (!exists) {
        const { id, createdAt, updatedAt, tenantId, ...cleanConcept } = concept;
        await this.prisma.concept.create({
          data: {
            ...cleanConcept,
            tenantId: targetTenantId
          }
        });
        importedCount++;
      }
    }
    
    return { importedCount };
  }
}
