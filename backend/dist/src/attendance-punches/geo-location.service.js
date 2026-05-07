"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoLocationService = void 0;
const common_1 = require("@nestjs/common");
let GeoLocationService = class GeoLocationService {
    calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const rad = Math.PI / 180;
        const phi1 = lat1 * rad;
        const phi2 = lat2 * rad;
        const deltaPhi = (lat2 - lat1) * rad;
        const deltaLambda = (lon2 - lon1) * rad;
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    isWithinRadius(userLat, userLon, targetLat, targetLon, allowedRadiusInMeters) {
        const distance = this.calculateDistanceInMeters(userLat, userLon, targetLat, targetLon);
        return {
            isValid: distance <= allowedRadiusInMeters,
            distanceMeters: Math.round(distance)
        };
    }
};
exports.GeoLocationService = GeoLocationService;
exports.GeoLocationService = GeoLocationService = __decorate([
    (0, common_1.Injectable)()
], GeoLocationService);
//# sourceMappingURL=geo-location.service.js.map