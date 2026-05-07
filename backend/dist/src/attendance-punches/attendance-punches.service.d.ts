import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { GeoLocationService } from './geo-location.service';
export declare class AttendancePunchesService {
    private prisma;
    private geoLocationService;
    constructor(prisma: PrismaService, geoLocationService: GeoLocationService);
    create(data: Prisma.AttendancePunchUncheckedCreateInput): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        locationStatus: string | null;
        isValid: boolean;
        photoUrl: string | null;
    }>;
    createBulk(tenantId: string, punches: any[]): Promise<{
        count: number;
    }>;
    findAll(tenantId: string, workerId?: string): Promise<({
        worker: {
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
        };
        device: {
            name: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        locationStatus: string | null;
        isValid: boolean;
        photoUrl: string | null;
    })[]>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        workerId: string;
        type: import(".prisma/client").$Enums.PunchType;
        deviceId: string | null;
        timestamp: Date;
        source: import(".prisma/client").$Enums.PunchSource;
        isProcessed: boolean;
        latitude: Prisma.Decimal | null;
        longitude: Prisma.Decimal | null;
        locationStatus: string | null;
        isValid: boolean;
        photoUrl: string | null;
    }>;
}
