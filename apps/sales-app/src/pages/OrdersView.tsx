import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOrders, updateOrderStatus } from '../api/sales';
import { 
  QueryErrorAlert, 
  Card, 
  DataTable, 
  StatusBadge 
} from '@aeronexis-dynamics/ui';

export function OrdersView() {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sales-orders'],
    queryFn: getOrders,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    }
  });

  const handleUpdateStatus = (id: string, status: string) => {
    mutation.mutate({ id, status });
  };

  const columns = [
    {
      accessorKey: 'orderNumber',
      header: 'Numéro',
      cell: (info: any) => <span className="font-mono text-sm font-medium text-white">{info.getValue()}</span>,
    },
    {
      id: 'client',
      header: 'Client',
      accessorFn: (row: any) => row.client?.companyName || 'Inconnu',
      cell: (info: any) => <span className="text-white/80">{info.getValue()}</span>,
    },
    {
      accessorKey: 'orderDate',
      header: 'Date',
      cell: (info: any) => {
        const date = info.getValue();
        return <span className="text-white/60">{new Date(date).toLocaleDateString('fr-FR')}</span>;
      }
    },
    {
      accessorKey: 'expectedDeliveryDate',
      header: 'Date de livraison (Prévue)',
      cell: (info: any) => {
        const date = info.getValue();
        if (!date) return <span className="text-white/40">-</span>;
        
        const isUrgent = new Date(date).getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        return (
          <span className={`font-medium ${isUrgent ? 'text-amber-400' : 'text-white/60'}`}>
            {new Date(date).toLocaleDateString('fr-FR')}
            {isUrgent && <span className="ml-2 text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">Urgent</span>}
          </span>
        );
      }
    },
    {
      accessorKey: 'totalAmount',
      header: 'Montant',
      cell: (info: any) => {
        const val = Number(info.getValue());
        const currency = info.row.original.currency || 'EUR';
        return (
          <span className="font-bold text-indigo-300">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(val)}
          </span>
        );
      }
    },
    {
      accessorKey: 'salesRepresentative',
      header: 'Commercial',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: (info: any) => {
        const status = info.getValue();
        return (
          <StatusBadge 
            status={
              status === 'pending' ? 'En attente' : 
              status === 'confirmed' ? 'Confirmée' : 
              status === 'in_production' ? 'En production' : 
              status === 'ready' ? 'Prête' : 
              status === 'shipped' ? 'Expédiée' : 
              status === 'delivered' ? 'Livrée' : 
              status === 'cancelled' ? 'Annulée' : status
            } 
            variant={
              status === 'pending' ? 'warning' : 
              (status === 'delivered' || status === 'shipped') ? 'success' : 
              status === 'cancelled' ? 'danger' : 'info'
            } 
          />
        );
      }
    },
    {
      id: 'actions',
      header: 'Validation',
      cell: (info: any) => {
        const { id, status } = info.row.original;
        if (status !== 'pending') return <span className="text-white/40 text-sm">Traitée</span>;
        
        return (
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdateStatus(id, 'confirmed')}
              className="px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
            >
              Valider
            </button>
            <button 
              onClick={() => handleUpdateStatus(id, 'cancelled')}
              className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
            >
              Refuser
            </button>
          </div>
        );
      }
    }
  ];

  if (isError) {
    return <QueryErrorAlert error={error} onRetry={() => refetch()} title="Erreur lors du chargement des commandes" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Commandes Clients</h1>
          <p className="text-sm text-white/60 mt-1">Suivez les ventes et leur état d'avancement</p>
        </div>
        <Link 
          to="/orders/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Commande
        </Link>
      </div>

      <Card className="p-0 overflow-hidden border-white/10 bg-white/5">
        <DataTable
          data={orders}
          columns={columns}
        />
      </Card>
    </div>
  );
}
