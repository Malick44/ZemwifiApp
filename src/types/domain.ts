export type Language = 'fr' | 'en'

export type UUID = string

export type Hotspot = {
  id: UUID
  host_id: UUID
  name: string
  landmark: string
  address?: string | null
  location?: any // GeoJSON or similar
  lat?: number
  lng?: number
  is_online: boolean
  sales_paused: boolean
  last_seen_at?: string
  created_at: string

  // Computed or joined
  distance?: number
  range_meters?: number // Optional/Legacy
  active_sessions_count?: number
}

export type Plan = {
  id: UUID
  hotspot_id: UUID
  name: string
  duration_s: number // standard
  duration_seconds: number // legacy alias
  data_cap_bytes: number | null
  price_xof: number
  is_active: boolean
}

export type Voucher = {
  id: UUID
  code?: string // optional distinct code if not token
  jti: string
  user_id: UUID
  hotspot_id: UUID
  plan_id: UUID
  purchase_id: UUID | null
  expires_at: string
  created_at: string
  used_at: string | null
  token: string
}

export type Purchase = {
  id: UUID
  user_id: UUID
  hotspot_id: UUID
  plan_id: UUID
  amount_xof: number
  provider: 'wallet' | 'wave' | 'orange' | 'moov'
  status: 'pending' | 'confirmed' | 'failed' | 'expired' | 'success'
  created_at: string
}

export type CashInRequest = {
  id: UUID
  host_id: UUID
  user_id: UUID | null
  user_phone: string
  amount_xof: number
  status: 'pending' | 'confirmed' | 'denied' | 'expired'
  expires_at: string
  created_at: string
}

export type PlanFormData = {
  name: string
  duration_s: number
  data_cap_bytes: number
  price_xof: number
  is_active: boolean
}

export type PlanTemplate = {
  id: string
  name: string
  description: string
  duration_s: number
  data_cap_bytes: number
  suggested_price_xof: number
}

export type HotspotStats = {
  active_sessions: number
  sales_today: number
  sales_week: number
  total_revenue: number
}
