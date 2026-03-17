# SoulSynergy Coaching

Professional website for **SoulSynergy Coaching** — ICF-PCC certified coaching for professionals and entrepreneurs ready to break through and take meaningful action.

**Live site:** [soulsynergy-coach.com](https://www.soulsynergy-coach.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Netlify (with Netlify Functions for server-side logic) |
| Booking | Custom `/book` flow — Google Calendar + Stripe + Neon |
| Payments | Stripe (PaymentIntents + promotion codes) |
| Email | Resend (via n8n webhook) |
| Database | Neon (PostgreSQL serverless) |
| Calendar | Google Calendar API (OAuth2) |
| Automations | n8n |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm
- Netlify CLI (`npm install -g netlify-cli`) — required to run Netlify Functions locally

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd soul-synergy-hub

# Install dependencies
npm install

# Start the development server (with Netlify Functions)
netlify dev
```

The app runs at `http://localhost:8888` when using `netlify dev` (functions are proxied automatically).

> To run the frontend only (no functions): `npm run dev` → `http://localhost:8080`

### Other commands

```bash
npm run build       # Production build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm test            # Run unit tests (Vitest)
```

---

## Required npm Packages

The following packages must be installed for the booking system:

```bash
# Server-side (Netlify Functions)
npm install @netlify/functions stripe @neondatabase/serverless googleapis

# Client-side (booking page)
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## Database Setup

Run `schema.sql` against your Neon database to create the `bookings` table:

```bash
psql $NEON_DATABASE_URL -f schema.sql
```

---

## Environment Variables

Create a `.env.local` file in the project root (for local dev via `netlify dev`).
All variables are also required in **Netlify → Site Settings → Environment Variables** for production.

```env
# ── Google Calendar (OAuth2) ──────────────────────────────────────────────
VITE_GOOGLE_CLIENT_ID=          # OAuth client ID (safe to expose to client)
GOOGLE_CLIENT_SECRET=           # OAuth client secret — server-side only
GOOGLE_REFRESH_TOKEN=           # Long-lived refresh token — server-side only
                                # See "Google OAuth Setup" below to generate this

# ── Stripe ────────────────────────────────────────────────────────────────
VITE_STRIPE_PUBLISHABLE_KEY=    # Publishable key — exposed to client
STRIPE_SECRET_KEY=              # Secret key — server-side only (Netlify Functions)

# ── Neon (PostgreSQL) ────────────────────────────────────────────────────
NEON_DATABASE_URL=              # Full connection string — server-side only

# ── n8n ──────────────────────────────────────────────────────────────────
VITE_N8N_WEBHOOK_URL=           # Webhook URL for testimonial form + booking emails

# ── Calendly (legacy booking link, kept for nav) ──────────────────────────
VITE_CALENDLY_URL=https://calendly.com/connect-sscoach
```

---

## Google OAuth Setup (one-time)

To generate `GOOGLE_REFRESH_TOKEN` for Arushi's calendar:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → your project → APIs & Services → Credentials
2. Use your OAuth 2.0 Client ID and Secret
3. Run the OAuth2 playground or use this quick script:

```bash
# Install google-auth-library if needed
npx ts-node -e "
const { google } = require('googleapis');
const oauth2 = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'urn:ietf:wg:oauth:2.0:oob'
);
console.log(oauth2.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar'],
  prompt: 'consent'
}));
"
# Visit the URL, approve access, paste the code back:
# oauth2.getToken(code) → save the refresh_token
```

4. Store the `refresh_token` value as `GOOGLE_REFRESH_TOKEN`

---

## Project Structure

```
src/
├── components/       # Shared UI components (Navigation, Footer, etc.)
│   └── ui/           # shadcn/ui primitives
├── pages/            # Route-level page components
│   └── Book.tsx      # Custom booking wizard (/book)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── assets/           # Static assets
netlify/
└── functions/
    ├── get-availability.ts     # Google Calendar free/busy
    ├── validate-discount.ts    # Stripe promotion code lookup
    ├── create-payment-intent.ts # Stripe PaymentIntent creation
    └── confirm-booking.ts      # DB write + Calendar event + n8n trigger
public/
└── images/           # Public images (hero, portraits, logo)
schema.sql            # Neon database schema
netlify.toml          # Netlify build + functions config
```

---

## Contact

**Arushi Bhardwaj** — ICF-PCC Certified Coach
Email: connect.sscoach@gmail.com
Phone: 703-945-5595
Booking: [soulsynergy-coach.com/book](https://www.soulsynergy-coach.com/book)
