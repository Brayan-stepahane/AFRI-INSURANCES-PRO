import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Pressable, Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useClients } from '../../hooks/useClients';
import { colors, spacing, radius } from '../../config/theme';
import type { Vente } from '../../types';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

interface VenteFormData {
  produit: string;
  dateVente: string;
  typeVente: string;
  noPolice: string;
  noAttestation: string;
  noCarteRose: string;
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
}

const PRODUCTS = [
  'Afrilife étude', 'Afrilife retraite individuelle', 'Afrilife retraite plus',
  'Afrilife libre retraite', 'Afrilife Pension', 'Afrilife prévoyance individuelle',
  'Afrilife Prévoyance groupe', 'Afrilife retraite complémentaire',
  'Afrilife Indemnité de fin de carrière', 'Assurance Santé Groupe',
  'Assurance Maritime', 'Automobile', 'Flotte Automobile', 'Assurance Voyage',
  'Caution de soumission', 'Individuelle Accident', 'Individuelle Accident Groupe',
  'Multirisque Habitation', 'Responsabilité Civile Chef Entreprise',
  'Transport Marchandise', 'Autre',
];
const SALE_TYPES = ['Nouvelle vente (NouVe)', 'Transfert', 'Augmentation', 'Autre'];

function SelectField({
  value, options, isOpen, onToggle, onSelect,
}: {
  value: string; options: string[]; isOpen: boolean;
  onToggle: () => void; onSelect: (v: string) => void;
}) {
  return (
    <View style={sf.wrapper}>
      <TouchableOpacity
        style={[sf.trigger, isOpen && sf.triggerOpen]}
        onPress={onToggle}
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
          <TouchableOpacity style={sf.modalBackdrop} onPress={onToggle} activeOpacity={1}>
            <View style={[sf.list, { maxHeight: 250 }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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

export function NewVenteModal({ visible, onClose, onSubmit, editVente }: NewVenteModalProps) {
  const { user } = useAuth();
  const { clients } = useClients();

  const getClient = (id: string) => clients.find(c => c.id === id);
  const [venteId, setVenteId] = useState<number | null>(editVente?.id ?? null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const [form, setForm] = useState<VenteFormData>({
    produit: 'Afrilife étude',
    dateVente: new Date().toISOString().split('T')[0],
    typeVente: 'Nouvelle vente (NouVe)',
    noPolice: '',
    noAttestation: '',
    noCarteRose: '',
    primeNette: '',
    accessories: '',
    dateEffet: '',
    dateEcheance: '',
  });

  const upd = (field: keyof VenteFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Populate form on edit
  React.useEffect(() => {
    if (editVente && visible) {
      setForm({
        produit: editVente.produit || 'Afrilife étude',
        dateVente: editVente.dateVente || new Date().toISOString().split('T')[0],
        typeVente: editVente.typeVente === 'NouVe' ? 'Nouvelle vente (NouVe)' : 'Transfert',
        noPolice: editVente.noPolice || '',
        noAttestation: editVente.noAttestation || '',
        noCarteRose: editVente.noCarteRose || '',
        primeNette: String(editVente.primeNette || ''),
        accessories: String(editVente.accessoires || ''),
        dateEffet: editVente.dateEffet || '',
        dateEcheance: editVente.dateEcheance || '',
      });
      setVenteId(editVente.id);
    } else if (!editVente && visible) {
      setForm({
        produit: 'Afrilife étude',
        dateVente: new Date().toISOString().split('T')[0],
        typeVente: 'Nouvelle vente (NouVe)',
        noPolice: '',
        noAttestation: '',
        noCarteRose: '',
        primeNette: '',
        accessories: '',
        dateEffet: '',
        dateEcheance: '',
      });
      setVenteId(null);
    }
    setSaveMessage('');
    setSaveError('');
  }, [editVente, visible]);

  const handleSaveCurrentStep = async () => {
    setSaveError('');
    setSaveMessage('');

    if (!form.dateVente) {
      setSaveError('Veuillez renseigner la date de vente.');
      return false;
    }

    try {
      const record = {
        produit: form.produit,
        date_vente: form.dateVente,
        type_vente: form.typeVente.includes('Nouvelle') ? 'NouVe' : 'VenRec',
        numero_police: form.noPolice,
        numero_attestation: form.noAttestation,
        no_carte_rose: form.noCarteRose,
        prime_nette: Number(form.primeNette) || 0,
        accessoires: Number(form.accessories) || 0,
        date_effet: form.dateEffet,
        date_echeance: form.dateEcheance,
      };

      if (venteId) {
        // Update existing vente
        await apiClient.put(`${API_ENDPOINTS.VENTES.UPDATE}/${venteId}`, record);
      } else {
        // Create new vente via API
        const response = await apiClient.post(API_ENDPOINTS.VENTES.CREATE, record);
        if (response?.data) {
          setVenteId(response.data.id);
        }
      }

      setSaveMessage('Vente enregistrée.');
      if (onSubmit) onSubmit(form, !!editVente, venteId || undefined, { refreshOnly: true });
      return true;
    } catch (error) {
      console.error('Error saving vente:', error);
      setSaveError('Erreur lors de l\'enregistrement de la vente.');
      return false;
    }
  };

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
          <Text style={styles.title}>{editVente ? 'Modifier vente' : 'Nouvelle vente'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Détails de la vente</Text>

          {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

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
              <Text style={styles.label}>N° Attestation</Text>
              <TextInput
                style={styles.input}
                placeholder="Numéro attestation"
                value={form.noAttestation}
                onChangeText={v => upd('noAttestation', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>N° Carte rose</Text>
              <TextInput
                style={styles.input}
                placeholder="Numéro carte rose"
                value={form.noCarteRose}
                onChangeText={v => upd('noCarteRose', v)}
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
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Enregistrer ✓</Text>
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
  modalBackdrop: { flex: 1, backgroundColor: 'transparent' },
  list: {
    position: 'absolute', backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.violet, borderRadius: radius.sm,
    elevation: 20, boxShadow: '0px 4px 8px rgba(0,0,0,0.15)',
    overflow: 'hidden', top: 50, width: '100%',
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
  formContent: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  subtitle: { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray800, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white, minHeight: 40 },
  row: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.md },
  half: { flex: 1 },
  saveMessage: { fontSize: 13, color: colors.violetDark, marginBottom: spacing.md },
  saveError: { fontSize: 13, color: colors.danger, marginBottom: spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  cancelButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  cancelButtonText: { fontSize: 14, fontWeight: '600', color: colors.gray600 },
  submitButton: { backgroundColor: colors.success, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm },
  submitButtonText: { fontSize: 14, fontWeight: '600', color: colors.white },
});
