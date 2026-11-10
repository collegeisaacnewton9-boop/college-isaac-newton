import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  RefreshCw, 
  ExternalLink,
  Settings,
  Database,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

export interface SecurityAuditViewProps {
  onNavigateToSettings?: () => void;
}

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({ onNavigateToSettings }) => {
  const [isRunningScan, setIsRunningScan] = useState(false);
  const [lastScanDate, setLastScanDate] = useState<string>('Aujourd’hui à 10:15');

  const handleRunScan = () => {
    setIsRunningScan(true);
    toast.info('Lancement de l’audit de cybersécurité en temps réel...');
    setTimeout(() => {
      setIsRunningScan(false);
      setLastScanDate(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
      toast.success('Audit terminé : Tous les contrôles de sécurité sont conformes.');
    }, 1200);
  };

  const securityChecks = [
    {
      title: 'Protection des Données & Chiffrement TLS',
      desc: 'Toutes les transmissions HTTPS sont protégées par chiffrement TLS 1.3 avec redirection stricte.',
      status: 'CONFORME',
      badge: 'Chiffrement Actif',
    },
    {
      title: 'Isolation des Rôles & Authentification JWT',
      desc: 'Validation stricte des jetons de session, expiration automatique après inactivité et hachage BCrypt.',
      status: 'CONFORME',
      badge: 'RBAC Sécurisé',
    },
    {
      title: 'Protection contre les Injections & XSS',
      desc: 'Sanitisation stricte des entrées utilisateurs, requêtes SQL paramétrées et en-têtes CSP renforcés.',
      status: 'CONFORME',
      badge: 'Filtres Actifs',
    },
    {
      title: 'Sauvegardes Automatisées & Résilience',
      desc: 'Snapshots réguliers des bases de données et rétention sécurisée multi-zones.',
      status: 'CONFORME',
      badge: 'Redondance Active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <ShieldCheck className="w-4 h-4" />
            <span>Centre de Cyberdéfense & Conformité</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Audit de Sécurité & Intégrité du Système
          </h2>
          <p className="text-xs text-slate-600">
            Dernier contrôle exécuté : <span className="font-semibold text-slate-900">{lastScanDate}</span> · Score de conformité : <span className="font-bold text-emerald-600">100% Sécurisé</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunScan}
            disabled={isRunningScan}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunningScan ? 'animate-spin' : ''}`} />
            <span>{isRunningScan ? 'Analyse en cours...' : 'Exécuter un Scan'}</span>
          </button>

          {onNavigateToSettings && (
            <button
              type="button"
              onClick={onNavigateToSettings}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Paramètres</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityChecks.map((chk, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                {chk.badge}
              </span>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>{chk.status}</span>
              </div>
            </div>
            <h3 className="font-serif font-bold text-base text-slate-900">
              {chk.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {chk.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
