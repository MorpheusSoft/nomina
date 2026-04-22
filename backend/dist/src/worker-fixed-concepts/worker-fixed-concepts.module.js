"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerFixedConceptsModule = void 0;
const common_1 = require("@nestjs/common");
const worker_fixed_concepts_service_1 = require("./worker-fixed-concepts.service");
const worker_fixed_concepts_controller_1 = require("./worker-fixed-concepts.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let WorkerFixedConceptsModule = class WorkerFixedConceptsModule {
};
exports.WorkerFixedConceptsModule = WorkerFixedConceptsModule;
exports.WorkerFixedConceptsModule = WorkerFixedConceptsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [worker_fixed_concepts_service_1.WorkerFixedConceptsService],
        controllers: [worker_fixed_concepts_controller_1.WorkerFixedConceptsController]
    })
], WorkerFixedConceptsModule);
//# sourceMappingURL=worker-fixed-concepts.module.js.map