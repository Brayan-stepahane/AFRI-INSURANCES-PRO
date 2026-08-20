import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Pressable,
} from 'react-native';
import { AxiosResponse } from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import { colors, spacing, radius } from '../../config/theme';
import type { Client } from '../../types';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

interface ProspectionFormData {
  clientId: string;
  clientName: string;
  phone: string;
  clientType: string;
  activity: string;
  email: string;
  ville: string;
  prospectionDate: string;
  product: string;
  productCategory: string;
  status: string;
  probability: number;
  visitDate1: string;
  nextFollowUp: string;
  visitDate2: string;
  visitDate3: string;
  previousInsurer: string;
  previousContract: string;
  observations: string;
  ratedRisk: string;
  quotationDate: string;
  quotationAmount: string;
  validationDate: string;
  saleDate: string;
  saleType: string;
  policyNumber: string;
  
  netPremiums: string;
  accessories: string;
  effectDate: string;
  expiryDate: string;
 
}

interface NewProspectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: ProspectionFormData, isEdit?: boolean, prospectionId?: number, options?: { refreshOnly?: boolean }) => void;
  editProspection?: any;
}

const STEP_LABELS = ['Client', 'Prospection', 'Cotation', 'Vente'];
const CLIENT_TYPES = ['Particulier','PME','Entreprise','Autre'];
const ACTIVITIES = ['chef_agence d\'entreprise', 'Salarié', 'Indépendant', 'Autre'];

const normalizeDate = (value: string) => {
  if (!value) return '';
  if (value.includes('T')) return value.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = value.split(/[\/\.-]/);
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return value;
};

const normalizeProbability = (value: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.min(Math.max(value / 100, 0.1), 1);
};

const PRODUCT_CATEGORIES = ['Vie', 'Non-vie'];
const VIE_PRODUCTS = [
  'Afrilife étude', 'Afrilife retraite individuelle', 'Afrilife retraite plus',
  'Afrilife libre retraite', 'Afrilife Pension', 'Afrilife prévoyance individuelle',
  'Afrilife Prévoyance groupe', 'Afrilife retraite complémentaire',
  'Afrilife Indemnité de fin de carrière',
];
const NON_VIE_PRODUCTS = [
  'Assurance Santé Groupe', 'Assurance Maritime', 'Automobile', 'Flotte Automobile',
  'Assurance Voyage', 'Caution de soumission', 'Individuelle Accident',
  'Individuelle Accident Groupe', 'Multirisque Habitation',
  'Responsabilité Civile chef_agence Entreprise', 'Transport Marchandise', 'Autre',
];
const PRODUCTS_BY_CATEGORY: Record<string, string[]> = {
  Vie: VIE_PRODUCTS,
  'Non-vie': NON_VIE_PRODUCTS,
};
const getCategoryFromProduct = (product: string) =>
  VIE_PRODUCTS.includes(product) ? 'Vie' : 'Non-vie';

const STATUSES = ['Premier contact', 'En discussion', 'Proposition envoyée', 'Négociation', 'Autre'];
const SALE_TYPES = ['Nouvelle vente (NouVe)', 'Renouvellement'];
const RISKS = ['— Non coté —', 'Standard', 'Surcoté', 'Refusé'];

