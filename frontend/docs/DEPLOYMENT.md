# Deployment Guide

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (.env.production)
```bash
NEXT_PUBLIC_API_URL=https://api.sipzy.coffee
NEXT_PUBLIC_APP_URL=https://sipzy.coffee
```

## Vercel Deployment (Recommended)

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel auto-detects Next.js configuration

### 2. Configure Environment Variables
In Vercel dashboard:
- Settings → Environment Variables
- Add `NEXT_PUBLIC_API_URL`
- Add `NEXT_PUBLIC_APP_URL`

### 3. Deploy
- Push to `main` branch → Auto-deploy
- Pull requests → Preview deployments

## Netlify Deployment

### 1. Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Import repository
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 2. Add Environment Variables
- Site settings → Environment variables
- Add required variables

### 3. Deploy
Push to main branch triggers deployment.

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Build & Run
```bash
docker build -t sipzy-frontend .
docker run -p 3000:3000 sipzy-frontend
```

## Build Verification

```bash
# Test production build locally
npm run build
npm start

# Check for errors
npm run lint
```

## Performance Checklist

- ✅ Images optimized (Next.js Image component)
- ✅ Code splitting (automatic with Next.js)
- ✅ SSR enabled for SEO
- ✅ Metadata configured
- ✅ Sitemap.xml generated
- ✅ robots.txt configured

## Post-Deployment

### 1. Verify
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] API calls succeed
- [ ] Images display properly

### 2. Monitor
- Vercel Analytics (built-in)
- Google Analytics (optional)
- Error tracking (Sentry recommended)

### 3. Custom Domain
1. Add domain in Vercel/Netlify
2. Configure DNS records
3. SSL auto-provisioned
