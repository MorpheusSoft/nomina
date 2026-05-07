import { PrismaService } from '../prisma/prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
export declare class CostCentersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: CreateCostCenterDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        workerId: string | null;
        accountingCode: string;
        workLocationId: string | null;
    }>;
    findAllVariablesGroupedByCode(tenantId: string): Promise<{
        id: any;
        code: any;
        name: any;
        value: number;
        costCenterName: any;
    }[]>;
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<({
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
    update(tenantId: string, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    findVariablesByCostCenter(tenantId: string, costCenterId: string): Promise<any>;
    createVariable(tenantId: string, costCenterId: string, data: any): Promise<any>;
    updateVariable(tenantId: string, costCenterId: string, varId: string, data: any): Promise<any>;
    removeVariable(tenantId: string, costCenterId: string, varId: string): Promise<any>;
}
