import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ShieldAlert,
  Fingerprint,
  Delete,
  CheckCircle2,
  X,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface SecurityLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentLanguage: Language;
  userProfile: UserProfile;
}

export const SecurityLockModal: React.FC<SecurityLockModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLanguage,
  userProfile,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isScanningFingerprint, setIsScanningFingerprint] = useState<boolean>(false);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setIsShaking(false);
      setErrorMessage(null);
      setIsSuccess(false);
      setIsScanningFingerprint(false);
    }
  }, [isOpen]);

  // Handle keyboard typing for digits, Backspace, Enter
  useEffect(() => {
    if (!isOpen || isSuccess || isScanningFingerprint) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isSuccess, isScanningFingerprint]);

  if (!isOpen) return null;

  const triggerShakeError = (msgEn: string, msgSw: string) => {
    setIsShaking(true);
    setErrorMessage(
      currentLanguage === 'SW'
        ? `Imekataliwa: ${msgSw}`
        : `Access Denied: ${msgEn}`
    );
    setTimeout(() => {
      setIsShaking(false);
      setPin('');
    }, 550);
  };

  const handleDigitPress = (digit: string) => {
    if (isSuccess || isScanningFingerprint) return;
    if (pin.length >= 4) return;

    setErrorMessage(null);
    const nextPin = pin + digit;
    setPin(nextPin);

    // If 4 digits entered, automatically evaluate
    if (nextPin.length === 4) {
      if (nextPin === '1234') {
        handleUnlockSuccess();
      } else {
        triggerShakeError('Incorrect PIN', 'PIN Siyo Sahihi');
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin((prev) => prev.slice(0, -1));
      setErrorMessage(null);
    }
  };

  const handleClear = () => {
    setPin('');
    setErrorMessage(null);
  };

  const handleUnlockSuccess = () => {
    setIsSuccess(true);
    setErrorMessage(null);
    setTimeout(() => {
      onSuccess();
    }, 400);
  };

  const handleFingerprintScan = () => {
    setIsScanningFingerprint(true);
    setErrorMessage(null);

    // Simulate authentic biometric scan
    setTimeout(() => {
      setIsScanningFingerprint(false);
      handleUnlockSuccess();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-[#0A192F] border-2 ${
          errorMessage
            ? 'border-rose-500 shadow-rose-500/30'
            : isSuccess
            ? 'border-emerald-400 shadow-emerald-400/30'
            : 'border-[#1E3A8A] shadow-2xl'
        } rounded-3xl p-6 sm:p-7 space-y-6 transition-all duration-200 ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Top Header with Go Back, Lock Icon and Close */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Prominent Go Back Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group shrink-0"
              title="Return to Main Screen"
            >
              <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
              <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
            </button>

            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all shrink-0 hidden xs:flex sm:flex ${
                isSuccess
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400'
                  : errorMessage
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                  : 'bg-[#112240] border-[#64FFDA]/40 text-[#64FFDA]'
              }`}
            >
              {isSuccess ? (
                <Unlock className="w-5 h-5 animate-bounce" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1E3A8A]/50 border border-[#2563EB]/40 text-[9px] sm:text-[10px] font-mono font-bold text-[#64FFDA] uppercase">
                <ShieldCheck className="w-3 h-3 text-[#64FFDA]" />
                <span>256-Bit Encrypted</span>
              </div>
              <h3 className="text-sm sm:text-base font-heading font-extrabold text-[#E6F1FF] mt-0.5 leading-tight">
                Authentication Required
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#8892B0] hover:text-[#E6F1FF] hover:bg-[#112240] rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subtitle / Patient Context */}
        <div className="text-center space-y-1">
          <p className="text-xs text-[#8892B0] leading-relaxed">
            {currentLanguage === 'SW'
              ? `Tafadhali thibitisha utambulisho wako ili kupata na kubadilisha taarifa binafsi za afya za ${
                  userProfile.fullName || 'Victor Denis'
                }.`
              : `Please verify your identity to access and edit encrypted medical passport and chronic records for ${
                  userProfile.fullName || 'Victor Denis'
                }.`}
          </p>
          <div className="inline-block mt-1">
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#112240] text-[#64FFDA] border border-[#233554] font-semibold">
              Default Demo PIN: <strong>1234</strong>
            </span>
          </div>
        </div>

        {/* 4-Digit Masked Display Circles */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[0, 1, 2, 3].map((index) => {
            const hasEntered = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  isSuccess
                    ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-400/50 scale-110'
                    : errorMessage
                    ? 'bg-rose-500 border-rose-500 shadow-md shadow-rose-500/50 scale-105'
                    : hasEntered
                    ? 'bg-[#64FFDA] border-[#64FFDA] shadow-md shadow-[#64FFDA]/50 scale-110'
                    : 'bg-[#112240] border-[#233554]'
                }`}
              />
            );
          })}
        </div>

        {/* Feedback / Error Message Box */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-center justify-center gap-2 text-center animate-fade-in font-semibold">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSuccess && (
          <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center justify-center gap-2 text-center animate-fade-in font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {currentLanguage === 'SW'
                ? 'Imethibitishwa: Wasifu Umefunguliwa!'
                : 'Access Granted: Medical Profile Unlocked!'}
            </span>
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitPress(digit)}
              className="h-12 rounded-2xl bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-[#64FFDA]/50 text-base font-bold font-mono text-[#E6F1FF] active:scale-95 transition-all flex items-center justify-center shadow-sm"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl bg-[#112240]/60 hover:bg-[#112240] border border-[#233554] text-xs font-bold text-[#8892B0] hover:text-[#E6F1FF] active:scale-95 transition-all flex items-center justify-center"
          >
            Clear
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigitPress('0')}
            className="h-12 rounded-2xl bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-[#64FFDA]/50 text-base font-bold font-mono text-[#E6F1FF] active:scale-95 transition-all flex items-center justify-center shadow-sm"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-[#112240]/60 hover:bg-[#112240] border border-[#233554] text-xs font-bold text-[#8892B0] hover:text-[#E6F1FF] active:scale-95 transition-all flex items-center justify-center"
            title="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Fingerprint Button */}
        <div className="pt-2 border-t border-[#1E3A8A]/40 space-y-2">
          <button
            type="button"
            disabled={isScanningFingerprint || isSuccess}
            onClick={handleFingerprintScan}
            className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold border flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 ${
              isScanningFingerprint
                ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 animate-pulse'
                : 'bg-gradient-to-r from-[#112240] to-[#1E3A8A]/50 hover:bg-[#1E3A8A] border-[#64FFDA]/40 text-[#64FFDA] hover:border-[#64FFDA]'
            }`}
          >
            <Fingerprint className={`w-5 h-5 ${isScanningFingerprint ? 'animate-bounce text-emerald-400' : 'text-[#64FFDA]'}`} />
            <span>
              {isScanningFingerprint
                ? currentLanguage === 'SW'
                  ? 'Inasoma Alama ya Kidole...'
                  : 'Scanning Fingerprint Sensor...'
                : currentLanguage === 'SW'
                ? 'Tumia Alama ya Kidole / Use Fingerprint'
                : 'Use Fingerprint / Tumia Alama ya Kidole'}
            </span>
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-[#8892B0] hover:text-[#E6F1FF] underline"
            >
              {currentLanguage === 'SW' ? 'Ghairi (Rudi Nyuma)' : 'Cancel & Return'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
