import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let isConnected = false;

export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('[Database] Aucune variable DATABASE_URL détectée - Mode mémoire actif.');
    return null;
  }

  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: false, // Internal Coolify Docker network does not use TLS
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err: Error) => {
      console.error('[Database Pool Error]', err.message);
    });

    return pool;
  } catch (err: any) {
    console.error('[Database Init Error]', err.message);
    return null;
  }
}

export async function initDatabase(): Promise<boolean> {
  const p = getDbPool();
  if (!p) {
    isConnected = false;
    return false;
  }

  try {
    const client = await p.connect();
    try {
      console.log('[Database] Connexion PostgreSQL réussie ! Initialisation des schémas...');

      // 1. Table Admissions
      await client.query(`
        CREATE TABLE IF NOT EXISTS admissions (
          id TEXT PRIMARY KEY,
          application_number TEXT UNIQUE NOT NULL,
          school_year TEXT NOT NULL DEFAULT '2026-2027',
          target_level TEXT NOT NULL,
          cycle TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          student_last_name TEXT NOT NULL,
          student_first_name TEXT NOT NULL,
          student_birth_date TEXT NOT NULL,
          student_gender TEXT NOT NULL,
          previous_school TEXT,
          parent_full_name TEXT NOT NULL,
          parent_relationship TEXT NOT NULL,
          parent_phone TEXT NOT NULL,
          parent_email TEXT NOT NULL,
          parent_address TEXT NOT NULL,
          parent_occupation TEXT,
          has_birth_cert BOOLEAN DEFAULT FALSE,
          has_report_cards BOOLEAN DEFAULT FALSE,
          has_pass_cert BOOLEAN DEFAULT FALSE,
          has_id_photos BOOLEAN DEFAULT FALSE,
          special_notes TEXT,
          consent_given BOOLEAN DEFAULT TRUE,
          reviewed_by TEXT,
          review_notes TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 2. Table News Articles
      await client.query(`
        CREATE TABLE IF NOT EXISTS news_articles (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          excerpt TEXT NOT NULL,
          content TEXT NOT NULL,
          cover_image TEXT,
          category TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PUBLISHED',
          featured BOOLEAN DEFAULT FALSE,
          published_at TEXT NOT NULL,
          author_name TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 3. Table School Events
      await client.query(`
        CREATE TABLE IF NOT EXISTS school_events (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          location TEXT,
          category TEXT NOT NULL,
          audience TEXT DEFAULT 'ALL',
          is_public BOOLEAN DEFAULT TRUE,
          image TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE school_events ADD COLUMN IF NOT EXISTS image TEXT;
      `);

      // 4. Table Contact Messages
      await client.query(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          status TEXT DEFAULT 'NEW',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 5. Table Audit Logs
      await client.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          action TEXT NOT NULL,
          actor TEXT,
          details TEXT,
          timestamp TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 6. Table Site Settings (General CMS & Public Banners)
      await client.query(`
        CREATE TABLE IF NOT EXISTS site_settings (
          id TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 7. Table System Users & RBAC Collaborators
      await client.query(`
        CREATE TABLE IF NOT EXISTS system_users (
          id TEXT PRIMARY KEY,
          full_name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          role TEXT NOT NULL,
          phone TEXT,
          department TEXT,
          status TEXT DEFAULT 'ACTIVE',
          last_active TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        ALTER TABLE system_users ADD COLUMN IF NOT EXISTS password TEXT;
      `);

      // 8. Table Media Items (Media Library)
      await client.query(`
        CREATE TABLE IF NOT EXISTS media_items (
          id TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'CAMPUS',
          size_bytes INT,
          dimensions TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 9. Table Hero Slides (Direct GUI editing in DBeaver & Web Admin)
      await client.query(`
        CREATE TABLE IF NOT EXISTS hero_slides (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          subtitle TEXT,
          badge TEXT,
          image TEXT NOT NULL,
          cta_text TEXT,
          cta_target TEXT,
          secondary_cta_text TEXT,
          secondary_cta_target TEXT,
          object_position TEXT DEFAULT 'center 35%',
          is_active BOOLEAN DEFAULT TRUE,
          slide_order INTEGER DEFAULT 1,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 10. Table Gallery Items / Infrastructure (Direct GUI editing in DBeaver & Web Admin)
      await client.query(`
        CREATE TABLE IF NOT EXISTS gallery_items (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT DEFAULT 'INFRASTRUCTURE',
          image_url TEXT NOT NULL,
          alt_text TEXT,
          caption TEXT,
          display_order INTEGER DEFAULT 1,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Seed if empty
      const countRes = await client.query('SELECT COUNT(*) FROM admissions');
      if (parseInt(countRes.rows[0].count, 10) === 0) {
        console.log('[Database] Seeding initial mock data into PostgreSQL...');
        
        // Seed initial admissions
        await client.query(`
          INSERT INTO admissions (
            id, application_number, school_year, target_level, cycle, status,
            student_last_name, student_first_name, student_birth_date, student_gender,
            previous_school, parent_full_name, parent_relationship, parent_phone,
            parent_email, parent_address, parent_occupation, has_birth_cert,
            has_report_cards, has_pass_cert, has_id_photos, special_notes,
            consent_given, reviewed_by, review_notes
          ) VALUES 
          (
            'adm-seed-1', 'CIN-2026-0042', '2026-2027', '7ème Année Fondamentale', 'FONDAMENTAL_CYCLE_3', 'ACCEPTED',
            'Pierre', 'Alexandre', '2014-04-12', 'M',
            'École Primaire Frère André', 'Marc-Aurèle Pierre', 'Père', '+509 3712-3456',
            'm.pierre@example.com', 'Carrefour, Thor 65', 'Comptable', true,
            true, true, true, 'Élève très motivé par les sciences et le dessin technique.',
            true, 'Direction Pédagogique', 'Dossier académique exemplaire. Admis sans réserve.'
          ),
          (
            'adm-seed-2', 'CIN-2026-0089', '2026-2027', 'Nouveau Secondaire 1 (NS1)', 'SECONDAIRE', 'INTERVIEW_SCHEDULED',
            'Auguste', 'Sherlyne', '2011-09-03', 'F',
            'Institution Sainte-Rose de Lima', 'Marie-Yolène Auguste', 'Mère', '+509 4821-7789',
            'yolene.auguste@example.com', 'Route des Rails, Carrefour', 'Infirmière cadre', true,
            true, true, true, 'Intérêt pour la filière scientifique SVT.',
            true, 'Comité d’Admission', 'Convoquée pour entretien d’orientation le 24 octobre à 10h00.'
          )
          ON CONFLICT (id) DO NOTHING;
        `);

        // Seed initial news
        await client.query(`
          INSERT INTO news_articles (id, slug, title, excerpt, content, cover_image, category, status, featured, published_at, author_name)
          VALUES 
          ('news-1', 'ouverture-campagne-admissions-2026-2027', 'Ouverture officielle de la campagne des admissions 2026-2027', 'Les préinscriptions en ligne pour les cycles préscolaire, fondamental et secondaire sont désormais ouvertes.', 'La Direction Générale du Collège Isaac Newton informe les parents d''élèves que les préinscriptions pour l''année 2026-2027 sont ouvertes.', '/src/assets/images/campus_facade_real_1790679454540.jpg', 'Admissions', 'PUBLISHED', true, '2026-09-15', 'Direction Générale'),
          ('news-2', 'modernisation-laboratoire-informatique-sciences', 'Modernisation continue de notre laboratoire informatique et multimédia', 'De nouveaux équipements informatiques sous onduleurs et logiciels éducatifs ont été installés.', 'Notre laboratoire informatique climatisé et sécurisé s''est enrichi de postes récents.', '/src/assets/images/computer_lab_real_1790679476180.jpg', 'Technologie', 'PUBLISHED', true, '2026-09-02', 'Pôle Technologies Éducatives')
          ON CONFLICT (id) DO NOTHING;
        `);

        // Seed initial contact message
        await client.query(`
          INSERT INTO contact_messages (id, full_name, email, phone, subject, message, status)
          VALUES 
          ('msg-1', 'Dr. Jean-Baptiste Estimé', 'jbe.estime@example.com', '+509 3899-2341', 'Demande de visite du campus et du laboratoire', 'Bonjour Monsieur le Directeur, je souhaiterais visiter vos installations informatiques.', 'NEW')
          ON CONFLICT (id) DO NOTHING;
        `);

        // Seed initial system users
        await client.query(`
          INSERT INTO system_users (id, full_name, email, role, phone, department, status, last_active)
          VALUES 
          ('user-admin-1', 'Direction Pédagogique (Admin)', 'admin@collegeisaacnewton.com', 'ADMIN', '+509 3800-0001', 'Direction Générale & Rectorat', 'ACTIVE', 'En ligne'),
          ('user-editor-1', 'Secrétariat & Communication (Éditeur)', 'redaction@collegeisaacnewton.com', 'EDITOR', '+509 3800-0002', 'Pôle Presse, Rédaction & Multimédia', 'ACTIVE', 'Il y a 2 heures'),
          ('user-teacher-1', 'Prof. Emmanuel Célestin (Enseignant SVT)', 'prof.sciences@collegeisaacnewton.com', 'TEACHER', '+509 3800-0005', 'Département des Sciences & Informatique', 'ACTIVE', 'Il y a 35 minutes'),
          ('user-moderator-1', 'M. Lucner Bernard (Modérateur)', 'moderation@collegeisaacnewton.com', 'MODERATOR', '+509 3800-0006', 'Vie Scolaire & Relations Familles', 'ACTIVE', 'Il y a 10 minutes')
          ON CONFLICT (id) DO NOTHING;
        `);

        // Seed initial school events
        await client.query(`
          INSERT INTO school_events (id, title, description, start_date, end_date, location, category, audience, is_public)
          VALUES 
          ('evt-1', 'Rentrée Scolaire Solennelle 2026-2027', 'Accueil officiel de l''ensemble des élèves des cycles Préscolaire, Fondamental et Nouveau Secondaire à Delmas 50.', '2026-09-08T07:30:00Z', '2026-09-08T13:00:00Z', 'Campus Principal, Delmas 50', 'Pédagogique', 'ALL', true),
          ('evt-2', 'Assemblée Générale des Parents d’Élèves (APE)', 'Présentation des innovations pédagogiques, du règlement intérieur et élection du comité des parents.', '2026-10-10T09:00:00Z', '2026-10-10T12:00:00Z', 'Auditorium du Collège Isaac Newton', 'Réunion', 'PARENTS', true),
          ('evt-3', 'Concours Interne de Mathématiques & Sciences', 'Épreuves de logique et de résolution de problèmes scientifiques pour les élèves de 7e, 8e et 9e AF.', '2026-10-18T08:30:00Z', '2026-10-18T12:00:00Z', 'Laboratoire Informatique & Salles de Sciences', 'Pédagogique', 'STUDENTS', true),
          ('evt-4', 'Examens Officiels d’État (Session Ordinaire)', 'Épreuves officielles du Ministère de l''Éducation Nationale pour la 9ème Année Fondamentale et Baccalauréat.', '2027-06-21T07:30:00Z', '2027-06-24T14:00:00Z', 'Centres d’examens agréés MENFP', 'Examen', 'STUDENTS', true),
          ('evt-5', 'Fête Nationale de Dessalines (Jour Férié)', 'Journée chômée en hommage à Jean-Jacques Dessalines, Père fondateur de la patrie haïtienne.', '2026-10-17T00:00:00Z', '2026-10-17T23:59:59Z', 'Jour Férié National en Haïti', 'Férié', 'ALL', true),
          ('evt-6', 'Congé de la Toussaint & Fête des Morts', 'Congé scolaire officiel du MENFP. Fermeture administrative et pédagogique des locaux.', '2026-11-01T00:00:00Z', '2026-11-02T23:59:59Z', 'Campus fermé', 'Férié', 'ALL', true),
          ('evt-7', 'Commémoration de la Bataille de Vertières', 'Hommage patriotique à la victoire de Vertières de 1803.', '2026-11-18T00:00:00Z', '2026-11-18T23:59:59Z', 'Jour Férié National en Haïti', 'Férié', 'ALL', true),
          ('evt-8', 'Examens Semestriels de Mi-Parcours (1er Trimestre)', 'Contrôles généraux pour toutes les classes du Fondamental et du Nouveau Secondaire.', '2026-12-14T08:00:00Z', '2026-12-18T13:00:00Z', 'Campus Principal · Salles d’examens', 'Examen', 'STUDENTS', true),
          ('evt-9', 'Rencontre Parents-Professeurs & Remise des Bulletins', 'Bilan individuel du premier trimestre, conseils personnalisés et remise des carnets scolaires.', '2026-12-19T09:00:00Z', '2026-12-19T13:00:00Z', 'Salles de classe · Delmas 50', 'Réunion', 'PARENTS', true),
          ('evt-10', 'Vacances de Noël & du Nouvel An', 'Interruption festive des cours. Réouverture des portes et reprise générale le lundi 4 janvier 2027.', '2026-12-23T12:00:00Z', '2027-01-04T07:30:00Z', 'Congé de fin d’année', 'Férié', 'ALL', true)
          ON CONFLICT (id) DO NOTHING;
        `);

        // Seed initial media items
        await client.query(`
          INSERT INTO media_items (id, url, title, category, dimensions)
          VALUES 
          ('med-1', '/src/assets/images/campus_facade_real_1790679454540.jpg', 'Façade Officielle Campus Delmas 50', 'CAMPUS', '1280x853'),
          ('med-2', '/src/assets/images/computer_lab_real_1790679476180.jpg', 'Laboratoire Informatique & Multimédia', 'LAB', '1280x853'),
          ('med-3', '/src/assets/images/graduation_promo_real_1790679465649.jpg', 'Promotion des Lauréats en Toges', 'SLIDESHOW', '1280x853'),
          ('med-4', '/src/assets/images/campus_courtyard_building_1790531780046.jpg', 'Cour Spacieuse & Bâtiments Pédagogiques', 'CAMPUS', '1280x853'),
          ('med-5', '/src/assets/images/students_assembly_1790529184364.jpg', 'Rassemblement Matinal & Discipline', 'EVENTS', '1280x853')
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // Ensure hero_slides table is seeded for DBeaver visibility
      const heroCountRes = await client.query('SELECT COUNT(*) FROM hero_slides');
      if (parseInt(heroCountRes.rows[0].count, 10) === 0) {
        console.log('[Database] Initialisation des diapositives d’entête (hero_slides)...');
        await client.query(`
          INSERT INTO hero_slides (
            id, title, subtitle, badge, image, cta_text, cta_target, secondary_cta_text, secondary_cta_target, object_position, is_active, slide_order
          ) VALUES 
          (
            'slide-1',
            'Collège Isaac Newton',
            '« Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50, rue Dominique #2 bis, dédié à l’excellence intellectuelle et civique de vos enfants.',
            'Campus Principal · Delmas 50, rue Dominique #2 bis',
            '/images/campus_facade_real_1790679454540.jpg',
            'Formulaire de Préinscription',
            'pre-registration',
            'Secrétariat (+509 3316-0934 / 3721-1818)',
            'contact',
            'center 35%',
            true,
            1
          ),
          (
            'slide-2',
            'La Technologie au Service de Votre Avenir',
            'Postes informatiques récents sous onduleurs, initiation au code, bureautique structurée et culture numérique dès le cycle fondamental.',
            'Laboratoire Informatique & Multimédia',
            '/images/computer_lab_real_1790679476180.jpg',
            'Découvrir le Pôle Numérique',
            'programs',
            'Préinscrire un élève',
            'pre-registration',
            'center 45%',
            true,
            2
          ),
          (
            'slide-3',
            'Former les Bâtisseurs de Demain',
            '100% de réussite aux examens d’État (9e AF et Baccalauréat Nouveau Secondaire). Nos bacheliers en toges académiques prêts pour l’université.',
            'Promotion des Diplômés · Cérémonie de Graduation',
            '/images/graduation_promo_real_1790679465649.jpg',
            'Cursus Nouveau Secondaire',
            'programs',
            'Palmarès d’Excellence',
            'college',
            'center 22%',
            true,
            3
          ),
          (
            'slide-4',
            'Un Environnement Propice à l’Excellence',
            'Bâtiment aéré à galeries bleues, cour spacieuse, terrain multisports et encadrement pédagogique rigoureux.',
            'Campus Principal · Delmas 50',
            '/images/campus_courtyard_building_1790531780046.jpg',
            'Visiter le Campus',
            'college',
            'Préinscription 2026-2027',
            'pre-registration',
            'center 28%',
            true,
            4
          )
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // Ensure gallery_items table is seeded for DBeaver visibility
      const galleryCountRes = await client.query('SELECT COUNT(*) FROM gallery_items');
      if (parseInt(galleryCountRes.rows[0].count, 10) === 0) {
        console.log('[Database] Initialisation de la photothèque des infrastructures (gallery_items)...');
        await client.query(`
          INSERT INTO gallery_items (id, title, category, image_url, alt_text, caption, display_order)
          VALUES 
          (
            'gal-1',
            'Cour d’Honneur & Terrain Multisports',
            'Espaces Sportifs & Cour',
            '/images/campus_courtyard_building_1790531780046.jpg',
            'Bâtiment moderne du Collège Isaac Newton avec ses galeries bleues et son terrain de basket',
            'Cour intérieure moderne et sécurisée au campus de Delmas 50 avec terrain multisports.',
            1
          ),
          (
            'gal-2',
            'Façade Principale & Accueil Sécurisé',
            'Campus & Bâtiments',
            '/images/campus_facade_real_1790679454540.jpg',
            'Façade extérieure avec enseigne Collège Isaac Newton à Delmas 50',
            'Entrée officielle sécurisée sur Delmas 50, rue Dominique #2 bis, avec contrôle d’accès.',
            2
          ),
          (
            'gal-3',
            'Laboratoire Informatique & Multimédia',
            'Laboratoire & Numérique',
            '/images/computer_lab_real_1790679476180.jpg',
            'Postes d’ordinateurs récents sous onduleurs dans la salle informatique',
            'Postes récents sous onduleurs, écran géant interactif, connexion haut débit et logiciels pédagogiques.',
            3
          ),
          (
            'gal-4',
            'Cérémonie Solennelle de Graduation',
            'Événements & Cérémonies',
            '/images/graduation_promo_real_1790679465649.jpg',
            'Élèves diplômés en toges académiques bleu roi et blanches sur l’estrade',
            'Célébration annuelle de nos lauréats de 9e AF et bacheliers du Nouveau Secondaire.',
            4
          ),
          (
            'gal-5',
            'Rassemblement Matinal & Discipline Citoyenne',
            'Vie Scolaire',
            '/images/students_assembly_1790529184364.jpg',
            'Élèves rassemblés en uniforme complet dans la cour d’honneur',
            'Discipline, salut au drapeau et esprit civique au quotidien au sein de l’établissement.',
            5
          ),
          (
            'gal-6',
            'Salles de Classe Spacieuses & Équipées',
            'Pédagogie & Enseignement',
            '/images/hero_campus_facade_1790529159819.jpg',
            'Vue d’ensemble des installations scolaires aérées',
            'Un cadre d’apprentissage aéré, lumineux et propice à la concentration et à l’excellence.',
            6
          )
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      isConnected = true;
      console.log('[Database] PostgreSQL prêt et initialisé avec succès !');
      return true;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[Database Connexion Error]', err.message);
    isConnected = false;
    return false;
  }
}

export function isDbActive(): boolean {
  return isConnected;
}

// Data Access Helpers
export async function dbGetAdmissions(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  const res = await p.query('SELECT * FROM admissions ORDER BY created_at DESC');
  return res.rows.map((row: any) => ({
    id: row.id,
    applicationNumber: row.application_number,
    schoolYear: row.school_year,
    targetLevel: row.target_level,
    cycle: row.cycle,
    status: row.status,
    studentLastName: row.student_last_name,
    studentFirstName: row.student_first_name,
    studentBirthDate: row.student_birth_date,
    studentGender: row.student_gender,
    previousSchool: row.previous_school,
    parentFullName: row.parent_full_name,
    parentRelationship: row.parent_relationship,
    parentPhone: row.parent_phone,
    parentEmail: row.parent_email,
    parentAddress: row.parent_address,
    parentOccupation: row.parent_occupation,
    hasBirthCert: row.has_birth_cert,
    hasReportCards: row.has_report_cards,
    hasPassCert: row.has_pass_cert,
    hasIdPhotos: row.has_id_photos,
    specialNotes: row.special_notes,
    consentGiven: row.consent_given,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function dbInsertAdmission(data: any): Promise<any> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  const id = `adm-${Date.now()}`;
  const appNum = data.applicationNumber || `CIN-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const res = await p.query(`
    INSERT INTO admissions (
      id, application_number, school_year, target_level, cycle, status,
      student_last_name, student_first_name, student_birth_date, student_gender,
      previous_school, parent_full_name, parent_relationship, parent_phone,
      parent_email, parent_address, parent_occupation, has_birth_cert,
      has_report_cards, has_pass_cert, has_id_photos, special_notes,
      consent_given, review_notes
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
    RETURNING *
  `, [
    id, appNum, data.schoolYear || '2026-2027', data.targetLevel, data.cycle, data.status || 'PENDING',
    data.studentLastName, data.studentFirstName, data.studentBirthDate, data.studentGender,
    data.previousSchool || null, data.parentFullName, data.parentRelationship, data.parentPhone,
    data.parentEmail, data.parentAddress, data.parentOccupation || null, !!data.hasBirthCert,
    !!data.hasReportCards, !!data.hasPassCert, !!data.hasIdPhotos, data.specialNotes || null,
    data.consentGiven !== false, data.reviewNotes || null
  ]);

  const row = res.rows[0];
  return {
    id: row.id,
    applicationNumber: row.application_number,
    schoolYear: row.school_year,
    targetLevel: row.target_level,
    cycle: row.cycle,
    status: row.status,
    studentLastName: row.student_last_name,
    studentFirstName: row.student_first_name,
    studentBirthDate: row.student_birth_date,
    studentGender: row.student_gender,
    previousSchool: row.previous_school,
    parentFullName: row.parent_full_name,
    parentRelationship: row.parent_relationship,
    parentPhone: row.parent_phone,
    parentEmail: row.parent_email,
    parentAddress: row.parent_address,
    parentOccupation: row.parent_occupation,
    hasBirthCert: row.has_birth_cert,
    hasReportCards: row.has_report_cards,
    hasPassCert: row.has_pass_cert,
    hasIdPhotos: row.has_id_photos,
    specialNotes: row.special_notes,
    consentGiven: row.consent_given,
    reviewedBy: row.reviewed_by,
    reviewNotes: row.review_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function dbUpdateAdmissionStatus(id: string, status: string, reviewNotes?: string, reviewedBy?: string): Promise<any> {
  const p = getDbPool();
  if (!p || !isConnected) return null;

  const res = await p.query(`
    UPDATE admissions 
    SET status = $1, 
        review_notes = COALESCE($2, review_notes),
        reviewed_by = COALESCE($3, reviewed_by),
        updated_at = NOW()
    WHERE id = $4
    RETURNING *
  `, [status, reviewNotes || null, reviewedBy || null, id]);

  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    id: row.id,
    applicationNumber: row.application_number,
    status: row.status,
    reviewNotes: row.review_notes,
    reviewedBy: row.reviewed_by,
    updatedAt: row.updated_at,
  };
}

export async function dbGetContactMessages(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  const res = await p.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
  return res.rows.map((row: any) => ({
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function dbInsertContactMessage(data: any): Promise<any> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  const id = `msg-${Date.now()}`;
  const res = await p.query(`
    INSERT INTO contact_messages (id, full_name, email, phone, subject, message, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'NEW')
    RETURNING *
  `, [id, data.fullName, data.email, data.phone || null, data.subject, data.message]);
  const row = res.rows[0];
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function dbDeleteAdmission(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM admissions WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete Admission Error]', err.message);
    return false;
  }
}

export async function dbUpdateContactMessageStatus(id: string, status: string): Promise<any> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(
      'UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      subject: row.subject,
      message: row.message,
      status: row.status,
      createdAt: row.created_at,
    };
  } catch (err: any) {
    console.error('[DB Update Contact Error]', err.message);
    return null;
  }
}

export async function dbDeleteContactMessage(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM contact_messages WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete Contact Error]', err.message);
    return false;
  }
}

// --- SITE SETTINGS (CMS & PUBLIC BANNER ALERTS) ---
export async function dbGetSettings(): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query('SELECT data FROM site_settings WHERE id = $1', ['global_settings']);
    if (res.rows.length > 0) {
      return res.rows[0].data;
    }
    return null;
  } catch (err: any) {
    console.error('[DB Get Settings Error]', err.message);
    return null;
  }
}

// --- NEWS ARTICLES ---
export async function dbGetNews(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  try {
    const res = await p.query('SELECT * FROM news_articles ORDER BY published_at DESC, created_at DESC');
    return res.rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.cover_image,
      category: r.category,
      status: r.status,
      featured: r.featured,
      publishedAt: r.published_at,
      authorName: r.author_name,
    }));
  } catch (err: any) {
    console.error('[DB Get News Error]', err.message);
    return [];
  }
}

export async function dbInsertNews(art: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      INSERT INTO news_articles (id, slug, title, excerpt, content, cover_image, category, status, featured, published_at, author_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      art.id,
      art.slug,
      art.title,
      art.excerpt,
      art.content,
      art.coverImage || null,
      art.category,
      art.status || 'PUBLISHED',
      !!art.featured,
      art.publishedAt || new Date().toISOString().split('T')[0],
      art.authorName || 'Direction Générale'
    ]);
    const r = res.rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.cover_image,
      category: r.category,
      status: r.status,
      featured: r.featured,
      publishedAt: r.published_at,
      authorName: r.author_name,
    };
  } catch (err: any) {
    console.error('[DB Insert News Error]', err.message);
    return null;
  }
}

export async function dbUpdateNews(id: string, art: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      UPDATE news_articles
      SET slug = COALESCE($1, slug),
          title = COALESCE($2, title),
          excerpt = COALESCE($3, excerpt),
          content = COALESCE($4, content),
          cover_image = COALESCE($5, cover_image),
          category = COALESCE($6, category),
          status = COALESCE($7, status),
          featured = COALESCE($8, featured)
      WHERE id = $9
      RETURNING *
    `, [
      art.slug,
      art.title,
      art.excerpt,
      art.content,
      art.coverImage,
      art.category,
      art.status,
      art.featured !== undefined ? art.featured : null,
      id
    ]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.cover_image,
      category: r.category,
      status: r.status,
      featured: r.featured,
      publishedAt: r.published_at,
      authorName: r.author_name,
    };
  } catch (err: any) {
    console.error('[DB Update News Error]', err.message);
    return null;
  }
}

export async function dbDeleteNews(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM news_articles WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete News Error]', err.message);
    return false;
  }
}

export async function dbSaveSettings(settings: any): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query(
      `INSERT INTO site_settings (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      ['global_settings', JSON.stringify(settings)]
    );
    return true;
  } catch (err: any) {
    console.error('[DB Save Settings Error]', err.message);
    return false;
  }
}

// --- SYSTEM USERS & RBAC ---
export async function dbGetUsers(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  try {
    const res = await p.query('SELECT * FROM system_users ORDER BY created_at ASC');
    return res.rows.map((r: any) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      phone: r.phone || '',
      department: r.department || 'Pôle Pédagogique',
      status: r.status || 'ACTIVE',
      lastActive: r.last_active || 'En ligne',
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2025-09-01',
    }));
  } catch (err: any) {
    console.error('[DB Get Users Error]', err.message);
    return [];
  }
}

export async function dbInsertUser(user: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(
      `INSERT INTO system_users (id, full_name, email, role, phone, department, status, last_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        user.id,
        user.fullName,
        user.email,
        user.role,
        user.phone || '',
        user.department || 'Non spécifié',
        user.status || 'ACTIVE',
        user.lastActive || 'Jamais connecté'
      ]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      phone: r.phone || '',
      department: r.department || 'Non spécifié',
      status: r.status || 'ACTIVE',
      lastActive: r.last_active || 'Jamais connecté',
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    };
  } catch (err: any) {
    console.error('[DB Insert User Error]', err.message);
    return null;
  }
}

export async function dbUpdateUserRole(id: string, role: string): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(
      `UPDATE system_users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [role, id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      phone: r.phone || '',
      department: r.department,
      status: r.status,
      lastActive: r.last_active,
    };
  } catch (err: any) {
    console.error('[DB Update Role Error]', err.message);
    return null;
  }
}

export async function dbUpdateUserStatus(id: string, status: string): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(
      `UPDATE system_users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      role: r.role,
      phone: r.phone || '',
      department: r.department,
      status: r.status,
      lastActive: r.last_active,
    };
  } catch (err: any) {
    console.error('[DB Update Status Error]', err.message);
    return null;
  }
}

export async function dbDeleteUser(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM system_users WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete User Error]', err.message);
    return false;
  }
}

// --- SCHOOL EVENTS & AGENDA ---
export async function dbGetEvents(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  try {
    const res = await p.query('SELECT * FROM school_events ORDER BY start_date ASC');
    return res.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      startDate: r.start_date,
      endDate: r.end_date || '',
      location: r.location || 'Campus Collège Isaac Newton, Delmas 50',
      category: r.category,
      audience: r.audience || 'ALL',
      isPublic: r.is_public !== false,
      image: r.image || '',
      createdAt: r.created_at,
    }));
  } catch (err: any) {
    console.error('[DB Get Events Error]', err.message);
    return [];
  }
}

export async function dbInsertEvent(evt: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      INSERT INTO school_events (id, title, description, start_date, end_date, location, category, audience, is_public, image)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      evt.id,
      evt.title,
      evt.description || '',
      evt.startDate,
      evt.endDate || null,
      evt.location || 'Campus Collège Isaac Newton, Delmas 50',
      evt.category || 'Pédagogique',
      evt.audience || 'ALL',
      evt.isPublic !== false,
      evt.image || null
    ]);
    const r = res.rows[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      startDate: r.start_date,
      endDate: r.end_date || '',
      location: r.location,
      category: r.category,
      audience: r.audience,
      isPublic: r.is_public,
      image: r.image || '',
    };
  } catch (err: any) {
    console.error('[DB Insert Event Error]', err.message);
    return null;
  }
}

export async function dbUpdateEvent(id: string, evt: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      UPDATE school_events
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          location = COALESCE($5, location),
          category = COALESCE($6, category),
          audience = COALESCE($7, audience),
          is_public = COALESCE($8, is_public),
          image = COALESCE($9, image)
      WHERE id = $10
      RETURNING *
    `, [
      evt.title,
      evt.description,
      evt.startDate,
      evt.endDate || null,
      evt.location,
      evt.category,
      evt.audience,
      evt.isPublic !== undefined ? evt.isPublic : null,
      evt.image !== undefined ? evt.image : null,
      id
    ]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      title: r.title,
      description: r.description,
      startDate: r.start_date,
      endDate: r.end_date || '',
      location: r.location,
      category: r.category,
      audience: r.audience,
      isPublic: r.is_public,
      image: r.image || '',
    };
  } catch (err: any) {
    console.error('[DB Update Event Error]', err.message);
    return null;
  }
}

