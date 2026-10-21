import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Clock, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  GraduationCap, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  X
} from 'lucide-react';
import { SiteSettings, AdmissionRequirementsConfig, User } from '../../types';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { DEFAULT_ADMISSION_REQUIREMENTS } from '../../data/mockData';

interface AdmissionsRequirementsEditorViewProps {
  currentUser?: User | null;
  onNavigateToPublicAdmissions?: () => void;
}

const DEFAULT_REQUIREMENTS: AdmissionRequirementsConfig = DEFAULT_ADMISSION_REQUIREMENTS;

export const AdmissionsRequirementsEditorView: React.FC<AdmissionsRequirementsEditorViewProps> = ({
  currentUser,
  onNavigateToPublicAdmissions
}) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [config, setConfig] = useState<AdmissionRequirementsConfig>(DEFAULT_REQUIREMENTS);

  // Temporary inputs to add items
  const [newFondamentaleDoc, setNewFondamentaleDoc] = useState('');
  const [newSecondaireDoc, setNewSecondaireDoc] = useState('');
  const [newAdditionalDoc, setNewAdditionalDoc] = useState('');
  const [newLevel, setNewLevel] = useState('');

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getSettings();
      setSettings(data);
      if (data?.admissionRequirements) {
        setConfig(data.admissionRequirements);
      }
    } catch (e: any) {
      toast.error('Erreur lors du chargement des critères d’admission : ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Save Settings
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const currentSettings = settings || (await apiService.getSettings());
      const updatedConfig: AdmissionRequirementsConfig = {
        ...config,
        updatedAt: new Date().toISOString()
      };

      const newSettings: SiteSettings = {
        ...currentSettings,
        admissionRequirements: updatedConfig
      };

      const saved = await apiService.updateSettings(newSettings);
      setSettings(saved);
      setConfig(updatedConfig);
      toast.success('Conditions, pièces et tarifs d’admission enregistrés avec succès !');
      window.dispatchEvent(new CustomEvent('cin:settings-updated', { detail: newSettings }));
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde : ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Item Helpers
  const addFondamentaleDoc = () => {
    if (!newFondamentaleDoc.trim()) return;
    setConfig(prev => ({
      ...prev,
      fondamentaleDocuments: [...prev.fondamentaleDocuments, newFondamentaleDoc.trim()]
    }));
    setNewFondamentaleDoc('');
  };

  const removeFondamentaleDoc = (index: number) => {
    setConfig(prev => ({
      ...prev,
      fondamentaleDocuments: prev.fondamentaleDocuments.filter((_, i) => i !== index)
    }));
  };

  const addSecondaireDoc = () => {
    if (!newSecondaireDoc.trim()) return;
    setConfig(prev => ({
      ...prev,
      secondaireDocuments: [...prev.secondaireDocuments, newSecondaireDoc.trim()]
    }));
    setNewSecondaireDoc('');
  };

  const removeSecondaireDoc = (index: number) => {
    setConfig(prev => ({
      ...prev,
      secondaireDocuments: prev.secondaireDocuments.filter((_, i) => i !== index)
    }));
  };

  const addAdditionalDoc = () => {
    if (!newAdditionalDoc.trim()) return;
    setConfig(prev => ({
      ...prev,
      additionalDocuments: [...prev.additionalDocuments, newAdditionalDoc.trim()]
    }));
    setNewAdditionalDoc('');
  };

  const removeAdditionalDoc = (index: number) => {
    setConfig(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
    }));
  };

  const addLevel = () => {
    if (!newLevel.trim()) return;
    setConfig(prev => ({
      ...prev,
      levelsConcerned: [...prev.levelsConcerned, newLevel.trim()]
    }));
    setNewLevel('');
  };

  const removeLevel = (index: number) => {
    setConfig(prev => ({
      ...prev,
      levelsConcerned: prev.levelsConcerned.filter((_, i) => i !== index)
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm('Rétablir la transcription officielle validée 2026-2027 ?')) {
      setConfig(DEFAULT_REQUIREMENTS);
      toast.info('Critères réinitialisés à la version officielle 2026-2027. Cliquez sur Enregistrer pour confirmer.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-900 text-amber-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                Conditions d'Admission, Pièces Exigées & Tarifs
              </h2>
              <p className="text-xs text-slate-500">
                Ces informations alimentent en temps réel la page publique « Admissions &gt; Conditions &amp; Pièces à fournir ».
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Rétablir le modèle standard"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              <span>Rétablir standard</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Enregistrer les critères</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Global Criteria Form (Hours, Fee, Presence Notice, Academic Year) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-900" />
          <span>Paramètres Généraux de la Campagne d'Inscription</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Année Académique :
            </label>
            <input
              type="text"
              value={config.academicYear}
              onChange={(e) => setConfig({ ...config, academicYear: e.target.value })}
              placeholder="Ex : 2026-2027"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-mono font-bold focus:bg-white focus:border-blue-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Frais d'inscription officiel (Gourdes) :
            </label>
            <input
              type="text"
              value={config.registrationFee}
              onChange={(e) => setConfig({ ...config, registrationFee: e.target.value })}
              placeholder="Ex : 3 000 gourdes"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-blue-900 focus:bg-white focus:border-blue-900"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Horaires d'inscription :
            </label>
            <input
              type="text"
              value={config.openingHours}
              onChange={(e) => setConfig({ ...config, openingHours: e.target.value })}
              placeholder="Ex : Inscriptions du lundi au vendredi, de 8 h à 15 h"
              className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium focus:bg-white focus:border-blue-900"
            />
          </div>

        </div>

        {/* Consigne impérative de présence de l'enfant */}
        <div className="pt-2">
          <label className="font-bold text-slate-700 block mb-1 text-xs">
            Consigne impérative de présence :
          </label>
          <input
            type="text"
            value={config.presenceRequiredNotice}
            onChange={(e) => setConfig({ ...config, presenceRequiredNotice: e.target.value })}
            placeholder="Ex : L'enfant doit être présent lors de l'inscription."
            className="w-full py-2 px-3 rounded-xl bg-amber-50/60 border border-amber-300 text-xs sm:text-sm text-slate-900 font-medium focus:bg-white focus:border-amber-500"
          />
        </div>

        {/* Niveaux Concernés */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <label className="font-bold text-slate-700 block text-xs">
            Niveaux d'enseignement concernés :
          </label>
          <div className="flex flex-wrap gap-2">
            {config.levelsConcerned.map((lvl, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
                <span>{lvl}</span>
                <button
                  type="button"
                  onClick={() => removeLevel(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-1 max-w-md">
            <input
              type="text"
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLevel())}
              placeholder="Ajouter un niveau (ex: Préscolaire...)"
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
            <button
              type="button"
              onClick={addLevel}
              className="px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        </div>

      </div>

      {/* 3. Section Fondamentale vs Section Secondaire (Lists of Required Documents) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Section Fondamentale */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Section Fondamentale (1ère - 9ème AF)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {config.fondamentaleDocuments.length} pièce(s)
            </span>
          </div>

          <ol className="space-y-2">
            {config.fondamentaleDocuments.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                <span className="w-5 h-5 rounded-md bg-blue-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 pt-0.5">{doc}</span>
                <button
                  type="button"
                  onClick={() => removeFondamentaleDoc(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>

          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={newFondamentaleDoc}
              onChange={(e) => setNewFondamentaleDoc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFondamentaleDoc())}
              placeholder="Ex : Fiche médicale à jour..."
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
            <button
              type="button"
              onClick={addFondamentaleDoc}
              className="px-3 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors cursor-pointer shrink-0"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Section Secondaire */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-700" />
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Section Secondaire (NS1 - NS4)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-bold">
              {config.secondaireDocuments.length} pièce(s)
            </span>
          </div>

          <ol className="space-y-2">
            {config.secondaireDocuments.map((doc, idx) => (
              <li key={idx} className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                <span className="w-5 h-5 rounded-md bg-purple-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 pt-0.5">{doc}</span>
                <button
                  type="button"
                  onClick={() => removeSecondaireDoc(idx)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ol>

          <div className="pt-2 flex gap-2">
            <input
              type="text"
              value={newSecondaireDoc}
              onChange={(e) => setNewSecondaireDoc(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSecondaireDoc())}
              placeholder="Ex : Extrait d'acte de naissance..."
              className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
            />
            <button
              type="button"
              onClick={addSecondaireDoc}
              className="px-3 py-1.5 rounded-xl bg-purple-900 text-white text-xs font-bold hover:bg-purple-950 transition-colors cursor-pointer shrink-0"
            >
              Ajouter
            </button>
          </div>
        </div>

      </div>

      {/* 4. Pièces Additionnelles Exigibles (NS2/NS3, 9e AF, NSU...) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Pièces Additionnelles Exigibles (Secondaire & Examens d'État)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">
            {config.additionalDocuments.length} exigence(s)
          </span>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {config.additionalDocuments.map((doc, idx) => (
            <li key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 font-medium">
              <span className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{doc}</span>
              </span>
              <button
                type="button"
                onClick={() => removeAdditionalDoc(idx)}
                className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="pt-2 flex gap-2 max-w-lg">
          <input
            type="text"
            value={newAdditionalDoc}
            onChange={(e) => setNewAdditionalDoc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAdditionalDoc())}
            placeholder="Ex : Relevé officiel de notes..."
            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
          />
          <button
            type="button"
            onClick={addAdditionalDoc}
            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors cursor-pointer shrink-0"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* 5. Bottom Save Confirmation Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="space-y-0.5 text-center sm:text-left">
          <p className="font-bold text-xs sm:text-sm text-white">
            Enregistrer les modifications pour {config.academicYear}
          </p>
          <p className="text-[11px] text-slate-400">
            Toutes les modifications prennent effet immédiatement sur la page publique d'admission.
          </p>
        </div>

        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave()}
          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Valider & Publier les Critères</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
