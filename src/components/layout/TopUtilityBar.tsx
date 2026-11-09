import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Bell, ArrowRight, X } from 'lucide-react';
import { SCHOOL_INFO } from '../../data/mockData';
import { Language, SiteSettings } from '../../types';
import { apiService } from '../../services/api';

interface TopUtilityBarProps {
  currentLang?: Language;
  onLangChange?: (lang: Language) => void;
  onNavigate?: (page: string) => void;
  settings?: SiteSettings | null;
}

export const TopUtilityBar: React.FC<TopUtilityBarProps> = ({ 
  onNavigate, 
  settings: initialSettingsProp 
}) => {
  const [settings, setSettings] = useState<SiteSettings | null>(initialSettingsProp || null);
  const [dismissed, setDismissed] = useState(false);

  // Sync when prop changes
  useEffect(() => {
    if (initialSettingsProp) {
      setSettings(initialSettingsProp);
    }
  }, [initialSettingsProp]);

  // Initial fetch and real-time event listener across all tabs & views
  useEffect(() => {
    apiService.getSettings().then((s) => {
      setSettings(s);
    }).catch(() => {});

    const handleSettingsUpdated = (e: Event) => {
      const customEvt = e as CustomEvent<SiteSettings>;
      if (customEvt.detail) {
        setSettings(customEvt.detail);
        setDismissed(false); // Reset dismissed state if admin changed settings
      }
    };

    window.addEventListener('cin:settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('cin:settings-updated', handleSettingsUpdated);
    };
  }, []);

  return (
    <aside aria-label="Informations utiles et annonces de l'établissement">
      {/* Dynamic Announcement Banner if active from Back-Office */}
      {settings?.announcement.enabled && !dismissed && (
        <div 
          className={`py-1.5 px-4 text-xs font-medium text-white flex items-center justify-between transition-colors shadow-xs ${
            settings.announcement.type === 'urgent' ? 'bg-rose-700' :
            settings.announcement.type === 'warning' ? 'bg-amber-600 text-slate-950 font-bold' :
            'bg-blue-900 border-b border-blue-800'
          }`}
        >
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{settings.announcement.text}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {settings.announcement.linkText && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate(settings.announcement.linkUrl || 'pre-registration')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold underline hover:opacity-80 cursor-pointer"
                >
                  <span>{settings.announcement.linkText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="p-0.5 rounded-sm hover:bg-black/20 text-current cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                title="Masquer cette annonce"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Utility Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 border-b border-slate-800 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Contact info & address */}
          <div className="flex items-center gap-5 lg:gap-6">
            <div className="flex items-center gap-1.5 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium truncate">{settings?.contactInfo.address || SCHOOL_INFO.address}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <div className="flex items-center gap-1 font-mono text-[11px] font-semibold">
                <a 
                  href="tel:+50933160934" 
                  className="hover:text-amber-400 transition-colors"
                  title="Appeler le secrétariat (+509 3316-0934)"
                >
                  +509 3316-0934
                </a>
                <span className="text-slate-600 font-sans">/</span>
                <a 
                  href="tel:+50937211818" 
                  className="hover:text-amber-400 transition-colors"
                  title="Appeler le secrétariat (+509 3721-1818)"
                >
                  +509 3721-1818
                </a>
              </div>
            </div>

            <a 
              href={`mailto:${settings?.contactInfo.email || SCHOOL_INFO.email}`} 
              className="flex items-center gap-1.5 hover:text-amber-400 transition-colors hidden lg:flex"
              title="Envoyer un e-mail à l'administration"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>{settings?.contactInfo.email || SCHOOL_INFO.email}</span>
            </a>
          </div>

          {/* Discreet School Motto */}
          <div className="text-[11px] text-slate-400 font-serif italic hidden lg:block">
            « {settings?.schoolMotto || SCHOOL_INFO.founderMotto} »
          </div>

        </div>
      </div>
    </aside>
  );
};
