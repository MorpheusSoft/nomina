import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class DocumentTemplatesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(tenantId: string, data: Prisma.DocumentTemplateCreateInput): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }>;
    findAll(tenantId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }[]>;
    findOne(tenantId: string, id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }>;
    update(tenantId: string, id: string, data: Prisma.DocumentTemplateUpdateInput): Promise<Prisma.BatchPayload>;
    remove(tenantId: string, id: string): Promise<Prisma.BatchPayload>;
    compile(tenantId: string, templateId: string, workerId: string): Promise<{
        compiledHtml: string;
    }>;
}
