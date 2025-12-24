import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { BrandColors, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function DevPanelScreen() {
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const checkDatabaseStats = async () => {
    setLoading(true);
    try {
      const [
        { count: usersCount },
        { count: hotspotsCount },
        { count: plansCount },
        { count: vouchersCount },
        { count: purchasesCount },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('hotspots').select('*', { count: 'exact', head: true }),
        supabase.from('plans').select('*', { count: 'exact', head: true }),
        supabase.from('vouchers').select('*', { count: 'exact', head: true }),
        supabase.from('purchases').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        users: usersCount || 0,
        hotspots: hotspotsCount || 0,
        plans: plansCount || 0,
        vouchers: vouchersCount || 0,
        purchases: purchasesCount || 0,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const seedDatabase = async () => {
    Alert.alert(
      'Seed Database',
      'This will populate the database with test data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed',
          onPress: async () => {
            setLoading(true);
            try {
              // Note: This requires running the SQL file via Supabase Dashboard
              Alert.alert(
                'Manual Seeding Required',
                'Please run the SQL file via Supabase Dashboard:\n\n' +
                '1. Go to SQL Editor\n' +
                '2. Run: Prompt-repo/supabase/migrations/004_seed_data.sql\n\n' +
                'Or use the "Quick Test Users" button below for instant test data.'
              );
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  const createQuickTestUsers = async () => {
    setLoading(true);
    try {
      // Create test hotspots directly
      const testHotspots = [
        {
          id: '10000000-0000-0000-0000-000000000001',
          name: 'Café du Centre (Test)',
          landmark: 'Près du marché central',
          lat: 12.3714277,
          lng: -1.5196603,
          ssid: 'ZemNet-Test-Cafe',
          is_online: true,
          sales_paused: false,
        },
        {
          id: '10000000-0000-0000-0000-000000000002',
          name: 'Restaurant Test',
          landmark: 'Zone 1',
          lat: 12.3678,
          lng: -1.5272,
          ssid: 'ZemNet-Test-Restaurant',
          is_online: true,
          sales_paused: false,
        },
      ];

      for (const hotspot of testHotspots) {
        await supabase.from('hotspots').upsert(hotspot);
      }

      // Create test plans
      const testPlans = [
        {
          hotspot_id: '10000000-0000-0000-0000-000000000001',
          name: '30 minutes',
          duration_seconds: 1800,
          data_bytes: 52428800,
          price_xof: 100,
          is_active: true,
        },
        {
          hotspot_id: '10000000-0000-0000-0000-000000000001',
          name: '1 heure',
          duration_seconds: 3600,
          data_bytes: 104857600,
          price_xof: 150,
          is_active: true,
        },
        {
          hotspot_id: '10000000-0000-0000-0000-000000000002',
          name: '2 heures',
          duration_seconds: 7200,
          data_bytes: 209715200,
          price_xof: 250,
          is_active: true,
        },
      ];

      for (const plan of testPlans) {
        await supabase.from('plans').insert(plan);
      }

      setSeeded(true);
      Alert.alert('Success', 'Test data created! You can now browse hotspots.');
      await checkDatabaseStats();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const clearTestData = async () => {
    Alert.alert(
      'Clear Test Data',
      'This will delete all test data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Delete in reverse order of dependencies
              await supabase.from('plans').delete().like('hotspot_id', '10000000-%');
              await supabase.from('hotspots').delete().like('id', '10000000-%');
              
              setSeeded(false);
              Alert.alert('Success', 'Test data cleared');
              await checkDatabaseStats();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
            setLoading(false);
          },
        },
      ]
    );
  };

  React.useEffect(() => {
    checkDatabaseStats();
  }, []);

  const quickActions = [
    {
      title: 'Browse Hotspots',
      description: 'View test hotspots on map',
      icon: 'map' as const,
      onPress: () => router.push('/(app)/(user)/map'),
      color: BrandColors.primary,
    },
    {
      title: 'My Wallet',
      description: 'View vouchers and balance',
      icon: 'wallet' as const,
      onPress: () => router.push('/(app)/(user)/wallet'),
      color: BrandColors.success,
    },
    {
      title: 'Host Dashboard',
      description: 'Manage hotspots (host view)',
      icon: 'business' as const,
      onPress: () => router.push('/(app)/(host)/dashboard'),
      color: BrandColors.secondary,
    },
    {
      title: 'Settings',
      description: 'App settings',
      icon: 'settings' as const,
      onPress: () => router.push('/(app)/(shared)/settings'),
      color: colors.icon,
    },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h1">🛠️ Dev Panel</Typography>
          <Typography variant="body" color="secondary">
            Development & Testing Tools
          </Typography>
        </View>

        {/* Database Stats */}
        <Card variant="elevated" style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3">Database Stats</Typography>
            <Button
              variant="ghost"
              size="sm"
              onPress={checkDatabaseStats}
              loading={loading}
            >
              Refresh
            </Button>
          </View>

          {stats && (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Typography variant="h2" style={{ color: BrandColors.primary }}>
                  {stats.users}
                </Typography>
                <Typography variant="bodySmall" color="secondary">
                  Users
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography variant="h2" style={{ color: BrandColors.success }}>
                  {stats.hotspots}
                </Typography>
                <Typography variant="bodySmall" color="secondary">
                  Hotspots
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography variant="h2" style={{ color: BrandColors.warning }}>
                  {stats.plans}
                </Typography>
                <Typography variant="bodySmall" color="secondary">
                  Plans
                </Typography>
              </View>
              <View style={styles.statItem}>
                <Typography variant="h2" style={{ color: BrandColors.info }}>
                  {stats.vouchers}
                </Typography>
                <Typography variant="bodySmall" color="secondary">
                  Vouchers
                </Typography>
              </View>
            </View>
          )}
        </Card>

        {/* Seeding Actions */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Database Seeding
          </Typography>

          <View style={styles.actionButtons}>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onPress={createQuickTestUsers}
              loading={loading}
              icon={<Ionicons name="flash" size={20} color="#fff" />}
            >
              Quick Test Data
            </Button>

            <Button
              variant="outline"
              size="md"
              fullWidth
              onPress={seedDatabase}
              loading={loading}
              icon={<Ionicons name="albums" size={20} color={colors.text} />}
            >
              Full Seed (Manual)
            </Button>

            {seeded && (
              <Button
                variant="outline"
                size="md"
                fullWidth
                onPress={clearTestData}
                loading={loading}
                icon={<Ionicons name="trash" size={20} color={colors.error} />}
              >
                Clear Test Data
              </Button>
            )}
          </View>

          <Typography variant="caption" color="secondary" style={styles.note}>
            💡 Quick Test Data creates instant hotspots and plans for testing.
            Full Seed requires running SQL via Supabase Dashboard.
          </Typography>
        </Card>

        {/* Quick Navigation */}
        <Card variant="elevated" style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Quick Actions
          </Typography>

          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <Card
                key={index}
                variant="outlined"
                onPress={action.onPress}
                style={styles.quickActionCard}
              >
                <View style={styles.quickActionContent}>
                  <View
                    style={[
                      styles.quickActionIcon,
                      { backgroundColor: `${action.color}15` },
                    ]}
                  >
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <View style={styles.quickActionText}>
                    <Typography variant="body" weight="semibold">
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                      {action.description}
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                </View>
              </Card>
            ))}
          </View>
        </Card>

        {/* Test Credentials */}
        <Card variant="filled" style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Test Credentials
          </Typography>

          <View style={styles.credentials}>
            <View style={styles.credentialItem}>
              <Badge label="Regular User" variant="info" />
              <Typography variant="bodySmall" style={styles.credentialPhone}>
                +226 70 12 34 56
              </Typography>
            </View>
            <View style={styles.credentialItem}>
              <Badge label="Host" variant="success" />
              <Typography variant="bodySmall" style={styles.credentialPhone}>
                +226 70 23 45 67
              </Typography>
            </View>
            <View style={styles.credentialItem}>
              <Badge label="Technician" variant="warning" />
              <Typography variant="bodySmall" style={styles.credentialPhone}>
                +226 70 34 56 78
              </Typography>
            </View>
          </View>

          <Typography variant="caption" color="secondary" style={styles.note}>
            OTP: Use any 6-digit code (123456) for testing
          </Typography>
        </Card>

        {/* Database Info */}
        <Card variant="outlined" style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Environment Info
          </Typography>

          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Typography variant="bodySmall" color="secondary">
                Supabase URL:
              </Typography>
              <Typography variant="caption" numberOfLines={1}>
                {process.env.EXPO_PUBLIC_SUPABASE_URL?.substring(0, 40)}...
              </Typography>
            </View>
            <View style={styles.infoItem}>
              <Typography variant="bodySmall" color="secondary">
                Project ID:
              </Typography>
              <Typography variant="caption">gcqgmcnxqhktxoaesefo</Typography>
            </View>
            <View style={styles.infoItem}>
              <Typography variant="bodySmall" color="secondary">
                Auth Status:
              </Typography>
              <Badge label="Connected" variant="success" size="sm" />
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  actionButtons: {
    gap: Spacing.sm,
  },
  note: {
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  quickActions: {
    gap: Spacing.sm,
  },
  quickActionCard: {
    padding: 0,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quickActionText: {
    flex: 1,
  },
  credentials: {
    gap: Spacing.sm,
  },
  credentialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  credentialPhone: {
    fontFamily: 'monospace',
  },
  infoList: {
    gap: Spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
