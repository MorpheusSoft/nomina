"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalController = void 0;
const common_1 = require("@nestjs/common");
const portal_service_1 = require("./portal.service");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
let PortalController = class PortalController {
    portalService;
    constructor(portalService) {
        this.portalService = portalService;
    }
    login(data) {
        return this.portalService.login(data.identityNumber, data.birthDate);
    }
    getReceipts(workerId) {
        return this.portalService.getReceipts(workerId);
    }
    getReceiptByToken(token) {
        return this.portalService.getReceiptByToken(token);
    }
    signReceipt(id, req) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        return this.portalService.signReceipt(id, ip);
    }
    getSelfServiceDocuments(workerId) {
        return this.portalService.getSelfServiceDocumentsByWorker(workerId);
    }
    previewSelfServiceDocument(templateId, workerId) {
        return this.portalService.compileSelfServiceDocument(templateId, workerId);
    }
    getTickets(workerId) {
        return this.portalService.getTickets(workerId);
    }
    uploadFiles(workerId, files) {
        if (!files || files.length === 0)
            return { success: false, urls: [] };
        const urls = files.map(file => `/uploads/tickets/${file.filename}`);
        return { success: true, urls };
    }
    createTicket(workerId, data) {
        return this.portalService.createTicket(workerId, data);
    }
    addTicketComment(workerId, ticketId, body) {
        return this.portalService.addTicketComment(workerId, ticketId, body.text);
    }
    getLoans(workerId, req) {
        const currencyView = req.query.currencyView || 'VES';
        const exchangeRateString = req.query.exchangeRate || '1';
        return this.portalService.getLoansAccount(workerId, currencyView, exchangeRateString);
    }
};
exports.PortalController = PortalController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('receipts/worker/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getReceipts", null);
__decorate([
    (0, common_1.Get)('receipts/by-token/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getReceiptByToken", null);
__decorate([
    (0, common_1.Post)('receipts/:id/sign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "signReceipt", null);
__decorate([
    (0, common_1.Get)('documents/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getSelfServiceDocuments", null);
__decorate([
    (0, common_1.Get)('documents/:templateId/preview/:workerId'),
    __param(0, (0, common_1.Param)('templateId')),
    __param(1, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "previewSelfServiceDocument", null);
__decorate([
    (0, common_1.Get)('worker-tickets/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getTickets", null);
__decorate([
    (0, common_1.Post)('worker-tickets/upload/:workerId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 3, {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/tickets',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `${req.params.workerId}-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            }
        }),
        limits: { fileSize: 2 * 1024 * 1024 }
    })),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Post)('worker-tickets/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "createTicket", null);
__decorate([
    (0, common_1.Post)('worker-tickets/:workerId/comments/:ticketId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Param)('ticketId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "addTicketComment", null);
__decorate([
    (0, common_1.Get)('loans/:workerId'),
    __param(0, (0, common_1.Param)('workerId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PortalController.prototype, "getLoans", null);
exports.PortalController = PortalController = __decorate([
    (0, common_1.Controller)('portal'),
    __metadata("design:paramtypes", [portal_service_1.PortalService])
], PortalController);
//# sourceMappingURL=portal.controller.js.map