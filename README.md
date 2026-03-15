# SoulSynergy Coaching

Professional website for **SoulSynergy Coaching** — ICF-PCC certified coaching for professionals and entrepreneurs ready to break through and take meaningful action.

**Live site:** [soulsynergy-coach.com](https://www.soulsynergy-coach.com)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |
| Booking | Calendly |
| Payments | Stripe *(planned)* |
| Email | Resend *(planned)* |
| Database / Auth | Supabase *(planned)* |
| Automations | n8n *(planned)* |

---

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd soul-synergy-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:8080`.

### Other commands

```bash
npm run build       # Production build
npm run preview     # Preview production build locally
npm run lint        # Run ESLint
npm test            # Run unit tests (Vitest)
```

---

## Environment Variables

Create a `.env.local` file in the project root. The following variables will be required as integrations are added:

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# Calendly
VITE_CALENDLY_URL=https://calendly.com/connect-sscoach
```

> No environment variables are required to run the project locally in its current state.

---

## Project Structure

```
src/
├── components/       # Shared UI components (Navigation, Footer, etc.)
│   └── ui/           # shadcn/ui primitives
├── pages/            # Route-level page components
├── hooks/            # Custom React hooks
├── lib/              # Utility functions
└── assets/           # Static assets
public/
└── images/           # Public images (hero, portraits, logo)
```

---

## Contact

**Arushi Bhardwaj** — ICF-PCC Certified Coach
Email: connect.sscoach@gmail.com
Phone: 703-945-5595
Booking: [calendly.com/connect-sscoach](https://calendly.com/connect-sscoach)
