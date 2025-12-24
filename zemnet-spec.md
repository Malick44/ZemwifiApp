# ZemNet Wi-Fi Marketplace — Complete Specification

**Version:** 1.0  
**Date:** December 17, 2025  
**Target:** Burkina Faso Wi-Fi marketplace prototype  
**Languages:** French (primary), English

---

## 1. Introduction

### 1.1 Purpose
ZemNet is a community-powered Wi-Fi marketplace that connects users seeking internet access with local hosts providing Wi-Fi hotspots. The platform enables:
- **Users** to discover, purchase, and connect to nearby Wi-Fi hotspots using mobile money or wallet balance
- **Hosts** to monetize their internet connection by selling time-based access plans and providing cash-in services

### 1.2 Target Users
- **Primary**: Burkina Faso residents and visitors needing flexible, pay-as-you-go internet access
- **Secondary**: Local businesses and individuals who want to become Wi-Fi hosts

### 1.3 Key Principles
- **Mobile-first**: Optimized for mobile devices while remaining fully responsive
- **Accessibility**: WCAG 2.1 AA compliance throughout
- **Offline-capable**: Guest browsing of hotspots without authentication
- **Localized**: French-first with English support
- **Trust & Safety**: KYC for hosts, voucher-based redemption system

---

## 2. Information Architecture

### 2.1 Route Structure

```
/
├── /auth
│   ├── /welcome          — Landing/welcome screen
│   ├── /phone            — Phone number entry
│   ├── /otp              — OTP verification
│   └── /profile          — Profile setup (name entry)
│
├── /app
│   ├── /(user)           — User tab navigation
│   │   ├── /map          — Map view of hotspots
│   │   ├── /list         — List view of hotspots
│   │   ├── /hotspot/[id] — Hotspot detail + plan selection
│   │   ├── /payment      — Payment method selection
│   │   ├── /payment/status — Payment processing
│   │   ├── /payment/success — Payment confirmation
│   │   ├── /wallet       — Wallet + voucher management
│   │   ├── /wallet/topup-qr — Show QR for top-up
│   │   ├── /wallet/topup-requests — Pending top-up requests
│   │   ├── /wallet/topup-requests/[id] — Request detail
│   │   ├── /wallet/[voucherId] — Voucher detail with QR
│   │   ├── /history      — Purchase history
│   │   └── /connect-help — Help connecting to Wi-Fi
│   │
│   ├── /(host)           — Host tab navigation
│   │   ├── /host/start   — Become a host intro
│   │   ├── /host/kyc     — KYC submission
│   │   ├── /host/dashboard — Host overview
│   │   ├── /host/claim   — Claim router (serial entry)
│   │   ├── /host/setup   — Hotspot initial setup
│   │   ├── /host/hotspots — Manage all hotspots list
│   │   ├── /host/hotspot/[id] — Manage specific hotspot
│   │   ├── /host/sessions — Active sessions monitor
│   │   ├── /host/earnings — Earnings breakdown
│   │   ├── /host/payouts — Payout history + request
│   │   ├── /host/cashin  — Cash-in interface (scan customer QR)
│   │   ├── /host/cashin-history — Cash-in transaction history
│   │   ├── /host/technician-requests — Service request list
│   │   ├── /host/technician-requests/new — Create service request
│   │   └── /host/technician-requests/[id] — Service request detail
│   │
│   ├── /(technician)     — Technician dashboard
│   │   └── /technician/dashboard — Service requests assigned to technician
│   │
│   ├── /(admin)          — Admin dashboard
│   │   ├── /admin/dashboard — Admin overview
│   │   ├── /admin/users  — User management
│   │   ├── /admin/kyc    — KYC review queue
│   │   └── /admin/payouts — Payout management
│   │
│   └── /(shared)         — Shared screens
│       ├── /settings     — App settings (language, theme, notifications)
│       ├── /support      — Contact/help center
│       ├── /legal        — Terms, Privacy, Licenses
│       ├── /about        — About ZemNet
│       └── /transaction-detail/[id] — Transaction receipt & details
│
└── /(modal)              — Modal overlays
    ├── /qr               — Fullscreen QR viewer
    └── /plan-editor      — Host plan create/edit modal
```

### 2.2 User Roles
- **guest**: Can browse hotspots (map/list), must login to purchase
- **user**: Authenticated user, can purchase plans and manage wallet
- **host**: Can also sell plans, manage hotspots, and perform cash-in
- **admin**: Full system access (not covered in this spec)

---

## 3. Design System

> **📐 For comprehensive design specifications, layouts, component patterns, and interaction details, see [SCREEN_DESIGNS.md](/SCREEN_DESIGNS.md)**

### 3.1 Colors

```css
/* Base palette */
--background: #ffffff;
--foreground: #030213;
--primary: #030213;
--secondary: #f3f3f5;
--muted: #ececf0;
--muted-foreground: #717182;
--border: rgba(0, 0, 0, 0.1);

/* ZemNet-specific */
--success: #10b981;        /* Connectivity green, online status */
--warning: #f59e0b;        /* Pending, cautions */
--info: #3b82f6;           /* Info messages */
--destructive: #d4183d;    /* Errors, delete actions */
--online: #10b981;
--offline: #6b7280;
--pending: #f59e0b;
```

---

## 4. Component Inventory

### 4.1 UI Components (shadcn/ui-based)
All components located in `/src/app/components/ui/`:

- **Button** — Primary, secondary, outline, ghost, destructive variants; sm, default, lg sizes
- **Input** — Text, tel, email, password types
- **Select** — Dropdown selector
- **Checkbox** — Binary selection
- **Switch** — Toggle control
- **Radio Group** — Mutually exclusive options
- **Textarea** — Multi-line text input
- **Label** — Form field labels
- **Card** — Container with border and padding
- **Badge** — Small status indicators
- **Alert** — Inline notification boxes
- **Dialog** — Modal overlay
- **Drawer** — Bottom sheet (mobile) or side sheet (desktop)
- **Sheet** — Side panel
- **Tabs** — Tabbed navigation
- **Accordion** — Collapsible sections
- **Tooltip** — Hover/focus info
- **Popover** — Floating content
- **Progress** — Loading/progress bars
- **Skeleton** — Loading placeholders
- **Separator** — Divider lines
- **Scroll Area** — Custom scrollable regions
- **Toast (Sonner)** — Temporary notifications
- **Avatar** — User profile images
- **Calendar** — Date picker
- **Table** — Data tables
- **Command** — Command palette

### 4.2 Custom Components
- **StatusBadge** (`/src/app/components/StatusBadge.tsx`) — Online/offline/pending/success status indicator
- **ImageWithFallback** (`/src/app/components/figma/ImageWithFallback.tsx`) — Image with loading states (protected)

