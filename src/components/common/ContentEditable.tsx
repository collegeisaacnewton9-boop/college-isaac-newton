import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useContentBlocks } from '../../context/ContentBlockContext';
import { User } from '../../types';
import { Edit3, Check } from 'lucide-react';

export interface ContentEditableProps {
  contentKey: string;
  defaultContent: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  currentUser?: User | null;
  placeholder?: string;
}

export const ContentEditable: React.FC<ContentEditableProps> = ({
  contentKey,
  defaultContent,
  as: Component = 'div',
  className = '',
  multiline = true,
  currentUser,
  placeholder,
}) => {
  const {
    getBlock,
    saveBlock,
    isEditModeActive,
    activeBlockKey,
    setActiveBlockKey,
    setActiveElement,
    blocks,
  } = useContentBlocks();

  const elementRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const canEdit = Boolean(currentUser && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role));
  const isEditableNow = canEdit && isEditModeActive;

  // Retrieve current content from context (persisted in DB or fallback to default)
  const currentContent = getBlock(contentKey, defaultContent);
  const isCustomized = blocks[contentKey] !== undefined;

  // Sync element content when external update arrives and element is not currently being edited
  useEffect(() => {
    if (elementRef.current && !isFocused) {
      if (elementRef.current.innerHTML !== currentContent) {
        elementRef.current.innerHTML = currentContent;
      }
    }
  }, [currentContent, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    if (!isEditableNow) return;
    setIsFocused(true);
    setActiveBlockKey(contentKey);
    setActiveElement(e.currentTarget);
  };

  const handleBlur = async (e: React.FocusEvent<HTMLElement>) => {
    if (!isEditableNow) return;
    setIsFocused(false);
    const newHtml = e.currentTarget.innerHTML.trim();
    if (newHtml !== currentContent.trim()) {
      await saveBlock(contentKey, newHtml);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLElement>) => {
    if (!isEditableNow) return;

    // Ctrl+S / Cmd+S: Save immediately
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (elementRef.current) {
        const newHtml = elementRef.current.innerHTML.trim();
        await saveBlock(contentKey, newHtml);
      }
      return;
    }

    // Single line mode: Enter key submits & blurs
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
      elementRef.current?.blur();
    }
  };

  // Plain read-only render for visitors and non-admins
  if (!isEditableNow) {
    return (
      <Component
        className={className}
        dangerouslySetInnerHTML={{ __html: currentContent }}
      />
    );
  }

  // Interactive Editable Wrapper for Admins
  const isActive = activeBlockKey === contentKey;

  return (
    <div 
      className="relative group inline-block w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual outline and floating badge for admin users */}
      <Component
        ref={elementRef as any}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-content-key={contentKey}
        data-placeholder={placeholder}
        className={`${className} outline-none transition-all duration-150 ${
          isActive
            ? 'ring-2 ring-amber-400 ring-offset-2 rounded-lg bg-amber-500/10'
            : isHovered
            ? 'ring-1.5 ring-dashed ring-blue-500/70 rounded-lg cursor-text bg-blue-50/20'
            : isCustomized
            ? 'border-b border-dotted border-amber-400/60'
            : ''
        }`}
        dangerouslySetInnerHTML={{ __html: currentContent }}
      />

      {/* Floating Hover Badge indicating inline edit capability */}
      {!isActive && isHovered && (
        <div 
          className="absolute -top-3.5 right-1 z-30 pointer-events-none flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-900/90 text-amber-300 text-[9.5px] font-mono shadow-md border border-slate-700 animate-in fade-in zoom-in-95 duration-100"
        >
          <Edit3 className="w-2.5 h-2.5 text-amber-400" />
          <span>Cliquer pour éditer</span>
          {isCustomized && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" title="Modifié dans PostgreSQL" />
          )}
        </div>
      )}
    </div>
  );
};
