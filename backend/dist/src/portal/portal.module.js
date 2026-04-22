"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortalModule = void 0;
const common_1 = require("@nestjs/common");
const portal_service_1 = require("./portal.service");
const portal_controller_1 = require("./portal.controller");
const prisma_module_1 = require("../prisma/prisma.module");
const document_templates_module_1 = require("../document-templates/document-templates.module");
let PortalModule = class PortalModule {
};
exports.PortalModule = PortalModule;
exports.PortalModule = PortalModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, document_templates_module_1.DocumentTemplatesModule],
        providers: [portal_service_1.PortalService],
        controllers: [portal_controller_1.PortalController]
    })
], PortalModule);
//# sourceMappingURL=portal.module.js.map