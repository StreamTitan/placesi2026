# Placesi - Caribbean Real Estate Intelligence Platform

AI-powered real estate platform for Trinidad & Tobago connecting buyers, agents, and banks.

## Features

### Core Features (Implemented)
- **AI Chat Interface**: Conversational property search powered by Deepseek AI
- **Property Listings**: Browse and search properties with advanced filters
- **Authentication**: Role-based access control (Buyer, Agent, Agency, Bank Partner, Admin)
- **Responsive Design**: Mobile-first design with dark mode support
- **Database**: Complete Supabase backend with Row Level Security

### Coming Soon
- Property detail pages with image galleries and virtual tours
- Agent/Agency directory and verification system
- Mortgage pre-approval system with DSR calculator
- Analytics dashboards for admins and bank partners
- Admin control panel for user and content management
- Property listing management for agents
- Document upload for mortgage applications
- Email notifications
- Saved searches and favorites

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: Deepseek API for conversational search
- **Routing**: React Router v7
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (already configured)
- Deepseek API key (already configured)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Environment variables are already configured in `.env`:
```
VITE_SUPABASE_URL=https://hchqzisgysnbatcvieea.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_DEEPSEEK_API_KEY=sk-db40c4ce2f3c457bae46119f1a3bbc55
```

3. Database is already set up with complete schema and RLS policies

4. (Optional) Load seed data:
   - Go to your Supabase SQL Editor
   - Run the queries in `seed-data.sql` after creating your first user account

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card, Modal)
│   ├── layout/          # Layout components (Header, Footer, MainLayout)
│   ├── auth/            # Authentication components
│   ├── property/        # Property-related components
│   ├── chat/            # AI chat components
│   ├── mortgage/        # Mortgage components (coming soon)
│   ├── analytics/       # Analytics components (coming soon)
│   └── admin/           # Admin panel components (coming soon)
├── pages/
│   ├── home/            # Homepage
│   ├── auth/            # Login and Signup pages
│   ├── chat/            # AI Chat page
│   ├── search/          # Property search page
│   ├── property/        # Property detail pages (coming soon)
│   ├── mortgage/        # Mortgage pages (coming soon)
│   ├── analytics/       # Analytics pages (coming soon)
│   ├── admin/           # Admin pages (coming soon)
│   └── profile/         # User profile pages (coming soon)
├── contexts/
│   └── AuthContext.tsx  # Authentication context provider
├── services/
│   └── deepseek.ts      # Deepseek API integration
├── lib/
│   ├── supabase.ts      # Supabase client configuration
│   └── database.types.ts # TypeScript types for database
├── hooks/               # Custom React hooks (coming soon)
└── App.tsx              # Main app component with routing
```

## Database Schema

The platform uses a comprehensive database schema with the following tables:

- `profiles` - User profiles with roles
- `agencies` - Real estate agencies
- `agent_profiles` - Additional agent information
- `properties` - Property listings
- `property_images` - Property photos
- `favorites` - User saved properties
- `saved_searches` - Saved search criteria
- `property_inquiries` - Contact requests
- `mortgage_applications` - Mortgage pre-approvals
- `application_documents` - Uploaded documents
- `search_analytics` - Search tracking
- `chat_conversations` - AI chat history
- `platform_analytics` - Aggregated metrics

All tables have Row Level Security (RLS) enabled with appropriate policies.

## User Roles

1. **Buyer**: Browse properties, chat with AI, contact agents, apply for mortgages
2. **Agent**: List properties, manage listings, receive leads
3. **Agency**: Manage teams, oversee listings, performance metrics
4. **Bank Partner**: Review mortgage applications, manage rates
5. **Admin**: Full platform management, user verification, analytics

## AI Chat Features

The AI chat interface uses Deepseek to:
- Understand natural language property queries
- Extract search criteria (bedrooms, price, location, etc.)
- Provide conversational responses
- Automatically filter properties based on conversation
- Support multi-turn dialogue with context

Example queries:
- "Find me 3-bedroom homes in Westmoorings under $2M"
- "Show me apartments near Port of Spain"
- "Looking for houses with pool in Chaguanas"

## Design System

### Colors
- **Primary Green**: #16a34a (green-600)
- **Caribbean Blue**: #0EA5E9
- **Caribbean Turquoise**: #14B8A6
- **Caribbean Coral**: #FB923C

### Typography
- **Font**: Work Sans (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700

### Themes
- Light mode (default, accessible to all)
- Dark mode (available to registered users only)

## Security

- JWT-based authentication via Supabase Auth
- Row Level Security (RLS) on all database tables
- Role-based access control throughout the application
- Secure document handling for mortgage applications
- Environment variables for sensitive data

## Future Enhancements

### Phase 2
- Complete property detail pages
- Agent verification workflow
- Property listing management dashboard
- Document upload system

### Phase 3
- Mortgage pre-approval system
- DSR calculator integration
- Bank partner dashboard

### Phase 4
- Analytics dashboards with charts
- Admin control panel
- Email notification system

### Phase 5
- Saved searches with alerts
- Property comparison tool
- Virtual tour integration
- Mobile app (React Native)

### Phase 6
- Open Banking API integration
- Payment processing (Stripe)
- Multi-country expansion
- Advanced market analytics

## Contributing

This is a proprietary platform developed for Fossman Technologies Limited.

## License

Copyright © 2025 Fossman Technologies Limited. All rights reserved.

## Support

For support, email support@placesi.ai or call +1 (868) 555-0100
