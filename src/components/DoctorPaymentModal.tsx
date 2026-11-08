import React, { useState, useEffect } from 'react';
import {
  X,
  PhoneCall,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Lock,
  ArrowRight,
  PhoneForwarded,
  Sparkles,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';
import { Doctor, ConsultationTier, Language, UserProfile } from '../types';
import { verifiedDoctors, consultationTiers, translations } from '../data/mockData';

interface DoctorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: Language;
  userProfile: UserProfile;
  onStartCall: (doctor: Doctor) => void;
}

export const DoctorPaymentModal: React.FC<DoctorPaymentModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  userProfile,
  onStartCall,
}) => {
  const t = translations[currentLanguage];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(verifiedDoctors[0]);
  const [selectedTier, setSelectedTier] = useState<ConsultationTier>(consultationTiers[0]);
  const [mobileProvider, setMobileProvider] = useState<'mpesa' | 'tigo' | 'airtel' | 'halo'>('mpesa');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedControl, setCopiedControl] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(1800); // 30 minutes = 1800s

  const controlNumber = '9912-0048-3190';
  const tillNumber = '552190';

  useEffect(() => {
    let timer: any;
    if (step === 3 && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdownSeconds]);

  if (!isOpen) return null;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedControl(true);
    setTimeout(() => setCopiedControl(false), 2000);
  };

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
    }, 1200);
  };

  const handleResetFlow = () => {
    setStep(1);
    setPin('');
    setCountdownSeconds(1800);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-[#0A192F] border-2 border-[#1E3A8A] rounded-2xl shadow-2xl overflow-hidden my-4">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E3A8A]/50 bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA] shadow-md">
              <PhoneCall className="w-5 h-5 text-[#64FFDA] animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-extrabold text-[#E6F1FF]">
                {t.doctorFlow.title}
              </h2>
              <p className="text-xs text-[#8892B0]">
                {t.doctorFlow.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleResetFlow}
            className="p-1.5 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#1E3A8A]/40 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 bg-[#112240] border-b border-[#1E3A8A]/30 text-xs text-center font-semibold">
          <div
            className={`py-2 px-2 border-r border-[#1E3A8A]/30 flex items-center justify-center gap-1.5 ${
              step >= 1 ? 'text-[#64FFDA] bg-[#1E3A8A]/30' : 'text-[#8892B0]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
              1
            </span>
            <span className="truncate">{currentLanguage === 'EN' ? 'Tier & Doctor' : 'Daktari & Kifurushi'}</span>
          </div>

          <div
            className={`py-2 px-2 border-r border-[#1E3A8A]/30 flex items-center justify-center gap-1.5 ${
              step >= 2 ? 'text-[#64FFDA] bg-[#1E3A8A]/30' : 'text-[#8892B0]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span className="truncate">{currentLanguage === 'EN' ? 'Mobile Checkout' : 'Lipa kwa Simu'}</span>
          </div>

          <div
            className={`py-2 px-2 flex items-center justify-center gap-1.5 ${
              step === 3 ? 'text-emerald-400 bg-emerald-950/30' : 'text-[#8892B0]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">
              3
            </span>
            <span className="truncate">{currentLanguage === 'EN' ? 'Direct Line Unlocked' : 'Namba Imefunguliwa'}</span>
          </div>
        </div>

        {/* STEP 1: PRACTITIONER & TIER SELECTION */}
        {step === 1 && (
          <div className="p-4 sm:p-6 space-y-5 bg-[#0A192F]">
            {/* Consultation Tier Selection */}
            <div>
              <label className="block text-xs font-bold text-[#64FFDA] uppercase tracking-wider mb-2.5">
                {t.doctorFlow.selectTier}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {consultationTiers.map((tier) => {
                  const isSelected = selectedTier.id === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 relative ${
                        isSelected
                          ? `${tier.badgeColor} shadow-lg scale-[1.02] bg-[#112240]`
                          : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:border-[#1E3A8A]'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-4 h-4 text-[#64FFDA]" />
                        </div>
                      )}
                      <div className="font-heading font-bold text-sm text-[#E6F1FF]">
                        {currentLanguage === 'EN' ? tier.titleEn : tier.titleSw}
                      </div>
                      <div className="text-lg font-extrabold text-[#64FFDA] mt-1 font-mono">
                        TZS {tier.priceTzs.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-[#8892B0] mt-1">
                        ⏱ {tier.duration}
                      </div>
                      <p className="text-[11px] text-[#8892B0] mt-2 line-clamp-2">
                        {currentLanguage === 'EN' ? tier.descriptionEn : tier.descriptionSw}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Practitioner Selection */}
            <div>
              <label className="block text-xs font-bold text-[#64FFDA] uppercase tracking-wider mb-2.5">
                {t.doctorFlow.selectPractitioner}
              </label>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {verifiedDoctors.map((doc) => {
                  const isSelected = selectedDoctor.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#1E3A8A]/40 border-[#64FFDA] text-[#E6F1FF] shadow-sm'
                          : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-[#E6F1FF] hover:border-[#1E3A8A]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[#1E3A8A]"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#E6F1FF]">{doc.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              {t.doctorFlow.doctorAvailable}
                            </span>
                          </div>
                          <p className="text-xs text-[#64FFDA] font-medium">{doc.specialty}</p>
                          <p className="text-[11px] text-[#8892B0]">{doc.hospitalAffiliation}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-amber-300">★ {doc.rating}</div>
                        <div className="text-[10px] text-[#8892B0]">{doc.experienceYears}+ yrs exp</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proceed to Step 2 */}
            <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-between">
              <div className="text-xs text-[#8892B0]">
                {currentLanguage === 'EN' ? 'Total Payable:' : 'Jumla ya Malipo:'}{' '}
                <span className="text-base font-bold text-[#64FFDA] font-mono">
                  TZS {selectedTier.priceTzs.toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] bg-[#64FFDA] hover:bg-[#38bdf8] transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <span>{currentLanguage === 'EN' ? 'Proceed to Payment' : 'Endelea Kulipa'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MOBILE MONEY CHECKOUT (M-PESA / TIGO / AIRTEL / HALO) */}
        {step === 2 && (
          <div className="p-4 sm:p-6 space-y-5 bg-[#0A192F]">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#112240] to-[#1E3A8A]/30 border border-[#233554] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-[#8892B0]">
                  {currentLanguage === 'EN' ? 'Consultation with:' : 'Daktari aliyeteuliwa:'}
                </span>
                <h3 className="text-sm font-bold text-[#E6F1FF]">{selectedDoctor.name}</h3>
                <p className="text-xs text-[#64FFDA]">{selectedTier.titleEn} (TZS {selectedTier.priceTzs.toLocaleString()})</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-[#8892B0] block">{t.doctorFlow.controlNumber}</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-base font-extrabold text-[#64FFDA]">{controlNumber}</span>
                  <button
                    onClick={() => copyToClipboard(controlNumber)}
                    className="p-1 text-[#8892B0] hover:text-[#64FFDA] rounded transition-colors"
                    title="Copy Control Number"
                  >
                    {copiedControl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#64FFDA] uppercase tracking-wider mb-2">
                {currentLanguage === 'EN' ? 'Select Mobile Money Channel' : 'Chagua Mtandao wa Malipo'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mpesa', name: 'M-Pesa (Vodacom)', color: 'border-red-500/40 text-red-400 bg-red-500/10' },
                  { id: 'tigo', name: 'Tigo Pesa (Yas)', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
                  { id: 'airtel', name: 'Airtel Money', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
                  { id: 'halo', name: 'Halopesa', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                ].map((prov) => (
                  <button
                    key={prov.id}
                    type="button"
                    onClick={() => setMobileProvider(prov.id as any)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      mobileProvider === prov.id
                        ? `${prov.color} border-2 shadow-sm font-bold scale-[1.02]`
                        : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-[#E6F1FF]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 opacity-80" />
                    <span>{prov.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated USSD / PIN Push Simulation */}
            <div className="p-4 rounded-xl bg-[#112240] border border-[#233554] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E6F1FF]">
                <Lock className="w-4 h-4 text-[#64FFDA]" />
                <span>{t.doctorFlow.enterPin}</span>
              </div>
              <p className="text-xs text-[#8892B0]">
                {currentLanguage === 'EN'
                  ? `A secure payment prompt of TZS ${selectedTier.priceTzs.toLocaleString()} has been sent to ${userProfile.phoneNumber}. Confirm by entering your 4-digit PIN.`
                  : `Ombi la malipo ya TZS ${selectedTier.priceTzs.toLocaleString()} limetumwa kwa namba ${userProfile.phoneNumber}. Thibitisha kwa kuweka PIN yako ya tarakimu 4.`}
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="••••"
                  className="w-32 px-4 py-2.5 text-center tracking-widest text-lg font-mono rounded-xl bg-[#0A192F] border border-[#233554] text-[#64FFDA] focus:border-[#64FFDA] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setPin('1234')}
                  className="text-[11px] text-[#64FFDA] underline hover:text-white"
                >
                  {currentLanguage === 'EN' ? 'Auto-fill Test PIN (1234)' : 'Jaza PIN ya Majaribio (1234)'}
                </button>
              </div>
            </div>

            {/* Back / Confirm Action */}
            <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#8892B0] hover:text-[#E6F1FF] transition-colors"
              >
                {currentLanguage === 'EN' ? 'Back' : 'Rudi'}
              </button>

              <button
                disabled={isProcessing}
                onClick={handleConfirmPayment}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-[#0A192F] bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] hover:shadow-lg hover:shadow-[#64FFDA]/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0A192F] border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.doctorFlow.confirmPayBtn}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRIVATE LINE UNLOCK WITH COUNTDOWN & LIVE CALL ACTION */}
        {step === 3 && (
          <div className="p-4 sm:p-6 space-y-5 bg-[#0A192F] animate-fade-in">
            {/* Success Celebration Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#112240] border-2 border-emerald-500/50 flex items-center gap-3.5 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 shadow-md">
                <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  Payment Verified • Control # {controlNumber}
                </span>
                <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#E6F1FF] mt-1">
                  {t.doctorFlow.privateLineUnlocked}
                </h3>
              </div>
            </div>

            {/* Unlocked Doctor Card */}
            <div className="p-5 rounded-2xl bg-[#112240] border border-[#2563EB]/40 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedDoctor.avatarUrl}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#64FFDA] shadow-md"
                />
                <div>
                  <h4 className="text-base font-bold text-[#E6F1FF]">{selectedDoctor.name}</h4>
                  <p className="text-xs text-[#64FFDA] font-semibold">{selectedDoctor.specialty} • {selectedDoctor.title}</p>
                  <p className="text-[11px] text-[#8892B0] mt-0.5">{selectedDoctor.hospitalAffiliation}</p>
                </div>
              </div>

              {/* Private Phone Number Display */}
              <div className="p-4 rounded-xl bg-[#0A192F] border-2 border-[#64FFDA]/50 text-center space-y-2">
                <span className="text-[11px] font-semibold text-[#8892B0] uppercase tracking-wider block">
                  Private Direct Doctor Consultation Line:
                </span>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-[#64FFDA] tracking-wider select-all">
                  {selectedDoctor.privatePhone}
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5 animate-pulse" />
                  <span>
                    {t.doctorFlow.activeDuration}: <strong className="font-mono">{formatCountdown(countdownSeconds)}</strong>
                  </span>
                </div>
              </div>

              {/* Patient Preparation Instructions */}
              <div className="text-xs text-[#8892B0] space-y-1 bg-[#0A192F]/60 p-3 rounded-lg border border-[#233554]">
                <p className="font-semibold text-[#E6F1FF]">
                  {currentLanguage === 'EN' ? 'Clinical Preparation Checklist:' : 'Mambo ya Kuzingatia Kabla ya Kupiga:'}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Have your temperature or blood pressure readings ready.</li>
                  <li>Have your current medication packaging nearby.</li>
                  <li>Doctor Mwana Kalili has received your baseline intake profile.</li>
                </ul>
              </div>
            </div>

            {/* Primary Action: Click to Call Now */}
            <div className="space-y-2">
              <button
                onClick={() => onStartCall(selectedDoctor)}
                className="w-full py-3.5 px-6 rounded-xl font-heading font-extrabold text-sm sm:text-base text-[#0A192F] bg-gradient-to-r from-emerald-400 via-[#64FFDA] to-teal-300 hover:shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center justify-center gap-2.5 active:scale-98"
              >
                <PhoneForwarded className="w-5 h-5 text-[#0A192F] animate-bounce" />
                <span>{t.doctorFlow.callNowBtn} ({selectedDoctor.privatePhone})</span>
              </button>

              <div className="text-center">
                <a
                  href={`tel:${selectedDoctor.privatePhone}`}
                  className="text-xs text-[#8892B0] hover:text-[#64FFDA] underline"
                >
                  {currentLanguage === 'EN' ? 'Or open directly in phone dialer app' : 'Au fungua kwenye mfumo wa simu yako'}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
