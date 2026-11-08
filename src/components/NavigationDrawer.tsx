import React from 'react';
import {
  X,
  MessageSquare,
  PhoneCall,
  Hospital,
  Activity,
  User,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../data/mockData';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'chat' | 'doctor' | 'facilities' | 'tracker' | 'profile';
  onSelectTab: (tab: 'chat' | 'doctor' | 'facilities' | 'tracker' | 'profile') => void;
  userProfile: UserProfile;
  currentLanguage: Language;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  userProfile,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  if (!isOpen) return null;

  const navItems = [
    {
      id: 'chat' as const,
      label: t.navDrawer.aiChat,
      icon: MessageSquare,
      badge: 'Live AI',
      color: 'text-[#64FFDA]',
    },
    {
      id: 'doctor' as const,
      label: t.navDrawer.telemedicine,
      icon: PhoneCall,
      badge: 'TZS 1,000',
      color: 'text-emerald-400',
    },
    {
      id: 'facilities' as const,
      label: t.navDrawer.facilities,
      icon: Hospital,
      badge: 'Dar es Salaam',
      color: 'text-blue-400',
    },
    {
      id: 'tracker' as const,
      label: t.navDrawer.records,
      icon: Activity,
      badge: 'Vitals & Logs',
      color: 'text-purple-400',
    },
    {
      id: 'profile' as const,
      label: t.navDrawer.profile,
      icon: User,
      badge: userProfile.nationality,
      color: 'text-cyan-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-xs sm:max-w-sm w-full bg-[#0A192F] border-r border-[#1E3A8A]/50 shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* Header Section */}
        <div>
          <div className="p-4 border-b border-[#1E3A8A]/40 flex items-center justify-between bg-[#112240]/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E3A8A] to-[#2563EB] flex items-center justify-center border border-[#64FFDA]/30">
                <ShieldCheck className="w-5 h-5 text-[#64FFDA]" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-sm text-[#E6F1FF]">
                  {t.navDrawer.title}
                </h2>
                <span className="text-[10px] text-[#64FFDA] font-medium tracking-wide">
                  {t.navDrawer.badge}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#1E3A8A]/40 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Patient Quick Card */}
          <div
            onClick={() => {
              onSelectTab('profile');
              onClose();
            }}
            className="m-3 p-3 rounded-xl bg-gradient-to-r from-[#112240] to-[#1E3A8A]/30 border border-[#233554] hover:border-[#64FFDA]/40 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#1E3A8A] border-2 border-[#64FFDA] flex items-center justify-center text-[#E6F1FF] font-bold text-sm shadow-md">
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'V'}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#E6F1FF] group-hover:text-[#64FFDA] transition-colors">
                    {userProfile.fullName || 'Victor Denis'}
                  </div>
                  <div className="text-[11px] text-[#8892B0]">
                    {userProfile.gender}, {userProfile.age} yrs • {userProfile.nationality}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      {userProfile.nhifNumber || 'NHIF Verified'}
                    </span>
                    {userProfile.chronicConditions.length > 0 && !userProfile.chronicConditions.includes('None') && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {userProfile.chronicConditions[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8892B0] group-hover:text-[#64FFDA] group-hover:translate-x-0.5 transition-all" />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-xs transition-all duration-200 text-left ${
                    isActive
                      ? 'bg-[#1E3A8A]/50 text-[#64FFDA] border border-[#64FFDA]/30 shadow-md translate-x-1'
                      : 'text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#112240] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#64FFDA]' : item.color}`} />
                    <span className="font-semibold text-[13px]">{item.label}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      isActive
                        ? 'bg-[#64FFDA]/20 text-[#64FFDA] border-[#64FFDA]/30 font-bold'
                        : 'bg-[#112240] text-zinc-400 border-[#233554]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Drawer Footer */}
        <div className="p-4 border-t border-[#1E3A8A]/40 bg-[#112240]/40 space-y-3">
          {/* Emergency Alert Box */}
          <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/30 text-xs">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>{currentLanguage === 'EN' ? 'National Emergency Dispatch' : 'Huduma ya Dharura ya Taifa'}</span>
            </div>
            <p className="text-[11px] text-red-200/80 mt-1">
              {currentLanguage === 'EN' ? 'Dial 112 (Police & Rescue) or 115 (Fire & Paramedic) for immediate critical care.' : 'Piga 112 au 115 kwa msaada wa haraka wa wagonjwa mahututi.'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href="tel:112"
                className="flex-1 text-center py-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-[11px] transition-colors"
              >
                Piga 112
              </a>
              <a
                href="tel:115"
                className="flex-1 text-center py-1 bg-red-700 hover:bg-red-600 text-white rounded font-bold text-[11px] transition-colors"
              >
                Piga 115
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#8892B0] pt-1">
            <span>Vanguard MedTech v2.5.0</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              M-Pesa API Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
