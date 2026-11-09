import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowLeft,
  Hospital,
  FileText,
  Phone,
  MessageSquare,
  Sparkles,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import { HealthFacility, Language, UserProfile, DiagnosticBookingTicket } from '../types';

interface DiagnosticBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: HealthFacility | null;
  userProfile: UserProfile;
  currentLanguage: Language;
  onBookingConfirmed?: (ticket: DiagnosticBookingTicket) => void;
}

interface ServiceOption {
  id: string;
  category: 'xray' | 'pathology' | 'consultation' | 'maternity';
  nameEn: string;
  nameSw: string;
  priceTzs: number;
  duration: string;
  nhifCovered: boolean;
}

const AVAILABLE_SERVICES: ServiceOption[] = [
  {
    id: 'srv-1',
    category: 'xray',
    nameEn: 'Digital Chest X-Ray & Radiologist Review',
    nameSw: 'Picha ya X-Ray ya Kifua na Ripoti ya Daktari wa Mionzi',
    priceTzs: 45000,
    duration: '25 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-2',
    category: 'xray',
    nameEn: 'Comprehensive Abdominal & Pelvic Ultrasound',
    nameSw: 'Kipimo cha Ultrasound ya Tumbo na Nyonga',
    priceTzs: 65000,
    duration: '35 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-3',
    category: 'pathology',
    nameEn: 'Full Blood Picture (FBC) & Malaria Blood Smear',
    nameSw: 'Kipimo Kikubwa cha Damu (FBC) na Kipimo cha Malaria',
    priceTzs: 35000,
    duration: '20 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-4',
    category: 'pathology',
    nameEn: 'Hemoglobin Genotype & Sickling Electrophoresis',
    nameSw: 'Kipimo cha Vinasaba vya Selimundu (Sickle Cell Test)',
    priceTzs: 55000,
    duration: '40 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-5',
    category: 'pathology',
    nameEn: 'HbA1c Diabetes & Fasting Blood Glucose Panel',
    nameSw: 'Kipimo cha Sukari ya Wastani wa Miezi Mitatu (HbA1c)',
    priceTzs: 40000,
    duration: '15 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-6',
    category: 'consultation',
    nameEn: 'Specialist In-Person Doctor Review',
    nameSw: 'Ushauri wa Moja kwa Moja na Daktari Bingwa',
    priceTzs: 70000,
    duration: '45 mins',
    nhifCovered: true,
  },
  {
    id: 'srv-7',
    category: 'maternity',
    nameEn: 'Antenatal RCH Scan & Maternal Wellness Check',
    nameSw: 'Ultrasound ya Ujauzito na Kliniki ya Mama na Mtoto',
    priceTzs: 50000,
    duration: '30 mins',
    nhifCovered: true,
  },
];

