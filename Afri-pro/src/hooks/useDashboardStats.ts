import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api/api';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { normalizeDateInput } from '../utils/constants';
import { Prospection } from '../types';

interface DashboardStats {
  activeProspects: number;
  quotations: number;
  pendingCotations: number;
  completedSales: number;
  totalRevenue: number;
  urgentFollowUps: Prospection[];
  pipelineData: {
    prospects: number;
    quotations: number;
    sales: number;
  };
  recentSales: any[];
  loading: boolean;
  error: string | null;
}

export function useDashboardStats(refreshKey = 0): DashboardStats {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    activeProspects: 0,
    quotations: 0,
    pendingCotations: 0,
    completedSales: 0,
    totalRevenue: 0,
    urgentFollowUps: [],
    pipelineData: { prospects: 0, quotations: 0, sales: 0 },
    recentSales: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!token || !user) {
      setStats(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // Fetch data from multiple APIs
        const [dashboardData, cotations, ventes, prospections] = await Promise.all([
          api.get(API_ENDPOINTS.DASHBOARD.STATS, token),
          api.get(API_ENDPOINTS.COTATIONS.LIST, token),
          api.get(API_ENDPOINTS.VENTES.LIST, token),
          api.get(API_ENDPOINTS.PROSPECTIONS.LIST, token),
        ]);

        // Transform snake_case API responses to camelCase Prospection objects
        const transformedProspections = Array.isArray(prospections) ? prospections.map((p: any) => ({
          id: p.id,
          clientId: p.client_id,
          commercial: p.commercial_nom || '',
          produit: p.risque_prospecte || '',
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
        })) : [];

        const transformedCotations = Array.isArray(cotations) ? cotations.map((c: any) => ({
          id: c.id,
          noCot: c.numero || 0,
          prospId: c.prospection_id,
          clientId: c.client_id,
          commercial: c.commercial_nom || '',
          risqueCote: c.risque_cote || '',
          dateCotation: normalizeDateInput(c.date_cotation),
          montant: Number(c.montant) || 0,
          dateValidation: normalizeDateInput(c.date_validation),
          statut: c.statut,
        })) : [];

        const transformedVentes = Array.isArray(ventes) ? ventes.map((v: any) => ({
          id: v.id,
          prospId: v.prospection_id,
          clientId: v.client_id,
          commercial: v.commercial_nom || '',
          produit: v.produit || '',
          dateVente: normalizeDateInput(v.date_vente),
          typeVente: v.type_vente,
          noPolice: v.no_police || '',
          primeNette: Number(v.prime_nette) || 0,
          accessoires: Number(v.accessoires) || 0,
          dateEffet: normalizeDateInput(v.date_effet),
          dateEcheance: normalizeDateInput(v.date_echeance),
        })) : [];

        // Calculate stats from transformed data
        const activeProspects = transformedProspections.filter(
          (p: any) => !['Contrat conclu', 'Perdu'].includes(p.statut)
        ).length;

        const quotations = transformedCotations.length;
        const pendingCotations = transformedCotations.filter((c: any) => c.statut === 'En attente').length;
        const completedSales = transformedVentes.length;
        const totalRevenue = transformedVentes.reduce(
          (sum: number, v: any) => sum + (v.primeNette || 0) + (v.accessoires || 0), 0
        );

        const urgentFollowUps = transformedProspections.filter((p: any) => {
          if (!p.dateRelance) return false;
          const relanceDate = new Date(p.dateRelance);
          return relanceDate < new Date();
        });

        const recentSales = transformedVentes.slice(-4).reverse();

        setStats({
          activeProspects,
          quotations,
          pendingCotations,
          completedSales,
          totalRevenue,
          urgentFollowUps,
          pipelineData: {
            prospects: transformedProspections.length,
            quotations,
            sales: completedSales,
          },
          recentSales,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        }));
      }
    };

    fetchStats();
  }, [token, user, refreshKey]);

  return stats;
}

