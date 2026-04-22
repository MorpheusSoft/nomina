import { PrismaService } from '../prisma/prisma.service';
export declare class HolidaysService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        date: Date;
        isAnnual: boolean;
    }>;
    findAll(): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        date: Date;
        isAnnual: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        date: Date;
        isAnnual: boolean;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        date: Date;
        isAnnual: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        date: Date;
        isAnnual: boolean;
    }>;
    private getEasterDate;
    private addDays;
    generateDynamicHolidaysForYear(tenantId: string, year: number): Promise<{
        generated: number;
    }>;
}
