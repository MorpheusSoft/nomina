import { PrismaService } from '../prisma/prisma.service';
export declare class GlobalVariablesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(tenantId: string, id: string, data: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    importFromRoot(targetTenantId: string): Promise<{
        importedCount: number;
    }>;
}
