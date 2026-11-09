import React, { useEffect } from 'react';
import { Bell, CheckCircle2, Clock, X, Pill, Droplets, Calendar } from 'lucide-react';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type?: 'medication' | 'vitals' | 'appointment' | 'general';
  timestamp?: string;
}

interface NotificationToastProps {
  notification: ToastNotification | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Subtle Web Audio API chime for realistic push notification feel
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }

    // Auto-dismiss after 6 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'medication':
        return <Pill className="w-5 h-5 text-amber-400" />;
      case 'vitals':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-[#64FFDA]" />;
      default:
        return <Bell className="w-5 h-5 text-[#64FFDA]" />;
    }
  };

  return (
    <div className="fixed top-18 right-4 sm:right-6 z-50 max-w-sm w-full animate-bounce-in transition-all">
      <div className="relative rounded-2xl bg-[#0A192F]/95 backdrop-blur-xl border-2 border-[#64FFDA] shadow-2xl shadow-[#64FFDA]/20 p-4 flex items-start gap-3 text-[#E6F1FF] group">
        {/* Glow corner accent */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#64FFDA] rounded-full animate-ping" />
        
        <div className="p-2.5 rounded-xl bg-[#112240] border border-[#233554] shrink-0 mt-0.5">
          {getIcon()}
        </div>

        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#64FFDA] font-bold">
              Arifa ya Afya • Push Alert
            </span>
            <span className="text-[10px] text-[#8892B0]">• {notification.timestamp || 'Sasa hivi'}</span>
          </div>
          <h4 className="font-heading font-extrabold text-sm text-[#E6F1FF] mt-0.5">
            {notification.title}
          </h4>
          <p className="text-xs text-[#8892B0] mt-1 leading-relaxed">
            {notification.message}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-[#8892B0] hover:text-[#E6F1FF] p-1 rounded-lg hover:bg-[#112240] transition-colors"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
