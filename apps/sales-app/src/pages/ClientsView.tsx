import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getClients } from '../api/sales';
import { 
  QueryErrorAlert, 
  Card, 
  DataTable, 
  StatusBadge 
} from '@aeronexis-dynamics/ui';

export function ClientsView() {
  const navigate = useNavigate();
  const { data: clients = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sales-clients'],
    queryFn: getClients,
  });

  const columns = [
    {
      accessorKey: 'clientCode',
      header: 'Code Client',
      cell: (info: any) => <span className="font-mono text-sm text-white/80">{info.getValue()}</span>,
    },
    {
      accessorKey: 'companyName',
      header: 'Entreprise',
      cell: (info: any) => (
        <span className="font-medium text-white">{info.getValue()}</span>
      )
    },
    {
      accessorKey: 'contactName',
      header: 'Contact',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'country',
      header: 'Pays',
    },
    {
      accessorKey: 'category',
      header: 'Catégorie',
      cell: (info: any) => {
        const cat = info.getValue();
        return (
          <span className="capitalize text-indigo-300">
            {cat}
          </span>
        );
      }
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: (info: any) => {
        const status = info.getValue();
        return (
          <StatusBadge 
            status={status === 'active' ? 'Actif' : status === 'inactive' ? 'Inactif' : 'Suspendu'} 
            variant={status === 'active' ? 'success' : status === 'inactive' ? 'neutral' : 'danger'} 
          />
        );
      }
    },
  ];

  if (isError) {
    return <QueryErrorAlert error={error} onRetry={() => refetch()} title="Erreur lors du chargement des clients" />;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clients</h1>
          <p className="text-sm text-white/60 mt-1">Gérez votre portefeuille client</p>
        </div>
        <Link to="/clients/new" className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-colors shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" />
          Nouveau Client
        </Link>
      </div>

      <Card className="p-0 overflow-hidden border-white/10 bg-white/5">
        <DataTable
          data={clients}
          columns={columns}
          onRowClick={(c) => navigate(`/clients/${c.id}`)}
        />
      </Card>
    </div>
  );
}