export async function dbDeleteEvent(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM school_events WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete Event Error]', err.message);
    return false;
  }
}

// --- HERO SLIDESHOW PERSISTENCE ---
export async function dbGetHeroSlides(): Promise<any[] | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    // 1. Try relational hero_slides table first (enables direct graphical editing via DBeaver)
    try {
      const resTable = await p.query(
        'SELECT * FROM hero_slides ORDER BY slide_order ASC, updated_at DESC'
      );
      if (resTable.rows.length > 0) {
        return resTable.rows.map(row => ({
          id: row.id,
          title: row.title,
          subtitle: row.subtitle || '',
          badge: row.badge || '',
          image: row.image,
          ctaText: row.cta_text || '',
          ctaTarget: row.cta_target || '',
          secondaryCtaText: row.secondary_cta_text || '',
          secondaryCtaTarget: row.secondary_cta_target || '',
          objectPosition: row.object_position || 'center 35%',
          isActive: row.is_active !== false,
          order: row.slide_order || 1,
        }));
      }
    } catch {
      // Table may not exist yet or fallback
    }

    // 2. Fallback to site_settings JSON blob
    const res = await p.query('SELECT data FROM site_settings WHERE id = $1', ['hero_slides']);
    if (res.rows.length > 0) {
      let data = res.rows[0].data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {}
      }
      return Array.isArray(data) ? data : null;
    }
    return null;
  } catch (err: any) {
    console.error('[DB Get Hero Slides Error]', err.message);
    return null;
  }
}