### 4.3 External Libraries
- **lucide-react**: Icon library
- **qrcode.react**: QR code generation (QRCodeSVG component)
- **recharts**: Charts and graphs
- **leaflet + react-leaflet**: Interactive maps
- **motion**: Animations
- **sonner**: Toast notifications

---

## 5. Data Layer

### 5.1 TypeScript Types

See `/src/app/types/index.ts` for complete type definitions including:
- User, Hotspot, Plan, Voucher, Purchase
- CashInRequest, HostEarnings, Session
- AppState and all enums

### 5.2 Mock Data

See `/src/app/lib/mockData.ts` for sample data.

### 5.3 Formatting Helpers
- **formatXOF(amount)**: "2 500 XOF"
- **formatDuration(seconds)**: "30 min", "2 h", "3 jours"
- **formatData(bytes)**: "100 MB", "1.5 GB"
- **formatDistance(km)**: "500 m", "1.5 km"

---

## 6. Screen Specifications

### Complete Screen Inventory (36 screens + 2 modals)

This specification covers **36 screens** and **2 modals** across authentication, user flows, host flows, technician flows, admin flows, and shared functionality. Each screen includes:
- Purpose and primary actions
- Layout regions and key components
- Data shown and validation rules
- States (loading, empty, error, success)
- Navigation flows
- Accessibility notes (focus order, keyboard, ARIA, screen reader)

---

### 6.1 Authentication Flow (4 screens)

#### 6.1.1 Welcome Screen (`/auth/welcome`)
**File:** `WelcomeScreen.tsx`

**Purpose:**  
Landing page introducing ZemNet and prompting users to log in or continue as guest.

**Key Components:**
- ZemNet logo and tagline
- Feature highlights (Find Wi-Fi, Pay with mobile money, Instant access)
- "Get Started" button → `/auth/phone`
- "Continue as Guest" button → `/app/map`
- Language selector (FR/EN)

**States:**
- Default: Clean landing with branding
- Loading: N/A (static page)

**Navigation:**
- → `/auth/phone` (authenticated flow)
- → `/app/map` (guest browsing)

**Accessibility:**
- Proper heading hierarchy (h1 for title)
- Keyboard navigable buttons
- High contrast text
- Focus indicators

---

#### 6.1.2 Phone Number Entry (`/auth/phone`)
**File:** `PhoneScreen.tsx`

**Purpose:**  
User enters their phone number to receive OTP for authentication.

**Key Components:**
- Phone input field (tel type, Burkina Faso format: +226 XX XX XX XX)
- Country code selector (default: +226)
- "Continue" button → Send OTP
- Back button → `/auth/welcome`

**Validation:**
- Required field
- Valid Burkina Faso phone format
- 8 digits after country code

**States:**
- Default: Empty input
- Typing: Real-time format validation
- Loading: Sending OTP (spinner on button)
- Error: Invalid format, network error
- Success: → `/auth/otp`

**Navigation:**
- ← `/auth/welcome`
- → `/auth/otp` (after OTP sent)

**Accessibility:**
- Label for phone input
- Error announcement for screen readers
- Auto-format as user types
- Clear error messages

---

#### 6.1.3 OTP Verification (`/auth/otp`)
**File:** `OTPScreen.tsx`

**Purpose:**  
User enters 6-digit OTP code received via SMS.

**Key Components:**
- 6-digit OTP input (individual boxes or single field)
- Phone number display (masked, e.g., +226 XX XX XX 45)
- "Verify" button
- "Resend code" link (with cooldown timer)
- "Change number" link → `/auth/phone`

**Validation:**
- 6 digits required
- Auto-submit when complete (optional)

**States:**
- Default: Empty OTP
- Typing: Fill boxes
- Loading: Verifying OTP
- Error: Invalid OTP, expired OTP
- Success: → `/auth/profile` (new user) or `/app/map` (returning user)

**Navigation:**
- ← `/auth/phone`
- → `/auth/profile` (new user)
- → `/app/map` (returning user)

**Accessibility:**
- Auto-focus first digit
- Paste support for full OTP
- Screen reader announces verification status
- Clear timer announcements

---

#### 6.1.4 Profile Setup (`/auth/profile`)
**File:** `ProfileSetupScreen.tsx`

**Purpose:**  
New user enters their name to complete profile.

**Key Components:**
- Name input field
- Optional: Profile picture upload
- "Complete Setup" button
- Skip button (optional)

**Validation:**
- Name required (min 2 characters)
- No special characters except spaces, hyphens, apostrophes

**States:**
- Default: Empty name
- Typing: Character count
- Loading: Creating profile
- Error: Validation errors
- Success: → `/app/map`

**Navigation:**
- → `/app/map` (profile complete)

**Accessibility:**
- Label for name input
- Character limit announcements
- Success message for completion

---

### 6.2 User Screens — Discovery & Purchase (6 screens)

#### 6.2.1 Map View (`/app/map`)
**File:** `MapScreen.tsx`

**Purpose:**  
Interactive map showing nearby Wi-Fi hotspots with real-time availability.

**Key Components:**
- Leaflet map centered on user location
- Hotspot markers (green = online, gray = offline)
- Current location indicator
- Search/filter button
- Bottom sheet with hotspot list
- Tab navigation (Map, List, Wallet, History, Settings)

**Data Displayed:**
- Hotspot name, distance, online status, minimum price
- Map clustering for dense areas

**States:**
- Loading: Skeleton map, "Locating..."
- Empty: "No hotspots nearby"
- Error: "Unable to load map"
- Success: Interactive map with markers

**Interactions:**
- Tap marker → `/app/hotspot/[id]`
- Drag map to explore
- Re-center button

**Navigation:**
- → `/app/hotspot/[id]` (marker tap)
- Bottom nav: List, Wallet, History, Settings

**Accessibility:**
- Map has accessible fallback (list view)
- Marker labels for screen readers
- Keyboard navigation between markers

---

#### 6.2.2 List View (`/app/list`)
**File:** `HotspotListScreen.tsx`

**Purpose:**  
Scrollable list of nearby hotspots, sorted by distance.

**Key Components:**
- Search bar
- Filter buttons (All, Online, Offline)
- Sort options (Distance, Price, Rating)
- Hotspot cards:
  - Name, landmark, distance
  - Online status badge
  - Minimum price
  - Rating (if available)
  - Quick "Select" button

**Data Displayed:**
- List of hotspots from `mockHotspots`
- Distance in meters/kilometers
- Status badges

**States:**
- Loading: Skeleton cards
- Empty: "No hotspots found"
- Filtered: Show active filters
- Error: Network error message

**Interactions:**
- Tap card → `/app/hotspot/[id]`
- Filter/sort updates list
- Pull to refresh

**Navigation:**
- → `/app/hotspot/[id]` (card tap)
- Bottom nav: Map, Wallet, History, Settings

**Accessibility:**
- List semantics for screen readers
- Filter buttons keyboard accessible
- Card focus states

