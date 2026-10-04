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

import { User, Language } from './types';
import { apiService } from './services/api';
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

  useEffect(() => {
    // Restore user session if present
    const user = apiService.getCurrentUser();
    if (user) setCurrentUser(user);
  }, []);

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
          />
        )}

        {currentPage === 'programs' && (
          <ProgramsPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admissions' && (
          <AdmissionsPage
            subSection={currentSubSection}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'pre-registration' && (
          <PreRegistrationPage
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'school-life' && (
          <SchoolLifePage
            onNavigate={handleNavigate}
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
          <ContactPage />
        )}

        {currentPage === 'support' && (
          <SupportPage onNavigate={handleNavigate} />
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
      />

      {/* Dynamic Floating WhatsApp Quick Contact Button */}
      <WhatsAppFloatingButton />

      {/* Floating Formatting Toolbar & Admin Inline Editor Toggle (Visible only to authorized admins) */}
      <FloatingEditorToolbar currentUser={currentUser} />

      {/* Global Toast Notifications Provider (Sonner) */}
      <Toaster richColors position="top-right" closeButton />

    </div>
    </ContentBlockProvider>
  );
}
