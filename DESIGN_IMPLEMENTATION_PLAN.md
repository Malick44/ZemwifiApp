# ZemNet Design Implementation Plan

Based on the comprehensive specification in `Prompt-repo/zemNet.md` and current app structure analysis.

## 📊 Current Status Assessment

### ✅ **Already Implemented**
- Basic navigation structure (Expo Router with (auth), (app), (modal) routes)
- Zustand stores (authStore, discoveryStore, walletStore, purchasesStore, cashInStore)
- Supabase integration and environment configuration
- Basic authentication flow (welcome, phone, OTP, profile)
- Simple list/map screens for hotspot discovery
- Hotspot detail view with plan selection
- Basic UI components (Button, themed components)

### 🚧 **Partially Implemented (Needs Enhancement)**
- User screens (basic structure exists, needs full UI/UX)
- Host screens (mostly placeholder files)
- Payment flow (structure exists, needs full implementation)
- Wallet screens (basic, needs voucher management)

### ❌ **Missing (High Priority)**
- Complete UI design system matching specification
- Interactive map with real markers and clustering
- Full payment flow with mobile money simulation
- Voucher QR code generation and display
- Cash-in flow (host and user sides)
- Host dashboard with earnings, analytics
- KYC submission flow
- Hotspot management (create, edit, pause sales)
- Plan editor modal
- Connect help screens
- Settings, support, legal, about screens

---

## 🎨 Design System Implementation

### Phase 1: Core UI Components (Week 1)

**Priority: CRITICAL** - Foundation for all screens

#### 1.1 Typography System
Create `src/components/ui/Typography.tsx`:
```typescript
- Heading1 (32px, bold) - Screen titles
- Heading2 (24px, semibold) - Section headers
- Heading3 (18px, semibold) - Card headers
- Body (16px, regular) - Main text
- Caption (14px, regular) - Secondary text
- Label (12px, medium) - Form labels
```

#### 1.2 Color System
Extend `constants/theme.ts`:
```typescript
Colors:
  - Primary: #0066CC (ZemNet blue)
  - Success: #10B981 (green for online status)
  - Warning: #F59E0B (amber for pending)
  - Error: #EF4444 (red for offline/errors)
  - Gray scale: 50-900
  - Background: Light #F9FAFB, Dark #111827
```

#### 1.3 Component Library
Create in `src/components/ui/`:

**Critical Components:**
- `Card.tsx` - Hotspot cards, plan cards, voucher cards
- `Badge.tsx` - Online/offline status, payment status
- `Input.tsx` - Text input with validation states
- `Select.tsx` - Dropdown picker
- `Switch.tsx` - Toggle for sales on/off
- `Modal.tsx` - Bottom sheets, confirmations
- `EmptyState.tsx` - No data illustrations
- `LoadingState.tsx` - Skeleton loaders
- `ErrorState.tsx` - Error messages with retry

**Secondary Components:**
- `Avatar.tsx` - User/host profile pictures
- `Chip.tsx` - Filter tags, categories
- `ProgressBar.tsx` - Top-up progress, session usage
- `Tabs.tsx` - Wallet tabs, dashboard tabs
- `SearchBar.tsx` - Hotspot search
- `QRCode.tsx` - Voucher QR display (using `react-native-qrcode-svg`)

---

## 📱 Screen-by-Screen Implementation Plan

### Phase 2: Authentication Screens (Week 1-2)

#### 2.1 Welcome Screen Enhancement
**File:** `app/(auth)/welcome.tsx`
**Current:** Basic structure
**Needs:**
- ZemNet branding with logo and gradient background
- Feature highlights with icons (3 cards):
  - "Trouvez du Wi-Fi près de vous"
  - "Payez avec mobile money"
  - "Accès instantané"
- Language selector (FR/EN) with i18n integration
- "Commencer" button (primary, large)
- "Continuer en invité" button (secondary, outline)

