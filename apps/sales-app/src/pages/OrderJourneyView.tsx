import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@aeronexis-dynamics/api-client';
import { ArrowLeft, Package2, AlertCircle, CheckCircle2, Truck, ShoppingCart, Settings, ClipboardList } from 'lucide-react';

interface AuditLog {
  _id: string;
  eventType: string;
  service: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// Configuration visuelle par type d'événement
const EVENT_CONFIG: Record<string, { 
  label: string; 
  icon: React.ReactNode;
  bg: string; 
  border: string;
  badge: string;
}> = {
  ORDER_CREATED:       { label: 'Commande créée',             icon: <ShoppingCart className="w-4 h-4" />,  bg: 'bg-indigo-500/10', border: 'border-indigo-500/30',  badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  WORK_ORDER_CREATED:  { label: 'Ordre de fabrication créé',  icon: <ClipboardList className="w-4 h-4" />, bg: 'bg-blue-500/10',   border: 'border-blue-500/30',    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30'       },
  WORK_ORDER_UPDATED:  { label: 'Ordre de fabrication MàJ',   icon: <Settings className="w-4 h-4" />,      bg: 'bg-sky-500/10',    border: 'border-sky-500/30',     badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30'          },
  LOT_CREATED:         { label: 'Lot de production créé',     icon: <Package2 className="w-4 h-4" />,      bg: 'bg-violet-500/10', border: 'border-violet-500/30',  badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30' },
  LOT_UPDATED:         { label: 'Lot mis à jour',             icon: <Settings className="w-4 h-4" />,      bg: 'bg-purple-500/10', border: 'border-purple-500/30',  badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  LOT_COMPLETED:       { label: 'Lot terminé',                icon: <CheckCircle2 className="w-4 h-4" />,  bg: 'bg-emerald-500/10',border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'},
  MATERIAL_REQUESTED:  { label: 'Matière demandée',           icon: <AlertCircle className="w-4 h-4" />,   bg: 'bg-amber-500/10',  border: 'border-amber-500/30',   badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30'    },
  MATERIAL_CREATED:    { label: 'Matière créée en stock',     icon: <Package2 className="w-4 h-4" />,      bg: 'bg-teal-500/10',   border: 'border-teal-500/30',    badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30'       },
  RESERVATION_UPDATED: { label: 'Réservation de stock MàJ',  icon: <ClipboardList className="w-4 h-4" />, bg: 'bg-orange-500/10', border: 'border-orange-500/30',  badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
};

// Champs à exclure de l'affichage des données
const EXCLUDED_FIELDS = ['reservationId', 'stockItemId', 'clientId', 'orderId', 'id'];

// Libellés des champs
const FIELD_LABELS: Record<string, string> = {
  orderNumber: 'N° Commande',
  clientName: 'Client',
  status: 'Statut',
  quantity: 'Quantité',
  workOrderId: 'N° OF',
  reference: 'Référence',
  materialCode: 'Code Matière',
  deliveredAt: 'Livré le',
  priority: 'Priorité',
  product: 'Produit',
};

function StatusBadge({ status }: { status: string }) {
  const COLORS: Record<string, string> = {
    done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    confirmed: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    fulfilled: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${COLORS[status] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
      {status}
    </span>
  );
}

export function OrderJourneyView() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const { data: resp, isLoading } = useQuery({
    queryKey: ['order-journey', orderNumber],
    queryFn: async () => {
      const res = await apiClient.get<AuditLog[]>(
        `/api/traceability/logs/journey/${encodeURIComponent(orderNumber!)}`
      );
      return res.status === 'success' ? res.data : [];
    },
    enabled: !!orderNumber,
    refetchInterval: 20000,
  });

  const logs = resp ?? [];

  const serviceColor = (s: string) => {
    const MAP: Record<string, string> = {
      'sales-service': 'text-indigo-400',
      'production-service': 'text-blue-400',
      'logistics-service': 'text-orange-400',
    };
    return MAP[s] ?? 'text-slate-400';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/orders')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Parcours de la commande
          </h1>
          <p className="text-sm text-white/50 mt-1 font-mono">
            {orderNumber}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-white/50">Chargement de l'historique...</div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-white/40">
          <AlertCircle className="w-10 h-10" />
          <p className="text-sm">Aucun événement enregistré pour cette commande.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

          <ol className="space-y-4">
            {logs.map((log, idx) => {
              const cfg = EVENT_CONFIG[log.eventType] ?? {
                label: log.eventType,
                icon: <Package2 className="w-4 h-4" />,
                bg: 'bg-slate-700/30',
                border: 'border-slate-600/30',
                badge: 'bg-slate-600/20 text-slate-300 border-slate-500/30',
              };

              const isLast = idx === logs.length - 1;

              return (
                <li key={log._id} className="relative pl-16">
                  {/* Dot */}
                  <div className={`absolute left-3 top-4 flex h-7 w-7 items-center justify-center rounded-full border ${cfg.border} ${cfg.bg} text-white`}>
                    {cfg.icon}
                  </div>

                  <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 space-y-3`}>
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border text-xs ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-xs ${serviceColor(log.service)}`}>
                          {log.service.replace('-service', '')}
                        </span>
                      </div>
                      <time className="text-xs text-white/40 font-mono">
                        {new Date(log.timestamp).toLocaleString('fr-FR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </time>
                    </div>

                    {/* Data fields */}
                    {log.data && Object.keys(log.data).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(log.data)
                          .filter(([k]) => !EXCLUDED_FIELDS.includes(k) && typeof log.data[k] !== 'object')
                          .map(([k, v]) => {
                            const label = FIELD_LABELS[k] ?? k;
                            const val = String(v);
                            if (k === 'status') return (
                              <span key={k} className="flex items-center gap-1.5 text-xs text-white/50">
                                <span>{label} :</span>
                                <StatusBadge status={val} />
                              </span>
                            );
                            return (
                              <span key={k} className="text-xs bg-white/5 border border-white/10 text-white/60 px-2 py-0.5 rounded-full font-mono">
                                <span className="text-white/40">{label}:</span> {val.length > 30 ? val.slice(0, 30) + '…' : val}
                              </span>
                            );
                          })}
                      </div>
                    )}

                    {/* Show items array if present (for ORDER_CREATED) */}
                    {Array.isArray(log.data?.items) && (log.data.items as unknown[]).length > 0 && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                        <p className="text-xs text-white/40 mb-2 font-medium uppercase tracking-wider">Articles commandés</p>
                        {(log.data.items as Record<string, unknown>[]).map((item, i) => (
                          <div key={i} className="flex justify-between text-xs">
                            <span className="text-white/70 font-mono">{String(item.productName ?? item.productCode)}</span>
                            <span className="text-white/40">× {String(item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* End marker */}
          {logs.length > 0 && (
            <div className="relative pl-16 pt-4">
              <div className="absolute left-3 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <Truck className="w-4 h-4 text-white/30" />
              </div>
              <p className="text-xs text-white/30 italic">Fin de l'historique enregistré</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
