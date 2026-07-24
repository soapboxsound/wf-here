# Locking down Firebase (admin API + security rules)

## 1. Create a service account
1. Open [Firebase Console](https://console.firebase.google.com/) → project **wf-here**
2. Project settings → **Service accounts**
3. **Generate new private key** → download the JSON

## 2. Add Vercel env vars
In Vercel → Project → Settings → Environment Variables (Production + Preview):

| Name | Value |
|---|---|
| `ADMIN_PASSWORD` | a long random password only you know |
| `FIREBASE_SERVICE_ACCOUNT` | entire service-account JSON as one line |
| `VITE_FIREBASE_PROJECT_ID` | `wf-here` (already set) |

Redeploy after saving env vars.

## 3. Publish Firestore rules
From this repo (with Firebase CLI logged in):

```bash
firebase deploy --only firestore:rules
```

Or paste `firestore.rules` into Firebase Console → Firestore → Rules → Publish.

## 4. Verify
- Explore still shows published spots
- Submit still creates a submission
- Incognito DevTools cannot write to `listings`
- `/admin/listings` asks for password, then loads unpublished spots
