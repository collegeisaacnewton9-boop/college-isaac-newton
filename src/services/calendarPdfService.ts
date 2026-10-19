/**
 * Service de Génération PDF Officiel du Calendrier Scolaire
 * Collège Isaac Newton - Direction Pédagogique & SI
 * 
 * Génère un document PDF 1.4 vectoriel multi-pages natif (ISO 32000-1) avec pdf-lib :
 * - Formats A4 et Letter sélectionnables
 * - Marges régulières (15-20 mm)
 * - Typographie Helvetica nette, contrastée et recherchable
 * - En-tête officiel et pagination dynamique "Page X sur Y"
 * - Tableau des 4 contrôles, événements majeurs d'État et agenda chronologique complet
 * - Respect strict des dates officielles 2026-2027
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { SchoolEvent } from '../types';

export interface CalendarPdfOptions {
  paperFormat?: 'A4' | 'Letter';
  academicYear?: string;
}

export interface AcademicControlOfficial {
  name: string;
  period: string;
  duration: string;
  exams: string;
  reports: string;
  holidays: string;
}

export const OFFICIAL_CONTROLS_2026_2027: AcademicControlOfficial[] = [
  {
    name: '1er Contrôle',
    period: 'Du 7 sept. au 13 nov. 2026',
    duration: '49 jours',
    exams: 'Du 9 au 13 nov. 2026',
    reports: '27 nov. 2026',
    holidays: 'Noël : 21 déc. 2026 au 3 janv. 2027 (reprise le 4 janv.)',
  },
  {
    name: '2e Contrôle',
    period: 'Du 16 nov. 2026 au 29 janv. 2027',
    duration: '44 jours',
    exams: 'Du 25 au 29 janv. 2027',
    reports: '19 fév. 2027',
    holidays: 'Carnaval : 8 au 10 fév. 2027',
  },
  {
    name: '3e Contrôle',
    period: 'Du 2 mars au 30 avril 2027',
    duration: '51 jours',
    exams: 'Du 12 au 16 avril 2027',
    reports: '30 avril 2027',
    holidays: 'Pâques : 25 au 29 mars 2027',
  },
  {
    name: '4e Contrôle',
    period: 'Du 19 avril au 4 juin 2027',
    duration: '35 jours',
    exams: 'Du 31 mai au 4 juin 2027',
    reports: 'Remise des notes : 11 juin 2027',
    holidays: 'Grandes vacances d’été à partir du 11 juin 2027',
  },
];

export const OFFICIAL_STATE_EXAMS_AND_FEASTS = [
  { date: '22 Janvier 2027', title: 'Fête des philosophes', category: 'Célébration & Débats oratoires' },
  { date: '12 Février 2027', title: 'Partage des dédicaces', category: 'Tradition fraternelle du campus' },
  { date: '14 Mai 2027', title: 'Fête des professeurs et exposition des projets', category: 'Hommage pédagogique & Sciences' },
  { date: '28 Mai 2027', title: 'Fête du Collège', category: 'Grande solennité institutionnelle' },
  { date: '14 au 17 Juin 2027', title: 'Examens de fin de cycle 9e A.F.', category: 'Épreuves Officielles d’État (MENFP)' },
  { date: '28 Juin au 1er Juil. 2027', title: 'Examens de fin de cycle NS4', category: 'Baccalauréat Unique MENFP' },
  { date: '10 Juillet 2027', title: 'Graduation & Collation des Diplômes', category: 'Cérémonie solennelle & Toges' },
];

export const OFFICIAL_PRACTICAL_GUIDELINES = [
  { label: 'Horaires des cours', text: 'Début impératif à 07h30 (fermeture de la barrière à 07h45). Sortie à 15h00 du lundi au vendredi.' },
  { label: 'Renforcement du samedi', text: 'Séances gratuites intensives en mathématiques, sciences et rédaction pour les candidats 9e AF & NS4.' },
  { label: 'Secrétariat & Absences', text: 'Toute absence doit être justifiée au +509 3721-1818 ou à la réception avant 09h00.' },
];

/**
 * Nettoie les caractères hors WinAnsi pour une compatibilité parfaite avec les polices Type-1
 */
function sanitizeText(str: string): string {
  if (!str) return '';
  return str
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[«»]/g, '"')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tronque proprement un texte pour tenir dans une largeur donnée
 */
