// Re-export existing auth types
export { type UserRole, type User, type AuthResponse, type LoginPayload, type RegisterPayload } from './auth.types';

// Dashboard types
export type Role = 'commercial' | 'manager_adj' | 'manager' | 'chef' | 'admin';
export type TypeClient = 'Particulier' | 'Corporate' | 'Personnel';
export type StatutProspection =
  | 'Premier contact' | 'Relance 1' | 'Relance 2'
  | 'Cotation envoyée' | 'En attente signature'
  | 'Contrat conclu' | 'Perdu';
export type StatutCotation = 'En attente' | 'Validée' | 'Refusée' | 'Convertie en vente';
export type TypeVente = 'NouVe' | 'VenRec';

export interface Client {
  id: string;           // CLI-0001
  nom: string;
  tel: string;
  activite: string;
  type: TypeClient;
}

export interface Prospection {
  id: number;
  clientId: string;
  commercial: string;
  produit: string;
  potentielCA: number;
  chance: number;
  statut: StatutProspection;
  dateContact: string;
  dateRelance: string;
  dateV1: string;
  dateV2: string;
  dateV3: string;
  observations: string;
  ancienAssureur: string;
  dateAncienEch: string;
}

export interface Cotation {
  id: number;
  noCot: number;
  prospId: number;
  clientId: string;
  commercial: string;
  risqueCote: string;
  dateCotation: string;
  montant: number;
  dateValidation: string;
  statut: StatutCotation;
}

export interface Vente {
  id: number;
  prospId: number;
  clientId: string;
  commercial: string;
  produit: string;
  dateVente: string;
  typeVente: TypeVente;
  noPolice: string;
  noAttestation: string;
  noCarteRose: string;
  primeNette: number;
  accessoires: number;
  dateEffet: string;
  dateEcheance: string;
}

export interface Objectif {
  mensuel: number;
  reporte: number;
}

export interface ObjectifEntry {
  commercial: string;
  mensuel: number;
  reporte: number;
  caRealise: number;
  total: number;
  pct: number;
  reste: number;
}
