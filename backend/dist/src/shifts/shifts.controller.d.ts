import { ShiftsService } from './shifts.service';
export declare class ShiftsController {
    private readonly shiftsService;
    constructor(shiftsService: ShiftsService);
    findAll(req: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    create(req: any, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
