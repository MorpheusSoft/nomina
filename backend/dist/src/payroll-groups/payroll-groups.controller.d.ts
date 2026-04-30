import { PayrollGroupsService } from './payroll-groups.service';
export declare class PayrollGroupsController {
    private readonly payrollGroupsService;
    constructor(payrollGroupsService: PayrollGroupsService);
    create(data: any, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nightShiftEndTime: string;
        nightShiftStartTime: string;
        mixedShiftMaxNightHours: import("@prisma/client/runtime/library").Decimal;
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }>;
    findAll(user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nightShiftEndTime: string;
        nightShiftStartTime: string;
        mixedShiftMaxNightHours: import("@prisma/client/runtime/library").Decimal;
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }[]>;
    findOne(id: string, user: any): Promise<{
        payrollGroupConcepts: ({
            concept: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                type: string;
                accountingCode: string | null;
                code: string;
                description: string | null;
                accountingOperation: string | null;
                isSalaryIncidence: boolean;
                isTaxable: boolean;
                isAuxiliary: boolean;
                formulaFactor: string | null;
                formulaRate: string | null;
                formulaAmount: string;
                condition: string | null;
                executionSequence: number;
                executionPeriodTypes: string[];
                isBonifiable: boolean;
            };
        } & {
            id: string;
            payrollGroupId: string;
            conceptId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nightShiftEndTime: string;
        nightShiftStartTime: string;
        mixedShiftMaxNightHours: import("@prisma/client/runtime/library").Decimal;
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }>;
    update(id: string, data: any, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
