# 🚀 EcoPack Deployment Guide

Complete step-by-step guide to deploy EcoPack v2 to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Build & Test Locally](#build--test-locally)
4. [Deploy to Vercel](#deploy-to-vercel)
5. [Alternative: Deploy to Other Platforms](#alternative-deploy-to-other-platforms)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ GitHub account
- ✅ Neon Database account (free tier available at [neon.tech](https://neon.tech))
- ✅ Google Gemini API key (free tier available at [aistudio.google.com](https://aistudio.google.com))
- ✅ Clerk account for authentication (free tier available at [clerk.com](https://clerk.com))
- ✅ Vercel account (free tier available at [vercel.com](https://vercel.com))

---

## Environment Variables Setup

### Step 1: Create `.env.local` file

Create a `.env.local` file in your project root with the following variables:

```env
# Database (Neon Postgres)
DATABASE_URL="postgresql://username:password@ep-xxx-region.neon.tech/dbname?sslmode=require"

# Google Gemini AI
GOOGLE_API_KEY="AIzaSy..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: ClimateIQ API (if you want enhanced carbon calculations)
# CLIMATEIQ_API_KEY="your_climateiq_api_key"
```

### Step 2: Get Your Neon Database URL

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`
5. Paste it as `DATABASE_URL` in your `.env.local`

**Important:** The database tables will be created automatically on first run when you call the `/api/init` endpoint or submit your first recommendation.

### Step 3: Get Your Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Add it as `GOOGLE_API_KEY` in your `.env.local`

### Step 4: Set Up Clerk Authentication

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Go to "API Keys" in the dashboard
4. Copy your:
   - **Publishable Key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret Key** → `CLERK_SECRET_KEY`
5. Add both to your `.env.local`

---

## Build & Test Locally

Before deploying, make sure your project builds successfully:

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Build the Project

```bash
npm run build
```

If the build succeeds, you're ready to deploy!

### Step 3: Test Locally (Optional)

```bash
npm start
```

Visit `http://localhost:3000` and test the application to ensure everything works.

---

## Deploy to Vercel (Recommended)

Vercel is the easiest platform to deploy Next.js applications. It offers:

- ✅ Free hosting
- ✅ Automatic SSL certificates
- ✅ Git-based deployments
- ✅ Preview deployments for pull requests
- ✅ Built-in CI/CD

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Vercel will automatically detect it's a Next.js project

### Step 3: Configure Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each environment variable:

   | Variable Name                       | Value                       |
   | ----------------------------------- | --------------------------- |
   | `DATABASE_URL`                      | Your Neon connection string |
   | `GOOGLE_API_KEY`                    | Your Google Gemini API key  |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key  |
   | `CLERK_SECRET_KEY`                  | Your Clerk secret key       |

3. Click **Save** for each variable

### Step 4: Deploy

1. Click **Deploy** button
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

### Step 5: Configure Clerk

1. Go to your Clerk dashboard
2. Navigate to **Frontend API** settings
3. Add your Vercel URL to **Allowed Frontend URLs**:
   - `https://your-project-name.vercel.app`

---

## Alternative: Deploy to Other Platforms

### Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your GitHub repository
4. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. Add environment variables
6. Deploy

### Deploy to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create a new project from GitHub repo
4. Add environment variables
5. Railway will auto-detect and deploy

### Deploy to AWS/Render/Any Platform

For other platforms:

1. Ensure they support Node.js applications
2. Set the build command to `npm run build`
3. Set the start command to `npm start`
4. Add all environment variables
5. Deploy

---

## Post-Deployment Checklist

After deployment, complete these steps:

### ✅ 1. Test Database Connection

Visit: `https://your-domain.com/api/init`

This creates the necessary database tables. You should see:

```json
{
  "status": "success",
  "message": "Database initialized"
}
```

### ✅ 2. Test API Endpoints

Visit: `https://your-domain.com/api/test-env`

Should return:

```json
{
  "database_configured": true,
  "google_api_configured": true,
  "clerk_configured": true
}
```

### ✅ 3. Test the Application

1. Visit your deployed URL
2. Test authentication (sign up/in)
3. Create a recommendation
4. View history
5. Use the tracker to log actions

### ✅ 4. Monitor Logs

Check Vercel deployment logs for any errors:

- Go to your project → **Deployments** → Click on latest deployment → **Logs**

### ✅ 5. Set Up Custom Domain (Optional)

For detailed step-by-step instructions, see **[CUSTOM_DOMAIN_SETUP.md](./CUSTOM_DOMAIN_SETUP.md)**

Quick steps:

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS records at your domain registrar
4. Update Clerk allowed frontend URLs to include your custom domain
5. Wait for DNS propagation (24-48 hours)

---

## Environment Variables Summary

| Variable                            | Description                     | Where to Get It                                            |
| ----------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`                      | Neon Postgres connection string | [neon.tech](https://neon.tech)                             |
| `GOOGLE_API_KEY`                    | Google Gemini AI API key        | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key           | [clerk.com](https://clerk.com)                             |
| `CLERK_SECRET_KEY`                  | Clerk secret key                | [clerk.com](https://clerk.com)                             |
| `CLIMATEIQ_API_KEY`                 | ClimateIQ API key (optional)    | [api.climateiq.com](https://api.climateiq.com)             |

---

## Troubleshooting

### Build Fails

**Error:** `Module not found`

- **Solution:** Run `npm install` before deploying

**Error:** `Environment variable not found`

- **Solution:** Make sure all environment variables are added to Vercel

### Database Connection Issues

**Error:** `Connection refused`

- **Solution:** Verify your `DATABASE_URL` is correct and your Neon database is active

**Error:** `SSL required`

- **Solution:** Make sure your connection string includes `?sslmode=require`

### Authentication Not Working

**Error:** `Clerk not configured`

- **Solution:**
  1. Verify both Clerk keys are set in Vercel
  2. Add your Vercel domain to Clerk's allowed domains

### API Errors

**Error:** `Google Gemini API failed`

- **Solution:** Check your API key is valid and has proper permissions

---

## Quick Reference

### Local Development

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

### Deployment Commands

```bash
# Build locally to test
npm run build

# Run production build locally
npm start
```

### Useful URLs

- **Local:** http://localhost:3000
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Dashboard:** https://console.neon.tech
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Google AI Studio:** https://aistudio.google.com

---

## Support

If you encounter issues during deployment:

1. Check the Vercel logs
2. Verify all environment variables are set
3. Ensure database connection is working
4. Check that all services (Neon, Clerk, Google) are properly configured

---

## Next Steps

After successful deployment:

1. ✅ Set up error monitoring (e.g., Sentry)
2. ✅ Configure analytics (e.g., Google Analytics or Vercel Analytics)
3. ✅ Set up backup procedures for your database
4. ✅ Enable rate limiting for API routes
5. ✅ Configure CORS if needed for specific use cases

---

**Congratulations! Your EcoPack application is now live! 🎉**
