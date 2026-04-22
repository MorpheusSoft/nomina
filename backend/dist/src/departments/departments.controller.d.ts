import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(data: CreateDepartmentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findAll(user: any): Promise<({
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
    getBudgetMetrics(user: any): Promise<{
        currentExchangeRate: number;
        metrics: {
            id: any;
            name: any;
            budget: number;
            spent: number;
            percentage: number;
        }[];
    }>;
    findOne(id: string, user: any): Promise<{
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
    update(id: string, data: CreateDepartmentDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        costCenterId: string;
        monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
    }>;
}
