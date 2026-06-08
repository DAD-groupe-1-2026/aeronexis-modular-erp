import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Badge } from '@aeronexis-dynamics/ui';
import { Button } from '@aeronexis-dynamics/ui';
import { Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getReservations } from '../api/reservations';
import { formatDateTime, toNumber } from '../lib/utils';

const pageVariants = {
  initial: { opacity: 0, y: 15 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -15 }
};

const pageTransition = {
  type: "tween" as const,
  ease: "anticipate" as const,
  duration: 0.4
};

export default function ReservationsView() {
  const { data: reservations = [], isLoading: loading } = useQuery({ queryKey: ['reservations'], queryFn: getReservations });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredReservations = reservations.filter(res =>
    res.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.stockItem?.materialName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.stockItemId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Réservations Matières</h2>
          <p className="text-sm text-slate-400 mt-1">Verrouillage anti-double allocation pour OF.</p>
        </div>
        <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => alert('Module de réservation manuelle non disponible (V1)')}>
          <Lock className="w-4 h-4" />
          Nouvelle Réservation
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden"
      >
        <div className="">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">N° Ordre (OF)</TableHead>
                <TableHead>Article</TableHead>
                <TableHead className="text-right">Qté Réservée</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'Allocation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-400">Chargement...</TableCell>
                </TableRow>
              ) : filteredReservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-mono text-sm font-bold text-indigo-400">
                    {res.workOrderId}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {res.stockItem?.materialName ?? res.stockItem?.materialCode ?? '—'}
                    <span className="block text-xs text-slate-500 font-mono mt-0.5">stockItemId: {res.stockItemId}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-slate-300">
                    {toNumber(res.quantity)}
                  </TableCell>
                  <TableCell>
                    {res.status === 'pending' && <Badge variant="warning">En attente</Badge>}
                    {res.status === 'confirmed' && <Badge variant="warning">Confirmée</Badge>}
                    {res.status === 'fulfilled' && <Badge variant="success">Honorée</Badge>}
                    {res.status === 'cancelled' && <Badge variant="default">Annulée</Badge>}
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono text-xs">
                    {formatDateTime(res.createdAt ?? '')}
                  </TableCell>
                  <TableCell className="text-right">
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                       <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg" onClick={() => alert('Gestion de la réservation ' + res.workOrderId)}>Gérer</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}
