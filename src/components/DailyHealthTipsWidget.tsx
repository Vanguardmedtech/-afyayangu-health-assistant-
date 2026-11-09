import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Heart,
  Droplets,
  Activity,
  ShieldCheck,
  Apple,
  Baby,
  ChevronRight,
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface HealthTip {
  id: string;
  category: 'malaria' | 'hydration' | 'sickleCell' | 'nutrition' | 'hypertension' | 'pediatric';
  categoryLabelEn: string;
  categoryLabelSw: string;
  badgeEn: string;
  badgeSw: string;
  icon: any;
  iconColor: string;
  tipEn: string;
  tipSw: string;
  actionHintEn: string;
  actionHintSw: string;
}

const HEALTH_TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    category: 'malaria',
    categoryLabelEn: 'Malaria Prevention',
    categoryLabelSw: 'Kinga Dhidi ya Malaria',
    badgeEn: 'Epidemiological Alert',
    badgeSw: 'Tahadhari ya Mazingira',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    tipEn: 'Sleep under certified insecticide-treated mosquito nets (ITN) and eliminate stagnant drainage water around compound gutters in Dar es Salaam to disrupt Anopheles breeding.',
    tipSw: 'Lala ndani ya chandarua chenye dawa (LLIN) na ziba madimbwi ya maji yaliyotuama karibu na makazi Dar es Salaam kuzuia mbu wa malaria (Anopheles) kutaga mayai.',
    actionHintEn: 'Ask AI: "I have fever and chills"',
    actionHintSw: 'Uliza AI: "Nina homa na kutetemeka"',
  },
  {
    id: 'tip-2',
    category: 'hydration',
    categoryLabelEn: 'Hydration & Vitals',
    categoryLabelSw: 'Unywaji wa Maji na Figo',
    badgeEn: 'Daily Fluid Target',
    badgeSw: 'Kiwango cha Kila Siku',
    icon: Droplets,
    iconColor: 'text-blue-400',
    tipEn: 'With coastal heat and high humidity, drink at least 2.5 to 3 liters of clean, safe water daily. Proper hydration supports renal perfusion and stabilizes body temperature.',
    tipSw: 'Kutokana na joto na unyevunyevu wa pwani, kunywa angalau lita 2.5 hadi 3 za maji safi kila siku. Maji ya kutosha yanalinda figo na kuzuia uchovu wa joto.',
    actionHintEn: 'Log hydration in Vitals Tracker',
    actionHintSw: 'Weka unywaji wako kwenye Daftari la Afya',
  },
  {
    id: 'tip-3',
    category: 'sickleCell',
    categoryLabelEn: 'Sickle Cell & Blood Care',
    categoryLabelSw: 'Utunzaji wa Selimundu',
    badgeEn: 'Genotype Protocol',
    badgeSw: 'Mwongozo wa Vinasaba',
    icon: Activity,
    iconColor: 'text-cyan-400',
    tipEn: 'Individuals with sickle cell trait (AS) or disease (SS) must avoid sudden cold exposure and rigorous dehydration. Prompt treatment of fever prevents acute vaso-occlusive pain episodes.',
    tipSw: 'Watu wenye vinasaba vya Selimundu (AS au SS) wanashauriwa kuepuka baridi kali na ukosefu wa maji. Kutibu homa mapema kunazuia maumivu makali ya viungo (crisis).',
    actionHintEn: 'Review Hemoglobin Genotype in Profile',
    actionHintSw: 'Pitia aina ya vinasaba kwenye Wasifu wako',
  },
  {
    id: 'tip-4',
    category: 'nutrition',
    categoryLabelEn: 'Nutritional Immunity',
    categoryLabelSw: 'Lishe na Kinga ya Mwili',
    badgeEn: 'Local Superfoods',
    badgeSw: 'Vyakula vya Asili',
    icon: Apple,
    iconColor: 'text-amber-400',
    tipEn: 'Incorporate indigenous dark green leafy vegetables (mchicha, kisamvu, matembele) rich in iron and bioavailable vitamin C to accelerate natural hemoglobin production.',
    tipSw: 'Pendelea kula mboga za majani za asili (mchicha, kisamvu, matembele) zenye madini chuma, pamoja na matunda ya machungwa kuongeza damu na kinga ya mwili.',
    actionHintEn: 'Ask AI: "Healthy diet for immunity"',
    actionHintSw: 'Uliza AI: "Chakula bora cha kuongeza damu"',
  },
  {
    id: 'tip-5',
    category: 'hypertension',
    categoryLabelEn: 'Cardiovascular Care',
    categoryLabelSw: 'Shinikizo la Damu & Moyo',
    badgeEn: 'Cardiac Wellness',
    badgeSw: 'Afya ya Moyo',
    icon: Heart,
    iconColor: 'text-rose-400',
    tipEn: 'Limit added dietary salt and processed bouillon cubes. Routine blood pressure screening every two weeks detects asymptomatic cardiovascular pressure shifts early.',
    tipSw: 'Punguza matumizi ya chumvi mbichi mezani na vyakula vyenye sodiamu nyingi. Kupima BP mara kwa mara kunasaidia kugundua mapema mabadiliko ya shinikizo la damu.',
    actionHintEn: 'Check BP targets in Health Tracker',
    actionHintSw: 'Angalia viwango vya BP kwenye Tracker',
  },
  {
    id: 'tip-6',
    category: 'pediatric',
    categoryLabelEn: 'Child & Maternal Health',
    categoryLabelSw: 'Afya ya Mtoto na Chanjo',
    badgeEn: 'MoH / EPI Schedule',
    badgeSw: 'Ratiba ya Chanjo Wizara ya Afya',
    icon: Baby,
    iconColor: 'text-teal-400',
    tipEn: 'Keep the RCH-1 clinic card up to date. The 9-month Measles-Rubella (MR1) and 18-month MR2 milestones are critical shields against preventable infant outbreaks.',
    tipSw: 'Hakikisha kadi ya kliniki ya RCH-1 inajazwa kwa wakati. Chanjo ya miezi 9 ya Surua na Rubella (MR1) inamlinda mwanao dhidi ya maambukizi hatari ya utotoni.',
    actionHintEn: 'Ask AI: "Child immunization schedule"',
    actionHintSw: 'Uliza AI: "Ratiba ya chanjo ya mtoto"',
  },
];

