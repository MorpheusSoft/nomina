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
            name: string;
            startDate: Date;
            endDate: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        payrollPeriodId: string;
        workerId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        status: string;
        emailDeliveryStatus: string;
        publishedAt: Date | null;
        signatureIp: string | null;
        signatureToken: string | null;
        viewedAt: Date | null;
        whatsappDeliveryStatus: string;
    })[]>;
    getReceiptByToken(token: string): Promise<{
        worker: {
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
            employmentRecords: ({
                department: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    costCenterId: string;
                    monthlyBudget: import("@prisma/client/runtime/library").Decimal | null;
                } | null;
            } & {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                workerId: string;
                status: import(".prisma/client").$Enums.EmploymentStatus;
                payrollGroupId: string | null;
                startDate: Date;
                endDate: Date | null;
                costCenterId: string | null;
                isActive: boolean;
                contractType: string;
                position: string;
                departmentId: string | null;
                crewId: string | null;
                isConfidential: boolean;
            })[];
            tenant: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                isActive: boolean;
                taxId: string;
                maxActiveWorkers: number;
                serviceEndDate: Date | null;
                hasWorkerPortalAccess: boolean;
                hasOracleAccess: boolean;
                oraclePrompt: string | null;
                logoUrl: string | null;
                contactPhone: string | null;
            };
        } & {
            id: string;
            tenantId: string;
            primaryIdentityNumber: string;
            firstName: string;
            lastName: string;
            birthDate: Date;
            gender: string;
            nationality: string;
            maritalStatus: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            email: string | null;
            phone: string | null;
            bankAccountNumber: string | null;
            bankAccountType: string | null;
            bankName: string | null;
        };
        details: ({
            concept: {
                id: string;
                tenantId: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: string;
                code: string;
                description: string | null;
                accountingCode: string | null;
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
            conceptNameSnapshot: string;
            typeSnapshot: string;
            factor: import("@prisma/client/runtime/library").Decimal;
            rate: import("@prisma/client/runtime/library").Decimal;
            amount: import("@prisma/client/runtime/library").Decimal;
        })[];
        payrollPeriod: {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            status: string;
            payrollGroupId: string;
            type: string;
            startDate: Date;
            endDate: Date;
            costCenterId: string | null;
            currency: string;
            exchangeRate: import("@prisma/client/runtime/library").Decimal | null;
            processStatuses: import(".prisma/client").$Enums.EmploymentStatus[];
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        payrollPeriodId: string;
        workerId: string;
        totalSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalNonSalaryEarnings: import("@prisma/client/runtime/library").Decimal;
        totalEarnings: import("@prisma/client/runtime/library").Decimal;
        totalDeductions: import("@prisma/client/runtime/library").Decimal;
        netPay: import("@prisma/client/runtime/library").Decimal;
        employerContributions: import("@prisma/client/runtime/library").Decimal;
        status: string;
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
        updatedAt: Date;
        name: string;
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
        workerId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
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
        workerId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        type: import(".prisma/client").$Enums.TicketType;
        description: string;
        title: string;
        jsonMetadata: import("@prisma/client/runtime/library").JsonValue | null;
        hrNotes: string | null;
    }>;
    getLoansAccount(workerId: string, currencyView: string, exchangeRateString: string): Promise<any[]>;
}
