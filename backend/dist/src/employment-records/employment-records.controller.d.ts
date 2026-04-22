import { EmploymentRecordsService } from './employment-records.service';
export declare class EmploymentRecordsController {
    private readonly employmentRecordsService;
    constructor(employmentRecordsService: EmploymentRecordsService);
    create(createDto: any): Promise<{
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
    }>;
    findAll(workerId: string): import(".prisma/client").Prisma.PrismaPromise<({
        costCenter: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            workerId: string | null;
            accountingCode: string;
        } | null;
        crew: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            departmentId: string;
            patternAnchor: Date | null;
            shiftPatternId: string | null;
        } | null;
        department: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        } | null;
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
        } | null;
        salaryHistories: {
            id: string;
            employmentRecordId: string;
            createdAt: Date;
            currency: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            validFrom: Date;
            validTo: Date | null;
        }[];
    } & {
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
    })[]>;
    updateSalary(id: string, data: {
        amount: number;
        currency: string;
        validFrom: string;
    }): Promise<{
        id: string;
        employmentRecordId: string;
        createdAt: Date;
        currency: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        validFrom: Date;
        validTo: Date | null;
    }>;
    transferWorker(id: string, data: {
        position: string;
        costCenterId: string;
        departmentId: string;
        crewId: string;
    }): Promise<{
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
    }>;
    toggleConfidentiality(id: string, data: {
        isConfidential: boolean;
    }): Promise<{
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
    }>;
}
