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
exports.PortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const document_templates_service_1 = require("../document-templates/document-templates.service");
let PortalService = class PortalService {
    prisma;
    documentTemplatesService;
    constructor(prisma, documentTemplatesService) {
        this.prisma = prisma;
        this.documentTemplatesService = documentTemplatesService;
    }
    async login(identityNumber, birthDate) {
        const cleanId = identityNumber.replace(/[\s-.]/g, '').toUpperCase();
        const worker = await this.prisma.worker.findFirst({
            where: {
                OR: [
                    { primaryIdentityNumber: identityNumber },
                    { primaryIdentityNumber: cleanId },
                    { primaryIdentityNumber: cleanId.replace(/^([A-Z])(\d+)/, '$1-$2') }
                ]
            },
            include: { tenant: true }
        });
        if (!worker)
            throw new common_1.UnauthorizedException('Trabajador no encontrado');
        if (!worker.tenant.hasWorkerPortalAccess) {
            throw new common_1.ForbiddenException('Su empresa no cuenta con este servicio habilitado. Contacte a Recursos Humanos.');
        }
        if (!worker.tenant.isActive || (worker.tenant.serviceEndDate && new Date(worker.tenant.serviceEndDate).getTime() < Date.now())) {
            throw new common_1.ForbiddenException('Su empresa presenta suspensión de los servicios corporativos en línea.');
        }
        const expectedDate = new Date(worker.birthDate).toISOString().split('T')[0];
        const inputDate = new Date(birthDate).toISOString().split('T')[0];
        if (expectedDate !== inputDate) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        return {
            success: true,
            workerId: worker.id,
            firstName: worker.firstName,
            lastName: worker.lastName,
            tenantId: worker.tenantId
        };
    }
    async getReceipts(workerId) {
        return this.prisma.payrollReceipt.findMany({
            where: {
                workerId,
                payrollPeriod: { status: { in: ['APPROVED', 'PAID', 'CLOSED'] } }
            },
            include: {
                payrollPeriod: { select: { name: true, startDate: true, endDate: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getReceiptByToken(token) {
        const receipt = await this.prisma.payrollReceipt.findFirst({
            where: {
                OR: [
                    { signatureToken: token },
                    { id: token }
                ]
            },
            include: {
                worker: {
                    include: {
                        employmentRecords: { where: { isActive: true }, include: { department: true } },
                        bankAccounts: true,
                        tenant: true
                    }
                },
                payrollPeriod: true,
                details: { include: { concept: true } }
            }
        });
        if (!receipt)
            throw new common_1.NotFoundException('Recibo no encontrado o inválido');
        if (!['APPROVED', 'PAID', 'CLOSED'].includes(receipt.payrollPeriod.status)) {
            throw new common_1.ForbiddenException('El recibo de pago aún no está aprobado para su visualización oficial.');
        }
        if (!receipt.viewedAt) {
            await this.prisma.payrollReceipt.update({
                where: { id: receipt.id },
                data: { viewedAt: new Date() }
            });
        }
        return receipt;
    }
    async signReceipt(id, ipAddress) {
        const receipt = await this.prisma.payrollReceipt.findUnique({ where: { id } });
        if (!receipt)
            throw new common_1.NotFoundException('Recibo no encontrado');
        if (receipt.signatureIp) {
            return { success: true, message: 'Recibo ya estaba firmado' };
        }
        await this.prisma.payrollReceipt.update({
            where: { id },
            data: { signatureIp: ipAddress }
        });
        return { success: true, message: 'Firma electrónica registrada con éxito' };
    }
    async getSelfServiceDocuments() {
        return [];
    }
    async getSelfServiceDocumentsByWorker(workerId) {
        const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker)
            throw new common_1.NotFoundException('Trabajador no encontrado');
        return this.prisma.documentTemplate.findMany({
            where: { tenantId: worker.tenantId, isSelfService: true },
            orderBy: { name: 'asc' }
        });
    }
    async compileSelfServiceDocument(templateId, workerId) {
        const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker)
            throw new common_1.NotFoundException('Trabajador no encontrado');
        const template = await this.prisma.documentTemplate.findUnique({ where: { id: templateId } });
        if (!template || !template.isSelfService)
            throw new common_1.UnauthorizedException('Plantilla no disponible para autogestión');
        return this.documentTemplatesService.compile(worker.tenantId, templateId, workerId);
    }
    async getTickets(workerId) {
        return this.prisma.workerTicket.findMany({
            where: { workerId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                type: true,
                title: true,
                description: true,
                status: true,
                createdAt: true,
                jsonMetadata: true,
                hrNotes: true
            }
        });
    }
    async createTicket(workerId, data) {
        const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker)
            throw new common_1.NotFoundException('Trabajador no encontrado');
        return this.prisma.workerTicket.create({
            data: {
                workerId: worker.id,
                tenantId: worker.tenantId,
                type: data.type,
                title: data.title,
                description: data.description,
                jsonMetadata: data.jsonMetadata || {},
                status: 'PENDING'
            }
        });
    }
    async addTicketComment(workerId, ticketId, commentText) {
        const worker = await this.prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker)
            throw new common_1.NotFoundException('Trabajador no encontrado');
        const ticket = await this.prisma.workerTicket.findUnique({ where: { id: ticketId, workerId } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        const metadata = ticket.jsonMetadata || {};
        if (!metadata.comments)
            metadata.comments = [];
        metadata.comments.push({
            id: Date.now() + '-' + Math.round(Math.random() * 1e9),
            text: commentText,
            authorType: 'WORKER',
            authorName: `${worker.firstName} ${worker.lastName}`,
            createdAt: new Date().toISOString()
        });
        return this.prisma.workerTicket.update({
            where: { id: ticket.id },
            data: { jsonMetadata: metadata }
        });
    }
    async getLoansAccount(workerId, currencyView, exchangeRateString) {
        const currentGlobalExchangeRate = Number(exchangeRateString) || 1;
        const loans = await this.prisma.workerLoan.findMany({
            where: { workerId },
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
        if (loans.length === 0)
            return [];
        const loanConceptIds = new Set();
        loans.forEach(l => {
            const contract = l.worker.employmentRecords[0];
            if (contract?.payrollGroup?.loanDeductionConceptId) {
                loanConceptIds.add(contract.payrollGroup.loanDeductionConceptId);
            }
        });
        let historicalDeductions = [];
        if (loanConceptIds.size > 0) {
            historicalDeductions = await this.prisma.payrollReceiptDetail.findMany({
                where: {
                    conceptId: { in: Array.from(loanConceptIds) },
                    payrollReceipt: {
                        workerId,
                        payrollPeriod: { status: { in: ['CLOSED', 'APPROVED', 'FINAL'] } }
                    }
                },
                include: {
                    payrollReceipt: { include: { payrollPeriod: true } }
                },
                orderBy: { payrollReceipt: { payrollPeriod: { endDate: 'desc' } } }
            });
        }
        const reportData = [];
        for (const loan of loans) {
            const contract = loan.worker.employmentRecords[0];
            const loanCurrency = loan.currency || 'VES';
            let totalAmountConverted = Number(loan.totalAmount);
            if (loanCurrency === 'USD' && currencyView === 'VES') {
                totalAmountConverted *= currentGlobalExchangeRate;
            }
            else if (loanCurrency === 'VES' && currencyView === 'USD') {
                totalAmountConverted /= currentGlobalExchangeRate;
            }
            const amortizations = [];
            let totalPaidAtHistoricalRates = 0;
            for (const ded of historicalDeductions.filter(d => d.payrollReceipt.workerId === loan.workerId)) {
                const period = ded.payrollReceipt.payrollPeriod;
                const periodCurrency = period.currency || 'VES';
                const histExchangeRate = Number(period.exchangeRate) || 1;
                let amortAmount = Number(ded.amount);
                if (periodCurrency === 'USD' && currencyView === 'VES') {
                    amortAmount *= histExchangeRate;
                }
                else if (periodCurrency === 'VES' && currencyView === 'USD') {
                    amortAmount /= histExchangeRate;
                }
                totalPaidAtHistoricalRates += amortAmount;
                amortizations.push({
                    id: ded.id,
                    periodName: period.name,
                    periodDate: period.endDate,
                    amount: amortAmount,
                    historicalRate: histExchangeRate
                });
            }
            const balanceConverted = totalAmountConverted - totalPaidAtHistoricalRates;
            reportData.push({
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
};
exports.PortalService = PortalService;
exports.PortalService = PortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        document_templates_service_1.DocumentTemplatesService])
], PortalService);
//# sourceMappingURL=portal.service.js.map