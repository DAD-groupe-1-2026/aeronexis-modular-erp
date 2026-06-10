import { useQuery } from '@tanstack/react-query';
import { 
  Euro, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Clock
} from 'lucide-react';
import { getStatistics } from '../api/sales';
import { QueryErrorAlert, Card, StatusBadge } from '@aeronexis-dynamics/ui';

export function DashboardView() {
  const { data: stats, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['sales-statistics'],
    queryFn: getStatistics,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isError) {
    return <QueryErrorAlert error={error} onRetry={() => refetch()} title="Erreur de chargement" />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">Tableau de bord Commercial</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between z-10">
            <div>
              <p className="text-sm font-medium text-white/60">Chiffre d'Affaires</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(stats.totalRevenue)}
              </h3>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-xl shrink-0">
              <Euro className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between z-10">
            <div>
              <p className="text-sm font-medium text-white/60">Commandes Totales</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="p-3 bg-emerald-500/20 rounded-xl shrink-0">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between z-10">
            <div>
              <p className="text-sm font-medium text-white/60">Clients Actifs</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.activeClients}</h3>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl shrink-0">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden group p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-between z-10">
            <div>
              <p className="text-sm font-medium text-white/60">Commandes en Attente</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.pendingOrders}</h3>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl shrink-0">
              <Clock className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white">Évolution du CA (Mensuel)</h3>
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="h-64 flex items-end gap-2">
              {stats.revenueByMonth.map((item, idx) => {
                const maxRev = Math.max(...stats.revenueByMonth.map(m => m.revenue), 1);
                const height = `${(item.revenue / maxRev) * 100}%`;
                return (
                  <div key={idx} className="h-full flex-1 flex flex-col justify-end items-center group">
                    <div 
                      className="w-full bg-indigo-500/40 hover:bg-indigo-400/60 rounded-t-sm transition-all duration-300 relative"
                      style={{ height }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(item.revenue)}
                      </div>
                    </div>
                    <span className="text-xs text-white/50 mt-2 rotate-45 md:rotate-0">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div>
          <Card className="h-full p-6">
            <h3 className="text-lg font-medium text-white mb-6">Commandes Récentes</h3>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                    <p className="text-xs text-white/60">{order.client?.companyName || 'Client inconnu'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-indigo-300">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: order.currency || 'EUR' }).format(Number(order.totalAmount))}
                    </span>
                    <StatusBadge 
                      status={order.status === 'pending' ? 'En attente' : order.status === 'confirmed' ? 'Confirmée' : order.status === 'in_production' ? 'En production' : order.status === 'delivered' ? 'Livrée' : order.status} 
                      variant={order.status === 'pending' ? 'warning' : order.status === 'delivered' ? 'success' : 'info'} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
