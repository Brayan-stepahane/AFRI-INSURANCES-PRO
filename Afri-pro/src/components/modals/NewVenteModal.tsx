import React, { useState, useRef } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Pressable, Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import { useProspections } from '../../hooks/useProspections';
import { normalizeDateInput } from '../../utils/constants';
import { colors, spacing, radius } from '../../config/theme';
import type { Vente } from '../../types';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

interface VenteFormData {
  produit: string;
  dateVente: string;
  typeVente: string;
  noPolice: string;
  primeNette: string;
  accessories: string;
  dateEffet: string;
  dateEcheance: string;
}

interface NewVenteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: VenteFormData, isEdit?: boolean, venteId?: number, options?: { refreshOnly?: boolean }) => void;
  editVente?: Vente;
  fromCotation?: any; // Cotation data to pre-populate from
}

const PRODUCTS = [
  'Afrilife étude', 'Afrilife retraite individuelle', 'Afrilife retraite plus',
  'Afrilife libre retraite', 'Afrilife Pension', 'Afrilife prévoyance individuelle',
  'Afrilife Prévoyance groupe', 'Afrilife retraite complémentaire',
  'Afrilife Indemnité de fin de carrière', 'Assurance Santé Groupe',
  'Assurance Maritime', 'Automobile', 'Flotte Automobile', 'Assurance Voyage',
  'Caution de soumission', 'Individuelle Accident', 'Individuelle Accident Groupe',
  'Multirisque Habitation', 'Responsabilité Civile chef_agence Entreprise',
  'Transport Marchandise', 'Autre',
];
const SALE_TYPES = ['Nouvelle vente (NouVe)', 'Renouvellement'];

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
        <Modal
          transparent
          visible={isOpen}
          animationType="none"
          onRequestClose={onToggle}
        >
          <TouchableOpacity style={[sf.modalBackdrop, { pointerEvents: 'auto' }]} onPress={onToggle} activeOpacity={1}>
            <View
              style={[sf.list, { top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }]}
            >
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {options.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={[sf.item, item === value && sf.itemActive]}
                    onPress={() => { onSelect(item); onToggle(); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[sf.itemText, item === value && sf.itemTextActive]}>{item}</Text>
                    {item === value && <Text style={sf.checkmark}>✓</Text>}
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

export function NewVenteModal({ visible, onClose, onSubmit, editVente, fromCotation }: NewVenteModalProps) {
  const { user } = useAuth();
  const { clients } = useClients();
  const { prospections } = useProspections();

  const getClient = (id: string) => clients.find(c => c.id === id);
  const [venteId, setVenteId] = useState<number | null>(editVente?.id ?? null);
  const [cotationId, setCotationId] = useState<number | null>(fromCotation?.id ?? null);
  const [clientId, setClientId] = useState<string>(fromCotation?.clientId ?? '');
  const [prospectionId, setProspectionId] = useState<string>(fromCotation?.prospId ? String(fromCotation.prospId) : '');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const [form, setForm] = useState<VenteFormData>({
    produit: 'Afrilife étude',
    dateVente: new Date().toISOString().split('T')[0],
    typeVente: 'Nouvelle vente (NouVe)',
    noPolice: '',
    primeNette: '',
    accessories: '',
    dateEffet: '',
    dateEcheance: '',
  });

  const upd = (field: keyof VenteFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Populate form on edit or from cotation
  React.useEffect(() => {
    if (fromCotation && visible) {
      // Pre-populate from cotation conversion
      setCotationId(fromCotation.id);
      setClientId(fromCotation.clientId);
      setProspectionId(String(fromCotation.prospId || ''));
      setForm({
        produit: fromCotation.risqueCote || 'Afrilife étude',
        dateVente: new Date().toISOString().split('T')[0],
        typeVente: 'Nouvelle vente (NouVe)',
        noPolice: '',
        primeNette: String(fromCotation.montant || 0),
        accessories: '1000',
        dateEffet: '',
        dateEcheance: '',
      });
      setVenteId(null);
    } else if (editVente && visible) {
      setCotationId(null);
      setClientId(editVente.clientId);
      setProspectionId(String(editVente.prospId || ''));
      setForm({
        produit: editVente.produit || 'Afrilife étude',
        dateVente: normalizeDateInput(editVente.dateVente || new Date().toISOString()),
        typeVente: editVente.typeVente === 'NouVe' ? 'Nouvelle vente (NouVe)' : 'Renouvellement',
        noPolice: editVente.noPolice && editVente.noPolice !== 'null' ? editVente.noPolice : '',
        primeNette: String(editVente.primeNette || ''),
        accessories: String(editVente.accessoires || ''),
        dateEffet: normalizeDateInput(editVente.dateEffet || ''),
        dateEcheance: normalizeDateInput(editVente.dateEcheance || ''),
      });
      setVenteId(editVente.id);
    } else if (!editVente && !fromCotation && visible) {
      setCotationId(null);
      setClientId('');
      setProspectionId('');
      setForm({
        produit: 'Afrilife étude',
        dateVente: new Date().toISOString().split('T')[0],
        typeVente: 'Nouvelle vente (NouVe)',
        noPolice: '',
        primeNette: '',
        accessories: '',
        dateEffet: '',
        dateEcheance: '',
      });
      setVenteId(null);
    }
    setSaveMessage('');
    setSaveError('');
  }, [editVente, fromCotation, visible]);

  const handleSaveCurrentStep = async () => {
    if (isSaving) {
      return false;
    }
    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    if (!form.dateVente) {
      setSaveError('Veuillez renseigner la date de vente.');
      setIsSaving(false);
      return false;
    }

    if (!clientId) {
      setSaveError('Le client est requis pour enregistrer la vente.');
      setIsSaving(false);
      return false;
    }

    if (fromCotation && !fromCotation.prospId) {
      setSaveError('Impossible de convertir cette cotation en vente : prospection introuvable.');
      setIsSaving(false);
      return false;
    }

    if (!fromCotation && !prospectionId) {
      setSaveError('Veuillez sélectionner une prospection liée.');
      setIsSaving(false);
      return false;
    }

    try {
      const record = {
        client_id: clientId,
        cotation_id: cotationId || null,
        prospection_id: fromCotation?.prospId || prospectionId || null,
        commercial_id: fromCotation?.commercialId || user?.id,
        produit: form.produit,
        date_vente: form.dateVente,
        type_vente: form.typeVente.includes('Nouvelle') ? 'NouVe' : 'VenRec',
        numero_police: form.noPolice || null,
        prime_nette: Number(form.primeNette) || 0,
        accessoires: Number(form.accessories) || 0,
        date_effet: form.dateEffet || null,
        date_echeance: form.dateEcheance || null,
      };

      let createdVenteId: number | null = null;
      if (venteId) {
        await apiClient.put(`${API_ENDPOINTS.VENTES.UPDATE}/${venteId}`, record);
      } else {
        const response = await apiClient.post(API_ENDPOINTS.VENTES.CREATE, record);
        if (response?.data) {
          createdVenteId = response.data.id;
          setVenteId(createdVenteId);
        }
      }

      setSaveMessage('Vente enregistrée.');
      if (onSubmit) onSubmit(form, !!editVente, createdVenteId || venteId || undefined, { refreshOnly: true });
      return true;
    } catch (error) {
      console.error('Error saving vente:', error);
      const err = error as any;
      const serverMsg = err?.response?.data?.error;
      setSaveError(serverMsg || 'Erreur lors de l\'enregistrement de la vente.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const parseAmount = (value: string) => Number(String(value || '').replace(new RegExp('[^\\d.-]', 'g'), '')) || 0;
  const calculatedCa = Math.max(0, parseAmount(form.primeNette) - parseAmount(form.accessories));
  const formatAmount = (value: number) => value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  const selectedProspection = prospections.find(p => String(p.id) === prospectionId);
  const prospectionLabel = selectedProspection
    ? `${getClient(selectedProspection.clientId)?.nom || selectedProspection.clientId} — ${selectedProspection.statut}`
    : 'Sélectionner une prospection';
  const prospectionOptions = prospections.map(p => {
    const clientName = getClient(p.clientId)?.nom || p.clientId;
    return `${clientName} — ${p.statut}`;
  });

  const handleSubmit = async () => {
    const saved = await handleSaveCurrentStep();
    if (saved) {
      setTimeout(onClose, 800);
    }
  };

  const modalContent = (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropPress} onPress={onClose} />
      <View style={styles.modal}>
        <View style={styles.header}>
          <Text style={styles.title}>{fromCotation ? 'Convertir en vente' : editVente ? 'Modifier vente' : 'Nouvelle vente'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Détails de la vente</Text>

          {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          {!fromCotation && (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Prospection liée *</Text>
                <SelectField
                  value={prospectionLabel}
                  options={prospectionOptions}
                  isOpen={openDropdown === 'prospection'}
                  onToggle={() => toggle('prospection')}
                  onSelect={v => {
                    const found = prospections.find(p => {
                      const clientName = getClient(p.clientId)?.nom || p.clientId;
                      return `${clientName} — ${p.statut}` === v;
                    });
                    if (found) {
                      setProspectionId(String(found.id));
                      if (!clientId) setClientId(found.clientId);
                    }
                  }}
                />
              </View>
            </View>
          )}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Produit</Text>
              <SelectField
                value={form.produit}
                options={PRODUCTS}
                isOpen={openDropdown === 'produit'}
                onToggle={() => toggle('produit')}
                onSelect={v => upd('produit', v)}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Type de vente</Text>
              <SelectField
                value={form.typeVente}
                options={SALE_TYPES}
                isOpen={openDropdown === 'typeVente'}
                onToggle={() => toggle('typeVente')}
                onSelect={v => upd('typeVente', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Date de vente</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.dateVente}
                onChangeText={v => upd('dateVente', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>N° Police</Text>
              <TextInput
                style={styles.input}
                placeholder="Numéro de police"
                value={form.noPolice}
                onChangeText={v => upd('noPolice', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
          </View>



          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Prime nette (FCFA)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 100 000"
                value={form.primeNette}
                onChangeText={v => upd('primeNette', v)}
                placeholderTextColor={colors.gray400}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.half}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Accessoires (FCFA)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 5 000"
                  value={form.accessories}
                  onChangeText={v => upd('accessories', v)}
                  placeholderTextColor={colors.gray400}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginTop: spacing.md }}>
                <Text style={styles.label}>CA calculé (FCFA)</Text>
                <TextInput
                  style={[styles.input, styles.readonlyInput]}
                  value={formatAmount(calculatedCa)}
                  editable={false}
                  placeholderTextColor={colors.gray400}
                />
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Date d'effet</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.dateEffet}
                onChangeText={v => upd('dateEffet', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Date d'échéance</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.dateEcheance}
                onChangeText={v => upd('dateEcheance', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, isSaving && styles.submitButtonDisabled]} disabled={isSaving}>
            <Text style={styles.submitButtonText}>Enregistrer</Text>
          </TouchableOpacity>
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  list: {
    position: 'absolute',
    maxHeight: 200,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.violet,
    borderRadius: radius.sm,
    elevation: 20,
    boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
    overflow: 'hidden',
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

const styles = StyleSheet.create({
  webContainer: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  modal: { width: '90%', maxWidth: 700, maxHeight: '85%', backgroundColor: colors.white, borderRadius: radius.lg, flexDirection: 'column' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  title: { fontSize: 18, fontWeight: '700', color: colors.violetDark },
  closeButton: { fontSize: 22, color: colors.gray400 },
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, overflow: 'visible' },
  subtitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray800, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white, minHeight: 40 },
  readonlyInput: { backgroundColor: colors.gray100, color: colors.gray600 },
  row: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.md, zIndex: 1, overflow: 'visible' },
  half: { flex: 1 },
  saveMessage: { fontSize: 13, color: colors.violetDark, marginBottom: spacing.md },
  saveError: { fontSize: 13, color: colors.danger, marginBottom: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  cancelButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  submitButton: { backgroundColor: colors.success, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { fontSize: 14, fontWeight: '600', color: colors.white },
});
