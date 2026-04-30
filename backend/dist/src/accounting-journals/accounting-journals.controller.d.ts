import { AccountingJournalsService } from './accounting-journals.service';
import type { Request, Response } from 'express';
export declare class AccountingJournalsController {
    private readonly journalsService;
    constructor(journalsService: AccountingJournalsService);
    generate(req: Request, periodId: string): Promise<{
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
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
        lines: {
            id: string;
            createdAt: Date;
            accountingCode: string;
            description: string | null;
            costCenterCode: string | null;
            debitAmount: import("@prisma/client/runtime/library").Decimal;
            creditAmount: import("@prisma/client/runtime/library").Decimal;
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
        totalDebit: import("@prisma/client/runtime/library").Decimal;
        totalCredit: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(req: Request): Promise<({
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
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
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
        totalDebit: import("@prisma/client/runtime/library").Decimal;
        totalCredit: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(req: Request, id: string): Promise<({
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
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
        lines: {
            id: string;
            createdAt: Date;
            accountingCode: string;
            description: string | null;
            costCenterCode: string | null;
            debitAmount: import("@prisma/client/runtime/library").Decimal;
            creditAmount: import("@prisma/client/runtime/library").Decimal;
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
        totalDebit: import("@prisma/client/runtime/library").Decimal;
        totalCredit: import("@prisma/client/runtime/library").Decimal;
    }) | null>;
    exportCsv(req: Request, id: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
