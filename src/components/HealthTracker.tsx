import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Droplets,
  Plus,
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Download,
  X,
  Share2,
} from 'lucide-react';
import { HealthMetricEntry, Language, SavedConsultation } from '../types';
import { translations } from '../data/mockData';

interface HealthTrackerProps {
  metrics: HealthMetricEntry[];
  onAddMetric: (entry: HealthMetricEntry) => void;
  savedConsultations: SavedConsultation[];
  currentLanguage: Language;
}

export const HealthTracker: React.FC<HealthTrackerProps> = ({
  metrics,
  onAddMetric,
  savedConsultations,
  currentLanguage,
}) => {
  const t = translations[currentLanguage];

  const latest = metrics[0] || {
    systolicBp: 120,
    diastolicBp: 80,
    bloodGlucoseMmol: 5.4,
    heartRateBpm: 72,
    hydrationMl: 2000,
  };

  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedTranscript, setSelectedTranscript] = useState<SavedConsultation | null>(null);

  // New Metric Form State
  const [newSystolic, setNewSystolic] = useState(120);
  const [newDiastolic, setNewDiastolic] = useState(80);
  const [newGlucose, setNewGlucose] = useState(5.4);
  const [newHeartRate, setNewHeartRate] = useState(72);
  const [newHydration, setNewHydration] = useState(latest.hydrationMl);

  const handleQuickHydration = () => {
    const updated = {
      ...latest,
      id: `met-${Date.now()}`,
      date: 'Just Now',
      hydrationMl: latest.hydrationMl + 250,
    };
    onAddMetric(updated);
  };

  const handleSaveMetric = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: HealthMetricEntry = {
      id: `met-${Date.now()}`,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systolicBp: newSystolic,
      diastolicBp: newDiastolic,
      bloodGlucoseMmol: newGlucose,
      heartRateBpm: newHeartRate,
      hydrationMl: newHydration,
    };
    onAddMetric(entry);
    setIsLogModalOpen(false);
  };

  const handleExportSummary = () => {
    const textContent = `================================================
VANGUARD MEDTECH - PATIENT CLINICAL PASSPORT
================================================
Date: ${new Date().toLocaleDateString()}
Latest Vitals:
- Blood Pressure: ${latest.systolicBp}/${latest.diastolicBp} mmHg
- Blood Glucose: ${latest.bloodGlucoseMmol} mmol/L
- Heart Rate: ${latest.heartRateBpm} bpm
- Daily Hydration: ${latest.hydrationMl} mL

Saved Consultations Count: ${savedConsultations.length}
${savedConsultations
  .map(
    (c, i) => `\n[Consultation #${i + 1}] - ${c.date}
Title: ${c.title}
Summary: ${c.outcomeSummary}`
  )
  .join('\n')}
================================================
Certified by Vanguard Tele-Triage Network Tanzania`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vanguard-Health-Record-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-7">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] border border-[#1E3A8A] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA] shadow-md">
            <Activity className="w-6 h-6 text-[#64FFDA]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF]">
              {t.healthTracker.title}
            </h2>
            <p className="text-xs sm:text-sm text-[#8892B0] mt-1">
              {t.healthTracker.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#0A192F] bg-[#64FFDA] hover:bg-[#38bdf8] transition-all flex items-center gap-1.5 shadow-md active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t.healthTracker.logNewReading}</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="p-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] hover:border-[#64FFDA] hover:text-[#64FFDA] transition-all"
            title="Download Clinical Summary"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Interactive Visual Vital Trackers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Blood Pressure */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8892B0]">
              <span className="font-semibold">{t.healthTracker.bloodPressure}</span>
              <Heart className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-heading font-extrabold text-[#E6F1FF] font-mono">
                {latest.systolicBp}/{latest.diastolicBp}
              </span>
              <span className="text-xs text-[#8892B0]">mmHg</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#1E3A8A]/30 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Normal Range
            </span>
            <span className="text-[#8892B0] text-[10px]">{latest.date}</span>
          </div>
        </div>

        {/* 2. Blood Glucose */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8892B0]">
              <span className="font-semibold">{t.healthTracker.bloodGlucose}</span>
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-heading font-extrabold text-[#E6F1FF] font-mono">
                {latest.bloodGlucoseMmol.toFixed(1)}
              </span>
              <span className="text-xs text-[#8892B0]">mmol/L</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#1E3A8A]/30 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Fasting Target
            </span>
            <span className="text-[#8892B0] text-[10px]">Optimal</span>
          </div>
        </div>

        {/* 3. Heart Rate */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8892B0]">
              <span className="font-semibold">{t.healthTracker.heartRate}</span>
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-heading font-extrabold text-[#E6F1FF] font-mono">
                {latest.heartRateBpm}
              </span>
              <span className="text-xs text-[#8892B0]">bpm</span>
            </div>
          </div>
          <div className="mt-4 pt-2 border-t border-[#1E3A8A]/30 flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">Resting Rhythm</span>
            <span className="text-[#8892B0] text-[10px]">60-100 Normal</span>
          </div>
        </div>

        {/* 4. Hydration with Quick +250ml Action */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-[#8892B0]">
              <span className="font-semibold">{t.healthTracker.hydration}</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-heading font-extrabold text-[#64FFDA] font-mono">
                {latest.hydrationMl}
              </span>
              <span className="text-xs text-[#8892B0]">/ 3000 mL</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-[#0A192F] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#64FFDA] h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (latest.hydrationMl / 3000) * 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E3A8A]/30 flex items-center justify-between">
            <button
              onClick={handleQuickHydration}
              className="text-[10px] px-2 py-0.5 rounded bg-[#1E3A8A]/60 text-[#64FFDA] border border-[#2563EB]/40 font-bold hover:bg-[#1E3A8A] transition-colors"
            >
              +250 mL Drink
            </button>
            <span className="text-[10px] text-[#8892B0]">Goal: 3.0 L</span>
          </div>
        </div>
      </div>

      {/* SAVED CONSULTATIONS LEDGER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#112240] border border-[#233554] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1E3A8A]/40 pb-3">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#64FFDA]" />
            <h3 className="font-heading font-bold text-base text-[#E6F1FF]">
              {t.healthTracker.savedConsultations}
            </h3>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#1E3A8A]/50 text-[#64FFDA] border border-[#2563EB]/40">
            {savedConsultations.length} Consultations Documented
          </span>
        </div>

        <div className="space-y-3">
          {savedConsultations.map((consultation) => (
            <div
              key={consultation.id}
              className="p-4 rounded-xl bg-[#0A192F] border border-[#233554] hover:border-[#1E3A8A] transition-all space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#E6F1FF]">{consultation.title}</h4>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        consultation.severity === 'urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : consultation.severity === 'moderate'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {consultation.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8892B0] mt-0.5">
                    <Calendar className="w-3 h-3 text-[#64FFDA]" />
                    <span>{consultation.date}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTranscript(consultation)}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#1E3A8A]/40 hover:bg-[#1E3A8A] text-[#64FFDA] border border-[#2563EB]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{t.healthTracker.viewTranscript}</span>
                </button>
              </div>

              <p className="text-xs text-[#8892B0] leading-relaxed line-clamp-2">
                <strong className="text-[#E6F1FF]">Outcome:</strong> {consultation.outcomeSummary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {consultation.symptomsTags.map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#112240] text-[#8892B0] border border-[#233554]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Log New Reading */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-[#0A192F] border-2 border-[#1E3A8A] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E3A8A]/40 pb-3">
              <h3 className="font-heading font-bold text-base text-[#E6F1FF]">Log New Clinical Vitals</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="p-1 text-[#8892B0] hover:text-[#E6F1FF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMetric} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newSystolic}
                    onChange={(e) => setNewSystolic(parseInt(e.target.value) || 120)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newDiastolic}
                    onChange={(e) => setNewDiastolic(parseInt(e.target.value) || 80)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Blood Glucose (mmol/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newGlucose}
                    onChange={(e) => setNewGlucose(parseFloat(e.target.value) || 5.0)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[#8892B0] mb-1 font-semibold">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={newHeartRate}
                    onChange={(e) => setNewHeartRate(parseInt(e.target.value) || 72)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8892B0] mb-1 font-semibold">Current Hydration (mL)</label>
                <input
                  type="number"
                  step="50"
                  value={newHydration}
                  onChange={(e) => setNewHydration(parseInt(e.target.value) || 2000)}
                  className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono text-sm"
                />
              </div>

              <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[#8892B0] hover:text-[#E6F1FF]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#64FFDA] text-[#0A192F] font-bold"
                >
                  Save Readings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: View Full Past Consultation Transcript */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#0A192F] border-2 border-[#1E3A8A] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between border-b border-[#1E3A8A]/40 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-[#64FFDA] uppercase font-bold tracking-wider">
                    Past Transcript Log • {selectedTranscript.date}
                  </span>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-[#E6F1FF] mt-0.5">
                    {selectedTranscript.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTranscript(null)}
                  className="p-1 text-[#8892B0] hover:text-[#E6F1FF] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Message Transcript Stream */}
              <div className="my-4 space-y-3 overflow-y-auto max-h-[55vh] pr-2">
                {selectedTranscript.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'ml-auto max-w-[85%] bg-[#1E3A8A]/60 border border-[#2563EB]/50 text-[#E6F1FF]'
                        : 'mr-auto max-w-[95%] bg-[#112240] border border-[#233554] text-[#E6F1FF]/90 space-y-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-[#8892B0] mb-1 font-semibold">
                      <span>{msg.sender === 'user' ? 'You (Patient)' : 'Vanguard Clinical AI'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#1E3A8A]/40 flex items-center justify-between text-xs">
              <span className="text-[#8892B0]">ID: {selectedTranscript.id}</span>
              <button
                onClick={() => setSelectedTranscript(null)}
                className="px-5 py-2 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] text-[#E6F1FF] font-bold border border-[#233554]"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
