import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Badge } from '@aeronexis-dynamics/ui';
import { Button } from '@aeronexis-dynamics/ui';
import { Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getShipments } from '../api/shipments';
import type { LogisticsShipment } from '@aeronexis-dynamics/shared-types';
import { formatDateTime } from '../lib/utils';

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

export default function ShipmentsView() {
  const { data: shipments = [], isLoading: loading } = useQuery({ queryKey: ['shipments'], queryFn: getShipments });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredShipments = shipments.filter(shp =>
    shp.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shp.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shp.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shp.carrier.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: LogisticsShipment['status']) => {
    switch (status) {
      case 'preparing': return <Badge variant="warning">En préparation</Badge>;
      case 'shipped': return <Badge variant="info">Expédiée</Badge>;
      case 'in_transit': return <Badge variant="info">En transit</Badge>;
      case 'delivered': return <Badge variant="success">Livrée</Badge>;
      case 'returned': return <Badge variant="error">Retournée</Badge>;
    }
  };

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
        <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => alert("Planification d'expédition (V1)")}>
          <Truck className="w-4 h-4" />
          Planifier Expédition
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
                <TableHead className="w-40">N° Commande</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date Prévue</TableHead>
                <TableHead>Transporteur</TableHead>
                <TableHead>N° Suivi</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-400">Chargement...</TableCell>
                </TableRow>
              ) : filteredShipments.map((shp) => (
                <TableRow key={shp.id}>
                  <TableCell className="font-mono text-sm font-bold text-indigo-400">
                    {shp.orderId}
                  </TableCell>
                  <TableCell className="font-medium text-white">
                    {shp.destination.split(',')[0]?.trim() || shp.destination}
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono text-sm">
                    {formatDateTime(shp.scheduledDate)}
                  </TableCell>
                  <TableCell className="text-slate-300">{shp.carrier}</TableCell>
                  <TableCell className="font-mono text-xs text-indigo-400 hover:underline cursor-pointer hover:text-indigo-300 transition-colors">
                    {shp.trackingNumber}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(shp.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-indigo-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors" onClick={() => alert('Détails pour ' + shp.orderId)}>Détails</Button>
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
