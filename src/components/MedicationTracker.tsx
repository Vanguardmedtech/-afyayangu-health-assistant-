import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Bell,
  BellOff,
  BellRing,
  Volume2,
  Trash2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  X,
  ShieldCheck,
  Activity,
  Flame,
} from 'lucide-react';
import { Language, MedicationSchedule, UserProfile } from '../types';

interface MedicationTrackerProps {
  userProfile: UserProfile;
  currentLanguage: Language;
  onGoHome: () => void;
  onTriggerGlobalToast?: (title: string, message: string, type: 'medication') => void;
}

const INITIAL_MEDICATIONS: MedicationSchedule[] = [
  {
    id: 'med-1',
    medicationName: 'Artemether / Lumefantrine (Coartem)',
    dosage: '80 / 480 mg (4 tablets)',
    timeOfDay: '08:00 AM',
    frequency: 'Twice Daily',
    duration: '3 Days (Full Malaria Course)',
    instruction: 'Take after fatty food or milk to optimize gastrointestinal bioavailability.',
    isActive: true,
    startDate: 'Nov 06, 2026',
    lastTakenDate: 'Today, 08:04 AM',
  },
  {
    id: 'med-2',
    medicationName: 'Paracetamol (Panadol)',
    dosage: '500 mg (2 tablets)',
    timeOfDay: '02:00 PM',
    frequency: 'Every 8 Hours',
    duration: '5 Days',
    instruction: 'For fever & musculoskeletal aches. Do not exceed 4,000 mg within 24 hours.',
    isActive: true,
    startDate: 'Nov 07, 2026',
    lastTakenDate: 'Today, 02:15 PM',
  },
  {
    id: 'med-3',
    medicationName: 'Losartan Potassium',
    dosage: '50 mg (1 tablet)',
    timeOfDay: '08:00 PM',
    frequency: 'Once Daily',
    duration: 'Chronic / Ongoing',
    instruction: 'Cardiovascular BP control. Take consistently at bedtime with water.',
    isActive: true,
    startDate: 'Oct 15, 2026',
    lastTakenDate: 'Yesterday, 08:00 PM',
  },
];

