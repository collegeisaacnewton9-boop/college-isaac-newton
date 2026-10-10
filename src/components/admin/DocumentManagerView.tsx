import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  FileDown, 
  RefreshCw, 
  Upload, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  BarChart2
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentFile } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_DOCUMENTS } from '../../data/mockData';

interface DocumentManagerViewProps {
  onSelectDocument?: (doc: DocumentFile) => void;
}

export const DocumentManagerView: React.FC<DocumentManagerViewProps> = ({
  onSelectDocument
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>(INITIAL_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentFile | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<'reglement' | 'calendrier' | 'fournitures' | 'formulaires'>('reglement');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formFileSize, setFormFileSize] = useState('1.5 Mo');
  const [formTargetCycle, setFormTargetCycle] = useState('Tous les cycles');
  const [formSchoolYear, setFormSchoolYear] = useState('2026-2027');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDocuments();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch {
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const onDocsUpdate = () => {
      fetchDocuments();
    };

    window.addEventListener('cin:documents-updated', onDocsUpdate);
    return () => window.removeEventListener('cin:documents-updated', onDocsUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('reglement');
    setFormFileUrl('/documents/reglement_interieur_college_isaac_newton.pdf');
    setFormFileSize('1.8 Mo');
    setFormTargetCycle('Tous les cycles');
    setFormSchoolYear('2026-2027');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (doc: DocumentFile, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormDescription(doc.description || '');
    setFormCategory(doc.category);
    setFormFileUrl(doc.fileUrl);
    setFormFileSize(doc.fileSize);
    setFormTargetCycle(doc.targetCycle || 'Tous les cycles');
    setFormSchoolYear(doc.schoolYear || '2026-2027');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Supprimer définitivement ce document officiel ?')) return;

    try {
      await apiService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document retiré avec succès');
    } catch {
      toast.error('Erreur lors de la suppression du document');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      toast.error('Le fichier ne doit pas dépasser 25 Mo.');
      return;
    }

    const sizeFormatted = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
      : `${Math.round(file.size / 1024)} Ko`;

    setFormFileSize(sizeFormatted);
    if (!formTitle) {
      setFormTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === 'string') {
        setFormFileUrl(ev.target.result);
        toast.success(`Fichier ${file.name} sélectionné (${sizeFormatted})`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Le titre du document est obligatoire');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingDoc) {
        const updated = await apiService.updateDocument(editingDoc.id, {
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          fileUrl: formFileUrl || editingDoc.fileUrl,
          fileSize: formFileSize,
          targetCycle: formTargetCycle,
          schoolYear: formSchoolYear,
        });
        setDocuments(prev => prev.map(d => d.id === editingDoc.id ? updated : d));
        toast.success('Document mis à jour avec succès');
      } else {
        const created = await apiService.addDocument({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          fileUrl: formFileUrl || '/documents/reglement_interieur_college_isaac_newton.pdf',
          fileSize: formFileSize,
          fileType: 'PDF',
          targetCycle: formTargetCycle,
          schoolYear: formSchoolYear,
          downloadCount: 0,
        });
        setDocuments(prev => [created, ...prev]);
        toast.success('Nouveau document officiel ajouté');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Une erreur est survenue lors de l’enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalDownloads = documents.reduce((acc, d) => acc + (d.downloadCount || 0), 0);

  return (
    <div className="space-y-4">
      {/* HEADER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">
              Documents Officiels & Ressources Téléchargeables
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              {documents.length} document{documents.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Règlements, listes de fournitures, calendrier officiel et formulaires administratifs pour l'année 2026-2027.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDocuments}
            disabled={isLoading}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Rafraîchir les documents"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Document</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{documents.length}</div>
            <div className="text-2xs text-slate-500">Documents actifs</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{totalDownloads}</div>
            <div className="text-2xs text-slate-500">Téléchargements</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">100%</div>
            <div className="text-2xs text-slate-500">Certifiés conformes</div>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">2026-2027</div>
            <div className="text-2xs text-slate-500">Année scolaire</div>
          </div>
        </div>
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre ou mot-clé..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'reglement', label: 'Règlements' },
            { id: 'calendrier', label: 'Calendriers' },
            { id: 'fournitures', label: 'Fournitures' },
            { id: 'formulaires', label: 'Formulaires' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* DOCUMENTS LIST */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Aucun document trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau fichier PDF.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map((doc) => (
              <div 
                key={doc.id} 
                className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                onClick={() => onSelectDocument?.(doc)}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-900 shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-sm truncate">
                        {doc.title}
                      </h4>
                      <span className="px-2 py-0.5 text-2xs font-semibold rounded-md bg-slate-100 text-slate-600 uppercase">
                        {doc.category}
                      </span>
                      {doc.targetCycle && (
                        <span className="px-2 py-0.5 text-2xs font-medium rounded-md bg-blue-50 text-blue-700">
                          {doc.targetCycle}
                        </span>
                      )}
                    </div>
                    {doc.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-2xs text-slate-400 mt-1">
                      <span>Taille : {doc.fileSize}</span>
                      <span>·</span>
                      <span>Format : {doc.fileType}</span>
                      <span>·</span>
                      <span>Téléchargements : {doc.downloadCount || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={doc.title}
                    onClick={() => apiService.recordDocumentDownload(doc.id)}
                    className="p-2 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Télécharger le document"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(doc, e)}
                    className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Modifier les informations"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(doc.id, e)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Supprimer ce document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL AJOUT / ÉDITION */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-900" />
                <span>{editingDoc ? 'Modifier le Document Officiel' : 'Ajouter un Document Officiel'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre du Document *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ex: Règlement Intérieur 2026-2027"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description & Objectif
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Détaillez le contenu pour les parents et élèves..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e: any) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  >
                    <option value="reglement">Règlement Intérieur</option>
                    <option value="calendrier">Calendrier Académique</option>
                    <option value="fournitures">Fournitures Scolaires</option>
                    <option value="formulaires">Formulaires Administratifs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cycle Concerné
                  </label>
                  <input
                    type="text"
                    value={formTargetCycle}
                    onChange={(e) => setFormTargetCycle(e.target.value)}
                    placeholder="Ex: Tous les cycles, 7e à 9e..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Téléversement de Fichier PDF ou URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formFileUrl}
                    onChange={(e) => setFormFileUrl(e.target.value)}
                    placeholder="/documents/mon_fichier.pdf ou Data URL"
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-2xs text-slate-400 mt-1">Format recommandé : PDF certifié (Max 25 Mo).</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
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
                  <span>{editingDoc ? 'Mettre à jour' : 'Enregistrer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
