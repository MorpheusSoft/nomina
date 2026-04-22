import { ConceptsService } from './concepts.service';
export declare class ConceptsController {
    private readonly conceptsService;
    constructor(conceptsService: ConceptsService);
    create(data: any, user: any): Promise<{
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
    findAll(user: any): Promise<({
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
    findOne(id: string, user: any): Promise<{
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
    update(id: string, data: any, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    importFromRootNode(user: any): Promise<{
        importedCount: number;
    }>;
    remove(id: string, user: any): Promise<{
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
}
