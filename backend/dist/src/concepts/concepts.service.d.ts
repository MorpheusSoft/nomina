import { PrismaService } from '../prisma/prisma.service';
export declare class ConceptsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        type: string;
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
        createdAt: Date;
        updatedAt: Date;
        isBonifiable: boolean;
        tenantId: string;
    }>;
    findAll(tenantId: string): Promise<({
        payrollGroupConcepts: ({
            payrollGroup: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                tenantId: string;
                rootBonusConceptId: string | null;
                rootLiquidationConceptId: string | null;
                rootRegularConceptId: string | null;
                rootVacationConceptId: string | null;
                loanDeductionConceptId: string | null;
                islrConceptId: string | null;
                nightShiftEndTime: string;
                nightShiftStartTime: string;
                standardWorkHours: import("@prisma/client/runtime/library").Decimal;
            };
        } & {
            id: string;
            payrollGroupId: string;
            conceptId: string;
        })[];
    } & {
        id: string;
        code: string;
        name: string;
        description: string | null;
        type: string;
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
        createdAt: Date;
        updatedAt: Date;
        isBonifiable: boolean;
        tenantId: string;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        payrollGroupConcepts: {
            id: string;
            payrollGroupId: string;
            conceptId: string;
        }[];
    } & {
        id: string;
        code: string;
        name: string;
        description: string | null;
        type: string;
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
        createdAt: Date;
        updatedAt: Date;
        isBonifiable: boolean;
        tenantId: string;
    }>;
    update(tenantId: string, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        code: string;
        name: string;
        description: string | null;
        type: string;
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
        createdAt: Date;
        updatedAt: Date;
        isBonifiable: boolean;
        tenantId: string;
    }>;
    importFromRootNode(targetTenantId: string): Promise<{
        importedCount: number;
    }>;
}
