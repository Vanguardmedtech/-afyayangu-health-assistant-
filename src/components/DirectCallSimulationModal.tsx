import React, { useState, useEffect } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Video,
  ShieldCheck,
  Activity,
  Heart,
  ArrowLeft,
} from 'lucide-react';
import { Doctor, Language, UserProfile } from '../types';

interface DirectCallSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor;
  userProfile: UserProfile;
  currentLanguage: Language;
}

export const DirectCallSimulationModal: React.FC<DirectCallSimulationModalProps> = ({
  isOpen,
  onClose,
  doctor,
  userProfile,
  currentLanguage,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

  useEffect(() => {
    let connectTimeout: any;
    let interval: any;

    if (isOpen) {
      setCallDuration(0);
      setStatus('connecting');

      connectTimeout = setTimeout(() => {
        setStatus('connected');
      }, 1500);

      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      clearTimeout(connectTimeout);
      clearInterval(interval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setStatus('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#112240] via-[#0A192F] to-[#060D17] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-6 flex flex-col items-center justify-between min-h-[520px]">
        {/* Top Call Status Bar */}
        <div className="w-full flex items-center justify-between text-xs text-[#8892B0] border-b border-[#1E3A8A]/40 pb-3 gap-2">
          {/* Prominent Go Back Arrow Button */}
          <button
            onClick={handleEndCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group"
            title="End Call & Return to Main Screen"
          >
            <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
            <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-mono text-[10px] sm:text-[11px] font-bold hidden sm:inline">256-bit Encrypted</span>
          </div>
          <div className="text-[11px] font-mono text-[#64FFDA]">
            {status === 'connecting' ? 'Connecting...' : formatTimer(callDuration)}
          </div>
        </div>

        {/* Doctor Information & Profile Avatar */}
        <div className="flex flex-col items-center text-center my-auto space-y-4">
          <div className="relative">
            <img
              src={doctor.avatarUrl}
              alt={doctor.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-[#64FFDA] shadow-2xl shadow-[#64FFDA]/20"
            />
            {status === 'connected' && (
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0A192F] flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl font-heading font-extrabold text-[#E6F1FF]">{doctor.name}</h3>
            <p className="text-xs font-semibold text-[#64FFDA] mt-0.5">{doctor.title}</p>
            <p className="text-[11px] text-[#8892B0] mt-0.5">{doctor.hospitalAffiliation}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#1E3A8A]/40 border border-[#2563EB]/40 text-[11px] text-[#E6F1FF] font-mono">
              📞 {doctor.privatePhone}
            </div>
          </div>

          {/* Interactive Speech Simulation / Audio Wave */}
          {status === 'connected' && (
            <div className="w-full max-w-xs p-3 rounded-2xl bg-[#112240]/80 border border-[#233554] space-y-2">
              <div className="flex items-center justify-center gap-1 h-6">
                {[40, 75, 30, 90, 60, 45, 80, 95, 35, 70, 50, 85].map((h, i) => (
                  <span
                    key={i}
                    className="w-1 bg-[#64FFDA] rounded-full transition-all duration-150 animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#E6F1FF]/90 italic leading-relaxed text-center">
                {currentLanguage === 'EN'
                  ? `"Habari ${userProfile.fullName || 'Victor'}. I am Dr. Mwana Kalili. I have received your initial vitals and intake profile from Vanguard. How are you feeling right now?"`
                  : `"Habari ${userProfile.fullName || 'Victor'}, hapa ni Dr. Mwana Kalili. Nimepokea rekodi zako za awali kutoka Vanguard. Unaendeleaje sasa hivi?"`}
              </p>
            </div>
          )}

          {status === 'connecting' && (
            <div className="flex items-center gap-2 text-xs text-[#8892B0]">
              <span className="w-2 h-2 rounded-full bg-[#64FFDA] animate-ping" />
              <span>Ringing private clinical bridge...</span>
            </div>
          )}
        </div>

        {/* Call Controls: Mute, Speaker, Video, End */}
        <div className="w-full pt-4 border-t border-[#1E3A8A]/40 flex items-center justify-center gap-5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-3.5 rounded-full border transition-all ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-[#112240] border-[#233554] text-[#E6F1FF] hover:border-[#64FFDA]'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-3.5 rounded-full border transition-all ${
              isSpeakerOn
                ? 'bg-[#1E3A8A]/50 border-[#64FFDA] text-[#64FFDA]'
                : 'bg-[#112240] border-[#233554] text-[#8892B0]'
            }`}
            title="Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-600/30 transition-all active:scale-90"
            title="End Telemedicine Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
