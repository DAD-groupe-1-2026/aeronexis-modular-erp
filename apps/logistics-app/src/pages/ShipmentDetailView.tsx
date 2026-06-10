import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Badge } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Save, Clock, Package, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShipmentById, updateShipment } from '../api/shipments';
import { apiClient } from '@aeronexis-dynamics/api-client';
import { formatDateTime } from '../lib/utils';
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

interface AuditLog {
  _id: string;
  eventType: string;
  service: string;
  data: Record<string, unknown>;
  timestamp: string;
}

const EVENT_LABELS: Record<string, { label: string; color: string }> = {
  RESERVATION_UPDATED:   { label: 'Réservation mise à jour',  color: 'text-indigo-400' },
  WORK_ORDER_UPDATED:    { label: 'Ordre de fabrication MàJ', color: 'text-blue-400'   },
  WORK_ORDER_CREATED:    { label: 'Ordre de fabrication créé', color: 'text-emerald-400'},
  ORDER_CREATED:         { label: 'Commande créée',            color: 'text-amber-400'  },
  LOT_UPDATED:           { label: 'Lot mis à jour',            color: 'text-purple-400' },
  LOT_COMPLETED:         { label: 'Lot terminé',               color: 'text-emerald-400'},
  MATERIAL_REQUESTED:    { label: 'Matière demandée',          color: 'text-orange-400' },
  MATERIAL_CREATED:      { label: 'Matière créée',             color: 'text-teal-400'   },
};

export default function ShipmentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading } = useQuery({ 
    queryKey: ['shipments', id], 
    queryFn: () => getShipmentById(id!) 
  });

  // Logs depuis le traceability service, filtrés par orderId de l'expédition
  const { data: logsResp, isLoading: logsLoading } = useQuery({
    queryKey: ['audit-logs', 'shipment', shipment?.orderId],
    queryFn: async () => {
      const res = await apiClient.get<AuditLog[]>(
        `/api/traceability/logs?orderId=${encodeURIComponent(shipment!.orderId)}`
      );
      return res.status === 'success' ? res.data : [];
    },
    enabled: !!shipment?.orderId,
    refetchInterval: 15000,
  });

  const logs: AuditLog[] = logsResp ?? [];

  const [status, setStatus] = useState<LogisticsShipment['status']>('preparing');
  const [deliveredDate, setDeliveredDate] = useState<string>('');

  React.useEffect(() => {
    if (shipment) {
      setStatus(shipment.status);
      if (shipment.deliveredDate) {
        setDeliveredDate(new Date(shipment.deliveredDate).toISOString().slice(0, 16));
      }
    }
  }, [shipment]);

  const updateMutation = useMutation({
    mutationFn: updateShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs', 'shipment', shipment?.orderId] });
    },
    onError: (error) => {
      alert(`Erreur lors de la mise à jour: ${error.message}`);
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateMutation.mutate({
      id,
      payload: {
        status,
        deliveredDate: deliveredDate ? new Date(deliveredDate).toISOString() : undefined
      }
    });
  };

  if (isLoading) return <div className="p-8 text-slate-400">Chargement...</div>;
  if (!shipment) return <div className="p-8 text-red-400">Expédition introuvable.</div>;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Détails de l'Expédition</h2>
          <p className="text-sm text-slate-400 mt-1">Suivi et historique de traçabilité.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-8">
        
        {/* En-tête / Résumé */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-mono font-bold text-white mb-2">{shipment.trackingNumber}</h3>
            <p className="text-slate-400 text-sm">Transporteur : <span className="text-indigo-300">{shipment.carrier}</span></p>
          </div>
          <div>
            <Badge variant={shipment.status === 'delivered' ? 'success' : shipment.status === 'returned' ? 'error' : 'info'}>
              {shipment.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Informations Détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/30 p-5 rounded-xl border border-white/5">
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Commande / OF</span>
            <span className="font-mono text-white">{shipment.orderId}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Destination</span>
            <span className="text-white">{shipment.destination}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date Prévue</span>
            <span className="text-white font-mono">{formatDateTime(shipment.scheduledDate)}</span>
          </div>
          <div>
            <span className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Poids</span>
            <span className="text-white">{shipment.weight ? `${shipment.weight} kg` : 'Non renseigné'}</span>
          </div>
        </div>

        {/* Formulaire de mise à jour */}
        <form onSubmit={handleUpdate} className="pt-6 border-t border-white/10 space-y-6">
          <h4 className="text-lg font-medium text-white">Mise à jour du Suivi</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nouveau Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LogisticsShipment['status'])}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="preparing">En préparation</option>
                <option value="shipped">Expédiée</option>
                <option value="in_transit">En transit</option>
                <option value="delivered">Livrée</option>
                <option value="returned">Retournée</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Date de Livraison Effective</label>
              <input
                type="datetime-local"
                value={deliveredDate}
                onChange={(e) => setDeliveredDate(e.target.value)}
                disabled={status !== 'delivered'}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
              />
            </div>
            
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="submit"
              className="rounded-xl shadow-lg gap-2"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Enregistrement...' : (
                <>
                  <Save className="w-4 h-4" />
                  Mettre à jour
                </>
              )}
            </Button>
          </div>
        </form>

      </div>

      {/* ── Historique de traçabilité ── */}
      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Historique de traçabilité</h3>
          <span className="text-xs text-slate-500 ml-auto">Référence : <span className="font-mono text-slate-400">{shipment.orderId}</span></span>
        </div>

        {logsLoading ? (
          <div className="flex items-center justify-center h-20 text-slate-400 text-sm">Chargement des logs...</div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-500">
            <AlertCircle className="w-6 h-6 opacity-50" />
            <span className="text-sm">Aucun événement enregistré pour cette expédition.</span>
          </div>
        ) : (
          <ol className="relative border-l border-white/10 ml-2 space-y-0">
            {logs.map((log, idx) => {
              const meta = EVENT_LABELS[log.eventType] ?? { label: log.eventType, color: 'text-slate-400' };
              return (
                <li key={log._id} className="mb-6 ml-6 last:mb-0">
                  <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 border border-white/10">
                    <Package className="w-3 h-3 text-indigo-400" />
                  </span>
                  <div className="bg-slate-800/40 border border-white/5 rounded-xl px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <span className={`text-sm font-semibold ${meta.color}`}>{meta.label}</span>
                      <time className="text-xs text-slate-500 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('fr-FR')}
                      </time>
                    </div>
                    <p className="text-xs text-slate-500">
                      Service : <span className="text-slate-400">{log.service}</span>
                    </p>
                    {/* Données clés du payload */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {log.data && Object.entries(log.data)
                        .filter(([k]) => !['reservationId'].includes(k))
                        .slice(0, 5)
                        .map(([k, v]) => (
                          <span key={k} className="text-xs bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-white/5">
                            {k}: {String(v)}
                          </span>
                        ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

    </motion.div>
  );
}
