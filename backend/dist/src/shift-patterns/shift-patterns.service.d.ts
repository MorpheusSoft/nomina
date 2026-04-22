import { CreateShiftPatternDto } from './dto/create-shift-pattern.dto';
import { UpdateShiftPatternDto } from './dto/update-shift-pattern.dto';
import { PrismaService } from '../prisma/prisma.service';
export declare class ShiftPatternsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createShiftPatternDto: CreateShiftPatternDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    findAll(tenantId: string): Promise<({
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
    findOne(tenantId: string, id: string): Promise<{
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
    update(tenantId: string, id: string, updateShiftPatternDto: UpdateShiftPatternDto): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
    remove(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        sequence: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
