export type Language = 'EN' | 'SW';

export type ChronicCondition = 'HIV' | 'Sickle Cell' | 'Hypertension' | 'Diabetes' | 'Asthma' | 'None';

export interface UserProfile {
  fullName: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  phoneNumber: string;
  nationality: string;
  chronicConditions: ChronicCondition[];
  bloodGroup?: string;
  emergencyContact?: string;
  nhifNumber?: string;
  isRegistered: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language: Language;
  assessment?: {
    severity: 'mild' | 'moderate' | 'urgent';
    summary: string;
    steps: string[];
    emergencyWarning?: string;
    suggestedAction?: 'call_doctor' | 'find_hospital' | 'home_care';
  };
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialty: 'General Practitioner' | 'Gynecologist' | 'Pediatrician' | 'Cardiologist';
  experienceYears: number;
  hospitalAffiliation: string;
  avatarUrl: string;
  rating: number;
  languages: string[];
  privatePhone: string;
  availableNow: boolean;
}

export interface ConsultationTier {
  id: 'standard' | 'specialist' | 'emergency';
  titleEn: string;
  titleSw: string;
  priceTzs: number;
  badgeColor: string;
  duration: string;
  descriptionEn: string;
  descriptionSw: string;
}

export interface HealthFacility {
  id: string;
  name: string;
  area: string;
  address: string;
  distanceKm: number;
  isOpenNow: boolean;
  isNhifAccepted: boolean;
  phone: string;
  emergencyPhone: string;
  rating: number;
  services: {
    xrayUltrasound: boolean;
    pathologyLab: boolean;
    emergency24_7: boolean;
    maternity: boolean;
    dialysis: boolean;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface HealthMetricEntry {
  id: string;
  date: string;
  systolicBp: number;
  diastolicBp: number;
  bloodGlucoseMmol: number;
  heartRateBpm: number;
  hydrationMl: number;
}

export interface SavedConsultation {
  id: string;
  date: string;
  title: string;
  chiefComplaint: string;
  symptomsTags: string[];
  severity: 'mild' | 'moderate' | 'urgent';
  messages: ChatMessage[];
  outcomeSummary: string;
}
