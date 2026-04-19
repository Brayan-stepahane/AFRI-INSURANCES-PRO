import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { normalizeDateInput } from '../utils/constants';
import { Vente } from '../types';

export function useVentes(refreshKey = 0) {
  const { user } = useAuth();
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.VENTES.LIST);

      // Transform snake_case API response to camelCase TypeScript types
      let transformed = Array.isArray(response.data) ? response.data.map((v: any) => ({
        id: v.id,
        prospId: v.prospection_id,
        clientId: v.client_id,
        commercial: v.commercial_nom || '',
        produit: v.produit || '',
        dateVente: normalizeDateInput(v.date_vente),
        typeVente: v.type_vente,
        noPolice: v.no_police || '',
        noAttestation: v.no_attestation || '',
        noCarteRose: v.no_carte_rose || '',
        primeNette: Number(v.prime_nette) || 0,
        accessoires: Number(v.accessoires) || 0,
        dateEffet: normalizeDateInput(v.date_effet),
        dateEcheance: normalizeDateInput(v.date_echeance),
      })) : [];

      setVentes(transformed);
    } catch (err) {
      console.error('Error fetching ventes:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ventes');
      setVentes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes();
  }, [user, refreshKey]);

  return { ventes, loading, error, refetch: fetchVentes };
}