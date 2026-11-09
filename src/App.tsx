import React, { useState, useEffect } from 'react';
import {
  ChatAttachment,
  ChatMessage,
  Doctor,
  HealthMetricEntry,
  Language,
  SavedConsultation,
  UserProfile,
} from './types';
import {
  initialUserProfile,
  initialSavedConsultations,
  sampleHealthMetrics,
  verifiedDoctors,
} from './data/mockData';
import { sendChatMessageToGemini } from './services/clinicalAiService';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { RegistrationModal } from './components/RegistrationModal';
import { ChatInterface } from './components/ChatInterface';
import { DoctorPaymentModal } from './components/DoctorPaymentModal';
import { DirectCallSimulationModal } from './components/DirectCallSimulationModal';
import { FacilityFinder } from './components/FacilityFinder';
import { HealthTracker } from './components/HealthTracker';
import { ProfileSettings } from './components/ProfileSettings';
import { SecurityLockModal } from './components/SecurityLockModal';
import { NotificationModal, NotificationPreferences } from './components/NotificationModal';
import { NotificationToast, ToastNotification } from './components/NotificationToast';
import { ShareSummaryModal, ConsultationSummaryPayload } from './components/ShareSummaryModal';
import { MedicationTracker } from './components/MedicationTracker';
import { EpidemicSurveillanceDashboard } from './components/EpidemicSurveillanceDashboard';

