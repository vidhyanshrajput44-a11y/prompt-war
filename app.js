/**
 * Setu: Healthcare Access Assistant
 * Core Application Logic, Triage Engine, Consult Brief Generator & Accessibility
 * With Medicine Scanner (Feature 1) and Live GPS Emergency Escalation (Feature 2)
 */

import { SafetyCheckEngine } from './js/safetyCheck.js';
import { SeverityEngine } from './js/severity.js';
import { LiveLocationService } from './js/LiveLocation.js';
import { MedicineScannerModule } from './js/MedicineScanner.js';
import { EmergencyModeModule } from './js/EmergencyMode.js';

// State Management
export const state = {
  lang: 'en', // 'en' | 'hi'
  largeText: false,
  urgencyLevel: 'calm', // 'calm' | 'moderate' | 'urgent'
  urgentEscalated: false,
  prepStep: 1,
  prepData: {
    concern: '',
    duration: '3 days',
    progression: 'Gradually worsening',
    severity: 5,
    medicines: '',
    allergies: '',
    conditions: []
  },
  briefGenerated: false,
  activeTab: 'chat', // 'chat' | 'prep' | 'scanner' | 'services'
  chatHistory: []
};

// Make state globally accessible for modules
window.state = state;

// Bilingual Dictionaries
const i18n = {
  en: {
    appTitle: "Setu",
    appSubtitle: "Healthcare Access Assistant",
    tagline: "Healthcare you can understand, trust and reach",
    disclaimerBar: "I explain verified government services and help you prepare for visits. I am not a doctor.",
    disclaimerBarUrgent: "CRITICAL: Urgent medical signs detected. Seek immediate in-person emergency care.",
    triageCalm: "Triage: Normal / Self-Care",
    triageModerate: "Triage: Consult Advised",
    triageUrgent: "Triage: URGENT / Emergency",
    tabChat: "AI Guide",
    tabPrep: "Prep Flow",
    tabScanMedicine: "Scan Medicine",
    tabServices: "Verified Govt Services",
    tryDemoRoutine: "Try Demo",
    tryDemoUrgent: "Urgent Demo",
    howItWorksBtn: "How Setu Works",
    chatPlaceholder: "Describe how you're feeling or ask about Ayushman Bharat, ABHA, eSanjeevani...",
    send: "Send",
    speak: "Tap to Speak",
    listening: "Listening... speak now",
    urgentTitle: "CRITICAL: Please Seek Emergency Medical Care Now",
    urgentSubtitle: "Red-flag symptoms detected. Do not delay care. Free automated advice has been suspended for your immediate safety.",
    urgentCallAmbulance: "Call 108 (Ambulance)",
    urgentCallEmergency: "Call 112 (National Emergency)",
    urgentHospital: "Go to the nearest District Hospital / Emergency Room immediately.",
    prepTitle: "Doctor Visit Preparation Flow",
    prepStep1Title: "1. What is your primary symptom or concern?",
    prepStep2Title: "2. How long have you experienced this?",
    prepStep3Title: "3. How severe is the discomfort? (1 - 10)",
    prepStep4Title: "4. Medical history, current medicines & allergies",
    generateBriefBtn: "Generate 30-Second Consult Brief",
    briefTitle: "Patient Consultation Brief",
    briefSubtitle: "Show this card to your doctor — structured for a 30-second rapid clinical overview.",
    downloadPdf: "Print / Save PDF",
    shareBrief: "Share Brief",
    copySummary: "Copy Summary",
    topQuestionsTitle: "Top 5 Questions to Ask Your Doctor",
    documentsChecklistTitle: "Documents to Carry to the Clinic",
    serviceRouteTitle: "Recommended Public Healthcare Route",
    verifiedSource: "Verified Official Source",
    officialWarning: "Confirm details on the official portal.",
    scanTitle: "Medicine Scanner",
    scanSubtitle: "Feature 1 • Instant Identification & Safety Cross-Check",
    trySampleStrip: "Try Sample Strip",
    tileCameraTitle: "Scan with Camera",
    tileCameraSub: "Live viewfinder with sage scan-line",
    tileUploadTitle: "Upload Photo",
    tileUploadSub: "Select strip or box image",
    tileTypeTitle: "Type Name",
    tileTypeSub: "Fast autocomplete search",
    condGuideTitle: "Condition-Based Medicine Guide (Non-Prescriptive)",
    condGuideSub: "Enter a common condition (e.g., fever, acidity, diabetes, joint pain) to understand general medicine classes and 3 questions to ask your doctor.",
    exploreClassesBtn: "Explore Classes"
  },
  hi: {
    appTitle: "सेतु",
    appSubtitle: "स्वास्थ्य सेवा सहायक",
    tagline: "स्वास्थ्य सेवा जिसे आप समझ सकें, भरोसा कर सकें और पहुँच सकें",
    disclaimerBar: "मैं सरकारी स्वास्थ्य योजनाओं की जानकारी देता हूँ और डॉक्टर से मिलने की तैयारी में मदद करता हूँ। मैं डॉक्टर नहीं हूँ।",
    disclaimerBarUrgent: "गंभीर स्थिति: आपातकालीन लक्षण मिले हैं। तुरंत अस्पताल या एम्बुलेंस से संपर्क करें।",
    triageCalm: "जांच स्तर: सामान्य / स्व-देखभाल",
    triageModerate: "जांच स्तर: परामर्श आवश्यक",
    triageUrgent: "जांच स्तर: आपातकालीन (URGENT)",
    tabChat: "मार्गदर्शक",
    tabPrep: "तैयारी प्रपत्र",
    tabScanMedicine: "दवा स्कैन करें",
    tabServices: "प्रमाणित सरकारी सेवाएं",
    tryDemoRoutine: "डेमो देखें",
    tryDemoUrgent: "आपातकालीन डेमो",
    howItWorksBtn: "सेतु कैसे काम करता है?",
    chatPlaceholder: "अपनी परेशानी बताएं या आयुष्मान भारत, आभा आईडी, ई-संजीवनी के बारे में पूछें...",
    send: "भेजें",
    speak: "बोलकर बताएं",
    listening: "सुन रहे हैं... कृपया बोलें",
    urgentTitle: "अति आवश्यक: तुरंत आपातकालीन चिकित्सा सहायता लें",
    urgentSubtitle: "गंभीर लक्षण पाए गए हैं। तुरंत आपातकालीन नंबर पर कॉल करें। आपकी सुरक्षा के लिए चैट परामर्श रोक दिया गया है।",
    urgentCallAmbulance: "108 पर कॉल करें (एम्बुलेंस)",
    urgentCallEmergency: "112 पर कॉल करें (राष्ट्रीय आपातकाल)",
    urgentHospital: "तुरंत निकटतम सरकारी अस्पताल / आपातकालीन कक्ष (ER) जाएं।",
    prepTitle: "डॉक्टर परामर्श तैयारी प्रपत्र",
    prepStep1Title: "1. आपकी मुख्य समस्या या लक्षण क्या है?",
    prepStep2Title: "2. यह समस्या कब से है?",
    prepStep3Title: "3. दर्द या असुविधा कितनी तीव्र है? (1 से 10)",
    prepStep4Title: "4. वर्तमान दवाइयां, एलर्जी एवं अन्य बीमारियां",
    generateBriefBtn: "डॉक्टर के लिए 30-सेकंड कार्ड बनाएं",
    briefTitle: "रोगी परामर्श संक्षिप्त पत्र (Consult Brief)",
    briefSubtitle: "डॉक्टर को यह कार्ड दिखाएं — 30 सेकंड में पूरी स्थिति समझने के लिए तैयार।",
    downloadPdf: "प्रिंट / PDF सहेजें",
    shareBrief: "शेयर करें",
    copySummary: "कॉपी करें",
    topQuestionsTitle: "डॉक्टर से पूछने हेतु 5 मुख्य प्रश्न",
    documentsChecklistTitle: "अस्पताल ले जाने हेतु जरूरी दस्तावेज",
    serviceRouteTitle: "सुझाई गई सरकारी स्वास्थ्य सेवा मार्ग",
    verifiedSource: "प्रमाणित सरकारी स्रोत",
    officialWarning: "आधिकारिक पोर्टल पर विवरण अवश्य सत्यापित करें।",
    scanTitle: "दवा स्कैनर (Medicine Scanner)",
    scanSubtitle: "फ़ीचर 1 • त्वरित पहचान एवं सुरक्षा मिलान",
    trySampleStrip: "नमूना स्ट्रिप देखें",
    tileCameraTitle: "कैमरा से स्कैन करें",
    tileCameraSub: "सॉफ्ट स्कैन फ्रेम व ऑटो-डिटेक्ट",
    tileUploadTitle: "फोटो अपलोड करें",
    tileUploadSub: "दवा के पत्ते या बॉक्स की तस्वीर चुनें",
    tileTypeTitle: "दवा का नाम लिखें",
    tileTypeSub: "ऑटो-सर्च व त्वरित सुझाव",
    condGuideTitle: "बीमारी आधारित दवा मार्गदर्शिका (गैर-प्रिस्क्रिप्शन)",
    condGuideSub: "सामान्य समस्या लिखें (जैसे बुखार, एसिडिटी, डायबिटीज) और डॉक्टर से पूछने हेतु 3 मुख्य प्रश्न जानें।",
    exploreClassesBtn: "श्रेणियां जानें"
  }
};

