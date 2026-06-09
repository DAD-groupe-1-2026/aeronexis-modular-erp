import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMaterialById, updateMaterial } from '../api/materials';
import type { LogisticsStockItem } from '@aeronexis-dynamics/shared-types';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function ArticleDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: material, isLoading } = useQuery({
    queryKey: ['material', id],
    queryFn: () => getMaterialById(id!),
    enabled: !!id
  });

  const [formData, setFormData] = useState<Partial<LogisticsStockItem>>({
    materialCode: '',
    materialName: '',
    category: 'raw_material',
    unit: 'kg',
    quantityAvailable: 0,
    reorderLevel: 100,
    location: '',
    supplier: '',
  });

  useEffect(() => {
    if (material) {
      setFormData({
        materialCode: material.materialCode,
        materialName: material.materialName,
        category: material.category,
        unit: material.unit,
        quantityAvailable: material.quantityAvailable,
        reorderLevel: material.reorderLevel,
        location: material.location || '',
        supplier: material.supplier || '',
      });
    }
  }, [material]);

  const mutation = useMutation({
    mutationFn: updateMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      queryClient.invalidateQueries({ queryKey: ['material', id] });
      navigate('/stocks');
    },
    onError: (error) => {
      alert(`Erreur lors de la mise à jour: ${error.message}`);
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
    if (!formData.materialCode || !formData.materialName) {
      alert('Veuillez remplir les champs obligatoires (Code et Désignation).');
      return;
    }
    mutation.mutate({ id: id!, payload: formData });
  };

  if (isLoading) {
    return <div className="p-8 text-slate-400">Chargement...</div>;
  }

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/stocks')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Détails de l'Article</h2>
          <p className="text-sm text-slate-400 mt-1">Consulter ou modifier les informations de l'article.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Code Référence <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="materialCode"
                value={formData.materialCode}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Désignation <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Catégorie</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="raw_material">Matière Première</option>
                <option value="component">Composant</option>
                <option value="consumable">Consommable</option>
                <option value="packaging">Emballage</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Unité de Mesure</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              >
                <option value="kg">Kilogramme (kg)</option>
                <option value="g">Gramme (g)</option>
                <option value="L">Litre (L)</option>
                <option value="mL">Millilitre (mL)</option>
                <option value="u">Unité (u)</option>
                <option value="pce">Pièce (pce)</option>
                <option value="m">Mètre (m)</option>
                <option value="cm">Centimètre (cm)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Quantité Disponible</label>
              <input
                type="number"
                name="quantityAvailable"
                value={formData.quantityAvailable}
                onChange={handleChange}
                min="0"
                step="1"
                required
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Seuil d'Alerte (Min)</label>
              <input
                type="number"
                name="reorderLevel"
                value={formData.reorderLevel}
                onChange={handleChange}
                min="0"
                step="1"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Emplacement (Optionnel)</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Fournisseur (Optionnel)</label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
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
              onClick={() => navigate('/stocks')}
              disabled={mutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-xl shadow-lg gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Mise à jour...' : (
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