---

#### 6.2.3 Hotspot Detail (`/app/hotspot/[id]`)
**File:** `HotspotDetailScreen.tsx`

**Purpose:**  
Show detailed information about a specific hotspot and available plans.

**Key Components:**
- Header:
  - Hotspot name
  - Status badge (online/offline)
  - Distance, landmark
  - Host rating
- Plans section:
  - Plan cards (duration, data, price)
  - "Select Plan" button per plan
- "How to Connect" button → `/app/connect-help`
- Back button

**Data Displayed:**
- Hotspot details from `mockHotspots`
- Plans from `mockPlans`
- Host rating, operating hours

**States:**
- Loading: Skeleton hotspot detail
- Offline: Show "Hotspot offline" banner
- No plans: "No plans available"
- Success: Full detail with plans

**Interactions:**
- Select plan → `/app/payment?planId=X&hotspotId=Y`
- View host rating details
- View location on map

**Navigation:**
- ← Back to list/map
- → `/app/payment` (plan selection)
- → `/app/connect-help`

**Accessibility:**
- Plan cards keyboard navigable
- Status announced for screen readers
- Price clearly labeled

---

#### 6.2.4 Payment Method Selection (`/app/payment`)
**File:** `PaymentScreen.tsx`

**Purpose:**  
User selects payment method for purchasing a plan.

**Key Components:**
- Plan summary card:
  - Hotspot name
  - Plan details (duration, data)
  - Total price
- Payment options:
  - ZemNet Wallet (show balance)
  - Wave
  - Orange Money
  - Moov Money
- "Confirm Payment" button
- Back button

**Data Displayed:**
- Selected plan and hotspot details
- Wallet balance
- Payment provider logos

**Validation:**
- Payment method selected
- Sufficient wallet balance (if using wallet)

**States:**
- Default: Payment method selection
- Wallet insufficient: Show top-up prompt
- Loading: Processing payment
- Error: Payment failed
- Success: → `/app/payment/status`

**Navigation:**
- ← `/app/hotspot/[id]`
- → `/app/payment/status` (payment initiated)

**Accessibility:**
- Radio group for payment methods
- Balance announced for wallet
- Clear pricing

---

#### 6.2.5 Payment Processing (`/app/payment/status`)
**File:** `PaymentStatusScreen.tsx`

**Purpose:**  
Show payment processing status with instructions for mobile money.

**Key Components:**
- Status indicator (pending/processing)
- Spinner animation
- Instructions:
  - "Check your phone for USSD prompt"
  - "Enter your PIN to confirm"
- Timer (payment timeout countdown)
- "I've Paid" button
- "Cancel Payment" button

**States:**
- Processing: Waiting for confirmation
- Success: → `/app/payment/success`
- Failed: Show error, offer retry
- Timeout: Offer to retry or cancel

**Real-time:**
- Poll payment status every 2 seconds
- Auto-redirect on success

**Navigation:**
- → `/app/payment/success` (on success)
- → `/app/payment` (retry)
- → `/app/hotspot/[id]` (cancel)

**Accessibility:**
- Live region for status updates
- Timer announced
- Clear action buttons

---

#### 6.2.6 Payment Success (`/app/payment/success`)
**File:** `PaymentSuccessScreen.tsx`

**Purpose:**  
Confirm successful payment and display voucher details.

**Key Components:**
- Success icon/animation
- "Payment Successful!" message
- Voucher card:
  - QR code
  - Voucher code (text)
  - Plan details
  - Expiry date/time
- "View in Wallet" button → `/app/wallet`
- "Done" button → `/app/map`
- "How to Connect" link → `/app/connect-help`

**Data Displayed:**
- Generated voucher details
- Transaction ID
- Hotspot name

**States:**
- Success: Show voucher
- Loading: Generating voucher (rare)

**Navigation:**
- → `/app/wallet` (view voucher)
- → `/app/map` (done)
- → `/app/connect-help`

**Accessibility:**
- Success announced loudly
- QR code has text alternative (voucher code)
- Clear next steps

---

### 6.3 User Screens — Wallet & History (7 screens)

#### 6.3.1 Wallet Screen (`/app/wallet`)
**File:** `WalletScreen.tsx`

**Purpose:**  
Display wallet balance, active vouchers, and top-up options.

**Key Components:**
- Header:
  - Wallet balance (large, prominent)
  - "Top Up" button → `/app/wallet/topup-qr`
- Tabs:
  - Active vouchers
  - Expired vouchers
  - Top-up requests
- Voucher cards:
  - Hotspot name
  - Plan details
  - Status (active/expired/used)
  - Expiry countdown
  - Tap to view details → `/app/wallet/[voucherId]`

**Data Displayed:**
- Wallet balance from user state
- Vouchers from `mockVouchers`
- Expiry times

**States:**
- Loading: Skeleton balance and vouchers
- Empty: "No vouchers yet"
- Active vouchers: Show list
- Success: Full wallet view

**Navigation:**
- → `/app/wallet/topup-qr` (top-up)
- → `/app/wallet/[voucherId]` (voucher detail)
- → `/app/wallet/topup-requests` (tab)

**Accessibility:**
- Balance prominently announced
- Voucher list semantics
- Expiry countdown accessible

---

#### 6.3.2 Voucher Detail (`/app/wallet/[voucherId]`)
**File:** `VoucherDetailScreen.tsx`

**Purpose:**  
Show detailed voucher information with QR code for redemption.

**Key Components:**
- Header: Back button, voucher status
- QR code (large, fullscreen tap option)
- Voucher code (text, copy button)
- Plan details:
  - Duration, data allowance
  - Hotspot name, location
  - Expiry date/time
- Usage stats (if active):
  - Data used / total
  - Time remaining
- "View Hotspot" button → `/app/hotspot/[id]`
- "How to Connect" link → `/app/connect-help`

**Data Displayed:**
- Voucher from `mockVouchers`
- Plan from `mockPlans`
- Hotspot from `mockHotspots`
- Real-time usage stats

**States:**
- Active: Show QR, usage stats
- Expired: Gray out, show expired message
- Used: Show completion status

**Navigation:**
- ← `/app/wallet`
- → `/app/hotspot/[id]`
- → `/app/connect-help`

**Accessibility:**
- QR code has text alternative
- Copy button for voucher code
- Usage stats clearly labeled

---

#### 6.3.3 Top-up QR Screen (`/app/wallet/topup-qr`)
**File:** `TopUpQRScreen.tsx`

**Purpose:**  
Display user's personal QR code for receiving wallet top-ups from hosts.

**Key Components:**
- Large QR code containing user ID
- User name and phone number
- Instructions: "Show this QR to a ZemNet host"
- "View Top-up Requests" button → `/app/wallet/topup-requests`
- Back button

**Data Displayed:**
- User's personal QR code
- User name, phone

