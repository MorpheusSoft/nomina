import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: any, user: any): Promise<{
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
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(id: string, user: any): import(".prisma/client").Prisma.Prisma__UserClient<{
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
    changePassword(data: any, user: any): Promise<{
        success: boolean;
    }>;
    update(id: string, updateUserDto: any, user: any): Promise<{
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
    remove(id: string, user: any): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
