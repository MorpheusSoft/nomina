import { PrismaService } from '../prisma/prisma.service';
import { DocumentTemplatesService } from '../document-templates/document-templates.service';
export declare class PortalService {
    private readonly prisma;
    private readonly documentTemplatesService;
    constructor(prisma: PrismaService, documentTemplatesService: DocumentTemplatesService);
    login(identityNumber: string, birthDate: string): Promise<{
        success: boolean;
        workerId: string;
        firstName: string;
        lastName: string;
        tenantId: string;
    }>;
    getReceipts(workerId: string): Promise<({
        payrollPeriod: {
            startDate: Date;
            endDate: Date;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        payrollPeriodId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        emailDeliveryStatus: string;
        publishedAt: Date | null;
        signatureIp: string | null;
        signatureToken: string | null;
        viewedAt: Date | null;
        whatsappDeliveryStatus: string;
    })[]>;
    getReceiptByToken(token: string): Promise<{
        worker: {
            tenant: {
                id: string;
                createdAt: Date;
                name: string;
                taxId: string;
                isActive: boolean;
                updatedAt: Date;
                maxActiveWorkers: number;
                serviceEndDate: Date | null;
                hasWorkerPortalAccess: boolean;
                hasOracleAccess: boolean;
                oraclePrompt: string | null;
                logoUrl: string | null;
                contactPhone: string | null;
            };
            employmentRecords: ({
                department: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    updatedAt: Date;
                    costCenterId: string;
                    monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
                } | null;
            } & {
                id: string;
                tenantId: string;
                startDate: Date;
                endDate: Date | null;
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                contractType: string;
                position: string;
                status: import(".prisma/client").$Enums.EmploymentStatus;
                isConfidential: boolean;
                workerId: string;
                departmentId: string | null;
                payrollGroupId: string | null;
                costCenterId: string | null;
                crewId: string | null;
            })[];
            bankAccounts: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                workerId: string;
                bankId: string;
                accountNumber: string;
                accountType: string;
                isPrimary: boolean;
            }[];
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            email: string | null;
            firstName: string;
            lastName: string;
            primaryIdentityNumber: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            deletedAt: Date | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
        payrollPeriod: {
            id: string;
            tenantId: string;
            startDate: Date;
            endDate: Date;
            createdAt: Date;
            name: string;
            updatedAt: Date;
            status: string;
            payrollGroupId: string;
            costCenterId: string | null;
            type: string;
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
        details: ({
            concept: {
                id: string;
                tenantId: string;
                createdAt: Date;
                name: string;
                updatedAt: Date;
                type: string;
                accountingCode: string | null;
                code: string;
                description: string | null;
                accountingOperation: string | null;
                isSalaryIncidence: boolean;
                isTaxable: boolean;
                isAuxiliary: boolean;
                formulaFactor: string | null;
                formulaRate: string | null;
                formulaAmount: string;
                condition: string | null;
                executionSequence: number;
                executionPeriodTypes: string[];
                isBonifiable: boolean;
            };
        } & {
            id: string;
            payrollReceiptId: string;
            conceptId: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            conceptNameSnapshot: string;
            typeSnapshot: string;
            factor: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        workerId: string;
        payrollPeriodId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        emailDeliveryStatus: string;
        publishedAt: Date | null;
        signatureIp: string | null;
        signatureToken: string | null;
        viewedAt: Date | null;
        whatsappDeliveryStatus: string;
    }>;
    signReceipt(id: string, ipAddress: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSelfServiceDocuments(): Promise<never[]>;
    getSelfServiceDocumentsByWorker(workerId: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        name: string;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.DocumentTemplateType;
        contentHtml: string;
        isSelfService: boolean;
    }[]>;
    compileSelfServiceDocument(templateId: string, workerId: string): Promise<{
        compiledHtml: string;
    }>;
    getTickets(workerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue;
        hrNotes: string | null;
    }[]>;
    createTicket(workerId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    addTicketComment(workerId: string, ticketId: string, commentText: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.TicketStatus;
        workerId: string;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    getLoansAccount(workerId: string, currencyView: string, exchangeRateString: string): Promise<any[]>;
}
