import { AriFormsService } from './ari-forms.service';
export declare class AriFormsController {
    private readonly ariService;
    constructor(ariService: AriFormsService);
    getFloor(workerId: string, tenantId: string): Promise<{
        floor: number;
        defaultFamilyLoad?: undefined;
        existingFormId?: undefined;
        canGenerateVariation?: undefined;
    } | {
        floor: number;
        defaultFamilyLoad: number;
        existingFormId: string | null;
        canGenerateVariation: boolean;
    }>;
    submitVoluntary(data: any, tenantId: string, workerId: string): Promise<{
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
    simulateTaxMath(data: any, tenantId: string, workerId: string): Promise<{
        percentage: number;
        taxUnitValue: number;
        estimatedUt: number;
        deductionUt: number;
        netEstimableUt: number;
        taxToPayUt: number;
        rebatesUt: number;
        finalTaxUt: number;
        taxInBs: number;
    }>;
    generateSystemForms(fiscalYear: number, user: any): Promise<{
        processed: number;
        message: string;
    }>;
    getStatuses(fiscalYear: string, user: any): Promise<{
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
    getPrintDetails(id: string, tenantId: string, workerId: string, user: any): Promise<{
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
