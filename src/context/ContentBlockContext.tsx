import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { User } from '../types';

interface ContentBlockContextType {
  blocks: Record<string, string>;
  getBlock: (key: string, defaultContent: string) => string;
  saveBlock: (key: string, content: string) => Promise<boolean>;
  resetBlock: (key: string) => Promise<boolean>;
  isEditModeActive: boolean;
  setIsEditModeActive: (active: boolean) => void;
  toggleEditMode: () => void;
  activeBlockKey: string | null;
  setActiveBlockKey: (key: string | null) => void;
  activeElement: HTMLElement | null;
  setActiveElement: (el: HTMLElement | null) => void;
  isSaving: boolean;
  customBlocksCount: number;
}

const ContentBlockContext = createContext<ContentBlockContextType | undefined>(undefined);

export const ContentBlockProvider: React.FC<{ children: React.ReactNode; currentUser?: User | null }> = ({
  children,
  currentUser,
}) => {
  const [blocks, setBlocks] = useState<Record<string, string>>({});
  const [isEditModeActive, setIsEditModeActive] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cin_edit_mode_active');
      return saved === 'true';
    } catch {
      return true;
    }
  });
  const [activeBlockKey, setActiveBlockKey] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = Boolean(currentUser && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role));

  const loadBlocks = useCallback(async () => {
    try {
      const data = await apiService.getContentBlocks();
      if (data && typeof data === 'object') {
        setBlocks(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    loadBlocks();

    const handleUpdate = (e: any) => {
      if (e?.detail?.blocks) {
        setBlocks(e.detail.blocks);
      } else {
        loadBlocks();
      }
    };

    window.addEventListener('cin:content-blocks-updated', handleUpdate);
    return () => window.removeEventListener('cin:content-blocks-updated', handleUpdate);
  }, [loadBlocks]);

  const handleSetEditModeActive = (active: boolean) => {
    setIsEditModeActive(active);
    try {
      localStorage.setItem('cin_edit_mode_active', String(active));
    } catch {}
  };

  const toggleEditMode = () => {
    handleSetEditModeActive(!isEditModeActive);
    if (isEditModeActive) {
      setActiveBlockKey(null);
      setActiveElement(null);
    }
  };

  const getBlock = useCallback((key: string, defaultContent: string): string => {
    if (blocks[key] !== undefined && blocks[key] !== null) {
      return blocks[key];
    }
    return defaultContent;
  }, [blocks]);

  const saveBlock = async (key: string, content: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await apiService.saveContentBlock(key, content);
      setBlocks(updated);
      toast.success('Texte enregistré avec succès dans PostgreSQL !', {
        description: `Clé : ${key}`,
        duration: 2500,
      });
      return true;
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde du texte');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const resetBlock = async (key: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const updated = await apiService.resetContentBlock(key);
      setBlocks(updated);
      toast.info('Texte rétabli à sa valeur d’origine', {
        description: `Clé : ${key}`,
      });
      return true;
    } catch {
      toast.error('Erreur lors de la réinitialisation');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const customBlocksCount = Object.keys(blocks).length;

  return (
    <ContentBlockContext.Provider
      value={{
        blocks,
        getBlock,
        saveBlock,
        resetBlock,
        isEditModeActive: canEdit && isEditModeActive,
        setIsEditModeActive: handleSetEditModeActive,
        toggleEditMode,
        activeBlockKey,
        setActiveBlockKey,
        activeElement,
        setActiveElement,
        isSaving,
        customBlocksCount,
      }}
    >
      {children}
    </ContentBlockContext.Provider>
  );
};

export const useContentBlocks = () => {
  const context = useContext(ContentBlockContext);
  if (!context) {
    throw new Error('useContentBlocks must be used within a ContentBlockProvider');
  }
  return context;
};
