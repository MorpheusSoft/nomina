import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class BankTxtGeneratorService {
  constructor(private readonly prisma: PrismaService) {}

  private applyFormat(val: string | number, format: any): string {
    if (val === undefined || val === null) return '';
    const strVal = String(val);
    if (!format) return strVal;

    let formatStr = '';
    if (typeof format === 'object') {
       formatStr = format.code || format.value || format.name || String(format);
    } else {
       formatStr = String(format);
    }

    // Date formatting
    if (formatStr.includes('YYYY') || formatStr.includes('DD')) {
       try {
         const d = new Date(strVal);
         if (!isNaN(d.getTime())) {
           const dd = String(d.getUTCDate()).padStart(2, '0');
           const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
           const yyyy = d.getUTCFullYear();
           const yy = String(yyyy).slice(-2);
           
           if (formatStr === 'DDMMYYYY') return `${dd}${mm}${yyyy}`;
           if (formatStr === 'DD-MM-YYYY') return `${dd}-${mm}-${yyyy}`;
           if (formatStr === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
           if (formatStr === 'YYYYMMDD') return `${yyyy}${mm}${dd}`;
           if (formatStr === 'DDMMYY') return `${dd}${mm}${yy}`;
         }
       } catch(e) {}
    }

    // Number formatting
    if (formatStr === 'NO_DECIMALS') {
       const num = parseFloat(strVal);
       if (!isNaN(num)) return Math.round(num * 100).toString();
    }
    if (formatStr === 'DECIMALS_COMMA') {
       const num = parseFloat(strVal);
       if (!isNaN(num)) return num.toFixed(2).replace('.', ',');
    }
    if (formatStr === 'DECIMALS_DOT') {
       const num = parseFloat(strVal);
       if (!isNaN(num)) return num.toFixed(2);
    }
    
    // String modifiers
    if (formatStr === 'UPPERCASE') return strVal.toUpperCase();
    if (formatStr === 'LOWERCASE') return strVal.toLowerCase();

    return strVal;
  }

  private buildLine(configArray: any[], variables: any, separator: string = ''): string {
    if (!Array.isArray(configArray)) return '';
    const cols = [];

    for (const col of configArray) {
       let val = '';
       
       if (col.type === 'CONSTANT') {
         val = col.value || '';
       } else {
         val = variables[col.value] !== undefined && variables[col.value] !== null ? String(variables[col.value]) : '';
         // Apply format
         val = this.applyFormat(val, col.format);
       }
       
       // Handle padding and length
       const len = parseInt(col.length, 10);
       if (!isNaN(len) && len > 0) {
         // Trim if longer
         val = val.substring(0, len);
         
         // Pad
         const padChar = col.paddingChar || ' ';
         if (col.align === 'RIGHT') {
           val = val.padStart(len, padChar);
         } else {
           val = val.padEnd(len, padChar);
         }
       }
       
       cols.push(val);
    }
    return cols.join(separator);
  }

  async generateTxtFile(tenantId: string, payrollPeriodId: string, companyBankAccountId: string, templateId: string, userId: string, hasApproverRole: boolean) {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: payrollPeriodId, tenantId },
      include: { payrollReceipts: { include: { worker: { include: { bankAccounts: true } } } } }
    });

    if (!period) throw new NotFoundException('Periodo no encontrado');
    if (!['APPROVED', 'PAID', 'CLOSED'].includes(period.status)) {
      throw new BadRequestException('La nómina debe estar APROBADA o CERRADA para generar el archivo de pago bancario.');
    }

    if (period.txtGeneratedAt && !hasApproverRole) {
      throw new BadRequestException('El archivo TXT ya fue generado anteriormente. Solo un Aprobador de Nómina puede volver a generarlo.');
    }

    const template = await this.prisma.bankFileTemplate.findFirst({
      where: { id: templateId, tenantId }
    });
    if (!template) throw new NotFoundException('Plantilla bancaria no encontrada');

    const companyAccount = await this.prisma.companyBankAccount.findFirst({
      where: { id: companyBankAccountId, tenantId },
      include: { bank: true, tenant: true }
    });
    if (!companyAccount) throw new NotFoundException('Cuenta de empresa no encontrada');

    // Mapeo JSON de la estructura de 3 bloques
    const config: any = template.configJson || { detail: [] };
    const separator = config.separator || '';

    const totalWorkers = period.payrollReceipts.length;
    const totalAmount = period.payrollReceipts.reduce((sum, r) => sum + Number(r.netPay), 0);
    const currentDate = new Date().toISOString();
    const paymentDate = (period as any).paymentDate ? (period as any).paymentDate.toISOString() : period.endDate.toISOString();

    const globalVars = {
      'system.currentDate': currentDate,
      'period.paymentDate': paymentDate,
      'period.totalWorkers': totalWorkers,
      'period.totalAmount': totalAmount,
      'company.rif': companyAccount.tenant.taxId || '',
      'company.name': companyAccount.tenant.name || '',
      'company.accountNumber': companyAccount.accountNumber || '',
    };

    let txtContent = '';

    // 1. HEADER
    if (config.header && Array.isArray(config.header) && config.header.length > 0) {
      txtContent += this.buildLine(config.header, globalVars, separator) + '\n';
    }

    // 2. DETAIL
    if (config.detail && Array.isArray(config.detail) && config.detail.length > 0) {
      for (const receipt of period.payrollReceipts) {
        
        let idType = '';
        let idNumber = receipt.worker.primaryIdentityNumber || '';
        if (idNumber.match(/^[VEJPG]-/i)) {
           idType = idNumber.charAt(0).toUpperCase();
           idNumber = idNumber.substring(2);
        }

        const workerAccount = receipt.worker.bankAccounts?.find(a => a.isPrimary) || receipt.worker.bankAccounts?.[0];
        
        const workerVars = {
          ...globalVars,
          'worker.idType': idType,
          'worker.idNumber': idNumber,
          'worker.fullName': `${receipt.worker.firstName} ${receipt.worker.lastName}`.trim(),
          'worker.bankAccount': workerAccount ? workerAccount.accountNumber : (receipt.worker.bankAccountNumber || ''),
          'receipt.netPay': Number(receipt.netPay)
        };

        txtContent += this.buildLine(config.detail, workerVars, separator) + '\n';
      }
    }

    // 3. FOOTER
    if (config.footer && Array.isArray(config.footer) && config.footer.length > 0) {
      txtContent += this.buildLine(config.footer, globalVars, separator) + '\n';
    }

    // Remover salto de línea final
    if (txtContent.endsWith('\n')) {
      txtContent = txtContent.slice(0, -1);
    }

    // Registrar auditoría en el periodo
    await this.prisma.payrollPeriod.update({
      where: { id: payrollPeriodId },
      data: {
        txtGeneratedAt: new Date(),
        txtGeneratedBy: userId
      }
    });

    return txtContent;
  }
}
