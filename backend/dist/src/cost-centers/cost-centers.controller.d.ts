import { CostCentersService } from './cost-centers.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
export declare class CostCentersController {
    private readonly costCentersService;
    constructor(costCentersService: CostCentersService);
    create(data: CreateCostCenterDto, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        workerId: string | null;
        accountingCode: string;
        workLocationId: string | null;
    }>;
    findAll(user: any): Promise<({
        departments: ({
            crews: ({
                shiftPattern: {
                    id: string;
                    tenantId: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    sequence: import("@prisma/client/runtime/library").JsonValue;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                departmentId: string;
                patternAnchor: Date | null;
                shiftPatternId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            code: string | null;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        workLocation: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            allowedRadius: number;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        workerId: string | null;
        accountingCode: string;
        workLocationId: string | null;
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
                    tenantId: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    sequence: import("@prisma/client/runtime/library").JsonValue;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                departmentId: string;
                patternAnchor: Date | null;
                shiftPatternId: string | null;
            })[];
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            code: string | null;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        })[];
        workLocation: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            latitude: import("@prisma/client/runtime/library").Decimal | null;
            longitude: import("@prisma/client/runtime/library").Decimal | null;
            allowedRadius: number;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        workerId: string | null;
        accountingCode: string;
        workLocationId: string | null;
    }) | null>;
    update(id: string, data: CreateCostCenterDto, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findVariables(id: string, user: any): Promise<any>;
    createVariable(id: string, data: any, user: any): Promise<any>;
    updateVariable(id: string, varId: string, data: any, user: any): Promise<any>;
    removeVariable(id: string, varId: string, user: any): Promise<any>;
}
