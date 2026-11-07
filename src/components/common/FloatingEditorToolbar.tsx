import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  Link as LinkIcon, 
  Trash2, 
  RotateCcw, 
  Save, 
  Check, 
  Loader2, 
  X, 
  Sparkles, 
  Edit3, 
  Eye, 
  HelpCircle,
  Unlink
} from 'lucide-react';
import { useContentBlocks } from '../../context/ContentBlockContext';
import { User } from '../../types';

interface FloatingEditorToolbarProps {
  currentUser?: User | null;
}

export const FloatingEditorToolbar: React.FC<FloatingEditorToolbarProps> = ({ currentUser }) => {
  const {
    isEditModeActive,
    toggleEditMode,
    activeBlockKey,
    setActiveBlockKey,
    activeElement,
    setActiveElement,
    saveBlock,
    resetBlock,
    isSaving,
    customBlocksCount,
    blocks
  } = useContentBlocks();

  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const canEdit = Boolean(currentUser && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role));

  // Calculate position above activeElement or selection
  useEffect(() => {
    if (!isEditModeActive || !activeElement) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!activeElement) return;
      const rect = activeElement.getBoundingClientRect();
      const toolbarHeight = 44;
      const margin = 10;

      // Position centered horizontally above the element
      let left = rect.left + rect.width / 2;
      let top = rect.top - toolbarHeight - margin;

      // Prevent clipping on top edge
      if (top < 10) {
        top = rect.bottom + margin;
      }

      // Keep within viewport horizontally
      const minLeft = 180;
      const maxLeft = window.innerWidth - 180;
      left = Math.max(minLeft, Math.min(left, maxLeft));

      setPosition({ top: top + window.scrollY, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, { passive: true });
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [activeElement, isEditModeActive]);

  if (!canEdit) return null;

  const executeCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (activeElement) {
      activeElement.focus();
    }
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) {
      executeCommand('unlink');
    } else {
      let url = linkUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
        url = 'https://' + url;
      }
      executeCommand('createLink', url);
    }
    setShowLinkModal(false);
    setLinkUrl('');
  };

  const handleSaveActive = async () => {
    if (!activeBlockKey || !activeElement) return;
    const htmlContent = activeElement.innerHTML;
    const ok = await saveBlock(activeBlockKey, htmlContent);
    if (ok) {
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2000);
    }
  };

  const handleResetActive = async () => {
    if (!activeBlockKey) return;
    if (window.confirm('Voulez-vous rétablir le texte d\'origine pour ce bloc ?')) {
      await resetBlock(activeBlockKey);
      setActiveBlockKey(null);
      setActiveElement(null);
    }
  };

  const isCurrentBlockModified = activeBlockKey ? blocks[activeBlockKey] !== undefined : false;

  return (
    <>
      {/* 1. FLOATING FORMATTING TOOLBAR - Appears above the active editable element */}
      {isEditModeActive && activeElement && position && (
        <div
          ref={toolbarRef}
          style={{
            position: 'absolute',
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          className="animate-in fade-in zoom-in-95 duration-150"
          onMouseDown={(e) => {
            // Prevent blur of active editable element when clicking buttons
            if ((e.target as HTMLElement).tagName !== 'INPUT') {
              e.preventDefault();
            }
          }}
        >
          <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-2xl shadow-2xl border border-slate-700/80 text-xs">
            {/* Active Block Key Tag */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/40 text-[10.5px] font-mono text-amber-300 mr-1 select-none">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="max-w-[130px] truncate" title={activeBlockKey || ''}>
                {activeBlockKey}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-700 mx-0.5" />

            {/* BOLD */}
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Gras (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* ITALIC */}
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Italique (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* UNDERLINE */}
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Souligné (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            {/* LINK */}
            <button
              type="button"
              onClick={() => setShowLinkModal(!showLinkModal)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                showLinkModal ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-200 hover:text-white'
              }`}
              title="Insérer ou modifier un lien hypertexte"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            {/* UNLINK */}
            <button
              type="button"
              onClick={() => executeCommand('unlink')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Supprimer le lien"
            >
              <Unlink className="w-3.5 h-3.5" />
            </button>

            {/* CLEAR FORMAT */}
            <button
              type="button"
              onClick={() => executeCommand('removeFormat')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Effacer le style et le formatage"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-700 mx-0.5" />

            {/* SAVE BUTTON */}
            <button
              type="button"
              onClick={handleSaveActive}
              disabled={isSaving}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer shadow-xs ${
                isSavedRecently 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
              }`}
              title="Enregistrer ce bloc dans PostgreSQL"
            >
              {isSaving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : isSavedRecently ? (
                <Check className="w-3 h-3 text-white" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              <span>{isSaving ? 'Envoi...' : isSavedRecently ? 'Enregistré !' : 'Enregistrer'}</span>
            </button>

            {/* RESET / REVERT BUTTON (if modified) */}
            {isCurrentBlockModified && (
              <button
                type="button"
                onClick={handleResetActive}
                className="p-1.5 rounded-lg hover:bg-rose-950/80 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                title="Rétablir le texte d'origine"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onClick={() => {
                setActiveBlockKey(null);
                setActiveElement(null);
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
              title="Fermer la barre"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Link Input Popover */}
          {showLinkModal && (
            <div className="mt-1.5 p-2 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-1">
              <form onSubmit={handleLinkSubmit} className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  placeholder="https://... ou /contact"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-amber-400 w-48 font-mono"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="p-1 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 2. FLOATING BOTTOM ADMIN CONTROL PILL - Allows toggling Live Edit mode on/off */}
      <div className="fixed bottom-5 left-5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md text-white p-1.5 pl-3 rounded-full shadow-2xl border border-slate-800/90 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isEditModeActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-semibold text-[11px] text-slate-200">
              {isEditModeActive ? 'Mode Édition En Direct' : 'Aperçu Standard'}
            </span>
            {customBlocksCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold font-mono">
                {customBlocksCount} bloc{customBlocksCount > 1 ? 's' : ''} modifié{customBlocksCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleEditMode}
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer shadow-xs ml-1 ${
              isEditModeActive
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title={isEditModeActive ? 'Désactiver l\'édition pour tester le site normalement' : 'Activer l\'édition de texte directe sur la page'}
          >
            {isEditModeActive ? (
              <>
                <Edit3 className="w-3 h-3" />
                <span>ON</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>OFF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};
