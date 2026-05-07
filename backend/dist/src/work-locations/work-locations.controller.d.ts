import { WorkLocationsService } from './work-locations.service';
import { Prisma } from '@prisma/client';
export declare class WorkLocationsController {
    private readonly workLocationsService;
    constructor(workLocationsService: WorkLocationsService);
    create(data: Prisma.WorkLocationUncheckedCreateInput, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    findAll(user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    getSyncData(id: string, user: any): Promise<{
        location: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            allowedRadius: number;
        };
        crews: any[];
    }>;
    update(id: string, data: Prisma.WorkLocationUncheckedUpdateInput, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
}
