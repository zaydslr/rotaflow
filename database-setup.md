# Database Setup Instructions for Rotaflow

## Task Overview
Set up PostgreSQL database with Prisma ORM for Rotaflow project.

## Project Context
- Next.js 16 with TypeScript and Tailwind
- Need multi-tenant database schema for ward management
- Schema design is in PROJECT_TRUE_NORTH.md (Core Functionality section)

## Specific Requirements

### 1. Install and Configure Prisma
- Add Prisma as dev dependency
- Initialize Prisma with PostgreSQL
- Set up environment variables

### 2. Database Schema
Implement the following models with proper relations:
- Workspace (multi-tenancy)
- User (with roles: MANAGER, DEPUTY, STAFF)
- Staff (employee details, contract hours, skills)
- Skill (with many-to-many to Staff)
- Bed (ward beds)
- BedAssignment (patient occupancy with acuity 1-5)
- Shift (with staff assignments)
- Availability (staff time off)
- WorkspaceSettings (rules: minRestHours, maxOvertime, etc.)

### 3. Migrations
- Create initial migration
- Generate Prisma Client
- Add to .gitignore (ensure .env is ignored)

### 4. Verification
- Create a simple script to test database connection
- Verify schema matches requirements

## Success Criteria
- Prisma schema matches the design in PROJECT_TRUE_NORTH.md
- Can connect to local PostgreSQL database
- Migration runs without errors
- Prisma Client generates types correctly

## Notes
- Use PostgreSQL (local installation or Docker)
- Follow existing project structure
- Add Prisma studio for easy data viewing