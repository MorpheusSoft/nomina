import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
export declare class CostCentersController {
    private readonly costCentersService;
    constructor(costCentersService: CostCentersService);
    create(data: CreateCostCenterDto, user: any): Promise<{
        id: string;
        name: string;
        accountingCode: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        workerId: string | null;
    }>;
    findAll(user: any): Promise<({
        departments: ({
            crews: ({
                shiftPattern: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    sequence: import("@prisma/client/runtime/library").JsonValue;
                } | null;
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string;
                patternAnchor: Date | null;
                shiftPatternId: string | null;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
    } & {
        id: string;
        name: string;
        accountingCode: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        workerId: string | null;
    })[]>;
    findAllVariables(user: any): Promise<{
        id: any;
        code: any;
        name: any;
        value: number;
        costCenterName: any;
    }[]>;
    findOne(id: string, user: any): Promise<({
        departments: ({
            crews: ({
                shiftPattern: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tenantId: string;
                    sequence: import("@prisma/client/runtime/library").JsonValue;
                } | null;
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                departmentId: string;
                patternAnchor: Date | null;
                shiftPatternId: string | null;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
    } & {
        id: string;
        name: string;
        accountingCode: string;
        createdAt: Date;
        updatedAt: Date;
        tenantId: string;
        workerId: string | null;
    }) | null>;
    update(id: string, data: CreateCostCenterDto, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findVariables(id: string, user: any): Promise<any>;
    createVariable(id: string, data: any, user: any): Promise<any>;
    updateVariable(id: string, varId: string, data: any, user: any): Promise<any>;
    removeVariable(id: string, varId: string, user: any): Promise<any>;
}
