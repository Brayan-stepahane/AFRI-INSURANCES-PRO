import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Modal, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, Pressable,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing, radius } from '../../config/theme';
import { getClient, searchClientsByName, clients, genClientId, prospections, cotations, ventes } from '../../store/data';
import type { Client } from '../../types';

interface ProspectionFormData {
  clientId: string;
  clientName: string;
  phone: string;
  clientType: string;
  activity: string;
  prospectionDate: string;
  product: string;
  potentialCA: string;
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
  attestationNumber: string;
  netPremiums: string;
  accessories: string;
  effectDate: string;
  expiryDate: string;
  carRoseNumber: string;
}

interface NewProspectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit?: (data: ProspectionFormData, isEdit?: boolean, prospectionId?: number, options?: { refreshOnly?: boolean }) => void;
  editProspection?: any; // For editing
}

const STEP_LABELS  = ['Client', 'Prospection', 'Cotation', 'Vente'];
const CLIENT_TYPES = ['Particulier', 'PME', 'Entreprise', 'Autre'];
const ACTIVITIES   = ['Chef d\'entreprise', 'Salarié', 'Indépendant', 'Autre'];
const PRODUCTS     = [
  'Afrilife étude', 'Afrilife retraite individuelle', 'Afrilife retraite plus',
  'Afrilife libre retraite', 'Afrilife Pension', 'Afrilife prévoyance individuelle',
  'Afrilife Prévoyance groupe', 'Afrilife retraite complémentaire',
  'Afrilife Indemnité de fin de carrière', 'Assurance Santé Groupe',
  'Assurance Maritime', 'Automobile', 'Flotte Automobile', 'Assurance Voyage',
  'Caution de soumission', 'Individuelle Accident', 'Individuelle Accident Groupe',
  'Multirisque Habitation', 'Responsabilité Civile Chef Entreprise',
  'Transport Marchandise', 'Autre',
];
const STATUSES   = ['Premier contact', 'En discussion', 'Proposition envoyée', 'Négociation', 'Autre'];
const SALE_TYPES = ['Nouvelle vente (NouVe)', 'Transfert', 'Augmentation', 'Autre'];
const RISKS      = ['— Non coté —', 'Standard', 'Surcoté', 'Refusé'];

// ─── SelectField ─────────────────────────────────────────────────────────────
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
          {/* Invisible backdrop to close on outside tap */}
          <TouchableOpacity style={sf.modalBackdrop} onPress={onToggle} activeOpacity={1}>
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

  // Full-screen backdrop
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Dropdown panel — positioned absolutely in window coords
  list: {
    position: 'absolute',
    maxHeight: 200,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.violet,
    borderRadius: radius.sm,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  itemActive:      { backgroundColor: colors.violetPale },
  itemText:        { flex: 1, fontSize: 13, color: colors.gray800 },
  itemTextActive:  { fontWeight: '600', color: colors.violet },
  checkmark:       { fontSize: 12, color: colors.violet, fontWeight: '700' },
});

