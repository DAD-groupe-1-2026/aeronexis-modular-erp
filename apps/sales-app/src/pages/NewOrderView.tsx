import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getClients, createOrder, getProducts } from '../api/sales';
import { Card } from '@aeronexis-dynamics/ui';

export function NewOrderView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [orderNumber, setOrderNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [salesRepresentative, setSalesRepresentative] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState([{ productId: '', quantity: 1, discount: 0 }]);

  const { data: clients = [] } = useQuery({
    queryKey: ['sales-clients'],
    queryFn: getClients,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['sales-products'],
    queryFn: getProducts,
  });

  const computedTotal = useMemo(() => {
    let total = 0;
    items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const price = Number(product.basePrice);
        const qty = item.quantity || 1;
        const discount = item.discount || 0;
        total += (price * qty) * (1 - (discount / 100));
      }
    });
    return total;
  }, [items, products]);

  const mutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-statistics'] });
      navigate('/orders');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !clientId || !salesRepresentative || items.length === 0) return;
    
    // Validate items
    if (items.some(i => !i.productId || i.quantity <= 0)) return;

    mutation.mutate({
      orderNumber,
      clientId,
      deliveryDate: deliveryDate || undefined,
      totalAmount: computedTotal,
      salesRepresentative,
      notes,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        discount: i.discount
      })) as any
    });
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, discount: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/orders"
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Nouvelle Commande</h1>
          <p className="text-sm text-white/60 mt-1">Créez une nouvelle commande client</p>
        </div>
      </div>

      <Card className="p-6 bg-white/5 border-white/10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Numéro de Commande *
                </label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ex: SO-2026-1004"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Client *
                </label>
                <select
                  required
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.companyName} ({client.clientCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Date de livraison souhaitée
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [color-scheme:dark]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Représentant commercial *
                </label>
                <input
                  type="email"
                  required
                  value={salesRepresentative}
                  onChange={(e) => setSalesRepresentative(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="Ex: commercial@aeronexis.com"
                />
              </div>
            </div>
            
            {/* Lignes de produits */}
            <div className="pt-4 pb-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Produits *</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un produit
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start bg-slate-900/30 p-3 rounded-lg border border-white/5">
                    <div className="flex-1">
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => updateItem(index, 'productId', e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                      >
                        <option value="" disabled>Sélectionner un produit</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.code}) - {product.basePrice} €
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-24">
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
                        placeholder="Qté"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <div className="text-sm text-white/60">Montant Total Estimé</div>
                  <div className="text-2xl font-bold text-white">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(computedTotal)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Instructions particulières..."
              />
            </div>
          </div>

          {mutation.isError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Erreur lors de l'enregistrement : {mutation.error instanceof Error ? mutation.error.message : 'Une erreur est survenue'}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending || items.some(i => !i.productId)}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20"
            >
              {mutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer la commande
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
