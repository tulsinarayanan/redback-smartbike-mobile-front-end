# Redback SmartBike Mobile Frontend

React Native / Expo Router app for SmartBike auth, leaderboard, friends, friend requests, notifications, chat, workouts, and ride statistics.

## Requirements

- Node.js 20+
- npm
- Expo Go compatible with Expo SDK 54
- Backend running on port 5000
- Supabase project with the SmartBike schema applied

## Environment

Create `.env` from `.env.example`.

```env
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

API URL examples:

```env
# Web
EXPO_PUBLIC_API_URL=http://localhost:5000

# Android emulator
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000

# Physical phone on same Wi-Fi
EXPO_PUBLIC_API_URL=http://<computer-lan-ip>:5000
```

Do not commit `.env` or real Supabase keys.

## Run

```bash
npm install --legacy-peer-deps
npx expo start -c
```

Expo shortcuts:

- Press `w` for web.
- Press `a` for Android emulator.
- Scan the QR code with Expo Go for a physical device.

When testing on a phone, the phone must be able to reach the backend using the computer LAN IP. Restart Expo with `-c` after changing `.env`.

## Company Supabase Handover

1. Apply the backend schema in `redback-smartbike-mobile-back-end/database/schema.sql` to the company Supabase project.
2. Configure Supabase Auth email/password and any OAuth providers required for Apple, Facebook, or Google.
3. Update frontend `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=<company-supabase-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<company-supabase-anon-key>
EXPO_PUBLIC_API_URL=<backend-url>
```

4. Update backend `.env` with the same company Supabase URL and anon key.
5. Start backend, then start Expo.

New users are created through Supabase Auth. The frontend creates/repairs rows in `public.profiles` after signup/login.