interface DailyHealthTipsWidgetProps {
  currentLanguage: Language;
  userProfile?: UserProfile;
  onSelectPrompt?: (prompt: string) => void;
}

export const DailyHealthTipsWidget: React.FC<DailyHealthTipsWidgetProps> = ({
  currentLanguage,
  userProfile,
  onSelectPrompt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  // If user has specific chronic condition, prioritize relevant tip initially
  useEffect(() => {
    if (userProfile?.chronicConditions?.includes('Sickle Cell') || userProfile?.hemoglobinGenotype?.includes('SS')) {
      setCurrentIndex(2); // Sickle Cell
    } else if (userProfile?.chronicConditions?.includes('Hypertension')) {
      setCurrentIndex(4); // Hypertension
    }
  }, [userProfile]);

  const handleNextTip = () => {
    setIsRotating(true);
    setCurrentIndex((prev) => (prev + 1) % HEALTH_TIPS.length);
    setTimeout(() => setIsRotating(false), 300);
  };

  const currentTip = HEALTH_TIPS[currentIndex];
  const IconComponent = currentTip.icon;

  const isProfileRelevant =
    (currentTip.category === 'sickleCell' && (userProfile?.chronicConditions?.includes('Sickle Cell') || userProfile?.hemoglobinGenotype?.includes('SS'))) ||
    (currentTip.category === 'hypertension' && userProfile?.chronicConditions?.includes('Hypertension')) ||
    (currentTip.category === 'pediatric' && userProfile?.specialHealthStatus?.includes('Currently Pregnant'));

  return (
    <div className="w-full max-w-2xl mx-auto my-3 transition-all duration-300">
      <div className="relative rounded-2xl bg-gradient-to-r from-[#112240] via-[#112240] to-[#1E3A8A]/30 border border-[#1E3A8A] hover:border-[#64FFDA]/50 p-4 sm:p-4.5 shadow-xl shadow-black/40 group overflow-hidden">
        {/* Subtle decorative glow accents */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#64FFDA] to-transparent opacity-60" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          {/* Header & Badges */}
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl bg-[#0A192F] border border-[#233554] flex items-center justify-center ${currentTip.iconColor} shadow-inner`}>
              <IconComponent className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-heading font-extrabold text-[#E6F1FF] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#64FFDA]" />
                  {currentLanguage === 'SW' ? 'Dondoo ya Afya ya Leo' : 'Daily Health Tip'}
                </span>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E3A8A]/60 text-[#64FFDA] border border-[#2563EB]/40 font-bold">
                  {currentLanguage === 'SW' ? currentTip.categoryLabelSw : currentTip.categoryLabelEn}
                </span>

                {isProfileRelevant && (
                  <span className="hidden sm:inline-block text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentLanguage === 'SW' ? 'Inahusu Wasifu Wako' : 'Relevant to Profile'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Refresh Tip Button */}
          <button
            type="button"
            onClick={handleNextTip}
            aria-label="Refresh Health Tip"
            className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#233554] hover:border-[#64FFDA]/50 text-[#8892B0] hover:text-[#64FFDA] text-xs font-semibold transition-all duration-200 active:scale-95 group/btn shadow-sm"
            title={currentLanguage === 'SW' ? 'Soma dondoo nyingine' : 'Cycle to next tip'}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#64FFDA] transition-transform duration-300 ${
                isRotating ? 'rotate-180' : 'group-hover/btn:rotate-45'
              }`}
            />
            <span>{currentLanguage === 'SW' ? 'Badilisha Dondoo' : 'Refresh Tip'}</span>
          </button>
        </div>

        {/* Tip Body Text */}
        <p className="text-xs sm:text-[13px] text-[#E6F1FF]/90 leading-relaxed font-normal pl-0.5">
          {currentLanguage === 'SW' ? currentTip.tipSw : currentTip.tipEn}
        </p>

        {/* Action Suggestion Footer */}
        <div className="mt-3 pt-2.5 border-t border-[#1E3A8A]/30 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="text-[#8892B0] font-mono">
            Tip {currentIndex + 1} of {HEALTH_TIPS.length} • {currentLanguage === 'SW' ? currentTip.badgeSw : currentTip.badgeEn}
          </span>

          {onSelectPrompt && (
            <button
              type="button"
              onClick={() =>
                onSelectPrompt(
                  currentLanguage === 'SW'
                    ? `Nieleze zaidi kuhusu: ${currentTip.categoryLabelSw}`
                    : `Provide clinical advice on: ${currentTip.categoryLabelEn}`
                )
              }
              className="text-[#64FFDA] hover:text-white font-semibold flex items-center gap-1 hover:underline transition-colors group/link"
            >
              <span>{currentLanguage === 'SW' ? currentTip.actionHintSw : currentTip.actionHintEn}</span>
              <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
