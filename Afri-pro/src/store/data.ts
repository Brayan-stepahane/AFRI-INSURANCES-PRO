import { Client, Prospection, Cotation, Vente, Objectif } from '../types';

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
export let clients: Client[] = [
  { id: 'CLI-0001', nom: 'DJEUKEU JUSTIN',    tel: '699971760', activite: "Chef d'entreprise", type: 'Particulier' },
  { id: 'CLI-0002', nom: 'DJIFO CALVIN',      tel: '675139113', activite: "Chef d'entreprise", type: 'Particulier' },
  { id: 'CLI-0003', nom: 'AJANG ROLAND',      tel: '677382783', activite: 'Enseignant',          type: 'Particulier' },
  { id: 'CLI-0004', nom: 'DHASSI',            tel: '694642943', activite: "Chef d'entreprise", type: 'Particulier' },
  { id: 'CLI-0005', nom: 'DZOYEM TASSE',      tel: '',          activite: "Chef d'entreprise", type: 'Particulier' },
  { id: 'CLI-0006', nom: 'AF CONSULTING',     tel: '699644745', activite: "Chef d'entreprise", type: 'Particulier' },
  { id: 'CLI-0007', nom: 'OBAM MENDJO',       tel: '683558017', activite: 'Commissaire',         type: 'Particulier' },
  { id: 'CLI-0008', nom: 'ABEGA NGONDA',      tel: '681104479', activite: 'Médecin',             type: 'Particulier' },
  { id: 'CLI-0009', nom: 'NANFACK PAUL',      tel: '699821138', activite: "Homme d'affaire",    type: 'Particulier' },
  { id: 'CLI-0010', nom: 'TSAMO/SC TIOKENG', tel: '699935348', activite: 'Commissaire',         type: 'Particulier' },
  { id: 'CLI-0011', nom: 'NJIAKIM',           tel: '694879417', activite: 'Retraité',            type: 'Corporate'   },
  { id: 'CLI-0012', nom: 'MELI ORNELLA',      tel: '691507601', activite: 'Employé',             type: 'Particulier' },
  { id: 'CLI-0013', nom: 'FOUENANG NIPIZE',   tel: '676468709', activite: 'Employé',             type: 'Particulier' },
  { id: 'CLI-0014', nom: 'NGUIMIKON BIKOE',   tel: '655990324', activite: 'Commerçant',          type: 'Particulier' },
  { id: 'CLI-0015', nom: 'KAKENGNE JEANNE',   tel: '679972793', activite: 'Employé',             type: 'Particulier' },
  { id: 'CLI-0016', nom: 'AKA AKETCHI',       tel: '640656585', activite: 'Employé',             type: 'Particulier' },
  { id: 'CLI-0017', nom: 'MOBARA DJERSNA',    tel: '699495015', activite: 'Employé',             type: 'Particulier' },
  { id: 'CLI-0018', nom: 'EKOTO MARTIN',      tel: '699112233', activite: 'Médecin',             type: 'Particulier' },
];