// Verified Government Services Database
const verifiedServices = [
  {
    id: 'pmjay',
    name: {
      en: "Ayushman Bharat PM-JAY",
      hi: "आयुष्मान भारत प्रधानमंत्री जन आरोग्य योजना (PM-JAY)"
    },
    tag: {
      en: "Free Hospitalization Cover",
      hi: "मुफ्त अस्पताल भर्ती सुरक्षा"
    },
    whatItIs: {
      en: "World's largest government-funded health assurance scheme providing ₹5 Lakhs per family per year for secondary and tertiary care hospitalization.",
      hi: "विश्व की सबसे बड़ी सरकारी स्वास्थ्य योजना जो प्रति परिवार प्रति वर्ष ₹5 लाख तक का कैशलेस द्वितीयक और तृतीयक अस्पताल उपचार प्रदान करती है।"
    },
    eligibility: {
      en: "Identified families from SECC 2011 data, NFSA ration card holders, and expanded criteria according to state norms. All senior citizens aged 70+ now eligible irrespective of income.",
      hi: "SECC 2011 सूची में शामिल परिवार, राष्ट्रीय खाद्य सुरक्षा कार्ड धारक, और 70 वर्ष से अधिक आयु के सभी वरिष्ठ नागरिक (आय सीमा मुक्त)।"
    },
    documents: {
      en: "Aadhaar Card, Ration Card / Family ID, Mobile Number linked to Aadhaar.",
      hi: "आधार कार्ड, राशन कार्ड / परिवार पहचान पत्र, आधार से जुड़ा मोबाइल नंबर।"
    },
    steps: {
      en: [
        "1. Check eligibility on mera.pmjay.gov.in or visit nearest Arogya Mitra at a Govt Hospital.",
        "2. Complete biometric e-KYC using Aadhaar.",
        "3. Download the Ayushman Golden Card.",
        "4. Show card at any of 28,000+ empanelled public or private hospitals for cashless treatment."
      ],
      hi: [
        "1. mera.pmjay.gov.in पर पात्रता जांचें या नजदीकी आरोग्य मित्र से मिलें।",
        "2. आधार के माध्यम से बायोमेट्रिक e-KYC पूरा करें।",
        "3. आयुष्मान गोल्डन कार्ड डाउनलोड करें।",
        "4. कैशलेस इलाज हेतु किसी भी सूचीबद्ध सरकारी या निजी अस्पताल में कार्ड दिखाएं।"
      ]
    },
    sourceUrl: "https://pmjay.gov.in",
    sourceBadge: "pmjay.gov.in (MoHFW)"
  },
  {
    id: 'abha',
    name: {
      en: "ABHA Health ID (Ayushman Bharat Digital Mission)",
      hi: "आभा (ABHA) डिजिटल हेल्थ आईडी"
    },
    tag: {
      en: "Unified Digital Health Record",
      hi: "डिजिटल स्वास्थ्य पहचान पत्र"
    },
    whatItIs: {
      en: "A 14-digit unique health account number that digitizes and links your lab reports, prescriptions, and medical history across clinics nationwide securely.",
      hi: "14 अंकों का विशिष्ट स्वास्थ्य खाता जो आपके लैब टेस्ट, पर्चियों और मेडिकल रिकॉर्ड को डिजिटल रूप से सुरक्षित रूप से जोड़ता है।"
    },
    eligibility: {
      en: "Every citizen of India. No income criteria, 100% free and voluntary.",
      hi: "भारत का प्रत्येक नागरिक। कोई आय सीमा नहीं, बिल्कुल मुफ्त और स्वैच्छिक।"
    },
    documents: {
      en: "Aadhaar Card or Driving Licence, active mobile number for OTP.",
      hi: "आधार कार्ड या ड्राइविंग लाइसेंस, ओटीपी सत्यापन हेतु सक्रिय मोबाइल नंबर।"
    },
    steps: {
      en: [
        "1. Visit abdm.gov.in or download the ABHA mobile app.",
        "2. Enter Aadhaar number and authenticate with OTP.",
        "3. Choose an ABHA address (like username@abdm).",
        "4. Scan QR code at hospital OPD counters for instant, paperless registration without standing in queues."
      ],
      hi: [
        "1. abdm.gov.in पर जाएं या ABHA मोबाइल ऐप डाउनलोड करें।",
        "2. आधार नंबर दर्ज कर OTP सत्यापित करें।",
        "3. अपना ABHA पता चुनें (जैसे नाम@abdm)।",
        "4. अस्पताल ओपीडी काउंटर पर बिना लाइन लगे 'Scan & Share' QR कोड से तुरंत पर्ची बनवाएं।"
      ]
    },
    sourceUrl: "https://abdm.gov.in",
    sourceBadge: "abdm.gov.in (NHA)"
  },
  {
    id: 'esanjeevani',
    name: {
      en: "eSanjeevani Telemedicine (eSanjeevani 2.0)",
      hi: "ई-संजीवनी राष्ट्रीय टेलीमेडिसिन सेवा"
    },
    tag: {
      en: "Free Doctor Video Consult from Home",
      hi: "घर बैठे डॉक्टर से मुफ्त वीडियो परामर्श"
    },
    whatItIs: {
      en: "Government of India's flagship telemedicine platform connecting patients directly with registered MBBS doctors and specialists over free video call, generating digital prescriptions.",
      hi: "भारत सरकार का निःशुल्क टेली-परामर्श पोर्टल जो मरीजों को घर बैठे योग्य डॉक्टरों और विशेषज्ञों से वीडियो कॉल पर जोड़ता है व वैध डिजिटल पर्चा देता है।"
    },
    eligibility: {
      en: "Open to anyone residing in India with internet access. No fees charged.",
      hi: "भारत का कोई भी नागरिक जिसके पास फोन या इंटरनेट हो। पूरी तरह निःशुल्क।"
    },
    documents: {
      en: "Mobile number for OTP, previous prescription or report photos (optional).",
      hi: "मोबाइल नंबर (OTP हेतु), पुराने पर्चे या रिपोर्ट की फोटो (यदि उपलब्ध हो)।"
    },
    steps: {
      en: [
        "1. Open esanjeevani.mohfw.gov.in or the eSanjeevani OPD app.",
        "2. Register with mobile number and select your state/specialty OPD.",
        "3. Wait in the virtual queue; join video call when doctor is ready.",
        "4. Discuss symptoms and immediately download the signed electronic prescription."
      ],
      hi: [
        "1. esanjeevani.mohfw.gov.in खोलें या ई-संजीवनी ऐप इंस्टॉल करें।",
        "2. मोबाइल नंबर से लॉग इन करें और अपनी भाषा/विभाग चुनें।",
        "3. डॉक्टर के ऑनलाइन आने पर वीडियो कॉल से जुड़ें।",
        "4. अपनी समस्या बताएं और कॉल समाप्त होते ही वैध डिजिटल पर्चा डाउनलोड करें।"
      ]
    },
    sourceUrl: "https://esanjeevani.mohfw.gov.in",
    sourceBadge: "esanjeevani.mohfw.gov.in (MoHFW)"
  },
  {
    id: 'arogyamandir',
    name: {
      en: "Ayushman Arogya Mandir",
      hi: "आयुष्मान आरोग्य मंदिर (स्वास्थ्य एवं कल्याण केंद्र)"
    },
    tag: {
      en: "Comprehensive Primary Health & Diagnostics",
      hi: "प्राथमिक स्वास्थ्य केंद्र एवं मुफ्त जांच"
    },
    whatItIs: {
      en: "Upgraded primary health and wellness centres located within your community offering 12 packages of free primary healthcare, maternal care, non-communicable disease screening, and essential medicines.",
      hi: "गाँव और मोहल्लों में स्थित सरकारी केंद्र जो प्राथमिक उपचार, मुफ्त आवश्यक दवाइयां, 14+ प्रकार की लैब जांच और योग/कल्याण सुविधाएं प्रदान करते हैं।"
    },
    eligibility: {
      en: "Universal access for all walk-in community members.",
      hi: "सभी नागरिकों के लिए बिना किसी भेदभाव के निःशुल्क उपलब्ध।"
    },
    documents: {
      en: "Aadhaar / ABHA ID (helpful for records, but no citizen is turned away).",
      hi: "आधार कार्ड / आभा आईडी (पंजीकरण हेतु उत्तम, अनिवार्य नहीं)।"
    },
    steps: {
      en: [
        "1. Locate your nearest Ayushman Arogya Mandir (Sub-Centre / PHC).",
        "2. Walk in for free blood pressure, blood sugar, or general checkups.",
        "3. Receive free essential medicines and basic diagnostic testing.",
        "4. If needed, the Community Health Officer (CHO) connects you to a specialist via eSanjeevani teleconsultation on the spot."
      ],
      hi: [
        "1. अपने नजदीकी आयुष्मान आरोग्य मंदिर में जाएं।",
        "2. मुफ्त बीपी, शुगर, हीमोग्लोबिन या सामान्य स्वास्थ्य जांच करवाएं।",
        "3. सरकार द्वारा अनुमोदित मुफ्त दवाइयां प्राप्त करें।",
        "4. आवश्यकता पड़ने पर केंद्र के अधिकारी तुरंत ई-संजीवनी द्वारा बड़े डॉक्टर से टेली-कंसल्ट कराते हैं।"
      ]
    },
    sourceUrl: "https://arogyamandir.mohfw.gov.in",
    sourceBadge: "arogyamandir.mohfw.gov.in"
  }
];

