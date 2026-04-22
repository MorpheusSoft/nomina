import { PayrollAccumulatorsService } from './payroll-accumulators.service';
import { CreatePayrollAccumulatorDto } from './dto/create-payroll-accumulator.dto';
import { UpdatePayrollAccumulatorDto } from './dto/update-payroll-accumulator.dto';
export declare class PayrollAccumulatorsController {
    private readonly payrollAccumulatorsService;
    constructor(payrollAccumulatorsService: PayrollAccumulatorsService);
    create(user: any, createPayrollAccumulatorDto: CreatePayrollAccumulatorDto): Promise<({
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
    findAll(user: any): import(".prisma/client").Prisma.PrismaPromise<({
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
    findOne(user: any, id: string): Promise<{
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
    update(user: any, id: string, updatePayrollAccumulatorDto: UpdatePayrollAccumulatorDto): Promise<({
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
    remove(user: any, id: string): Promise<{
        success: boolean;
    }>;
}