**States:**
- Default: QR displayed
- Fullscreen: Tap to enlarge

**Navigation:**
- ← `/app/wallet`
- → `/app/wallet/topup-requests`

**Accessibility:**
- QR code labeled as "Top-up QR code"
- Instructions clear
- Fullscreen accessible

---

#### 6.3.4 Top-up Requests List (`/app/wallet/topup-requests`)
**File:** `TopUpRequestsScreen.tsx`

**Purpose:**  
List pending wallet top-up requests with status and actions.

**Key Components:**
- Header: "Top-up Requests"
- "Create Request" button (opens dialog)
- Request cards:
  - Amount requested
  - Status badge (pending/approved/rejected)
  - Date created
  - Host name (if assigned)
  - Tap to view details → `/app/wallet/topup-requests/[id]`
- Empty state: "No requests yet"

**Data Displayed:**
- Top-up requests from mock data
- Status, amount, date

**States:**
- Loading: Skeleton cards
- Empty: "No requests"
- Success: List of requests

**Navigation:**
- ← `/app/wallet`
- → `/app/wallet/topup-requests/[id]`

**Accessibility:**
- List semantics
- Status badges announced
- Card focus states

---

#### 6.3.5 Top-up Request Detail (`/app/wallet/topup-requests/[id]`)
**File:** `TopUpRequestDetailScreen.tsx`

**Purpose:**  
Show detailed view of a specific top-up request with QR and status.

**Key Components:**
- Header: Back button, status badge
- Request details:
  - Amount requested
  - Date created
  - Status (pending/approved/rejected)
- QR code (for host to scan)
- Host information (if approved)
- Action buttons:
  - Cancel request (if pending)
  - View receipt (if approved)

**Data Displayed:**
- Request details
- QR code for scanning
- Host info

**States:**
- Pending: Show QR, allow cancel
- Approved: Show receipt, host info
- Rejected: Show reason

**Navigation:**
- ← `/app/wallet/topup-requests`
- → `/app/wallet` (after approval)

**Accessibility:**
- QR code labeled
- Status changes announced
- Action buttons clear

---

#### 6.3.6 Purchase History (`/app/history`)
**File:** `HistoryScreen.tsx`

**Purpose:**  
Display complete purchase transaction history with filters.

**Key Components:**
- Header: "Purchase History"
- Filter chips:
  - All, Success, Pending, Failed
- Transaction cards:
  - Hotspot name
  - Payment method
  - Amount
  - Status badge
  - Date/time
  - Tap to view details → `/app/transaction-detail/[id]`
- Empty state: "No purchases yet"

**Data Displayed:**
- Purchases from `mockPurchases`
- Status, amount, date

**States:**
- Loading: Skeleton cards
- Empty: "No transactions"
- Filtered: Show active filter
- Success: Transaction list

**Navigation:**
- → `/app/transaction-detail/[id]` (card tap)

**Accessibility:**
- Filter buttons keyboard accessible
- Transaction list semantics
- Status announced

---

#### 6.3.7 Transaction Detail (`/app/transaction-detail/[id]`)
**File:** `TransactionDetailScreen.tsx`

**Purpose:**  
Display comprehensive transaction receipt with all details and actions.

**Key Components:**
- Header: Back button, "Transaction Details"
- Status card (color-coded):
  - Status icon
  - Status badge
  - Amount (large)
  - Date/time
- Transaction ID (with copy button)
- Hotspot information:
  - Name, location
  - Link to hotspot
- Plan details:
  - Name, duration, data
  - Price breakdown
- Payment information:
  - Method, status, date, time
- Voucher link (if successful)
- Actions:
  - Download receipt
  - Share transaction
  - Retry payment (if failed)
  - "I paid" button (if pending)

**Data Displayed:**
- Transaction from `mockPurchases`
- Hotspot from `mockHotspots`
- Plan from `mockPlans`

**States:**
- Success: Green card, show receipt
- Pending: Amber card, show retry options
- Failed: Red card, show retry button
- Not found: Error message

**Navigation:**
- ← `/app/history`
- → `/app/hotspot/[id]`
- → `/app/wallet/[voucherId]`

**Accessibility:**
- Status color + icon + text
- Copy button labeled
- Action buttons clear
- Download announces success

---

### 6.4 User Screens — Help & Support (1 screen)

#### 6.4.1 Connect Help (`/app/connect-help`)
**File:** `ConnectHelpScreen.tsx`

**Purpose:**  
Step-by-step instructions for connecting to Wi-Fi using voucher.

**Key Components:**
- Header: "How to Connect"
- Step-by-step guide:
  1. Go to Wi-Fi settings
  2. Find the hotspot network name
  3. Connect to network
  4. Open browser → Captive portal
  5. Enter voucher code
  6. Start browsing
- Screenshots/illustrations (optional)
- FAQ accordion:
  - "Can't find the network?"
  - "Voucher not working?"
  - "Connection dropped?"
- "Contact Support" button → `/app/support`

**States:**
- Default: Full guide visible
- Expanded FAQ: Accordion open

**Navigation:**
- ← Back to previous screen
- → `/app/support`

**Accessibility:**
- Numbered steps clear
- Accordion keyboard accessible
- High contrast screenshots

---

### 6.5 Host Screens — Onboarding (2 screens)

#### 6.5.1 Become a Host Intro (`/app/host/start`)
**File:** `HostStartScreen.tsx`

**Purpose:**  
Introduce host program and start KYC verification.

**Key Components:**
- Header: "Become a Host"
- Benefits section:
  - Earn money from your internet
  - Help your community
  - 2% commission on top-ups
- Requirements:
  - Stable internet connection
  - Valid ID for KYC
  - Compatible router
- "Start KYC Verification" button → `/app/host/kyc`
- "Learn More" accordion

**States:**
- Default: Intro content
- KYC already submitted: Show status
- KYC approved: Redirect to dashboard

**Navigation:**
- → `/app/host/kyc` (start verification)
- → `/app/host/dashboard` (if approved)

**Accessibility:**
- Benefits list clear
- Requirements checklist
- CTA prominent

---

#### 6.5.2 KYC Verification (`/app/host/kyc`)
**File:** `KYCScreen.tsx`

**Purpose:**  
Collect KYC information for host verification.

