export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
  THEME: 'theme',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

// Utility functions
export const fmt = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined) return '0';
  const value = typeof n === 'string' ? Number(n) : n;
  if (typeof value !== 'number' || Number.isNaN(value)) return '0';
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const fmtDate = (d: string): string =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '';

export const normalizeDateInput = (d: string | null | undefined): string =>
  d ? String(d).split('T')[0] : '';

export const isOverdue = (d: string): boolean =>
  d ? new Date(d) < new Date() : false;

// Status constants
export const STATUTS_PROSP = [
  'Premier contact', 'En discussion', 'Proposition envoyée', 'Négociation',
  'Contrat conclu', 'Perdu', 'Relance 1', 'Relance 2', 'Relance 3', 'Autre'
];

export const STATUTS_COT = ['En attente', 'Validée', 'Refusée', 'Convertie en vente'];
