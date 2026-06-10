import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable, Badge, Button } from '@aeronexis-dynamics/ui';
import { Truck, ChevronRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getShipments, updateShipment } from '../api/shipments';
import type { LogisticsShipment, ShipmentStatus } from '@aeronexis-dynamics/shared-types';
import { formatDateTime } from '../lib/utils';
import { createColumnHelper } from '@tanstack/react-table';

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

// Transitions de statut autorisées
const STATUS_TRANSITIONS: Record<ShipmentStatus, { value: ShipmentStatus; label: string; color: string }[]> = {
  preparing: [
    { value: 'shipped', label: 'Marquer Expédiée', color: 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' },
  ],
  shipped: [
    { value: 'in_transit', label: 'En transit', color: 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10' },
  ],
  in_transit: [
    { value: 'delivered', label: 'Marquer Livrée', color: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10' },
    { value: 'returned', label: 'Retournée', color: 'text-red-400 hover:text-red-300 hover:bg-red-500/10' },
  ],
  delivered: [],
  returned: [],
};

const columnHelper = createColumnHelper<LogisticsShipment>();

export default function ShipmentsView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: shipments = [], isLoading: loading } = useQuery({
    queryKey: ['shipments'],
    queryFn: getShipments,
    refetchInterval: 10000,
  });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  // Rafraîchissement temps réel via socket
  React.useEffect(() => {
    import('socket.io-client').then(({ io }) => {
      const socket = io();
      socket.on('notification', (data) => {
        if (data.targetApp === 'logistics' || data.targetApp === 'global') {
          queryClient.invalidateQueries({ queryKey: ['shipments'] });
        }
      });
      return () => socket.disconnect();
    });
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShipmentStatus }) =>
      updateShipment({ id, payload: { status } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
    },
  });

  const filteredShipments = useMemo(() => shipments.filter(shp =>
    shp?.orderId?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    shp?.destination?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    shp?.trackingNumber?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    shp?.carrier?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  ), [shipments, searchQuery]);

  const getStatusBadge = (status: LogisticsShipment['status']) => {
    switch (status) {
      case 'preparing': return <Badge variant="warning">En préparation</Badge>;
      case 'shipped': return <Badge variant="info">Expédiée</Badge>;
      case 'in_transit': return <Badge variant="info">En transit</Badge>;
      case 'delivered': return <Badge variant="success">Livrée</Badge>;
      case 'returned': return <Badge variant="error">Retournée</Badge>;
      default: return null;
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('orderId', {
      header: 'N° Commande',
      cell: info => <span className="font-mono text-sm font-bold text-indigo-400">{info.getValue()}</span>,
      size: 160,
    }),
    columnHelper.accessor('destination', {
      header: 'Destination',
      cell: info => <span className="font-medium text-white">{info.getValue()?.split(',')[0]?.trim() || info.getValue()}</span>,
    }),
    columnHelper.accessor('scheduledDate', {
      header: 'Date Prévue',
      cell: info => <span className="text-slate-400 font-mono text-sm">{formatDateTime(info.getValue())}</span>,
    }),
    columnHelper.accessor('carrier', {
      header: 'Transporteur',
      cell: info => <span className="text-slate-300">{info.getValue()}</span>,
    }),
    columnHelper.accessor('trackingNumber', {
      header: 'N° Suivi',
      cell: info => <span className="font-mono text-xs text-indigo-400 hover:underline cursor-pointer hover:text-indigo-300 transition-colors">{info.getValue()}</span>,
    }),
    columnHelper.accessor('status', {
      header: 'Statut',
      cell: info => getStatusBadge(info.getValue()),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => {
        const shipment = info.row.original;
        const transitions = STATUS_TRANSITIONS[shipment.status] ?? [];
        const isPending = updateStatusMutation.isPending;

        if (transitions.length === 0) return null;

        return (
          <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
            {transitions.map(t => (
              <Button
                key={t.value}
                variant="ghost"
                size="sm"
                className={`h-8 text-xs rounded-lg gap-1 ${t.color}`}
                disabled={isPending}
                onClick={() => updateStatusMutation.mutate({ id: shipment.id, status: t.value })}
              >
                <ChevronRight className="w-3 h-3" />
                {t.label}
              </Button>
            ))}
          </div>
        );
      },
      size: 240,
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [updateStatusMutation.isPending]);

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Expéditions</h2>
          <p className="text-sm text-slate-400 mt-1">Planification des livraisons et suivi transport.</p>
        </div>
        <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => navigate('/shipments/new')}>
          <Truck className="w-4 h-4" />
          Planifier Expédition
        </Button>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-slate-400">Chargement...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredShipments}
          onRowClick={(shp) => navigate(`/shipments/${shp.id}`)}
        />
      )}
    </motion.div>
  );
}
