# Setu: Healthcare Access Assistant 🩺

> **3-Line Pitch:**  
> **Setu is a safe, bilingual public healthcare assistant that demystifies verified Indian government medical services (Ayushman Bharat PM-JAY, ABHA Health ID, eSanjeevani, and Arogya Mandir) while preparing patients with an instant 30-second "Consult Brief Card" for doctors.**  
> It features a client-side **Medicine Scanner with Allergy & Comorbidity Safety Checks**, and a **Live GPS Smart Emergency Escalation Mode** with a calm 10-second countdown, Leaflet hospital navigation, ambulance dispatch, and one-tap WhatsApp family alerts.  
> Designed with low-literacy inclusion in mind, it provides voice input, English/Hindi toggles, and zero-data-leak local privacy.

---

## 🌟 The Problem We Solve
Indian citizens often face three major bottlenecks in public healthcare:
1. **Scheme Confusion:** Unclear criteria, scattered portals, and uncertainty about free entitlements under Ayushman Bharat (₹5L cashless cover), ABHA digital ID, and eSanjeevani teleconsultation.
2. **Medication Misunderstandings & Hidden Conflicts:** Patients frequently take over-the-counter strips without knowing if they clash with pre-existing conditions (e.g. NSAIDs in hypertension/ulcers, sugar syrups in diabetes, or penicillin in allergic patients).
3. **Emergency Delays & Lack of Live Navigation:** During acute distress (chest pain, stroke signs, poisoning, overdose), seconds count, but users often don't know the nearest emergency hospital, road ETA, or how to instantly alert their family.

Setu bridges this divide safely: it **never diagnoses or prescribes**, but guides citizens to verified schemes, analyzes medicine labels against their profile, structures their medical story into a camera-scannable card, and immediately escalates emergencies.

---

## 🚀 One-Command Launch

Run the local server instantly:

```bash
npm start
```
*(or `python3 -m http.server 5173`)*

Then open your browser at:  
👉 **http://localhost:5173**

---

## 💎 Core Capabilities

### 1. Feature 1: Medicine Scanner + Safety Check 📷
- **3 Input Modalities:**
  1. **Scan with Camera:** Live viewfinder using `navigator.mediaDevices.getUserMedia` with a soft rounded scan frame and gentle sage scan-line animation.
  2. **Upload Photo:** Upload any strip or box photo.
  3. **Type Name:** Fallback autocomplete search across common Indian brand names and generic salts.
- **Client-Side OCR (Tesseract.js):** Reads the label on device without sending medical photos to third-party clouds.
- **Fuzzy-Match against `medicines.json`:** Matches 25+ common Indian OTC and prescription medicines (Dolo 650, Pan 40, Cetirizine, Metformin, Amlodipine, Amoxicillin, Azithromycin, ORS, Telmisartan, Atorvastatin, Asthalin, Sinarest, Diclofenac, etc.).
- **Medicine Safety Check (The Standout):** Cross-checks the scanned drug against the user's recorded profile (allergies, pre-existing conditions, other daily medicines) with three clear states:
  - 🟢 **Green-Sage:** No conflict found in sample reference data.
  - 🟡 **Amber-Sand:** Check with a doctor/pharmacist (caution noted).
  - 🔴 **Clay-Red:** Possible critical conflict detected (e.g., penicillin allergy with Amoxicillin, high BP with phenylephrine cold formulas, NSAID with kidney/ulcer disease).
- **Condition-Based Info (Non-Prescriptive):** When entering conditions (fever, acidity, diabetes), explains medicine categories and lists 3 targeted questions to ask the doctor.
- **Action Buttons:** "Add to My Medicines" (syncs to Consult Brief), "Ask Doctor About This", and "Hear in Hindi" (`speechSynthesis`).
- **Demo Strip:** One-click demo button to test the Amoxicillin conflict check without needing a physical medicine strip.

