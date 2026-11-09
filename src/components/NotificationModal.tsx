import React, { useState } from 'react';
import {
  Bell,
  X,
  ArrowLeft,
  Pill,
  Droplets,
  Calendar,
  CheckCircle2,
  Sparkles,
  Volume2,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { Language, UserProfile } from '../types';

export interface NotificationPreferences {
  medicationReminders: boolean;
  waterAndVitals: boolean;
  doctorAppointments: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  userProfile: UserProfile;
  preferences: NotificationPreferences;
  onUpdatePreferences: (prefs: NotificationPreferences) => void;
  onTriggerTestNotification: (customType?: 'medication' | 'vitals' | 'appointment') => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  userProfile,
  preferences,
  onUpdatePreferences,
  onTriggerTestNotification,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'settings' | 'history'>('settings');

  const handleToggle = (key: keyof NotificationPreferences) => {
    onUpdatePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  const sampleHistory = [
    {
      id: 'h-1',
      title: currentLanguage === 'SW' ? 'Kikumbusho cha Dawa za Asubuhi' : 'Morning Medication Reminder',
      message:
        userProfile.activeMedications
          ? `${currentLanguage === 'SW' ? 'Muda wa kunywa' : 'Time for'}: ${userProfile.activeMedications}`
          : currentLanguage === 'SW'
          ? 'Kunywa dawa zako za asubuhi pamoja na chakula na maji mengi.'
          : 'Take your prescribed morning dosage with food and plenty of water.',
      time: '08:00 AM',
      type: 'medication',
    },
    {
      id: 'h-2',
      title: currentLanguage === 'SW' ? 'Kiwango cha Maji (Hydration Target)' : 'Hydration & Vitals Check-in',
      message:
        currentLanguage === 'SW'
          ? 'Unywaji wa leo umefikia 1,500 mL. Bado 1,500 mL kufikia lengo lako la siku Dar es Salaam.'
          : 'You logged 1,500 mL so far today. You are halfway to your 3,000 mL hydration target.',
      time: '12:30 PM',
      type: 'vitals',
    },
    {
      id: 'h-3',
      title: currentLanguage === 'SW' ? 'Uthibitisho wa Ushauri wa Daktari' : 'Doctor Appointment Alert',
      message:
        currentLanguage === 'SW'
          ? 'Dk. Mwana Kalili yuko hewani na anasubiri kupokea simu yako ya ushauri wa afya.'
          : 'Dr. Mwana Kalili is currently online and ready for your tele-consultation.',
      time: '03:15 PM',
      type: 'appointment',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0A192F] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-5 text-[#E6F1FF]">
        {/* Header with Universal Back Button */}
        <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group shrink-0"
              title={currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Go Back'}
            >
              <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
              <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/60 border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA]">
                <Bell className="w-4 h-4 text-[#64FFDA]" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#E6F1FF] flex items-center gap-2">
                  {currentLanguage === 'SW' ? 'Arifa za Afya' : 'Health Notifications'}
                </h3>
                <span className="text-[10px] font-mono text-[#8892B0]">
                  Smart Push & SMS Alerts System
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#112240] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-1 rounded-xl bg-[#112240] border border-[#233554] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              activeTab === 'settings'
                ? 'bg-[#1E3A8A] text-[#64FFDA] font-bold shadow-sm'
                : 'text-[#8892B0] hover:text-[#E6F1FF]'
            }`}
          >
            {currentLanguage === 'SW' ? 'Mipangilio ya Arifa' : 'Alert Preferences'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-lg transition-all text-center ${
              activeTab === 'history'
                ? 'bg-[#1E3A8A] text-[#64FFDA] font-bold shadow-sm'
                : 'text-[#8892B0] hover:text-[#E6F1FF]'
            }`}
          >
            {currentLanguage === 'SW' ? 'Historia ya Arifa' : 'Recent Alerts Log'}
          </button>
        </div>

        {/* TAB 1: Alert Preferences & Toggles */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-[#8892B0]">
              {currentLanguage === 'SW'
                ? 'Chagua arifa za kidijitali za afya unazotaka kupokea kwenye simu au kivinjari chako:'
                : 'Configure push alerts and clinic reminders delivered directly to your device:'}
            </p>

            <div className="space-y-3">
              {/* 1. Medication Reminders */}
              <div className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-between gap-3 hover:border-[#1E3A8A] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#E6F1FF]">
                      {currentLanguage === 'SW' ? 'Kikumbusho cha Dawa' : 'Medication Reminders'}
                    </h4>
                    <p className="text-[11px] text-[#8892B0]">
                      {currentLanguage === 'SW'
                        ? 'Arifa za dozi ya asubuhi na jioni (Muda wa kumeza dawa)'
                        : 'Alerts for morning and evening doses (e.g., "Time to take morning medication")'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('medicationReminders')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.medicationReminders ? 'bg-[#64FFDA]' : 'bg-[#233554]'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[#0A192F] shadow-lg ring-0 transition duration-200 ease-in-out ${
                      preferences.medicationReminders ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. Daily Water & Vitals Check-in */}
              <div className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-between gap-3 hover:border-[#1E3A8A] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#E6F1FF]">
                      {currentLanguage === 'SW' ? 'Unywaji Maji & Rekodi za Afya' : 'Daily Water & Vitals Check-in'}
                    </h4>
                    <p className="text-[11px] text-[#8892B0]">
                      {currentLanguage === 'SW'
                        ? 'Ukumbusho wa kunywa maji lita 3 na kuingiza vipimo vya BP/Glucose'
                        : 'Reminders to log daily hydration, blood pressure, and blood glucose'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('waterAndVitals')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.waterAndVitals ? 'bg-[#64FFDA]' : 'bg-[#233554]'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[#0A192F] shadow-lg ring-0 transition duration-200 ease-in-out ${
                      preferences.waterAndVitals ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Doctor Appointment Alerts */}
              <div className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-between gap-3 hover:border-[#1E3A8A] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#E6F1FF]">
                      {currentLanguage === 'SW' ? 'Miadi ya Madaktari' : 'Doctor Appointment Alerts'}
                    </h4>
                    <p className="text-[11px] text-[#8892B0]">
                      {currentLanguage === 'SW'
                        ? 'Arifa za simu za ushauri wa kidaktari na kurejea hospitalini'
                        : 'Direct doctor queue notifications and clinic review updates'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle('doctorAppointments')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    preferences.doctorAppointments ? 'bg-[#64FFDA]' : 'bg-[#233554]'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-[#0A192F] shadow-lg ring-0 transition duration-200 ease-in-out ${
                      preferences.doctorAppointments ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Test Trigger Section */}
            <div className="mt-4 pt-4 border-t border-[#1E3A8A]/40 space-y-2">
              <span className="text-[11px] font-mono text-[#8892B0] uppercase font-bold tracking-wider block">
                {currentLanguage === 'SW' ? 'Kielelezo cha Majaribio (Live Demo)' : 'Live Demo Push Simulator'}
              </span>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => onTriggerTestNotification('medication')}
                  className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#64FFDA]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{currentLanguage === 'SW' ? 'Jaribu Arifa ya Dawa' : 'Trigger Test Notification'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onTriggerTestNotification('vitals')}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] text-xs font-semibold text-[#64FFDA] transition-all"
                >
                  {currentLanguage === 'SW' ? 'Maji / Vitals' : 'Vitals Test'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Recent Alerts Log */}
        {activeTab === 'history' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 animate-fade-in">
            {sampleHistory.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#E6F1FF] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#64FFDA]" />
                    {alert.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#8892B0]">{alert.time}</span>
                </div>
                <p className="text-xs text-[#8892B0] leading-relaxed">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-between text-xs text-[#8892B0]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Tanzania Data Protection Compliant
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] text-[#E6F1FF] font-semibold border border-[#233554]"
          >
            {currentLanguage === 'SW' ? 'Funga' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