export default function App() {
  // Application State
  const [currentLanguage, setCurrentLanguage] = useState<Language>('EN');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('vanguard_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialUserProfile,
          ...parsed,
          activeMedications: parsed.activeMedications ?? initialUserProfile.activeMedications,
          knownAllergies: parsed.knownAllergies ?? initialUserProfile.knownAllergies,
          hemoglobinGenotype: parsed.hemoglobinGenotype ?? initialUserProfile.hemoglobinGenotype,
          pastSurgeries: parsed.pastSurgeries ?? initialUserProfile.pastSurgeries,
          specialHealthStatus: parsed.specialHealthStatus?.length ? parsed.specialHealthStatus : initialUserProfile.specialHealthStatus,
        };
      } catch (e) {
        // fallback
      }
    }
    return initialUserProfile;
  });

  // First-time registration modal flag
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(() => {
    const registered = localStorage.getItem('vanguard_registered');
    return registered !== 'true';
  });

  // Navigation Drawer & Tabs
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'doctor' | 'facilities' | 'tracker' | 'profile' | 'medication' | 'surveillance'>('chat');

  // Security & Privacy Lock for Patient Profile & Settings
  const [isProfileUnlocked, setIsProfileUnlocked] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);

  // Doctor Payment & Call Modals
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [callingDoctor, setCallingDoctor] = useState<Doctor | null>(null);

  // Simulated Smart Push Notifications State
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(2);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem('vanguard_notification_prefs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      medicationReminders: true,
      waterAndVitals: true,
      doctorAppointments: true,
    };
  });
  const [activeToast, setActiveToast] = useState<ToastNotification | null>(null);

  // Share Consultation Summary State
  const [shareSummaryData, setShareSummaryData] = useState<ConsultationSummaryPayload | null>(null);

  // Persist notification preferences
  useEffect(() => {
    localStorage.setItem('vanguard_notification_prefs', JSON.stringify(notificationPreferences));
  }, [notificationPreferences]);

  // Handler for Trigger Test Notification (Live Demo)
  const handleTriggerTestNotification = (customType: 'medication' | 'vitals' | 'appointment' = 'medication') => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let title = '';
    let message = '';

    if (customType === 'medication') {
      title =
        currentLanguage === 'SW'
          ? 'Kikumbusho cha Dawa: Dozi ya Asubuhi'
          : 'Medication Alert: Morning Dosage Due';
      message = userProfile.activeMedications
        ? currentLanguage === 'SW'
          ? `Muda wa kumeza dawa yako (${userProfile.activeMedications}) pamoja na glasi ya maji.`
          : `Time to take your scheduled dose: ${userProfile.activeMedications} with clean water.`
        : currentLanguage === 'SW'
        ? 'Muda wa kumeza dawa yako ya asubuhi. Zingatia kutumia baada ya chakula.'
        : 'Time to take your prescribed morning medication. Ensure taken after food.';
    } else if (customType === 'vitals') {
      title =
        currentLanguage === 'SW'
          ? 'Kiwango cha Maji na Shinikizo la Damu'
          : 'Daily Water & Vitals Check-in';
      message =
        currentLanguage === 'SW'
          ? 'Hali ya hewa Dar es Salaam ni joto: Kunywa glasi 1 ya maji safi na kagua BP yako.'
          : 'Coastal humidity is high: Drink 1 glass of water now to maintain optimal hydration.';
    } else {
      title =
        currentLanguage === 'SW'
          ? 'Miadi ya Daktari: Dk. Mwana Kalili'
          : 'Doctor Appointment Alert: Online';
      message =
        currentLanguage === 'SW'
          ? 'Daktari wako yuko hewani na anapatikana kwa mashauriano ya moja kwa moja.'
          : 'Dr. Mwana Kalili is currently online and ready for your tele-consultation.';
    }

    const newToast: ToastNotification = {
      id: `toast-${Date.now()}`,
      title,
      message,
      type: customType,
      timestamp: timeNow,
    };

    setActiveToast(newToast);
    setUnreadNotificationCount((prev) => prev + 1);
  };

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Health Metrics State
  const [metrics, setMetrics] = useState<HealthMetricEntry[]>(() => {
    const saved = localStorage.getItem('vanguard_health_metrics');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return sampleHealthMetrics;
  });

  // Saved Consultations Ledger State
  const [savedConsultations, setSavedConsultations] = useState<SavedConsultation[]>(() => {
    const saved = localStorage.getItem('vanguard_saved_consultations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return initialSavedConsultations;
  });

  // Persist user profile
  useEffect(() => {
    localStorage.setItem('vanguard_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Persist metrics
  useEffect(() => {
    localStorage.setItem('vanguard_health_metrics', JSON.stringify(metrics));
  }, [metrics]);

  // Persist saved consultations
  useEffect(() => {
    localStorage.setItem('vanguard_saved_consultations', JSON.stringify(savedConsultations));
  }, [savedConsultations]);

  // Language Toggle
  const handleToggleLanguage = () => {
    setCurrentLanguage((prev) => (prev === 'EN' ? 'SW' : 'EN'));
  };

  // Save Registration Profile
  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('vanguard_registered', 'true');
    setShowRegistrationModal(false);
  };

  // Add Health Metric Entry
  const handleAddMetric = (newEntry: HealthMetricEntry) => {
    setMetrics([newEntry, ...metrics]);
  };

  // Chat message handling with live dynamic Gemini AI generation and automatic logging
  const handleSendMessage = async (text: string, attachment?: ChatAttachment) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowTime,
      language: currentLanguage,
      attachment,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsAiTyping(true);

    try {
      const promptWithAttachment = attachment
        ? `${text}\n[Attached Patient ${attachment.type === 'image' ? 'Clinical Image' : 'Document'}: ${attachment.name}]`
        : text;

      const clinicalReply = await sendChatMessageToGemini(
        promptWithAttachment,
        messages,
        userProfile,
        currentLanguage
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: clinicalReply.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguage,
        assessment: clinicalReply.assessment,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Automatic chat history logging under "Saved Consultations"
      const newConsultation: SavedConsultation = {
        id: `cons-${Date.now()}`,
        date:
          new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }) + ` - ${nowTime} EAT`,
        title: text.length > 40 ? text.slice(0, 40) + '...' : text,
        chiefComplaint: text,
        symptomsTags: [
          clinicalReply.assessment?.severity === 'urgent' ? 'High Urgency' : 'Standard Triage',
          currentLanguage === 'EN' ? 'English Consultation' : 'Ushauri wa Kiswahili',
          userProfile.chronicConditions[0] || 'General Health',
        ],
        severity: clinicalReply.assessment?.severity || 'moderate',
        messages: [userMessage, aiMessage],
        outcomeSummary: clinicalReply.assessment?.summary || 'Clinical inquiry answered.',
      };

      setSavedConsultations((prev) => [newConsultation, ...prev]);
    } catch (err: any) {
      console.error('Error fetching live Gemini response:', err);
      const fallbackAiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: `Habari ${userProfile.fullName?.split(' ')[0] || 'Victor'}. Vanguard Clinical AI had difficulty reaching the live Gemini model engine: ${err.message || 'Network latency'}.\n\nTafadhali jaribu tena au wasiliana moja kwa moja na daktari wetu hewani.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: currentLanguage,
        assessment: {
          severity: 'moderate',
          summary: 'Service connectivity alert during live model consultation.',
          steps: [
            'Check internet connection and send prompt again',
            'Connect with our General Practitioner Dr. Mwana Kalili via Direct Call',
            'For urgent emergencies, call 112 / 115 immediately',
          ],
          emergencyWarning: 'Katika dharura yoyote ya kiafya, piga 112 / 115 mara moja au fika Muhimbili Hospital.',
          suggestedAction: 'call_doctor',
        },
      };
      setMessages((prev) => [...prev, fallbackAiMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Clear / Reset Chat
  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-[#0A192F] text-[#E6F1FF] flex flex-col font-sans selection:bg-[#64FFDA] selection:text-[#0A192F]">
      {/* Top Application Header */}
      <Header
        currentLanguage={currentLanguage}
        onToggleLanguage={handleToggleLanguage}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
        onOpenNotifications={() => {
          setIsNotificationModalOpen(true);
          setUnreadNotificationCount(0);
        }}
        unreadNotificationCount={unreadNotificationCount}
        userProfile={userProfile}
        activeTab={activeTab}
        onGoHome={() => setActiveTab('chat')}
      />

      {/* Main Module Content based on active navigation */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onOpenDoctorModal={() => setIsDoctorModalOpen(true)}
            onNavigateToFacilities={() => setActiveTab('facilities')}
            onNavigateToTracker={() => setActiveTab('tracker')}
            onClearChat={handleClearChat}
            onOpenShareModal={(payload) => setShareSummaryData(payload)}
            userProfile={userProfile}
            currentLanguage={currentLanguage}
            isAiTyping={isAiTyping}
          />
        )}

        {activeTab === 'doctor' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <DoctorPaymentModal
              isOpen={true}
              onClose={() => setActiveTab('chat')}
              currentLanguage={currentLanguage}
              userProfile={userProfile}
              onStartCall={(doc) => setCallingDoctor(doc)}
            />
          </div>
        )}

        {activeTab === 'facilities' && (
          <FacilityFinder
            currentLanguage={currentLanguage}
            userProfile={userProfile}
            onGoHome={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'medication' && (
          <MedicationTracker
            userProfile={userProfile}
            currentLanguage={currentLanguage}
            onGoHome={() => setActiveTab('chat')}
            onTriggerGlobalToast={(title, message, type) => {
              setActiveToast({
                id: `toast-${Date.now()}`,
                title,
                message,
                type,
                timestamp: 'Now',
              });
              setUnreadNotificationCount((prev) => prev + 1);
            }}
          />
        )}

        {activeTab === 'surveillance' && (
          <EpidemicSurveillanceDashboard
            currentLanguage={currentLanguage}
            onGoHome={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'tracker' && (
          <HealthTracker
            metrics={metrics}
            onAddMetric={handleAddMetric}
            savedConsultations={savedConsultations}
            currentLanguage={currentLanguage}
            userProfile={userProfile}
            onOpenShareModal={(payload) => setShareSummaryData(payload)}
            onGoHome={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileSettings
            userProfile={userProfile}
            onUpdateProfile={setUserProfile}
            currentLanguage={currentLanguage}
            onGoHome={() => setActiveTab('chat')}
            onLockProfile={() => {
              setIsProfileUnlocked(false);
              setActiveTab('chat');
            }}
          />
        )}
      </main>

      {/* Slide-over Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'profile') {
            if (!isProfileUnlocked) {
              setIsSecurityModalOpen(true);
              return;
            }
          }
          setActiveTab(tab);
          if (tab === 'doctor') {
            setIsDoctorModalOpen(true);
          }
        }}
        userProfile={userProfile}
        currentLanguage={currentLanguage}
      />

      {/* Security & Privacy Lock Modal for Patient Profile & Settings */}
      <SecurityLockModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onSuccess={() => {
          setIsProfileUnlocked(true);
          setIsSecurityModalOpen(false);
          setActiveTab('profile');
        }}
        currentLanguage={currentLanguage}
        userProfile={userProfile}
      />

      {/* First-Time User Registration Modal */}
      <RegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={userProfile}
        currentLanguage={currentLanguage}
      />

      {/* Standalone Doctor Telemedicine Payment Flow Modal (if opened from header or chat) */}
      <DoctorPaymentModal
        isOpen={isDoctorModalOpen && activeTab !== 'doctor'}
        onClose={() => setIsDoctorModalOpen(false)}
        currentLanguage={currentLanguage}
        userProfile={userProfile}
        onStartCall={(doc) => setCallingDoctor(doc)}
      />

      {/* Doctor Call Simulation Modal */}
      {callingDoctor && (
        <DirectCallSimulationModal
          isOpen={true}
          onClose={() => setCallingDoctor(null)}
          doctor={callingDoctor}
          userProfile={userProfile}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Simulated Smart Push Notifications Modal & Settings */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        currentLanguage={currentLanguage}
        userProfile={userProfile}
        preferences={notificationPreferences}
        onUpdatePreferences={setNotificationPreferences}
        onTriggerTestNotification={handleTriggerTestNotification}
      />

      {/* Share / Export Consultation Summary Modal ("Shiriki Mjadala") */}
      <ShareSummaryModal
        isOpen={!!shareSummaryData}
        onClose={() => setShareSummaryData(null)}
        summaryData={shareSummaryData}
        currentLanguage={currentLanguage}
      />

      {/* Realistic Sliding Top-Right Push Notification Toast */}
      <NotificationToast
        notification={activeToast}
        onClose={() => setActiveToast(null)}
      />
    </div>
  );
}
