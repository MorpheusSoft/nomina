import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(email: string, pass: string): Promise<{
        accessToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            permissions: any;
            tenantId: any;
            tenantName: any;
            availableTenants: any;
        };
    }>;
    register(data: any, currentUser: any): Promise<void | {
        accessToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            permissions: any;
            tenantId: any;
            tenantName: any;
            availableTenants: any;
        };
    }>;
    switchTenant(userId: string, targetTenantId: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            permissions: string[];
            tenantId: string;
            tenantName: string;
            availableTenants: {
                tenantId: any;
                tenantName: any;
                roleId: any;
                roleName: any;
            }[];
        };
    }>;
    returnToRoot(userId: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
            permissions: string[];
            tenantId: string;
            tenantName: string;
            availableTenants: {
                tenantId: any;
                tenantName: any;
                roleId: any;
                roleName: any;
            }[];
        };
    }>;
}
