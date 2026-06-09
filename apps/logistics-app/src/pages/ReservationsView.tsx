import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable, Badge, Button } from '@aeronexis-dynamics/ui';
import { Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, updateReservationStatus } from '../api/reservations';
import { formatDateTime, toNumber } from '../lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import type { LogisticsReservation } from '@aeronexis-dynamics/shared-types';

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

const columnHelper = createColumnHelper<LogisticsReservation>();

export default function ReservationsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: reservations = [], isLoading: loading } = useQuery({ queryKey: ['reservations'], queryFn: getReservations });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateReservationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['stocks'] }); // Invalidate stocks too
    }
  });

  // Rafraîchissement automatique en temps réel lors d'une nouvelle demande
  React.useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const socket = io();
      socket.on("notification", (data) => {
        if (data.targetApp === 'logistics' || data.targetApp === 'global') {
          // Invalider le cache pour forcer un re-fetch dynamique des réservations
          queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
      });
      return () => socket.disconnect();
    });
  }, [queryClient]);

  const filteredReservations = useMemo(() => reservations.filter(res =>
    res?.workOrderId?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    (res?.stockItem?.materialName ?? '').toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    res?.stockItemId?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  ), [reservations, searchQuery]);

  const columns = useMemo(() => [
    columnHelper.accessor('workOrderId', {
      header: 'N° Ordre (OF)',
      cell: info => <span className="font-mono text-sm font-bold text-indigo-400">{info.getValue()}</span>,
      size: 160,
    }),
    columnHelper.display({
      id: 'article',
      header: 'Article',
      cell: info => {
        const res = info.row.original;
        return (
          <>
            <span className="font-medium text-white">
              {res.stockItem?.materialName ?? res.stockItem?.materialCode ?? '—'}
            </span>
            <span className="block text-xs text-slate-500 font-mono mt-0.5">stockItemId: {res.stockItemId}</span>
          </>
        );
      },
    }),
    columnHelper.accessor('quantity', {
      header: () => <div className="text-right">Qté Réservée</div>,
      cell: info => <div className="text-right font-mono font-medium text-slate-300">{toNumber(info.getValue() as string)}</div>,
    }),
    columnHelper.accessor('status', {
      header: 'Statut',
      cell: info => {
        const status = info.getValue();
        if (status === 'pending') return <Badge variant="warning">En attente</Badge>;
        if (status === 'confirmed') return <Badge variant="success">Réservée</Badge>;
        if (status === 'fulfilled') return <Badge variant="success">Honorée</Badge>;
        if (status === 'cancelled') return <Badge variant="default">Annulée</Badge>;
        return null;
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Date d\'Allocation',
      cell: info => <span className="text-slate-400 font-mono text-xs">{formatDateTime(info.getValue() ?? '')}</span>,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => {
        const res = info.row.original;
        if (res.status === 'pending' || res.status === 'confirmed') {
          return (
            <div className="text-right flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" 
                onClick={() => navigate(`/reservations/${res.id}`)}
              >
                Gérer
              </Button>
              {res.status === 'pending' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg" 
                  onClick={() => updateStatus.mutate({ id: res.id, status: 'confirmed' })}
                  disabled={updateStatus.isPending}
                >
                  {updateStatus.isPending ? 'En cours...' : 'Réserver'}
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg" 
                onClick={() => updateStatus.mutate({ id: res.id, status: 'cancelled' })}
                disabled={updateStatus.isPending}
              >
                Annuler
              </Button>
            </div>
          );
        }
        return (
          <div className="text-right flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg" 
              onClick={() => navigate(`/reservations/${res.id}`)}
            >
              Gérer
            </Button>
          </div>
        );
      },
      size: 96,
    }),
  ], []);

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
        <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => navigate('/reservations/new')}>
          <Lock className="w-4 h-4" />
          Nouvelle Réservation
        </Button>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-slate-400">Chargement...</div>
      ) : (
        <DataTable columns={columns} data={filteredReservations} />
      )}
    </motion.div>
  );
}
