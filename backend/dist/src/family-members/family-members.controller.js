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
exports.FamilyMembersController = void 0;
const common_1 = require("@nestjs/common");
const family_members_service_1 = require("./family-members.service");
const create_family_member_dto_1 = require("./dto/create-family-member.dto");
const update_family_member_dto_1 = require("./dto/update-family-member.dto");
let FamilyMembersController = class FamilyMembersController {
    familyMembersService;
    constructor(familyMembersService) {
        this.familyMembersService = familyMembersService;
    }
    create(createFamilyMemberDto) {
        return this.familyMembersService.create(createFamilyMemberDto);
    }
    findAll(workerId) {
        return this.familyMembersService.findAll(workerId);
    }
    findOne(id) {
        return this.familyMembersService.findOne(id);
    }
    update(id, updateFamilyMemberDto) {
        return this.familyMembersService.update(id, updateFamilyMemberDto);
    }
    remove(id) {
        return this.familyMembersService.remove(id);
    }
};
exports.FamilyMembersController = FamilyMembersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_family_member_dto_1.CreateFamilyMemberDto]),
    __metadata("design:returntype", void 0)
], FamilyMembersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('workerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamilyMembersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamilyMembersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_family_member_dto_1.UpdateFamilyMemberDto]),
    __metadata("design:returntype", void 0)
], FamilyMembersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FamilyMembersController.prototype, "remove", null);
exports.FamilyMembersController = FamilyMembersController = __decorate([
    (0, common_1.Controller)('family-members'),
    __metadata("design:paramtypes", [family_members_service_1.FamilyMembersService])
], FamilyMembersController);
//# sourceMappingURL=family-members.controller.js.map