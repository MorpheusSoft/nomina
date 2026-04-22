import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
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
    register(body: any, user: any): Promise<void | {
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
    getProfile(user: any): any;
    switchTenant(body: any, user: any): Promise<{
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
    returnToRoot(user: any): Promise<{
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
