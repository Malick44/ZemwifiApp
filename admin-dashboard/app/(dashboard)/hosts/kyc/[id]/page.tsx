
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, Check, ExternalLink, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export default async function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch KYC submission
    const { data: kyc, error } = await supabase
        .from('kyc_submissions')
        .select(`
      *,
      profiles:user_id ( phone, wallet_balance )
    `)
        .eq('id', id)
        .single()

    if (error || !kyc) {
        notFound()
    }

    // Server Actions for Approve/Reject
    async function approveKYC() {
        'use server'
        const supabase = await createClient()

        // Call RPC to approve
        const { error } = await supabase.rpc('admin_approve_kyc', {
            p_submission_id: id,
            p_admin_id: (await supabase.auth.getUser()).data.user?.id
        })

        if (error) throw error
        redirect('/hosts/kyc')
    }

    async function rejectKYC(formData: FormData) {
        'use server'
        const reason = formData.get('reason') as string
        const supabase = await createClient()

        // Call RPC to reject
        const { error } = await supabase.rpc('admin_reject_kyc', {
            p_submission_id: id,
            p_admin_id: (await supabase.auth.getUser()).data.user?.id,
            p_reason: reason
        })

        if (error) throw error
        redirect('/hosts/kyc')
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/hosts/kyc"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{kyc.business_name || kyc.full_name}</h2>
                    <p className="text-muted-foreground text-sm">Submitted on {new Date(kyc.submitted_at).toLocaleString()}</p>
                </div>
                <div className="ml-auto">
                    <Badge variant="outline" className="text-lg px-4 py-1">
                        {kyc.status.toUpperCase()}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Applicant Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="text-muted-foreground">Full Name:</span>
                            <span className="font-medium">{kyc.full_name}</span>

                            <span className="text-muted-foreground">Business Name:</span>
                            <span className="font-medium">{kyc.business_name || 'N/A'}</span>

                            <span className="text-muted-foreground">ID Type:</span>
                            <span className="font-medium">{kyc.id_type}</span>

                            <span className="text-muted-foreground">ID Number:</span>
                            <span className="font-medium">{kyc.id_number}</span>

                            <span className="text-muted-foreground">Phone (Profile):</span>
                            <span className="font-medium">{kyc.profiles?.phone}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>Review the uploaded identity documents.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {kyc.id_document_url ? (
                            <div className="border rounded-lg p-2 relative aspect-video bg-muted flex items-center justify-center overflow-hidden group">
                                {/* In a real app, use a secure signed URL */}
                                <Image
                                    src={kyc.id_document_url}
                                    alt="ID Document"
                                    fill
                                    className="object-contain"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button variant="secondary" asChild>
                                        <a href={kyc.id_document_url} target="_blank" rel="noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" /> View Full
                                        </a>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex items-center justify-center border border-dashed text-muted-foreground">
                                No ID Document Uploaded
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {kyc.status === 'pending' && (
                <Card className="border-t-4 border-t-primary">
                    <CardHeader>
                        <CardTitle>Review Decision</CardTitle>
                        <CardDescription>Approve or Reject this application. This action is logged.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <form action={rejectKYC} className="space-y-4">
                                <Textarea
                                    name="reason"
                                    placeholder="Reason for rejection (required if rejecting)..."
                                    required
                                />
                                <Button variant="destructive" type="submit" className="w-full">
                                    <X className="mr-2 h-4 w-4" /> Reject Application
                                </Button>
                            </form>
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="h-full w-px bg-border"></div>
                        </div>
                        <div className="flex-1 flex flex-col justify-end">
                            <form action={approveKYC}>
                                <Button variant="default" type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700">
                                    <Check className="mr-2 h-4 w-4" /> Approve Application
                                </Button>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    This will upgrade the user to HOST role immediately.
                                </p>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
