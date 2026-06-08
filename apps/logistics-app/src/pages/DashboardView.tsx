import { Card } from '@aeronexis-dynamics/ui';
import { PackageSearch, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { QueryErrorAlert } from '@aeronexis-dynamics/ui';
import { getMaterials } from '../api/materials';
import { getShipments } from '../api/shipments';
import { toNumber } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardView() {
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const shipmentsQuery = useQuery({ queryKey: ['shipments'], queryFn: getShipments });
  const { data: materials = [] } = materialsQuery;
  const { data: shipments = [] } = shipmentsQuery;

  if (materialsQuery.isLoading || shipmentsQuery.isLoading) {
    return <div className="text-sm text-slate-500">Chargement du tableau de bord...</div>;
  }

  if (materialsQuery.isError) {
    return (
      <QueryErrorAlert
        error={materialsQuery.error}
        onRetry={() => materialsQuery.refetch()}
        title="Erreur lors du chargement des stocks"
      />
    );
  }

  if (shipmentsQuery.isError) {
    return (
      <QueryErrorAlert
        error={shipmentsQuery.error}
        onRetry={() => shipmentsQuery.refetch()}
        title="Erreur lors du chargement des expéditions"
      />
    );
  }

  const criticalStocks = materials.filter(m => toNumber(m.quantityAvailable) < toNumber(m.reorderLevel)).length;
  const totalReserved = materials.reduce((acc, m) => acc + toNumber(m.quantityReserved), 0);

  const chartData = materials.map(m => ({
    name: m.materialCode,
    Disponible: toNumber(m.quantityAvailable),
    Réservé: toNumber(m.quantityReserved),
    Seuil: toNumber(m.reorderLevel),
  })).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vue d'ensemble</h2>
          <p className="text-sm text-slate-500 mt-1">Supervision temps réel des flux logistiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI
          title="Articles Référéncés"
          value={materials.length}
          icon={PackageSearch}
          color="blue"
        />
        <KPI
          title="Ruptures Imminentes"
          value={criticalStocks}
          icon={AlertCircle}
          color="red"
        />
        <KPI
          title="Unités Réservées"
          value={totalReserved.toLocaleString()}
          icon={TrendingDown}
          color="amber"
        />
        <KPI
          title="Expéditions Prévues"
          value={shipments.length}
          icon={Clock}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2">
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-sm font-semibold">Niveaux de Stock (Top 5 Références)</p>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="Disponible" stackId="a" fill="#3B82F6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Réservé" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-white/10">
            <p className="text-sm font-semibold">Alertes Critiques</p>
          </div>
          <div className="divide-y divide-white/5">
            {materials.filter(m => toNumber(m.quantityAvailable) < toNumber(m.reorderLevel)).map(mat => (
              <div key={mat.id} className="px-6 py-4 flex items-start space-x-4">
                <div className="bg-red-100 text-red-600 p-2 rounded-md shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{mat.materialName}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-mono">{mat.materialCode}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className="text-red-600 font-semibold">{toNumber(mat.quantityAvailable)} {mat.unit}</span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500">Seuil: {toNumber(mat.reorderLevel)} {mat.unit}</span>
                  </div>
                </div>
              </div>
            ))}
            {criticalStocks === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Aucune alerte de stock.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: 'blue' | 'red' | 'amber' | 'emerald' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <Card>
      <div className="p-6 flex items-center space-x-4">
        <div className={`p-4 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}