**Design Specs:**
- Full-screen gradient background (#0066CC to #0052A3)
- White text for contrast
- Safe area padding
- Animations: Fade in logo, slide up buttons

#### 2.2 Phone Input Enhancement
**File:** `app/(auth)/phone.tsx`
**Current:** Basic input
**Needs:**
- Country code selector (+226 locked for Burkina Faso)
- Phone number input with formatting (XX XX XX XX)
- Real-time validation
- Keyboard type: phone-pad
- Error states: "Numéro invalide", "Ce numéro existe déjà"
- Loading state when submitting

**Validation:**
- Burkina Faso: +226 + 8 digits
- Format display as: +226 70 12 34 56

#### 2.3 OTP Verification Enhancement
**File:** `app/(auth)/otp.tsx`
**Current:** Basic OTP
**Needs:**
- 6-digit OTP input with auto-focus
- Individual boxes for each digit
- Auto-submit when complete
- Resend timer (60 seconds countdown)
- "Renvoyer le code" button
- Error state: "Code invalide"

**UX Flow:**
- Auto-advance between boxes
- Paste support (detect 6-digit paste)
- Clear button
- Loading state during verification

#### 2.4 Profile Setup Enhancement
**File:** `app/(auth)/profile.tsx`
**Current:** Basic name input
**Needs:**
- Full name input with validation
- Optional profile photo picker
- Terms of service checkbox
- Privacy policy link
- "Terminer" button
- Skip button (use phone number as name)

---

### Phase 3: User Discovery Screens (Week 2-3)

#### 3.1 Map View (Priority: HIGH)
**File:** `app/(app)/(user)/map.tsx`
**Current:** FlatList placeholder
**Needs:**

**Option A: Real Map (Recommended)**
Install: `expo-location` + `react-native-maps`
```typescript
Features:
- User location marker (blue dot with pulse)
- Hotspot markers:
  - Green pin = online
  - Gray pin = offline
  - Custom icon with ZemNet logo
- Tap marker → Bottom sheet with hotspot preview
- Map clustering for dense areas (using react-native-map-clustering)
- "Re-center" button to return to user location
- Search bar overlay at top
- Filter chips below search (All, Online, Price)
```

**Map Controls:**
- Zoom in/out buttons
- Current location button
- Radius selector (1km, 5km, 10km, 20km)

**Bottom Sheet Preview:**
- Hotspot name
- Distance (e.g., "450m")
- Online status badge
- Minimum price (e.g., "À partir de 100 XOF")
- Quick "Select" button → hotspot detail

**States:**
- Loading: Show map with loading overlay
- No permission: Show error + "Enable location" button
- No hotspots: Show empty state overlay
- Error: Show error message with retry

#### 3.2 List View Enhancement
**File:** `app/(app)/(user)/list.tsx`
**Current:** Basic FlatList
**Needs:**

**Header Section:**
- Search bar (filter by name/landmark)
- Sort dropdown (Distance, Price, Rating, Name)
- Filter chips (All, Online, Offline, Price range)
- Results count (e.g., "12 hotspots trouvés")

**Hotspot Cards:**
```typescript
Each card shows:
- Hotspot name (bold)
- Landmark/address (gray, smaller)
- Distance (e.g., "1.2 km" with location icon)
- Online status badge (green "En ligne" or gray "Hors ligne")
- Minimum price (bold, e.g., "100 XOF")
- Rating stars (if available)
- Quick "Voir" button
```

**Card Layout:**
- Left: Hotspot info (name, landmark, distance)
- Right: Status badge + price + button
- Tap anywhere on card → hotspot detail
- Pull to refresh
- Infinite scroll for pagination

**States:**
- Loading: Skeleton cards (3-5 shimmer placeholders)
- Empty: Illustration + "Aucun hotspot trouvé"
- Filtered: Show active filters with clear button
- Error: Error message + retry button

#### 3.3 Hotspot Detail Enhancement
**File:** `app/(app)/(user)/hotspot/[id].tsx`
**Current:** Basic detail view
**Needs:**

**Header Section:**
- Large hotspot name
- Landmark with map pin icon
- Distance from user
- Online status (large badge)
- "Signaler" button (report issues)

**Location Section:**
- Mini map showing hotspot location
- Address/landmark text
- "Get Directions" button (opens Maps app)

**Plans Section:**
- Section title: "Plans disponibles"
- Plan cards (list):
  ```
  Card shows:
  - Plan name (e.g., "1 heure")
  - Duration (e.g., "1h00")
  - Data limit (e.g., "100 MB")
  - Price (large, bold, e.g., "150 XOF")
  - "Popular" badge (if most purchased)
  - "Acheter" button
  ```
- Horizontal scroll for many plans (optional)
- Empty state: "Aucun plan actif"

**Host Info Section:**
- Host name
- Rating (if available)
- "Contacter l'hôte" button

**Bottom Action:**
- Sticky "Buy" button for selected plan
- Shows total: "Acheter pour 150 XOF"

**States:**
- Loading: Skeleton for hotspot + plans
- Offline hotspot: Show warning banner "Ce hotspot est hors ligne"
- No plans: Show empty state
- Error: Error message

---

### Phase 4: Payment Flow (Week 3-4)

#### 4.1 Payment Method Selection
**File:** `app/(app)/(user)/payment/method.tsx`
**Current:** Doesn't exist
**Needs:**

**Header:**
- Plan summary (name, price, hotspot)
- Total amount (large, bold)

**Payment Methods:**
Radio buttons with detailed cards:
```
1. Portefeuille ZemNet
   - Current balance: XXX XOF
   - Badge: "Rapide" or "Solde insuffisant"
   
2. Wave
   - Logo + name
   - "Paiement mobile"
   
3. Orange Money
   - Logo + name
   - "Paiement mobile"
   
4. Moov Money
   - Logo + name
   - "Paiement mobile"
```

**Bottom Section:**
- Terms checkbox
- "Confirmer le paiement" button
- Secure payment badge

**States:**
- Wallet selected: Show balance check
- Insufficient funds: Disable confirm, show "Top-up" button
- Mobile money: Show external payment flow info

#### 4.2 Payment Processing
**File:** `app/(app)/(user)/payment/status.tsx`
**Current:** Doesn't exist
**Needs:**

**Simulation Flow:**
For mobile money (Wave/Orange/Moov):
```
1. Show "Processing" screen:
   - Animation (spinner or dots)
   - "Paiement en cours..."
   - Timer (simulate 3-5 seconds)
   
2. Mock external flow:
   - "Ouvrez votre app Wave/Orange/Moov"
   - "Entrez votre code PIN"
   - Countdown timer
   
3. Auto-redirect to success/failure
```

For wallet:
- Instant success (no processing screen)
- Direct to success screen

**States:**
- Processing: Loading animation
- Waiting: External app instructions
- Timeout: Show retry button
- Error: Show error message + support link

#### 4.3 Payment Success/Failure
**File:** `app/(app)/(user)/payment/success.tsx`
**Current:** Doesn't exist
**Needs:**

**Success Screen:**
- Large checkmark animation
- "Paiement réussi!"
- Voucher preview card:
  - Hotspot name
  - Plan details
  - Expiry date
  - QR code preview (small)
- Actions:
  - "Voir le voucher" → wallet/[voucherId]
  - "Connecter maintenant" → connect-help
  - "Retour à l'accueil" → map

**Failure Screen:**
- Error icon animation
- "Paiement échoué"
- Reason (e.g., "Solde insuffisant", "Paiement annulé")
- Actions:
  - "Réessayer" → back to payment method
  - "Recharger portefeuille" → wallet/topup-qr
  - "Retour" → hotspot detail

---

### Phase 5: Wallet & Vouchers (Week 4-5)

#### 5.1 Wallet Screen Enhancement
**File:** `app/(app)/(user)/wallet/index.tsx`
**Current:** Basic structure
**Needs:**

**Header:**
- Large balance display: "2,500 XOF"
- "Recharger" button (prominent)
- Mini chart showing spending trend (optional)

**Tabs:**
- Active (default)
- Expired
- Used
- Requests (cash-in requests from hosts)

**Active Vouchers:**
Voucher cards showing:
- Hotspot name
- Plan name (e.g., "1 heure")
- Expiry countdown:
  - Red if < 24 hours
  - Orange if < 7 days
  - Green if > 7 days
- Status badge (Unused)
- Tap to view QR → wallet/[voucherId]

**Empty States:**
- Active: "Aucun voucher actif"
- Expired: "Aucun voucher expiré"
- Used: "Aucun historique"

**Pull to Refresh:**
- Update vouchers from Supabase
- Update balance

#### 5.2 Voucher Detail (QR Display)
**File:** `app/(app)/(user)/wallet/[voucherId].tsx`
**Current:** Doesn't exist
**Needs:**

**Full-Screen QR:**
- Large QR code (centered, 60% of screen)
- White background (for scanner compatibility)
- Voucher code below QR (text, 16pt)
- Copy button for code
- Brightness boost notice

**Voucher Info:**
- Hotspot name
- Plan details (duration, data)
- Expiry time (countdown)
- Status (Active/Used/Expired)

**Actions:**
- "Connect Help" button
- "Share" button (share code as text)
- "Report Problem" button

**Auto-Refresh:**
- Check voucher status every 30 seconds
- Show toast if used/expired

#### 5.3 Top-Up QR Screen
**File:** `app/(app)/(user)/wallet/topup-qr.tsx`
**Current:** Doesn't exist
**Needs:**

**QR Code Display:**
- User's wallet QR code (contains user ID)
- "Show this to a host to top up"
- User ID displayed as text
- Copy button

**Instructions:**
1. "Find a ZemNet host"
2. "Show them this QR"
3. "Give them cash"
4. "Confirm the request"

**Recent Requests:**
- List of pending cash-in requests
- Show: amount, host name, expiry timer
- Tap to view detail

#### 5.4 Cash-In Request Detail
**File:** `app/(app)/(user)/wallet/topup-requests/[id].tsx`
**Current:** Doesn't exist
**Needs:**

**Request Card:**
- Host name
- Amount (large)
- Commission (host earns 2%)
- Expiry countdown (10 minutes)
- Request time

**Action Buttons:**
- "Confirmer" (large, green)
- "Annuler" (secondary, red)

**Confirmation Dialog:**
- "Avez-vous donné XXX XOF à [host]?"
- Confirm/Cancel buttons

**States:**
- Pending: Show countdown + buttons
- Expired: Show "Expiré" badge
- Confirmed: Show success + new balance

---

### Phase 6: Host Screens (Week 5-7)

#### 6.1 Host Start/Onboarding
**File:** `app/(app)/(host)/start.tsx`
**Current:** Placeholder
**Needs:**

**Hero Section:**
- "Devenez hôte ZemNet"
- Benefits list:
  - "Monétisez votre connexion internet"
  - "Gagnez jusqu'à XXX XOF/mois"
  - "Aide 24/7"
- Large "Commencer" button

**Requirements Checklist:**
- ✓ Connexion internet stable
- ✓ Routeur Wi-Fi
- ✓ Pièce d'identité (KYC)
- ✓ Informations de paiement

**Action:**
- "Commencer KYC" → kyc screen

#### 6.2 KYC Submission
**File:** `app/(app)/(host)/kyc.tsx`
**Current:** Placeholder
**Needs:**

**Form Fields:**
1. Full name
2. ID type (dropdown: National ID, Passport, Driver License)
3. ID number
4. Date of birth
5. Address
6. City
7. Business name (optional)
8. Photo uploads:
   - ID front (camera + gallery)
   - ID back
   - Selfie

**Validation:**
- All fields required except business name
- Photo validation (size, format)
- Real-time validation feedback

**Submit:**
- "Submit for review" button
- Confirmation dialog
- Success screen: "We'll review in 24-48h"

**States:**
- Draft: Save progress locally
- Submitting: Show progress
- Submitted: Show pending status
- Approved: Redirect to dashboard
- Rejected: Show reason + edit button

#### 6.3 Host Dashboard
**File:** `app/(app)/(host)/dashboard.tsx`
**Current:** Placeholder
**Needs:**

**Header Stats:**
Cards showing (grid layout):
- Today's earnings
- Active hotspots
- Pending payouts
- Total sessions

**Quick Actions:**
- "Create Hotspot" → claim
- "Cash-In" → cashin
- "Request Payout" → payouts

**Recent Activity:**
- Latest sales
- Recent sessions
- Pending cash-ins

**Charts (Optional):**
- Earnings trend (last 7 days)
- Most popular hotspot

#### 6.4 Hotspot Claim
**File:** `app/(app)/(host)/claim.tsx`
**Current:** Doesn't exist
**Needs:**

**QR Scanner:**
- Camera view (full screen)
- Scanner overlay with guides
- "Scan router QR code" instructions
- Manual entry fallback (router serial)

**After Scan:**
- Show router info
- Confirm: "Is this your router?"
- → Setup screen

#### 6.5 Hotspot Setup
**File:** `app/(app)/(host)/setup.tsx`
**Current:** Doesn't exist
**Needs:**

**Form:**
1. Hotspot name (required, 3-50 chars)
2. Landmark/location (required, textarea)
3. Address (optional)
4. GPS location (auto-detect + manual override)
5. Operating hours:
   - Start time picker
   - End time picker
   - "24/7" checkbox
6. Wi-Fi SSID (auto-fill from router)
7. Wi-Fi password (for reference, optional)

**Map Preview:**
- Show pin on map
- Drag to adjust location

**Submit:**
- "Complete Setup" → hotspot detail

#### 6.6 Hotspot Management
**File:** `app/(app)/(host)/hotspot/[id].tsx`
**Current:** Placeholder
**Needs:**

**Header:**
- Hotspot name (editable)
- Online status toggle (large switch)
- Sales paused toggle
- Edit button

**Stats:**
- Today's revenue
- Active vouchers
- Total sessions
- Average session duration

**Plans Section:**
- List of plans with:
  - Name, duration, price
  - Active/inactive toggle
  - Edit button
- "Add Plan" button → (modal)/plan-editor

**Actions:**
- "View Sessions" → sessions
- "View Earnings" → earnings
- "Delete Hotspot" (danger zone)

#### 6.7 Plan Editor Modal
**File:** `app/(modal)/plan-editor.tsx`
**Current:** Doesn't exist
**Needs:**

**Form:**
1. Plan name (required)
2. Duration (picker: 30min, 1h, 2h, 4h, 8h, 24h, custom)
3. Data limit (picker: Unlimited, 100MB, 500MB, 1GB, 5GB, custom)
4. Price (XOF, numeric input)
5. Active toggle

**Validation:**
- Name required (3-50 chars)
- Duration > 0
- Price > 0 (suggested minimum: 50 XOF)

**Preview:**
- Show how plan will appear to users

**Actions:**
- "Save" (create or update)
- "Delete" (if editing existing)
- "Cancel"

#### 6.8 Cash-In Initiation
**File:** `app/(app)/(host)/cashin.tsx`
**Current:** Placeholder
**Needs:**

**QR Scanner:**
- Scan user's wallet QR
- Or manual phone number entry

**Amount Entry:**
- Numeric keypad
- Show commission calculation (2%)
- "You will earn: XX XOF"

**Confirmation:**
- User info preview (phone, name if available)
- Amount + commission
- "Create Request" button

**Success:**
- Show countdown (10 minutes)
- "Waiting for user confirmation..."
- Status updates in real-time

**States:**
- Scanning: Camera active
- Entering amount: Keypad visible
- Creating: Loading
- Pending: Show countdown
- Confirmed: Show success + balance update
- Expired: Show expired notice

#### 6.9 Cash-In History
**File:** `app/(app)/(host)/cashin-history.tsx`
**Current:** Placeholder
**Needs:**

**Filter:**
- All, Pending, Confirmed, Expired, Cancelled

**List:**
Cards showing:
- User phone (masked: +226 70 ** ** **)
- Amount
- Commission earned
- Status badge
- Timestamp
- Tap for details

**Empty:** "No cash-in history"

---

### Phase 7: Shared Screens (Week 7-8)

#### 7.1 Settings
**File:** `app/(app)/(shared)/settings.tsx`
**Current:** Placeholder
**Needs:**

**Sections:**

**Account:**
- Profile info (name, phone)
- Edit profile button
- Change language
- Notification preferences

**Security:**
- Change PIN (future)
- Biometric toggle (future)

**Preferences:**
- Currency display
- Distance units (km/m)
- Theme (light/dark/auto)

**Actions:**
- "About ZemNet" → about
- "Legal" → legal
- "Support" → support
- "Log Out" (red, bottom)

#### 7.2 Support
**File:** `app/(app)/(shared)/support.tsx`
**Current:** Placeholder
**Needs:**

**FAQ:**
- Expandable sections (accordion)
- Search bar for FAQs
- Categories:
  - Account
  - Payments
  - Vouchers
  - Hosting
  - Technical

**Contact:**
- Email support button
- WhatsApp support button
- Phone number (click to call)

**Guides:**
- "How to connect to a hotspot"
- "How to become a host"
- "Payment methods guide"

#### 7.3 Legal
**File:** `app/(app)/(shared)/legal.tsx`
**Current:** Placeholder
**Needs:**

**Documents:**
- Terms of Service (full text or webview)
- Privacy Policy
- Refund Policy
- Host Agreement

**Each doc:**
- Scrollable text
- Last updated date
- Download/share button

#### 7.4 About
**File:** `app/(app)/(shared)/about.tsx`
**Current:** Placeholder
**Needs:**

**Info:**
- ZemNet logo
- App version
- Build number
- "Made with ❤️ in Burkina Faso"

**Links:**
- Website
- Social media (Facebook, Twitter)
- GitHub (open source components)

**Legal:**
- © 2025 ZemNet
- "All rights reserved"

#### 7.5 Connect Help
**File:** `app/(app)/(user)/connect-help.tsx`
**Current:** Doesn't exist
**Needs:**

**Step-by-Step Guide:**

**Step 1: Join Network**
- "Go to Wi-Fi settings"
- Hotspot SSID shown (copy button)
- Visual: Screenshot of Wi-Fi list

**Step 2: Open Browser**
- "Wait for captive portal"
- If doesn't open: "Visit any website"
- Visual: Browser icon

**Step 3: Enter Code**
- "Paste voucher code"
- Code shown with copy button
- Visual: Input field mockup

**Step 4: Connect**
- "Tap 'Connect' button"
- Success message
- Visual: Connected icon

**Troubleshooting:**
- "Portal not opening"
- "Code not working"
- "Can't connect"
- Each has solutions

**Offline Support:**
- All instructions available offline
- No internet required to view

---

## 🎯 Implementation Priorities

### **CRITICAL (Week 1-2)** - MVP Core
1. UI Component library (Card, Badge, Input, Button, Modal)
2. Authentication flow polish (Welcome, Phone, OTP, Profile)
3. Hotspot discovery (List view with real data)
4. Hotspot detail with plan selection
5. Basic payment flow (wallet only)
6. Voucher display with QR code

### **HIGH (Week 3-4)** - Essential Features
7. Map view with markers
8. Payment method selection (mobile money simulation)
9. Wallet management (active vouchers, balance)
10. Top-up QR generation
11. Cash-in flow (host initiates, user confirms)
12. Host dashboard basics

### **MEDIUM (Week 5-6)** - Host Features
13. KYC submission
14. Hotspot claim and setup
15. Hotspot management (toggle, edit)
16. Plan editor modal
17. Cash-in history
18. Earnings and payouts views

### **LOW (Week 7-8)** - Polish & Support
19. Settings screen
20. Support and FAQ
21. Legal documents
22. About screen
23. Connect help guide
24. Advanced filters and search
25. Animations and transitions

---

## 🛠️ Technical Improvements

### **State Management**
- Add error handling to all Zustand actions
- Implement optimistic updates for better UX
- Add offline persistence for critical data (vouchers, balance)

### **Navigation**
- Implement deep linking for vouchers, hotspots
- Add navigation guards for auth-required screens
- Breadcrumb navigation for nested screens

### **Performance**
- Implement FlatList optimization (getItemLayout, keyExtractor)
- Add image caching for hotspot photos
- Lazy load map markers for large datasets
- Implement pagination for lists

### **Internationalization**
- Set up react-i18next
- Create translation files (FR, EN)
- Add language switcher to Welcome and Settings
- Translate all screen texts

### **Offline Support**
- Cache hotspot data using AsyncStorage
- Store vouchers locally
- Show offline indicator in UI
- Queue actions for when back online

### **Testing**
- Unit tests for stores (Zustand actions)
- Integration tests for payment flow
- E2E tests for critical paths (signup, purchase)

---

## 📦 Required Dependencies

Install these packages:

```bash
# UI & Design
npm install react-native-qrcode-svg
npm install react-native-svg
npm install @react-native-picker/picker
npm install react-native-modal

# Maps & Location
npm install react-native-maps
npm install expo-location
npm install react-native-map-clustering

# Utilities
npm install date-fns
npm install i18next react-i18next
npm install @react-native-async-storage/async-storage

# Camera & Media
npm install expo-camera
npm install expo-image-picker
npm install expo-file-system

# Optional Enhancements
npm install react-native-reanimated
npm install lottie-react-native
```

---

## ✅ Acceptance Criteria (Per Spec)

- [ ] Guest can browse hotspots (map/list) without login
- [ ] OTP flow results in authenticated session
- [ ] User can select plan, complete payment, receive voucher
- [ ] Wallet shows vouchers with QR codes and balance
- [ ] Host can create cash-in request; user confirms; balance updates
- [ ] French/English toggle changes UI text
- [ ] Loading/empty/error states for every list
- [ ] Supabase reads work for discovery (online hotspots + plans)
- [ ] Authenticated user can read vouchers/purchases (RLS enforced)
- [ ] Offline mode shows cached hotspots/vouchers from Zustand

---

## 📝 Design References

All design specifications are in:
- `Prompt-repo/zemNet.md` - Complete screen specs with layouts
- `docs/zemNet-expo-build-prompt.md` - Implementation guide
- `Prompt-repo/app-phase1.txt` - Detailed IA and screen behaviors

### Key Design Principles from Spec:
1. **Mobile-first** - Optimize for small screens
2. **Offline-capable** - Critical features work without internet
3. **Accessible** - Min 44px tap targets, proper labels
4. **Bilingual** - FR/EN support throughout
5. **Visual hierarchy** - Clear CTAs, status indicators
6. **Error-friendly** - Clear error messages with actions
7. **Loading states** - Skeleton loaders, not just spinners

---

## 🚀 Next Steps

1. **Review this plan** with team/stakeholders
2. **Set up UI component library** (Week 1 priority)
3. **Install required dependencies** listed above
4. **Create design tokens** in `constants/theme.ts`
5. **Build one complete flow** end-to-end (User discovery → Purchase → Voucher) as proof of concept
6. **Iterate based on user feedback**

---

**Questions or need clarification on any screen?** Refer back to:
- `/Prompt-repo/zemNet.md` - lines 235-1400 for detailed screen specs
- `/docs/zemNet-expo-build-prompt.md` - lines 183-330 for implementation notes
