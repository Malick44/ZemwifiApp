import { COUNTRIES, Country, DEFAULT_COUNTRY_CODE, getCountryByCode } from '@/constants/countries'
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useMemo, useState } from 'react'
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Typography } from './Typography'

interface CountryPickerProps {
  /** Currently selected country ISO code */
  selectedCode?: string
  /** Called when a country is selected */
  onSelect: (country: Country) => void
}

/**
 * A pressable button that opens a full-screen modal for country selection.
 * Shows flag + dial code inline, and a searchable list when tapped.
 */
export function CountryPicker({ selectedCode = DEFAULT_COUNTRY_CODE, onSelect }: CountryPickerProps) {
  const [visible, setVisible] = useState(false)
  const [search, setSearch] = useState('')
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  const selected = useMemo(() => getCountryByCode(selectedCode) ?? COUNTRIES[0], [selectedCode])

  const filtered = useMemo(() => {
    if (!search.trim()) return COUNTRIES
    const q = search.toLowerCase()
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    )
  }, [search])

  const handleSelect = useCallback(
    (country: Country) => {
      onSelect(country)
      setVisible(false)
      setSearch('')
    },
    [onSelect]
  )

  const renderItem = useCallback(
    ({ item }: { item: Country }) => {
      const isSelected = item.code === selectedCode
      return (
        <Pressable
          style={[
            styles.row,
            {
              backgroundColor: isSelected ? colors.backgroundTertiary : 'transparent',
            },
          ]}
          onPress={() => handleSelect(item)}
        >
          <Typography variant="body" style={styles.flag}>
            {item.flag}
          </Typography>
          <View style={styles.rowText}>
            <Typography variant="body" weight={isSelected ? 'semibold' : 'regular'}>
              {item.name}
            </Typography>
            <Typography variant="bodySmall" color="secondary">
              {item.dialCode}
            </Typography>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          )}
        </Pressable>
      )
    },
    [selectedCode, colors, handleSelect]
  )

  return (
    <>
      {/* Inline trigger button */}
      <Pressable
        style={[styles.trigger, { borderColor: colors.border }]}
        onPress={() => setVisible(true)}
        hitSlop={4}
      >
        <Typography variant="body" style={styles.triggerFlag}>
          {selected.flag}
        </Typography>
        <Typography variant="body" color="secondary">
          {selected.dialCode}
        </Typography>
        <Ionicons name="chevron-down" size={14} color={colors.textTertiary} style={{ marginLeft: 2 }} />
      </Pressable>

      {/* Full-screen modal */}
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Typography variant="h3" weight="semibold">
              Choisir un pays
            </Typography>
            <Pressable onPress={() => { setVisible(false); setSearch('') }} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un pays..."
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Country List */}
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.code}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={() => (
              <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Typography variant="body" color="secondary">
                  Aucun pays trouvé
                </Typography>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  // --- Inline trigger ---
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
    gap: 4,
  },
  triggerFlag: {
    fontSize: 20,
  },

  // --- Modal ---
  modal: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },

  // --- Search ---
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    padding: 0,
  },

  // --- List rows ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  flag: {
    fontSize: 24,
    width: 32,
    textAlign: 'center',
  },
  rowText: {
    flex: 1,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 64,
  },
  empty: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
})
