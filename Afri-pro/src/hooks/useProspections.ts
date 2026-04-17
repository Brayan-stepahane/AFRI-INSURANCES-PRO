import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import apiClient from '../services/api/client';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { normalizeDateInput } from '../utils/constants';
import { Prospection } from '../types';

export function useProspections(refreshKey = 0) {
  const { user } = useAuth();
  const [prospections, setProspections] = useState<Prospection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProspections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(API_ENDPOINTS.PROSPECTIONS.LIST);

      // Transform snake_case API response to camelCase TypeScript types
      let transformed = Array.isArray(response.data) ? response.data.map((p: any) => ({
        id: p.id,
        clientId: p.client_id,
        commercial: p.commercial_nom || '',
        produit: p.risque_prospecte || '',
        potentielCA: Number(p.potentiel_ca) || 0,
        chance: (Number(p.chance_realisation) || 0) * 100,
        statut: p.statut,
        dateContact: normalizeDateInput(p.date_prospection),
        dateRelance: normalizeDateInput(p.date_relance),
        dateV1: normalizeDateInput(p.date_visite_1),
        dateV2: normalizeDateInput(p.date_visite_2),
        dateV3: normalizeDateInput(p.date_visite_3),
        observations: p.observations || '',
        ancienAssureur: p.ancien_assureur || '',
        dateAncienEch: normalizeDateInput(p.date_echeance_ancien),
        active: p.active === true,
      })) : [];


      // Filter by role and user
      let filtered = transformed;

      if (user?.role === 'commercial') {
        const normalizedUserName = (user.name || '').trim().toLowerCase();
        filtered = filtered.filter((p: Prospection) => {
          const pCommercial = (p.commercial || '').trim().toLowerCase();
          return pCommercial === normalizedUserName || normalizedUserName.includes(pCommercial) || pCommercial.includes(normalizedUserName);
        });
      }

      setProspections(filtered);
    } catch (err) {
      console.error('Error fetching prospections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prospections');
      setProspections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProspections();
  }, [user, refreshKey]);

  return { prospections, loading, error, refetch: fetchProspections };
}

export function useProspectionById(prospectionId: number) {
  const { prospections } = useProspections();
  return prospections.find(p => p.id === prospectionId);
}
