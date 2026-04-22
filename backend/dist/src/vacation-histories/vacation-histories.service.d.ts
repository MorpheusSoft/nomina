import { PrismaService } from '../prisma/prisma.service';
export declare class VacationHistoriesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        employmentRecordId: string;
        payrollReceiptId: string | null;
        serviceYear: number;
        servicePeriodName: string;
        enjoymentDays: number;
        restDays: number;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        createdAt: Date;
    }>;
    findByEmploymentRecord(tenantId: string, employmentRecordId: string): Promise<({
        payrollReceipt: {
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
        } | null;
    } & {
        id: string;
        tenantId: string;
        employmentRecordId: string;
        payrollReceiptId: string | null;
        serviceYear: number;
        servicePeriodName: string;
        enjoymentDays: number;
        restDays: number;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        createdAt: Date;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        employmentRecordId: string;
        payrollReceiptId: string | null;
        serviceYear: number;
        servicePeriodName: string;
        enjoymentDays: number;
        restDays: number;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        createdAt: Date;
    }>;
    update(tenantId: string, id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        employmentRecordId: string;
        payrollReceiptId: string | null;
        serviceYear: number;
        servicePeriodName: string;
        enjoymentDays: number;
        restDays: number;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        createdAt: Date;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        employmentRecordId: string;
        payrollReceiptId: string | null;
        serviceYear: number;
        servicePeriodName: string;
        enjoymentDays: number;
        restDays: number;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        createdAt: Date;
    }>;
}
