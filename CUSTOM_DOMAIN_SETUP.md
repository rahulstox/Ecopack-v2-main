# 🌐 Custom Domain Setup Guide

Complete guide to set up a custom domain for your EcoPack application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Add Domain in Vercel](#step-1-add-domain-in-vercel)
3. [Step 2: Configure DNS Records](#step-2-configure-dns-records)
4. [Step 3: Update Clerk Configuration](#step-3-update-clerk-configuration)
5. [Step 4: Verify Domain Setup](#step-4-verify-domain-setup)
6. [Step 5: Update Environment Variables (if needed)](#step-5-update-environment-variables-if-needed)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Your app deployed on Vercel
- ✅ A domain name purchased from a registrar (e.g., Namecheap, GoDaddy, Google Domains)
- ✅ Access to your domain's DNS management panel
- ✅ Access to your Vercel project dashboard
- ✅ Access to your Clerk dashboard

---

## Step 1: Add Domain in Vercel

1. **Navigate to Vercel Dashboard**

   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your EcoPack project

2. **Access Domain Settings**

   - Click on **Settings** in the top navigation
   - Click on **Domains** in the left sidebar

3. **Add Your Domain**

   - Click the **Add** button or **Add Domain** button
   - Enter your domain (e.g., `ecopack.com` or `app.ecopack.com`)

4. **Select Domain Type**

   - **Root Domain**: For `yourdomain.com`
   - **Subdomain**: For `app.yourdomain.com`, `www.yourdomain.com`, etc.

5. **Vercel Will Provide DNS Configuration**

   - After adding the domain, Vercel will show you the DNS records you need to configure
   - You'll see something like:

     ```
     Type: A
     Name: @
     Value: 76.76.21.21

     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```

   - **Copy these values** - you'll need them in the next step

---

## Step 2: Configure DNS Records

### For Root Domain (yourdomain.com)

#### Option A: Using A Records (Recommended for root domain)

1. **Log into your domain registrar** (e.g., Namecheap, GoDaddy, Google Domains)
2. **Navigate to DNS Management**
   - Look for "DNS Management", "DNS Settings", or "Advanced DNS"
3. **Add A Record**
   - **Type**: `A`
   - **Host/Name**: `@` (or leave blank)
   - **Value/IP**: The IP address Vercel provided (e.g., `76.76.21.21`)
   - **TTL**: `3600` (or leave default)
4. **Add CNAME for www (Optional)**
   - **Type**: `CNAME`
   - **Host/Name**: `www`
   - **Value**: `cname.vercel-dns.com` (or the CNAME value Vercel provided)
   - **TTL**: `3600` (or leave default)

#### Option B: Using CNAME (For subdomains)

1. **Log into your domain registrar**
2. **Navigate to DNS Management**
3. **Add CNAME Record**
   - **Type**: `CNAME`
   - **Host/Name**: `app` (or your desired subdomain)
   - **Value**: `cname.vercel-dns.com` (or the CNAME value Vercel provided)
   - **TTL**: `3600`

### Common DNS Providers Instructions

#### Namecheap

1. Go to Domain List → Manage → Advanced DNS
2. Add new record with the values from Vercel
3. Click save

#### GoDaddy

1. Go to DNS Management
2. Click "Add" to create new record
3. Select type and enter values from Vercel

#### Google Domains

1. Go to DNS → Custom name servers
2. Add records in the DNS section

#### Cloudflare

1. Go to DNS → Records
2. Add new record with values from Vercel
3. **Important**: Ensure "Proxy status" is set to "DNS only" (gray cloud) initially

### DNS Propagation Time

- ⏱️ **Typical time**: 24-48 hours
- ⏱️ **Minimum time**: Can be as fast as a few minutes
- You can check propagation status using tools like:
  - [dnschecker.org](https://dnschecker.org)
  - [whatsmydns.net](https://www.whatsmydns.net)

---

## Step 3: Update Clerk Configuration

Since your app uses Clerk for authentication, you **must** update Clerk settings to allow your custom domain.

### Update Allowed Frontend URLs

1. **Navigate to Clerk Dashboard**

   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your EcoPack application

2. **Go to Settings**

   - Click on **Settings** in the left sidebar
   - Navigate to **Frontend API** or **Paths** section

3. **Add Custom Domain to Allowed URLs**

   - Find **Allowed Frontend URLs** or **Redirect URLs** section
   - Click **Add URL** or the **+** button
   - Add your custom domain:
     ```
     https://yourdomain.com
     https://www.yourdomain.com  (if using www)
     https://app.yourdomain.com  (if using subdomain)
     ```
   - Include both `http://` and `https://` variants if Clerk requires them (though https is preferred)

4. **Save Changes**
   - Click **Save** or **Apply**

### Update Sign-in/Sign-up URLs (if separate)

Some Clerk configurations have separate redirect URLs for sign-in and sign-up flows. Make sure to add:

- Sign-in redirect URL: `https://yourdomain.com/dashboard` (or your default redirect)
- Sign-up redirect URL: `https://yourdomain.com/onboarding` (or your default redirect)

### Webhook Configuration (if using)

If you have Clerk webhooks configured:

- Update webhook endpoint URL to use your custom domain
- Example: `https://yourdomain.com/api/webhooks/clerk`

---

## Step 4: Verify Domain Setup

### 1. Wait for DNS Propagation

Before testing, wait for DNS to propagate:

- Check DNS propagation: [dnschecker.org](https://dnschecker.org)
- Enter your domain and check if the A/CNAME records are visible globally

### 2. Check Vercel Domain Status

1. Go back to Vercel → Settings → Domains
2. Check the status of your domain:
   - ✅ **Valid Configuration**: Domain is properly configured
   - ⏳ **Pending**: Still propagating, wait a bit longer
   - ❌ **Invalid Configuration**: Check DNS records again

### 3. Test Domain Access

1. **Visit your custom domain** in a browser:
   ```
   https://yourdomain.com
   ```
2. **Test SSL Certificate**
   - Your site should automatically have HTTPS (Vercel provides free SSL)
   - Check for the padlock icon in the browser

### 4. Test Authentication

1. **Try signing in/up**:

   - Visit `https://yourdomain.com`
   - Click sign-in or sign-up
   - Verify authentication redirects work correctly

2. **Check Clerk redirects**:
   - After authentication, you should be redirected to your dashboard
   - If you see Clerk errors about invalid redirect URLs, go back to Step 3

### 5. Test API Endpoints

Visit these endpoints to ensure everything works:

- `https://yourdomain.com/api/init`
- `https://yourdomain.com/api/recommendations`
- `https://yourdomain.com/dashboard` (requires authentication)

---

## Step 5: Update Environment Variables (if needed)

Most environment variables don't need changes, but verify:

### Check if Any Hardcoded URLs

If your codebase has any hardcoded URLs referring to the old Vercel domain (`.vercel.app`), you may need to update them. However, Next.js typically handles this automatically.

### Optional: Set NEXT_PUBLIC_BASE_URL

If you want to explicitly set a base URL, you can add:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

But this is usually not necessary with Next.js App Router.

---

## Troubleshooting

### Domain Not Resolving (DNS Issues)

**Problem**: Domain shows "Not Configured" or doesn't load

**Solutions**:

1. Verify DNS records are correct:
   - A record should point to Vercel's IP
   - CNAME should point to Vercel's CNAME
2. Wait longer for propagation (can take up to 48 hours)
3. Clear your browser DNS cache:
   - Windows: `ipconfig /flushdns`
   - macOS: `sudo dscacheutil -flushcache`
   - Or use incognito/private browsing
4. Check DNS propagation status using online tools

### SSL Certificate Issues

**Problem**: "Not Secure" or SSL errors

**Solutions**:

1. Wait a few minutes - Vercel automatically provisions SSL (can take 5-10 minutes after DNS resolves)
2. Verify domain status in Vercel dashboard shows "Valid Configuration"
3. Try accessing via `https://` explicitly
4. If still issues, contact Vercel support

### Clerk Authentication Not Working

**Problem**: Redirect errors or "Invalid redirect URL"

**Solutions**:

1. **Double-check Clerk configuration**:
   - Go to Clerk Dashboard → Settings → Frontend API
   - Ensure custom domain is in "Allowed Frontend URLs"
   - Format should be: `https://yourdomain.com` (include protocol)
2. **Clear browser cache** and try again
3. **Check browser console** for specific Clerk error messages
4. **Verify both http and https** are added (if Clerk requires it)

### Mixed Content Warnings

**Problem**: Browser shows mixed content warnings

**Solutions**:

1. Ensure all external resources (images, APIs) use HTTPS
2. Check for any hardcoded `http://` URLs in your code
3. Update any external service URLs to use HTTPS

### Domain Works But Some Features Don't

**Problem**: Site loads but certain features fail

**Solutions**:

1. **Check API endpoints**:
   - Visit `https://yourdomain.com/api/init`
   - Should return JSON response
2. **Verify database connection**:
   - Check Vercel logs for database connection errors
   - Ensure `DATABASE_URL` is still valid
3. **Check Clerk webhooks** (if using):
   - Update webhook URLs in Clerk dashboard
   - Test webhook delivery

### Redirect Loop Issues

**Problem**: Site keeps redirecting

**Solutions**:

1. Check if both `www` and non-`www` are configured
2. Set up redirect in Vercel:
   - Go to Settings → Domains
   - Set one as primary and configure redirect
3. Update Clerk to match your preferred format (www or non-www)

---

## Advanced: Setting Up www and Non-www

### Option 1: Redirect www to non-www (Recommended)

1. Add both domains in Vercel:
   - `yourdomain.com` (primary)
   - `www.yourdomain.com`
2. In Vercel → Settings → Domains:
   - Set `yourdomain.com` as primary
   - Configure `www.yourdomain.com` to redirect to primary

### Option 2: Redirect non-www to www

1. Add both domains in Vercel
2. Set `www.yourdomain.com` as primary
3. Configure redirect for `yourdomain.com`

---

## Post-Setup Checklist

After completing the setup, verify:

- [ ] Custom domain loads correctly (`https://yourdomain.com`)
- [ ] SSL certificate is active (padlock icon visible)
- [ ] Authentication (sign-in/sign-up) works
- [ ] Dashboard loads after authentication
- [ ] API endpoints respond correctly
- [ ] Database connections work (test `/api/init`)
- [ ] All features work as expected
- [ ] Clerk allows your custom domain
- [ ] Both www and non-www work (if configured)

---

## Quick Reference

### Vercel Domain Settings

- Location: `vercel.com/dashboard` → Project → Settings → Domains
- Documentation: [vercel.com/docs/concepts/projects/domains](https://vercel.com/docs/concepts/projects/domains)

### Clerk Domain Configuration

- Location: `dashboard.clerk.com` → Application → Settings → Frontend API
- Documentation: [clerk.com/docs/quickstarts/custom-domains](https://clerk.com/docs/quickstarts/custom-domains)

### Common DNS Record Types

- **A Record**: Points domain to IP address (for root domains)
- **CNAME Record**: Points domain to another domain (for subdomains)
- **TTL**: Time to live (how long DNS records are cached)

---

## Need Help?

If you're stuck:

1. **Check Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
2. **Check Clerk Documentation**: [clerk.com/docs](https://clerk.com/docs)
3. **Check Vercel Logs**: Project → Deployments → Latest → Logs
4. **Contact Support**:
   - Vercel Support: [vercel.com/support](https://vercel.com/support)
   - Clerk Support: [clerk.com/support](https://clerk.com/support)

---

**🎉 Congratulations! Your custom domain is now set up!**

Your EcoPack application should now be accessible at your custom domain with full HTTPS support and proper authentication.
