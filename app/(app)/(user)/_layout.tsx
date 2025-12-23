import { Tabs } from 'expo-router'
import { t } from '../../../src/lib/i18n'

export default function UserTabs() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="map" options={{ title: t('map_tab') }} />
      <Tabs.Screen name="list" options={{ title: t('list_tab') }} />
      <Tabs.Screen name="wallet/index" options={{ title: t('wallet_tab') }} />
      <Tabs.Screen name="history" options={{ title: 'Historique' }} />
      <Tabs.Screen name="connect-help" options={{ title: 'Aide' }} />
    </Tabs>
  )
}
