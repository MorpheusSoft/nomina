import { PrismaService } from '../prisma/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        role: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            permissions: string[];
        };
        email: string;
        firstName: string;
        lastName: string;
    }>;
    findAll(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        role: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            permissions: string[];
        };
        email: string;
        firstName: string;
        lastName: string;
        tenantAccesses: {
            tenant: {
                id: string;
                name: string;
            };
        }[];
    }[]>;
    findOne(tenantId: string, id: string): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        role: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            permissions: string[];
        };
        email: string;
        firstName: string;
        lastName: string;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(tenantId: string, id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
        role: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            permissions: string[];
        };
        email: string;
        firstName: string;
        lastName: string;
    } | null>;
    changePassword(id: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    remove(tenantId: string, id: string): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
