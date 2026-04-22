import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class AccountingJournalsService {
    private prisma;
    constructor(prisma: PrismaService);
    generateFromPayrollPeriod(tenantId: string, payrollPeriodId: string): Promise<{
        payrollPeriod: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            status: string;
            payrollGroupId: string;
            costCenterId: string | null;
            type: string;
            currency: string;
            exchangeRate: Prisma.Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            accountingCode: string;
            costCenterCode: string | null;
            debitAmount: Prisma.Decimal;
            creditAmount: Prisma.Decimal;
            journalId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        payrollPeriodId: string;
        date: Date;
        totalDebit: Prisma.Decimal;
        totalCredit: Prisma.Decimal;
    }>;
    findAll(tenantId: string): Promise<({
        payrollPeriod: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            status: string;
            payrollGroupId: string;
            costCenterId: string | null;
            type: string;
            currency: string;
            exchangeRate: Prisma.Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        payrollPeriodId: string;
        date: Date;
        totalDebit: Prisma.Decimal;
        totalCredit: Prisma.Decimal;
    })[]>;
    findOne(tenantId: string, id: string): Promise<({
        payrollPeriod: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            status: string;
            payrollGroupId: string;
            costCenterId: string | null;
            type: string;
            currency: string;
            exchangeRate: Prisma.Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
        lines: {
            id: string;
            createdAt: Date;
            description: string | null;
            accountingCode: string;
            costCenterCode: string | null;
            debitAmount: Prisma.Decimal;
            creditAmount: Prisma.Decimal;
            journalId: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        payrollPeriodId: string;
        date: Date;
        totalDebit: Prisma.Decimal;
        totalCredit: Prisma.Decimal;
    }) | null>;
    exportCsv(tenantId: string, id: string): Promise<string>;
}
