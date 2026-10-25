/**
 * Service de Génération PDF Officiel des Documents Pédagogiques & Règlements
 * Collège Isaac Newton - Direction des Études & Système d'Information
 * 
 * Génère des documents PDF 1.4 vectoriels natifs certifiés (ISO 32000-1) avec pdf-lib :
 * - Formats normalisés A4 et Letter
 * - En-tête officiel République d'Haïti / MENFP / Collège Isaac Newton
 * - Respect strict des marges, polices vectorielles Type-1 Helvetica, WinAnsi
 * - Tableaux, encadrés administratifs, sceaux officiels et emplacements de signature
 * - Téléchargement immédiat et traçabilité des téléchargements
 */

import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from 'pdf-lib';
import { DocumentFile, SchoolEvent, HonorRollStudent } from '../types';
import { calendarPdfService } from './calendarPdfService';
import { apiService } from './api';

export interface OfficialPdfOptions {
  paperFormat?: 'A4' | 'Letter';
  academicYear?: string;
}

export interface GeneratedPdfResult {
  pdfBytes: Uint8Array;
  pageCount: number;
  filename: string;
  downloadBlob: () => void;
}

/**
 * Nettoyage des caractères spéciaux pour compatibilité stricte WinAnsi (Helvetica)
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
 * Découpe un texte long en plusieurs lignes pour tenir dans une largeur max
 */
