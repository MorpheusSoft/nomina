import { PrismaService } from '../prisma/prisma.service';
export declare class ShiftsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    create(tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
