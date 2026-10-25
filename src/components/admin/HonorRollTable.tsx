import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
  Sparkles, 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  Printer, 
  Search, 
  Filter, 
  Check, 
  X, 
  Loader2, 
  FileDown, 
  RefreshCw, 
  Star, 
  TrendingUp, 
  BookOpen, 
  HeartHandshake, 
  Eye,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { HonorRollStudent, HonorDistinctionType } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_HONOR_ROLL } from '../../data/mockData';
import { officialDocumentsPdfService } from '../../services/officialDocumentsPdfService';
import { HonorDiplomaModal } from '../honor/HonorDiplomaModal';
import { toast } from 'sonner';

const AVAILABLE_CLASSES = [
  '7ème Année Fondamentale',
  '8ème Année Fondamentale',
  '9ème Année Fondamentale',
  'Nouveau Secondaire 1 (NS1)',
  'Nouveau Secondaire 2 (NS2)',
  'Nouveau Secondaire 3 (NS3 - LLA)',
  'Nouveau Secondaire 3 (NS3 - SMP)',
  'Nouveau Secondaire 4 (NS4 - Terminale SVT)',
  'Nouveau Secondaire 4 (NS4 - Terminale SMP)',
  'Nouveau Secondaire 4 (NS4 - Terminale SES)',
];

const AVAILABLE_PERIODS = [
  '1er Contrôle Officiel',
  '2e Contrôle Officiel',
  '3e Contrôle Officiel',
  '4e Contrôle / Bilan Annuel',
];

