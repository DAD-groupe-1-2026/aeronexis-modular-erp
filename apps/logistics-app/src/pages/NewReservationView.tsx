import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createReservation } from '../api/reservations';
import { getMaterials } from '../api/materials';
import type { LogisticsReservation } from '@aeronexis-dynamics/shared-types';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function NewReservationView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: materials = [] } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });

  const [formData, setFormData] = useState<Partial<LogisticsReservation>>({
    stockItemId: '',
    workOrderId: '',
    quantity: 1,
    status: 'pending',
    reservedBy: 'Logistics User', // Mocked user
  });

  const mutation = useMutation({
    mutationFn: createReservation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      navigate('/reservations');
    },
    onError: (error) => {
      alert(`Erreur lors de la création: ${error.message}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stockItemId || !formData.workOrderId) {
      alert('Veuillez remplir les champs obligatoires (Article et N° OF).');
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      alert('Veuillez définir une quantité valide (> 0).');
      return;
    }
    mutation.mutate(formData);
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
        <Button variant="ghost" size="sm" onClick={() => navigate('/reservations')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Nouvelle Réservation</h2>
          <p className="text-sm text-slate-400 mt-1">Allouer du stock pour un Ordre de Fabrication.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Article <span className="text-red-400">*</span></label>
              <select
                name="stockItemId"
                value={formData.stockItemId}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">Sélectionnez un article...</option>
                {materials.map(mat => (
                  <option key={mat.id} value={mat.id}>
                    {mat.materialCode} - {mat.materialName} ({mat.quantityAvailable} {mat.unit} dispo)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Numéro OF (Ordre de Fabrication) <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="workOrderId"
                value={formData.workOrderId}
                onChange={handleChange}
                required
                placeholder="Ex: OF-2026-001"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Quantité à Réserver <span className="text-red-400">*</span></label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Opérateur / Demandeur</label>
              <input
                type="text"
                name="reservedBy"
                value={formData.reservedBy}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl text-slate-300 hover:text-white"
              onClick={() => navigate('/reservations')}
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
                  Réserver
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