function fitText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string {
  const clean = sanitizeText(text);
  if (font.widthOfTextAtSize(clean, fontSize) <= maxWidth) {
    return clean;
  }
  let truncated = clean;
  while (truncated.length > 3 && font.widthOfTextAtSize(truncated + '...', fontSize) > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + '...';
}

export const calendarPdfService = {
  /**
   * Génère le document PDF officiel du calendrier
   */
  async generateCalendarPdf(
    events: SchoolEvent[],
    options: CalendarPdfOptions = {}
  ): Promise<{
    pdfBytes: Uint8Array;
    pageCount: number;
    filename: string;
    downloadBlob: () => void;
  }> {
    const { paperFormat = 'A4', academicYear = '2026-2027' } = options;

    // Dimensions en points PostScript (72 pt = 1 pouce)
    // A4 : 595.28 x 841.89 pt (~210 x 297 mm)
    // Letter : 612 x 792 pt (~215.9 x 279.4 mm)
    const isLetter = paperFormat === 'Letter';
    const pageWidth = isLetter ? 612 : 595.28;
    const pageHeight = isLetter ? 792 : 841.89;
    const margin = 42; // ~15 mm de marge
    const contentWidth = pageWidth - margin * 2;

    const doc = await PDFDocument.create();
    doc.setTitle(`Calendrier Scolaire & Agenda Officiel - Collège Isaac Newton - ${academicYear}`);
    doc.setAuthor('Collège Isaac Newton');
    doc.setSubject(`Calendrier académique officiel, contrôles et examens MENFP ${academicYear}`);
    doc.setCreator('Système d’Information Scolaire Collège Isaac Newton');

    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    // Couleurs institutionnelles Newton
    const colorNavy = rgb(0.06, 0.16, 0.36);     // #0f295c
    const colorGold = rgb(0.85, 0.62, 0.12);     // #d99e1f
    const colorDark = rgb(0.1, 0.13, 0.18);      // #1a212e
    const colorMuted = rgb(0.4, 0.45, 0.52);     // #667385
    const colorBorder = rgb(0.82, 0.85, 0.9);    // #d1d9e6
    const colorBgHeader = rgb(0.95, 0.96, 0.98); // #f2f5fa
    const colorRowAlt = rgb(0.98, 0.99, 1.0);    // #fa scale

    const pages: PDFPage[] = [];

    // Helper pour ajouter une page avec structure uniforme
    const createNewPage = (): { page: PDFPage; startY: number } => {
      const page = doc.addPage([pageWidth, pageHeight]);
      pages.push(page);

      // --- En-tête institutionnel discret (sur chaque page) ---
      let y = pageHeight - 36;
      page.drawText(sanitizeText('COLLÈGE ISAAC NEWTON'), {
        x: margin,
        y,
        size: 13,
        font: fontBold,
        color: colorNavy,
      });

      const yearText = sanitizeText(`Session ${academicYear}`);
      const yearWidth = fontBold.widthOfTextAtSize(yearText, 10);
      page.drawText(yearText, {
        x: pageWidth - margin - yearWidth,
        y: y + 1,
        size: 10,
        font: fontBold,
        color: colorGold,
      });

      y -= 14;
      page.drawText(
        sanitizeText('Campus Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti · Tél : +509 3316-0934 / 3721-1818'),
        {
          x: margin,
          y,
          size: 8,
          font: fontRegular,
          color: colorMuted,
        }
      );

      y -= 10;
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1,
        color: colorNavy,
      });

      return { page, startY: y - 16 };
    };

    // =========================================================================
    // PAGE 1 : RÉSUMÉ INSTITUTIONNEL (4 CONTRÔLES, EXAMENS D'ÉTAT & HORAIRES)
    // =========================================================================
    const { page: page1, startY } = createNewPage();
    let currentY = startY;

    // Titre principal de la page 1
    page1.drawText(sanitizeText('CALENDRIER SCOLAIRE & REPÈRES OFFICIELS'), {
      x: margin,
      y: currentY,
      size: 12,
      font: fontBold,
      color: colorDark,
    });
    currentY -= 12;
    page1.drawText(
      sanitizeText('Structure académique annuelle, calendrier des épreuves officielles et congés réglementaires.'),
      {
        x: margin,
        y: currentY,
        size: 8.5,
        font: fontRegular,
        color: colorMuted,
      }
    );
    currentY -= 16;

    // SECTION A : TABLEAU DES 4 CONTRÔLES
    page1.drawText(sanitizeText('1. Structure des 4 Contrôles Académiques 2026–2027'), {
      x: margin,
      y: currentY,
      size: 10,
      font: fontBold,
      color: colorNavy,
    });
    currentY -= 14;

    // Définition des colonnes du tableau des contrôles
    // Total width = contentWidth (~511 pt sur A4)
    const colWidths = [
      contentWidth * 0.17, // Contrôle (87 pt)
      contentWidth * 0.25, // Période (128 pt)
      contentWidth * 0.11, // Durée (56 pt)
      contentWidth * 0.20, // Examens (102 pt)
      contentWidth * 0.27, // Remise & Congés (138 pt)
    ];

    const tableHeaders = [
      'Contrôle',
      'Période Officielle',
      'Durée',
      'Semaine Examens',
      'Remise Carnets / Congés',
    ];

    // En-tête du tableau
    const headerRowHeight = 18;
    page1.drawRectangle({
      x: margin,
      y: currentY - headerRowHeight + 5,
      width: contentWidth,
      height: headerRowHeight,
      color: colorBgHeader,
      borderColor: colorBorder,
      borderWidth: 0.5,
    });

    let currentX = margin;
    for (let i = 0; i < tableHeaders.length; i++) {
      page1.drawText(sanitizeText(tableHeaders[i]), {
        x: currentX + 4,
        y: currentY - 8,
        size: 7.5,
        font: fontBold,
        color: colorNavy,
      });
      currentX += colWidths[i];
    }
    currentY -= headerRowHeight + 2;

    // Lignes du tableau
    OFFICIAL_CONTROLS_2026_2027.forEach((ctrl, idx) => {
      const rowHeight = 28;
      const isAlt = idx % 2 === 1;

      page1.drawRectangle({
        x: margin,
        y: currentY - rowHeight + 6,
        width: contentWidth,
        height: rowHeight,
        color: isAlt ? colorRowAlt : rgb(1, 1, 1),
        borderColor: colorBorder,
        borderWidth: 0.5,
      });

      let x = margin;
      
      // Col 1 : Nom
      page1.drawText(sanitizeText(ctrl.name), {
        x: x + 4,
        y: currentY - 8,
        size: 8,
        font: fontBold,
        color: colorNavy,
      });
      x += colWidths[0];

      // Col 2 : Période
      page1.drawText(fitText(ctrl.period, colWidths[1] - 8, fontRegular, 7.5), {
        x: x + 4,
        y: currentY - 8,
        size: 7.5,
        font: fontRegular,
        color: colorDark,
      });
      x += colWidths[1];

      // Col 3 : Durée
      page1.drawText(sanitizeText(ctrl.duration), {
        x: x + 4,
        y: currentY - 8,
        size: 7.5,
        font: fontBold,
        color: colorGold,
      });
      x += colWidths[2];

      // Col 4 : Examens
      page1.drawText(fitText(ctrl.exams, colWidths[3] - 8, fontBold, 7.5), {
        x: x + 4,
        y: currentY - 8,
        size: 7.5,
        font: fontBold,
        color: colorDark,
      });
      x += colWidths[3];

      // Col 5 : Carnets / Vacances (2 lignes)
      page1.drawText(fitText(`Carnets : ${ctrl.reports}`, colWidths[4] - 8, fontBold, 7), {
        x: x + 4,
        y: currentY - 7,
        size: 7,
        font: fontBold,
        color: colorNavy,
      });
      page1.drawText(fitText(ctrl.holidays, colWidths[4] - 8, fontRegular, 6.5), {
        x: x + 4,
        y: currentY - 17,
        size: 6.5,
        font: fontRegular,
        color: colorMuted,
      });

      currentY -= rowHeight;
    });

    currentY -= 14;

    // SECTION B : DATES IMPORTANTES & EXAMENS D'ÉTAT (MENFP)
    page1.drawText(sanitizeText('2. Événements Majeurs, Fêtes Phares & Examens d’État MENFP'), {
      x: margin,
      y: currentY,
      size: 10,
      font: fontBold,
      color: colorNavy,
    });
    currentY -= 14;

    // Grille 2 colonnes pour les 7 événements majeurs
    const halfWidth = (contentWidth - 10) / 2;
    const cardHeight = 26;

    for (let i = 0; i < OFFICIAL_STATE_EXAMS_AND_FEASTS.length; i++) {
      const item = OFFICIAL_STATE_EXAMS_AND_FEASTS[i];
      const isRight = i % 2 === 1;
      const cardX = margin + (isRight ? halfWidth + 10 : 0);
      const isStateExam = item.title.includes('9e A.F.') || item.title.includes('NS4');

      page1.drawRectangle({
        x: cardX,
        y: currentY - cardHeight + 6,
        width: halfWidth,
        height: cardHeight,
        color: isStateExam ? rgb(0.99, 0.95, 0.95) : colorBgHeader,
        borderColor: isStateExam ? rgb(0.9, 0.6, 0.6) : colorBorder,
        borderWidth: 0.5,
      });

      page1.drawText(sanitizeText(item.date), {
        x: cardX + 6,
        y: currentY - 7,
        size: 7.5,
        font: fontBold,
        color: isStateExam ? rgb(0.7, 0.1, 0.1) : colorGold,
      });

      page1.drawText(fitText(item.title, halfWidth - 12, fontBold, 8), {
        x: cardX + 6,
        y: currentY - 17,
        size: 8,
        font: fontBold,
        color: colorDark,
      });

      if (isRight || i === OFFICIAL_STATE_EXAMS_AND_FEASTS.length - 1) {
        currentY -= cardHeight + 4;
      }
    }

    currentY -= 10;

    // SECTION D : DIRECTIVES PRATIQUES ESSENTIELLES
    page1.drawText(sanitizeText('3. Modalités & Fonctionnement de l’Établissement'), {
      x: margin,
      y: currentY,
      size: 10,
      font: fontBold,
      color: colorNavy,
    });
    currentY -= 12;

    OFFICIAL_PRACTICAL_GUIDELINES.forEach((info) => {
      page1.drawText(sanitizeText(`• ${info.label} :`), {
        x: margin + 4,
        y: currentY,
        size: 7.5,
        font: fontBold,
        color: colorDark,
      });
      const labelW = fontBold.widthOfTextAtSize(sanitizeText(`• ${info.label} : `), 7.5);
      page1.drawText(fitText(info.text, contentWidth - labelW - 12, fontRegular, 7.5), {
        x: margin + 4 + labelW,
        y: currentY,
        size: 7.5,
        font: fontRegular,
        color: colorMuted,
      });
      currentY -= 12;
    });

    // =========================================================================
    // PAGE 2 (ET SUIVANTES) : AGENDA CHRONOLOGIQUE COMPLET PAGINÉ
    // =========================================================================
    // Filtrage des événements pour l'année courante
    const relevantEvents = events
      .filter((e) => {
        const year = e.academicYear || '2026-2027';
        if (year !== academicYear) return false;
        if (e.status === 'DRAFT' || e.isPublic === false) return false;
        return true;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    let { page: currentAgendaPage, startY: agendaY } = createNewPage();
    let y = agendaY;

    // Titre de l'agenda
    currentAgendaPage.drawText(sanitizeText(`AGENDA CHRONOLOGIQUE DES ACTIVITÉS & ÉCHÉANCES (${relevantEvents.length} dates)`), {
      x: margin,
      y,
      size: 11,
      font: fontBold,
      color: colorNavy,
    });
    y -= 12;
    currentAgendaPage.drawText(
      sanitizeText('Dates officielles, sessions d’évaluations, examens, congés et activités de la vie scolaire.'),
      {
        x: margin,
        y,
        size: 8,
        font: fontRegular,
        color: colorMuted,
      }
    );
    y -= 16;

    // Colonnes du tableau d'agenda
    const agendaCols = [
      contentWidth * 0.22, // Date (112 pt)
      contentWidth * 0.40, // Titre & Description (204 pt)
      contentWidth * 0.18, // Catégorie (92 pt)
      contentWidth * 0.20, // Lieu / Public (102 pt)
    ];

    const drawAgendaTableHeader = (targetPage: PDFPage, atY: number) => {
      targetPage.drawRectangle({
        x: margin,
        y: atY - 14,
        width: contentWidth,
        height: 16,
        color: colorBgHeader,
        borderColor: colorBorder,
        borderWidth: 0.5,
      });

      let x = margin;
      const headers = ['Date & Horaires', 'Événement / Activité', 'Catégorie', 'Lieu & Public'];
      for (let i = 0; i < headers.length; i++) {
        targetPage.drawText(sanitizeText(headers[i]), {
          x: x + 4,
          y: atY - 10,
          size: 7.5,
          font: fontBold,
          color: colorNavy,
        });
        x += agendaCols[i];
      }
      return atY - 20;
    };

    y = drawAgendaTableHeader(currentAgendaPage, y);

    for (let i = 0; i < relevantEvents.length; i++) {
      const evt = relevantEvents[i];
      const rowHeight = 24;

      // Vérification du bas de page (marge minimale de 50 pt pour le footer)
      if (y - rowHeight < 55) {
        const next = createNewPage();
        currentAgendaPage = next.page;
        y = next.startY;
        
        currentAgendaPage.drawText(sanitizeText(`AGENDA CHRONOLOGIQUE (suite) · SESSION ${academicYear}`), {
          x: margin,
          y,
          size: 10,
          font: fontBold,
          color: colorNavy,
        });
        y -= 16;
        y = drawAgendaTableHeader(currentAgendaPage, y);
      }

      const isAlt = i % 2 === 1;
      currentAgendaPage.drawRectangle({
        x: margin,
        y: y - rowHeight + 5,
        width: contentWidth,
        height: rowHeight,
        color: isAlt ? colorRowAlt : rgb(1, 1, 1),
        borderColor: colorBorder,
        borderWidth: 0.5,
      });

      let x = margin;

      // 1. Date formatée
      const startDate = new Date(evt.startDate);
      let dateFormatted = startDate.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      if (evt.endDate && evt.endDate !== evt.startDate) {
        const endD = new Date(evt.endDate);
        if (endD.getMonth() !== startDate.getMonth()) {
          dateFormatted += ` au ${endD.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`;
        } else if (endD.getDate() !== startDate.getDate()) {
          dateFormatted = `Du ${startDate.getDate()} au ${endD.getDate()} ${startDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`;
        }
      }

      currentAgendaPage.drawText(fitText(dateFormatted, agendaCols[0] - 8, fontBold, 7), {
        x: x + 4,
        y: y - 8,
        size: 7,
        font: fontBold,
        color: colorDark,
      });
      x += agendaCols[0];

      // 2. Titre & description brève
      currentAgendaPage.drawText(fitText(evt.title, agendaCols[1] - 8, fontBold, 7.5), {
        x: x + 4,
        y: y - 7,
        size: 7.5,
        font: fontBold,
        color: colorNavy,
      });
      if (evt.description) {
        currentAgendaPage.drawText(fitText(evt.description, agendaCols[1] - 8, fontRegular, 6.5), {
          x: x + 4,
          y: y - 16,
          size: 6.5,
          font: fontRegular,
          color: colorMuted,
        });
      }
      x += agendaCols[1];

      // 3. Catégorie
      currentAgendaPage.drawText(fitText(evt.category, agendaCols[2] - 8, fontBold, 7), {
        x: x + 4,
        y: y - 8,
        size: 7,
        font: fontBold,
        color: evt.category === 'Examen' ? rgb(0.8, 0.1, 0.1) : evt.category === 'Férié' || evt.category === 'Vacances' ? colorGold : colorNavy,
      });
      x += agendaCols[2];

      // 4. Lieu & Public
      const location = evt.location || 'Campus Delmas 50';
      const audience = evt.audience === 'PARENTS' ? 'Parents' : evt.audience === 'STUDENTS' ? 'Élèves' : 'Tous';
      currentAgendaPage.drawText(fitText(`${location} · ${audience}`, agendaCols[3] - 8, fontRegular, 6.5), {
        x: x + 4,
        y: y - 8,
        size: 6.5,
        font: fontRegular,
        color: colorMuted,
      });

      y -= rowHeight;
    }

    // =========================================================================
    // PIED DE PAGE DYNAMIQUE SUR TOUTES LES PAGES ("Page X sur Y")
    // =========================================================================
    const totalPages = pages.length;
    const editionDate = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    pages.forEach((p, pageIdx) => {
      const footerY = 24;

      // Trait fin de séparation
      p.drawLine({
        start: { x: margin, y: footerY + 12 },
        end: { x: pageWidth - margin, y: footerY + 12 },
        thickness: 0.5,
        color: colorBorder,
      });

      // Gauche : Mention légale
      p.drawText(sanitizeText('Collège Isaac Newton · Document officiel certifié pour impression et diffusion'), {
        x: margin,
        y: footerY,
        size: 7,
        font: fontRegular,
        color: colorMuted,
      });

      // Centre : Date d’édition
      const dateText = sanitizeText(`Édité le ${editionDate}`);
      const dateW = fontRegular.widthOfTextAtSize(dateText, 7);
      p.drawText(dateText, {
        x: pageWidth / 2 - dateW / 2,
        y: footerY,
        size: 7,
        font: fontRegular,
        color: colorMuted,
      });

      // Droite : Pagination Page X sur Y
      const pageText = sanitizeText(`Page ${pageIdx + 1} sur ${totalPages}`);
      const pageW = fontBold.widthOfTextAtSize(pageText, 7.5);
      p.drawText(pageText, {
        x: pageWidth - margin - pageW,
        y: footerY,
        size: 7.5,
        font: fontBold,
        color: colorNavy,
      });
    });

    const pdfBytes = await doc.save();
    const filename = `Calendrier-College-Isaac-Newton-${academicYear}.pdf`;

    return {
      pdfBytes,
      pageCount: totalPages,
      filename,
      downloadBlob: () => {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      },
    };
  },
};
