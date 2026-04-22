import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

import { numeroALetras } from './numero-a-letras';

@Injectable()
export class DocumentTemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: Prisma.DocumentTemplateCreateInput) {
    const { tenantId: _, ...cleanData } = data as any;
    return this.prisma.documentTemplate.create({
      data: {
        ...cleanData,
        tenant: { connect: { id: tenantId } },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.documentTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
    });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async update(tenantId: string, id: string, data: Prisma.DocumentTemplateUpdateInput) {
    const { tenantId: _, ...cleanData } = data as any;
    return this.prisma.documentTemplate.updateMany({
      where: { id, tenantId },
      data: cleanData,
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.documentTemplate.deleteMany({
      where: { id, tenantId },
    });
  }

  // Compiler logic
  async compile(tenantId: string, templateId: string, workerId: string) {
    const template = await this.findOne(tenantId, templateId);
    
    // Fetch all worker data to compile
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

    if (!worker) throw new NotFoundException('Worker not found');

    const activeContract = worker.employmentRecords[0];
    const currentSalary = activeContract?.salaryHistories[0]?.amount?.toNumber() || 0;
    const currency = activeContract?.salaryHistories[0]?.currency || 'VES';

    // BCV Rate conversion
    const bcvVar = await this.prisma.globalVariable.findFirst({
      where: { tenantId, code: 'TASA_BCV' },
      orderBy: { validFrom: 'desc' },
    });
    
    const tasa = bcvVar?.value ? Number(bcvVar.value) : 1;
    let currentSalaryBs = currentSalary;
    
    if (currency === 'USD') {
      currentSalaryBs = currentSalary * tasa;
    }

    // Dictionary mappings matching what the user sees in frontend
    const dictionary: Record<string, string> = {
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
      'contrato.salarioBaseLetras': numeroALetras(currentSalary, currency as 'USD' | 'VES'),
      'contrato.salarioBaseBsLetras': numeroALetras(currentSalaryBs, 'VES'),
      'contrato.centroCosto': activeContract?.costCenter?.name || 'N/A',
      'contrato.departamento': activeContract?.department?.name || 'N/A',
      
      'empresa.fechaActual': new Date().toLocaleDateString('es-ES'),
      'empresa.fechaActualLarga': `${new Date().getDate()} de ${['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][new Date().getMonth()]} del ${new Date().getFullYear()}`,
    };

    let compiledHtml = template.contentHtml;
    
    // Replace all occurrences of {{key}}
    for (const [key, value] of Object.entries(dictionary)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      compiledHtml = compiledHtml.replace(regex, value as string);
    }

    // Aseguramos que la renderización del PDF herede las clases de alineación del editor Quill
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
}
