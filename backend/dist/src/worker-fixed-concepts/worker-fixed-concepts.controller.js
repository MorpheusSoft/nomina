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
exports.WorkerFixedConceptsController = void 0;
const common_1 = require("@nestjs/common");
const worker_fixed_concepts_service_1 = require("./worker-fixed-concepts.service");
const create_worker_fixed_concept_dto_1 = require("./dto/create-worker-fixed-concept.dto");
let WorkerFixedConceptsController = class WorkerFixedConceptsController {
    service;
    constructor(service) {
        this.service = service;
    }
    create(data) {
        return this.service.create(data);
    }
    findAll(workerId, employmentRecordId) {
        if (workerId)
            return this.service.findAllByWorker(workerId);
        if (employmentRecordId)
            return this.service.findAllByEmploymentRecord(employmentRecordId);
        return [];
    }
    findOne(id) {
        return this.service.findOne(id);
    }
    update(id, data) {
        return this.service.update(id, data);
    }
    remove(id) {
        return this.service.remove(id);
    }
};
exports.WorkerFixedConceptsController = WorkerFixedConceptsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_worker_fixed_concept_dto_1.CreateWorkerFixedConceptDto]),
    __metadata("design:returntype", void 0)
], WorkerFixedConceptsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workerId')),
    __param(1, (0, common_1.Query)('employmentRecordId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkerFixedConceptsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkerFixedConceptsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkerFixedConceptsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkerFixedConceptsController.prototype, "remove", null);
exports.WorkerFixedConceptsController = WorkerFixedConceptsController = __decorate([
    (0, common_1.Controller)('worker-fixed-concepts'),
    __metadata("design:paramtypes", [worker_fixed_concepts_service_1.WorkerFixedConceptsService])
], WorkerFixedConceptsController);
//# sourceMappingURL=worker-fixed-concepts.controller.js.map