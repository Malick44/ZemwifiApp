# ZemNet WiFi Marketplace

**A mobile marketplace for discovering, purchasing, and managing WiFi hotspot access.**

Built with Expo, React Native, Supabase, and Zustand. Features offline-ready state management, QR code generation, multi-role support (user/host/technician), and full internationalization (FR/EN).

---

## 📱 Features

### For Users
- **Guest Discovery**: Browse WiFi hotspots without authentication
- **OTP Authentication**: Secure phone-based sign-in
- **Plan Purchase**: Buy WiFi access with wallet or mobile money
- **QR Vouchers**: Generate QR codes for hotspot access
- **Wallet Management**: View balance, top-up, manage active vouchers
- **Transaction History**: Filter and review all purchases
- **Offline Access**: Vouchers cached locally for offline use

### For Hosts
- **Dashboard**: Real-time earnings, sessions, and sales statistics
- **Cash-In Management**: Create and confirm cash deposit requests
- **QR Generation**: Generate QR codes for user cash deposits
- **Host Controls**: Manage hotspot settings and availability

### For Technicians
- **Diagnostics Dashboard**: Monitor system health and connectivity
- **Support Tools**: Access repair and maintenance workflows

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase account (for backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ZemwifiApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=your-anon-key
   ```

4. **Set up Supabase database**
   
   Run migrations in order from `Prompt-repo/supabase/migrations/`:
   ```sql
   -- In Supabase SQL Editor:
   001_initial_schema.sql
   002_rls_policies.sql
   003_functions_and_triggers.sql
   004_seed_data.sql
   005_admin_features.sql
   006_ratings.sql
   ```

5. **Start the development server**
   ```bash
   npx expo start
   ```
   
   Press `i` for iOS, `a` for Android, or scan QR code with Expo Go app.

---

## 🏗️ Project Structure

```
ZemwifiApp/
├── app/                      # Expo Router screens
│   ├── (auth)/              # Authentication flows
│   ├── (app)/               # Main app (user/host/technician)
│   └── (modal)/             # Modal screens (QR display)
├── src/
│   ├── stores/              # Zustand state management
│   │   ├── authStore.ts     # Authentication & user profile
│   │   ├── discoveryStore.ts # Hotspot discovery & filtering
│   │   ├── walletStore.ts   # Balance & voucher management
│   │   ├── purchasesStore.ts # Purchase flow & history
│   │   └── cashInStore.ts   # Host cash-in requests
│   ├── lib/                 # Utilities
│   │   ├── supabase.ts      # Supabase client
│   │   ├── format.ts        # Formatters (currency, date, etc.)
│   │   ├── i18n.ts          # Internationalization (FR/EN)
│   │   └── errors.ts        # Error handling
│   ├── types/
│   │   └── domain.ts        # TypeScript interfaces
│   └── components/          # Reusable UI components
├── Prompt-repo/supabase/    # Database migrations
└── docs/                    # Documentation
```

---

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Auth store tests
npm test -- authStore.test.ts

# Discovery store tests
npm test -- discoveryStore.test.ts
```

### Manual Testing Checklist
- [ ] Guest can browse hotspots without signing in
- [ ] OTP authentication flow completes successfully
- [ ] Plan purchase with wallet payment creates voucher
- [ ] QR code displays correctly for vouchers
- [ ] Offline voucher access works without internet
- [ ] Host dashboard shows accurate statistics
- [ ] Cash-in request flow completes end-to-end
- [ ] Language toggle switches between FR/EN
- [ ] Transaction history filtering works correctly

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~54.0.30 | React Native framework |
| `expo-router` | ~6.0.21 | File-based routing |
| `react-native` | 0.81.5 | Mobile UI framework |
| `zustand` | 5.0.9 | State management |
| `@supabase/supabase-js` | 2.89.0 | Backend client |
| `react-native-qrcode-svg` | 6.3.2 | QR code generation |
| `@react-native-async-storage/async-storage` | 2.1.0 | Persistent storage |

---

## 🌐 Supabase Setup

### Database Tables
- `profiles`: User profiles and role assignments
- `hotspots`: WiFi hotspot listings
- `plans`: Available data/time plans
- `purchases`: Transaction records
- `vouchers`: Generated access codes
- `wallet_transactions`: Balance history
- `cashin_requests`: Host deposit requests
- `payout_requests`: Host withdrawal requests
- `ratings`: Hotspot reviews

### Required Configuration
1. Enable **Phone Authentication** in Supabase Auth settings
2. Configure **Row Level Security (RLS)** policies from migration 002
3. Set up **Edge Functions** for payment webhooks (optional)
4. Configure **Storage** for hotspot images (optional)

See [Prompt-repo/supabase/README.md](Prompt-repo/supabase/README.md) for detailed setup instructions.

---

## 🌍 Internationalization

The app supports French (FR) and English (EN). Language switching is available in Settings.

To add a new translation:
1. Open [src/lib/i18n.ts](src/lib/i18n.ts)
2. Add key to `messages.en` and `messages.fr`
3. Use in components: `const { t } = useTranslation(); t('key')`

---

## 🎨 Theming

The app uses a custom theme defined in [constants/theme.ts](constants/theme.ts). All colors support light/dark mode via the `useColorScheme` hook.

---

## 🚢 Deployment

### Build for Production

**iOS**
```bash
eas build --platform ios
```

**Android**
```bash
eas build --platform android
```

### Environment Variables
Set production environment variables in `eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "your-production-url",
        "EXPO_PUBLIC_SUPABASE_KEY": "your-production-key"
      }
    }
  }
}
```

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues and questions:
- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Email: support@zemnet.com
- Documentation: [docs/](docs/)

---

**Built with ❤️ for the ZemNet community**
