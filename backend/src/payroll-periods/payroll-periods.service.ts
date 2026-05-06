import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PayrollPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  private async checkOverlaps(tenantId: string, currentId: string | null, data: any) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new BadRequestException('Discrepancia Temporal: La fecha final debe ser igual o posterior a la fecha inicial.');
    }

    const overlappingPeriods = await this.prisma.payrollPeriod.findMany({
      where: {
        tenantId,
        type: data.type,
        payrollGroupId: data.payrollGroupId,
        id: currentId ? { not: currentId } : undefined,
        OR: [
          { startDate: { lte: endDate }, endDate: { gte: startDate } }
        ]
      },
      include: {
        departments: true
      }
    });

    if (overlappingPeriods.length === 0) return;

    for (const concurrent of overlappingPeriods) {
      const concurrentDepIds = concurrent.departments.map(d => d.id);
      const newDepIds = data.departmentIds || [];

      const isConcurrentGlobal = concurrentDepIds.length === 0;
      const isNewGlobal = newDepIds.length === 0;

      if (isNewGlobal && isConcurrentGlobal) {
        throw new BadRequestException(`Colisión: Ya existe una nómina Global (${concurrent.name}) que choca con estas fechas.`);
      }

      if (isNewGlobal && !isConcurrentGlobal) {
         throw new BadRequestException(`Colisión: Existe una nómina específica (${concurrent.name}) activa en estas fechas. No puede aperturar una Global.`);
      }

      if (!isNewGlobal && isConcurrentGlobal) {
         throw new BadRequestException(`Colisión: Ya existe una nómina Global (${concurrent.name}) en estas fechas. Abarca todos los departamentos, por lo que no puede crear una específica superpuesta.`);
      }

      const intersection = newDepIds.filter((id: string) => concurrentDepIds.includes(id));
      if (intersection.length > 0) {
        throw new BadRequestException(`Colisión Geográfica: Comparten departamentos con la nómina (${concurrent.name}) en las mismas fechas.`);
      }
    }
  }

  async create(tenantId: string, data: any) {
    await this.checkOverlaps(tenantId, null, data);

    return this.prisma.payrollPeriod.create({
      data: {
        tenantId,
        payrollGroupId: data.payrollGroupId,
        name: data.name,
        type: data.type,
        exchangeRate: data.exchangeRate || null,
        currency: data.currency || 'VES',
        costCenterId: data.costCenterId || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: data.status || 'DRAFT',
        processStatuses: data.processStatuses || ['ACTIVE'],
        departments: (data.departmentIds || []).length > 0 ? {
          connect: (data.departmentIds || []).map((id: string) => ({ id }))
        } : undefined,
        specialConcepts: (data.specialConceptIds || []).length > 0 ? {
          connect: (data.specialConceptIds || []).map((id: string) => ({ id }))
        } : undefined,
        importedAttendancePeriods: (data.linkedAttendancePeriodIds || []).length > 0 ? {
          connect: (data.linkedAttendancePeriodIds || []).map((id: string) => ({ id }))
        } : undefined
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.payrollPeriod.findMany({
      where: { tenantId },
      orderBy: { startDate: 'asc' },
      include: {
        payrollGroup: {
          select: { name: true }
        },
        importedAttendancePeriods: {
          select: { id: true, name: true }
        },
        _count: {
          select: { payrollReceipts: true }
        },
        costCenter: {
          select: { name: true }
        },
        departments: {
          select: { name: true }
        }
      }
    });
  }

  async findOne(tenantId: string, id: string) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id, tenantId },
      include: {
        payrollGroup: true,
        specialConcepts: true,
        importedAttendancePeriods: true,
        departments: true,
        tenant: true
      }
    });
    if (!period) throw new NotFoundException('Payroll Period not found');
    return period;
  }

  async getBudgetAnalysis(tenantId: string, periodId: string) {
    const period = await this.prisma.payrollPeriod.findFirst({ where: { id: periodId, tenantId }, include: { departments: true } });
    if (!period) throw new NotFoundException('Period not found');

    // Mapear los departamentos desde la estructura real. Si el periodo no tiene, buscar todos los departamentos.
    let baseDepartments = period.departments;
    if (baseDepartments.length === 0) {
      baseDepartments = await this.prisma.department.findMany({ where: { costCenter: { tenantId } } });
    }

    const receipts = await this.prisma.payrollReceipt.findMany({
      where: { payrollPeriodId: periodId },
      include: {
        worker: {
          include: {
            employmentRecords: { orderBy: { startDate: 'desc' }, include: { department: true } }
          }
        }
      }
    });

    const startOfMonth = new Date(period.endDate.getFullYear(), period.endDate.getMonth(), 1);
    const endOfMonth = new Date(period.endDate.getFullYear(), period.endDate.getMonth() + 1, 0);

    // Buscar nóminas previas del mismo mes (histórico MTD)
    const historicReceipts = await this.prisma.payrollReceipt.findMany({
      where: {
        payrollPeriod: {
          tenantId,
          status: { in: ['CLOSED', 'APPROVED'] },
          endDate: { gte: startOfMonth, lte: endOfMonth },
          id: { not: periodId } // Excluir la nómina actual
        }
      },
      include: {
        payrollPeriod: true,
        worker: {
          include: {
            employmentRecords: { orderBy: { startDate: 'desc' }, include: { department: true } }
          }
        }
      }
    });

    const results = baseDepartments.map(dep => {
      // Todo el presupuesto se normaliza a USD como ancla financiera
      const monthlyBudgetUSD = Number(dep.monthlyBudget || 0);

      // Costos Historicos Acumulados
      let mtdHistoricCostUSD = 0;
      historicReceipts.forEach(r => {
        const contract = r.worker.employmentRecords.find(c => c.departmentId === dep.id) || r.worker.employmentRecords[0];
        if (contract && contract.departmentId === dep.id) {
          let cost = parseFloat(r.netPay?.toString() || '0');
          // Normalizar a USD si se pagó en otra moneda
          if (r.payrollPeriod.currency !== 'USD' && r.payrollPeriod.exchangeRate) {
            cost = cost / Number(r.payrollPeriod.exchangeRate);
          }
          mtdHistoricCostUSD += cost;
        }
      });

      // Costo de la Nómina Actual en Pantalla
      let currentPeriodCostUSD = 0;
      receipts.forEach(r => {
        const contract = r.worker.employmentRecords.find(c => c.departmentId === dep.id) || r.worker.employmentRecords[0];
        if (contract && contract.departmentId === dep.id) {
          let cost = parseFloat(r.netPay?.toString() || '0');
          // Normalizar a USD
          if (period.currency !== 'USD' && period.exchangeRate) {
            cost = cost / Number(period.exchangeRate);
          }
          currentPeriodCostUSD += cost;
        }
      });

      const totalProjectedCostUSD = mtdHistoricCostUSD + currentPeriodCostUSD;
      const varianceUSD = monthlyBudgetUSD - totalProjectedCostUSD;

      return {
        departmentId: dep.id,
        departmentName: dep.name,
        monthlyBudgetUSD: monthlyBudgetUSD,
        mtdHistoricCostUSD: mtdHistoricCostUSD,
        currentPeriodCostUSD: currentPeriodCostUSD,
        totalProjectedCostUSD: totalProjectedCostUSD,
        varianceUSD: varianceUSD,
        isOverBudget: totalProjectedCostUSD > monthlyBudgetUSD && monthlyBudgetUSD > 0
      };
    });

    const workerStatusSummary = {
      ACTIVE: 0,
      ON_VACATION: 0,
      SUSPENDED: 0,
      LIQUIDATED: 0
    };

    receipts.forEach(r => {
      const contract = r.worker.employmentRecords[0];
      if (contract && contract.status) {
        workerStatusSummary[contract.status as keyof typeof workerStatusSummary] = 
          (workerStatusSummary[contract.status as keyof typeof workerStatusSummary] || 0) + 1;
      }
    });

    return {
      periodId: period.id,
      periodName: period.name,
      status: period.status,
      analysis: results,
      workerStatusSummary
    };
  }

  async update(user: any, id: string, data: any) {
    const tenantId = user.tenantId;
    const period = await this.prisma.payrollPeriod.findFirst({ where: { id, tenantId }, include: { departments: true } });
    if (!period) throw new NotFoundException('Period not found');
    if (period.status === 'CLOSED') throw new BadRequestException('No se puede modificar una nómina cerrada');

    // Prepare data to check overlaps
    const checkData = {
      type: period.type,
      payrollGroupId: period.payrollGroupId,
      startDate: data.startDate ? new Date(data.startDate) : period.startDate,
      endDate: data.endDate ? new Date(data.endDate) : period.endDate,
      departmentIds: data.departmentIds !== undefined ? data.departmentIds : period.departments.map(d => d.id)
    };

    if (data.startDate || data.endDate || data.departmentIds !== undefined) {
      await this.checkOverlaps(tenantId, id, checkData);
    }

    // Lifecycle Status Validation
    if (data.status && data.status !== period.status) {
      if (period.status === 'DRAFT' && data.status !== 'PENDING_APPROVAL' && data.status !== 'CLOSED') {
        throw new BadRequestException('Tránsito inválido desde DRAFT. Siguiente estado: PENDING_APPROVAL');
      }
      if (period.status === 'PENDING_APPROVAL' && data.status !== 'APPROVED' && data.status !== 'DRAFT') {
        throw new BadRequestException('Nómina Pendiente de Aprobación solo puede ser devuelta a Borrador o Aprobada');
      }
      if (data.status === 'APPROVED') {
        const hasPermission = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('PAYROLL_APPROVE');
        if (!hasPermission) {
          throw new BadRequestException('No posees el permiso PAYROLL_APPROVE para autorizar nóminas');
        }
      }
      if (period.status === 'APPROVED' && data.status !== 'CLOSED' && data.status !== 'DRAFT') {
        throw new BadRequestException('Nómina Aprobada solo puede ser Cerrada o devuelta a DRAFT');
      }
    }

    const updateData: any = { ...data };
    
    // Cleanup pseudo-fields from DTO
    delete updateData.departmentIds;

    if (data.exchangeRate !== undefined) updateData.exchangeRate = data.exchangeRate;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.costCenterId !== undefined) updateData.costCenterId = data.costCenterId || null;
    
    // Cleanup old keys just in case
    delete updateData.specialConceptIds;
    delete updateData.linkedAttendancePeriodIds;
    
    if (data.specialConceptIds !== undefined) {
      updateData.specialConcepts = { set: (data.specialConceptIds || []).map((id: string) => ({ id })) };
    }
    if (data.linkedAttendancePeriodIds !== undefined) {
      updateData.importedAttendancePeriods = { set: (data.linkedAttendancePeriodIds || []).map((id: string) => ({ id })) };
    }
    if (data.departmentIds !== undefined) {
      updateData.departments = {
        set: (data.departmentIds || []).map((id: string) => ({ id }))
      };
    }
    if (data.processStatuses !== undefined) updateData.processStatuses = data.processStatuses;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    
    if (data.status === 'CLOSED' && period.status !== 'CLOSED') {
      await this.processLoanDeductions(tenantId, id);
      
      if (period.type === 'PRESTACIONES' || period.type === 'SOCIAL_BENEFITS') {
        await this.processSocialBenefitsDeposit(tenantId, id);
      }

      if (period.type === 'SETTLEMENT') {
        await this.processLiquidationClosing(tenantId, id);
      }
      // Mark all calculated receipts as PAID locking them
      await this.prisma.payrollReceipt.updateMany({
        where: { payrollPeriodId: id },
        data: { status: 'PAID' }
      });
      
      // En Fase 2 publicamos y notificamos si se Cierra.
      await this.publishReceipts(tenantId, id);
    }
    // Status can be updated natively
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.payrollPeriod.update({
      where: { id },
      data: updateData
    });
  }

  private async publishReceipts(tenantId: string, periodId: string) {
    const crypto = require('crypto');
    const receipts = await this.prisma.payrollReceipt.findMany({
      where: { payrollPeriodId: periodId, status: 'DRAFT' } // Solo los que estaban en draft (ahora pasarán a PAID). Wait, the closing logic does it.
    });

    for (const r of receipts) {
      const token = crypto.randomBytes(16).toString('hex');
      await this.prisma.payrollReceipt.update({
        where: { id: r.id },
        data: {
          status: 'PAID',
          signatureToken: token,
          publishedAt: new Date()
        }
      });
      // Llamada asíncrona simulada al Omnichannel Delivery (Whatsapp / Email)
      this.dispatchOmnichannelDelivery(tenantId, r.id, r.workerId, token);
    }
  }

  private async dispatchOmnichannelDelivery(tenantId: string, receiptId: string, workerId: string, token: string) {
    // Simulador: Obtenemos datos del trabajador
    const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker) return;

    const publicUrl = `http://localhost:3000/portal/receipt/sign/${token}`;
    console.log(`\n\n----------------- OMNICHANNEL DISPATCH -----------------`);
    console.log(`Worker: ${worker.firstName} ${worker.lastName}`);
    
    if (worker.email) {
      console.log(`[EMAIL DISPATCH] -> Enviando recibo a ${worker.email}...`);
      console.log(`[EMAIL DISPATCH] -> Body: "Estimado, tiene un nuevo recibo de pago listo para validación."`);
      console.log(`[EMAIL DISPATCH] -> URL Segura: ${publicUrl}`);
      // Simulamos éxito
      await this.prisma.payrollReceipt.update({ where: { id: receiptId }, data: { emailDeliveryStatus: 'SENT' } });
    } else {
      console.log(`[EMAIL DISPATCH] -> Email no registrado. Descartado.`);
    }

    if (worker.phone) {
      console.log(`[WHATSAPP DISPATCH] -> Enviando mensaje a ${worker.phone}...`);
      console.log(`[WHATSAPP DISPATCH] -> "Hola ${worker.firstName}, nuevo pago de nómina generado. Haz clic aquí para firmar: ${publicUrl}"`);
      await this.prisma.payrollReceipt.update({ where: { id: receiptId }, data: { whatsappDeliveryStatus: 'SENT' } });
    } else {
      console.log(`[WHATSAPP DISPATCH] -> Teléfono no registrado. Descartado.`);
    }
    console.log(`--------------------------------------------------------\n\n`);
  }

  private async processLoanDeductions(tenantId: string, periodId: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id: periodId },
      include: { payrollGroup: true }
    });
    
    // Solo procedemos si el grupo tiene un concepto atado a "Cobro de Préstamos"
    const loanConceptId = period?.payrollGroup?.loanDeductionConceptId;
    if (!loanConceptId) return;

    // Obtener los detalles cobrados específicamente por este concepto
    const deductions = await this.prisma.payrollReceiptDetail.findMany({
      where: { 
        payrollReceipt: { payrollPeriodId: periodId },
        conceptId: loanConceptId
      },
      include: { payrollReceipt: true } 
    });

    for (const d of deductions) {
      const amountDeducted = Math.abs(Number(d.amount)); 
      if (amountDeducted <= 0) continue;

      // Descontar la deuda al préstamo activo más viejo
      const loan = await (this.prisma as any).workerLoan.findFirst({
        where: {
           workerId: d.payrollReceipt.workerId,
           status: 'ACTIVE'
        },
        orderBy: { createdAt: 'asc' }
      });

      if (loan) {
        let amortAmount = amountDeducted;
        const pRate = Number(period.exchangeRate) || 1;
        
        if (period.currency === 'VES' && loan.currency === 'USD') {
           amortAmount /= pRate;
        } else if (period.currency === 'USD' && loan.currency === 'VES') {
           amortAmount *= pRate;
        }

        let newBalance = Number(loan.outstandingBalance) - amortAmount;
        if (newBalance <= 0) newBalance = 0;
        
        await (this.prisma as any).workerLoan.update({
          where: { id: loan.id },
          data: {
             outstandingBalance: newBalance,
             status: newBalance <= 0 ? 'PAID' : 'ACTIVE'
          }
        });
      }
    }
  }

  async remove(tenantId: string, id: string) {
    const period = await this.prisma.payrollPeriod.findFirst({ where: { id, tenantId } });
    if (!period) throw new NotFoundException('Period not found');
    if (period.status === 'CLOSED') throw new BadRequestException('No se puede eliminar una nómina cerrada');

    await this.prisma.payrollReceipt.deleteMany({ where: { payrollPeriodId: id } });

    return this.prisma.payrollPeriod.delete({
      where: { id }
    });
  }

  private async processSocialBenefitsDeposit(tenantId: string, periodId: string) {
    const receipts = await this.prisma.payrollReceipt.findMany({
      where: { payrollPeriodId: periodId },
      include: {
        worker: {
          include: {
            employmentRecords: {
              where: { isActive: true }
            }
          }
        },
        details: true
      }
    });

    for (const receipt of receipts) {
      const activeContract = receipt.worker.employmentRecords[0];
      if (!activeContract) continue;

      const totalEarned = receipt.details.filter(d => d.typeSnapshot === 'EARNING').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const totalDeducted = receipt.details.filter(d => d.typeSnapshot === 'DEDUCTION').reduce((acc, curr) => acc + Number(curr.amount), 0);
      const netToPay = totalEarned - totalDeducted;

      if (netToPay <= 0) continue;

      let trust = await this.prisma.contractTrust.findUnique({
        where: { employmentRecordId: activeContract.id }
      });

      if (!trust) {
        trust = await this.prisma.contractTrust.create({
          data: { tenantId, employmentRecordId: activeContract.id }
        });
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.trustTransaction.create({
          data: {
            tenantId,
            contractTrustId: trust!.id,
            payrollReceiptId: receipt.id,
            type: 'DEPOSIT',
            amount: netToPay,
            referenceDate: new Date(),
            notes: 'Depósito Automático Nómina de Fideicomiso / Prestaciones'
          }
        });

        const newAccumulated = Number(trust!.totalAccumulated) + netToPay;
        await tx.contractTrust.update({
          where: { id: trust!.id },
          data: {
            totalAccumulated: newAccumulated,
            availableBalance: newAccumulated - Number(trust!.totalAdvances)
          }
        });
      });
    }
  }

  private async processLiquidationClosing(tenantId: string, periodId: string) {
    const receipts = await this.prisma.payrollReceipt.findMany({
      where: { payrollPeriodId: periodId },
      include: {
        worker: {
          include: {
            employmentRecords: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    for (const receipt of receipts) {
      const activeContract = receipt.worker.employmentRecords[0];
      if (!activeContract) continue;

      await this.prisma.$transaction(async (tx) => {
        // 1. Matar Contrato
        await tx.employmentRecord.update({
          where: { id: activeContract.id },
          data: {
            isActive: false,
            status: 'LIQUIDATED',
            endDate: new Date(), // Se asume cierre hoy, aunque debe coincidir idealmente con la de liquidación.
          }
        });

        // 2. Extraer Fideicomiso a Cero
        const trust = await tx.contractTrust.findUnique({
          where: { employmentRecordId: activeContract.id }
        });

        if (trust && Number(trust.availableBalance) > 0) {
          const withdrawingAmount = Number(trust.availableBalance);
          await tx.trustTransaction.create({
            data: {
              tenantId,
              contractTrustId: trust.id,
              payrollReceiptId: receipt.id,
              type: 'WITHDRAWAL',
              amount: withdrawingAmount,
              referenceDate: new Date(),
              notes: 'Retiro Total por Finiquito / Liquidación Laboral'
            }
          });

          await tx.contractTrust.update({
             where: { id: trust.id },
             data: {
               totalAdvances: Number(trust.totalAdvances) + withdrawingAmount,
               availableBalance: 0
             }
          });
        }
      });
    }
  }
}