// ─── PROSPECTIONS ─────────────────────────────────────────────────────────────
export let prospections: Prospection[] = [
  { id:1,  clientId:'CLI-0001', commercial:'NGUEGUIM',   produit:'Afrilife retraite plus',         potentielCA:105000,  chance:100, statut:'Contrat conclu',   dateContact:'2025-11-05', dateRelance:'',           dateV1:'2026-11-05', dateV2:'2026-11-20', dateV3:'', observations:'INTERESSE',        ancienAssureur:'', dateAncienEch:'' },
  { id:2,  clientId:'CLI-0002', commercial:'NGUEGUIM',   produit:'Afrilife étude',                  potentielCA:100000,  chance:100, statut:'Contrat conclu',   dateContact:'2025-11-15', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:3,  clientId:'CLI-0003', commercial:'NGUEGUIM',   produit:'Afrilife étude',                  potentielCA:10000,   chance:100, statut:'Contrat conclu',   dateContact:'2025-12-12', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:4,  clientId:'CLI-0004', commercial:'NGUEGUIM',   produit:'Flotte Automobile',               potentielCA:486467,  chance:100, statut:'Contrat conclu',   dateContact:'2025-12-01', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:5,  clientId:'CLI-0007', commercial:'NGUEGUIM',   produit:'Flotte Automobile',               potentielCA:160669,  chance:100, statut:'Contrat conclu',   dateContact:'2025-12-20', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:6,  clientId:'CLI-0011', commercial:'NGUEGUIM',   produit:'Assurance Santé Groupe',          potentielCA:1433981, chance:100, statut:'Contrat conclu',   dateContact:'2026-01-13', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:7,  clientId:'CLI-0012', commercial:'NGUEGUIM',   produit:'Afrilife étude',                  potentielCA:52000,   chance:100, statut:'Contrat conclu',   dateContact:'2026-01-15', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:8,  clientId:'CLI-0013', commercial:'NGUEGUIM',   produit:'Afrilife retraite individuelle',  potentielCA:11000,   chance:100, statut:'Contrat conclu',   dateContact:'2026-02-15', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:9,  clientId:'CLI-0014', commercial:'AMENA',      produit:'Afrilife étude',                  potentielCA:11000,   chance:70,  statut:'Relance 1',        dateContact:'2026-02-15', dateRelance:'2026-04-01', dateV1:'2026-02-15', dateV2:'', dateV3:'', observations:'En discussion',    ancienAssureur:'', dateAncienEch:'' },
  { id:10, clientId:'CLI-0018', commercial:'AMENA',      produit:'Assurance Santé Groupe',          potentielCA:250000,  chance:50,  statut:'Cotation envoyée', dateContact:'2026-02-20', dateRelance:'2026-03-30', dateV1:'2026-02-20', dateV2:'2026-03-10', dateV3:'', observations:'Cotation envoyée', ancienAssureur:'', dateAncienEch:'' },
  { id:11, clientId:'CLI-0016', commercial:'ONGOMALELA', produit:'Afrilife étude',                  potentielCA:25000,   chance:100, statut:'Contrat conclu',   dateContact:'2025-11-10', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:12, clientId:'CLI-0017', commercial:'ONGOMALELA', produit:'Afrilife étude',                  potentielCA:450000,  chance:100, statut:'Contrat conclu',   dateContact:'2025-11-14', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:13, clientId:'CLI-0015', commercial:'MBA MAMBA',  produit:'Afrilife retraite individuelle',  potentielCA:15000,   chance:100, statut:'Contrat conclu',   dateContact:'2026-02-10', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:14, clientId:'CLI-0009', commercial:'MAHOT',      produit:'Flotte Automobile',               potentielCA:355000,  chance:100, statut:'Contrat conclu',   dateContact:'2025-12-25', dateRelance:'',           dateV1:'', dateV2:'', dateV3:'', observations:'',                  ancienAssureur:'', dateAncienEch:'' },
  { id:15, clientId:'CLI-0001', commercial:'NGUEGUIM',   produit:'Afrilife retraite plus',          potentielCA:150000,  chance:80,  statut:'En attente signature', dateContact:'2026-03-01', dateRelance:'2026-04-05', dateV1:'2026-03-01', dateV2:'2026-03-15', dateV3:'', observations:'Contrat en cours de signature', ancienAssureur:'', dateAncienEch:'' },
];

