import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Save,
  Heart,
  Phone,
  FileCheck,
  Share2,
  CheckCircle,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { ChronicCondition, Language, UserProfile } from '../types';
import { translations } from '../data/mockData';

interface ProfileSettingsProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  currentLanguage: Language;
  onLockProfile?: () => void;
}

const CHRONIC_OPTIONS: { id: ChronicCondition; labelEn: string; labelSw: string; icon: string }[] = [
  { id: 'HIV', labelEn: 'HIV (Care & Treatment / CTC)', labelSw: 'VVU (Kliniki ya CTC)', icon: '🩸' },
  { id: 'Sickle Cell', labelEn: 'Sickle Cell Disease', labelSw: 'Selimundu (Sickle Cell)', icon: '🧬' },
  { id: 'Hypertension', labelEn: 'Hypertension (High BP)', labelSw: 'Shinikizo la Damu (BP)', icon: '❤️' },
  { id: 'Diabetes', labelEn: 'Diabetes Mellitus', labelSw: 'Ugonjwa wa Kisukari', icon: '🩺' },
  { id: 'Asthma', labelEn: 'Asthma / Respiratory', labelSw: 'Pumu (Asthma)', icon: '🫁' },
  { id: 'None', labelEn: 'None / No Known Conditions', labelSw: 'Sina / Hakuna Ugonjwa Sugu', icon: '✨' },
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  userProfile,
  onUpdateProfile,
  currentLanguage,
  onLockProfile,
}) => {
  const t = translations[currentLanguage];

  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] border border-[#1E3A8A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA] shadow-md">
            <User className="w-6 h-6 text-[#64FFDA]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF]">
              {t.profile.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#8892B0] mt-1">
              {currentLanguage === 'EN'
                ? 'Manage your patient demographics, registered chronic history, and emergency passport.'
                : 'Badilisha taarifa zako binafsi, historia ya magonjwa sugu, na namba za dharura.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onLockProfile && (
            <button
              type="button"
              onClick={onLockProfile}
              className="px-3.5 py-2 rounded-xl bg-[#0A192F] hover:bg-rose-950/40 border border-[#233554] hover:border-rose-500/50 text-[#8892B0] hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Lock Profile Session"
            >
              <Lock className="w-3.5 h-3.5 text-rose-400" />
              <span>{currentLanguage === 'SW' ? 'Funga Wasifu (Lock)' : 'Lock Vault'}</span>
            </button>
          )}

          {isSavedNotice && (
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Profile Saved!</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#112240] border border-[#233554] space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#64FFDA] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{t.profile.personalDetails}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.fullName}</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.email}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.phoneNumber}</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.nationality}</label>
              <input
                type="text"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.gender}</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.registration.age}</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 28 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Clinical Indicators & Chronic Conditions */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#112240] border border-[#233554] space-y-4">
          <h3 className="font-heading font-bold text-sm text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>{t.profile.chronicConditions}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CHRONIC_OPTIONS.map((item) => {
              const isSelected = formData.chronicConditions.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleConditionToggle(item.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                    isSelected
                      ? 'bg-[#1E3A8A]/50 border-[#64FFDA] text-[#E6F1FF] shadow-sm'
                      : 'bg-[#0A192F] border-[#233554] text-[#8892B0] hover:text-[#E6F1FF]'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1 font-semibold">{currentLanguage === 'EN' ? item.labelEn : item.labelSw}</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#1E3A8A]/30 text-xs">
            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">Blood Group</label>
              <select
                value={formData.bloodGroup || 'O+'}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF]"
              >
                <option value="O+">O Rh-Positive (O+)</option>
                <option value="O-">O Rh-Negative (O-)</option>
                <option value="A+">A Rh-Positive (A+)</option>
                <option value="A-">A Rh-Negative (A-)</option>
                <option value="B+">B Rh-Positive (B+)</option>
                <option value="B-">B Rh-Negative (B-)</option>
                <option value="AB+">AB Rh-Positive (AB+)</option>
                <option value="AB-">AB Rh-Negative (AB-)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8892B0] mb-1 font-semibold">National Health Insurance (NHIF) Card #</label>
              <input
                type="text"
                value={formData.nhifNumber || ''}
                onChange={(e) => setFormData({ ...formData, nhifNumber: e.target.value })}
                placeholder="NHIF-TZ-8849-0129"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#8892B0] mb-1 font-semibold">{t.profile.emergencyContact}</label>
              <input
                type="text"
                value={formData.emergencyContact || ''}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="+255 784 112 900 (Esther Denis - Sister)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0A192F] border border-[#233554] text-[#E6F1FF]"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-xs font-bold text-[#0A192F] bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] hover:shadow-lg hover:shadow-[#64FFDA]/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{t.profile.saveChanges}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
