import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../config/theme';

const CONTACT_EMAIL = 'zoumbryan68@gmail.com';

export function Footer() {
  const openContactEmail = () => {
    void Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.rule} />
      <View style={styles.content}>
        <View style={styles.copyrightGroup}>
          <View style={styles.dot} />
          <Text style={styles.copyright}>© Copyright AFRILIFE INSURANCE Tous droits réservés</Text>
        </View>
        <View style={styles.contactGroup}>
          <Text style={styles.credit}>Design and Develop <Text style={styles.creditName}>by Zoum Brayan</Text></Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Contacter ${CONTACT_EMAIL}`}
            onPress={openContactEmail}
            style={({ pressed }) => [styles.contactButton, pressed && styles.contactButtonPressed]}
          >
            <Text style={styles.contactButtonText}>Me contacter</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  rule: {
    height: 1,
    backgroundColor: colors.gray200,
    marginBottom: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  copyrightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.orange,
    marginRight: spacing.sm,
  },
  copyright: {
    color: colors.gray400,
    fontSize: 12,
  },
  contactGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  credit: {
    color: colors.gray600,
    fontSize: 12,
  },
  creditName: {
    color: colors.orange,
    fontWeight: '600',
  },
  contactButton: {
    borderWidth: 1,
    borderColor: '#F6C9A5',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: 38,
    justifyContent: 'center',
  },
  contactButtonPressed: {
    backgroundColor: '#FFF7F0',
  },
  contactButtonText: {
    color: colors.orange,
    fontSize: 12,
    fontWeight: '600',
  },
});