import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Calendar, FileText } from 'lucide-react';
import { getClient } from '../api/sales';
import { 
  QueryErrorAlert, 
  Card, 
  DataTable, 
  StatusBadge 
} from '@aeronexis-dynamics/ui';

export function ClientDetailView() {
  const { id } = useParams<{ id: string }>();

  const { data: client, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sales-client', id],
    queryFn: () => getClient(id as string),
    enabled: !!id,
  });

  if (isError) {
    return <QueryErrorAlert error={error} onRetry={() => refetch()} title="Erreur lors du chargement du client" />;
  }

  if (isLoading || !client) {
    return <div className="text-white/60 animate-pulse">Chargement...</div>;
  }

  const orderColumns = [
    {
      accessorKey: 'orderNumber',
      header: 'Numéro',
      cell: (info: any) => <span className="font-mono text-sm font-medium text-white">{info.getValue()}</span>,
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
  ];

  // Calculs statistiques rapides
  const orders = (client as any).orders || [];
  const totalRevenue = orders.filter((o: any) => o.status !== 'cancelled').reduce((acc: number, o: any) => acc + Number(o.totalAmount), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/clients"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">{client.companyName}</h1>
            <StatusBadge 
              status={client.status === 'active' ? 'Actif' : 'Inactif'} 
              variant={client.status === 'active' ? 'success' : 'info'} 
            />
          </div>
          <p className="text-sm text-white/60 mt-1 font-mono">Code: {client.clientCode}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche : Coordonnées */}
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-white/10 bg-white/5">
            <h2 className="text-lg font-semibold text-white mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Building2 className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Catégorie</p>
                  <p className="text-white font-medium capitalize">{client.category}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <FileText className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Contact Principal</p>
                  <p className="text-white font-medium">{client.contactName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Email</p>
                  <a href={`mailto:${client.email}`} className="text-indigo-400 hover:text-indigo-300 font-medium">{client.email}</a>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Téléphone</p>
                  <p className="text-white font-medium">{client.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Adresse</p>
                  <p className="text-white font-medium">{client.address || (client as any).billingAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="w-4 h-4 text-white/40 mt-0.5" />
                <div>
                  <p className="text-white/60 mb-1">Client depuis</p>
                  <p className="text-white font-medium">{new Date(client.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistiques Rapides */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Commandes</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">En attente</p>
              <p className="text-2xl font-bold text-amber-400">{pendingOrders}</p>
            </Card>
            <Card className="p-4 border-white/10 bg-white/5 col-span-2">
              <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">CA Généré</p>
              <p className="text-2xl font-bold text-indigo-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
              </p>
            </Card>
          </div>
        </div>

        {/* Colonne de droite : Commandes du client */}
        <div className="md:col-span-2">
          <Card className="p-0 overflow-hidden border-white/10 bg-white/5 h-full flex flex-col">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Historique des Commandes</h2>
            </div>
            {orders.length > 0 ? (
              <DataTable
                data={orders}
                columns={orderColumns}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
                <FileText className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60">Ce client n'a pas encore passé de commande.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
