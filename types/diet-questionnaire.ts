export type DietQuestionnaireStatus =
  | 'draft'
  | 'completed';

export type DietQuestionType =
  | 'single'
  | 'multi'
  | 'text'
  | 'number';

export type DietQuestionnaireValue =
  | string
  | number
  | string[];

export type DietQuestionId =
  | 'goal'
  | 'age'
  | 'gender'
  | 'height'
  | 'currentWeight'
  | 'targetWeight'
  | 'dietHistory'
  | 'activityLevel'
  | 'foodAllergies'
  | 'medicalConditions'
  | 'medications'
  | 'foodPreferences'
  | 'mealPattern'
  | 'cookingTime';

export interface DietQuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface DietQuestionShowWhen {
  questionId: DietQuestionId;
  values: string[];
}

export interface DietQuestion {
  id: DietQuestionId;
  type: DietQuestionType;
  title: string;
  description?: string;
  placeholder?: string;

  required?: boolean;

  min?: number;
  max?: number;
  step?: number;

  maxLength?: number;

  options?: DietQuestionOption[];

  multiple?: boolean;

  showWhen?: DietQuestionShowWhen;

  unit?: string;
}

export type DietQuestionnaireAnswers = Partial<
  Record<DietQuestionId, DietQuestionnaireValue>
>;

export interface DietQuestionnaireSession {
  id: string;

  phone: string;

  customerId?: number;

  status: DietQuestionnaireStatus;

  currentStep: number;

  answers: DietQuestionnaireAnswers;

  version: number;

  createdAt: number;

  updatedAt: number;

  completedAt?: number;
}