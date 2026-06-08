import { motion } from 'framer-motion';
import { PackageSearch, TrendingDown, AlertCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { QueryErrorAlert } from '@aeronexis-dynamics/ui';
import { getMaterials } from '../api/materials';
import { getShipments } from '../api/shipments';
import { toNumber } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

export default function DashboardView() {
  const materialsQuery = useQuery({ queryKey: ['materials'], queryFn: getMaterials });
  const shipmentsQuery = useQuery({ queryKey: ['shipments'], queryFn: getShipments });
  const { data: materials = [] } = materialsQuery;
  const { data: shipments = [] } = shipmentsQuery;

  if (materialsQuery.isLoading || shipmentsQuery.isLoading) {
    return (
      <div className="text-sm text-slate-400 flex items-center gap-3">
        <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Chargement du tableau de bord...
      </div>
    );
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
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Vue d'ensemble</h2>
          <p className="text-sm text-slate-400 mt-1">Supervision temps réel des flux logistiques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          title="Articles Référencés"
          value={materials.length}
          icon={PackageSearch}
          color="blue"
          delay={0.1}
        />
        <KPI
          title="Ruptures Imminentes"
          value={criticalStocks}
          icon={AlertCircle}
          color="red"
          delay={0.2}
        />
        <KPI
          title="Unités Réservées"
          value={totalReserved.toLocaleString()}
          icon={TrendingDown}
          color="amber"
          delay={0.3}
        />
        <KPI
          title="Expéditions Prévues"
          value={shipments.length}
          icon={Clock}
          color="emerald"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden col-span-2"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10">
            <p className="text-sm font-bold text-white">Niveaux de Stock (Top 5 Références)</p>
          </div>
          <div className="p-6 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
                  contentStyle={{ backgroundColor: 'rgba(10, 10, 12, 0.8)', backdropFilter: 'blur(16px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="Disponible" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Réservé" stackId="a" fill="rgba(255,255,255,0.2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex items-center gap-2.5">
            <div className="p-1.5 bg-red-500/20 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-sm font-bold text-white">Alertes Critiques</p>
          </div>
          <div className="divide-y divide-white/5 flex-1 overflow-y-auto">
            {materials.filter(m => toNumber(m.quantityAvailable) < toNumber(m.reorderLevel)).map(mat => (
              <motion.div 
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                key={mat.id} 
                className="px-6 py-4 flex items-start space-x-4 transition-colors"
              >
                <div className="bg-red-500/20 text-red-400 p-2 rounded-xl shrink-0 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{mat.materialName}</p>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-mono">{mat.materialCode}</p>
                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className="text-red-400 font-bold">{toNumber(mat.quantityAvailable)} {mat.unit}</span>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-400">Seuil: {toNumber(mat.reorderLevel)} {mat.unit}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {criticalStocks === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-500">
                Aucune alerte de stock.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function KPI({ title, value, icon: Icon, color, delay = 0 }: { title: string; value: string | number; icon: any; color: 'blue' | 'red' | 'amber' | 'emerald', delay?: number }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/20 border-blue-500/20',
    red: 'text-red-400 bg-red-500/20 border-red-500/20',
    amber: 'text-amber-400 bg-amber-500/20 border-amber-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl px-5 py-5 flex items-center gap-4 shadow-xl"
    >
      <div className={`p-3 rounded-xl border ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-white leading-none tracking-tight">{value}</p>
      </div>
    </motion.div>
  );
}
