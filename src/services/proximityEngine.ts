import { Coordinates, RegisteredFarmer, ProximityAlert, DiseaseCluster } from '../types/surveillance';
import { AiEngine } from './aiEngine';

export class ProximityEngine {
  /**
   * Scans all registered farmers against active high-risk zones/clusters and dispatches alerts
   */
  static generateTargetedAlerts(
    cluster: DiseaseCluster,
    registeredFarmers: RegisteredFarmer[]
  ): ProximityAlert[] {
    const alerts: ProximityAlert[] = [];
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

    registeredFarmers.forEach(farmer => {
      const distanceKm = Number(AiEngine.getDistanceKm(cluster.centerCoordinates, farmer.coordinates).toFixed(1));

      if (distanceKm <= 4.0) {
        // High Alert Zone (0 - 4 km)
        alerts.push({
          id: `ALT-RED-${farmer.id}-${Date.now().toString().slice(-4)}`,
          clusterId: cluster.id,
          farmerId: farmer.id,
          farmerName: farmer.name,
          farmerPhone: farmer.phone,
          distanceKm,
          alertLevel: 'RED_ALERT',
          channel: 'SMS',
          message: `🚨 URGENT LIVESTOCK HEALTH ALERT: High-risk outbreak reported within ${distanceKm} km of your farm in ${farmer.village}. Please isolate sick animals, suspend shared grazing, disinfect footwear, and report any mouth/hoof blisters immediately.`,
          sentAt: timestamp
        });
      } else if (distanceKm <= 8.0) {
        // Advisory Zone (4 - 8 km)
        alerts.push({
          id: `ALT-AMB-${farmer.id}-${Date.now().toString().slice(-4)}`,
          clusterId: cluster.id,
          farmerId: farmer.id,
          farmerName: farmer.name,
          farmerPhone: farmer.phone,
          distanceKm,
          alertLevel: 'AMBER_ADVISORY',
          channel: 'APP',
          message: `⚠️ BIOSECURITY ADVISORY: Active disease surveillance zone detected ${distanceKm} km away. Check your herd vaccination status, restrict animal visitors, and maintain vigilance.`,
          sentAt: timestamp
        });
      }
      // Beyond 8 km: No immediate alert to prevent alarm fatigue
    });

    return alerts;
  }
}
