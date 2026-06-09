import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable, Badge, Button } from '@aeronexis-dynamics/ui';
import { Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getShipments } from '../api/shipments';
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types';
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

const columnHelper = createColumnHelper<LogisticsShipment>();

export default function ShipmentsView() {
  const navigate = useNavigate();
  const { data: shipments = [], isLoading: loading } = useQuery({ queryKey: ['shipments'], queryFn: getShipments });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

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
      cell: info => (
        <div className="text-right">
          <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors" onClick={() => navigate(`/shipments/${info.row.original.id}`)}>Détails</Button>
        </div>
      ),
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
        <DataTable columns={columns} data={filteredShipments} />
      )}
    </motion.div>
  );
}
