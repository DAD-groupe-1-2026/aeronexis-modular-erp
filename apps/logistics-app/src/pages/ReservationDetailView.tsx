import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@aeronexis-dynamics/ui';
import { ArrowLeft, Send, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getReservations, sendReservationMessage } from '../api/reservations';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

export default function ReservationDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Pour l'instant, getReservations() retourne tout. On trouve la bonne.
  const { data: reservations = [], isLoading } = useQuery({ 
    queryKey: ['reservations'], 
    queryFn: getReservations 
  });
  
  const reservation = reservations.find(r => r.id === id);

  const [message, setMessage] = useState('');

  const messageMutation = useMutation({
    mutationFn: () => sendReservationMessage(id!, message),
    onSuccess: () => {
      alert('Message envoyé à la production.');
      setMessage('');
    },
    onError: (error) => {
      alert(`Erreur lors de l'envoi du message: ${error.message}`);
    }
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    messageMutation.mutate();
  };

  if (isLoading) return <div className="p-8 text-slate-400">Chargement...</div>;

  if (!reservation) return <div className="p-8 text-red-400">Réservation introuvable.</div>;

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Gérer la Réservation</h2>
          <p className="text-sm text-slate-400 mt-1">Détails de la réservation et communication avec la production.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6">
        
        {/* Résumé de la réservation */}
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-300 bg-slate-800/50 p-4 rounded-xl border border-white/5">
          <div>
            <span className="block text-slate-500 mb-1">N° OF (Ordre de Fabrication)</span>
            <span className="font-mono font-bold text-indigo-400">{reservation.workOrderId}</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Statut</span>
            <span className="font-bold">{reservation.status}</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Article</span>
            <span className="font-medium text-white">{reservation.stockItem?.materialName || 'Inconnu'}</span>
          </div>
          <div>
            <span className="block text-slate-500 mb-1">Quantité Réservée</span>
            <span className="font-mono">{reservation.quantity}</span>
          </div>
        </div>

        {/* Formulaire de message */}
        <form onSubmit={handleSendMessage} className="space-y-4 pt-4 border-t border-white/10">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Message à l'attention de la production</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Attention, le lot fourni nécessite un contrôle visuel..."
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="submit"
              className="rounded-xl shadow-lg gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={messageMutation.isPending || !message.trim()}
            >
              {messageMutation.isPending ? 'Envoi...' : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer Notification
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </motion.div>
  );
}
