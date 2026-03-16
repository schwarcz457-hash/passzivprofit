# Aranyad - Gold Passive Profit Landing Page

A high-conversion, luxury minimalist landing page for a gold-based passive income and savings program. Built with Next.js (App Router), Tailwind CSS v4, and Framer Motion.

## Features

- **Luxury Minimalist Design:** Deep Charcoal, Premium White, and Metallic Gold aesthetics.
- **Multi-language Support (i18n):** 9 European languages built-in (EN, HU, DE, FR, ES, IT, RO, SK, PL).
- **Live Gold Ticker:** Simulated live XAU/EUR pricing updates in the Navbar.
- **Interactive Calculator:** Dual-slider passive profit calculator taking into account monthly savings, timeframes, avg 6.5% gold growth, and a 10% loyalty bonus.
- **Lead Capture:** Dynamic minimal lead form that logs data structurally to the server.
- **Responsive:** Fully optimized for Mobile, Tablet, and Desktop.

## Project Setup

Ensure you have Node.js 18.x or later installed.

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Development

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The page defaults to Hungarian (`/hu`), but you can select any language from the Navbar dropdown.

## Production Build

To structure an optimized production-ready bundle:

```bash
npm run build
```

Once built, you can start the production server:

```bash
npm start
```

## Form Submissions (Leads)

The "Lead Form" at the bottom of the page utilizes a Next.js Server Action to capture incoming requests securely from the client.

All form submissions are automatically saved to a local JSON file for easy access:
**Location:** `data/leads.json`

*(Note: The `data/` directory will be automatically generated in the root of the project upon the very first form submission if it does not already exist).*

The terminal running your Next.js server will also output a nicely formatted log for every incoming lead.

## Tech Stack
- Frontend: Next.js 15 (React 19)
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- Icons: Lucide React
- i18n: Next-Intl
