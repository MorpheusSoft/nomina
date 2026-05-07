export declare class CreateTenantDto {
    name: string;
    taxId: string;
    isActive?: boolean;
    hasWorkerPortalAccess?: boolean;
    hasOracleAccess?: boolean;
    hasGeofencingAccess?: boolean;
    oraclePrompt?: string;
}
