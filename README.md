# 🌱 EcoPack AI - Sustainable Packaging & Carbon Footprint Tracker

AI-powered sustainable packaging recommendation system and comprehensive carbon footprint tracking platform built with Next.js, Neon Postgres, and Advanced AI.

## ✨ Features

### 📦 **AI-Powered Packaging Recommendations**

- 🤖 **Advanced AI Analysis**: Intelligent packaging suggestions powered by Google Gemini
- 📊 **Carbon Footprint**: Detailed CO₂e emissions breakdown and calculation
- 💾 **Recommendation History**: Store and review all past recommendations
- 📈 **Cost Analysis**: Compare sustainable materials vs traditional options
- ♻️ **Environmental Impact**: Detailed recyclability and disposal method analysis
- 📄 **PDF Export**: Export comprehensive reports for client presentations

### 🏭 **Live Activity Tracking**

- 📍 **Real-time Tracking**: Monitor your daily carbon emissions
- 📊 **Activity Logs**: Track transport, food, energy, waste, and packaging activities
- 📈 **Detailed Analytics**: Category breakdown with charts and visualizations
- 🔒 **Premium Features**: Advanced tracking with live maps (Pro plan)

### 📋 **Comprehensive Reports**

- 📊 **Emissions Reports**: Weekly, monthly, and all-time CO₂e tracking
- 📈 **Category Breakdown**: Visual charts for FOOD, TRANSPORT, ENERGY, WASTE
- 💡 **Personalized Recommendations**: AI-suggested actions to reduce emissions
- 📦 **Packaging Analysis**: Detailed material recommendations with carbon scores

### 👤 **User Features**

- 🔐 **Authentication**: Secure user accounts with Clerk
- 📱 **Profile Management**: Personalized settings and preferences
- 🎨 **Theme Support**: Light and dark mode options
- 📊 **Dashboard**: Comprehensive overview of your environmental impact

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon Postgres with `@neondatabase/serverless`
- **AI**: Google Gemini Pro API
- **Authentication**: Clerk
- **Styling**: Tailwind CSS with Radix UI
- **Visualization**: Chart.js & Recharts
- **PDF Generation**: jsPDF
- **Email**: Resend API
- **Performance**: Vercel Speed Insights

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- Neon Postgres database account ([neon.tech](https://neon.tech))
- Google Gemini API key ([aistudio.google.com](https://aistudio.google.com))
- Clerk account for authentication ([clerk.com](https://clerk.com))

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd Ecopack-v2-main
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

   # AI
   GOOGLE_API_KEY="your-google-gemini-api-key-here"

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
   CLERK_SECRET_KEY="sk_test_..."

   # Email (Optional)
   RESEND_API_KEY="re_..."

   # ClimateIQ API (Optional - for enhanced calculations)
   CLIMATEIQ_API_KEY="your_climateiq_api_key"
   ```

4. **Initialize the database**:
   Tables will be created automatically on first API call, or you can visit:

   ```
   http://localhost:3000/api/init
   ```

5. **Run the development server**:

   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ecopack-ai/
├── app/
│   ├── api/
│   │   ├── recommend/route.ts              # AI packaging recommendations
│   │   ├── recommendations/                # Recommendation management
│   │   ├── action-logs/                    # Activity logging
│   │   ├── dashboard-stats/                 # Dashboard analytics
│   │   ├── profile/                        # User profile management
│   │   ├── contact/                         # Contact form handling
│   │   └── ...                               # Other API routes
│   ├── dashboard/page.tsx                    # Main dashboard
│   ├── recommend/page.tsx                   # Packaging recommendations
│   ├── tracker/page.tsx                      # Live activity tracker
│   ├── reports/page.tsx                     # Emissions reports
│   ├── onboarding/page.tsx                  # Profile & settings
│   ├── quiz/page.tsx                        # Carbon footprint quiz
│   ├── page.tsx                              # Landing page
│   ├── layout.tsx                            # Root layout
│   └── globals.css                           # Global styles
├── components/
│   ├── Sidebar.tsx                           # Navigation sidebar
│   ├── DashboardStats.tsx                   # Stats cards
│   ├── ActionLogTable.tsx                    # Activity logs table
│   ├── CategoryBreakdownChart.tsx            # Charts
│   └── ui/                                    # Reusable UI components
├── lib/
│   ├── db.ts                                 # Database utilities
│   ├── gemini.ts                             # Google Gemini AI integration
│   ├── carbon.ts                             # Carbon calculations
│   ├── climateiq.ts                          # ClimateIQ API integration
│   └── co2e/                                 # CO₂e calculation services
├── contexts/
│   └── ThemeContext.tsx                      # Theme management
├── public/                                    # Static assets
└── README.md
```

## 💡 Usage

### Getting Packaging Recommendations

1. Navigate to **Recommendations** in the sidebar
2. Fill in product details:
   - Product weight and category
   - Dimensions (Length × Width × Height)
   - Fragility level
   - Shipping distance
   - Monthly shipping volume
   - Budget and sustainability priority
3. Click **Get Recommendation**
4. View detailed analysis with:
   - Recommended sustainable materials
   - Carbon footprint breakdown
   - Cost comparison
   - Environmental impact assessment
5. Export as PDF for presentations

### Tracking Activities

1. Navigate to **Dashboard** or **Live Tracker**
2. Click **Log New Action**
3. Select category (Transport, Food, Energy, Waste, Packaging)
4. Enter activity details and amount
5. View real-time CO₂e calculations and impact

### Viewing Reports

1. Navigate to **Reports** in the sidebar
2. View **Emissions Report** tab for:
   - Total CO₂e saved
   - Monthly emissions
   - Category breakdown
   - Personalized recommendations
3. View **Packaging Recommendations** tab for:
   - All past packaging analyses
   - Carbon scores
   - Material recommendations

## 🔧 Environment Variables

| Variable                            | Description                     | Required    |
| ----------------------------------- | ------------------------------- | ----------- |
| `DATABASE_URL`                      | Neon Postgres connection string | ✅ Yes      |
| `GOOGLE_API_KEY`                    | Google Gemini API key           | ✅ Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key           | ✅ Yes      |
| `CLERK_SECRET_KEY`                  | Clerk secret key                | ✅ Yes      |
| `RESEND_API_KEY`                    | Resend API key for emails       | ⚠️ Optional |
| `CLIMATEIQ_API_KEY`                 | ClimateIQ API key               | ⚠️ Optional |

## 🚀 Deployment

### Build the project

```bash
npm run build
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

### Production Checklist

- ✅ All environment variables configured
- ✅ Neon database accessible from production
- ✅ Clerk authentication configured
- ✅ Domain verified (if using custom domain)
- ✅ Email service configured (Resend)
- ✅ Analytics enabled (Speed Insights)

## 📚 Documentation

- **ABOUT.md** - Complete application description and features
- **PRESENTATION_SUMMARY.md** - Concise client-ready summary
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **SETUP.md** - Setup and configuration guide
- **CLIMATEIQ_INTEGRATION.md** - ClimateIQ API integration details

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Ensure SSL mode is enabled (`?sslmode=require`)
- Check Neon database is active

### AI Recommendations Not Working

- Verify `GOOGLE_API_KEY` is set correctly
- Check API quota limits
- Review error logs in console

### Authentication Issues

- Ensure Clerk keys are correctly configured
- Verify Clerk redirect URLs match your domain

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**🌍 Made with ❤️ for a sustainable future**
