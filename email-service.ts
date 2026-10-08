import nodemailer from 'nodemailer';

export interface AdmissionEmailData {
  applicationNumber: string;
  parentFullName: string;
  parentEmail: string;
  parentPhone: string;
  parentRelationship: string;
  studentLastName: string;
  studentFirstName: string;
  studentBirthDate: string;
  studentGender: string;
  targetLevel: string;
  schoolYear: string;
  previousSchool?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  simulated: boolean;
  error?: string;
  recipient: string;
}

/**
 * Configure Nodemailer transporteur SMTP
 * Supporte :
 * 1. Variables SMTP standard : SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * 2. Service Gmail direct : GMAIL_USER, GMAIL_APP_PASS
 */
function createEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || 'collegeisaacnewton9@gmail.com';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS;

  if (host && user && pass) {
    const port = Number(process.env.SMTP_PORT) || 587;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Si mot de passe d'application Gmail disponible
  if (user && pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  return null;
}

/**
 * Génère le template HTML haute définition prédéfini pour l'accusé de réception
 */
export function generateAdmissionEmailTemplate(data: AdmissionEmailData): { subject: string; html: string; text: string } {
  const subject = `Confirmation de préinscription : ${data.studentFirstName} ${data.studentLastName} (Réf. ${data.applicationNumber}) - Collège Isaac Newton`;

  const studentFullName = `${data.studentFirstName} ${data.studentLastName}`;
  const genderLabel = data.studentGender === 'M' ? 'Masculin (Garçon)' : 'Féminin (Fille)';
  const formattedDate = data.studentBirthDate ? new Date(data.studentBirthDate).toLocaleDateString('fr-FR') : 'Non précisée';

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accusé de réception - Collège Isaac Newton</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 620px; margin: 24px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #0b192c 0%, #0f274a 100%); padding: 32px 24px; text-align: center; color: #ffffff; border-bottom: 3px solid #f59e0b; }
    .badge { display: inline-block; background-color: rgba(245, 158, 11, 0.15); color: #fcd34d; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; border: 1px solid rgba(245, 158, 11, 0.3); margin-bottom: 12px; }
    .title { margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .subtitle { margin: 0; font-size: 12px; color: #94a3b8; font-style: italic; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 14px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .highlight-card { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center; }
    .ref-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 4px; }
    .ref-code { font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; color: #0f274a; letter-spacing: 2px; }
    .table-card { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; }
    .table-card th { background-color: #f1f5f9; text-align: left; padding: 10px 14px; color: #475569; font-weight: 600; width: 38%; border-bottom: 1px solid #e2e8f0; }
    .table-card td { padding: 10px 14px; color: #0f172a; border-bottom: 1px solid #e2e8f0; }
    .steps-card { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin: 24px 0; }
    .steps-title { font-weight: 700; color: #1e3a8a; margin: 0 0 10px 0; font-size: 14px; }
    .steps-list { margin: 0; padding-left: 18px; font-size: 12.5px; color: #1e293b; }
    .steps-list li { margin-bottom: 6px; }
    .checklist { background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .checklist-title { font-weight: 700; color: #92400e; margin: 0 0 8px 0; font-size: 13px; }
    .checklist-list { margin: 0; padding-left: 18px; font-size: 12px; color: #78350f; }
    .signature { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #334155; }
    .signature-name { font-weight: 700; color: #0f274a; font-size: 14px; }
    .signature-role { font-size: 12px; color: #64748b; }
    .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .contact-item { margin: 3px 0; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Institutionnel -->
    <div class="header">
      <div class="badge">Session d'Admission ${data.schoolYear}</div>
      <h1 class="title">COLLÈGE ISAAC NEWTON</h1>
      <p class="subtitle">« Apprendre aujourd’hui pour bâtir demain »</p>
    </div>

    <!-- Contenu Principal -->
    <div class="content">
      <div class="greeting">Chère famille ${data.parentFullName},</div>
      
      <p>
        La Direction et le Secrétariat Général du <strong>Collège Isaac Newton</strong> ont le plaisir d'accuser réception de la demande de préinscription de votre enfant pour l'année académique <strong>${data.schoolYear}</strong>.
      </p>
      
      <p>
        Nous vous remercions chaleureusement pour la confiance que vous accordez à notre projet pédagogique et scientifique. Votre dossier a été enregistré sous la référence officielle ci-dessous :
      </p>

      <!-- Carte Référence Unique -->
      <div class="highlight-card">
        <div class="ref-label">Numéro Unique de Dossier</div>
        <div class="ref-code">${data.applicationNumber}</div>
        <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
          Conservez précieusement ce numéro pour le suivi auprès du secrétariat.
        </p>
      </div>

      <!-- Récapitulatif du Candidat -->
      <h3 style="font-size: 14px; font-weight: 700; color: #0f274a; margin-top: 24px; margin-bottom: 8px;">
        Récapitulatif des informations enregistrées :
      </h3>
      <table class="table-card">
        <tr>
          <th>Élève Candidat</th>
          <td><strong>${studentFullName}</strong></td>
        </tr>
        <tr>
          <th>Date de Naissance</th>
          <td>${formattedDate} (${genderLabel})</td>
        </tr>
        <tr>
          <th>Classe & Niveau Visés</th>
          <td><strong style="color: #0f274a;">${data.targetLevel}</strong></td>
        </tr>
        ${data.previousSchool ? `<tr><th>Établissement Précédent</th><td>${data.previousSchool}</td></tr>` : ''}
        <tr>
          <th>Responsable Légal</th>
          <td>${data.parentFullName} (${data.parentRelationship})</td>
        </tr>
        <tr>
          <th>Téléphone Joignable</th>
          <td>${data.parentPhone}</td>
        </tr>
        <tr>
          <th>Adresse E-mail</th>
          <td>${data.parentEmail}</td>
        </tr>
      </table>

      <!-- Prochaines étapes de l'admission -->
      <div class="steps-card">
        <div class="steps-title">Étapes suivantes de votre admission :</div>
        <ol class="steps-list">
          <li><strong>Examen du dossier sous 48 à 72 heures :</strong> La commission pédagogique étudie les pièces transmises et vérifie l'admissibilité.</li>
          <li><strong>Test d'aptitude diagnostique :</strong> Un rendez-vous vous sera communiqué par téléphone et par e-mail pour l'évaluation personnalisée de l'élève.</li>
          <li><strong>Entretien de direction & Dépôt des pièces :</strong> Finalisation de l'inscription au campus principal à Delmas 50.</li>
        </ol>
      </div>

      <!-- Pièces physiques obligatoires -->
      <div class="checklist">
        <div class="checklist-title">Pièces à apporter lors de l'entretien officiel au campus :</div>
        <ul class="checklist-list">
          <li>Extrait d'acte de naissance (original ou copie certifiée conforme)</li>
          <li>Originaux des bulletins de notes des deux dernières années scolaires</li>
          <li>Certificat de passage officiel signé et timbré par la direction d'origine</li>
          <li>Quatre (4) photos d'identité récentes en tenue correcte</li>
          <li>Fiche médicale ou carnet de vaccination à jour</li>
        </ul>
      </div>

      <!-- Signature officielle -->
      <div class="signature">
        <p style="margin: 0 0 4px 0;">Veuillez agréer, chère famille, l'expression de nos salutations distinguées.</p>
        <div class="signature-name">Orphe Jean Marie</div>
        <div class="signature-role">Directeur fondateur · Professeur de Mathématiques & Sciences Physiques</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Direction Pédagogique du Collège Isaac Newton</div>
      </div>
    </div>

    <!-- Footer Légal & Contacts -->
    <div class="footer">
      <div class="contact-item"><strong>Campus Principal du Collège Isaac Newton</strong></div>
      <div class="contact-item">Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti</div>
      <div class="contact-item">Téléphones : +509 3316-0934 / +509 3721-1818</div>
      <div class="contact-item">Courriel : contact@collegeisaacnewton.com · Site web officiel</div>
      <div style="margin-top: 12px; font-size: 10px; color: #94a3b8;">
        Ce message automatique certifie la réception numérique de votre dossier. Merci de ne pas répondre directement à cet e-mail transactionnel.
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
COLLÈGE ISAAC NEWTON
Session d'Admission ${data.schoolYear}
« Apprendre aujourd’hui pour bâtir demain »
--------------------------------------------------

Chère famille ${data.parentFullName},

La Direction et le Secrétariat Général du Collège Isaac Newton accusent réception avec honneur de votre demande de préinscription pour l'année académique ${data.schoolYear}.

NUMÉRO UNIQUE DE DOSSIER : ${data.applicationNumber}
Conservez précieusement cette référence pour tout échange avec l'administration.

RÉCAPITULATIF DE LA CANDIDATURE :
- Élève : ${studentFullName} (${genderLabel})
- Date de naissance : ${formattedDate}
- Classe visée : ${data.targetLevel}
- Responsable légal : ${data.parentFullName} (${data.parentRelationship})
- Téléphone : ${data.parentPhone}
- E-mail : ${data.parentEmail}

ÉTAPES SUIVANTES :
1. Examen de votre dossier sous 48 à 72 heures par la commission pédagogique.
2. Convocation de l'élève pour le test d'aptitude diagnostique.
3. Entretien avec la direction et dépôt des pièces physiques.

PIÈCES À APPORTER AU CAMPUS (Delmas 50, rue Dominique #2 bis) :
- Extrait d'acte de naissance original ou copie conforme
- Bulletins de notes des 2 dernières années scolaires
- Certificat de passage officiel timbré
- 4 photos d'identité récentes

Contacts du secrétariat :
Tél : +509 3316-0934 / +509 3721-1818
Email : contact@collegeisaacnewton.com
Adresse : Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti
--------------------------------------------------
Direction Pédagogique · Collège Isaac Newton
  `.trim();

  return { subject, html, text };
}

/**
 * Fonction principale d'envoi automatique de l'e-mail de confirmation
 */
export async function sendAdmissionConfirmationEmail(data: AdmissionEmailData): Promise<EmailSendResult> {
  const { subject, html, text } = generateAdmissionEmailTemplate(data);
  const transporter = createEmailTransporter();
  const senderEmail = process.env.SMTP_FROM || process.env.SMTP_USER || 'contact@collegeisaacnewton.com';
  const senderName = 'Collège Isaac Newton (Secrétariat & Admissions)';

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: data.parentEmail,
        replyTo: 'contact@collegeisaacnewton.com',
        subject,
        text,
        html,
      });

      console.log(`[Email Service] E-mail SMTP réel transmis avec succès à ${data.parentEmail}. MessageId: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId,
        simulated: false,
        recipient: data.parentEmail,
      };
    } catch (error: any) {
      console.error(`[Email Service] Erreur lors de l'envoi SMTP réel à ${data.parentEmail}:`, error.message);
      // Fallback gracieux en mode journalisé pour ne pas bloquer l'enregistrement
      return {
        success: false,
        error: error.message,
        simulated: true,
        recipient: data.parentEmail,
      };
    }
  }

  // Si pas de serveur SMTP configuré dans l'environnement local/dev
  // Le système effectue une simulation parfaite et consigne l'e-mail officiel
  const simulatedId = `cin-sim-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  console.log(`[Email Service] Aucun SMTP configuré (SMTP_HOST ou GMAIL_APP_PASS manquant). E-mail de confirmation généré et consigné avec succès pour ${data.parentEmail} (Réf : ${data.applicationNumber}, SimId : ${simulatedId}).`);

  return {
    success: true,
    messageId: simulatedId,
    simulated: true,
    recipient: data.parentEmail,
  };
}
