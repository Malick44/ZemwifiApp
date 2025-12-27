
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'

export default async function WalletPage() {
    const supabase = await createClient()

    const { data: transactions, error } = await supabase
        .from('wallet_transactions')
        .select(`
      *,
      profiles:user_id ( name, phone, role )
    `)
        .order('created_at', { ascending: false })
        .limit(50)

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
                <h2 className="text-3xl font-bold tracking-tight">System Wallet Ledger</h2>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Balance After</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions?.map((tx) => (
                            <TableRow key={tx.id}>
                                <TableCell className="whitespace-nowrap">
                                    {new Date(tx.created_at).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{tx.profiles?.name || 'Unknown'}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {tx.profiles?.role?.toUpperCase()} • {tx.profiles?.phone}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{tx.type}</Badge>
                                </TableCell>
                                <TableCell className="max-w-[300px] truncate" title={tx.description}>
                                    {tx.description}
                                </TableCell>
                                <TableCell className={`text-right font-mono font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount > 0 ? '+' : ''}{formatMoney(tx.amount)}
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {formatMoney(tx.balance_after)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
