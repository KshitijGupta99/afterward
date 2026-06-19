# Afterward

A digital time capsule. Write a message, seal it until a future date, and receive it when the day arrives.

## Stack

- **Mobile**: Expo SDK 56, Expo Router, TypeScript, NativeWind
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **Email**: Resend + React Email
- **State**: Zustand, TanStack Query
- **Notifications**: Expo Notifications (quiet delivery alerts)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

### 3. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial_schema.sql` via the SQL editor
3. Enable Email auth (magic link) in Authentication → Providers
4. Add redirect URL: `afterward://verify`

### 4. Resend

1. Create an account at [resend.com](https://resend.com)
2. Verify your sending domain (or use `onboarding@resend.dev` for testing)
3. Add `RESEND_API_KEY` as a secret in Supabase Edge Functions

### 5. Edge Function secrets

In Supabase Dashboard → Edge Functions → Secrets, add **only** your custom secrets (do not add `SUPABASE_*` names — Supabase injects `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` automatically):

```
RESEND_API_KEY=re_your_key
APP_URL=afterward://capsule
```

### 6. Deploy the delivery function

```bash
npx supabase functions deploy deliver-capsules
```

### 7. Schedule daily delivery

In Supabase Dashboard → Database → Extensions, enable `pg_cron` if using pg_cron, or use Supabase scheduled functions:

Create a cron trigger that calls the edge function daily at 08:00 UTC:

```sql
select cron.schedule(
  'deliver-capsules-daily',
  '0 8 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/deliver-capsules',
    headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb
  );
  $$
);
```

Or invoke manually for testing:

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/deliver-capsules \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 8. Expo Notifications

1. Run `npx eas init` to create an EAS project
2. Update `app.json` → `extra.eas.projectId` with your project ID
3. Build a development client (push notifications require a physical device):

```bash
npx eas build --profile development --platform ios
# or
npx eas build --profile development --platform android
```

## Running locally

```bash
npx expo start
```

For native modules (MMKV, push notifications), use a development build:

```bash
npx expo start --dev-client
```

## Testing delivery

1. Create a capsule with today's date (or a past date)
2. Manually invoke the edge function (see above)
3. Check the recipient email and/or push notification

To test push locally:

1. Use a physical device with a dev build
2. Sign in and allow notifications in Settings
3. Create a capsule addressed to yourself with today's date
4. Trigger the delivery function

## Testing email

Use Resend's test mode with `onboarding@resend.dev` as the sender. Only delivers to the email on your Resend account until you verify a domain.

## Deep linking

The app uses the `afterward://` scheme. Notification taps and email links open:

```
afterward://capsule/:id
```

## Project structure

```
app/                  # Expo Router screens
components/           # UI and capsule components
hooks/                # Auth, queries
services/             # Supabase operations
supabase/             # Migrations and edge functions
emails/               # React Email templates
storage/              # MMKV local storage
notifications/        # Push notification helpers
```

## Fonts

The design uses Fraunces (display) and Inter (body). Add font files to `assets/fonts/` and load them with `expo-font`, or the app falls back to Georgia / system sans-serif.

## Offline drafts

Incomplete capsules are auto-saved to MMKV every 3 seconds and restored when you return to the New screen.
