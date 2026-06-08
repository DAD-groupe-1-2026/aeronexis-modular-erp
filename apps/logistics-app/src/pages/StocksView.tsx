import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card } from '@aeronexis-dynamics/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Badge } from '@aeronexis-dynamics/ui';
import { Button } from '@aeronexis-dynamics/ui';
import { Download, Plus, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '../api/materials';
import { formatCategory, formatDateTime, toNumber } from '../lib/utils';

export default function StocksView() {
  const { data: materials = [], isLoading: loading } = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredMaterials = materials.filter(mat =>
    mat.materialCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mat.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Stocks (WMS)</h2>
          <p className="text-sm text-slate-500 mt-1">Référentiel des matières premières et gestion des niveaux.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={() => alert('Export CSV non implémenté (V1)')}>
            <Download className="w-4 h-4 mr-2" />
            Exporter CSV
          </Button>
          <Button size="sm" onClick={() => alert("Création d'article non implémentée (V1)")}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Article
          </Button>
        </div>
      </div>

      <Card>
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
                  <TableCell colSpan={8} className="h-24 text-center">Chargement...</TableCell>
                </TableRow>
              ) : filteredMaterials.map((mat) => {
                const available = toNumber(mat.quantityAvailable);
                const reserved = toNumber(mat.quantityReserved);
                const reorderLevel = toNumber(mat.reorderLevel);
                const isCritical = available < reorderLevel;

                return (
                  <TableRow key={mat.id}>
                    <TableCell className="font-mono text-sm text-slate-600 font-medium">
                      {mat.materialCode}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{mat.materialName}</TableCell>
                    <TableCell className="text-slate-500">{formatCategory(mat.category)}</TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      <span className={isCritical ? 'text-red-600' : 'text-slate-900'}>
                        {available} {mat.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-500">{reserved} {mat.unit}</TableCell>
                    <TableCell>
                      {isCritical ? (
                        <div className="flex items-center text-red-600 text-xs font-semibold">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          ALERTE (Min {reorderLevel})
                        </div>
                      ) : (
                        <Badge variant="success">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 font-mono text-xs">
                      {formatDateTime(mat.updatedAt ?? mat.createdAt ?? '')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 shadow-none py-0" onClick={() => alert('Actions sur ' + mat.materialCode)}>Actions</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
