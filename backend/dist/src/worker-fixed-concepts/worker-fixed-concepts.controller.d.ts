import { WorkerFixedConceptsService } from './worker-fixed-concepts.service';
import { CreateWorkerFixedConceptDto } from './dto/create-worker-fixed-concept.dto';
export declare class WorkerFixedConceptsController {
    private readonly service;
    constructor(service: WorkerFixedConceptsService);
    create(data: CreateWorkerFixedConceptDto): Promise<{
        id: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        conceptId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    }>;
    findAll(workerId?: string, employmentRecordId?: string): never[] | Promise<({
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
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        conceptId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    })[]>;
    findOne(id: string): Promise<({
        employmentRecord: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date | null;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            contractType: string;
            position: string;
            status: import(".prisma/client").$Enums.EmploymentStatus;
            isConfidential: boolean;
            workerId: string;
            departmentId: string | null;
            payrollGroupId: string | null;
            costCenterId: string | null;
            crewId: string | null;
        };
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
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        conceptId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    }) | null>;
    update(id: string, data: any): Promise<{
        id: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        conceptId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        employmentRecordId: string;
        createdAt: Date;
        updatedAt: Date;
        currency: string;
        conceptId: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    }>;
}
