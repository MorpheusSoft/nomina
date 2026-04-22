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
exports.ConceptDependenciesController = void 0;
const common_1 = require("@nestjs/common");
const concept_dependencies_service_1 = require("./concept-dependencies.service");
let ConceptDependenciesController = class ConceptDependenciesController {
    conceptDependenciesService;
    constructor(conceptDependenciesService) {
        this.conceptDependenciesService = conceptDependenciesService;
    }
    create(createDto) {
        return this.conceptDependenciesService.create(createDto);
    }
    findAll(parentConceptId) {
        return this.conceptDependenciesService.findAll(parentConceptId);
    }
    remove(id) {
        return this.conceptDependenciesService.remove(id);
    }
};
exports.ConceptDependenciesController = ConceptDependenciesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConceptDependenciesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('parentConceptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConceptDependenciesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConceptDependenciesController.prototype, "remove", null);
exports.ConceptDependenciesController = ConceptDependenciesController = __decorate([
    (0, common_1.Controller)('concept-dependencies'),
    __metadata("design:paramtypes", [concept_dependencies_service_1.ConceptDependenciesService])
], ConceptDependenciesController);
//# sourceMappingURL=concept-dependencies.controller.js.map