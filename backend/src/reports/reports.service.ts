import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWorkerARC(tenantId: string, workerId: string, year: number) {
    const worker = await this.prisma.worker.findFirst({
      where: { id: workerId, tenantId },
      include: {
        employmentRecords: {
          include: { payrollGroup: true }
        }
      }
    });

    if (!worker) throw new NotFoundException('Trabajador no encontrado');

    // Mapear los posibles ISLR concepts atados a sus contratos
    const islrConceptIds = new Set<string>();
    worker.employmentRecords.forEach(er => {
      if (er.payrollGroup?.islrConceptId) {
        islrConceptIds.add(er.payrollGroup.islrConceptId);
      }
    });

    const receipts = await this.prisma.payrollReceipt.findMany({
      where: {
        workerId,
        payrollPeriod: {
          tenantId,
          endDate: {
            gte: new Date(`${year}-01-01T00:00:00.000Z`),
            lte: new Date(`${year}-12-31T23:59:59.999Z`)
          },
          status: { in: ['APPROVED', 'CLOSED', 'FINAL'] }
        }
      },
      include: {
        payrollPeriod: true,
        details: {
          include: { concept: true }
        }
      },
      orderBy: { payrollPeriod: { endDate: 'asc' } }
    });

    let totalBase = 0;
    let totalRetained = 0;
    const monthlyData = new Array(12).fill(0).map(() => ({ base: 0, retained: 0 }));

    receipts.forEach(receipt => {
      const month = receipt.payrollPeriod.endDate.getUTCMonth();
      
      receipt.details.forEach(detail => {
        // Base: si el concepto está marcado como isTaxable = true
        if (detail.concept.isTaxable) {
          monthlyData[month].base += Number(detail.amount);
          totalBase += Number(detail.amount);
        }
        
        // Retención: si el conceptId forma parte de su payrollGroup.islrConceptId
        if (islrConceptIds.has(detail.conceptId)) {
          monthlyData[month].retained += Number(detail.amount);
          totalRetained += Number(detail.amount);
        }
      });
    });

    return {
      worker: {
        name: `${worker.firstName} ${worker.lastName}`,
        identity: worker.primaryIdentityNumber,
      },
      year,
      totalBase,
      totalRetained,
      monthlyData
    };
  }

  async generateISLRXml(tenantId: string, month: number, year: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant no encontrado');
    
    if (!tenant.taxId) throw new BadRequestException('La empresa (Tenant) no tiene RIF configurado (taxId)');

    // Fechas límites del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const receipts = await this.prisma.payrollReceipt.findMany({
      where: {
        payrollPeriod: {
          tenantId,
          endDate: { gte: startDate, lte: endDate },
          status: { in: ['APPROVED', 'CLOSED', 'FINAL'] }
        }
      },
      include: {
        worker: { include: { employmentRecords: { include: { payrollGroup: true } } } },
        payrollPeriod: true,
        details: { include: { concept: true } }
      }
    });

    // Agrupamos la retención y la base por trabajador
    const workersData = new Map<string, {
      rif: string;
      base: number;
      retained: number;
      rate: number;
    }>();

    receipts.forEach(receipt => {
      const workerRif = receipt.worker.primaryIdentityNumber;
      if (!workersData.has(workerRif)) {
        workersData.set(workerRif, { rif: workerRif, base: 0, retained: 0, rate: 0 });
      }

      const wData = workersData.get(workerRif)!;
      
      // Determine islrConceptIds for this specific worker in this receipt
      // We look at the contract active for that period. Let's just gather all from their employmentRecords.
      const islrConceptIds = new Set<string>();
      receipt.worker.employmentRecords.forEach(er => {
        if (er.payrollGroup?.islrConceptId) islrConceptIds.add(er.payrollGroup.islrConceptId);
      });

      receipt.details.forEach(detail => {
        if (detail.concept.isTaxable) {
          wData.base += Number(detail.amount);
        }
        if (islrConceptIds.has(detail.conceptId)) {
          wData.retained += Number(detail.amount);
          wData.rate = detail.rate ? Number(detail.rate) : 0; // The last calculated rate for ARI
        }
      });
    });

    const periodoStr = `${year}${String(month).padStart(2, '0')}`;
    let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
    xml += `<RelacionRetencionesISLR RifAgente="${tenant.taxId}" Periodo="${periodoStr}">\n`;

    for (const [rif, data] of workersData.entries()) {
      if (data.retained <= 0) continue; // Solo declarar si hubo retención real

      // Validamos el formato de RIF V12345678 (quitar guiones si los hay)
      const cleanRif = rif.replace(/[^A-Z0-9]/ig, '').toUpperCase();
      const porc = data.rate > 0 ? data.rate : ((data.retained / data.base) * 100);

      xml += `  <DetalleRetencion>\n`;
      xml += `    <RifRetenido>${cleanRif}</RifRetenido>\n`;
      xml += `    <NumeroFactura>${periodoStr}001</NumeroFactura>\n`; // Número de recibo/comprobante sugerido
      xml += `    <NumeroControl>${periodoStr}001</NumeroControl>\n`;
      xml += `    <FechaOperacion>28/${String(month).padStart(2, '0')}/${year}</FechaOperacion>\n`; // Se asume fin de mes
      xml += `    <CodigoConcepto>001</CodigoConcepto>\n`; // Sueldos y salarios
      xml += `    <MontoOperacion>${data.base.toFixed(2)}</MontoOperacion>\n`;
      xml += `    <PorcentajeRetencion>${porc.toFixed(2)}</PorcentajeRetencion>\n`;
      xml += `    <MontoRetenido>${data.retained.toFixed(2)}</MontoRetenido>\n`;
      xml += `  </DetalleRetencion>\n`;
    }

    xml += `</RelacionRetencionesISLR>`;

    return xml;
  }
}
