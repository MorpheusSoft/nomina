export declare class GeoLocationService {
    calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number;
    isWithinRadius(userLat: number, userLon: number, targetLat: number, targetLon: number, allowedRadiusInMeters: number): {
        isValid: boolean;
        distanceMeters: number;
    };
}