export async function dbSaveHeroSlides(slides: any[]): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    // 1. Save to site_settings JSON blob (guaranteed backup & fast lookup)
    await p.query(
      `INSERT INTO site_settings (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      ['hero_slides', JSON.stringify(slides)]
    );

    // 2. Upsert each slide into dedicated hero_slides table for DBeaver visibility & direct editing
    try {
      for (let i = 0; i < slides.length; i++) {
        const s = slides[i];
        await p.query(
          `INSERT INTO hero_slides (
            id, title, subtitle, badge, image, cta_text, cta_target, secondary_cta_text, secondary_cta_target, object_position, is_active, slide_order, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            badge = EXCLUDED.badge,
            image = EXCLUDED.image,
            cta_text = EXCLUDED.cta_text,
            cta_target = EXCLUDED.cta_target,
            secondary_cta_text = EXCLUDED.secondary_cta_text,
            secondary_cta_target = EXCLUDED.secondary_cta_target,
            object_position = EXCLUDED.object_position,
            is_active = EXCLUDED.is_active,
            slide_order = EXCLUDED.slide_order,
            updated_at = NOW()`,
          [
            s.id || `slide-${i + 1}`,
            s.title || '',
            s.subtitle || '',
            s.badge || '',
            s.image || '',
            s.ctaText || '',
            s.ctaTarget || '',
            s.secondaryCtaText || '',
            s.secondaryCtaTarget || '',
            s.objectPosition || 'center 35%',
            s.isActive !== false,
            s.order || (i + 1),
          ]
        );
      }
    } catch (tblErr: any) {
      console.warn('[DB Save Hero Slides Table Warn]', tblErr.message);
    }

    return true;
  } catch (err: any) {
    console.error('[DB Save Hero Slides Error]', err.message);
    return false;
  }
}

// --- MEDIA LIBRARY ITEMS ---
export async function dbGetMedia(): Promise<any[]> {
  const p = getDbPool();
  if (!p || !isConnected) return [];
  try {
    const res = await p.query('SELECT * FROM media_items ORDER BY created_at DESC');
    return res.rows.map((r: any) => ({
      id: r.id,
      url: r.url,
      title: r.title,
      category: r.category || 'CAMPUS',
      sizeBytes: r.size_bytes || 0,
      dimensions: r.dimensions || '',
      createdAt: r.created_at,
    }));
  } catch (err: any) {
    console.error('[DB Get Media Error]', err.message);
    return [];
  }
}

export async function dbInsertMedia(item: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      INSERT INTO media_items (id, url, title, category, size_bytes, dimensions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      item.id,
      item.url,
      item.title,
      item.category || 'CAMPUS',
      item.sizeBytes || null,
      item.dimensions || null
    ]);
    const r = res.rows[0];
    return {
      id: r.id,
      url: r.url,
      title: r.title,
      category: r.category,
      sizeBytes: r.size_bytes,
      dimensions: r.dimensions,
      createdAt: r.created_at,
    };
  } catch (err: any) {
    console.error('[DB Insert Media Error]', err.message);
    return null;
  }
}

export async function dbUpdateMedia(id: string, item: any): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query(`
      UPDATE media_items 
      SET url = COALESCE($1, url),
          title = COALESCE($2, title),
          category = COALESCE($3, category),
          dimensions = COALESCE($4, dimensions),
          size_bytes = COALESCE($5, size_bytes)
      WHERE id = $6
      RETURNING *
    `, [
      item.url,
      item.title,
      item.category || 'CAMPUS',
      item.dimensions || null,
      item.sizeBytes !== undefined ? item.sizeBytes : null,
      id
    ]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      url: r.url,
      title: r.title,
      category: r.category,
      sizeBytes: r.size_bytes,
      dimensions: r.dimensions,
      createdAt: r.created_at,
    };
  } catch (err: any) {
    console.error('[DB Update Media Error]', err.message);
    return null;
  }
}

export async function dbDeleteMedia(id: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query('DELETE FROM media_items WHERE id = $1', [id]);
    return true;
  } catch (err: any) {
    console.error('[DB Delete Media Error]', err.message);
    return false;
  }
}

// --- GALLERY ITEMS PERSISTENCE ---
export async function dbGetGallery(): Promise<any[] | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    // 1. Relational table gallery_items first (allows direct DBeaver spreadsheet editing)
    try {
      const resTable = await p.query(
        'SELECT * FROM gallery_items ORDER BY display_order ASC, created_at DESC'
      );
      if (resTable.rows.length > 0) {
        return resTable.rows.map(row => ({
          id: row.id,
          title: row.title,
          category: row.category || 'Infrastructure',
          imageUrl: row.image_url,
          altText: row.alt_text || '',
          caption: row.caption || '',
          displayOrder: row.display_order || 1,
        }));
      }
    } catch {
      // Fallback if table not ready
    }

    // 2. Fallback to site_settings JSON blob
    const res = await p.query('SELECT data FROM site_settings WHERE id = $1', ['school_gallery']);
    if (res.rows.length > 0) {
      let data = res.rows[0].data;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {}
      }
      return Array.isArray(data) ? data : null;
    }
    return null;
  } catch (err: any) {
    console.error('[DB Get Gallery Error]', err.message);
    return null;
  }
}

export async function dbSaveGallery(gallery: any[]): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    // 1. Save in site_settings JSON blob (guaranteed backup)
    await p.query(
      `INSERT INTO site_settings (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      ['school_gallery', JSON.stringify(gallery)]
    );

    // 2. Upsert into gallery_items table so DBeaver users can view and edit rows directly!
    try {
      for (let i = 0; i < gallery.length; i++) {
        const item = gallery[i];
        await p.query(
          `INSERT INTO gallery_items (id, title, category, image_url, alt_text, caption, display_order, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             category = EXCLUDED.category,
             image_url = EXCLUDED.image_url,
             alt_text = EXCLUDED.alt_text,
             caption = EXCLUDED.caption,
             display_order = EXCLUDED.display_order,
             updated_at = NOW()`,
          [
            item.id || `gal-${i + 1}`,
            item.title || '',
            item.category || 'Infrastructure',
            item.imageUrl || '',
            item.altText || item.title || '',
            item.caption || '',
            i + 1
          ]
        );
      }
    } catch (e: any) {
      console.warn('[DB Save Gallery Table Warn]', e.message);
    }

    return true;
  } catch (err: any) {
    console.error('[DB Save Gallery Error]', err.message);
    return false;
  }
}

