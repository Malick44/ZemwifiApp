import { act, renderHook } from '@testing-library/react-native';
import { supabase } from '../src/lib/supabase';
import { useDiscoveryStore } from '../src/stores/discoveryStore';
import type { Hotspot } from '../src/types/domain';

// Mock Supabase
jest.mock('../src/lib/supabase');

const mockHotspots: Hotspot[] = [
  {
    id: '1',
    name: 'Café WiFi',
    description: 'Fast internet at the café',
    latitude: 14.7167,
    longitude: -17.4677,
    signal_strength: 'excellent',
    available_plans: ['1', '2'],
    is_active: true,
    host_id: 'host1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Restaurant Network',
    description: 'WiFi for customers',
    latitude: 14.7200,
    longitude: -17.4700,
    signal_strength: 'good',
    available_plans: ['1'],
    is_active: true,
    host_id: 'host2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Library Access',
    description: 'Study with fast internet',
    latitude: 14.7500,
    longitude: -17.5000,
    signal_strength: 'excellent',
    available_plans: ['2', '3'],
    is_active: true,
    host_id: 'host3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('discoveryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useDiscoveryStore.setState({
      hotspots: [],
      userLocation: null,
      searchQuery: '',
      selectedFilters: {
        signalStrength: [],
        priceRange: null,
      },
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('loadHotspots', () => {
    it('should load hotspots successfully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: mockHotspots,
          error: null,
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: mockSelect,
      });

      const { result } = renderHook(() => useDiscoveryStore());

      await act(async () => {
        await result.current.loadHotspots();
      });

      expect(supabase.from).toHaveBeenCalledWith('hotspots');
      expect(result.current.hotspots).toHaveLength(3);
      expect(result.current.error).toBeNull();
    });

    it('should handle load errors', async () => {
      const mockError = { message: 'Failed to load hotspots' };
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });

      const { result } = renderHook(() => useDiscoveryStore());

      await act(async () => {
        await result.current.loadHotspots();
      });

      expect(result.current.error).toBe('Failed to load hotspots');
      expect(result.current.hotspots).toHaveLength(0);
    });

    it('should set loading state during fetch', async () => {
      let resolveLoad: any;
      const loadPromise = new Promise((resolve) => {
        resolveLoad = resolve;
      });
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue(loadPromise),
        }),
      });

      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.loadHotspots();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveLoad({ data: mockHotspots, error: null });
        await loadPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance using Haversine formula', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      // Distance from Paris to London (approx 344 km)
      const distance = result.current.calculateDistance(
        48.8566, // Paris lat
        2.3522,  // Paris lon
        51.5074, // London lat
        -0.1278  // London lon
      );

      // Should be approximately 344 km
      expect(distance).toBeGreaterThan(340);
      expect(distance).toBeLessThan(350);
    });

    it('should return 0 for same location', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const distance = result.current.calculateDistance(
        14.7167,
        -17.4677,
        14.7167,
        -17.4677
      );

      expect(distance).toBe(0);
    });
  });

  describe('setUserLocation', () => {
    it('should update user location', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setUserLocation(14.7167, -17.4677);
      });

      expect(result.current.userLocation).toEqual({
        latitude: 14.7167,
        longitude: -17.4677,
      });
    });
  });

  describe('getNearbyHotspots', () => {
    beforeEach(() => {
      act(() => {
        useDiscoveryStore.setState({
          hotspots: mockHotspots,
          userLocation: { latitude: 14.7167, longitude: -17.4677 },
        });
      });
    });

    it('should return hotspots within specified distance', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      // Get hotspots within 5km
      const nearby = result.current.getNearbyHotspots(5);

      // First two hotspots should be within 5km
      expect(nearby).toHaveLength(2);
      expect(nearby[0].id).toBe('1');
      expect(nearby[1].id).toBe('2');
    });

    it('should sort by distance ascending', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const nearby = result.current.getNearbyHotspots(100);

      // All hotspots within 100km, sorted by distance
      expect(nearby).toHaveLength(3);
      // Distances should be in ascending order
      for (let i = 0; i < nearby.length - 1; i++) {
        expect(nearby[i].distance).toBeLessThanOrEqual(nearby[i + 1].distance!);
      }
    });

    it('should return empty array if no user location', () => {
      act(() => {
        useDiscoveryStore.setState({ userLocation: null });
      });

      const { result } = renderHook(() => useDiscoveryStore());

      const nearby = result.current.getNearbyHotspots(5);

      expect(nearby).toHaveLength(0);
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

    it('should search in name and description', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setSearchQuery('customers');
      });

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Restaurant Network');
    });

    it('should filter by signal strength', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        useDiscoveryStore.setState({
          selectedFilters: {
            signalStrength: ['excellent'],
            priceRange: null,
          },
        });
      });

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(2);
      expect(filtered.every(h => h.signal_strength === 'excellent')).toBe(true);
    });

    it('should combine search query and filters', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setSearchQuery('wifi');
        useDiscoveryStore.setState({
          selectedFilters: {
            signalStrength: ['excellent'],
            priceRange: null,
          },
        });
      });

      const filtered = result.current.getFilteredHotspots();

      // Should match "Café WiFi" only (has "wifi" and "excellent" signal)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('Café WiFi');
    });

    it('should return all hotspots when no filters applied', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      const filtered = result.current.getFilteredHotspots();

      expect(filtered).toHaveLength(3);
    });
  });

  describe('setFilters', () => {
    it('should update signal strength filter', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setFilters({
          signalStrength: ['excellent', 'good'],
          priceRange: null,
        });
      });

      expect(result.current.selectedFilters.signalStrength).toEqual(['excellent', 'good']);
    });

    it('should update price range filter', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        result.current.setFilters({
          signalStrength: [],
          priceRange: { min: 0, max: 1000 },
        });
      });

      expect(result.current.selectedFilters.priceRange).toEqual({ min: 0, max: 1000 });
    });
  });

  describe('clearFilters', () => {
    it('should reset all filters to default state', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      // Set some filters
      act(() => {
        result.current.setSearchQuery('test');
        result.current.setFilters({
          signalStrength: ['excellent'],
          priceRange: { min: 0, max: 1000 },
        });
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedFilters).toEqual({
        signalStrength: [],
        priceRange: null,
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useDiscoveryStore());

      act(() => {
        useDiscoveryStore.setState({ error: 'Some error' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
