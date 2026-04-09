# Smart Expense Tracker (EMS)

A React Native application for tracking expenses via OCR Bill Scanning and secure RBI-compliant Account Aggregator (AA) framework.

## Features

- **OCR Bill Scanning:** Scan physical bills to extract items and prices automatically using ML Kit.
- **Bank Account Sync (AA):** Securely sync your bank transactions using the official RBI Account Aggregator framework (Consent-based).
- **Dashboard:** Visual overview of monthly budget, total spent, and recent activity.
- **Modern UI:** Clean, consistent Indigo-themed design.

## Prerequisites

- Node.js & npm/yarn
- PostgreSQL (for backend)
- Android Studio (for Android build) or Xcode (for iOS build)
- Expo CLI

## Installation

1. Install Frontend dependencies:
   ```bash
   npm install
   ```

2. Setup Backend:
   ```bash
   cd backend
   npm install
   # Create .env based on .env.example
   ```

3. Prebuild the project (Required for Native Modules like OCR):
   ```bash
   npx expo prebuild
   ```

## Running the App

Since this app uses native modules (`react-native-mlkit-ocr`), **it will not work in standard Expo Go**. You must use a Development Build.

### Frontend
```bash
npx expo run:android # or run:ios
```

### Backend
```bash
cd backend
npm run dev
```

## Account Aggregator Integration

This app follows the RBI AA framework. Users must provide explicit consent via an RBI-approved AA Provider to sync financial data. Manual onboarding steps with an AA Provider are required for production API access.
