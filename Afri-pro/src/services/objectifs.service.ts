import { api } from './api/api';
import { API_ENDPOINTS } from './api/endpoints';

export interface ObjectiveAllocationRequest {
  managerId: number;
  totalVie: number;
  totalNonVie: number;
  mois: string; // YYYY-MM-DD format
}

export interface ObjectiveAllocationResponse {
  success: boolean;
  message: string;
  allocations: Array<{
    commercial: string;
    adjoint: string;
    montant_mensuel: number;
    montant_mensuel_vie: number;
    montant_mensuel_non_vie: number;
  }>;
  summary: {
    total_vie: number;
    total_non_vie: number;
    total_managers: number;
    total_adjoint: number;
    total_commercials: number;
    per_adjoint_vie: number;
    per_adjoint_non_vie: number;
  };
}

export const objectifsService = {
  allocateObjectives: async (data: ObjectiveAllocationRequest, token?: string): Promise<ObjectiveAllocationResponse> => {
    const response = await api.post(API_ENDPOINTS.OBJECTIFS.ALLOCATE, data, token);
    return response;
  },
};

export default objectifsService;

