import { PrismaService } from '../prisma/prisma.service';
export declare class PayrollPeriodsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private checkOverlaps;
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        status: string;
        payrollGroupId: string;
        costCenterId: string | null;
        type: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
    }>;
    findAll(tenantId: string): Promise<({
        _count: {
            payrollReceipts: number;
        };
        costCenter: {
            name: string;
        } | null;
        payrollGroup: {
            name: string;
        };
        importedAttendancePeriods: {
            id: string;
            name: string;
        }[];
        departments: {
            name: string;
        }[];
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        status: string;
        payrollGroupId: string;
        costCenterId: string | null;
        type: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        tenant: {
            id: string;
            createdAt: Date;
            name: string;
            taxId: string;
            isActive: boolean;
            updatedAt: Date;
            maxActiveWorkers: number;
            serviceEndDate: Date | null;
            hasWorkerPortalAccess: boolean;
            hasOracleAccess: boolean;
            oraclePrompt: string | null;
            logoUrl: string | null;
            contactPhone: string | null;
        };
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
        importedAttendancePeriods: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            status: string;
            payrollGroupId: string;
            costCenterId: string | null;
            type: string;
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        }[];
        specialConcepts: {
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
        }[];
        departments: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        status: string;
        payrollGroupId: string;
        costCenterId: string | null;
        type: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
    }>;
    getBudgetAnalysis(tenantId: string, periodId: string): Promise<{
        periodId: string;
        periodName: string;
        status: string;
        analysis: {
            departmentId: string;
            departmentName: string;
            monthlyBudgetUSD: number;
            mtdHistoricCostUSD: number;
            currentPeriodCostUSD: number;
            totalProjectedCostUSD: number;
            varianceUSD: number;
            isOverBudget: boolean;
        }[];
        workerStatusSummary: {
            ACTIVE: number;
            ON_VACATION: number;
            SUSPENDED: number;
            LIQUIDATED: number;
        };
    }>;
    update(user: any, id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        status: string;
        payrollGroupId: string;
        costCenterId: string | null;
        type: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
    }>;
    private publishReceipts;
    private dispatchOmnichannelDelivery;
    private processLoanDeductions;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        status: string;
        payrollGroupId: string;
        costCenterId: string | null;
        type: string;
        currency: string;
        exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
        processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
    }>;
    private processSocialBenefitsDeposit;
    private processLiquidationClosing;
}
