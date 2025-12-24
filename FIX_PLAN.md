# TypeScript & Lint Issues - Fix Plan

**Generated:** December 23, 2025  
**Total Issues:** 102 TypeScript errors + ESLint warnings

---

## 📊 Issue Summary

### TypeScript Errors (102 total)
- **Typography color prop**: 47 errors - passing theme color strings instead of predefined color types
- **Component variant props**: 20 errors - variant props not recognized on Card, Button, Badge
- **EmptyState message prop**: 6 errors - message prop not recognized
- **Missing theme properties**: 4 errors - `colors.card`, `colors.errorBackground` don't exist
- **Missing Hotspot properties**: 1 error - `status` property not on Hotspot type
- **Component style/size props**: 5 errors - props not recognized
- **Test file errors**: 29 errors - outdated test expectations
- **Other**: 10 errors - various typing issues

### ESLint Issues (20 total)
- **Warnings**: 17 (unused vars, missing deps, duplicate imports)
- **Errors**: 3 (unescaped entities, jest globals)

---

## 🎯 Fix Strategy

### Phase 1: Core UI Component Type Definitions (HIGHEST PRIORITY)
**Impact:** Fixes 73+ errors across all screens

#### 1.1 Typography Component
**Files:** `src/components/ui/Typography.tsx`, `components/ui/Typography.tsx`  
**Problem:** Color prop only accepts predefined strings, but screens pass theme colors
```typescript
// Current
color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success'

// Should accept
color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'success' | string
```
**Errors Fixed:** 47 errors across all screens

#### 1.2 Card Component  
**Files:** `src/components/ui/Card.tsx`, `components/ui/Card.tsx`  
**Problem:** TypeScript doesn't recognize `variant` prop
```typescript
// Need to export Props type
export interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'filled'
  children?: React.ReactNode
}
```
**Errors Fixed:** 15 errors

#### 1.3 Badge Component
**Files:** `src/components/ui/Badge.tsx`, `components/ui/Badge.tsx`  
**Problem:** TypeScript doesn't recognize `variant` and `label` props
```typescript
export interface BadgeProps {
  variant?: 'primary' | 'success' | 'error' | 'warning' | 'neutral'
  label: string
}
```
**Errors Fixed:** 4 errors

#### 1.4 Button Component
**Files:** `src/components/ui/Button.tsx`, `components/ui/Button.tsx`  
**Problem:** Missing props in type definition
```typescript
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  children?: React.ReactNode
  leftIcon?: React.ReactNode
  style?: ViewStyle
  // ... other props
}
```
**Errors Fixed:** 5 errors

#### 1.5 EmptyState Component
**Files:** `src/components/ui/EmptyState.tsx`, `components/ui/EmptyState.tsx`  
**Problem:** Missing `message` prop in type definition
```typescript
export interface EmptyStateProps {
  title: string
  message?: string
  icon?: keyof typeof Ionicons.glyphMap
  action?: {
    label: string
    onPress: () => void
  }
}
```
**Errors Fixed:** 6 errors

---

### Phase 2: Theme & Type Definitions (HIGH PRIORITY)
**Impact:** Fixes 5 errors

#### 2.1 Colors Theme
**File:** `constants/theme.ts`  
**Problem:** Missing color properties
```typescript
// Add to both light and dark themes:
card: '#FFFFFF' // or appropriate color
errorBackground: '#FEE2E2' // light red for error backgrounds
```
**Errors Fixed:** 4 errors in hotspot/[id].tsx

#### 2.2 Hotspot Type
**File:** `src/types/domain.ts`  
**Problem:** Missing `status` property
```typescript
export interface Hotspot {
  // ... existing properties
  status?: 'online' | 'offline' // Add this
}
```
**Errors Fixed:** 1 error in map.tsx

---

### Phase 3: Component Implementation Fixes (MEDIUM PRIORITY)
**Impact:** Fixes 3 errors

#### 3.1 Input Component
**File:** `components/ui/Input.tsx`  
**Problem:** Style type issue with number 0
```typescript
// Change lines with leftIcon/rightIcon style
leftIcon && { marginLeft: 8 } // Instead of leftIcon && { marginLeft: 8 }
```

#### 3.2 OTP TextInput
**File:** `app/(auth)/otp.tsx`  
**Problem:** `onPaste` is not a valid TextInput prop in React Native
```typescript
// Remove the onPaste handler, use alternative approach
// Option: Handle paste in onChangeText when length > 1
```

#### 3.3 ErrorState Button
**File:** `src/components/ui/ErrorState.tsx`  
**Problem:** Using `children` instead of `label`
```typescript
// Change from:
<Button>{action.label}</Button>
// To:
<Button label={action.label} onPress={action.onPress} />
```

---

### Phase 4: ESLint Warnings (LOW PRIORITY)
**Impact:** Code quality improvements

#### 4.1 Unused Variables
**Files:** Multiple  
**Fix:** Remove or prefix with underscore

#### 4.2 React Hooks Dependencies
**Files:** history.tsx, hotspot/[id].tsx, wallet/index.tsx  
**Fix:** Add missing dependencies or wrap in useCallback

#### 4.3 Unescaped Entities
**Files:** phone.tsx, dashboard.tsx  
**Fix:** Replace `'` with `&apos;` or use curly apostrophe

#### 4.4 Jest Globals
**File:** jest.setup.js  
**Fix:** Add `/* global jest */` comment at top

---

## 🔧 Implementation Order

### Step 1: Export Component Types (30 min)
1. Update all UI components to export their Props interfaces
2. Ensure Props extend appropriate base types (ViewProps, etc.)

### Step 2: Fix Typography Color Prop (10 min)
1. Change color prop type to accept string
2. Update theme color mapping logic

### Step 3: Add Missing Theme Colors (5 min)
1. Add `card` and `errorBackground` to theme

### Step 4: Add Missing Type Properties (5 min)
1. Add `status` to Hotspot type

### Step 5: Fix Component Implementation Issues (20 min)
1. Fix Input component style
2. Remove onPaste from OTP
3. Fix ErrorState Button usage

### Step 6: Clean ESLint Warnings (15 min)
1. Fix unused variables
2. Fix hook dependencies
3. Escape special characters
4. Add jest global comment

---

## 📁 Files to Modify (Priority Order)

### Critical (Phase 1 & 2):
1. ✅ `src/components/ui/Typography.tsx` - Add string to color prop
2. ✅ `src/components/ui/Card.tsx` - Export Props interface
3. ✅ `src/components/ui/Badge.tsx` - Export Props interface
4. ✅ `src/components/ui/Button.tsx` - Export Props interface, add missing props
5. ✅ `src/components/ui/EmptyState.tsx` - Add message prop
6. ✅ `constants/theme.ts` - Add missing colors
7. ✅ `src/types/domain.ts` - Add Hotspot.status

### Important (Phase 3):
8. ✅ `components/ui/Input.tsx` - Fix style type
9. ✅ `app/(auth)/otp.tsx` - Remove onPaste
10. ✅ `src/components/ui/ErrorState.tsx` - Fix Button usage

### Nice to Have (Phase 4):
11. Various files - ESLint warnings

---

## ✅ Success Criteria

- [ ] Zero TypeScript errors in production code
- [ ] All screens render without type errors
- [ ] Component props properly typed
- [ ] Theme colors complete
- [ ] No breaking changes to component APIs
- [ ] ESLint warnings reduced to < 5

---

## 🚀 Estimated Time: 90 minutes total

**Next Action:** Start with Phase 1.1 - Fix Typography component color prop