export const MedicationTracker: React.FC<MedicationTrackerProps> = ({
  userProfile,
  currentLanguage,
  onGoHome,
  onTriggerGlobalToast,
}) => {
  // Medications state
  const [medications, setMedications] = useState<MedicationSchedule[]>(() => {
    const saved = localStorage.getItem('vanguard_medications_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_MEDICATIONS;
  });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAlarmMed, setActiveAlarmMed] = useState<MedicationSchedule | null>(null);
  const [alarmSnoozedTime, setAlarmSnoozedTime] = useState<string | null>(null);
  const [adherenceRate, setAdherenceRate] = useState<number>(94);
  const [takenCount, setTakenCount] = useState<number>(29);
  const [streakDays, setStreakDays] = useState<number>(18);

  // New medication form fields
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newFrequency, setNewFrequency] = useState<MedicationSchedule['frequency']>('Once Daily');
  const [newDuration, setNewDuration] = useState('7 Days');
  const [newInstruction, setNewInstruction] = useState('');

  // Persist medications
  useEffect(() => {
    localStorage.setItem('vanguard_medications_list', JSON.stringify(medications));
  }, [medications]);

  // Audio tone generation for realistic pill alarm
  const playAlarmTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {}
  };

  const handleTriggerAlarm = (med: MedicationSchedule) => {
    setActiveAlarmMed(med);
    playAlarmTone();
  };

  const handleTakeMedicine = () => {
    if (!activeAlarmMed) return;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMedications((prev) =>
      prev.map((m) =>
        m.id === activeAlarmMed.id ? { ...m, lastTakenDate: `Today, ${nowTime}` } : m
      )
    );
    setTakenCount((prev) => prev + 1);
    setStreakDays((prev) => prev + 1);
    setActiveAlarmMed(null);

    if (onTriggerGlobalToast) {
      onTriggerGlobalToast(
        currentLanguage === 'SW' ? 'Dawa Imemezwa Kikamilifu' : 'Dose Confirmed Taken',
        `${activeAlarmMed.medicationName} (${activeAlarmMed.dosage}) - ${currentLanguage === 'SW' ? 'Rekodi imesasishwa kwenye kalenda ya utii.' : 'Logged in adherence ledger.'}`,
        'medication'
      );
    }
  };

  const handleSnooze = () => {
    if (!activeAlarmMed) return;
    setAlarmSnoozedTime(activeAlarmMed.medicationName);
    setActiveAlarmMed(null);

    if (onTriggerGlobalToast) {
      onTriggerGlobalToast(
        currentLanguage === 'SW' ? 'Kengele Imeahirishwa (Dk 10)' : 'Alarm Snoozed for 10 Mins',
        `${activeAlarmMed.medicationName}: ${currentLanguage === 'SW' ? 'Kikumbusho kitalia tena baada ya dakika 10.' : 'Next alert will sound in 10 minutes.'}`,
        'medication'
      );
    }
  };

  const handleSkip = () => {
    if (!activeAlarmMed) return;
    setActiveAlarmMed(null);

    if (onTriggerGlobalToast) {
      onTriggerGlobalToast(
        currentLanguage === 'SW' ? 'Dozi Imerukwa' : 'Dose Marked Skipped',
        `${activeAlarmMed.medicationName} - ${currentLanguage === 'SW' ? 'Zingatia kunywa dozi inayofuata kwa wakati.' : 'Ensure following scheduled dose is taken on time.'}`,
        'medication'
      );
    }
  };

  const handleToggleActive = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m))
    );
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveNewMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMed: MedicationSchedule = {
      id: `med-${Date.now()}`,
      medicationName: newName.trim(),
      dosage: newDosage.trim() || 'Standard Dose',
      timeOfDay: newTime,
      frequency: newFrequency,
      duration: newDuration,
      instruction: newInstruction.trim() || 'Take as instructed by certified practitioner.',
      isActive: true,
      startDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastTakenDate: 'Scheduled',
    };

    setMedications((prev) => [newMed, ...prev]);
    setIsAddModalOpen(false);

    // Reset inputs
    setNewName('');
    setNewDosage('');
    setNewTime('08:00 AM');
    setNewFrequency('Once Daily');
    setNewDuration('7 Days');
    setNewInstruction('');

    if (onTriggerGlobalToast) {
      onTriggerGlobalToast(
        currentLanguage === 'SW' ? 'Ratiba Mpya ya Dawa Imehifadhiwa' : 'New Medication Scheduled',
        `${newMed.medicationName} (${newMed.timeOfDay}, ${newMed.frequency})`,
        'medication'
      );
    }
  };

  // Calendar Days generator (30 days of November)
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    const isToday = day === 8;
    const isPast = day < 8;
    const isTaken = isPast || (isToday && true);
    return {
      day,
      isToday,
      isPast,
      isTaken: isPast ? (day !== 4) : isToday, // Simulate 1 missed day on day 4
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] border border-[#1E3A8A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group"
            title="Return to AfyaYangu Chat"
          >
            <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
            <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
          </button>

          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA] shadow-md">
            <Pill className="w-6 h-6 text-[#64FFDA]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF]">
                {currentLanguage === 'SW' ? 'Kikumbusho cha Dawa na Kengele' : 'Medication Alarm & Pill Tracker'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                {medications.filter((m) => m.isActive).length} Active Alarms
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8892B0] mt-1">
              {currentLanguage === 'SW'
                ? 'Dhibiti ratiba ya kumeza dawa, kengele za sauti, na rekodi ya utii wa matibabu.'
                : 'Smart clinical dosage scheduling, interactive alarm triggers, and visual adherence analytics.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#64FFDA]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{currentLanguage === 'SW' ? 'Weka Ratiba ya Dawa' : 'Add Medication Alarm'}</span>
        </button>
      </div>

      {/* ADHERENCE CALENDAR & STREAK ANALYTICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Adherence Score Card */}
        <div className="p-5 rounded-2xl bg-[#112240] border border-[#233554] flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8892B0]">
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {currentLanguage === 'SW' ? 'Kiwango cha Utii wa Dawa' : 'Monthly Adherence Rate'}
              </span>
              <Sparkles className="w-4 h-4 text-[#64FFDA]" />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-heading font-black text-[#64FFDA] font-mono">
                {adherenceRate}%
              </span>
              <span className="text-xs text-emerald-400 font-bold">High Compliance</span>
            </div>

            <p className="text-xs text-[#8892B0] mt-2 leading-relaxed">
              {currentLanguage === 'SW'
                ? `Umemeza dozi ${takenCount} kati ya ${takenCount + 2} zilizopangwa mwezi huu. Mwendelezo bora unakukinga na usugu wa dawa.`
                : `You successfully took ${takenCount} of ${takenCount + 2} scheduled doses this month. Consistent dosing prevents drug resistance.`}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{streakDays} Days Streak</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1E3A8A]/60 text-[#64FFDA] border border-[#2563EB]/40">
              Target: &gt;90%
            </span>
          </div>
        </div>

        {/* Visual 30-Day Adherence Calendar */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#112240] border border-[#233554] shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-[#1E3A8A]/40 pb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#64FFDA]" />
              <h3 className="font-heading font-bold text-sm text-[#E6F1FF]">
                {currentLanguage === 'SW' ? 'Kalenda ya Utii wa Dawa (Novemba 2026)' : 'Visual Adherence Calendar (November 2026)'}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {currentLanguage === 'SW' ? 'Zilizonywewa' : 'Taken'}
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                {currentLanguage === 'SW' ? 'Zilizorukwa' : 'Missed'}
              </span>
              <span className="flex items-center gap-1 text-[#8892B0]">
                <span className="w-2 h-2 rounded-full bg-zinc-700" />
                {currentLanguage === 'SW' ? 'Zijazo' : 'Upcoming'}
              </span>
            </div>
          </div>

          {/* 30-Day Grid */}
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 pt-1">
            {calendarDays.map((cd) => (
              <div
                key={cd.day}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center border transition-all ${
                  cd.isToday
                    ? 'bg-[#1E3A8A] border-[#64FFDA] ring-2 ring-[#64FFDA]/30 shadow-md'
                    : cd.isPast
                    ? cd.isTaken
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                    : 'bg-[#0A192F]/60 border-[#233554] text-[#8892B0]'
                }`}
              >
                <span className="text-[10px] font-mono text-[#8892B0]">D{cd.day}</span>
                <span
                  className={`text-xs font-bold font-mono mt-0.5 ${
                    cd.isToday
                      ? 'text-[#64FFDA]'
                      : cd.isPast
                      ? cd.isTaken
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                      : 'text-zinc-500'
                  }`}
                >
                  {cd.isPast ? (cd.isTaken ? '✓' : '✗') : cd.isToday ? 'Today' : '•'}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#8892B0] flex items-center justify-between pt-1">
            <span>Streak: 18 consecutive compliant doses recorded.</span>
            <span className="text-emerald-400 font-semibold">Tanzania Drug Authority (TMDA) Compliant</span>
          </div>
        </div>
      </div>

      {/* SCHEDULED MEDICATIONS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-extrabold text-base text-[#E6F1FF] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#64FFDA]" />
            <span>{currentLanguage === 'SW' ? 'Dawa Zinazotumika Sasa' : 'Active Scheduled Medications'}</span>
          </h3>
          <span className="text-xs text-[#8892B0]">
            Click "Trigger Alarm" to test simulation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-4 sm:p-5 rounded-2xl bg-[#112240] border transition-all duration-200 flex flex-col justify-between shadow-md group ${
                med.isActive
                  ? 'border-[#233554] hover:border-[#64FFDA]/50'
                  : 'border-zinc-800 opacity-60'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0A192F] border border-[#233554] flex items-center justify-center text-[#64FFDA]">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-sm text-[#E6F1FF] group-hover:text-[#64FFDA] transition-colors line-clamp-1">
                        {med.medicationName}
                      </h4>
                      <span className="text-xs text-amber-300 font-mono font-medium">
                        {med.dosage}
                      </span>
                    </div>
                  </div>

                  {/* Active Toggle Switch */}
                  <button
                    onClick={() => handleToggleActive(med.id)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      med.isActive
                        ? 'bg-[#1E3A8A]/60 border-[#64FFDA]/40 text-[#64FFDA]'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }`}
                    title={med.isActive ? 'Alarm Active' : 'Alarm Disabled'}
                  >
                    {med.isActive ? <BellRing className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Timing Details Grid */}
                <div className="grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl bg-[#0A192F]/60 border border-[#1E3A8A]/30 text-xs">
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Scheduled Time</span>
                    <span className="font-mono font-bold text-[#64FFDA]">{med.timeOfDay}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Frequency</span>
                    <span className="font-semibold text-[#E6F1FF]">{med.frequency}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#1E3A8A]/30">
                    <span className="text-[10px] text-[#8892B0] block">Course Duration</span>
                    <span className="text-[11px] text-[#E6F1FF]">{med.duration}</span>
                  </div>
                </div>

                {/* Clinical Instructions */}
                {med.instruction && (
                  <p className="text-[11px] text-[#8892B0] mt-2.5 italic line-clamp-2">
                    "{med.instruction}"
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-[#1E3A8A]/30 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleTriggerAlarm(med)}
                  className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:brightness-110 text-[#E6F1FF] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#64FFDA] animate-bounce" />
                  <span>{currentLanguage === 'SW' ? 'Kengele Sasa' : 'Trigger Alarm'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteMedication(med.id)}
                  className="p-2 rounded-xl bg-[#0A192F] hover:bg-rose-950/40 border border-[#233554] hover:border-rose-500/40 text-[#8892B0] hover:text-rose-400 transition-colors"
                  title="Remove alarm"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: INTERACTIVE ALARM SIMULATION MODAL */}
      {activeAlarmMed && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0A192F] border-2 border-[#64FFDA] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-center text-[#E6F1FF]">
            {/* Pulsing Bell Animation */}
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] border-2 border-[#64FFDA] flex items-center justify-center shadow-xl shadow-[#64FFDA]/30">
              <span className="absolute inset-0 rounded-full bg-[#64FFDA] animate-ping opacity-30" />
              <BellRing className="w-10 h-10 text-[#64FFDA] animate-bounce" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#64FFDA] font-bold px-2.5 py-0.5 rounded-full bg-[#112240] border border-[#2563EB]/40">
                Pill Reminder Alert • {activeAlarmMed.timeOfDay}
              </span>
              <h3 className="font-heading font-black text-xl sm:text-2xl text-[#E6F1FF] mt-2">
                {activeAlarmMed.medicationName}
              </h3>
              <p className="text-sm font-semibold text-amber-300 font-mono mt-0.5">
                {activeAlarmMed.dosage}
              </p>
            </div>

            {/* Instruction Card */}
            <div className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] text-xs text-[#8892B0] leading-relaxed text-left">
              <span className="font-bold text-[#E6F1FF] block mb-1">
                {currentLanguage === 'SW' ? 'Mwongozo wa Kumeza:' : 'Clinical Instructions:'}
              </span>
              {activeAlarmMed.instruction || 'Drink with 250ml of clean drinking water.'}
            </div>

            {/* 3 Action Buttons: Take Medicine, Snooze 10m, Skip */}
            <div className="space-y-2 pt-2">
              {/* Take Medicine */}
              <button
                type="button"
                onClick={handleTakeMedicine}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#64FFDA]/30 hover:brightness-110 active:scale-98 transition-all"
              >
                <CheckCircle2 className="w-5 h-5 text-[#0A192F]" />
                <span>{currentLanguage === 'SW' ? 'Nimekunywa Dawa (Take Medicine)' : 'Take Medicine (Confirm Dose)'}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {/* Snooze 10m */}
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="py-2.5 px-3 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] hover:border-[#64FFDA]/40 text-[#E6F1FF] text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-[#64FFDA]" />
                  <span>{currentLanguage === 'SW' ? 'Ahirisha Dk 10 (Snooze)' : 'Snooze 10m'}</span>
                </button>

                {/* Skip */}
                <button
                  type="button"
                  onClick={handleSkip}
                  className="py-2.5 px-3 rounded-xl bg-zinc-900/60 hover:bg-rose-950/40 border border-zinc-700 hover:border-rose-500/40 text-zinc-400 hover:text-rose-300 text-xs font-semibold transition-all active:scale-95"
                >
                  {currentLanguage === 'SW' ? 'Ruka Dozi Hii (Skip)' : 'Skip Dose'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW MEDICATION ALARM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0A192F] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-[#E6F1FF]">
            <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
                  <span>{currentLanguage === 'SW' ? 'Rudi' : 'Back'}</span>
                </button>
                <h3 className="font-heading font-extrabold text-base text-[#E6F1FF]">
                  {currentLanguage === 'SW' ? 'Ongeza Ratiba ya Dawa' : 'Add Medication Alert'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#8892B0] hover:text-[#E6F1FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewMedication} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#8892B0] mb-1 font-semibold">
                  Medication Name / Jina la Dawa *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Artemether/Lumefantrine, Metformin, Amoxicillin"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] text-sm focus:border-[#64FFDA] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Dosage / Kipimo</label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="e.g., 500mg (1 tablet)"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Time of Day / Muda *</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="e.g., 08:00 AM, 08:00 PM"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Frequency / Marudio</label>
                  <select
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
                  >
                    <option value="Once Daily">Once Daily (Mara 1 kwa siku)</option>
                    <option value="Twice Daily">Twice Daily (Mara 2 kwa siku)</option>
                    <option value="Three Times Daily">Three Times Daily (Mara 3)</option>
                    <option value="Every 8 Hours">Every 8 Hours (Kila baada ya saa 8)</option>
                    <option value="As Needed">As Needed (Inapobidi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Duration / Muda wa Matumizi</label>
                  <select
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
                  >
                    <option value="3 Days">3 Days (Kozi ya Malaria)</option>
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days (Wiki 1)</option>
                    <option value="14 Days">14 Days (Wiki 2)</option>
                    <option value="30 Days">30 Days (Mwezi 1)</option>
                    <option value="Chronic / Ongoing">Chronic / Ongoing (Matumizi endelevu)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8892B0] mb-1 font-semibold">
                  Instruction / Maelekezo Maalumu
                </label>
                <input
                  type="text"
                  value={newInstruction}
                  onChange={(e) => setNewInstruction(e.target.value)}
                  placeholder="e.g., Take after food with full glass of water"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8892B0] hover:text-[#E6F1FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#64FFDA] text-[#0A192F] font-extrabold hover:brightness-110 transition-all"
                >
                  Save Alarm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
