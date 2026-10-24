/**
 * Setu Smart Emergency Escalation Module
 * Full-screen modal, 10s calm countdown ring, Leaflet map with 3 nearest hospitals,
 * Ambulance dispatch cards, WhatsApp family emergency alert, and Paramedic card.
 */

import { LiveLocationService } from './LiveLocation.js';

export const EmergencyModeModule = {
  hospitalsData: null,
  mapInstance: null,
  countdownInterval: null,
  countdownSeconds: 10,
  emergencySeverityInfo: null,

  init(hospitalsJson) {
    this.hospitalsData = hospitalsJson;
    this.bindEvents();
  },

  bindEvents() {
    // Simulate emergency button on top / home
    const simBtn = document.getElementById('simulate-emergency-btn');
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        this.triggerEmergency({
          level: 'Critical',
          score: 98,
          reason: 'Simulated high-risk scenario: acute chest crushing sensation and possible medicine overdose.',
          concern: 'Sudden crushing chest pain radiating to left arm with breathing distress after taking multiple pills.'
        });
      });
    }

    // Cancel countdown button
    const cancelBtn = document.getElementById('emergency-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancelEmergency());
    }

    // Call now button (skips countdown)
    const callNowBtn = document.getElementById('emergency-call-now-btn');
    if (callNowBtn) {
      callNowBtn.addEventListener('click', () => this.finishCountdown());
    }

    // Close emergency modal button
    const closeBtn = document.getElementById('emergency-close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // WhatsApp Alert Family button
    const alertFamilyBtn = document.getElementById('emergency-alert-family-btn');
    if (alertFamilyBtn) {
      alertFamilyBtn.addEventListener('click', () => this.sendWhatsAppFamilyAlert());
    }

    // Save Paramedic card button
    const printCardBtn = document.getElementById('paramedic-card-print-btn');
    if (printCardBtn) {
      printCardBtn.addEventListener('click', () => window.print());
    }
  },

  /**
   * Launch Full-Screen Emergency Mode
   */
  triggerEmergency(severityAssessment) {
    this.emergencySeverityInfo = severityAssessment;
    const modal = document.getElementById('emergency-modal');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Show reason explanation
    const reasonElem = document.getElementById('emergency-reason-text');
    if (reasonElem) {
      reasonElem.textContent = severityAssessment.reason || 'Critical red-flag symptoms detected.';
    }

    // Reset countdown
    this.startCountdown();

    // Calculate nearest hospitals & ambulances
    this.renderNearestHospitals();
    this.renderAmbulancePanel();
    this.renderParamedicCard();

    // Prepare map after modal is visible
    setTimeout(() => {
      this.initOrUpdateMap();
    }, 300);
  },

  startCountdown() {
    this.countdownSeconds = 10;
    this.updateCountdownDisplay();

    const ring = document.getElementById('countdown-circle');
    const callNowState = document.getElementById('emergency-call-options');
    const countdownState = document.getElementById('emergency-countdown-box');

    if (callNowState) callNowState.classList.add('hidden');
    if (countdownState) countdownState.classList.remove('hidden');

    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      this.countdownSeconds--;
      this.updateCountdownDisplay();

      if (this.countdownSeconds <= 0) {
        this.finishCountdown();
      }
    }, 1000);
  },

  updateCountdownDisplay() {
    const text = document.getElementById('countdown-seconds');
    const circle = document.getElementById('countdown-circle');
    if (text) text.textContent = this.countdownSeconds;

    if (circle) {
      // Circumference = 2 * PI * 40 = 251.2
      const strokeDashoffset = 251.2 * (1 - this.countdownSeconds / 10);
      circle.style.strokeDashoffset = strokeDashoffset;
    }
  },

  finishCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }

    const callNowState = document.getElementById('emergency-call-options');
    const countdownState = document.getElementById('emergency-countdown-box');

    if (countdownState) countdownState.classList.add('hidden');
    if (callNowState) callNowState.classList.remove('hidden');
  },

  cancelEmergency() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    this.closeModal();
  },

  closeModal() {
    const modal = document.getElementById('emergency-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = '';
  },

  /**
   * Initialize Leaflet + OpenStreetMap Map with User Pin and 3 Nearest Hospitals
   */
  initOrUpdateMap() {
    const mapContainer = document.getElementById('emergency-map');
    if (!mapContainer || !window.L) return;

    const userCoords = LiveLocationService.currentCoords;
    const hospitals = this.getSortedHospitals().slice(0, 3);

    if (!this.mapInstance) {
      this.mapInstance = window.L.map('emergency-map').setView([userCoords.lat, userCoords.lng], 13);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.mapInstance);
    } else {
      this.mapInstance.setView([userCoords.lat, userCoords.lng], 13);
      this.mapInstance.invalidateSize();
    }

    // User pin marker
    const userMarker = window.L.circleMarker([userCoords.lat, userCoords.lng], {
      color: '#A63D2F',
      fillColor: '#A63D2F',
      fillOpacity: 0.9,
      radius: 9
    }).addTo(this.mapInstance);
    userMarker.bindPopup(`<b>Your Location</b><br/>${userCoords.label}`).openPopup();

    // Hospital markers
    hospitals.forEach(h => {
      const marker = window.L.marker([h.lat, h.lng]).addTo(this.mapInstance);
      marker.bindPopup(`
        <b>${h.name}</b><br/>
        ETA: ${h.etaMins} mins (${h.distanceKm} km)<br/>
        <a href="tel:${h.phone}" style="color:#1F4E4A;font-weight:bold;">Call Hospital</a>
      `);
    });
  },

  /**
   * Sort hospitals by distance from current user coordinates
   */
  getSortedHospitals() {
    if (!this.hospitalsData || !this.hospitalsData.hospitals) return [];
    const u = LiveLocationService.currentCoords;

    return this.hospitalsData.hospitals.map(h => {
      const dist = LiveLocationService.calculateDistanceKm(u.lat, u.lng, h.lat, h.lng);
      const eta = LiveLocationService.calculateEtaMinutes(dist);
      return {
        ...h,
        distanceKm: dist,
        etaMins: eta
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);
  },

  renderNearestHospitals() {
    const container = document.getElementById('emergency-hospitals-list');
    if (!container) return;

    const hospitals = this.getSortedHospitals().slice(0, 3);
    container.innerHTML = '';

    hospitals.forEach((h, idx) => {
      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-xl bg-white border border-[#D6C7A9] flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-1 mb-1">
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E2ECE5] text-[#1F4E4A]">
              ${idx === 0 ? 'NEAREST APEX' : 'EMERGENCY ER'}
            </span>
            <span class="text-xs font-bold text-[#A63D2F]">${h.etaMins} mins ETA (${h.distanceKm} km)</span>
          </div>
          <h4 class="text-xs sm:text-sm font-bold text-[#1F4E4A]">${h.name}</h4>
          <p class="text-[11px] text-[#596B68] line-clamp-1">${h.address}</p>
        </div>

        <div class="flex items-center gap-2 mt-3 pt-2 border-t border-[#D6C7A9]/60">
          <a href="tel:${h.phone}" class="btn-primary text-xs py-1.5 px-3 flex-1 text-center">
            📞 Call (${h.displayPhone})
          </a>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}" target="_blank" rel="noopener noreferrer" class="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1">
            <span>🗺️ Dir</span>
          </a>
        </div>
      `;
      container.appendChild(card);
    });
  },

  renderAmbulancePanel() {
    const container = document.getElementById('emergency-ambulance-list');
    if (!container || !this.hospitalsData) return;

    container.innerHTML = '';
    const ambulances = this.hospitalsData.ambulances || [];

    ambulances.forEach(a => {
      const card = document.createElement('div');
      card.className = 'p-3 rounded-xl bg-[#F4EFE6] border border-[#D6C7A9] flex items-center justify-between gap-2';
      card.innerHTML = `
        <div>
          <div class="text-xs font-bold text-[#1F4E4A]">${a.name}</div>
          <div class="text-[11px] text-[#596B68]">${a.type} • Approx ${a.baseEtaMin} min dispatch</div>
        </div>
        <a href="tel:${a.phone}" class="btn-urgent text-xs py-1.5 px-3 shrink-0">
          📞 Call ${a.phone}
        </a>
      `;
      container.appendChild(card);
    });
  },

  /**
   * One-Tap WhatsApp Family Alert
   */
  sendWhatsAppFamilyAlert() {
    const u = LiveLocationService.currentCoords;
    const p = window.state ? window.state.prepData : {};
    const mapsLink = `https://www.google.com/maps?q=${u.lat},${u.lng}`;

    const text = `🚨 EMERGENCY MEDICAL ALERT VIA SETU:
I am experiencing an acute health emergency.
- Severity: ${this.emergencySeverityInfo ? this.emergencySeverityInfo.level : 'Critical'}
- Main concern: ${p.concern || 'Acute distress'}
- Current Location: ${mapsLink}
- Known conditions: ${p.conditions ? p.conditions.join(', ') : 'None'}
- Allergies: ${p.allergies || 'None'}
- Current medicines: ${p.medicines || 'None'}

Please reach out or meet me at the nearest emergency hospital immediately!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  },

  /**
   * Paramedic Info Card (Doctor / First Responder Handover)
   */
  renderParamedicCard() {
    const container = document.getElementById('paramedic-card-content');
    if (!container) return;

    const p = window.state ? window.state.prepData : {};
    const u = LiveLocationService.currentCoords;

    container.innerHTML = `
      <div class="p-4 rounded-xl bg-white border border-[#D6C7A9] text-xs space-y-2">
        <div class="flex items-center justify-between border-b border-[#D6C7A9] pb-1.5">
          <span class="font-bold text-[#A63D2F] uppercase tracking-wider text-[11px]">Paramedic Rapid Intake Card</span>
          <span class="text-[10px] text-[#596B68]">${new Date().toLocaleTimeString()}</span>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="font-semibold text-[#596B68] block">Chief Concern:</span>
            <span class="font-bold text-[#1F4E4A]">${p.concern || 'Acute distress'}</span>
          </div>
          <div>
            <span class="font-semibold text-[#596B68] block">Location:</span>
            <span class="text-[#26302F]">${u.label}</span>
          </div>
          <div>
            <span class="font-semibold text-[#596B68] block">Known Allergies:</span>
            <span class="font-bold text-[#A63D2F]">${p.allergies || 'None recorded'}</span>
          </div>
          <div>
            <span class="font-semibold text-[#596B68] block">Pre-existing:</span>
            <span class="text-[#26302F]">${p.conditions && p.conditions.length ? p.conditions.join(', ') : 'None'}</span>
          </div>
          <div class="col-span-2">
            <span class="font-semibold text-[#596B68] block">Current Medications:</span>
            <span class="text-[#26302F]">${p.medicines || 'None recorded'}</span>
          </div>
        </div>
      </div>
    `;
  }
};
