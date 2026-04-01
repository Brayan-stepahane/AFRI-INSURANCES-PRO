import { useAuth } from './useAuth';
import {
  getProspectionsForUser, getCotationsForUser, getVentesForUser,
  caThisMois, objectifs, getClient, isOverdue, ventes,
} from '../store/data';
import { Prospection } from '../types';

export function useDashboardStats() {
  const { user } = useAuth();
  const name = user?.name ?? '';
  const role = user?.role ?? 'commercial';

  const myProspections = getProspectionsForUser(name, role);
  const myCotations = getCotationsForUser(name, role);
  const myVentes = getVentesForUser(name, role);

  const enCours = myProspections.filter(
    p => !['Contrat conclu', 'Perdu'].includes(p.statut)
  );
  const ventes = myProspections.filter(p => p.statut === 'Contrat conclu');
  const pendingCotations = myCotations.filter(c => c.statut === 'En attente').length;
  const totalRevenue = myVentes.reduce(
    (s, v) => s + (v.primeNette || 0) + (v.accessoires || 0), 0
  );
  const urgentFollowUps: Prospection[] = enCours.filter(
    p => p.dateRelance && isOverdue(p.dateRelance)
  );

  return {
    activeProspects: enCours.length,
    quotations: myCotations.length,
    pendingCotations,
    completedSales: myVentes.length,
    totalRevenue,
    urgentFollowUps,
    pipelineData: {
      prospects: myProspections.length,
      quotations: myCotations.length,
      sales: myVentes.length,
    },
    recentSales: myVentes.slice(-4).reverse(),
  };
}

export function useObjective() {
  const { user } = useAuth();
  const name = user?.name ?? '';
  const obj = objectifs[name] ?? { mensuel: 500000, reporte: 0 };
  const ca = caThisMois(name);
  const total = obj.mensuel + obj.reporte;
  const pct = total > 0 ? Math.min(100, Math.round((ca / total) * 100)) : 0;
  const reste = Math.max(0, total - ca);

  // Contract metrics
  const now = new Date();
  const contractsCompletedThisMonth = ventes.filter(v => {
    if (v.commercial !== name) return false;
    if (!v.dateVente) return false;
    const d = new Date(v.dateVente);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Calculate average deal value to estimate contract target
  const allSales = ventes.filter(v => v.commercial === name);
  const avgDealValue = allSales.length > 0
    ? allSales.reduce((s, v) => s + (v.primeNette || 0) + (v.accessoires || 0), 0) / allSales.length
    : 50000; // fallback average

  const estimatedContractTarget = total > 0 ? Math.round(total / avgDealValue) : 12; // 12 as default
  const contractsRemaining = Math.max(0, estimatedContractTarget - contractsCompletedThisMonth);
  const contractsReported = obj.reporte > 0 ? Math.round(obj.reporte / avgDealValue) : 0;
  const contractsNew = estimatedContractTarget - contractsReported;

  return {
    ...obj,
    ca,
    total,
    pct,
    reste,
    contractsCompletedThisMonth,
    estimatedContractTarget,
    contractsRemaining,
    contractsReported,
    contractsNew,
  };
}

export function useTeamObjectives() {
  return Object.entries(objectifs).map(([commercial, obj]) => {
    const ca = caThisMois(commercial);
    const total = obj.mensuel + obj.reporte;
    const pct = total > 0 ? Math.min(100, Math.round((ca / total) * 100)) : 0;
    return { commercial, ...obj, ca, total, pct, reste: Math.max(0, total - ca) };
  });
}
