import { PrismaService } from '../prisma/prisma.service';
export declare class GeneralCatalogsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllByCategory(tenantId: string, category: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }[]>;
    create(tenantId: string, category: string, value: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }>;
    remove(id: string, tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }>;
}
