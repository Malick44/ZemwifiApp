# Portal Contract & UX

This document defines the interaction between the ZemApp and the Captive Portal (Router).

## Overview

We support a **Single-Device Flow** where the user installs the app, buys a voucher, and stays on the same device to authorize Wi-Fi access. QR Code scanning is NOT required.

## 1. Deep Link URL

The App opens the portal using a deep link that pre-fills the token.

**URL Pattern:**
```
http://login.zemnet/enter?token=<TOKEN>&src=app
```
- `token`: The full JWT voucher token (HS256 signed).
- `src`: 'app' implies the user is coming from the app (portal can tailor UI).

**Optional:**
```
&continue=<URL>
```
Redirect destination after success (e.g. `http://neverssl.com`).

## 2. Portal Behavior

### GET /enter
The router's portal page should:
1. Check for `token` query param.
2. If present, auto-fill the "Voucher Code" input field.
3. If not present, show manual input field.
4. **Paste Button**: Provide a button that attempts to read clipboard (Standard Web API `navigator.clipboard.readText()`) to paste the token if the user copied it manually.
5. **Submit**: Validates the token locally (format) then POSTs to `/redeem`.

### POST /redeem
Payload: `{ "token": "..." }`
Router verifies:
1. Signature (using its Hotspot Secret).
2. Expiry (`exp`).
3. Hotspot ID match.

Response:
- `200 OK`: Authorize MAC address.
- `400 Bad Request`: Invalid token.

## 3. App Behavior

1. **Clipbaord First**: The App ALWAYS copies the token to the clipboard `Clipboard.setStringAsync(token)` BEFORE opening the URL.
2. **Fallback**: If the router URL is unreachable (e.g. not connected to Wi-Fi), the App warns the user to connect first.
3. **Trigger**: If `http://login.zemnet` fails, app may try a generic captive portal trigger like `http://neverssl.com`.

## 4. Error Handling
- **Expired**: Portal shows "Code Expired/Utilisé".
- **Invalid**: Portal shows "Code Invalide".
