import { useState, useEffect } from 'react';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { Client } from '../types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.CLIENTS.LIST);
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients');
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  return { clients, loading, error, refetch: fetchClients };
}

export function useClientById(clientId: string) {
  const { clients } = useClients();
  return clients.find(c => c.id === clientId);
}