// ─── Main component ───────────────────────────────────────────────────────────
export function NewProspectionModal({ visible, onClose, onSubmit, editProspection }: NewProspectionModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const toggle = (name: string) => setOpenDropdown(prev => (prev === name ? null : name));

  const [form, setForm] = useState<ProspectionFormData>({
    clientId: '', clientName: '', phone: '', clientType: 'Particulier',
    activity: 'Chef d\'entreprise',
    prospectionDate: new Date().toISOString().split('T')[0],
    product: 'Afrilife étude', potentialCA: '', status: 'Premier contact',
    probability: 50, visitDate1: '', nextFollowUp: '', visitDate2: '',
    visitDate3: '', previousInsurer: '', previousContract: '', observations: '',
    ratedRisk: '— Non coté —', quotationDate: '', quotationAmount: '',
    validationDate: '', saleDate: '', saleType: 'Nouvelle vente (NouVe)',
    policyNumber: '', attestationNumber: '', netPremiums: '', accessories: '',
    effectDate: '', expiryDate: '', carRoseNumber: '',
  });
  const [clientSearchResults, setClientSearchResults] = useState<Client[]>([]);
  const [clientSearchMessage, setClientSearchMessage] = useState<string>('');
  const [prospectionId, setProspectionId] = useState<number | null>(editProspection?.id ?? null);
  const [cotationId, setCotationId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');

  const handleSearchClient = () => {
    const query = form.clientName.trim();
    if (!query) {
      setClientSearchResults([]);
      setClientSearchMessage('Entrez un nom ou un identifiant de client pour rechercher.');
      return;
    }

    const results = searchClientsByName(query);
    setClientSearchResults(results);
    setClientSearchMessage(results.length === 0 ? 'Aucun client trouvé dans la base.' : '');
  };

  const selectClient = (client: Client) => {
    setForm(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.nom,
      phone: client.tel,
      clientType: client.type,
      activity: client.activite,
    }));
    setClientSearchResults([]);
    setClientSearchMessage(`Client sélectionné : ${client.nom}`);
  };

  const getOrCreateClientId = () => {
    const trimmedName = form.clientName.trim();
    if (!trimmedName) return '';
    if (form.clientId) return form.clientId;

    const existing = clients.find(c => c.nom.trim().toLowerCase() === trimmedName.toLowerCase());
    if (existing) {
      setForm(prev => ({ ...prev, clientId: existing.id }));
      return existing.id;
    }

    const newClientId = genClientId();
    const newClient: Client = {
      id: newClientId,
      nom: trimmedName,
      tel: form.phone,
      activite: form.activity,
      type: form.clientType as any,
    };
    clients.unshift(newClient);
    setForm(prev => ({ ...prev, clientId: newClientId }));
    return newClientId;
  };

  const getNextId = (items: { id: number }[]) =>
    items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  const saveProspectionLocal = () => {
    const clientId = getOrCreateClientId();
    if (!clientId) {
      setSaveError('Veuillez sélectionner ou créer un client avant de sauvegarder.');
      return null;
    }

    const record = {
      clientId,
      commercial: user?.name || 'commercial',
      produit: form.product,
      potentielCA: Number(form.potentialCA) || 0,
      chance: form.probability,
      statut: form.status as any,
      dateContact: form.prospectionDate,
      dateRelance: form.nextFollowUp,
      dateV1: form.visitDate1,
      dateV2: form.visitDate2,
      dateV3: form.visitDate3,
      observations: form.observations,
      ancienAssureur: form.previousInsurer,
      dateAncienEch: form.previousContract,
    };

    if (prospectionId) {
      const idx = prospections.findIndex(p => p.id === prospectionId);
      if (idx >= 0) {
        prospections[idx] = { ...prospections[idx], ...record } as any;
        return prospectionId;
      }
    }

    const nextId = getNextId(prospections);
    const newProspection = { id: nextId, ...record } as any;
    prospections.unshift(newProspection);
    setProspectionId(nextId);
    return nextId;
  };

  const saveCotationLocal = (savedProspectionId: number) => {
    if (!form.quotationDate && !form.quotationAmount && form.ratedRisk === '— Non coté —') {
      return null;
    }

    const clientId = getOrCreateClientId();
    if (!clientId) {
      setSaveError('Veuillez sélectionner ou créer un client avant de sauvegarder la cotation.');
      return null;
    }

    const nextId = getNextId(cotations);
    const newCotation = {
      id: nextId,
      noCot: nextId,
      prospId: savedProspectionId,
      clientId,
      commercial: user?.name || 'commercial',
      risqueCote: form.ratedRisk,
      dateCotation: form.quotationDate,
      montant: Number(form.quotationAmount) || 0,
      dateValidation: form.validationDate,
      statut: form.validationDate ? 'Validée' : 'En attente',
    } as any;
    cotations.unshift(newCotation);
    setCotationId(nextId);

    const pi = prospections.findIndex(p => p.id === savedProspectionId);
    if (pi >= 0) prospections[pi].statut = 'Cotation envoyée';

    return nextId;
  };

  const saveVenteLocal = (savedProspectionId: number, savedCotationId?: number | null) => {
    if (!form.saleDate) {
      setSaveError('Veuillez renseigner la date de vente avant de sauvegarder.');
      return null;
    }

    const clientId = getOrCreateClientId();
    if (!clientId) {
      setSaveError('Veuillez sélectionner ou créer un client avant de sauvegarder la vente.');
      return null;
    }

    const nextId = getNextId(ventes);
    const newVente = {
      id: nextId,
      prospId: savedProspectionId,
      clientId,
      commercial: user?.name || 'commercial',
      produit: form.product,
      dateVente: form.saleDate,
      typeVente: form.saleType.includes('Nouvelle') ? 'NouVe' : 'VenRec',
      noPolice: form.policyNumber,
      noAttestation: form.attestationNumber,
      noCarteRose: form.carRoseNumber,
      primeNette: Number(form.netPremiums) || 0,
      accessoires: Number(form.accessories) || 0,
      dateEffet: form.effectDate,
      dateEcheance: form.expiryDate,
    } as any;
    ventes.unshift(newVente);

    const pi = prospections.findIndex(p => p.id === savedProspectionId);
    if (pi >= 0) prospections[pi].statut = 'Contrat conclu';
    if (savedCotationId) {
      const ci = cotations.findIndex(c => c.id === savedCotationId);
      if (ci >= 0) cotations[ci].statut = 'Convertie en vente';
    }

    return nextId;
  };

  const handleLocalSave = (message: string, savedProspectionId?: number) => {
    setSaveMessage(message);
    setSaveError('');
    if (onSubmit) onSubmit(form, !!editProspection, savedProspectionId, { refreshOnly: true });
  };

  const handleSaveCurrentStep = () => {
    setSaveError('');
    setSaveMessage('');
    const savedProspectionId = saveProspectionLocal();
    if (!savedProspectionId) return false;

    if (step === 2) {
      handleLocalSave('Prospection enregistrée.', savedProspectionId);
      return true;
    }

    const savedCotId = saveCotationLocal(savedProspectionId);
    if (step === 3) {
      handleLocalSave('Prospection et cotation enregistrées.', savedProspectionId);
      return true;
    }

    const savedVenteId = saveVenteLocal(savedProspectionId, savedCotId);
    if (!savedVenteId) return false;
    handleLocalSave('Prospection, cotation et vente enregistrées.', savedProspectionId);
    return true;
  };

  const handleSaveAndClose = () => {
    const saved = handleSaveCurrentStep();
    if (saved) onClose();
  };

  // If editing, populate form
  React.useEffect(() => {
    if (editProspection && visible) {
      const client = getClient(editProspection.clientId);
      setForm({
        clientId: editProspection.clientId || '',
        clientName: client?.nom || '',
        phone: client?.tel || '',
        clientType: client?.type || 'Particulier',
        activity: client?.activite || 'Chef d\'entreprise',
        prospectionDate: editProspection.dateContact || new Date().toISOString().split('T')[0],
        product: editProspection.produit || 'Afrilife étude',
        potentialCA: String(editProspection.potentielCA || ''),
        status: editProspection.statut || 'Premier contact',
        probability: editProspection.chance || 50,
        visitDate1: editProspection.dateV1 || '',
        nextFollowUp: editProspection.dateRelance || '',
        visitDate2: editProspection.dateV2 || '',
        visitDate3: editProspection.dateV3 || '',
        previousInsurer: editProspection.ancienAssureur || '',
        previousContract: editProspection.dateAncienEch || '',
        observations: editProspection.observations || '',
        ratedRisk: '— Non coté —',
        quotationDate: '',
        quotationAmount: '',
        validationDate: '',
        saleDate: '',
        saleType: 'Nouvelle vente (NouVe)',
        policyNumber: '',
        attestationNumber: '',
        netPremiums: '',
        accessories: '',
        effectDate: editProspection.dateAncienEch || '',
        expiryDate: '',
        carRoseNumber: '',
      });
      setProspectionId(editProspection.id || null);
    } else if (!editProspection && visible) {
      setForm({
        clientId: '', clientName: '', phone: '', clientType: 'Particulier',
        activity: 'Chef d\'entreprise',
        prospectionDate: new Date().toISOString().split('T')[0],
        product: 'Afrilife étude', potentialCA: '', status: 'Premier contact',
        probability: 50, visitDate1: '', nextFollowUp: '', visitDate2: '',
        visitDate3: '', previousInsurer: '', previousContract: '', observations: '',
        ratedRisk: '— Non coté —', quotationDate: '', quotationAmount: '',
        validationDate: '', saleDate: '', saleType: 'Nouvelle vente (NouVe)',
        policyNumber: '', attestationNumber: '', netPremiums: '', accessories: '',
        effectDate: '', expiryDate: '', carRoseNumber: '',
      });
      setProspectionId(null);
    }
    setCotationId(null);
    setSaveMessage('');
    setSaveError('');
  }, [editProspection, visible]);

  const upd = (field: keyof ProspectionFormData, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      {STEP_LABELS.map((label, idx) => {
        const n = idx + 1;
        const isActive    = step === n;
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
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.subtitle}>Identification du client</Text>
      <Text style={styles.hint}>Tapez le nom pour rechercher un client existant</Text>

      <Text style={styles.label}>Nom du client *</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, styles.searchInput]}
          placeholder="Tapez pour rechercher ou créer..."
          value={form.clientName}
          onChangeText={v => {
            upd('clientName', v);
            setClientSearchResults([]);
            setClientSearchMessage('');
          }}
          placeholderTextColor={colors.gray400}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchClient} activeOpacity={0.8}>
          <Text style={styles.searchButtonText}>Rechercher</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.helperText}>Le système cherche dans la base clients après validation.</Text>
      {clientSearchMessage ? <Text style={styles.searchMessage}>{clientSearchMessage}</Text> : null}
      {clientSearchResults.length > 0 && (
        <View style={styles.searchResults}>
          {clientSearchResults.map(client => (
            <TouchableOpacity
              key={client.id}
              style={styles.resultItem}
              onPress={() => selectClient(client)}
            >
              <Text style={styles.resultName}>{client.nom}</Text>
              <Text style={styles.resultMeta}>{client.id} · {client.activite}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Téléphone</Text>
          <TextInput
            style={styles.input} placeholder="6XX XXX XXX" value={form.phone}
            onChangeText={v => upd('phone', v)} placeholderTextColor={colors.gray400}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Type de client</Text>
          <SelectField
            value={form.clientType} options={CLIENT_TYPES}
            isOpen={openDropdown === 'clientType'}
            onToggle={() => toggle('clientType')}
            onSelect={v => upd('clientType', v)}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>Activité</Text>
        <SelectField
          value={form.activity} options={ACTIVITIES}
          isOpen={openDropdown === 'activity'}
          onToggle={() => toggle('activity')}
          onSelect={v => upd('activity', v)}
        />
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.subtitle}>Détails de la prospection</Text>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Produit / Risque visé *</Text>
          <SelectField
            value={form.product} options={PRODUCTS}
            isOpen={openDropdown === 'product'}
            onToggle={() => toggle('product')}
            onSelect={v => upd('product', v)}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Statut *</Text>
          <SelectField
            value={form.status} options={STATUSES}
            isOpen={openDropdown === 'status'}
            onToggle={() => toggle('status')}
            onSelect={v => upd('status', v)}
          />
        </View>
      </View>

      <Text style={styles.label}>Chance de réalisation (%)</Text>
      <View style={styles.probabilityContainer}>
        <TextInput
          style={styles.probabilityInput} placeholder="0"
          value={String(form.probability)}
          onChangeText={(v: string) => {
            const num = parseInt(v) || 0;
            upd('probability', Math.min(Math.max(num, 0), 100));
          }}
          keyboardType="numeric" maxLength={3} placeholderTextColor={colors.gray400}
        />
        <View style={styles.probabilityBadge}>
          <Text style={styles.probabilityText}>{form.probability}%</Text>
        </View>
      </View>

      <Text style={styles.label}>Date visite 1</Text>
      <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.visitDate1}
        onChangeText={v => upd('visitDate1', v)} placeholderTextColor={colors.gray400} />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Prochaine relance</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.nextFollowUp}
            onChangeText={v => upd('nextFollowUp', v)} placeholderTextColor={colors.gray400} />
          <Text style={styles.helperText}>Alerte automatique à cette date</Text>
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Date visite 2</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.visitDate2}
            onChangeText={v => upd('visitDate2', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <Text style={styles.label}>Date visite 3</Text>
      <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.visitDate3}
        onChangeText={v => upd('visitDate3', v)} placeholderTextColor={colors.gray400} />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Ancien assureur</Text>
          <TextInput style={styles.input} placeholder="Nom compagnie" value={form.previousInsurer}
            onChangeText={v => upd('previousInsurer', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Échange ancien contrat</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.previousContract}
            onChangeText={v => upd('previousContract', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <Text style={styles.label}>Observations</Text>
      <TextInput
        style={[styles.input, styles.textarea]} placeholder="Notes supplémentaires..."
        value={form.observations} onChangeText={v => upd('observations', v)}
        placeholderTextColor={colors.gray400} multiline numberOfLines={3}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
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
          <SelectField
            value={form.ratedRisk} options={RISKS}
            isOpen={openDropdown === 'ratedRisk'}
            onToggle={() => toggle('ratedRisk')}
            onSelect={v => upd('ratedRisk', v)}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Date de cotation</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.quotationDate}
            onChangeText={v => upd('quotationDate', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Montant de la cotation (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 105 000" value={form.quotationAmount}
            onChangeText={v => upd('quotationAmount', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Date de validation</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.validationDate}
            onChangeText={v => upd('validationDate', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.formContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.subtitle}>Vente conclue (optionnel)</Text>
      <View style={[styles.infoBox, styles.successInfo]}>
        <Text style={styles.infoIcon}>✓</Text>
        <Text style={[styles.infoText, styles.successText]}>
          Renseignez uniquement si le contrat est signé.
        </Text>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Date de vente</Text>
          <TextInput style={styles.input} placeholder="dd/mm/yyyy" value={form.saleDate}
            onChangeText={v => upd('saleDate', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Type de vente</Text>
          <SelectField
            value={form.saleType} options={SALE_TYPES}
            isOpen={openDropdown === 'saleType'}
            onToggle={() => toggle('saleType')}
            onSelect={v => upd('saleType', v)}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>N° Police EXCEL/ORASS</Text>
          <TextInput style={styles.input} placeholder="Numéro de police" value={form.policyNumber}
            onChangeText={v => upd('policyNumber', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>N° Attestation</Text>
          <TextInput style={styles.input} placeholder="Numéro attestation" value={form.attestationNumber}
            onChangeText={v => upd('attestationNumber', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Primes nettes (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 100 000" value={form.netPremiums}
            onChangeText={v => upd('netPremiums', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Accessoires (FCFA)</Text>
          <TextInput style={styles.input} placeholder="Ex: 5 000" value={form.accessories}
            onChangeText={v => upd('accessories', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Date d'effet</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.effectDate}
            onChangeText={v => upd('effectDate', v)} placeholderTextColor={colors.gray400} />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Date d'échéance</Text>
          <TextInput style={styles.input} placeholder="jj/mm/aaaa" value={form.expiryDate}
            onChangeText={v => upd('expiryDate', v)} placeholderTextColor={colors.gray400} />
        </View>
      </View>

      <Text style={styles.label}>N° Carte rose (automobile)</Text>
      <TextInput style={styles.input} placeholder="Numéro carte rose" value={form.carRoseNumber}
        onChangeText={v => upd('carRoseNumber', v)} placeholderTextColor={colors.gray400} />
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

        {renderStepIndicator()}
        {saveMessage ? <Text style={styles.saveMessage}>{saveMessage}</Text> : null}
        {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}

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
            {step > 1 && (
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveCurrentStep} activeOpacity={0.8}>
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={step === 4 ? handleSaveAndClose : () => setStep(step + 1)}
              style={[styles.nextButton, step === 4 && styles.submitButton]}
            >
              <Text style={styles.nextButtonText}>{step === 4 ? 'Enregistrer ✓' : 'Suivant →'}</Text>
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

const styles = StyleSheet.create({
  webContainer:         { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  backdrop:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  backdropPress:        { ...StyleSheet.absoluteFillObject },
  modal:                { width: '90%', maxWidth: 800, maxHeight: '90%', backgroundColor: colors.white, borderRadius: radius.lg, flexDirection: 'column' },
  header:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  title:                { fontSize: 18, fontWeight: '700', color: colors.violetDark },
  closeButton:          { fontSize: 22, color: colors.gray400 },
  stepContainer:        { flexDirection: 'row', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  stepBox:              { flex: 1, paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.gray200, backgroundColor: colors.white, alignItems: 'center' },
  stepBoxActive:        { backgroundColor: colors.violet, borderColor: colors.violet },
  stepBoxCompleted:     { backgroundColor: colors.violetPale, borderColor: colors.violetPale },
  stepNumber:           { fontSize: 16, fontWeight: '700', color: colors.gray600, marginBottom: 2 },
  stepNumberActive:     { color: colors.white },
  stepLabel:            { fontSize: 12, color: colors.gray600, fontWeight: '500' },
  stepLabelActive:      { color: colors.white },
  formArea:             { flex: 1 },
  formScroll:           { flex: 1 },
  formContent:          { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  subtitle:             { fontSize: 16, fontWeight: '700', color: colors.violetDark, marginBottom: spacing.sm },
  hint:                 { fontSize: 13, color: colors.gray400, marginBottom: spacing.lg },
  label:                { fontSize: 13, fontWeight: '600', color: colors.gray800, marginBottom: spacing.sm, marginTop: spacing.md },
  input:                { borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white, minHeight: 40 },
  textarea:             { minHeight: 80, paddingTop: spacing.sm, textAlignVertical: 'top' },
  helperText:           { fontSize: 12, color: colors.gray400, marginTop: 4 },
  searchRow:            { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  searchInput:          { flex: 1 },
  searchButton:         { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, marginLeft: spacing.sm, minHeight: 40, justifyContent: 'center', alignItems: 'center' },
  searchButtonText:     { color: colors.white, fontWeight: '700', fontSize: 14 },
  searchResults:        { marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, overflow: 'hidden', backgroundColor: colors.white },
  resultItem:           { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  resultName:           { fontSize: 14, fontWeight: '600', color: colors.gray800 },
  resultMeta:           { fontSize: 12, color: colors.gray400, marginTop: 4 },
  searchMessage:        { fontSize: 12, color: colors.gray400, marginTop: spacing.sm },
  row:                  { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.sm },
  half:                 { flex: 1 },
  probabilityContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  probabilityInput:     { flex: 1, borderWidth: 1, borderColor: colors.gray200, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14, color: colors.gray800, backgroundColor: colors.white },
  probabilityBadge:     { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, minWidth: 60, alignItems: 'center' },
  probabilityText:      { fontSize: 12, fontWeight: '700', color: colors.white },
  infoBox:              { flexDirection: 'row', backgroundColor: colors.infoBg, borderLeftWidth: 3, borderLeftColor: colors.info, borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.lg, gap: spacing.md },
  successInfo:          { backgroundColor: colors.successBg, borderLeftColor: colors.success },
  infoIcon:             { fontSize: 16 },
  infoText:             { flex: 1, fontSize: 13, color: colors.info, lineHeight: 18 },
  successText:          { color: colors.success },
  footer:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: colors.gray100 },
  footerActions:        { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  saveButton:           { backgroundColor: colors.violet, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: radius.sm },
  saveButtonText:       { color: colors.white, fontWeight: '700', fontSize: 14 },
  saveMessage:          { fontSize: 13, color: colors.violetDark, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  saveError:            { fontSize: 13, color: colors.danger, paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  prevButton:           { fontSize: 14, fontWeight: '600', color: colors.gray400, paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  prevButtonDisabled:   { color: colors.gray200 },
  nextButton:           { backgroundColor: colors.orange, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.sm },
  submitButton:         { backgroundColor: colors.success },
  nextButtonText:       { fontSize: 14, fontWeight: '600', color: colors.white },
});
