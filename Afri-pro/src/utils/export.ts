import * as XLSX from 'xlsx';

/**
 * Export utilities for exporting full dataset to Excel.
 */
export const exportAllDataToExcel = (prospections: any[], cotations: any[], ventes: any[], clients: any[]) => {
  const getClient = (clientId: string) => clients.find(c => c.id === clientId);
  const getClientName = (clientId: string) => getClient(clientId)?.nom || clientId;

  const prospectionsSheet = buildProspectionsSheet(prospections, getClient);
  const cotationsSheet = buildCotationsSheet(cotations, getClientName);
  const ventesSheet = buildVentesSheet(ventes, getClientName);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(prospectionsSheet), 'Prospections');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(cotationsSheet), 'Cotations');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(ventesSheet), 'Ventes');

  XLSX.writeFile(workbook, `Tableau_Bord_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportAllDataToCSV = (prospections: any[], cotations: any[], ventes: any[], clients: any[]) => {
  const getClient = (clientId: string) => clients.find(c => c.id === clientId) || {};

  const escapeCell = (value: any) => {
    if (value === null || value === undefined) return '';
    const text = String(value).replace(/"/g, '""');
    return text.includes(',') || text.includes('"') || text.includes('\n')
      ? `"${text}"`
      : text;
  };

  const formatRow = (row: any[]) => row.map(escapeCell).join(',');
  const buildSection = (title: string, header: string[], rows: any[][]) => {
    return [title, header.join(','), ...rows.map(formatRow)].join('\r\n');
  };

  const prospectionsHeader = [
    'Noms du Prospect',
    'Types de client',
    'Activites',
    'Tel_clients',
    'Risques de Prospection',
    'Chance de realisation %',
    'Anciens assureur',
    'Observations',
  ];

  const prospectionsRows = prospections.map(p => {
    const client = getClient(p.clientId);
    return [
      client.nom || '',
      client.type_client || p.typeClient || '',
      client.activite || p.activity || '',
      client.telephone || p.telephone || '',
      p.produit || p.risque || '',
      p.chance || 0,
      p.ancienAssureur || '',
      p.observations || '',
    ];
  });

  const cotationsHeader = [
    'Date de Cotation',
    'Risques coté',
    'Montant de la cotation',
    'Date de Validation de Cotation',
    'N° Cotation',
    'Client',
  ];

  const cotationsRows = cotations.map(c => [
    c.dateCotation || '',
    c.risqueCote || '',
    c.montant || 0,
    c.dateValidation || '',
    `COT-${String(c.noCot).padStart(3, '0')}`,
    getClient(c.clientId).nom || c.clientId || '',
  ]);

  const ventesHeader = [
    'Dates de Ventes',
    'Types de Ventes',
    'N° Police',
    'Primes Nette',
    'Accessoires',
    'Dates d\'effets',
    'Dates D\'échéance',
    'Client',
  ];

  const ventesRows = ventes.map(v => [
    v.dateVente || '',
    v.typeVente || '',
    v.noPolice || '',
    v.primeNette || 0,
    v.accessoires || 0,
    v.dateEffet || '',
    v.dateEcheance || '',
    getClient(v.clientId).nom || v.clientId || '',
  ]);

  const csvContent = [
    buildSection('PROSPECTIONS', prospectionsHeader, prospectionsRows),
    '',
    buildSection('COTATIONS', cotationsHeader, cotationsRows),
    '',
    buildSection('VENTES', ventesHeader, ventesRows),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Tableau_Bord_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const buildProspectionsSheet = (data: any[], getClient: (id: string) => any) => {
  const header = [
    'Noms du Prospect',
    'Types de client',
    'Activites',
    'Tel_clients',
    'Risques de Prospection',
    'Chance de realisation %',
    'Anciens assureur',
    'Date d\'Effet ancien',
    'Date d\'Échéance ancien',
    'Observations',
  ];

  const rows = data.map(p => {
    const client = getClient(p.clientId) || {};

    return [
      client.nom || p.clientId || '',
      client.type_client || p.typeClient || '',
      client.activite || p.activity || '',
      client.telephone || p.telephone || '',
      p.produit || p.risque || '',
      p.chance || 0,
      p.ancienAssureur || '',
      p.dateAncienEffet || '',
      p.dateAncienEch || '',
      p.observations || '',
    ];
  });

  return [header, ...rows];
};

const buildCotationsSheet = (data: any[], getClientName: (id: string) => string) => {
  const header = [
    'Date de Cotation',
    'Risques coté',
    'Montant de la cotation',
    'Date de Validation de Cotation',
    'N° Cotation',
    'Client',
  ];

  const rows = data.map(c => [
    c.dateCotation || '',
    c.risqueCote || '',
    c.montant || 0,
    c.dateValidation || '',
    `COT-${String(c.noCot).padStart(3, '0')}`,
    getClientName(c.clientId),
  ]);

  return [header, ...rows];
};

const buildVentesSheet = (data: any[], getClientName: (id: string) => string) => {
  const header = [
    'Dates de Ventes',
    'Types de Ventes',
    'N° Police',
    'Primes Nette',
    'Accessoires',
    'Numero Attestation',
    'Numero Carte Rose',
    'Dates d\'effets',
    'Dates D\'échéance',
    'Client',
  ];

  const rows = data.map(v => [
    v.dateVente || '',
    v.typeVente || '',
    v.noPolice || '',
    v.primeNette || 0,
    v.accessoires || 0,
    v.noAttestation || '',
    v.noCarteRose || '',
    v.dateEffet || '',
    v.dateEcheance || '',
    getClientName(v.clientId),
  ]);

  return [header, ...rows];
};

export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    alert('Aucune donnée à exporter');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportVentesToCSV = (ventes: any[], clients: any[]) => {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.nom || clientId;
  };

  const formattedData = ventes.map(vente => ({
    'N° Police': vente.noPolice || '',
    'Client': getClientName(vente.clientId),
    'Commercial': vente.commercial || '',
    'Produit': vente.produit || '',
    'Type Vente': vente.typeVente || '',
    'Date Vente': vente.dateVente || '',
    'Prime Nette': vente.primeNette || 0,
    'Accessoires': vente.accessoires || 0,
    'CA Total': (vente.primeNette || 0) + (vente.accessoires || 0),
'Date Effet': vente.dateEffet || '',
    'Date Échéance': vente.dateEcheance || '',
  }));

  exportToCSV(formattedData, `Ventes_${new Date().toISOString().split('T')[0]}`);
};

export const exportProspectionsToCSV = (prospections: any[], clients: any[]) => {
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.nom || clientId;
  };

  const formattedData = prospections.map(prosp => ({
    'Client': getClientName(prosp.clientId),
    'Commercial': prosp.commercial || '',
    'Produit': prosp.produit || '',
    'Statut': prosp.statut || '',
    'Chance %': prosp.chance || 0,
    'Date Contact': prosp.dateContact || '',
    'Date Relance': prosp.dateRelance || '',
    'Observations': prosp.observations || '',
    'Ancien Assureur': prosp.ancienAssureur || '',
    'Ancien Échéance': prosp.dateAncienEch || '',
  }));

  exportToCSV(formattedData, `Prospections_${new Date().toISOString().split('T')[0]}`);
};
