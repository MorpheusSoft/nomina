import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AriFormsService {
  constructor(private prisma: PrismaService) {}

  public simulateTaxMath(estimatedIncome: number, deductionType: string, detailedDeductionsAmount: number, familyLoadCount: number, taxUnitValue: number) {
    if (taxUnitValue <= 0) return { percentage: 0, taxUnitValue, estimatedUt: 0, deductionUt: 0, netEstimableUt: 0, taxToPayUt: 0, rebatesUt: 0, finalTaxUt: 0, taxInBs: 0 };
    
    // 1. Ingreso en U.T.
    const estimatedUt = estimatedIncome / taxUnitValue;
    
    // 2. Desgravámenes en U.T.
    let deductionUt = 0;
    if (deductionType === 'UNIQUE') {
      deductionUt = 774;
    } else {
      deductionUt = detailedDeductionsAmount / taxUnitValue;
    }

    // 3. Renta Neta Grabable en U.T.
    const netEstimableUt = estimatedUt - deductionUt;
    
    if (netEstimableUt <= 0) return { percentage: 0, taxUnitValue, estimatedUt, deductionUt, netEstimableUt, taxToPayUt: 0, rebatesUt: 0, finalTaxUt: 0, taxInBs: 0 };

    // 4. Tarifa N° 1
    let rate = 0;
    let subtrahend = 0;
    
    if (netEstimableUt <= 1000) { rate = 0.06; subtrahend = 0; }
    else if (netEstimableUt <= 1500) { rate = 0.09; subtrahend = 30; }
    else if (netEstimableUt <= 2000) { rate = 0.12; subtrahend = 75; }
    else if (netEstimableUt <= 2500) { rate = 0.16; subtrahend = 155; }
    else if (netEstimableUt <= 3000) { rate = 0.20; subtrahend = 255; }
    else if (netEstimableUt <= 4000) { rate = 0.24; subtrahend = 375; }
    else if (netEstimableUt <= 6000) { rate = 0.29; subtrahend = 575; }
    else { rate = 0.34; subtrahend = 875; }

    const taxToPayUt = (netEstimableUt * rate) - subtrahend;
    
    // 5. Rebajas (Art. 62)
    let rebatesUt = 10; // Personal
    rebatesUt += (familyLoadCount * 10);
    
    const finalTaxUt = taxToPayUt - rebatesUt;
    
    if (finalTaxUt <= 0) return { percentage: 0, taxUnitValue, estimatedUt, deductionUt, netEstimableUt, taxToPayUt, rebatesUt, finalTaxUt: 0, taxInBs: 0 };

    // 6. Impuesto Anual en Bolívares
    const taxInBs = finalTaxUt * taxUnitValue;
    
    // 7. Porcentaje de Retención
    const percentage = (taxInBs / estimatedIncome) * 100;
    
    return {
      percentage: parseFloat(percentage.toFixed(2)),
      taxUnitValue,
      estimatedUt,
      deductionUt,
      netEstimableUt,
      taxToPayUt,
      rebatesUt,
      finalTaxUt,
      taxInBs
    };
  }

  public calculatePercentage(estimatedIncome: number, deductionType: string, detailedDeductionsAmount: number, familyLoadCount: number, taxUnitValue: number): number {
    return this.simulateTaxMath(estimatedIncome, deductionType, detailedDeductionsAmount, familyLoadCount, taxUnitValue).percentage;
  }

  async getActiveTaxUnitValue(tenantId: string): Promise<number> {
    const variable = await this.prisma.globalVariable.findFirst({
       where: { tenantId, code: 'VALOR_UT' },
       orderBy: { validFrom: 'desc' }
    });
    return variable ? Number(variable.value) : 9.00; // Stand in value if not found
  }

  async getProjectionFloor(employmentRecordId: string, tenantId: string): Promise<number> {
    const record = await this.prisma.employmentRecord.findFirst({
      where: { id: employmentRecordId, tenantId },
      include: {
        salaryHistories: { orderBy: { validFrom: 'desc' }, take: 1 },
        payrollGroup: { include: { payrollGroupVariables: true } }
      }
    });

    if (!record || !record.salaryHistories.length) return 0;

    const baseSalaryAmount = Number(record.salaryHistories[0].amount);
    const currency = record.salaryHistories[0].currency;
    
    let conversionRate = 1;
    if (currency === 'USD') {
      const bcv = await this.prisma.globalVariable.findFirst({ where: { tenantId, code: 'TASA_BCV' }, orderBy: { validFrom: 'desc' } });
      if (bcv) conversionRate = Number(bcv.value);
    }

    const baseSalary = baseSalaryAmount * conversionRate;
    const dailySalary = baseSalary / 30;

    let utilDays = 120;
    let vacDays = 15;

    if (record.payrollGroup) {
      const uVar = record.payrollGroup.payrollGroupVariables.find(v => v.code === 'DIAS_UTILIDADES');
      if (uVar && uVar.value) utilDays = Number(uVar.value);

      const vVar = record.payrollGroup.payrollGroupVariables.find(v => v.code === 'DIAS_BONO_VACACIONAL');
      if (vVar && vVar.value) vacDays = Number(vVar.value);
    }

    const estimated = (baseSalary * 12) + (dailySalary * utilDays) + (dailySalary * vacDays);
    return Math.round(estimated * 100) / 100;
  }

  async submitVoluntaryForm(tenantId: string, workerId: string, data: any) {
    const { 
      fiscalYear, 
      estimatedRemuneration, 
      deductionType, 
      detailedDeductionsAmount,
      eduDeductionAmount = 0,
      hcmDeductionAmount = 0,
      medDeductionAmount = 0,
      housingDeductionAmount = 0,
      familyLoadCount
    } = data;

    // Get Employment Record Active
    const record = await this.prisma.employmentRecord.findFirst({
      where: { workerId, tenantId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) throw new NotFoundException('Empleado no tiene registro activo en nómina.');

    const taxUnitValue = await this.getActiveTaxUnitValue(tenantId);
    
    // Obtener las cargas familiares reales o usar la provista por el frontend de manera interactiva
    let loadCount = familyLoadCount;
    if (loadCount === undefined || loadCount === null) {
      const familyMembers = await this.prisma.familyMember.findMany({
        where: { workerId }
      });
      loadCount = familyMembers.length; 
    }

    // Validate Floor
    const floor = await this.getProjectionFloor(record.id, tenantId);
    if (estimatedRemuneration < floor) {
      throw new BadRequestException(`El ingreso anual estimado no puede ser inferior a la proyección legal base dictada por el departamento contable (Sueldo + Utilidades + Bono Vac.): ${floor.toLocaleString('es-ES')} Bs.`);
    }

    const currentMonth = new Date().getMonth() + 1;
    if (![1, 3, 6, 9, 12].includes(currentMonth)) {
      throw new BadRequestException('Solo se permiten variaciones en los meses de Enero, Marzo, Junio, Septiembre y Diciembre.');
    }

    const percentage = this.calculatePercentage(
      estimatedRemuneration,
      deductionType,
      detailedDeductionsAmount || 0,
      loadCount,
      taxUnitValue
    );

    const formData = {
      tenantId,
      employmentRecordId: record.id,
      fiscalYear: Number(fiscalYear),
      month: currentMonth,
      estimatedRemuneration,
      taxUnitsValue: taxUnitValue,
      deductionType,
      detailedDeductionsAmount: deductionType === 'UNIQUE' ? 0 : detailedDeductionsAmount,
      eduDeductionAmount: deductionType === 'UNIQUE' ? 0 : eduDeductionAmount,
      hcmDeductionAmount: deductionType === 'UNIQUE' ? 0 : hcmDeductionAmount,
      medDeductionAmount: deductionType === 'UNIQUE' ? 0 : medDeductionAmount,
      housingDeductionAmount: deductionType === 'UNIQUE' ? 0 : housingDeductionAmount,
      familyLoadCount: loadCount,
      withholdingPercentage: percentage,
      isSystemGenerated: false
    };

    return this.prisma.workerAriForm.upsert({
      where: { employmentRecordId_fiscalYear_month: { employmentRecordId: record.id, fiscalYear: Number(fiscalYear), month: currentMonth } },
      update: formData,
      create: formData
    });
  }

  async generateSystemForms(tenantId: string, fiscalYear: number) {
    // Buscar todos los activos sin AR-I
    const activeRecords = await this.prisma.employmentRecord.findMany({
      where: {
        tenantId,
        isActive: true,
        workerAriForms: { none: { fiscalYear } }
      }
    });

    let generated = 0;
    const taxUnitValue = await this.getActiveTaxUnitValue(tenantId);

    for (const record of activeRecords) {
      const floor = await this.getProjectionFloor(record.id, tenantId);
      if (floor <= 0) continue;

      // Según el art. 5: Desgravamen único, deducciones en cero, NO aplican cargas familiares.
      const percentage = this.calculatePercentage(
        floor,
        'UNIQUE',
        0,
        0, // Family loads forced to 0
        taxUnitValue
      );

      await this.prisma.workerAriForm.create({
        data: {
          tenantId,
          employmentRecordId: record.id,
          fiscalYear,
          month: new Date().getMonth() + 1,
          estimatedRemuneration: floor,
          taxUnitsValue: taxUnitValue,
          deductionType: 'UNIQUE',
          detailedDeductionsAmount: 0,
          familyLoadCount: 0,
          withholdingPercentage: percentage,
          isSystemGenerated: true
        }
      });
      generated++;
    }

    return { processed: generated, message: `Se generaron ${generated} planillas De Oficio.` };
  }

  async getStatuses(tenantId: string, fiscalYear: number) {
     const records = await this.prisma.employmentRecord.findMany({
       where: { tenantId, isActive: true },
       include: {
         owner: true,
         workerAriForms: {
           where: { fiscalYear }
         }
       }
     });

     return records.map(r => ({
       workerName: `${r.owner.firstName} ${r.owner.lastName}`,
       identity: r.owner.primaryIdentityNumber,
       hasForm: r.workerAriForms.length > 0,
       isSystemGenerated: r.workerAriForms[0]?.isSystemGenerated,
       percentage: r.workerAriForms[0]?.withholdingPercentage,
       recordId: r.id,
       formData: r.workerAriForms[0] || null
     }));
  }

  async getDetailForPrinting(tenantId: string, formId: string) {
    const form = await this.prisma.workerAriForm.findFirst({
      where: { id: formId, tenantId },
      include: {
        employmentRecord: {
          include: {
            owner: true,
            worker: true
          }
        }
      }
    });

    if (!form) throw new NotFoundException('AR-I Form not found');

    return {
      tenant: {
        name: form.employmentRecord.worker.name,
        documentId: form.employmentRecord.worker.taxId || ''
      },
      worker: {
        firstName: form.employmentRecord.owner.firstName,
        lastName: form.employmentRecord.owner.lastName,
        identity: form.employmentRecord.owner.primaryIdentityNumber
      },
      form: {
        fiscalYear: form.fiscalYear,
        estimatedRemuneration: Number(form.estimatedRemuneration),
        taxUnitsValue: Number(form.taxUnitsValue),
        deductionType: form.deductionType,
        detailedDeductionsAmount: Number(form.detailedDeductionsAmount),
        familyLoadCount: form.familyLoadCount,
        withholdingPercentage: Number(form.withholdingPercentage),
        isSystemGenerated: form.isSystemGenerated,
        createdAt: form.createdAt
      }
    };
  }
}
