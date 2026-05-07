import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class WorkLocationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.WorkLocationUncheckedCreateInput): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }[]>;
    getSyncData(id: string, tenantId: string): Promise<{
        location: {
            id: string;
            name: string;
            latitude: Prisma.Decimal | null;
            longitude: Prisma.Decimal | null;
            allowedRadius: number;
        };
        crews: any[];
    }>;
    findOne(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    update(id: string, tenantId: string, data: Prisma.WorkLocationUncheckedUpdateInput): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        allowedRadius: number;
    }>;
    remove(id: string, tenantId: string): Promise<{
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
