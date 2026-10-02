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
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
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

        // Seed contact message
        await client.query(`
          INSERT INTO contact_messages (id, full_name, email, phone, subject, message, status)
          VALUES 
          ('msg-1', 'Dr. Jean-Baptiste Estimé', 'jbe.estime@example.com', '+509 3899-2341', 'Demande de visite du campus et du laboratoire', 'Bonjour Monsieur le Directeur, je souhaiterais visiter vos installations informatiques.', 'NEW')
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