/**
 * Scan text to determine triage urgency level using SeverityEngine
 */
function scanUrgency(text) {
  const assessment = SeverityEngine.assessSeverity({
    concern: text,
    sliderSeverity: state.prepData.severity,
    lang: state.lang
  });

  if (assessment.level === 'Critical' || assessment.level === 'High') {
    return 'urgent';
  } else if (assessment.level === 'Moderate') {
    return 'moderate';
  }
  return 'calm';
}

/**
 * Update the Triage Pulse Indicator in Header
 */
function updateTriagePulse(level) {
  state.urgencyLevel = level;
  const pulseDot = document.getElementById('triage-pulse-dot');
  const pulseText = document.getElementById('triage-pulse-text');
  const banner = document.getElementById('urgent-escalation-banner');
  const chatInputArea = document.getElementById('chat-input-wrapper');

  if (!pulseDot || !pulseText) return;

  pulseDot.className = 'triage-pulse-dot';

  if (level === 'urgent') {
    pulseDot.classList.add('pulse-red');
    pulseText.textContent = i18n[state.lang].triageUrgent;
    pulseText.className = 'text-xs font-semibold text-red-800';
    if (banner) banner.classList.remove('hidden');
    state.urgentEscalated = true;
    if (chatInputArea) {
      chatInputArea.classList.add('opacity-50', 'pointer-events-none');
    }
  } else if (level === 'moderate') {
    pulseDot.classList.add('pulse-amber');
    pulseText.textContent = i18n[state.lang].triageModerate;
    pulseText.className = 'text-xs font-semibold text-amber-800';
    if (!state.urgentEscalated && banner) banner.classList.add('hidden');
  } else {
    pulseDot.classList.add('pulse-green');
    pulseText.textContent = i18n[state.lang].triageCalm;
    pulseText.className = 'text-xs font-semibold text-emerald-800';
    if (!state.urgentEscalated && banner) banner.classList.add('hidden');
  }
}

/**
 * Speech Recognition Handler (Web Speech API)
 */
let recognition = null;
let isRecording = false;

function setupSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceBtn = document.getElementById('voice-input-btn');
  const chatInput = document.getElementById('chat-input');
  const voiceStatus = document.getElementById('voice-status');

  if (!SpeechRecognition) {
    if (voiceBtn) {
      voiceBtn.title = "Voice input is not supported in this browser. Please type.";
      voiceBtn.classList.add('opacity-50');
      voiceBtn.addEventListener('click', () => {
        alert("Voice recognition is not supported in your browser. Please type your message.");
      });
    }
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = state.lang === 'hi' ? 'hi-IN' : 'en-IN';

  recognition.onstart = () => {
    isRecording = true;
    if (voiceBtn) voiceBtn.classList.add('mic-active');
    if (voiceStatus) {
      voiceStatus.classList.remove('hidden');
      voiceStatus.textContent = i18n[state.lang].listening;
    }
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (chatInput) {
      chatInput.value = transcript;
      const level = scanUrgency(transcript);
      updateTriagePulse(level);
    }
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    isRecording = false;
    if (voiceBtn) voiceBtn.classList.remove('mic-active');
    if (voiceStatus) voiceStatus.classList.add('hidden');
  };

  recognition.onend = () => {
    isRecording = false;
    if (voiceBtn) voiceBtn.classList.remove('mic-active');
    if (voiceStatus) voiceStatus.classList.add('hidden');
  };

  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.lang = state.lang === 'hi' ? 'hi-IN' : 'en-IN';
        recognition.start();
      }
    });
  }
}

/**
 * Rule-Based Chat Assistant Response Generator
 */
