import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createShipment } from '../api/shipments';
import { getReservations } from '../api/reservations';
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function NewShipmentView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: reservations = [] } = useQuery({ queryKey: ['reservations'], queryFn: getReservations });
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');

  const [formData, setFormData] = useState<Partial<LogisticsShipment> & { reservationId?: string }>({
    orderId: '',
    trackingNumber: '',
    destination: '',
    carrier: '',
    status: 'preparing',
    scheduledDate: '',
    weight: 0,
    reservationId: '',
  });

  const mutation = useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      navigate('/shipments');
    },
    onError: (error) => {
      alert(`Erreur lors de la création: ${error.message}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'reservationId') {
      const selectedRes = confirmedReservations.find(r => r.id === value);
      if (selectedRes) {
        setFormData(prev => ({
          ...prev,
          reservationId: value,
          orderId: selectedRes.workOrderId // Auto-fill
        }));
      } else {
        setFormData(prev => ({ ...prev, reservationId: '' }));
      }
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.destination || !formData.carrier || !formData.scheduledDate || !formData.trackingNumber) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    
    // Ensure scheduledDate is a valid date string or date object depending on backend
    mutation.mutate({
      ...formData,
      scheduledDate: new Date(formData.scheduledDate as string).toISOString()
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/shipments')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Nouvelle Expédition</h2>
          <p className="text-sm text-slate-400 mt-1">Planifier une livraison et assigner un transporteur.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Lier à une Réservation Confirmée (Optionnel)</label>
              <select
                name="reservationId"
                value={formData.reservationId}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">Sélectionnez une réservation...</option>
                {confirmedReservations.map(res => (
                  <option key={res.id} value={res.id}>
                    OF: {res.workOrderId} - {res.stockItem?.materialName} ({res.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">N° Commande (OF / Vente) <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                required
                placeholder="Ex: CMD-2026-101"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">N° Suivi Transporteur <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                required
                placeholder="Ex: 1Z99999999"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Destination (Adresse Complète) <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                placeholder="Ex: 123 Rue de la Logistique, 75001 Paris"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Transporteur <span className="text-red-400">*</span></label>
              <select
                name="carrier"
                value={formData.carrier}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">Sélectionnez un transporteur...</option>
                <option value="DHL">DHL Express</option>
                <option value="FedEx">FedEx</option>
                <option value="UPS">UPS</option>
                <option value="Chronopost">Chronopost</option>
                <option value="Interne">Flotte Interne</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Date de Livraison Prévue <span className="text-red-400">*</span></label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate as string}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Poids Estimé (kg)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Statut Initial</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="preparing">En préparation</option>
                <option value="shipped">Expédiée</option>
              </select>
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-slate-300 hover:text-white"
              onClick={() => navigate('/shipments')}
              disabled={mutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-xl shadow-lg gap-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Enregistrement...' : (
                <>
                  <Save className="w-4 h-4" />
                  Valider
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
