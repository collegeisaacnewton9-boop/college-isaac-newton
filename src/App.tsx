/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopUtilityBar } from './components/layout/TopUtilityBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { WhatsAppFloatingButton } from './components/ui/WhatsAppFloatingButton';
import { GlobalTopLoadingBar } from './components/layout/GlobalTopLoadingBar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { DynamicMetaTags } from './components/seo/DynamicMetaTags';
import { loadingService } from './services/loadingService';

import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProgramsPage } from './pages/ProgramsPage';
import { AdmissionsPage } from './pages/AdmissionsPage';
import { PreRegistrationPage } from './pages/PreRegistrationPage';
import { SchoolLifePage } from './pages/SchoolLifePage';
import { NewsPage } from './pages/NewsPage';
import { EventsPage } from './pages/EventsPage';
import { GalleryPage } from './pages/GalleryPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ContactPage } from './pages/ContactPage';
import { SupportPage } from './pages/SupportPage';
import { LegalPage } from './pages/LegalPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

import { User, Language, SchoolEvent } from './types';
import { apiService } from './services/api';
import { eventNotificationService } from './services/eventNotificationService';
import { EventLastMinuteModal } from './components/events/EventLastMinuteModal';
import { Toaster } from 'sonner';
import { ContentBlockProvider } from './context/ContentBlockContext';
import { FloatingEditorToolbar } from './components/common/FloatingEditorToolbar';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [currentSubSection, setCurrentSubSection] = useState<string | undefined>(undefined);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [langNotice, setLangNotice] = useState<string | null>(null);

  // Global Event Last-Minute Update & Reminder Modal state
  const [lastMinuteModalEvent, setLastMinuteModalEvent] = useState<SchoolEvent | null>(null);
  const [isLastMinuteModalOpen, setIsLastMinuteModalOpen] = useState<boolean>(false);
  const [lastMinuteModalTab, setLastMinuteModalTab] = useState<'reminder' | 'edit'>('reminder');

  useEffect(() => {
    // Restore user session if present
    const user = apiService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

  // Automated notification system for events within 48h of expiration / start
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const runAutomatedNotificationCheck = async (force = false) => {
      try {
        const evts = await apiService.getEvents();
        if (!evts || evts.length === 0) return;
        const isAdmin = currentUser?.role === 'ADMIN' || (currentUser?.role as string) === 'SUPER_ADMIN';

        eventNotificationService.checkAndNotifyImminentEvents(evts, {
          isAdmin,
          force,
          onQuickUpdate: (evt) => {
            setLastMinuteModalEvent(evt);
            setLastMinuteModalTab(isAdmin ? 'edit' : 'reminder');
            setIsLastMinuteModalOpen(true);
          },
          onSendReminder: (evt) => {
            setLastMinuteModalEvent(evt);
            setLastMinuteModalTab('reminder');
            setIsLastMinuteModalOpen(true);
          },
        });
      } catch {
        // Non-blocking in case of offline/network hiccup
      }
    };

    // Initial check on mount or when user role changes
    runAutomatedNotificationCheck();

    // Recurring automated check every 5 minutes in background
    intervalId = setInterval(() => {
      runAutomatedNotificationCheck(false);
    }, 5 * 60 * 1000);

    // Re-check when user focuses window
    const handleFocus = () => {
      runAutomatedNotificationCheck(false);
    };
    window.addEventListener('focus', handleFocus);

    // Re-check when events are modified/added
    const handleEventsUpdated = () => {
      runAutomatedNotificationCheck(false);
    };
    window.addEventListener('cin:events-updated', handleEventsUpdated);

    // Listener for explicit requests to open the last-minute modal
    const handleOpenLastMinute = (e: any) => {
      if (e.detail?.event) {
        setLastMinuteModalEvent(e.detail.event);
        setLastMinuteModalTab(e.detail.tab || (currentUser?.role === 'ADMIN' ? 'edit' : 'reminder'));
        setIsLastMinuteModalOpen(true);
      }
    };
    window.addEventListener('cin:open-event-last-minute', handleOpenLastMinute);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cin:events-updated', handleEventsUpdated);
      window.removeEventListener('cin:open-event-last-minute', handleOpenLastMinute);
    };
  }, [currentUser]);

  const handleNavigate = (page: string, subSection?: string) => {
    loadingService.triggerPageTransition();
    setCurrentPage(page);
    setCurrentSubSection(subSection);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (articleId: string) => {
    loadingService.triggerPageTransition();
    setSelectedArticleId(articleId);
    setCurrentPage('news');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    if (lang === 'ht') {
      setLangNotice('Kreyòl Ayisyen : Byenvini sou sit ofisyèl Kolèj Isaac Newton — « Konnen jodi a, reyisi demen ».');
    } else if (lang === 'en') {
      setLangNotice('English: Welcome to the official portal of Isaac Newton College — "Know today, succeed tomorrow".');
    } else {
      setLangNotice(null);
    }

    if (lang !== 'fr') {
      setTimeout(() => setLangNotice(null), 6000);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    setCurrentUser(null);
    handleNavigate('home');
  };

  return (
    <ContentBlockProvider currentUser={currentUser}>
      <div className="min-h-screen flex flex-col bg-stone-50 text-slate-800 font-sans selection:bg-blue-900 selection:text-white relative">
      
      {/* Dynamic SEO Meta Tags & Schema.org Structured Data */}
      <DynamicMetaTags
        currentPage={currentPage}
        selectedArticleId={selectedArticleId}
      />

      {/* Global Top Viewport Loading Bar (Page transitions & API requests) */}
      <GlobalTopLoadingBar />
      
      {/* Multilingual Notice Ribbon (when switching to Creole or English) */}
      {langNotice && (
        <div className="bg-amber-400 text-slate-950 text-xs font-semibold py-2 px-4 text-center border-b border-amber-500 shadow-sm animate-in slide-in-from-top duration-200">
          <span>{langNotice}</span>
        </div>
      )}

      {/* Top Utility Ribbon */}
      <TopUtilityBar
        currentLang={currentLang}
        onLangChange={handleLangChange}
        onNavigate={handleNavigate}
      />

      {/* Fixed Sticky Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSelectArticle={handleSelectArticle}
      />

      {/* Dynamic Breadcrumb Navigation Trail & SEO Structured Data */}
      <Breadcrumbs
        currentPage={currentPage}
        currentSubSection={currentSubSection}
        selectedArticleId={selectedArticleId}
        onNavigate={handleNavigate}
      />

      {/* Main Page Content */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectArticle={handleSelectArticle}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'college' && (
          <AboutPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'programs' && (
          <ProgramsPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'admissions' && (
          <AdmissionsPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'pre-registration' && (
          <PreRegistrationPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'school-life' && (
          <SchoolLifePage
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'news' && (
          <NewsPage
            selectedArticleId={selectedArticleId}
            onClearSelectedArticle={() => setSelectedArticleId(null)}
          />
        )}

        {currentPage === 'events' && (
          <EventsPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'gallery' && (
          <GalleryPage currentUser={currentUser} />
        )}

        {currentPage === 'resources' && (
          <ResourcesPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'contact' && (
          <ContactPage
            currentUser={currentUser}
          />
        )}

        {currentPage === 'support' && (
          <SupportPage
            onNavigate={handleNavigate}
            currentUser={currentUser}
          />
        )}

        {currentPage === 'legal' && (
          <LegalPage />
        )}

        {currentPage === 'privacy' && (
          <PrivacyPage />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            currentUser={currentUser}
            onOpenAuth={() => setIsAuthOpen(true)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onUserChange={setCurrentUser}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Auth & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        onNavigateToAdmin={() => handleNavigate('admin')}
        onNavigate={handleNavigate}
      />

      {/* Unified Dynamic Floating Action Dock (WhatsApp Quick Contact & Scroll Navigation) */}
      <WhatsAppFloatingButton />

      {/* Floating Formatting Toolbar & Admin Inline Editor Toggle (Visible only to authorized admins) */}
      <FloatingEditorToolbar currentUser={currentUser} />

      {/* Global Event Last-Minute Update & Reminder Modal */}
      <EventLastMinuteModal
        isOpen={isLastMinuteModalOpen}
        onClose={() => setIsLastMinuteModalOpen(false)}
        event={lastMinuteModalEvent}
        isAdmin={currentUser?.role === 'ADMIN' || (currentUser?.role as string) === 'SUPER_ADMIN'}
        defaultTab={lastMinuteModalTab}
        onEventUpdated={(updated) => {
          setLastMinuteModalEvent(updated);
        }}
      />

      {/* Global Toast Notifications Provider (Sonner) */}
      <Toaster richColors position="top-right" closeButton />

    </div>
    </ContentBlockProvider>
  );
}
