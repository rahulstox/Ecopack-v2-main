# 🌱 EcoPack AI - Sustainable Packaging Recommendations

AI-powered sustainable packaging recommendation system built with Next.js, Neon Postgres, and OpenAI.

## Features

- 🤖 **AI Recommendations**: Get intelligent packaging suggestions using OpenAI GPT-4
- 📊 **Carbon Footprint**: Calculate and visualize carbon emissions breakdown
- 💾 **History Tracking**: Store and review past recommendations in Neon Postgres
- 📈 **Cost Analysis**: Compare sustainable materials vs traditional plastic
- ♻️ **Environmental Impact**: Detailed analysis of recyclability and disposal methods

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres with `@neondatabase/serverless`
- **AI**: Google Gemini Pro
- **Styling**: Tailwind CSS
- **Visualization**: Progress bars and structured layouts (Recharts ready for future expansion)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Neon Postgres database account
- Google Gemini Pro API key (free tier available)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   GOOGLE_API_KEY="your-google-gemini-api-key-here"
   ```

3. **Initialize the database**:
   The table will be created automatically on first API call, or you can manually run:
   ```sql
   CREATE TABLE IF NOT EXISTS recommendations (
     id SERIAL PRIMARY KEY,
     form_input JSONB NOT NULL,
     ai_output JSONB NOT NULL,
     carbon_score NUMERIC NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
ecopack-ai/
├── app/
│   ├── api/
│   │   ├── recommend/route.ts          # POST endpoint for AI recommendations
│   │   └── recommendations/             # GET all recommendations
│   │       ├── route.ts
│   │       └── [id]/route.ts           # GET single recommendation
│   ├── recommend/
│   │   └── page.tsx                     # Recommendation form UI
│   ├── history/
│   │   └── page.tsx                     # History page with detail modal
│   ├── layout.tsx
│   ├── page.tsx                         # Homepage
│   └── globals.css
├── lib/
│   ├── db.ts                            # Neon database utilities
│   ├── openai.ts                        # OpenAI integration
│   └── carbon.ts                        # Carbon footprint calculations
└── README.md
```

## Usage

### Creating a Recommendation

1. Navigate to **Get Recommendations**
2. Fill in product details:
   - Product weight
   - Category
   - Dimensions (L x W x H)
   - Fragility level
   - Shipping distance
   - Volume and budget
   - Sustainability priority
3. Submit the form
4. View detailed recommendations with carbon scores

### Viewing History

1. Navigate to **View History**
2. Browse past recommendations
3. Click any card to view detailed analysis:
   - Carbon footprint breakdown
   - Material recommendations
   - Cost comparison
   - Environmental impact

## Carbon Footprint Calculation

The system calculates carbon scores using:
- **Material emissions**: Based on material type and weight
- **Transport emissions**: Based on shipping distance
- **Disposal emissions**: Based on fragility and end-of-life

Score range: 0-100 (lower is better for the environment)

## API Endpoints

### POST /api/recommend
Generate AI recommendations with carbon analysis.

**Request Body**:
```json
{
  "product_weight": "500g",
  "product_category": "Electronics",
  "dimensions": { "length": "20", "width": "15", "height": "10" },
  "fragility_level": "Medium",
  "shipping_distance": "national",
  "monthly_shipping_volume": "1000",
  "current_material_used": "Plastic",
  "budget_per_unit": "50",
  "sustainability_priority": "4",
  "moisture_temp_sensitive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommended_materials": ["Cardboard", "Biodegradable packing"],
    "estimated_cost": 45,
    "cost_comparison": {...},
    "environmental_impact": {...},
    "carbon_footprint": {...}
  },
  "id": 1
}
```

### GET /api/recommendations
Fetch all past recommendations.

### GET /api/recommendations/[id]
Fetch a specific recommendation by ID.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `GOOGLE_API_KEY` | Your Google Gemini Pro API key |

## Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel** (recommended):
   - Push to GitHub
   - Import project in Vercel
   - Add environment variables
   - Deploy

3. **Production considerations**:
   - Ensure Neon database is accessible from production
   - Set up proper CORS if needed
   - Configure rate limiting for API routes

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

