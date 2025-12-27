
'use client'

import { cn } from '@/lib/utils'
import {
    CreditCard,
    FileText,
    LayoutDashboard,
    Settings,
    ShieldCheck,
    Users,
    Wallet,
    Wifi
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
    { name: 'Overview', href: '/overview', icon: LayoutDashboard },
    { name: 'Hosts', href: '/hosts', icon: Users },
    { name: 'Hotspots', href: '/hotspots', icon: Wifi },
    { name: 'Purchases', href: '/purchases', icon: CreditCard },
    { name: 'Wallet', href: '/wallet', icon: Wallet },
    { name: 'Payouts', href: '/payouts', icon: FileText },
    { name: 'Config', href: '/config', icon: Settings },
    { name: 'Audit Logs', href: '/audit-logs', icon: ShieldCheck },
]

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname()

    return (
        <div className={cn("pb-12 w-64 border-r bg-background", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        ZemNet Admin
                    </h2>
                    <div className="space-y-1">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    pathname?.startsWith(item.href) ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
