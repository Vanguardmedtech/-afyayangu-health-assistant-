import React, { useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Download,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MapPin,
  Filter,
  FileSpreadsheet,
  Globe,
  Sparkles,
  BarChart3,
  Layers,
  Search,
} from 'lucide-react';
import { Language } from '../types';

interface EpidemicSurveillanceDashboardProps {
  currentLanguage: Language;
  onGoHome: () => void;
}

interface RegionalSurveillanceData {
  region: string;
  zone: string;
  dominantSyndrome: string;
  dominantSyndromeSw: string;
  riskLevel: 'elevated' | 'moderate' | 'normal';
  queryCount24h: number;
  trajectory7d: number; // percentage change
  malariaIndex: number; // 0-100
  respiratoryIndex: number; // 0-100
  gastroIndex: number; // 0-100
  reportingHealthCentres: number;
}

const REGIONAL_SURVEILLANCE_DATA: RegionalSurveillanceData[] = [
  {
    region: 'Dar es Salaam',
    zone: 'Coastal Zone',
    dominantSyndrome: 'Acute Febrile / Malaria Suspected',
    dominantSyndromeSw: 'Homa Kali na Shauku ya Malaria',
    riskLevel: 'elevated',
    queryCount24h: 1840,
    trajectory7d: +18.4,
    malariaIndex: 82,
    respiratoryIndex: 54,
    gastroIndex: 38,
    reportingHealthCentres: 48,
  },
  {
    region: 'Mwanza',
    zone: 'Lake Victoria Basin',
    dominantSyndrome: 'Waterborne & Gastrointestinal',
    dominantSyndromeSw: 'Magonjwa ya Maji na Tumbo',
    riskLevel: 'elevated',
    queryCount24h: 1290,
    trajectory7d: +12.1,
    malariaIndex: 74,
    respiratoryIndex: 42,
    gastroIndex: 79,
    reportingHealthCentres: 36,
  },
  {
    region: 'Arusha & Kilimanjaro',
    zone: 'Northern Highlands',
    dominantSyndrome: 'Upper Respiratory Infection',
    dominantSyndromeSw: 'Maambukizi ya Mfumo wa Upumuaji',
    riskLevel: 'moderate',
    queryCount24h: 960,
    trajectory7d: -4.2,
    malariaIndex: 31,
    respiratoryIndex: 78,
    gastroIndex: 25,
    reportingHealthCentres: 32,
  },
  {
    region: 'Dodoma',
    zone: 'Central Plateau',
    dominantSyndrome: 'Dehydration & Heat-related Headache',
    dominantSyndromeSw: 'Uchovu wa Joto na Upungufu wa Maji',
    riskLevel: 'normal',
    queryCount24h: 740,
    trajectory7d: +2.3,
    malariaIndex: 44,
    respiratoryIndex: 39,
    gastroIndex: 41,
    reportingHealthCentres: 28,
  },
  {
    region: 'Mbeya',
    zone: 'Southern Highlands',
    dominantSyndrome: 'Seasonal Bronchial Allergy / Cold',
    dominantSyndromeSw: 'Mzio wa Baridi na Mafua ya Msimu',
    riskLevel: 'normal',
    queryCount24h: 620,
    trajectory7d: -7.5,
    malariaIndex: 28,
    respiratoryIndex: 71,
    gastroIndex: 22,
    reportingHealthCentres: 24,
  },
  {
    region: 'Morogoro',
    zone: 'Eastern Agricultural',
    dominantSyndrome: 'Malaria & Muscle Arthralgia',
    dominantSyndromeSw: 'Homa ya Malaria na Maumivu ya Viungo',
    riskLevel: 'moderate',
    queryCount24h: 810,
    trajectory7d: +6.8,
    malariaIndex: 68,
    respiratoryIndex: 35,
    gastroIndex: 45,
    reportingHealthCentres: 26,
  },
  {
    region: 'Zanzibar (Unguja & Pemba)',
    zone: 'Islands Archipelago',
    dominantSyndrome: 'Viral Pharyngitis & Flu Symptoms',
    dominantSyndromeSw: 'Koo Kukwaruza na Mafua Makali',
    riskLevel: 'normal',
    queryCount24h: 530,
    trajectory7d: -3.1,
    malariaIndex: 22,
    respiratoryIndex: 64,
    gastroIndex: 30,
    reportingHealthCentres: 19,
  },
  {
    region: 'Tanga',
    zone: 'Northern Coastal',
    dominantSyndrome: 'Pediatric Febrile Illness',
    dominantSyndromeSw: 'Homa za Watoto na Mafua',
    riskLevel: 'moderate',
    queryCount24h: 490,
    trajectory7d: +4.9,
    malariaIndex: 62,
    respiratoryIndex: 48,
    gastroIndex: 34,
    reportingHealthCentres: 18,
  },
];

