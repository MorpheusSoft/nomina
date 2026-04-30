import { PayrollEngineService } from './payroll-engine.service';
export declare class PayrollEngineController {
    private readonly payrollEngineService;
    constructor(payrollEngineService: PayrollEngineService);
    calculatePeriod(periodId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    calculateWorker(periodId: string, workerId: string): Promise<{
        success: boolean;
        count: number;
    }>;
    getReceipts(periodId: string, user: any): Promise<({
        details: ({
            concept: {
                code: string;
            };
        } & {
            id: string;
            payrollReceiptId: string;
            conceptId: string;
            conceptNameSnapshot: string;
            typeSnapshot: string;
            factor: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
        })[];
        worker: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tenantId: string;
            primaryIdentityNumber: string;
            firstName: string;
            lastName: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            email: string | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
    } & {
        id: string;
        payrollPeriodId: string;
        workerId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        status: string;
        updatedAt: Date;
        emailDeliveryStatus: string;
        publishedAt: Date | null;
        signatureIp: string | null;
        signatureToken: string | null;
        viewedAt: Date | null;
        whatsappDeliveryStatus: string;
    })[]>;
    dryRunWorker(payload: {
        payrollPeriodId: string;
        employmentRecordId: string;
        mockData?: Record<string, any>;
    }, user: any): Promise<{
        netPay: number;
        totalIncome: number;
        totalDeductions: number;
        employerContributions: number;
        receiptDetails: any[];
        memorySnapshot: any;
    }>;
}
