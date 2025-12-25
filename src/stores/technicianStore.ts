import { create } from 'zustand'

export interface Technician {
    id: string
    name: string
    phone: string
    email?: string
    rating: number
    total_jobs: number
    completed_jobs: number
    is_available: boolean
    service_areas: string[]
    specialties: string[]
    joined_at: string
    avatar_url?: string
}

interface TechnicianState {
    technicians: Technician[]
    currentTechnician: Technician | null
    isAvailable: boolean
    loading: boolean
    error: string | null

    // Actions
    fetchAvailableTechnicians: () => Promise<void>
    fetchTechnicianProfile: (id: string) => Promise<Technician | null>
    updateAvailability: (available: boolean) => Promise<void>
    setCurrentTechnician: (technician: Technician | null) => void
    refresh: () => Promise<void>
}

// Mock data generator
const generateMockTechnicians = (): Technician[] => [
    {
        id: 'tech-1',
        name: 'Moussa Ouedraogo',
        phone: '+226 70 00 00 00',
        email: 'moussa.ouedraogo@zemnet.bf',
        rating: 4.8,
        total_jobs: 156,
        completed_jobs: 152,
        is_available: true,
        service_areas: ['Ouagadougou', 'Secteur 1-15'],
        specialties: ['Installation', 'Réparation', 'Configuration'],
        joined_at: '2024-01-15T00:00:00Z',
    },
    {
        id: 'tech-2',
        name: 'Aminata Traoré',
        phone: '+226 76 00 00 00',
        email: 'aminata.traore@zemnet.bf',
        rating: 4.9,
        total_jobs: 203,
        completed_jobs: 200,
        is_available: true,
        service_areas: ['Bobo-Dioulasso', 'Secteur 1-10'],
        specialties: ['Installation', 'Maintenance', 'Dépannage'],
        joined_at: '2023-11-20T00:00:00Z',
    },
    {
        id: 'tech-3',
        name: 'Ibrahim Sawadogo',
        phone: '+226 78 00 00 00',
        email: 'ibrahim.sawadogo@zemnet.bf',
        rating: 4.7,
        total_jobs: 98,
        completed_jobs: 95,
        is_available: false,
        service_areas: ['Ouagadougou', 'Secteur 16-30'],
        specialties: ['Configuration', 'Optimisation réseau'],
        joined_at: '2024-03-10T00:00:00Z',
    },
]

export const useTechnicianStore = create<TechnicianState>((set, get) => ({
    technicians: [],
    currentTechnician: null,
    isAvailable: true,
    loading: false,
    error: null,

    fetchAvailableTechnicians: async () => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 400))
            const mockTechnicians = generateMockTechnicians()

            // Filter only available technicians
            const available = mockTechnicians.filter(t => t.is_available)

            set({ technicians: available, loading: false })
        } catch (_error) {
            set({ error: 'Failed to fetch technicians', loading: false })
        }
    },

    fetchTechnicianProfile: async (id: string) => {
        set({ loading: true, error: null })
        try {
            await new Promise(resolve => setTimeout(resolve, 300))
            const mockTechnicians = generateMockTechnicians()
            const technician = mockTechnicians.find(t => t.id === id)

            if (technician) {
                set({ loading: false })
                return technician
            }

            set({ loading: false, error: 'Technician not found' })
            return null
        } catch (_error) {
            set({ error: 'Failed to fetch technician profile', loading: false })
            return null
        }
    },

    updateAvailability: async (available: boolean) => {
        set({ loading: true, error: null })
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 300))

            set(state => ({
                isAvailable: available,
                currentTechnician: state.currentTechnician
                    ? { ...state.currentTechnician, is_available: available }
                    : null,
                loading: false
            }))
        } catch (_error) {
            set({ error: 'Failed to update availability', loading: false })
        }
    },

    setCurrentTechnician: (technician: Technician | null) => {
        set({
            currentTechnician: technician,
            isAvailable: technician?.is_available ?? true
        })
    },

    refresh: async () => {
        await get().fetchAvailableTechnicians()
    },
}))
