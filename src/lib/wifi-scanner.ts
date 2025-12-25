import { PermissionsAndroid, Platform } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

export type ScannedNetwork = {
    ssid: string;
    bssid: string;
    level: number; // RSSI
    frequency?: number;
    capabilities?: string;
    timestamp?: number;
};

const REQUEST_FINE_LOCATION_PERMISSION = async () => {
    if (Platform.OS === 'android') {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission is required for WiFi connections',
                    message:
                        'This app needs location permission as this is required  ' +
                        'to scan for wifi networks.',
                    buttonNegative: 'DENY',
                    buttonPositive: 'ALLOW',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    }
    return true; // iOS doesn't need this runtime permission in the same way, but has entitlement checks
};

export const scanNetworks = async (): Promise<ScannedNetwork[]> => {
    if (Platform.OS === 'android') {
        const hasPermission = await REQUEST_FINE_LOCATION_PERMISSION();
        if (!hasPermission) {
            throw new Error('Location permission denied');
        }

        try {
            const wifis = await WifiManager.reScanAndLoadWifiList();
            return wifis.map((wifi) => ({
                ssid: wifi.SSID,
                bssid: wifi.BSSID,
                level: wifi.level,
                frequency: wifi.frequency,
                capabilities: wifi.capabilities,
                timestamp: wifi.timestamp,
            }));
        } catch (error) {
            console.error('WiFi Scan rejected', error);
            // Fallback or re-throw
            return [];
        }
    } else {
        // iOS: Cannot scan list. Can only get current info.
        try {
            const ssid = await WifiManager.getCurrentWifiSSID();
            // We can't get BSSID or Level easily without specific entitlements or helper.
            // Returning a dummy single entry if connected, or empty.
            if (ssid && ssid !== '0.0.0.0') {
                return [{
                    ssid: ssid,
                    bssid: '00:00:00:00:00:00',
                    level: 0,
                }];
            }
            return [];
        } catch (e) {
            console.log('iOS WiFi Fetch Error:', e);
            return [];
        }
    }
};