// ─── COTATIONS ────────────────────────────────────────────────────────────────
export let cotations: Cotation[] = [
  { id:1,  noCot:1,  prospId:1,  clientId:'CLI-0001', commercial:'NGUEGUIM',   risqueCote:'LIBRE RETRAITE', dateCotation:'2025-11-20', montant:105000,  dateValidation:'2025-11-20', statut:'Convertie en vente' },
  { id:2,  noCot:2,  prospId:2,  clientId:'CLI-0002', commercial:'NGUEGUIM',   risqueCote:'ETUDE',          dateCotation:'2025-11-23', montant:100000,  dateValidation:'2025-11-23', statut:'Convertie en vente' },
  { id:3,  noCot:3,  prospId:3,  clientId:'CLI-0003', commercial:'NGUEGUIM',   risqueCote:'ETUDE',          dateCotation:'2025-12-12', montant:11000,   dateValidation:'2025-12-12', statut:'Convertie en vente' },
  { id:4,  noCot:4,  prospId:4,  clientId:'CLI-0004', commercial:'NGUEGUIM',   risqueCote:'AUTO',           dateCotation:'2025-12-15', montant:486467,  dateValidation:'2025-12-15', statut:'Convertie en vente' },
  { id:5,  noCot:5,  prospId:5,  clientId:'CLI-0007', commercial:'NGUEGUIM',   risqueCote:'AUTO',           dateCotation:'2025-12-20', montant:160669,  dateValidation:'2025-12-20', statut:'Convertie en vente' },
  { id:6,  noCot:6,  prospId:6,  clientId:'CLI-0011', commercial:'NGUEGUIM',   risqueCote:'SANTE',          dateCotation:'2026-01-15', montant:1433981, dateValidation:'2026-01-15', statut:'Convertie en vente' },
  { id:7,  noCot:7,  prospId:7,  clientId:'CLI-0012', commercial:'NGUEGUIM',   risqueCote:'ETUDE',          dateCotation:'2026-01-15', montant:52000,   dateValidation:'2026-01-15', statut:'Convertie en vente' },
  { id:8,  noCot:8,  prospId:8,  clientId:'CLI-0013', commercial:'NGUEGUIM',   risqueCote:'RETRAITE',       dateCotation:'2026-02-15', montant:11000,   dateValidation:'2026-02-15', statut:'Convertie en vente' },
  { id:9,  noCot:9,  prospId:10, clientId:'CLI-0018', commercial:'AMENA',      risqueCote:'SANTE',          dateCotation:'2026-03-10', montant:250000,  dateValidation:'',           statut:'En attente' },
  { id:10, noCot:10, prospId:11, clientId:'CLI-0016', commercial:'ONGOMALELA', risqueCote:'ETUDE',          dateCotation:'2025-11-28', montant:25000,   dateValidation:'',           statut:'Convertie en vente' },
  { id:11, noCot:11, prospId:12, clientId:'CLI-0017', commercial:'ONGOMALELA', risqueCote:'ETUDE',          dateCotation:'2025-12-01', montant:450000,  dateValidation:'',           statut:'Convertie en vente' },
  { id:12, noCot:12, prospId:13, clientId:'CLI-0015', commercial:'MBA MAMBA',  risqueCote:'RETRAITE',       dateCotation:'2026-02-10', montant:15000,   dateValidation:'',           statut:'Convertie en vente' },
  { id:13, noCot:13, prospId:14, clientId:'CLI-0009', commercial:'MAHOT',      risqueCote:'AUTO',           dateCotation:'2025-12-30', montant:335000,  dateValidation:'2025-12-30', statut:'Convertie en vente' },
  { id:14, noCot:14, prospId:15, clientId:'CLI-0001', commercial:'NGUEGUIM',   risqueCote:'LIBRE RETRAITE', dateCotation:'2026-03-15', montant:150000,  dateValidation:'2026-03-20', statut:'Validée' },
];

// ─── VENTES ───────────────────────────────────────────────────────────────────
export let ventes: Vente[] = [
  { id:1,  prospId:1,  clientId:'CLI-0001', commercial:'NGUEGUIM',   produit:'Afrilife retraite plus',        dateVente:'2025-11-20', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:100000,  accessoires:5000,  dateEffet:'2026-12-01', dateEcheance:'2031-11-17' },
  { id:2,  prospId:2,  clientId:'CLI-0002', commercial:'NGUEGUIM',   produit:'Afrilife étude',                 dateVente:'2025-11-23', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:99000,   accessoires:1000,  dateEffet:'', dateEcheance:'' },
  { id:3,  prospId:3,  clientId:'CLI-0003', commercial:'NGUEGUIM',   produit:'Afrilife étude',                 dateVente:'2025-12-12', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:10000,   accessoires:1000,  dateEffet:'', dateEcheance:'' },
  { id:4,  prospId:4,  clientId:'CLI-0004', commercial:'NGUEGUIM',   produit:'Flotte Automobile',              dateVente:'2025-12-15', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:486467,  accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:5,  prospId:5,  clientId:'CLI-0007', commercial:'NGUEGUIM',   produit:'Flotte Automobile',              dateVente:'2025-12-20', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:160669,  accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:6,  prospId:6,  clientId:'CLI-0011', commercial:'NGUEGUIM',   produit:'Assurance Santé Groupe',         dateVente:'2026-01-15', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:1433981, accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:7,  prospId:7,  clientId:'CLI-0012', commercial:'NGUEGUIM',   produit:'Afrilife étude',                 dateVente:'2026-01-15', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:52000,   accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:8,  prospId:8,  clientId:'CLI-0013', commercial:'NGUEGUIM',   produit:'Afrilife retraite individuelle', dateVente:'2026-02-15', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:11000,   accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:9,  prospId:11, clientId:'CLI-0016', commercial:'ONGOMALELA', produit:'Afrilife étude',                 dateVente:'2025-11-28', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:25000,   accessoires:1000,  dateEffet:'', dateEcheance:'' },
  { id:10, prospId:12, clientId:'CLI-0017', commercial:'ONGOMALELA', produit:'Afrilife étude',                 dateVente:'2025-12-01', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:450000,  accessoires:1000,  dateEffet:'', dateEcheance:'' },
  { id:11, prospId:13, clientId:'CLI-0015', commercial:'MBA MAMBA',  produit:'Afrilife retraite individuelle', dateVente:'2026-02-10', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:15000,   accessoires:0,     dateEffet:'', dateEcheance:'' },
  { id:12, prospId:14, clientId:'CLI-0009', commercial:'MAHOT',      produit:'Flotte Automobile',              dateVente:'2025-12-30', typeVente:'NouVe', noPolice:'', noAttestation:'', noCarteRose:'', primeNette:335000,  accessoires:0,     dateEffet:'', dateEcheance:'' },
];

