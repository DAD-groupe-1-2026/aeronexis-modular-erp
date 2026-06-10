import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DataTable, Badge, Button } from '@aeronexis-dynamics/ui';
import { Download, Plus, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '../api/materials';
import { formatCategory, formatDateTime, toNumber } from '../lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import type { LogisticsStockItem } from '@aeronexis-dynamics/shared-types';

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

const columnHelper = createColumnHelper<LogisticsStockItem>();

export default function StocksView() {
  const navigate = useNavigate();
  const { data: materials = [], isLoading: loading } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredMaterials = useMemo(() => materials.filter(mat =>
    mat?.materialCode?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    mat?.materialName?.toLowerCase().includes(searchQuery?.toLowerCase() || '') ||
    mat?.category?.toLowerCase().includes(searchQuery?.toLowerCase() || '')
  ), [materials, searchQuery]);

  const columns = useMemo(() => [
    columnHelper.accessor('materialCode', {
      header: 'Référence',
      cell: info => <span className="font-mono text-sm text-indigo-400 font-bold">{info.getValue()}</span>,
      size: 120,
    }),
    columnHelper.accessor('materialName', {
      header: 'Désignation',
      cell: info => <span className="font-medium text-white">{info.getValue()}</span>,
    }),
    columnHelper.accessor('category', {
      header: 'Catégorie',
      cell: info => <span className="text-slate-400">{formatCategory(info.getValue() as string)}</span>,
    }),
    columnHelper.accessor('quantityAvailable', {
      header: () => <div className="text-right">Disponible</div>,
      cell: info => {
        const mat = info.row.original;
        const available = toNumber(mat.quantityAvailable);
        const reorderLevel = toNumber(mat.reorderLevel);
        const isCritical = available < reorderLevel;
        return (
          <div className="text-right font-mono font-bold">
            <span className={isCritical ? 'text-red-400' : 'text-slate-200'}>
              {available} {mat.unit}
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor('quantityReserved', {
      header: () => <div className="text-right">Réservé</div>,
      cell: info => {
        const mat = info.row.original;
        const reserved = toNumber(mat.quantityReserved);
        return <div className="text-right font-mono text-slate-400">{reserved} {mat.unit}</div>;
      },
    }),
    columnHelper.display({
      id: 'status',
      header: 'Statut',
      cell: info => {
        const mat = info.row.original;
        const available = toNumber(mat.quantityAvailable);
        const reorderLevel = toNumber(mat.reorderLevel);
        const isCritical = available < reorderLevel;
        return isCritical ? (
          <div className="flex items-center text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md w-max">
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            ALERTE (Min {reorderLevel})
          </div>
        ) : (
          <Badge variant="success" className="shadow-[0_0_10px_rgba(16,185,129,0.2)]">OK</Badge>
        );
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: 'Dernier Mouvement',
      cell: info => {
        const val = info.getValue() ?? info.row.original.createdAt ?? '';
        return <span className="text-slate-500 font-mono text-xs">{formatDateTime(val)}</span>;
      },
      size: 180,
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Stocks (WMS)</h2>
          <p className="text-sm text-slate-400 mt-1">Référentiel des matières premières et gestion des niveaux.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => alert('Export CSV non implémenté (V1)')}>
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => navigate('/stocks/new')}>
            <Plus className="w-4 h-4" />
            Nouvel Article
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-24 flex items-center justify-center text-slate-400">Chargement...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredMaterials}
          onRowClick={(mat) => navigate(`/stocks/${mat.id}`)}
        />
      )}
    </motion.div>
  );
}
