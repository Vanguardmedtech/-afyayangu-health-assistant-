import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  PhoneCall,
  Hospital,
  Activity,
  Stethoscope,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Paperclip,
  Share2,
  Camera,
  FileText,
  Image as ImageIcon,
  X,
  FileCheck,
} from 'lucide-react';
import { ChatAttachment, ChatMessage, Language, UserProfile } from '../types';
import { translations } from '../data/mockData';
import { DailyHealthTipsWidget } from './DailyHealthTipsWidget';
import { ConsultationSummaryPayload } from './ShareSummaryModal';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachment?: ChatAttachment) => void;
  onOpenDoctorModal: () => void;
  onNavigateToFacilities: () => void;
  onNavigateToTracker: () => void;
  onClearChat: () => void;
  onOpenShareModal?: (payload: ConsultationSummaryPayload) => void;
  userProfile: UserProfile;
  currentLanguage: Language;
  isAiTyping: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onOpenDoctorModal,
  onNavigateToFacilities,
  onNavigateToTracker,
  onClearChat,
  onOpenShareModal,
  userProfile,
  currentLanguage,
  isAiTyping,
}) => {
  const t = translations[currentLanguage];
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const firstName = userProfile.fullName ? userProfile.fullName.split(' ')[0] : 'Victor';
  const recognitionRef = useRef<any>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [interimText, setInterimText] = useState<string>('');

  // Camera & File Attachment States
  const [attachedItem, setAttachedItem] = useState<ChatAttachment | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  // Check browser SpeechRecognition API availability
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  // Camera capture / File upload handlers
  const handleCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachedItem({
        type: 'image',
        name: file.name || 'Clinical_Photo_Capture.jpg',
        url,
        size: `${Math.round(file.size / 1024)} KB`,
      });
      setShowPhotoModal(false);
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedItem({
        type: 'file',
        name: file.name || 'Medical_Record_Attachment.pdf',
        size: `${Math.round(file.size / 1024)} KB`,
      });
    }
  };

  // Pre-configured clinical simulated photo options for rapid demos
  const handleSelectSimulatedPhoto = (title: string, sampleDataUrl: string) => {
    setAttachedItem({
      type: 'image',
      name: title,
      url: sampleDataUrl,
      size: '1.2 MB (Verified Clinical Image)',
    });
    setShowPhotoModal(false);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachedItem) return;
    
    // Stop listening if sending
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    const textToSend = inputText.trim() || (attachedItem ? `Please analyze this attached ${attachedItem.name}` : '');
    onSendMessage(textToSend, attachedItem || undefined);
    setInputText('');
    setInterimText('');
    setAttachedItem(null);
  };

  const handleChipClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  // Real-time simulated voice transcription (Graceful fallback)
  const simulateVoiceTranscription = (preferredPrompt?: string) => {
    setIsListening(true);
    setSpeechError(null);

    const promptToType =
      preferredPrompt ||
      (currentLanguage === 'SW'
        ? 'Nina maumivu makali ya kichwa na homa kali tangu asubuhi'
        : 'I have severe malaria symptoms with high fever and chills since morning');

    setSpeechFeedback(
      currentLanguage === 'SW'
        ? 'Inasikiliza (Kiswahili)... Sema dalili zako sasa'
        : 'Listening (English)... Speak your medical query now'
    );

    let currentLength = 0;
    const typingInterval = setInterval(() => {
      currentLength += 3;
      if (currentLength >= promptToType.length) {
        setInputText(promptToType);
        setInterimText('');
        clearInterval(typingInterval);
        setTimeout(() => {
          setIsListening(false);
          setSpeechFeedback(null);
        }, 600);
      } else {
        const chunk = promptToType.slice(0, currentLength);
        setInterimText(chunk);
        setInputText(chunk);
      }
    }, 45);
  };

  // Browser SpeechRecognition API Integration with Graceful Fallback
  const handleToggleVoice = () => {
    setSpeechError(null);

    // If currently listening, stop recognition
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      setSpeechFeedback(null);
      setInterimText('');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Graceful fallback if browser doesn't support Web Speech API
    if (!SpeechRecognition) {
      simulateVoiceTranscription();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure recognition
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Select Swahili or English language based on active app language
      recognition.lang = currentLanguage === 'SW' ? 'sw-TZ' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
        setSpeechFeedback(
          currentLanguage === 'SW'
            ? 'Inasikiliza (Kiswahili - Tanzania)... Sema dalili zako sasa'
            : 'Listening (English)... Speak your medical query now'
        );
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            currentInterim += transcript;
          }
        }

        if (currentInterim) {
          setInterimText(currentInterim);
        }

        if (finalTranscript) {
          setInputText((prev) => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
          setInterimText('');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition notice:', event.error);
        setIsListening(false);
        setInterimText('');

        // If permission is denied/blocked in iframe, seamlessly fall back to simulation
        if (
          event.error === 'not-allowed' ||
          event.error === 'permission-denied' ||
          event.error === 'service-not-allowed' ||
          event.error === 'audio-capture'
        ) {
          simulateVoiceTranscription();
        } else if (event.error === 'no-speech') {
          // Subtle feedback without error
          setSpeechFeedback(
            currentLanguage === 'SW'
              ? 'Sauti haijasikika. Unaweza kubofya tena kuongea.'
              : 'No speech detected. Tap mic to speak again.'
          );
          setTimeout(() => setSpeechFeedback(null), 2500);
        } else {
          simulateVoiceTranscription();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        setTimeout(() => {
          setSpeechFeedback((prev) => (prev?.includes('Inasikiliza') || prev?.includes('Listening') ? null : prev));
        }, 1000);
      };

      recognition.start();
    } catch (err: any) {
      console.warn('SpeechRecognition startup caught, transitioning to simulation:', err);
      simulateVoiceTranscription();
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-62px)] relative bg-[#0A192F] overflow-hidden">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-44 sm:pb-48">
        {messages.length === 0 ? (
          /* SPACIOUS, ULTRA-CLEAN LANDING VIEW UPON OPENING (GEMINI-STYLE) */
          <div className="max-w-3xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center px-2 animate-fade-in my-auto">
            {/* VERY HUGE, BOLD, AND ROUNDED GREETING TEXT CENTERED ON THE SCREEN */}
            <div className="space-y-3 mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#112240] border border-[#2563EB]/40 shadow-sm text-xs text-[#64FFDA] font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Vanguard Medical Intelligence • East Africa</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-[#E6F1FF] leading-none">
                {t.greetingPrefix},{' '}
                <span className="bg-gradient-to-r from-[#64FFDA] via-[#38bdf8] to-[#2563EB] bg-clip-text text-transparent">
                  {firstName}
                </span>
              </h1>

              <p className="text-lg sm:text-2xl font-light text-[#8892B0] max-w-xl mx-auto leading-snug">
                {t.greetingQuestion}
              </p>
            </div>

            {/* DAILY HEALTH TIPS WIDGET ("Dondoo za Afya") */}
            <DailyHealthTipsWidget
              currentLanguage={currentLanguage}
              userProfile={userProfile}
              onSelectPrompt={handleChipClick}
            />

            {/* Quick Suggestion Chips (Horizontal rounded pills) */}
            <div className="w-full max-w-2xl space-y-3 mt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#8892B0] font-semibold">
                {currentLanguage === 'EN' ? 'Quick Clinical Actions' : 'Hatua za Haraka za Afya'}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {/* 🩺 Symptom Triage / Kagua Dalili */}
                <button
                  onClick={() =>
                    handleChipClick(
                      currentLanguage === 'EN'
                        ? 'I have severe malaria symptoms with high fever and chills'
                        : 'Nina maumivu makali ya kichwa na homa kali'
                    )
                  }
                  className="px-4 py-2.5 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-[#64FFDA] text-[#E6F1FF] hover:text-[#64FFDA] text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
                >
                  <Stethoscope className="w-4 h-4 text-[#64FFDA] group-hover:scale-110 transition-transform" />
                  <span>{t.chips.triage}</span>
                </button>

                {/* 📞 Direct Doctor Call / Ongea na Daktari */}
                <button
                  onClick={onOpenDoctorModal}
                  className="px-4 py-2.5 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/50 border border-emerald-500/30 hover:border-emerald-400 text-[#E6F1FF] hover:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>{t.chips.callDoctor}</span>
                </button>

                {/* 🏥 Find Nearby Facilities / Hospitali Karibu */}
                <button
                  onClick={onNavigateToFacilities}
                  className="px-4 py-2.5 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-blue-400 text-[#E6F1FF] hover:text-blue-300 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
                >
                  <Hospital className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span>{t.chips.facilities}</span>
                </button>

                {/* 📊 My Health Records / Kumbukumbu za Afya */}
                <button
                  onClick={onNavigateToTracker}
                  className="px-4 py-2.5 rounded-full bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-purple-400 text-[#E6F1FF] hover:text-purple-300 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95 group"
                >
                  <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span>{t.chips.records}</span>
                </button>
              </div>

              {/* Pitch Demo Questions Pills */}
              <div className="pt-4 border-t border-[#1E3A8A]/30">
                <span className="text-[10px] text-[#8892B0] block mb-2">
                  {currentLanguage === 'EN' ? 'Or try asking these clinical queries:' : 'Au jaribu kuuliza maswali haya:'}
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {[
                    'I have severe malaria symptoms',
                    'Nina maumivu makali ya kichwa na homa',
                    'Child immunization schedule',
                    'Severe chest pain radiating to left arm',
                  ].map((demo, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleChipClick(demo)}
                      className="px-3 py-1.5 rounded-full bg-[#0A192F] hover:bg-[#112240] border border-[#233554] hover:border-[#64FFDA]/50 text-[11px] text-[#8892B0] hover:text-[#E6F1FF] transition-all"
                    >
                      "{demo}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CLINICAL CHAT STREAM */
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#1E3A8A]/30 pb-2 text-xs text-[#8892B0]">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#64FFDA]" />
                Active Clinical Consultation • {messages.length} messages
              </span>
              <button
                onClick={onClearChat}
                className="flex items-center gap-1 text-[#8892B0] hover:text-[#64FFDA] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>New Conversation</span>
              </button>
            </div>

            {messages.map((message) => {
              const isUser = message.sender === 'user';

              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  {/* Sender Label */}
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-[#8892B0] font-medium">
                    {isUser ? (
                      <span>You ({firstName})</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[#64FFDA] font-bold">
                        <Sparkles className="w-3 h-3" />
                        Vanguard Clinical AI
                      </span>
                    )}
                    <span>• {message.timestamp}</span>
                  </div>

                  {/* Message Bubble Card */}
                  <div
                    className={`p-4 sm:p-5 rounded-3xl text-sm leading-relaxed max-w-full sm:max-w-[90%] shadow-lg transition-all ${
                      isUser
                        ? 'bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-[#E6F1FF] rounded-tr-sm border border-[#2563EB]/50 font-medium'
                        : 'bg-[#112240] text-[#E6F1FF] rounded-tl-sm border border-[#233554] space-y-4'
                    }`}
                  >
                    {/* Attached Clinical Image or Document if present */}
                    {message.attachment && (
                      <div className="mb-2.5">
                        {message.attachment.type === 'image' ? (
                          <div className="rounded-2xl overflow-hidden border border-[#64FFDA]/40 max-w-xs bg-[#0A192F] shadow-lg">
                            {message.attachment.url ? (
                              <img
                                src={message.attachment.url}
                                alt={message.attachment.name}
                                className="w-full max-h-52 object-cover"
                              />
                            ) : (
                              <div className="p-4 flex items-center gap-2 text-xs text-[#64FFDA]">
                                <Camera className="w-4 h-4" />
                                <span>{message.attachment.name}</span>
                              </div>
                            )}
                            <div className="p-2 bg-[#0A192F]/95 text-[10px] text-[#8892B0] font-mono flex items-center justify-between border-t border-[#1E3A8A]/40">
                              <span className="truncate pr-2 font-medium text-[#E6F1FF]">{message.attachment.name}</span>
                              <span className="text-[#64FFDA] shrink-0 font-bold">📷 Photo</span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-[#0A192F]/90 border border-[#2563EB]/40 flex items-center gap-2.5 max-w-xs text-xs text-[#E6F1FF] shadow-sm">
                            <div className="p-2 rounded-lg bg-[#1E3A8A] text-[#64FFDA] shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate flex-1">
                              <span className="font-bold block truncate text-[#E6F1FF]">{message.attachment.name}</span>
                              <span className="text-[10px] text-[#8892B0] font-mono">📎 {message.attachment.size || 'Medical Document'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Body text */}
                    <div className="whitespace-pre-line text-[13px] sm:text-sm font-normal text-[#E6F1FF]/95">
                      {message.text}
                    </div>

                    {/* Structured Clinical Assessment Card if present */}
                    {message.assessment && (
                      <div className="mt-4 pt-4 border-t border-[#1E3A8A]/50 space-y-3 bg-[#0A192F]/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 p-4 sm:p-5 rounded-b-3xl">
                        {/* Summary badge */}
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#1E3A8A]/40 text-[#64FFDA] border border-[#2563EB]/40 font-bold">
                            Triage Severity: {message.assessment.severity.toUpperCase()}
                          </span>

                          <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Saved to Consultations
                          </span>
                        </div>

                        {/* Action Steps */}
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-[#E6F1FF] block">
                            Key Action Protocol:
                          </span>
                          <ul className="space-y-1 text-xs text-[#8892B0]">
                            {message.assessment.steps.map((st, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#64FFDA] font-bold">•</span>
                                <span>{st}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Embedded Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                          <button
                            onClick={onOpenDoctorModal}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-[#0A192F] font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{currentLanguage === 'EN' ? 'Talk to Real-Time Doctor (TZS 1k)' : 'Ongea na Daktari Moja kwa Moja'}</span>
                          </button>

                          <button
                            onClick={onNavigateToFacilities}
                            className="px-3.5 py-2 rounded-xl bg-[#1E3A8A]/60 hover:bg-[#1E3A8A] border border-[#2563EB]/40 text-[#E6F1FF] font-semibold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Hospital className="w-3.5 h-3.5 text-[#64FFDA]" />
                            <span>{currentLanguage === 'EN' ? 'Find Nearest 24/7 Facility' : 'Tafuta Hospitali Karibu'}</span>
                          </button>

                          {/* Share / Export Summary Button ("Shiriki Mjadala") */}
                          {onOpenShareModal && (
                            <button
                              onClick={() => {
                                const msgIdx = messages.findIndex((m) => m.id === message.id);
                                const prevUserMsg = msgIdx > 0 ? messages[msgIdx - 1] : null;
                                onOpenShareModal({
                                  consultationId: `VMD-${message.id.slice(-6)}`,
                                  date: `${message.timestamp} EAT`,
                                  patientName: userProfile.fullName,
                                  patientAge: userProfile.age,
                                  patientGender: userProfile.gender,
                                  bloodGroup: userProfile.bloodGroup,
                                  hemoglobinGenotype: userProfile.hemoglobinGenotype,
                                  nhifCard: userProfile.nhifNumber,
                                  activeMedications: userProfile.activeMedications,
                                  knownAllergies: userProfile.knownAllergies,
                                  chiefComplaint: prevUserMsg?.text || 'Triage consultation inquiry',
                                  aiGuidance: message.text,
                                  severity: message.assessment?.severity || 'moderate',
                                  actionSteps: message.assessment?.steps,
                                });
                              }}
                              className="px-3.5 py-2 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] border border-[#64FFDA]/50 hover:border-[#64FFDA] text-[#64FFDA] font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                              title={currentLanguage === 'SW' ? 'Shiriki Mjadala / Muhtasari wa Ushauri' : 'Share Consultation Summary'}
                            >
                              <Share2 className="w-3.5 h-3.5 text-[#64FFDA]" />
                              <span>{currentLanguage === 'SW' ? 'Shiriki Mjadala' : 'Share / Export Summary'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Standard AI response without structured assessment: Share button footer */}
                    {!isUser && !message.assessment && onOpenShareModal && (
                      <div className="pt-2 border-t border-[#1E3A8A]/30 flex justify-end">
                        <button
                          onClick={() => {
                            const msgIdx = messages.findIndex((m) => m.id === message.id);
                            const prevUserMsg = msgIdx > 0 ? messages[msgIdx - 1] : null;
                            onOpenShareModal({
                              consultationId: `VMD-${message.id.slice(-6)}`,
                              date: `${message.timestamp} EAT`,
                              patientName: userProfile.fullName,
                              patientAge: userProfile.age,
                              patientGender: userProfile.gender,
                              bloodGroup: userProfile.bloodGroup,
                              hemoglobinGenotype: userProfile.hemoglobinGenotype,
                              nhifCard: userProfile.nhifNumber,
                              activeMedications: userProfile.activeMedications,
                              knownAllergies: userProfile.knownAllergies,
                              chiefComplaint: prevUserMsg?.text || 'Clinical inquiry',
                              aiGuidance: message.text,
                              severity: 'routine',
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0A192F] hover:bg-[#1E3A8A] text-[#64FFDA] border border-[#64FFDA]/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                        >
                          <Share2 className="w-3.5 h-3.5 text-[#64FFDA]" />
                          <span>{currentLanguage === 'SW' ? 'Shiriki Mjadala' : 'Share / Export Summary'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isAiTyping && (
              <div className="flex flex-col items-start animate-fade-in">
                <div className="flex items-center gap-2 mb-1 text-[11px] text-[#64FFDA] font-bold">
                  <Sparkles className="w-3 h-3 animate-spin" />
                  <span>Vanguard Clinical AI is analyzing symptoms...</span>
                </div>
                <div className="p-4 rounded-3xl rounded-tl-sm bg-[#112240] border border-[#233554] flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#64FFDA] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* BOTTOM-FIXED ROUNDED INPUT BAR (GEMINI-STYLE, WIDER & TALLER) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-3 sm:p-5 pointer-events-none">
        <div className="max-w-4xl sm:max-w-5xl mx-auto pointer-events-auto space-y-2">
          {/* Hidden File Inputs for Camera Capture and Medical Documents */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleCameraFileChange}
            className="hidden"
          />
          <input
            type="file"
            ref={fileInputRef}
            accept=".pdf,.doc,.docx,.txt,image/*"
            onChange={handleDocumentFileChange}
            className="hidden"
          />

          {/* Attached Thumbnail / File Badge in Chat Bar */}
          {attachedItem && (
            <div className="mx-2 sm:mx-4 px-4 py-2.5 rounded-2xl bg-[#0A192F]/95 border-2 border-[#64FFDA]/60 shadow-xl backdrop-blur-md flex items-center justify-between text-xs text-[#E6F1FF] animate-fade-in">
              <div className="flex items-center gap-3">
                {attachedItem.type === 'image' ? (
                  attachedItem.url ? (
                    <img
                      src={attachedItem.url}
                      alt="Attached thumbnail"
                      className="w-10 h-10 object-cover rounded-xl border border-[#64FFDA]/50 shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-[#64FFDA]">
                      <Camera className="w-5 h-5" />
                    </div>
                  )
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] border border-[#2563EB]/40 flex items-center justify-center text-[#64FFDA]">
                    <FileText className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#E6F1FF] line-clamp-1">
                      {attachedItem.name}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#1E3A8A]/60 text-[#64FFDA] border border-[#2563EB]/40 font-semibold">
                      {attachedItem.type === 'image' ? 'Photo Preview' : 'Document'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#8892B0]">
                    {attachedItem.size || 'Ready for clinical AI review'} • Ready to send
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAttachedItem(null)}
                className="p-1.5 rounded-xl text-[#8892B0] hover:text-rose-400 hover:bg-[#112240] transition-colors"
                title="Remove attachment"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Voice Listening Feedback Alert with Live Audio Waveform */}
          {(isListening || speechFeedback) && (
            <div className="mx-2 sm:mx-4 p-2.5 px-4 rounded-2xl bg-[#112240]/95 border-2 border-[#64FFDA]/60 text-xs text-[#64FFDA] flex items-center justify-between shadow-2xl backdrop-blur-md animate-fade-in">
              <div className="flex items-center gap-3">
                {/* Pulsing Mic Badge */}
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>

                {/* Animated Speech Waveform */}
                <div className="flex items-center gap-0.5 h-4">
                  {[40, 80, 25, 100, 60, 30, 90, 70, 45, 95].map((h, idx) => (
                    <span
                      key={idx}
                      className="w-0.5 bg-[#64FFDA] rounded-full transition-all duration-150 animate-pulse"
                      style={{
                        height: isListening ? `${h}%` : '20%',
                        animationDelay: `${idx * 0.08}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#E6F1FF]">
                      {speechFeedback || (currentLanguage === 'SW' ? 'Inasikiliza...' : 'Listening...')}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1E3A8A] text-[#64FFDA] border border-[#2563EB]/40 font-semibold">
                      {currentLanguage === 'SW' ? 'sw-TZ (Swahili)' : 'en-US (English)'}
                    </span>
                  </div>
                  {interimText && (
                    <span className="text-[11px] text-[#8892B0] italic line-clamp-1 mt-0.5">
                      "{interimText}"
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className="text-[11px] font-semibold text-[#0A192F] bg-[#64FFDA] hover:bg-[#38bdf8] px-2.5 py-1 rounded-full transition-all"
                >
                  {currentLanguage === 'SW' ? 'Maliza' : 'Stop'}
                </button>
              </div>
            </div>
          )}

          {/* WIDER, TALLER & PROMINENT PILL INPUT BAR */}
          <form
            onSubmit={handleSend}
            className={`relative flex items-center w-full bg-[#112240] border-2 transition-all duration-300 pl-2.5 sm:pl-3.5 pr-2.5 sm:pr-3 py-2 sm:py-3 rounded-full shadow-2xl backdrop-blur-xl gap-1 sm:gap-2 ${
              isListening
                ? 'border-[#64FFDA] ring-4 ring-[#64FFDA]/25 shadow-[#64FFDA]/15'
                : 'border-[#233554] hover:border-[#2563EB]/80 focus-within:border-[#64FFDA] focus-within:ring-4 focus-within:ring-[#64FFDA]/20'
            }`}
          >
            {/* Left Icons: 📎 File Attachment, 📷 Camera, 🎙️ Microphone */}
            <div className="flex items-center gap-1 shrink-0">
              {/* File Attachment Icon (📎) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 rounded-full text-[#8892B0] hover:text-[#64FFDA] hover:bg-[#1E3A8A]/50 transition-all active:scale-95 group/btn"
                title={
                  currentLanguage === 'SW'
                    ? 'Ambatisha Hati ya Afya (PDF, Ripoti ya Maabara, Dawa)'
                    : 'Attach Medical Document (PDF, Lab Result, Prescription)'
                }
              >
                <Paperclip className="w-5 h-5 group-hover/btn:rotate-12 transition-transform text-[#64FFDA]" />
              </button>

              {/* Camera Icon (📷) */}
              <button
                type="button"
                onClick={() => setShowPhotoModal(true)}
                className="p-2 sm:p-2.5 rounded-full text-[#8892B0] hover:text-[#64FFDA] hover:bg-[#1E3A8A]/50 transition-all active:scale-95 group/btn"
                title={
                  currentLanguage === 'SW'
                    ? 'Piga Picha ya Ngozi au Ripoti ya Daktari (Kamera)'
                    : 'Capture/Attach Clinical Photo (Camera)'
                }
              >
                <Camera className="w-5 h-5 group-hover/btn:scale-110 transition-transform text-[#64FFDA]" />
              </button>

              {/* Voice Recognition Button (🎙️ Speech-to-Text) */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`p-2 sm:p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 relative group ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500 shadow-md shadow-rose-500/20 animate-pulse'
                    : 'text-[#8892B0] hover:text-[#64FFDA] hover:bg-[#1E3A8A]/50'
                }`}
                title={
                  isListening
                    ? currentLanguage === 'SW'
                      ? 'Bofya kusimamisha kusikiliza'
                      : 'Click to stop listening'
                    : currentLanguage === 'SW'
                    ? 'Ongea kwa Kiswahili (Maikrofoni)'
                    : 'Speak your query in English or Swahili (Microphone)'
                }
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-rose-400" />
                ) : (
                  <Mic className="w-5 h-5 group-hover:scale-110 transition-transform text-[#64FFDA]" />
                )}
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>
            </div>

            {/* Main Text Input with live typing */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? interimText
                    ? interimText
                    : currentLanguage === 'SW'
                    ? 'Inasikiliza... Ongea sasa kwa Kiswahili'
                    : 'Listening... Speak your query now in English'
                  : currentLanguage === 'SW'
                  ? 'Andika dalili, ambatisha picha, au uliza swali lolote la afya...'
                  : t.inputPlaceholder
              }
              className="flex-1 bg-transparent px-2.5 sm:px-3 py-2 text-sm sm:text-base text-[#E6F1FF] placeholder-[#8892B0] focus:outline-none font-normal"
            />

            {/* Send Button ➤ */}
            <button
              type="submit"
              disabled={!inputText.trim() && !attachedItem}
              className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center ${
                inputText.trim() || attachedItem
                  ? 'bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] shadow-lg shadow-[#64FFDA]/25 hover:scale-105 active:scale-95 cursor-pointer'
                  : 'text-zinc-600 bg-transparent cursor-not-allowed opacity-40'
              }`}
              title={t.send}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5" />
            </button>
          </form>

          <p className="text-[10px] text-center text-[#8892B0]/80 mt-1">
            Vanguard AI aids preliminary triage. In life-threatening emergencies, dial 112 / 115 immediately.
          </p>
        </div>
      </div>

      {/* CAMERA CAPTURE / PHOTO SELECTOR MODAL */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="relative w-full max-w-md bg-[#0A192F] border-2 border-[#1E3A8A] rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4 text-[#E6F1FF]">
            <div className="flex items-center justify-between border-b border-[#1E3A8A]/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#1E3A8A] border border-[#64FFDA]/30 flex items-center justify-center text-[#64FFDA]">
                  <Camera className="w-4 h-4 text-[#64FFDA]" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#E6F1FF]">
                    {currentLanguage === 'SW' ? 'Piga Picha au Ambatisha' : 'Capture / Attach Photo'}
                  </h3>
                  <span className="text-[10px] font-mono text-[#8892B0]">
                    Clinical Visual AI Triage
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 text-[#8892B0] hover:text-[#E6F1FF]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Option 1: Live Camera / File Browse */}
              <button
                type="button"
                onClick={() => {
                  cameraInputRef.current?.click();
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] hover:brightness-110 border border-[#2563EB]/50 text-left flex items-center justify-between transition-all active:scale-98 shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0A192F]/80 flex items-center justify-center text-[#64FFDA]">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-[#E6F1FF] block">
                      {currentLanguage === 'SW' ? 'Fungua Kamera / Chagua Picha' : 'Open Camera / Device Files'}
                    </span>
                    <span className="text-[10px] text-blue-200">
                      Snap live skin condition, eye, or prescription paper
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#64FFDA]">Browse &gt;</span>
              </button>

              {/* Option 2: Quick Clinical Simulation Presets for Live Demo */}
              <div className="space-y-2 pt-2 border-t border-[#1E3A8A]/30">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8892B0] font-bold block">
                  {currentLanguage === 'SW' ? 'Au Chagua Mfano wa Haraka (Presentation Demo):' : 'Or Select Clinical Demo Preset:'}
                </span>

                {[
                  {
                    title: 'Dermatological Skin Rash (Erythema / Mwasho wa Ngozi)',
                    desc: 'Maculopapular rash inspection across forearm',
                    sampleUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=400&auto=format&fit=crop&q=60',
                  },
                  {
                    title: 'Microscopic Blood Smear (Malaria Parasite Slide)',
                    desc: 'Thin & thick Giemsa stained blood film',
                    sampleUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400&auto=format&fit=crop&q=60',
                  },
                  {
                    title: 'Pharmacy Prescription Slip (Cheti cha Dawa)',
                    desc: 'Handwritten medical dosing & anti-malarial regimen',
                    sampleUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=60',
                  },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSimulatedPhoto(sample.title, sample.sampleUrl)}
                    className="w-full p-2.5 rounded-xl bg-[#112240] hover:bg-[#1E3A8A]/50 border border-[#233554] hover:border-[#64FFDA]/50 text-left flex items-center justify-between transition-all group"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#E6F1FF] group-hover:text-[#64FFDA] transition-colors block">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-[#8892B0]">{sample.desc}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0A192F] text-[#64FFDA] border border-[#233554]">
                      Attach
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-2 rounded-xl bg-[#112240] hover:bg-[#1E3A8A] text-[#8892B0] hover:text-[#E6F1FF] text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
