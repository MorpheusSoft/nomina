import { ConceptsService } from './concepts.service';
export declare class ConceptsController {
    private readonly conceptsService;
    constructor(conceptsService: ConceptsService);
    create(data: any, user: any): Promise<{
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
    }>;
    findAll(user: any): Promise<({
        payrollGroupConcepts: ({
            payrollGroup: {
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
    })[]>;
    findOne(id: string, user: any): Promise<{
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
    }>;
    update(id: string, data: any, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    importFromRootNode(user: any): Promise<{
        importedCount: number;
    }>;
    remove(id: string, user: any): Promise<{
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
    }>;
}
