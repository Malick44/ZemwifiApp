
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { MoreHorizontal } from 'lucide-react'
import Link from 'next/link'

export default async function PayoutsPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const params = await searchParams
    const statusFilter = params.status || 'pending'
    const supabase = await createClient()

    // Build Query
    let query = supabase
        .from('payouts')
        .select(`
      *,
      profiles:host_id ( name, phone )
    `)
        .order('created_at', { ascending: false })

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    const { data: payouts, error } = await query

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-XOF', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(amount)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Payout Requests</h2>
                <div className="flex gap-2">
                    <Button variant={statusFilter === 'pending' ? 'secondary' : 'ghost'} asChild>
                        <Link href="/payouts?status=pending">Pending</Link>
                    </Button>
                    <Button variant={statusFilter === 'processing' ? 'secondary' : 'ghost'} asChild>
                        <Link href="/payouts?status=processing">Processing</Link>
                    </Button>
                    <Button variant={statusFilter === 'completed' ? 'secondary' : 'ghost'} asChild>
                        <Link href="/payouts?status=completed">Completed</Link>
                    </Button>
                    <Button variant={statusFilter === 'all' ? 'secondary' : 'ghost'} asChild>
                        <Link href="/payouts?status=all">All</Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Host</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payouts?.map((payout) => (
                            <TableRow key={payout.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{new Date(payout.created_at).toLocaleDateString()}</span>
                                        <span className="text-xs text-muted-foreground">{new Date(payout.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{payout.profiles?.name}</span>
                                        <span className="text-xs text-muted-foreground">{payout.profiles?.phone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-bold">
                                    {formatMoney(payout.amount)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="uppercase text-xs font-semibold">{payout.provider}</span>
                                        <span className="text-xs text-muted-foreground">{payout.destination_number}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        payout.status === 'completed' ? 'default' : // Greenish distinct from default? using default for now
                                            payout.status === 'failed' ? 'destructive' :
                                                payout.status === 'processing' ? 'secondary' : 'outline'
                                    } className={
                                        payout.status === 'completed' ? 'bg-green-600 hover:bg-green-700' :
                                            payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100' : ''
                                    }>
                                        {payout.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Actions</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            {/* We'll implement a simple dialog or detail page later, for now just placeholder actions */}
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            {payout.status === 'pending' && (
                                                <DropdownMenuItem>Mark Processing</DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {payouts?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No payouts found with status: <strong>{statusFilter}</strong>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