function handleBotResponse(userMsg) {
  const assessment = SeverityEngine.assessSeverity({
    concern: userMsg,
    sliderSeverity: state.prepData.severity,
    lang: state.lang
  });

  if (assessment.shouldEscalate) {
    updateTriagePulse('urgent');
    // Launch full emergency escalation modal!
    EmergencyModeModule.triggerEmergency(assessment);

    return {
      text: state.lang === 'hi'
        ? `⚠️ **चेतावनी: आपातकालीन लक्षण पाए गए हैं!** (${assessment.reason})\nकृपया तुरंत 108 या 112 डायल करें। निकटतम अस्पताल का नक्शा व एम्बुलेंस विवरण स्क्रीन पर लोड कर दिया गया है।`
        : `⚠️ **WARNING: Critical Emergency Escalation Triggered!** (${assessment.reason})\nPlease call 108 or 112 immediately. Full emergency navigation and hospital map have been opened on your screen.`,
      isUrgent: true
    };
  }

  updateTriagePulse(assessment.level === 'Moderate' ? 'moderate' : 'calm');

  const clean = userMsg.toLowerCase();
  const lang = state.lang;

  // Keyword intents
  if (clean.includes('ayushman') || clean.includes('pmjay') || clean.includes('pm-jay') || clean.includes('golden card')) {
    return {
      text: lang === 'hi'
        ? "📌 **आयुष्मान भारत (PM-JAY) योजना:**\n• **कवर:** प्रति परिवार प्रति वर्ष ₹5 लाख तक का मुफ्त अस्पताल इलाज।\n• **पात्रता:** SECC 2011 सूची, राशन कार्ड धारक, तथा 70 वर्ष से अधिक आयु के सभी वरिष्ठ नागरिक।\n• **दस्तावेज:** आधार कार्ड, राशन कार्ड।\n• **आधिकारिक पोर्टल:** [pmjay.gov.in](https://pmjay.gov.in) पर पात्रता जांचें या टोल-फ्री 14555 पर संपर्क करें।\n\n*पुष्टि आधिकारिक पोर्टल से करें। मैं डॉक्टर नहीं हूँ।*"
        : "📌 **Ayushman Bharat PM-JAY:**\n• **Coverage:** Up to ₹5 Lakhs per family/year for free secondary & tertiary hospital treatment.\n• **Eligibility:** Families in SECC 2011, eligible ration card holders, and now all senior citizens aged 70+.\n• **Documents Needed:** Aadhaar Card & Ration Card/Family ID.\n• **Official Portal:** Check eligibility at [pmjay.gov.in](https://pmjay.gov.in) or call 14555.\n\n*Confirm details on official portal. I am not a doctor.*"
    };
  }

  if (clean.includes('sanjeevani') || clean.includes('teleconsult') || clean.includes('video call') || clean.includes('online doctor')) {
    return {
      text: lang === 'hi'
        ? "🩺 **ई-संजीवनी (eSanjeevani) टेलीमेडिसिन:**\n• **क्या है:** भारत सरकार की मुफ्त राष्ट्रीय वीडियो-कंसल्टेशन सेवा।\n• **उपयोग कैसे करें:** esanjeevani.mohfw.gov.in या eSanjeevani ऐप खोलें, मोबाइल नंबर से OTP दर्ज करें, डॉक्टर से वीडियो कॉल पर परामर्श लें और डिजिटल पर्चा प्राप्त करें।\n• **लागत:** 100% निःशुल्क।\n\n*पुष्टि आधिकारिक पोर्टल से करें। आपातकाल में 108 डायल करें।*"
        : "🩺 **eSanjeevani Telemedicine:**\n• **What it is:** Free Govt. of India tele-consultation platform connecting you directly with qualified doctors via video call.\n• **How to use:** Visit [esanjeevani.mohfw.gov.in](https://esanjeevani.mohfw.gov.in), enter mobile number for OTP, queue up, and consult doctor to get an official digital prescription.\n• **Cost:** 100% Free.\n\n*Confirm details on official portal. In emergencies, call 108.*"
    };
  }

  if (clean.includes('abha') || clean.includes('health id') || clean.includes('digital id')) {
    return {
      text: lang === 'hi'
        ? "💳 **आभा (ABHA) हेल्थ आईडी:**\n• **क्या है:** 14 अंकों का आपका डिजिटल स्वास्थ्य खाता, जिससे आपके सभी मेडिकल रिकॉर्ड सुरक्षित रूप से जुड़ते हैं।\n• **फायदा:** अस्पताल में लंबी लाइनों के बिना 'Scan & Share' QR कोड से 1 मिनट में ओपीडी पर्ची प्राप्त करें।\n• **बनाने का तरीका:** abdm.gov.in पर आधार और मोबाइल OTP से 2 मिनट में बनाएं।\n\n*स्रोत: abdm.gov.in*"
        : "💳 **ABHA Health ID (Ayushman Bharat Digital Mission):**\n• **What it is:** A 14-digit unique health account that safely links your lab reports, prescriptions, and health history.\n• **Superpower:** Skip long hospital queues using OPD 'Scan & Share' QR codes.\n• **How to create:** Instant creation at [abdm.gov.in](https://abdm.gov.in) using your Aadhaar and OTP.\n\n*Source: abdm.gov.in*"
    };
  }

  if (clean.includes('arogya mandir') || clean.includes('wellness centre') || clean.includes('phc') || clean.includes('clinic')) {
    return {
      text: lang === 'hi'
        ? "🏥 **आयुष्मान आरोग्य मंदिर:**\n• **क्या है:** आपके नजदीकी सरकारी प्राथमिक स्वास्थ्य केंद्र।\n• **सुविधाएं:** सामान्य बीमारियों का मुफ्त इलाज, 14+ प्रकार की मुफ्त लैब जांच (शुगर, बीपी, खून जांच), और आवश्यक मुफ्त दवाइयां।\n• **कैसे पहुंचें:** नजदीकी उप-केंद्र या पीएचसी जाएं। कोई शुल्क नहीं लिया जाता।"
        : "🏥 **Ayushman Arogya Mandir:**\n• **What it is:** Upgraded primary healthcare centres right in your local neighbourhood.\n• **Services:** Free OPD consultations, 14+ essential diagnostic tests (sugar, BP, hemoglobin), free medicines, and wellness care.\n• **Access:** Walk into your nearest local PHC/Sub-Centre with Aadhaar/ABHA ID."
    };
  }

  if (clean.includes('prepare') || clean.includes('doctor visit') || clean.includes('consult')) {
    return {
      text: lang === 'hi'
        ? "📋 **डॉक्टर परामर्श तैयारी:**\nमैं आपके लिए 30-सेकंड का सुंदर 'परामर्श कार्ड' तैयार कर सकता हूँ! ऊपर दिए गए **'Prep Flow'** टैब पर क्लिक करें या नीचे 'Try Demo' बटन दबाकर देखें।"
        : "📋 **Doctor Consultation Preparation:**\nI can build a ready-to-present **30-Second Consult Brief Card** for your doctor! Click the **'Prep Flow'** tab above or use the 'Try Demo' button to preview it immediately."
    };
  }

  if (clean.includes('scan') || clean.includes('medicine') || clean.includes('dawa')) {
    return {
      text: lang === 'hi'
        ? "📷 **दवा स्कैनर व सुरक्षा जांच:**\nऊपर दिए गए **'Scan Medicine'** टैब पर क्लिक करें! आप कैमरे से पत्ते/बॉक्स का फोटो खींच सकते हैं या दवा का नाम लिखकर अपनी एलर्जी व बीमारियों के साथ इसका सुरक्षा मिलान देख सकते हैं।"
        : "📷 **Medicine Scanner & Safety Check:**\nClick the **'Scan Medicine'** tab above! You can scan a strip with your camera or search by name to view full details and an automated safety check against your allergies and conditions."
    };
  }

  return {
    text: lang === 'hi'
      ? `मैंने आपकी बात समझी: "${userMsg}". \n\n• मैं बीमारी का निदान नहीं करता, लेकिन डॉक्टर से मिलने हेतु तैयारी करवा सकता हूँ।\n• सामान्य सलाह: यदि समस्या 2-3 दिन से अधिक है, तो **eSanjeevani** पर मुफ्त डॉक्टर परामर्श लें या नजदीकी **आयुष्मान आरोग्य मंदिर** जाएं।\n• 30-सेकंड का डॉक्टर पत्रक बनाने के लिए 'Prep Flow' प्रपत्र भरें।`
      : `I have noted your concern: "${userMsg}".\n\n• Remember: I explain verified government services and help you prepare; I do not diagnose or prescribe.\n• Recommended step: If symptoms have lasted more than 48 hours, book a free video consult on **eSanjeevani** or walk into your local **Ayushman Arogya Mandir**.\n• You can also use our **Prep Flow** to generate a 30-second summary sheet for your doctor!`
  };
}

/**
 * Render Chat Messages
 */
function renderChat() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  container.innerHTML = '';
  state.chatHistory.forEach((msg) => {
    const bubble = document.createElement('div');
    if (msg.sender === 'user') {
      bubble.className = 'chat-bubble-user';
      bubble.textContent = msg.text;
    } else {
      bubble.className = 'chat-bubble-bot';
      let formatted = msg.text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br/>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-800 underline font-semibold">$1</a>');
      bubble.innerHTML = formatted;
    }
    container.appendChild(bubble);
  });

  container.scrollTop = container.scrollHeight;
}

/**
 * Send Chat Message
 */
function sendMessage(text) {
  if (!text || !text.trim()) return;
  if (state.urgentEscalated) {
    alert(state.lang === 'hi' ? "आपातकालीन स्थिति में चैट निलंबित है। कृपया तुरंत 108 या 112 डायल करें।" : "Chat is suspended due to urgent medical symptoms. Please call 108 or 112 immediately.");
    return;
  }

  state.chatHistory.push({ sender: 'user', text: text.trim() });
  renderChat();

  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.value = '';

  setTimeout(() => {
    const reply = handleBotResponse(text);
    state.chatHistory.push({ sender: 'bot', text: reply.text });
    renderChat();
  }, 450);
}

/**
 * Generate Top 5 Questions for Doctor based on Inputs
 */
function generateTopQuestions(data, lang) {
  const isHi = lang === 'hi';
  const questions = [];

  questions.push(isHi
    ? `मेरे लक्षण (${data.concern || 'समस्या'}) का संभावित मुख्य कारण क्या हो सकता है?`
    : `What is the most likely cause of my symptoms (${data.concern || 'primary concern'})?`
  );

  questions.push(isHi
    ? `यदि यह ${data.duration} से अधिक बना रहे, तो मुझे किन चेतावनी संकेतों (Red flags) पर तुरंत अस्पताल जाना चाहिए?`
    : `Given this has lasted ${data.duration}, what warning signs should prompt immediate emergency care?`
  );

  questions.push(isHi
    ? `क्या मुझे आयुष्मान आरोग्य मंदिर या सरकारी लैब में कोई रक्त या अन्य जांच (Diagnostics) करानी चाहिए?`
    : `Are there specific lab tests or imaging I should get done at an Ayushman Arogya Mandir / hospital?`
  );

  if (data.medicines || (data.conditions && data.conditions.length > 0)) {
    const medsOrCond = data.conditions.join(', ') || data.medicines || 'meri bimari';
    questions.push(isHi
      ? `मेरी वर्तमान दवाओं व स्थितियों (${medsOrCond}) के साथ नई दवाइयों का कोई दुष्प्रभाव तो नहीं होगा?`
      : `Will any new prescription interact with my current conditions/medications (${medsOrCond})?`
    );
  } else {
    questions.push(isHi
      ? `क्या मुझे कोई दवा लेने की आवश्यकता है, या घरेलू उपचार व आराम पर्याप्त है?`
      : `Do I need a prescription, or are lifestyle modifications, hydration, and rest sufficient?`
    );
  }

  questions.push(isHi
    ? `क्या इस उपचार या जांच के लिए आयुष्मान भारत (PM-JAY) या जन औषधि केंद्र की सस्ती दवाएं लागू हैं?`
    : `Can I avail benefits under Ayushman Bharat (PM-JAY) or Jan Aushadhi generic medicines for this treatment?`
  );

  return questions;
}

/**
 * Generate Recommended Healthcare Route
 */
