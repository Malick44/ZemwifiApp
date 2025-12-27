
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { MoreHorizontal, Search } from 'lucide-react'
import Link from 'next/link'

export default async function HostsPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const params = await searchParams
    const query = params.q || ''
    const supabase = await createClient()

    // TODO: Add status filter and pagination
    let queryBuilder = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'host')
        .order('created_at', { ascending: false })

    if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
    }

    const { data: hosts, error } = await queryBuilder

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Hosts</h2>
                <div className="flex items-center gap-2">
                    {/* Add Host Button typically not needed as they sign up app-side */}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search hosts..."
                        className="pl-8"
                    // Client-side navigation for search would be ideal, static for now
                    />
                </div>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Host</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>KYC</TableHead>
                            <TableHead>Wallet</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {hosts?.map((host) => (
                            <TableRow key={host.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={host.profile_photo_url} />
                                        <AvatarFallback>{host.name?.substring(0, 2).toUpperCase() || 'HO'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{host.name || 'Unknown'}</span>
                                        <span className="text-xs text-muted-foreground text-ellipsis truncate max-w-[150px]">
                                            {host.id}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{host.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={host.is_active ? 'default' : 'destructive'}>
                                        {host.is_active ? 'Active' : 'Frozen'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        host.kyc_status === 'approved' ? 'default' :
                                            host.kyc_status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                        {host.kyc_status?.toUpperCase() || 'PENDING'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{host.wallet_balance} FCFA</TableCell>
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
                                            <DropdownMenuItem asChild>
                                                <Link href={`/hosts/${host.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>View Hotspots</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {hosts?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No hosts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
