# ATS System - Applicant Tracking System

## Overview

This is a full-stack Applicant Tracking System (ATS) built with React, Express.js, and PostgreSQL. The system manages job postings, user roles, and applicant tracking with real-time features through WebSockets.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom theming support
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Passport.js with local strategy and session-based auth
- **Real-time**: WebSocket server for live updates and user presence
- **Session Storage**: PostgreSQL-based session store using connect-pg-simple

### Database Schema
The system uses PostgreSQL with the following main entities:
- **Users**: Admin, hiring managers, and recruiters with role-based access
- **Jobs**: Job postings with status tracking and assignment to recruiters
- **Applicants**: Candidate applications linked to specific jobs
- **Sessions**: User session management for authentication

## Key Components

### Authentication System
- Session-based authentication with secure password hashing (scrypt)
- Role-based access control (admin, hiring_manager, recruiter)
- Protected routes and middleware for authorization
- User registration and login forms with validation

### User Management
- Admin can create, update, and delete users
- Role assignment and user status management
- User filtering and search functionality
- Password reset capabilities

### Job Management
- Hiring managers can create and manage job postings
- Job status tracking (draft, active, on_hold, filled, closed)
- Recruiter assignment to jobs
- Job search and filtering capabilities

### Applicant Tracking
- Recruiters can manage applicants for assigned jobs
- Applicant status progression through hiring pipeline
- Resume and contact information management
- Interview scheduling and status updates

### Real-time Features
- WebSocket connections for live updates
- User presence tracking and activity feed
- Real-time notifications for system events
- Live dashboard with activity monitoring

## Data Flow

1. **Authentication Flow**: Users log in through the frontend, which sends credentials to the backend API, creates a session, and returns user data
2. **Data Fetching**: Frontend uses React Query to fetch data from REST API endpoints with automatic caching and revalidation
3. **Real-time Updates**: WebSocket connections push live updates to connected clients for user presence and activity notifications
4. **Database Operations**: All data persistence goes through Drizzle ORM with type-safe queries to PostgreSQL

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection pooling for Neon database
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **express-session**: Session management
- **ws**: WebSocket implementation
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety
- **drizzle-kit**: Database migrations and schema management
- **zod**: Runtime type validation
- **react-hook-form**: Form management with validation

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` starts both frontend and backend in development mode
- **Production Build**: `npm run build` creates optimized production assets
- **Production Start**: `npm start` runs the production server
- **Database Management**: `npm run db:push` applies schema changes to database

The build process:
1. Vite builds the React frontend to `dist/public`
2. esbuild bundles the Express server to `dist/index.js`
3. Static assets are served from the Express server in production
4. Database migrations are managed through Drizzle Kit

Environment variables required:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption
- `NODE_ENV`: Environment mode (development/production)