// --- USER SECURITY & PASSWORD PERSISTENCE ---
export async function dbUpdateUserPassword(emailOrId: string, password: string): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    const res = await p.query(
      `UPDATE system_users SET password = $1, updated_at = NOW() 
       WHERE LOWER(email) = LOWER($2) OR id = $2 RETURNING id`,
      [password, emailOrId]
    );

    if (res.rows.length === 0) {
      const email = emailOrId.includes('@') ? emailOrId : `${emailOrId}@collegeisaacnewton.com`;
      const role = email.includes('admin') ? 'ADMIN' : 'EDITOR';
      await p.query(
        `INSERT INTO system_users (id, full_name, email, role, password, status, last_active, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE', 'En ligne', NOW())
         ON CONFLICT (email) DO UPDATE SET password = $5, updated_at = NOW()`,
        [`usr-${Date.now()}`, email.split('@')[0], email, role, password]
      );
    }

    await p.query(
      `INSERT INTO audit_logs (id, action, actor, details, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        `log-${Date.now()}`,
        'SECURITY_PASSWORD_UPDATED',
        emailOrId,
        `Mise à jour sécurisée du mot de passe dans la base de données PostgreSQL`
      ]
    );
    return true;
  } catch (err: any) {
    console.error('[DB Update Password Error]', err.message);
    return false;
  }
}

// --- PERMISSIONS MAINTENANCE & RBAC INTEGRITY ---
export async function dbRepairSystemPermissions(): Promise<{ success: boolean; repairedUsersCount: number; message: string }> {
  const p = getDbPool();
  if (!p || !isConnected) {
    return { success: true, repairedUsersCount: 0, message: 'Base de données en mémoire : Intégrité validée' };
  }
  try {
    await p.query(`UPDATE system_users SET status = 'ACTIVE' WHERE status IS NULL`);
    await p.query(`
      INSERT INTO system_users (id, full_name, email, role, phone, department, status, last_active)
      VALUES 
      ('user-admin-1', 'Direction Pédagogique (Admin)', 'admin@collegeisaacnewton.com', 'ADMIN', '+509 3800-0001', 'Direction Générale & Rectorat', 'ACTIVE', 'En ligne')
      ON CONFLICT (email) DO UPDATE SET status = 'ACTIVE', role = 'ADMIN'
    `);
    const countRes = await p.query('SELECT COUNT(*) FROM system_users');
    const count = parseInt(countRes.rows[0].count, 10) || 0;

    await p.query(
      `INSERT INTO audit_logs (id, action, actor, details, timestamp)
       VALUES ($1, $2, $3, $4, NOW())`,
      [
        `log-${Date.now()}`,
        'SECURITY_PERMISSIONS_REPAIRED',
        'Direction (Super-Admin)',
        `Maintenance système et contrôle d'intégrité exécutés avec succès sur ${count} profils RBAC`
      ]
    );

    return {
      success: true,
      repairedUsersCount: count,
      message: `Contrôle d'intégrité PostgreSQL achevé avec succès sur ${count} profils.`
    };
  } catch (err: any) {
    console.error('[DB Repair Permissions Error]', err.message);
    return { success: false, repairedUsersCount: 0, message: err.message };
  }
}

