import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Badge } from '@aeronexis-dynamics/ui';
import { Button } from '@aeronexis-dynamics/ui';
import { Download, Plus, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '../api/materials';
import { formatCategory, formatDateTime, toNumber } from '../lib/utils';

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

export default function StocksView() {
  const { data: materials = [], isLoading: loading } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredMaterials = materials.filter(mat =>
    mat.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.category.toLowerCase().includes(searchQuery.toLowerCase())
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
          <h2 className="text-2xl font-bold text-white tracking-tight">Stocks (WMS)</h2>
          <p className="text-sm text-slate-400 mt-1">Référentiel des matières premières et gestion des niveaux.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => alert('Export CSV non implémenté (V1)')}>
            <Download className="w-4 h-4" />
            Exporter CSV
          </Button>
          <Button size="sm" className="rounded-xl shadow-lg gap-2" onClick={() => alert("Création d'article non implémentée (V1)")}>
            <Plus className="w-4 h-4" />
            Nouvel Article
          </Button>
        </div>
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
                <TableHead className="w-32">Référence</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Disponible</TableHead>
                <TableHead className="text-right">Réservé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-[180px]">Dernier Mouvement</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-slate-400">Chargement...</TableCell>
                </TableRow>
              ) : filteredMaterials.map((mat) => {
                const available = toNumber(mat.quantityAvailable);
                const reserved = toNumber(mat.quantityReserved);
                const reorderLevel = toNumber(mat.reorderLevel);
                const isCritical = available < reorderLevel;

                return (
                  <TableRow key={mat.id}>
                    <TableCell className="font-mono text-sm text-indigo-400 font-bold">
                      {mat.materialCode}
                    </TableCell>
                    <TableCell className="font-medium text-white">{mat.materialName}</TableCell>
                    <TableCell className="text-slate-400">{formatCategory(mat.category)}</TableCell>
                    <TableCell className="text-right font-mono font-bold">
                      <span className={isCritical ? 'text-red-400' : 'text-slate-200'}>
                        {available} {mat.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-400">{reserved} {mat.unit}</TableCell>
                    <TableCell>
                      {isCritical ? (
                        <div className="flex items-center text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-md w-max">
                          <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                          ALERTE (Min {reorderLevel})
                        </div>
                      ) : (
                        <Badge variant="success" className="shadow-[0_0_10px_rgba(16,185,129,0.2)]">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      {formatDateTime(mat.updatedAt ?? mat.createdAt ?? '')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 shadow-none py-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" onClick={() => alert('Actions sur ' + mat.materialCode)}>Actions</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </motion.div>
  );
}
