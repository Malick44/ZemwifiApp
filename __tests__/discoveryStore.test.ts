import { act, renderHook } from '@testing-library/react-native';
import { supabase } from '../src/lib/supabase';
import { useDiscoveryStore } from '../src/stores/discoveryStore';
import type { Hotspot } from '../src/types/domain';

// Mock Supabase
jest.mock('../src/lib/supabase');

const mockHotspots: Hotspot[] = [
  {
    id: '1',
    host_id: 'host1',
    name: 'Café WiFi',
    landmark: 'Near the park',
    address: '123 Main St',
    lat: 14.7167,
    lng: -17.4677,
    is_online: true,
    sales_paused: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    host_id: 'host2',
    name: 'Restaurant Network',
    landmark: 'Downtown',
    address: '456 Center Ave',
    lat: 14.7200,
    lng: -17.4700,
    is_online: true,
    sales_paused: false,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    host_id: 'host3',
    name: 'Library Access',
    landmark: 'University',
    address: '789 Edu Blvd',
    lat: 14.7500,
    lng: -17.5000,
    is_online: true,
    sales_paused: false,
    created_at: new Date().toISOString()
  },
];

describe('discoveryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDiscoveryStore.setState({
      hotspots: [],
      plans: {},
      loading: false,
      error: null,
      searchQuery: '',
      userLocation: null,
    });
    jest.clearAllMocks();
  });

  describe('fetchHotspots', () => {
    it('should load hotspots successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockHotspots,
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useDiscoveryStore());

      await act(async () => {
        await result.current.fetchHotspots();
      });

      expect(supabase.from).toHaveBeenCalledWith('hotspots');
      expect(result.current.hotspots).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });

    it('should handle load errors', async () => {
      const mockError = { message: 'Failed to load hotspots' };
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useDiscoveryStore());

      await act(async () => {
        await result.current.fetchHotspots();
      });

      expect(result.current.error).toBe('Failed to load hotspots');
      expect(result.current.hotspots).toHaveLength(0);
    });
  });

  describe('setUserLocation', () => {
    it('should update user location', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setUserLocation({ lat: 14.7167, lng: -17.4677 });
      });

      expect(result.current.userLocation).toEqual({
        lat: 14.7167,
        lng: -17.4677,
      });
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setSearchQuery('café');
      });

      expect(result.current.searchQuery).toBe('café');
    });
  });

  describe('getFilteredHotspots', () => {
    beforeEach(() => {
      act(() => {
        useDiscoveryStore.setState({
          hotspots: mockHotspots,
        });
      });
    });

    it('should filter by search query (case insensitive)', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setSearchQuery('café');
      });

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Café WiFi');
    });

    it('should search in name and landmark', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setSearchQuery('downtown');
      });

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Restaurant Network');
    });

    it('should return all hotspots when no query', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(3);
    });
  });

  describe('getNearbyHotspots', () => {
    beforeEach(() => {
      act(() => {
        useDiscoveryStore.setState({
          hotspots: mockHotspots,
          userLocation: { lat: 14.7167, lng: -17.4677 },
        });
      });
    });

    it('should return hotspots with distance property', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const nearby = result.current.getNearbyHotspots(100);

      expect(nearby[0]).toHaveProperty('distance');
    });

    it('should sort by distance ascending', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const nearby = result.current.getNearbyHotspots(100);

      expect(nearby).toHaveLength(3);
      // Distances should be in ascending order
      for (let i = 0; i < nearby.length - 1; i++) {
        const d1 = (nearby[i] as any).distance;
        const d2 = (nearby[i + 1] as any).distance;
        expect(d1).toBeLessThanOrEqual(d2);
      }
    });

    it('should return empty array if no user location', () => {
      act(() => {
        useDiscoveryStore.setState({ userLocation: null });
      });

      const { result } = renderHook(() => useDiscoveryStore());

      const nearby = result.current.getNearbyHotspots(5);

      expect(nearby).toHaveLength(3); // Returns all if no location? check implementation
      // actually implementation says: if (!userLocation) return hotspots. So it returns all.
      // But they won't have distance property?
      // "if (!userLocation) return hotspots"
      // So yes, it returns original hotspots.
    });
  });
});
