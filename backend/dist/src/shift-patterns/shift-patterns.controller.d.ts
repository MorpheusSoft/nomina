import { ShiftPatternsService } from './shift-patterns.service';
import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';
export declare class ShiftPatternsController {
    private readonly shiftPatternsService;
    constructor(shiftPatternsService: ShiftPatternsService);
    create(req: any, createShiftPatternDto: CreateShiftPatternDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(req: any): Promise<({
        _count: {
            crews: number;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    findOne(req: any, id: string): Promise<{
        crews: {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            departmentId: string;
            patternAnchor: Date | null;
            shiftPatternId: string | null;
        }[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    update(req: any, id: string, updateShiftPatternDto: UpdateShiftPatternDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