// ─── OBJECTIFS ────────────────────────────────────────────────────────────────
export let objectifs: Record<string, Objectif> = {
  NGUEGUIM:    { mensuel: 500000, reporte: 0 },
  ONGOMALELA:  { mensuel: 400000, reporte: 0 },
  'MBA MAMBA': { mensuel: 400000, reporte: 50000 },
  MAHOT:       { mensuel: 450000, reporte: 0 },
  AMENA:       { mensuel: 350000, reporte: 100000 },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
export const PRODUITS = [
  'Afrilife étude','Afrilife retraite individuelle','Afrilife retraite plus',
  'Afrilife libre retraite','Afrilife Pension','Afrilife prévoyance individuelle',
  'Afrilife Prévoyance groupe','Afrilife retraite complémentaire',
  'Afrilife Indemnité de fin de carrière','Assurance Santé Groupe',
  'Assurance Maritime','Automobile','Flotte Automobile','Assurance Voyage',
  'Caution de soumission','Individuelle Accident','Individuelle Accident Groupe',
  'Multirisque Habitation','Responsabilité Civile Chef Entreprise',
  'Transport Marchandise','Tous Risques Chantiers','Vol','Bris de Machine',
  'Tous Risques Informatiques','Global Dommages',
];

export const RISQUES_COTES = [
  'ETUDE','RETRAITE','LIBRE RETRAITE','PENSION','PREVOYANCE',
  'AUTO','SANTE','MARITIME','VOYAGE','ACCIDENT','MULTIRISQUE',
  'CAUTION','TRANSPORT','TRC','VOL','BDM','TRI',
];

export const STATUTS_PROSP = [
  'Premier contact','Relance 1','Relance 2',
  'Cotation envoyée','En attente signature','Contrat conclu','Perdu',
];

export const STATUTS_COT = ['En attente','Validée','Refusée','Convertie en vente'];

export const ACTIVITES = [
  "Chef d'entreprise","Enseignant","Employé","Médecin",
  "Commissaire","Commerçant","Homme d'affaire","Retraité","Autre",
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
export const getClient = (id: string): Client | undefined =>
  clients.find(c => c.id === id);

export const genClientId = (): string => {
  const max = clients.reduce((m, c) => Math.max(m, parseInt(c.id.split('-')[1] || '0')), 0);
  return 'CLI-' + String(max + 1).padStart(4, '0');
};

export const fmt = (n: number): string =>
  n ? new Intl.NumberFormat('fr-FR').format(Math.round(n)) : '0';

export const fmtDate = (d: string): string =>
  d ? new Date(d).toLocaleDateString('fr-FR') : '—';

export const isOverdue = (d: string): boolean =>
  Boolean(d && new Date(d) < new Date());

export const caThisMois = (commercial: string): number => {
  const now = new Date();
  return ventes
    .filter(v => v.commercial === commercial)
    .filter(v => {
      if (!v.dateVente) return false;
      const d = new Date(v.dateVente);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, v) => s + (v.primeNette || 0) + (v.accessoires || 0), 0);
};

export const getProspectionsForUser = (userName: string, role: string): Prospection[] => {
  if (role === 'commercial') return prospections.filter(p => p.commercial === userName);
  return prospections;
};

export const getCotationsForUser = (userName: string, role: string): Cotation[] => {
  if (role === 'commercial') return cotations.filter(c => c.commercial === userName);
  return cotations;
};

export const getVentesForUser = (userName: string, role: string): Vente[] => {
  if (role === 'commercial') return ventes.filter(v => v.commercial === userName);
  return ventes;
};
