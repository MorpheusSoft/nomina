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
exports.DocumentTemplatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const numero_a_letras_1 = require("./numero-a-letras");
let DocumentTemplatesService = class DocumentTemplatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(tenantId, data) {
        const { tenantId: _, ...cleanData } = data;
        return this.prisma.documentTemplate.create({
            data: {
                ...cleanData,
                tenant: { connect: { id: tenantId } },
            },
        });
    }
    async findAll(tenantId) {
        return this.prisma.documentTemplate.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(tenantId, id) {
        const template = await this.prisma.documentTemplate.findFirst({
            where: { id, tenantId },
        });
        if (!template)
            throw new common_1.NotFoundException('Template not found');
        return template;
    }
    async update(tenantId, id, data) {
        const { tenantId: _, ...cleanData } = data;
        return this.prisma.documentTemplate.updateMany({
            where: { id, tenantId },
            data: cleanData,
        });
    }
    async remove(tenantId, id) {
        return this.prisma.documentTemplate.deleteMany({
            where: { id, tenantId },
        });
    }
    async compile(tenantId, templateId, workerId) {
        const template = await this.findOne(tenantId, templateId);
        const worker = await this.prisma.worker.findFirst({
            where: { id: workerId, tenantId },
            include: {
                employmentRecords: {
                    where: { isActive: true },
                    include: {
                        costCenter: true,
                        department: true,
                        crew: true,
                        payrollGroup: true,
                        salaryHistories: { orderBy: { validFrom: 'desc' }, take: 1 }
                    }
                }
            }
        });
        if (!worker)
            throw new common_1.NotFoundException('Worker not found');
        const activeContract = worker.employmentRecords[0];
        const currentSalary = activeContract?.salaryHistories[0]?.amount?.toNumber() || 0;
        const currency = activeContract?.salaryHistories[0]?.currency || 'VES';
        const bcvVar = await this.prisma.globalVariable.findFirst({
            where: { tenantId, code: 'TASA_BCV' },
            orderBy: { validFrom: 'desc' },
        });
        const tasa = bcvVar?.value ? Number(bcvVar.value) : 1;
        let currentSalaryBs = currentSalary;
        if (currency === 'USD') {
            currentSalaryBs = currentSalary * tasa;
        }
        const dictionary = {
            'trabajador.nombres': worker.firstName,
            'trabajador.apellidos': worker.lastName,
            'trabajador.nombreCompleto': `${worker.firstName} ${worker.lastName}`,
            'trabajador.documento': worker.primaryIdentityNumber,
            'trabajador.nacionalidad': worker.nationality,
            'trabajador.estadoCivil': worker.maritalStatus,
            'trabajador.genero': worker.gender,
            'trabajador.telefono': worker.phone || 'N/A',
            'trabajador.correo': worker.email || 'N/A',
            'trabajador.banco.nombre': worker.bankName || 'No asignado',
            'trabajador.banco.tipo': worker.bankAccountType || 'No asignado',
            'trabajador.banco.cuenta': worker.bankAccountNumber || 'No asignado',
            'contrato.cargo': activeContract?.position || 'N/A',
            'contrato.fechaInicio': activeContract?.startDate ? new Date(activeContract.startDate).toLocaleDateString('es-ES') : 'N/A',
            'contrato.tipo': activeContract?.contractType || 'N/A',
            'contrato.salarioBase': `${currentSalary.toFixed(2)} ${currency}`,
            'contrato.salarioBaseBs': `${currentSalaryBs.toFixed(2)} VES`,
            'contrato.salarioBaseLetras': (0, numero_a_letras_1.numeroALetras)(currentSalary, currency),
            'contrato.salarioBaseBsLetras': (0, numero_a_letras_1.numeroALetras)(currentSalaryBs, 'VES'),
            'contrato.centroCosto': activeContract?.costCenter?.name || 'N/A',
            'contrato.departamento': activeContract?.department?.name || 'N/A',
            'empresa.fechaActual': new Date().toLocaleDateString('es-ES'),
            'empresa.fechaActualLarga': `${new Date().getDate()} de ${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][new Date().getMonth()]} del ${new Date().getFullYear()}`,
        };
        let compiledHtml = template.contentHtml;
        for (const [key, value] of Object.entries(dictionary)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            compiledHtml = compiledHtml.replace(regex, value);
        }
        compiledHtml = `
      <style>
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        .ql-indent-1 { padding-left: 3em; }
        .ql-indent-2 { padding-left: 6em; }
        .ql-indent-3 { padding-left: 9em; }
        .ql-size-small { font-size: 0.8em; }
        .ql-size-large { font-size: 1.5em; }
        .ql-size-huge { font-size: 2.5em; }
      </style>
      <div class="ql-editor">${compiledHtml}</div>
    `;
        return { compiledHtml };
    }
};
exports.DocumentTemplatesService = DocumentTemplatesService;
exports.DocumentTemplatesService = DocumentTemplatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentTemplatesService);
//# sourceMappingURL=document-templates.service.js.map