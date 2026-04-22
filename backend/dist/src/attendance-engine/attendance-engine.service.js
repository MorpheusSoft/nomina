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
exports.AttendanceEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const holidays_service_1 = require("../holidays/holidays.service");
const date_fns_1 = require("date-fns");
let AttendanceEngineService = class AttendanceEngineService {
    prisma;
    holidaysService;
    constructor(prisma, holidaysService) {
        this.prisma = prisma;
        this.holidaysService = holidaysService;
    }
    async processDailyAttendance(tenantId, workerId, baseDate, preloadedHolidays = null) {
        const startOfDay = new Date(`${baseDate}T00:00:00.000Z`);
        startOfDay.setUTCHours(4);
        let holidays = preloadedHolidays;
        if (!holidays) {
            holidays = await this.prisma.holiday.findMany({ where: { tenantId } });
        }
        const [year, month, day] = baseDate.split('-').map(Number);
        const isHoliday = holidays.some(h => {
            if (h.isAnnual) {
                return (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
            }
            else {
                return h.date.getUTCFullYear() === year && (h.date.getUTCMonth() + 1) === month && h.date.getUTCDate() === day;
            }
        });
        const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
        const punches = await this.prisma.attendancePunch.findMany({
            where: {
                tenantId,
                workerId,
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { timestamp: 'asc' },
        });
        const activeEmployment = await this.prisma.employmentRecord.findFirst({
            where: { workerId, isActive: true },
            include: {
                payrollGroup: true,
                owner: { include: { shiftTemplate: true } },
                crew: { include: { shiftPattern: true } }
            }
        });
        const pg = activeEmployment?.payrollGroup;
        const crew = activeEmployment?.crew;
        const workerData = activeEmployment?.owner;
        const stdWorkMins = pg?.standardWorkHours ? Number(pg.standardWorkHours) * 60 : 480;
        const [nT_H, nT_M] = (pg?.nightShiftStartTime || '19:00').split(':').map(Number);
        const nightThreshold = new Date(startOfDay);
        nightThreshold.setUTCHours(nT_H + 4, nT_M, 0, 0);
        let firstIn = null;
        let lastOut = null;
        if (punches.length > 0) {
            firstIn = punches[0].timestamp;
            lastOut = punches[punches.length - 1].timestamp;
        }
        else {
            const finalStatus = isHoliday ? 'HOLIDAY' : 'ABSENT';
            return this.saveDaily(tenantId, workerId, startOfDay, null, null, 0, 0, 0, 0, 0, 0, 0, finalStatus);
        }
        if (punches.length === 1) {
            return this.saveDaily(tenantId, workerId, startOfDay, firstIn, null, 0, 0, 0, 0, 0, 0, 0, 'INCOMPLETE_PUNCH');
        }
        let workMinsCalculated = 0;
        const totalMinutesPresent = (0, date_fns_1.differenceInMinutes)(lastOut, firstIn);
        if (punches.length === 2) {
            workMinsCalculated = totalMinutesPresent;
        }
        else if (punches.length % 2 === 0) {
            for (let i = 0; i < punches.length; i += 2) {
                workMinsCalculated += (0, date_fns_1.differenceInMinutes)(punches[i + 1].timestamp, punches[i].timestamp);
            }
        }
        else {
            workMinsCalculated = totalMinutesPresent;
        }
        let regularHours = 0;
        let extraDayHours = 0;
        let extraNightHours = 0;
        let lateMinutes = 0;
        let earlyLeaveMins = 0;
        let status = isHoliday ? 'WORKED_HOLIDAY' : 'PRESENT';
        let expectedWorkMinutes = stdWorkMins;
        let hasStrictShift = false;
        if (crew?.shiftPattern && crew?.patternAnchor) {
            const anchorDate = new Date(crew.patternAnchor);
            const targetDate = new Date(startOfDay);
            const msPerDay = 1000 * 60 * 60 * 24;
            const utcAnchor = Date.UTC(anchorDate.getUTCFullYear(), anchorDate.getUTCMonth(), anchorDate.getUTCDate());
            const utcTarget = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
            const diffDays = Math.floor((utcTarget - utcAnchor) / msPerDay);
            if (diffDays >= 0) {
                const sequence = crew.shiftPattern.sequence;
                const cycleLength = sequence.length;
                const index = diffDays % cycleLength;
                const todaysShift = sequence[index];
                if (todaysShift && todaysShift.type === 'WORK') {
                    hasStrictShift = true;
                    const [shStartH, shStartM] = todaysShift.start.split(':').map(Number);
                    const [shEndH, shEndM] = todaysShift.end.split(':').map(Number);
                    const idealIn = new Date(startOfDay);
                    idealIn.setUTCHours(shStartH + 4, shStartM, 0, 0);
                    const idealOut = new Date(startOfDay);
                    idealOut.setUTCHours(shEndH + 4, shEndM, 0, 0);
                    if (idealOut < idealIn) {
                        idealOut.setUTCDate(idealOut.getUTCDate() + 1);
                    }
                    expectedWorkMinutes = (0, date_fns_1.differenceInMinutes)(idealOut, idealIn);
                    if (firstIn > idealIn) {
                        const diffIn = (0, date_fns_1.differenceInMinutes)(firstIn, idealIn);
                        if (diffIn > 15) {
                            lateMinutes = diffIn;
                        }
                    }
                    if (lastOut < idealOut) {
                        earlyLeaveMins = (0, date_fns_1.differenceInMinutes)(idealOut, lastOut);
                    }
                }
                else if (todaysShift && todaysShift.type === 'REST') {
                    status = 'WORKED_REST_DAY';
                }
            }
        }
        else if (workerData?.shiftTemplate) {
            hasStrictShift = true;
            const tpl = workerData.shiftTemplate;
            const [shStartH, shStartM] = tpl.startTime.split(':').map(Number);
            const [shEndH, shEndM] = tpl.endTime.split(':').map(Number);
            const idealIn = new Date(startOfDay);
            idealIn.setUTCHours(shStartH + 4, shStartM, 0, 0);
            const idealOut = new Date(startOfDay);
            idealOut.setUTCHours(shEndH + 4, shEndM, 0, 0);
            if (idealOut < idealIn) {
                idealOut.setUTCDate(idealOut.getUTCDate() + 1);
            }
            const currentMealDeduction = tpl.mealMinutes ?? 0;
            expectedWorkMinutes = (0, date_fns_1.differenceInMinutes)(idealOut, idealIn) - currentMealDeduction;
            if (firstIn > idealIn) {
                const diffIn = (0, date_fns_1.differenceInMinutes)(firstIn, idealIn);
                if (diffIn > (tpl.graceMinutesIn || 15))
                    lateMinutes = diffIn;
            }
            if (lastOut < idealOut) {
                earlyLeaveMins = (0, date_fns_1.differenceInMinutes)(idealOut, lastOut);
            }
        }
        const baselineMins = hasStrictShift ? expectedWorkMinutes : stdWorkMins;
        if (workMinsCalculated > baselineMins) {
            regularHours = baselineMins / 60;
            const extraMins = workMinsCalculated - baselineMins;
            let nightMins = 0;
            if (lastOut > nightThreshold) {
                nightMins = (0, date_fns_1.differenceInMinutes)(lastOut, nightThreshold);
                if (nightMins > extraMins)
                    nightMins = extraMins;
            }
            const dayMins = extraMins - nightMins;
            extraDayHours = parseFloat((dayMins / 60).toFixed(2));
            extraNightHours = parseFloat((nightMins / 60).toFixed(2));
        }
        else {
            regularHours = parseFloat((Math.max(0, workMinsCalculated) / 60).toFixed(2));
        }
        let ordinaryDayHours = regularHours;
        let ordinaryNightHours = 0;
        if (regularHours > 0) {
            const nightStartStr = pg?.nightShiftStartTime || '19:00';
            const nightEndStr = pg?.nightShiftEndTime || '05:00';
            const shiftStart = (hasStrictShift && crew?.shiftPattern) ? firstIn : (firstIn || startOfDay);
            if (shiftStart) {
                const slices = this.calculateTimeSlices(shiftStart, Math.round(regularHours * 60), nightStartStr, nightEndStr);
                ordinaryDayHours = parseFloat((slices.dayMins / 60).toFixed(2));
                ordinaryNightHours = parseFloat((slices.nightMins / 60).toFixed(2));
            }
        }
        await this.prisma.attendancePunch.updateMany({
            where: { id: { in: punches.map(p => p.id) } },
            data: { isProcessed: true },
        });
        return this.saveDaily(tenantId, workerId, startOfDay, firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status);
    }
    async processPeriodPunches(tenantId, startDate, endDate) {
        const targetYear = startDate.getUTCFullYear();
        await this.holidaysService.generateDynamicHolidaysForYear(tenantId, targetYear);
        const holidays = await this.prisma.holiday.findMany({ where: { tenantId } });
        const unprocPunches = await this.prisma.attendancePunch.findMany({
            where: {
                tenantId,
                isProcessed: false,
                timestamp: { gte: startDate, lte: endDate }
            },
            select: {
                workerId: true,
                timestamp: true
            }
        });
        const pairsToProcess = new Set();
        for (const p of unprocPunches) {
            const localDate = new Date(p.timestamp.getTime() - (4 * 60 * 60 * 1000));
            const baseDate = localDate.toISOString().split('T')[0];
            pairsToProcess.add(`${p.workerId}|${baseDate}`);
        }
        const processedDailyRecords = [];
        for (const pair of Array.from(pairsToProcess)) {
            const [workerId, baseDate] = pair.split('|');
            const daily = await this.processDailyAttendance(tenantId, workerId, baseDate, holidays);
            processedDailyRecords.push(daily);
        }
        return { processedWorkerDaysCount: processedDailyRecords.length };
    }
    async saveDaily(tenantId, workerId, date, firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status) {
        return this.prisma.dailyAttendance.upsert({
            where: {
                workerId_date: { workerId, date },
            },
            update: {
                firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status
            },
            create: {
                tenantId, workerId, date, firstIn, lastOut, regularHours, ordinaryDayHours, ordinaryNightHours, extraDayHours, extraNightHours, lateMinutes, earlyLeaveMins, status
            }
        });
    }
    calculateTimeSlices(startTime, totalMinutes, nightStartStr, nightEndStr) {
        let dayMins = 0;
        let nightMins = 0;
        const [nsH, nsM] = nightStartStr.split(':').map(Number);
        const [neH, neM] = nightEndStr.split(':').map(Number);
        const startTotalMins = nsH * 60 + nsM;
        const endTotalMins = neH * 60 + neM;
        for (let i = 0; i < totalMinutes; i++) {
            const currentMinTime = new Date(startTime.getTime() + (i * 60000));
            const localHours = (currentMinTime.getUTCHours() - 4 + 24) % 24;
            const localMins = currentMinTime.getUTCMinutes();
            const currentTotalMins = localHours * 60 + localMins;
            let isNight = false;
            if (startTotalMins >= endTotalMins) {
                if (currentTotalMins >= startTotalMins || currentTotalMins < endTotalMins)
                    isNight = true;
            }
            else {
                if (currentTotalMins >= startTotalMins && currentTotalMins < endTotalMins)
                    isNight = true;
            }
            if (isNight)
                nightMins++;
            else
                dayMins++;
        }
        return { dayMins, nightMins };
    }
};
exports.AttendanceEngineService = AttendanceEngineService;
exports.AttendanceEngineService = AttendanceEngineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        holidays_service_1.HolidaysService])
], AttendanceEngineService);
//# sourceMappingURL=attendance-engine.service.js.map