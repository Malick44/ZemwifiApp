import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { PlatformStats } from '@/types/admin'
import {
    AlertCircle,
    CreditCard,
    Users,
    Wifi
} from 'lucide-react'

export default async function OverviewPage() {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_platform_stats')

    if (error) {
        console.error('Error fetching stats:', error)
        // Handle error gracefully or throw
    }

    // RPC returns an array of 1 row usually, or the object directly depending on calling signature
    // For RETURNS TABLE, it returns array of objects.
    const stats: PlatformStats = data?.[0] || {
        total_users: 0,
        active_users_today: 0,
        total_hosts: 0,
        total_hotspots: 0,
        active_hotspots: 0,
        pending_kyc: 0,
        pending_payouts: 0,
        total_revenue_today: 0,
        total_purchases_today: 0
    }

    // Format currency
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-XOF', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue (Today)</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatMoney(stats.total_revenue_today)}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total_purchases_today} purchases today
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Hotspots</CardTitle>
                        <Wifi className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_hotspots} <span className="text-muted-foreground text-sm font-normal">/ {stats.total_hotspots}</span></div>
                        <p className="text-xs text-muted-foreground">
                            Online right now
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users (Today)</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.active_users_today}</div>
                        <p className="text-xs text-muted-foreground">
                            Total registered: {stats.total_users}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pending_kyc + stats.pending_payouts}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.pending_kyc} KYC, {stats.pending_payouts} Payouts
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
