import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api/api';
import { API_ENDPOINTS } from '../services/api/endpoints';
import { Prospection } from '../types';
import { caThisMois, objectifs } from '../store/data';

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

        // Calculate stats from API data
        const activeProspects = prospections.filter(
          (p: any) => !['Contrat conclu', 'Perdu'].includes(p.statut)
        ).length;

        const quotations = cotations.length;
        const pendingCotations = cotations.filter((c: any) => c.statut === 'En attente').length;
        const completedSales = ventes.length;
        const totalRevenue = ventes.reduce(
          (sum: number, v: any) => sum + (v.prime_nette || 0) + (v.accessoires || 0), 0
        );

        const urgentFollowUps = prospections.filter((p: any) => {
          if (!p.date_relance) return false;
          const relanceDate = new Date(p.date_relance);
          return relanceDate < new Date();
        });

        const recentSales = ventes.slice(-4).reverse();

        setStats({
          activeProspects,
          quotations,
          pendingCotations,
          completedSales,
          totalRevenue,
          urgentFollowUps,
          pipelineData: {
            prospects: prospections.length,
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
    reporte: 0,
    ca: 0,
    total: 500000,
    pct: 0,
    reste: 500000,
    contractsCompletedThisMonth: 0,
    estimatedContractTarget: 12,
    contractsRemaining: 12,
    contractsReported: 0,
    contractsNew: 12,
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
        const ventes = await api.get(API_ENDPOINTS.VENTES.LIST, token);

        // Get objective data from dashboard API
        const objData = dashboardData.objectifs?.[0] || { objectif_mensuel: 500000, reporte: 0, ca_realise: 0 };

        const mensuel = objData.objectif_mensuel || 500000;
        const reporte = objData.reporte || 0;
        const ca = objData.ca_realise || 0;
        const total = mensuel + reporte;
        const pct = total > 0 ? Math.min(100, Math.round((ca / total) * 100)) : 0;
        const reste = Math.max(0, total - ca);

        // Contract metrics
        const now = new Date();
        const contractsCompletedThisMonth = ventes.filter((v: any) => {
          if (!v.date_vente) return false;
          const d = new Date(v.date_vente);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;

        // Calculate average deal value to estimate contract target
        const avgDealValue = ventes.length > 0
          ? ventes.reduce((s: number, v: any) => s + (v.prime_nette || 0) + (v.accessoires || 0), 0) / ventes.length
          : 50000; // fallback average

        const estimatedContractTarget = total > 0 ? Math.round(total / avgDealValue) : 12; // 12 as default
        const contractsRemaining = Math.max(0, estimatedContractTarget - contractsCompletedThisMonth);
        const contractsReported = reporte > 0 ? Math.round(reporte / avgDealValue) : 0;
        const contractsNew = estimatedContractTarget - contractsReported;

        setObjective({
          mensuel,
          reporte,
          ca,
          total,
          pct,
          reste,
          contractsCompletedThisMonth,
          estimatedContractTarget,
          contractsRemaining,
          contractsReported,
          contractsNew,
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

export function useTeamObjectives() {
  return Object.entries(objectifs).map(([commercial, obj]) => {
    const ca = caThisMois(commercial);
    const total = obj.mensuel + obj.reporte;
    const pct = total > 0 ? Math.min(100, Math.round((ca / total) * 100)) : 0;
    return { commercial, ...obj, ca, total, pct, reste: Math.max(0, total - ca) };
  });
}
