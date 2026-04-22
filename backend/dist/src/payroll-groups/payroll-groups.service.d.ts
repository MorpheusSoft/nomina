import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollGroupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nightShiftEndTime: string;
        nightShiftStartTime: string;
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        nightShiftEndTime: string;
        nightShiftStartTime: string;
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        payrollGroupConcepts: ({
            concept: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                type: string;
                code: string;
                description: string | null;
                accountingCode: string | null;
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
        standardWorkHours: import("@prisma/client/runtime/library").Decimal;
        rootBonusConceptId: string | null;
        rootLiquidationConceptId: string | null;
        rootRegularConceptId: string | null;
        rootVacationConceptId: string | null;
        loanDeductionConceptId: string | null;
        islrConceptId: string | null;
    }>;
    update(tenantId: string, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
