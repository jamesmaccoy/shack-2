# Yoco backend (replacement)

Recreates `POST /api/v1/generate_checkout_link` for The Shack static site.

## What it does

1. Receives `type` (Firestore document id in the `packages` collection, e.g. `shack_stack`).
2. Loads that document with **Firebase Admin** (server credentials — not the public `js/firebase.js` config).
3. Reads `price` (ZAR, displayed on the site) or `amountInCents` / `amount`.
4. Creates a [Yoco Checkout](https://developer.yoco.com/docs/checkout-api) session.
5. Returns `{ "status": true, "data": { "redirectUrl": "https://c.yoco.com/checkout/..." } }`.

## Why the old URL fails

Use Firebase project **`shack-30405`** (same as `js/firebase.js`). The old `the-shack-57d22` service account must not be used.

`"Type required"` only means the request had no `type` field (e.g. opening the URL in a browser). The site sends `type` via POST when a `.payment_url` button is clicked.

## Setup

### 1. Firebase Admin key

1. [Firebase Console](https://console.firebase.google.com/) → project **shack-30405**
2. Project settings → **Service accounts** → **Generate new private key**
3. Copy the **entire** JSON file as **one line** into `FIREBASE_SERVICE_ACCOUNT_JSON` on Vercel. It must start with `{` and end with `}` — not `[`, not line breaks with quotes around fields.

```bash
# Minify a downloaded key file (run locally, do not commit the file):
node -e "console.log(JSON.stringify(require('./shack-30405-firebase-adminsdk.json')))"
```

Paste that single line as the env var value (no surrounding single quotes on Vercel).

### 2. Yoco secret key

1. [Yoco Developer / Portal](https://developer.yoco.com/) → API keys
2. Use a **secret** key (`sk_live_...` or `sk_test_...`) — **not** `pk_live_...` / `pk_test_...` (public keys only work in the browser)
3. Set `YOCO_SECRET_KEY` in Vercel

### 3. Firestore `packages` documents

Each `data-id` on a payment button must exist as a document id in `packages`, with at least:

| Field | Example | Notes |
|-------|---------|--------|
| `price` | `8500` or `8 500` | ZAR amount (converted to cents × 100) |
| `description` | optional | Shown on Yoco checkout |

Optional: `amountInCents` if you already store cents.

### 4. Deploy

```bash
cd yoco-backend
npm install
npx vercel link
npx vercel env add YOCO_SECRET_KEY
npx vercel env add FIREBASE_SERVICE_ACCOUNT_JSON
npx vercel env add SITE_URL
npx vercel --prod
```

Point the static site at your deployment URL, or redeploy to the `yoco-backend` Vercel project if you own it.

### 5. Local test

```bash
cp .env.example .env.local
# fill in values, then:
npx vercel dev
curl -X POST http://localhost:3000/api/v1/generate_checkout_link \
  -H "Content-Type: application/json" \
  -d '{"type":"shack_stack"}'
```

## Frontend

After deploy, update the AJAX URL in your HTML files, or keep the same Vercel project name.

Recommended AJAX options (JSON body):

```javascript
jQuery.ajax({
  url: "https://YOUR-DEPLOYMENT.vercel.app/api/v1/generate_checkout_link",
  method: "POST",
  contentType: "application/json",
  data: JSON.stringify({ type: buttonValue }),
  success: function (request) {
    if (request?.status === true) {
      window.location.href = request?.data?.redirectUrl;
    }
  },
});
```
