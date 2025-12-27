// Mock Voucher Signing Helper for Local Testing
// In production, vouchers are signed by Postgres (pgcrypto) or Edge Functions using HS256.

export class VoucherHelper {
    static async sign(claims: any, secret: string): Promise<string> {
        // Simple mock signature for testing flow
        const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
        const payload = btoa(JSON.stringify(claims))
        const signature = btoa(`mock-sig-${secret}`) // insecure, just for mock check
        return `${header}.${payload}.${signature}`
    }

    static async verify(token: string, secret: string): Promise<any> {
        const [header, payload, sig] = token.split('.')
        if (!header || !payload || !sig) throw new Error('Invalid token structure')

        // Verify exp
        const claims = JSON.parse(atob(payload))
        if (claims.exp && Date.now() / 1000 > claims.exp) {
            throw new Error('Token expired')
        }

        // Verify mock sig
        const expectedSig = btoa(`mock-sig-${secret}`)
        if (sig !== expectedSig) {
            throw new Error('Invalid signature')
        }

        return claims
    }
}

// Polyfill for btoa/atob if needed in react native (usually available in Hermes)
function btoa(str: string) {
    return Buffer.from(str).toString('base64')
}
function atob(str: string) {
    return Buffer.from(str, 'base64').toString('binary')
}
