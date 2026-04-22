import { PrismaService } from '../prisma/prisma.service';
export declare class AriFormsService {
    private prisma;
    constructor(prisma: PrismaService);
    simulateTaxMath(estimatedIncome: number, deductionType: string, detailedDeductionsAmount: number, familyLoadCount: number, taxUnitValue: number): {
        percentage: number;
        taxUnitValue: number;
        estimatedUt: number;
        deductionUt: number;
        netEstimableUt: number;
        taxToPayUt: number;
        rebatesUt: number;
        finalTaxUt: number;
        taxInBs: number;
    };
    calculatePercentage(estimatedIncome: number, deductionType: string, detailedDeductionsAmount: number, familyLoadCount: number, taxUnitValue: number): number;
    getActiveTaxUnitValue(tenantId: string): Promise<number>;
    getProjectionFloor(employmentRecordId: string, tenantId: string): Promise<number>;
    submitVoluntaryForm(tenantId: string, workerId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        month: number;
        fiscalYear: number;
        estimatedRemuneration: import("@prisma/client/runtime/library").Decimal;
        deductionType: string;
        detailedDeductionsAmount: import("@prisma/client/runtime/library").Decimal;
        eduDeductionAmount: import("@prisma/client/runtime/library").Decimal;
        hcmDeductionAmount: import("@prisma/client/runtime/library").Decimal;
        medDeductionAmount: import("@prisma/client/runtime/library").Decimal;
        housingDeductionAmount: import("@prisma/client/runtime/library").Decimal;
        familyLoadCount: number;
        taxUnitsValue: import("@prisma/client/runtime/library").Decimal;
        withholdingPercentage: import("@prisma/client/runtime/library").Decimal;
        isSystemGenerated: boolean;
    }>;
    generateSystemForms(tenantId: string, fiscalYear: number): Promise<{
        processed: number;
        message: string;
    }>;
    getStatuses(tenantId: string, fiscalYear: number): Promise<{
        workerName: string;
        identity: string;
        hasForm: boolean;
        isSystemGenerated: boolean;
        percentage: import("@prisma/client/runtime/library").Decimal;
        recordId: string;
        formData: {
            id: string;
            tenantId: string;
            employmentRecordId: string;
            createdAt: Date;
            updatedAt: Date;
            month: number;
            fiscalYear: number;
            estimatedRemuneration: import("@prisma/client/runtime/library").Decimal;
            deductionType: string;
            detailedDeductionsAmount: import("@prisma/client/runtime/library").Decimal;
            eduDeductionAmount: import("@prisma/client/runtime/library").Decimal;
            hcmDeductionAmount: import("@prisma/client/runtime/library").Decimal;
            medDeductionAmount: import("@prisma/client/runtime/library").Decimal;
            housingDeductionAmount: import("@prisma/client/runtime/library").Decimal;
            familyLoadCount: number;
            taxUnitsValue: import("@prisma/client/runtime/library").Decimal;
            withholdingPercentage: import("@prisma/client/runtime/library").Decimal;
            isSystemGenerated: boolean;
        };
    }[]>;
    getDetailForPrinting(tenantId: string, formId: string): Promise<{
        tenant: {
            name: string;
            documentId: string;
        };
        worker: {
            firstName: string;
            lastName: string;
            identity: string;
        };
        form: {
            fiscalYear: number;
            estimatedRemuneration: number;
            taxUnitsValue: number;
            deductionType: string;
            detailedDeductionsAmount: number;
            familyLoadCount: number;
            withholdingPercentage: number;
            isSystemGenerated: boolean;
            createdAt: Date;
        };
    }>;
}
