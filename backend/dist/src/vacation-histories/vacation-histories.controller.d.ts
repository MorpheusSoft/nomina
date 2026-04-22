import { VacationHistoriesService } from './vacation-histories.service';
export declare class VacationHistoriesController {
    private readonly vacationHistoriesService;
    constructor(vacationHistoriesService: VacationHistoriesService);
    create(user: any, createData: any): Promise<{
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
    findByEmploymentRecord(user: any, id: string): Promise<({
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
    findOne(user: any, id: string): Promise<{
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
    update(user: any, id: string, updateData: any): Promise<{
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
    remove(user: any, id: string): Promise<{
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
