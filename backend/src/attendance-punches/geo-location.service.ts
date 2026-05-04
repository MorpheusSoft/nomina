import { Injectable } from '@nestjs/common';

@Injectable()
export class GeoLocationService {
  /**
   * Calculates the distance between two coordinates in meters using the Haversine formula.
   */
  calculateDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const rad = Math.PI / 180;
    
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lon2 - lon1) * rad;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Validates if a given coordinate is within the allowed radius of a target coordinate.
   */
  isWithinRadius(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    allowedRadiusInMeters: number
  ): { isValid: boolean; distanceMeters: number } {
    const distance = this.calculateDistanceInMeters(userLat, userLon, targetLat, targetLon);
    return {
      isValid: distance <= allowedRadiusInMeters,
      distanceMeters: Math.round(distance)
    };
  }
}
