import React, { useState, useMemo } from 'react';
import {
  Hospital,
  Search,
  Filter,
  Navigation,
  Phone,
  ShieldCheck,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  ExternalLink,
  X,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { HealthFacility, Language, UserProfile } from '../types';
import { darHealthFacilities, translations, initialUserProfile } from '../data/mockData';
import { DiagnosticBookingModal } from './DiagnosticBookingModal';

interface FacilityFinderProps {
  currentLanguage: Language;
  userProfile?: UserProfile;
  onGoHome?: () => void;
}

export const FacilityFinder: React.FC<FacilityFinderProps> = ({
  currentLanguage,
  userProfile = initialUserProfile,
  onGoHome,
}) => {
  const t = translations[currentLanguage];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'xray' | 'lab' | 'emergency'>('all');
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [bookingFacility, setBookingFacility] = useState<HealthFacility | null>(null);

  const filteredFacilities = useMemo(() => {
    return darHealthFacilities.filter((facility) => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        facility.name.toLowerCase().includes(q) ||
        facility.area.toLowerCase().includes(q) ||
        facility.address.toLowerCase().includes(q);

      // Service filter match
      let matchesFilter = true;
      if (selectedFilter === 'xray') matchesFilter = facility.services.xrayUltrasound;
      if (selectedFilter === 'lab') matchesFilter = facility.services.pathologyLab;
      if (selectedFilter === 'emergency') matchesFilter = facility.services.emergency24_7;

      return matchesSearch && matchesFilter;
    });
  }, [searchQuery, selectedFilter]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] border border-[#1E3A8A] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group"
              title="Return to AfyaYangu Chat"
            >
              <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
              <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
            </button>
          )}

          <div className="w-12 h-12 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA] shadow-md">
            <Hospital className="w-6 h-6 text-[#64FFDA]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF]">
                {t.facilityFinder.title}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#64FFDA]/10 text-[#64FFDA] border border-[#64FFDA]/30 font-bold">
                Dar es Salaam
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8892B0] mt-1">
              {t.facilityFinder.subtitle}
            </p>
          </div>
        </div>

        {/* Live Status Summary */}
        <div className="flex items-center gap-3 text-xs bg-[#0A192F]/80 px-3.5 py-2 rounded-xl border border-[#233554]">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{darHealthFacilities.filter((f) => f.isOpenNow).length} Open Now</span>
          </div>
          <span className="text-[#233554]">|</span>
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NHIF Accepted</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Matrix */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-[#8892B0]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              currentLanguage === 'EN'
                ? 'Search hospital, diagnostic lab, or area (e.g. Upanga, Muhimbili, Mikocheni)...'
                : 'Tafuta hospitali, maabara, au eneo (mfano Upanga, Muhimbili, Mikocheni)...'
            }
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#112240] border border-[#233554] text-[#E6F1FF] text-sm placeholder-[#8892B0] focus:border-[#64FFDA] focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: t.facilityFinder.all },
            { id: 'xray', label: t.facilityFinder.xray },
            { id: 'lab', label: t.facilityFinder.lab },
            { id: 'emergency', label: t.facilityFinder.emergency },
          ].map((filter) => {
            const isSelected = selectedFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as any)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#1E3A8A] border-[#64FFDA] text-[#64FFDA] shadow-md shadow-[#64FFDA]/10 scale-102 font-bold'
                    : 'bg-[#112240] border-[#233554] text-[#8892B0] hover:text-[#E6F1FF] hover:border-[#1E3A8A]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Facility Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="p-4 sm:p-5 rounded-2xl bg-[#112240] border border-[#233554] hover:border-[#1E3A8A] transition-all duration-200 flex flex-col justify-between shadow-md group"
          >
            <div>
              {/* Header: Name and Distance Badge */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-bold text-base text-[#E6F1FF] group-hover:text-[#64FFDA] transition-colors">
                    {facility.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#8892B0] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#64FFDA]" />
                    <span>{facility.area}</span>
                  </div>
                </div>

                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-[#1E3A8A]/50 border border-[#2563EB]/40 text-[#64FFDA] shrink-0">
                  {facility.distanceKm} km
                </span>
              </div>

              {/* Real-time Status Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {facility.isOpenNow ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t.facilityFinder.openNow}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">
                    Closed
                  </span>
                )}

                {facility.isNhifAccepted && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    {t.facilityFinder.nhifAccepted}
                  </span>
                )}

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  ★ {facility.rating}
                </span>
              </div>

              {/* Verified Services Matrix */}
              <div className="mt-4 pt-3 border-t border-[#1E3A8A]/30">
                <span className="text-[10px] font-bold text-[#8892B0] uppercase tracking-wider block mb-2">
                  {currentLanguage === 'EN' ? 'Certified Diagnostic Services:' : 'Vipimo Vilivyothibitishwa:'}
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {facility.services.xrayUltrasound && (
                    <span className="px-2 py-1 rounded-md bg-[#0A192F] border border-[#233554] text-[#E6F1FF] text-[11px] flex items-center gap-1">
                      🩻 X-Ray & Ultrasound
                    </span>
                  )}
                  {facility.services.pathologyLab && (
                    <span className="px-2 py-1 rounded-md bg-[#0A192F] border border-[#233554] text-[#E6F1FF] text-[11px] flex items-center gap-1">
                      🧪 Full Pathology Lab
                    </span>
                  )}
                  {facility.services.emergency24_7 && (
                    <span className="px-2 py-1 rounded-md bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1 font-semibold">
                      🚑 24/7 Emergency
                    </span>
                  )}
                  {facility.services.maternity && (
                    <span className="px-2 py-1 rounded-md bg-[#0A192F] border border-[#233554] text-[#8892B0] text-[11px]">
                      👶 Maternity / RCH
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Book Diagnostic Test Button on Verified Partner Cards */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setBookingFacility(facility)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:from-[#2563EB] hover:to-[#3b82f6] text-[#E6F1FF] hover:text-[#64FFDA] border border-[#2563EB]/50 hover:border-[#64FFDA]/50 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 group/btn"
              >
                <Calendar className="w-3.5 h-3.5 text-[#64FFDA] group-hover/btn:scale-110 transition-transform" />
                <span>
                  {currentLanguage === 'SW'
                    ? 'Miadi ya Vipimo (X-Ray / Lab / Daktari)'
                    : 'Book Diagnostic Test & Services'}
                </span>
                {facility.isNhifAccepted && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    NHIF
                  </span>
                )}
              </button>
            </div>

            {/* Bottom Actions: Call Emergency & Directions Modal */}
            <div className="mt-3 pt-3 border-t border-[#1E3A8A]/30 flex items-center justify-between gap-2">
              <a
                href={`tel:${facility.emergencyPhone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-red-900/30 hover:bg-red-800/40 border border-red-500/40 text-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-red-400" />
                <span>{currentLanguage === 'EN' ? 'Emergency Desk' : 'Dharura'}</span>
              </a>

              <button
                onClick={() => setSelectedFacility(facility)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#1E3A8A]/50 hover:bg-[#1E3A8A] border border-[#2563EB]/40 text-[#E6F1FF] hover:text-[#64FFDA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#64FFDA]" />
                <span>{t.facilityFinder.getDirections}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12 p-6 rounded-2xl bg-[#112240] border border-[#233554]">
          <AlertCircle className="w-8 h-8 text-[#8892B0] mx-auto mb-2" />
          <p className="text-sm text-[#E6F1FF] font-semibold">No health facilities found matching your criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedFilter('all');
            }}
            className="mt-3 text-xs text-[#64FFDA] underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Facility Details & Navigation Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#0A192F] border-2 border-[#1E3A8A] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {/* Prominent Go Back Button */}
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] border border-[#64FFDA]/40 hover:border-[#64FFDA] text-[#64FFDA] text-xs font-bold transition-all active:scale-95 shadow-sm group shrink-0"
                  title="Close Hospital Details & Return"
                >
                  <ArrowLeft className="w-4 h-4 text-[#64FFDA] group-hover:-translate-x-1 transition-transform" />
                  <span>{currentLanguage === 'SW' ? 'Rudi Nyuma' : 'Back / Rudi Nyuma'}</span>
                </button>

                <div>
                  <h3 className="text-base sm:text-lg font-heading font-extrabold text-[#E6F1FF]">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-xs text-[#64FFDA] mt-0.5">{selectedFacility.address}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFacility(null)}
                className="p-1.5 text-[#8892B0] hover:text-[#E6F1FF] rounded-lg shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embedded Live Google Maps Preview Centered on Hospital in Dar es Salaam */}
            <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-[#112240] border-2 border-[#1E3A8A] shadow-inner">
              <iframe
                title={`Live Map - ${selectedFacility.name}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${selectedFacility.coordinates.lat},${selectedFacility.coordinates.lng}+(${encodeURIComponent(selectedFacility.name)})&t=&z=16&ie=UTF8&iwloc=B&output=embed`}
                className="w-full h-full filter contrast-105 brightness-95"
              />
              <div className="absolute top-2 left-2 bg-[#0A192F]/90 backdrop-blur-md border border-[#233554] px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#64FFDA] flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Live GPS: {selectedFacility.coordinates.lat.toFixed(4)}, {selectedFacility.coordinates.lng.toFixed(4)}</span>
              </div>
            </div>

            {/* Prominent Blue Action Button: Open Navigation in Google Maps / Fungua Ramani */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.coordinates.lat},${selectedFacility.coordinates.lng}&destination_place_id=${encodeURIComponent(selectedFacility.name)}&travelmode=driving`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-[#2563EB] hover:from-blue-500 hover:to-blue-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 active:scale-98 group border border-blue-400/40"
            >
              <Navigation className="w-4 h-4 text-[#64FFDA] group-hover:scale-110 transition-transform" />
              <span>
                {currentLanguage === 'SW'
                  ? 'Fungua Ramani / Open Navigation in Google Maps'
                  : 'Open Navigation in Google Maps / Fungua Ramani'}
              </span>
              <ExternalLink className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
            </a>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#1E3A8A]/30">
                <span className="text-[#8892B0]">General Phone:</span>
                <span className="font-mono text-[#E6F1FF] font-semibold">{selectedFacility.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E3A8A]/30">
                <span className="text-[#8892B0]">Emergency Line:</span>
                <span className="font-mono text-red-400 font-bold">{selectedFacility.emergencyPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E3A8A]/30">
                <span className="text-[#8892B0]">Distance & Transit:</span>
                <span className="text-[#64FFDA] font-semibold font-mono">
                  {selectedFacility.distanceKm} km (~{Math.round(selectedFacility.distanceKm * 4)} mins drive)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E3A8A]/30">
                <span className="text-[#8892B0]">NHIF Insurance Status:</span>
                <span className="text-emerald-400 font-semibold">
                  {selectedFacility.isNhifAccepted ? 'Fully Covered' : 'Out-of-Pocket / Private'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedFacility;
                  setSelectedFacility(null);
                  setBookingFacility(target);
                }}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] text-xs font-black text-center flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Diagnostic Test</span>
              </button>

              <button
                onClick={() => setSelectedFacility(null)}
                className="w-full sm:flex-1 py-2.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] text-[#E6F1FF] border border-[#233554] text-xs font-bold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diagnostic & Service Appointment Booking Modal */}
      <DiagnosticBookingModal
        isOpen={!!bookingFacility}
        onClose={() => setBookingFacility(null)}
        facility={bookingFacility}
        userProfile={userProfile}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};
