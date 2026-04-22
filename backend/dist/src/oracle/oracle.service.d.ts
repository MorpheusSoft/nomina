import { PrismaService } from '../prisma/prisma.service';
export declare class OracleService {
    private readonly prisma;
    private ai;
    constructor(prisma: PrismaService);
    generateConcept(tenantId: string, naturalLanguagePrompt: string, context?: any, history?: any[]): Promise<any>;
}