export function useObjective(refreshKey = 0) {
  const { user, token } = useAuth();
  const [objective, setObjective] = useState({
    mensuel: 500000,
    mensuelVie: 250000,
    mensuelNonVie: 250000,
    reporte: 0,
    reporteVie: 0,
    reporteNonVie: 0,
    ca: 0,
    caVie: 0,
    caNonVie: 0,
    total: 500000,
    pct: 0,
    reste: 500000,
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    if (!token || !user) {
      setObjective(prev => ({ ...prev, loading: false }));
      return;
    }

    const fetchObjective = async () => {
      try {
        setObjective(prev => ({ ...prev, loading: true, error: null }));

        const dashboardData = await api.get(API_ENDPOINTS.DASHBOARD.STATS, token);

        // Get objective data for the current user from dashboard API
        const objectives = dashboardData.objectifs || [];
        const currentUserObjectif = objectives.find((obj: any) => String(obj.commercial_id) === String(user?.id));
        const objData = currentUserObjectif || objectives[0] || { objectif_mensuel: user?.objectifMensuel || 500000, reporte: 0, ca_realise: 0 };

        const mensuel = Number(objData.objectif_mensuel || user?.objectifMensuel || 500000);
        const mensuelVie = Number(objData.objectif_mensuel_vie || mensuel / 2);
        const mensuelNonVie = Number(objData.objectif_mensuel_non_vie || mensuel / 2);
        const reporte = Number(objData.reporte || 0);
        const reporteVie = Number(objData.montant_reporte_vie || 0);
        const reporteNonVie = Number(objData.montant_reporte_non_vie || 0);
        const ca = Number(objData.ca_realise || 0);
        const caVie = Number(objData.ca_vie || 0);
        const caNonVie = Number(objData.ca_non_vie || 0);
        const total = mensuel + reporte;
        const pct = total > 0 ? Math.min(100, Math.round((ca / total) * 100)) : 0;
        const reste = Math.max(0, total - ca);

        setObjective({
          mensuel,
          mensuelVie,
          mensuelNonVie,
          reporte,
          reporteVie,
          reporteNonVie,
          ca,
          caVie,
          caNonVie,
          total,
          pct,
          reste,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching objective:', error);
        setObjective(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load objective data',
        }));
      }
    };

    fetchObjective();
  }, [token, user, refreshKey]);

  return objective;
}

export function useTeamObjectives(refreshKey = 0) {
  const { token } = useAuth();
  const [objectives, setObjectives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTeamObjectives = async () => {
      try {
        setLoading(true);
        setError(null);

        const dashboardData = await api.get(API_ENDPOINTS.DASHBOARD.STATS, token);
        console.log('Dashboard data received:', dashboardData); // DEBUG
        
        const objectivesList = dashboardData.objectifs || [];
        console.log('Objectifs array:', objectivesList); // DEBUG

        const teamObjs = objectivesList
          .filter((obj: any) => obj.commercial_nom) // Ensure we have commercial name
          .map((obj: any) => {
            const mapped = {
              commercial: obj.commercial_nom,
              mensuel: Number(obj.objectif_mensuel || obj.montant_mensuel) || 0,
              mensuelVie: Number(obj.objectif_mensuel_vie) || (Number(obj.objectif_mensuel || obj.montant_mensuel) || 0) / 2,
              mensuelNonVie: Number(obj.objectif_mensuel_non_vie) || (Number(obj.objectif_mensuel || obj.montant_mensuel) || 0) / 2,
              reporte: Number(obj.reporte || obj.montant_reporte) || 0,
              reporteVie: Number(obj.montant_reporte_vie) || 0,
              reporteNonVie: Number(obj.montant_reporte_non_vie) || 0,
              ca: Number(obj.ca_realise) || 0,
              caVie: Number(obj.ca_vie) || 0,
              caNonVie: Number(obj.ca_non_vie) || 0,
              total: Number(obj.total_objectif) || (Number(obj.objectif_mensuel || obj.montant_mensuel) || 0) + (Number(obj.reporte || obj.montant_reporte) || 0),
              pct: Number(obj.pct_atteint) || 0,
              reste: Number(obj.montant_restant) || 0,
            };
            console.log(`Mapped objective for ${obj.commercial_nom}:`, mapped); // DEBUG
            return mapped;
          });

        console.log('Final team objectives:', teamObjs); // DEBUG
        setObjectives(teamObjs);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team objectives:', err); // DEBUG
        setError(err instanceof Error ? err.message : 'Failed to load objectives');
        setObjectives([]);
        setLoading(false);
      }
    };

    fetchTeamObjectives();
  }, [token, refreshKey]);

  return objectives;
}
