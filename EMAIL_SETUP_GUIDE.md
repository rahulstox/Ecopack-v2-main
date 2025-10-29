# Email Setup Guide - Resend API

## 📧 Setting Up Email Functionality for EcoPack AI

This guide will help you set up the contact form email functionality using Resend API.

---

## Step 1: Create a Resend Account

1. Go to [Resend.com](https://resend.com/)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

---

## Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Go to **API Keys** section
3. Click **"Create API Key"**
4. Give it a name (e.g., "EcoPack AI Production")
5. Copy the API key (it starts with `re_`)

---

## Step 3: Add API Key to Your Environment

### For Local Development:

1. Create a `.env.local` file in your project root (if not already exists)
2. Add the following line:

```bash
RESEND_API_KEY=re_your_actual_api_key_here
```

3. Save the file
4. Restart your development server

### For Production (Vercel/Other Hosting):

1. Go to your hosting platform's environment variables settings
2. Add a new environment variable:
   - **Key**: `RESEND_API_KEY`
   - **Value**: `re_your_actual_api_key_here`
3. Redeploy your application

---

## Step 4: Verify Your Domain (Optional but Recommended)

**Note**: For testing, Resend provides a test domain (`onboarding@resend.dev`). For production, verify your custom domain.

### To Use Custom Domain:

1. In Resend dashboard, go to **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `ecopackai.com`)
4. Follow the DNS verification steps
5. Once verified, update the `from` field in `app/api/contact/route.ts`:

```typescript
from: "EcoPack AI <contact@ecopackai.com>", // Replace with your verified domain
```

---

## Step 5: Test the Contact Form

1. Start your development server:

```bash
npm run dev
```

2. Navigate to the Contact page: `http://localhost:3000/contact`
3. Fill out the form and submit
4. Check your `ecopackai@gmail.com` inbox for the email
5. Check Resend dashboard for email delivery status

---

## 🎨 Email Features

The implemented email includes:

- ✅ **Beautiful HTML email template** with EcoPack AI branding
- ✅ **Reply-to functionality** - replies go directly to the user
- ✅ **Rich contact information** - name, email, company, user ID, timestamp
- ✅ **Formatted message display**
- ✅ **Quick action buttons** - click to reply directly
- ✅ **Plain text fallback** - for email clients that don't support HTML
- ✅ **Error handling** - graceful failure with user-friendly messages

---

## 🔧 Troubleshooting

### Email Not Received?

1. **Check API Key**: Ensure `RESEND_API_KEY` is set correctly in `.env.local`
2. **Check Console**: Look for error messages in terminal
3. **Check Resend Dashboard**: View email delivery status and logs
4. **Check Spam Folder**: Test emails might go to spam
5. **Rate Limits**: Free tier has 100 emails/day limit

### Common Errors:

#### "Missing API key"

```bash
# Make sure .env.local exists with:
RESEND_API_KEY=re_your_key_here
# Then restart dev server
```

#### "Domain not verified"

```bash
# Either use the test domain (onboarding@resend.dev) or verify your domain in Resend dashboard
```

#### "Rate limit exceeded"

```bash
# Free tier: 100 emails/day
# Upgrade to Pro plan for higher limits
```

---

## 📊 Resend Pricing

- **Free Tier**: 100 emails/day, 3,000/month
- **Pro Tier**: $20/month for 50,000 emails/month
- **Business Tier**: Custom pricing for higher volumes

For EcoPack AI's contact form, the free tier should be sufficient unless you expect high traffic.

---

## 🔐 Security Best Practices

1. **Never commit API keys** - `.env.local` is in `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Rotate API keys** regularly
4. **Monitor email logs** in Resend dashboard
5. **Set up rate limiting** to prevent spam (optional)

---

## 🚀 Next Steps (Optional Enhancements)

### 1. Add Email Confirmation to User

Currently, only you (ecopackai@gmail.com) receive the email. You can also send a confirmation to the user:

```typescript
// Send second email to user
await resend.emails.send({
  from: "EcoPack AI <noreply@resend.dev>",
  to: [email],
  subject: "We received your message!",
  html: `<p>Hi ${name},</p><p>Thank you for contacting EcoPack AI...</p>`,
});
```

### 2. Add Spam Protection

Consider adding rate limiting or CAPTCHA to prevent spam submissions.

### 3. Set Up Email Templates

Use Resend's React Email templates for better maintainability:

```bash
npm install @react-email/components
```

---

## 📞 Support

If you need help:

- **Resend Docs**: [resend.com/docs](https://resend.com/docs)
- **Resend Support**: support@resend.com
- **Status Page**: [status.resend.com](https://status.resend.com)

---

## ✅ Checklist

- [ ] Created Resend account
- [ ] Generated API key
- [ ] Added `RESEND_API_KEY` to `.env.local`
- [ ] Restarted development server
- [ ] Tested contact form
- [ ] Received test email at ecopackai@gmail.com
- [ ] (Optional) Verified custom domain
- [ ] (Optional) Updated `from` email address
- [ ] Added environment variable to production hosting

---

**🎉 Once completed, your contact form will send beautiful, professional emails directly to ecopackai@gmail.com!**
