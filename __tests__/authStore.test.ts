import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../src/stores/authStore';
import { supabase } from '../src/lib/supabase';

// Mock Supabase
jest.mock('../src/lib/supabase');

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      session: null,
      profile: null,
      language: 'fr',
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('signInWithPhone', () => {
    it('should initiate OTP sign-in successfully', async () => {
      const mockResponse = { data: {}, error: null };
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithPhone('+221771234567');
      });

      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
        phone: '+221771234567',
      });
      expect(result.current.error).toBeNull();
    });

    it('should handle sign-in errors', async () => {
      const mockError = { message: 'Invalid phone number' };
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        data: null,
        error: mockError,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signInWithPhone('invalid');
      });

      expect(result.current.error).toBe('Invalid phone number');
    });

    it('should set loading state during sign-in', async () => {
      let resolveSignIn: any;
      const signInPromise = new Promise((resolve) => {
        resolveSignIn = resolve;
      });
      (supabase.auth.signInWithOtp as jest.Mock).mockReturnValue(signInPromise);

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.signInWithPhone('+221771234567');
      });

      // Loading should be true while request is pending
      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveSignIn({ data: {}, error: null });
        await signInPromise;
      });

      // Loading should be false after request completes
      expect(result.current.loading).toBe(false);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP code successfully', async () => {
      const mockSession = {
        user: { id: '123', phone: '+221771234567' },
        access_token: 'token',
      };
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.verifyOtp('+221771234567', '123456');
      });

      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        phone: '+221771234567',
        token: '123456',
        type: 'sms',
      });
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.error).toBeNull();
    });

    it('should handle invalid OTP codes', async () => {
      const mockError = { message: 'Invalid OTP code' };
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.verifyOtp('+221771234567', 'wrong');
      });

      expect(result.current.error).toBe('Invalid OTP code');
      expect(result.current.session).toBeNull();
    });
  });

  describe('signOut', () => {
    it('should clear session and profile on sign out', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Set initial session
      act(() => {
        useAuthStore.setState({
          session: { user: { id: '123' } } as any,
          profile: { id: '123', role: 'user' } as any,
        });
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(result.current.session).toBeNull();
      expect(result.current.profile).toBeNull();
    });
  });

  describe('setLanguage', () => {
    it('should update language preference', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should persist language to profile if user is authenticated', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ data: {}, error: null });
      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
        eq: jest.fn().mockReturnThis(),
      });

      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state
      act(() => {
        useAuthStore.setState({
          session: { user: { id: '123' } } as any,
          profile: { id: '123', role: 'user', language: 'fr' } as any,
        });
      });

      await act(async () => {
        await result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
      expect(result.current.profile?.language).toBe('en');
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: '123', full_name: 'John Doe' },
            error: null,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state
      act(() => {
        useAuthStore.setState({
          session: { user: { id: '123' } } as any,
          profile: { id: '123', role: 'user' } as any,
        });
      });

      await act(async () => {
        await result.current.updateProfile({ full_name: 'John Doe' });
      });

      expect(mockUpdate).toHaveBeenCalledWith({ full_name: 'John Doe' });
      expect(result.current.profile?.full_name).toBe('John Doe');
    });

    it('should handle update errors', async () => {
      const mockError = { message: 'Update failed' };
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: mockError,
          }),
        }),
      });
      (supabase.from as jest.Mock).mockReturnValue({
        update: mockUpdate,
      });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({
          session: { user: { id: '123' } } as any,
          profile: { id: '123', role: 'user' } as any,
        });
      });

      await act(async () => {
        await result.current.updateProfile({ full_name: 'John Doe' });
      });

      expect(result.current.error).toBe('Update failed');
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        useAuthStore.setState({ error: 'Some error' });
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
