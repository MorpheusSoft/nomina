import { PrismaService } from '../prisma/prisma.service';
export declare class CrewsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
    findAll(tenantId: string): Promise<({
        department: {
            costCenter: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                workerId: string | null;
                accountingCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        };
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
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        department: {
            costCenter: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                workerId: string | null;
                accountingCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        };
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
    }>;
    update(tenantId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
}
