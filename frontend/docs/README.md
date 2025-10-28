# Frontend Documentation

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Access: `http://localhost:3000`

## Structure

```
frontend/
├── docs/
│   ├── README.md          # This file
│   ├── COMPONENTS.md      # Component library
│   └── DEPLOYMENT.md      # Deployment guide
├── app/                   # Next.js 15 App Router
├── components/            # Reusable components
├── contexts/              # React contexts (Auth, Toast)
├── hooks/                 # Custom hooks
└── lib/                   # Utilities & types
```

## Documentation

- **[COMPONENTS.md](COMPONENTS.md)** - Component usage & props
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment to Vercel/Netlify

## Tech Stack

- **Next.js 15** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS 4**
- **React Hook Form** + Zod validation
- **Framer Motion** for animations

## Status

✅ **Production Ready** (100%)
- Authentication
- Coffee catalog with filters
- Reviews & ratings
- User profiles
- SEO optimized
- WCAG 2.1 AA compliant
