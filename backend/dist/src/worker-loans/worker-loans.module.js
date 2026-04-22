"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerLoansModule = void 0;
const common_1 = require("@nestjs/common");
const worker_loans_service_1 = require("./worker-loans.service");
const worker_loans_controller_1 = require("./worker-loans.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let WorkerLoansModule = class WorkerLoansModule {
};
exports.WorkerLoansModule = WorkerLoansModule;
exports.WorkerLoansModule = WorkerLoansModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        controllers: [worker_loans_controller_1.WorkerLoansController],
        providers: [worker_loans_service_1.WorkerLoansService],
    })
], WorkerLoansModule);
//# sourceMappingURL=worker-loans.module.js.map