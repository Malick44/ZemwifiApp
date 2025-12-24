# ZemNet Quick Reference Guide

**Quick overview of user roles and key features**

---

## 👥 User Roles at a Glance

### 🔓 Guest (Unauthenticated)
**Can Do:**
- ✅ Browse all hotspots (map & list)
- ✅ View hotspot details
- ✅ See plan prices
- ✅ Change language (FR/EN)

**Cannot Do:**
- ❌ Purchase plans
- ❌ Access wallet
- ❌ View history

**Entry:** Welcome screen → "Continuer en invité"

---

### 👤 User (Consumer)
**Primary Goal:** Purchase and use WiFi access

**Key Features:**
- 🔐 Phone OTP authentication
- 💳 Purchase WiFi plans (Wallet, Wave, Orange, Moov)
- 📱 QR voucher codes
- 💰 Wallet management
- 🔄 Cash-in top-up
- 📊 Purchase history
- 🔗 Connection help

**Navigation:**
```
Carte → Liste → Portefeuille → Historique → Réglages
```

**Typical Flow:**
```
Browse hotspots → Select plan → Choose payment → Get voucher → Connect to WiFi
```

---

### 🏠 Host (WiFi Provider)
**Primary Goal:** Monetize internet by selling WiFi access

**Key Features:**
- 📡 Create & manage hotspots
- 📋 Create & edit plans
- 💵 Accept cash deposits (2% commission)
- 📊 Dashboard & analytics
- 💸 Request payouts
- 🔧 Create technician requests
- ✅ KYC verification

**Revenue Streams:**
1. **Plan Sales**: Earn from every plan sold on your hotspot
2. **Cash-in Commission**: Earn 2% when accepting cash deposits

**Entry:** Settings → "Devenir hôte"

---

### 🔧 Technician
**Primary Goal:** Provide technical support to hosts

**Key Features:**
- 📋 View service requests
- ✅ Accept/decline requests
- 📝 Update request status
- 🛠️ Add diagnostic notes

**Entry:** Role assignment or Settings

---

### 👨‍💼 Admin (Planned)
**Primary Goal:** Manage platform operations

**Planned Features:**
- 👥 User management
- ✅ KYC approval
- 🏠 Hotspot moderation
- 💰 Financial management
- 📊 Platform analytics
- ⚙️ System configuration

**Note:** Admin features primarily available in web app, mobile support planned.

---

## 🗺️ Navigation Map

### Authentication Routes
```
/(auth)/
├── welcome      → Language selection & entry
├── phone        → Phone number entry
├── otp          → OTP verification
└── profile      → New user profile
```

### User Routes
```
/(app)/(user)/
├── map                     → Map view
├── list                    → List view
├── hotspot/[id]            → Hotspot details
├── payment/
│   ├── method              → Choose payment
│   ├── status              → Processing
│   └── success             → Voucher created
├── wallet/
│   ├── index               → Balance & vouchers
│   ├── topup-qr            → QR for cash-in
│   ├── topup-requests/     → Pending requests
│   └── [voucherId]         → Voucher detail
├── history                 → Purchase history
└── connect-help            → Connection guide
```

### Host Routes
```
/(app)/(host)/
├── dashboard               → Overview & stats
├── hotspots                → Manage hotspots
├── hotspot/[id]            → Hotspot detail
├── cashin                  → Accept cash
├── cashin-history          → Cash-in history
├── earnings                → Revenue analytics
├── payouts                 → Withdrawal requests
└── technician-requests/    → Service requests
```

### Shared Routes
```
/(app)/(shared)/
├── settings                → App settings
├── support                 → Support contact
├── legal                   → Terms & privacy
└── about                   → App info
```

---

## 💰 Payment & Money Flow

### User Payments
| Method | Type | Status |
|--------|------|--------|
| Wallet | Pre-loaded balance | ✅ Live |
| Wave | Mobile money | 🎭 Simulated |
| Orange Money | Mobile money | 🎭 Simulated |
| Moov Money | Mobile money | 🎭 Simulated |

