import { Controller, Get, Query, UseGuards, BadRequestException, Param, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ReportsService } from './reports.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private prisma: PrismaService,
    private readonly reportsService: ReportsService
  ) {}

  @Get('concepts-distribution')
  async getConceptsDistribution(
    @CurrentUser() user: any,
    @Query('startDate') startDateString: string,
    @Query('endDate') endDateString: string,
    @Query('currencyView') currencyView: string = 'VES',
    @Query('consolidated') consolidated: string = 'false',
    @Query('conceptIds') conceptIdsString?: string
  ) {
    if (!startDateString || !endDateString) {
      throw new BadRequestException('Fechas requeridas');
    }

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    const isConsolidated = consolidated === 'true';
    const conceptIds = conceptIdsString ? conceptIdsString.split(',') : [];

    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');

    const filters: any = {
      payrollReceipt: {
        payrollPeriod: {
          tenantId: user.tenantId,
          status: { in: ['PRE_CALCULATED', 'PENDING_APPROVAL', 'APPROVED', 'CLOSED', 'FINAL'] },
          endDate: { gte: startDate, lte: endDate }
        },
        ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } })
      }
    };

    if (conceptIds.length > 0) {
      filters.conceptId = { in: conceptIds };
    }

    const details = await this.prisma.payrollReceiptDetail.findMany({
      where: filters,
      include: {
        payrollReceipt: {
          include: {
            payrollPeriod: true,
            worker: true
          }
        },
        concept: true
      }
    });

    const reportData: any[] = [];

    for (const d of details) {
      const periodCurrency = d.payrollReceipt.payrollPeriod.currency || 'VES';
      const exchangeRate = d.payrollReceipt.payrollPeriod.exchangeRate ? Number(d.payrollReceipt.payrollPeriod.exchangeRate) : 1;
      let rawAmount = Number(d.amount);
      
      let convertedAmount = rawAmount;
      if (periodCurrency === 'USD' && currencyView === 'VES') {
         convertedAmount = rawAmount * exchangeRate;
      } else if (periodCurrency === 'VES' && currencyView === 'USD') {
         convertedAmount = rawAmount / exchangeRate;
      }

      if (isConsolidated) {
        // En consolidado, sumamos por fecha de nómina y código de concepto
        const existing = reportData.find(x => x.periodName === d.payrollReceipt.payrollPeriod.name && x.conceptCode === d.concept.code);
        if (existing) {
           existing.amount += convertedAmount;
        } else {
           reportData.push({
             periodName: d.payrollReceipt.payrollPeriod.name,
             periodDate: d.payrollReceipt.payrollPeriod.endDate,
             conceptCode: d.concept.code,
             conceptName: d.conceptNameSnapshot,
             amount: convertedAmount,
             currency: currencyView,
             type: d.typeSnapshot
           });
        }
      } else {
        // Detallado por trabajador
        reportData.push({
           workerRef: `${d.payrollReceipt.worker.primaryIdentityNumber} - ${d.payrollReceipt.worker.firstName} ${d.payrollReceipt.worker.lastName}`,
           periodName: d.payrollReceipt.payrollPeriod.name,
           periodDate: d.payrollReceipt.payrollPeriod.endDate,
           conceptCode: d.concept.code,
           conceptName: d.conceptNameSnapshot,
           amount: convertedAmount,
           currency: currencyView,
           type: d.typeSnapshot
        });
      }
    }

    return reportData;
  }

  @Get('loans-account')
  async getLoansAccount(
    @CurrentUser() user: any,
    @Query('viewType') viewType: string = 'SUMMARIZED',
    @Query('currencyView') currencyView: string = 'VES',
    @Query('exchangeRate') exchangeRateString: string = '1'
  ) {
    const currentGlobalExchangeRate = Number(exchangeRateString) || 1;

    const canViewConfidential = user.permissions?.includes('ALL_ACCESS') || user.permissions?.includes('CONFIDENTIAL_VIEW');

    // 1. Obtener préstamos activos e inactivos del Tenant
    const loans = await this.prisma.workerLoan.findMany({
      where: { 
        tenantId: user.tenantId,
        ...(canViewConfidential ? {} : { worker: { employmentRecords: { none: { isConfidential: true } } } })
      },
      include: {
        worker: {
          include: {
            employmentRecords: {
              where: { isActive: true },
              include: { department: true, payrollGroup: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const reportData: any[] = [];
    
    // Optimización: Extraer los ID de conceptos que mapean amortizaciones de préstamos en el tenant
    const loanConceptIds = new Set<string>();
    loans.forEach(l => {
      const contract = l.worker.employmentRecords[0];
      if (contract?.payrollGroup?.loanDeductionConceptId) {
         loanConceptIds.add(contract.payrollGroup.loanDeductionConceptId);
      }
    });

    // 2. Traer el histórico de deducciones SIEMPRE para cuadrar los pagos contra la deuda viva
    let historicalDeductions: any[] = [];
    if (loanConceptIds.size > 0) {
      historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
        where: {
          conceptId: { in: Array.from(loanConceptIds) },
          payrollReceipt: {
            payrollPeriod: { tenantId: user.tenantId, status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
          }
        },
        include: {
          payrollReceipt: {
            include: { payrollPeriod: true }
          }
        },
        orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
      });
    }

    // 3. Procesar resultados aplicando la norma de moneda del usuario
    for (const loan of loans) {
      const contract = loan.worker.employmentRecords[0];
      const depName = contract?.department?.name || 'Sin Departamento';
      const loanCurrency = loan.currency || 'VES';
      
      // (Ignoramos el saldo db.outstandingBalance porque es engañoso inflacionariamente, 
      //  en vez de eso, lo derivaremos matemáticamente de las amortizaciones históricas).
      // Agrupar amortizaciones para este préstamo
      const amortizations = [];
      let totalPaidAtHistoricalRates = 0;

      // Filtrar deducciones de ESTE trabajador
      const myDeds = historicalDeductions.filter(d => d.payrollReceipt.workerId === loan.workerId);
      
      for (const ded of myDeds) {
        const period = ded.payrollReceipt.payrollPeriod;
        const periodCurrency = period.currency || 'VES';
        const histExchangeRate = Number(period.exchangeRate) || 1;
        
        let amortAmount = Number(ded.amount);
        
        // REGLA: "los montos deducciones hechas se calculan a la tasa de la misma nomina"
        if (periodCurrency === 'USD' && currencyView === 'VES') {
            amortAmount *= histExchangeRate;
        } else if (periodCurrency === 'VES' && currencyView === 'USD') {
            amortAmount /= histExchangeRate;
        }

        totalPaidAtHistoricalRates += amortAmount;

        if (viewType === 'DETAILED') {
          amortizations.push({
              id: ded.id,
              periodName: period.name,
              periodDate: period.endDate,
              amount: amortAmount,
              historicalRate: histExchangeRate
          });
        }
      }

      // Matemáticamente redefinir el "Saldo" apoyándonos en el Histórico real pagado para evitar
      // la distorsión inflacionaria.
      // Total Prestado se calcula a la Tasa de Hoy
      let totalAmountConverted = Number(loan.totalAmount);
      if (loanCurrency === 'USD' && currencyView === 'VES') {
         totalAmountConverted *= currentGlobalExchangeRate;
      } else if (loanCurrency === 'VES' && currencyView === 'USD') {
         totalAmountConverted /= currentGlobalExchangeRate;
      }
      
      // Saldo Vivo = Total Prestado (a la tasa de visualización actual) - Lo que ya pagó (tasas históricas)
      const balanceConverted = totalAmountConverted - totalPaidAtHistoricalRates;

      reportData.push({
         workerId: loan.workerId,
         workerName: `${loan.worker.firstName} ${loan.worker.lastName}`,
         identityNumber: loan.worker.primaryIdentityNumber,
         departmentName: depName,
         loanId: loan.id,
         status: loan.status,
         issueDate: loan.createdAt,
         originalCurrency: loan.currency,
         totalAmount: totalAmountConverted,
         balance: balanceConverted < 0 ? 0 : balanceConverted,
         amortizations
      });
    }

    return reportData;
  }

  @Get('worker-arc/:workerId')
  async getWorkerARC(
    @CurrentUser() user: any,
    @Query('year') yearString: string,
    @Param('workerId') workerId: string
  ) {
    if (!yearString) throw new BadRequestException('El año es requerido (year)');
    const year = parseInt(yearString, 10);
    return this.reportsService.getWorkerARC(user.tenantId, workerId, year);
  }

  @Get('islr-xml')
  async getISLRXml(
    @CurrentUser() user: any,
    @Query('month') monthString: string,
    @Query('year') yearString: string,
    @Res() res: any
  ) {
    if (!monthString || !yearString) throw new BadRequestException('Se requiere month y year');
    const month = parseInt(monthString, 10);
    const year = parseInt(yearString, 10);

    const xml = await this.reportsService.generateISLRXml(user.tenantId, month, year);

    res.set({
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="ISLR_${year}_${month.toString().padStart(2, '0')}.xml"`,
    });
    res.send(xml);
  }
}

