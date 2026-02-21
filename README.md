# Smart Expense Tracker (EMS)

A React Native application for tracking expenses via OCR Bill Scanning and automatic SMS transaction parsing.

## Features

- **OCR Bill Scanning:** Scan physical bills to extract items and prices automatically.
- **SMS Integration:** Automatically syncs debit/credit transactions from bank SMS (Android only).
- **Dashboard:** Visual overview of monthly budget, total spent, and recent activity.
- **Modern UI:** Clean, consistent Indigo-themed design.

## Prerequisites

- Node.js & npm/yarn
- Android Studio (for Android build) or Xcode (for iOS build)
- Expo CLI

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Prebuild the project (Required for Native Modules like SMS & OCR):
   ```bash
   npx expo prebuild
   ```

## Running the App

Since this app uses native modules (`react-native-get-sms-android`, `react-native-mlkit-ocr`), **it will not work in standard Expo Go**. You must use a Development Build.

### Android
1. Connect your Android device or start an emulator.
2. Run:
   ```bash
   npx expo run:android
   ```

### iOS
1. Start a simulator or connect a device.
2. Run:
   ```bash
   npx expo run:ios
   ```

## Building for Production (Play Store)

1. Configure your build credentials (keystore).
2. Build the APK/AAB:
   ```bash
   eas build --platform android
   ```
   *Note: You may need to install `eas-cli` globally first: `npm install -g eas-cli`*

## Troubleshooting

- **OCR not working?** Ensure you are testing on a real device or a simulator with Camera enabled.
- **SMS not syncing?** This feature is Android-only and requires SMS permissions which are requested on the Dashboard load.
