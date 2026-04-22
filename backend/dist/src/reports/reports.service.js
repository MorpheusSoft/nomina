"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWorkerARC(tenantId, workerId, year) {
        const worker = await this.prisma.worker.findFirst({
            where: { id: workerId, tenantId },
            include: {
                employmentRecords: {
                    include: { payrollGroup: true }
                }
            }
        });
        if (!worker)
            throw new common_1.NotFoundException('Trabajador no encontrado');
        const islrConceptIds = new Set();
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
                if (detail.concept.isTaxable) {
                    monthlyData[month].base += Number(detail.amount);
                    totalBase += Number(detail.amount);
                }
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
    async generateISLRXml(tenantId, month, year) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant)
            throw new common_1.NotFoundException('Tenant no encontrado');
        if (!tenant.taxId)
            throw new common_1.BadRequestException('La empresa (Tenant) no tiene RIF configurado (taxId)');
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
        const workersData = new Map();
        receipts.forEach(receipt => {
            const workerRif = receipt.worker.primaryIdentityNumber;
            if (!workersData.has(workerRif)) {
                workersData.set(workerRif, { rif: workerRif, base: 0, retained: 0, rate: 0 });
            }
            const wData = workersData.get(workerRif);
            const islrConceptIds = new Set();
            receipt.worker.employmentRecords.forEach(er => {
                if (er.payrollGroup?.islrConceptId)
                    islrConceptIds.add(er.payrollGroup.islrConceptId);
            });
            receipt.details.forEach(detail => {
                if (detail.concept.isTaxable) {
                    wData.base += Number(detail.amount);
                }
                if (islrConceptIds.has(detail.conceptId)) {
                    wData.retained += Number(detail.amount);
                    wData.rate = detail.rate ? Number(detail.rate) : 0;
                }
            });
        });
        const periodoStr = `${year}${String(month).padStart(2, '0')}`;
        let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
        xml += `<RelacionRetencionesISLR RifAgente="${tenant.taxId}" Periodo="${periodoStr}">\n`;
        for (const [rif, data] of workersData.entries()) {
            if (data.retained <= 0)
                continue;
            const cleanRif = rif.replace(/[^A-Z0-9]/ig, '').toUpperCase();
            const porc = data.rate > 0 ? data.rate : ((data.retained / data.base) * 100);
            xml += `  <DetalleRetencion>\n`;
            xml += `    <RifRetenido>${cleanRif}</RifRetenido>\n`;
            xml += `    <NumeroFactura>${periodoStr}001</NumeroFactura>\n`;
            xml += `    <NumeroControl>${periodoStr}001</NumeroControl>\n`;
            xml += `    <FechaOperacion>28/${String(month).padStart(2, '0')}/${year}</FechaOperacion>\n`;
            xml += `    <CodigoConcepto>001</CodigoConcepto>\n`;
            xml += `    <MontoOperacion>${data.base.toFixed(2)}</MontoOperacion>\n`;
            xml += `    <PorcentajeRetencion>${porc.toFixed(2)}</PorcentajeRetencion>\n`;
            xml += `    <MontoRetenido>${data.retained.toFixed(2)}</MontoRetenido>\n`;
            xml += `  </DetalleRetencion>\n`;
        }
        xml += `</RelacionRetencionesISLR>`;
        return xml;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map