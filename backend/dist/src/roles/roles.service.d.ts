import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    }[]>;
    findOne(tenantId: string, id: string): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(tenantId: string, id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    } | null>;
    remove(tenantId: string, id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
