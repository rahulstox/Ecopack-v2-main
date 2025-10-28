# Setup Guide

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Copy `.env.example` to `.env.local`
   - Add your Neon database URL
   - Add your OpenAI API key

3. **Initialize database**:
   - Start the dev server: `npm run dev`
   - Visit: `http://localhost:3000/api/init` to create the table
   - Or the table will be created automatically on first recommendation

4. **Start using**:
   - Visit: `http://localhost:3000`
   - Create your first recommendation!

## Environment Variables

Create a `.env.local` file:

```env
   DATABASE_URL="postgresql://username:password@ep-xxx.region.neon.tech/dbname?sslmode=require"
GOOGLE_API_KEY="AIzaSy..."
```

### Getting Your Neon Database URL

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string from the dashboard
4. It should look like: `postgresql://user:pass@host/dbname?sslmode=require`

### Getting Your Google Gemini API Key

1. Go to [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Add it to your `.env.local` file as `GOOGLE_API_KEY`

## Testing the Setup

1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Get Recommendations"
4. Fill out the form with sample data:
   - Product Weight: 500g
   - Category: Electronics
   - Dimensions: 20x15x10
   - Fragility: Medium
   - Shipping: National
   - Volume: 1000
   - Current Material: Plastic
   - Budget: 50
   - Sustainability: 4
5. Submit and check the recommendation

## Database Schema

The `recommendations` table stores:
- `id`: Auto-incrementing primary key
- `form_input`: JSONB - All form fields submitted
- `ai_output`: JSONB - AI recommendation response
- `carbon_score`: Numeric - Carbon footprint score (0-100)
- `created_at`: Timestamp - When the record was created

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Check that SSL mode is set to `require`
- Ensure your Neon database is active

### Gemini API Errors
- Verify your `GOOGLE_API_KEY` is correct
- Ensure the API key is active in Google AI Studio
- Check that Gemini Pro model access is enabled

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

