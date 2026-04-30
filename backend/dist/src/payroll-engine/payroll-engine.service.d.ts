import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollEngineService {
    private prisma;
    private readonly logger;
    private readonly math;
    constructor(prisma: PrismaService);
    calculateFullPeriod(periodId: string, specificWorkerId?: string): Promise<{
        success: boolean;
        count: number;
    }>;
    dryRunWorker(tenantId: string, periodId: string, recordId: string, mockData?: Record<string, any>): Promise<{
        netPay: number;
        totalIncome: number;
        totalDeductions: number;
        employerContributions: number;
        receiptDetails: any[];
        memorySnapshot: any;
    }>;
    private evaluateFormulas;
    private flattenAst;
    private fetchDependencies;
    private buildGlobalContext;
    getReceiptsForPeriod(periodId: string, canViewConfidential?: boolean): Promise<({
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
    private buildWorkerReceiptMetrics;
}