function getRecommendedRoute(data, lang) {
  const isHi = lang === 'hi';
  const sev = parseInt(data.severity, 10) || 5;

  if (sev >= 8 || state.urgencyLevel === 'urgent') {
    return {
      level: 'urgent',
      title: isHi ? "मार्ग: आपातकालीन केंद्र / जिला अस्पताल" : "Route: Immediate Emergency / District Hospital",
      steps: isHi ? [
        "1. तुरंत 108 (एम्बुलेंस) पर कॉल करें या नजदीकी सरकारी अस्पताल पहुंचें।",
        "2. अस्पताल में PM-JAY आयुष्मान कार्ड दिखाएं (कैशलेस इलाज हेतु)।",
        "3. आपातकालीन वार्ड में आरोग्य मित्र से संपर्क करें।"
      ] : [
        "1. Call 108 Ambulance or reach the nearest District Hospital emergency department.",
        "2. Present your Ayushman PM-JAY Golden Card at the hospital reception/Arogya Mitra desk.",
        "3. Seek immediate triage stabilization before administrative paperwork."
      ]
    };
  } else if (sev >= 5) {
    return {
      level: 'moderate',
      title: isHi ? "मार्ग: ई-संजीवनी वीडियो कॉल -> नजदीकी आयुष्मान आरोग्य मंदिर" : "Route: eSanjeevani Teleconsult -> Ayushman Arogya Mandir",
      steps: isHi ? [
        "1. ई-संजीवनी पर घर बैठे डॉक्टर से 10 मिनट में मुफ्त वीडियो परामर्श लें।",
        "2. यदि डॉक्टर जांच लिखें, तो पास के आयुष्मान आरोग्य मंदिर जाकर मुफ्त टेस्ट कराएं।",
        "3. जन औषधि केंद्र से 50-80% सस्ती जेनेरिक दवाइयां प्राप्त करें।"
      ] : [
        "1. Start with a free 10-minute video consultation on eSanjeevani 2.0 from home.",
        "2. If diagnostic tests are requested, walk into your local Ayushman Arogya Mandir for free testing.",
        "3. Collect prescribed generic medicines from the nearest Pradhan Mantri Jan Aushadhi Kendra."
      ]
    };
  } else {
    return {
      level: 'calm',
      title: isHi ? "मार्ग: स्थानीय आयुष्मान आरोग्य मंदिर / टेलीमेडिसिन" : "Route: Local Ayushman Arogya Mandir / Tele-OPD",
      steps: isHi ? [
        "1. नजदीकी आयुष्मान आरोग्य मंदिर में मुफ्त ओपीडी परामर्श और जांच कराएं।",
        "2. आभा (ABHA) आईडी से अपना डिजिटल स्वास्थ्य रिकॉर्ड अपडेट रखें।",
        "3. पर्याप्त जलपान और विश्राम लें।"
      ] : [
        "1. Visit your local neighbourhood Ayushman Arogya Mandir for routine examination.",
        "2. Ensure your digital consultation summary is synced with your 14-digit ABHA Health ID.",
        "3. Follow routine recovery, hydration, and schedule follow-up if symptoms persist."
      ]
    };
  }
}

/**
 * Pure SVG QR Code Generator
 */
function generateSvgQrCode(text) {
  const size = 160;
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  
  const matrixSize = 25;
  const cellSize = size / matrixSize;
  let rects = '';

  function drawFinderPattern(ox, oy) {
    let p = '';
    p += `<rect x="${ox * cellSize}" y="${oy * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#1F4E4A" rx="2" />`;
    p += `<rect x="${(ox + 1) * cellSize}" y="${(oy + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#FFFFFF" />`;
    p += `<rect x="${(ox + 2) * cellSize}" y="${(oy + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#1F4E4A" rx="1" />`;
    return p;
  }

  rects += drawFinderPattern(1, 1);
  rects += drawFinderPattern(matrixSize - 8, 1);
  rects += drawFinderPattern(1, matrixSize - 8);

  let seed = Math.abs(hash) || 4242;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if ((r <= 8 && c <= 8) || (r <= 8 && c >= matrixSize - 9) || (r >= matrixSize - 9 && c <= 8)) {
        continue;
      }
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize - 0.4}" height="${cellSize - 0.4}" fill="#1F4E4A" />`;
        }
        continue;
      }
      if (pseudoRandom() > 0.55) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize - 0.4}" height="${cellSize - 0.4}" fill="#1F4E4A" rx="0.5" />`;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" class="w-28 h-28 mx-auto rounded-lg bg-white p-1 border border-[#D6C7A9]">
      <rect width="${size}" height="${size}" fill="#FFFFFF" rx="4"/>
      ${rects}
    </svg>
  `;
}

/**
 * Render the Outlier Consult Brief Card
 */
export function renderConsultBrief() {
  const container = document.getElementById('consult-brief-container');
  if (!container) return;

  const data = state.prepData;
  const lang = state.lang;
  const isHi = lang === 'hi';
  const questions = generateTopQuestions(data, lang);
  const route = getRecommendedRoute(data, lang);
  const severityScore = parseInt(data.severity, 10) || 5;

  const angle = -90 + ((severityScore / 10) * 180);

  const qrPayload = `SETU CLINICAL BRIEF:
