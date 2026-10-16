/**
 * Pharmly Clinical Knowledge Base & Medical Synonym Dictionary
 * 
 * Provides therapeutic categorizations, generic formulation mappings,
 * indication terms (symptoms), and common colloquial names to power
 * intelligent clinical search across the pharmacy inventory.
 */

export interface MedicalKnowledge {
  genericName: string;
  therapeuticClass: string;
  dosageForm: string;
  indications: string[]; // Clinical conditions & symptoms
  relatedKeywords: string[]; // Synonyms, Bengali colloquial terms, and brand aliases
}

export const DRUG_KNOWLEDGE_BASE: Record<string, MedicalKnowledge> = {
  'ACE-PLUS-500': {
    genericName: 'Paracetamol + Caffeine',
    therapeuticClass: 'Analgesics & Antipyretics',
    dosageForm: 'Tablet (500mg + 65mg)',
    indications: ['Fever', 'Headache', 'Body Pain', 'Toothache', 'Migraine', 'Influenza'],
    relatedKeywords: [
      'fever', 'jhor', 'pain', 'batha', 'headache', 'matha batha',
      'cold', 'flu', 'napa', 'paracetamol', 'temp', 'caffeine', 'ace', 'fast'
    ],
  },
  'MOX-500': {
    genericName: 'Amoxicillin Trihydrate',
    therapeuticClass: 'Broad-Spectrum Penicillin Antibiotic',
    dosageForm: 'Capsule (500mg)',
    indications: ['Bacterial Infection', 'Throat Infection', 'Tonsillitis', 'Chest Infection', 'Dental Abscess', 'Pneumonia'],
    relatedKeywords: [
      'antibiotic', 'infection', 'throat', 'gola batha', 'bacterial',
      'fever', 'pneumonia', 'capsule', 'amoxil', 'moxacil', 'pus', 'respiratory'
    ],
  },
  'SECLO-20': {
    genericName: 'Omeprazole',
    therapeuticClass: 'Proton Pump Inhibitors (PPI / Antacid)',
    dosageForm: 'Capsule (20mg)',
    indications: ['Gastric Acidity', 'GERD', 'Peptic Ulcer', 'Heartburn', 'Acid Indigestion', 'Stomach Pain'],
    relatedKeywords: [
      'gastric', 'gas', 'acidity', 'pet batha', 'heartburn', 'buk jala',
      'ulcer', 'gerd', 'antacid', 'stomach', 'omeprazole', 'seclo', 'losectil', 'pantoprazole'
    ],
  },
  'ZITH-500': {
    genericName: 'Azithromycin Di-hydrate',
    therapeuticClass: 'Macrolide Antibiotic',
    dosageForm: 'Tablet (500mg)',
    indications: ['Severe Cough', 'Pharyngitis', 'Sinusitis', 'Typhoid', 'Bronchitis', 'Ear Infection'],
    relatedKeywords: [
      'antibiotic', 'cough', 'kashi', 'throat pain', 'respiratory',
      'infection', 'tonsil', 'fever', 'azithromycin', 'zithrin', 'tritex', 'chest'
    ],
  },
  'HISTA-10': {
    genericName: 'Cetirizine Hydrochloride / Fexofenadine',
    therapeuticClass: 'Second-Generation Antihistamine',
    dosageForm: 'Tablet (10mg)',
    indications: ['Allergic Rhinitis', 'Cold & Sneezing', 'Itching', 'Skin Rash', 'Hives', 'Watery Eyes'],
    relatedKeywords: [
      'allergy', 'cold', 'shordi', 'hachi', 'sneeze', 'cough',
      'itching', 'rash', 'runny nose', 'antihistamine', 'cetirizine', 'fexo', 'histacin', 'alatrol'
    ],
  },
  'METFO-500': {
    genericName: 'Metformin Hydrochloride',
    therapeuticClass: 'Oral Anti-Diabetic Agent (Biguanide)',
    dosageForm: 'Tablet (500mg)',
    indications: ['Type 2 Diabetes Mellitus', 'Glycemic Control', 'Insulin Resistance'],
    relatedKeywords: [
      'diabetes', 'sugar', 'blood sugar', 'diabetic', 'metformin',
      'comet', 'glysup', 'glucose', 'insulin'
    ],
  },
  'CAMLO-5': {
    genericName: 'Amlodipine Besylate',
    therapeuticClass: 'Anti-Hypertensive (Calcium Channel Blocker)',
    dosageForm: 'Tablet (5mg)',
    indications: ['Hypertension (High Blood Pressure)', 'Angina Pectoris', 'Cardiovascular Risk Reduction'],
    relatedKeywords: [
      'pressure', 'blood pressure', 'high bp', 'hypertension',
      'heart', 'cardiac', 'camlodin', 'amlodipine', 'angina', 'chest pressure'
    ],
  },
  'CEEVIT-250': {
    genericName: 'Ascorbic Acid (Vitamin C)',
    therapeuticClass: 'Vitamins & Nutritional Supplements',
    dosageForm: 'Chewable Tablet (250mg)',
    indications: ['Vitamin C Deficiency', 'Immunity Support', 'Scurvy', 'Wound Healing', 'Gum Bleeding'],
    relatedKeywords: [
      'vitamin', 'vitamin c', 'immunity', 'scurvy', 'cold',
      'supplement', 'chewable', 'ceevit', 'citron', 'orange'
    ],
  },
  'ORS-SALINE': {
    genericName: 'Oral Rehydration Salts (WHO Formula)',
    therapeuticClass: 'Electrolytes & Fluid Replacement',
    dosageForm: 'Powder Sachet',
    indications: ['Acute Diarrhea', 'Dehydration', 'Vomiting', 'Heat Stroke', 'Electrolyte Loss'],
    relatedKeywords: [
      'saline', 'ors', 'diarrhea', 'patla paykhana', 'dehydration',
      'pani shunnota', 'vomiting', 'electrolytes', 'orsaline', 'tasty saline'
    ],
  },
};