// --- GITHUB CONFIGURATION PERSISTENCE ---
export async function dbGetGitHubConfig(): Promise<any | null> {
  const p = getDbPool();
  if (!p || !isConnected) return null;
  try {
    const res = await p.query('SELECT data FROM site_settings WHERE id = $1', ['github_config']);
    if (res.rows.length > 0) {
      let data = res.rows[0].data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch {}
      }
      return data;
    }
    return null;
  } catch (err: any) {
    console.error('[DB Get GitHub Config Error]', err.message);
    return null;
  }
}

export async function dbSaveGitHubConfig(config: any): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query(
      `INSERT INTO site_settings (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      ['github_config', JSON.stringify(config)]
    );
    return true;
  } catch (err: any) {
    console.error('[DB Save GitHub Config Error]', err.message);
    return false;
  }
}

// --- CONTENT BLOCKS PERSISTENCE (POSTGRESQL) ---
export async function dbGetContentBlocks(): Promise<Record<string, string>> {
  const p = getDbPool();
  if (!p || !isConnected) return {};
  try {
    const res = await p.query('SELECT data FROM site_settings WHERE id = $1', ['content_blocks']);
    if (res.rows.length > 0) {
      let data = res.rows[0].data;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch {}
      }
      return data || {};
    }
    return {};
  } catch (err: any) {
    console.error('[DB Get Content Blocks Error]', err.message);
    return {};
  }
}

export async function dbSaveContentBlocks(blocks: Record<string, string>): Promise<boolean> {
  const p = getDbPool();
  if (!p || !isConnected) return false;
  try {
    await p.query(
      `INSERT INTO site_settings (id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      ['content_blocks', JSON.stringify(blocks)]
    );
    return true;
  } catch (err: any) {
    console.error('[DB Save Content Blocks Error]', err.message);
    return false;
  }
}