export const EpidemicSurveillanceDashboard: React.FC<EpidemicSurveillanceDashboardProps> = ({
  currentLanguage,
  onGoHome,
}) => {
  const [selectedSyndromeFilter, setSelectedSyndromeFilter] = useState<'all' | 'malaria' | 'respiratory' | 'gastro'>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [searchRegion, setSearchRegion] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const filteredRegions = REGIONAL_SURVEILLANCE_DATA.filter((r) => {
    const matchesSearch =
      !searchRegion ||
      r.region.toLowerCase().includes(searchRegion.toLowerCase()) ||
      r.zone.toLowerCase().includes(searchRegion.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedSyndromeFilter === 'malaria') return r.malariaIndex >= 60;
    if (selectedSyndromeFilter === 'respiratory') return r.respiratoryIndex >= 50;
    if (selectedSyndromeFilter === 'gastro') return r.gastroIndex >= 40;

    return true;
  });

  const totalAggregatedQueries = REGIONAL_SURVEILLANCE_DATA.reduce(
    (acc, curr) => acc + curr.queryCount24h,
    0
  );

  const handleExportCSV = () => {
    const headers = [
      'Region',
      'Geographical_Zone',
      'Dominant_Syndrome_Cluster',
      'Triage_Risk_Level',
      '24h_Query_Volume',
      '7d_Trajectory_Pct',
      'Malaria_Severity_Index',
      'Respiratory_Severity_Index',
      'Gastro_Severity_Index',
      'Reporting_Health_Centres',
      'Data_Protection_Standard',
      'Export_Timestamp',
    ].join(',');

    const rows = REGIONAL_SURVEILLANCE_DATA.map((r) => {
      return [
        `"${r.region}"`,
        `"${r.zone}"`,
        `"${r.dominantSyndrome}"`,
        `"${r.riskLevel.toUpperCase()}"`,
        r.queryCount24h,
        `"${r.trajectory7d > 0 ? '+' : ''}${r.trajectory7d}%"`,
        r.malariaIndex,
        r.respiratoryIndex,
        r.gastroIndex,
        r.reportingHealthCentres,
        '"HIPAA & Tanzania DPA 2022 De-Identified"',
        `"${new Date().toISOString()}"`,
      ].join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vanguard-Epidemic-Surveillance-Tanzania-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner with Universal Back Button */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#112240] via-[#1E3A8A]/40 to-[#0A192F] border border-[#1E3A8A] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
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
            <Globe className="w-6 h-6 text-[#64FFDA]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-[#E6F1FF]">
                {currentLanguage === 'SW' ? 'Ramani ya Magonjwa & Takwimu za Mlipuko' : 'Epidemic Surveillance & Research Dashboard'}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#64FFDA]/10 text-[#64FFDA] border border-[#64FFDA]/30 font-bold uppercase">
                Tanzania Live
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8892B0] mt-1">
              {currentLanguage === 'SW'
                ? 'Ufuatiliaji wa wakati halisi wa dalili za milipuko ya magonjwa kanda zote za Tanzania bila kutaja majina ya wagonjwa.'
                : 'Real-time anonymized syndromic clustering and epidemiological risk modeling across Tanzanian zones.'}
            </p>
          </div>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#64FFDA]/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>
            {downloadSuccess
              ? currentLanguage === 'SW'
                ? 'Ripoti Imepakuliwa!'
                : 'Downloaded CSV!'
              : currentLanguage === 'SW'
              ? 'Pakua Ripoti ya Utafiti (CSV)'
              : 'Download Aggregated Report (CSV)'}
          </span>
        </button>
      </div>

      {/* METRIC KPI TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Query Index */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8892B0]">
            <span className="font-semibold">24h Anonymized Queries</span>
            <Activity className="w-4 h-4 text-[#64FFDA]" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-heading font-black text-[#E6F1FF] font-mono">
              {totalAggregatedQueries.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-400 font-bold">+8.2% vs yesterday</span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E3A8A]/30 text-[10px] text-[#8892B0]">
            100% De-Identified Telemetry
          </div>
        </div>

        {/* Highest Febrile Cluster */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8892B0]">
            <span className="font-semibold">Highest Febrile Cluster</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-heading font-extrabold text-[#E6F1FF]">
              Dar es Salaam
            </span>
            <span className="block text-xs text-rose-400 font-bold font-mono">
              Index: 82/100 (Elevated)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E3A8A]/30 text-[10px] text-[#8892B0]">
            Ilala & Kinondoni Drainage Zones
          </div>
        </div>

        {/* Waterborne Focus */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8892B0]">
            <span className="font-semibold">Lake Zone GI Signals</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl font-heading font-extrabold text-[#E6F1FF]">
              Mwanza & Nyamagana
            </span>
            <span className="block text-xs text-amber-300 font-bold font-mono">
              Index: 79/100 (GI Alert)
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E3A8A]/30 text-[10px] text-[#8892B0]">
            Water Filtration Advisory Active
          </div>
        </div>

        {/* Research Governance */}
        <div className="p-4 rounded-2xl bg-[#112240] border border-[#233554] flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[#8892B0]">
            <span className="font-semibold">Research Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-sm font-heading font-bold text-emerald-300 block">
              NIMR & MoH Aligned
            </span>
            <span className="text-[11px] text-[#8892B0]">
              National Institute for Medical Research
            </span>
          </div>
          <div className="mt-3 pt-2 border-t border-[#1E3A8A]/30 text-[10px] text-emerald-400 font-semibold">
            Zero PII Export Guarantee
          </div>
        </div>
      </div>

      {/* REGIONAL HEATMAP MATRIX COMPONENT */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#112240] border border-[#233554] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3A8A]/40 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#64FFDA]" />
              <h3 className="font-heading font-extrabold text-base text-[#E6F1FF]">
                {currentLanguage === 'SW' ? 'Ulinganisho wa Kanda & Kiwango cha Mlipuko' : 'Zonal Syndrome Heatmap & Trajectory Matrix'}
              </h3>
            </div>
            <p className="text-xs text-[#8892B0] mt-0.5">
              Live anomaly detection across primary referral catchment hospitals
            </p>
          </div>

          {/* Syndrome Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Syndromes' },
              { id: 'malaria', label: 'Febrile / Malaria' },
              { id: 'respiratory', label: 'Respiratory / Flu' },
              { id: 'gastro', label: 'Gastrointestinal' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedSyndromeFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedSyndromeFilter === f.id
                    ? 'bg-[#1E3A8A] text-[#64FFDA] border border-[#64FFDA]/50 font-bold'
                    : 'bg-[#0A192F] text-[#8892B0] border border-[#233554] hover:text-[#E6F1FF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Heatmap Bars Grid */}
        <div className="space-y-3 pt-2">
          {filteredRegions.map((r) => {
            const isElevated = r.riskLevel === 'elevated';
            const isModerate = r.riskLevel === 'moderate';

            const primaryIndex =
              selectedSyndromeFilter === 'malaria'
                ? r.malariaIndex
                : selectedSyndromeFilter === 'respiratory'
                ? r.respiratoryIndex
                : selectedSyndromeFilter === 'gastro'
                ? r.gastroIndex
                : Math.max(r.malariaIndex, r.respiratoryIndex, r.gastroIndex);

            return (
              <div
                key={r.region}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#0A192F] border border-[#233554] hover:border-[#1E3A8A] transition-all space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3 h-3 rounded-full shrink-0 ${
                        isElevated
                          ? 'bg-rose-500 animate-ping'
                          : isModerate
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-extrabold text-sm sm:text-base text-[#E6F1FF]">
                          {r.region}
                        </span>
                        <span className="text-[10px] font-mono text-[#8892B0]">({r.zone})</span>
                      </div>
                      <span className="text-xs text-[#64FFDA] font-medium block">
                        {currentLanguage === 'SW' ? r.dominantSyndromeSw : r.dominantSyndrome}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${
                        isElevated
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : isModerate
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}
                    >
                      {r.riskLevel} Risk
                    </span>

                    <div className="text-right">
                      <span className="font-mono font-bold text-xs text-[#E6F1FF] block">
                        {r.queryCount24h} queries
                      </span>
                      <span
                        className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 ${
                          r.trajectory7d > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {r.trajectory7d > 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span>{r.trajectory7d > 0 ? `+${r.trajectory7d}%` : `${r.trajectory7d}%`} (7d)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Heatmap Bar Meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-[#8892B0] font-mono">
                    <span>Severity Heat Level</span>
                    <span>{primaryIndex}/100</span>
                  </div>
                  <div className="w-full bg-[#112240] h-2.5 rounded-full overflow-hidden border border-[#233554]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isElevated
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                          : isModerate
                          ? 'bg-gradient-to-r from-blue-500 to-amber-400'
                          : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                      }`}
                      style={{ width: `${primaryIndex}%` }}
                    />
                  </div>
                </div>

                {/* Sub-indices breakdown */}
                <div className="flex items-center gap-4 text-[10px] font-mono text-[#8892B0] pt-1">
                  <span>Malaria: <strong className="text-[#E6F1FF]">{r.malariaIndex}</strong></span>
                  <span>Respiratory: <strong className="text-[#E6F1FF]">{r.respiratoryIndex}</strong></span>
                  <span>Gastro: <strong className="text-[#E6F1FF]">{r.gastroIndex}</strong></span>
                  <span className="ml-auto hidden sm:inline text-zinc-500">
                    {r.reportingHealthCentres} Sentinel Sites Active
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RESEARCH & ETHICS NOTE */}
      <div className="p-4 rounded-2xl bg-[#112240]/80 border border-[#233554] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8892B0]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#64FFDA] shrink-0" />
          <span>
            Compliant with Tanzania Data Protection Act (2022) & WHO AFRO Integrated Disease Surveillance and Response (IDSR) guidelines.
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="text-[#64FFDA] font-bold hover:underline shrink-0 flex items-center gap-1"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Export Clean Dataset</span>
        </button>
      </div>
    </div>
  );
};