const TIME_SLOTS = [
  '08:30 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

export const DiagnosticBookingModal: React.FC<DiagnosticBookingModalProps> = ({
  isOpen,
  onClose,
  facility,
  userProfile,
  currentLanguage,
  onBookingConfirmed,
}) => {
  if (!isOpen || !facility) return null;

  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv-1');
  const [selectedDate, setSelectedDate] = useState<string>('Tomorrow, Nov 09');
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  const [insuranceChoice, setInsuranceChoice] = useState<'NHIF' | 'Private / Cash'>('NHIF');
  const [customPhone, setCustomPhone] = useState(userProfile.phoneNumber || '+255 754 000 000');
  const [confirmedTicket, setConfirmedTicket] = useState<DiagnosticBookingTicket | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedService =
    AVAILABLE_SERVICES.find((s) => s.id === selectedServiceId) || AVAILABLE_SERVICES[0];

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = `TZ-${facility.name.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const ticket: DiagnosticBookingTicket = {
      ticketId: cleanId,
      facilityId: facility.id,
      facilityName: facility.name,
      serviceCategory: selectedService.category,
      serviceName: currentLanguage === 'SW' ? selectedService.nameSw : selectedService.nameEn,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      patientName: userProfile.fullName || 'Victor Denis',
      patientPhone: customPhone,
      insuranceType: insuranceChoice,
      nhifNumber: userProfile.nhifNumber || '20048192-A',
      priceTzs: insuranceChoice === 'NHIF' && facility.isNhifAccepted ? 0 : selectedService.priceTzs,
      status: 'Confirmed',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConfirmedTicket(ticket);
    if (onBookingConfirmed) {
      onBookingConfirmed(ticket);
    }
  };

  const handleCopyCode = () => {
    if (!confirmedTicket) return;
    navigator.clipboard.writeText(confirmedTicket.ticketId);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0A192F] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-5 text-[#E6F1FF] max-h-[92vh] flex flex-col justify-between">
        {/* Header with Universal Back Button */}
        <div>
          <div className="flex items-center justify-between border-b border-[#1E3A8A]/50 pb-3.5">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group shrink-0"
                title="Return to Facility View"
              >
                <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
                <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E3A8A]/60 border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA]">
                  <Hospital className="w-4 h-4 text-[#64FFDA]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#E6F1FF]">
                    {currentLanguage === 'SW' ? 'Miadi ya Vipimo & Huduma' : 'Book Diagnostic Test & Service'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#64FFDA] block">
                    {facility.name} • {facility.area}
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

          {/* VIEW A: BOOKING FORM */}
          {!confirmedTicket ? (
            <form onSubmit={handleConfirmBooking} className="mt-4 space-y-4 text-xs overflow-y-auto max-h-[60vh] pr-1">
              {/* Facility Partner Banner */}
              <div className="p-3.5 rounded-2xl bg-[#112240] border border-[#233554] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#8892B0] font-bold">
                    Partner Hospital
                  </span>
                  <div className="font-bold text-sm text-[#E6F1FF] mt-0.5">{facility.name}</div>
                  <div className="text-[11px] text-[#8892B0]">{facility.address}</div>
                </div>

                {facility.isNhifAccepted && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    NHIF / Bima Inakubaliwa
                  </span>
                )}
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-[#8892B0] mb-1.5 font-bold">
                  {currentLanguage === 'SW' ? 'Chagua Kipimo au Huduma ya Afya *' : 'Select Diagnostic Test or Medical Service *'}
                </label>
                <div className="space-y-2">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const isSelected = selectedServiceId === srv.id;
                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1E3A8A]/50 border-[#64FFDA] shadow-md ring-1 ring-[#64FFDA]/30'
                            : 'bg-[#112240] border-[#233554] hover:border-[#1E3A8A]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="diagnosticService"
                            checked={isSelected}
                            onChange={() => setSelectedServiceId(srv.id)}
                            className="text-[#64FFDA] focus:ring-0"
                          />
                          <div>
                            <span className="font-bold text-xs text-[#E6F1FF] block">
                              {currentLanguage === 'SW' ? srv.nameSw : srv.nameEn}
                            </span>
                            <span className="text-[10px] text-[#8892B0]">
                              Est. Duration: {srv.duration}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-[#64FFDA] text-xs">
                            TZS {srv.priceTzs.toLocaleString()}
                          </span>
                          <span className="block text-[9px] text-emerald-400 font-semibold">
                            NHIF Covered
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8892B0] mb-1 font-bold">
                    {currentLanguage === 'SW' ? 'Tarehe ya Miadi' : 'Preferred Date'}
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none"
                  >
                    <option value="Today, Nov 08 (Afternoon)">Today, Nov 08 (Afternoon)</option>
                    <option value="Tomorrow, Nov 09">Tomorrow, Nov 09</option>
                    <option value="Tuesday, Nov 10">Tuesday, Nov 10</option>
                    <option value="Wednesday, Nov 11">Wednesday, Nov 11</option>
                    <option value="Thursday, Nov 12">Thursday, Nov 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#8892B0] mb-1 font-bold">
                    {currentLanguage === 'SW' ? 'Saa ya Kufika' : 'Preferred Time Slot'}
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] focus:border-[#64FFDA] focus:outline-none font-mono"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Insurance Choice */}
              <div>
                <label className="block text-[#8892B0] mb-1 font-bold">
                  {currentLanguage === 'SW' ? 'Njia ya Malipo / Bima ya Afya' : 'Payment / Insurance Method'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInsuranceChoice('NHIF')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      insuranceChoice === 'NHIF'
                        ? 'bg-[#1E3A8A] border-[#64FFDA] text-[#64FFDA]'
                        : 'bg-[#112240] border-[#233554] text-[#8892B0]'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>NHIF Bima (Card: {userProfile.nhifNumber || '20048192-A'})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInsuranceChoice('Private / Cash')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      insuranceChoice === 'Private / Cash'
                        ? 'bg-[#1E3A8A] border-[#64FFDA] text-[#64FFDA]'
                        : 'bg-[#112240] border-[#233554] text-[#8892B0]'
                    }`}
                  >
                    <span>M-Pesa / Cash Out-of-Pocket</span>
                  </button>
                </div>
              </div>

              {/* Patient Phone Number for SMS confirmation */}
              <div>
                <label className="block text-[#8892B0] mb-1 font-bold">
                  {currentLanguage === 'SW' ? 'Nambari ya Simu ya Kupokea Tiketi (SMS)' : 'Phone for Instant SMS Confirmation'}
                </label>
                <input
                  type="tel"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] font-mono focus:border-[#64FFDA] focus:outline-none"
                />
              </div>

              {/* Total & Submit Button */}
              <div className="pt-2 border-t border-[#1E3A8A]/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8892B0] block">Estimated Out-of-Pocket:</span>
                  <span className="font-mono text-base font-extrabold text-[#64FFDA]">
                    {insuranceChoice === 'NHIF' && facility.isNhifAccepted
                      ? 'TZS 0 (100% NHIF Co-pay)'
                      : `TZS ${selectedService.priceTzs.toLocaleString()}`}
                  </span>
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] font-black text-xs shadow-lg shadow-[#64FFDA]/20 hover:brightness-110 active:scale-95 transition-all"
                >
                  {currentLanguage === 'SW' ? 'Thibitisha Miadi na Pata SMS' : 'Confirm & Generate SMS Ticket'}
                </button>
              </div>
            </form>
          ) : (
            /* VIEW B: INSTANT SMS CONFIRMATION TICKET GENERATOR */
            <div className="mt-4 space-y-4 text-xs animate-fade-in">
              {/* Ticket Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-b from-[#112240] to-[#0A192F] border-2 border-[#64FFDA] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#64FFDA] via-[#38bdf8] to-[#2563EB]" />

                <div className="flex items-start justify-between border-b border-[#1E3A8A]/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#64FFDA] font-bold uppercase tracking-wider block">
                      Vanguard Health Partner Network
                    </span>
                    <h4 className="font-heading font-extrabold text-base text-[#E6F1FF]">
                      Verified Diagnostic Appointment Ticket
                    </h4>
                    <span className="text-[11px] text-[#8892B0]">{confirmedTicket.facilityName}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRMED</span>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="grid grid-cols-2 gap-3 my-3.5 p-3 rounded-2xl bg-[#0A192F]/80 border border-[#1E3A8A]/30">
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Booking Ref Code</span>
                    <span className="font-mono font-black text-[#64FFDA] text-sm tracking-wider">
                      {confirmedTicket.ticketId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Patient Name</span>
                    <span className="font-bold text-[#E6F1FF]">{confirmedTicket.patientName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Appointment Time</span>
                    <span className="font-bold text-[#E6F1FF]">
                      {confirmedTicket.appointmentDate} • {confirmedTicket.appointmentTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#8892B0] block">Insurance Status</span>
                    <span className="font-semibold text-emerald-400">
                      {confirmedTicket.insuranceType} (Verified)
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-[#1E3A8A]/30">
                    <span className="text-[10px] text-[#8892B0] block">Prescribed Service</span>
                    <span className="font-bold text-amber-300">{confirmedTicket.serviceName}</span>
                  </div>
                </div>

                {/* Simulated SMS Push Ticket Preview */}
                <div className="p-3 rounded-xl bg-[#0A192F] border border-[#233554] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-[#64FFDA] font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Simulated SMS Delivered to {confirmedTicket.patientPhone}:</span>
                  </div>
                  <p className="text-[11px] font-mono text-[#8892B0] leading-relaxed bg-[#112240]/60 p-2 rounded-lg border border-[#233554]">
                    "Habari {confirmedTicket.patientName.split(' ')[0]}, miadi yako ya {confirmedTicket.serviceName} katika {confirmedTicket.facilityName} imethibitishwa kwa {confirmedTicket.appointmentDate} saa {confirmedTicket.appointmentTime}. Tiketi yako: {confirmedTicket.ticketId}. Fika dakika 15 kabla na kitambulisho chako."
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#233554] hover:border-[#64FFDA] text-xs font-bold text-[#E6F1FF] flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-[#64FFDA]" />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Ticket Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#64FFDA] text-[#0A192F] text-xs font-black hover:brightness-110 active:scale-95 transition-all text-center"
                >
                  Done / Maliza
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
