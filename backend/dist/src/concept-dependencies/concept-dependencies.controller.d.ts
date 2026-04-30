import { ConceptDependenciesService } from './concept-dependencies.service';
export declare class ConceptDependenciesController {
    private readonly conceptDependenciesService;
    constructor(conceptDependenciesService: ConceptDependenciesService);
    create(createDto: any): Promise<{
        childConcept: {
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
        executionSequence: number;
        parentConceptId: string;
        childConceptId: string;
    }>;
    findAll(parentConceptId?: string): Promise<({
        childConcept: {
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
        executionSequence: number;
        parentConceptId: string;
        childConceptId: string;
    })[]>;
    remove(id: string): Promise<{
        id: string;
        executionSequence: number;
        parentConceptId: string;
        childConceptId: string;
    }>;
}
