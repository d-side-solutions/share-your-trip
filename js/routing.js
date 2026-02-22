import { config } from './config.js';

const ORS_BASE = 'https://api.openrouteservice.org';

function createRoutingService() {
  return {
    getApiKey() {
      return localStorage.getItem('syt-ors-key') || config.ORS_API_KEY || '';
    },

    setApiKey(key) {
      if (key) {
        localStorage.setItem('syt-ors-key', key.trim());
      } else {
        localStorage.removeItem('syt-ors-key');
      }
    },

    hasApiKey() {
      return !!this.getApiKey();
    },

    async geocode(query) {
      const key = this.getApiKey();
      if (!key || !query || query.length < 3) return [];

      try {
        const params = new URLSearchParams({
          api_key: key,
          text: query,
          size: 5,
          'boundary.country': 'CH,FR,IT,DE,AT',
        });
        const res = await fetch(`${ORS_BASE}/geocode/autocomplete?${params}`);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.features || []).map(f => ({
          label: f.properties.label,
          coords: f.geometry.coordinates, // [lng, lat]
        }));
      } catch {
        return [];
      }
    },

    async getDistance(fromCoords, toCoords) {
      const key = this.getApiKey();
      if (!key) return null;

      try {
        const res = await fetch(
          `${ORS_BASE}/v2/directions/driving-car?api_key=${key}&start=${fromCoords.join(',')}&end=${toCoords.join(',')}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        const distMeters = data.features?.[0]?.properties?.segments?.[0]?.distance;
        if (distMeters == null) return null;
        return Math.round(distMeters / 1000);
      } catch {
        return null;
      }
    }
  };
}

export { createRoutingService };
