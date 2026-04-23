import { PrismaService } from '../prisma/prisma.service';
export declare class ConceptsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
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
    }>;
    findAll(tenantId: string): Promise<({
        payrollGroupConcepts: ({
            payrollGroup: {
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
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        payrollGroupConcepts: {
            id: string;
            payrollGroupId: string;
            conceptId: string;
        }[];
    } & {
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
    }>;
    update(tenantId: string, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<{
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
    }>;
    importFromRootNode(targetTenantId: string): Promise<{
        importedCount: number;
    }>;
}
