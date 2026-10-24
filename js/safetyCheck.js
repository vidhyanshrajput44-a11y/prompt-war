/**
 * Setu Medicine Safety Check & Condition-Based Education Engine
 * Compares scanned medicine against the user's recorded profile:
 * - Allergies
 * - Pre-existing conditions
 * - Currently taken medicines
 * FULL BILINGUAL (English & हिन्दी) SUPPORT
 */

export const SafetyCheckEngine = {
  /**
   * Run cross-checks between medicine conflict rules and patient profile
   * @param {Object} medicine
   * @param {Object} patientProfile
   * @param {string} lang - 'en' | 'hi'
   * @returns {{ status: 'safe'|'warning'|'danger', title: string, reasons: string[] }}
   */
  evaluateSafety(medicine, patientProfile = {}, lang = 'en') {
    const isHi = lang === 'hi';

    if (!medicine || !medicine.conflictRules) {
      return {
        status: 'safe',
        title: isHi ? 'नमूना डेटा में कोई विरोध/समस्या नहीं मिली' : 'No Conflict Found in Sample Data',
        reasons: [isHi ? 'हमारे संदर्भ डेटा में इस दवा के साथ कोई ज्ञात विरोध दर्ज नहीं है।' : 'No known contraindications recorded in sample reference data.']
      };
    }

    const { conflictRules } = medicine;
    const reasons = [];
    let isCriticalConflict = false;

    // 1. ALLERGY CROSS-CHECK
    const userAllergies = (patientProfile.allergies || '').toLowerCase();
    if (userAllergies && userAllergies !== 'none' && userAllergies !== 'कोई नहीं') {
      for (const aller of conflictRules.contraindicatedAllergies || []) {
        if (userAllergies.includes(aller.toLowerCase())) {
          reasons.push(isHi
            ? `गंभीर एलर्जी चेतावनी: आपने "${aller}" से एलर्जी दर्ज की है। ${medicine.brandNames[0]} (${medicine.generic}) लेने से तीव्र एलर्जिक रिएक्शन का खतरा हो सकता है।`
            : `CRITICAL ALLERGY ALERT: You reported an allergy matching "${aller}". Taking ${medicine.brandNames[0]} (${medicine.generic}) may trigger a severe allergic reaction.`
          );
          isCriticalConflict = true;
        }
      }
    }

    // 2. CONDITION / COMORBIDITY CROSS-CHECK
    const userConditions = (patientProfile.conditions || []).map(c => c.toLowerCase()).join(' ') + ' ' + (patientProfile.concern || '').toLowerCase();
    for (const cond of conflictRules.contraindicatedConditions || []) {
      if (userConditions.includes(cond.toLowerCase())) {
        if (cond.includes('ulcer') || cond.includes('renal') || cond.includes('kidney') || cond.includes('heart failure')) {
          reasons.push(isHi
            ? `उच्च जोखिम चेतावनी: ${cond} की स्थिति में ${medicine.generic} लेने से बचने या डॉक्टर की विशेष निगरानी की सलाह दी जाती है।`
            : `HIGH RISK COMORBIDITY: ${medicine.generic} is cautioned against in patients with ${cond}.`
          );
          isCriticalConflict = true;
        } else {
          reasons.push(isHi
            ? `सावधानी: पूर्व बीमारी (${cond}) में ${medicine.generic} की खुराक का विशेष ध्यान रखें।`
            : `Caution: Pre-existing condition (${cond}) requires dosage caution with ${medicine.generic}.`
          );
        }
      }
    }

    // Special Diabetes check for sugary syrups or NSAIDs
    if (userConditions.includes('diabet') && medicine.id === 'dextromethorphan') {
      reasons.push(isHi
        ? 'डायबिटीज चेतावनी: कई कफ सिरप में चीनी (शुगर बेस) होती है। केवल शुगर-फ्री सिरप का ही चयन करें।'
        : 'Diabetic Alert: Many standard cough syrups contain high sugar bases. Ensure sugar-free formulation is chosen.'
      );
    }

    // Special Hypertension check for decongestants
    if (userConditions.includes('hypertension') || userConditions.includes('bp') || userConditions.includes('blood pressure')) {
      if (medicine.id === 'sinarest') {
        reasons.push(isHi
          ? 'हाई बीपी सावधानी: इस दवा में मौजूद फेनिलफ्रीन रक्त नलिकाओं को सिकोड़कर ब्लड प्रेशर बढ़ा सकता है।'
          : 'Hypertension Caution: Phenylephrine in cold formulas causes blood vessel constriction and elevates blood pressure.'
        );
        isCriticalConflict = true;
      }
    }

    // 3. DRUG-DRUG INTERACTION CHECK
    const currentMeds = (patientProfile.medicines || '').toLowerCase();
    if (currentMeds && currentMeds !== 'none' && currentMeds !== 'कोई नहीं') {
      for (const drug of conflictRules.interactsWithMeds || []) {
        if (currentMeds.includes(drug.toLowerCase())) {
          reasons.push(isHi
            ? `संभावित दवा टकराव: ${medicine.generic} आपकी वर्तमान नियमित दवा (${drug}) के साथ पारस्परिक क्रिया (interaction) कर सकती है।`
            : `Potential Drug Interaction: ${medicine.generic} can interact with your existing medication (${drug}).`
          );
        }
      }
    }

    // Final Determination
    if (isCriticalConflict) {
      return {
        status: 'danger',
        title: isHi ? 'संभावित गंभीर दवा विरोध (Conflict) पाया गया' : 'Possible Critical Conflict Detected',
        reasons
      };
    } else if (reasons.length > 0) {
      return {
        status: 'warning',
        title: isHi ? 'डॉक्टर या फार्मासिस्ट से परामर्श अवश्य लें' : 'Check with a Doctor / Pharmacist',
        reasons
      };
    } else {
      return {
        status: 'safe',
        title: isHi ? 'हमारे संदर्भ डेटा में कोई विरोध नहीं मिला' : 'No Conflict Found in Our Sample Data',
        reasons: [isHi ? 'आपकी वर्तमान दर्ज प्रोफाइल या एलर्जी के साथ इस दवा का कोई ज्ञात टकराव नहीं मिला।' : 'No known interactions or allergy clashes identified with your current saved profile.']
      };
    }
  },

  /**
   * Educational condition-based medicine classes and doctor questions
   * STRICT SAFETY: Never recommends specific brands or doses!
   */
  getConditionInfo(conditionQuery, lang = 'en') {
    const isHi = lang === 'hi';
    const clean = (conditionQuery || '').toLowerCase();

    const note = "Setu explains medicines. It does not prescribe. Please consult a doctor or pharmacist before taking any medicine.";
    const noteHi = "सेतु दवाओं की व्याख्या करता है, दवा नहीं लिखता। कोई भी दवा लेने से पूर्व डॉक्टर या फार्मासिस्ट से परामर्श अवश्य लें।";

    if (clean.includes('fever') || clean.includes('bukhar')) {
      return {
        categoryTitle: isHi ? "बुखार में डॉक्टर द्वारा प्रायः उपयोग की जाने वाली दवा श्रेणियां" : "Medicine Categories Doctors Commonly Use for Fever",
        categories: isHi ? [
          "• एंटीपायरेटिक्स (Antipyretics): मस्तिष्क के ताप केंद्र को सामान्य करते हैं।",
          "• ओरल रिहाइड्रेशन साल्ट्स (ORS): पसीने से शरीर में पानी की कमी दूर करते हैं।"
        ] : [
          "• Antipyretics: Help regulate the body's internal thermostat.",
          "• Electrolyte Rehydrators: Prevent fluid and salt depletion from fever sweating."
        ],
        questions: isHi ? [
          "1. मेरे बुखार का मूल कारण क्या है (वायरल, बैक्टीरियल या संक्रमण)?",
          "2. मुझे दिन में अधिकतम कितनी मात्रा में दवा लेनी चाहिए?",
          "3. बुखार कितने दिनों से अधिक बना रहने पर मुझे रक्त जांच (CBC/Widal) करानी चाहिए?"
        ] : [
          "1. What is the suspected underlying cause of my fever (viral vs. bacterial)?",
          "2. What is the maximum safe frequency I can take antipyretic medication?",
          "3. At what point should I get a blood test (CBC, dengue, malaria) if it persists?"
        ],
        mandatoryNote: isHi ? noteHi : note
      };
    }

    if (clean.includes('acid') || clean.includes('gerd') || clean.includes('heartburn') || clean.includes('jalan')) {
      return {
        categoryTitle: isHi ? "एसिडिटी व सीने में जलन हेतु सामान्य चिकित्सा श्रेणियां" : "Medicine Categories Doctors Commonly Use for Acidity",
        categories: isHi ? [
          "• प्रोटॉन पंप अवरोधक (PPIs): पेट में अतिरिक्त तेजाब बनने से रोकते हैं।",
          "• H2 रिसेप्टर ब्लॉकर्स / एंटासिड सिरप: तात्कालिक जलन में आराम हेतु।"
        ] : [
          "• Proton Pump Inhibitors (PPIs): Temporarily turn off acid pumps in stomach cells.",
          "• H2 Blockers / Antacids: Provide fast neutralizing relief for burning sensations."
        ],
        questions: isHi ? [
          "1. क्या यह एसिडिटी भोजन की आदत से है या पेट में अल्सर/इन्फेक्शन (H. pylori) का संकेत?",
          "2. क्या मुझे यह दवा सुबह खाली पेट लेनी चाहिए या भोजन के बाद?",
          "3. इसके लिए मुझे खान-पान में क्या बदलाव करने चाहिए?"
        ] : [
          "1. Is my reflux triggered by diet or could it be an H. pylori infection or ulcer?",
          "2. Should I take this medication 30 minutes before breakfast on an empty stomach?",
          "3. What lifestyle or dietary adjustments will prevent recurrence without pills?"
        ],
        mandatoryNote: isHi ? noteHi : note
      };
    }

    // Default General Condition Guidance
    return {
      categoryTitle: isHi ? "इस स्थिति हेतु सामान्य चिकित्सा श्रेणियां" : "General Medicine Categories Doctors Consider",
      categories: isHi ? [
        "• लक्षणात्मक राहत दवाइयां (Symptom-directed therapy)",
        "• सहायक एवं पोषण पूरक (Supportive hydration & supplements)"
      ] : [
        "• Targeted Symptom Relievers: Alleviate acute discomfort.",
        "• Supportive Hydration and Restorative Care."
      ],
      questions: isHi ? [
        "1. इस समस्या के लिए सबसे सुरक्षित प्रथम उपचार क्या है?",
        "2. क्या मुझे किसी विशेष दवा से बचना चाहिए?",
        "3. कितने दिनों में सुधार न होने पर मुझे दोबारा जांच करानी चाहिए?"
      ] : [
        "1. What is the safest first-line approach for this condition?",
        "2. Are there any over-the-counter medicines I should strictly avoid?",
        "3. What monitoring timeline do you recommend before a follow-up review?"
      ],
      mandatoryNote: isHi ? noteHi : note
    };
  }
};
