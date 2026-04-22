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
        worker: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
        details: ({
            concept: {
                code: string;
            };
        } & {
            id: string;
            payrollReceiptId: string;
            conceptId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            conceptNameSnapshot: string;
            typeSnapshot: string;
            factor: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        payrollPeriodId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        emailDeliveryStatus: string;
        publishedAt: Date | null;
        signatureIp: string | null;
        signatureToken: string | null;
        viewedAt: Date | null;
        whatsappDeliveryStatus: string;
    })[]>;
    private buildWorkerReceiptMetrics;
}
