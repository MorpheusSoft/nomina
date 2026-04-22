import { GeneralCatalogsService } from './general-catalogs.service';
export declare class GeneralCatalogsController {
    private readonly catalogsService;
    constructor(catalogsService: GeneralCatalogsService);
    findAll(category: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }[]>;
    create(data: {
        category: string;
        value: string;
    }, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }>;
    remove(id: string, user: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        category: string;
    }>;
}
