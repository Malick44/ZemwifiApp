export type Language = 'fr' | 'en'

export type UUID = string

export type Hotspot = {
  id: UUID
  host_id: UUID
  name: string
  landmark: string
  address: string | null
  lat: number
  lng: number
  ssid: string
  is_online: boolean
  status?: 'online' | 'offline'
  sales_paused: boolean
  hours: string | null
  distance?: number
  range_meters: number
}

export type Plan = {
  id: UUID
  hotspot_id: UUID
  name: string
  duration_seconds: number
  data_bytes: number
  price_xof: number
  is_active: boolean
}

export type Voucher = {
  id: UUID
  code: string
  user_id: UUID
  hotspot_id: UUID
  plan_id: UUID
  purchase_id: UUID | null
  expires_at: string
  created_at: string
  used_at: string | null
  device_mac: string | null
}

export type Purchase = {
  id: UUID
  user_id: UUID
  hotspot_id: UUID
  plan_id: UUID
  voucher_id: UUID | null
  amount: number
  payment_provider: 'wave' | 'orange' | 'moov' | 'wallet'
  payment_status: 'pending' | 'success' | 'failed' | 'expired'
  payment_reference: string | null
  created_at: string
  updated_at: string
}

export type CashInRequest = {
  id: UUID
  host_id: UUID
  user_id: UUID
  user_phone: string
  amount: number
  commission: number
  status: 'pending' | 'confirmed' | 'expired' | 'rejected'
  qr_code: string | null
  expires_at: string
  created_at: string
  confirmed_at: string | null
  rejected_at: string | null
  rejection_reason: string | null
}

export type PlanFormData = {
  name: string
  duration_seconds: number
  data_bytes: number
  price_xof: number
  is_active: boolean
}

export type PlanTemplate = {
  id: string
  name: string
  description: string
  duration_seconds: number
  data_bytes: number
  suggested_price_xof: number
}

export type HotspotStats = {
  active_sessions: number
  sales_today: number
  sales_week: number
  total_revenue: number
}
