import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollAccumulatorDto } from './dto/create-payroll-accumulator.dto';
import { UpdatePayrollAccumulatorDto } from './dto/update-payroll-accumulator.dto';
export declare class PayrollAccumulatorsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, createDto: CreatePayrollAccumulatorDto): Promise<({
        concepts: ({
            concept: {
                id: string;
                name: string;
                type: string;
                code: string;
            };
        } & {
            id: string;
            conceptId: string;
            accumulatorId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: string;
        description: string | null;
        weeksBack: number | null;
        includeAllBonifiable: boolean;
    }) | null>;
    findAll(tenantId: string): import(".prisma/client").Prisma.PrismaPromise<({
        concepts: ({
            concept: {
                id: string;
                name: string;
                type: string;
                code: string;
            };
        } & {
            id: string;
            conceptId: string;
            accumulatorId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: string;
        description: string | null;
        weeksBack: number | null;
        includeAllBonifiable: boolean;
    })[]>;
    findOne(tenantId: string, id: string): Promise<{
        concepts: ({
            concept: {
                id: string;
                name: string;
                type: string;
                code: string;
            };
        } & {
            id: string;
            conceptId: string;
            accumulatorId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: string;
        description: string | null;
        weeksBack: number | null;
        includeAllBonifiable: boolean;
    }>;
    update(tenantId: string, id: string, updateDto: UpdatePayrollAccumulatorDto): Promise<({
        concepts: ({
            concept: {
                id: string;
                name: string;
                type: string;
                code: string;
            };
        } & {
            id: string;
            conceptId: string;
            accumulatorId: string;
        })[];
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: string;
        description: string | null;
        weeksBack: number | null;
        includeAllBonifiable: boolean;
    }) | null>;
    remove(tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
}
