import React from 'react';
import { Menu, Globe, Shield, PhoneCall, ArrowLeft, Bell } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/mockData';

interface HeaderProps {
  currentLanguage: Language;
  onToggleLanguage: () => void;
  onOpenDrawer: () => void;
  onOpenDoctorModal: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationCount?: number;
  userProfile: UserProfile;
  activeTab: 'chat' | 'doctor' | 'facilities' | 'tracker' | 'profile' | 'medication' | 'surveillance';
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onToggleLanguage,
  onOpenDrawer,
  onOpenDoctorModal,
  onOpenNotifications,
  unreadNotificationCount = 2,
  userProfile,
  activeTab,
  onGoHome,
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0A192F]/90 backdrop-blur-md border-b border-[#1E3A8A]/40 px-4 py-3 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left: Go Back Button (if on non-chat view), Hamburger Menu and Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeTab !== 'chat' && (
            <button
              onClick={onGoHome}
              aria-label="Go Back to AfyaYangu Chat / Rudi Nyuma"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/50 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-md shadow-[#64FFDA]/10 group animate-fade-in"
              title={currentLanguage === 'SW' ? 'Rudi Nyuma kwenye AfyaYangu Chat' : 'Back / Rudi Nyuma'}
            >
              <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold tracking-wide">
                {currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}
              </span>
            </button>
          )}

          <button
            onClick={onOpenDrawer}
            aria-label="Open Navigation Menu"
            className="p-2 -ml-1 text-[#E6F1FF] hover:text-[#64FFDA] bg-[#112240]/80 hover:bg-[#1E3A8A]/50 border border-[#233554] rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center group active:scale-95"
            title={t.menu}
          >
            <Menu className="w-5 h-5 transition-transform group-hover:scale-110 text-[#64FFDA]" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onGoHome}>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] shadow-md border border-[#64FFDA]/30">
              <Shield className="w-4 h-4 text-[#64FFDA]" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#64FFDA] rounded-full animate-ping opacity-75" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#64FFDA] rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-base tracking-tight text-[#E6F1FF]">
                  Vanguard <span className="text-[#64FFDA]">MedTech</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-mono tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#1E3A8A]/40 border border-[#2563EB]/40 text-[#64FFDA]">
                  Triage 2.5
                </span>
              </div>
              <p className="text-[11px] text-[#8892B0] hidden md:block">
                {t.appSubtitle} • Dar es Salaam, TZ
              </p>
            </div>
          </div>
        </div>

        {/* Right: Tele-doc quick shortcut, Notification Bell & Language Toggle (EN | SW) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenDoctorModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#2563EB]/50 text-[#E6F1FF] hover:text-[#64FFDA] transition-all duration-200 active:scale-95 shadow-sm"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{currentLanguage === 'EN' ? 'Talk to Doctor (TZS 1k)' : 'Ongea na Daktari (TZS 1k)'}</span>
          </button>

          {/* Simulated Smart Push Notifications Bell Icon */}
          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/60 border border-[#233554] hover:border-[#64FFDA] text-[#E6F1FF] hover:text-[#64FFDA] transition-all duration-200 shadow-sm active:scale-95 group"
              title={currentLanguage === 'SW' ? 'Arifa za Afya' : 'Health Notifications'}
              aria-label="Health Notifications"
            >
              <Bell className="w-4 h-4 text-[#64FFDA] group-hover:rotate-12 transition-transform" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-mono font-bold text-white shadow-sm ring-1 ring-[#0A192F]">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          )}

          {/* Bilingual Language Switcher (EN | SW) */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/60 border border-[#64FFDA]/40 text-xs font-bold text-[#E6F1FF] hover:border-[#64FFDA] transition-all duration-200 shadow-sm active:scale-95"
            title="Toggle English / Swahili"
          >
            <Globe className="w-3.5 h-3.5 text-[#64FFDA]" />
            <span className={currentLanguage === 'EN' ? 'text-[#64FFDA]' : 'text-[#8892B0]'}>EN</span>
            <span className="text-zinc-600">|</span>
            <span className={currentLanguage === 'SW' ? 'text-[#64FFDA]' : 'text-[#8892B0]'}>SW</span>
          </button>

          {/* User Avatar Mini Badge */}
          <div
            onClick={onOpenDrawer}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-[#E6F1FF] font-bold text-xs border border-[#64FFDA]/40 cursor-pointer hover:border-[#64FFDA] transition-all"
            title={userProfile.fullName}
          >
            {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'V'}
          </div>
        </div>
      </div>
    </header>
  );
};
