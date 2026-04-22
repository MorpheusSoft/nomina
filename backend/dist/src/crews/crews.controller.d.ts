import { CrewsService } from './crews.service';
import { CreateCrewDto } from './dto/create-crew.dto';
export declare class CrewsController {
    private readonly crewsService;
    constructor(crewsService: CrewsService);
    create(data: CreateCrewDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
    findAll(user: any): Promise<({
        department: {
            costCenter: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                workerId: string | null;
                accountingCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        };
        shiftPattern: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            sequence: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    })[]>;
    findOne(id: string, user: any): Promise<{
        department: {
            costCenter: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                workerId: string | null;
                accountingCode: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            costCenterId: string;
            monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
        };
        shiftPattern: {
            id: string;
            tenantId: string;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            sequence: import("@prisma/client/runtime/library").JsonValue;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
    update(id: string, data: CreateCrewDto, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        departmentId: string;
        patternAnchor: Date | null;
        shiftPatternId: string | null;
    }>;
}