// ==================== SELECT FIELD ====================
function SelectField({
  value, options, isOpen, onToggle, onSelect,
}: {
  value: string; options: string[]; isOpen: boolean;
  onToggle: () => void; onSelect: (v: string) => void;
}) {
  const triggerRef = useRef<View>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const measureAndOpen = () => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.measureInWindow((x, y, width, height) => {
        setDropdownPos({ top: y + height, left: x, width });
      });
    }
    onToggle();
  };

  return (
    <View style={sf.wrapper}>
      <TouchableOpacity
        ref={triggerRef}
        style={[sf.trigger, isOpen && sf.triggerOpen]}
        onPress={measureAndOpen}
        activeOpacity={0.8}
      >
        <Text style={sf.triggerText} numberOfLines={1}>{value}</Text>
        <Text style={sf.caret}>{isOpen ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {isOpen && (
        <Modal transparent visible={isOpen} animationType="none" onRequestClose={onToggle}>
          <TouchableOpacity style={sf.modalBackdrop} onPress={onToggle} activeOpacity={1}>
            <View style={[sf.list, { top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {options.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[sf.item, item === value && sf.itemActive]}
                    onPress={() => { onSelect(item); onToggle(); }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[sf.itemText, item === value && sf.itemTextActive]}>{item}</Text>
                      {item === value && <Text style={sf.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

const sf = StyleSheet.create({
  wrapper: { position: 'relative' },
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    backgroundColor: colors.white, minHeight: 40,
  },
  triggerOpen: { borderColor: colors.violet },
  triggerText: { flex: 1, fontSize: 14, color: colors.gray800 },
  caret: { fontSize: 9, color: colors.gray400, marginLeft: 6 },
  modalBackdrop: { flex: 1, backgroundColor: 'transparent' },
  list: {
    position: 'absolute', maxHeight: 200, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.violet, borderRadius: radius.sm,
    elevation: 20, overflow: 'hidden',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  itemActive: { backgroundColor: colors.violetPale },
  itemText: { flex: 1, fontSize: 13, color: colors.gray800 },
  itemTextActive: { fontWeight: '600', color: colors.violet },
  checkmark: { fontSize: 12, color: colors.violet, fontWeight: '700' },
});

// ====================== MAIN COMPONENT ======================
export function NewProspectionModal({ visible, onClose, onSubmit, editProspection }: NewProspectionModalProps) {
  const { user } = useAuth();
  const { clients } = useClients();

  const [step, setStep] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const [form, setForm] = useState<ProspectionFormData>({
    clientId: '', clientName: '', phone: '', clientType: 'Particulier',
    activity: 'chef_agence d\'entreprise',
    email: '',
    ville: '',
    prospectionDate: new Date().toISOString().split('T')[0],
    productCategory: 'Vie', product: 'Afrilife étude', status: 'Premier contact',
    probability: 50, visitDate1: '', nextFollowUp: '', visitDate2: '',
    visitDate3: '', previousInsurer: '', previousContract: '', observations: '',
    ratedRisk: '— Non coté —', quotationDate: '', quotationAmount: '',
    validationDate: '', saleDate: '', saleType: 'Nouvelle vente (NouVe)',
    policyNumber: '', netPremiums: '', accessories: '1000',
    effectDate: '', expiryDate: '', 
  });

  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [clientSearchMessage, setClientSearchMessage] = useState<string>('');
  const [prospectionId, setProspectionId] = useState<number | null>(editProspection?.id ?? null);
  const [cotationId, setCotationId] = useState<number | null>(null);
  const [venteId, setVenteId] = useState<number | null>(null);
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [editError, setEditError] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [savedSteps, setSavedSteps] = useState<{ client?: boolean; prospection?: boolean; cotation?: boolean; vente?: boolean }>({});
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (form.product && (form.ratedRisk === '— Non coté —' || form.ratedRisk === '')) {
      setForm(prev => ({ ...prev, ratedRisk: prev.product }));
    }
  }, [form.product]);

  // ==================== CLIENT LOGIC (ANTI-DUPLICATE) ====================
  const getOrCreateClientId = async (): Promise<string> => {
    const trimmedName = form.clientName.trim();
    if (!trimmedName) {
      setSaveError('Le nom du client est requis.');
      throw new Error('Client name is required');
    }

    let existing = clients.find(c => c.nom.trim().toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      setForm(prev => ({ ...prev, clientId: existing.id }));
      return existing.id;
    }

    try {
      const response = await apiClient.get(API_ENDPOINTS.CLIENTS.LIST, {
        params: { search: trimmedName, limit: 10 }
      });
      const serverExisting = (response.data || []).find((c: any) =>
        c.nom?.trim().toLowerCase() === trimmedName.toLowerCase()
      );
      if (serverExisting) {
        setForm(prev => ({ ...prev, clientId: serverExisting.id }));
        return serverExisting.id;
      }
    } catch (err) {
      console.warn('Server client search failed', err);
    }

    const newClientId = `CLI${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setForm(prev => ({ ...prev, clientId: newClientId }));
    return newClientId;
  };

  const saveClientToDatabase = async (clientId: string): Promise<boolean> => {
    if (!form.clientName?.trim()) {
      setSaveError('Le nom du client est requis.');
      return false;
    }

    const validClientTypes = ['Particulier', 'PME', 'Entreprise', 'Autre'];
    const clientType = validClientTypes.includes(form.clientType?.trim() || '')
      ? form.clientType.trim()
      : 'Particulier';

    const payload = {
      nom: form.clientName.trim(),
      telephone: form.phone?.trim() || '',
      activite: form.activity?.trim() || '',
      type_client: clientType,
      email: form.email?.trim() || '',
      ville: form.ville?.trim() || '',
    };

    try {
      if (clientId.startsWith('CLI')) {
        try {
          const checkRes = await apiClient.get(API_ENDPOINTS.CLIENTS.LIST, {
            params: { search: payload.nom, limit: 5 }
          });
          const duplicate = (checkRes.data || []).find((c: any) =>
            c.nom?.trim().toLowerCase() === payload.nom.toLowerCase()
          );
          if (duplicate) {
            setForm(prev => ({ ...prev, clientId: duplicate.id }));
            await apiClient.put(`${API_ENDPOINTS.CLIENTS.UPDATE}/${duplicate.id}`, payload);
            return true;
          }
        } catch (e) { /* ignore */ }

        const response = await apiClient.post(API_ENDPOINTS.CLIENTS.CREATE, payload);
        if (response?.data?.id) {
          setForm(prev => ({ ...prev, clientId: response.data.id }));
          return true;
        }
      } else {
        await apiClient.put(`${API_ENDPOINTS.CLIENTS.UPDATE}/${clientId}`, payload);
        return true;
      }
    } catch (error: any) {
      console.error('Client save error:', error?.response?.data);
      const errorMsg = error?.response?.data?.error || 'Erreur lors de l\'enregistrement du client.';
      setSaveError(errorMsg.toLowerCase().includes('duplicate') ? 'Un client avec ce nom existe déjà.' : errorMsg);
      return false;
    }
    return false;
  };

  const selectClient = (client: Client) => {
    const validClientTypes = ['Particulier', 'PME', 'Entreprise', 'Autre'];
    const clientType = validClientTypes.includes(client.type_client?.trim() || '')
      ? client.type_client?.trim() ?? 'Particulier'
      : 'Particulier';

    setForm(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.nom,
      phone: client.telephone || prev.phone,
      clientType,
      activity: client.activite || prev.activity,
      email: client.email || prev.email,
      ville: client.ville || prev.ville,
    }));

    setClientSearchResults([]);
    setClientSearchMessage(`Client sélectionné : ${client.nom}`);
  };

  const dateOrNull = (value: string) => (!value || !value.trim() ? null : normalizeDate(value) || null);
  const numOrNull = (value: string | number) => {
    const num = Number(value);
    return isNaN(num) || num === 0 ? null : num;
  };

  // ==================== SAVE FUNCTIONS ====================
  const saveProspectionToDatabase = async (): Promise<number | null> => {
    try {
      let clientId = form.clientId;
      if (!clientId) clientId = await getOrCreateClientId();
      if (!clientId) return null;

      const validClientTypes = ['Particulier', 'PME', 'Entreprise', 'Autre'];
      const clientType = validClientTypes.includes(form.clientType?.trim() || '') ? form.clientType.trim() : 'Particulier';

      const payload: any = {
        clientId, clientName: form.clientName.trim(), phone: form.phone?.trim() || '',
        clientType, activity: form.activity?.trim() || '',
        prospectionDate: dateOrNull(form.prospectionDate),
        product: form.product,
        status: form.status, probability: form.probability,
        visitDate1: dateOrNull(form.visitDate1), nextFollowUp: dateOrNull(form.nextFollowUp),
        visitDate2: dateOrNull(form.visitDate2), visitDate3: dateOrNull(form.visitDate3),
        previousInsurer: form.previousInsurer || '', previousContract: dateOrNull(form.previousContract),
        observations: form.observations || '', ratedRisk: form.ratedRisk,
        quotationDate: dateOrNull(form.quotationDate), quotationAmount: numOrNull(form.quotationAmount),
        validationDate: dateOrNull(form.validationDate), saleDate: dateOrNull(form.saleDate),
        saleType: form.saleType, policyNumber: form.policyNumber || '',
        netPremiums: numOrNull(form.netPremiums),
        accessories: numOrNull(form.accessories), effectDate: dateOrNull(form.effectDate),
        expiryDate: dateOrNull(form.expiryDate),
      };

      let response: AxiosResponse<any>;
      if (prospectionId) {
        const updatePayload = {
          clientId, product: form.product, prospectionDate: dateOrNull(form.prospectionDate),
          probability: normalizeProbability(form.probability),
          status: form.status, visitDate1: dateOrNull(form.visitDate1),
          visitDate2: dateOrNull(form.visitDate2), visitDate3: dateOrNull(form.visitDate3),
          nextFollowUp: dateOrNull(form.nextFollowUp), observations: form.observations || '',
          previousInsurer: form.previousInsurer || '', previousContract: dateOrNull(form.previousContract),
        };
        response = await apiClient.put(`${API_ENDPOINTS.PROSPECTIONS.LIST}/${prospectionId}`, updatePayload);
      } else {
        response = await apiClient.post(API_ENDPOINTS.PROSPECTIONS.CREATE, payload);
      }

      if (response?.data?.id) {
        setProspectionId(response.data.id);
        return response.data.id;
      }
      setSaveError('Erreur lors de l\'enregistrement de la prospection.');
      return null;
    } catch (error: any) {
      console.error('Prospection save error:', error);
      setSaveError('Erreur lors de l\'enregistrement de la prospection.');
      return null;
    }
  };

  const saveCotationToDatabase = async (prospectionIdParam: number): Promise<number | null> => {
    try {
      let clientId = form.clientId;
      if (!clientId) clientId = await getOrCreateClientId();
      if (!clientId) {
        setSaveError('Client requis pour enregistrer la cotation.');
        return null;
      }

      const payload = {
        prospection_id: prospectionIdParam,
        client_id: clientId,
        risque_cote: form.ratedRisk,
        date_cotation: dateOrNull(form.quotationDate),
        montant: numOrNull(form.quotationAmount),
        date_validation: dateOrNull(form.validationDate),
      };

      let response: AxiosResponse<any>;
      if (cotationId) {
        response = await apiClient.put(`${API_ENDPOINTS.COTATIONS.UPDATE}/${cotationId}`, payload);
      } else {
        response = await apiClient.post(API_ENDPOINTS.COTATIONS.LIST, payload);
      }

      if (response?.data?.id) {
        setCotationId(response.data.id);
        return response.data.id;
      }
      return null;
    } catch (error: any) {
      console.error('Cotation save error:', error);
      setSaveError('Erreur lors de l\'enregistrement de la cotation.');
      return null;
    }
  };

  const saveVenteToDatabase = async (prospectionIdParam: number, cotationIdParam?: number): Promise<number | null> => {
    try {
      if (!form.saleDate) {
        setSaveError('La date de vente est requise.');
        return null;
      }

      let clientId = form.clientId;
      if (!clientId) clientId = await getOrCreateClientId();
      if (!clientId) {
        setSaveError('Client requis pour enregistrer la vente.');
        return null;
      }

      const clientSaved = await saveClientToDatabase(clientId);
      if (!clientSaved) return null;

      const mapSaleType = (type: string): string => type.includes('Nouvelle') ? 'NouVe' : 'VenRec';

      const payload = {
        prospection_id: prospectionIdParam,
        cotation_id: cotationIdParam || cotationId || null,
        client_id: clientId,
        commercial_id: user?.id,
        date_vente: dateOrNull(form.saleDate),
        type_vente: mapSaleType(form.saleType),
        produit: form.product,
        numero_police: form.policyNumber || null,
        prime_nette: numOrNull(form.netPremiums),
        accessoires: numOrNull(form.accessories),
        date_effet: dateOrNull(form.effectDate),
        date_echeance: dateOrNull(form.expiryDate),
      };

      let response: AxiosResponse<any>;
      if (venteId) {
        response = await apiClient.put(`${API_ENDPOINTS.VENTES.UPDATE}/${venteId}`, payload);
      } else {
        response = await apiClient.post(API_ENDPOINTS.VENTES.LIST, payload);
      }

      if (response?.data?.id) {
        setVenteId(response.data.id);
        return response.data.id;
      }
      return null;
    } catch (error: any) {
      console.error('Vente save error:', error);
      setSaveError('Erreur lors de l\'enregistrement de la vente.');
      return null;
    }
  };

  // ==================== MAIN SAVE HANDLER ====================
  const handleSaveCurrentStep = async () => {
    if (isSaving) return false;

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      if (step === 1) {
        const clientId = await getOrCreateClientId();
        const success = await saveClientToDatabase(clientId);
        if (!success) return false;

        setSavedSteps(prev => ({ ...prev, client: true }));
        setSaveMessage('Client enregistré avec succès.');
        return true;
      }

      if (step === 2) {
        if (!savedSteps.client) {
          const clientId = await getOrCreateClientId();
          const clientSaved = await saveClientToDatabase(clientId);
          if (!clientSaved) return false;
          setSavedSteps(prev => ({ ...prev, client: true }));
        }

        const savedId = await saveProspectionToDatabase();
        if (!savedId) return false;

        setSavedSteps(prev => ({ ...prev, prospection: true }));
        setSaveMessage('Prospection enregistrée avec succès.');
        if (onSubmit) onSubmit(form, !!editProspection, savedId, { refreshOnly: true });
        return true;
      }

      if (step === 3) {
        if (!savedSteps.prospection) {
          const savedId = await saveProspectionToDatabase();
          if (!savedId) {
            setSaveError('Veuillez d\'abord enregistrer la prospection (Étape 2).');
            return false;
          }
          setProspectionId(savedId);
          setSavedSteps(prev => ({ ...prev, prospection: true }));
        }
        if (form.quotationDate || form.quotationAmount) {
          if (!prospectionId) {
            setSaveError('ID de prospection manquant.');
            return false;
          }
          await saveCotationToDatabase(prospectionId);
        }
        setSavedSteps(prev => ({ ...prev, cotation: true }));
        setSaveMessage('Cotation traitée.');
        return true;
      }

      if (step === 4) {
        if (!savedSteps.prospection) {
          const savedId = await saveProspectionToDatabase();
          if (!savedId) {
            setSaveError('Veuillez d\'abord enregistrer la prospection (Étape 2).');
            return false;
          }
          setProspectionId(savedId);
          setSavedSteps(prev => ({ ...prev, prospection: true }));
        }
        if (form.saleDate || form.policyNumber) {
          if (!prospectionId) {
            setSaveError('ID de prospection manquant.');
            return false;
          }
          await saveVenteToDatabase(prospectionId, cotationId || undefined);
        }
        setSavedSteps(prev => ({ ...prev, vente: true }));
        setSaveMessage('Vente traitée.');
        if (onSubmit) onSubmit(form, !!editProspection, prospectionId || undefined, { refreshOnly: true });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Save step error:', error);
      setSaveError('Une erreur inattendue est survenue.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndClose = async () => {
    const saved = await handleSaveCurrentStep();
    if (saved) onClose();
  };

  const formatSaleTypeToLabel = (type: string) => {
    if (type === 'NouVe') return 'Nouvelle vente (NouVe)';
    if (type === 'VenRec') return 'transfert';
    return 'Autre';
  };

  const mapEditProspectionToForm = (data: any): ProspectionFormData => {
    const rawChance = Number((data.chance_realisation ?? data.chance) || 0);
    const probability = rawChance > 1 ? Math.min(Math.max(rawChance, 0), 100) : Math.min(Math.max(rawChance * 100, 0), 100);

    return {
      clientId: data.client_id || '',
      clientName: data.client_nom || '',
      phone: data.client_tel || '',
      clientType: data.type_client || 'Particulier',
      activity: data.activite || 'chef_agence d\'entreprise',
      email: data.email || '',
      ville: data.ville || '',
      prospectionDate: normalizeDate(data.date_prospection) || new Date().toISOString().split('T')[0],
      product: data.risque_prospecte || 'Afrilife étude',
      status: data.statut || 'Premier contact',
      productCategory: getCategoryFromProduct(data.risque_prospecte || 'Afrilife étude'),
      probability,
      visitDate1: normalizeDate(data.date_visite_1) || '',
      nextFollowUp: normalizeDate(data.date_relance) || '',
      visitDate2: normalizeDate(data.date_visite_2) || '',
      visitDate3: normalizeDate(data.date_visite_3) || '',
      previousInsurer: data.ancien_assureur || '',
      previousContract: normalizeDate(data.date_echeance_ancien) || '',
      observations: data.observations || '',
      ratedRisk: data.risque_cote || '— Non coté —',
      quotationDate: normalizeDate(data.date_cotation) || '',
      quotationAmount: data.montant != null ? String(data.montant) : '',
      validationDate: normalizeDate(data.date_validation) || '',
      saleDate: normalizeDate(data.date_vente) || '',
      saleType: formatSaleTypeToLabel(data.type_vente || ''),
      policyNumber: data.no_police || '',
      netPremiums: data.prime_nette != null ? String(data.prime_nette) : '',
      accessories: data.accessoires != null ? String(data.accessoires) : '',
      effectDate: normalizeDate(data.date_effet) || '',
      expiryDate: normalizeDate(data.date_echeance) || '',
    };
  };

  // ==================== EDIT MODE ====================
  React.useEffect(() => {
    const initNewForm = () => {
      setStep(1);
      setSavedSteps({});
      setForm({
        clientId: '', clientName: '', phone: '', clientType: 'Particulier',
        activity: 'chef_agence d\'entreprise',
        email: '',
        ville: '',
        prospectionDate: new Date().toISOString().split('T')[0],
        productCategory: 'Vie', product: 'Afrilife étude', status: 'Premier contact',
        probability: 50, visitDate1: '', nextFollowUp: '', visitDate2: '',
        visitDate3: '', previousInsurer: '', previousContract: '', observations: '',
        ratedRisk: '— Non coté —', quotationDate: '', quotationAmount: '',
        validationDate: '', saleDate: '', saleType: 'Nouvelle vente (NouVe)',
        policyNumber: '',netPremiums: '', accessories: '',
        effectDate: '', expiryDate: '',
      });
      setProspectionId(null);
      setCotationId(null);
      setVenteId(null);
      setIsLoadingEditData(false);
    };

    const loadEditProspection = async () => {
      if (!editProspection?.id) {
        initNewForm();
        return;
      }

      setIsLoadingEditData(true);
      setStep(1);
      setProspectionId(editProspection.id);

      try {
        const response = await apiClient.get(`${API_ENDPOINTS.PROSPECTIONS.LIST}/${editProspection.id}`);
        const data = response.data;
        setForm(mapEditProspectionToForm(data));
        setCotationId(data.cotation_id ?? null);
        setVenteId(data.vente_id ?? null);
        setSavedSteps({
          client: true,
          prospection: true,
          cotation: !!data.cotation_id,
          vente: !!data.vente_id,
        });
      } catch (error) {
        console.error('Failed to load prospection for edit:', error);
        setEditError('Impossible de charger les données complètes. Données partielles utilisées.');
        if (editProspection) setForm(mapEditProspectionToForm(editProspection));
      } finally {
        setIsLoadingEditData(false);
      }
    };

    if (visible) {
      if (editProspection) {
        loadEditProspection();
      } else {
        initNewForm();
      }
    }

    setSaveMessage('');
    setSaveError('');
  }, [editProspection, visible]);

  const upd = (field: keyof ProspectionFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerField, setDatePickerField] = useState<keyof ProspectionFormData | null>(null);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const parseDateValue = (value: string | undefined): Date | null => {
    if (!value) return null;
    const normalized = normalizeDate(value);
    const parts = normalized.split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDateDisplay = (date: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  };

  const getMonthCalendar = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const firstWeekDay = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weeks: Date[][] = [];
    let currentDay = 1 - firstWeekDay;

    for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
      const week: Date[] = [];
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        week.push(new Date(year, month, currentDay));
        currentDay += 1;
      }
      weeks.push(week);
    }
    return weeks;
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();

  const openDatePicker = (field: keyof ProspectionFormData, value: string) => {
    const parsed = parseDateValue(value) || new Date();
    setCalendarMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
    setSelectedDate(parsed);
    setDatePickerField(field);
    setDatePickerVisible(true);
  };

  const closeDatePicker = () => {
    setDatePickerVisible(false);
    setDatePickerField(null);
  };

  const confirmDatePicker = () => {
    if (datePickerField && selectedDate) {
      upd(datePickerField, formatDateDisplay(selectedDate));
    }
    closeDatePicker();
  };

  const DateInput = ({ label, value, placeholder, field }: { label: string; value: string; placeholder: string; field: keyof ProspectionFormData }) => (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={[styles.input, styles.dateInput]} onPress={() => openDatePicker(field, value)}>
        <Text style={[styles.dateInputText, !value && styles.placeholderText]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderDatePickerModal = () => {
    const monthTitle = calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    const weeks = getMonthCalendar(calendarMonth);
    const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    return (
      <Modal visible={datePickerVisible} transparent animationType="fade">
        <View style={styles.calendarBackdrop}>
          <TouchableOpacity style={styles.calendarBackdropTouch} onPress={closeDatePicker} />
          <View style={styles.calendarModal}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
                <Text style={styles.calendarNav}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthTitle}</Text>
              <TouchableOpacity onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
                <Text style={styles.calendarNav}>›</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.calendarWeekRow}>
              {weekDays.map(day => (
                <Text key={day} style={[styles.calendarWeekDay, styles.calendarWeekDayLabel]}>{day}</Text>
              ))}
            </View>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeekRow}>
                {week.map(day => {
                  const isCurrentMonth = day.getMonth() === calendarMonth.getMonth();
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                  return (
                    <TouchableOpacity
                      key={day.toISOString()}
                      style={[
                        styles.calendarDay,
                        !isCurrentMonth && styles.calendarDayInactive,
                        isSelected && styles.calendarDaySelected,
                      ]}
                      onPress={() => setSelectedDate(day)}
                      disabled={!isCurrentMonth}
                    >
                      <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected, !isCurrentMonth && styles.calendarDayTextInactive]}>
                        {day.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
            <View style={styles.calendarActions}>
              <TouchableOpacity onPress={closeDatePicker} style={styles.calendarActionButton}>
                <Text style={styles.calendarActionText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDatePicker} style={[styles.calendarActionButton, styles.calendarActionConfirm]} disabled={!selectedDate}>
                <Text style={[styles.calendarActionText, styles.calendarActionConfirmText]}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSearchClient = () => {
    const query = form.clientName.trim();
    if (!query) {
      setClientSearchResults([]);
      setClientSearchMessage('Entrez un nom pour rechercher.');
      return;
    }
    const results = clients.filter(c => c.nom.toLowerCase().includes(query.toLowerCase()));
    setClientSearchResults(results);
    setClientSearchMessage(results.length === 0 ? 'Aucun client trouvé.' : '');
  };

  // ==================== RENDER STEPS ====================
  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {STEP_LABELS.map((label, idx) => {
        const n = idx + 1;
        const isActive = step === n;
        const isCompleted = step > n;
        return (
          <TouchableOpacity
            key={n}
            style={[styles.stepBox, isActive && styles.stepBoxActive, isCompleted && styles.stepBoxCompleted]}
            onPress={() => setStep(n)}
          >
            <Text style={[styles.stepNumber, (isActive || isCompleted) && styles.stepNumberActive]}>
              {isCompleted ? '✓' : n}
            </Text>
            <Text style={[styles.stepLabel, (isActive || isCompleted) && styles.stepLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Identification du client</Text>
      <Text style={styles.hint}>Tapez le nom pour rechercher un client existant</Text>

      <Text style={styles.label}>Nom du client *</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Tapez pour rechercher ou créer..."
          value={form.clientName}
          onChangeText={v => { upd('clientName', v); setClientSearchResults([]); setClientSearchMessage(''); }}
          placeholderTextColor={colors.gray400}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchClient}>
          <Text style={styles.searchButtonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>

      {clientSearchMessage ? <Text style={styles.searchMessage}>{clientSearchMessage}</Text> : null}

      {clientSearchResults.length > 0 && (
        <View style={styles.searchResults}>
          {clientSearchResults.map(client => (
            <TouchableOpacity key={client.id} style={styles.resultItem} onPress={() => selectClient(client)}>
              <Text style={styles.resultName}>{client.nom}</Text>
              <Text style={styles.resultMeta}>{client.id}{client.activite ? ` · ${client.activite}` : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput style={styles.input} placeholder="6XX XXX XXX" value={form.phone} onChangeText={v => upd('phone', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Type de client</Text>
          <SelectField
            value={form.clientType}
            options={CLIENT_TYPES}
            isOpen={openDropdown === 'clientType'}
            onToggle={() => toggle('clientType')}
            onSelect={v => upd('clientType', v)}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Activité</Text>
        <SelectField
          value={form.activity}
          options={ACTIVITIES}
          isOpen={openDropdown === 'activity'}
          onToggle={() => toggle('activity')}
          onSelect={v => upd('activity', v)}
        />
      </View>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.gray400}
        value={form.email}
        onChangeText={v => upd('email', v)}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Ville</Text>
      <TextInput
        style={styles.input}
        placeholder="Ville"
        placeholderTextColor={colors.gray400}
        value={form.ville}
        onChangeText={v => upd('ville', v)}
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Détails de la prospection</Text>

      {(() => {
        const productOptions = PRODUCTS_BY_CATEGORY[form.productCategory] || VIE_PRODUCTS;
        return (
          <>
            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Catégorie produit *</Text>
                <SelectField
                  value={form.productCategory}
                  options={PRODUCT_CATEGORIES}
                  isOpen={openDropdown === 'productCategory'}
                  onToggle={() => toggle('productCategory')}
                  onSelect={(v) => {
                    const selectedCategory = v;
                    const options = PRODUCTS_BY_CATEGORY[selectedCategory] || VIE_PRODUCTS;
                    const selectedProduct = options.includes(form.product) ? form.product : options[0];
                    upd('productCategory', selectedCategory);
                    upd('product', selectedProduct);
                    upd('ratedRisk', selectedProduct);
                  }}
                />
              </View>
              <View style={styles.half}>
                <Text style={styles.label}>Statut *</Text>
                <SelectField
                  value={form.status}
                  options={STATUSES}
                  isOpen={openDropdown === 'status'}
                  onToggle={() => toggle('status')}
                  onSelect={v => upd('status', v)}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.half}>
                <Text style={styles.label}>Produit / Risque visé *</Text>
                <SelectField
                  value={form.product}
                  options={productOptions}
                  isOpen={openDropdown === 'product'}
                  onToggle={() => toggle('product')}
                  onSelect={v => {
                    upd('product', v);
                    upd('ratedRisk', v);
                  }}
                />
              </View>
            </View>
          </>
        );
      })()}

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Chance de réalisation (%)</Text>
          <View style={styles.probabilityContainer}>
            <TextInput
              style={styles.probabilityInput}
              placeholder="0"
              value={String(form.probability)}
              onChangeText={(v) => {
                const num = parseInt(v) || 0;
                upd('probability', Math.min(Math.max(num, 0), 100));
              }}
              keyboardType="numeric"
              maxLength={3}
              placeholderTextColor={colors.gray400}
            />
            <View style={styles.probabilityBadge}>
              <Text style={styles.probabilityText}>{form.probability}%</Text>
            </View>
          </View>
        </View>
      </View>

      <DateInput label="Date visite 1" value={form.visitDate1} placeholder="jj/mm/aaaa" field="visitDate1" />

      <View style={styles.row}>
        <View style={styles.half}>
          <DateInput label="Prochaine relance" value={form.nextFollowUp} placeholder="jj/mm/aaaa" field="nextFollowUp" />
          <Text style={styles.helperText}>Alerte automatique à cette date</Text>
        </View>
        <View style={styles.half}>
          <DateInput label="Date visite 2" value={form.visitDate2} placeholder="jj/mm/aaaa" field="visitDate2" />
        </View>
      </View>

      <DateInput label="Date visite 3" value={form.visitDate3} placeholder="jj/mm/aaaa" field="visitDate3" />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Ancien assureur</Text>
          <TextInput style={styles.input} placeholder="Nom compagnie" value={form.previousInsurer} onChangeText={v => upd('previousInsurer', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <DateInput label="Échéance ancien contrat" value={form.previousContract} placeholder="jj/mm/aaaa" field="previousContract" />
        </View>
      </View>

      <Text style={styles.label}>Observations</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        placeholder="Notes supplémentaires..."
        value={form.observations}
        onChangeText={v => upd('observations', v)}
        placeholderTextColor={colors.gray400}
        multiline
        numberOfLines={3}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Cotation (optionnel)</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoIcon}>📋</Text>
        <Text style={styles.infoText}>
          Renseignez cette section si vous avez déjà soumis une cotation au prospect. Sinon, passez à l'étape suivante.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Risque coté</Text>
          <View style={sf.wrapper}>
            <View style={sf.trigger}>
              <Text style={sf.triggerText} numberOfLines={1}>
                {form.ratedRisk && form.ratedRisk !== '— Non coté —' ? form.ratedRisk : form.product}
              </Text>
              <Text style={sf.caret}>●</Text>
            </View>
          </View>
        </View>
        <View style={styles.half}>
          <DateInput label="Date de cotation" value={form.quotationDate} placeholder="jj/mm/aaaa" field="quotationDate" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Montant de la cotation (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 105 000" value={form.quotationAmount} onChangeText={v => upd('quotationAmount', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <DateInput label="Date de validation" value={form.validationDate} placeholder="jj/mm/aaaa" field="validationDate" />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Vente conclue (optionnel)</Text>
      <View style={[styles.infoBox, styles.successInfo]}>
        <Text style={styles.infoIcon}>✓</Text>
        <Text style={[styles.infoText, styles.successText]}>
          Renseignez uniquement si le contrat est signé.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <DateInput label="Date de vente" value={form.saleDate} placeholder="dd/mm/yyyy" field="saleDate" />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Type de vente</Text>
          <SelectField
            value={form.saleType}
            options={SALE_TYPES}
            isOpen={openDropdown === 'saleType'}
            onToggle={() => toggle('saleType')}
            onSelect={v => upd('saleType', v)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>N° Police</Text>
          <TextInput style={styles.input} placeholder="Numéro de police" value={form.policyNumber} onChangeText={v => upd('policyNumber', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Primes nettes (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 100 000" value={form.netPremiums} onChangeText={v => upd('netPremiums', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Accessoires (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 5 000" value={form.accessories} onChangeText={v => upd('accessories', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <DateInput label="Date d'effet" value={form.effectDate} placeholder="jj/mm/aaaa" field="effectDate" />
        </View>
        <View style={styles.half}>
          <DateInput label="Date d'échéance" value={form.expiryDate} placeholder="jj/mm/aaaa" field="expiryDate" />
        </View>
      </View>
    </ScrollView>
  );

  const modalContent = (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropPress} onPress={onClose} />
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>Nouvelle prospection</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {isLoadingEditData && <Text style={styles.loadingMsg}>Chargement des données d'édition...</Text>}
        {editError && <Text style={styles.editError}>{editError}</Text>}

        {renderStepIndicator()}

        {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
        {renderDatePickerModal()}

        <View style={styles.formArea}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => { if (step > 1) setStep(step - 1); }} disabled={step === 1}>
            <Text style={[styles.prevButton, step === 1 && styles.prevButtonDisabled]}>
              ← Précédent
            </Text>
          </TouchableOpacity>

          <View style={styles.footerActions}>
            {step !== 4 && (
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSaveCurrentStep}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>{isSaving ? 'Enregistrement...' : 'Enregistrer'}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={async () => {
                if (step === 4) {
                  await handleSaveAndClose();
                  return;
                }
                const saved = await handleSaveCurrentStep();
                if (saved) {
                  setStep(prev => prev + 1);
                }
              }}
              style={[styles.nextButton, step === 4 && styles.submitButton, isSaving && styles.nextButtonDisabled]}
              disabled={isSaving}
            >
              <Text style={styles.nextButtonText}>
                {isSaving ? 'Enregistrement...' : step === 4 ? 'Enregistrer ✓' : 'Suivant →'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  if (Platform.OS === 'web') {
    return visible ? <View style={styles.webContainer}>{modalContent}</View> : null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      {modalContent}
    </Modal>
  );
}

// ====================== STYLES ======================
const styles = StyleSheet.create({
  webContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  modal: { width: '90%', maxWidth: 900, maxHeight: '90%', backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  title: { fontSize: 18, fontWeight: '700', color: colors.violetDark },
  closeButton: { fontSize: 22, color: colors.gray400 },
  calendarBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  calendarBackdropTouch: { ...StyleSheet.absoluteFillObject },
  calendarModal: { width: '90%', maxWidth: 360, backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', padding: spacing.md },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  calendarNav: { fontSize: 24, color: colors.violet, paddingHorizontal: spacing.sm },
  calendarTitle: { fontSize: 16, fontWeight: '700', color: colors.gray800 },
  calendarWeekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  calendarWeekDay: { width: 36, textAlign: 'center', fontSize: 12, color: colors.gray400 },
  calendarWeekDayLabel: { fontWeight: '700' },
  calendarDay: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, marginBottom: spacing.xs },
  calendarDayInactive: { opacity: 0.35 },
  calendarDaySelected: { backgroundColor: colors.violet },
  calendarDayText: { fontSize: 13, color: colors.gray800 },
  calendarDayTextInactive: { color: colors.gray400 },
  calendarDayTextSelected: { color: colors.white, fontWeight: '700' },
  calendarActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md },
  calendarActionButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm },
  calendarActionText: { fontSize: 14, color: colors.violet, fontWeight: '700' },
  calendarActionConfirm: { backgroundColor: colors.violet },
  calendarActionConfirmText: { color: colors.white },
  stepContainer: { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  stepBox: { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white, alignItems: 'center' },
  stepBoxActive: { backgroundColor: colors.violet, borderColor: colors.violet },
  stepBoxCompleted: { backgroundColor: colors.violetPale, borderColor: colors.violetPale },
  stepNumber: { fontSize: 16, fontWeight: '700', color: colors.gray600, marginBottom: 2 },
  stepNumberActive: { color: colors.white },
  stepLabel: { fontSize: 12, color: colors.gray600, fontWeight: '500' },
  stepLabelActive: { color: colors.white },
  formArea: { flex: 1, minHeight: 0 },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  subtitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  hint: { fontSize: 13, color: colors.gray400, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray800, marginBottom: spacing.sm, marginTop: spacing.md },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white, minHeight: 40 },
  dateInput: { justifyContent: 'center' },
  dateInputText: { fontSize: 14, color: colors.gray800 },
  placeholderText: { color: colors.gray400 },
  textarea: { minHeight: 80, paddingTop: spacing.sm, textAlignVertical: 'top' },
  helperText: { fontSize: 12, color: colors.gray400, marginTop: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  searchInput: { flex: 1 },
  searchButton: { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, marginLeft: spacing.sm, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  searchResults: { marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.white },
  resultItem: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  resultName: { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  resultMeta: { fontSize: 12, color: colors.gray400, marginTop: 4 },
  searchMessage: { fontSize: 12, color: colors.gray400, marginTop: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.md },
  half: { flex: 1 },
  probabilityContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  probabilityInput: { flex: 1, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white },
  probabilityBadge: { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  probabilityText: { fontSize: 12, fontWeight: '700', color: colors.white },
  infoBox: { flexDirection: 'row', backgroundColor: colors.infoBg, borderLeftWidth: 3, borderLeftColor: colors.info, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.lg, gap: spacing.md },
  successInfo: { backgroundColor: colors.successBg, borderLeftColor: colors.success },
  infoIcon: { fontSize: 16 },
  infoText: { flex: 1, fontSize: 13, color: colors.info, lineHeight: 18 },
  successText: { color: colors.success },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  saveButton: { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.sm },
  saveButtonDisabled: { backgroundColor: colors.gray200 },
  saveButtonText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  saveMessage: { fontSize: 13, color: colors.violetDark, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  saveError: { fontSize: 13, color: colors.danger, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  prevButton: { fontSize: 14, fontWeight: '600', color: colors.gray400, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  prevButtonDisabled: { color: colors.gray200 },
  nextButton: { backgroundColor: colors.orange, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm },
  nextButtonDisabled: { backgroundColor: colors.gray200 },
  submitButton: { backgroundColor: colors.success },
  nextButtonText: { fontSize: 14, fontWeight: '600', color: colors.white },
  loadingMsg: { fontSize: 13, color: colors.gray600, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, textAlign: 'center' },
  editError: { fontSize: 13, color: colors.danger, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, textAlign: 'center', backgroundColor: colors.dangerBg },
});

export default NewProspectionModal;
