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
} from 'lucide-react';
import { ChatMessage, Language, UserProfile } from '../types';
import { translations } from '../data/mockData';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenDoctorModal: () => void;
  onNavigateToFacilities: () => void;
  onNavigateToTracker: () => void;
  onClearChat: () => void;
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

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    
    // Stop listening if sending
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    onSendMessage(inputText.trim());
    setInputText('');
    setInterimText('');
  };

  const handleChipClick = (prompt: string) => {
    onSendMessage(prompt);
  };

  // Browser SpeechRecognition API Integration
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

    // Fallback if browser doesn't support Web Speech API
    if (!SpeechRecognition) {
      setIsListening(true);
      setSpeechFeedback(
        currentLanguage === 'SW'
          ? 'Maikrofoni ya Kivinjari: Sema dalili zako (Kielelezo cha sauti)...'
          : 'Browser Voice Simulation: Speak your symptoms...'
      );

      const demoPrompt =
        currentLanguage === 'SW'
          ? 'Nina maumivu makali ya kichwa na homa kali tangu asubuhi'
          : 'I have severe malaria symptoms with high fever and chills since morning';

      setTimeout(() => {
        setInputText(demoPrompt);
        setIsListening(false);
        setSpeechFeedback(null);
      }, 2000);
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
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
        setInterimText('');

        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          setSpeechError(
            currentLanguage === 'SW'
              ? 'Ruhusa ya maikrofoni imekataliwa. Tafadhali ruhusu maikrofoni kwenye kivinjari chako.'
              : 'Microphone access denied. Please enable microphone permissions in your browser settings.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechFeedback(
            currentLanguage === 'SW'
              ? 'Sauti haijasikika. Bonyeza maikrofoni na uongee tena.'
              : 'No speech detected. Please tap mic and speak clearly.'
          );
          setTimeout(() => setSpeechFeedback(null), 3000);
        } else if (event.error === 'network') {
          setSpeechError(
            currentLanguage === 'SW'
              ? 'Hitilafu ya mtandao katika utambuzi wa sauti. Jaribu tena.'
              : 'Network error occurred during speech recognition. Please try again.'
          );
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
        // Keep active prompt message for 1 second then clear
        setTimeout(() => {
          setSpeechFeedback((prev) => (prev?.includes('Inasikiliza') || prev?.includes('Listening') ? null : prev));
        }, 1200);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Error starting SpeechRecognition:', err);
      setIsListening(false);
      setSpeechError(err.message || 'Could not start speech recognition');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-62px)] relative bg-[#0A192F] overflow-hidden">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-36">
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

            {/* Quick Suggestion Chips (Horizontal rounded pills) */}
            <div className="w-full max-w-2xl space-y-3">
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
                        </div>
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

      {/* BOTTOM-FIXED ROUNDED INPUT BAR (GEMINI-STYLE) */}
      <div className="fixed bottom-0 left-0 right-0 z-20 p-3 sm:p-5 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          {/* Speech Recognition Error Notice */}
          {speechError && (
            <div className="mb-2 p-2.5 px-4 rounded-2xl bg-rose-950/90 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between shadow-lg backdrop-blur-md animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-[11px] text-[#8892B0] hover:text-white px-1.5 py-0.5 rounded"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Voice Listening Feedback Alert with Live Audio Waveform */}
          {(isListening || speechFeedback) && (
            <div className="mb-2 p-2.5 px-4 rounded-2xl bg-[#112240]/95 border-2 border-[#64FFDA]/60 text-xs text-[#64FFDA] flex items-center justify-between shadow-2xl backdrop-blur-md animate-fade-in">
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

          {/* Heavily rounded pill input bar */}
          <form
            onSubmit={handleSend}
            className={`relative flex items-center w-full bg-[#112240] border transition-all duration-300 pl-3 pr-2 py-1.5 rounded-full shadow-2xl backdrop-blur-md ${
              isListening
                ? 'border-[#64FFDA] ring-2 ring-[#64FFDA]/30 shadow-[#64FFDA]/10'
                : 'border-[#233554] hover:border-[#2563EB]/70 focus-within:border-[#64FFDA] focus-within:ring-2 focus-within:ring-[#64FFDA]/30'
            }`}
          >
            {/* Voice Recognition Button (Speech-to-Text) */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2.5 rounded-full transition-all flex items-center justify-center shrink-0 relative group ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500 shadow-md shadow-rose-500/20 animate-pulse'
                  : 'text-[#8892B0] hover:text-[#64FFDA] hover:bg-[#1E3A8A]/40'
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

            {/* Main Text Input with live interim preview */}
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
                  : t.inputPlaceholder
              }
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#E6F1FF] placeholder-[#8892B0] focus:outline-none"
            />

            {/* Send Button ➤ */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-full transition-all duration-200 shrink-0 flex items-center justify-center ${
                inputText.trim()
                  ? 'bg-gradient-to-r from-[#64FFDA] to-[#38bdf8] text-[#0A192F] shadow-lg shadow-[#64FFDA]/25 hover:scale-105 active:scale-95'
                  : 'text-zinc-600 bg-transparent cursor-not-allowed opacity-40'
              }`}
              title={t.send}
            >
              <Send className="w-4 h-4 translate-x-0.5" />
            </button>
          </form>

          <p className="text-[10px] text-center text-[#8892B0]/80 mt-1.5">
            Vanguard AI aids preliminary triage. In life-threatening emergencies, dial 112 / 115 immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
