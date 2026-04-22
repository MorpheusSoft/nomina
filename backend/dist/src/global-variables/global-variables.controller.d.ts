import { GlobalVariablesService } from './global-variables.service';
export declare class GlobalVariablesController {
    private readonly baseService;
    constructor(baseService: GlobalVariablesService);
    create(data: any, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    importFromRoot(user: any): Promise<{
        importedCount: number;
    }>;
    findAll(user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        code: string;
        validFrom: Date;
        validTo: Date | null;
        value: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, data: any, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    remove(id: string, user: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
