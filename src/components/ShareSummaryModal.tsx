import React, { useState } from 'react';
import {
  Share2,
  X,
  ArrowLeft,
  Copy,
  Check,
  Download,
  MessageCircle,
  FileText,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import { Language, UserProfile, ChatMessage, SavedConsultation } from '../types';

export interface ConsultationSummaryPayload {
  consultationId?: string;
  date: string;
  patientName: string;
  patientAge?: number;
  patientGender?: string;
  bloodGroup?: string;
  hemoglobinGenotype?: string;
  nhifCard?: string;
  activeMedications?: string;
  knownAllergies?: string;
  chiefComplaint: string;
  aiGuidance: string;
  severity?: 'mild' | 'moderate' | 'urgent' | 'routine';
  actionSteps?: string[];
}

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: ConsultationSummaryPayload | null;
  currentLanguage: Language;
}

export const ShareSummaryModal: React.FC<ShareSummaryModalProps> = ({
  isOpen,
  onClose,
  summaryData,
  currentLanguage,
}) => {
  if (!isOpen || !summaryData) return null;

  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState(false);

  // Formatted plaintext representation for copying and downloading
  const buildPlainTextSummary = () => {
    return `=====================================================
VANGUARD MEDTECH • CLINICAL TRIAGE CONSULTATION SUMMARY
Ripoti ya Ushauri wa Afya • Vanguard Consumer Companion
=====================================================
Tarehe / Date: ${summaryData.date}
Kitambulisho cha Muhtasari / Reference ID: ${summaryData.consultationId || `VMD-${Date.now().toString().slice(-6)}`}

1. TAARIFA ZA MGONJWA / PATIENT PROFILE
-----------------------------------------------------
Jina / Name: ${summaryData.patientName}
Umri na Jinsia / Age & Gender: ${summaryData.patientAge || '32'} yrs, ${summaryData.patientGender || 'Male'}
Kundi la Damu / Blood Group: ${summaryData.bloodGroup || 'O+'}
Vinasaba vya Selimundu / Genotype: ${summaryData.hemoglobinGenotype || 'AA (Normal)'}
Bima ya Afya / NHIF Card: ${summaryData.nhifCard || '20048192-A'}
Dawa Zinazotumika / Active Medications: ${summaryData.activeMedications || 'None documented'}
Mzio wa Dawa / Known Allergies: ${summaryData.knownAllergies || 'None documented'}

2. DALILI ZILIZORIPOTIWA / REPORTED CHIEF COMPLAINT
-----------------------------------------------------
"${summaryData.chiefComplaint}"

3. USHAURI WA AWALI WA AI / VANGUARD CLINICAL GUIDANCE
-----------------------------------------------------
Kiwango cha Uharaka / Urgency Level: ${(summaryData.severity || 'Moderate').toUpperCase()}
Muhtasari wa Kitabibu / Triage Assessment:
${summaryData.aiGuidance}

Hatua Zilizopendekezwa / Clinical Action Protocol:
${
  summaryData.actionSteps && summaryData.actionSteps.length > 0
    ? summaryData.actionSteps.map((st, i) => `${i + 1}. ${st}`).join('\n')
    : '1. Fuata ushauri wa kitaalamu\n2. Fika kituo cha afya ikibidi\n3. Wasiliana na daktari kwa simu'
}

=====================================================
Tahadhari ya Kisheria / Medical Disclaimer:
Ushauri huu unalenga kusaidia upimaji wa awali (preliminary triage).
Katika dharura yoyote ya kiafya, piga 112 au 115 mara moja.
Kituo Kikuu cha Marejeleo: Dar es Salaam, Tanzania.
=====================================================`;
  };

  const handleCopy = async () => {
    try {
      const text = buildPlainTextSummary();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy to clipboard', err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = `*Vanguard MedTech Clinical Consultation Summary*\n*Patient:* ${summaryData.patientName}\n*Date:* ${summaryData.date}\n*Symptoms:* "${summaryData.chiefComplaint}"\n*Urgency:* ${(summaryData.severity || 'Moderate').toUpperCase()}\n*Summary:* ${summaryData.aiGuidance.slice(0, 300)}...\n\n_Shared via Vanguard MedTech Consumer Companion (Dar es Salaam)_`;
    const encoded = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Open in new tab safely
    window.open(url, '_blank', 'noopener,noreferrer');
    setWhatsAppSuccess(true);
    setTimeout(() => setWhatsAppSuccess(false), 3000);
  };

  const handleDownload = () => {
    const text = buildPlainTextSummary();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanDate = new Date().toISOString().slice(0, 10);
    link.download = `Vanguard-Consultation-Summary-${cleanDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0A192F] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-5 text-[#E6F1FF] max-h-[92vh] flex flex-col justify-between">
        {/* Top Header with Universal Back Button */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-3.5">
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
                  <Share2 className="w-4 h-4 text-[#64FFDA]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#E6F1FF]">
                    {currentLanguage === 'SW' ? 'Shiriki Muhtasari wa Ushauri' : 'Share Consultation Summary'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8892B0]">
                    Clinical Discharge & Referral Export
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

          {/* Printable Report Preview Card */}
          <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#112240]/90 border border-[#233554] space-y-4 overflow-y-auto max-h-[50vh] pr-2 shadow-inner">
            {/* Header section with clinic branding */}
            <div className="flex items-start justify-between border-b border-[#1E3A8A]/40 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#64FFDA] font-bold">
                  Vanguard Clinical Intelligence Report
                </span>
                <h4 className="font-heading font-bold text-sm text-[#E6F1FF] mt-0.5">
                  Tele-Triage Clinical Summary
                </h4>
                <div className="flex items-center gap-2 text-[11px] text-[#8892B0] mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-[#64FFDA]" />
                  <span>{summaryData.date}</span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  summaryData.severity === 'urgent'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : summaryData.severity === 'moderate'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {summaryData.severity || 'Standard'} Triage
              </span>
            </div>

            {/* Patient Clinical Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#0A192F]/80 border border-[#1E3A8A]/40 text-xs">
              <div>
                <span className="text-[10px] text-[#8892B0] block">Patient Name</span>
                <span className="font-bold text-[#E6F1FF]">{summaryData.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8892B0] block">Age / Gender</span>
                <span className="font-bold text-[#E6F1FF]">
                  {summaryData.patientAge || '32'} yrs • {summaryData.patientGender || 'Male'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8892B0] block">Blood & Genotype</span>
                <span className="font-bold text-[#64FFDA]">
                  {summaryData.bloodGroup || 'O+'} • {summaryData.hemoglobinGenotype || 'AA'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8892B0] block">NHIF Card #</span>
                <span className="font-mono text-[11px] text-[#E6F1FF]">
                  {summaryData.nhifCard || '20048192-A'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-[#8892B0] block">Active Medications & Allergies</span>
                <span className="text-[11px] text-amber-300 line-clamp-1">
                  Meds: {summaryData.activeMedications || 'None'} | Allergies: {summaryData.knownAllergies || 'None'}
                </span>
              </div>
            </div>

            {/* Reported Symptoms */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#64FFDA] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {currentLanguage === 'SW' ? 'Dalili Zilizoripotiwa (Chief Complaint):' : 'Reported Symptoms / Query:'}
              </span>
              <p className="text-xs text-[#E6F1FF] bg-[#0A192F]/60 p-2.5 rounded-xl border border-[#233554] italic">
                "{summaryData.chiefComplaint}"
              </p>
            </div>

            {/* AI Guidance and Action Protocol */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#E6F1FF] flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#64FFDA]" />
                {currentLanguage === 'SW' ? 'Ushauri na Hatua za Kitabibu:' : 'Vanguard AI Clinical Assessment:'}
              </span>
              <div className="text-xs text-[#E6F1FF]/90 leading-relaxed bg-[#0A192F]/60 p-3 rounded-xl border border-[#233554] whitespace-pre-line">
                {summaryData.aiGuidance}
              </div>
            </div>

            {summaryData.actionSteps && summaryData.actionSteps.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-[#8892B0]">Action Protocol:</span>
                <ul className="text-xs text-[#8892B0] space-y-1 pl-1">
                  {summaryData.actionSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#64FFDA] font-bold">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Row: Copy, WhatsApp, Download PDF/TXT */}
        <div className="space-y-3 pt-3 border-t border-[#1E3A8A]/40">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Copy Text Summary */}
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] hover:border-[#64FFDA] text-xs font-bold text-[#E6F1FF] hover:text-[#64FFDA] flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">
                    {currentLanguage === 'SW' ? 'Imenakiliwa!' : 'Copied to Clipboard!'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-[#64FFDA]" />
                  <span>{currentLanguage === 'SW' ? 'Nakili Muhtasari' : 'Copy Text Summary'}</span>
                </>
              )}
            </button>

            {/* 2. Simulate WhatsApp Share */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>
                {whatsAppSuccess
                  ? currentLanguage === 'SW'
                    ? 'Inafungua WhatsApp...'
                    : 'Opening WhatsApp...'
                  : currentLanguage === 'SW'
                  ? 'Shiriki WhatsApp'
                  : 'Simulate WhatsApp Share'}
              </span>
            </button>

            {/* 3. Download Clinical PDF / TXT Summary */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-[#64FFDA]/20 hover:brightness-110"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloadSuccess
                  ? currentLanguage === 'SW'
                    ? 'Imepakuliwa!'
                    : 'Downloaded!'
                  : currentLanguage === 'SW'
                  ? 'Pakua Muhtasari wa PDF'
                  : 'Download Clinical Summary'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8892B0] px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#64FFDA]" />
              Safe for family sharing or doctor referral handoff
            </span>
            <button
              onClick={onClose}
              className="hover:text-[#E6F1FF] underline transition-colors"
            >
              {currentLanguage === 'SW' ? 'Funga Dirisha' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
