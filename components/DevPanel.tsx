import { BrandColors } from '@/constants/theme';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/stores/authStore';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// Test users configuration
const TEST_USERS = [
  {
    id: 'amadou',
    icon: '👤',
    name: 'Amadou Traoré',
    role: 'user',
    email: 'amadou@test.zemnet.com',
    phone: '+22670123456',
    balance: 5000,
    color: '#3B82F6', // Blue
  },
  {
    id: 'fatima',
    icon: '🏠',
    name: 'Fatima Ouédraogo',
    role: 'host',
    email: 'fatima@test.zemnet.com',
    phone: '+22670123457',
    balance: 125000,
    color: '#10B981', // Green
  },
  {
    id: 'ibrahim',
    icon: '🔧',
    name: 'Ibrahim Kaboré',
    role: 'technician',
    email: 'ibrahim@test.zemnet.com',
    phone: '+22670123458',
    balance: null,
    color: '#F59E0B', // Orange
  },
  {
    id: 'aicha',
    icon: '👥',
    name: 'Aicha Sawadogo',
    role: 'user',
    email: 'aicha@test.zemnet.com',
    phone: '+22670123459',
    balance: 15000,
    color: '#8B5CF6', // Purple
  },
  {
    id: 'boukary',
    icon: '🏪',
    name: 'Boukary Compaoré',
    role: 'host',
    email: 'boukary@test.zemnet.com',
    phone: '+22670123460',
    balance: 85000,
    color: '#14B8A6', // Teal
  },
];

export function DevPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { profile, signOut } = useAuthStore();

  // Draggable position state
  const pan = React.useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Pan responder for dragging
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  // Only show in development
  if (__DEV__ === false) {
    return null;
  }

  const handleQuickLogin = async (user: typeof TEST_USERS[0]) => {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    try {
      // First, try to sign in with email (dev users use email/password)
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: 'test123456', // Dev password for all test users
      });

      if (authError) {
        // If login fails, the user doesn't exist - create it
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: user.email,
          password: 'test123456',
          options: {
            data: {
              full_name: user.name,
              phone: user.phone,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (!signUpData.user) throw new Error('Failed to create user');

        // Create/update profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          phone: user.phone,
          email: user.email,
          full_name: user.name,
          role: user.role,
          wallet_balance_xof: user.balance || 0,
          language: 'fr',
        });

        if (profileError) {
          console.warn('Profile creation warning:', profileError.message);
        }
      } else {
        // User exists, update their profile to ensure correct role
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from('profiles').upsert({
            id: authUser.id,
            phone: user.phone,
            email: user.email,
            full_name: user.name,
            role: user.role,
            wallet_balance_xof: user.balance || 0,
            language: 'fr',
          });
        }
      }

      // Show success message
      console.log(`✅ Connecté en tant que ${user.name}`);

      // Refresh the auth store session to update profile
      const { refreshSession } = useAuthStore.getState();
      await refreshSession();

      // Small delay to let state update propagate
      await new Promise(resolve => setTimeout(resolve, 300));

      // All users navigate to map view (tabs will show based on role)
      router.replace('/(app)/(user)/map');

      // Collapse panel after successful login
      setIsExpanded(false);
    } catch (error: any) {
      console.error('Dev login error:', error.message);
      alert(`Erreur de connexion: ${error.message}\n\nAssurez-vous que les utilisateurs de test sont créés dans Supabase.`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsExpanded(false);
      router.replace('/(auth)/welcome');
    } catch (error: any) {
      console.error('Logout error:', error.message);
    }
  };

  const formatBalance = (balance: number | null) => {
    if (balance === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR').format(balance) + ' XOF';
  };

  const isCurrentUser = (user: typeof TEST_USERS[0]) => {
    return profile?.phone === user.phone;
  };

  if (!isExpanded) {
    // Collapsed state - just the button (draggable)
    return (
      <Animated.View
        style={[
          styles.collapsedButton,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={styles.collapsedButtonInner}
          onPress={() => setIsExpanded(true)}
          accessibilityLabel="Open Dev Panel"
          accessibilityRole="button"
        >
          <Text style={styles.collapsedIcon}>🔧</Text>
          <Text style={styles.collapsedText}>Dev</Text>
          <Text style={styles.collapsedText}>Panel</Text>
        </Pressable>
      </Animated.View>
    );
  }

  // Expanded state - full panel (also draggable)
  return (
    <Animated.View
      style={[
        styles.expandedPanel,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
          ],
        },
      ]}
    >
      {/* Header - with drag handle */}
      <View {...panResponder.panHandlers} style={[styles.panelHeader, { cursor: 'move' } as any]}>
        <Text style={styles.headerIcon}>🔧</Text>
        <Text style={styles.headerText}>Dev Panel</Text>
        <Pressable
          onPress={() => setIsExpanded(false)}
          accessibilityLabel="Collapse Dev Panel"
          style={styles.collapseButton}
        >
          <Text style={styles.collapseArrow}>▼</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
        {/* Current User Section */}
        {profile && (
          <View style={styles.currentUserSection}>
            <Text style={styles.sectionLabel}>Connected as:</Text>
            <Text style={styles.currentUserName}>{profile.name || 'Unknown'}</Text>
            <Text style={styles.currentUserRole}>
              {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
            </Text>
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
              accessibilityLabel="Logout"
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Quick Login Section */}
        <Text style={styles.sectionLabel}>QUICK LOGIN:</Text>

        {TEST_USERS.map((user) => {
          const isCurrent = isCurrentUser(user);
          return (
            <Pressable
              key={user.id}
              style={[
                styles.userCard,
                isCurrent && styles.userCardActive,
              ]}
              onPress={() => !isCurrent && handleQuickLogin(user)}
              disabled={isCurrent || isLoggingIn}
              accessibilityLabel={`Login as ${user.name}, ${user.role}`}
              accessibilityState={{ disabled: isCurrent || isLoggingIn }}
            >
              <View style={styles.userCardHeader}>
                <Text style={[styles.userIcon, { color: user.color }]}>
                  {user.icon}
                </Text>
                {isCurrent && <Text style={styles.checkmark}>✓</Text>}
              </View>

              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userRole}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Text>
              <Text style={styles.userBalance}>
                {formatBalance(user.balance)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Collapsed button styles
  collapsedButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 9999,
  },
  collapsedButtonInner: {
    backgroundColor: BrandColors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
    alignItems: 'center',
    gap: 4,
  },
  collapsedIcon: {
    fontSize: 24,
  },
  collapsedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },

  // Expanded panel styles
  expandedPanel: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 300,
    height: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 16,
      },
    }),
    zIndex: 10000,
    overflow: 'hidden',
  },

  // Panel header
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    // @ts-ignore
    cursor: 'move', // For web
  },
  headerIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  collapseButton: {
    padding: 4,
  },
  collapseArrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Panel content
  panelContent: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },

  // Current user section
  currentUserSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  currentUserRole: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },

  // User card
  userCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  userCardActive: {
    borderColor: BrandColors.primary,
    backgroundColor: '#EFF6FF',
  },
  userCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userIcon: {
    fontSize: 32,
  },
  checkmark: {
    fontSize: 20,
    color: BrandColors.primary,
    fontWeight: '700',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  userBalance: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
});