### Host Cash-In Flow
```
User needs top-up
    ↓
User generates QR in wallet/topup-qr
    ↓
Host scans QR
    ↓
Host enters amount (e.g., 5000 XOF)
    ↓
Request created (10-min expiry)
    ↓
User accepts in wallet/topup-requests
    ↓
User balance: +5000 XOF
Host balance: +100 XOF (2% commission)
```

**Commission Rate:** 2% on all cash-in transactions

---

## 🎫 Voucher Lifecycle

### Creation
```
Purchase Plan
    ↓
Payment Success
    ↓
Voucher Generated (unique code + QR)
    ↓
Saved to Wallet (offline accessible)
```

### Status
- **Active**: Not yet used, not expired
- **Used**: Redeemed on captive portal
- **Expired**: Past expiration date

### Display
- **Wallet**: List of vouchers (active/used)
- **Voucher Detail**: Full QR, code, expiry
- **Modal**: Fullscreen QR for scanning

---

## 🔌 Connection Process

### Steps for Users
1. **Find Hotspot**: Browse map/list
2. **Purchase Plan**: Select plan & pay
3. **Get Voucher**: QR code + unique code
4. **Join Network**: Connect to WiFi (SSID from hotspot detail)
5. **Enter Code**: Captive portal opens, enter voucher code
6. **Access Granted**: Internet for plan duration

### If Portal Doesn't Open
- Open browser → Navigate to any website
- Portal should intercept
- Manual portal URL (shown in connect-help)

---

## 📊 Data Persistence

### Stored Offline (AsyncStorage)
| Data | Store | Purpose |
|------|-------|---------|
| Language, Profile | authStore | User context |
| Vouchers, Balance | walletStore | Offline access |
| Recent Purchases | purchasesStore | History |
| Cash-in Requests | cashInStore | Status monitoring |
| Hotspots, Plans | discoveryStore | Browse offline |

### Requires Internet
- Real-time hotspot status
- New purchases
- Cash-in confirmations
- Balance updates

---

## 🌐 Multi-Language Support

**Supported Languages:**
- 🇫🇷 Français (French) - Default
- 🇬🇧 English

**Change Language:**
1. Welcome screen → Select language
2. Settings → Language toggle

**Coverage:**
- 50+ translation keys
- All UI text translated
- Error messages translated

---

## 🔐 Security & Privacy

### Authentication
- Phone OTP (SMS-based)
- No password required
- Secure session management

### Data Protection
- Phone numbers masked in UI
- RLS (Row Level Security) in database
- Users can only access their own data
- Hosts can only manage their hotspots

### Privacy
- Minimal data collection
- No tracking or analytics (by default)
- User data not shared

---

## 🚀 Getting Started

### As Guest
```
1. Open app
2. Select language
3. Tap "Continuer en invité"
4. Browse hotspots
```

### As User
```
1. Open app
2. Tap "Commencer"
3. Enter phone: +226 XX XX XX XX
4. Enter OTP code
5. Create profile
6. Start browsing
```

### As Host
```
1. Create user account first
2. Settings → "Devenir hôte"
3. Complete KYC (optional)
4. Create first hotspot
5. Add plans
6. Start earning!
```

---

## 📱 App Info

**Platform:** Expo + React Native  
**Routing:** Expo Router (file-based)  
**State:** Zustand with persistence  
**Backend:** Supabase (Auth + Database)  
**Offline:** AsyncStorage for critical data  

**Supported Devices:**
- iOS 13+
- Android 8.0+

**Languages:**
- French (Français)
- English

---

## 📞 Support

**Need Help?**
- In-app: Settings → Support
- Email: support@zemnet.com
- Documentation: `/docs` folder
- Connection help: /(app)/(user)/connect-help

**Report Issues:**
- GitHub Issues
- In-app support form

---

## 🔗 Related Documentation

- **[USER_JOURNEYS.md](./USER_JOURNEYS.md)**: Complete detailed user journeys
- **[README.md](../README.md)**: Project overview & setup
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Backend configuration
- **[IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md)**: Technical implementation details

---

**Last Updated:** December 24, 2025  
**Version:** 1.0
