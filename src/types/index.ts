export type Language = 'EN' | 'SW';

export type ChronicCondition = 'HIV' | 'Sickle Cell' | 'Hypertension' | 'Diabetes' | 'Asthma' | 'None';

export type HemoglobinGenotype = 'AA (Normal)' | 'AS (Sickle Cell Trait)' | 'SS (Sickle Cell Anemia)' | 'Unknown';

export type SpecialHealthStatus = 'Smoking' | 'Alcohol' | 'Currently Pregnant' | 'Lactating' | 'None';

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
  // New clinical fields
  activeMedications?: string;
  knownAllergies?: string;
  hemoglobinGenotype?: HemoglobinGenotype;
  pastSurgeries?: string;
  specialHealthStatus?: SpecialHealthStatus[];
}

export interface ChatAttachment {
  type: 'image' | 'file';
  name: string;
  url?: string;
  size?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  language: Language;
  attachment?: ChatAttachment;
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

export interface MedicationSchedule {
  id: string;
  medicationName: string;
  dosage: string;
  timeOfDay: string;
  frequency: 'Once Daily' | 'Twice Daily' | 'Three Times Daily' | 'Every 8 Hours' | 'As Needed';
  duration: string;
  instruction?: string;
  isActive: boolean;
  startDate: string;
  lastTakenDate?: string;
}

export interface DiagnosticBookingTicket {
  ticketId: string;
  facilityId: string;
  facilityName: string;
  serviceCategory: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  patientName: string;
  patientPhone: string;
  insuranceType: 'NHIF' | 'Private / Cash';
  nhifNumber?: string;
  priceTzs: number;
  status: 'Confirmed' | 'Pending';
  generatedAt: string;
}
