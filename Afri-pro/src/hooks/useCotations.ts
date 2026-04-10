import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { Cotation } from '../types';

export function useCotations(refreshKey = 0) {
  const { user } = useAuth();
  const [cotations, setCotations] = useState<Cotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCotations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.COTATIONS.LIST);

      // Transform snake_case API response to camelCase TypeScript types
      let transformed = Array.isArray(response.data) ? response.data.map((c: any) => ({
        id: c.id,
        noCot: c.numero || 0,
        prospId: c.prospection_id,
        clientId: c.client_id,
        commercial: c.commercial_nom || '',
        risqueCote: c.risque_cote || '',
        dateCotation: c.date_cotation,
        montant: Number(c.montant) || 0,
        dateValidation: c.date_validation,
        statut: c.statut,
      })) : [];

      // Filter by role and user
      let filtered = transformed;

      if (user?.role === 'commercial') {
        const normalizedUserName = (user.name || '').trim().toLowerCase();
        filtered = filtered.filter((c: Cotation) => {
          const cCommercial = (c.commercial || '').trim().toLowerCase();
          return cCommercial === normalizedUserName || normalizedUserName.includes(cCommercial) || cCommercial.includes(normalizedUserName);
        });
      }

      setCotations(filtered);
    } catch (err) {
      console.error('Error fetching cotations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cotations');
      setCotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotations();
  }, [user, refreshKey]);

  return { cotations, loading, error, refetch: fetchCotations };
}

export function useCotationById(cotationId: number) {
  const { cotations } = useCotations();
  return cotations.find(c => c.id === cotationId);
}
