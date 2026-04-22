import { TenantsService } from './tenants.service';
import { UpdateTenantDto } from './dto/update-tenant.dto';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getMyStatus(user: any): Promise<({
        users: {
            email: string;
            firstName: string;
            lastName: string;
            role: {
                name: string;
            };
        }[];
        _count: {
            workers: number;
        };
    } & {
        maxActiveWorkers: number;
        isActive: boolean;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        logoUrl: string | null;
        oraclePrompt: string | null;
        contactPhone: string | null;
        serviceEndDate: Date | null;
        id: string;
        name: string;
        taxId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findAll(user: any): Promise<({
        users: {
            email: string;
            firstName: string;
            lastName: string;
            role: {
                name: string;
            };
        }[];
        _count: {
            workers: number;
        };
    } & {
        maxActiveWorkers: number;
        isActive: boolean;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        logoUrl: string | null;
        oraclePrompt: string | null;
        contactPhone: string | null;
        serviceEndDate: Date | null;
        id: string;
        name: string;
        taxId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string, user: any): Promise<({
        users: {
            email: string;
            firstName: string;
            lastName: string;
            role: {
                name: string;
            };
        }[];
        _count: {
            workers: number;
        };
    } & {
        maxActiveWorkers: number;
        isActive: boolean;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        logoUrl: string | null;
        oraclePrompt: string | null;
        contactPhone: string | null;
        serviceEndDate: Date | null;
        id: string;
        name: string;
        taxId: string;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    update(id: string, data: UpdateTenantDto, user: any): Promise<{
        maxActiveWorkers: number;
        isActive: boolean;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        logoUrl: string | null;
        oraclePrompt: string | null;
        contactPhone: string | null;
        serviceEndDate: Date | null;
        id: string;
        name: string;
        taxId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadLogo(id: string, file: Express.Multer.File, user: any): Promise<{
        maxActiveWorkers: number;
        isActive: boolean;
        hasWorkerPortalAccess: boolean;
        hasOracleAccess: boolean;
        logoUrl: string | null;
        oraclePrompt: string | null;
        contactPhone: string | null;
        serviceEndDate: Date | null;
        id: string;
        name: string;
        taxId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignConsultant(targetTenantId: string, consultantUserId: string, user: any): Promise<{
        id: string;
        tenantId: string;
        roleId: string;
        userId: string;
    }>;
}