/**
 * Returns matching medical knowledge for a given SKU and drug name,
 * with intelligent heuristic matching if the SKU is unfamiliar.
 */
export function getDrugClinicalInfo(sku: string, name: string): MedicalKnowledge {
  if (DRUG_KNOWLEDGE_BASE[sku]) {
    return DRUG_KNOWLEDGE_BASE[sku];
  }

  const normalized = (sku + ' ' + name).toLowerCase();

  for (const [, info] of Object.entries(DRUG_KNOWLEDGE_BASE)) {
    if (
      normalized.includes(info.genericName.toLowerCase().split(' ')[0]) ||
      info.relatedKeywords.some((kw) => normalized.includes(kw))
    ) {
      return info;
    }
  }

  return {
    genericName: 'Standard Formulation',
    therapeuticClass: 'General Prescription Medicine',
    dosageForm: 'Standard Unit',
    indications: ['Clinical Prescription'],
    relatedKeywords: [name.toLowerCase()],
  };
}

/**
 * Enhanced Clinical Search: Evaluates query against brand names, SKUs,
 * active generic ingredients, therapeutic classes, and patient symptoms.
 */
export function filterMedicinesBySmartSearch<T extends { id: string; name: string; sku: string }>(
  items: T[],
  query: string
): { results: T[]; matchReasonMap: Record<string, string> } {
  if (!query || !query.trim()) {
    return { results: items, matchReasonMap: {} };
  }

  const q = query.trim().toLowerCase();
  const matchReasonMap: Record<string, string> = {};

  const results = items.filter((item) => {
    // 1. Direct Name match
    if (item.name.toLowerCase().includes(q)) {
      matchReasonMap[item.id] = `Brand match: "${item.name}"`;
      return true;
    }

    // 2. Direct SKU match
    if (item.sku.toLowerCase().includes(q)) {
      matchReasonMap[item.id] = `SKU barcode: "${item.sku}"`;
      return true;
    }

    // 3. Clinical Knowledge & Synonyms match
    const info = getDrugClinicalInfo(item.sku, item.name);

    if (info.genericName.toLowerCase().includes(q)) {
      matchReasonMap[item.id] = `Generic: ${info.genericName}`;
      return true;
    }

    if (info.therapeuticClass.toLowerCase().includes(q)) {
      matchReasonMap[item.id] = `Class: ${info.therapeuticClass}`;
      return true;
    }

    const matchedIndication = info.indications.find((ind) => ind.toLowerCase().includes(q));
    if (matchedIndication) {
      matchReasonMap[item.id] = `Indication / Symptom: ${matchedIndication}`;
      return true;
    }

    const matchedKeyword = info.relatedKeywords.find((kw) => kw.toLowerCase().includes(q));
    if (matchedKeyword) {
      matchReasonMap[item.id] = `Related clinical term: "${matchedKeyword}" (${info.indications[0] || 'Care'})`;
      return true;
    }

    return false;
  });

  return { results, matchReasonMap };
}

