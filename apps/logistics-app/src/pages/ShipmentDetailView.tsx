import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Badge } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShipmentById, updateShipment } from '../api/shipments';
import { formatDateTime } from '../lib/utils';
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function ShipmentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: shipment, isLoading } = useQuery({ 
    queryKey: ['shipments', id], 
    queryFn: () => getShipmentById(id!) 
  });

  const [status, setStatus] = useState<LogisticsShipment['status']>('preparing');
  const [deliveredDate, setDeliveredDate] = useState<string>('');

  // Initialize state when data loads
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
      alert('Expédition mise à jour avec succès.');
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
          <p className="text-sm text-slate-400 mt-1">Suivi et mise à jour du statut transport.</p>
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
    </motion.div>
  );
}
