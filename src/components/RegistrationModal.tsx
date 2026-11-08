import React, { useState } from 'react';
import { ShieldCheck, UserCheck, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';
import { ChronicCondition, Language, UserProfile } from '../types';
import { translations } from '../data/mockData';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile: UserProfile;
  currentLanguage: Language;
}

const CHRONIC_OPTIONS: { id: ChronicCondition; labelEn: string; labelSw: string; icon: string }[] = [
  { id: 'HIV', labelEn: 'HIV (Care & Treatment / CTC)', labelSw: 'VVU (Kliniki ya CTC)', icon: '🩸' },
  { id: 'Sickle Cell', labelEn: 'Sickle Cell Disease', labelSw: 'Selimundu (Sickle Cell)', icon: '🧬' },
  { id: 'Hypertension', labelEn: 'Hypertension (High BP)', labelSw: 'Shinikizo la Damu (BP)', icon: '❤️' },
  { id: 'Diabetes', labelEn: 'Diabetes Mellitus', labelSw: 'Ugonjwa wa Kisukari', icon: '🩺' },
  { id: 'Asthma', labelEn: 'Asthma / Respiratory', labelSw: 'Pumu (Asthma)', icon: '🫁' },
  { id: 'None', labelEn: 'None / No Known Conditions', labelSw: 'Sina / Hakuna Ugonjwa Sugu', icon: '✨' },
];

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const [formData, setFormData] = useState<UserProfile>({
    ...initialProfile,
    fullName: initialProfile.fullName || 'Victor Denis',
    email: initialProfile.email || 'victordenis090@gmail.com',
    gender: initialProfile.gender || 'Male',
    age: initialProfile.age || 28,
    phoneNumber: initialProfile.phoneNumber || '+255 754 889 120',
    nationality: initialProfile.nationality || 'Tanzanian',
    chronicConditions: initialProfile.chronicConditions?.length ? initialProfile.chronicConditions : ['None'],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleConditionToggle = (condition: ChronicCondition) => {
    let updated = [...formData.chronicConditions];

    if (condition === 'None') {
      updated = ['None'];
    } else {
      updated = updated.filter((c) => c !== 'None');
      if (updated.includes(condition)) {
        updated = updated.filter((c) => c !== condition);
        if (updated.length === 0) {
          updated = ['None'];
        }
      } else {
        updated.push(condition);
      }
    }

    setFormData({ ...formData, chronicConditions: updated });
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid Email is required';
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Phone number is required';
    if (!formData.age || formData.age < 1 || formData.age > 120) errs.age = 'Valid age required';
    if (!formData.nationality.trim()) errs.nationality = 'Nationality is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSaveProfile({
      ...formData,
      isRegistered: true,
    });
    onClose();
  };

  const handleSkip = () => {
    onSaveProfile({
      ...formData,
      isRegistered: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0A192F] border-2 border-[#1E3A8A] rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Top Decorative Clinical Banner */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#112240] p-5 sm:p-6 text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#0A192F]/60 backdrop-blur-sm border border-[#64FFDA]/40 flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-6 h-6 text-[#64FFDA]" />
            </div>
            <div>
              <span className="inline-block px-2 py-0.5 text-[10px] font-mono tracking-wider uppercase rounded bg-[#64FFDA]/20 text-[#64FFDA] border border-[#64FFDA]/30 font-bold mb-1">
                Clinical Onboarding
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF] tracking-tight">
                {t.registration.modalTitle}
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#E6F1FF]/80 mt-2">
            {t.registration.modalSubtitle}
          </p>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 bg-[#0A192F]">
          {/* Section 1: Required Basic Demographics */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#64FFDA] uppercase tracking-wider">
              <UserCheck className="w-4 h-4" />
              <span>1. Required Basic Fields / Taarifa za Msingi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.fullName} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Victor Denis"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#112240] border ${
                    errors.fullName ? 'border-rose-500' : 'border-[#233554]'
                  } text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] focus:ring-1 focus:ring-[#64FFDA] transition-all`}
                />
                {errors.fullName && <p className="text-rose-400 text-[11px] mt-1">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.email} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="victordenis090@gmail.com"
                  className={`w-full px-3.5 py-2 rounded-xl bg-[#112240] border ${
                    errors.email ? 'border-rose-500' : 'border-[#233554]'
                  } text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] focus:ring-1 focus:ring-[#64FFDA] transition-all`}
                />
                {errors.email && <p className="text-rose-400 text-[11px] mt-1">{errors.email}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.phoneNumber} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+255 754 889 120"
                  className={`w-full px-3.5 py-2 rounded-xl bg-[#112240] border ${
                    errors.phoneNumber ? 'border-rose-500' : 'border-[#233554]'
                  } text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] focus:ring-1 focus:ring-[#64FFDA] transition-all`}
                />
                {errors.phoneNumber && <p className="text-rose-400 text-[11px] mt-1">{errors.phoneNumber}</p>}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.gender} <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' | 'Other' })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] transition-all"
                >
                  <option value="Male">Male / Mwanaume</option>
                  <option value="Female">Female / Mwanamke</option>
                  <option value="Other">Other / Nyingine</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.age} <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                  className={`w-full px-3.5 py-2 rounded-xl bg-[#112240] border ${
                    errors.age ? 'border-rose-500' : 'border-[#233554]'
                  } text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] transition-all`}
                />
              </div>

              {/* Nationality */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#8892B0] mb-1">
                  {t.registration.nationality} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Tanzanian"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] text-sm focus:outline-none focus:border-[#64FFDA] transition-all"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-[#8892B0]">🇹🇿 East Africa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Medical History Questionnaire (Skippable) */}
          <div className="pt-2 border-t border-[#1E3A8A]/30">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
                <HeartPulse className="w-4 h-4" />
                <span>2. Medical History Questionnaire (Skippable)</span>
              </div>
              <span className="text-[10px] text-[#8892B0] italic">Optional</span>
            </div>
            <p className="text-xs text-[#8892B0] mb-3">
              {t.registration.questionnaireSub}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CHRONIC_OPTIONS.map((item) => {
                const isSelected = formData.chronicConditions.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleConditionToggle(item.id)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all duration-150 ${
                      isSelected
                        ? 'bg-[#1E3A8A]/50 border-[#64FFDA] text-[#E6F1FF] shadow-sm'
                        : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-[#E6F1FF] hover:border-[#1E3A8A]'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold">{currentLanguage === 'EN' ? item.labelEn : item.labelSw}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-[#64FFDA] border-[#64FFDA]' : 'border-[#8892B0]'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#0A192F]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons: Skip for Now & Complete Setup */}
          <div className="pt-4 border-t border-[#1E3A8A]/40 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#112240] border border-[#233554] transition-all"
            >
              {t.registration.skipForNow}
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] hover:shadow-lg hover:shadow-[#64FFDA]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t.registration.saveAndContinue}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