### 2. Feature 2: Built-in Live GPS + Smart Emergency Escalation 🚨
- **Persistent Live Location Chip:** Header chip with subtle sage pulsing dot showing live coordinates or demo location (AIIMS New Delhi).
- **In-Memory Geolocation:** Uses `navigator.geolocation.watchPosition` with user permission; location is kept in memory only and never stored.
- **Severity Assessment Engine:** Scores red-flag symptoms, 1–10 pain slider, drug conflicts, and acute indicators ("unconscious", "not breathing", "overdose", "poison").
- **Auto-Escalation Full-Screen Mode (High/Critical):**
  1. **Calm 10-Second Countdown Ring:** Visual SVG ring with "Cancel, I'm okay" and "Call Now" buttons.
  2. **Direct Emergency Calls:** Big tap-to-call links for **108 Ambulance** and **112 National Emergency**.
  3. **Leaflet + OpenStreetMap Navigation:** Pins user location and 3 nearest emergency hospitals with Haversine distance, urban road ETA, and Google Maps directions.
  4. **Ambulance Dispatch Panel:** Mocked rapid response ambulances with direct dial links.
  5. **One-Tap WhatsApp Family Alert:** Sends a prefilled WhatsApp message with live Google Maps link, severity level, and medical profile.
  6. **Paramedic Rapid Intake Card:** Formats chief complaint, allergies, conditions, and medications for first responders with one-click print/save.
  7. **Simulate Emergency Button:** Home screen button allowing judges to experience the entire emergency escalation flow in seconds.

### 3. The Consult Brief Card (30-Second Doctor Sheet) 📋
- **Symptom Timeline:** Horizontal progression (Onset ➔ Progression ➔ Current Status).
- **Severity Dial Gauge:** Semicircular SVG dial with needle and colored zones (1–10 scale).
- **Medical Triad:** Chronic conditions, current medications, and known allergies.
- **Top 5 Contextual Doctor Questions:** Auto-generated questions tailored to symptoms and background.
- **Documents Checklist:** Aadhaar, ABHA ID card, Ayushman Card, and past reports.
- **Recommended Public Route:** Pathway (e.g. *eSanjeevani teleconsult ➔ Tests at Ayushman Arogya Mandir ➔ Jan Aushadhi generic medicines*).
- **Camera-Scannable QR Code:** SVG QR code encoding the structured clinical brief for instant mobile reading.
- **Export Options:** Print/PDF (`@media print` formatted for doctor prescription sheets), Copy Text, and Web Share API.

### 4. Verified Government Services Explorer 🏛️
Accredited cards with official portals and the note *"Confirm details on the official portal"*:
- **Ayushman Bharat PM-JAY** (Cashless hospitalization up to ₹5L; SECC & 70+ senior citizen universal coverage)
- **ABHA Health ID** (Ayushman Bharat Digital Mission unified record & OPD QR 'Scan & Share')
- **eSanjeevani 2.0** (National free doctor video consultation platform)
- **Ayushman Arogya Mandir** (Community comprehensive primary health, diagnostics & medicines)

### 5. Accessibility & Inclusion 🌐
- **English / हिन्दी Toggle:** 100% translation of UI labels, chat responses, prep wizard steps, and medicine scanner.
- **Web Speech API Voice Input:** Tap-to-speak button with live listening animation and fallback.
- **Large Text Mode:** One-click toggle (`Aa`) for enlarged high-contrast typography.

---

## 🎨 Design Philosophy
Strict adherence to the editorial, calm, human-centric palette:
- **Background:** Warm Ivory (`#F7F3EC`)
- **Primary:** Deep Teal (`#1F4E4A`)
- **Secondary:** Sage (`#8FA998` / `#E2ECE5`)
- **Surfaces:** Sand (`#E8DCC5` / `#F4EFE6`)
- **Accents:** Terracotta (`#C2654B`)
- **Urgent States Only:** Deep Clay Red (`#A63D2F`)
- **Typography:** Fraunces (Editorial Display Serif) + Plus Jakarta Sans (Body)
