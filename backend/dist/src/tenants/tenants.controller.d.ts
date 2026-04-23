import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getMyStatus(user: any): Promise<({
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
    findAll(user: any): Promise<({
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
    findOne(id: string, user: any): Promise<({
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
    update(id: string, data: UpdateTenantDto, user: any): Promise<{
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
    uploadLogo(id: string, file: Express.Multer.File, user: any): Promise<{
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
    assignConsultant(targetTenantId: string, consultantUserId: string, user: any): Promise<{
        id: string;
        tenantId: string;
        roleId: string;
        userId: string;
    }>;
}
