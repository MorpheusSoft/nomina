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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HolidaysService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HolidaysService = class HolidaysService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const createData = { ...data };
        if (data.date)
            createData.date = new Date(data.date);
        return this.prisma.holiday.create({ data: createData });
    }
    async findAll() {
        return this.prisma.holiday.findMany({
            orderBy: { date: 'desc' }
        });
    }
    async findOne(id) {
        const holiday = await this.prisma.holiday.findUnique({ where: { id } });
        if (!holiday)
            throw new common_1.NotFoundException('Holiday not found');
        return holiday;
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.date)
            updateData.date = new Date(data.date);
        return this.prisma.holiday.update({
            where: { id },
            data: updateData
        });
    }
    async remove(id) {
        return this.prisma.holiday.delete({ where: { id } });
    }
    getEasterDate(year) {
        const a = year % 19;
        const b = year % 4;
        const c = year % 7;
        const k = Math.floor(year / 100);
        const p = Math.floor((13 + 8 * k) / 25);
        const q = Math.floor(k / 4);
        const M = (15 - p + k - q) % 30;
        const N = (4 + k - q) % 7;
        const d = (19 * a + M) % 30;
        const e = (2 * b + 4 * c + 6 * d + N) % 7;
        if (d + e < 10) {
            return new Date(Date.UTC(year, 2, 22 + d + e));
        }
        else {
            let day = d + e - 9;
            if (d === 29 && e === 6)
                day = 19;
            if (d === 28 && e === 6 && (11 * M + 11) % 30 < 19)
                day = 18;
            return new Date(Date.UTC(year, 3, day));
        }
    }
    addDays(date, days) {
        let result = new Date(date);
        result.setUTCDate(result.getUTCDate() + days);
        return result;
    }
    async generateDynamicHolidaysForYear(tenantId, year) {
        const easter = this.getEasterDate(year);
        const dynamicHolidays = [
            { name: 'Lunes de Carnaval', date: this.addDays(easter, -48), isAnnual: false },
            { name: 'Martes de Carnaval', date: this.addDays(easter, -47), isAnnual: false },
            { name: 'Jueves Santo', date: this.addDays(easter, -3), isAnnual: false },
            { name: 'Viernes Santo', date: this.addDays(easter, -2), isAnnual: false }
        ];
        let createdCount = 0;
        for (const dh of dynamicHolidays) {
            const exists = await this.prisma.holiday.findFirst({
                where: { tenantId, name: dh.name, date: dh.date }
            });
            if (!exists) {
                await this.prisma.holiday.create({
                    data: { tenantId, name: dh.name, date: dh.date, isAnnual: false }
                });
                createdCount++;
            }
        }
        const fixedHolidays = [
            { name: 'Año Nuevo', month: 0, day: 1 },
            { name: 'Día del Trabajador', month: 4, day: 1 },
            { name: 'Navidad', month: 11, day: 25 },
        ];
        for (const fh of fixedHolidays) {
            const fixedDate = new Date(Date.UTC(2000, fh.month, fh.day));
            const exists = await this.prisma.holiday.findFirst({
                where: { tenantId, name: fh.name, isAnnual: true }
            });
            if (!exists) {
                await this.prisma.holiday.create({
                    data: { tenantId, name: fh.name, date: fixedDate, isAnnual: true }
                });
                createdCount++;
            }
        }
        return { generated: createdCount };
    }
};
exports.HolidaysService = HolidaysService;
exports.HolidaysService = HolidaysService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HolidaysService);
//# sourceMappingURL=holidays.service.js.map