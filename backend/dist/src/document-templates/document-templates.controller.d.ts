import { DocumentTemplatesService } from './document-templates.service';
import { Prisma } from '@prisma/client';
export declare class DocumentTemplatesController {
    private readonly documentTemplatesService;
    constructor(documentTemplatesService: DocumentTemplatesService);
    create(data: Prisma.DocumentTemplateCreateInput, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }>;
    findAll(user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }[]>;
    findOne(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }>;
    update(id: string, data: Prisma.DocumentTemplateUpdateInput, user: any): Promise<Prisma.BatchPayload>;
    remove(id: string, user: any): Promise<Prisma.BatchPayload>;
    compile(id: string, workerId: string, user: any): Promise<{
        compiledHtml: string;
    }>;
}
