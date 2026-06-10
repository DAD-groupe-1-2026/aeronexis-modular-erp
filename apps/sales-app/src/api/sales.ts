import { apiClient } from '@aeronexis-dynamics/api-client';
import type { 
  SalesOrder, 
  SalesClient, 
  SalesStatistics 
} from '@aeronexis-dynamics/shared-types';

export async function getStatistics(): Promise<SalesStatistics> {
  const res = await apiClient.get<SalesStatistics>('/api/sales/statistics');
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function getClients(): Promise<SalesClient[]> {
  const res = await apiClient.get<SalesClient[]>('/api/sales/clients');
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function getOrders(): Promise<SalesOrder[]> {
  const res = await apiClient.get<SalesOrder[]>('/api/sales/orders');
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function getClient(id: string): Promise<SalesClient> {
  const res = await apiClient.get<SalesClient>(`/api/sales/clients/${id}`);
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function createClient(data: Partial<SalesClient>): Promise<SalesClient> {
  const res = await apiClient.post<SalesClient>('/api/sales/clients', data);
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function createOrder(data: Partial<SalesOrder>): Promise<SalesOrder> {
  const res = await apiClient.post<SalesOrder>('/api/sales/orders', data);
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}

export async function updateOrderStatus(id: string, status: string): Promise<SalesOrder> {
  const res = await apiClient.patch<SalesOrder>(`/api/sales/orders/${id}/status`, { status });
  if (res.status === 'failure') throw new Error(res.error?.message);
  return res.data;
}
