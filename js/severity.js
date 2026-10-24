/**
 * Setu Severity & Emergency Assessment Engine
 * Computes urgency score across:
 * 1. Red-flag clinical keywords (chest pain, stroke, breathing, bleeding, etc.)
 * 2. Words indicating acute intoxication or emergency: "unconscious", "not breathing", "overdose", "wrongly took medicine", "drank poison"
 * 3. 1-10 Severity slider
 * 4. Critical medicine conflict status
 * Output: Low / Moderate / High / Critical + human-readable justification
 */

export const SeverityEngine = {
  CRITICAL_KEYWORDS: [
    'chest pain', 'heart attack', 'trouble breathing', 'shortness of breath', 'cannot breathe',
    'severe bleeding', 'fainting', 'unconscious', 'not breathing', 'lost consciousness',
    'overdose', 'wrongly took medicine', 'poison', 'poisoning', 'swallowed pills', 'suicide',
    'stroke', 'paralysis', 'slurred speech', 'seizure', 'convulsion', 'blue lips',
    // Hindi transliterated
    'seene me dard', 'saans nahi aa rahi', 'behosh', 'overdose', 'galat dawa', 'zeher'
  ],

  HIGH_KEYWORDS: [
    'severe abdominal pain', 'vomiting blood', 'coughing blood', 'high fever with stiff neck',
    'confusion', 'disoriented', 'acute vision loss', 'anaphylaxis', 'choking'
  ],

  MODERATE_KEYWORDS: [
    'fever', 'cough', 'vomiting', 'diarrhea', 'infection', 'headache', 'dizziness',
    'rash', 'joint pain', 'stomach pain', 'burning urination', 'chills'
  ],

  /**
   * Calculate emergency severity level
   * @param {Object} inputs
   * @param {string} inputs.concern - Text from chat or prep
   * @param {number} inputs.sliderSeverity - 1 to 10
   * @param {string} inputs.medicineSafetyStatus - 'safe' | 'warning' | 'danger'
   * @param {string} inputs.lang - 'en' | 'hi'
   * @returns {{ level: 'Low'|'Moderate'|'High'|'Critical', score: number, reason: string, shouldEscalate: boolean }}
   */
  assessSeverity(inputs = {}) {
    const text = (inputs.concern || '').toLowerCase();
    const slider = parseInt(inputs.sliderSeverity, 10) || 5;
    const medConflict = inputs.medicineSafetyStatus || 'safe';
    const isHi = inputs.lang === 'hi';

    let matchedCritical = [];
    let matchedHigh = [];

    for (const kw of this.CRITICAL_KEYWORDS) {
      if (text.includes(kw)) {
        matchedCritical.push(kw);
      }
    }

    for (const kw of this.HIGH_KEYWORDS) {
      if (text.includes(kw)) {
        matchedHigh.push(kw);
      }
    }

    // CRITICAL TIER (Score 90-100)
    if (matchedCritical.length > 0 || (slider >= 9 && matchedHigh.length > 0) || text.includes('overdose') || text.includes('not breathing')) {
      const trigger = matchedCritical[0] || 'severe acute distress';
      return {
        level: 'Critical',
        score: 95,
        shouldEscalate: true,
        reason: isHi
          ? `क्योंकि आपने अत्यधिक गंभीर लक्षण दर्ज किए हैं ("${trigger}") तथा कष्ट तीव्रता ${slider}/10 है।`
          : `Because red-flag emergency symptoms were detected ("${trigger}") with reported severity ${slider}/10.`
      };
    }

    // HIGH TIER (Score 70-89)
    if (slider >= 8 || matchedHigh.length > 0 || (medConflict === 'danger' && slider >= 6)) {
      const why = matchedHigh[0] || (medConflict === 'danger' ? 'critical medicine conflict' : `high pain score (${slider}/10)`);
      return {
        level: 'High',
        score: 78,
        shouldEscalate: true,
        reason: isHi
          ? `उच्च जोखिम: तीव्र दर्द (${slider}/10) अथवा संभावित गंभीर दवा विरोध (${why}) की पहचान हुई है।`
          : `High risk: High clinical discomfort score (${slider}/10) and/or marked indicator ("${why}").`
      };
    }

    // MODERATE TIER (Score 40-69)
    if (slider >= 4 || medConflict === 'warning') {
      return {
        level: 'Moderate',
        score: 50,
        shouldEscalate: false,
        reason: isHi
          ? `मध्यम लक्षण: कष्ट स्तर ${slider}/10 है। ई-संजीवनी या आयुष्मान आरोग्य मंदिर में परामर्श की सलाह दी जाती है।`
          : `Moderate symptoms (severity ${slider}/10). Medical teleconsult on eSanjeevani or local Arogya Mandir visit recommended.`
      };
    }

    // LOW TIER (Score 0-39)
    return {
      level: 'Low',
      score: 20,
      shouldEscalate: false,
      reason: isHi
        ? `सामान्य स्थिति: कोई आपातकालीन लक्षण नहीं पाया गया। आराम व सामान्य स्वास्थ्य देखभाल पर्याप्त है।`
        : `Mild / baseline condition. No urgent alarm symptoms identified. Rest and routine care suitable.`
    };
  }
};
