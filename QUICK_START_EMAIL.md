# 🚀 Quick Start - Email Setup (2 Minutes)

## Immediate Steps to Get Emails Working:

### 1️⃣ Get Resend API Key (1 minute)

```
→ Go to: https://resend.com/signup
→ Sign up (free, no credit card)
→ Get your API key from dashboard
→ Copy the key (starts with "re_")
```

### 2️⃣ Add to Environment (30 seconds)

Create a file named `.env.local` in your project root:

```bash
RESEND_API_KEY=re_paste_your_key_here
```

**Important**: Make sure the file is named exactly `.env.local` (not `.env` or `.env.txt`)

### 3️⃣ Restart Server (10 seconds)

```bash
# Stop your current server (Ctrl+C)
npm run dev
```

### 4️⃣ Test It! (20 seconds)

1. Open: http://localhost:3000/contact
2. Fill the form
3. Submit
4. Check **ecopackai@gmail.com** inbox ✅

---

## ✅ That's It!

Your contact form will now send beautifully formatted emails to `ecopackai@gmail.com` with:

- User's name, email, company
- Their message
- Timestamp and user ID
- Reply button for quick responses

---

## 🔥 Example .env.local File

```bash
# Just add this one line to your .env.local file:
RESEND_API_KEY=re_1234567890abcdefghijklmnopqrstuvwxyz

# Your other environment variables stay the same:
DATABASE_URL=your_existing_database_url
GEMINI_API_KEY=your_existing_gemini_key
# ... etc
```

---

## 📧 What the Email Looks Like

When someone submits the contact form, you'll receive:

**Subject**: `New Contact Form: John Doe from Acme Corp`

**Body**: Beautiful HTML email with:

- 🌱 EcoPack AI branding
- 👤 Contact details in organized table
- 💬 Their message in a formatted box
- 📧 Quick "Reply" button
- 📅 Timestamp and user info

---

## ❓ Troubleshooting

**Not receiving emails?**

1. Check `.env.local` file exists in root folder
2. Verify API key is correct (starts with `re_`)
3. Restart your dev server
4. Check spam folder
5. Check Resend dashboard: https://resend.com/emails

**Still not working?**

- Look at terminal console for error messages
- Check Resend dashboard for delivery status
- Make sure you're using the correct email: `ecopackai@gmail.com`

---

## 💡 Pro Tips

### Custom Domain (Optional)

Currently using test domain: `onboarding@resend.dev`

To use your own domain (`contact@ecopackai.com`):

1. Verify domain in Resend dashboard
2. Update line 37 in `app/api/contact/route.ts`:
   ```typescript
   from: "EcoPack AI <contact@ecopackai.com>",
   ```

### Production Deployment

When deploying to Vercel/Netlify/etc:

1. Add `RESEND_API_KEY` to environment variables
2. Redeploy
3. Done!

---

## 📊 Limits (Free Tier)

- ✅ **100 emails per day** (3,000/month)
- ✅ Perfect for contact forms
- ✅ No credit card required
- ✅ Unlimited domains to send to

For high traffic, upgrade to Pro ($20/month for 50K emails).

---

**Questions? Check `EMAIL_SETUP_GUIDE.md` for detailed documentation.**
