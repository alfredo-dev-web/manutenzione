# Task Management Application

## Overview

This is a full-stack task management application built with React frontend and Express backend. The application provides both desktop and tablet interfaces for managing tasks and teams in Italian, designed for operational task coordination.

**Current Status**: Application is fully functional and deployed. Users can create tasks through the desktop interface with new plant search functionality and activity type selection. Teams can accept tasks through the tablet interface. Real-time updates work correctly via WebSocket connections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom styling
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM (fully implemented)
- **Schema**: Strongly typed schema definitions in TypeScript
- **Migrations**: Drizzle Kit for database migrations
- **Connection**: Neon Database serverless connection
- **Storage Layer**: DatabaseStorage class replacing in-memory storage
- **Initialization**: Automatic default data creation (teams and admin user)

## Key Components

### Core Entities
1. **Tasks**: Work items with activity type, priority, plant assignment, and status tracking
2. **Teams**: Operational teams with leader, status, and location information
3. **Users**: Authentication and role-based access (admin/team roles)
4. **Plants**: Solar installations with capacity, location, and maintenance status

### Frontend Components
- **TaskCard**: Displays task information with priority badges and action buttons
- **TaskForm**: Form for creating new tasks with validation
- **TeamStatusCard**: Shows team availability and current location
- **Desktop/Tablet Pages**: Responsive interfaces for different device types

### Backend Services
- **Storage Interface**: Abstracted storage layer with in-memory implementation
- **WebSocket Broadcasting**: Real-time updates for all connected clients
- **API Routes**: CRUD operations for tasks, teams, and statistics

## Data Flow

1. **Task Creation**: Users create tasks through TaskForm → API validates and stores → WebSocket broadcasts update
2. **Task Assignment**: Teams can be assigned to tasks → Status updates propagate in real-time
3. **Status Updates**: Task completion triggers status changes → UI updates across all connected clients
4. **Real-time Sync**: WebSocket connection maintains live data synchronization

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL database
- **Drizzle ORM**: Type-safe database queries and migrations
- **Connection Pooling**: Built-in connection management

### UI Libraries
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Static type checking
- **ESLint**: Code linting and formatting

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds React app to `dist/public`
2. **Backend**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations run against PostgreSQL

### Environment Configuration
- **Development**: Uses tsx for TypeScript execution
- **Production**: Compiled JavaScript execution
- **Database**: Environment variable for DATABASE_URL

### File Structure
```
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared TypeScript types and schemas
├── migrations/      # Database migration files
└── dist/           # Built application files
```

The application uses a monorepo structure with clear separation between client, server, and shared code, enabling efficient development and deployment while maintaining type safety across the entire stack.