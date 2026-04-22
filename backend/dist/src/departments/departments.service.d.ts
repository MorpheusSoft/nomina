import { PrismaService } from '../prisma/prisma.service';
export declare class DepartmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(tenantId: string): Promise<({
        costCenter: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            workerId: string | null;
            accountingCode: string;
        };
        crews: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            departmentId: string;
            patternAnchor: Date | null;
            shiftPatternId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        costCenter: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            workerId: string | null;
            accountingCode: string;
        };
        crews: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            departmentId: string;
            patternAnchor: Date | null;
            shiftPatternId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    update(tenantId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    getBudgetMetrics(tenantId: string): Promise<{
        currentExchangeRate: number;
        metrics: {
            id: any;
            name: any;
            budget: number;
            spent: number;
            percentage: number;
        }[];
    }>;
}
