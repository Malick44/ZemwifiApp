
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'

export default async function ConfigPage() {
    const supabase = await createClient()

    const { data: settings } = await supabase
        .from('system_settings')
        .select('*')
        .single()

    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight">System Configuration</h2>

            <Card>
                <CardHeader>
                    <CardTitle>Fees & Commissions</CardTitle>
                    <CardDescription>Configure the platform-wide fee structure.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cashin_commission">Cash-in Commission (%)</Label>
                            <Input
                                id="cashin_commission"
                                type="number"
                                defaultValue={settings?.cashin_commission_percent || 5}
                                disabled // Need a Server Action to update
                            />
                            <p className="text-xs text-muted-foreground">The percentage hosts earn for cashing in user wallets.</p>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="platform_fee">Platform Fee on Sales (%)</Label>
                            <Input
                                id="platform_fee"
                                type="number"
                                defaultValue={settings?.platform_fee_percent || 10}
                                disabled // Need a Server Action to update
                            />
                            <p className="text-xs text-muted-foreground">The percentage ZemNet takes from hotspot plan sales.</p>
                        </div>

                        <Button disabled>Save Changes (Coming Soon)</Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Min Payout Amount</Label>
                        <Input type="number" defaultValue={5000} disabled />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
