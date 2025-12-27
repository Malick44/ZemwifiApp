
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function KYCQueuePage() {
    const supabase = await createClient()

    // Fetch pending KYC submissions
    const { data: submissions, error } = await supabase
        .from('kyc_submissions')
        .select(`
      id,
      submitted_at,
      full_name,
      business_name,
      status,
      user_id,
      profiles:user_id ( phone )
    `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">KYC Review Queue</h2>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Submitted</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Business</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions?.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {new Date(item.submitted_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-medium">{item.full_name}</TableCell>
                                <TableCell>{item.business_name || '-'}</TableCell>
                                <TableCell>{item.profiles?.phone || 'Unknown'}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                        {item.status.toUpperCase()}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button asChild size="sm" variant="default">
                                        <Link href={`/hosts/kyc/${item.id}`}>Review</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {submissions?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No pending submissions. Good job!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
