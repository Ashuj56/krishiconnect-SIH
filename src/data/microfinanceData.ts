// Loan purposes
export const loanPurposes = [
  { value: 'fertilizers', label: 'Fertilizers', icon: '🌱' },
  { value: 'irrigation', label: 'Irrigation System', icon: '💧' },
  { value: 'pesticides', label: 'Pest Control', icon: '🐛' },
  { value: 'seeds', label: 'Seeds', icon: '🌾' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'labour', label: 'Labour', icon: '👷' },
  { value: 'harvesting', label: 'Harvesting', icon: '🌾' },
];

// Crop stages with loan eligibility multipliers
export const cropStageFactors: Record<string, { label: string; multiplier: number; description: string }> = {
  'seedling': { label: 'Seedling', multiplier: 0.5, description: 'Early stage - Lower loan amount' },
  'vegetative': { label: 'Vegetative', multiplier: 0.7, description: 'Growth stage - Medium loan amount' },
  'flowering': { label: 'Flowering', multiplier: 1.0, description: 'Critical stage - Full loan amount' },
  'fruiting': { label: 'Fruiting', multiplier: 0.9, description: 'Late stage - High loan amount' },
  'harvesting': { label: 'Harvesting', multiplier: 0.6, description: 'Harvest stage - Medium loan amount' },
};

// Soil health scoring
export const soilHealthScoring = {
  ph: {
    ideal: { min: 6.0, max: 7.5, score: 100 },
    acceptable: { min: 5.5, max: 8.0, score: 70 },
    poor: { score: 40 },
  },
  nitrogen: {
    high: { min: 280, score: 100 },
    medium: { min: 140, score: 70 },
    low: { score: 40 },
  },
  phosphorus: {
    high: { min: 25, score: 100 },
    medium: { min: 10, score: 70 },
    low: { score: 40 },
  },
  potassium: {
    high: { min: 280, score: 100 },
    medium: { min: 140, score: 70 },
    low: { score: 40 },
  },
};

// Farmer categories based on land holdings
export const farmerCategories = {
  small: { maxAcres: 2, multiplier: 0.8, label: 'Small Farmer' },
  medium: { maxAcres: 5, multiplier: 1.0, label: 'Medium Farmer' },
  large: { maxAcres: Infinity, multiplier: 1.2, label: 'Large Farmer' },
};

// Calculate eligibility score and loan amount
export interface EligibilityInput {
  cropStage?: string;
  soilPh?: number;
  soilNitrogen?: number;
  soilPhosphorus?: number;
  soilPotassium?: number;
  landArea?: number;
  requestedAmount: number;
  pastLoansCount?: number;
  pastDefaultsCount?: number;
}

export interface EligibilityResult {
  eligibilityScore: number;
  maxEligibleAmount: number;
  recommendedInterestRate: number;
  recommendedDuration: number;
  factors: {
    cropStageFactor: number;
    soilHealthFactor: number;
    farmerCategoryFactor: number;
    creditHistoryFactor: number;
  };
  isEligible: boolean;
  message: string;
}

export function calculateEligibility(input: EligibilityInput): EligibilityResult {
  // Crop stage factor (default to vegetative if not specified)
  const cropStage = input.cropStage || 'vegetative';
  const cropStageFactor = cropStageFactors[cropStage]?.multiplier || 0.7;

  // Soil health factor
  let soilScore = 70; // Default average
  if (input.soilPh !== undefined) {
    if (input.soilPh >= 6.0 && input.soilPh <= 7.5) {
      soilScore = 100;
    } else if (input.soilPh >= 5.5 && input.soilPh <= 8.0) {
      soilScore = 70;
    } else {
      soilScore = 40;
    }
  }
  
  if (input.soilNitrogen !== undefined) {
    if (input.soilNitrogen >= 280) soilScore = (soilScore + 100) / 2;
    else if (input.soilNitrogen >= 140) soilScore = (soilScore + 70) / 2;
    else soilScore = (soilScore + 40) / 2;
  }
  const soilHealthFactor = soilScore / 100;

  // Farmer category factor
  let farmerCategoryFactor = 1.0;
  if (input.landArea !== undefined) {
    if (input.landArea <= 2) farmerCategoryFactor = 0.8;
    else if (input.landArea <= 5) farmerCategoryFactor = 1.0;
    else farmerCategoryFactor = 1.2;
  }

  // Credit history factor
  let creditHistoryFactor = 1.0;
  if (input.pastDefaultsCount && input.pastDefaultsCount > 0) {
    creditHistoryFactor = Math.max(0.3, 1 - (input.pastDefaultsCount * 0.2));
  } else if (input.pastLoansCount && input.pastLoansCount > 0) {
    creditHistoryFactor = Math.min(1.2, 1 + (input.pastLoansCount * 0.05));
  }

  // Calculate overall eligibility score (0-100)
  const eligibilityScore = Math.round(
    (cropStageFactor * 25 + soilHealthFactor * 25 + farmerCategoryFactor * 25 + creditHistoryFactor * 25)
  );

  // Calculate max eligible amount based on score
  const baseAmount = 50000; // Base loan amount
  const maxEligibleAmount = Math.round(
    baseAmount * cropStageFactor * soilHealthFactor * farmerCategoryFactor * creditHistoryFactor
  );

  // Determine interest rate (lower score = higher interest)
  const recommendedInterestRate = eligibilityScore >= 80 ? 6.5 :
    eligibilityScore >= 60 ? 7.5 :
    eligibilityScore >= 40 ? 8.5 : 9.5;

  // Determine loan duration
  const recommendedDuration = eligibilityScore >= 70 ? 12 : eligibilityScore >= 50 ? 9 : 6;

  // Final eligibility check
  const isEligible = eligibilityScore >= 30 && maxEligibleAmount >= input.requestedAmount * 0.5;

  const message = isEligible
    ? `You are eligible for a loan up to ₹${maxEligibleAmount.toLocaleString()}`
    : 'Unfortunately, you do not meet the minimum eligibility criteria';

  return {
    eligibilityScore,
    maxEligibleAmount,
    recommendedInterestRate,
    recommendedDuration,
    factors: {
      cropStageFactor,
      soilHealthFactor,
      farmerCategoryFactor,
      creditHistoryFactor,
    },
    isEligible,
    message,
  };
}

// Calculate EMI
export function calculateEMI(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi);
}

// Generate repayment schedule
export function generateRepaymentSchedule(
  principal: number,
  annualRate: number,
  months: number,
  startDate: Date
): Array<{ dueDate: Date; amount: number; principal: number; interest: number; balance: number }> {
  const emi = calculateEMI(principal, annualRate, months);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const schedule = [];

  for (let i = 1; i <= months; i++) {
    const interest = Math.round(balance * monthlyRate);
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    schedule.push({
      dueDate,
      amount: emi,
      principal: principalPart,
      interest,
      balance: Math.round(balance),
    });
  }

  return schedule;
}
