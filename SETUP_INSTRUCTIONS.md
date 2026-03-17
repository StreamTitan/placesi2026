# Placesi Platform - Setup Instructions

## Quick Start Guide

### Step 1: Database Setup (Already Complete!)
The Supabase database has been fully configured with:
- All 13 tables created
- Row Level Security (RLS) enabled on all tables
- Comprehensive security policies
- Database functions for DSR calculation
- Automatic user profile creation trigger

### Step 2: Create Your First User Account

1. Start the development server:
```bash
npm run dev
```

2. Open your browser to `http://localhost:5173`

3. Click "Sign Up" in the top right corner

4. Create an account:
   - Full Name: Your Name
   - Email: your.email@example.com
   - Password: (at least 6 characters)
   - Account Type: Choose your role (start with "Buyer" for testing)

5. You'll be automatically logged in after signup

### Step 3: Add Sample Data (Optional but Recommended)

To populate the platform with sample properties:

1. Go to your Supabase Dashboard
   - URL: https://supabase.com/dashboard
   - Navigate to your project: hchqzisgysnbatcvieea

2. Open the SQL Editor (left sidebar)

3. Copy and paste the contents of `seed-data.sql`

4. Click "Run" to execute the queries

This will create:
- 3 verified real estate agencies
- 8 sample properties across Trinidad & Tobago
- Properties in various locations (Port of Spain, Chaguanas, Arima, San Fernando, Tobago)
- Different property types (Houses, Apartments, Condos, Townhouses, Commercial, Land)

### Step 4: Test the AI Chat

1. Navigate to the "AI Chat" page from the main navigation

2. Try these example queries:
   - "Find me 3-bedroom homes in Westmoorings under $2M"
   - "Show me apartments near Port of Spain"
   - "Looking for houses with pool in Chaguanas"
   - "What properties are available in Arima?"

3. The AI will understand your request and automatically filter properties

4. Results will appear in the right panel (or below on mobile)

### Step 5: Browse Properties

1. Click "Search Properties" in the navigation

2. Use the search bar or click the filters icon

3. Apply filters:
   - Price range
   - Number of bedrooms/bathrooms
   - Property type
   - Location

4. Click on any property card to view details (detail page coming soon)

### Step 6: Dark Mode (For Registered Users)

1. After logging in, look for the moon/sun icon in the header

2. Click to toggle between light and dark themes

3. Dark mode is only available to registered users

### Step 7: Explore User Roles

To test different roles, you can:

1. **Create a Buyer Account** (default):
   - Browse properties
   - Use AI chat
   - Contact agents
   - Apply for mortgages

2. **Create an Agent Account**:
   - Everything a buyer can do
   - Plus: List properties (coming soon)
   - Manage listings (coming soon)
   - Receive leads (coming soon)

3. **Create an Agency Account**:
   - Agent features
   - Plus: Team management (coming soon)
   - Performance analytics (coming soon)

4. **Admin Access**:
   - Full platform control (coming soon)
   - User management (coming soon)
   - Content moderation (coming soon)

## Database Schema Overview

### Core Tables
- **profiles**: User accounts with role-based access
- **agencies**: Real estate agencies
- **agent_profiles**: Agent verification and details
- **properties**: Property listings
- **property_images**: Multiple images per property

### Interaction Tables
- **favorites**: User saved properties
- **saved_searches**: Saved search criteria
- **property_inquiries**: Contact requests

### Mortgage System
- **mortgage_applications**: Pre-approval applications
- **application_documents**: Uploaded documents

### Analytics & Tracking
- **search_analytics**: User search behavior
- **chat_conversations**: AI chat history
- **platform_analytics**: Aggregated metrics

## Security Features

### Row Level Security (RLS)
Every table has RLS policies that enforce:
- Users can only view their own data
- Agents can only modify their own listings
- Bank partners can only access assigned applications
- Admins have full access
- Public can view active property listings

### Authentication
- JWT-based authentication via Supabase
- Automatic session refresh
- Secure password storage
- Email verification (optional)

## API Integrations

### Deepseek AI
- API Key: Already configured in `.env`
- Used for: Conversational property search
- Features: Natural language understanding, context memory

### Supabase
- URL: https://hchqzisgysnbatcvieea.supabase.co
- Features: Database, Auth, Storage, Realtime

## Common Issues & Solutions

### Issue: No properties showing up
**Solution**: Run the seed data SQL queries to populate sample properties

### Issue: Can't toggle dark mode
**Solution**: Make sure you're logged in (dark mode is only for registered users)

### Issue: AI chat not responding
**Solution**: Check that the Deepseek API key is correctly set in `.env`

### Issue: Build errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Login/Signup not working
**Solution**: Check Supabase connection in browser console

## Next Steps

### Immediate Priorities
1. Create property detail pages
2. Implement property listing management for agents
3. Add agent verification workflow
4. Build mortgage application system

### Medium-Term Goals
1. Analytics dashboards
2. Admin control panel
3. Document upload system
4. Email notifications

### Long-Term Vision
1. Mobile app (React Native)
2. Open Banking integration
3. Regional expansion
4. Advanced market analytics

## Getting Help

- Check the main README.md for technical details
- Review the Supabase dashboard for database issues
- Test API connections in browser console
- Contact: support@placesi.ai

## Development Workflow

1. Make changes to code
2. See live updates in browser (Vite HMR)
3. Test functionality
4. Run `npm run build` to verify production build
5. Deploy when ready

## Deployment (Coming Soon)

The platform is ready to deploy to:
- Vercel (recommended for frontend)
- Netlify
- Custom server with Node.js

Supabase is already hosted and production-ready.

---

**Congratulations!** You now have a fully functional AI-powered real estate platform. Start by creating an account and exploring the features!