**Key Components:**
- Form fields:
  - Full name
  - ID type (dropdown: National ID, Passport, Driver's License)
  - ID number
  - Date of birth
  - Address
  - ID photo upload (front)
  - ID photo upload (back)
  - Selfie upload
- "Submit for Review" button
- Back button

**Validation:**
- All fields required
- ID number format
- Valid date of birth (18+)
- Photo file size limits

**States:**
- Empty: Form ready
- Uploading: Photo upload progress
- Submitting: "Submitting..."
- Success: "Under review" confirmation
- Error: Validation errors, upload failures

**Navigation:**
- ← `/app/host/start`
- → `/app/host/dashboard` (after submission, pending state)

**Accessibility:**
- Form labels clear
- File upload accessible
- Error messages specific
- Success confirmation

---

### 6.6 Host Screens — Operations (10 screens)

#### 6.6.1 Host Dashboard (`/app/host/dashboard`)
**File:** `HostDashboard.tsx`

**Purpose:**  
Central hub for host operations, stats, and quick actions.

**Key Components:**
- Header:
  - Host name
  - Online/offline toggle
  - Status badge
- Quick actions:
  - Top up customer → `/app/host/cashin`
  - My hotspots → `/app/host/hotspots`
- Add router button → `/app/host/claim`
- Stats cards (Today):
  - Sales amount
  - Sessions count
  - Active vouchers
- Earnings card (clickable):
  - Total earnings
  - Pending payout
  - Action buttons:
    - "Revenus détaillés" → `/app/host/earnings`
    - "Retraits" → `/app/host/payouts`
- Recent sessions list
  - "View all" → `/app/host/sessions`
- **Recent transactions list (clickable):**
  - Transaction cards showing:
    - Hotspot name
    - Payment method (Wave, Orange Money, Moov Money, Wallet)
    - Time
    - Amount
    - Status badge (Success/Pending/Failed/Expired)
  - Each card clickable → `/app/transaction-detail/[id]`
  - "View all" → `/app/history`
- Cash-in history link → `/app/host/cashin-history`
- Technician request banner (if pending)
- Request technician button → `/app/host/technician-requests`

**Data Displayed:**
- Today's stats
- Total earnings
- Recent sessions
- Recent transactions (from `mockPurchases`)
- Pending requests

**States:**
- Loading: Skeleton cards
- KYC pending: Show "Under review" banner
- KYC rejected: Show rejection message
- Active: Full dashboard

**Navigation:**
- → `/app/host/cashin`
- → `/app/host/hotspots`
- → `/app/host/claim`
- → `/app/host/earnings`
- → `/app/host/payouts`
- → `/app/host/sessions`
- → `/app/host/cashin-history`
- → `/app/host/technician-requests`
- → `/app/transaction-detail/[id]` (transaction card tap)
- → `/app/history` (view all transactions)

**Accessibility:**
- Stats clearly labeled
- Quick actions keyboard accessible
- Status toggle announced
- Transaction cards keyboard navigable with hover states
- ChevronRight icon indicates clickable items

---

#### 6.6.2 Claim Router (`/app/host/claim`)
**File:** `ClaimRouterScreen.tsx`

**Purpose:**  
Register a new router/hotspot using serial number.

**Key Components:**
- Header: "Add Router"
- Instructions: "Enter the serial number found on your ZemNet router"
- Serial number input (text or barcode scan)
- "Scan Barcode" button (camera)
- "Claim Router" button
- Back button

**Validation:**
- Serial number required
- Valid format check
- Serial not already claimed

**States:**
- Default: Empty input
- Scanning: Camera active
- Verifying: Check serial validity
- Success: → `/app/host/setup`
- Error: Invalid serial, already claimed

**Navigation:**
- ← `/app/host/dashboard`
- → `/app/host/setup` (serial verified)

**Accessibility:**
- Input labeled
- Scan button alternative text entry
- Error messages clear

---

#### 6.6.3 Hotspot Setup (`/app/host/setup`)
**File:** `HotspotSetupScreen.tsx`

**Purpose:**  
Initial configuration of newly claimed hotspot.

**Key Components:**
- Form fields:
  - Hotspot name
  - Landmark/location description
  - Operating hours (start/end time)
  - Wi-Fi network SSID
  - Wi-Fi password (optional, for reference)
- Location picker (map or coordinates)
- "Complete Setup" button
- Back button

**Validation:**
- Hotspot name required (3-50 chars)
- Landmark required
- Valid operating hours

**States:**
- Default: Form ready
- Saving: "Setting up..."
- Success: → `/app/host/hotspot/[id]`
- Error: Validation errors

**Navigation:**
- ← `/app/host/claim`
- → `/app/host/hotspot/[id]` (setup complete)

**Accessibility:**
- Form labels clear
- Time pickers accessible
- Location picker has text fallback

---

#### 6.6.4 Host Hotspots List (`/app/host/hotspots`)
**File:** `HostHotspotsScreen.tsx`

**Purpose:**  
List all hotspots owned by the host with management options.

**Key Components:**
- Header: "My Hotspots"
- Hotspot cards:
  - Name, status badge
  - Location, landmark
  - Active sessions count
  - Today's sales
  - "Manage" button → `/app/host/hotspot/[id]`
- "Add Router" button → `/app/host/claim`
- Empty state: "No hotspots yet"

**Data Displayed:**
- Host's hotspots filtered by `hostId`
- Stats per hotspot

**States:**
- Loading: Skeleton cards
- Empty: "Add your first router"
- Success: Hotspot list

**Navigation:**
- → `/app/host/hotspot/[id]`
- → `/app/host/claim`

**Accessibility:**
- Card list semantics
- Status badges announced
- Manage buttons clear

---

#### 6.6.5 Hotspot Management (`/app/host/hotspot/[id]`)
**File:** `HotspotManageScreen.tsx`

**Purpose:**  
Manage specific hotspot settings, plans, and operations.

**Key Components:**
- Header:
  - Hotspot name
  - Online/offline toggle
  - Sales pause toggle
  - Back button
- Tabs:
  - Plans
  - Settings
  - Stats
- **Plans Tab:**
  - Plan list (editable)
  - "Create Plan" button → Plan editor modal
  - Edit/Delete actions per plan
- **Settings Tab:**
  - Edit name, landmark, hours
  - Wi-Fi credentials
  - Delete hotspot (destructive)
- **Stats Tab:**
  - Today's sales, sessions
  - Chart: Sales over time
  - Active sessions list

**Data Displayed:**
- Hotspot from `mockHotspots`
- Plans from `mockPlans`
- Session stats

**States:**
- Loading: Skeleton tabs
- No plans: "Create your first plan"
- Success: Full management view

**Interactions:**
- Toggle online/offline
- Pause/resume sales
- Edit plan → Plan editor modal
- Delete plan (confirm)

**Navigation:**
- ← `/app/host/hotspots`
- Modal: Plan editor

**Accessibility:**
- Tab navigation keyboard accessible
- Toggles announced
- Delete confirmation modal

---

#### 6.6.6 Active Sessions Monitor (`/app/host/sessions`)
**File:** `SessionsScreen.tsx`

**Purpose:**  
Real-time monitor of active Wi-Fi sessions on host's hotspots.

**Key Components:**
- Header:
  - "Active Sessions"
  - Hotspot filter dropdown
  - Refresh button
- Session cards:
  - Device MAC address (masked)
  - Start time, duration
  - Data used
  - Plan type
  - Status (active/completed)
  - "End Session" button (if active)
- Empty state: "No active sessions"

**Data Displayed:**
- Sessions from mock data
- Real-time updates (polling)

**States:**
- Loading: Skeleton cards
- Empty: "No sessions"
- Active: Session list with updates
- Updating: Refresh animation

**Real-time:**
- Auto-refresh every 5 seconds
- Duration counter live updates

**Navigation:**
- ← `/app/host/dashboard`

**Accessibility:**
- Live region for updates
- Session list semantics
- End session confirm dialog

---

#### 6.6.7 Earnings Breakdown (`/app/host/earnings`)
**File:** `EarningsScreen.tsx`

**Purpose:**  
Detailed analytics of host earnings with charts and transactions.

**Key Components:**
- Header:
  - Back button
  - Period selector (Week/Month/Year)
- Summary cards:
  - Total sales
  - Platform fee (10%)
  - Cash-in commission (2%)
  - Net earnings
  - Pending payout
  - Paid out
- Chart: Sales over time (line/bar chart)
- Tabs:
  - Overview
  - Transactions
- **Transactions Tab:**
  - Transaction list:
    - Type (sale/cash-in)
    - Description
    - Amount, fee, net
    - Date

**Data Displayed:**
- Earnings summary
- Chart data by period
- Transaction history

**States:**
- Loading: Skeleton charts
- Empty: "No earnings yet"
- Success: Full breakdown

**Navigation:**
- ← `/app/host/dashboard`

**Accessibility:**
- Chart has data table alternative
- Summary cards clearly labeled
- Period selector keyboard accessible

---

#### 6.6.8 Payouts (`/app/host/payouts`)
**File:** `PayoutsScreen.tsx`

**Purpose:**  
Manage payout requests and view payout history.

**Key Components:**
- Header: "Payouts"
- Balance card:
  - Available for payout
  - Pending payout
  - "Request Payout" button (dialog)
- Payout history list:
  - Amount
  - Status (pending/approved/completed/rejected)
  - Payment method
  - Date requested, date completed
  - Reference number
- Empty state: "No payouts yet"

**Data Displayed:**
- Available balance
- Payout requests from mock data

**States:**
- Loading: Skeleton cards
- Empty: "Request your first payout"
- Success: Payout list

**Interactions:**
- Request payout (dialog):
  - Amount input
  - Payment method selection
  - Confirm button

**Navigation:**
- ← `/app/host/dashboard`

**Accessibility:**
- Balance prominently announced
- Payout list semantics
- Dialog keyboard accessible

---

#### 6.6.9 Cash-in Interface (`/app/host/cashin`)
**File:** `CashInScreen.tsx`

**Purpose:**  
Scan customer QR to top up their wallet and earn commission.

**Key Components:**
- Header: "Top Up Customer"
- QR scanner (camera)
- Manual entry option (user ID input)
- After scan:
  - Customer name, phone
  - Amount input
  - Commission preview (2%)
  - "Confirm Top-up" button
- Instructions: "Scan customer's QR code"

**Validation:**
- Valid user QR/ID
- Amount > 0
- Maximum limits

**States:**
- Scanning: Camera active
- Scanned: Show customer info
- Processing: "Topping up..."
- Success: Confirmation with receipt
- Error: Invalid QR, network error

**Navigation:**
- ← `/app/host/dashboard`
- → `/app/host/cashin-history` (after success)

**Accessibility:**
- Scanner has manual entry alternative
- Customer info announced
- Commission clearly shown

---

#### 6.6.10 Cash-in History (`/app/host/cashin-history`)
**File:** `CashInHistoryScreen.tsx`

**Purpose:**  
View history of wallet top-up transactions.

**Key Components:**
- Header: "Top-up History"
- Stats summary:
  - Total top-ups today
  - Commission earned today
- Transaction list:
  - Customer name (masked)
  - Amount topped up
  - Commission earned
  - Date/time
  - Status
- Empty state: "No top-ups yet"

**Data Displayed:**
- Cash-in transactions from mock data
- Commission calculations

**States:**
- Loading: Skeleton list
- Empty: "No transactions"
- Success: Transaction list

**Navigation:**
- ← `/app/host/dashboard`

**Accessibility:**
- Summary cards labeled
- Transaction list semantics
- Commission highlighted

---

### 6.7 Host Screens — Technical Support (3 screens)

#### 6.7.1 Technician Requests List (`/app/host/technician-requests`)
**File:** `TechnicianRequestsScreen.tsx`

**Purpose:**  
Manage technical support requests for hotspot issues.

**Key Components:**
- Header: "Service Requests"
- "Create Request" button → `/app/host/technician-requests/new`
- Tabs:
  - Pending
  - In Progress
  - Completed
- Request cards:
  - Issue type, description
  - Hotspot name
  - Status badge
  - Priority (low/medium/high)
  - Date created
  - Technician assigned (if any)
  - Tap to view → `/app/host/technician-requests/[id]`
- Empty state: "No requests"

**Data Displayed:**
- Service requests from mock data
- Status, priority

**States:**
- Loading: Skeleton cards
- Empty: "No requests"
- Success: Request list

**Navigation:**
- ← `/app/host/dashboard`
- → `/app/host/technician-requests/new`
- → `/app/host/technician-requests/[id]`

**Accessibility:**
- Tab navigation keyboard accessible
- Status badges announced
- Priority clearly shown

---

#### 6.7.2 Create Service Request (`/app/host/technician-requests/new`)
**File:** `CreateServiceRequestScreen.tsx`

**Purpose:**  
Submit a new technical support request.

**Key Components:**
- Header: "New Service Request"
- Form:
  - Hotspot selector (dropdown)
  - Issue type (dropdown):
    - Router offline
    - Slow connection
    - Configuration issue
    - Hardware problem
    - Other
  - Description (textarea)
  - Priority selector (low/medium/high)
  - Photo upload (optional)
- "Submit Request" button
- Back button

**Validation:**
- Hotspot required
- Issue type required
- Description required (min 10 chars)

**States:**
- Default: Empty form
- Uploading: Photo upload
- Submitting: "Submitting..."
- Success: → `/app/host/technician-requests/[id]`
- Error: Validation errors

**Navigation:**
- ← `/app/host/technician-requests`
- → `/app/host/technician-requests/[id]` (after submit)

**Accessibility:**
- Form labels clear
- Textarea character count
- File upload accessible

---

#### 6.7.3 Service Request Detail (`/app/host/technician-requests/[id]`)
**File:** `ServiceRequestDetailScreen.tsx`

**Purpose:**  
View detailed service request status and updates.

**Key Components:**
- Header:
  - Back button
  - Status badge
- Request details:
  - Request ID
  - Hotspot name
  - Issue type, description
  - Priority
  - Date created
  - Photos (if uploaded)
- Technician info (if assigned):
  - Name, phone
  - "Call Technician" button
- Status timeline:
  - Created
  - Assigned
  - In progress
  - Completed
- Updates/comments section
- Action buttons:
  - Cancel request (if pending)
  - Mark resolved (if completed)
  - Rate service (if completed)

**Data Displayed:**
- Request from mock data
- Technician info
- Status history

**States:**
- Pending: Show cancel option
- Assigned: Show technician info
- In progress: Show updates
- Completed: Show rating option

**Navigation:**
- ← `/app/host/technician-requests`

**Accessibility:**
- Timeline semantic structure
- Status changes announced
- Call button clearly labeled

---

### 6.8 Technician Screens (1 screen)

#### 6.8.1 Technician Dashboard (`/app/technician/dashboard`)
**File:** `TechnicianDashboard.tsx`

**Purpose:**  
Technician's work queue and task management.

**Key Components:**
- Header:
  - "My Assignments"
  - Status toggle (available/busy)
- Stats cards:
  - Pending tasks
  - Completed today
  - Average rating
- Tabs:
  - Assigned
  - Completed
- Task cards:
  - Request ID, issue type
  - Hotspot name, location
  - Host contact
  - Priority
  - Date assigned
  - "View Details" button
  - "Update Status" button

**Data Displayed:**
- Assigned requests
- Completion stats

**States:**
- Loading: Skeleton cards
- Empty: "No assignments"
- Success: Task list

**Navigation:**
- → Service request detail (from any request card)

**Accessibility:**
- Task list semantics
- Priority clearly indicated
- Action buttons accessible

---

### 6.9 Admin Screens (4 screens)

#### 6.9.1 Admin Dashboard (`/app/admin/dashboard`)
**File:** `AdminDashboard.tsx`

**Purpose:**  
System-wide overview and administrative controls.

**Key Components:**
- Header: "Admin Dashboard"
- Stats grid:
  - Total users
  - Active hosts
  - Total hotspots
  - Today's transactions
  - Platform revenue
- Quick actions:
  - User management → `/app/admin/users`
  - KYC review → `/app/admin/kyc`
  - Payout management → `/app/admin/payouts`
- Recent activity feed
- System health indicators

**Data Displayed:**
- Platform-wide statistics
- Recent activity

**States:**
- Loading: Skeleton stats
- Success: Full dashboard

**Navigation:**
- → `/app/admin/users`
- → `/app/admin/kyc`
- → `/app/admin/payouts`

**Accessibility:**
- Stats clearly labeled
- Quick actions keyboard accessible
- Activity feed semantic structure

---

#### 6.9.2 User Management (`/app/admin/users`)
**File:** `UserManagementScreen.tsx`

**Purpose:**  
Search, view, and manage user accounts.

**Key Components:**
- Header: "User Management"
- Search bar (name, phone, ID)
- Filter options:
  - Role (all/user/host/admin)
  - Status (all/active/suspended)
- User table:
  - Name, phone, email
  - Role badge
  - Status
  - Join date
  - Actions (view/edit/suspend)
- Pagination

**Data Displayed:**
- User list from mock data
- User counts

**States:**
- Loading: Skeleton table
- Empty: "No users found"
- Success: User table

**Interactions:**
- Search users
- Filter by role/status
- View user detail
- Suspend/activate user

**Navigation:**
- ← `/app/admin/dashboard`

**Accessibility:**
- Table semantics
- Search accessible
- Filter keyboard accessible

---

#### 6.9.3 KYC Review Queue (`/app/admin/kyc`)
**File:** `KYCReviewScreen.tsx`

**Purpose:**  
Review and approve/reject host KYC submissions.

**Key Components:**
- Header: "KYC Review"
- Tabs:
  - Pending
  - Approved
  - Rejected
- KYC submission cards:
  - Host name, phone
  - ID type, number
  - Submission date
  - "Review" button
- Review modal:
  - Full KYC details
  - ID photos (front, back)
  - Selfie photo
  - Zoom/rotate controls
  - "Approve" button
  - "Reject" button (with reason)

**Data Displayed:**
- KYC submissions from mock data
- ID photos

**States:**
- Loading: Skeleton cards
- Empty: "No pending reviews"
- Reviewing: Modal open
- Success: Updated status

**Interactions:**
- View KYC details
- Approve submission
- Reject with reason

**Navigation:**
- ← `/app/admin/dashboard`

**Accessibility:**
- Tab navigation keyboard accessible
- Image zoom accessible
- Modal keyboard trap
- Rejection reason required

---

#### 6.9.4 Payout Management (`/app/admin/payouts`)
**File:** `PayoutManagementScreen.tsx`

**Purpose:**  
Review and process host payout requests.

**Key Components:**
- Header: "Payout Management"
- Tabs:
  - Pending
  - Processing
  - Completed
  - Rejected
- Payout request cards:
  - Host name
  - Amount requested
  - Payment method
  - Date requested
  - Status
  - "Review" button
- Review modal:
  - Payout details
  - Host earnings breakdown
  - Platform fees
  - Net payout
  - "Approve" button
  - "Reject" button (with reason)
  - "Mark Paid" button (after approval)

**Data Displayed:**
- Payout requests from mock data
- Host earnings

**States:**
- Loading: Skeleton cards
- Empty: "No pending payouts"
- Reviewing: Modal open
- Success: Updated status

**Interactions:**
- Review payout
- Approve/reject
- Mark as paid

**Navigation:**
- ← `/app/admin/dashboard`

**Accessibility:**
- Tab navigation accessible
- Modal keyboard trap
- Action buttons clear

---

### 6.10 Shared Screens (5 screens)

#### 6.10.1 Settings (`/app/settings`)
**File:** `SettingsScreen.tsx`

**Purpose:**  
App configuration and preferences.

**Key Components:**
- Header: "Settings"
- Sections:
  - **Account:**
    - Name, phone (editable)
    - Email (optional)
    - "Edit Profile" button
  - **Preferences:**
    - Language selector (FR/EN)
    - Theme (Light/Dark/System)
    - Notifications toggle
  - **Privacy:**
    - Data sharing preferences
    - "View Privacy Policy" link
  - **App:**
    - Version number
    - "Check for updates"
    - "Clear cache"
  - **Danger Zone:**
    - "Delete Account" (destructive)

**States:**
- Default: Settings view
- Editing: Profile edit mode
- Saving: Update preferences
- Success: Confirmation toast

**Navigation:**
- → `/app/legal` (privacy policy)
- → `/app/about`

**Accessibility:**
- Settings grouped semantically
- Toggles keyboard accessible
- Destructive actions confirmed

---

#### 6.10.2 Support (`/app/support`)
**File:** `SupportScreen.tsx`

**Purpose:**  
Help center and contact options.

**Key Components:**
- Header: "Support"
- Contact methods:
  - Phone: +226 XX XX XX XX (call button)
  - Email: support@zemnet.bf (email button)
  - WhatsApp: Quick chat button
- FAQ accordion:
  - "How do I buy Wi-Fi?"
  - "How do I become a host?"
  - "Payment issues"
  - "Connection problems"
  - "Account management"
- "Send Feedback" button (dialog)

**States:**
- Default: FAQ collapsed
- Expanded: FAQ item open
- Sending: Feedback submission

**Navigation:**
- External: Phone dialer, email client, WhatsApp

**Accessibility:**
- Accordion keyboard accessible
- Contact buttons clearly labeled
- FAQ searchable

---

#### 6.10.3 About ZemNet (`/app/about`)
**File:** `AboutScreen.tsx`

**Purpose:**  
Information about ZemNet platform and mission.

**Key Components:**
- Header: "About ZemNet"
- Sections:
  - Logo and tagline
  - Mission statement
  - How it works (3-step visual)
  - Team/company info
  - Version number
- Social media links
- "Terms & Privacy" link → `/app/legal`

**States:**
- Default: About content

**Navigation:**
- → `/app/legal`
- External: Social media

**Accessibility:**
- Clear heading structure
- Social links labeled
- Content readable

---

#### 6.10.4 Legal (`/app/legal`)
**File:** `LegalScreen.tsx`

**Purpose:**  
Terms of Service, Privacy Policy, and licenses.

**Key Components:**
- Header: "Legal"
- Tabs:
  - Terms of Service
  - Privacy Policy
  - Open Source Licenses
- Scrollable content per tab
- Last updated date
- "Download PDF" button per document

**States:**
- Default: Terms tab
- Tab switching: Content updates

**Navigation:**
- ← Back to settings/about

**Accessibility:**
- Tab navigation keyboard accessible
- Content semantic structure
- Download buttons clear

---

### 6.11 Modal Overlays (2 modals)

#### 6.11.1 Fullscreen QR Viewer
**Component:** `FullscreenQRModal.tsx` (in `/src/app/components/modals/`)

**Purpose:**  
Display QR codes in fullscreen for easy scanning.

**Key Components:**
- Large QR code (centered)
- Close button (X)
- Label (e.g., "Voucher Code", "Top-up QR")
- Optional: Text code below QR

**Trigger:**
- Tap QR code on voucher detail, top-up QR, etc.

**States:**
- Open: Fullscreen overlay
- Closed: Hidden

**Navigation:**
- Close → Return to previous screen

**Accessibility:**
- Focus trap in modal
- Escape key closes
- QR code labeled

---

#### 6.11.2 Plan Editor Modal
**Component:** `PlanEditorModal.tsx` (in `/src/app/components/modals/`)

**Purpose:**  
Create or edit hotspot plans.

**Key Components:**
- Header: "Create Plan" or "Edit Plan"
- Form:
  - Plan name
  - Duration (input + unit selector)
  - Data limit (input + unit selector, or "Unlimited")
  - Price (XOF)
  - Active toggle
- Preset buttons:
  - 30min/100MB/100 XOF
  - 1h/200MB/150 XOF
  - 3h/500MB/300 XOF
  - ∞ Unlimited preset
- "Save" button
- "Cancel" button

**Validation:**
- Plan name required
- Duration > 0
- Data ≥ 0 (0 = unlimited)
- Price > 0

**States:**
- Create: Empty form
- Edit: Pre-filled form
- Saving: "Saving..."
- Success: Close modal, refresh plans
- Error: Validation errors

**Trigger:**
- "Create Plan" button on hotspot manage screen
- "Edit" button on plan card

**Navigation:**
- Save → Close modal
- Cancel → Close modal

**Accessibility:**
- Focus trap in modal
- Escape key closes
- Form labels clear
- Error messages specific

---

## 7. Implementation Notes

### 7.1 Screen Count Summary
- **Authentication:** 4 screens
- **User Discovery & Purchase:** 6 screens
- **User Wallet & History:** 7 screens
- **User Help:** 1 screen
- **Host Onboarding:** 2 screens
- **Host Operations:** 10 screens
- **Host Technical Support:** 3 screens
- **Technician:** 1 screen
- **Admin:** 4 screens
- **Shared:** 5 screens
- **Modals:** 2 modals

**Total: 36 screens + 2 modals**

### 7.2 Technical Requirements
- All screens follow mobile-first responsive design
- Accessibility is built-in from the start (WCAG 2.1 AA)
- French is the primary language with English support
- Real-time updates for sessions and payments
- Offline-capable guest browsing
- QR code-based voucher system for security
- Progressive Web App (PWA) capabilities

### 7.3 Code Architecture
- **Routing:** Custom route parsing in `MainApp.tsx` with query parameter support
- **State Management:** React Context API (`AppContext.tsx`)
- **Mock Data:** Comprehensive mock data in `mockData.ts`
- **Styling:** Tailwind CSS v4.0 with custom theme in `/src/styles/theme.css`
- **Components:** shadcn/ui component library
- **Icons:** lucide-react
- **QR Codes:** qrcode.react
- **Charts:** recharts
- **Maps:** leaflet + react-leaflet
- **Animations:** motion/react (formerly Framer Motion)
- **Notifications:** sonner

### 7.4 Testing System
- **Dev Panel:** Floating dev panel component for one-click user switching
- **Test Users:** Hardcoded test users covering all roles (user, host, technician, admin)
- **Routes:** `/dev/test-users` for testing documentation

### 7.5 Database Schema (Supabase)
Complete migration system with 7 migration files:
1. **001_initial_schema.sql** - Core tables (users, hotspots, plans, vouchers, sessions, purchases, transactions, etc.)
2. **002_rls_policies.sql** - Row Level Security policies for multi-tenant access control
3. **003_functions_and_triggers.sql** - Business logic functions (purchase processing, earnings tracking, etc.)
4. **004_seed_data.sql** - Test data matching TEST_CREDENTIALS.md
5. **005_admin_features.sql** - Admin dashboard functionality
6. **006_ratings.sql** - Rating and review system
7. **007_host_dashboard_optimizations.sql** ⭐ NEW - Performance optimizations for Host Dashboard
   - Composite indexes for faster queries
   - Denormalized `host_recent_transactions` view
   - Helper functions: `get_host_recent_transactions()`, `get_transaction_detail()`, `get_host_transaction_stats()`
   - ~60% faster dashboard loading

**Latest Update (December 23, 2024):**
- Added migration 007 to optimize Host Dashboard "Recent Transactions" feature
- Created composite indexes on purchases table for efficient querying
- Implemented denormalized view to eliminate JOIN overhead
- Added helper functions for transaction retrieval and analytics

**Deployment Guide:** See [/supabase/DEPLOY_NOW.md](/supabase/DEPLOY_NOW.md) for step-by-step deployment instructions.

---

**End of Complete Specification**