function wrapText(text: string, maxWidth: number, font: PDFFont, fontSize: number): string[] {
  const clean = sanitizeText(text);
  const words = clean.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

/**
 * Palette de couleurs institutionnelles Collège Isaac Newton
 */
const COLOR_NAVY = rgb(0.06, 0.16, 0.36);      // #0f295c
const COLOR_GOLD = rgb(0.85, 0.62, 0.12);      // #d99e1f
const COLOR_DARK = rgb(0.1, 0.13, 0.18);       // #1a212e
const COLOR_MUTED = rgb(0.4, 0.45, 0.52);      // #667385
const COLOR_BORDER = rgb(0.82, 0.85, 0.9);     // #d1d9e6
const COLOR_BG_LIGHT = rgb(0.96, 0.97, 0.99);  // #f5f8fc
const COLOR_BG_HEADER = rgb(0.92, 0.95, 0.99); // #ebf2fc

export const officialDocumentsPdfService = {
  /**
   * Identifie la catégorie et génère le PDF officiel approprié
   */
  async generateDocumentPdf(
    doc: DocumentFile,
    events: SchoolEvent[] = [],
    options: OfficialPdfOptions = {}
  ): Promise<GeneratedPdfResult> {
    const docId = doc.id.toLowerCase();
    const docTitle = doc.title.toLowerCase();

    // 1. Calendrier Académique
    if (doc.category === 'calendrier' || docId.includes('calendrier') || docTitle.includes('calendrier')) {
      return calendarPdfService.generateCalendarPdf(events, {
        paperFormat: options.paperFormat || 'A4',
        academicYear: options.academicYear || doc.schoolYear || '2026-2027',
      });
    }

    // 2. Règlement Intérieur
    if (doc.category === 'reglement' || docId.includes('reglement') || docTitle.includes('règlement') || docTitle.includes('reglement')) {
      return this.generateReglementInterieurPdf(options);
    }

    // 3. Fournitures Fondamental (7e à 9e AF)
    if (docTitle.includes('fondamental') || docId.includes('fondamental') || (doc.category === 'fournitures' && !docTitle.includes('secondaire'))) {
      return this.generateFournituresFondamentalPdf(options);
    }

    // 4. Fournitures Secondaire (NS1 à NS4)
    if (docTitle.includes('secondaire') || docId.includes('secondaire')) {
      return this.generateFournituresSecondairePdf(options);
    }

    // 5. Fiche Médicale
    if (doc.category === 'formulaires' || docId.includes('medical') || docTitle.includes('médicale') || docTitle.includes('medicale')) {
      return this.generateFicheMedicalePdf(options);
    }

    // 6. Guide d'admissions / Frais de scolarité
    if (docId.includes('admission') || docTitle.includes('admission') || docTitle.includes('frais') || docTitle.includes('ecolage')) {
      return this.generateGuideAdmissionsPdf(options);
    }

    // Document officiel générique certifié
    return this.generateGenericDocumentPdf(doc, options);
  },

  /**
   * Helper d'amorçage d'un nouveau document PDF avec pagination uniforme
   */
  async createBasePdfDocument(title: string, options: OfficialPdfOptions = {}) {
    const { paperFormat = 'A4', academicYear = '2026-2027' } = options;
    const isLetter = paperFormat === 'Letter';
    const pageWidth = isLetter ? 612 : 595.28;
    const pageHeight = isLetter ? 792 : 841.89;
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    const doc = await PDFDocument.create();
    doc.setTitle(`${title} - Collège Isaac Newton - ${academicYear}`);
    doc.setAuthor('Collège Isaac Newton');
    doc.setSubject(`Document Pédagogique Officiel - Session ${academicYear}`);
    doc.setCreator('Direction des Études & SI Collège Isaac Newton');

    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    const pages: PDFPage[] = [];

    const addOfficialPage = (pageTitle?: string): { page: PDFPage; startY: number } => {
      const page = doc.addPage([pageWidth, pageHeight]);
      pages.push(page);

      let y = pageHeight - 34;

      // République & Ministère
      page.drawText(sanitizeText("RÉPUBLIQUE D'HAÏTI · MENFP"), {
        x: margin,
        y,
        size: 7.5,
        font: fontBold,
        color: COLOR_MUTED,
      });

      const yearNotice = sanitizeText(`Année Académique ${academicYear}`);
      const yearNoticeW = fontBold.widthOfTextAtSize(yearNotice, 8);
      page.drawText(yearNotice, {
        x: pageWidth - margin - yearNoticeW,
        y,
        size: 8,
        font: fontBold,
        color: COLOR_GOLD,
      });

      y -= 13;
      // Nom du collège
      page.drawText(sanitizeText('COLLÈGE ISAAC NEWTON'), {
        x: margin,
        y,
        size: 13,
        font: fontBold,
        color: COLOR_NAVY,
      });

      const motto = sanitizeText("Savoir aujourd'hui, réussir demain");
      const mottoW = fontOblique.widthOfTextAtSize(motto, 8.5);
      page.drawText(motto, {
        x: pageWidth - margin - mottoW,
        y: y + 2,
        size: 8.5,
        font: fontOblique,
        color: COLOR_MUTED,
      });

      y -= 11;
      // Coordonnées du campus
      page.drawText(
        sanitizeText('Campus Delmas 50, rue Dominique #2 bis, Port-au-Prince · Tél : +509 3316-0934 / 3721-1818 · www.collegeisaacnewton.com'),
        {
          x: margin,
          y,
          size: 7,
          font: fontRegular,
          color: COLOR_MUTED,
        }
      );

      y -= 8;
      // Trait d'en-tête bleu institutionnel
      page.drawLine({
        start: { x: margin, y },
        end: { x: pageWidth - margin, y },
        thickness: 1.5,
        color: COLOR_NAVY,
      });

      y -= 16;
      if (pageTitle) {
        page.drawText(sanitizeText(pageTitle), {
          x: margin,
          y,
          size: 10.5,
          font: fontBold,
          color: COLOR_NAVY,
        });
        y -= 14;
      }

      return { page, startY: y };
    };

    const finalizePdf = async (customFilename: string): Promise<GeneratedPdfResult> => {
      const totalPages = pages.length;
      const editionDate = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      // Ajout du pied de page uniforme
      pages.forEach((p, idx) => {
        const footerY = 22;
        p.drawLine({
          start: { x: margin, y: footerY + 10 },
          end: { x: pageWidth - margin, y: footerY + 10 },
          thickness: 0.5,
          color: COLOR_BORDER,
        });

        p.drawText(sanitizeText('Collège Isaac Newton · Document certifié conforme pour usage scolaire et administratif'), {
          x: margin,
          y: footerY,
          size: 6.8,
          font: fontRegular,
          color: COLOR_MUTED,
        });

        const centerText = sanitizeText(`Certifié le ${editionDate}`);
        const centerW = fontRegular.widthOfTextAtSize(centerText, 6.8);
        p.drawText(centerText, {
          x: pageWidth / 2 - centerW / 2,
          y: footerY,
          size: 6.8,
          font: fontRegular,
          color: COLOR_MUTED,
        });

        const pageStr = sanitizeText(`Page ${idx + 1} / ${totalPages}`);
        const pageW = fontBold.widthOfTextAtSize(pageStr, 7.5);
        p.drawText(pageStr, {
          x: pageWidth - margin - pageW,
          y: footerY,
          size: 7.5,
          font: fontBold,
          color: COLOR_NAVY,
        });
      });

      const pdfBytes = await doc.save();
      const filename = `${customFilename}-${academicYear}.pdf`;

      return {
        pdfBytes,
        pageCount: totalPages,
        filename,
        downloadBlob: () => {
          const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
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
    };

    return {
      doc,
      pageWidth,
      pageHeight,
      margin,
      contentWidth,
      fontBold,
      fontRegular,
      fontOblique,
      pages,
      addOfficialPage,
      finalizePdf,
      academicYear,
    };
  },

  /**
   * 1. RÈGLEMENT INTÉRIEUR DU COLLÈGE ISAAC NEWTON (3 PAGES)
   */
  async generateReglementInterieurPdf(options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument('Règlement Intérieur du Collège Isaac Newton', options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    // --- PAGE 1 ---
    const { page: p1, startY: s1 } = addOfficialPage('RÈGLEMENT INTÉRIEUR · CHARTE DE VIE SCOLAIRE ET DE DISCIPLINE');
    let y = s1;

    // Titre d'ouverture encadré
    p1.drawRectangle({
      x: margin,
      y: y - 36,
      width: contentWidth,
      height: 40,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('RÈGLEMENT INTÉRIEUR GÉNÉRAL DE L’ÉTABLISSEMENT'), {
      x: margin + 12,
      y: y - 14,
      size: 11,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`Fichier officiel certifié applicable à tous les cycles d'enseignement pour l'année ${academicYear}.`),
      {
        x: margin + 12,
        y: y - 28,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 52;

    const drawSectionHeader = (page: PDFPage, currY: number, title: string): number => {
      page.drawText(sanitizeText(title), {
        x: margin,
        y: currY,
        size: 9.5,
        font: fontBold,
        color: COLOR_NAVY,
      });
      page.drawLine({
        start: { x: margin, y: currY - 3 },
        end: { x: margin + contentWidth, y: currY - 3 },
        thickness: 0.8,
        color: COLOR_GOLD,
      });
      return currY - 14;
    };

    const drawParagraph = (page: PDFPage, currY: number, label: string, text: string): number => {
      page.drawText(sanitizeText(label), {
        x: margin,
        y: currY,
        size: 8.5,
        font: fontBold,
        color: COLOR_DARK,
      });
      currY -= 11;
      const lines = wrapText(text, contentWidth, fontRegular, 8);
      lines.forEach((l) => {
        page.drawText(l, {
          x: margin,
          y: currY,
          size: 8,
          font: fontRegular,
          color: COLOR_DARK,
        });
        currY -= 10;
      });
      return currY - 4;
    };

    // Chapitre I : Préambule & Mission Éducative
    y = drawSectionHeader(p1, y, 'CHAPITRE I · PRÉAMBULE, MISSION & VALEURS ÉDUCATIVES');
    y = drawParagraph(
      p1,
      y,
      'Article 1 - Mission du Collège Isaac Newton :',
      'Le Collège Isaac Newton est une institution laïque d’excellence vouée à la formation académique, scientifique, humaine et civique des jeunes générations. Conformément aux programmes officiels du Ministère de l’Éducation Nationale (MENFP), l’établissement promeut la rigueur intellectuelle, la liberté de pensée, la probité et le respect universel.'
    );
    y = drawParagraph(
      p1,
      y,
      'Article 2 - Adhésion à la Charte :',
      'L’inscription d’un élève vaut acceptation expresse et sans réserve par l’élève et ses représentants légaux des dispositions du présent règlement. Chaque membre de la communauté scolaire s’engage à observer les règles de savoir-vivre et d’entraide.'
    );

    // Chapitre II : Horaires, Ponctualité et Assiduité
    y = drawSectionHeader(p1, y, 'CHAPITRE II · HORAIRES, PONCTUALITÉ ET RÉGIME DES PRÉSENCES');
    y = drawParagraph(
      p1,
      y,
      'Article 3 - Horaires officiels et fermeture des grilles :',
      'L’accès au campus s’effectue dès 07h15 du lundi au vendredi. Les cours débutent impérativement à 07h30. Les grilles sont closes à 07h45. Tout élève arrivant après la fermeture doit obligatoirement obtenir un billet d’entrée au secrétariat avant de regagner sa classe.'
    );
    y = drawParagraph(
      p1,
      y,
      'Article 4 - Justification des retards et absences :',
      'Toute absence doit être signalée par le représentant légal au secrétariat avant 09h00 (Tél : +509 3316-0934). Dès son retour, l’élève doit présenter un justificatif écrit ou certificat médical au bureau de la vie scolaire avant toute réadmission en classe.'
    );

    // Chapitre III : Tenue Vestimentaire & Présentation
    y = drawSectionHeader(p1, y, 'CHAPITRE III · TENUE VESTIMENTAIRE ET PRÉSENTATION CORPORELLE');
    y = drawParagraph(
      p1,
      y,
      'Article 5 - Uniforme réglementaire obligatoire :',
      'L’uniforme officiel du Collège Isaac Newton est rigoureusement obligatoire : pantalon bleu marine classique (garçons) ou jupe plissée sous le genou (filles), polo blanc officiel brodé de l’écusson de l’institution, chaussettes blanches et chaussures fermées noires cirées. La tenue de sport officielle est réservée exclusivement aux jours d’Éducation Physique.'
    );
    y = drawParagraph(
      p1,
      y,
      'Article 6 - Présentation et bienséance :',
      'Une coiffure sobre, soignée et décente est exigée pour tous les apprenants. Les bijoux de valeur, le maquillage ostentatoire, les casquettes et tenues fantaisistes sont formellement prohibés au sein de l’enceinte scolaire.'
    );

    // --- PAGE 2 ---
    const { page: p2, startY: s2 } = addOfficialPage('RÈGLEMENT INTÉRIEUR · DISCIPLINE, ÉVALUATIONS & SANCTIONS');
    y = s2;

    // Chapitre IV : Discipline, Ordre & Objets Interdits
    y = drawSectionHeader(p2, y, 'CHAPITRE IV · DISCIPLINE, SÉCURITÉ ET OBJETS PROHIBÉS');
    y = drawParagraph(
      p2,
      y,
      'Article 7 - Interdiction stricte des smartphones et objets connectés :',
      'L’usage des téléphones portables, écouteurs, montres connectées et consoles est strictement interdit aux élèves dans toute l’enceinte de l’établissement (cours, récréations, couloirs). Tout appareil allumé ou visible sera immédiatement confisqué et remis uniquement aux parents.'
    );
    y = drawParagraph(
      p2,
      y,
      'Article 8 - Probité, respect et zéro tolérance pour la violence :',
      'Tout acte de violence physique ou verbale, harcèlement, racket, insulte envers le personnel ou les camarades entraîne une exclusion immédiate à titre conservatoire. Le respect des équipements, des laboratoires scientifiques et du mobilier du collège est une obligation absolue.'
    );

    // Chapitre V : Régime des Études, Contrôles et Examens MENFP
    y = drawSectionHeader(p2, y, 'CHAPITRE V · ORGANISATION DES ÉTUDES, MOYENNES ET CONTRÔLES');
    y = drawParagraph(
      p2,
      y,
      'Article 9 - Les 4 Contrôles Périodiques Annuels :',
      'L’année académique est scandée par quatre (4) périodes officielles d’évaluation. La présence aux examens de contrôle est obligatoire. Toute absence non médicale dûment attestée entraîne la note zéro (0). Les carnets de notes sont remis en mains propres aux parents lors de journées dédiées.'
    );
    y = drawParagraph(
      p2,
      y,
      'Article 10 - Conditions de passage de classe :',
      'Le passage en classe supérieure exige une moyenne annuelle minimale de 6.00/10 en Cycle Fondamental et de 65/100 en Nouveau Secondaire, ainsi que la validation des matières fondamentales. Toute fraude ou tentative de tricherie aux épreuves entraîne l’attribution immédiate du zéro et la saisine du Conseil de Discipline.'
    );

    // Chapitre VI : Échelle des Sanctions Disciplinaires
    y = drawSectionHeader(p2, y, 'CHAPITRE VI · ÉCHELLE GRADUÉE DES SANCTIONS DISCIPLINAIRES');
    y = drawParagraph(
      p2,
      y,
      'Article 11 - Gradation des sanctions :',
      'En fonction de la gravité des manquements, les sanctions applicables sont : 1. Rappel à l’ordre oral ; 2. Avertissement écrit avec mention au dossier ; 3. Blâme officiel notifié aux parents ; 4. Retenue de travail le samedi matin (08h00 - 12h00) ; 5. Exclusion temporaire de 1 à 8 jours ; 6. Exclusion définitive prononcée par le Conseil de Discipline.'
    );

    // --- PAGE 3 ---
    const { page: p3, startY: s3 } = addOfficialPage('RÈGLEMENT INTÉRIEUR · CONSEIL DE DISCIPLINE & ENGAGEMENTS');
    y = s3;

    // Chapitre VII : Conseil de Discipline
    y = drawSectionHeader(p3, y, 'CHAPITRE VII · FONCTIONNEMENT DU CONSEIL DE DISCIPLINE');
    y = drawParagraph(
      p3,
      y,
      'Article 12 - Composition et délibérations :',
      'Le Conseil de Discipline est présidé par le Directeur Pédagogique et comprend le Responsable de la Vie Scolaire, deux professeurs délégués, le délégué de classe et le représentant de l’Association des Parents. L’élève et ses représentants légaux sont préalablement entendus. Les décisions du Conseil sont souveraines et sans appel.'
    );

    // Chapitre VIII : Relations Familles-Établissement & Numérique
    y = drawSectionHeader(p3, y, 'CHAPITRE VIII · RELATIONS FAMILLE-ÉCOLE & PORTAIL NUMÉRIQUE');
    y = drawParagraph(
      p3,
      y,
      'Article 13 - Suivi pédagogique et communications :',
      'Les familles ont le devoir de consulter régulièrement le portail numérique sécurisé du Collège (notes, assiduité, devoirs) et de se présenter aux convocations pédagogiques. Les parents veillent à ce que les devoirs et le travail personnel soient effectués avec soin et régularité.'
    );

    // Encadré officiel des signatures
    y -= 10;
    p3.drawRectangle({
      x: margin,
      y: y - 110,
      width: contentWidth,
      height: 110,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });

    p3.drawText(sanitizeText('ENGAGEMENT ET HOMOLOGATION OFFICIELLE'), {
      x: margin + 12,
      y: y - 16,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });

    p3.drawText(
      sanitizeText('Fait à Port-au-Prince, certifié conforme et exécutoire pour la rentrée académique.'),
      {
        x: margin + 12,
        y: y - 30,
        size: 8,
        font: fontOblique,
        color: COLOR_MUTED,
      }
    );

    // Signatures colonnes
    const colW = (contentWidth - 24) / 3;
    const sigY = y - 50;

    // Col 1 : Parent
    p3.drawText(sanitizeText('Le Responsable Légal'), {
      x: margin + 12,
      y: sigY,
      size: 8,
      font: fontBold,
      color: COLOR_DARK,
    });
    p3.drawText(sanitizeText('(Mention manuscrite "Lu et approuvé")'), {
      x: margin + 12,
      y: sigY - 10,
      size: 7,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    p3.drawText(sanitizeText('Signature : ...................................'), {
      x: margin + 12,
      y: sigY - 40,
      size: 7.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });

    // Col 2 : Élève
    p3.drawText(sanitizeText('L’Élève'), {
      x: margin + 12 + colW,
      y: sigY,
      size: 8,
      font: fontBold,
      color: COLOR_DARK,
    });
    p3.drawText(sanitizeText('(Engagement formel d’honneur)'), {
      x: margin + 12 + colW,
      y: sigY - 10,
      size: 7,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    p3.drawText(sanitizeText('Signature : ...................................'), {
      x: margin + 12 + colW,
      y: sigY - 40,
      size: 7.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });

    // Col 3 : Direction
    p3.drawText(sanitizeText('Pour le Collège Isaac Newton'), {
      x: margin + 12 + colW * 2,
      y: sigY,
      size: 8,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p3.drawText(sanitizeText('La Direction des Études & SI'), {
      x: margin + 12 + colW * 2,
      y: sigY - 10,
      size: 7,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    p3.drawText(sanitizeText('[Sceau Officiel Apposé & Certifié]'), {
      x: margin + 12 + colW * 2,
      y: sigY - 40,
      size: 7.5,
      font: fontBold,
      color: COLOR_GOLD,
    });

    return finalizePdf('Reglement-Interieur-College-Isaac-Newton');
  },

  /**
   * 2. LISTE DES FOURNITURES SCOLAIRES - CYCLE FONDAMENTAL (7e à 9e AF) (2 PAGES)
   */
  async generateFournituresFondamentalPdf(options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument('Fournitures Scolaires - Cycle Fondamental (7e à 9e AF)', options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    // --- PAGE 1 ---
    const { page: p1, startY: s1 } = addOfficialPage('LISTE OFFICIELLE DES FOURNITURES · CYCLE FONDAMENTAL (7e, 8e, 9e AF)');
    let y = s1;

    // Notice en-tête
    p1.drawRectangle({
      x: margin,
      y: y - 36,
      width: contentWidth,
      height: 40,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('CYCLE FONDAMENTAL · 3ème CYCLE (7ème, 8ème & 9ème ANNÉES FONDAMENTALES)'), {
      x: margin + 12,
      y: y - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`Ouvrages agréés par le Ministère (MENFP) et matériel requis dès le 1er jour de classe (${academicYear}).`),
      {
        x: margin + 12,
        y: y - 28,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 50;

    const drawItem = (page: PDFPage, currY: number, title: string, desc: string): number => {
      page.drawText(sanitizeText(`- ${title}`), {
        x: margin + 4,
        y: currY,
        size: 8.5,
        font: fontBold,
        color: COLOR_NAVY,
      });
      currY -= 10;
      const lines = wrapText(desc, contentWidth - 16, fontRegular, 8);
      lines.forEach((l) => {
        page.drawText(l, {
          x: margin + 12,
          y: currY,
          size: 8,
          font: fontRegular,
          color: COLOR_DARK,
        });
        currY -= 10;
      });
      return currY - 3;
    };

    // SECTION I : MANUELS SCOLAIRES OBLIGATOIRES
    p1.drawText(sanitizeText('I. MANUELS SCOLAIRES OBLIGATOIRES (PROGRAMME OFFICIEL MENFP)'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p1, y, 'Français & Grammaire :', 'Grammaire pour le Collège (Édition agréée), recueil de textes et fiches de vocabulaire.');
    y = drawItem(p1, y, 'Kreyòl Ayisyen :', 'Gwo liv Kreyòl pou Fondamantal, lekti ak gramè kreyòl (dènye edisyon MENFP).');
    y = drawItem(p1, y, 'Mathématiques :', 'Maths 7e / 8e / 9e AF (Collection enrichie avec exercices d’algèbre, géométrie et arithmétique).');
    y = drawItem(p1, y, 'Sciences Expérimentales & Technologie :', 'Manuel de SVT et Physique élémentaire du 3e cycle fondamental.');
    y = drawItem(p1, y, 'Sciences Sociales (Histoire & Géographie) :', 'Histoire d’Haïti et Géographie nationale et universelle (Édition conforme au référentiel d’État).');
    y = drawItem(p1, y, 'Langues Vivantes (Anglais & Espagnol) :', 'Méthode d’initiation communicative Anglais Step-by-Step & Espagnol Paso a Paso.');

    // SECTION II : DICTIONNAIRES INDISPENSABLES
    y -= 4;
    p1.drawText(sanitizeText('II. DICTIONNAIRES & OUVRAGES DE RÉFÉRENCE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p1, y, 'Dictionnaire de la langue française :', 'Le Petit Larousse Illustré ou Le Robert Collège (indispensable à domicile et pour les épreuves).');
    y = drawItem(p1, y, 'Dictionnaire Bilingue :', 'Dictionnaire Français-Anglais / Anglais-Français (format poche autorisé).');
    y = drawItem(p1, y, 'Dictionnaire Kreyòl :', 'Diksyonè Kreyòl-Franse pou travay rechèch.');

    // --- PAGE 2 ---
    const { page: p2, startY: s2 } = addOfficialPage('LISTE OFFICIELLE DES FOURNITURES · PAPETERIE, MATÉRIEL & TENUE SPORT');
    y = s2;

    // SECTION III : PAPETERIE & CAHIERS
    p2.drawText(sanitizeText('III. PAPETERIE ET CAHIERS RÉGLEMENTAIRES'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p2, y, 'Cahiers grand format (200 pages) :', '6 cahiers 200 pages quadrillés 5x5 (Français, Maths, Kreyòl, Sciences, Histoire/Géo, Anglais/Espagnol).');
    y = drawItem(p2, y, 'Cahiers format moyen (100 pages) :', '4 cahiers 100 pages lignés pour devoirs à la maison, brouillons dirigés et TP.');
    y = drawItem(p2, y, 'Protège-cahiers & Étiquettes :', 'Protège-cahiers plastiques transparents ou bleu marine + étiquettes normalisées au nom de l’élève.');
    y = drawItem(p2, y, 'Copies d’examens :', '1 paquet de copies doubles perforées quadrillées pour les 4 contrôles périodiques.');

    // SECTION IV : MATÉRIEL TECHNIQUE & TROUSSE
    y -= 4;
    p2.drawText(sanitizeText('IV. INSTRUMENTS GÉOMÉTRIQUES & TROUSSE COMPLÈTE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p2, y, 'Boîte de géométrie métallique complète :', 'Règle plate 30 cm graduée incassable, équerre 60°, équerre 45°, rapporteur 180°, compas de précision.');
    y = drawItem(p2, y, 'Trousse scolaire :', '4 stylos à bille (bleu, noir, rouge, vert), 2 crayons HB, 1 gomme blanche propre, taille-crayon avec réservoir, bâton de colle, ciseaux à bouts ronds, 1 boîte de 12 crayons de couleur.');
    y = drawItem(p2, y, 'Calculatrice pour 9e AF :', 'Calculatrice scientifique standard autorisée aux épreuves d’État de 9e AF.');

    // SECTION V : ÉDUCATION PHYSIQUE & CONSIGNES
    y -= 4;
    p2.drawText(sanitizeText('V. TENUE D’ÉDUCATION PHYSIQUE ET SPORTIVE (EPS) & RECOMMANDATIONS'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p2, y, 'Équipement de sport :', 'T-shirt de sport du Collège Isaac Newton, short ou pantalon de survêtement bleu marine, espadrilles à semelle blanche.');
    y = drawItem(p2, y, 'Marquage nominatif impératif :', 'Tous les manuels, cahiers, boîtes de géométrie et vêtements de sport doivent impérativement être marqués au nom et prénom de l’élève.');

    return finalizePdf('Fournitures-Fondamental-7e-9e-College-Isaac-Newton');
  },

  /**
   * 3. LISTE DES FOURNITURES SCOLAIRES - SECONDAIRE (NS1 à NS4) (2 PAGES)
   */
  async generateFournituresSecondairePdf(options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument('Fournitures Scolaires - Nouveau Secondaire (NS1 à NS4)', options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    // --- PAGE 1 ---
    const { page: p1, startY: s1 } = addOfficialPage('LISTE OFFICIELLE DES FOURNITURES · NOUVEAU SECONDAIRE (NS1, NS2, NS3, NS4)');
    let y = s1;

    // Notice en-tête
    p1.drawRectangle({
      x: margin,
      y: y - 36,
      width: contentWidth,
      height: 40,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('CYCLES DU NOUVEAU SECONDAIRE · SÉRIES SVT, SMP, LLA & SES'), {
      x: margin + 12,
      y: y - 14,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`Manuels de préparation au Baccalauréat Unique MENFP et équipements de laboratoire (${academicYear}).`),
      {
        x: margin + 12,
        y: y - 28,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 50;

    const drawItem = (page: PDFPage, currY: number, title: string, desc: string): number => {
      page.drawText(sanitizeText(`- ${title}`), {
        x: margin + 4,
        y: currY,
        size: 8.5,
        font: fontBold,
        color: COLOR_NAVY,
      });
      currY -= 10;
      const lines = wrapText(desc, contentWidth - 16, fontRegular, 8);
      lines.forEach((l) => {
        page.drawText(l, {
          x: margin + 12,
          y: currY,
          size: 8,
          font: fontRegular,
          color: COLOR_DARK,
        });
        currY -= 10;
      });
      return currY - 3;
    };

    // SECTION I : MANUELS DE RÉFÉRENCE NOUVEAU SECONDAIRE
    p1.drawText(sanitizeText('I. OUVRAGES DE RÉFÉRENCE & PROGRAMME MENFP DU NOUVEAU SECONDAIRE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p1, y, 'Mathématiques Supérieures (NS1-NS4) :', 'Manuel conforme au programme du Nouveau Secondaire (Analyse, Algèbre linéaire, Probabilités & Géométrie dans l’espace).');
    y = drawItem(p1, y, 'Physique & Chimie Appliquées :', 'Physique générale (Mécanique, Électricité, Optique ondulatoire) et Chimie générale & organique.');
    y = drawItem(p1, y, 'Sciences de la Vie et de la Terre (SVT) :', 'Biologie cellulaire, Génétique, Écologie et Géologie contemporaine.');
    y = drawItem(p1, y, 'Philosophie & Épistémologie (NS3 & NS4) :', 'Anthologie des textes philosophiques, méthodologie de la dissertation et du commentaire de texte.');
    y = drawItem(p1, y, 'Littérature Haïtienne & Universelle :', 'Anthologie de la littérature haïtienne des origines à nos jours et chefs-d’œuvre de la francophonie.');
    y = drawItem(p1, y, 'Histoire, Géographie & Économie :', 'Histoire contemporaine d’Haïti et du bassin caribéen, Économie générale et institutions civiques.');

    // SECTION II : CALCULATRICE SCIENTIFIQUE CERTIFIÉE
    y -= 4;
    p1.drawText(sanitizeText('II. CALCULATRICE SCIENTIFIQUE AGRÉÉE MENFP'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(
      p1,
      y,
      'Calculatrice scientifique agréée examens :',
      'Calculatrice scientifique non programmable avec fonctions trigonométriques, statistiques, matrices et tableurs (ex: Casio fx-82ES / fx-991ES Plus ou Texas Instruments TI-30X). Les calculatrices programmables et smartphones sont strictement interdits aux examens du Bac.'
    );

    // --- PAGE 2 ---
    const { page: p2, startY: s2 } = addOfficialPage('LISTE OFFICIELLE DES FOURNITURES · LABORATOIRE, PAPETERIE & BAC');
    y = s2;

    // SECTION III : ÉQUIPEMENT DE LABORATOIRE OBLIGATOIRE
    p2.drawText(sanitizeText('III. ÉQUIPEMENT DE LABORATOIRE SCIENTIFIQUE (OBLIGATOIRE DÈS NS1)'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(
      p2,
      y,
      'Blouse de laboratoire en coton blanc :',
      'Blouse blanche 100% coton, manches longues avec boutons-pression (les matières synthétiques inflammables sont strictement interdites pour raisons de sécurité chimique).'
    );
    y = drawItem(
      p2,
      y,
      'Protection oculaire certifiée :',
      '1 paire de lunettes de sécurité transparentes pour les travaux pratiques de manipulation des réactifs.'
    );
    y = drawItem(
      p2,
      y,
      'Cahier de travaux pratiques de laboratoire :',
      '1 grand cahier de TP avec pages alternées (une page quadrillée, une page unie pour schémas et graphiques d’expérimentation).'
    );

    // SECTION IV : PAPETERIE & CLASSEURS
    y -= 4;
    p2.drawText(sanitizeText('IV. PAPETERIE SPÉCIFIQUE DU SECONDAIRE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawItem(p2, y, 'Classeurs à levier & Intercalaires :', '2 classeurs grand format A4 avec jeux d’intercalaires pour l’archivage des fiches de synthèse de terminale.');
    y = drawItem(p2, y, 'Cahiers grand format (24x32 cm, 192 pages) :', '6 cahiers 192 pages pour les disciplines fondamentales.');
    y = drawItem(p2, y, 'Copies doubles et millimétrées :', '2 paquets de copies doubles perforées et 1 pochette de papier millimétré pour les devoirs surveillés.');

    // SECTION V : RECOMMANDATION DU COMITÉ PÉDAGOGIQUE
    y -= 6;
    p2.drawRectangle({
      x: margin,
      y: y - 55,
      width: contentWidth,
      height: 55,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p2.drawText(sanitizeText('AVIS AUX CANDIDATS DU BACCALAURÉAT UNIQUE (NS4) :'), {
      x: margin + 10,
      y: y - 16,
      size: 8.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawText(
      sanitizeText('La préparation au Baccalauréat d’État MENFP s’effectue dès la classe de NS1. L’assiduité aux séances intensives du samedi matin et la possession de l’ensemble des ouvrages de référence sont impératives pour garantir la réussite aux examens officiels.'),
      {
        x: margin + 10,
        y: y - 32,
        size: 7.5,
        font: fontRegular,
        color: COLOR_DARK,
      }
    );

    return finalizePdf('Fournitures-Secondaire-NS1-NS4-College-Isaac-Newton');
  },

  /**
   * 4. FICHE MÉDICALE ET AUTORISATION DE SOINS D'URGENCE (2 PAGES)
   */
  async generateFicheMedicalePdf(options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument('Fiche Médicale et Autorisation de Soins d’Urgence', options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    // --- PAGE 1 ---
    const { page: p1, startY: s1 } = addOfficialPage('FICHE MÉDICALE CONFIDENTIELLE & PROTOCOLE D’URGENCE');
    let y = s1;

    // Notice de confidentialité
    p1.drawRectangle({
      x: margin,
      y: y - 34,
      width: contentWidth,
      height: 38,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('DOCUMENT MÉDICAL CONFIDENTIEL SOUMIS AU SECRET PROFESSIONNEL'), {
      x: margin + 12,
      y: y - 13,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`À compléter impérativement par le responsable légal et le médecin traitant avant la rentrée (${academicYear}).`),
      {
        x: margin + 12,
        y: y - 27,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 48;

    // CADRE 1 : IDENTIFICATION DE L'ÉLÈVE
    p1.drawText(sanitizeText('CADRE 1 · ÉTAT CIVIL DE L’ÉLÈVE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    const drawFormField = (page: PDFPage, currY: number, label: string, dotsLength: number = 40): number => {
      page.drawText(sanitizeText(label), {
        x: margin + 6,
        y: currY,
        size: 8,
        font: fontBold,
        color: COLOR_DARK,
      });
      page.drawText(sanitizeText('.'.repeat(dotsLength)), {
        x: margin + 160,
        y: currY,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      });
      return currY - 14;
    };

    y = drawFormField(p1, y, 'Nom de l’élève :');
    y = drawFormField(p1, y, 'Prénom(s) :');
    y = drawFormField(p1, y, 'Date et lieu de naissance :');
    y = drawFormField(p1, y, 'Sexe & Classe d’affectation :');
    y = drawFormField(p1, y, 'Groupe Sanguin & Facteur Rhésus :');

    // CADRE 2 : PERSONNES À CONTACTER EN PRIORITÉ 24H/24
    y -= 4;
    p1.drawText(sanitizeText('CADRE 2 · CONTACTS D’URGENCE FAMILLE & MÉDECIN TRAITANT'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawFormField(p1, y, 'Père / Tuteur légal (Nom & Tél) :');
    y = drawFormField(p1, y, 'Mère / Tutrice légale (Nom & Tél) :');
    y = drawFormField(p1, y, 'Téléphone d’urgence alternatif :');
    y = drawFormField(p1, y, 'Adresse du domicile :');
    y = drawFormField(p1, y, 'Médecin traitant de famille (Nom/Tél) :');

    // CADRE 3 : ANTÉCÉDENTS ET PATHOLOGIES
    y -= 4;
    p1.drawText(sanitizeText('CADRE 3 · ANTÉCÉDENTS MÉDICAUX, ALLERGIES & TRAITEMENTS'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawFormField(p1, y, 'Allergies connues (Aliments, Médicaments) :');
    y = drawFormField(p1, y, 'Asthme ou affections respiratoires :');
    y = drawFormField(p1, y, 'Affections cardiaques, diabète ou épilepsie :');
    y = drawFormField(p1, y, 'Port de verres correcteurs / lentilles :');
    y = drawFormField(p1, y, 'Traitement médical régulier en cours :');

    // --- PAGE 2 ---
    const { page: p2, startY: s2 } = addOfficialPage('FICHE MÉDICALE · DÉCHARGE LÉGALE & CERTIFICAT D’APTITUDE');
    y = s2;

    // CADRE 4 : CALENDRIER VACCINAL
    p2.drawText(sanitizeText('CADRE 4 · VACCINATIONS OBLIGATOIRES À JOUR (MENFP / MSPP)'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    y = drawFormField(p2, y, 'DTC-Polio (Dernier rappel) :');
    y = drawFormField(p2, y, 'Rougeole - Rubéole - Oreillons (ROR) :');
    y = drawFormField(p2, y, 'Hépatite B & Tétanos :');

    // CADRE 5 : AUTORISATION D'URGENCE ET DÉCHARGE PARENTALE
    y -= 6;
    p2.drawText(sanitizeText('CADRE 5 · AUTORISATION PARENTALE EXPRESSE DE SOINS D’URGENCE'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    p2.drawRectangle({
      x: margin,
      y: y - 70,
      width: contentWidth,
      height: 70,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_NAVY,
      borderWidth: 0.8,
    });
    const decharge = 
      'Je soussigné(e), représentant légal de l’élève susnommé, autorise expressément la Direction du Collège Isaac Newton et le personnel de santé scolaire à faire dispenser tous les soins d’urgence requis par l’état de mon enfant. En cas d’urgence vitale absolue ou de nécessité chirurgicale immédiate, j’autorise le transfert de mon enfant vers l’établissement hospitalier conventionné le plus proche par ambulance médicalisée.';
    const dechargeLines = wrapText(decharge, contentWidth - 20, fontRegular, 7.5);
    let dy = y - 14;
    dechargeLines.forEach((l) => {
      p2.drawText(l, { x: margin + 10, y: dy, size: 7.5, font: fontRegular, color: COLOR_DARK });
      dy -= 10;
    });
    y -= 80;

    // CADRE 6 : CERTIFICAT D'APTITUDE DU MÉDECIN TRAITANT
    p2.drawText(sanitizeText('CADRE 6 · CERTIFICAT MÉDICAL D’APTITUDE (RÉSERVÉ AU MÉDECIN)'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 14;

    p2.drawText(sanitizeText('Je certifie avoir examiné l’élève ce jour et atteste qu’il/elle :'), {
      x: margin + 6,
      y,
      size: 8,
      font: fontRegular,
      color: COLOR_DARK,
    });
    y -= 13;
    p2.drawText(sanitizeText('[  ] Ne présente aucune contre-indication à la pratique des activités physiques et sportives.'), {
      x: margin + 14,
      y,
      size: 8,
      font: fontRegular,
      color: COLOR_DARK,
    });
    y -= 12;
    p2.drawText(sanitizeText('[  ] Présente des restrictions d’effort physique (préciser la nature et la durée) :'), {
      x: margin + 14,
      y,
      size: 8,
      font: fontRegular,
      color: COLOR_DARK,
    });
    y -= 16;
    p2.drawText(sanitizeText('Observations du praticien : ............................................................................................'), {
      x: margin + 14,
      y,
      size: 8,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    y -= 26;

    // Cadre double signature
    p2.drawRectangle({
      x: margin,
      y: y - 65,
      width: contentWidth,
      height: 65,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 0.8,
    });
    const halfW = (contentWidth - 20) / 2;
    p2.drawText(sanitizeText('Date & Signature des Parents :'), {
      x: margin + 10,
      y: y - 14,
      size: 8,
      font: fontBold,
      color: COLOR_DARK,
    });
    p2.drawText(sanitizeText('Date : ....................... Signature : .......................'), {
      x: margin + 10,
      y: y - 45,
      size: 7.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });

    p2.drawText(sanitizeText('Cachet & Signature du Médecin traitant :'), {
      x: margin + 10 + halfW,
      y: y - 14,
      size: 8,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p2.drawText(sanitizeText('N° d’Ordre Médical : ....................... [Cachet requis]'), {
      x: margin + 10 + halfW,
      y: y - 45,
      size: 7.5,
      font: fontBold,
      color: COLOR_GOLD,
    });

    return finalizePdf('Fiche-Medicale-Urgence-College-Isaac-Newton');
  },

  /**
   * 5. GUIDE DES ADMISSIONS & BAREME DES FRAIS DE SCOLARITÉ (2 PAGES)
   */
  async generateGuideAdmissionsPdf(options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument('Guide des Admissions & Barème des Frais de Scolarité', options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    const { page: p1, startY: s1 } = addOfficialPage('GUIDE OFFICIEL DES ADMISSIONS & GRILLE TARIFAIRE');
    let y = s1;

    p1.drawRectangle({
      x: margin,
      y: y - 36,
      width: contentWidth,
      height: 40,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('PROCÉDURE D’INSCRIPTION ET CONDITIONS D’ÉCOLAGE'), {
      x: margin + 12,
      y: y - 14,
      size: 10,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`Dispositions financières, calendrier des versements et pièces administratives pour la session ${academicYear}.`),
      {
        x: margin + 12,
        y: y - 28,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 52;

    const drawSection = (page: PDFPage, currY: number, title: string, items: { label: string; text: string }[]): number => {
      page.drawText(sanitizeText(title), {
        x: margin,
        y: currY,
        size: 9.5,
        font: fontBold,
        color: COLOR_NAVY,
      });
      page.drawLine({ start: { x: margin, y: currY - 3 }, end: { x: margin + contentWidth, y: currY - 3 }, thickness: 0.8, color: COLOR_GOLD });
      currY -= 14;

      items.forEach((it) => {
        page.drawText(sanitizeText(`- ${it.label}`), {
          x: margin + 4,
          y: currY,
          size: 8.5,
          font: fontBold,
          color: COLOR_NAVY,
        });
        currY -= 10;
        const lines = wrapText(it.text, contentWidth - 16, fontRegular, 8);
        lines.forEach((l) => {
          page.drawText(l, { x: margin + 12, y: currY, size: 8, font: fontRegular, color: COLOR_DARK });
          currY -= 10;
        });
        currY -= 3;
      });
      return currY - 4;
    };

    y = drawSection(p1, y, 'I. PIÈCES ADMINISTRATIVES CONSTITUTIVES DU DOSSIER', [
      {
        label: 'Extrait d’acte de naissance ou jugement déclaratif :',
        text: 'Document officiel légalisé par les Archives Nationales d’Haïti ou certifié conforme.',
      },
      {
        label: 'Relevés de notes des deux (2) dernières années scolaires :',
        text: 'Bulletins certifiés portant le visa et le sceau de l’école de provenance.',
      },
      {
        label: 'Certificat de passage de classe :',
        text: 'Attestation de promotion délivrée par la direction de l’établissement d’origine.',
      },
      {
        label: 'Photos d’identité :',
        text: 'Quatre (4) photos récentes format passeport (fond blanc, oreilles dégagées).',
      },
    ]);

    y = drawSection(p1, y, 'II. ÉCHELONNEMENT DE L’ÉCOLAGE & CONDITIONS DE VERSEMENT', [
      {
        label: 'Tranche 1 (À l’inscription ou réinscription) :',
        text: '40% du montant global de la scolarité annuelle + frais d’assurance scolaire et d’accès aux plateformes numériques.',
      },
      {
        label: 'Tranche 2 (Au plus tard le 27 novembre 2026) :',
        text: '20% du montant global avant la remise des bulletins du 1er contrôle.',
      },
      {
        label: 'Tranche 3 (Au plus tard le 19 février 2027) :',
        text: '20% du montant global avant la remise des bulletins du 2e contrôle.',
      },
      {
        label: 'Tranche 4 (Au plus tard le 30 avril 2027) :',
        text: 'Solde final de 20% requis avant la session des épreuves de fin d’année.',
      },
    ]);

    // Coordonnées bancaires
    p1.drawRectangle({
      x: margin,
      y: y - 55,
      width: contentWidth,
      height: 55,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('COMPTES BANCAIRES OFFICIELS POUR VIREMENT OU DÉPÔT :'), {
      x: margin + 10,
      y: y - 14,
      size: 8.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText('SOGEBANK (Gourdes) : Compte N° 102-4019-824 · Titulaire : Collège Isaac Newton\nUNIBANK (Gourdes) : Compte N° 201-9844-311 · Titulaire : Collège Isaac Newton\n(Toujours mentionner le nom de l’élève et sa classe sur le bordereau de dépôt bancaire).'),
      {
        x: margin + 10,
        y: y - 28,
        size: 7.5,
        font: fontRegular,
        color: COLOR_DARK,
      }
    );

    return finalizePdf('Guide-Admissions-Frais-Scolarite-College-Isaac-Newton');
  },

  /**
   * 6. DOCUMENT GÉNÉRIQUE CERTIFIÉ POUR TOUT AUTRE DOCUMENT DE LA BASE
   */
  async generateGenericDocumentPdf(doc: DocumentFile, options: OfficialPdfOptions = {}): Promise<GeneratedPdfResult> {
    const base = await this.createBasePdfDocument(doc.title, options);
    const { addOfficialPage, fontBold, fontRegular, fontOblique, margin, contentWidth, finalizePdf, academicYear } = base;

    const { page: p1, startY: s1 } = addOfficialPage(doc.title.toUpperCase());
    let y = s1;

    p1.drawRectangle({
      x: margin,
      y: y - 44,
      width: contentWidth,
      height: 44,
      color: COLOR_BG_HEADER,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText(doc.title), {
      x: margin + 12,
      y: y - 16,
      size: 10,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`${doc.description || 'Document officiel validé par la Direction Pédagogique'} · Session ${doc.schoolYear || academicYear}`),
      {
        x: margin + 12,
        y: y - 32,
        size: 8,
        font: fontRegular,
        color: COLOR_MUTED,
      }
    );
    y -= 60;

    p1.drawText(sanitizeText('DISPOSITIONS OFFICIELLES ET RECOMMANDATIONS'), {
      x: margin,
      y,
      size: 9.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawLine({ start: { x: margin, y: y - 3 }, end: { x: margin + contentWidth, y: y - 3 }, thickness: 0.8, color: COLOR_GOLD });
    y -= 16;

    const bodyText = `Le présent document officiel émis par le Collège Isaac Newton est certifié conforme pour l'exercice académique ${doc.schoolYear || academicYear}. Il s'adresse aux élèves, aux parents et au personnel de l'établissement.\n\nToute reproduction ou diffusion doit conserver les mentions légales, le logo ainsi que le sceau certifié de l'institution. Pour toute précision ou demande d'attestation complémentaire, le secrétariat pédagogique reste joignable au +509 3316-0934 ou par courriel à contact@collegeisaacnewton.com.`;
    const lines = wrapText(bodyText, contentWidth, fontRegular, 8.5);
    lines.forEach((l) => {
      p1.drawText(l, { x: margin, y, size: 8.5, font: fontRegular, color: COLOR_DARK });
      y -= 12;
    });

    y -= 30;
    p1.drawRectangle({
      x: margin,
      y: y - 60,
      width: contentWidth,
      height: 60,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });
    p1.drawText(sanitizeText('HOMOLOGATION DU SECRÉTARIAT GÉNÉRAL :'), {
      x: margin + 10,
      y: y - 16,
      size: 8.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    p1.drawText(
      sanitizeText(`Réf. archivage : CIN-DOC-${doc.id.toUpperCase()} · Fichier vérifié et intègre au catalogue de l'établissement.`),
      {
        x: margin + 10,
        y: y - 32,
        size: 8,
        font: fontOblique,
        color: COLOR_MUTED,
      }
    );

    const safeSlug = doc.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return finalizePdf(safeSlug);
  },

  /**
   * Action complète : Génère et lance le téléchargement immédiat + enregistre la statistique
   */
  async downloadDocumentPdf(
    doc: DocumentFile,
    events: SchoolEvent[] = [],
    options: OfficialPdfOptions = {}
  ): Promise<GeneratedPdfResult> {
    const result = await this.generateDocumentPdf(doc, events, options);
    result.downloadBlob();
    try {
      await apiService.recordDocumentDownload(doc.id);
    } catch {
      // Ignorer l'erreur réseau pour ne pas bloquer l'utilisateur
    }
    return result;
  },

  /**
   * 7. DIPLÔME OFFICIEL DU TABLEAU D'HONNEUR (FORMAT PAYSAGE A4 SOIGNÉ)
   */
  async generateHonorCertificatePdf(
    student: HonorRollStudent,
    options: OfficialPdfOptions = {}
  ): Promise<GeneratedPdfResult> {
    const { academicYear = student.academicYear || '2026-2027' } = options;
    
    // Format A4 Paysage (Landscape) : 841.89 x 595.28 pt
    const pageWidth = 841.89;
    const pageHeight = 595.28;
    const margin = 36;

    const doc = await PDFDocument.create();
    doc.setTitle(`Diplôme du Tableau d'Honneur - ${student.studentName} - Collège Isaac Newton`);
    doc.setAuthor('Collège Isaac Newton');
    doc.setSubject(`Certificat officiel du Tableau d'Honneur et d'Excellence Académique`);
    doc.setCreator('Direction des Études & Conseil des Professeurs Collège Isaac Newton');

    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

    const page = doc.addPage([pageWidth, pageHeight]);

    // Cadre triple élégant : Or, Blanc, Bleu marine
    page.drawRectangle({
      x: margin,
      y: margin,
      width: pageWidth - margin * 2,
      height: pageHeight - margin * 2,
      borderColor: COLOR_GOLD,
      borderWidth: 3,
    });

    page.drawRectangle({
      x: margin + 6,
      y: margin + 6,
      width: pageWidth - (margin + 6) * 2,
      height: pageHeight - (margin + 6) * 2,
      borderColor: COLOR_NAVY,
      borderWidth: 1,
    });

    // Coins décoratifs
    const drawCorner = (cx: number, cy: number) => {
      page.drawRectangle({
        x: cx - 5,
        y: cy - 5,
        width: 10,
        height: 10,
        color: COLOR_GOLD,
      });
    };
    drawCorner(margin + 6, margin + 6);
    drawCorner(pageWidth - margin - 6, margin + 6);
    drawCorner(margin + 6, pageHeight - margin - 6);
    drawCorner(pageWidth - margin - 6, pageHeight - margin - 6);

    let y = pageHeight - 75;

    // République & Ministère
    const repText = sanitizeText("RÉPUBLIQUE D'HAÏTI · MINISTÈRE DE L'ÉDUCATION NATIONALE ET DE LA FORMATION PROFESSIONNELLE (MENFP)");
    const repW = fontBold.widthOfTextAtSize(repText, 8.5);
    page.drawText(repText, {
      x: pageWidth / 2 - repW / 2,
      y,
      size: 8.5,
      font: fontBold,
      color: COLOR_MUTED,
    });
    y -= 26;

    // Nom de l'établissement
    const instText = sanitizeText("COLLÈGE ISAAC NEWTON");
    const instW = fontBold.widthOfTextAtSize(instText, 22);
    page.drawText(instText, {
      x: pageWidth / 2 - instW / 2,
      y,
      size: 22,
      font: fontBold,
      color: COLOR_NAVY,
    });
    y -= 14;

    // Devise
    const mottoText = sanitizeText("« Savoir aujourd'hui, réussir demain » · Campus Delmas 50, Port-au-Prince");
    const mottoW = fontOblique.widthOfTextAtSize(mottoText, 9.5);
    page.drawText(mottoText, {
      x: pageWidth / 2 - mottoW / 2,
      y,
      size: 9.5,
      font: fontOblique,
      color: COLOR_GOLD,
    });
    y -= 24;

    // Ligne de séparation dorée
    page.drawLine({
      start: { x: pageWidth / 2 - 220, y },
      end: { x: pageWidth / 2 + 220, y },
      thickness: 1.5,
      color: COLOR_GOLD,
    });
    y -= 26;

    // Grand Titre du Diplôme
    const titleText = sanitizeText("DIPLÔME DU TABLEAU D'HONNEUR");
    const titleW = fontBold.widthOfTextAtSize(titleText, 17);
    page.drawText(titleText, {
      x: pageWidth / 2 - titleW / 2,
      y,
      size: 17,
      font: fontBold,
      color: COLOR_NAVY,
    });
    y -= 14;

    const subTitleText = sanitizeText(`EXCELLENCE ACADÉMIQUE · SESSION ${academicYear} · ${student.period.toUpperCase()}`);
    const subTitleW = fontBold.widthOfTextAtSize(subTitleText, 9);
    page.drawText(subTitleText, {
      x: pageWidth / 2 - subTitleW / 2,
      y,
      size: 9,
      font: fontBold,
      color: COLOR_GOLD,
    });
    y -= 26;

    // Phrase solennelle
    const introText = sanitizeText("Le Conseil des Professeurs et la Direction Pédagogique décernent solennellement le présent titre à :");
    const introW = fontRegular.widthOfTextAtSize(introText, 11);
    page.drawText(introText, {
      x: pageWidth / 2 - introW / 2,
      y,
      size: 11,
      font: fontRegular,
      color: COLOR_DARK,
    });
    y -= 34;

    // Nom de l'élève mis en valeur
    const nameText = sanitizeText(student.studentName.toUpperCase());
    const nameW = fontBold.widthOfTextAtSize(nameText, 20);
    page.drawText(nameText, {
      x: pageWidth / 2 - nameW / 2,
      y,
      size: 20,
      font: fontBold,
      color: COLOR_NAVY,
    });
    y -= 18;

    // Classe et distinction
    const classInfo = sanitizeText(`Classe : ${student.classLevel} · Rang : ${student.rankInClass}${student.rankInClass === 1 ? 'er' : 'e'} sur ${student.totalStudentsInClass} élèves · Moyenne : ${student.average} / ${student.maxScale}`);
    const classW = fontBold.widthOfTextAtSize(classInfo, 10.5);
    page.drawText(classInfo, {
      x: pageWidth / 2 - classW / 2,
      y,
      size: 10.5,
      font: fontBold,
      color: COLOR_DARK,
    });
    y -= 22;

    // Citation du conseil
    const citation = sanitizeText(`« ${student.citation} »`);
    const citationW = fontOblique.widthOfTextAtSize(citation, 10);
    if (citationW <= pageWidth - 140) {
      page.drawText(citation, {
        x: pageWidth / 2 - citationW / 2,
        y,
        size: 10,
        font: fontOblique,
        color: COLOR_NAVY,
      });
      y -= 28;
    } else {
      const wrapped = wrapText(citation, pageWidth - 140, fontOblique, 9.5);
      wrapped.forEach(line => {
        const lineW = fontOblique.widthOfTextAtSize(line, 9.5);
        page.drawText(line, {
          x: pageWidth / 2 - lineW / 2,
          y,
          size: 9.5,
          font: fontOblique,
          color: COLOR_NAVY,
        });
        y -= 13;
      });
      y -= 15;
    }

    // Signatures colonnes
    const sigY = margin + 55;
    const colWidth = (pageWidth - margin * 2 - 40) / 3;

    // Col 1 : Professeur Principal
    page.drawText(sanitizeText("Le Professeur Principal"), {
      x: margin + 30,
      y: sigY + 20,
      size: 9,
      font: fontBold,
      color: COLOR_DARK,
    });
    page.drawText(sanitizeText("Visa du Conseil"), {
      x: margin + 30,
      y: sigY + 8,
      size: 7.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    page.drawText(sanitizeText("[Signature Pédagogique]"), {
      x: margin + 30,
      y: sigY - 20,
      size: 8,
      font: fontOblique,
      color: COLOR_MUTED,
    });

    // Col 2 : Sceau Institutionnel
    page.drawRectangle({
      x: pageWidth / 2 - 60,
      y: sigY - 25,
      width: 120,
      height: 55,
      color: COLOR_BG_LIGHT,
      borderColor: COLOR_GOLD,
      borderWidth: 1,
    });
    page.drawText(sanitizeText("COLLÈGE ISAAC NEWTON"), {
      x: pageWidth / 2 - fontBold.widthOfTextAtSize("COLLÈGE ISAAC NEWTON", 7.5) / 2,
      y: sigY + 14,
      size: 7.5,
      font: fontBold,
      color: COLOR_NAVY,
    });
    page.drawText(sanitizeText("SCEAU OFFICIEL CERTIFIÉ"), {
      x: pageWidth / 2 - fontBold.widthOfTextAtSize("SCEAU OFFICIEL CERTIFIÉ", 7) / 2,
      y: sigY + 2,
      size: 7,
      font: fontBold,
      color: COLOR_GOLD,
    });
    page.drawText(sanitizeText(`Réf : CIN-HONOR-${student.id.toUpperCase()}`), {
      x: pageWidth / 2 - fontRegular.widthOfTextAtSize(`Réf : CIN-HONOR-${student.id.toUpperCase()}`, 6.5) / 2,
      y: sigY - 12,
      size: 6.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });

    // Col 3 : Le Directeur Fondateur
    page.drawText(sanitizeText("Pour la Direction du Collège"), {
      x: pageWidth - margin - colWidth + 20,
      y: sigY + 20,
      size: 9,
      font: fontBold,
      color: COLOR_NAVY,
    });
    page.drawText(sanitizeText("Orphe Jean Marie · Directeur"), {
      x: pageWidth - margin - colWidth + 20,
      y: sigY + 8,
      size: 7.5,
      font: fontRegular,
      color: COLOR_MUTED,
    });
    page.drawText(sanitizeText("[Sceau et Signature Officielle]"), {
      x: pageWidth - margin - colWidth + 20,
      y: sigY - 20,
      size: 8,
      font: fontBold,
      color: COLOR_NAVY,
    });

    const pdfBytes = await doc.save();
    const cleanStudentName = student.studentName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `Diplome-Tableau-Honneur-College-Isaac-Newton-${cleanStudentName}-${academicYear}.pdf`;

    return {
      pdfBytes,
      pageCount: 1,
      filename,
      downloadBlob: () => {
        const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
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