export const HonorRollTable: React.FC = () => {
  const [students, setStudents] = useState<HonorRollStudent[]>(INITIAL_HONOR_ROLL);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedDistinction, setSelectedDistinction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Export & download states
  const [isExportingTable, setIsExportingTable] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modal d'ajout / édition
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<HonorRollStudent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal d'aperçu de diplôme individuel
  const [previewStudent, setPreviewStudent] = useState<HonorRollStudent | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<'M' | 'F'>('M');
  const [formClass, setFormClass] = useState(AVAILABLE_CLASSES[0]);
  const [formPeriod, setFormPeriod] = useState(AVAILABLE_PERIODS[0]);
  const [formAverage, setFormAverage] = useState<number>(8.5);
  const [formMaxScale, setFormMaxScale] = useState<number>(10);
  const [formRank, setFormRank] = useState<number>(1);
  const [formTotalInClass, setFormTotalInClass] = useState<number>(30);
  const [formDistinction, setFormDistinction] = useState<HonorDistinctionType>('FELICITATIONS');
  const [formCitation, setFormCitation] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formIsPublic, setFormIsPublic] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getHonorRoll();
      if (Array.isArray(data)) {
        setStudents(data);
      }
    } catch {
      toast.error('Erreur lors du chargement du tableau d’honneur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();

    const handleUpdate = () => {
      fetchStudents();
    };

    window.addEventListener('cin:honor-roll-updated', handleUpdate);
    return () => window.removeEventListener('cin:honor-roll-updated', handleUpdate);
  }, []);

  // Synchronise maxScale selon la classe
  const handleClassChange = (newClass: string) => {
    setFormClass(newClass);
    const isSec = newClass.toLowerCase().includes('secondaire') || newClass.toLowerCase().includes('ns');
    if (isSec) {
      setFormMaxScale(100);
      if (formAverage <= 10) setFormAverage(formAverage * 10);
    } else {
      setFormMaxScale(10);
      if (formAverage > 10) setFormAverage(Math.round(formAverage / 10 * 100) / 100);
    }
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormName('');
    setFormGender('M');
    setFormClass(AVAILABLE_CLASSES[0]);
    setFormPeriod(AVAILABLE_PERIODS[0]);
    setFormAverage(8.5);
    setFormMaxScale(10);
    setFormRank(1);
    setFormTotalInClass(30);
    setFormDistinction('FELICITATIONS');
    setFormCitation('Travail assidu et résultats remarquables.');
    setFormSpecialty('Sciences & Mathématiques');
    setFormIsPublic(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: HonorRollStudent) => {
    setEditingStudent(student);
    setFormName(student.studentName);
    setFormGender(student.gender);
    setFormClass(student.classLevel);
    setFormPeriod(student.period);
    setFormAverage(student.average);
    setFormMaxScale(student.maxScale);
    setFormRank(student.rankInClass);
    setFormTotalInClass(student.totalStudentsInClass);
    setFormDistinction(student.distinction);
    setFormCitation(student.citation);
    setFormSpecialty(student.specialty || '');
    setFormIsPublic(student.isPublic !== false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Nom de l’élève requis');
      return;
    }

    const isSec = formClass.toLowerCase().includes('secondaire') || formClass.toLowerCase().includes('ns');
    const cycle = isSec ? 'SECONDAIRE' : 'FONDAMENTAL';

    setIsSubmitting(true);
    try {
      if (editingStudent) {
        const updated = await apiService.updateHonorRollStudent(editingStudent.id, {
          studentName: formName.trim(),
          gender: formGender,
          classLevel: formClass,
          cycle,
          period: formPeriod,
          average: Number(formAverage),
          maxScale: Number(formMaxScale),
          rankInClass: Number(formRank),
          totalStudentsInClass: Number(formTotalInClass),
          distinction: formDistinction,
          citation: formCitation.trim(),
          specialty: formSpecialty.trim(),
          isPublic: formIsPublic,
        });
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
        toast.success(`Lauréat mis à jour avec succès : ${formName}`);
      } else {
        const created = await apiService.addHonorRollStudent({
          studentName: formName.trim(),
          gender: formGender,
          classLevel: formClass,
          cycle,
          academicYear: '2026-2027',
          period: formPeriod,
          average: Number(formAverage),
          maxScale: Number(formMaxScale),
          rankInClass: Number(formRank),
          totalStudentsInClass: Number(formTotalInClass),
          distinction: formDistinction,
          citation: formCitation.trim(),
          specialty: formSpecialty.trim(),
          isPublic: formIsPublic,
          dateAwarded: new Date().toISOString().split('T')[0],
        });
        setStudents(prev => [created, ...prev]);
        toast.success(`Élève ajouté au Tableau d’Honneur : ${formName}`);
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Confirmez-vous le retrait de ${name} du Tableau d'Honneur ?`)) return;
    try {
      await apiService.deleteHonorRollStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success(`${name} a été retiré du Tableau d’Honneur`);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Téléchargement du tableau complet filtré au format PDF
  const handleExportTablePdf = async () => {
    if (filteredStudents.length === 0) {
      toast.error('Aucun élève à exporter pour ces critères');
      return;
    }
    setIsExportingTable(true);
    try {
      const result = await officialDocumentsPdfService.generateHonorRollTablePdf(filteredStudents, {
        classLevel: selectedClass === 'ALL' ? 'Toutes les classes' : selectedClass,
        period: selectedPeriod === 'ALL' ? 'Tous les trimestres' : selectedPeriod,
        academicYear: '2026-2027',
      });
      result.downloadBlob();
      toast.success(`Tableau d'Honneur exporté en PDF (${result.pageCount} page(s)) !`, {
        description: result.filename,
      });
    } catch (err: any) {
      toast.error('Erreur lors de l’export PDF du tableau', {
        description: err.message,
      });
    } finally {
      setIsExportingTable(false);
    }
  };

  const handleDownloadDiploma = async (student: HonorRollStudent) => {
    setDownloadingId(student.id);
    try {
      const result = await officialDocumentsPdfService.generateHonorCertificatePdf(student);
      result.downloadBlob();
      toast.success(`Diplôme d'Honneur téléchargé pour ${student.studentName}`);
    } catch (err: any) {
      toast.error('Erreur de téléchargement du diplôme', { description: err.message });
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesClass = selectedClass === 'ALL' || s.classLevel === selectedClass;
      const matchesPeriod = selectedPeriod === 'ALL' || s.period === selectedPeriod;
      const matchesDistinction = selectedDistinction === 'ALL' || s.distinction === selectedDistinction;
      
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        s.studentName.toLowerCase().includes(query) ||
        s.classLevel.toLowerCase().includes(query) ||
        s.citation.toLowerCase().includes(query);

      return matchesClass && matchesPeriod && matchesDistinction && matchesSearch;
    });
  }, [students, selectedClass, selectedPeriod, selectedDistinction, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-xs">
              <Trophy className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              Gestion du Tableau d’Honneur & Palmarès
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              {students.length} lauréat{students.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ajoutez, organisez et exportez les élèves méritants par classe et par trimestre, avec génération certifiée des diplômes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={fetchStudents}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Bouton Export PDF du Tableau */}
          <button
            type="button"
            onClick={handleExportTablePdf}
            disabled={isExportingTable || filteredStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isExportingTable ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Génération PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exporter le Tableau (PDF)</span>
              </>
            )}
          </button>

          {/* Bouton Nouvel Élève */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un élève méritant</span>
          </button>
        </div>
      </div>

      {/* FILTRES PAR CLASSE, TRIMESTRE & RECHERCHE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Classe */}
          <div>
            <label className="block text-2xs font-bold text-slate-600 mb-1">
              Filtrer par Classe
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 text-xs"
            >
              <option value="ALL">Toutes les classes</option>
              {AVAILABLE_CLASSES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Trimestre / Période */}
          <div>
            <label className="block text-2xs font-bold text-slate-600 mb-1">
              Filtrer par Trimestre / Contrôle
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 text-xs"
            >
              <option value="ALL">Tous les trimestres</option>
              {AVAILABLE_PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Distinction */}
          <div>
            <label className="block text-2xs font-bold text-slate-600 mb-1">
              Type de Distinction
            </label>
            <select
              value={selectedDistinction}
              onChange={(e) => setSelectedDistinction(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 text-xs"
            >
              <option value="ALL">Toutes les distinctions</option>
              <option value="FELICITATIONS">Félicitations du Conseil</option>
              <option value="TABLEAU_HONNEUR">Tableau d'Honneur</option>
              <option value="PRIX_SCIENCES">Prix des Sciences</option>
              <option value="PRIX_HUMANITES">Prix des Humanités</option>
              <option value="PRIX_CIVISME">Prix du Civisme</option>
              <option value="ENCOURAGEMENTS">Tableau des Encouragements</option>
            </select>
          </div>

          {/* Recherche */}
          <div>
            <label className="block text-2xs font-bold text-slate-600 mb-1">
              Rechercher
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom, mention..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 text-xs"
              />
            </div>
          </div>

        </div>
      </div>

      {/* TABLEAU DES ÉLÈVES MÉRITANTS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Trophy className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Aucun élève trouvé pour ces critères de sélection</p>
            <p className="text-2xs text-slate-400">Modifiez la classe ou ajoutez un nouvel élève méritant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-2xs uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-3 px-4">Rang</th>
                  <th className="py-3 px-4">Élève</th>
                  <th className="py-3 px-4">Classe & Cycle</th>
                  <th className="py-3 px-4">Trimestre</th>
                  <th className="py-3 px-4">Moyenne</th>
                  <th className="py-3 px-4">Distinction</th>
                  <th className="py-3 px-4">Appréciation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Rang */}
                    <td className="py-3 px-4 font-bold">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs ${
                        st.rankInClass === 1
                          ? 'bg-amber-100 text-amber-900 font-extrabold border border-amber-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {st.rankInClass}
                      </span>
                    </td>

                    {/* Élève */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{st.studentName}</span>
                        {!st.isPublic && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-600">
                            Privé
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Classe */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>{st.classLevel}</div>
                      <span className="text-2xs text-slate-400">{st.cycle}</span>
                    </td>

                    {/* Trimestre */}
                    <td className="py-3 px-4 text-slate-500 font-mono text-2xs">
                      {st.period}
                    </td>

                    {/* Moyenne */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-900">
                      {st.average} / {st.maxScale}
                    </td>

                    {/* Distinction */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        {st.distinction.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Appréciation */}
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate" title={st.citation}>
                      « {st.citation} »
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Voir Diplôme */}
                        <button
                          type="button"
                          onClick={() => { setPreviewStudent(st); setIsPreviewOpen(true); }}
                          className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Aperçu du diplôme officiel"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Télécharger Diplôme PDF */}
                        <button
                          type="button"
                          onClick={() => handleDownloadDiploma(st)}
                          disabled={downloadingId === st.id}
                          className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Télécharger le diplôme (PDF)"
                        >
                          {downloadingId === st.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-900" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-amber-600" />
                          )}
                        </button>

                        {/* Modifier */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Supprimer */}
                        <button
                          type="button"
                          onClick={() => handleDelete(st.id, st.studentName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL AJOUT / MODIFICATION D'UN ÉLÈVE */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>{editingStudent ? 'Modifier l’élève méritant' : 'Ajouter un élève méritant'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 overflow-y-auto text-xs">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom Complet de l'Élève *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Alexandre Pierre"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Genre
                  </label>
                  <select
                    value={formGender}
                    onChange={(e: any) => setFormGender(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <option value="M">Masculin (Garçon)</option>
                    <option value="F">Féminin (Fille)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Classe *
                  </label>
                  <select
                    value={formClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {AVAILABLE_CLASSES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trimestre / Période *
                  </label>
                  <select
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {AVAILABLE_PERIODS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Type de Distinction *
                  </label>
                  <select
                    value={formDistinction}
                    onChange={(e: any) => setFormDistinction(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  >
                    <option value="FELICITATIONS">Félicitations du Conseil</option>
                    <option value="TABLEAU_HONNEUR">Tableau d'Honneur</option>
                    <option value="PRIX_SCIENCES">Prix des Sciences (Newton)</option>
                    <option value="PRIX_HUMANITES">Prix des Humanités</option>
                    <option value="PRIX_CIVISME">Prix du Civisme</option>
                    <option value="ENCOURAGEMENTS">Tableau des Encouragements</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Moyenne ({formMaxScale === 10 ? 'sur 10' : 'sur 100'})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={formMaxScale}
                    required
                    value={formAverage}
                    onChange={(e) => setFormAverage(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rang
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formRank}
                    onChange={(e) => setFormRank(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Effectif Classe
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formTotalInClass}
                    onChange={(e) => setFormTotalInClass(parseInt(e.target.value) || 30)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matière de prédilection / Spécialité
                </label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="Ex: Mathématiques & Physique"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Citation / Appréciation du Conseil des Professeurs *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formCitation}
                  onChange={(e) => setFormCitation(e.target.value)}
                  placeholder="Ex: Rigueur exemplaire, vive intelligence et amour des sciences exactes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="formIsPublic"
                  checked={formIsPublic}
                  onChange={(e) => setFormIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-900 border-slate-300"
                />
                <label htmlFor="formIsPublic" className="text-xs text-slate-700">
                  Afficher publiquement sur le Tableau d’Honneur du site
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingStudent ? 'Enregistrer' : 'Ajouter'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL APERÇU DIPLÔME INDIVIDUEL */}
      <HonorDiplomaModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        student={previewStudent}
      />

    </div>
  );
};
