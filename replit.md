# LoveMatch Thailand - Replit Development Guide

## Overview

LoveMatch Thailand is a Thai-focused dating application built with a modern full-stack architecture. The app features video profiles, AI-powered matching, and social media integration with a mobile-first design approach.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and hot module replacement
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Thai-themed design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **Authentication**: Custom Replit Auth integration with session management
- **API Design**: RESTful API with structured route handlers

### Build System
- **Development**: Vite dev server with hot reloading
- **Production**: Vite build + esbuild for server bundling
- **TypeScript**: Full type safety across client and server

## Key Components

### Authentication System
- Replit OAuth integration for seamless development experience
- Session-based authentication with PostgreSQL session storage
- User profile completion flow with mandatory setup steps

### Database Schema
- **Users**: Core user profiles with dating-specific fields (age, gender, bio, video URLs)
- **Matches**: Mutual like relationships between users
- **Likes**: One-way like actions with super like support
- **Messages**: End-to-end encrypted messaging system
- **Social Connections**: External social media integrations
- **Sessions**: Secure session management for authentication

### UI Components
- Custom gradient buttons and interest tags for Thai aesthetic
- Swipe card interface for user discovery
- Navigation system optimized for mobile experience
- Form components with Thai language support

### API Endpoints
- Authentication routes (`/api/auth/*`)
- Profile management (`/api/profile/*`)
- Discovery system (`/api/discover/*`)
- Matching engine (`/api/likes`, `/api/matches`)
- Messaging system (`/api/messages`)

## Data Flow

### User Registration Flow
1. User authenticates via Replit OAuth
2. System creates user record with basic profile
3. User completes profile setup (name, age, interests, video)
4. Profile completion enables access to discovery features

### Matching System
1. Users swipe through potential matches via discovery API
2. Like actions create records in likes table
3. Mutual likes automatically generate match records
4. Matched users can access messaging functionality

### Messaging Flow
1. Messages are created with match context
2. Real-time updates planned for future implementation
3. Message history retrieved with sender information joined

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **@radix-ui/***: Accessible UI primitives

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast server bundling for production

### Authentication
- **connect-pg-simple**: PostgreSQL session store
- **express-session**: Session management middleware
- **openid-client**: OAuth client for Replit integration

## Deployment Strategy

### Development Environment
- Vite dev server serves React frontend with hot reloading
- Express server runs with tsx for TypeScript execution
- Database migrations managed via Drizzle Kit
- Replit-specific development tooling integrated

### Production Build
- Frontend: Vite builds optimized React bundle
- Backend: ESBuild creates single server bundle
- Database: Drizzle handles schema migrations
- Deployment: Single production server serves both API and static files

### Environment Configuration
- Database URL required for PostgreSQL connection
- Session secret for secure authentication
- Replit-specific environment variables for OAuth
- Development vs production mode configuration

### Key Architectural Decisions

1. **Replit Auth Integration**: Chosen for seamless development experience in Replit environment, with session-based authentication for stateful user management

2. **Drizzle ORM**: Selected for type-safe database operations with excellent TypeScript integration and migration management

3. **Monorepo Structure**: Frontend, backend, and shared code in single repository for easier development and deployment

4. **TanStack Query**: Provides robust caching and state management for API calls with built-in error handling

5. **Mobile-First Design**: Tailwind CSS with responsive design patterns optimized for mobile dating app experience

6. **Type Safety**: Full TypeScript coverage from database schema to API responses to frontend components