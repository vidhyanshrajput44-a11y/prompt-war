/**
 * Setu Live Location Service
 * Uses navigator.geolocation.watchPosition with clear user permission explainer,
 * zero remote persistence (in-memory only), manual PIN/city fallback,
 * and Haversine distance calculations for hospitals.
 */

export const LiveLocationService = {
  currentCoords: {
    lat: 28.5672,
    lng: 77.2100,
    label: "AIIMS Campus, New Delhi (Default Demo)",
    isLiveGps: false
  },
  watchId: null,
  listeners: [],

  init() {
    this.updateHeaderChip();
  },

  addListener(fn) {
    this.listeners.push(fn);
  },

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.currentCoords));
    this.updateHeaderChip();
  },

  /**
   * Request GPS Location with permission dialogue handling
   */
  async requestGps() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Using demo location.");
      return;
    }

    try {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            label: `Live GPS: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`,
            isLiveGps: true,
            accuracy: position.coords.accuracy
          };
          this.notifyListeners();
        },
        (error) => {
          console.warn("Geolocation watch error:", error.message);
          this.currentCoords.isLiveGps = false;
          this.notifyListeners();
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } catch (e) {
      console.error("GPS exception:", e);
    }
  },

  /**
   * Manual PIN or City Fallback
   */
  setManualLocation(pinOrCity) {
    const input = (pinOrCity || '').trim().toLowerCase();
    if (input.includes('110029') || input.includes('delhi') || input.includes('aiims')) {
      this.currentCoords = { lat: 28.5672, lng: 77.2100, label: "New Delhi (AIIMS / South Delhi)", isLiveGps: false };
    } else if (input.includes('mumbai') || input.includes('400001')) {
      this.currentCoords = { lat: 18.9400, lng: 72.8350, label: "Mumbai (Fort / GT Hospital)", isLiveGps: false };
    } else if (input.includes('bangalore') || input.includes('bengaluru') || input.includes('560001')) {
      this.currentCoords = { lat: 12.9716, lng: 77.5946, label: "Bengaluru (Victoria Hospital)", isLiveGps: false };
    } else {
      this.currentCoords = { lat: 28.5672, lng: 77.2100, label: `PIN / Location: ${pinOrCity}`, isLiveGps: false };
    }
    this.notifyListeners();
  },

  /**
   * Haversine Distance Formula (kilometers)
   */
  calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  },

  /**
   * Calculate Urban Road ETA (Minutes)
   */
  calculateEtaMinutes(distanceKm) {
    // Average urban ambulance speed ~ 25 km/h + 2 min prep
    const mins = Math.round((distanceKm / 25) * 60) + 2;
    return Math.max(mins, 3);
  },

  /**
   * Update the header live location indicator chip
   */
  updateHeaderChip() {
    const chip = document.getElementById('header-location-chip');
    const label = document.getElementById('header-location-text');
    const dot = document.getElementById('header-location-dot');

    if (!chip || !label) return;

    label.textContent = this.currentCoords.isLiveGps ? 'Live GPS Active' : (this.currentCoords.label.split('(')[0].trim() || 'Demo: New Delhi');
    if (dot) {
      if (this.currentCoords.isLiveGps) {
        dot.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-ping';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-[#8FA998]';
      }
    }
  }
};
