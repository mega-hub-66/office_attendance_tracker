# Office Days Tracker

## Overview

A Progressive Web Application (PWA) for tracking office attendance with a focus on meeting quarterly targets. The app allows users to log their daily attendance (office, home, or day off) and provides visual progress tracking to ensure they meet the 50% office attendance requirement per quarter. Built as a mobile-first web application with offline capabilities and iOS-like design patterns.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom iOS-style design tokens and CSS variables for theming
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker for offline functionality, web manifest for app-like experience

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Development Setup**: Development server integrates Vite middleware for hot module replacement
- **API Design**: RESTful API with endpoints for attendance records, quarter settings, and app settings
- **Data Storage**: Pluggable storage interface with in-memory implementation (IStorage interface allows for easy database integration)
- **Session Management**: Express session handling with PostgreSQL session store support

### Database Schema Design
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Structure**: 
  - Attendance records with date, location, quarter, and month tracking
  - Quarter settings for defining work days per month
  - App settings for global configuration
- **Type Safety**: Zod schema validation integrated with Drizzle for runtime type checking
- **Migrations**: Database migrations managed through Drizzle Kit

### Component Architecture
- **Design System**: Shadcn/ui component library with custom iOS-style modifications
- **Theming**: CSS custom properties with dark/light mode support
- **Mobile-First**: Responsive design optimized for mobile devices with tab-based navigation
- **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with React

### Development Workflow
- **Build System**: Vite for frontend bundling, ESBuild for server-side compilation
- **Development**: Hot module replacement in development, production builds optimized for deployment
- **Type Checking**: TypeScript with strict mode enabled across frontend, backend, and shared code
- **Code Organization**: Monorepo structure with shared types and schemas between client and server

## External Dependencies

### Database and ORM
- **Neon Database**: Serverless PostgreSQL database (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL adapter
- **Session Storage**: PostgreSQL session store (connect-pg-simple)

### UI and Design
- **Radix UI**: Headless component library for accessibility and behavior
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management with validation

### Development and Build Tools
- **Vite**: Frontend build tool with React plugin
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing with Autoprefixer
- **Replit Integration**: Development environment plugins for Replit platform

### PWA and Mobile Features
- **Service Worker**: Custom implementation for offline functionality
- **Web App Manifest**: Configuration for installable web app experience
- **Mobile Optimization**: Touch-friendly interface with iOS design patterns

### State Management and Data Fetching
- **TanStack React Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight routing library
- **Date-fns**: Date manipulation and formatting utilities