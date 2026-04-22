import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        users: {
            role: {
                name: string;
            };
            email: string;
            firstName: string;
            lastName: string;
        }[];
        _count: {
            workers: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        taxId: string;
        isActive: boolean;
        updatedAt: Date;
        maxActiveWorkers: number;
        serviceEndDate: Date | null;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        oraclePrompt: string | null;
        logoUrl: string | null;
        contactPhone: string | null;
    })[]>;
    findOne(id: string): Promise<({
        users: {
            role: {
                name: string;
            };
            email: string;
            firstName: string;
            lastName: string;
        }[];
        _count: {
            workers: number;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        taxId: string;
        isActive: boolean;
        updatedAt: Date;
        maxActiveWorkers: number;
        serviceEndDate: Date | null;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        oraclePrompt: string | null;
        logoUrl: string | null;
        contactPhone: string | null;
    }) | null>;
    update(id: string, data: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        taxId: string;
        isActive: boolean;
        updatedAt: Date;
        maxActiveWorkers: number;
        serviceEndDate: Date | null;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        oraclePrompt: string | null;
        logoUrl: string | null;
        contactPhone: string | null;
    }>;
    assignConsultant(targetTenantId: string, consultantUserId: string): Promise<{
        id: string;
        tenantId: string;
        roleId: string;
        userId: string;
    }>;
}
