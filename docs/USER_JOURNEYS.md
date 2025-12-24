# ZemNet User Journeys Documentation

**Version:** 1.0  
**Last Updated:** December 24, 2025  
**Purpose:** Complete documentation of user journeys for all roles in the ZemNet WiFi Marketplace Expo app

---

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Guest Journey](#guest-journey)
4. [User Journey (Consumer)](#user-journey-consumer)
5. [Host Journey (WiFi Provider)](#host-journey-wifi-provider)
6. [Technician Journey](#technician-journey)
7. [Admin Journey](#admin-journey)
8. [Route Structure](#route-structure)
9. [Key Features by Role](#key-features-by-role)
10. [Data Persistence & Offline Support](#data-persistence--offline-support)
11. [Technical Architecture](#technical-architecture)
12. [Comparison: Expo App vs Web App](#comparison-expo-app-vs-web-app)
13. [Testing the User Journeys](#testing-the-user-journeys)
14. [Future Enhancements](#future-enhancements)
15. [Appendix](#appendix)

---

## Overview

The ZemNet Expo app supports multiple user roles, each with distinct capabilities and user flows. The app is designed with a mobile-first approach using Expo Router for navigation and Zustand for state management, with offline-first capabilities powered by AsyncStorage persistence.

### Design Principles

- **Guest-first**: Unauthenticated users can browse hotspots before signing up
- **Role-based access**: Each role has dedicated screens and navigation flows
- **Offline-ready**: Critical data (vouchers, purchases) persisted locally
- **Multi-language**: French (default) and English support throughout
- **Progressive authentication**: Users only authenticate when needed (e.g., purchasing)

---

## User Roles

The app supports five distinct user roles defined in the database schema:

| Role | Description | Primary Use Case |
|------|-------------|------------------|
| **Guest** | Unauthenticated visitor | Browse hotspots, explore the marketplace |
| **User** | Authenticated consumer | Purchase WiFi access plans, manage vouchers |
| **Host** | WiFi hotspot provider | Create hotspots, manage plans, accept cash-in |
| **Technician** | Technical support staff | Handle service requests, diagnostics |
| **Admin** | System administrator | (Future) Manage platform, KYC approvals, moderation |

---

## Guest Journey

**Goal:** Allow unauthenticated users to explore the marketplace and discover available WiFi hotspots without creating an account.

### Entry Points

1. **Welcome Screen** → Tap "Continuer en invité" (Continue as Guest)
2. Direct deep link to map/list screens

### Available Screens

```
/(app)/(user)/
├── map              # Map view of hotspots (or card-based list)
├── list             # Low-data list of hotspots
└── hotspot/[id]     # Hotspot details with available plans
```

### Flow Diagram

```
Welcome Screen
    ↓
[Continuer en invité]
    ↓
Map/List Screen
    ↓
Hotspot Details
    ↓
View Plans
    ↓
[Attempt to Purchase]
    ↓
Authentication Required → Phone Screen
```

### Key Features

- ✅ Browse all online hotspots (map & list view)
- ✅ View hotspot details (name, landmark, SSID, status)
- ✅ See available plans (duration, price, data)
- ✅ Search/filter hotspots by location or name
- ❌ Cannot purchase plans (requires authentication)
- ❌ Cannot access wallet or history

### Technical Implementation

- No authentication token required
- Data fetched from public Supabase tables
- Uses `discoveryStore` for hotspot/plan data
- Offline: Shows cached hotspot data from last sync

### Conversion Points

Guest users are prompted to authenticate when they:
1. Tap "Acheter un plan" (Buy a plan) on hotspot detail
2. Try to access wallet or profile features
3. Attempt to view purchase history

---

## User Journey (Consumer)

**Goal:** Enable authenticated users to discover, purchase, and use WiFi access at various hotspots.

### Onboarding Flow

```
Welcome Screen
    ↓
[Commencer] (Start)
    ↓
Phone Number Entry (+226 XX XX XX XX)
    ↓
OTP Verification (6-digit code)
    ↓
Profile Creation (name entry)
    ↓
Main App (User Tabs)
```

### Main Navigation (User Tabs)

```
Bottom Tabs:
├── Carte (Map)          # Map view of hotspots
├── Liste (List)         # List view of hotspots
├── Portefeuille (Wallet) # Wallet & vouchers
├── Historique (History) # Purchase history
└── Réglages (Settings)  # Settings & profile
```

### Complete User Flow

#### 1. Discovery Phase

**Screens:**
- `/(app)/(user)/map` - Interactive map or card-based view
- `/(app)/(user)/list` - Low-bandwidth list view
- `/(app)/(user)/hotspot/[id]` - Hotspot detail page

**Actions:**
- Browse hotspots by location
- Search by name or landmark
- Filter by status (online/offline), distance, price
- View hotspot details (SSID, plans, reviews)
- Check real-time availability

**Features:**
- Location-based sorting (nearest first)
- Distance calculation (Haversine formula)
- Hotspot status indicators (online/offline/paused)
- Minimum price display
- Plan comparison

#### 2. Purchase Phase

**Flow:**
```
Hotspot Detail
    ↓
Select Plan
    ↓
/(app)/(user)/payment/method
    ↓
Choose Payment Method:
    - Portefeuille (Wallet)
    - Wave
    - Orange Money
    - Moov Money
    ↓
/(app)/(user)/payment/status
    ↓
[Processing... 2s simulation]
    ↓
/(app)/(user)/payment/success
    ↓
Voucher Created & Saved
    ↓
Navigate to Wallet
```

**Payment Methods:**

| Method | Description | Status |
|--------|-------------|--------|
| Wallet | Use pre-loaded balance | ✅ Implemented |
| Wave | Mobile money (simulated) | ✅ Simulated |
| Orange Money | Mobile money (simulated) | ✅ Simulated |
| Moov Money | Mobile money (simulated) | ✅ Simulated |

**Technical Details:**
- Payment state machine in `purchasesStore`
- 90% success rate in simulation
- Automatic voucher creation on wallet payment success
- Purchase records persisted (recent 20 transactions)
- Error handling with retry capability

#### 3. Wallet Management

**Screens:**
- `/(app)/(user)/wallet` - Main wallet screen
- `/(app)/(user)/wallet/topup-qr` - Generate QR for cash-in
- `/(app)/(user)/wallet/topup-requests` - Pending cash-in requests
- `/(app)/(user)/wallet/topup-requests/[id]` - Request detail
- `/(app)/(user)/wallet/[voucherId]` - Voucher detail

**Features:**
- **Balance Display**: Current wallet balance in XOF
- **Active Vouchers**: Tap to show QR code
- **Used Vouchers**: Historical vouchers with usage timestamp
- **Top-up QR**: Generate QR code for host cash-in
- **Pending Requests**: Monitor cash-in requests (10-min expiry)

**Voucher Details:**
- Unique voucher code
- QR code display (220px)
- Expiration date/time
- Status badge (Active/Used/Expired)
- Associated hotspot & plan info
- Copy code functionality
- Fullscreen QR modal

**Cash-in Flow (User Side):**
```
Wallet Screen
    ↓
[Recharger] (Top-up)
    ↓
wallet/topup-qr
    ↓
Show QR Code + User ID
    ↓
Host scans QR
    ↓
Request appears in wallet/topup-requests
    ↓
Accept/Reject Request (10-min expiry)
    ↓
Balance updated on confirmation
```

#### 4. Usage Phase

**Screens:**
- `/(app)/(user)/connect-help` - Connection guide

**Connection Steps:**
```
1. Join WiFi network (SSID shown in hotspot detail)
2. Captive portal opens automatically
3. Enter voucher code or scan QR
4. Access granted for plan duration
```

**Connection Help Features:**
- Step-by-step visual guide
- Troubleshooting tips
- Manual portal access instructions
- Support contact info

#### 5. History & Tracking

**Screens:**
- `/(app)/(user)/history` - Purchase history
- `/(app)/(shared)/transaction-detail/[id]` - Transaction detail

**Features:**
- Complete purchase history
- Filter by date range
- Filter by status (success/failed/pending)
- Transaction details (hotspot, plan, amount, date)
- Payment method tracking
- Refund status (if applicable)

### User Settings & Profile

**Screens:**
- `/(app)/(shared)/settings` - App settings
- `/(app)/(shared)/support` - Support contact
- `/(app)/(shared)/legal` - Terms & privacy
- `/(app)/(shared)/about` - App information

**Settings Options:**
- Language toggle (FR/EN)
- Role switch (User ↔ Host)
- Profile information
- Notification preferences
- Clear cache (dev mode)
- Sign out

---

## Host Journey (WiFi Provider)

**Goal:** Enable hosts to monetize their internet connection by creating hotspots, managing plans, and accepting cash deposits.

### Entry Point

Users can become hosts by:
1. Switching role in Settings → "Devenir hôte" (Become Host)
2. Completing KYC verification (optional, for payouts)

### Host Onboarding

```
Settings
    ↓
[Devenir hôte]
    ↓
/(app)/(host)/start (Introduction)
    ↓
/(app)/(host)/kyc (KYC Form)
    ↓
/(app)/(host)/setup (Hotspot Setup)
    ↓
Host Dashboard
```

### Main Navigation (Host)

```
Host Section:
├── Dashboard           # Overview & statistics
├── Hotspots            # Manage hotspots
├── Cash-in             # Accept cash deposits
├── Earnings            # Revenue tracking
├── Payouts             # Withdraw funds
└── Sessions            # Active user sessions
```

### Complete Host Flow

#### 1. KYC & Setup

**Screens:**
- `/(app)/(host)/start` - Host program introduction
- `/(app)/(host)/kyc` - KYC form (ID, business info)
- `/(app)/(host)/setup` - Initial hotspot setup

**KYC Requirements:**
- Full name
- ID document (uploaded)
- Business registration (if applicable)
- Payout method (Wave/Orange/Moov account)
- Location information

**KYC Status Flow:**
```
pending → approved/rejected
    ↓
If approved: Full host features unlocked
If rejected: Review reason, resubmit
```

#### 2. Hotspot Management

**Screens:**
- `/(app)/(host)/hotspots` - List all owned hotspots
- `/(app)/(host)/hotspot/[id]` - Hotspot detail & settings
- `/(modal)/plan-editor` - Create/edit plans

**Hotspot Creation:**
```
Hotspots List
    ↓
[Ajouter Hotspot]
    ↓
Enter Details:
    - Hotspot name
    - Landmark description
    - Physical address
    - Location (lat/lng)
    - WiFi SSID
    - Operating hours
    ↓
Save Hotspot
    ↓
Create Plans
```

**Hotspot Settings:**
- Toggle online/offline status
- Pause sales temporarily
- Edit metadata (name, location, landmark)
- Update SSID
- Set operating hours
- View statistics (sales, sessions)

**Plan Management:**

Plans define the WiFi access offerings:

| Field | Description | Example |
|-------|-------------|---------|
| Name | Plan display name | "1 Hour Express" |
| Duration | Time limit in seconds | 3600 (1 hour) |
| Data | Data cap in bytes | 1073741824 (1 GB) |
| Price | Cost in XOF | 500 |
| Active | Enable/disable sales | true |

**Plan Editor Features:**
- Create unlimited plans per hotspot
- Edit active plans
- Toggle plan availability
- Preview plan as user sees it
- Batch enable/disable

#### 3. Dashboard & Analytics

**Screen:** `/(app)/(host)/dashboard`

**Key Metrics:**
- **Today's Earnings**: Revenue from today's sales
- **Total Earnings**: All-time revenue
- **Active Hotspots**: Number of online hotspots
- **Active Sessions**: Current connected users
- **Total Sales**: Lifetime transaction count
- **Pending Payouts**: Withdrawable balance

**Dashboard Cards:**
```
┌─────────────────────────┐
│ Today's Earnings        │
│ 15,000 XOF             │
└─────────────────────────┘

┌─────────────────────────┐
│ Active Sessions         │
│ 7 users connected      │
└─────────────────────────┘

┌─────────────────────────┐
│ Pending Cash-ins        │
│ 3 requests (2 min left)│
└─────────────────────────┘
```

**Technical Implementation:**
- Real-time data from Supabase
- Aggregated queries for performance
- Auto-refresh every 30 seconds
- Pull-to-refresh support

#### 4. Cash-In Management

**Screens:**
- `/(app)/(host)/cashin` - Create cash-in requests
- `/(app)/(host)/cashin-history` - Historical cash-ins

**Cash-In Flow:**

```
Host scans user's top-up QR
    ↓
/(app)/(host)/cashin
    ↓
Enter amount (e.g., 5000 XOF)
    ↓
[Calculate commission: 2% = 100 XOF]
    ↓
Create Request
    ↓
Show QR/code to user
    ↓
User accepts on their device
    ↓
Host receives confirmation
    ↓
User balance +5000, Host balance +100
```

**Commission Structure:**
- Host earns 2% commission on cash deposits
- Example: User deposits 5000 XOF → Host earns 100 XOF
- Commission paid instantly on confirmation

**Request Lifecycle:**
- **Created**: Host generates request
- **Pending**: Waiting for user acceptance (10-min timer)
- **Confirmed**: User accepted, balances updated
- **Expired**: User didn't respond in time
- **Rejected**: User declined request

**Cash-In History Features:**
- Filter by status
- Filter by date range
- Search by user phone
- Total commission earned
- Export to CSV (future)

#### 5. Earnings & Sessions

**Earnings Screen:** `/(app)/(host)/earnings`

**Features:**
- Daily earnings chart
- Weekly/monthly summaries
- Revenue by hotspot
- Revenue by plan type
- Top-selling plans
- Peak usage times

**Sessions Screen:** `/(app)/(host)/sessions`

**Active Session Display:**
```
┌─────────────────────────────────┐
│ User: *****5678                │
│ Hotspot: Café du Centre        │
│ Plan: 2 Hours                   │
│ Started: 14:30                  │
│ Remaining: 1h 23m               │
│ Data Used: 245 MB / 1 GB        │
└─────────────────────────────────┘
```

#### 6. Payout Management

**Screen:** `/(app)/(host)/payouts`

**Payout Flow:**
```
Earnings > Minimum threshold (e.g., 10,000 XOF)
    ↓
[Request Payout]
    ↓
Select payment method:
    - Wave
    - Orange Money
    - Moov Money
    ↓
Enter amount (max: available balance)
    ↓
Submit request
    ↓
Admin review (1-3 days)
    ↓
Payment processed
    ↓
Balance deducted
```

**Payout Status:**
- Pending: Awaiting admin approval
- Processing: Payment in progress
- Completed: Funds transferred
- Failed: Issue with payment, balance restored
- Cancelled: Request cancelled by host or admin

#### 7. Technician Request Management

**Screens:**
- `/(app)/(host)/technician-requests` - List service requests
- `/(app)/(host)/technician-requests/new` - Create request
- `/(app)/(host)/technician-requests/[id]` - Request detail

**Service Request Types:**
- Router issue
- Setup help
- Network problem
- Maintenance
- Hardware repair
- Other

**Request Flow:**
```
Host encounters technical issue
    ↓
technician-requests/new
    ↓
Select request type
Enter description
Set priority (low/medium/high/urgent)
Add photos (optional)
    ↓
Submit request
    ↓
Technician receives notification
    ↓
Technician accepts & begins work
    ↓
Status updates (assigned → in-progress → completed)
    ↓
Host marks as resolved
```

---

## Technician Journey

**Goal:** Enable technical support staff to receive, manage, and resolve service requests from hosts.

### Entry Point

Technicians access their dashboard via role selection or direct assignment.

### Main Screen

**Dashboard:** `/(app)/(technician)/technician/dashboard`

### Core Features

**Current Implementation:**
- View assigned service requests
- Basic diagnostic information

**Planned Features:**
- Accept/decline service requests
- Update request status
- Add notes and photos
- Mark requests complete
- View request history
- Performance metrics (resolution time, satisfaction)

### Technician Flow

```
Dashboard
    ↓
View Service Requests
    ↓
Filter by:
    - Status (pending/assigned/in-progress)
    - Priority (urgent/high/medium/low)
    - Location (nearest first)
    ↓
Select Request
    ↓
View Details:
    - Host information
    - Hotspot details
    - Issue description
    - Photos/attachments
    - Priority level
    ↓
[Accept Request]
    ↓
Status: Assigned
    ↓
Travel to location
    ↓
[Start Work]
    ↓
Status: In Progress
    ↓
Diagnose & repair
    ↓
Add notes/photos
    ↓
[Complete Request]
    ↓
Host verifies completion
    ↓
Status: Completed
```

### Request Management

**Request Card:**
```
┌─────────────────────────────────┐
│ 🔴 URGENT                       │
│ Router Issue - Café du Centre   │
│ Host: +226 XX XX XX XX          │
│ Location: 2.3 km away           │
│ Created: 1 hour ago             │
│ Description: Router not...      │
│                                 │
│ [Accept] [View Details]         │
└─────────────────────────────────┘
```

### Diagnostic Tools

**Planned Features:**
- Network connectivity test
- Router health check
- Bandwidth test
- User session analysis
- Common issue checklist

---

## Admin Journey

**Goal:** Manage platform operations, approve KYC, moderate content, and oversee system health.

### Entry Point

Admin role assigned directly in database. Access via role selector in Settings.

### Admin Dashboard (Planned)

**Note:** Admin features are not fully implemented in the current Expo app. These are planned features based on the web app architecture.

### Core Admin Functions

#### 1. User Management
- View all users
- Search by phone/name
- View user details
- Suspend/activate accounts
- Manual balance adjustments (with audit log)
- Role assignment (promote to host/technician)

#### 2. KYC Review
- Review pending KYC submissions
- View submitted documents
- Approve/reject with notes
- Request additional information
- Bulk approval tools

#### 3. Hotspot Moderation
- Review new hotspots
- Approve/reject hotspot listings
- Edit hotspot information
- Suspend problematic hotspots
- Monitor hotspot performance

#### 4. Financial Management
- View all transactions
- Process payout requests
- Handle disputes/refunds
- Generate financial reports
- Set commission rates
- Configure payment providers

#### 5. Platform Analytics
- User growth metrics
- Transaction volume
- Revenue analytics
- Geographic distribution
- Popular hotspots/plans
- System health monitoring

#### 6. Content Management
- Manage announcements
- Update help documentation
- Configure support contacts
- Manage FAQ content

#### 7. System Configuration
- Feature flags
- API rate limits
- Cache configuration
- Database maintenance
- Backup management

**Admin Flow Example (KYC Approval):**
```
Admin Dashboard
    ↓
Pending KYC Submissions (5)
    ↓
Select submission
    ↓
Review:
    - User information
    - Uploaded documents
    - Business details
    - Background check (if applicable)
    ↓
Decision:
    [Approve] → User can become host
    [Reject] → User notified with reason
    [Request Info] → User receives request for additional docs
    ↓
Save with audit trail
```

---

## Route Structure

### Complete Route Tree

```
/ (Root)
│
├── (auth)                          # Authentication flows
│   ├── welcome                     # Entry point, language selection
│   ├── phone                       # Phone number entry
│   ├── otp                         # OTP verification
│   └── profile                     # New user profile creation
│
├── (app)                          # Main application
│   ├── (user)                     # User/Consumer routes
│   │   ├── map                    # Map view of hotspots
│   │   ├── list                   # List view of hotspots
│   │   ├── hotspot/[id]           # Hotspot detail
│   │   ├── payment
│   │   │   ├── method             # Payment method selection
│   │   │   ├── status             # Payment processing
│   │   │   └── success            # Payment success + voucher
│   │   ├── wallet
│   │   │   ├── index              # Wallet home (balance + vouchers)
│   │   │   ├── topup-qr           # Generate QR for cash-in
│   │   │   ├── topup-requests     # Pending cash-in requests
│   │   │   ├── topup-requests/[id] # Request detail
│   │   │   └── [voucherId]        # Voucher detail
│   │   ├── history                # Purchase history
│   │   └── connect-help           # Connection guide
│   │
│   ├── (host)                     # Host routes
│   │   ├── start                  # Host introduction
│   │   ├── kyc                    # KYC form
│   │   ├── setup                  # Initial hotspot setup
│   │   ├── dashboard              # Host dashboard
│   │   ├── claim                  # Claim existing hotspot
│   │   ├── hotspots               # List hotspots
│   │   ├── hotspot/[id]           # Hotspot management
│   │   ├── sessions               # Active sessions
│   │   ├── earnings               # Earnings analytics
│   │   ├── payouts                # Payout requests
│   │   ├── cashin                 # Create cash-in request
│   │   ├── cashin-history         # Cash-in history
│   │   ├── technician-requests    # Service requests list
│   │   ├── technician-requests/new # Create service request
│   │   └── technician-requests/[id] # Request detail
│   │
│   ├── (technician)               # Technician routes
│   │   └── technician/dashboard   # Technician dashboard
│   │
│   └── (shared)                   # Shared routes
│       ├── settings               # App settings
│       ├── support                # Support contact
│       ├── legal                  # Legal information
│       ├── about                  # About the app
│       └── transaction-detail/[id] # Transaction detail
│
└── (modal)                        # Modal screens
    ├── qr                         # QR code display (vouchers, cash-in)
    └── plan-editor                # Create/edit plan
```

### Route Access Control

| Route Pattern | Guest | User | Host | Technician | Admin |
|---------------|-------|------|------|------------|-------|
| `/(auth)/*` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(user)/map` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(user)/list` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(user)/hotspot/[id]` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(user)/payment/*` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(user)/wallet/*` | ❌ | ✅ | ✅ | ✅ | ✅ |
| `/(app)/(host)/*` | ❌ | ❌ | ✅ | ❌ | ✅ |
| `/(app)/(technician)/*` | ❌ | ❌ | ❌ | ✅ | ✅ |
| `/(app)/(shared)/*` | ❌ | ✅ | ✅ | ✅ | ✅ |

---

## Key Features by Role

### Guest Features

✅ **Available:**
- Browse hotspots (map & list)
- View hotspot details
- See plan pricing
- Search & filter hotspots
- Change language

❌ **Not Available:**
- Purchase plans
- Access wallet
- View history
- Save favorites

### User Features

✅ **Core Features:**
- All guest features
- OTP authentication
- Purchase WiFi plans
- Multiple payment methods
- Wallet management
- Voucher QR codes
- Cash-in top-up
- Purchase history
- Connection help
- Profile management

### Host Features

✅ **Core Features:**
- All user features
- Create/manage hotspots
- Create/edit plans
- Accept cash deposits (2% commission)
- View earnings & analytics
- Monitor active sessions
- Request payouts
- Create technician requests
- KYC submission

### Technician Features

✅ **Core Features:**
- View service requests
- Accept/decline requests
- Update request status
- Add diagnostic notes
- Mark requests complete
- View request history

### Admin Features

🚧 **Planned Features:**
- User management
- KYC approval workflow
- Hotspot moderation
- Financial management
- Process payouts
- Platform analytics
- System configuration
- Content management

---

## Data Persistence & Offline Support

### Persisted Data (AsyncStorage)

| Store | Persisted Data | Purpose |
|-------|----------------|---------|
| `authStore` | language, profile | Maintain user context |
| `walletStore` | vouchers, balance | Offline voucher access |
| `purchasesStore` | recent 20 purchases | Purchase history |
| `cashInStore` | active requests | Monitor cash-in status |
| `discoveryStore` | hotspots, plans | Offline browsing |

### Offline Capabilities

**Works Offline:**
- View saved vouchers
- Access QR codes
- Browse cached hotspots
- View purchase history
- Read connection help

**Requires Internet:**
- Real-time hotspot status
- Create purchases
- Confirm cash-in requests
- Fetch new vouchers
- Update balance

---

## Technical Architecture

### State Management

**Zustand Stores:**
- `authStore` - Authentication & user profile
- `discoveryStore` - Hotspot discovery & filtering
- `walletStore` - Balance & voucher management
- `purchasesStore` - Purchase flow & history
- `cashInStore` - Host cash-in requests

### Backend Integration

**Supabase:**
- **Auth**: Phone OTP authentication
- **Database**: Postgres with RLS (Row Level Security)
- **Real-time**: Live session updates (planned)
- **Storage**: Hotspot images, KYC documents (planned)

**Key Tables:**
- `users` - User profiles and roles
- `hotspots` - WiFi hotspot listings
- `plans` - Available access plans
- `vouchers` - Generated access codes
- `purchases` - Transaction records
- `cashin_requests` - Cash deposit requests
- `wallet_transactions` - Balance history

### Security

**Row Level Security (RLS) Policies:**
- Users can only view their own vouchers
- Hosts can only manage their own hotspots
- Technicians can only view assigned requests
- Public read for hotspots/plans

**Data Protection:**
- Phone numbers masked in UI
- Voucher codes encrypted at rest (planned)
- Secure payment provider integration (planned)
- HTTPS-only communication

---

## Comparison: Expo App vs Web App

### Feature Parity

| Feature | Web App | Expo App | Status |
|---------|---------|----------|--------|
| Guest browsing | ✅ | ✅ | Complete |
| User authentication | ✅ | ✅ | Complete |
| Plan purchase | ✅ | ✅ | Complete |
| Wallet management | ✅ | ✅ | Complete |
| QR vouchers | ✅ | ✅ | Complete |
| Host dashboard | ✅ | ✅ | Complete |
| Cash-in flow | ✅ | ✅ | Complete |
| Technician dashboard | ✅ | 🚧 | Basic implementation |
| Admin panel | ✅ | ❌ | Web-only (planned) |
| Real-time updates | ✅ | 🚧 | Planned |
| Push notifications | ✅ | 🚧 | Planned |

### Mobile-Specific Features

✅ **Expo App Advantages:**
- Offline voucher access
- Native QR scanner
- Biometric authentication (planned)
- Push notifications (planned)
- Background sync (planned)
- Native sharing
- Deep linking

### Web-Specific Features

✅ **Web App Advantages:**
- Admin panel (full-featured)
- Advanced analytics dashboards
- Bulk operations
- CSV export
- Multi-tab workflow

---

## Testing the User Journeys

### Manual Testing Checklist

#### Guest Flow
- [ ] Open app → Welcome screen appears
- [ ] Select language (FR/EN) → UI updates
- [ ] Tap "Continuer en invité" → Navigate to map
- [ ] Browse hotspots → See online/offline status
- [ ] Tap hotspot → View details and plans
- [ ] Tap "Acheter" → Prompted to authenticate

#### User Flow
- [ ] Enter phone number → OTP sent
- [ ] Enter OTP → Authentication successful
- [ ] Create profile → Navigate to map
- [ ] Select hotspot → View plans
- [ ] Purchase plan → Payment processed
- [ ] Voucher created → Appears in wallet
- [ ] Tap voucher → QR code displays
- [ ] Close app, reopen → Voucher still accessible

#### Host Flow
- [ ] Switch to host role → KYC prompt
- [ ] Submit KYC → Status pending
- [ ] Create hotspot → Hotspot active
- [ ] Create plan → Plan available to users
- [ ] Create cash-in request → QR generated
- [ ] User confirms → Commission credited
- [ ] View dashboard → Stats display correctly

#### Technician Flow
- [ ] Switch to technician role → Dashboard opens
- [ ] View service requests → List displays
- [ ] Select request → Details shown
- [ ] Update status → Change reflected

### Automated Testing

```bash
# Run unit tests
npm test

# Run specific store tests
npm test -- authStore.test.ts
npm test -- discoveryStore.test.ts
npm test -- walletStore.test.ts
```

---

## Future Enhancements

### Planned Features

**User Role:**
- [ ] Favorite hotspots
- [ ] Hotspot ratings & reviews
- [ ] Voucher sharing
- [ ] Usage analytics
- [ ] Auto-renew plans

**Host Role:**
- [ ] Bulk plan creation
- [ ] Revenue forecasting
- [ ] Customer insights
- [ ] Promotional campaigns
- [ ] Loyalty programs

**Technician Role:**
- [ ] Mobile diagnostic tools
- [ ] Route optimization
- [ ] Parts inventory
- [ ] Time tracking
- [ ] Performance metrics

**Admin Role:**
- [ ] Full admin panel in mobile
- [ ] Advanced reporting
- [ ] A/B testing tools
- [ ] Fraud detection
- [ ] Automated KYC

**Platform:**
- [ ] Real-time notifications
- [ ] In-app chat support
- [ ] Video tutorials
- [ ] Referral program
- [ ] Multi-currency support

---

## Appendix

### Glossary

- **Hotspot**: A WiFi access point offered by a host
- **Plan**: A time/data-limited WiFi access package
- **Voucher**: A unique code providing access to a purchased plan
- **Cash-in**: Process where hosts accept cash and credit user wallets
- **KYC**: Know Your Customer verification for hosts
- **XOF**: West African CFA franc (currency)

### Contact & Support

- **Documentation**: `/docs` directory
- **Issues**: GitHub Issues
- **Support**: support@zemnet.com

---

**Document Version:** 1.0  
**Last Updated:** December 24, 2025  
**Maintained by:** ZemNet Development Team
