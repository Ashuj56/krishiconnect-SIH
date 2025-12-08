# Krishi Connect (കൃഷി കണക്ട്) - Complete Technical Documentation

## Version: 1.0
## Last Updated: December 2024

---

# Table of Contents

1. [Introduction](#1-introduction)
2. [Complete Tech Stack](#2-complete-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Frontend Workflow](#4-frontend-workflow)
5. [Backend Workflow (Edge Functions)](#5-backend-workflow-edge-functions)
6. [Database Workflow (Supabase)](#6-database-workflow-supabase)
7. [AI Workflow](#7-ai-workflow)
8. [Speech-to-Speech Architecture](#8-speech-to-speech-architecture)
9. [Weather Workflow](#9-weather-workflow)
10. [Personalized Advisory Workflow](#10-personalized-advisory-workflow)
11. [Knowledge Engine Workflow](#11-knowledge-engine-workflow)
12. [Soil Analysis Workflow](#12-soil-analysis-workflow)
13. [Deployment Workflow](#13-deployment-workflow)
14. [Data Flow Summary](#14-data-flow-summary)
15. [Future Improvements](#15-future-improvements)

---

# 1. Introduction

## Overview

**Krishi Connect** (കൃഷി കണക്ട് - meaning "Farming Connection" in Malayalam) is an AI-powered agricultural assistant web application designed specifically for Kerala farmers in India. The platform provides personalized farming advice, market intelligence, government scheme information, and comprehensive farm management tools.

## Purpose

The application serves as a digital companion for farmers, bridging the technology gap in Indian agriculture by providing:
- AI-powered farming advice in local languages (Malayalam, Hindi, English)
- Real-time weather monitoring and alerts
- Live market price tracking
- Government scheme discovery and eligibility checking
- Soil analysis and crop recommendations
- Activity logging and farm management
- Voice-enabled interaction for accessibility

## Problem Statement

Indian farmers, particularly in Kerala, face several challenges:
- Limited access to timely agricultural information
- Language barriers with existing digital tools
- Difficulty tracking government schemes and eligibility
- Lack of personalized advice based on local conditions
- Need for voice-based interaction due to literacy or convenience

## Solution Summary

Krishi Sakhi addresses these challenges through:
- **Multilingual Support**: Full support for Malayalam, Hindi, and English
- **Speech-to-Speech AI**: Voice input and output for hands-free operation
- **Personalized Context**: AI advice tailored to individual farm conditions
- **Location-Aware Services**: Weather, market prices, and schemes based on Kerala districts
- **Comprehensive Farm Management**: Activity logging, crop tracking, soil analysis

---

# 2. Complete Tech Stack

## Frontend Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | ^18.3.1 |
| **TypeScript** | Type Safety | Latest |
| **Vite** | Build Tool & Dev Server | Latest |
| **TailwindCSS** | Styling Framework | Latest |
| **React Router DOM** | Client-side Routing | ^6.30.1 |
| **Tanstack React Query** | Server State Management | ^5.83.0 |
| **Lucide React** | Icon Library | ^0.462.0 |
| **Shadcn/ui** | UI Component Library | Custom |
| **Recharts** | Data Visualization | ^2.15.4 |
| **React Hook Form** | Form Management | ^7.61.1 |
| **Zod** | Schema Validation | ^3.25.76 |
| **Sonner** | Toast Notifications | ^1.7.4 |
| **next-themes** | Theme Management | ^0.3.0 |
| **date-fns** | Date Manipulation | ^3.6.0 |
| **Framer Motion** | Animations | Via CSS |

## Backend Technologies

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service |
| **Supabase Auth** | User Authentication |
| **PostgreSQL** | Database (via Supabase) |
| **Supabase Edge Functions** | Serverless Functions (Deno) |
| **Supabase Storage** | File Storage |
| **Row Level Security (RLS)** | Data Access Control |

## External APIs

| API | Purpose | Endpoint |
|-----|---------|----------|
| **Lovable AI Gateway** | AI Chat & Analysis | `ai.gateway.lovable.dev/v1/chat/completions` |
| **Google Gemini 2.5 Flash** | LLM Model (via Lovable) | Via Lovable Gateway |
| **OpenWeatherMap** | Weather Data | `api.openweathermap.org` |
| **Web Speech API** | Browser STT/TTS | Native Browser API |

## Development Tools

- **ESLint** - Code Linting
- **PostCSS** - CSS Processing
- **TailwindCSS Animate** - Animation Utilities
- **Class Variance Authority** - Component Variants

---

# 3. System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (BROWSER)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   React     │  │  TailwindCSS│  │ React Query │  │ Web Speech │ │
│  │   App       │  │  + Shadcn   │  │ (Caching)   │  │    API     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                                     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTPS / WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SUPABASE BACKEND                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │ Supabase    │  │ Edge        │  │ PostgreSQL  │  │ Supabase   │ │
│  │ Auth        │  │ Functions   │  │ Database    │  │ Storage    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                          │                                          │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
                           │ External API Calls
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐ │
│  │ Lovable AI      │  │ OpenWeatherMap  │  │ Web Speech API      │ │
│  │ Gateway         │  │ API             │  │ (Browser Native)    │ │
│  │ (Gemini 2.5)    │  │                 │  │                     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Edge Function Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EDGE FUNCTIONS (Deno Runtime)                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   /chat      │  │  /weather    │  │ /farm-       │              │
│  │              │  │              │  │  advisory    │              │
│  │  AI Chat     │  │  Weather     │  │  Context-    │              │
│  │  Streaming   │  │  Fetching    │  │  Based       │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ /soil-       │  │ /market-     │  │ /government- │              │
│  │  analysis    │  │  prices      │  │  schemes     │              │
│  │              │  │              │  │              │              │
│  │  NPK/pH      │  │  APMC        │  │  Scheme      │              │
│  │  Analysis    │  │  Prices      │  │  Matching    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌──────────────┐                                                  │
│  │ /analyze-    │                                                  │
│  │  crop        │                                                  │
│  │              │                                                  │
│  │  Image AI    │                                                  │
│  │  Analysis    │                                                  │
│  └──────────────┘                                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

```
User Action                 Frontend                    Backend                    External
    │                          │                           │                          │
    │  1. Speak Query          │                           │                          │
    ├─────────────────────────>│                           │                          │
    │                          │                           │                          │
    │                          │  2. Web Speech API        │                          │
    │                          │     Transcription         │                          │
    │                          │                           │                          │
    │                          │  3. POST /functions/v1/   │                          │
    │                          │     chat                  │                          │
    │                          ├──────────────────────────>│                          │
    │                          │                           │                          │
    │                          │                           │  4. Lovable AI Gateway   │
    │                          │                           ├─────────────────────────>│
    │                          │                           │                          │
    │                          │                           │  5. AI Response (Stream) │
    │                          │                           │<─────────────────────────┤
    │                          │                           │                          │
    │                          │  6. SSE Stream Response   │                          │
    │                          │<──────────────────────────┤                          │
    │                          │                           │                          │
    │                          │  7. Web Speech API        │                          │
    │                          │     Text-to-Speech        │                          │
    │                          │                           │                          │
    │  8. Hear Response        │                           │                          │
    │<─────────────────────────┤                           │                          │
```

---

# 4. Frontend Workflow

## Application Structure

```
src/
├── components/
│   ├── chat/                 # AI Chat components
│   ├── dashboard/            # Dashboard widgets
│   ├── documents/            # Document management
│   ├── layout/               # App layout components
│   ├── notifications/        # Notification system
│   ├── soil/                 # Soil analysis components
│   ├── splash/               # Splash screen
│   └── ui/                   # Shadcn UI components
├── contexts/
│   ├── AuthContext.tsx       # Authentication state
│   └── LanguageContext.tsx   # Language preferences
├── hooks/
│   ├── useSpeech.ts          # Speech recognition/synthesis
│   └── use-toast.ts          # Toast notifications
├── integrations/
│   └── supabase/             # Supabase client & types
├── pages/
│   ├── Activities.tsx        # Activity logging
│   ├── Advisory.tsx          # Farm advisory
│   ├── Auth.tsx              # Login/Signup
│   ├── Chat.tsx              # AI Assistant
│   ├── Dashboard.tsx         # Main dashboard
│   ├── FarmProfile.tsx       # Farm management
│   ├── Knowledge.tsx         # Knowledge base
│   ├── Market.tsx            # Market prices
│   ├── Profile.tsx           # User profile
│   ├── Scanner.tsx           # Crop scanner
│   ├── Schemes.tsx           # Government schemes
│   ├── Settings.tsx          # App settings
│   └── SoilAnalysis.tsx      # Soil analysis
└── lib/
    └── utils.ts              # Utility functions
```

## Module-by-Module Breakdown

### 4.1 Authentication Module (`/auth`)

**File**: `src/pages/Auth.tsx`

**Functionality**:
- User sign-in and sign-up flows
- Multi-step signup with language selection
- Farm data collection during onboarding
- Session management via Supabase Auth

**Data Flow**:
```
1. User selects language (EN/ML/HI)
2. Enters personal details (name, email, phone, password)
3. Enters farm details (location, area, soil type, water source)
4. On submit:
   - Creates auth user via Supabase Auth
   - Updates profiles table with personal info
   - Creates farms table entry with farm details
```

**Data Sources**:
- Supabase Auth for authentication
- `profiles` table for user data
- `farms` table for farm data

### 4.2 Dashboard Module (`/`)

**File**: `src/pages/Dashboard.tsx`

**Functionality**:
- Displays personalized greeting with farmer name
- Shows weather widget with live data
- Quick action buttons for navigation
- Alert cards for weather, pest, and price updates
- Today's tasks preview

**Data Fetched**:
- Profile data from `profiles` table
- Farm data from `farms` table
- Weather data from `/weather` edge function
- Notifications from `notifications` table

**Components Used**:
- `WeatherWidget` - Live weather display
- `NotificationCenter` - Notification bell/popup
- Quick action grid (Voice, Soil, Calendar, Chat)

### 4.3 AI Chat Module (`/chat`)

**File**: `src/pages/Chat.tsx`

**Functionality**:
- Text and voice-based AI chat
- Streaming responses for real-time display
- Conversation mode for hands-free operation
- Message history persistence
- Language-aware responses

**Data Flow**:
```
1. User types or speaks message
2. Message sent to /chat edge function with:
   - Message history
   - Farmer context (profile, farm, crops, activities)
   - Language preference
3. AI response streamed back via SSE
4. If voice enabled, response spoken via Web Speech API
5. Messages saved to chat_messages table
```

**Speech Features**:
- Uses custom `useSpeech` hook
- Supports ML-IN, HI-IN, EN-IN locales
- Audio waveform visualization
- Conversation mode toggle

### 4.4 Activity Log Module (`/activities`)

**File**: `src/pages/Activities.tsx`

**Functionality**:
- Calendar view of farming activities
- Add new activities (irrigation, fertilizer, pest control, etc.)
- View and delete existing activities
- Filter by crop

**Data Operations**:
- CRUD operations on `activities` table
- Links to `crops` table for crop-specific activities
- User-scoped via RLS policies

### 4.5 Soil Analysis Module (`/soil-analysis`)

**File**: `src/pages/SoilAnalysis.tsx`

**Functionality**:
- Input NPK values and pH level
- Generate soil health analysis
- View recommendations and suitable crops
- Save reports to database

**Components**:
- `SoilAnalysisChart` - Bar chart visualization
- `SuitableCropsModal` - Crop recommendations modal

**Data Flow**:
```
1. User enters N, P, K (kg/ha) and pH values
2. POST to /soil-analysis edge function
3. Receives:
   - Nutrient status (Low/Medium/Optimal)
   - pH category (Acidic/Neutral/Alkaline)
   - Fertilizer recommendations
   - Suitable crops list
4. Results displayed with charts
5. Save Report persists to soil_reports table
```

### 4.6 Market Prices Module (`/market`)

**File**: `src/pages/Market.tsx`

**Functionality**:
- Display commodity prices
- Show nearby APMC markets
- Prioritize user's crops
- Price change indicators

**Data Source**:
- `/market-prices` edge function
- Static commodity data with daily variation algorithm

### 4.7 Government Schemes Module (`/schemes`)

**File**: `src/pages/Schemes.tsx`

**Functionality**:
- List applicable government schemes
- Filter by eligibility
- Show required documents
- Document upload for applications

**Data Source**:
- `/government-schemes` edge function
- Static scheme database with eligibility matching
- `farmer_documents` table for uploads

### 4.8 Farm Profile Module (`/farm`)

**File**: `src/pages/FarmProfile.tsx`

**Functionality**:
- View and edit farm details
- Manage crops (add/delete)
- Update soil type, water source

**Data Operations**:
- CRUD on `farms` table
- CRUD on `crops` table

### 4.9 Scanner Module (`/scanner`)

**File**: `src/pages/Scanner.tsx`

**Functionality**:
- Camera-based crop scanning
- Image analysis for pests/diseases
- Save scan results

**Data Flow**:
```
1. User captures or uploads image
2. Image sent to /analyze-crop edge function
3. AI analysis returns:
   - Issue identification
   - Severity assessment
   - Treatment recommendations
4. Results saved to scan_results table
```

### 4.10 Advisory Module (`/advisory`)

**File**: `src/pages/Advisory.tsx`

**Functionality**:
- Display personalized farming advisories
- Filter by category and priority
- Season-aware recommendations

**Data Source**:
- `/farm-advisory` edge function
- Context-based recommendation engine

---

# 5. Backend Workflow (Edge Functions)

## 5.1 Chat Function (`/chat`)

**File**: `supabase/functions/chat/index.ts`

**Input**:
```typescript
{
  messages: Array<{ role: string; content: string }>,
  farmerContext: {
    farmerName?: string,
    location?: string,
    farm?: { name, total_area, soil_type, water_source },
    crops?: Array<{ name, variety, current_stage, health_status }>,
    recentActivities?: Array<{ title, activity_type, activity_date }>
  },
  language: "en" | "ml" | "hi"
}
```

**Output**: Server-Sent Events (SSE) stream of AI response

**Description**:
- Builds personalized system prompt with farmer context
- Sends request to Lovable AI Gateway
- Streams response back to client
- Supports English, Malayalam, Hindi

**Internal Services**:
- Lovable AI Gateway (Google Gemini 2.5 Flash)

**Rate Limiting**:
- 429 returns "Rate limit exceeded"
- 402 returns "Service temporarily unavailable"

---

## 5.2 Weather Function (`/weather`)

**File**: `supabase/functions/weather/index.ts`

**Input**:
```typescript
{
  location: string  // e.g., "Thrissur, Kerala, India"
}
```

**Output**:
```typescript
{
  temperature: number,
  feelsLike: number,
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy",
  description: string,
  humidity: number,
  windSpeed: number,
  location: string,
  sunrise: string,
  sunset: string,
  forecast: Array<{ day, temp, condition }>,
  alerts: Array<{ type, message }>,
  lastUpdated: string
}
```

**Description**:
- Parses location string (village, district, state)
- Geocodes location via OpenWeatherMap
- Falls back to state-level coordinates if needed
- Fetches current weather and 5-day forecast
- Generates agricultural alerts based on conditions

**External APIs**:
- OpenWeatherMap Geocoding API
- OpenWeatherMap Current Weather API
- OpenWeatherMap Forecast API

**Environment Variables**:
- `OPENWEATHERMAP_API_KEY`

---

## 5.3 Farm Advisory Function (`/farm-advisory`)

**File**: `supabase/functions/farm-advisory/index.ts`

**Input**:
```typescript
{
  farmerContext: {
    name?: string,
    location?: string,
    landArea?: number,
    soilType?: string,
    waterSource?: string,
    crops?: Array<{ name, stage, health, area }>,
    recentActivities?: Array<{ type, title, date }>
  }
}
```

**Output**:
```typescript
{
  advisories: Array<{
    id: string,
    title: string,
    description: string,
    category: "weather" | "crop" | "pest" | "soil" | "market" | "general",
    priority: "high" | "medium" | "low",
    actionItems: string[],
    relatedCrop?: string,
    validUntil?: string
  }>,
  meta: {
    season: string,
    state: string,
    generatedAt: string,
    cropCount: number
  }
}
```

**Description**:
- Determines current season (Rabi/Kharif/Zaid)
- Generates seasonal advisories
- Creates crop-specific recommendations
- Adds soil and water source advisories
- Checks recent activities for follow-up reminders

**Knowledge Base**:
- Crop stage management data
- Seasonal crop calendars
- Pest risk factors
- Irrigation recommendations

---

## 5.4 Soil Analysis Function (`/soil-analysis`)

**File**: `supabase/functions/soil-analysis/index.ts`

**Input**:
```typescript
{
  N: number,    // Nitrogen (kg/ha)
  P: number,    // Phosphorus (kg/ha)
  K: number,    // Potassium (kg/ha)
  pH: number,   // pH level (0-14)
  language?: "en" | "ml"
}
```

**Output**:
```typescript
{
  nutrientStatus: {
    nitrogen: { level, levelMl, value, ideal },
    phosphorus: { level, levelMl, value, ideal },
    potassium: { level, levelMl, value, ideal }
  },
  phStatus: {
    category: string,
    categoryMl: string,
    value: number
  },
  summary: { en: string, ml: string },
  recommendations: Array<{
    type: string,
    typeMl: string,
    message: string,
    messageMl: string,
    priority: "high" | "medium" | "low"
  }>,
  suitableCrops: Array<{
    name: string,
    nameMl: string,
    icon: string,
    reason: string,
    reasonMl: string
  }>
}
```

**Description**:
- Analyzes NPK levels against standard ranges
- Categorizes pH (Acidic to Alkaline scale)
- Generates fertilizer recommendations (Urea, DAP, MOP)
- Includes organic alternatives (neem cake, bone meal)
- Matches suitable crops based on nutrient profile

**Nutrient Ranges**:
| Nutrient | Low | Medium | Optimal |
|----------|-----|--------|---------|
| N (kg/ha) | <140 | 140-280 | >280 |
| P (kg/ha) | <11 | 11-22 | >22 |
| K (kg/ha) | <110 | 110-280 | >280 |

---

## 5.5 Market Prices Function (`/market-prices`)

**File**: `supabase/functions/market-prices/index.ts`

**Input**:
```typescript
{
  location: string,
  userCrops?: Array<{ name: string }>
}
```

**Output**:
```typescript
{
  prices: Array<{
    id: string,
    name: string,
    price: number,
    unit: string,
    change: number,  // % change from yesterday
    market: string,
    category: string
  }>,
  nearbyMarkets: Array<{
    id: string,
    name: string,
    distance: string,
    crops: number,
    lat: number,
    lng: number
  }>,
  bestOpportunity: {
    crop: string,
    change: number,
    message: string,
    advice: string
  } | null,
  lastUpdated: string,
  location: string
}
```

**Description**:
- Uses base commodity prices with daily variation algorithm
- Calculates nearby APMC markets based on state
- Prioritizes user's crops in listing
- Identifies best selling opportunities

**Commodity Categories**:
- Cereals (Rice, Wheat, Maize)
- Fruits (Banana varieties)
- Plantation (Coconut, Arecanut, Rubber)
- Spices (Pepper, Cardamom, Turmeric)
- Vegetables (Tomato, Onion, Potato)
- Oilseeds (Groundnut, Soybean)

---

## 5.6 Government Schemes Function (`/government-schemes`)

**File**: `supabase/functions/government-schemes/index.ts`

**Input**:
```typescript
{
  farmerContext: {
    location?: string,
    landArea?: number,
    areaUnit?: string,
    crops?: string[],
    soilType?: string
  }
}
```

**Output**:
```typescript
{
  schemes: Array<{
    id: string,
    name: string,
    nameHindi?: string,
    department: string,
    benefit: string,
    eligibility: "eligible" | "check" | "not-eligible",
    deadline?: string,
    description: string,
    documents: string[],
    applicationUrl?: string,
    category: string
  }>,
  meta: {
    totalSchemes: number,
    eligibleCount: number,
    state: string | null
  }
}
```

**Description**:
- Matches farmer profile to scheme eligibility
- Includes both central and state-specific schemes
- Filters by land area, location, and crops
- Provides required documents list

**Scheme Database**:
- PM-KISAN, PMFBY, KCC (Central)
- State-specific schemes for Kerala, Karnataka, etc.
- Horticulture, Dairy, Beekeeping missions

---

## 5.7 Analyze Crop Function (`/analyze-crop`)

**File**: `supabase/functions/analyze-crop/index.ts`

**Input**:
```typescript
{
  image: string,  // Base64 encoded image
  scanType: "pest" | "disease" | "nutrient" | "health"
}
```

**Output**:
```typescript
{
  confidence: number,  // 0-100
  issue: string,
  severity: "low" | "medium" | "high" | "none",
  description: string,
  recommendations: string[]
}
```

**Description**:
- Uses Gemini 2.5 Flash vision capabilities
- Analyzes crop images for specific issues
- Provides India-specific treatment recommendations

---

# 6. Database Workflow (Supabase)

## Database Schema

### 6.1 `profiles` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | User ID (references auth.users) |
| full_name | TEXT | User's full name |
| phone | TEXT | Phone number |
| location | TEXT | Location (village, district, Kerala) |
| language | TEXT | Preferred language (en/ml/hi) |
| avatar_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**RLS Policies**:
- Users can view own profile
- Users can update own profile
- Users can insert own profile

---

### 6.2 `farms` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Farm ID |
| user_id | UUID (FK) | Owner user ID |
| name | TEXT | Farm name |
| location | TEXT | Farm location |
| total_area | NUMERIC | Total farm area |
| area_unit | TEXT | Unit (acres/hectares) |
| soil_type | TEXT | Soil type |
| water_source | TEXT | Water source |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

**RLS Policies**:
- Users can manage own farms (ALL operations)

---

### 6.3 `crops` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Crop ID |
| user_id | UUID (FK) | Owner user ID |
| farm_id | UUID (FK) | Associated farm |
| name | TEXT | Crop name |
| variety | TEXT | Crop variety |
| area | NUMERIC | Cultivation area |
| area_unit | TEXT | Unit |
| planting_date | DATE | Sowing date |
| expected_harvest_date | DATE | Expected harvest |
| current_stage | TEXT | Growth stage |
| health_status | TEXT | Health (good/poor) |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | Last update |

**RLS Policies**:
- Users can manage own crops

---

### 6.4 `activities` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Activity ID |
| user_id | UUID (FK) | Owner user ID |
| crop_id | UUID (FK) | Associated crop |
| activity_type | TEXT | Type (irrigation, fertilizer, etc.) |
| title | TEXT | Activity title |
| description | TEXT | Details |
| activity_date | DATE | When performed |
| quantity | NUMERIC | Amount used |
| quantity_unit | TEXT | Unit |
| cost | NUMERIC | Cost incurred |
| photo_url | TEXT | Photo evidence |
| created_at | TIMESTAMP | Record creation |

**RLS Policies**:
- Users can manage own activities

---

### 6.5 `chat_messages` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Message ID |
| user_id | UUID (FK) | Owner user ID |
| role | TEXT | Role (user/assistant) |
| content | TEXT | Message content |
| created_at | TIMESTAMP | Message time |

**RLS Policies**:
- Users can manage own messages

---

### 6.6 `soil_reports` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Report ID |
| user_id | UUID (FK) | Owner user ID |
| nitrogen | NUMERIC | N value (kg/ha) |
| phosphorus | NUMERIC | P value (kg/ha) |
| potassium | NUMERIC | K value (kg/ha) |
| ph | NUMERIC | pH level |
| status_json | JSONB | Full analysis result |
| created_at | TIMESTAMP | Report creation |

**RLS Policies**:
- Users can manage own soil reports

---

### 6.7 `notifications` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Notification ID |
| user_id | UUID (FK) | Target user ID |
| title | TEXT | Notification title |
| message | TEXT | Notification body |
| type | TEXT | Type (info/warning/danger) |
| category | TEXT | Category |
| read | BOOLEAN | Read status |
| action_url | TEXT | Action URL |
| expires_at | TIMESTAMP | Expiration time |
| created_at | TIMESTAMP | Creation time |

**RLS Policies**:
- System can insert notifications
- Users can view/update/delete own notifications

---

### 6.8 `scan_results` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Scan ID |
| user_id | UUID (FK) | Owner user ID |
| crop_id | UUID (FK) | Associated crop |
| scan_type | TEXT | Type (pest/disease/nutrient) |
| image_url | TEXT | Scanned image |
| confidence | NUMERIC | AI confidence |
| result_data | JSONB | Full result |
| recommendations | TEXT[] | Recommendations |
| created_at | TIMESTAMP | Scan time |

**RLS Policies**:
- Users can manage own scans

---

### 6.9 `farmer_documents` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Document ID |
| user_id | UUID (FK) | Owner user ID |
| document_type | TEXT | Type (aadhaar, land_record, etc.) |
| file_name | TEXT | Original filename |
| file_path | TEXT | Storage path |
| file_size | INTEGER | Size in bytes |
| verified | BOOLEAN | Verification status |
| uploaded_at | TIMESTAMP | Upload time |

**RLS Policies**:
- Users can manage own documents

---

### 6.10 `tasks` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Task ID |
| user_id | UUID (FK) | Owner user ID |
| crop_id | UUID (FK) | Associated crop |
| title | TEXT | Task title |
| description | TEXT | Task details |
| scheduled_date | DATE | Scheduled date |
| scheduled_time | TIME | Scheduled time |
| priority | TEXT | Priority level |
| completed | BOOLEAN | Completion status |
| created_at | TIMESTAMP | Creation time |

**RLS Policies**:
- Users can manage own tasks

---

# 7. AI Workflow

## 7.1 System Prompt Architecture

The AI assistant uses a layered system prompt:

```
Layer 1: Base Persona
├── Name: Krishi Mitra (कृषि मित्र / കൃഷി മിത്ര)
├── Role: AI Farming Assistant for Indian Farmers
└── Expertise: Crop management, pest control, irrigation, schemes

Layer 2: Language Instruction
├── English: "Respond in English..."
├── Malayalam: "Always respond in Malayalam (മലയാളം)..."
└── Hindi: "Always respond in Hindi (हिंदी)..."

Layer 3: Farmer Context (Personalization)
├── Farmer's Name
├── Location (district, state)
├── Farm Details (area, soil type, water source)
├── Current Crops (with stages and health)
└── Recent Activities (last 7 days)
```

## 7.2 Context Building

```typescript
// Context is built from multiple database queries
const farmerContext = {
  farmerName: profile.full_name,
  location: profile.location || farm.location,
  farm: {
    name: farm.name,
    total_area: farm.total_area,
    area_unit: farm.area_unit,
    soil_type: farm.soil_type,
    water_source: farm.water_source
  },
  crops: crops.map(c => ({
    name: c.name,
    variety: c.variety,
    area: c.area,
    current_stage: c.current_stage,
    health_status: c.health_status,
    planting_date: c.planting_date
  })),
  recentActivities: activities.map(a => ({
    title: a.title,
    activity_type: a.activity_type,
    activity_date: a.activity_date,
    description: a.description
  }))
};
```

## 7.3 AI Model Configuration

| Setting | Value |
|---------|-------|
| Model | `google/gemini-2.5-flash` |
| Gateway | `ai.gateway.lovable.dev` |
| Streaming | Enabled (SSE) |
| Auth | Bearer token (LOVABLE_API_KEY) |

---

# 8. Speech-to-Speech Architecture

## 8.1 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SPEECH-TO-SPEECH PIPELINE                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. AUDIO INPUT                                                │
│     ┌─────────────┐                                            │
│     │  Microphone │                                            │
│     └──────┬──────┘                                            │
│            │                                                    │
│            ▼                                                    │
│  2. SPEECH RECOGNITION (Browser Web Speech API)                │
│     ┌─────────────────────────────────────┐                    │
│     │ SpeechRecognition                   │                    │
│     │ - Language: ml-IN / hi-IN / en-IN   │                    │
│     │ - Continuous: true (conv mode)      │                    │
│     │ - Interim Results: true             │                    │
│     └──────────────────┬──────────────────┘                    │
│                        │                                        │
│                        ▼                                        │
│  3. TEXT OUTPUT (Transcription)                                │
│     "എന്റെ നെൽകൃഷിക്ക് വെള്ളം എപ്പോൾ കൊടുക്കണം?"                   │
│                        │                                        │
│                        ▼                                        │
│  4. AI PROCESSING (Edge Function + Lovable AI)                 │
│     ┌─────────────────────────────────────┐                    │
│     │ POST /functions/v1/chat             │                    │
│     │ - Messages with context             │                    │
│     │ - Farmer profile                    │                    │
│     │ - Language preference               │                    │
│     └──────────────────┬──────────────────┘                    │
│                        │                                        │
│                        ▼                                        │
│  5. AI RESPONSE (Streaming)                                    │
│     "നിങ്ങളുടെ നെല്ല് സസ്യദശയിലാണെങ്കിൽ..."                       │
│                        │                                        │
│                        ▼                                        │
│  6. TEXT-TO-SPEECH (Browser Web Speech API)                    │
│     ┌─────────────────────────────────────┐                    │
│     │ SpeechSynthesis                     │                    │
│     │ - Voice: Best match for language    │                    │
│     │ - Rate: 0.9                         │                    │
│     │ - Pitch: 1.0                        │                    │
│     └──────────────────┬──────────────────┘                    │
│                        │                                        │
│                        ▼                                        │
│  7. AUDIO OUTPUT                                               │
│     ┌─────────────┐                                            │
│     │   Speaker   │                                            │
│     └─────────────┘                                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 8.2 useSpeech Hook

**File**: `src/hooks/useSpeech.ts`

**Capabilities**:
- `startListening()` - Begin speech recognition
- `stopListening()` - Stop listening
- `speak(text, lang)` - Text-to-speech
- `stopSpeaking()` - Stop speech output
- `toggleConversationMode()` - Hands-free mode

**State Variables**:
- `isListening` - Recognition active
- `isSpeaking` - Synthesis active
- `transcript` - Final transcription
- `interimTranscript` - Partial transcription
- `audioLevel` - Microphone level (0-1)
- `isSupported` - Browser support check

**Language Configuration**:
```typescript
const SPEECH_LANGUAGES = {
  'en': { speech: 'en-IN', label: 'English' },
  'hi': { speech: 'hi-IN', label: 'हिंदी' },
  'ml': { speech: 'ml-IN', label: 'മലയാളം' }
};
```

---

# 9. Weather Workflow

## 9.1 Location Processing

```
User Location Input: "Thrissur, Kerala, India"
                          │
                          ▼
┌─────────────────────────────────────────────┐
│           LOCATION PARSING                  │
│  village = "Thrissur"                       │
│  state = "Kerala"                           │
│  country = "India"                          │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         GEOCODING QUERIES                   │
│  1. "Thrissur,Kerala,IN"                    │
│  2. "Thrissur,India"                        │
│  3. "Kerala,IN" (fallback)                  │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│      OPENWEATHERMAP GEOCODING API           │
│  Response: { lat: 10.5276, lon: 76.2144 }   │
└─────────────────────────────────────────────┘
```

## 9.2 Weather Data Fetching

```
Coordinates: (10.5276, 76.2144)
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌───────────────┐       ┌───────────────┐
│ Current       │       │ 5-Day         │
│ Weather API   │       │ Forecast API  │
└───────┬───────┘       └───────┬───────┘
        │                       │
        └───────────┬───────────┘
                    ▼
┌─────────────────────────────────────────────┐
│           RESPONSE PROCESSING               │
│  - Map weather ID to condition              │
│  - Process forecast days                    │
│  - Generate agricultural alerts             │
│  - Format sunrise/sunset times              │
└─────────────────────────────────────────────┘
```

## 9.3 Alert Generation

| Condition | Alert Type | Message |
|-----------|------------|---------|
| Heavy Rain (ID 502-531) | Warning | Protect crops, delay irrigation |
| Temperature > 40°C | Alert | Increase irrigation, provide shade |
| Humidity < 30% | Info | Increase irrigation frequency |
| Wind > 10 m/s | Warning | Secure structures and plants |

---

# 10. Personalized Advisory Workflow

## 10.1 Advisory Generation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                  ADVISORY GENERATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT: Farmer Context                                          │
│  ┌─────────────────────────────────────────────────┐           │
│  │ - Location (state detection)                    │           │
│  │ - Crops (names, stages, health)                 │           │
│  │ - Soil Type                                     │           │
│  │ - Water Source                                  │           │
│  │ - Recent Activities                             │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 1: Season Detection                                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Month 10-2: Rabi Season                         │           │
│  │ Month 6-9: Kharif Season                        │           │
│  │ Month 3-5: Zaid/Summer Season                   │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 2: Generate Seasonal Advisories                           │
│  ┌─────────────────────────────────────────────────┐           │
│  │ - Rabi: Wheat, barley, mustard recommendations  │           │
│  │ - Kharif: Rice, maize, cotton recommendations   │           │
│  │ - Zaid: Vegetables, watermelon recommendations  │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 3: Generate Crop-Specific Advisories                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │ For each crop:                                  │           │
│  │ - Stage-based care instructions                 │           │
│  │ - Health alerts if status = "poor"              │           │
│  │ - Pest warnings for crop type                   │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 4: Generate Soil/Water Advisories                         │
│  ┌─────────────────────────────────────────────────┐           │
│  │ - Clay soil management tips                     │           │
│  │ - Sandy soil management tips                    │           │
│  │ - Rainfed farming recommendations               │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 5: Check Recent Activities                                │
│  ┌─────────────────────────────────────────────────┐           │
│  │ - Days since last fertilizer > 30?              │           │
│  │   → Add fertilizer reminder                     │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  OUTPUT: Sorted Advisories (by priority)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 11. Knowledge Engine Workflow

## 11.1 Embedded Knowledge Base

The knowledge engine uses structured data embedded in edge functions:

### Crop Calendar Data
```typescript
// Seasonal crop mapping
const seasonalCrops = {
  Rabi: ["wheat", "barley", "mustard", "peas", "gram"],
  Kharif: ["rice", "maize", "cotton", "sugarcane", "soybean"],
  Zaid: ["vegetables", "watermelon", "muskmelon", "cucumber"]
};
```

### Pest Knowledge Data
```typescript
// Crop-specific pest information
const pestData = {
  rice: {
    pests: ["stem borer", "leaf folder", "brown plant hopper"],
    symptoms: ["dead hearts", "folded leaves", "hopperburn"],
    conditions: ["high humidity", "continuous rain"],
    preventive: ["pheromone traps", "light traps"],
    control: ["neem-based pesticides", "appropriate insecticides"]
  }
};
```

### Best Practices Data
```typescript
// Crop stage management
const cropStages = {
  rice: {
    nursery: "0-25 days",
    transplanting: "25-30 days",
    tillering: "30-60 days",
    flowering: "60-90 days",
    grain_filling: "90-110 days",
    maturity: "110-120 days"
  }
};
```

## 11.2 Knowledge Integration

The knowledge engine is integrated into:
1. **Chat Function**: Embedded crop knowledge informs AI responses
2. **Farm Advisory Function**: Generates recommendations based on crop calendars
3. **Soil Analysis Function**: Matches crops to soil conditions

---

# 12. Soil Analysis Workflow

## 12.1 Analysis Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                    SOIL ANALYSIS PIPELINE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  INPUT VALUES                                                   │
│  ┌─────────────────────────────────────────────────┐           │
│  │ N: 120 kg/ha, P: 15 kg/ha, K: 200 kg/ha, pH: 5.8│           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 1: Nutrient Analysis                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │ N: 120 < 140 → LOW (കുറവ്)                       │           │
│  │ P: 15 > 11 && < 22 → MEDIUM (ഇടത്തരം)            │           │
│  │ K: 200 > 110 && < 280 → MEDIUM (ഇടത്തരം)         │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 2: pH Categorization                                      │
│  ┌─────────────────────────────────────────────────┐           │
│  │ pH 5.8: 5.5 ≤ 5.8 < 6.5 → SLIGHTLY ACIDIC       │           │
│  │         (നേരിയ അമ്ലത്വം)                          │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 3: Generate Recommendations                               │
│  ┌─────────────────────────────────────────────────┐           │
│  │ 1. N Deficient → Urea 50-80 kg/ha               │           │
│  │ 2. P Medium → DAP 50-75 kg/ha                   │           │
│  │ 3. K Medium → MOP 40-60 kg/ha                   │           │
│  │ 4. pH < 5.5? → Lime application                 │           │
│  │ 5. General → FYM 10-15 tonnes/ha                │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  STEP 4: Match Suitable Crops                                   │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Filter crops where:                             │           │
│  │ - pH within crop's tolerance range              │           │
│  │ - At least one nutrient meets minimum           │           │
│  │                                                 │           │
│  │ Results: Rice, Coconut, Banana, Pepper,         │           │
│  │          Ginger, Turmeric, Tapioca              │           │
│  └─────────────────────────────────────────────────┘           │
│                          │                                      │
│                          ▼                                      │
│  OUTPUT: Complete Analysis Report                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 12.2 Chart Rendering

**File**: `src/components/soil/SoilAnalysisChart.tsx`

Uses Recharts library with:
- Bar chart for N, P, K values
- Color coding: Red (low), Yellow (medium), Green (optimal)
- Reference lines for ideal ranges

---

# 13. Deployment Workflow

## 13.1 Platform

The application is deployed on **Lovable** with automatic deployments.

## 13.2 Environment Variables

| Variable | Purpose | Location |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Frontend (.env) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Frontend (.env) |
| `LOVABLE_API_KEY` | AI Gateway access | Supabase Secrets |
| `OPENWEATHERMAP_API_KEY` | Weather API access | Supabase Secrets |

## 13.3 Deployment Steps

1. **Frontend Deployment**
   - Automatic on code push to main branch
   - Vite builds production bundle
   - Static files served via CDN

2. **Edge Function Deployment**
   - Automatic deployment with Lovable Cloud
   - Functions in `supabase/functions/` directory
   - Config in `supabase/config.toml`

3. **Database Migrations**
   - Managed through Supabase migrations
   - Files in `supabase/migrations/`

---

# 14. Data Flow Summary

## 14.1 User Registration Flow

```
User opens app
    │
    ▼
Selects language (EN/ML/HI)
    │
    ▼
Enters personal details (name, email, phone, password)
    │
    ▼
Enters farm details (location, area, soil, water)
    │
    ▼
Supabase Auth creates user
    │
    ▼
Trigger creates profile record
    │
    ▼
App creates farm record
    │
    ▼
User redirected to Dashboard
```

## 14.2 AI Chat Flow

```
User speaks/types question
    │
    ▼
Browser transcribes speech (if voice)
    │
    ▼
Frontend loads farmer context from DB
    │
    ▼
POST /functions/v1/chat with:
  - Messages array
  - Farmer context
  - Language preference
    │
    ▼
Edge function builds system prompt
    │
    ▼
Calls Lovable AI Gateway (Gemini 2.5)
    │
    ▼
Streams response via SSE
    │
    ▼
Frontend displays tokens as they arrive
    │
    ▼
Speech synthesis speaks response (if enabled)
    │
    ▼
Messages saved to chat_messages table
```

## 14.3 Dashboard Load Flow

```
User navigates to Dashboard
    │
    ├──────────────────────────────────────┐
    │                                      │
    ▼                                      ▼
Fetch profile from 'profiles'      Fetch farm from 'farms'
    │                                      │
    └──────────────────┬───────────────────┘
                       │
                       ▼
               Display greeting
                       │
                       ▼
            POST /functions/v1/weather
            with location from profile
                       │
                       ▼
             Display WeatherWidget
                       │
                       ▼
          Show alerts and quick actions
```

## 14.4 Soil Analysis Flow

```
User enters NPK values and pH
    │
    ▼
POST /functions/v1/soil-analysis
    │
    ▼
Edge function analyzes:
  - Nutrient status (Low/Medium/Optimal)
  - pH category
  - Fertilizer recommendations
  - Suitable crops
    │
    ▼
Frontend displays:
  - Bar chart visualization
  - Recommendation cards
  - Suitable crops modal
    │
    ▼
User clicks "Save Report"
    │
    ▼
INSERT into soil_reports table
```

---

# 15. Future Improvements

## 15.1 Potential Enhancements (Not Implemented)

1. **Push Notifications**
   - Weather alerts
   - Scheme deadlines
   - Price alerts
   - Task reminders

2. **Offline Mode**
   - Service worker caching
   - IndexedDB for offline data
   - Sync when online

3. **Mobile App Conversion**
   - React Native wrapper
   - Capacitor/Cordova wrapper
   - PWA enhancement

4. **Advanced ML Features**
   - On-device crop disease detection
   - Yield prediction models
   - Pest outbreak prediction

5. **IoT Integration**
   - Soil moisture sensors
   - Weather stations
   - Irrigation automation

6. **Community Features**
   - Farmer forums
   - Expert Q&A
   - Knowledge sharing

7. **E-commerce Integration**
   - Direct selling platform
   - Input purchasing
   - Equipment rental

8. **Government Integration**
   - Direct scheme application
   - e-KYC verification
   - DBT tracking

---

# Document Information

| Field | Value |
|-------|-------|
| Project | Krishi Sakhi |
| Version | 1.0 |
| Author | Auto-generated |
| Date | December 2024 |
| Status | Production |

---

*This documentation describes the Krishi Sakhi application architecture as it exists in the current codebase. No modifications were made to the project during the creation of this document.*
