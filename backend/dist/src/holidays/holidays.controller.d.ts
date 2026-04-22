import { HolidaysService } from './holidays.service';
export declare class HolidaysController {
    private readonly holidaysService;
    constructor(holidaysService: HolidaysService);
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
}
