import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from '../components/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/Table';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getReservations } from '../api/reservations';
import { formatDateTime, toNumber } from '../lib/utils';

export default function ReservationsView() {
  const { data: reservations = [], isLoading: loading } = useQuery({ queryKey: ['reservations'], queryFn: getReservations });
  const { searchQuery = '' } = useOutletContext<{ searchQuery?: string }>() || {};

  const filteredReservations = reservations.filter(res =>
    res.workOrderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (res.stockItem?.materialName ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.stockItemId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Réservations Matières</h2>
          <p className="text-sm text-slate-500 mt-1">Verrouillage anti-double allocation pour OF.</p>
        </div>
        <Button size="sm" onClick={() => alert('Module de réservation manuelle non disponible (V1)')}>
          <Lock className="w-4 h-4 mr-2" />
          Nouvelle Réservation
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
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
                  <TableCell colSpan={6} className="h-24 text-center">Chargement...</TableCell>
                </TableRow>
              ) : filteredReservations.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-mono text-sm font-semibold text-blue-700">
                    {res.workOrderId}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {res.stockItem?.materialName ?? res.stockItem?.materialCode ?? '—'}
                    <span className="block text-xs text-slate-500 font-mono mt-0.5.">stockItemId: {res.stockItemId}</span>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-slate-800">
                    {toNumber(res.quantity)}
                  </TableCell>
                  <TableCell>
                    {res.status === 'pending' && <Badge variant="warning">En attente</Badge>}
                    {res.status === 'confirmed' && <Badge variant="warning">Confirmée</Badge>}
                    {res.status === 'fulfilled' && <Badge variant="success">Honorée</Badge>}
                    {res.status === 'cancelled' && <Badge variant="default">Annulée</Badge>}
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">
                    {formatDateTime(res.createdAt ?? '')}
                  </TableCell>
                  <TableCell className="text-right">
                    {(res.status === 'pending' || res.status === 'confirmed') && (
                       <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700" onClick={() => alert('Gestion de la réservation ' + res.workOrderId)}>Gérer</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
