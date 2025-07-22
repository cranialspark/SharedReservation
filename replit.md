# SplitReserve Application

## Overview

SplitReserve is a full-stack web application that allows users to share the costs of expensive reservations and events (like bottle service, private dining, etc.) with friends. The application features group management, payment splitting, and Stripe integration for processing payments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and build tooling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: OpenID Connect (OIDC) with Replit authentication
- **Session Management**: Express sessions with PostgreSQL store
- **Payment Processing**: Stripe API integration

## Key Components

### Database Schema
- **Users**: Store user profiles with Replit OIDC integration
- **Reservations**: Main entities representing events/bookings
- **Groups**: Associated with reservations for member management
- **Group Members**: Individual participants with payment tracking
- **Payments**: Payment records linked to Stripe
- **Activities**: Activity logging system
- **Sessions**: Session storage table for authentication

### Authentication System
- Replit OIDC integration for user authentication
- Session-based authentication with PostgreSQL storage
- Middleware for protected routes (`isAuthenticated`)
- User profile management with Stripe customer integration

### Payment System
- Stripe integration for payment processing
- Payment intent creation and confirmation
- Processing fee calculation (3% fee structure)
- Payment status tracking and updates

### API Structure
- RESTful API design with Express.js
- Route organization in `/server/routes.ts`
- Authentication middleware protection
- Error handling with standardized responses
- Request/response logging for API endpoints

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC, sessions stored in PostgreSQL
2. **Reservation Creation**: Users create reservations with venue details and total costs
3. **Group Formation**: Groups are automatically created with reservations, invite codes generated
4. **Member Invitation**: Users can join groups via invite codes
5. **Payment Processing**: Individual members can pay their share through Stripe integration
6. **Status Tracking**: Real-time updates on payment status and group completion

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@stripe/stripe-js** & **@stripe/react-stripe-js**: Stripe payment integration
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Backend bundling for production

### Authentication & Session
- **openid-client**: OIDC authentication with Replit
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **passport**: Authentication middleware

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for TypeScript execution in development
- Concurrent frontend and backend development
- Replit-specific development tooling integration

### Production Build
- Frontend: Vite build to `dist/public`
- Backend: ESBuild bundle to `dist/index.js`
- Environment variable configuration for database and Stripe
- Session-based authentication with secure cookies

### Database Management
- Drizzle migrations in `/migrations` directory
- Schema definitions in `/shared/schema.ts`
- Database URL configuration via environment variables
- PostgreSQL connection pooling with Neon serverless

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key (frontend)
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)