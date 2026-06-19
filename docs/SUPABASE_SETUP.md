# Supabase setup for Afterward

Follow these steps in order. Takes about 15 minutes.

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **New project**.
3. Pick an organization, name it `afterward`, choose a region close to you, set a database password (save it somewhere safe).
4. Wait until the project status is **Active**.

---

## Step 2 — Run the database migration

1. In your project, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `supabase/migrations/001_initial_schema.sql` from this repo, copy the entire file, paste into the editor.
4. Click **Run**. You should see “Success. No rows returned.”

This creates `profiles`, `capsules`, RLS policies, and the `capsule-photos` storage bucket.

---

## Step 3 — Enable email auth (magic link)

1. Go to **Authentication** → **Providers**.
2. Ensure **Email** is enabled.
3. Under **Email**, turn **Confirm email** off for easier testing (optional — you can leave it on for production).
4. Go to **Authentication** → **URL Configuration**.
5. Set **Site URL** to: `afterward://auth/callback`
6. Under **Redirect URLs**, add these (one per line):

```
afterward://auth/callback
afterward://verify
exp://127.0.0.1:8081/--/auth/callback
exp://localhost:8081/--/auth/callback
```

The `afterward://` URLs open your dev build. Request a **new** magic link after changing these — old email links keep the old redirect.

---

## Step 4 — Copy API keys into `.env`

1. Go to **Project Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. In the project root, create `.env`:

```bash
cp .env.example .env
```

4. Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Restart Expo after changing env vars:

```bash
npx expo start --clear
```

---

## Step 5 — Verify storage bucket

1. Go to **Storage** in the dashboard.
2. Confirm a bucket named `capsule-photos` exists and is **public**.
3. If it is missing, re-run the migration SQL (the `insert into storage.buckets` section).

---

## Step 6 — Test sign-in

1. Start the app: `npx expo start`
2. Open on your phone (Expo Go is fine for auth + capsules; MMKV/push need a dev build later).
3. Tap **Write your first capsule** → enter your email → **Send magic link**.
4. Open the email on the same device, tap the link.
5. The app should open and land on the **Vault** tab.

**If the link opens a browser instead of the app:** use a dev build (`npx expo run:android` / dev client) or test on the same machine with the `exp://` redirect URL.

---

## Step 7 — Test creating a capsule

1. Go to the **New** tab.
2. Write a short message, pick a delivery date (e.g. one year from today).
3. Tap the wax seal to **Seal until [date]**.
4. Check **Vault** — you should see a locked capsule with that date.

In **Table Editor** → `capsules`, you should see the new row with `status = locked`.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| “Invalid API key” | Re-copy anon key into `.env`, restart with `--clear` |
| Magic link does nothing | Add redirect URLs from Step 3; ensure link opens the app |
| Profile missing after login | Re-run migration (trigger `handle_new_user`) |
| Photo upload fails | Check `capsule-photos` bucket exists and RLS policies ran |
| RLS error on insert | Confirm you are signed in; `user_id` must match `auth.uid()` |

---

## Next steps (after basic auth works)

- **Edge function + email**: deploy `deliver-capsules` and add Resend API key (see README).
- **Push notifications**: `npx eas init`, update `app.json` project ID, create a dev build.
- **Scheduled delivery**: configure cron in Supabase to call the edge function daily.

When your project is created, paste your **Project URL** into `.env` and we can verify the connection together.
