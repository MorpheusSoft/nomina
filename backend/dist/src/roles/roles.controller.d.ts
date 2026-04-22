import { RolesService } from './roles.service';
export declare class RolesController {
    private readonly rolesService;
    constructor(rolesService: RolesService);
    create(createRoleDto: any, user: any): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    }[]>;
    findOne(id: string, user: any): import(".prisma/client").Prisma.Prisma__RoleClient<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updateRoleDto: any, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        permissions: string[];
    } | null>;
    remove(id: string, user: any): import(".prisma/client").Prisma.PrismaPromise<import(".prisma/client").Prisma.BatchPayload>;
}