Concern: ${data.concern}
Duration: ${data.duration} (${data.progression})
Severity: ${data.severity}/10
Conditions: ${data.conditions.join(', ') || 'None reported'}
Medicines: ${data.medicines || 'None'}
Allergies: ${data.allergies || 'None'}
Generated: ${new Date().toLocaleDateString()}`;

  const qrSvg = generateSvgQrCode(qrPayload);

  container.innerHTML = `
    <div id="consult-brief-printable" class="consult-sheet p-6 sm:p-8 space-y-6 animate-fade-in">
      <!-- Sheet Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D6C7A9] gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="watermark-stamp">${isHi ? 'प्रमाणित क्लिनिकल प्रीव्यू' : 'VERIFIED CLINICAL PREVIEW'}</span>
            <span class="text-xs text-[#596B68]">ID: STU-${Math.floor(100000 + Math.random() * 900000)}</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-display text-[#1F4E4A] font-bold">
            ${isHi ? 'रोगी परामर्श संक्षिप्त पत्र' : 'Patient Consultation Brief'}
          </h2>
          <p class="text-xs sm:text-sm text-[#596B68]">
            ${isHi ? '30 सेकंड में डॉक्टर के त्वरित अवलोकन हेतु तैयार' : 'Structured for a 30-second rapid clinical overview by the consulting doctor.'}
          </p>
        </div>
        <div class="text-right">
          <div class="text-xs font-semibold text-[#1F4E4A]">${new Date().toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          <div class="text-xs text-[#596B68]">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>

      <!-- Quick Metrics Grid: Timeline & Severity Dial -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F4EFE6] p-4 sm:p-5 rounded-2xl border border-[#D6C7A9]">
        <!-- Timeline (7 cols) -->
        <div class="md:col-span-7 flex flex-col justify-between">
          <h3 class="text-xs font-bold text-[#1F4E4A] tracking-wider uppercase mb-3 flex items-center gap-1.5">
            <svg class="w-4 h-4 text-[#C2654B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            ${isHi ? 'लक्षण समयरेखा (Timeline)' : 'Symptom Timeline'}
          </h3>
          
          <div class="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#8FA998]">
            <div class="relative">
              <span class="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#1F4E4A] border-2 border-white"></span>
              <div class="text-xs font-bold text-[#1F4E4A]">${isHi ? 'आरंभ' : 'Onset'}: ~${data.duration || 'Recently'}</div>
              <div class="text-sm font-semibold text-[#26302F]">${data.concern || 'Symptoms noticed'}</div>
            </div>
            <div class="relative">
              <span class="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#C2654B] border-2 border-white"></span>
              <div class="text-xs font-bold text-[#C2654B]">${isHi ? 'प्रगति' : 'Progression'}</div>
              <div class="text-xs text-[#596B68]">${data.progression || 'Stable / Ongoing'}</div>
            </div>
            <div class="relative">
              <span class="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#1F4E4A] border-2 border-white"></span>
              <div class="text-xs font-bold text-[#1F4E4A]">${isHi ? 'वर्तमान तीव्रता' : 'Current Status'}</div>
              <div class="text-xs text-[#596B68]">${isHi ? 'तीव्रता स्कोर' : 'Discomfort score'}: ${severityScore}/10</div>
            </div>
          </div>
        </div>

        <!-- Severity Dial Gauge (5 cols) -->
        <div class="md:col-span-5 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-[#D6C7A9] pt-4 md:pt-0 md:pl-5">
          <span class="text-xs font-bold text-[#1F4E4A] tracking-wider uppercase mb-1">
            ${isHi ? 'दर्द / कष्ट का स्तर' : 'Severity Dial'}
          </span>
          
          <div class="relative w-40 h-24 flex items-center justify-center">
            <svg class="w-40 h-24" viewBox="0 0 100 55">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#E2ECE5" stroke-width="10" stroke-linecap="round" />
              <path d="M 10 50 A 40 40 0 0 1 36.6 21.7" fill="none" stroke="#8FA998" stroke-width="10" stroke-linecap="round" />
              <path d="M 36.6 21.7 A 40 40 0 0 1 63.4 21.7" fill="none" stroke="#E8DCC5" stroke-width="10" />
              <path d="M 63.4 21.7 A 40 40 0 0 1 90 50" fill="none" stroke="#C2654B" stroke-width="10" stroke-linecap="round" />
              <g transform="translate(50, 50) rotate(${angle})">
                <line x1="0" y1="0" x2="0" y2="-32" stroke="#1F4E4A" stroke-width="2.5" stroke-linecap="round" />
                <circle cx="0" cy="0" r="4.5" fill="#1F4E4A" />
              </g>
            </svg>
            <div class="absolute bottom-0 text-center">
              <span class="text-xl font-bold text-[#1F4E4A]">${severityScore}</span>
              <span class="text-xs text-[#596B68]">/10</span>
            </div>
          </div>
          
          <div class="text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${
            severityScore >= 8 ? 'bg-red-100 text-red-800' :
            severityScore >= 5 ? 'bg-amber-100 text-amber-800' :
            'bg-emerald-100 text-emerald-800'
          }">
            ${severityScore >= 8 ? (isHi ? 'गंभीर कष्ट' : 'Severe') :
              severityScore >= 5 ? (isHi ? 'मध्यम कष्ट' : 'Moderate') :
              (isHi ? 'हल्का कष्ट' : 'Mild')}
          </div>
        </div>
      </div>

      <!-- Medical Background Triad -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-xl bg-white border border-[#D6C7A9]">
          <span class="text-[11px] font-bold text-[#596B68] uppercase tracking-wide block mb-1">
            ${isHi ? 'अन्य पुरानी बीमारियाँ' : 'Chronic Conditions'}
          </span>
          <p class="text-xs sm:text-sm font-semibold text-[#1F4E4A]">
            ${data.conditions && data.conditions.length > 0 ? data.conditions.join(', ') : (isHi ? 'कोई नहीं' : 'None reported')}
          </p>
        </div>
        <div class="p-3.5 rounded-xl bg-white border border-[#D6C7A9]">
          <span class="text-[11px] font-bold text-[#596B68] uppercase tracking-wide block mb-1">
            ${isHi ? 'वर्तमान नियमित दवाइयाँ' : 'Current Medications'}
          </span>
          <p class="text-xs sm:text-sm font-semibold text-[#1F4E4A]">
            ${data.medicines || (isHi ? 'कोई नहीं' : 'None reported')}
          </p>
        </div>
        <div class="p-3.5 rounded-xl bg-white border border-[#D6C7A9]">
          <span class="text-[11px] font-bold text-[#596B68] uppercase tracking-wide block mb-1">
            ${isHi ? 'ज्ञात एलर्जी' : 'Known Allergies'}
          </span>
          <p class="text-xs sm:text-sm font-semibold text-[#C2654B]">
            ${data.allergies || (isHi ? 'कोई नहीं' : 'None recorded')}
          </p>
        </div>
      </div>

      <!-- Top 5 Questions to Ask Your Doctor -->
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-[#D6C7A9]">
        <h3 class="text-sm font-bold text-[#1F4E4A] flex items-center gap-2 mb-3">
          <svg class="w-4 h-4 text-[#1F4E4A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          ${i18n[lang].topQuestionsTitle}
        </h3>
        <ul class="space-y-2 text-xs sm:text-sm text-[#26302F]">
          ${questions.map((q, idx) => `
            <li class="flex items-start gap-2">
              <span class="w-5 h-5 rounded-full bg-[#E2ECE5] text-[#1F4E4A] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">${idx + 1}</span>
              <span>${q}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Split Row: Route & Documents Checklist & QR -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div class="md:col-span-8 space-y-4">
          <div class="p-4 rounded-xl bg-[#F7EAE6] border border-[#E8DCC5]">
            <h4 class="text-xs font-bold text-[#C2654B] uppercase tracking-wide mb-1">
              ${i18n[lang].serviceRouteTitle}
            </h4>
            <div class="text-sm font-bold text-[#1F4E4A] mb-2">${route.title}</div>
            <ul class="space-y-1 text-xs text-[#26302F]">
              ${route.steps.map(s => `<li>• ${s}</li>`).join('')}
            </ul>
          </div>

          <div class="p-4 rounded-xl bg-white border border-[#D6C7A9]">
            <h4 class="text-xs font-bold text-[#1F4E4A] uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-[#8FA998]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ${i18n[lang].documentsChecklistTitle}
            </h4>
            <div class="grid grid-cols-2 gap-2 text-xs text-[#26302F]">
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked class="accent-[#1F4E4A]"> Aadhaar Card (Original / Digilocker)
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked class="accent-[#1F4E4A]"> ABHA Health ID Card / Number
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked class="accent-[#1F4E4A]"> Ayushman Bharat PM-JAY Card
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked class="accent-[#1F4E4A]"> Past Prescriptions & Lab Reports
              </label>
            </div>
          </div>
        </div>

        <div class="md:col-span-4 flex flex-col items-center justify-center p-4 bg-[#F4EFE6] rounded-xl border border-[#D6C7A9] text-center">
          ${qrSvg}
          <span class="text-[11px] font-bold text-[#1F4E4A] mt-2 block">
            ${isHi ? 'डॉक्टर कैमरा से स्कैन करें' : 'Scan via Doctor Camera'}
          </span>
          <span class="text-[10px] text-[#596B68]">
            ${isHi ? 'डिजिटल सारांश तुरंत फोन में प्राप्त करें' : 'Instantly read full brief on mobile'}
          </span>
        </div>
      </div>

      <!-- Action Buttons (Print, Copy, Share) -->
      <div class="no-print pt-4 border-t border-[#D6C7A9] flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="window.print()" class="btn-primary text-xs sm:text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            ${i18n[lang].downloadPdf}
          </button>
          <button onclick="copyBriefText()" class="btn-secondary text-xs sm:text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
            ${i18n[lang].copySummary}
          </button>
          <button onclick="shareBrief()" class="btn-secondary text-xs sm:text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            ${i18n[lang].shareBrief}
          </button>
        </div>
        
        <span class="text-xs text-[#596B68]">
          ${isHi ? 'सुरक्षा: आपका डेटा केवल आपके डिवाइस पर है।' : 'Privacy: Stored locally on your device.'}
        </span>
      </div>
    </div>
  `;
}

window.renderConsultBrief = renderConsultBrief;

/**
 * Copy Brief Summary Text
 */
window.copyBriefText = function() {
  const d = state.prepData;
  const isHi = state.lang === 'hi';
  const text = `SETU HEALTHCARE CONSULT BRIEF:
- Primary Concern: ${d.concern}
- Duration: ${d.duration} (${d.progression})
- Severity Score: ${d.severity}/10
- Chronic Conditions: ${d.conditions.join(', ') || 'None reported'}
- Current Medications: ${d.medicines || 'None'}
- Known Allergies: ${d.allergies || 'None'}
- Prepared using Setu Healthcare Assistant`;

  navigator.clipboard.writeText(text).then(() => {
    alert(isHi ? "सारांश क्लिपबोर्ड पर कॉपी हो गया!" : "Consult Brief copied to clipboard!");
  }).catch(() => {
    alert(text);
  });
};

/**
 * Share Brief
 */
window.shareBrief = function() {
  const d = state.prepData;
  const shareData = {
    title: 'Setu Patient Consult Brief',
    text: `Setu Consult Brief: ${d.concern} (${d.duration}, Severity: ${d.severity}/10). Medical prep ready for doctor consultation.`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(err => console.log('Share canceled', err));
  } else {
    window.copyBriefText();
  }
};

/**
 * Render Verified Government Services Explorer
 */
function renderServicesExplorer() {
  const container = document.getElementById('services-grid');
  if (!container) return;

  const lang = state.lang;
  container.innerHTML = '';

  verifiedServices.forEach(s => {
    const card = document.createElement('div');
    card.className = 'card-setu p-6 flex flex-col justify-between hover:border-[#1F4E4A] transition-all';
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2">
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E2ECE5] text-[#1F4E4A]">
            ${s.tag[lang]}
          </span>
          <span class="text-[11px] font-semibold text-[#8FA998] flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            ${i18n[lang].verifiedSource}
          </span>
        </div>

        <h3 class="text-xl font-bold font-display text-[#1F4E4A] mb-2">
          ${s.name[lang]}
        </h3>

        <p class="text-xs sm:text-sm text-[#26302F] mb-4">
          ${s.whatItIs[lang]}
        </p>

        <div class="space-y-3 mb-4 text-xs">
          <div class="bg-[#F4EFE6] p-2.5 rounded-lg">
            <span class="font-bold text-[#1F4E4A] block mb-0.5">${lang === 'hi' ? 'पात्रता:' : 'Who is Eligible:'}</span>
            <span class="text-[#596B68]">${s.eligibility[lang]}</span>
          </div>

          <div class="bg-[#F4EFE6] p-2.5 rounded-lg">
            <span class="font-bold text-[#1F4E4A] block mb-0.5">${lang === 'hi' ? 'आवश्यक दस्तावेज:' : 'Documents Needed:'}</span>
            <span class="text-[#596B68]">${s.documents[lang]}</span>
          </div>
        </div>

        <div class="mb-4">
          <span class="text-xs font-bold text-[#1F4E4A] block mb-1">${lang === 'hi' ? 'उपयोग के चरण:' : 'Steps to Use:'}</span>
          <ul class="space-y-1 text-xs text-[#26302F]">
            ${s.steps[lang].map(st => `<li>${st}</li>`).join('')}
          </ul>
        </div>
      </div>

      <div class="pt-4 border-t border-[#D6C7A9] flex items-center justify-between">
        <a href="${s.sourceUrl}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold text-[#1F4E4A] hover:text-[#C2654B] inline-flex items-center gap-1">
          <span>${s.sourceBadge}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
        <span class="text-[10px] text-[#596B68] italic">${i18n[lang].officialWarning}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

/**
 * Prep Wizard Step Management
 */
function updatePrepStep(step) {
  state.prepStep = step;
  
  for (let i = 1; i <= 4; i++) {
    const indicator = document.getElementById(`step-indicator-${i}`);
    const stepCard = document.getElementById(`prep-step-${i}`);
    if (indicator) {
      if (i < step) {
        indicator.className = 'w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center';
        indicator.innerHTML = '✓';
      } else if (i === step) {
        indicator.className = 'w-7 h-7 rounded-full bg-[#1F4E4A] text-white font-bold text-xs flex items-center justify-center shadow-md';
        indicator.textContent = i;
      } else {
        indicator.className = 'w-7 h-7 rounded-full bg-[#E2ECE5] text-[#596B68] font-bold text-xs flex items-center justify-center';
        indicator.textContent = i;
      }
    }
    if (stepCard) {
      if (i === step) {
        stepCard.classList.remove('hidden');
      } else {
        stepCard.classList.add('hidden');
      }
    }
  }

  const backBtn = document.getElementById('prep-back-btn');
  if (backBtn) {
    if (step === 1) backBtn.classList.add('hidden');
    else backBtn.classList.remove('hidden');
  }

  const nextBtn = document.getElementById('prep-next-btn');
  if (nextBtn) {
    if (step === 4) {
      nextBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        ${i18n[state.lang].generateBriefBtn}
      `;
      nextBtn.className = 'btn-primary bg-[#1F4E4A] hover:bg-[#143532]';
    } else {
      nextBtn.innerHTML = `
        ${state.lang === 'hi' ? 'अगला कदम' : 'Next Step'}
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      `;
      nextBtn.className = 'btn-primary';
    }
  }
}

/**
 * Handle Next Step in Prep Wizard
 */
function handlePrepNext() {
  if (state.prepStep === 1) {
    const concernInput = document.getElementById('prep-concern');
    if (!concernInput || !concernInput.value.trim()) {
      alert(state.lang === 'hi' ? "कृपया अपना मुख्य लक्षण लिखें।" : "Please specify your main symptom or concern.");
      return;
    }
    state.prepData.concern = concernInput.value.trim();
    const level = scanUrgency(state.prepData.concern);
    updateTriagePulse(level);
    updatePrepStep(2);
  } else if (state.prepStep === 2) {
    const durationSelect = document.getElementById('prep-duration');
    const progressionSelect = document.getElementById('prep-progression');
    if (durationSelect) state.prepData.duration = durationSelect.value;
    if (progressionSelect) state.prepData.progression = progressionSelect.value;
    updatePrepStep(3);
  } else if (state.prepStep === 3) {
    const slider = document.getElementById('prep-severity');
    if (slider) state.prepData.severity = parseInt(slider.value, 10);
    updatePrepStep(4);
  } else if (state.prepStep === 4) {
    const medsInput = document.getElementById('prep-medicines');
    const allergiesInput = document.getElementById('prep-allergies');
    if (medsInput) state.prepData.medicines = medsInput.value.trim();
    if (allergiesInput) state.prepData.allergies = allergiesInput.value.trim();

    const checkedBoxes = document.querySelectorAll('input[name="prep-condition"]:checked');
    state.prepData.conditions = Array.from(checkedBoxes).map(cb => cb.value);

    state.briefGenerated = true;
    renderConsultBrief();

    const briefElem = document.getElementById('consult-brief-container');
    if (briefElem) {
      briefElem.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Switch Active Tabs (Chat / Prep / Scanner / Services)
 */
function switchTab(tab) {
  state.activeTab = tab;
  const chatView = document.getElementById('view-chat');
  const prepView = document.getElementById('view-prep');
  const scannerView = document.getElementById('view-scanner');
  const servicesView = document.getElementById('view-services');

  const tabChatBtn = document.getElementById('tab-btn-chat');
  const tabPrepBtn = document.getElementById('tab-btn-prep');
  const tabScannerBtn = document.getElementById('tab-btn-scanner');
  const tabServicesBtn = document.getElementById('tab-btn-services');

  [chatView, prepView, scannerView, servicesView].forEach(v => v && v.classList.add('hidden'));
  [tabChatBtn, tabPrepBtn, tabScannerBtn, tabServicesBtn].forEach(b => {
    if (b) {
      b.classList.remove('bg-[#1F4E4A]', 'text-white');
      b.classList.add('bg-white', 'text-[#26302F]');
    }
  });

  if (tab === 'chat') {
    if (chatView) chatView.classList.remove('hidden');
    if (tabChatBtn) {
      tabChatBtn.classList.remove('bg-white', 'text-[#26302F]');
      tabChatBtn.classList.add('bg-[#1F4E4A]', 'text-white');
    }
  } else if (tab === 'prep') {
    if (prepView) prepView.classList.remove('hidden');
    if (tabPrepBtn) {
      tabPrepBtn.classList.remove('bg-white', 'text-[#26302F]');
      tabPrepBtn.classList.add('bg-[#1F4E4A]', 'text-white');
    }
  } else if (tab === 'scanner') {
    if (scannerView) scannerView.classList.remove('hidden');
    if (tabScannerBtn) {
      tabScannerBtn.classList.remove('bg-white', 'text-[#26302F]');
      tabScannerBtn.classList.add('bg-[#1F4E4A]', 'text-white');
    }
  } else if (tab === 'services') {
    if (servicesView) servicesView.classList.remove('hidden');
    if (tabServicesBtn) {
      tabServicesBtn.classList.remove('bg-white', 'text-[#26302F]');
      tabServicesBtn.classList.add('bg-[#1F4E4A]', 'text-white');
    }
  }
}

/**
 * Switch Language (English / Hindi)
 */
function setLanguage(lang) {
  state.lang = lang;
  const isHi = lang === 'hi';

  const enBtn = document.getElementById('lang-btn-en');
  const hiBtn = document.getElementById('lang-btn-hi');
  if (enBtn && hiBtn) {
    if (isHi) {
      hiBtn.classList.add('bg-[#1F4E4A]', 'text-white');
      hiBtn.classList.remove('text-[#596B68]');
      enBtn.classList.remove('bg-[#1F4E4A]', 'text-white');
      enBtn.classList.add('text-[#596B68]');
    } else {
      enBtn.classList.add('bg-[#1F4E4A]', 'text-white');
      enBtn.classList.remove('text-[#596B68]');
      hiBtn.classList.remove('bg-[#1F4E4A]', 'text-white');
      hiBtn.classList.add('text-[#596B68]');
    }
  }

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });

  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.placeholder = i18n[lang].chatPlaceholder;
  }

  updateTriagePulse(state.urgencyLevel);
  renderServicesExplorer();
  if (state.briefGenerated) {
    renderConsultBrief();
  }
  updatePrepStep(state.prepStep);

  // Re-render scanned medicine card in the newly selected language!
  if (window.MedicineScannerModule && window.MedicineScannerModule.selectedMedicine) {
    window.MedicineScannerModule.renderMedicineCard(window.MedicineScannerModule.selectedMedicine);
  }
}

/**
 * Toggle Large Text Accessibility
 */
function toggleLargeText() {
  state.largeText = !state.largeText;
  const btn = document.getElementById('large-text-btn');
  if (state.largeText) {
    document.body.classList.add('large-text');
    if (btn) btn.classList.add('bg-[#1F4E4A]', 'text-white');
  } else {
    document.body.classList.remove('large-text');
    if (btn) btn.classList.remove('bg-[#1F4E4A]', 'text-white');
  }
}

/**
 * Demo Mode: Routine Patient Story
 */
function runRoutineDemo() {
  state.urgentEscalated = false;
  const banner = document.getElementById('urgent-escalation-banner');
  if (banner) banner.classList.add('hidden');
  const chatInputArea = document.getElementById('chat-input-wrapper');
  if (chatInputArea) chatInputArea.classList.remove('opacity-50', 'pointer-events-none');

  state.prepData = {
    concern: state.lang === 'hi' ? '3 दिन से लगातार तेज बुखार, सूखी खांसी और बदन दर्द' : 'Fever for 3 days, mild dry cough, severe body fatigue',
    duration: '3 days',
    progression: 'Gradually worsening with chills at night',
    severity: 6,
    medicines: 'Metformin 500mg (twice daily)',
    allergies: 'Penicillin allergy',
    conditions: ['Diabetes (Type 2)', 'Hypertension']
  };

  const concernInput = document.getElementById('prep-concern');
  if (concernInput) concernInput.value = state.prepData.concern;

  const durationSelect = document.getElementById('prep-duration');
  if (durationSelect) durationSelect.value = state.prepData.duration;

  const progSelect = document.getElementById('prep-progression');
  if (progSelect) progSelect.value = state.prepData.progression;

  const severitySlider = document.getElementById('prep-severity');
  if (severitySlider) {
    severitySlider.value = 6;
    const sevLabel = document.getElementById('severity-display');
    if (sevLabel) sevLabel.textContent = '6 / 10 (Moderate)';
  }

  const medsInput = document.getElementById('prep-medicines');
  if (medsInput) medsInput.value = state.prepData.medicines;

  const allergiesInput = document.getElementById('prep-allergies');
  if (allergiesInput) allergiesInput.value = state.prepData.allergies;

  document.querySelectorAll('input[name="prep-condition"]').forEach(cb => {
    cb.checked = state.prepData.conditions.includes(cb.value);
  });

  updateTriagePulse('moderate');
  state.briefGenerated = true;
  renderConsultBrief();

  state.chatHistory.push({
    sender: 'user',
    text: state.prepData.concern
  });
  state.chatHistory.push({
    sender: 'bot',
    text: state.lang === 'hi'
      ? "मैंने आपका विवरण दर्ज कर लिया है: 3 दिन का बुखार व खांसी, तथा टाइप-2 डायबिटीज। मैंने आपके लिए **30-सेकंड कंसल्ट ब्रीफ कार्ड** दाईं ओर तैयार कर दिया है! डॉक्टर से मिलने से पहले आप इसे देख व प्रिंट कर सकते हैं।"
      : "I have recorded your details: 3 days of fever, cough, and pre-existing Type 2 Diabetes. I have automatically generated your **30-Second Consult Brief Card** on the right! You can review questions to ask your doctor, carry documents checklist, and print or share it."
  });
  renderChat();

  const briefElem = document.getElementById('consult-brief-container');
  if (briefElem) {
    briefElem.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Demo Mode: Urgent Escalation Case
 */
function runUrgentDemo() {
  const urgentText = state.lang === 'hi'
    ? "अचानक छाती में बहुत तेज असहनीय दर्द हो रहा है और बाएँ हाथ में खिंचाव व सांस लेने में भारी तकलीफ है!"
    : "Sudden crushing chest pain radiating to my left shoulder and severe trouble breathing!";

  const chatInput = document.getElementById('chat-input');
  if (chatInput) chatInput.value = urgentText;

  switchTab('chat');
  sendMessage(urgentText);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Modal: How Setu Works
 */
function toggleHowItWorksModal(show) {
  const modal = document.getElementById('how-it-works-modal');
  if (!modal) return;
  if (show) modal.classList.remove('hidden');
  else modal.classList.add('hidden');
}

/**
 * Initialize Event Listeners & Bootstrapping
 */
document.addEventListener('DOMContentLoaded', async () => {
  setupSpeechRecognition();
  renderServicesExplorer();

  // Load external datasets
  try {
    const [medsRes, hospRes] = await Promise.all([
      fetch('data/medicines.json').then(r => r.json()),
      fetch('data/hospitals.json').then(r => r.json())
    ]);

    // Initialize Medicine Scanner & Emergency Escalation Modules
    await MedicineScannerModule.init(medsRes);
    EmergencyModeModule.init(hospRes);
  } catch (err) {
    console.error("Failed to load local data:", err);
  }

  // Initialize Live Location Service
  LiveLocationService.init();

  // Location chip modal triggers
  const locationChip = document.getElementById('header-location-chip');
  const locationModal = document.getElementById('location-picker-modal');
  const closeLocBtn = document.getElementById('close-location-modal-btn');
  const useGpsBtn = document.getElementById('use-live-gps-btn');
  const setPinBtn = document.getElementById('set-manual-pin-btn');
  const pinInput = document.getElementById('manual-pin-input');

  if (locationChip && locationModal) {
    locationChip.addEventListener('click', () => locationModal.classList.remove('hidden'));
  }
  if (closeLocBtn && locationModal) {
    closeLocBtn.addEventListener('click', () => locationModal.classList.add('hidden'));
  }
  if (useGpsBtn && locationModal) {
    useGpsBtn.addEventListener('click', () => {
      LiveLocationService.requestGps();
      locationModal.classList.add('hidden');
    });
  }
  if (setPinBtn && pinInput && locationModal) {
    setPinBtn.addEventListener('click', () => {
      LiveLocationService.setManualLocation(pinInput.value);
      locationModal.classList.add('hidden');
    });
  }

  // Default welcome bot message
  state.chatHistory.push({
    sender: 'bot',
    text: state.lang === 'hi'
      ? "नमस्ते! मैं **सेतु (Setu)** हूँ — आपका सुरक्षित सरकारी स्वास्थ्य सहायक।\n• मैं आयुष्मान भारत (PM-JAY), आभा आईडी (ABHA), ई-संजीवनी और आरोग्य मंदिर की सही जानकारी देता हूँ।\n• आप डॉक्टर परामर्श प्रपत्र भर सकते हैं या **'Scan Medicine'** टैब से दवा का सुरक्षित मिलान जांच सकते हैं।\n\n*ध्यान दें: मैं डॉक्टर नहीं हूँ। आपातकाल में तुरंत 108 डायल करें।*"
      : "Hello! I am **Setu** — your safe public healthcare access assistant.\n• I explain verified Indian public healthcare services: Ayushman Bharat (PM-JAY), ABHA Health ID, eSanjeevani Telemedicine, and Ayushman Arogya Mandir.\n• You can prepare for a consultation or use the **'Scan Medicine'** tab to identify medications and check for safety conflicts.\n\n*Note: I explain services and help you prepare. I am not a doctor. In an emergency, always call 108 or 112.*"
  });
  renderChat();

  // Quick reply chip click handler
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        sendMessage(prompt);
      }
    });
  });

  // Chat send button & Enter key
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');
  if (sendBtn && chatInput) {
    sendBtn.addEventListener('click', () => {
      sendMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(chatInput.value);
      }
    });

    chatInput.addEventListener('input', (e) => {
      const level = scanUrgency(e.target.value);
      updateTriagePulse(level);
    });
  }

  // Prep severity slider feedback
  const severitySlider = document.getElementById('prep-severity');
  const severityDisplay = document.getElementById('severity-display');
  if (severitySlider && severityDisplay) {
    severitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      let desc = 'Mild';
      if (val >= 8) desc = 'Severe / Intense';
      else if (val >= 5) desc = 'Moderate';
      severityDisplay.textContent = `${val} / 10 (${desc})`;
    });
  }

  // Prep wizard next & back
  const prepNextBtn = document.getElementById('prep-next-btn');
  if (prepNextBtn) {
    prepNextBtn.addEventListener('click', handlePrepNext);
  }

  const prepBackBtn = document.getElementById('prep-back-btn');
  if (prepBackBtn) {
    prepBackBtn.addEventListener('click', () => {
      if (state.prepStep > 1) updatePrepStep(state.prepStep - 1);
    });
  }

  // Tab switching (Chat, Prep, Scanner, Services)
  const tabChatBtn = document.getElementById('tab-btn-chat');
  const tabPrepBtn = document.getElementById('tab-btn-prep');
  const tabScannerBtn = document.getElementById('tab-btn-scanner');
  const tabServicesBtn = document.getElementById('tab-btn-services');

  if (tabChatBtn) tabChatBtn.addEventListener('click', () => switchTab('chat'));
  if (tabPrepBtn) tabPrepBtn.addEventListener('click', () => switchTab('prep'));
  if (tabScannerBtn) tabScannerBtn.addEventListener('click', () => switchTab('scanner'));
  if (tabServicesBtn) tabServicesBtn.addEventListener('click', () => switchTab('services'));

  // Language buttons
  const enBtn = document.getElementById('lang-btn-en');
  const hiBtn = document.getElementById('lang-btn-hi');
  if (enBtn) enBtn.addEventListener('click', () => setLanguage('en'));
  if (hiBtn) hiBtn.addEventListener('click', () => setLanguage('hi'));

  // Large text button
  const largeTextBtn = document.getElementById('large-text-btn');
  if (largeTextBtn) largeTextBtn.addEventListener('click', toggleLargeText);

  // Demo buttons
  const demoRoutineBtn = document.getElementById('demo-routine-btn');
  const demoUrgentBtn = document.getElementById('demo-urgent-btn');
  if (demoRoutineBtn) demoRoutineBtn.addEventListener('click', runRoutineDemo);
  if (demoUrgentBtn) demoUrgentBtn.addEventListener('click', runUrgentDemo);

  // How it works modal
  const howBtn = document.getElementById('how-it-works-btn');
  const closeHowBtn = document.getElementById('close-how-modal-btn');
  if (howBtn) howBtn.addEventListener('click', () => toggleHowItWorksModal(true));
  if (closeHowBtn) closeHowBtn.addEventListener('click', () => toggleHowItWorksModal(false));

  // Default bootstrap demo
  runRoutineDemo();
});
