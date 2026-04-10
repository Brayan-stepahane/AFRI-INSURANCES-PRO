import React, { useState } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Pressable, Alert,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../config/theme';
import type { Cotation } from '../../types';
import apiClient from '../../services/api/client';
import { API_ENDPOINTS } from '../../services/api/endpoints';

interface CotationFormData {
  risqueCote: string;
  dateCotation: string;
  montant: string;
  dateValidation: string;
}

interface NewCotationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: CotationFormData, isEdit?: boolean, cotationId?: number, options?: { refreshOnly?: boolean }) => void;
  editCotation?: Cotation;
}

const RISKS = ['— Non coté —', 'Standard', 'Surcoté', 'Refusé'];

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
            <View style={[sf.list, { maxHeight: 200 }]}>
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

export function NewCotationModal({ visible, onClose, onSubmit, editCotation }: NewCotationModalProps) {
  const { user } = useAuth();
  const [cotationId, setCotationId] = useState<number | null>(editCotation?.id ?? null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const [form, setForm] = useState<CotationFormData>({
    risqueCote: '— Non coté —',
    dateCotation: new Date().toISOString().split('T')[0],
    montant: '',
    dateValidation: '',
  });

  const upd = (field: keyof CotationFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Populate form on edit
  React.useEffect(() => {
    if (editCotation && visible) {
      setForm({
        risqueCote: editCotation.risqueCote || '— Non coté —',
        dateCotation: editCotation.dateCotation || new Date().toISOString().split('T')[0],
        montant: String(editCotation.montant || ''),
        dateValidation: editCotation.dateValidation || '',
      });
      setCotationId(editCotation.id);
    } else if (!editCotation && visible) {
      setForm({
        risqueCote: '— Non coté —',
        dateCotation: new Date().toISOString().split('T')[0],
        montant: '',
        dateValidation: '',
      });
      setCotationId(null);
    }
    setSaveMessage('');
    setSaveError('');
  }, [editCotation, visible]);

  const handleSaveCurrentStep = async () => {
    setSaveError('');
    setSaveMessage('');

    if (!form.dateCotation) {
      setSaveError('Veuillez renseigner la date de cotation.');
      return false;
    }

    try {
      const record = {
        risque_cote: form.risqueCote,
        date_cotation: form.dateCotation,
        montant: Number(form.montant) || 0,
        date_validation: form.dateValidation,
        statut: form.dateValidation ? 'Validée' : 'En attente',
      };

      if (cotationId) {
        // Update existing cotation
        await apiClient.put(`${API_ENDPOINTS.COTATIONS.UPDATE}/${cotationId}`, record);
      } else {
        // Create new cotation via API
        const response = await apiClient.post(API_ENDPOINTS.COTATIONS.CREATE, record);
        if (response?.data) {
          setCotationId(response.data.id);
        }
      }

      setSaveMessage('Cotation enregistrée.');
      if (onSubmit) onSubmit(form, !!editCotation, cotationId || undefined, { refreshOnly: true });
      return true;
    } catch (error) {
      console.error('Error saving cotation:', error);
      setSaveError('Erreur lors de l\'enregistrement de la cotation.');
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
          <Text style={styles.title}>{editCotation ? 'Modifier cotation' : 'Nouvelle cotation'}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>Détails de la cotation</Text>

          {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
          {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Date de cotation</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.dateCotation}
                onChangeText={v => upd('dateCotation', v)}
                placeholderTextColor={colors.gray400}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Risque coté</Text>
              <SelectField
                value={form.risqueCote}
                options={RISKS}
                isOpen={openDropdown === 'risqueCote'}
                onToggle={() => toggle('risqueCote')}
                onSelect={v => upd('risqueCote', v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Montant (FCFA)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 100 000"
                value={form.montant}
                onChangeText={v => upd('montant', v)}
                placeholderTextColor={colors.gray400}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.label}>Date de validation</Text>
              <TextInput
                style={styles.input}
                placeholder="dd/mm/yyyy"
                value={form.dateValidation}
                onChangeText={v => upd('dateValidation', v)}
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
  modal: { width: '90%', maxWidth: 600, maxHeight: '80%', backgroundColor: colors.white, borderRadius: radius.lg, flexDirection: 'column' },
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
